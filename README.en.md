![Valinor banner](https://github.com/Diego-Brocanelli/valinor-theme/raw/HEAD/assets/valinor-banner.png)

# Valinor VSCode Theme

> 🇧🇷 [Leia em português](https://github.com/Diego-Brocanelli/valinor-theme/blob/main/README.md)

Valinor brings together **24 color themes** (19 dark, 5 light). Each one is based on a well-established theme and named after a character or place from Tolkien's world, and each comes with matching file icon themes.

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
| Legolas | dark | Tokyo Night |
| Lúthien | dark | Ethereal |
| Morgoth | dark | Matte Black |
| Shelob | dark | Vantablack |
| Smaug | dark | Ristretto |
| Thranduil | dark | Nord |
| Ungoliant | dark | Miasma |
| Elbereth | light | Catppuccin Latte |
| Fëanor | light | Quiet Light |
| Galadriel | light | Solarized Light |
| Gandalf | light | Tokyo Night Light |
| Glorfindel | light | Night Owl Light |
| Goldberry | light | Flexoki Light |

Every theme is checked automatically for WCAG contrast. The minimums are: editor text 4.5:1, comments and line numbers 3:1, buttons, badges and status bar 4.5:1, selected list items 4.5:1.

## Icons

- **File Icon Theme**: *Valinor Icons Minimal – \<theme\>* (one per color theme), *Valinor Icons Zed*, *Valinor Icons Symbols* and Catppuccin *Mocha / Latte / Frappé / Macchiato*.
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
