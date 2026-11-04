/**
 * gallery.js
 *
 * Dados da prévia ao vivo da galeria (src/site.js): uma janela de VS Code
 * desenhada em HTML com as cores, os tokens, os ícones de arquivo e os ícones
 * de interface de cada tema.
 *
 *   - ícones de arquivo: cada arquivo da árvore de exemplo é resolvido em cada
 *     conjunto (fileNames > fileExtensions > languageIds > padrão, como no VS
 *     Code) e só os SVGs usados são copiados para site/icons/
 *   - ícones de interface: as fontes vão para site/fonts/ e cada codicon vira
 *     [conjunto, code point]; o que o tema não define cai no codicon padrão
 *   - código: trechos marcados por categoria (⟦k|import⟧) e a cor/estilo de
 *     cada categoria resolvidos nas tokenColors do tema compilado
 */

const fs = require("fs-extra");
const path = require("path");
const { resolveStyle } = require("./scopes");
const { parse, luminance } = require("./color");
const { EXTRA_ITALIC_SCOPES } = require("./template");

const ROOT = path.join(__dirname, "..", "..");

// Árvore do explorer na ordem do VS Code (pastas primeiro, depois arquivos).
const TREE = [
  { name: "valinor", kind: "root", depth: 0 },
  { name: ".github", kind: "folder", depth: 1 },
  { name: "docs", kind: "folder", depth: 1 },
  { name: "node_modules", kind: "folder", depth: 1 },
  { name: "src", kind: "folder", depth: 1, open: true },
  { name: "components", kind: "folder", depth: 2 },
  { name: "App.tsx", lang: "typescriptreact", depth: 2 },
  { name: "index.test.ts", lang: "typescript", depth: 2 },
  { name: "index.ts", lang: "typescript", depth: 2 },
  { name: "styles.css", lang: "css", depth: 2 },
  { name: ".env", lang: "dotenv", depth: 1 },
  { name: "Dockerfile", lang: "dockerfile", depth: 1 },
  { name: "index.php", lang: "php", depth: 1 },
  { name: "lib.rs", lang: "rust", depth: 1 },
  { name: "LICENSE", lang: "plaintext", depth: 1 },
  { name: "main.go", lang: "go", depth: 1 },
  { name: "main.py", lang: "python", depth: 1 },
  { name: "Makefile", lang: "makefile", depth: 1 },
  { name: "package.json", lang: "json", depth: 1 },
  { name: "README.md", lang: "markdown", depth: 1 },
  { name: "tsconfig.json", lang: "jsonc", depth: 1 },
];

// Conjuntos de ícones de arquivo: tema de ícones e id no settings.json por tema de cores.
const ICON_SETS = [
  { key: "themed", file: (id) => `icons/themed/${id}/theme.json`, setting: (id) => `valinor-icons-minimal-${id}` },
  { key: "logos", file: (id) => `icons/logos/${id}/theme.json`, setting: (id) => `valinor-icons-logos-${id}` },
  { key: "lucide", file: () => "icons/lucide/theme.json", setting: () => "valinor-icons-zed" },
  { key: "material", file: () => "icons/material-dist/theme.json", setting: () => "valinor-icons-material" },
  { key: "symbols", file: () => "icons/symbols-dist/symbol-icon-theme.json", setting: () => "valinor-icons-symbols" },
  {
    key: "catppuccin",
    file: (id, type) => `icons/catppuccin/${type === "light" ? "latte" : "mocha"}/theme.json`,
    setting: (id, type) => (type === "light" ? "valinor-icons-latte" : "valinor-icons-mocha"),
  },
];

// Ícones de interface. "default" são os codicons do próprio VS Code.
const PRODUCT_SETS = [
  { key: "default", setting: null, font: "node_modules/@vscode/codicons/dist/codicon.ttf" },
  { key: "lucide", setting: "valinor-product-icons-lucide", theme: "icons/lucide/product/theme.json" },
  { key: "fluent", setting: "valinor-product-icons-fluent", theme: "icons/fluent/theme/fluent-icons.json" },
  { key: "carbon", setting: "valinor-product-icons-carbon", theme: "icons/carbon/icons-carbon.json" },
  {
    key: "material",
    setting: "valinor-product-icons-material",
    theme: "icons/material-product/theme/material.product-icon-theme.json",
  },
];

