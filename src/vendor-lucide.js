/**
 * vendor-lucide.js
 *
 * Copia de node_modules/lucide-static os SVGs usados pelo tema
 * "Valinor Icons Lucide" (listados em icons/lucide/map.json) para
 * icons/lucide/src/, junto com a licença ISC do Lucide.
 *
 * Os SVGs ficam versionados no repositório; rode este script só ao
 * atualizar a versão do lucide-static ou ao mudar o mapa.
 *
 * Uso: npm run vendor:lucide
 */

const fs = require("fs-extra");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LUCIDE = path.join(ROOT, "node_modules", "lucide-static");
const DIR = path.join(ROOT, "icons", "lucide");

const map = fs.readJsonSync(path.join(DIR, "map.json"));
const names = [...new Set(Object.values(map.icons))].sort();
const missing = names.filter((name) => !fs.existsSync(path.join(LUCIDE, "icons", `${name}.svg`)));

if (missing.length) {
  console.error(`vendor-lucide: ícones inexistentes no lucide-static: ${missing.join(", ")}`);
  process.exit(1);
}

fs.emptyDirSync(path.join(DIR, "src"));
for (const name of names) {
  fs.copyFileSync(path.join(LUCIDE, "icons", `${name}.svg`), path.join(DIR, "src", `${name}.svg`));
}
fs.copyFileSync(path.join(LUCIDE, "LICENSE"), path.join(DIR, "LICENSE"));

const { version } = fs.readJsonSync(path.join(LUCIDE, "package.json"));
console.log(`vendor-lucide: ${names.length} ícones do lucide-static ${version} copiados para icons/lucide/src`);
