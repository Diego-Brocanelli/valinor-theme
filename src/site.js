/**
 * site.js
 *
 * Gera a galeria do GitHub Pages em site/: uma página estática (HTML, CSS e
 * JS inline, sem dependências) com os prints de todos os temas, filtros por
 * tipo e família, busca, ordenação, pares claro/escuro, comparação lado a
 * lado, amostras de cor e uma prévia ao vivo (src/lib/gallery.js) que monta o
 * settings.json com tema, ícones de arquivo, ícones de interface e itálico,
 * além de uma vitrine com cada conjunto de ícones de arquivo.
 * Links como #arien abrem o tema; busca e filtros ficam na URL.
 * Textos em português e inglês.
 *
 * As cores da própria página vêm dos temas Valinor Arien (modo escuro) e
 * Valinor Yavanna (modo claro).
 *
 * Uso: npm run site   (depois abra site/index.html)
 */

const fs = require("fs-extra");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");
const { loadThemes } = require("./lib/themes");
const { italicSettings } = require("./lib/italic");
const gallery = require("./lib/gallery");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "site");
const PREVIEWS = path.join(ROOT, "assets", "previews");
const pkg = fs.readJsonSync(path.join(ROOT, "package.json"));

const MARKETPLACE = `https://marketplace.visualstudio.com/items?itemName=${pkg.publisher}.${pkg.name}`;
const REPO = "https://github.com/Diego-Brocanelli/valinor-theme";
const SITE = "https://diego-brocanelli.github.io/valinor-theme/";
const HUES = ["red", "orange", "yellow", "green", "cyan", "blue", "magenta"];

function themeData(themes) {
  const labels = Object.fromEntries(pkg.contributes.themes.map((t) => [t.path, t.label]));
  const label = (id) => labels[`./themes/${id}.json`];

  const data = themes.map(({ id, source, palette, theme }) => ({
    id,
    label: label(id),
    name: label(id).replace(/^Valinor\s+/, ""),
    type: source.type,
    upstream: source.upstream || "",
    family: gallery.familyOf(source.upstream),
    hue: gallery.hueOf(palette.accent),
    lum: Math.round(gallery.luminance(palette.bg) * 1000),
    hc: Boolean(source.highContrast),
    accentText: palette.accentText,
    // Temas novos podem ainda não ter print (npm run screenshots precisa do Hyprland).
    preview: fs.existsSync(path.join(PREVIEWS, `${id}.png`)),
    pair: source.pair || null,
    ui: gallery.uiColors(theme),
    tokens: gallery.tokenStyles(theme),
    colors: {
      bg: palette.bg,
      bgAlt: palette.bgAlt,
      fg: palette.fg,
      accent: palette.accent,
      ...Object.fromEntries(HUES.map((h) => [h, palette[h]])),
    },
  }));

  // Pares nos dois sentidos (o .yml guarda o par só no tema claro).
  for (const t of data) {
    if (t.pair) {
      const dark = data.find((d) => d.id === t.pair);
      if (dark) dark.pair = t.id;
    }
  }
  return data;
}

