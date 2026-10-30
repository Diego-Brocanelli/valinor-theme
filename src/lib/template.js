/**
 * template.js
 *
 * Gera as cores de interface, tokenColors e semanticTokenColors de um tema a
 * partir da sua paleta semântica (bloco `palette` / `syntax` do .yml).
 *
 * Hierarquia de estados em listas, menus e palette:
 *   hover  <  seleção inativa  <  seleção ativa  <  foco (contorno sólido)
 */

const { mix, alpha, over, isDark, contrast, ensureContrast, bestOn } = require("./color");

const HUES = ["red", "orange", "yellow", "green", "cyan", "blue", "magenta"];

/**
 * Completa a paleta com os valores derivados e corrige o que estiver abaixo
 * dos contrastes mínimos (linha, comentário, texto de destaque, diagnósticos).
 */
function resolvePalette(palette, type) {
  const p = { ...palette };
  const dark = type === "dark";

  for (const key of ["bg", "bgAlt", "fg", "accent", ...HUES]) {
    if (!p[key]) throw new Error(`palette.${key} é obrigatório`);
  }

  p.dark = dark;
  p.fgMuted = ensureContrast(p.fgMuted || mix(p.bg, p.fg, 0.7), p.bgAlt, 4.5, p.fg);
  p.cursor = p.cursor || p.accent;
  p.border = p.border || mix(p.bgAlt, p.fg, dark ? 0.12 : 0.14);
  p.lineNumber = ensureContrast(p.lineNumber || mix(p.bg, p.fg, 0.4), p.bg, 3, p.fg);
  // Destaque usado como texto (títulos, links, matches): 4.5:1 sobre a sidebar
  // e sobre o editor. Clareia em fundo escuro e escurece em fundo claro, o que
  // preserva o matiz melhor do que aproximar da cor do texto.
  const accentToward = dark ? "#ffffff" : "#000000";
  p.accentText = ensureContrast(p.accentText || p.accent, p.bgAlt, 4.5, accentToward);
  p.accentText = ensureContrast(p.accentText, p.bg, 4.5, accentToward);

  // Texto sobre o accent: prefere as cores do próprio tema, cai para preto/branco.
  if (!p.onAccent) {
    const own = bestOn(p.accent, [p.bg, p.fg]);
    p.onAccent = contrast(own, p.accent) >= 4.5 ? own : bestOn(p.accent, ["#000000", "#ffffff"]);
  }

  // Hover do botão: tom sólido do accent (nunca translúcido), afastando-se da
  // cor do texto para o contraste aumentar em vez de cair.
  p.accentHover = p.accentHover || mix(p.accent, isDark(p.onAccent) ? "#ffffff" : "#000000", 0.12);

  // Opacidade da seleção: começa em 32% e reduz até o texto manter 5.5:1
  // (accents claros, como cinza ou branco, deixariam o texto ilegível).
  p.selAlpha = 0.32;
  while (p.selAlpha > 0.12 && contrast(p.fg, over(alpha(p.accent, p.selAlpha), p.bgAlt)) < 5.5) {
    p.selAlpha -= 0.02;
  }

  // Status bar: "accent" (padrão, colorida) ou "muted" (mesma cor da sidebar).
  if (p.statusBar === "muted") {
    p.statusBg = p.bgAlt;
    p.statusFg = p.fg;
  } else {
    p.statusBg = p.accent;
    p.statusFg = p.onAccent;
  }

  // Versões das cores com contraste suficiente para ícones e textos de status.
  p.diag = {};
  for (const hue of HUES) p.diag[hue] = ensureContrast(p[hue], p.bg, 3);

  return p;
}

function ansi(p) {
  const bright = (c) => mix(c, p.dark ? "#ffffff" : "#000000", 0.15);
  const t = {};

  for (const [name, hue] of [["Red", "red"], ["Green", "green"], ["Yellow", "yellow"], ["Blue", "blue"], ["Magenta", "magenta"], ["Cyan", "cyan"]]) {
    t[`terminal.ansi${name}`] = p.diag[hue];
    t[`terminal.ansiBright${name}`] = bright(p.diag[hue]);
  }

  if (p.dark) {
    t["terminal.ansiBlack"] = mix(p.bg, p.fg, 0.2);
    t["terminal.ansiBrightBlack"] = p.fgMuted;
    t["terminal.ansiWhite"] = mix(p.fg, p.bg, 0.12);
    t["terminal.ansiBrightWhite"] = mix(p.fg, "#ffffff", 0.3);
  } else {
    t["terminal.ansiBlack"] = p.fg;
    t["terminal.ansiBrightBlack"] = p.fgMuted;
    t["terminal.ansiWhite"] = mix(p.bg, p.fg, 0.25);
    t["terminal.ansiBrightWhite"] = mix(p.bg, p.fg, 0.08);
  }

  return t;
}

