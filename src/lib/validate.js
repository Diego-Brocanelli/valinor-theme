/**
 * validate.js
 *
 * Verificações aplicadas a cada tema compilado. Erros interrompem o build;
 * avisos apenas são exibidos.
 *
 *   - toda cor é um hex válido (#rgb, #rgba, #rrggbb, #rrggbbaa)
 *   - toda chave de "colors" existe no VS Code (src/lib/color-keys.json)
 *   - "type" condiz com a luminância do fundo do editor
 *   - contrastes mínimos (WCAG) nos pontos em que o texto precisa ser lido;
 *     nos temas de alto contraste (highContrast: true), 7:1 em todo texto
 *   - marcas de adicionado e removido distinguíveis para daltônicos
 */

const { isHex, isDark, contrast, over, cvdDistance } = require("./color");
const { keys } = require("./color-keys.json");
const { resolveStyle } = require("./scopes");

// Escopos que precisam ficar em itálico em todos os temas (ver ITALIC_SCOPES).
const ITALIC_PROBES = {
  "doc block": ["source.ts", "comment.block.documentation.ts"],
  "tag @param": ["source.ts", "comment.block.documentation.ts", "storage.type.class.jsdoc"],
  "tipo no JSDoc": ["source.ts", "comment.block.documentation.ts", "entity.name.type.instance.jsdoc"],
  comentário: ["source.ts", "comment.line.double-slash.ts"],
  this: ["source.ts", "variable.language.this.ts"],
};

const KNOWN_KEYS = new Set(keys);

// ΔE mínimo entre adicionado e removido com deuteranopia/protanopia.
const MIN_CVD_DISTANCE = 15;
const CVD_PAIRS = [
  ["gutter", "editorGutter.addedBackground", "editorGutter.deletedBackground"],
  ["régua", "editorOverviewRuler.addedForeground", "editorOverviewRuler.deletedForeground"],
  ["minimap", "minimapGutter.addedBackground", "minimapGutter.deletedBackground"],
];

// [descrição, texto, fundo, mínimo para erro, mínimo recomendado]
function contrastChecks(c) {
  const sel = over(c["list.activeSelectionBackground"], c["sideBar.background"]);
  return [
    ["texto do editor", c["editor.foreground"], c["editor.background"], 4.5, 7],
    ["números de linha", c["editorLineNumber.foreground"], c["editor.background"], 3, 3],
    ["texto da sidebar", c["sideBar.foreground"], c["sideBar.background"], 4.5, 7],
    ["texto secundário", c.descriptionForeground, c["sideBar.background"], 4.5, 4.5],
    ["título da sidebar", c["sideBarTitle.foreground"], c["sideBar.background"], 4.5, 4.5],
    ["item selecionado", c["list.activeSelectionForeground"], sel, 4.5, 5.5],
    ["destaque de busca na lista", c["list.highlightForeground"], c["sideBar.background"], 4.5, 4.5],
    ["status bar", c["statusBar.foreground"], c["statusBar.background"], 4.5, 4.5],
    ["botão", c["button.foreground"], c["button.background"], 4.5, 4.5],
    ["botão (hover)", c["button.foreground"], c["button.hoverBackground"], 4.5, 4.5],
    ["badge", c["badge.foreground"], c["badge.background"], 4.5, 4.5],
    ["tab ativa", c["tab.activeForeground"], c["tab.activeBackground"], 4.5, 7],
    ["tab inativa", c["tab.inactiveForeground"], c["tab.inactiveBackground"], 4.5, 4.5],
    ["terminal", c["terminal.foreground"], c["terminal.background"], 4.5, 7],
    ["palette", c["quickInput.foreground"], c["quickInput.background"], 4.5, 7],
    ["link", c["textLink.foreground"], c["editor.background"], 4.5, 4.5],
  ];
}