function css(arien, yavanna) {
  const vars = (p) => `
    --bg: ${p.bg}; --surface: ${p.bgAlt}; --fg: ${p.fg}; --muted: ${p.fgMuted};
    --accent: ${p.accentText}; --accent-fill: ${p.accent}; --on-accent: ${p.onAccent}; --border: ${p.border};`;

  return `
  :root { color-scheme: light dark; ${vars(arien)} }
  @media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { ${vars(yavanna)} } }
  :root[data-theme="light"] { ${vars(yavanna)} }
  :root[data-theme="dark"] { ${vars(arien)} }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  a { color: var(--accent); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 6px; }
  code, .mono { font-family: "Zed Plex Mono", "JetBrains Mono", ui-monospace, monospace; }

  .wrap { max-width: 1240px; margin: 0 auto; padding: 0 16px; }

  header.top {
    position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px);
    background: color-mix(in srgb, var(--bg) 85%, transparent);
    border-bottom: 1px solid var(--border);
  }
  .bar { display: flex; align-items: center; gap: 12px; height: 60px; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; color: var(--fg); text-decoration: none; }
  .brand img { width: 30px; height: 30px; }
  .spacer { flex: 1; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
  .icon { width: 18px; height: 18px; flex: none; }
  #mode { width: 34px; justify-content: center; padding: 0; }
  /* aria-pressed indica o modo escuro, não uma seleção: mantém o visual neutro. */
  #mode[aria-pressed="true"] { background: var(--surface); color: var(--fg); border-color: var(--border); }
  #mode[aria-pressed="true"]:hover { border-color: var(--accent); }
  #mode .i-moon { display: none; }
  @media (prefers-color-scheme: light) {
    :root:not([data-theme="dark"]) #mode .i-sun { display: none; }
    :root:not([data-theme="dark"]) #mode .i-moon { display: block; }
  }
  :root[data-theme="light"] #mode .i-sun { display: none; }
  :root[data-theme="light"] #mode .i-moon { display: block; }
  .pill {
    display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px;
    border: 1px solid var(--border); border-radius: 999px; background: var(--surface);
    color: var(--fg); font: inherit; font-size: 14px; cursor: pointer; text-decoration: none;
  }
  .pill:hover { border-color: var(--accent); }
  .pill[aria-pressed="true"] { background: var(--accent-fill); color: var(--on-accent); border-color: var(--accent-fill); }

  .hero { padding-block: 56px 28px; }
  .hero h1 { font-size: clamp(32px, 5vw, 52px); line-height: 1.1; margin: 0 0 12px; letter-spacing: -0.02em; }
  .hero p { font-size: 18px; color: var(--muted); max-width: 68ch; margin: 0 0 24px; }
  .install { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .cmd {
    display: inline-flex; align-items: center; gap: 10px; padding: 10px 12px 10px 16px;
    border-radius: 10px; background: var(--surface); border: 1px solid var(--border);
    font-size: 14px; max-width: 100%; white-space: nowrap;
  }
  /* No celular o comando é cortado com reticências; o botão copia o texto inteiro. */
  #cmd { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .btn {
    display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px;
    border-radius: 10px; border: 1px solid transparent; font: inherit; font-weight: 600;
    background: var(--accent-fill); color: var(--on-accent); cursor: pointer; text-decoration: none;
  }
  .btn.ghost { background: transparent; color: var(--fg); border-color: var(--border); }
  .btn.small { height: 30px; padding: 0 10px; font-size: 13px; font-weight: 500; border-radius: 8px; }

  /* Espectro: uma faixa por tema (fundo + destaque), do mais escuro ao mais claro. */
  .spectrum { display: flex; height: 72px; margin-top: 32px; border-radius: 14px; overflow: hidden; border: 1px solid var(--border); }
  .spectrum a { flex: 1 1 0; display: flex; align-items: flex-end; transition: flex-grow .25s ease-out; }
  .spectrum a:hover { flex-grow: 3; }
  .spectrum i { display: block; width: 100%; height: 30%; }
  @media (max-width: 640px) { .spectrum { height: 48px; margin-top: 24px; } }

  .controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding: 8px 0 20px; }
  .seg { display: inline-flex; gap: 4px; padding: 4px; border-radius: 999px; background: var(--surface); border: 1px solid var(--border); }
  .seg .pill { border: 0; height: 30px; }
  .searchbox { flex: 1; min-width: 200px; position: relative; display: flex; align-items: center; }
  .searchbox .icon { position: absolute; left: 12px; color: var(--muted); pointer-events: none; }
  .search {
    width: 100%; height: 40px; padding: 0 14px 0 40px; border-radius: 10px;
    border: 1px solid var(--border); background: var(--surface); color: var(--fg); font: inherit;
  }
  .count { color: var(--muted); font-size: 14px; }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
  @media (max-width: 400px) { .grid { grid-template-columns: 1fr; } }
  .card {
    border: 1px solid var(--border); border-radius: 14px; overflow: hidden; background: var(--surface);
    display: flex; flex-direction: column; transition: transform .15s, border-color .15s;
  }
  .card:hover { transform: translateY(-2px); border-color: var(--accent); }
  .shot { display: block; width: 100%; aspect-ratio: 16 / 10; border: 0; padding: 0; cursor: zoom-in; background: var(--bg); }
  /* Tema sem print: linhas de "código" nas cores dos tokens; abre a prévia ao vivo. */
  .shot.noshot { cursor: pointer; display: flex; flex-direction: column; justify-content: center; gap: 10px; padding: 24px 28px; text-align: left; font: inherit; }
  .noshot .bars { display: flex; gap: 8px; }
  .noshot .bars i { display: block; height: 8px; border-radius: 4px; }
  .noshot strong { margin-top: 8px; font-size: 14px; font-weight: 600; }
  .shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; }
  .title { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .title h3 { margin: 0; font-size: 18px; }
  .tag { font-size: 12px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--border); color: var(--muted); }
  .upstream { color: var(--muted); font-size: 14px; }
  .swatches { display: flex; gap: 6px; flex-wrap: wrap; }
  .sw { width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--border); cursor: pointer; padding: 0; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .pairlink { font-size: 14px; background: none; border: 0; color: var(--accent); cursor: pointer; padding: 0; font: inherit; font-size: 14px; text-decoration: underline; }
  .empty { grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--muted); display: flex; flex-direction: column; align-items: center; gap: 14px; }

  section { padding: 40px 0; }
  section h2 { font-size: 26px; margin: 0 0 6px; }
  section > .wrap > p { color: var(--muted); margin: 0 0 20px; max-width: 68ch; }
  .pairs { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); }
  @media (max-width: 420px) { .pairs { grid-template-columns: 1fr; } }
  .pair { display: grid; grid-template-columns: 1fr 1fr; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
  .pair button { border: 0; padding: 0; cursor: zoom-in; position: relative; background: none; }
  .pair img { width: 100%; display: block; aspect-ratio: 16 / 10; object-fit: cover; }
  .pair picture { display: block; }
  .pair span {
    position: absolute; left: 8px; bottom: 8px; font-size: 12px; padding: 2px 8px; border-radius: 6px;
    background: color-mix(in srgb, var(--bg) 82%, transparent); color: var(--fg); border: 1px solid var(--border);
  }

  .field { display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: var(--muted); }
  .field select, .select {
    height: 40px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--border);
    background: var(--surface); color: var(--fg); font: inherit; font-size: 15px;
  }
  .select { min-width: 0; }
  .title a { color: inherit; text-decoration: none; }
  .title a:hover { text-decoration: underline; }
  .setup-controls { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; margin-bottom: 16px; }
  .hint { color: var(--muted); font-size: 14px; margin: 10px 0 16px; }

  /* Janela de exemplo: cores vêm do tema escolhido (variáveis --c-*). */
  .mock {
    display: grid; grid-template-columns: 48px 230px 1fr; grid-template-rows: 1fr auto;
    border-radius: 12px; overflow: hidden; border: 1px solid var(--border); min-height: 420px;
    background: var(--c-editor-background); color: var(--c-editor-foreground); font-size: 13px;
    scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--c-editor-foreground) 30%, transparent) transparent;
  }
  .mock * { scrollbar-width: inherit; scrollbar-color: inherit; }
  .glyph { font-style: normal; font-size: 20px; line-height: 1; display: inline-block; width: 1em; text-align: center; }
  .m-act { background: var(--c-activityBar-background); display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 0; }
  .m-act .glyph { color: var(--c-activityBar-inactiveForeground); padding: 10px 0; width: 100%; border-left: 2px solid transparent; font-size: 22px; }
  .m-act .glyph.on { color: var(--c-activityBar-foreground); border-left-color: var(--c-activityBar-activeBorder, transparent); }
  .m-act .grow { flex: 1; }
  .m-side { background: var(--c-sideBar-background); color: var(--c-sideBar-foreground); border-right: 1px solid var(--c-sideBar-border, transparent); overflow: auto; }
  .m-title { font-size: 11px; letter-spacing: .06em; padding: 10px 12px 6px; color: var(--c-sideBarTitle-foreground, inherit); }
  .m-tree { list-style: none; margin: 0; padding: 0 0 8px; }
  .m-tree li { display: flex; align-items: center; gap: 6px; height: 24px; padding-right: 8px; cursor: default; white-space: nowrap; }
  .m-tree li[data-file] { cursor: pointer; }
  .m-tree li:hover { background: var(--c-list-hoverBackground); }
  .m-tree li.on { background: var(--c-list-activeSelectionBackground); color: var(--c-list-activeSelectionForeground); }
  .m-tree .glyph { font-size: 16px; width: 16px; }
  .m-tree img, .m-tabs img { width: 16px; height: 16px; flex: none; }
  .m-main { display: flex; flex-direction: column; min-width: 0; }
  .m-tabs { display: flex; background: var(--c-editorGroupHeader-tabsBackground); overflow-x: auto; }
  .m-tabs button {
    display: flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; border: 0; font: inherit; font-size: 13px;
    background: var(--c-tab-inactiveBackground); color: var(--c-tab-inactiveForeground); cursor: pointer; white-space: nowrap;
    border-top: 1px solid transparent; border-right: 1px solid var(--c-tab-border, transparent);
  }
  .m-tabs button[aria-selected="true"] {
    background: var(--c-tab-activeBackground); color: var(--c-tab-activeForeground); border-top-color: var(--c-tab-activeBorderTop, transparent);
  }
  .m-tabs .glyph { font-size: 14px; width: 14px; }
  .m-code {
    margin: 0; padding: 10px 0; overflow: auto; flex: 1; tab-size: 4; font-size: 13px; line-height: 20px;
    font-family: "Zed Plex Mono", "JetBrains Mono", ui-monospace, monospace;
  }
  .m-line { display: flex; padding-right: 16px; }
  .m-line.on { background: var(--c-editor-lineHighlightBackground); }
  .m-ln { width: 44px; flex: none; text-align: right; padding-right: 18px; color: var(--c-editorLineNumber-foreground); user-select: none; }
  .m-line.on .m-ln { color: var(--c-editorLineNumber-activeForeground); }
  .m-status {
    grid-column: 1 / -1; display: flex; align-items: center; gap: 14px; height: 24px; padding: 0 10px; font-size: 12px;
    background: var(--c-statusBar-background); color: var(--c-statusBar-foreground);
  }
  .m-status span { display: inline-flex; align-items: center; gap: 4px; }
  .m-status .glyph { font-size: 14px; width: 14px; }
  .m-status .grow { flex: 1; }
  @media (max-width: 760px) {
    .mock { grid-template-columns: 44px 1fr; grid-template-rows: auto 1fr auto; }
    .m-side { grid-column: 2; max-height: 230px; border-right: 0; }
    .m-act { grid-row: 1 / 3; }
    .m-main { grid-column: 2; }
  }

  .cmp { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); aspect-ratio: 16 / 10; cursor: ew-resize; touch-action: none; }
  .cmp img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; user-select: none; -webkit-user-drag: none; }
  .cmp-line { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--accent-fill); pointer-events: none; }
  .cmp-range { margin-top: 12px; }
  .cmp-range input { width: 100%; accent-color: var(--accent-fill); min-height: 32px; }

  .iconsets { display: grid; gap: 10px; border-radius: 12px; padding: 16px; border: 1px solid var(--border);
    background: var(--c-sideBar-background); color: var(--c-sideBar-foreground); }
  .iconset { display: grid; grid-template-columns: 190px 1fr; gap: 12px; align-items: center; }
  .iconset h3 { margin: 0; font-size: 13px; font-weight: 600; }
  .iconset ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
  .iconset li { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 6px; }
  .iconset li:hover { background: var(--c-list-hoverBackground); }
  .iconset img { width: 20px; height: 20px; }
  @media (max-width: 640px) { .iconset { grid-template-columns: 1fr; gap: 6px; } }

  pre.snippet { scrollbar-width: thin; scrollbar-color: var(--border) transparent; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; overflow: auto; max-height: 420px; font-size: 14px; }

  footer { border-top: 1px solid var(--border); padding: 28px 0 40px; color: var(--muted); font-size: 14px; }

  dialog.lightbox { border: 0; padding: 0; background: transparent; max-width: min(96vw, 1600px); width: 100%; }
  dialog.lightbox::backdrop { background: color-mix(in srgb, var(--bg) 92%, transparent); }
  .lb-inner { position: relative; }
  .lb-inner img { width: 100%; display: block; border-radius: 10px; touch-action: pan-y; user-select: none; -webkit-user-drag: none; }
  .lb-cap { color: var(--fg); display: flex; justify-content: space-between; align-items: center; padding: 10px 2px; gap: 8px; flex-wrap: wrap; }
  .lb-nav { display: flex; gap: 8px; }
  .lb-nav button { background: var(--surface); color: var(--fg); border: 1px solid var(--border); border-radius: 8px; min-height: 44px; min-width: 44px; padding: 0 12px; cursor: pointer; font: inherit; }
  .lb-nav button:hover { border-color: var(--accent); }

  .toast {
    position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%) translateY(20px); opacity: 0;
    background: var(--accent-fill); color: var(--on-accent); padding: 10px 16px; border-radius: 10px;
    font-weight: 600; transition: .2s; pointer-events: none; z-index: 50;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; scroll-behavior: auto !important; }
    .card:hover { transform: none; }
  }
  .btn.ghost:hover, .btn.ghost:focus-visible { border-color: var(--accent); }
  @media (max-width: 640px) {
    .bar .hide-sm { display: none; } .hero { padding-top: 32px; }
    /* Áreas de toque de pelo menos 44px no celular. */
    .pill, .seg .pill, .btn, .btn.small, .lb-nav button, .search, .field select, .select { min-height: 44px; }
    #mode { width: 44px; }
    .swatches { gap: 8px; }
    .sw { width: 36px; height: 36px; }
    .pairlink { min-height: 44px; }
  }
  `;
}

