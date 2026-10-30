# Change Log

Todas as mudanças relevantes da extensão "valinor-theme" são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

## [2.27.0] - 2026-10-29

### Adicionado

- Quatro temas claros, formando pares com temas escuros existentes: **Yavanna** (Kanagawa Lotus, par do Arien), **Nienna** (Rosé Pine Dawn, par do Arwen), **Bilbo** (Gruvbox Light, par do Bombur) e **Lothlórien** (Everforest Light, par do Fangorn). Agora são 28 temas: 18 escuros e 10 claros.
- Itálico em comentários, doc blocks completos (inclusive tags como `@param` e `@returns`, tipos e nomes do JSDoc, PHPDoc e Javadoc) e `this`/`self` nos 28 temas, por uma camada de estilo comum que não altera cores. Durin e Legolas, que não tinham itálico, passam a ter. O Markdown itálico e negrito vale para todos os temas.
- Escolha do usuário entre itálico padrão, sem itálico ou mais itálico, por um trecho de `settings.json` que vale para todos os temas Valinor (`"[Valinor*]"`): no README, no seletor da galeria e em `npm run italic -- none | more`.
- O validador exige itálico em comentários, doc blocks, tags de doc e `this`.
- Galeria interativa no GitHub Pages (`npm run site` + workflow `pages.yml`): prints de todos os temas, filtros claro/escuro, busca, pares, amostras de cor com cópia do hex e cópia do `settings.json`, em português e inglês.
- Seção "Pares claro/escuro" no README, com a configuração de troca automática conforme o modo do sistema.

### Alterado