function colors(p) {
  const { bg, bgAlt, fg, fgMuted, accent, accentText, onAccent, border, diag } = p;

  const hover = alpha(fg, 0.08);
  const selActive = alpha(accent, p.selAlpha);
  const selInactive = alpha(accent, p.selAlpha * 0.55);
  const shadow = p.dark ? "#00000059" : "#0000001f";
  const subtle = (t) => mix(bg, fg, t);

  return {
    // GENERAL
    foreground: fg,
    descriptionForeground: fgMuted,
    disabledForeground: alpha(fgMuted, 0.6),
    errorForeground: diag.red,
    focusBorder: accent,
    "icon.foreground": fgMuted,
    "selection.background": selActive,
    "widget.border": border,
    "widget.shadow": shadow,
    "sash.hoverBorder": accent,
    "progressBar.background": accent,
    "textLink.foreground": accentText,
    "textLink.activeForeground": accentText,
    "textBlockQuote.background": bgAlt,
    "textBlockQuote.border": accent,
    "textCodeBlock.background": bgAlt,
    "textPreformat.foreground": diag.orange,
    "textSeparator.foreground": border,

    // SCROLLBAR
    "scrollbar.shadow": shadow,
    "scrollbarSlider.background": alpha(fg, 0.12),
    "scrollbarSlider.hoverBackground": alpha(fg, 0.2),
    "scrollbarSlider.activeBackground": alpha(accent, 0.4),

    // ACTIVITY BAR
    "activityBar.background": bgAlt,
    "activityBar.foreground": fg,
    "activityBar.inactiveForeground": fgMuted,
    "activityBar.border": border,
    "activityBar.activeBorder": accent,
    "activityBarBadge.background": accent,
    "activityBarBadge.foreground": onAccent,

    // SIDE BAR
    "sideBar.background": bgAlt,
    "sideBar.foreground": fg,
    "sideBar.border": border,
    "sideBarTitle.foreground": accentText,
    "sideBarSectionHeader.background": bgAlt,
    "sideBarSectionHeader.foreground": accentText,
    "sideBarSectionHeader.border": border,

    // LISTS / TREES
    "list.hoverBackground": hover,
    "list.hoverForeground": fg,
    "list.inactiveSelectionBackground": selInactive,
    "list.inactiveSelectionForeground": fg,
    "list.activeSelectionBackground": selActive,
    "list.activeSelectionForeground": fg,
    "list.activeSelectionIconForeground": fg,
    "list.focusBackground": selActive,
    "list.focusForeground": fg,
    "list.focusOutline": accent,
    "list.focusAndSelectionOutline": accent,
    "list.highlightForeground": accentText,
    "list.focusHighlightForeground": accentText,
    "list.dropBackground": selInactive,
    "list.errorForeground": diag.red,
    "list.warningForeground": diag.yellow,
    "tree.indentGuidesStroke": subtle(0.25),
    "tree.inactiveIndentGuidesStroke": subtle(0.12),

    // STATUS BAR
    "statusBar.background": p.statusBg,
    "statusBar.foreground": p.statusFg,
    "statusBar.border": p.statusBar === "muted" ? border : p.statusBg,
    "statusBar.noFolderBackground": bgAlt,
    "statusBar.noFolderForeground": fg,
    "statusBar.debuggingBackground": p.orange,
    "statusBar.debuggingForeground": bestOn(p.orange, [bg, fg, "#000000", "#ffffff"]),
    "statusBarItem.hoverBackground": alpha(p.statusFg, 0.15),
    "statusBarItem.activeBackground": alpha(p.statusFg, 0.25),
    "statusBarItem.remoteBackground": p.statusBar === "muted" ? accent : alpha(onAccent, 0.18),
    "statusBarItem.remoteForeground": p.statusBar === "muted" ? onAccent : p.statusFg,
    "statusBarItem.errorBackground": p.red,
    "statusBarItem.errorForeground": bestOn(p.red, [bg, fg, "#000000", "#ffffff"]),

    // TITLE BAR / MENUS / COMMAND CENTER
    "titleBar.activeBackground": bgAlt,
    "titleBar.activeForeground": fg,
    "titleBar.inactiveBackground": bgAlt,
    "titleBar.inactiveForeground": fgMuted,
    "titleBar.border": border,
    "menu.background": bgAlt,
    "menu.foreground": fg,
    "menu.border": border,
    "menu.selectionBackground": selActive,
    "menu.selectionForeground": fg,
    "menu.separatorBackground": border,
    "menubar.selectionBackground": hover,
    "commandCenter.background": bg,
    "commandCenter.foreground": fg,
    "commandCenter.border": border,
    "commandCenter.activeBackground": hover,

    // BUTTONS / BADGES
    "button.background": accent,
    "button.foreground": onAccent,
    "button.hoverBackground": p.accentHover,
    "button.separator": alpha(onAccent, 0.4),
    "button.secondaryBackground": subtle(0.14),
    "button.secondaryForeground": fg,
    "button.secondaryHoverBackground": subtle(0.22),
    "badge.background": accent,
    "badge.foreground": onAccent,
    "extensionButton.prominentBackground": accent,
    "extensionButton.prominentForeground": onAccent,
    "extensionButton.prominentHoverBackground": p.accentHover,

    // INPUTS / FORMS
    "input.background": bg,
    "input.foreground": fg,
    "input.border": border,
    "input.placeholderForeground": fgMuted,
    "inputOption.activeBackground": alpha(accent, 0.3),
    "inputOption.activeForeground": fg,
    "inputOption.activeBorder": accent,
    "inputValidation.errorBackground": bgAlt,
    "inputValidation.errorBorder": diag.red,
    "inputValidation.warningBackground": bgAlt,
    "inputValidation.warningBorder": diag.yellow,
    "inputValidation.infoBackground": bgAlt,
    "inputValidation.infoBorder": diag.blue,
    "dropdown.background": bgAlt,
    "dropdown.listBackground": bgAlt,
    "dropdown.foreground": fg,
    "dropdown.border": border,
    "checkbox.background": bg,
    "checkbox.foreground": fg,
    "checkbox.border": border,
    "keybindingLabel.background": alpha(fg, 0.08),
    "keybindingLabel.foreground": fg,
    "keybindingLabel.border": border,
    "keybindingLabel.bottomBorder": border,

    // QUICK INPUT (Ctrl+P, Ctrl+Shift+P)
    "quickInput.background": bgAlt,
    "quickInput.foreground": fg,
    "quickInputTitle.background": bgAlt,
    "quickInputList.focusBackground": selActive,
    "quickInputList.focusForeground": fg,
    "quickInputList.focusIconForeground": fg,
    "pickerGroup.foreground": accentText,
    "pickerGroup.border": border,

    // PANEL (terminal, output, problems)
    "panel.background": bgAlt,
    "panel.border": border,
    "panelTitle.activeForeground": fg,
    "panelTitle.activeBorder": accent,
    "panelTitle.inactiveForeground": fgMuted,
    "panelSectionHeader.background": bgAlt,
    "problemsErrorIcon.foreground": diag.red,
    "problemsWarningIcon.foreground": diag.yellow,
    "problemsInfoIcon.foreground": diag.blue,

    // TERMINAL
    "terminal.background": bg,
    "terminal.foreground": fg,
    "terminal.border": border,
    "terminal.selectionBackground": selActive,
    "terminal.findMatchBackground": alpha(p.yellow, 0.4),
    "terminalCursor.foreground": p.cursor,
    "terminalCursor.background": bg,
    "terminalCommandDecoration.defaultBackground": fgMuted,
    "terminalCommandDecoration.successBackground": diag.green,
    "terminalCommandDecoration.errorBackground": diag.red,
    ...ansi(p),

    // TABS / EDITOR GROUPS
    "editorGroupHeader.tabsBackground": bgAlt,
    "editorGroupHeader.tabsBorder": border,
    "editorGroup.border": border,
    "editorGroup.dropBackground": selInactive,
    "tab.border": bgAlt,
    "tab.activeBackground": bg,
    "tab.activeForeground": fg,
    "tab.activeBorderTop": accent,
    "tab.inactiveBackground": bgAlt,
    "tab.inactiveForeground": fgMuted,
    "tab.hoverBackground": bg,
    "tab.hoverForeground": fg,
    "tab.unfocusedActiveForeground": fgMuted,
    "tab.unfocusedActiveBorderTop": alpha(accent, 0.5),
    "tab.activeModifiedBorder": accent,
    "tab.inactiveModifiedBorder": alpha(accent, 0.5),

    // BREADCRUMBS
    "breadcrumb.background": bg,
    "breadcrumb.foreground": fgMuted,
    "breadcrumb.focusForeground": fg,
    "breadcrumb.activeSelectionForeground": accentText,
    "breadcrumbPicker.background": bgAlt,

    // WIDGETS (find, suggest, hover, notifications, peek)
    "editorWidget.background": bgAlt,
    "editorWidget.foreground": fg,
    "editorWidget.border": border,
    "editorSuggestWidget.background": bgAlt,
    "editorSuggestWidget.border": border,
    "editorSuggestWidget.foreground": fg,
    "editorSuggestWidget.selectedBackground": selActive,
    "editorSuggestWidget.selectedForeground": fg,
    "editorSuggestWidget.highlightForeground": accentText,
    "editorSuggestWidget.focusHighlightForeground": accentText,
    "editorHoverWidget.background": bgAlt,
    "editorHoverWidget.foreground": fg,
    "editorHoverWidget.border": border,
    "editorHoverWidget.statusBarBackground": bgAlt,
    "debugToolBar.background": bgAlt,
    "debugToolBar.border": border,
    "notifications.background": bgAlt,
    "notifications.foreground": fg,
    "notifications.border": border,
    "notificationCenterHeader.background": bgAlt,
    "notificationToast.border": border,
    "notificationsErrorIcon.foreground": diag.red,
    "notificationsWarningIcon.foreground": diag.yellow,
    "notificationsInfoIcon.foreground": diag.blue,
    "peekView.border": accent,
    "peekViewTitle.background": bgAlt,
    "peekViewTitleLabel.foreground": fg,
    "peekViewTitleDescription.foreground": fgMuted,
    "peekViewEditor.background": mix(bg, bgAlt, 0.5),
    "peekViewEditor.matchHighlightBackground": alpha(p.yellow, 0.3),
    "peekViewResult.background": bgAlt,
    "peekViewResult.fileForeground": fg,
    "peekViewResult.lineForeground": fgMuted,
    "peekViewResult.selectionBackground": selActive,
    "peekViewResult.selectionForeground": fg,
    "peekViewResult.matchHighlightBackground": alpha(p.yellow, 0.3),

    // EDITOR
    "editor.background": bg,
    "editor.foreground": fg,
    "editorCursor.foreground": p.cursor,
    "editorCursor.background": bg,
    "editor.lineHighlightBackground": alpha(fg, 0.05),
    "editor.lineHighlightBorder": "#00000000",
    "editor.selectionBackground": alpha(accent, 0.3),
    "editor.inactiveSelectionBackground": alpha(accent, 0.15),
    "editor.selectionHighlightBackground": alpha(accent, 0.15),
    "editor.wordHighlightBackground": alpha(fg, 0.1),
    "editor.wordHighlightStrongBackground": alpha(p.blue, 0.22),
    "editor.findMatchBackground": alpha(p.yellow, 0.4),
    "editor.findMatchBorder": diag.yellow,
    "editor.findMatchHighlightBackground": alpha(p.yellow, 0.2),
    "editor.findRangeHighlightBackground": alpha(fg, 0.06),
    "editor.hoverHighlightBackground": alpha(p.blue, 0.15),
    "editor.rangeHighlightBackground": alpha(fg, 0.06),
    "editor.foldBackground": alpha(accent, 0.08),
    "editorLink.activeForeground": accentText,
    "editorWhitespace.foreground": subtle(0.2),
    "editorIndentGuide.background1": subtle(0.12),
    "editorIndentGuide.activeBackground1": subtle(0.32),
    "editorRuler.foreground": subtle(0.12),
    "editorLineNumber.foreground": p.lineNumber,
    "editorLineNumber.activeForeground": fg,
    "editorCodeLens.foreground": fgMuted,
    "editorBracketMatch.background": alpha(accent, 0.2),
    "editorBracketMatch.border": alpha(accent, 0.6),
    "editorInlayHint.background": alpha(fg, 0.06),
    "editorInlayHint.foreground": fgMuted,
    "editorGhostText.foreground": fgMuted,
    "editorLightBulb.foreground": diag.yellow,
    "editorStickyScroll.background": bg,
    "editorStickyScrollHover.background": bgAlt,
    "editorUnnecessaryCode.opacity": "#000000aa",

    // BRACKET PAIRS
    "editorBracketHighlight.foreground1": p.yellow,
    "editorBracketHighlight.foreground2": p.magenta,
    "editorBracketHighlight.foreground3": p.blue,
    "editorBracketHighlight.foreground4": p.green,
    "editorBracketHighlight.foreground5": p.orange,
    "editorBracketHighlight.foreground6": p.cyan,
    "editorBracketHighlight.unexpectedBracket.foreground": diag.red,

    // DIAGNOSTICS
    "editorError.foreground": diag.red,
    "editorWarning.foreground": diag.yellow,
    "editorInfo.foreground": diag.blue,
    "editorHint.foreground": diag.cyan,

    // GUTTER / OVERVIEW RULER / MINIMAP
    "editorGutter.background": bg,
    "editorGutter.addedBackground": diag.green,
    "editorGutter.modifiedBackground": diag.blue,
    "editorGutter.deletedBackground": diag.red,
    "editorGutter.foldingControlForeground": fgMuted,
    "editorOverviewRuler.border": border,
    "editorOverviewRuler.findMatchForeground": alpha(p.yellow, 0.6),
    "editorOverviewRuler.errorForeground": diag.red,
    "editorOverviewRuler.warningForeground": diag.yellow,
    "editorOverviewRuler.infoForeground": diag.blue,
    "editorOverviewRuler.addedForeground": diag.green,
    "editorOverviewRuler.modifiedForeground": diag.blue,
    "editorOverviewRuler.deletedForeground": diag.red,
    "minimap.background": bg,
    "minimap.selectionHighlight": alpha(accent, 0.5),
    "minimap.findMatchHighlight": p.yellow,
    "minimapSlider.background": alpha(fg, 0.08),
    "minimapSlider.hoverBackground": alpha(fg, 0.14),
    "minimapSlider.activeBackground": alpha(fg, 0.2),
    "minimapGutter.addedBackground": diag.green,
    "minimapGutter.modifiedBackground": diag.blue,
    "minimapGutter.deletedBackground": diag.red,

    // DIFF / MERGE
    "diffEditor.insertedTextBackground": alpha(p.green, 0.18),
    "diffEditor.removedTextBackground": alpha(p.red, 0.18),
    "diffEditor.insertedLineBackground": alpha(p.green, 0.1),
    "diffEditor.removedLineBackground": alpha(p.red, 0.1),
    "diffEditor.border": border,
    "diffEditor.diagonalFill": alpha(fg, 0.12),
    "merge.currentHeaderBackground": alpha(p.green, 0.4),
    "merge.currentContentBackground": alpha(p.green, 0.15),
    "merge.incomingHeaderBackground": alpha(p.blue, 0.4),
    "merge.incomingContentBackground": alpha(p.blue, 0.15),

    // GIT DECORATIONS (explorer / SCM)
    "gitDecoration.addedResourceForeground": diag.green,
    "gitDecoration.untrackedResourceForeground": diag.green,
    "gitDecoration.modifiedResourceForeground": diag.yellow,
    "gitDecoration.stageModifiedResourceForeground": diag.yellow,
    "gitDecoration.deletedResourceForeground": diag.red,
    "gitDecoration.stageDeletedResourceForeground": diag.red,
    "gitDecoration.renamedResourceForeground": diag.cyan,
    "gitDecoration.conflictingResourceForeground": diag.magenta,
    "gitDecoration.submoduleResourceForeground": diag.blue,
    "gitDecoration.ignoredResourceForeground": subtle(0.45),

    // MISC
    "settings.headerForeground": fg,
    "settings.modifiedItemIndicator": accent,
    "settings.focusedRowBackground": hover,
    "welcomePage.tileBackground": bgAlt,
    "debugIcon.breakpointForeground": diag.red,
    "testing.iconPassed": diag.green,
    "testing.iconFailed": diag.red,
    "charts.foreground": fg,
    "charts.red": p.red,
    "charts.orange": p.orange,
    "charts.yellow": p.yellow,
    "charts.green": p.green,
    "charts.blue": p.blue,
    "charts.purple": p.magenta,
  };
}