// Faixas do hero: decorativas (o mesmo link existe no título de cada card).
function spectrum(data) {
  return [...data]
    .sort((a, b) => a.lum - b.lum)
    .map((t) => `<a href="#${t.id}" tabindex="-1" title="${t.name}" style="background:${t.colors.bg}"><i style="background:${t.accentText}"></i></a>`)
    .join("");
}

function html(data, styles, italic, hasWebp, live, [arienBg, yavannaBg]) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  const liveJson = JSON.stringify(live).replace(/</g, "\\u003c");
  const fontFaces = Object.entries(live.product)
    .map(([key, set]) => `@font-face { font-family: "pi-${key}"; src: url("${set.font}") format("${set.format}"); font-display: block; }`)
    .join("\n");
  const italicJson = JSON.stringify(italic).replace(/</g, "\\u003c");
  const total = data.length;
  const darkCount = data.filter((t) => t.type === "dark").length;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Valinor Theme Gallery</title>
<meta name="description" content="${total} temas de cores para VS Code inspirados em Tolkien — ${total} Tolkien-inspired VS Code color themes.">
<link rel="icon" href="icon.png">
<link rel="canonical" href="${SITE}">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${arienBg}">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="${yavannaBg}">
<meta property="og:type" content="website">
<meta property="og:title" content="Valinor Theme">
<meta property="og:description" content="${total} Tolkien-inspired VS Code color themes with validated contrast and matching icons.">
<meta property="og:url" content="${SITE}">
<meta property="og:image" content="${SITE}social.png">
<meta property="og:image:width" content="1774">
<meta property="og:image:height" content="887">
<meta name="twitter:card" content="summary_large_image">
<style>${styles}
${fontFaces}</style>
</head>
<body>
<header class="top">
  <div class="wrap bar">
    <a class="brand" href="#"><img src="icon.png" alt="">Valinor</a>
    <span class="spacer"></span>
    <a class="pill hide-sm" href="${MARKETPLACE}" data-i18n="marketplace">Marketplace</a>
    <a class="pill hide-sm" href="${REPO}">GitHub</a>
    <button class="pill" id="lang" type="button" aria-label="Idioma / Language">EN</button>
    <button class="pill" id="mode" type="button" data-i18n-aria="mode" data-i18n-title="mode" aria-pressed="false">
      <svg class="icon i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      <svg class="icon i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
    </button>
  </div>
</header>

