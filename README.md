![Valinor banner](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/valinor-banner.png)

# Valinor VSCode Theme

> 🇺🇸 [Read in English](https://github.com/Diego-Brocanelli/valinor-theme/blob/main/README.en.md)

Valinor reúne **24 temas de cores** (19 escuros e 5 claros), cada um inspirado em um tema consolidado e batizado com um nome do universo de Tolkien, além de temas de ícones que combinam com eles.

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
| Legolas | escuro | Tokyo Night |
| Lúthien | escuro | Ethereal |
| Morgoth | escuro | Matte Black |
| Shelob | escuro | Vantablack |
| Smaug | escuro | Ristretto |
| Thranduil | escuro | Nord |
| Ungoliant | escuro | Miasma |
| Elbereth | claro | Catppuccin Latte |
| Fëanor | claro | Quiet Light |
| Galadriel | claro | Solarized Light |
| Gandalf | claro | Tokyo Night Light |
| Glorfindel | claro | Night Owl Light |
| Goldberry | claro | Flexoki Light |

Todos os temas passam por uma validação automática de contraste (WCAG): texto do editor ≥ 4,5:1, comentários e números de linha ≥ 3:1, botões, badges e status bar ≥ 4,5:1, item selecionado ≥ 4,5:1.

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

</details>

---

## Ícones

### Ícones de arquivo

`Ctrl+Shift+P` / `Cmd+Shift+P` → **Preferences: File Icon Theme**:

- **Valinor Icons Minimal – \<tema\>**: um conjunto por tema de cores (24 no total), com pastas na cor de destaque do tema e arquivos em tom neutro. Escolha o que tem o mesmo nome do seu tema.
- **Valinor Icons Zed**: ícones monocromáticos do editor Zed, com versões para tema claro e escuro.
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
| `npm run build` | Valida e gera `themes/`, os ícones Minimal e Zed e atualiza o `package.json` |
| `npm run validate` | Mostra erros e avisos de contraste, cores inválidas e chaves desconhecidas |
| `npm run watch` | Refaz o build a cada alteração em `src/` |
| `npm run screenshots` | Captura prints reais do VS Code de cada tema em `assets/previews/` (Hyprland) |
| `npm run package` | Gera `bin/valinor-theme.vsix` |

### Atualizar ícones

```bash
make update-icons
```

> Os SVGs do Zed ficam em `icons/zed/src`. O Catppuccin é atualizado manualmente, copiando os `theme.json` gerados pela extensão.

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
- [Night Owl](https://marketplace.visualstudio.com/items?itemName=sdras.night-owl)
- [Nord](https://marketplace.visualstudio.com/items?itemName=arcticicestudio.nord-visual-studio-code)
- [Omarchy](https://github.com/basecamp/omarchy): Ethereal, Hackerman, Matte Black, Osaka Jade, Ristretto, Vantablack
- [Quiet Light for VSC](https://marketplace.visualstudio.com/items?itemName=onecrayon.theme-quietlight-vsc)
- [Rosé Pine](https://marketplace.visualstudio.com/items?itemName=mvllow.rose-pine)
- [Solarized](https://marketplace.visualstudio.com/items?itemName=ryanolsonx.solarized)
- [Tokyo Night](https://marketplace.visualstudio.com/items?itemName=enkia.tokyo-night)

### Ícones

- [Zed Icons](https://github.com/zed-industries/zed): Zed Industries
- [Symbols](https://github.com/miguelsolorio/vscode-symbols): Miguel Solorio
- [Fluent Icons](https://github.com/miguelsolorio/vscode-fluent-icons): Miguel Solorio
- [Catppuccin Icons](https://github.com/catppuccin/vscode-icons): Catppuccin

---

## Licença

Este projeto está licenciado sob a licença [MIT](https://github.com/Diego-Brocanelli/valinor-theme/blob/main/LICENSE).

## Autor

Diego Brocanelli, <diegod2@msn.com>