// Codicons usados na janela de exemplo (activity bar, abas e status bar).
const GLYPHS = [
  "files", "search", "source-control", "debug-alt", "extensions", "account", "settings-gear",
  "close", "git-branch", "error", "warning", "bell", "chevron-right", "chevron-down", "ellipsis", "split-horizontal",
];

// Cores de interface usadas na janela de exemplo.
const UI_KEYS = [
  "editor.background", "editor.foreground", "editor.lineHighlightBackground",
  "editorLineNumber.foreground", "editorLineNumber.activeForeground",
  "sideBar.background", "sideBar.foreground", "sideBar.border", "sideBarTitle.foreground",
  "activityBar.background", "activityBar.foreground", "activityBar.inactiveForeground", "activityBar.activeBorder",
  "editorGroupHeader.tabsBackground", "tab.activeBackground", "tab.activeForeground", "tab.activeBorderTop",
  "tab.inactiveBackground", "tab.inactiveForeground", "tab.border",
  "list.activeSelectionBackground", "list.activeSelectionForeground", "list.hoverBackground",
  "statusBar.background", "statusBar.foreground", "editorGroup.border",
];

// Categoria do trecho de código → escopo TextMate usado para achar a cor.
const TOKEN_SCOPES = {
  c: "comment.line",
  k: "keyword.control",
  s: "storage.type",
  str: "string.quoted.double",
  n: "constant.numeric",
  f: "entity.name.function",
  t: "entity.name.type",
  v: "variable.other.readwrite",
  p: "variable.other.property",
  th: "variable.language.this",
  pa: "variable.parameter",
  tag: "entity.name.tag",
  cst: "constant.language",
};

// Categorias que ganham itálico na opção "Mais itálico" (ver EXTRA_ITALIC_SCOPES).
const MORE_ITALIC = Object.keys(TOKEN_SCOPES).filter((cat) =>
  EXTRA_ITALIC_SCOPES.some((scope) => TOKEN_SCOPES[cat] === scope || TOKEN_SCOPES[cat].startsWith(`${scope}.`))
);

// Trechos de exemplo, um por arquivo da árvore. ⟦categoria|texto⟧ marca um token.
const SNIPPETS = {
  "index.ts": `⟦c|// Os Anéis de Poder⟧
⟦k|import⟧ { ⟦t|Ring⟧ } ⟦k|from⟧ ⟦str|"./ring"⟧;

⟦k|export⟧ ⟦s|class⟧ ⟦t|Forge⟧ {
  ⟦s|private⟧ ⟦p|rings⟧: ⟦t|Ring⟧[] = [];

  ⟦f|craft⟧(⟦pa|name⟧: ⟦t|string⟧, ⟦pa|power⟧ = ⟦n|9⟧): ⟦t|Ring⟧ {
    ⟦s|const⟧ ⟦v|ring⟧ = ⟦k|new⟧ ⟦t|Ring⟧(⟦pa|name⟧, ⟦pa|power⟧);
    ⟦th|this⟧.⟦p|rings⟧.⟦f|push⟧(⟦v|ring⟧);
    ⟦k|return⟧ ⟦v|ring⟧;
  }
}`,
  "main.py": `⟦c|# A Sociedade do Anel⟧
⟦k|from⟧ dataclasses ⟦k|import⟧ ⟦f|dataclass⟧


⟦f|@dataclass⟧
⟦s|class⟧ ⟦t|Hobbit⟧:
    ⟦p|name⟧: ⟦t|str⟧
    ⟦p|age⟧: ⟦t|int⟧ = ⟦n|33⟧

    ⟦s|def⟧ ⟦f|greet⟧(⟦th|self⟧) -> ⟦t|str⟧:
        ⟦k|return⟧ ⟦str|f"Olá, {⟧⟦th|self⟧.⟦p|name⟧⟦str|}!"⟧`,
  "lib.rs": `⟦c|/// Um dos três Silmarils.⟧
⟦k|pub⟧ ⟦s|struct⟧ ⟦t|Silmaril⟧ {
    ⟦k|pub⟧ ⟦p|light⟧: ⟦t|u32⟧,
}

⟦s|impl⟧ ⟦t|Silmaril⟧ {
    ⟦k|pub⟧ ⟦s|fn⟧ ⟦f|shine⟧(&⟦th|self⟧) -> ⟦t|String⟧ {
        ⟦f|format!⟧(⟦str|"brilha com {} lumens"⟧, ⟦th|self⟧.⟦p|light⟧ * ⟦n|3⟧)
    }
}`,
  "index.php": `⟦tag|<?php⟧

⟦k|namespace⟧ ⟦t|Valinor⟧;

⟦c|/** Guarda a porta de Erebor. */⟧
⟦s|final class⟧ ⟦t|Erebor⟧
{
    ⟦s|public function⟧ ⟦f|open⟧(⟦t|string⟧ ⟦pa|$word⟧): ⟦t|bool⟧
    {
        ⟦k|return⟧ ⟦pa|$word⟧ === ⟦str|'mellon'⟧ && ⟦cst|true⟧;
    }
}`,
  "main.go": `⟦k|package⟧ main

⟦k|import⟧ ⟦str|"fmt"⟧

⟦c|// Ent cuida das árvores de Fangorn.⟧
⟦s|type⟧ ⟦t|Ent⟧ ⟦s|struct⟧ {
	⟦p|Name⟧  ⟦t|string⟧
	⟦p|Trees⟧ ⟦t|int⟧
}

⟦s|func⟧ (⟦pa|e⟧ ⟦t|Ent⟧) ⟦f|Speak⟧() {
	⟦v|fmt⟧.⟦f|Printf⟧(⟦str|"%s cuida de %d árvores"⟧, ⟦pa|e⟧.⟦p|Name⟧, ⟦n|42⟧)
}`,
};

