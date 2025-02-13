const fs = require("fs-extra");
const path = require("path");

const packagePath = path.join(__dirname, "..", "package.json");
const themesDir = path.join(__dirname, "..", "themes");

// Ler o package.json
const packageJson = fs.readJsonSync(packagePath);

// Garantir que a seção contributes existe
packageJson.contributes = packageJson.contributes || {};
packageJson.contributes.themes = [];

// Ler todos os arquivos JSON dentro de themes
fs.readdirSync(themesDir).forEach((file) => {
  if (file.endsWith(".json")) {
    let themePath = `./themes/${file}`;

    let themeName = ucwords(file.replace(".json", ""));

    let themeContent = readThemeFile(themePath);

    packageJson.contributes.themes.push({
      label: themeContent.name, // Nome do tema
      uiTheme: themeContent.type === "dark" ? "vs-dark" : "vs", // ou "vs-light" dependendo do tema
      path: themePath // Caminho relativo do tema
    });
  }
});

// Salvar as mudanças no package.json
fs.writeJsonSync(packagePath, packageJson, { spaces: 4 });

console.log("Atualização de contributes.themes concluída!");

function ucwords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

function readThemeFile(themeFile)
{
    const data = fs.readFileSync(themeFile, "utf8");
    const json = JSON.parse(data);

    return json;
}