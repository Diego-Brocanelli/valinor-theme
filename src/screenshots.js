/**
 * screenshots.js
 *
 * Captura prints reais do VS Code com cada tema (assets/previews/<id>.png)
 * e monta a imagem comparativa (assets/previews/overview.png).
 *
 * Funciona em qualquer distro e ambiente (GNOME, KDE, Hyprland, sem sessão
 * gráfica) sem ocupar a tela: sobe um servidor X invisível (Xvfb) de
 * 1600x1000, abre nele o VS Code com um perfil isolado (o seu perfil não é
 * tocado), troca o tema pelo settings.json e captura a tela com o ImageMagick.
 *
 * Requer: Xvfb, xdotool, ImageMagick (magick) e o VS Code (comando `code`).
 *   Fedora: sudo dnf install xorg-x11-server-Xvfb xdotool ImageMagick
 *   Arch:   sudo pacman -S xorg-server-xvfb xdotool imagemagick
 *
 * Uso: npm run screenshots
 *      npm run screenshots -- durin galadriel   (só alguns temas)
 *      ICON_THEME=valinor-icons-zed npm run screenshots -- arien
 *      CODE_BIN=/caminho/do/code npm run screenshots   (binário do Electron)
 */

const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const { execFileSync, spawn, spawnSync } = require("child_process");
const { loadThemes } = require("./lib/themes");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "assets", "previews");
const VSIX = path.join(ROOT, "bin", "valinor-theme.vsix");
const WIDTH = 1600; // tamanho da tela virtual (= tamanho dos prints)
const HEIGHT = 1000;
// Binário do Electron (o comando `code` é um script que só repassa a chamada).
// RPM/.deb/AUR (code) instalam em /usr/share/code; visual-studio-code-bin em /opt.
const CODE_BIN =
  process.env.CODE_BIN || ["/usr/share/code/code", "/opt/visual-studio-code/code"].find((bin) => fs.existsSync(bin));

const INSTALL_HINT =
  "  Fedora: sudo dnf install xorg-x11-server-Xvfb xdotool ImageMagick\n" +
  "  Arch:   sudo pacman -S xorg-server-xvfb xdotool imagemagick";

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", ...opts });

function requireTools() {
  if (!CODE_BIN) {
    console.error("screenshots: binário do VS Code não encontrado (defina CODE_BIN).");
    process.exit(1);
  }
  for (const tool of ["Xvfb", "xdotool", "magick", "code"]) {
    if (spawnSync("which", [tool]).status !== 0) {
      console.error(`screenshots: "${tool}" não encontrado. Instale as dependências:\n${INSTALL_HINT}`);
      process.exit(1);
    }
  }
}

// ── Projeto de exemplo aberto no VS Code ─────────────────────────────────────

const SAMPLE = {
  "src/trees/silmaril.ts": `import { Light, type Radiance } from "./light";

/** As três joias forjadas por Fëanor com a luz das Duas Árvores. */
export class Silmaril extends Light {
  private static readonly MAX_POWER = 42;
  readonly #maker = "Fëanor";

  constructor(public name: string, radiance: Radiance) {
    super(radiance.intensity);
  }

  /**
   * Forja a joia com a luz das Árvores.
   * @param power intensidade da luz, de 0 a MAX_POWER
   * @returns true se a joia ainda brilha
   */
  forge(power: number): boolean {
    if (power > Silmaril.MAX_POWER) {
      throw new Error(\`Poder excessivo: \${power}\`);
    }
    return this.shine(power * 0.75) && /laurelin|telperion/i.test(this.name);
  }

  async *glow(steps = 3): AsyncGenerator<string> {
    for (let i = 0; i < steps; i++) yield \`\${this.#maker}#\${i}\`;
  }
}
`,
  "src/trees/light.ts": `export interface Radiance {
  intensity: number;
  color: "silver" | "gold";
}

export abstract class Light {
  constructor(protected intensity: number) {}

  shine(amount: number): boolean {
    return amount <= this.intensity;
  }
}
`,
  "src/index.ts": `export { Silmaril } from "./trees/silmaril";\n`,
  "README.md": "# Valinor\n\nExemplo usado nos prints dos temas.\n",
  "package.json": `{\n  "name": "valinor-sample",\n  "private": true\n}\n`,
  "tsconfig.json": `{\n  "compilerOptions": { "target": "ES2022", "strict": true }\n}\n`,
};