/** "⟦k|import⟧ x" → linhas de [categoria, texto] ("" = texto comum). */
function tokenize(source) {
  return source.split("\n").map((line) => {
    const out = [];
    const re = /⟦(\w+)\|([^⟧]*)⟧/g;
    let last = 0;
    for (let m; (m = re.exec(line)); last = re.lastIndex) {
      if (m.index > last) out.push(["", line.slice(last, m.index)]);
      if (!TOKEN_SCOPES[m[1]]) throw new Error(`gallery: categoria desconhecida "${m[1]}" em ${line}`);
      out.push([m[1], m[2]]);
    }
    if (last < line.length) out.push(["", line.slice(last)]);
    return out;
  });
}

const lowerKeys = (obj = {}) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]));

/** Função que devolve o id do ícone de cada entrada da árvore (regras do VS Code). */
function iconResolver(theme, light) {
  const variant = light && theme.light ? theme.light : {};
  const layer = (key) => ({ ...lowerKeys(theme[key]), ...lowerKeys(variant[key]) });
  const pick = (key) => variant[key] || theme[key];
  const fileNames = layer("fileNames");
  const fileExtensions = layer("fileExtensions");
  const languageIds = { ...(theme.languageIds || {}), ...(variant.languageIds || {}) };
  const folderNames = layer("folderNames");
  const folderNamesExpanded = layer("folderNamesExpanded");

  return (entry) => {
    const name = entry.name.toLowerCase();
    // Sem a variante aberta, o VS Code usa a pasta comum (ou a pasta com nome).
    if (entry.kind === "root") {
      return pick("rootFolderExpanded") || pick("folderExpanded") || pick("rootFolder") || pick("folder");
    }
    if (entry.kind === "folder") {
      if (!entry.open) return folderNames[name] || pick("folder");
      return folderNamesExpanded[name] || pick("folderExpanded") || folderNames[name] || pick("folder");
    }
    if (fileNames[name]) return fileNames[name];
    const parts = name.split(".");
    for (let i = 1; i < parts.length; i++) {
      const ext = parts.slice(i).join(".");
      if (fileExtensions[ext]) return fileExtensions[ext];
    }
    return languageIds[entry.lang] || pick("file");
  };
}

/**
 * Resolve a árvore em cada conjunto e tema e copia os SVGs usados para
 * <out>/icons/ (mesmos caminhos de icons/). Temas com a mesma lista (depois de
 * trocar o id do tema por {id}) são agrupados para a página ficar leve.
 */