<main>
  <div class="wrap hero">
    <h1 data-i18n="title">Temas de cores inspirados em Tolkien</h1>
    <p data-i18n="lead">${total} temas para VS Code (${darkCount} escuros e ${total - darkCount} claros), cada um baseado em um tema consagrado, com contraste validado e ícones na paleta de cada tema.</p>
    <div class="install">
      <span class="cmd mono"><span id="cmd">ext install ${pkg.publisher}.${pkg.name}</span>
        <button class="btn ghost small" type="button" data-copy-from="cmd" data-i18n="copy">Copiar</button></span>
      <a class="btn" href="${MARKETPLACE}" data-i18n="install">Instalar no VS Code</a>
    </div>
    <div class="spectrum" aria-hidden="true">${spectrum(data)}</div>
  </div>

  <div class="wrap">
    <div class="controls" role="search">
      <div class="seg" role="group" data-i18n-aria="filter">
        <button class="pill" type="button" data-filter="all" aria-pressed="true" data-i18n="all">Todos</button>
        <button class="pill" type="button" data-filter="dark" aria-pressed="false" data-i18n="dark">Escuros</button>
        <button class="pill" type="button" data-filter="light" aria-pressed="false" data-i18n="light">Claros</button>
        <button class="pill" type="button" data-filter="hc" aria-pressed="false" data-i18n="hcFilter">Alto contraste</button>
      </div>
      <div class="searchbox">
        <label class="sr-only" for="q" data-i18n="searchLabel">Buscar temas</label>
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input class="search" id="q" type="search" autocomplete="off" data-i18n-placeholder="search" placeholder="Buscar por nome ou tema de origem…">
      </div>
      <label class="sr-only" for="f-family" data-i18n="familyLabel">Família</label>
      <select class="select" id="f-family"></select>
      <label class="sr-only" for="f-sort" data-i18n="sortLabel">Ordenar</label>
      <select class="select" id="f-sort">
        <option value="name" data-i18n="sortName">Ordenar por nome</option>
        <option value="hue" data-i18n="sortHue">Ordenar pela cor de destaque</option>
        <option value="light" data-i18n="sortLight">Do mais escuro ao mais claro</option>
      </select>
      <span class="count" id="count" aria-live="polite"></span>
    </div>
    <div class="grid" id="grid"></div>
  </div>

  <section id="pairs">
    <div class="wrap">
      <h2 data-i18n="pairsTitle">Pares claro/escuro</h2>
      <p data-i18n="pairsLead">Temas da mesma família nas versões escura e clara. Com a configuração abaixo, o VS Code troca de tema junto com o modo do sistema.</p>
      <div class="pairs" id="pairlist"></div>
      <pre class="snippet mono" id="autosnippet"></pre>
      <button class="btn ghost small" type="button" data-copy-from="autosnippet" data-i18n="copy">Copiar</button>
    </div>
  </section>

  <section id="compare">
    <div class="wrap">
      <h2 data-i18n="compareTitle">Comparar temas</h2>
      <p data-i18n="compareLead">Arraste sobre a imagem para comparar dois temas no mesmo código.</p>
      <div class="setup-controls">
        <label class="field"><span data-i18n="compareA">Tema da esquerda</span><select id="c-a"></select></label>
        <label class="field"><span data-i18n="compareB">Tema da direita</span><select id="c-b"></select></label>
      </div>
      <div class="cmp" id="cmp"><img id="c-img-b" alt=""><img id="c-img-a" alt=""><div class="cmp-line" id="cmp-line"></div></div>
      <label class="field cmp-range"><span data-i18n="comparePos">Divisão</span><input type="range" id="c-pos" min="0" max="100" value="50"></label>
    </div>
  </section>

  <section id="setup">
    <div class="wrap">
      <h2 data-i18n="setupTitle">Monte seu VS Code</h2>
      <p data-i18n="setupLead">Escolha tema, ícones e itálico, veja o resultado e copie o settings.json. O itálico vale para todos os temas Valinor.</p>
      <div class="setup-controls">
        <label class="field"><span data-i18n="fieldTheme">Tema</span><select id="s-theme"></select></label>
        <label class="field"><span data-i18n="fieldIcons">Ícones de arquivo</span><select id="s-icons"></select></label>
        <label class="field"><span data-i18n="fieldProduct">Ícones de interface</span><select id="s-product"></select></label>
        <div class="field" id="italic">
          <span id="italic-label" data-i18n="italicTitle">Itálico</span>
          <div class="seg" role="group" aria-labelledby="italic-label">
            <button class="pill" type="button" data-italic="default" aria-pressed="true" data-i18n="italicDefault">Padrão</button>
            <button class="pill" type="button" data-italic="none" aria-pressed="false" data-i18n="italicNone">Sem itálico</button>
            <button class="pill" type="button" data-italic="more" aria-pressed="false" data-i18n="italicMore">Mais itálico</button>
          </div>
        </div>
      </div>
      <div class="mock" id="mock" role="group" data-i18n-aria="mockLabel">
        <div class="m-act" id="m-act"></div>
        <div class="m-side"><div class="m-title" data-i18n="explorer">EXPLORADOR</div><ul class="m-tree" id="m-tree"></ul></div>
        <div class="m-main"><div class="m-tabs" id="m-tabs" role="tablist"></div><pre class="m-code" id="m-code"></pre></div>
        <div class="m-status" id="m-status"></div>
      </div>
      <p class="hint" data-i18n="setupHint">Clique em um arquivo ou aba para ver outra linguagem.</p>
      <pre class="snippet mono" id="setupsnippet"></pre>
      <button class="btn ghost small" type="button" data-copy-from="setupsnippet" data-i18n="copy">Copiar</button>
    </div>
  </section>
  <section id="icons">
    <div class="wrap">
      <h2 data-i18n="iconsTitle">Ícones de arquivo</h2>
      <p data-i18n="iconsLead">Os mesmos arquivos em cada conjunto, sobre a barra lateral do tema escolhido. Lucide e Logos são recoloridos na paleta de cada tema, sempre com contraste mínimo de 3:1.</p>
      <div class="setup-controls">
        <label class="field"><span data-i18n="fieldTheme">Tema</span><select id="i-theme"></select></label>
      </div>
      <div class="iconsets" id="iconsets"></div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <span data-i18n="footer">Licença MIT · Ícones e regras de token de terceiros mantêm suas licenças:</span>
    <a href="${REPO}/blob/main/THIRD_PARTY_NOTICES.md">THIRD_PARTY_NOTICES.md</a>
  </div>
</footer>

<dialog class="lightbox" id="lb">
  <div class="lb-inner">
    <img id="lb-img" alt="">
    <div class="lb-cap">
      <strong id="lb-title"></strong>
      <div class="lb-nav">
        <button type="button" id="lb-prev" data-i18n-aria="prev">←</button>
        <button type="button" id="lb-next" data-i18n-aria="next">→</button>
        <button type="button" id="lb-close" data-i18n="close">Fechar</button>
      </div>
    </div>
  </div>
</dialog>
<div class="toast" id="toast" role="status"></div>

