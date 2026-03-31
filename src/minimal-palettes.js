/**
 * minimal-palettes.js
 *
 * Paletas de cores para as variantes "Valinor-flavored" do minimal-icon-theme.
 *
 * Cada entrada define:
 *   - id          : identificador da variante (usado no package.json e no nome do diretório)
 *   - label       : nome exibido no VSCode
 *   - type        : "dark" | "light"
 *   - folder      : cor principal da pasta fechada
 *   - folderOpen  : cor da pasta aberta (geralmente mais clara)
 *   - rootFolder  : cor de destaque da pasta raiz
 *   - file        : cor do ícone de arquivo genérico
 *
 * Cores derivadas das paletas dos temas tolkienianos já existentes no Valinor,
 * mapeadas a partir de: activityBarBadge.background, editor.foreground,
 * sideBarTitle.foreground e tokenColors dos respectivos .yml.
 */

module.exports = [

  // ── DARK ──────────────────────────────────────────────────────────────────

  {
    id: "arien",
    label: "Valinor Icons Minimal – Arien",
    type: "dark",
    folder:     "#e46876",  // sideBarTitle / badge (vermelho-rosa)
    folderOpen: "#ff9e3b",  // variable.language (laranja)
    rootFolder: "#c8c093",  // cursor (dourado suave)
    file:       "#c5c9c5",  // editor.foreground
  },
  {
    id: "arwen",
    label: "Valinor Icons Minimal – Arwen",
    type: "dark",
    folder:     "#9cabca",
    folderOpen: "#c8c093",
    rootFolder: "#7e9cd8",
    file:       "#c8c093",
  },
  {
    id: "azaghal",
    label: "Valinor Icons Minimal – Azaghâl",
    type: "dark",
    folder:     "#b16286",
    folderOpen: "#d65d0e",
    rootFolder: "#fabd2f",
    file:       "#ebdbb2",
  },
  {
    id: "bombur",
    label: "Valinor Icons Minimal – Bombur",
    type: "dark",
    folder:     "#d4be98",
    folderOpen: "#e78a4e",
    rootFolder: "#a9b665",
    file:       "#d4be98",
  },
  {
    id: "celeborn",
    label: "Valinor Icons Minimal – Celeborn",
    type: "dark",
    folder:     "#81a1c1",
    folderOpen: "#88c0d0",
    rootFolder: "#5e81ac",
    file:       "#eceff4",
  },
  {
    id: "celebrimbor",
    label: "Valinor Icons Minimal – Celebrimbor",
    type: "dark",
    folder:     "#c792ea",
    folderOpen: "#89ddff",
    rootFolder: "#82aaff",
    file:       "#a6accd",
  },
  {
    id: "cirdan",
    label: "Valinor Icons Minimal – Círdan",
    type: "dark",
    folder:     "#569cd6",
    folderOpen: "#9cdcfe",
    rootFolder: "#4ec9b0",
    file:       "#d4d4d4",
  },
  {
    id: "durin",
    label: "Valinor Icons Minimal – Durin",
    type: "dark",
    folder:     "#5e81ac",
    folderOpen: "#81a1c1",
    rootFolder: "#88c0d0",
    file:       "#d8dee9",
  },
  {
    id: "earendil",
    label: "Valinor Icons Minimal – Eärendil",
    type: "dark",
    folder:     "#7aa2f7",
    folderOpen: "#7dcfff",
    rootFolder: "#bb9af7",
    file:       "#c0caf5",
  },
  {
    id: "fangorn",
    label: "Valinor Icons Minimal – Fangorn",
    type: "dark",
    folder:     "#a9b665",
    folderOpen: "#b8bb26",
    rootFolder: "#8ec07c",
    file:       "#ebdbb2",
  },
  {
    id: "gimli",
    label: "Valinor Icons Minimal – Gimli",
    type: "dark",
    folder:     "#d65d0e",
    folderOpen: "#fe8019",
    rootFolder: "#fabd2f",
    file:       "#ebdbb2",
  },
  {
    id: "legolas",
    label: "Valinor Icons Minimal – Legolas",
    type: "dark",
    folder:     "#41a6b5",
    folderOpen: "#7dcfff",
    rootFolder: "#73daca",
    file:       "#c0caf5",
  },
  {
    id: "luthien",
    label: "Valinor Icons Minimal – Lúthien",
    type: "dark",
    folder:     "#f38ba8",
    folderOpen: "#fab387",
    rootFolder: "#cba6f7",
    file:       "#cdd6f4",
  },
  {
    id: "morgoth",
    label: "Valinor Icons Minimal – Morgoth",
    type: "dark",
    folder:     "#bf616a",
    folderOpen: "#d08770",
    rootFolder: "#ebcb8b",
    file:       "#4c566a",
  },
  {
    id: "shelob",
    label: "Valinor Icons Minimal – Shelob",
    type: "dark",
    folder:     "#6272a4",
    folderOpen: "#8be9fd",
    rootFolder: "#bd93f9",
    file:       "#f8f8f2",
  },
  {
    id: "smaug",
    label: "Valinor Icons Minimal – Smaug",
    type: "dark",
    folder:     "#cc241d",
    folderOpen: "#fe8019",
    rootFolder: "#fabd2f",
    file:       "#ebdbb2",
  },
  {
    id: "thranduil",
    label: "Valinor Icons Minimal – Thranduil",
    type: "dark",
    folder:     "#a3be8c",
    folderOpen: "#ebcb8b",
    rootFolder: "#88c0d0",
    file:       "#eceff4",
  },
  {
    id: "ungoliant",
    label: "Valinor Icons Minimal – Ungoliant",
    type: "dark",
    folder:     "#4c566a",
    folderOpen: "#6272a4",
    rootFolder: "#bd93f9",
    file:       "#282a36",
  },

  // ── LIGHT ─────────────────────────────────────────────────────────────────

  {
    id: "elbereth",
    label: "Valinor Icons Minimal – Elbereth",
    type: "light",
    folder:     "#4078f2",
    folderOpen: "#0184bc",
    rootFolder: "#a626a4",
    file:       "#383a42",
  },
  {
    id: "feanor",
    label: "Valinor Icons Minimal – Fëanor",
    type: "light",
    folder:     "#7aa2f7",
    folderOpen: "#2ac3de",
    rootFolder: "#9d7cd8",
    file:       "#343b58",
  },
  {
    id: "galadriel",
    label: "Valinor Icons Minimal – Galadriel",
    type: "light",
    folder:     "#56949f",
    folderOpen: "#286983",
    rootFolder: "#907aa9",
    file:       "#575279",
  },
  {
    id: "gandalf",
    label: "Valinor Icons Minimal – Gandalf",
    type: "light",
    folder:     "#6c6f93",
    folderOpen: "#4078f2",
    rootFolder: "#a626a4",
    file:       "#383a42",
  },
  {
    id: "glorfindel",
    label: "Valinor Icons Minimal – Glorfindel",
    type: "light",
    folder:     "#005f87",
    folderOpen: "#0087af",
    rootFolder: "#8700af",
    file:       "#3a3a3a",
  },
  {
    id: "goldberry",
    label: "Valinor Icons Minimal – Goldberry",
    type: "light",
    folder:     "#40a02b",
    folderOpen: "#179299",
    rootFolder: "#8839ef",
    file:       "#4c4f69",
  },
];