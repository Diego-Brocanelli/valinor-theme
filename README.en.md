![Valinor banner](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/valinor-banner.png)

# Valinor VSCode Theme

> 🇧🇷 [Leia em português](https://github.com/Diego-Brocanelli/valinor-theme/blob/main/README.md)

Valinor brings together **28 color themes** (18 dark, 10 light). Each one is based on a well-established theme and named after a character or place from Tolkien's world, and each comes with matching file icon themes.

🖼️ **[Interactive gallery](https://diegobrocanelli.com.br/valinor-theme/)**: filters, search, light/dark pairs and settings snippets.

![All Valinor themes](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/overview.png)

## Install

Open the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`), search for **Valinor Theme** and click **Install**. Or, from Quick Open (`Ctrl+P` / `Cmd+P`):

```
ext install DiegoBrocanelli.valinor-theme
```

Then press `Ctrl+K Ctrl+T` (`Cmd+K Cmd+T`) to pick a color theme.

## Themes

| Theme | Type | Based on |
|---|---|---|
| Arien | dark | Kanagawa |
| Arwen | dark | Rosé Pine |
| Azaghâl | dark | Nord (variant) |
| Bombur | dark | Gruvbox |
| Celeborn | dark | Catppuccin Mocha |
| Celebrimbor | dark | Hackerman |
| Círdan | dark | Osaka Jade |
| Durin | dark | Nord |
| Eärendil | dark | Tokyo Night |
| Fangorn | dark | Everforest |
| Gimli | dark | Tokyo Night Storm |
| Legolas | dark | Night Owl |
| Lúthien | dark | Ethereal |
| Morgoth | dark | Matte Black |
| Shelob | dark | Vantablack |
| Smaug | dark | Ristretto |
| Thranduil | dark | Nord (deep Polar Night) |
| Ungoliant | dark | Miasma |
| Elbereth | light | Catppuccin Latte |
| Fëanor | light | Quiet Light |
| Galadriel | light | Solarized Light |
| Gandalf | light | Tokyo Night Light |
| Glorfindel | light | Night Owl Light |
| Goldberry | light | Flexoki Light |
| Bilbo | light | Gruvbox Light |
| Lothlórien | light | Everforest Light |
| Nienna | light | Rosé Pine Dawn |
| Yavanna | light | Kanagawa Lotus |

Light/dark pairs: Arien/Yavanna (Kanagawa), Arwen/Nienna (Rosé Pine), Bombur/Bilbo (Gruvbox), Celeborn/Elbereth (Catppuccin), Eärendil/Gandalf (Tokyo Night), Fangorn/Lothlórien (Everforest), Legolas/Glorfindel (Night Owl). Use them with `window.autoDetectColorScheme` + `workbench.preferredDarkColorTheme` / `workbench.preferredLightColorTheme` to follow the OS appearance.

Every theme is checked automatically for WCAG contrast. The minimums are: editor text 4.5:1, comments and line numbers 3:1, buttons, badges and status bar 4.5:1, selected list items 4.5:1.

### Italics

By default, every theme uses italics for **comments**, **doc blocks** (including tags such as `@param` and `@returns`, and the types and names inside them) and **`this`/`self`**. Markdown italics (`*text*`) are always kept.

To change it, paste one of the snippets below into your `settings.json`. They apply to every Valinor theme (`"[Valinor*]"`). The [gallery](https://diegobrocanelli.com.br/valinor-theme/#italic) always has the current version, and `npm run italic -- none` or `npm run italic -- more` prints it too.

<details>
<summary><strong>No italics</strong></summary>

```json
{
  "editor.tokenColorCustomizations": {
    "[Valinor*]": {
      "textMateRules": [
        {
          "scope": [
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
            "keyword.control",
            "storage.modifier",
            "storage.type",
            "variable.parameter",
            "entity.other.attribute-name",
            "entity.other.inherited-class",
            "markup.quote",
            "keyword.expressions-and-types.swift",
            "keyword.other.this",
            "variable.language",
            "variable.language punctuation.definition.variable.php",
            "variable.other.readwrite.instance.ruby",
            "variable.parameter.function.language.special",
            "punctuation.definition.variable.php",
            "keyword.control.php",
            "variable.language.php",
            "unused.comment",
            "wildcard.comment",
            "entity.name.variable.parameter",
            "meta.at-rule.function variable",
            "meta.at-rule.mixin variable",
            "meta.function.arguments variable.other.php",
            "meta.selectionset.graphql meta.arguments.graphql variable.arguments.graphql",
            "punctuation.definition.keyword",
            "keyword.control.new",
            "keyword.operator.new",
            "text.html.basic constant.other.inline-data",
            "source.css.scss variable.interpolation",
            "text.xml string.unquoted.cdata",
            "text.xml string.unquoted.cdata punctuation.definition.string",
            "meta.var.expr storage.type",
            "keyword.control.flow",
            "keyword.control.return",
            "meta.directive.vue punctuation.separator.key-value.html",
            "meta.directive.vue entity.other.attribute-name.html",
            "tag.decorator.js entity.name.tag.js",
            "tag.decorator.js punctuation.definition.tag.js",
            "string.quoted.docstring.multi",
            "string.quoted.docstring.multi.python punctuation.definition.string.begin",
            "string.quoted.docstring.multi.python punctuation.definition.string.end",
            "string.quoted.docstring.multi.python constant.character.escape",
            "markup.changed",
            "meta.diff.header.git",
            "meta.diff.header.from-file",
            "meta.diff.header.to-file",
            "markup.deleted.diff",
            "markup.inserted.diff",
            "punctuation.accessor",
            "keyword",
            "storage",
            "meta.var.expr",
            "meta.class meta.method.declaration meta.var.expr storage.type.js",
            "storage.type.property.js",
            "storage.type.property.ts",
            "storage.type.property.tsx",
            "entity.name.function",
            "keyword.operator.relational",
            "meta.delimiter.period",
            "meta.selector",
            "entity.name.tag.doctype",
            "meta.tag.sgml.doctype",
            "variable.other.object.property",
            "keyword.operator.comparison",
            "keyword.control.flow.js",
            "keyword.control.flow.ts",
            "keyword.control.flow.tsx",
            "keyword.control.ruby",
            "keyword.control.module.ruby",
            "keyword.control.class.ruby",
            "keyword.control.def.ruby",
            "keyword.control.loop.js",
            "keyword.control.loop.ts",
            "keyword.control.import.js",
            "keyword.control.import.ts",
            "keyword.control.import.tsx",
            "keyword.control.from.js",
            "keyword.control.from.ts",
            "keyword.control.from.tsx",
            "keyword.operator.instanceof.js",
            "keyword.operator.expression.instanceof.ts",
            "keyword.operator.expression.instanceof.tsx",
            "italic",
            "quote",
            "source.elixir .punctuation.binary.elixir",
            "source.go keyword.package.go",
            "source.go keyword.import.go",
            "source.go keyword.function.go",
            "source.go keyword.type.go",
            "source.go keyword.struct.go",
            "source.go keyword.interface.go",
            "source.go keyword.const.go",
            "source.go keyword.var.go",
            "source.go keyword.map.go",
            "source.go keyword.channel.go",
            "source.go keyword.control.go",
            "meta.tag.sgml.doctype.html",
            "variable.other.object.js",
            "variable.language.this.js"
          ],
          "settings": {
            "fontStyle": ""
          }
        }
      ]
    }
  },
  "editor.semanticTokenColorCustomizations": {
    "[Valinor*]": {
      "rules": {
        "selfKeyword": {
          "italic": false
        }
      }
    }
  }
}
```

</details>

<details>
<summary><strong>More italics</strong> (control keywords, modifiers, parameters and attributes)</summary>

```json
{
  "editor.tokenColorCustomizations": {
    "[Valinor*]": {
      "textMateRules": [
        {
          "scope": [
            "keyword.control",
            "storage.modifier",
            "storage.type",
            "variable.parameter",
            "entity.other.attribute-name",
            "entity.other.inherited-class",
            "source.cpp keyword.control.directive.conditional",
            "source.c keyword.control.directive.conditional",
            "keyword.control.flow.block-scalar.literal",
            "keyword.control.flow.python",
            "storage.type.function.arrow.js",
            "variable.parameter.function",
            "keyword.control.conditional.js",
            "keyword.control.conditional.ts",
            "keyword.control.switch.js",
            "keyword.control.switch.ts",
            "meta.class meta.method.declaration meta.var.expr storage.type.js",
            "storage.type.property.js",
            "storage.type.property.ts",
            "storage.type.property.tsx",
            "keyword.control.flow.js",
            "keyword.control.flow.ts",
            "keyword.control.flow.tsx",
            "keyword.control.ruby",
            "keyword.control.def.ruby",
            "keyword.control.loop.js",
            "keyword.control.loop.ts",
            "keyword.control.import.js",
            "keyword.control.import.ts",
            "keyword.control.import.tsx",
            "keyword.control.from.js",
            "keyword.control.from.ts",
            "keyword.control.from.tsx"
          ],
          "settings": {
            "fontStyle": "italic"
          }
        }
      ]
    }
  }
}
```

</details>

## Icons

- **File Icon Theme**: *Valinor Icons – \<theme\>* (Lucide icons colored with each theme's palette, one set per color theme), *Valinor Icons Lucide*, *Valinor Icons Symbols* and Catppuccin *Mocha / Latte / Frappé / Macchiato*.
- **Product Icon Theme**: *Valinor Product Icons Fluent*.

## Fonts

**Zed Plex Mono** and **Zed Plex Sans** are available in the [repository](https://github.com/Diego-Brocanelli/valinor-theme/tree/main/fonts). They are not bundled with the extension, so you need to install them yourself.

## Development

```bash
git clone --recurse-submodules git@github.com:Diego-Brocanelli/valinor-theme.git
cd valinor-theme
npm ci
npm run build      # validate + generate themes/ and icons
npm run validate   # contrast / key / color report
npm run screenshots # real VS Code screenshots in assets/previews (Hyprland + grim + ImageMagick)
```

Each theme lives in `src/themes/<id>.yml` and is defined as a semantic palette (`bg`, `bgAlt`, `fg`, `accent`, 7 hues and syntax roles). `src/lib/template.js` turns that palette into 300+ workbench colors, token rules and semantic token colors.

## License

[MIT](https://github.com/Diego-Brocanelli/valinor-theme/blob/main/LICENSE). Author: Diego Brocanelli.

Third-party icons and adapted token rules (Lucide, Catppuccin, Symbols, Fluent, Nord, Tokyo Night, Night Owl) keep their own licenses; see [THIRD_PARTY_NOTICES.md](https://github.com/Diego-Brocanelli/valinor-theme/blob/main/THIRD_PARTY_NOTICES.md).
