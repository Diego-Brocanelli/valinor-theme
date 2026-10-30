![Valinor banner](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/valinor-banner.png)

# Valinor VSCode Theme

> 🇺🇸 [Read in English](https://github.com/Diego-Brocanelli/valinor-theme/blob/main/README.en.md)

Valinor reúne **28 temas de cores** (18 escuros e 10 claros), cada um inspirado em um tema consolidado e batizado com um nome do universo de Tolkien, além de temas de ícones que combinam com eles.

🖼️ **[Galeria interativa](https://diegobrocanelli.com.br/valinor-theme/)**: filtros, busca, pares claro/escuro e snippets de configuração.

![Todos os temas Valinor](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/overview.png)

## Índice

- [Instalação](#instalação)
- [Temas](#temas)
- [Ícones](#ícones)
- [Fontes](#fontes)
- [Desenvolvimento](#desenvolvimento)
- [Créditos](#créditos)
- [Licença](#licença)

---

## Instalação

Abra o gerenciador de extensões (`Ctrl+Shift+X` / `Cmd+Shift+X`), pesquise por **Valinor Theme** e clique em **Instalar**. Ou, pela Quick Open (`Ctrl+P` / `Cmd+P`):

```
ext install DiegoBrocanelli.valinor-theme
```

Depois, `Ctrl+K Ctrl+T` (ou `Cmd+K Cmd+T`) abre a lista de temas de cores.

---

## Temas

| Tema | Tipo | Inspirado em |
|---|---|---|
| Arien | escuro | Kanagawa |
| Arwen | escuro | Rosé Pine |
| Azaghâl | escuro | Nord (variante) |
| Bombur | escuro | Gruvbox |
| Celeborn | escuro | Catppuccin Mocha |
| Celebrimbor | escuro | Hackerman |
| Círdan | escuro | Osaka Jade |
| Durin | escuro | Nord |
| Eärendil | escuro | Tokyo Night |
| Fangorn | escuro | Everforest |
| Gimli | escuro | Tokyo Night Storm |
| Legolas | escuro | Night Owl |
| Lúthien | escuro | Ethereal |
| Morgoth | escuro | Matte Black |
| Shelob | escuro | Vantablack |
| Smaug | escuro | Ristretto |
| Thranduil | escuro | Nord (Polar Night profundo) |
| Ungoliant | escuro | Miasma |
| Elbereth | claro | Catppuccin Latte |
| Fëanor | claro | Quiet Light |
| Galadriel | claro | Solarized Light |
| Gandalf | claro | Tokyo Night Light |
| Glorfindel | claro | Night Owl Light |
| Goldberry | claro | Flexoki Light |
| Bilbo | claro | Gruvbox Light |
| Lothlórien | claro | Everforest Light |
| Nienna | claro | Rosé Pine Dawn |
| Yavanna | claro | Kanagawa Lotus |

### Pares claro/escuro

Sete temas escuros têm um par claro da mesma família. Com a configuração abaixo, o VS Code troca de tema sozinho quando o sistema alterna entre modo claro e escuro:

```jsonc
"window.autoDetectColorScheme": true,
"workbench.preferredDarkColorTheme": "Valinor Arwen",
"workbench.preferredLightColorTheme": "Valinor Nienna"
```

| Escuro | Claro | Família |
|---|---|---|
| Arien | Yavanna | Kanagawa |
| Arwen | Nienna | Rosé Pine |
| Bombur | Bilbo | Gruvbox |
| Celeborn | Elbereth | Catppuccin |
| Eärendil | Gandalf | Tokyo Night |
| Fangorn | Lothlórien | Everforest |
| Legolas | Glorfindel | Night Owl |

Todos os temas passam por uma validação automática de contraste (WCAG): texto do editor ≥ 4,5:1, comentários e números de linha ≥ 3:1, botões, badges e status bar ≥ 4,5:1, item selecionado ≥ 4,5:1.

### Itálico

Por padrão, todos os temas usam itálico em **comentários**, **doc blocks** (incluindo tags como `@param` e `@returns`, tipos e nomes dentro deles) e em **`this`/`self`**. O itálico do Markdown (`*texto*`) é sempre mantido.

Para mudar, copie um dos trechos abaixo para o seu `settings.json`. Eles valem para todos os temas Valinor (`"[Valinor*]"`). A versão sempre atualizada está na [galeria](https://diegobrocanelli.com.br/valinor-theme/#italic), e também sai de `npm run italic -- none` ou `npm run italic -- more`.

<details>
<summary><strong>Sem itálico</strong></summary>

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
<summary><strong>Mais itálico</strong> (keywords de controle, modificadores, parâmetros e atributos)</summary>

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

<details>
<summary><strong>Prévias de cada tema</strong></summary>

### Escuros

| | |
|---|---|
| ![Arien](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/arien.png) | ![Arwen](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/arwen.png) |
| ![Azaghâl](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/azaghal.png) | ![Bombur](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/bombur.png) |
| ![Celeborn](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/celeborn.png) | ![Celebrimbor](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/celebrimbor.png) |
| ![Círdan](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/cirdan.png) | ![Durin](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/durin.png) |
| ![Eärendil](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/earendil.png) | ![Fangorn](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/fangorn.png) |
| ![Gimli](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/gimli.png) | ![Legolas](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/legolas.png) |
| ![Lúthien](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/luthien.png) | ![Morgoth](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/morgoth.png) |
| ![Shelob](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/shelob.png) | ![Smaug](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/smaug.png) |
| ![Thranduil](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/thranduil.png) | ![Ungoliant](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/ungoliant.png) |

### Claros

| | |
|---|---|
| ![Elbereth](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/elbereth.png) | ![Fëanor](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/feanor.png) |
| ![Galadriel](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/galadriel.png) | ![Gandalf](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/gandalf.png) |
| ![Glorfindel](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/glorfindel.png) | ![Goldberry](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/goldberry.png) |
| ![Bilbo](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/bilbo.png) | ![Lothlórien](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/lothlorien.png) |
| ![Nienna](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/nienna.png) | ![Yavanna](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/previews/yavanna.png) |

</details>

---

## Ícones

### Ícones de arquivo

`Ctrl+Shift+P` / `Cmd+Shift+P` → **Preferences: File Icon Theme**:

- **Valinor Icons – \<tema\>**: um conjunto por tema de cores (28 no total). São os ícones Lucide coloridos com a paleta do tema: pastas na cor de destaque, linguagens e formatos nos tons do tema (JavaScript em amarelo, TypeScript em azul, Rust em laranja…) e arquivos genéricos em tom neutro. Escolha o que tem o mesmo nome do seu tema.
- **Valinor Icons Lucide**: ícones de linha do [Lucide](https://lucide.dev), um por tipo de arquivo, com versões para tema claro e escuro.
- **Valinor Icons Symbols**: ícones geométricos e limpos (Miguel Solorio).
- **Valinor Icons Mocha / Latte / Frappé / Macchiato**: Catppuccin Icons.

### Ícones de interface

`Ctrl+Shift+P` / `Cmd+Shift+P` → **Preferences: Product Icon Theme** → **Valinor Product Icons Fluent** (Fluent Design System).

---

## Fontes

As fontes **Zed Plex Mono** (recomendada para o editor) e **Zed Plex Sans** estão no [repositório](https://github.com/Diego-Brocanelli/valinor-theme/tree/main/fonts). Elas não vêm na extensão: baixe e instale no sistema.

```jsonc
"editor.fontFamily": "Zed Plex Mono",
"terminal.integrated.fontFamily": "Zed Plex Mono"
```

---

## Desenvolvimento

### Pré-requisitos

- Node.js 22 (veja `.nvmrc`) **ou** Docker + Make
- Git com suporte a submodules
- Opcional, para atualizar os prints: Hyprland, `grim`, ImageMagick e VS Code

### Primeiros passos

```bash
git clone --recurse-submodules git@github.com:Diego-Brocanelli/valinor-theme.git
cd valinor-theme
npm ci
npm run build
```

> Se clonou sem `--recurse-submodules`, rode `make init`.
> Com Docker: `make build && make sh` e, dentro do container, `npm ci && npm run build`.

Para testar, abra o projeto no VS Code e pressione `F5`: uma nova janela abre com a extensão carregada.

### Como os temas são feitos

Cada tema é um arquivo em `src/themes/<id>.yml` com uma **paleta semântica**:

```yaml
name: Valinor Arien
type: dark
upstream: Kanagawa
palette:
  bg: "#181616"       # editor
  bgAlt: "#252526"    # sidebar, abas, painéis
  fg: "#c5c9c5"       # texto
  accent: "#f4a620"   # destaque (status bar, botões, seleção)
  red: "#e46876"      # + orange, yellow, green, cyan, blue, magenta
syntax:               # cores da sintaxe (gera tokenColors e semanticTokenColors)
  comment: "#727169"
  keyword: "#f4a620"
  # ...
colors: {}            # opcional: sobrescreve chaves específicas
tokenColors: []       # opcional: regras TextMate extras
```

O `src/lib/template.js` deriva as mais de 300 cores da interface a partir da paleta: listas, abas, terminal (16 cores ANSI), Git, diff, diagnósticos, colchetes, minimap etc. Para mudar algo em todos os temas, edite o template. Para mudar um tema só, edite o `.yml` dele.

| Comando | O que faz |
|---|---|
| `npm run build` | Valida e gera `themes/`, os ícones por tema e Lucide e atualiza o `package.json` |
| `npm run vendor:lucide` | Copia de `lucide-static` os SVGs listados em `icons/lucide/map.json` |
| `npm run validate` | Mostra erros e avisos de contraste, cores inválidas e chaves desconhecidas |
| `npm run watch` | Refaz o build a cada alteração em `src/` |
| `npm run site` | Gera a galeria em `site/` (publicada no GitHub Pages pelo workflow `pages.yml`) |
| `npm run screenshots` | Captura prints reais do VS Code de cada tema em `assets/previews/` (Hyprland) |
| `npm run package` | Gera `bin/valinor-theme.vsix` |

### Atualizar ícones

```bash
make update-icons
```

> Os SVGs do Lucide ficam em `icons/lucide/src` (para trocar um ícone, edite `icons/lucide/map.json` e rode `npm run vendor:lucide`). O Catppuccin é atualizado manualmente, copiando os `theme.json` gerados pela extensão.

### Publicação

Crie uma tag com a mesma versão do `package.json` (por exemplo, `v2.26.0`). O workflow valida, empacota, cria a release no GitHub e publica o mesmo `.vsix` no Marketplace.

---

## Créditos

### Temas

- [Better Solarized](https://marketplace.visualstudio.com/items?itemName=ginfuru.ginfuru-better-solarized-dark-theme)
- [Catppuccin](https://github.com/catppuccin/vscode)
- [Everforest](https://github.com/sainnhe/everforest)
- [Flexoki](https://github.com/kepano/flexoki)
- [Gruvbox](https://github.com/morhetz/gruvbox)
- [Kanagawa](https://github.com/rebelot/kanagawa.nvim)
- [Miasma](https://github.com/xero/miasma.nvim)
- [Night Owl](https://marketplace.visualstudio.com/items?itemName=sdras.night-owl) (MIT): tokens adaptados no Glorfindel e no Legolas
- [Nord](https://marketplace.visualstudio.com/items?itemName=arcticicestudio.nord-visual-studio-code) (MIT): tokens adaptados no Durin
- [Omarchy](https://github.com/basecamp/omarchy): Ethereal, Hackerman, Matte Black, Osaka Jade, Ristretto, Vantablack
- [Quiet Light for VSC](https://marketplace.visualstudio.com/items?itemName=onecrayon.theme-quietlight-vsc)
- [Rosé Pine](https://marketplace.visualstudio.com/items?itemName=mvllow.rose-pine)
- [Solarized](https://marketplace.visualstudio.com/items?itemName=ryanolsonx.solarized)
- [Tokyo Night](https://marketplace.visualstudio.com/items?itemName=enkia.tokyo-night) (MIT): tokens adaptados no Gimli

### Ícones

- [Lucide](https://github.com/lucide-icons/lucide) (ISC): Lucide Contributors
- [Symbols](https://github.com/miguelsolorio/vscode-symbols) (MIT): Miguel Solorio
- [Fluent Icons](https://github.com/miguelsolorio/vscode-fluent-icons) (MIT): Miguel Solorio, com os [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons) da Microsoft
- [Catppuccin Icons](https://github.com/catppuccin/vscode-icons) (MIT): Catppuccin

Os ícones de pasta raiz (estrela de oito pontas) são arte própria do projeto.

O texto completo das licenças de terceiros está em [THIRD_PARTY_NOTICES.md](https://github.com/Diego-Brocanelli/valinor-theme/blob/main/THIRD_PARTY_NOTICES.md).

---

## Licença

Este projeto está licenciado sob a licença [MIT](https://github.com/Diego-Brocanelli/valinor-theme/blob/main/LICENSE).

## Autor

Diego Brocanelli, <diegod2@msn.com>