function collectColors(theme) {
  const found = [];
  for (const [key, value] of Object.entries(theme.colors)) found.push([`colors.${key}`, value]);
  theme.tokenColors.forEach((rule, i) => {
    for (const prop of ["foreground", "background"]) {
      if (rule.settings && rule.settings[prop]) found.push([`tokenColors[${i}].${prop}`, rule.settings[prop]]);
    }
  });
  for (const [key, value] of Object.entries(theme.semanticTokenColors)) {
    const color = typeof value === "string" ? value : value && value.foreground;
    if (color) found.push([`semanticTokenColors.${key}`, color]);
  }
  return found;
}

function commentColor(theme) {
  const rule = theme.tokenColors.find((r) => {
    const scopes = [].concat(r.scope || []).flatMap((s) => s.split(","));
    return r.settings && r.settings.foreground && scopes.some((s) => s.trim() === "comment");
  });
  return rule && rule.settings.foreground;
}

function validate(compiled) {
  const { theme, source } = compiled;
  const errors = [];
  const warnings = [];
  const c = theme.colors;

  for (const [where, value] of collectColors(theme)) {
    if (!isHex(value)) errors.push(`${where}: cor inválida "${value}"`);
  }
  if (errors.length) return { errors, warnings };

  for (const key of Object.keys(c)) {
    if (KNOWN_KEYS.has(key)) continue;
    const origin = source.colors && key in source.colors ? "" : " (gerada pelo template)";
    errors.push(`colors.${key}: chave desconhecida no VS Code${origin}`);
  }

  if (!["dark", "light"].includes(theme.type)) {
    errors.push(`type "${theme.type}" deve ser "dark" ou "light"`);
  } else if ((theme.type === "dark") !== isDark(c["editor.background"])) {
    errors.push(`type "${theme.type}" não condiz com editor.background ${c["editor.background"]}`);
  }

  const hc = Boolean(source.highContrast);
  for (const [label, fg, bg, baseMin, baseRecommended] of contrastChecks(c)) {
    const hcMin = label === "números de linha" ? 4.5 : 7;
    const min = hc ? Math.max(baseMin, hcMin) : baseMin;
    const recommended = hc ? Math.max(baseRecommended, hcMin) : baseRecommended;
    const ratio = contrast(fg, bg);
    const detail = `${label}: ${fg} sobre ${bg} = ${ratio.toFixed(2)}:1`;
    if (ratio < min) errors.push(`${detail} (mínimo ${min}:1)`);
    else if (ratio < recommended) warnings.push(`${detail} (recomendado ${recommended}:1)`);
  }

  for (const [label, added, deleted] of CVD_PAIRS) {
    const bg = c["editor.background"];
    const distance = cvdDistance(over(c[added], bg), over(c[deleted], bg));
    if (distance < MIN_CVD_DISTANCE) {
      warnings.push(`${label}: adicionado × removido com ΔE ${distance.toFixed(1)} para daltônicos (recomendado ${MIN_CVD_DISTANCE})`);
    }
  }

  const comment = commentColor(theme);
  if (comment) {
    const ratio = contrast(comment, c["editor.background"]);
    const min = hc ? 7 : 3;
    if (ratio < min) errors.push(`comentários: ${comment} = ${ratio.toFixed(2)}:1 (mínimo ${min}:1)`);
  } else {
    warnings.push("nenhuma regra de token define a cor de comentários");
  }

  for (const [label, stack] of Object.entries(ITALIC_PROBES)) {
    const { fontStyle = "" } = resolveStyle(theme.tokenColors, stack);
    if (!fontStyle.includes("italic")) errors.push(`${label} sem itálico (fontStyle "${fontStyle}")`);
  }

  // Tokens gerados pela paleta precisam ser legíveis; em tokens herdados de
  // temas de origem apenas avisamos.
  const bucket = compiled.syntax ? errors : warnings;
  theme.tokenColors.forEach((rule) => {
    const fg = rule.settings && rule.settings.foreground;
    if (!fg) return;
    const ratio = contrast(fg, c["editor.background"]);
    const min = hc ? 7 : 3;
    if (ratio < min) bucket.push(`token "${rule.name || [].concat(rule.scope)[0]}": ${fg} = ${ratio.toFixed(2)}:1 (mínimo ${min}:1)`);
  });

  return { errors, warnings };
}

module.exports = { validate };
