/**
 * site.js
 *
 * Gera a galeria do GitHub Pages em site/: uma página estática (HTML, CSS e
 * JS inline, sem dependências) com os prints de todos os temas, filtros,
 * busca, pares claro/escuro, amostras de cor, seletor de itálico e snippets
 * de settings.json.
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
const { loadThemes } = require("./lib/themes");
const { italicSettings } = require("./lib/italic");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "site");
const PREVIEWS = path.join(ROOT, "assets", "previews");
const pkg = fs.readJsonSync(path.join(ROOT, "package.json"));

const MARKETPLACE = `https://marketplace.visualstudio.com/items?itemName=${pkg.publisher}.${pkg.name}`;
const REPO = "https://github.com/Diego-Brocanelli/valinor-theme";
const HUES = ["red", "orange", "yellow", "green", "cyan", "blue", "magenta"];

function themeData(themes) {
  const labels = Object.fromEntries(pkg.contributes.themes.map((t) => [t.path, t.label]));
  const label = (id) => labels[`./themes/${id}.json`];

  const data = themes.map(({ id, source, palette }) => ({
    id,
    label: label(id),
    name: label(id).replace(/^Valinor\s+/, ""),
    type: source.type,
    upstream: source.upstream || "",
    pair: source.pair || null,
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
    font: 16px/1.55 "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
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
  .pill {
    display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px;
    border: 1px solid var(--border); border-radius: 999px; background: var(--surface);
    color: var(--fg); font: inherit; font-size: 14px; cursor: pointer; text-decoration: none;
  }
  .pill:hover { border-color: var(--accent); }
  .pill[aria-pressed="true"] { background: var(--accent-fill); color: var(--on-accent); border-color: var(--accent-fill); }

  .hero { padding-block: 56px 28px; }
  .hero h1 { font-size: clamp(32px, 5vw, 52px); line-height: 1.1; margin: 0 0 12px; letter-spacing: -0.02em; }
  .hero p { font-size: 18px; color: var(--muted); max-width: 720px; margin: 0 0 24px; }
  .install { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .cmd {
    display: inline-flex; align-items: center; gap: 10px; padding: 10px 12px 10px 16px;
    border-radius: 10px; background: var(--surface); border: 1px solid var(--border);
    font-size: 14px; max-width: 100%; overflow-x: auto;
  }
  .btn {
    display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px;
    border-radius: 10px; border: 1px solid transparent; font: inherit; font-weight: 600;
    background: var(--accent-fill); color: var(--on-accent); cursor: pointer; text-decoration: none;
  }
  .btn.ghost { background: transparent; color: var(--fg); border-color: var(--border); }
  .btn.small { height: 30px; padding: 0 10px; font-size: 13px; font-weight: 500; border-radius: 8px; }

  .controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding: 8px 0 20px; }
  .seg { display: inline-flex; gap: 4px; padding: 4px; border-radius: 999px; background: var(--surface); border: 1px solid var(--border); }
  .seg .pill { border: 0; height: 30px; }
  .search {
    flex: 1; min-width: 200px; height: 40px; padding: 0 14px; border-radius: 10px;
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
  .shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; }
  .title { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .title h3 { margin: 0; font-size: 18px; }
  .tag { font-size: 12px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--border); color: var(--muted); }
  .upstream { color: var(--muted); font-size: 14px; }
  .swatches { display: flex; gap: 4px; flex-wrap: wrap; }
  .sw { width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--border); cursor: pointer; padding: 0; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .pairlink { font-size: 14px; background: none; border: 0; color: var(--accent); cursor: pointer; padding: 0; font: inherit; font-size: 14px; text-decoration: underline; }
  .empty { padding: 40px; text-align: center; color: var(--muted); }

  section { padding: 40px 0; }
  section h2 { font-size: 26px; margin: 0 0 6px; }
  section > .wrap > p { color: var(--muted); margin: 0 0 20px; }
  .pairs { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); }
  @media (max-width: 420px) { .pairs { grid-template-columns: 1fr; } }
  .pair { display: grid; grid-template-columns: 1fr 1fr; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
  .pair button { border: 0; padding: 0; cursor: zoom-in; position: relative; background: none; }
  .pair img { width: 100%; display: block; aspect-ratio: 16 / 10; object-fit: cover; }
  .pair span { position: absolute; left: 8px; bottom: 8px; font-size: 12px; padding: 2px 8px; border-radius: 6px; background: #000a; color: #fff; }

  pre.snippet { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; overflow: auto; max-height: 420px; font-size: 14px; }

  footer { border-top: 1px solid var(--border); padding: 28px 0 40px; color: var(--muted); font-size: 14px; }

  dialog.lightbox { border: 0; padding: 0; background: transparent; max-width: min(96vw, 1600px); width: 100%; }
  dialog.lightbox::backdrop { background: #000d; }
  .lb-inner { position: relative; }
  .lb-inner img { width: 100%; display: block; border-radius: 10px; }
  .lb-cap { color: #fff; display: flex; justify-content: space-between; align-items: center; padding: 10px 2px; gap: 8px; flex-wrap: wrap; }
  .lb-nav { display: flex; gap: 8px; }
  .lb-nav button { background: #fff2; color: #fff; border: 1px solid #fff4; border-radius: 8px; height: 34px; padding: 0 12px; cursor: pointer; font: inherit; }

  .toast {
    position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%) translateY(20px); opacity: 0;
    background: var(--accent-fill); color: var(--on-accent); padding: 10px 16px; border-radius: 10px;
    font-weight: 600; transition: .2s; pointer-events: none; z-index: 50;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; scroll-behavior: auto !important; } }
  @media (max-width: 640px) { .bar .hide-sm { display: none; } .hero { padding-top: 32px; } }
  `;
}

function html(data, styles, italic) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
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
<style>${styles}</style>
</head>
<body>
<header class="top">
  <div class="wrap bar">
    <a class="brand" href="#"><img src="icon.png" alt="">Valinor</a>
    <span class="spacer"></span>
    <a class="pill hide-sm" href="${MARKETPLACE}" data-i18n="marketplace">Marketplace</a>
    <a class="pill hide-sm" href="${REPO}">GitHub</a>
    <button class="pill" id="lang" type="button" aria-label="Idioma / Language">EN</button>
    <button class="pill" id="mode" type="button" data-i18n-aria="mode">◐</button>
  </div>
</header>

<main>
  <div class="wrap hero">
    <h1 data-i18n="title">Temas de cores inspirados em Tolkien</h1>
    <p data-i18n="lead">${total} temas para VS Code (${darkCount} escuros e ${total - darkCount} claros), cada um baseado em um tema consagrado, com contraste validado e ícones na paleta de cada tema.</p>
    <div class="install">
      <span class="cmd mono"><span id="cmd">ext install ${pkg.publisher}.${pkg.name}</span>
        <button class="btn small" type="button" data-copy-from="cmd" data-i18n="copy">Copiar</button></span>
      <a class="btn" href="${MARKETPLACE}" data-i18n="install">Instalar no VS Code</a>
    </div>
  </div>

  <div class="wrap">
    <div class="controls" role="search">
      <div class="seg" role="group" data-i18n-aria="filter">
        <button class="pill" type="button" data-filter="all" aria-pressed="true" data-i18n="all">Todos</button>
        <button class="pill" type="button" data-filter="dark" aria-pressed="false" data-i18n="dark">Escuros</button>
        <button class="pill" type="button" data-filter="light" aria-pressed="false" data-i18n="light">Claros</button>
      </div>
      <input class="search" id="q" type="search" autocomplete="off" data-i18n-placeholder="search" placeholder="Buscar por nome ou tema de origem…">
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

  <section id="italic">
    <div class="wrap">
      <h2 data-i18n="italicTitle">Itálico</h2>
      <p data-i18n="italicLead">Por padrão, comentários, doc blocks (com tags como @param) e this/self ficam em itálico. Escolha outra opção e cole o trecho no settings.json; ele vale para todos os temas Valinor e também entra no botão “Copiar settings.json” de cada tema.</p>
      <div class="seg" role="group" data-i18n-aria="italicTitle" style="margin-bottom:14px">
        <button class="pill" type="button" data-italic="default" aria-pressed="true" data-i18n="italicDefault">Padrão</button>
        <button class="pill" type="button" data-italic="none" aria-pressed="false" data-i18n="italicNone">Sem itálico</button>
        <button class="pill" type="button" data-italic="more" aria-pressed="false" data-i18n="italicMore">Mais itálico</button>
      </div>
      <pre class="snippet mono" id="italicsnippet"></pre>
      <button class="btn ghost small" type="button" id="italiccopy" data-copy-from="italicsnippet" data-i18n="copy">Copiar</button>
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
const I18N = {
  pt: {
    title: "Temas de cores inspirados em Tolkien",
    lead: "${total} temas para VS Code (${darkCount} escuros e ${total - darkCount} claros), cada um baseado em um tema consagrado, com contraste validado e ícones na paleta de cada tema.",
    copy: "Copiar", install: "Instalar no VS Code", marketplace: "Marketplace",
    all: "Todos", dark: "Escuros", light: "Claros", search: "Buscar por nome ou tema de origem…",
    count: (n) => n + (n === 1 ? " tema" : " temas"), empty: "Nenhum tema encontrado.",
    darkTag: "escuro", lightTag: "claro", basedOn: "Inspirado em", pairOf: "Par:",
    copySettings: "Copiar settings.json", copied: "Copiado!", colorCopied: (c) => "Cor " + c + " copiada",
    pairsTitle: "Pares claro/escuro",
    pairsLead: "Temas da mesma família nas versões escura e clara. Com a configuração abaixo, o VS Code troca de tema junto com o modo do sistema.",
    footer: "Licença MIT · Ícones e regras de token de terceiros mantêm suas licenças:",
    close: "Fechar", prev: "Anterior", next: "Próximo", mode: "Alternar modo claro/escuro", filter: "Filtrar por tipo",
    zoom: (n) => "Ampliar print de " + n,
    italicTitle: "Itálico",
    italicLead: "Por padrão, comentários, doc blocks (com tags como @param) e this/self ficam em itálico. Escolha outra opção e cole o trecho no settings.json; ele vale para todos os temas Valinor e também entra no botão “Copiar settings.json” de cada tema.",
    italicDefault: "Padrão", italicNone: "Sem itálico", italicMore: "Mais itálico",
    italicNothing: "// Padrão: nada a configurar.",
  },
  en: {
    title: "Tolkien-inspired color themes",
    lead: "${total} themes for VS Code (${darkCount} dark, ${total - darkCount} light), each based on a well-known theme, with validated contrast and icons in each theme's palette.",
    copy: "Copy", install: "Install in VS Code", marketplace: "Marketplace",
    all: "All", dark: "Dark", light: "Light", search: "Search by name or source theme…",
    count: (n) => n + (n === 1 ? " theme" : " themes"), empty: "No theme found.",
    darkTag: "dark", lightTag: "light", basedOn: "Based on", pairOf: "Pair:",
    copySettings: "Copy settings.json", copied: "Copied!", colorCopied: (c) => "Color " + c + " copied",
    pairsTitle: "Light/dark pairs",
    pairsLead: "Themes from the same family in dark and light versions. With the settings below, VS Code switches theme with your OS appearance.",
    footer: "MIT License · Third-party icons and token rules keep their own licenses:",
    close: "Close", prev: "Previous", next: "Next", mode: "Toggle light/dark mode", filter: "Filter by type",
    zoom: (n) => "Enlarge screenshot of " + n,
    italicTitle: "Italics",
    italicLead: "By default, comments, doc blocks (with tags such as @param) and this/self are italic. Pick another option and paste the snippet into settings.json; it applies to every Valinor theme and is also included in each theme's “Copy settings.json” button.",
    italicDefault: "Default", italicNone: "No italics", italicMore: "More italics",
    italicNothing: "// Default: nothing to configure.",
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
let italicMode = ["default", "none", "more"].includes(store.get("valinor-italic")) ? store.get("valinor-italic") : "default";
let visible = [];
let current = 0;
const t = (k, ...a) => { const v = I18N[lang][k]; return typeof v === "function" ? v(...a) : v; };

function settingsFor(theme) {
  return JSON.stringify({
    "workbench.colorTheme": theme.label,
    "workbench.iconTheme": "valinor-icons-minimal-" + theme.id,
    ...ITALIC[italicMode],
  }, null, 2);
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

function card(theme) {
  const shot = el("button", { class: "shot", type: "button", "aria-label": t("zoom", theme.name), onclick: () => openLightbox(theme.id) },
    el("img", { src: "previews/" + theme.id + ".png", alt: theme.label, loading: "lazy", width: "1600", height: "1000" }));

  const swatches = el("div", { class: "swatches" });
  for (const [name, color] of Object.entries(theme.colors)) {
    swatches.append(el("button", {
      class: "sw", type: "button", style: "background:" + color, title: name + " " + color, "aria-label": name + " " + color,
      onclick: () => copy(color, t("colorCopied", color)),
    }));
  }

  const actions = el("div", { class: "actions" },
    el("button", { class: "btn small", type: "button", onclick: () => copy(settingsFor(theme)) }, t("copySettings")));
  if (theme.pair && byId[theme.pair]) {
    const pair = byId[theme.pair];
    actions.append(el("span", { class: "upstream" }, t("pairOf") + " "),
      el("button", { class: "pairlink", type: "button", onclick: () => focusTheme(pair.id) }, pair.name));
  }

  return el("article", { class: "card", id: "t-" + theme.id },
    shot,
    el("div", { class: "body" },
      el("div", { class: "title" }, el("h3", {}, theme.name), el("span", { class: "tag" }, t(theme.type + "Tag"))),
      el("div", { class: "upstream" }, t("basedOn") + " " + theme.upstream),
      swatches,
      actions));
}

function render() {
  const q = $("#q").value.trim().toLowerCase();
  visible = THEMES.filter((th) =>
    (filter === "all" || th.type === filter) &&
    (!q || (th.name + " " + th.upstream + " " + th.id).toLowerCase().includes(q)));
  const grid = $("#grid");
  grid.replaceChildren(...(visible.length ? visible.map(card) : [el("div", { class: "empty" }, t("empty"))]));
  $("#count").textContent = t("count", visible.length);

  const pairs = THEMES.filter((th) => th.type === "dark" && th.pair && byId[th.pair]);
  $("#pairlist").replaceChildren(...pairs.map((dark) => {
    const light = byId[dark.pair];
    const half = (th) => el("button", { type: "button", "aria-label": t("zoom", th.name), onclick: () => openLightbox(th.id, true) },
      el("img", { src: "previews/" + th.id + ".png", alt: th.label, loading: "lazy" }), el("span", {}, th.name));
    return el("div", { class: "pair" }, half(dark), half(light));
  }));
  $("#autosnippet").textContent = autoSnippet();
  renderItalic();
}

function renderItalic() {
  document.querySelectorAll("[data-italic]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.italic === italicMode)));
  const empty = !Object.keys(ITALIC[italicMode]).length;
  $("#italicsnippet").textContent = empty ? t("italicNothing") : JSON.stringify(ITALIC[italicMode], null, 2);
  $("#italiccopy").hidden = empty;
}

function applyLang() {
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((n) => { n.placeholder = t(n.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-aria]").forEach((n) => { n.setAttribute("aria-label", t(n.dataset.i18nAria)); });
  $("#lang").textContent = lang === "pt" ? "EN" : "PT";
  render();
}

function focusTheme(id) {
  filter = "all"; $("#q").value = "";
  document.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === "all")));
  render();
  const target = document.getElementById("t-" + id);
  if (target) { target.scrollIntoView({ block: "center" }); target.querySelector(".shot").focus({ preventScroll: true }); }
}

let lbList = [];
function openLightbox(id, all) {
  lbList = all || !visible.length ? THEMES : visible;
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
document.querySelectorAll("[data-italic]").forEach((b) => b.addEventListener("click", () => {
  italicMode = b.dataset.italic;
  store.set("valinor-italic", italicMode);
  renderItalic();
}));
$("#lang").addEventListener("click", () => { lang = lang === "pt" ? "en" : "pt"; store.set("valinor-lang", lang); applyLang(); });
$("#mode").addEventListener("click", () => {
  const root = document.documentElement;
  const isDark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = isDark ? "light" : "dark";
  store.set("valinor-mode", root.dataset.theme);
});
const savedMode = store.get("valinor-mode");
if (savedMode) document.documentElement.dataset.theme = savedMode;
$("#lb-prev").addEventListener("click", () => step(-1));
$("#lb-next").addEventListener("click", () => step(1));
$("#lb-close").addEventListener("click", () => $("#lb").close());
$("#lb").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
document.addEventListener("keydown", (e) => {
  if (!$("#lb").open) return;
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

applyLang();
</script>
</body>
</html>
`;
}

function main() {
  const themes = loadThemes();
  const missing = themes.filter(({ id }) => !fs.existsSync(path.join(PREVIEWS, `${id}.png`)));
  if (missing.length) {
    console.error(`site: prints ausentes em assets/previews: ${missing.map((m) => m.id).join(", ")} (rode npm run screenshots)`);
    process.exit(1);
  }

  const arien = themes.find((t) => t.id === "arien").palette;
  const yavanna = themes.find((t) => t.id === "yavanna").palette;

  fs.emptyDirSync(OUT);
  fs.copySync(PREVIEWS, path.join(OUT, "previews"), { filter: (src) => !src.endsWith("overview.png") });
  fs.copySync(path.join(ROOT, "assets", "icon.png"), path.join(OUT, "icon.png"));
  const italic = { default: {}, none: italicSettings("none", themes), more: italicSettings("more", themes) };
  const page = html(themeData(themes), css(arien, yavanna), italic);

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