<script>
const THEMES = ${json};
const ITALIC = ${italicJson};
const HAS_WEBP = ${hasWebp};
const LIVE = ${liveJson};
const I18N = {
  pt: {
    title: "Temas de cores inspirados em Tolkien",
    lead: "${total} temas para VS Code (${darkCount} escuros e ${total - darkCount} claros), cada um baseado em um tema consagrado, com contraste validado e ícones na paleta de cada tema.",
    copy: "Copiar", install: "Instalar no VS Code", marketplace: "Marketplace",
    all: "Todos", dark: "Escuros", light: "Claros", search: "Buscar por nome ou tema de origem…",
    count: (n) => n + (n === 1 ? " tema" : " temas"), empty: "Nenhum tema encontrado.",
    clearFilters: "Limpar busca e filtros", searchLabel: "Buscar temas",
    colorNames: { bg: "Fundo", bgAlt: "Barra lateral", fg: "Texto", accent: "Destaque", red: "Vermelho", orange: "Laranja", yellow: "Amarelo", green: "Verde", cyan: "Ciano", blue: "Azul", magenta: "Magenta" },
    darkTag: "escuro", lightTag: "claro", hcTag: "alto contraste", basedOn: "Inspirado em", pairOf: "Par:",
    noPreview: "Ver na prévia ao vivo",
    copySettings: "Copiar settings.json", copied: "Copiado!", colorCopied: (c) => "Cor " + c + " copiada",
    pairsTitle: "Pares claro/escuro",
    pairsLead: "Temas da mesma família nas versões escura e clara. Com a configuração abaixo, o VS Code troca de tema junto com o modo do sistema.",
    footer: "Licença MIT · Ícones e regras de token de terceiros mantêm suas licenças:",
    close: "Fechar", prev: "Anterior", next: "Próximo", mode: "Modo escuro", filter: "Filtrar por tipo",
    zoom: (n) => "Ampliar print de " + n,
    italicTitle: "Itálico",
    italicDefault: "Padrão", italicNone: "Sem itálico", italicMore: "Mais itálico",
    familyLabel: "Família", familyAll: "Todas as famílias", sortLabel: "Ordenar",
    sortName: "Ordenar por nome", sortHue: "Ordenar pela cor de destaque", sortLight: "Do mais escuro ao mais claro",
    livePreview: "Ver ao vivo", link: (n) => "Link para " + n,
    setupTitle: "Monte seu VS Code",
    setupLead: "Escolha tema, ícones e itálico, veja o resultado e copie o settings.json. O itálico vale para todos os temas Valinor.",
    fieldTheme: "Tema", fieldIcons: "Ícones de arquivo", fieldProduct: "Ícones de interface",
    setupHint: "Clique em um arquivo ou aba para ver outra linguagem.",
    mockLabel: "Prévia do VS Code com as opções escolhidas", explorer: "EXPLORADOR",
    iconSets: { themed: "Lucide na paleta do tema", logos: "Logos na paleta do tema", lucide: "Lucide", material: "Material", symbols: "Symbols", catppuccin: "Catppuccin (Mocha / Latte)" },
    productSets: { default: "Padrão do VS Code", lucide: "Lucide", fluent: "Fluent", carbon: "Carbon", material: "Material" },
    compareTitle: "Comparar temas", compareLead: "Arraste sobre a imagem para comparar dois temas no mesmo código.",
    compareA: "Tema da esquerda", compareB: "Tema da direita", comparePos: "Divisão",
    hcFilter: "Alto contraste",
    iconsTitle: "Ícones de arquivo",
    iconsLead: "Os mesmos arquivos em cada conjunto, sobre a barra lateral do tema escolhido. Lucide e Logos são recoloridos na paleta de cada tema, sempre com contraste mínimo de 3:1.",
  },
  en: {
    title: "Tolkien-inspired color themes",
    lead: "${total} themes for VS Code (${darkCount} dark, ${total - darkCount} light), each based on a well-known theme, with validated contrast and icons in each theme's palette.",
    copy: "Copy", install: "Install in VS Code", marketplace: "Marketplace",
    all: "All", dark: "Dark", light: "Light", search: "Search by name or source theme…",
    count: (n) => n + (n === 1 ? " theme" : " themes"), empty: "No theme found.",
    clearFilters: "Clear search and filters", searchLabel: "Search themes",
    colorNames: { bg: "Background", bgAlt: "Sidebar", fg: "Text", accent: "Accent", red: "Red", orange: "Orange", yellow: "Yellow", green: "Green", cyan: "Cyan", blue: "Blue", magenta: "Magenta" },
    darkTag: "dark", lightTag: "light", hcTag: "high contrast", basedOn: "Based on", pairOf: "Pair:",
    noPreview: "See it in the live preview",
    copySettings: "Copy settings.json", copied: "Copied!", colorCopied: (c) => "Color " + c + " copied",
    pairsTitle: "Light/dark pairs",
    pairsLead: "Themes from the same family in dark and light versions. With the settings below, VS Code switches theme with your OS appearance.",
    footer: "MIT License · Third-party icons and token rules keep their own licenses:",
    close: "Close", prev: "Previous", next: "Next", mode: "Dark mode", filter: "Filter by type",
    zoom: (n) => "Enlarge screenshot of " + n,
    italicTitle: "Italics",
    italicDefault: "Default", italicNone: "No italics", italicMore: "More italics",
    familyLabel: "Family", familyAll: "All families", sortLabel: "Sort",
    sortName: "Sort by name", sortHue: "Sort by accent color", sortLight: "Darkest to lightest",
    livePreview: "Live preview", link: (n) => "Link to " + n,
    setupTitle: "Build your setup",
    setupLead: "Pick a theme, icons and italics, see the result and copy the settings.json. Italics apply to every Valinor theme.",
    fieldTheme: "Theme", fieldIcons: "File icons", fieldProduct: "UI icons",
    setupHint: "Click a file or tab to see another language.",
    mockLabel: "VS Code preview with the chosen options", explorer: "EXPLORER",
    iconSets: { themed: "Lucide in the theme palette", logos: "Logos in the theme palette", lucide: "Lucide", material: "Material", symbols: "Symbols", catppuccin: "Catppuccin (Mocha / Latte)" },
    productSets: { default: "VS Code default", lucide: "Lucide", fluent: "Fluent", carbon: "Carbon", material: "Material" },
    compareTitle: "Compare themes", compareLead: "Drag over the image to compare two themes on the same code.",
    compareA: "Left theme", compareB: "Right theme", comparePos: "Split",
    hcFilter: "High contrast",
    iconsTitle: "File icons",
    iconsLead: "The same files in every set, on the sidebar of the chosen theme. Lucide and Logos are recolored to each theme's palette, always with at least 3:1 contrast.",
  },
};

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const $ = (s) => document.querySelector(s);
const byId = Object.fromEntries(THEMES.map((t) => [t.id, t]));
let lang = store.get("valinor-lang") || ((navigator.language || "pt").toLowerCase().startsWith("pt") ? "pt" : "en");
let filter = "all";
let family = "";
let sortBy = "name";
let italicMode = ["default", "none", "more"].includes(store.get("valinor-italic")) ? store.get("valinor-italic") : "default";
const pickKey = (saved, options, fallback) => (options.includes(saved) ? saved : fallback);
const setup = {
  theme: byId[store.get("valinor-setup-theme")] ? store.get("valinor-setup-theme") : THEMES[0].id,
  icons: pickKey(store.get("valinor-icons"), Object.keys(LIVE.icons), Object.keys(LIVE.icons)[0]),
  product: pickKey(store.get("valinor-product"), Object.keys(LIVE.product), "default"),
  file: "index.ts",
};
const withShots = THEMES.filter((th) => th.preview);
const compare = { a: withShots[0].id, b: (withShots[1] || withShots[0]).id, pos: 50 };
let visible = [];
let current = 0;
const t = (k, ...a) => { const v = I18N[lang][k]; return typeof v === "function" ? v(...a) : v; };

// settings.json com o tema, os ícones e o itálico escolhidos em "Monte seu VS Code".
function settingsFor(theme) {
  const product = LIVE.product[setup.product];
  const settings = {
    "workbench.colorTheme": theme.label,
    "workbench.iconTheme": LIVE.icons[setup.icons].settings[theme.id],
  };
  if (product && product.setting) settings["workbench.productIconTheme"] = product.setting;
  return JSON.stringify({ ...settings, ...ITALIC[italicMode] }, null, 2);
}

