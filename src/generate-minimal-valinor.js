/**
 * generate-minimal-valinor.js
 *
 * Gera as variantes "Valinor-flavored" do minimal-icon-theme.
 *
 * Para cada paleta definida em minimal-palettes.js:
 *   1. Cria o diretório icons/minimal-valinor/<id>/
 *   2. Gera os SVGs a partir dos templates, substituindo os placeholders de cor
 *   3. Gera o theme.json (iconTheme definition) para o VSCode
 *
 * Uso: node ./src/generate-minimal-valinor.js
 * (já integrado ao npm run build via package.json)
 */

const fs      = require("fs-extra");
const path    = require("path");
const palettes = require("./minimal-palettes");

// ── Paths ────────────────────────────────────────────────────────────────────

const TEMPLATES_DIR = path.join(__dirname, "..", "icons", "minimal-valinor", "_templates");
const OUTPUT_DIR    = path.join(__dirname, "..", "icons", "minimal-valinor");

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Lê um SVG template e substitui todos os placeholders pelo valor da paleta.
 */
function renderSvg(templateName, replacements) {
  const templatePath = path.join(TEMPLATES_DIR, templateName);
  let content = fs.readFileSync(templatePath, "utf8");

  for (const [placeholder, color] of Object.entries(replacements)) {
    content = content.replaceAll(placeholder, color);
  }

  return content;
}

/**
 * Gera o JSON do iconTheme para o VSCode.
 * Segue o mesmo contrato do valinor-theme-icons.json já existente no projeto.
 */
function buildThemeJson(palette, svgDir) {
  // Caminhos relativos ao theme.json (que fica em icons/minimal-valinor/<id>/)
  const rel = (file) => `./images/${file}`;

  return {
    iconDefinitions: {
      _file:             { iconPath: rel("file.svg")             },
      _folder:           { iconPath: rel("folder.svg")           },
      _folder_open:      { iconPath: rel("folder-open.svg")      },
      _root_folder:      { iconPath: rel("root-folder.svg")      },
      _root_folder_open: { iconPath: rel("root-folder-open.svg") },
    },

    file:              "_file",
    folder:            "_folder",
    folderExpanded:    "_folder_open",
    rootFolder:        "_root_folder",
    rootFolderExpanded:"_root_folder_open",

    // Variantes light/dark com o mesmo conjunto de ícones.
    // Para temas light, a seção "light" usa os mesmos SVGs
    // (as cores já foram escolhidas para o contexto correto).
    light: {
      file:              "_file",
      folder:            "_folder",
      folderExpanded:    "_folder_open",
      rootFolder:        "_root_folder",
      rootFolderExpanded:"_root_folder_open",
    },

    hidesExplorerArrows: false,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log("Gerando variantes Valinor-flavored do minimal-icon-theme...\n");

for (const palette of palettes) {
  const variantDir = path.join(OUTPUT_DIR, palette.id);
  const imagesDir  = path.join(variantDir, "images");

  fs.ensureDirSync(imagesDir);

  // Mapa de substituição para cada template
  const replacements = {
    "{{FILE_COLOR}}":         palette.file,
    "{{FOLDER_COLOR}}":       palette.folder,
    "{{FOLDER_OPEN_COLOR}}":  palette.folderOpen,
    "{{ROOT_FOLDER_COLOR}}":  palette.rootFolder,
  };

  // Gera cada SVG
  const svgs = [
    "file.svg",
    "folder.svg",
    "folder-open.svg",
    "root-folder.svg",
    "root-folder-open.svg",
  ];

  for (const svgFile of svgs) {
    const rendered = renderSvg(svgFile, replacements);
    fs.writeFileSync(path.join(imagesDir, svgFile), rendered, "utf8");
  }

  // Gera o theme.json
  const themeJson = buildThemeJson(palette, imagesDir);
  fs.writeJsonSync(path.join(variantDir, "theme.json"), themeJson, { spaces: 2 });

  console.log(`  ✓ ${palette.label}`);
}

console.log(`\n${palettes.length} variantes geradas em icons/minimal-valinor/`);