/**
 * italic.js
 *
 * Snippets de settings.json para o usuário escolher o itálico em todos os
 * temas Valinor de uma vez ("[Valinor*]"):
 *
 *   default → itálico em comentários, doc blocks e this/self (nada a fazer)
 *   none    → remove o itálico do código (Markdown *itálico* continua)
 *   more    → acrescenta keywords de controle, modificadores e parâmetros
 *
 * Os escopos saem dos temas compilados, não de uma lista fixa: temas com
 * tokens próprios (Gimli, Glorfindel, Legolas...) usam seletores mais
 * específicos, e as regras do usuário só vencem com seletores iguais.
 *
 * Uso na linha de comando: npm run italic -- none | more
 */

const { ITALIC_SCOPES, EXTRA_ITALIC_SCOPES } = require("./template");

const THEMES = "[Valinor*]";

// Itálico com significado próprio (texto em itálico no Markdown) é mantido.
const SEMANTIC_ITALIC = /markup\.italic|\bemphasis\b/;

const selectorsOf = (rule) => [].concat(rule.scope || []).flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean);
const leaf = (selector) => selector.split(/\s+/).pop();
const isExtra = (selector) => EXTRA_ITALIC_SCOPES.some((s) => leaf(selector) === s || leaf(selector).startsWith(`${s}.`));

/** Seletores cujo fontStyle satisfaz `test`, somando todos os temas. */
function collect(themes, test) {
  const found = new Set();
  for (const { theme } of themes) {
    for (const rule of theme.tokenColors) {
      const style = rule.settings && rule.settings.fontStyle;
      if (style === undefined || !test(style)) continue;
      for (const selector of selectorsOf(rule)) found.add(selector);
    }
  }
  return [...found];
}

const unique = (list) => [...new Set(list)];

function italicSettings(mode, themes) {
  if (mode === "none") {
    const scopes = unique([
      ...ITALIC_SCOPES,
      ...EXTRA_ITALIC_SCOPES,
      ...collect(themes, (style) => style.includes("italic")),
    ]).filter((s) => !SEMANTIC_ITALIC.test(s));

    return {
      "editor.tokenColorCustomizations": {
        [THEMES]: { textMateRules: [{ scope: scopes, settings: { fontStyle: "" } }] },
      },
      "editor.semanticTokenColorCustomizations": {
        [THEMES]: { rules: { selfKeyword: { italic: false } } },
      },
    };
  }

  if (mode === "more") {
    // Inclui os seletores específicos que hoje anulam o estilo (fontStyle "")
    // nas mesmas categorias, senão eles venceriam a regra do usuário.
    const scopes = unique([
      ...EXTRA_ITALIC_SCOPES,
      ...collect(themes, (style) => !style.includes("italic")).filter(isExtra),
    ]);

    return {
      "editor.tokenColorCustomizations": {
        [THEMES]: { textMateRules: [{ scope: scopes, settings: { fontStyle: "italic" } }] },
      },
    };
  }

  return {};
}

module.exports = { italicSettings };

if (require.main === module) {
  const mode = process.argv[2];
  if (!["none", "more"].includes(mode)) {
    console.error("Uso: npm run italic -- none | more");
    process.exit(1);
  }
  const { loadThemes } = require("./themes");
  console.log(JSON.stringify(italicSettings(mode, loadThemes()), null, 2));
}