function autoSnippet() {
  const dark = byId.arwen, light = byId[byId.arwen && byId.arwen.pair];
  return JSON.stringify({
    "window.autoDetectColorScheme": true,
    "workbench.preferredDarkColorTheme": dark ? dark.label : "Valinor Arwen",
    "workbench.preferredLightColorTheme": light ? light.label : "Valinor Nienna",
  }, null, 2);
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

// Print do tema: WebP de 800px quando o build gerou (cards e pares), PNG como fallback.
function preview(theme) {
  const img = el("img", { src: "previews/" + theme.id + ".png", alt: theme.label, loading: "lazy", decoding: "async", width: "1600", height: "1000" });
  if (!HAS_WEBP) return img;
  return el("picture", {}, el("source", { type: "image/webp", srcset: "previews/" + theme.id + ".webp" }), img);
}

function resetFilters() {
  filter = "all"; family = ""; $("#q").value = ""; $("#f-family").value = "";
  document.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === "all")));
}

// Sem print: algumas linhas de "código" com as cores dos tokens do tema.
function codeSketch(theme) {
  const rows = [["c", 60], ["k", 18, "t", 22, "str", 30], ["s", 14, "f", 26, "pa", 16], ["v", 20, "n", 8], ["th", 12, "p", 24, "f", 18], ["k", 16, "v", 20]];
  const shot = el("button", { class: "shot noshot", type: "button", "aria-label": t("livePreview") + ": " + theme.name, onclick: () => showLive(theme.id),
    style: "background:" + theme.ui["editor.background"] + ";color:" + theme.ui["editor.foreground"] });
  for (const row of rows) {
    const bars = el("span", { class: "bars" });
    for (let i = 0; i < row.length; i += 2) bars.append(el("i", { style: "width:" + row[i + 1] + "%;background:" + theme.tokens[row[i]][0] }));
    shot.append(bars);
  }
  shot.append(el("strong", {}, t("noPreview")));
  return shot;
}

function card(theme) {
  const shot = theme.preview
    ? el("button", { class: "shot", type: "button", "aria-label": t("zoom", theme.name), onclick: () => openLightbox(theme.id) }, preview(theme))
    : codeSketch(theme);

  const swatches = el("div", { class: "swatches" });
  for (const [name, color] of Object.entries(theme.colors)) {
    const label = t("colorNames")[name] + " " + color;
    swatches.append(el("button", {
      class: "sw", type: "button", style: "background:" + color, title: label, "aria-label": label,
      onclick: () => copy(color, t("colorCopied", color)),
    }));
  }

  const actions = el("div", { class: "actions" },
    el("button", { class: "btn ghost small", type: "button", onclick: () => showLive(theme.id) }, t("livePreview")),
    el("button", { class: "btn ghost small", type: "button", onclick: () => copy(settingsFor(theme)) }, t("copySettings")));
  if (theme.pair && byId[theme.pair]) {
    const pair = byId[theme.pair];
    actions.append(el("span", { class: "upstream" }, t("pairOf") + " "),
      el("button", { class: "pairlink", type: "button", onclick: () => focusTheme(pair.id) }, pair.name));
  }

  return el("article", { class: "card", id: theme.id },
    shot,
    el("div", { class: "body" },
      el("div", { class: "title" },
        el("h3", {}, el("a", { href: "#" + theme.id, title: t("link", theme.name) }, theme.name)),
        el("span", { class: "tag" }, t(theme.type + "Tag")),
        ...(theme.hc ? [el("span", { class: "tag" }, t("hcTag"))] : [])),
      el("div", { class: "upstream" }, t("basedOn") + " " + theme.upstream),
      swatches,
      actions));
}

function render() {
  const q = $("#q").value.trim().toLowerCase();
  visible = THEMES.filter((th) =>
    (filter === "all" || (filter === "hc" ? th.hc : th.type === filter)) &&
    (!family || th.family === family) &&
    (!q || (th.name + " " + th.upstream + " " + th.id).toLowerCase().includes(q)));
  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name, lang),
    hue: (a, b) => (a.hue < 0) - (b.hue < 0) || a.hue - b.hue,
    light: (a, b) => a.lum - b.lum,
  };
  visible.sort(sorters[sortBy]);
  const grid = $("#grid");
  const empty = el("div", { class: "empty" }, el("p", {}, t("empty")),
    el("button", { class: "btn ghost small", type: "button", onclick: () => { resetFilters(); render(); $("#q").focus(); } }, t("clearFilters")));
  grid.replaceChildren(...(visible.length ? visible.map(card) : [empty]));
  $("#count").textContent = t("count", visible.length);

  const pairs = THEMES.filter((th) => th.type === "dark" && th.preview && th.pair && byId[th.pair] && byId[th.pair].preview);
  $("#pairlist").replaceChildren(...pairs.map((dark) => {
    const light = byId[dark.pair];
    const half = (th) => el("button", { type: "button", "aria-label": t("zoom", th.name), onclick: () => openLightbox(th.id, true) },
      preview(th), el("span", {}, th.name));
    return el("div", { class: "pair" }, half(dark), half(light));
  }));
  $("#autosnippet").textContent = autoSnippet();
  syncUrl();
}

// Busca, tipo, família e ordenação na URL (?q=&type=&family=&sort=), para compartilhar.
function syncUrl() {
  const params = new URLSearchParams();
  const q = $("#q").value.trim();
  if (q) params.set("q", q);
  if (filter !== "all") params.set("type", filter);
  if (family) params.set("family", family);
  if (sortBy !== "name") params.set("sort", sortBy);
  const query = params.toString();
  try { history.replaceState(null, "", (query ? "?" + query : location.pathname) + location.hash); } catch {}
}

function readUrl() {
  const params = new URLSearchParams(location.search);
  $("#q").value = params.get("q") || "";
  if (["dark", "light", "hc"].includes(params.get("type"))) filter = params.get("type");
  if (THEMES.some((th) => th.family === params.get("family"))) family = params.get("family");
  if (["hue", "light"].includes(params.get("sort"))) sortBy = params.get("sort");
  document.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
  $("#f-sort").value = sortBy;
}

function fillSelects() {
  const families = [...new Set(THEMES.map((th) => th.family))].sort((a, b) => a.localeCompare(b, lang));
  $("#f-family").replaceChildren(el("option", { value: "" }, t("familyAll")), ...families.map((f) => el("option", { value: f }, f)));
  $("#f-family").value = family;

  const themeOptions = (select, value, withPreview) => {
    select.replaceChildren(...["dark", "light"].map((type) => el("optgroup", { label: t(type) },
      ...THEMES.filter((th) => th.type === type && (!withPreview || th.preview)).sort((a, b) => a.name.localeCompare(b.name, lang))
        .map((th) => el("option", { value: th.id }, th.name)))));
    select.value = value;
  };
  themeOptions($("#s-theme"), setup.theme);
  themeOptions($("#i-theme"), setup.theme);
  themeOptions($("#c-a"), compare.a, true);
  themeOptions($("#c-b"), compare.b, true);
  $("#s-icons").replaceChildren(...Object.keys(LIVE.icons).map((k) => el("option", { value: k }, t("iconSets")[k])));
  $("#s-icons").value = setup.icons;
  $("#s-product").replaceChildren(...Object.keys(LIVE.product).map((k) => el("option", { value: k }, t("productSets")[k])));
  $("#s-product").value = setup.product;
}

