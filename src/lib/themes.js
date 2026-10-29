/**
 * themes.js
 *
 * Carrega os temas de src/themes/*.yml e monta o JSON final do VS Code:
 * cores de interface geradas pela paleta + overrides de "colors", e tokens
 * gerados pelo bloco "syntax" (quando existe) + regras extras de "tokenColors".
 */

const fs = require("fs-extra");
const path = require("path");
const yaml = require("yaml");
const template = require("./template");

const THEMES_SRC = path.join(__dirname, "..", "themes");

function loadSources() {
  return fs
    .readdirSync(THEMES_SRC)
    .filter((file) => /\.ya?ml$/.test(file))
    .sort()
    .map((file) => ({
      id: file.replace(/\.ya?ml$/, ""),
      file,
      source: yaml.parse(fs.readFileSync(path.join(THEMES_SRC, file), "utf8")),
    }));
}

function compile({ id, file, source }) {
  const palette = template.resolvePalette(source.palette || {}, source.type);
  const syntax = source.syntax ? template.resolveSyntax(source.syntax, palette) : null;

  const theme = {
    $schema: "vscode://schemas/color-theme",
    name: source.name,
    type: source.type,
    semanticHighlighting: true,
    colors: { ...template.colors(palette), ...(source.colors || {}) },
    tokenColors: [...(syntax ? template.tokens(syntax, palette) : []), ...(source.tokenColors || [])],
    semanticTokenColors: {
      ...(syntax ? template.semanticTokens(syntax) : {}),
      ...(source.semanticTokenColors || {}),
    },
  };

  return { id, file, source, palette, syntax, theme };
}

function loadThemes() {
  return loadSources().map((entry) => {
    try {
      return compile(entry);
    } catch (error) {
      throw new Error(`${entry.file}: ${error.message}`);
    }
  });
}

module.exports = { loadThemes, THEMES_SRC };
