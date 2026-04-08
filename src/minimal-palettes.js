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
    folderOpen: "#e46876",  // variable.language (laranja)
    rootFolder: "#e46876",  // cursor (dourado suave)
    file:       "#e46876",  // editor.foreground
  },
  {
    id: "arwen",
    label: "Valinor Icons Minimal – Arwen",
    type: "dark",
    folder:     "#c4a7e7",
    folderOpen: "#c4a7e7",
    rootFolder: "#c4a7e7",
    file:       "#c4a7e7", //#c8c093
  },
  {
    id: "azaghal",
    label: "Valinor Icons Minimal – Azaghâl",
    type: "dark",
    folder:     "#62a0ea",
    folderOpen: "#62a0ea",
    rootFolder: "#62a0ea",
    file:       "#62a0ea",
  },
  {
    id: "bombur",
    label: "Valinor Icons Minimal – Bombur",
    type: "dark",
    folder:     "#fabd2f",
    folderOpen: "#fabd2f",
    rootFolder: "#fabd2f",
    file:       "#fabd2f",
  },
  {
    id: "celeborn",
    label: "Valinor Icons Minimal – Celeborn",
    type: "dark",
    folder:     "#89b4fa",
    folderOpen: "#89b4fa",
    rootFolder: "#89b4fa",
    file:       "#89b4fa",
  },
  {
    id: "celebrimbor",
    label: "Valinor Icons Minimal – Celebrimbor",
    type: "dark",
    folder:     "#00ff41",
    folderOpen: "#00ff41",
    rootFolder: "#00ff41",
    file:       "#00ff41",
  },
  {
    id: "cirdan",
    label: "Valinor Icons Minimal – Círdan",
    type: "dark",
    folder:     "#68b090",
    folderOpen: "#68b090",
    rootFolder: "#68b090",
    file:       "#68b090",
  },
  {
    id: "durin",
    label: "Valinor Icons Minimal – Durin",
    type: "dark",
    folder:     "#88c0d0",
    folderOpen: "#88c0d0",
    rootFolder: "#88c0d0",
    file:       "#88c0d0",
  },
  {
    id: "earendil",
    label: "Valinor Icons Minimal – Eärendil",
    type: "dark",
    folder:     "#7aa2f7",
    folderOpen: "#7aa2f7",
    rootFolder: "#7aa2f7",
    file:       "#7aa2f7",
  },
  {
    id: "fangorn",
    label: "Valinor Icons Minimal – Fangorn",
    type: "dark",
    folder:     "#a7c080",
    folderOpen: "#a7c080",
    rootFolder: "#a7c080",
    file:       "#a7c080",
  },
  {
    id: "gimli",
    label: "Valinor Icons Minimal – Gimli",
    type: "dark",
    folder:     "#8089b3",
    folderOpen: "#8089b3",
    rootFolder: "#8089b3",
    file:       "#8089b3",
  },
  {
    id: "legolas",
    label: "Valinor Icons Minimal – Legolas",
    type: "dark",
    folder:     "#1a1b26",
    folderOpen: "#1a1b26",
    rootFolder: "#1a1b26",
    file:       "#1a1b26",
  },
  {
    id: "luthien",
    label: "Valinor Icons Minimal – Lúthien",
    type: "dark",
    folder:     "#c8a0e8",
    folderOpen: "#c8a0e8",
    rootFolder: "#c8a0e8",
    file:       "#c8a0e8",
  },
  {
    id: "morgoth",
    label: "Valinor Icons Minimal – Morgoth",
    type: "dark",
    folder:     "#a0a0a0",
    folderOpen: "#a0a0a0",
    rootFolder: "#a0a0a0",
    file:       "#a0a0a0",
  },
  {
    id: "shelob",
    label: "Valinor Icons Minimal – Shelob",
    type: "dark",
    folder:     "#909090",
    folderOpen: "#909090",
    rootFolder: "#909090",
    file:       "#909090",
  },
  {
    id: "smaug",
    label: "Valinor Icons Minimal – Smaug",
    type: "dark",
    folder:     "#e8d8c8",
    folderOpen: "#e8d8c8",
    rootFolder: "#e8d8c8",
    file:       "#e8d8c8",
  },
  {
    id: "thranduil",
    label: "Valinor Icons Minimal – Thranduil",
    type: "dark",
    folder:     "#d8dee9",
    folderOpen: "#d8dee9",
    rootFolder: "#d8dee9",
    file:       "#d8dee9",
  },
  {
    id: "ungoliant",
    label: "Valinor Icons Minimal – Ungoliant",
    type: "dark",
    folder:     "#5cad4a",
    folderOpen: "#5cad4a",
    rootFolder: "#5cad4a",
    file:       "#5cad4a",
  },

  // ── LIGHT ─────────────────────────────────────────────────────────────────

  {
    id: "elbereth",
    label: "Valinor Icons Minimal – Elbereth",
    type: "light",
    folder:     "#4c4f69",
    folderOpen: "#4c4f69",
    rootFolder: "#4c4f69",
    file:       "#4c4f69",
  },
  {
    id: "feanor",
    label: "Valinor Icons Minimal – Fëanor",
    type: "light",
    folder:     "#d6cfe2",
    folderOpen: "#d6cfe2",
    rootFolder: "#d6cfe2",
    file:       "#d6cfe2",
  },
  {
    id: "galadriel",
    label: "Valinor Icons Minimal – Galadriel",
    type: "light",
    folder:     "#e8dcb6",
    folderOpen: "#e8dcb6",
    rootFolder: "#e8dcb6",
    file:       "#e8dcb6",
  },
  {
    id: "gandalf",
    label: "Valinor Icons Minimal – Gandalf",
    type: "light",
    folder:     "#e6e7ed",
    folderOpen: "#e6e7ed",
    rootFolder: "#e6e7ed",
    file:       "#e6e7ed",
  },
  {
    id: "glorfindel",
    label: "Valinor Icons Minimal – Glorfindel",
    type: "light",
    folder:     "#403f53",
    folderOpen: "#403f53",
    rootFolder: "#403f53",
    file:       "#403f53",
  },
  {
    id: "goldberry",
    label: "Valinor Icons Minimal – Goldberry",
    type: "light",
    folder:     "#100f0f52",
    folderOpen: "#100f0f52",
    rootFolder: "#100f0f52",
    file:       "#100f0f52",
  },
];