/** Completa os slots de sintaxe que não foram definidos no .yml. */
function resolveSyntax(syntax, p) {
  const s = { ...syntax };
  for (const key of ["comment", "keyword", "storage", "variable", "string", "number", "function", "type", "tag", "attribute"]) {
    if (!s[key]) throw new Error(`syntax.${key} é obrigatório`);
  }

  s.this = s.this || s.keyword;
  s.operator = s.operator || s.keyword;
  s.parameter = s.parameter || s.variable;
  s.property = s.property || s.variable;
  s.propertyName = s.propertyName || s.type; // chaves de JSON/CSS
  s.builtin = s.builtin || s.type;           // support.type / support.class
  s.constant = s.constant || s.number;
  s.escape = s.escape || s.number;
  s.regex = s.regex || s.string;
  s.heading = s.heading || s.function;
  s.link = s.link || p.accentText;
  return s;
}

const rule = (name, scope, foreground, fontStyle) => {
  const settings = {};
  if (foreground) settings.foreground = foreground;
  if (fontStyle !== undefined) settings.fontStyle = fontStyle;
  return { name, scope, settings };
};

/**
 * Regras TextMate base. Itálico só em comentários e em this/self: quando tudo
 * é itálico nada se destaca, e fontes sem itálico verdadeiro ficam ruins.
 */
