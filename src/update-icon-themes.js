/**
 * update-icon-themes.js
 *
 * Atualiza a seção contributes.iconThemes do package.json com as variantes
 * Valinor-flavored do minimal-icon-theme geradas por generate-minimal-valinor.js.
 *
 * Mantém todas as entradas existentes (Zed, Symbols, Catppuccin) e adiciona
 * as novas entradas ao final, sem duplicar.
 *
 * Uso: node ./src/update-icon-themes.js
 * (já integrado ao npm run build via package.json)
 */

const fs       = require("fs-extra");
const path     = require("path");
const palettes = require("./minimal-palettes");

const packagePath   = path.join(__dirname, "..", "package.json");
const minimalOutDir = path.join(__dirname, "..", "icons", "minimal-valinor");

// Lê o package.json atual
const pkg = fs.readJsonSync(packagePath);

// Garante que a seção existe
pkg.contributes             = pkg.contributes             || {};
pkg.contributes.iconThemes  = pkg.contributes.iconThemes  || [];

// Remove entradas valinor-minimal-* anteriores (evita duplicatas em rebuild)
pkg.contributes.iconThemes = pkg.contributes.iconThemes.filter(
  (entry) => !entry.id.startsWith("valinor-icons-minimal-")
);

// Adiciona uma entrada por variante gerada
for (const palette of palettes) {
  const themeJsonPath = `./icons/minimal-valinor/${palette.id}/theme.json`;

  pkg.contributes.iconThemes.push({
    id:    `valinor-icons-minimal-${palette.id}`,
    label: palette.label,
    path:  themeJsonPath,
  });
}

// Salva
fs.writeJsonSync(packagePath, pkg, { spaces: 4 });

console.log(
  `update-icon-themes: ${palettes.length} entradas valinor-icons-minimal-* ` +
  `adicionadas ao package.json`
);