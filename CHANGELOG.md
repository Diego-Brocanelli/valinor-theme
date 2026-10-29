# Change Log

Todas as mudanças relevantes da extensão "valinor-theme" são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

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
