/**
 * color.js
 *
 * Utilitários de cor usados pelo template e pelo validador:
 * parse/format de hex, mistura, transparência, luminância e contraste (WCAG).
 */

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function isHex(value) {
  return typeof value === "string" && HEX_RE.test(value);
}

/** "#abc" | "#abcd" | "#aabbcc" | "#aabbccdd" → { r, g, b, a } (0–255, a 0–1) */
function parse(hex) {
  if (!isHex(hex)) throw new Error(`Cor inválida: ${hex}`);

  let h = hex.slice(1);
  if (h.length <= 4) h = h.split("").map((c) => c + c).join("");

  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
  };
}

function toHex({ r, g, b, a = 1 }) {
  const byte = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}${a < 1 ? byte(a * 255) : ""}`;
}

/** Cor sólida no formato canônico #rrggbb (descarta alfa). */
function solid(hex) {
  return toHex({ ...parse(hex), a: 1 });
}

/** Mistura `a` com `b` na proporção `t` (0 = a, 1 = b). */
function mix(a, b, t) {
  const x = parse(a);
  const y = parse(b);
  return toHex({
    r: x.r + (y.r - x.r) * t,
    g: x.g + (y.g - x.g) * t,
    b: x.b + (y.b - x.b) * t,
  });
}

/** Mesma cor com opacidade `alpha` (0–1). */
function alpha(hex, value) {
  return toHex({ ...parse(hex), a: value });
}

/** Aplica uma cor (possivelmente translúcida) sobre um fundo sólido. */
function over(fg, bg) {
  const f = parse(fg);
  if (f.a >= 1) return solid(fg);
  return mix(solid(bg), solid(fg), f.a);
}

function luminance(hex) {
  const { r, g, b } = parse(hex);
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function isDark(hex) {
  return luminance(hex) < 0.18;
}

/** Razão de contraste WCAG; `fg` translúcido é composto sobre `bg`. */
function contrast(fg, bg) {
  const a = luminance(over(fg, bg));
  const b = luminance(solid(bg));
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Aproxima `color` de `toward` (por padrão branco em fundo escuro, preto em
 * fundo claro) até atingir o contraste mínimo. Mantém a cor original se ela
 * já atende — só corrige quem está abaixo do limite.
 */
function ensureContrast(color, bg, min, toward) {
  const target = toward || (isDark(bg) ? "#ffffff" : "#000000");
  let current = solid(color);

  for (let t = 0.05; contrast(current, bg) < min && t <= 1; t += 0.05) {
    current = mix(solid(color), target, t);
  }

  return current;
}

/** A cor da lista com maior contraste sobre `bg`. */
function bestOn(bg, candidates) {
  return candidates.reduce((best, c) => (contrast(c, bg) > contrast(best, bg) ? c : best));
}

// Simulação de daltonismo (Viénot, Brettel e Mollon, 1999) em RGB linear.
const CVD = {
  deuteranopia: [[0.29275, 0.70725, 0], [0.29275, 0.70725, 0], [-0.02234, 0.02234, 1]],
  protanopia: [[0.11238, 0.88762, 0], [0.11238, 0.88762, 0], [0.00401, -0.00401, 1]],
};

function linearRgb(hex) {
  const { r, g, b } = parse(hex);
  return [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
}

/** RGB linear → CIELAB (D65). */
function lab([r, g, b]) {
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
  const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/**
 * Menor diferença (ΔE CIE76) entre duas cores sólidas para quem tem
 * deuteranopia ou protanopia, as formas de daltonismo vermelho-verde.
 */
function cvdDistance(a, b) {
  const simulate = (hex, m) => {
    const v = linearRgb(hex);
    return m.map((row) => Math.min(1, Math.max(0, row[0] * v[0] + row[1] * v[1] + row[2] * v[2])));
  };
  return Math.min(
    ...Object.values(CVD).map((m) => {
      const [x, y] = [lab(simulate(a, m)), lab(simulate(b, m))];
      return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
    })
  );
}

/**
 * Clareia ou escurece `color` (o que exigir menos mudança) até ela se
 * distinguir de `other` para daltônicos, sem perder `minContrast` sobre `bg`.
 * Mantém a cor original se nenhuma variação atende.
 */
function ensureDistinct(color, other, bg, min, minContrast) {
  const base = solid(color);
  if (cvdDistance(base, other) >= min) return base;

  for (let t = 0.04; t <= 0.6; t += 0.04) {
    for (const toward of ["#ffffff", "#000000"]) {
      const candidate = mix(base, toward, t);
      if (cvdDistance(candidate, other) >= min && contrast(candidate, bg) >= minContrast) return candidate;
    }
  }
  return base;
}

module.exports = {
  isHex, parse, toHex, solid, mix, alpha, over, luminance, isDark, contrast, ensureContrast, bestOn,
  cvdDistance, ensureDistinct,
};
