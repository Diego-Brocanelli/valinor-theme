/**
 * build.js
 *
 * Build completo da extensão:
 *   1. valida os temas (erros interrompem o build)
 *   2. gera themes/*.json (a pasta é recriada do zero)
 *   3. gera os ícones de cada tema (Lucide coloridos pela paleta)
 *   4. gera as versões dark/light dos ícones Lucide
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
const THEMED_DIR = path.join(ROOT, "icons", "themed");
const LUCIDE_DIR = path.join(ROOT, "icons", "lucide");
const SYMBOLS_SRC = path.join(ROOT, "icons", "symbols");
const SYMBOLS_DIST = path.join(ROOT, "icons", "symbols-dist");

// Ícones do Symbols acima deste tamanho (SVGs com imagem embutida) usam o
// ícone padrão do tema: dois deles tinham 1,5 MB cada no .vsix.
const SYMBOLS_MAX_ICON_BYTES = 200 * 1024;
const PACKAGE = path.join(ROOT, "package.json");

// Temas de ícones mantidos à mão (sem geração).
const STATIC_ICON_THEMES = [
  // O id "zed" é mantido para quem escolheu o tema quando ele usava os ícones do Zed.
  { id: "valinor-icons-zed", label: "Valinor Icons Lucide", path: "./icons/lucide/theme.json" },
  { id: "valinor-icons-symbols", label: "Valinor Icons Symbols", path: "./icons/symbols-dist/symbol-icon-theme.json" },
  { id: "valinor-icons-mocha", label: "Valinor Icons Mocha", path: "./icons/catppuccin/mocha/theme.json" },
  { id: "valinor-icons-latte", label: "Valinor Icons Latte", path: "./icons/catppuccin/latte/theme.json" },
  { id: "valinor-icons-frappe", label: "Valinor Icons Frappé", path: "./icons/catppuccin/frappe/theme.json" },
  { id: "valinor-icons-macchiato", label: "Valinor Icons Macchiato", path: "./icons/catppuccin/macchiato/theme.json" },
];

// Ids antigos: o VS Code salva o tema escolhido por id (ou pelo label, quando
// não há id). Manter o id original preserva a escolha de quem já usa o tema
// mesmo quando o label muda (ex.: "Feanor" → "Fëanor").
const LEGACY_THEME_IDS = { feanor: "Valinor Feanor" };

// Tons dos ícones Lucide (os SVGs usam currentColor, que o VS Code não resolve).
const LUCIDE_TINT = { dark: "#c5c8ce", light: "#4f535b" };

const shortName = (theme) => theme.name.replace(/^Valinor\s+/, "");

/** SVG em uma linha só (mantém o comentário @license do Lucide). */
const minifySvg = (svg) => svg.replace(/>\s+</g, "><").replace(/\s*\n\s*/g, " ").trim();

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

function writeThemedIcons(themes) {
  const map = fs.readJsonSync(path.join(LUCIDE_DIR, "map.json"));
  const templates = path.join(THEMED_DIR, "_templates");

  for (const entry of fs.readdirSync(THEMED_DIR)) {
    if (entry !== "_templates") fs.removeSync(path.join(THEMED_DIR, entry));
  }

  for (const { id, palette } of themes) {
    // Cada ícone usa um papel de cor do mapa: pastas no accent, arquivos
    // genéricos em tom neutro e linguagens/formatos nos tons da paleta,
    // sempre com 3:1 sobre a sidebar.
    const legible = (color) => ensureContrast(color, palette.bgAlt, 3, palette.fg);
    const roleColor = (role) => {
      if (role === "accent") return palette.accentText;
      if (role === "muted") return palette.fgMuted;
      return legible(palette[role]);
    };

    const images = path.join(THEMED_DIR, id, "images");
    fs.ensureDirSync(images);

    const iconDefinitions = {};
    for (const [iconId, file] of Object.entries(map.icons)) {
      const name = `${iconId}.svg`;
      const svg = minifySvg(
        fs
          .readFileSync(path.join(LUCIDE_DIR, "src", `${file}.svg`), "utf8")
          .replaceAll('"currentColor"', `"${roleColor(map.roles[iconId])}"`)
      );
      fs.writeFileSync(path.join(images, name), svg);
      iconDefinitions[iconId] = { iconPath: `./images/${name}` };
    }

    // Pastas raiz: arte própria (estrela de oito pontas) na cor do accent.
    const rootColor = legible(palette.accent);
    for (const svg of ["root-folder.svg", "root-folder-open.svg"]) {
      const content = fs.readFileSync(path.join(templates, svg), "utf8").replaceAll("{{ROOT_FOLDER_COLOR}}", rootColor);
      fs.writeFileSync(path.join(images, svg), content);
    }
    iconDefinitions._root_folder = { iconPath: "./images/root-folder.svg" };
    iconDefinitions._root_folder_open = { iconPath: "./images/root-folder-open.svg" };

    fs.writeJsonSync(
      path.join(THEMED_DIR, id, "theme.json"),
      {
        iconDefinitions,
        file: map.file,
        folder: map.folder,
        folderExpanded: map.folderExpanded,
        rootFolder: "_root_folder",
        rootFolderExpanded: "_root_folder_open",
        fileExtensions: map.fileExtensions,
        fileNames: map.fileNames,
        hidesExplorerArrows: map.hidesExplorerArrows,
      },
      { spaces: 2 }
    );
  }
}

