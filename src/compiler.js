const fs   = require("fs-extra");
const path = require("path");
const yaml = require("yaml");

const srcDir = path.join(__dirname, ".");
const themesDir = path.join(__dirname, "..", "themes");

// Garantir que a pasta themes existe
fs.ensureDirSync(themesDir);

// Ler todos os arquivos YAML em src
fs.readdirSync(srcDir).forEach((file) => {
  if (file.endsWith(".yml")|| file.endsWith(".yaml")) {
    const filePath     = path.join(srcDir, file);
    const jsonFileName = file.replace(/\.ya?ml$/, ".json");
    const jsonFilePath = path.join(themesDir, jsonFileName);

    console.log(jsonFileName, jsonFilePath);

    // Ler e converter para JSON
    const yamlContent = fs.readFileSync(filePath, "utf8");
    const jsonContent = yaml.parse(yamlContent);
  
    // Salvar o JSON em themes
    fs.writeJsonSync(jsonFilePath, jsonContent, { spaces: 4 });
  
    console.log(`Convertido: ${file} -> ${jsonFileName}`);
  }
});

console.log("Conversão concluída!");