function tokens(s, p) {
  const rules = [
    rule("Comments", ["comment", "punctuation.definition.comment", "string.comment"], s.comment),
    rule("Keywords", ["keyword", "keyword.control", "keyword.other", "keyword.operator.new", "keyword.operator.expression", "keyword.operator.logical.python"], s.keyword, ""),
    rule("Operators", ["keyword.operator", "punctuation.separator.key-value", "storage.type.function.arrow"], s.operator),
    rule("Storage", ["storage", "storage.type", "storage.modifier"], s.storage, ""),
    rule("Variables", ["variable", "meta.definition.variable.name", "support.variable", "entity.name.variable"], s.variable),
    rule("Parameters", ["variable.parameter", "meta.function.parameters variable", "entity.name.variable.parameter"], s.parameter, ""),
    rule("Properties", ["variable.other.property", "variable.other.object.property", "support.variable.property", "meta.object-literal.key", "variable.other.member"], s.property),
    rule("Property names (JSON, CSS, YAML)", ["support.type.property-name", "entity.name.tag.yaml", "meta.mapping.key string"], s.propertyName),
    rule("this / self", ["variable.language", "variable.language.this", "variable.language.self", "variable.language.super", "variable.language punctuation.definition.variable.php"], s.this),
    rule("Strings", ["string", "string.quoted", "punctuation.definition.string", "string.template"], s.string),
    rule("Escapes", ["constant.character.escape", "constant.other.placeholder"], s.escape),
    rule("Regex", ["string.regexp"], s.regex),
    rule("Numbers", ["constant", "constant.numeric", "keyword.other.unit"], s.number),
    rule("Language constants", ["constant.language", "support.constant"], s.constant),
    rule("Functions", ["entity.name.function", "support.function", "meta.function-call entity.name.function", "variable.function"], s.function),
    rule("Types & classes", ["entity.name.type", "entity.name.class", "entity.other.inherited-class", "entity.name.namespace", "entity.name.type.namespace"], s.type, ""),
    rule("Built-in types", ["support.type", "support.class", "entity.name.type.primitive"], s.builtin),
    rule("Tags", ["entity.name.tag", "punctuation.definition.tag"], s.tag),
    rule("Attributes", ["entity.other.attribute-name"], s.attribute, ""),
    rule("CSS selectors", ["entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css", "entity.name.tag.css"], s.attribute),
    rule("Decorators", ["meta.decorator", "entity.name.function.decorator", "punctuation.decorator"], s.function),
    rule("Markup heading", ["markup.heading", "markup.heading entity.name", "punctuation.definition.heading"], s.heading, "bold"),
    rule("Markup bold", ["markup.bold"], undefined, "bold"),
    rule("Markup italic", ["markup.italic"], undefined, "italic"),
    rule("Markup strikethrough", ["markup.strikethrough"], undefined, "strikethrough"),
    rule("Markup links", ["markup.underline.link", "string.other.link", "markup.link"], s.link),
    rule("Markup inline code", ["markup.inline.raw", "markup.fenced_code.block", "markup.raw"], s.string),
    rule("Markup quote", ["markup.quote"], s.comment, "italic"),
    rule("Markup lists", ["punctuation.definition.list.begin.markdown", "markup.list punctuation.definition"], s.keyword),
    rule("Diff inserted", ["markup.inserted", "meta.diff.header.to-file"], p.diag.green),
    rule("Diff deleted", ["markup.deleted", "meta.diff.header.from-file"], p.diag.red),
    rule("Diff changed", ["markup.changed"], p.diag.yellow),
    rule("Invalid", ["invalid", "invalid.illegal"], p.diag.red),
    rule("Deprecated", ["invalid.deprecated"], undefined, "strikethrough"),
  ];

  if (s.punctuation) {
    rules.splice(3, 0, rule("Punctuation", ["punctuation", "meta.brace"], s.punctuation));
  }

  return rules;
}