function writeLucideIcons() {
  const map = fs.readJsonSync(path.join(LUCIDE_DIR, "map.json"));
  const iconDefinitions = {};

  for (const variant of ["dark", "light"]) {
    const out = path.join(LUCIDE_DIR, variant);
    fs.emptyDirSync(out);

    for (const [id, file] of Object.entries(map.icons)) {
      const svg = minifySvg(
        fs
          .readFileSync(path.join(LUCIDE_DIR, "src", `${file}.svg`), "utf8")
          .replaceAll('"currentColor"', `"${LUCIDE_TINT[variant]}"`)
      );
      fs.writeFileSync(path.join(out, `${file}.svg`), svg);
      iconDefinitions[variant === "dark" ? id : `${id}_light`] = { iconPath: `./${variant}/${file}.svg` };
    }
  }

  const light = (id) => `${id}_light`;
  const mapValues = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));

  fs.writeJsonSync(
    path.join(LUCIDE_DIR, "theme.json"),
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

/**
 * Copia o tema Symbols (submódulo, sem alterá-lo) para icons/symbols-dist
 * só com os arquivos que o tema referencia. Ícones grandes demais passam a
 * usar o ícone padrão de arquivo ou pasta do próprio tema.
 */
function writeSymbolsIcons() {
  const themeFile = path.join(SYMBOLS_SRC, "src", "symbol-icon-theme.json");
  fs.removeSync(SYMBOLS_DIST);
  if (!fs.existsSync(themeFile)) return []; // submódulo não inicializado: checkContributedPaths avisa

  const theme = fs.readJsonSync(themeFile);
  const defs = theme.iconDefinitions;
  const sizeOf = (def) => fs.statSync(path.join(SYMBOLS_SRC, "src", def.iconPath)).size;
  const fallback = (def) => defs[def.iconPath.includes("/folders/") ? theme.folder : theme.file];

  const replaced = [];
  for (const [id, def] of Object.entries(defs)) {
    if (sizeOf(def) > SYMBOLS_MAX_ICON_BYTES) {
      replaced.push(`${id} (${Math.round(sizeOf(def) / 1024)} KB)`);
      defs[id] = fallback(def);
    }
  }

  for (const iconPath of new Set(Object.values(defs).map((d) => d.iconPath))) {
    fs.copySync(path.join(SYMBOLS_SRC, "src", iconPath), path.join(SYMBOLS_DIST, iconPath));
  }
  fs.writeJsonSync(path.join(SYMBOLS_DIST, "symbol-icon-theme.json"), theme);
  fs.copySync(path.join(SYMBOLS_SRC, "LICENSE"), path.join(SYMBOLS_DIST, "LICENSE"));
  return replaced;
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
        // Ids "minimal" mantidos: o conjunto por tema antes se chamava Minimal.
        id: `valinor-icons-minimal-${id}`,
        label: `Valinor Icons – ${shortName(theme)}`,
        path: `./icons/themed/${id}/theme.json`,
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
step(`${themes.length} conjuntos de ícones por tema`, () => writeThemedIcons(themes));
step("ícones Lucide (dark/light)", writeLucideIcons);
const replacedSymbols = step("ícones Symbols otimizados", writeSymbolsIcons);
if (replacedSymbols.length) console.log(`  ícones grandes trocados pelo padrão: ${replacedSymbols.join(", ")}`);
const pkg = step("package.json atualizado", () => updatePackage(themes));
checkContributedPaths(pkg);