// Glifo de um codicon no conjunto de ícones de interface escolhido.
function glyph(id, extra) {
  const [font, code] = LIVE.product[setup.product].glyphs[id];
  return el("i", { class: "glyph" + (extra ? " " + extra : ""), style: "font-family:pi-" + font, "aria-hidden": "true" }, String.fromCodePoint(code));
}

function iconsOf(theme) {
  const group = LIVE.icons[setup.icons].groups.find((g) => g.themes.includes(theme.id));
  return { list: group.list.map((src) => src && src.split("{id}").join(theme.id)), arrows: !group.hidesArrows };
}

function renderSetup() {
  const theme = byId[setup.theme];
  const mock = $("#mock");
  for (const [key, value] of Object.entries(theme.ui)) mock.style.setProperty("--c-" + key.split(".").join("-"), value || "transparent");
  const icons = iconsOf(theme);
  const fileIcon = (index) => (icons.list[index] ? el("img", { src: icons.list[index], alt: "" }) : el("span", { style: "width:16px" }));
  const indexOf = (name) => LIVE.tree.findIndex((entry) => entry.name === name);

  $("#m-act").replaceChildren(
    glyph("files", "on"), glyph("search"), glyph("source-control"), glyph("debug-alt"), glyph("extensions"),
    el("span", { class: "grow" }), glyph("account"), glyph("settings-gear"));

  $("#m-tree").replaceChildren(...LIVE.tree.map((entry, i) => {
    const folder = entry.kind === "root" || entry.kind === "folder";
    const open = entry.kind === "root" || entry.open;
    const row = el("li", { style: "padding-left:" + (8 + entry.depth * 12) + "px" });
    if (icons.arrows) row.append(folder ? glyph(open ? "chevron-down" : "chevron-right") : el("span", { style: "width:16px;flex:none" }));
    row.append(fileIcon(i), entry.kind === "root" ? entry.name.toUpperCase() : entry.name);
    if (LIVE.snippets[entry.name]) {
      row.dataset.file = entry.name;
      if (entry.name === setup.file) row.className = "on";
      row.addEventListener("click", () => { setup.file = entry.name; renderSetup(); });
    }
    return row;
  }));

  $("#m-tabs").replaceChildren(...Object.keys(LIVE.snippets).map((name) => {
    const selected = name === setup.file;
    const tab = el("button", { type: "button", role: "tab", "aria-selected": String(selected), onclick: () => { setup.file = name; renderSetup(); } },
      fileIcon(indexOf(name)), name);
    if (selected) tab.append(glyph("close"));
    return tab;
  }));

  const italic = (cat) => italicMode === "none" ? false : theme.tokens[cat][1] === 1 || (italicMode === "more" && LIVE.moreItalic.includes(cat));
  $("#m-code").replaceChildren(...LIVE.snippets[setup.file].map((line, i) =>
    el("div", { class: "m-line" + (i === 6 ? " on" : "") },
      el("span", { class: "m-ln" }, String(i + 1)),
      el("span", {}, ...line.map(([cat, text]) => cat
        ? el("span", { style: "color:" + theme.tokens[cat][0] + (italic(cat) ? ";font-style:italic" : "") }, text)
        : text)))));

  $("#m-status").replaceChildren(
    el("span", {}, glyph("git-branch"), "main"),
    el("span", {}, glyph("error"), "0", glyph("warning"), "0"),
    el("span", { class: "grow" }),
    el("span", {}, "UTF-8"),
    el("span", {}, glyph("bell")));

  document.querySelectorAll("[data-italic]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.italic === italicMode)));
  $("#setupsnippet").textContent = settingsFor(theme);
}

// Vitrine: cada conjunto em uma linha, com as cores da sidebar do tema.
function renderIcons() {
  const theme = byId[$("#i-theme").value] || byId[setup.theme];
  const box = $("#iconsets");
  for (const [key, value] of Object.entries(theme.ui)) box.style.setProperty("--c-" + key.split(".").join("-"), value || "transparent");
  box.replaceChildren(...Object.entries(LIVE.icons).map(([key, set]) => {
    const group = set.groups.find((g) => g.themes.includes(theme.id));
    const items = LIVE.showcase.map((entry, i) => {
      const src = group.showcase[i] && group.showcase[i].split("{id}").join(theme.id);
      return src ? el("li", { title: entry.name }, el("img", { src, alt: entry.name, loading: "lazy", width: "20", height: "20" })) : null;
    }).filter(Boolean);
    return el("div", { class: "iconset" }, el("h3", {}, t("iconSets")[key]), el("ul", {}, ...items));
  }));
}

function showLive(id) {
  setup.theme = id;
  store.set("valinor-setup-theme", id);
  $("#s-theme").value = id;
  renderSetup();
  $("#setup").scrollIntoView({ block: "start" });
}

function renderCompare() {
  const a = byId[compare.a], b = byId[compare.b];
  $("#c-img-a").src = "previews/" + a.id + ".png";
  $("#c-img-a").alt = a.label;
  $("#c-img-b").src = "previews/" + b.id + ".png";
  $("#c-img-b").alt = b.label;
  $("#c-img-a").style.clipPath = "inset(0 " + (100 - compare.pos) + "% 0 0)";
  $("#cmp-line").style.left = compare.pos + "%";
  $("#c-pos").value = compare.pos;
}

function applyLang() {
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((n) => { n.placeholder = t(n.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-aria]").forEach((n) => { n.setAttribute("aria-label", t(n.dataset.i18nAria)); });
  document.querySelectorAll("[data-i18n-title]").forEach((n) => { n.title = t(n.dataset.i18nTitle); });
  $("#lang").textContent = lang === "pt" ? "EN" : "PT";
  fillSelects();
  render();
  renderSetup();
  renderCompare();
  renderIcons();
}

function focusTheme(id) {
  resetFilters();
  render();
  const target = document.getElementById(id);
  if (target) { target.scrollIntoView({ block: "center" }); target.querySelector(".shot").focus({ preventScroll: true }); }
}

let lbList = [];
function openLightbox(id, all) {
  lbList = (all || !visible.length ? THEMES : visible).filter((th) => th.preview);
  current = Math.max(0, lbList.findIndex((th) => th.id === id));
  showCurrent();
  const lb = $("#lb");
  if (!lb.open) lb.showModal();
}
function showCurrent() {
  const th = lbList[current];
  $("#lb-img").src = "previews/" + th.id + ".png";
  $("#lb-img").alt = th.label;
  $("#lb-title").textContent = th.label + " — " + th.upstream;
}
function step(d) { current = (current + d + lbList.length) % lbList.length; showCurrent(); }

let toastTimer;
async function copy(text, message) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = el("textarea", { style: "position:fixed;opacity:0" }); ta.value = text;
    document.body.append(ta); ta.select(); try { document.execCommand("copy"); } catch {} ta.remove();
  }
  const toast = $("#toast");
  toast.textContent = message || t("copied");
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

document.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", () => {
  filter = b.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  render();
}));
document.querySelectorAll("[data-copy-from]").forEach((b) => b.addEventListener("click", () => copy($("#" + b.dataset.copyFrom).textContent)));
$("#q").addEventListener("input", render);
$("#f-family").addEventListener("change", (e) => { family = e.target.value; render(); });
$("#f-sort").addEventListener("change", (e) => { sortBy = e.target.value; render(); });
document.querySelectorAll("[data-italic]").forEach((b) => b.addEventListener("click", () => {
  italicMode = b.dataset.italic;
  store.set("valinor-italic", italicMode);
  renderSetup();
}));
$("#s-theme").addEventListener("change", (e) => { setup.theme = e.target.value; store.set("valinor-setup-theme", setup.theme); renderSetup(); });
$("#s-icons").addEventListener("change", (e) => { setup.icons = e.target.value; store.set("valinor-icons", setup.icons); renderSetup(); });
$("#s-product").addEventListener("change", (e) => { setup.product = e.target.value; store.set("valinor-product", setup.product); renderSetup(); });
$("#i-theme").addEventListener("change", renderIcons);
$("#c-a").addEventListener("change", (e) => { compare.a = e.target.value; renderCompare(); });
$("#c-b").addEventListener("change", (e) => { compare.b = e.target.value; renderCompare(); });
$("#c-pos").addEventListener("input", (e) => { compare.pos = Number(e.target.value); renderCompare(); });
const dragCompare = (e) => {
  if (e.type !== "pointerdown" && !e.buttons) return;
  const box = $("#cmp").getBoundingClientRect();
  compare.pos = Math.round(Math.min(100, Math.max(0, ((e.clientX - box.left) / box.width) * 100)));
  renderCompare();
};
$("#cmp").addEventListener("pointerdown", dragCompare);
$("#cmp").addEventListener("pointermove", dragCompare);
// #arien (ou outro id de tema) mostra o card do tema.
const openFromHash = () => { const id = decodeURIComponent(location.hash.slice(1)); if (byId[id]) focusTheme(id); };
window.addEventListener("hashchange", openFromHash);
$("#lang").addEventListener("click", () => { lang = lang === "pt" ? "en" : "pt"; store.set("valinor-lang", lang); applyLang(); });
const darkMedia = matchMedia("(prefers-color-scheme: dark)");
const isDarkMode = () => {
  const root = document.documentElement;
  return root.dataset.theme ? root.dataset.theme === "dark" : darkMedia.matches;
};
const syncMode = () => $("#mode").setAttribute("aria-pressed", String(isDarkMode()));
$("#mode").addEventListener("click", () => {
  document.documentElement.dataset.theme = isDarkMode() ? "light" : "dark";
  store.set("valinor-mode", document.documentElement.dataset.theme);
  syncMode();
});
darkMedia.addEventListener("change", syncMode);
const savedMode = store.get("valinor-mode");
if (savedMode) document.documentElement.dataset.theme = savedMode;
syncMode();
$("#lb-prev").addEventListener("click", () => step(-1));
$("#lb-next").addEventListener("click", () => step(1));
$("#lb-close").addEventListener("click", () => $("#lb").close());
$("#lb").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
// Arrastar o print para o lado troca de tema (celular).
let swipeX = null;
$("#lb-img").addEventListener("pointerdown", (e) => { swipeX = e.clientX; });
$("#lb-img").addEventListener("pointerup", (e) => {
  if (swipeX === null) return;
  const dx = e.clientX - swipeX;
  swipeX = null;
  if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
});
document.addEventListener("keydown", (e) => {
  if (!$("#lb").open) return;
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

readUrl();
applyLang();
openFromHash();
</script>
</body>
</html>
`;
}

/**
 * Versões WebP de 800px dos prints para os cards (o PNG de 1600px fica para o
 * lightbox). Usa o ImageMagick (magick ou convert); sem ele, a galeria usa
 * só os PNG.
 */
function writeWebp(themes) {
  const tool = ["magick", "convert"].find((cmd) => {
    try {
      execFileSync(cmd, ["-version"], { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  });
  if (!tool) {
    console.warn("site: ImageMagick não encontrado; a galeria usa só os PNG.");
    return false;
  }
  for (const { id } of themes) {
    execFileSync(tool, [path.join(PREVIEWS, `${id}.png`), "-resize", "800x", "-quality", "82", path.join(OUT, "previews", `${id}.webp`)]);
  }
  return true;
}

function main() {
  const themes = loadThemes();
  const missing = themes.filter(({ id }) => !fs.existsSync(path.join(PREVIEWS, `${id}.png`)));
  if (missing.length) {
    console.warn(`site: sem print em assets/previews: ${missing.map((m) => m.id).join(", ")} (rode npm run screenshots); o card abre a prévia ao vivo.`);
  }
  const withPreview = themes.filter((t) => !missing.includes(t));

  const arien = themes.find((t) => t.id === "arien").palette;
  const yavanna = themes.find((t) => t.id === "yavanna").palette;

  fs.emptyDirSync(OUT);
  fs.copySync(PREVIEWS, path.join(OUT, "previews"), { filter: (src) => !src.endsWith("overview.png") });
  fs.copySync(path.join(ROOT, "assets", "icon.png"), path.join(OUT, "icon.png"));
  // Imagem de compartilhamento (og:image).
  fs.copySync(path.join(ROOT, "assets", "valinor-banner.png"), path.join(OUT, "social.png"));
  const hasWebp = writeWebp(withPreview);
  const italic = { default: {}, none: italicSettings("none", themes), more: italicSettings("more", themes) };
  const icons = gallery.iconSets(themes, OUT);
  const product = gallery.productSets(OUT);
  for (const key of [...icons.missing, ...product.missing]) {
    console.warn(`site: conjunto de ícones "${key}" não encontrado; fora da prévia (rode npm run build / make init).`);
  }
  if (!Object.keys(icons.sets).length) {
    console.error("site: nenhum conjunto de ícones encontrado (rode npm run build).");
    process.exit(1);
  }
  const live = {
    icons: icons.sets,
    product: product.sets,
    tree: gallery.TREE,
    snippets: gallery.SNIPPETS,
    moreItalic: gallery.MORE_ITALIC,
    showcase: gallery.SHOWCASE,
  };
  const page = html(themeData(themes), css(arien, yavanna), italic, hasWebp, live, [arien.bg, yavanna.bg]);

  // O script da página é montado dentro de um template literal; um escape
  // errado quebra a galeria inteira sem aviso. Checa a sintaxe antes de gravar.
  const script = page.slice(page.lastIndexOf("<script>") + 8, page.lastIndexOf("</script>"));
  try {
    new vm.Script(script, { filename: "site/index.html" });
  } catch (error) {
    console.error(`site: erro de sintaxe no JavaScript gerado: ${error.message}`);
    process.exit(1);
  }

  fs.writeFileSync(path.join(OUT, "index.html"), page);
  fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

  console.log(`site: galeria com ${themes.length} temas em site/index.html`);
}

main();