function settings(compiled, label) {
  return {
    "workbench.colorTheme": label,
    // ICON_THEME=<id> troca o tema de ícones (ex.: valinor-icons-zed para conferir os Lucide).
    "workbench.iconTheme": process.env.ICON_THEME || `valinor-icons-minimal-${compiled.id}`,
    "editor.fontFamily": "Zed Plex Mono",
    "editor.fontSize": 15,
    "editor.lineHeight": 1.6,
    "editor.cursorBlinking": "solid",
    "editor.stickyScroll.enabled": false,
    "editor.inlayHints.enabled": "off",
    "editor.lightbulb.enabled": "off",
    "editor.occurrencesHighlight": "off",
    "editor.selectionHighlight": false,
    "editor.minimap.renderCharacters": false,
    "window.titleBarStyle": "custom",
    "window.commandCenter": true,
    "window.restoreWindows": "none",
    "workbench.startupEditor": "none",
    "workbench.tips.enabled": false,
    "workbench.enableExperiments": false,
    "workbench.layoutControl.enabled": false,
    "workbench.secondarySideBar.defaultVisibility": "hidden",
    "workbench.editor.empty.hint": "hidden",
    "chat.disableAIFeatures": true,
    "chat.commandCenter.enabled": false,
    "explorer.compactFolders": false,
    "git.enabled": false,
    "files.hotExit": "off",
    "telemetry.telemetryLevel": "off",
    "update.mode": "none",
    "extensions.autoCheckUpdates": false,
    "extensions.ignoreRecommendations": true,
    "security.workspace.trust.enabled": false,
    "typescript.disableAutomaticTypeAcquisition": true,
  };
}

// ── Tela virtual e janela ────────────────────────────────────────────────────

/** Sobe um Xvfb em um display livre (:99 em diante) e espera o socket. */
function startXvfb() {
  let n = 99;
  while (fs.existsSync(`/tmp/.X11-unix/X${n}`) || fs.existsSync(`/tmp/.X${n}-lock`)) n++;
  const display = `:${n}`;
  const proc = spawn("Xvfb", [display, "-screen", "0", `${WIDTH}x${HEIGHT}x24`, "-nolisten", "tcp"], { stdio: "ignore" });
  for (let i = 0; i < 50 && !fs.existsSync(`/tmp/.X11-unix/X${n}`); i++) sleep(100);
  if (!fs.existsSync(`/tmp/.X11-unix/X${n}`)) {
    proc.kill();
    throw new Error(`o Xvfb não iniciou em ${display}`);
  }
  return { display, proc };
}

/** Espera a janela do VS Code e a ajusta à tela inteira (não há gerenciador de janelas). */
function fitWindow(display) {
  const env = { ...process.env, DISPLAY: display };
  for (let i = 0; i < 60; i++) {
    const found = spawnSync("xdotool", ["search", "--onlyvisible", "--class", "code"], { encoding: "utf8", env });
    const ids = (found.stdout || "").split("\n").filter(Boolean);
    if (ids.length) {
      const id = ids[ids.length - 1];
      run("xdotool", ["windowmove", id, "0", "0", "windowsize", id, String(WIDTH), String(HEIGHT)], { env });
      return id;
    }
    sleep(500);
  }
  throw new Error("a janela do VS Code não apareceu na tela virtual");
}

function codePids(userDataDir) {
  const out = spawnSync("pgrep", ["-f", userDataDir], { encoding: "utf8" }).stdout || "";
  return new Set(out.split("\n").filter(Boolean).map(Number));
}

