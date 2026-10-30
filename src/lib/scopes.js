/**
 * scopes.js
 *
 * Resolve o estilo de um token a partir das regras TextMate de um tema, de
 * forma simplificada mas compatível com o VS Code no essencial:
 *   - foreground e fontStyle são resolvidos separadamente;
 *   - vence o seletor mais específico (último segmento mais longo, depois
 *     mais segmentos de descendente); em empate, a regra que vem depois;
 *   - "a b" casa quando "b" casa com o escopo e "a" com um escopo pai.
 *
 * `stack` é a pilha de escopos, do mais externo ao token, por exemplo
 * ["source.ts", "comment.block.documentation.ts", "storage.type.class.jsdoc"].
 */

const matches = (selector, scope) => scope === selector || scope.startsWith(`${selector}.`);

function score(selector, stack) {
  const parts = selector.trim().split(/\s+/);
  if (!matches(parts[parts.length - 1], stack[stack.length - 1])) return -1;

  let i = stack.length - 2;
  for (let p = parts.length - 2; p >= 0; p--) {
    while (i >= 0 && !matches(parts[p], stack[i])) i--;
    if (i < 0) return -1;
    i--;
  }
  return parts[parts.length - 1].length * 10 + parts.length;
}

function resolveStyle(tokenColors, stack) {
  const style = {};
  const best = { foreground: -1, fontStyle: -1 };

  for (const rule of tokenColors) {
    if (!rule.settings) continue;
    const selectors = [].concat(rule.scope || []).flatMap((s) => s.split(","));
    for (const selector of selectors) {
      const s = score(selector, stack);
      if (s < 0) continue;
      for (const prop of ["foreground", "fontStyle"]) {
        if (rule.settings[prop] !== undefined && s >= best[prop]) {
          best[prop] = s;
          style[prop] = rule.settings[prop];
        }
      }
    }
  }
  return style;
}

module.exports = { resolveStyle };
