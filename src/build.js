/**
 * build.js
 *
 * Build completo da extensão:
 *   1. valida os temas (erros interrompem o build)
 *   2. gera themes/*.json (a pasta é recriada do zero)
 *   3. gera os ícones Minimal de cada tema a partir da paleta
 *   4. gera as versões dark/light dos ícones Zed
 *   5. atualiza contributes.themes e contributes.iconThemes no package.json
 *
 * Uso: npm run build
 */

const fs = require("fs-extra");
const path = require("path");
const { loadThemes } = require("./lib/themes");
const { validate } = require("./lib/validate");
const { ensureContrast } = require("./lib/color");

const ROOT = path.join(__dirname, "..");
const THEMES_OUT = path.join(ROOT, "themes");
const MINIMAL_DIR = path.join(ROOT, "icons", "minimal-valinor");
const ZED_DIR = path.join(ROOT, "icons", "zed");
const PACKAGE = path.join(ROOT, "package.json");

// Temas de ícones mantidos à mão (sem geração).
const STATIC_ICON_THEMES = [
  { id: "valinor-icons-zed", label: "Valinor Icons Zed", path: "./icons/zed/theme.json" },
  { id: "valinor-icons-symbols", label: "Valinor Icons Symbols", path: "./icons/symbols/src/symbol-icon-theme.json" },
  { id: "valinor-icons-mocha", label: "Valinor Icons Mocha", path: "./icons/catppuccin/mocha/theme.json" },
  { id: "valinor-icons-latte", label: "Valinor Icons Latte", path: "./icons/catppuccin/latte/theme.json" },
  { id: "valinor-icons-frappe", label: "Valinor Icons Frappé", path: "./icons/catppuccin/frappe/theme.json" },
  { id: "valinor-icons-macchiato", label: "Valinor Icons Macchiato", path: "./icons/catppuccin/macchiato/theme.json" },
];

// Ids antigos: o VS Code salva o tema escolhido por id (ou pelo label, quando
// não há id). Manter o id original preserva a escolha de quem já usa o tema
// mesmo quando o label muda (ex.: "Feanor" → "Fëanor").
const LEGACY_THEME_IDS = { feanor: "Valinor Feanor" };

// Tons dos ícones Zed (os SVGs originais são pretos e o Zed os colore em tempo de execução).
const ZED_TINT = { dark: "#c5c8ce", light: "#4f535b" };

const shortName = (theme) => theme.name.replace(/^Valinor\s+/, "");

function step(title, fn) {
  const result = fn();
  console.log(`✓ ${title}`);
  return result;
}

function validateAll(themes) {
  let failed = false;
  for (const compiled of themes) {
    const { errors } = validate(compiled);
    if (!errors.length) continue;
    failed = true;
    console.error(`\n${compiled.theme.name} (${compiled.file})`);
    errors.forEach((e) => console.error(`  ✗ ${e}`));
  }
  if (failed) {
    console.error("\nBuild interrompido: corrija os erros acima (detalhes em npm run validate).");
    process.exit(1);
  }
}

function writeThemes(themes) {
  fs.emptyDirSync(THEMES_OUT);
  for (const { id, theme } of themes) {
    fs.writeJsonSync(path.join(THEMES_OUT, `${id}.json`), theme, { spaces: 2 });
  }
}

function writeMinimalIcons(themes) {
  const templates = path.join(MINIMAL_DIR, "_templates");

  for (const entry of fs.readdirSync(MINIMAL_DIR)) {
    if (entry !== "_templates") fs.removeSync(path.join(MINIMAL_DIR, entry));
  }

  for (const { id, palette } of themes) {
    // Pastas na cor de destaque, arquivos em tom neutro: dá para distinguir
    // a estrutura do projeto de relance.
    const colors = {
      "{{FOLDER_COLOR}}": palette.accentText,
      "{{FOLDER_OPEN_COLOR}}": palette.accentText,
      "{{ROOT_FOLDER_COLOR}}": ensureContrast(palette.accent, palette.bgAlt, 3, palette.fg),
      "{{FILE_COLOR}}": palette.fgMuted,
    };

    const images = path.join(MINIMAL_DIR, id, "images");
    fs.ensureDirSync(images);

    for (const svg of fs.readdirSync(templates).filter((f) => f.endsWith(".svg"))) {
      let content = fs.readFileSync(path.join(templates, svg), "utf8");
      for (const [placeholder, color] of Object.entries(colors)) content = content.replaceAll(placeholder, color);
      fs.writeFileSync(path.join(images, svg), content);
    }

    const icon = (file) => ({ iconPath: `./images/${file}` });
    fs.writeJsonSync(
      path.join(MINIMAL_DIR, id, "theme.json"),
      {
        iconDefinitions: {
          _file: icon("file.svg"),
          _folder: icon("folder.svg"),
          _folder_open: icon("folder-open.svg"),
          _root_folder: icon("root-folder.svg"),
          _root_folder_open: icon("root-folder-open.svg"),
        },
        file: "_file",
        folder: "_folder",
        folderExpanded: "_folder_open",
        rootFolder: "_root_folder",
        rootFolderExpanded: "_root_folder_open",
        hidesExplorerArrows: false,
      },
      { spaces: 2 }
    );
  }
}