/**
 * Escopos em itálico em todos os temas: comentários, doc blocks completos
 * (inclusive tags como @param, tipos e nomes dentro deles) e this/self.
 * É a fonte única usada pela camada de estilo, pelo validador e pelos
 * snippets de "sem itálico" / "mais itálico" do README e da galeria.
 */
const ITALIC_SCOPES = [
  "comment",
  "punctuation.definition.comment",
  "comment.block.documentation",
  "comment.block.documentation storage",
  "comment.block.documentation keyword",
  "comment.block.documentation entity.name.type",
  "comment.block.documentation variable",
  "comment.block.documentation support",
  "comment.block.documentation punctuation",
  "storage.type.class.jsdoc",
  "entity.name.type.instance.jsdoc",
  "variable.other.jsdoc",
  "keyword.other.phpdoc",
  "keyword.other.documentation.javadoc",
  "variable.language.this",
  "variable.language.self",
  "variable.language.super",
];

/** Escopos extras do snippet "mais itálico" (opcional, para o usuário). */
const EXTRA_ITALIC_SCOPES = [
  "keyword.control",
  "storage.modifier",
  "storage.type",
  "variable.parameter",
  "entity.other.attribute-name",
  "entity.other.inherited-class",
];

/**
 * Camada de estilo aplicada por último em todos os temas. As regras só têm
 * fontStyle: o VS Code resolve cor e estilo separadamente, então cada tema
 * mantém as suas cores.
 */