- Pacote `.vsix` de 5,05 MB para 2,8 MB: o tema Symbols passa a ser copiado pelo build só com os ícones referenciados, e os dois ícones do Cursor (1,5 MB cada, com imagem embutida) usam o ícone padrão do Symbols. Os SVGs do Lucide são gravados em uma linha.
- Link da galeria atualizado para https://diegobrocanelli.com.br/valinor-theme/.
- **Legolas** passa a ser Night Owl (tokens oficiais, versão sem itálico), formando par com o Glorfindel (Night Owl Light). Antes era quase idêntico ao Eärendil.
- **Thranduil** passa a ser um Nord mais profundo (fundo `#242933`, destaque Frost `#81a1c1`), distinto do Durin.
- **Valinor Icons Zed** passa a se chamar **Valinor Icons Lucide**: os ícones do Zed (GPL-3.0-or-later) foram substituídos por ícones do [Lucide](https://lucide.dev) (ISC), compatíveis com a licença MIT do projeto. O id `valinor-icons-zed` foi mantido, então quem já usa o tema não perde a configuração.
- Os ícones Minimal foram substituídos por **Valinor Icons – \<tema\>**: os ícones Lucide coloridos com a paleta de cada tema (pastas no accent, linguagens e formatos nos tons do tema, arquivos genéricos em tom neutro). Os ids `valinor-icons-minimal-<tema>` foram mantidos, então quem usava os Minimal recebe os novos ícones sem reconfigurar.
- Pastas raiz com arte própria (estrela de oito pontas).
- Texto de destaque (títulos, links, matches de busca) com contraste mínimo de 4,5:1 em todos os temas, e texto principal dos temas claros com 7:1. O validador termina com 0 erros e 0 avisos.

### Corrigido

- CI: o workflow Validate falhava no checkout porque o submódulo removido `icons/zed-src` continuava registrado no repositório.
- CI: actions atualizadas para versões que rodam em Node 24 (checkout v7, setup-node v7, upload-artifact v7, download-artifact v8, upload-pages-artifact v5, deploy-pages v5, action-gh-release v3), já que o Node 20 foi descontinuado no GitHub Actions.
- Galeria: um erro de escape quebrava o JavaScript da página; o `npm run site` agora checa a sintaxe antes de gravar.

### Licenças

- `THIRD_PARTY_NOTICES.md` com o texto completo das licenças de terceiros (Lucide, Catppuccin, Symbols, Fluent, Fluent UI System Icons, Nord, Tokyo Night, Night Owl, Zed Plex), incluído na extensão.
- Arquivos de licença junto dos ícones de Lucide, Catppuccin, Symbols e Fluent dentro do `.vsix`.
- Aviso de origem nos temas com tokens adaptados (Durin, Gimli, Legolas, Glorfindel).
- `npm run vendor:lucide` para atualizar os SVGs do Lucide.

## [2.26.0] - 2026-10-29

### Corrigido

- Os 24 temas tinham cores herdadas do tema-base. `editor.foreground`, números de linha, cursor, espaços em branco e destaque de palavras eram iguais em todos, e o texto dos temas claros ficava com contraste de 1,5:1.
- Texto de item selecionado em listas era preto (`#000`) sobre um fundo escuro translúcido em 22 temas.
- Fëanor, Galadriel e Gandalf, que são temas claros, usavam tokens de sintaxe de temas escuros (Everforest e Gruvbox).
- Fëanor estava registrado como tema escuro (`type: dark`) com fundo claro.
- No Glorfindel, 21 regras de token usavam a cor de destaque `#f5d76e` como cor de texto (contraste de 1,4:1).
- Legolas tinha botão com texto da mesma cor do fundo e destaque igual ao fundo do editor.
- Glorfindel e Goldberry tinham texto branco sobre botões e status bar claros.
- Ao passar o mouse, o botão ficava translúcido e o texto sumia.
- Corrigidas as chaves inválidas `statusBar.noFolderBack`, `terminal.Cursor.background` e `notification.background`, e as cores inválidas `#ooo` e `#403ffff53`.
- Comentários com contraste abaixo de 3:1 em 16 temas foram ajustados, mantendo o matiz original.
- **Valinor Icons Zed**: o caminho apontava para um arquivo que não existe no repositório do Zed, e os SVGs são pretos (o Zed aplica a cor em tempo de execução). Agora os ícones são gerados em versões para tema claro e escuro.
- **Valinor Product Icons Fluent**: o caminho foi corrigido para `icons/fluent/theme/fluent-icons.json`.

### Adicionado

- Paleta semântica por tema (`src/themes/*.yml`) e template único que gera mais de 300 cores de interface: terminal (16 cores ANSI), decorações do Git, diff/merge, diagnósticos, cores de pares de colchetes, minimap, peek view, inlay hints, sugestões, hover e bordas.
- Hierarquia de estados em listas e menus: hover < seleção inativa < seleção ativa < foco (contorno).
- `semanticTokenColors` em todos os temas com sintaxe gerada.
- Validação automática (`npm run validate`, executada também no build e no CI): contraste WCAG, cores hex válidas, chaves conhecidas pelo VS Code e `type` coerente com o fundo.
- Prints reais do VS Code dos 24 temas (`npm run screenshots`) e uma imagem comparativa no README. Os 8 prints antigos de `assets/themes/` foram removidos.
- Workflow de validação em pushes e pull requests.
- README em inglês (`README.en.md`).

### Alterado

- Itálico restrito a comentários e `this`/`self`. Antes, keywords, storage, parâmetros, atributos e classes herdadas também eram itálicos.
- Ícones Minimal: pastas na cor de destaque e arquivos em tom neutro. Antes as quatro cores eram iguais.
- "Valinor Feanor" passa a se chamar "Valinor Fëanor". O id antigo foi mantido, então quem já usa o tema não perde a configuração.
- Pacote `.vsix` reduzido de cerca de 19,7 MB (5.973 arquivos) para 4,35 MB (2.836 arquivos), sem `node_modules`, fontes, fontes dos temas e capturas de tela.
- Ícone da extensão recortado em formato quadrado (256×256). O original está em `assets/icon-source.png`.
- Dependências movidas para `devDependencies`. `vsce` foi substituído por `@vscode/vsce`, e o pacote `path` foi removido.
- O build (`src/build.js`) recria `themes/` do zero a cada execução.
- CI: verifica se a tag corresponde ao `version` do `package.json` e publica no Marketplace o mesmo `.vsix` da release.
- Docker com Node 22, sem `yo`/`generator-code` e sem `--privileged`.
- O submódulo `icons/zed-src`, que trazia o repositório inteiro do Zed, foi substituído pelos 55 SVGs usados, em `icons/zed/src`.