function iconSets(themes, out) {
  const sets = {};
  const missing = [];

  for (const set of ICON_SETS) {
    const groups = new Map();
    const settings = {};
    let ok = true;

    for (const { id, theme } of themes) {
      const file = path.join(ROOT, set.file(id, theme.type));
      if (!fs.existsSync(file)) {
        ok = false;
        break;
      }
      const iconTheme = fs.readJsonSync(file);
      const resolve = iconResolver(iconTheme, theme.type === "light");
      const list = TREE.map((entry) => {
        const def = iconTheme.iconDefinitions[resolve(entry)];
        if (!def || !def.iconPath) return null;
        const source = path.resolve(path.dirname(file), def.iconPath);
        const rel = path.relative(path.join(ROOT, "icons"), source).split(path.sep).join("/");
        fs.copySync(source, path.join(out, "icons", rel));
        return `icons/${rel}`.replaceAll(`/${id}/`, "/{id}/");
      });

      const key = JSON.stringify(list);
      if (!groups.has(key)) groups.set(key, { themes: [], list, hidesArrows: Boolean(iconTheme.hidesExplorerArrows) });
      groups.get(key).themes.push(id);
      settings[id] = set.setting(id, theme.type);
    }

    if (!ok) {
      missing.push(set.key);
      continue;
    }
    sets[set.key] = { groups: [...groups.values()], settings };
  }
  return { sets, missing };
}

/** Fontes dos ícones de interface e o code point de cada codicon usado. */
function productSets(out) {
  const codicons = fs.readJsonSync(path.join(ROOT, "node_modules/@vscode/codicons/src/template/mapping.json"));
  const sets = {};
  const missing = [];

  for (const set of PRODUCT_SETS) {
    let font = set.font && path.join(ROOT, set.font);
    let defs = {};
    if (set.theme) {
      const file = path.join(ROOT, set.theme);
      if (!fs.existsSync(file)) {
        missing.push(set.key);
        continue;
      }
      const theme = fs.readJsonSync(file);
      font = path.resolve(path.dirname(file), theme.fonts[0].src[0].path);
      defs = theme.iconDefinitions;
    }

    const ext = path.extname(font).slice(1);
    fs.copySync(font, path.join(out, "fonts", `${set.key}.${ext}`));
    const glyphs = {};
    for (const id of GLYPHS) {
      const char = defs[id] && defs[id].fontCharacter;
      glyphs[id] = char ? [set.key, parseInt(char.replace(/^\\/, ""), 16)] : ["default", codicons[id]];
    }
    sets[set.key] = {
      setting: set.setting,
      font: `fonts/${set.key}.${ext}`,
      format: ext === "ttf" ? "truetype" : ext,
      glyphs,
    };
  }
  return { sets, missing };
}

/** Cor e itálico de cada categoria de token no tema. */
function tokenStyles(theme) {
  const styles = {};
  for (const [cat, scope] of Object.entries(TOKEN_SCOPES)) {
    const { foreground, fontStyle = "" } = resolveStyle(theme.tokenColors, ["source", scope]);
    styles[cat] = [foreground || theme.colors["editor.foreground"], fontStyle.includes("italic") ? 1 : 0];
  }
  return styles;
}

/** Cores de interface da janela de exemplo. */
function uiColors(theme) {
  return Object.fromEntries(UI_KEYS.map((key) => [key, theme.colors[key] || null]));
}

// Temas do Omarchy formam uma família só; os demais perdem o sufixo da variante
// (Quiet Light é o nome do tema, não uma variante).
const OMARCHY = ["Hackerman", "Osaka Jade", "Ethereal", "Matte Black", "Vantablack", "Ristretto"];
function familyOf(upstream = "") {
  if (OMARCHY.includes(upstream)) return "Omarchy";
  if (upstream === "Quiet Light") return upstream;
  return upstream.replace(/\s*\(.*\)$/, "").replace(/\s+(Light|Dawn|Lotus|Storm|Mocha|Latte)$/, "");
}

/** Matiz (0–360) da cor; -1 para cinzas, que vão para o fim da ordenação. */
function hueOf(hex) {
  const { r, g, b } = parse(hex);
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;
  if (d < 0.08) return -1;
  let h;
  if (max === R) h = ((G - B) / d) % 6;
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  return Math.round((h * 60 + 360) % 360);
}

module.exports = {
  TREE,
  SNIPPETS: Object.fromEntries(Object.entries(SNIPPETS).map(([file, src]) => [file, tokenize(src)])),
  MORE_ITALIC,
  iconSets,
  productSets,
  tokenStyles,
  uiColors,
  familyOf,
  hueOf,
  luminance,
};