function main() {
  requireTools();

  const only = process.argv.slice(2);
  const themes = loadThemes().filter((t) => !only.length || only.includes(t.id));
  const labels = Object.fromEntries(fs.readJsonSync(path.join(ROOT, "package.json")).contributes.themes.map((t) => [t.path, t.label]));

  console.log("→ empacotando a extensão");
  fs.ensureDirSync(path.dirname(VSIX));
  run("npm", ["run", "package", "--silent"], { cwd: ROOT, stdio: "inherit" });

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "valinor-shots-"));
  const userDataDir = path.join(tmp, "user-data");
  const extensionsDir = path.join(tmp, "extensions");
  const workspace = path.join(tmp, "valinor");
  const settingsFile = path.join(userDataDir, "User", "settings.json");
  const fontConfig = path.join(tmp, "fonts.conf");

  for (const [file, content] of Object.entries(SAMPLE)) fs.outputFileSync(path.join(workspace, file), content);
  fs.outputJsonSync(settingsFile, settings(themes[0], labels[`./themes/${themes[0].id}.json`]), { spaces: 2 });
  fs.writeFileSync(
    fontConfig,
    `<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n<fontconfig>\n` +
      `  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>\n` +
      `  <dir>${path.join(ROOT, "fonts")}</dir>\n  <cachedir>${path.join(tmp, "fc-cache")}</cachedir>\n</fontconfig>\n`
  );

  console.log("→ instalando a extensão em um perfil isolado");
  run("code", ["--user-data-dir", userDataDir, "--extensions-dir", extensionsDir, "--install-extension", VSIX, "--force"], { stdio: "ignore" });

  const xvfb = startXvfb();

  try {
    console.log(`→ abrindo o VS Code na tela virtual ${xvfb.display}`);
    const env = { ...process.env, DISPLAY: xvfb.display, FONTCONFIG_FILE: fontConfig };
    delete env.WAYLAND_DISPLAY;
    spawn(CODE_BIN, [
      "--ozone-platform=x11", "--disable-gpu", "--password-store=basic",
      "--user-data-dir", userDataDir, "--extensions-dir", extensionsDir,
      "--new-window", "--disable-workspace-trust", "--skip-welcome", "--skip-release-notes", "--disable-telemetry",
      // O primeiro arquivo da lista fica como aba ativa.
      workspace, path.join(workspace, "src/trees/silmaril.ts"), path.join(workspace, "src/trees/light.ts"),
    ], { env, stdio: "ignore", detached: false });

    fitWindow(xvfb.display);
    sleep(35000); // tempo para ativar as extensões e o TypeScript terminar de inicializar
    fitWindow(xvfb.display); // o VS Code pode restaurar o tamanho ao terminar de abrir

    fs.ensureDirSync(OUT);
    const pngs = [];

    for (const compiled of themes) {
      fs.outputJsonSync(settingsFile, settings(compiled, labels[`./themes/${compiled.id}.json`]), { spaces: 2 });
      sleep(3000);

      const png = path.join(OUT, `${compiled.id}.png`);
      run("magick", ["import", "-display", xvfb.display, "-window", "root", png]);
      run("magick", [png, "-strip", "-define", "png:compression-level=9", png]);
      pngs.push(png);
      console.log(`  ✓ ${compiled.theme.name}`);
    }

    if (!only.length) {
      run("magick", [
        "montage", ...pngs,
        "-tile", "4x", "-geometry", "384x240+6+6", "-background", "#f6f6f6",
        "-strip", path.join(OUT, "overview.png"),
      ]);
      console.log("  ✓ overview.png");
    }
  } finally {
    // Encerra o VS Code de captura (SIGTERM e, se ainda estiver aberto, SIGKILL) e o Xvfb.
    for (const signal of ["SIGTERM", "SIGKILL"]) {
      for (const pid of codePids(userDataDir)) {
        try { process.kill(pid, signal); } catch { /* já encerrado */ }
      }
      sleep(3000);
    }
    xvfb.proc.kill();
    fs.removeSync(tmp);
  }

  console.log(`screenshots: ${themes.length} print(s) em assets/previews/`);
}

main();