function writeZedIcons() {
  const map = fs.readJsonSync(path.join(ZED_DIR, "map.json"));
  const iconDefinitions = {};

  for (const variant of ["dark", "light"]) {
    const out = path.join(ZED_DIR, variant);
    fs.emptyDirSync(out);

    for (const [id, file] of Object.entries(map.icons)) {
      const svg = fs
        .readFileSync(path.join(ZED_DIR, "src", `${file}.svg`), "utf8")
        .replace(/"(black|#17191E)"/gi, `"${ZED_TINT[variant]}"`);
      fs.writeFileSync(path.join(out, `${file}.svg`), svg);
      iconDefinitions[variant === "dark" ? id : `${id}_light`] = { iconPath: `./${variant}/${file}.svg` };
    }
  }

  const light = (id) => `${id}_light`;
  const mapValues = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));

  fs.writeJsonSync(
    path.join(ZED_DIR, "theme.json"),
    {
      iconDefinitions,
      file: map.file,
      folder: map.folder,
      folderExpanded: map.folderExpanded,
      fileExtensions: map.fileExtensions,
      fileNames: map.fileNames,
      light: {
        file: light(map.file),
        folder: light(map.folder),
        folderExpanded: light(map.folderExpanded),
        fileExtensions: mapValues(map.fileExtensions, light),
        fileNames: mapValues(map.fileNames, light),
      },
      hidesExplorerArrows: map.hidesExplorerArrows,
    },
    { spaces: 2 }
  );
}

function updatePackage(themes) {
  const pkg = fs.readJsonSync(PACKAGE);
  const byLabel = (a, b) => a.label.localeCompare(b.label, "pt");

  pkg.contributes = pkg.contributes || {};
  pkg.contributes.themes = themes
    .map(({ id, theme }) => ({
      ...(LEGACY_THEME_IDS[id] ? { id: LEGACY_THEME_IDS[id] } : {}),
      label: theme.name,
      uiTheme: theme.type === "dark" ? "vs-dark" : "vs",
      path: `./themes/${id}.json`,
    }))
    .sort(byLabel);

  pkg.contributes.iconThemes = [
    ...STATIC_ICON_THEMES,
    ...themes
      .map(({ id, theme }) => ({
        id: `valinor-icons-minimal-${id}`,
        label: `Valinor Icons Minimal – ${shortName(theme)}`,
        path: `./icons/minimal-valinor/${id}/theme.json`,
      }))
      .sort(byLabel),
  ];

  fs.writeJsonSync(PACKAGE, pkg, { spaces: 4 });
  return pkg;
}

// Todo caminho registrado no package.json precisa existir. Fora do CI, a
// ausência de um submódulo não inicializado (make init) gera só um aviso.
function checkContributedPaths(pkg) {
  const { themes, iconThemes, productIconThemes = [] } = pkg.contributes;
  const missing = [...themes, ...iconThemes, ...productIconThemes]
    .map((entry) => entry.path)
    .filter((p) => !fs.existsSync(path.join(ROOT, p)));

  if (!missing.length) return;

  const message = `caminhos inexistentes no package.json:\n  ${missing.join("\n  ")}`;
  if (process.env.CI) {
    console.error(`✗ ${message}`);
    process.exit(1);
  }
  console.warn(`! ${message}\n  (submódulos não inicializados? rode: make init)`);
}

const themes = step("temas carregados", loadThemes);
step("validação", () => validateAll(themes));
step(`${themes.length} temas gerados em themes/`, () => writeThemes(themes));
step(`${themes.length} variantes de ícones Minimal`, () => writeMinimalIcons(themes));
step("ícones Zed (dark/light)", writeZedIcons);
const pkg = step("package.json atualizado", () => updatePackage(themes));
checkContributedPaths(pkg);