function styleRules() {
  return [
    { name: "Valinor: itálico em comentários, doc blocks e this/self", scope: ITALIC_SCOPES, settings: { fontStyle: "italic" } },
    // Ênfase do Markdown tem significado próprio e fica fora dos snippets de itálico.
    { name: "Valinor: Markdown itálico", scope: ["markup.italic", "emphasis"], settings: { fontStyle: "italic" } },
    { name: "Valinor: Markdown negrito", scope: ["markup.bold", "strong"], settings: { fontStyle: "bold" } },
  ];
}

function semanticTokens(s) {
  return {
    namespace: s.type,
    type: s.type,
    class: s.type,
    enum: s.type,
    interface: s.type,
    struct: s.type,
    typeParameter: s.type,
    "class.defaultLibrary": s.builtin,
    "type.defaultLibrary": s.builtin,
    parameter: s.parameter,
    variable: s.variable,
    property: s.property,
    enumMember: s.constant,
    function: s.function,
    method: s.function,
    macro: s.function,
    decorator: s.function,
    keyword: s.keyword,
    selfKeyword: { foreground: s.this, italic: true },
    comment: s.comment,
    string: s.string,
    number: s.number,
    regexp: s.regex,
    operator: s.operator,
    "*.deprecated": { strikethrough: true },
  };
}

module.exports = { resolvePalette, resolveSyntax, colors, tokens, semanticTokens, styleRules, ITALIC_SCOPES, EXTRA_ITALIC_SCOPES };
