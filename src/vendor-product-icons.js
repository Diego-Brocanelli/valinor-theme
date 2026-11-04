/**
 * vendor-product-icons.js
 *
 * Baixa do Open VSX os pacotes publicados dos temas de ícones de produto
 * Carbon (antfu) e Material Product Icons (PKief) e copia para
 * icons/<nome>/ só o tema, a fonte e a licença. Nenhum código dos pacotes
 * é executado.
 *
 * Os arquivos ficam versionados no repositório; rode este script só ao
 * atualizar a versão de um dos pacotes.
 *
 * Uso: npm run vendor:product-icons
 */

const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");

const PACKAGES = [
  {
    dir: "carbon",
    publisher: "antfu",
    name: "icons-carbon",
    version: "0.2.9",
    files: ["icons-carbon.json", "icons-carbon.woff", "LICENSE.md"],
  },
  {
    dir: "material-product",
    publisher: "PKief",
    name: "material-product-icons",
    version: "1.7.1",
    files: ["theme/material.product-icon-theme.json", "theme/material-icons.woff", "LICENSE.md"],
  },
];

async function vendor({ dir, publisher, name, version, files }) {
  const url = `https://open-vsx.org/api/${publisher}/${name}/${version}/file/${publisher}.${name}-${version}.vsix`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "valinor-vsix-"));
  try {
    const vsix = path.join(tmp, "package.vsix");
    fs.writeFileSync(vsix, Buffer.from(await res.arrayBuffer()));
    const unpacked = path.join(tmp, "unpacked");
    execFileSync("unzip", ["-q", vsix, ...files.map((f) => `extension/${f}`), "-d", unpacked]);

    const out = path.join(ROOT, "icons", dir);
    fs.emptyDirSync(out);
    for (const file of files) fs.copySync(path.join(unpacked, "extension", file), path.join(out, file));
  } finally {
    fs.removeSync(tmp);
  }
  console.log(`vendor-product-icons: ${publisher}.${name} ${version} copiado para icons/${dir}`);
}

(async () => {
  for (const pkg of PACKAGES) await vendor(pkg);
})().catch((err) => {
  console.error(`vendor-product-icons: ${err.message}`);
  process.exit(1);
});
