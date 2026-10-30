/**
 * screenshots.js
 *
 * Captura prints reais do VS Code com cada tema (assets/previews/<id>.png)
 * e monta a imagem comparativa (assets/previews/overview.png).
 *
 * Funciona no Hyprland sem ocupar a tela: cria um monitor virtual (headless),
 * abre o VS Code nele com um perfil isolado (o seu perfil não é tocado),
 * troca o tema pelo settings.json, captura com grim e remove o monitor.
 *
 * Requer: Hyprland (hyprctl), grim, ImageMagick (magick) e o comando `code`.
 * Uso: npm run screenshots
 *      npm run screenshots -- durin galadriel   (só alguns temas)
 *      ICON_THEME=valinor-icons-zed npm run screenshots -- arien
 */

const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");
const { loadThemes } = require("./lib/themes");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "assets", "previews");
const VSIX = path.join(ROOT, "bin", "valinor-theme.vsix");
const MONITOR = "VALINORSHOT";
const MODE = "1600x1000@60"; // resolução do monitor virtual (= tamanho dos prints)
// Binário do Electron. O comando `code` é um script que inicia o VS Code como
// outro processo e sai; o Hyprland só aplica as regras de exec ao próprio
// processo, então chamamos o binário diretamente.
const CODE_BIN = process.env.CODE_BIN || "/usr/share/code/code";

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", ...opts });
const hypr = (...args) => run("hyprctl", args).trim();
const hyprJson = (what) => JSON.parse(run("hyprctl", [what, "-j"]));

function requireTools() {
  if (!fs.existsSync(CODE_BIN)) {
    console.error(`screenshots: binário do VS Code não encontrado em ${CODE_BIN} (defina CODE_BIN).`);
    process.exit(1);
  }
  for (const tool of ["hyprctl", "grim", "magick", "code"]) {
    if (spawnSync("which", [tool]).status !== 0) {
      console.error(`screenshots: "${tool}" não encontrado (requer Hyprland, grim, ImageMagick e VS Code).`);
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

  // Retorna true se a joia ainda brilha com a luz das Árvores.
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

// ── Monitor virtual e janela ─────────────────────────────────────────────────

function ensureMonitor() {
  let monitor = hyprJson("monitors").find((m) => m.name === MONITOR);
  const created = !monitor;
  if (created) hypr("output", "create", "headless", MONITOR);
  hypr("eval", `hl.monitor({ output = "${MONITOR}", mode = "${MODE}", position = "auto", scale = 1 })`);
  sleep(1000);
  monitor = hyprJson("monitors").find((m) => m.name === MONITOR);
  if (!monitor) throw new Error("não foi possível criar o monitor virtual");
  return { monitor, created };
}

/** Janelas do VS Code de captura (identificadas pelos pids do perfil isolado). */
function ownWindows(userDataDir) {
  const pids = codePids(userDataDir);
  return hyprJson("clients").filter((c) => pids.has(c.pid));
}

/** A maior janela de captura; aborta se alguma abrir fora do monitor virtual. */
function findWindow(workspaceId, userDataDir) {
  const windows = ownWindows(userDataDir);
  const stray = windows.find((c) => c.workspace.id !== workspaceId);
  if (stray) throw new Error(`uma janela de captura abriu fora do monitor virtual ("${stray.title}")`);
  return windows.sort((a, b) => b.size[0] * b.size[1] - a.size[0] * a.size[1])[0];
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

  const { monitor, created } = ensureMonitor();
  const workspaceId = monitor.activeWorkspace.id;
  let window;

  try {
    console.log(`→ abrindo o VS Code no monitor virtual ${MONITOR}`);
    const args = [
      "--ozone-platform=wayland", "--password-store=basic",
      "--user-data-dir", userDataDir, "--extensions-dir", extensionsDir,
      "--new-window", "--disable-workspace-trust", "--skip-welcome", "--skip-release-notes", "--disable-telemetry",
      // O primeiro arquivo da lista fica como aba ativa.
      workspace, path.join(workspace, "src/trees/silmaril.ts"), path.join(workspace, "src/trees/light.ts"),
    ].map((a) => `'${a}'`).join(" ");
    // Regras só desta janela: workspace do monitor virtual, tela cheia nele e
    // opacidade total (o Omarchy aplica transparência a todas as janelas).
    const rules = `{ workspace = "${workspaceId} silent", fullscreen = true, tag = "-default-opacity", opacity = "1.0 override 1.0 override" }`;
    hypr("eval", `hl.exec_cmd([[env FONTCONFIG_FILE='${fontConfig}' '${CODE_BIN}' ${args}]], ${rules})`);

    for (let i = 0; i < 60 && !window; i++) {
      sleep(500);
      window = findWindow(workspaceId, userDataDir);
    }
    if (!window) throw new Error("a janela do VS Code não apareceu no monitor virtual");

    sleep(35000); // tempo para ativar as extensões e o TypeScript terminar de inicializar
    window = findWindow(workspaceId, userDataDir);

    fs.ensureDirSync(OUT);
    const pngs = [];

    for (const compiled of themes) {
      fs.outputJsonSync(settingsFile, settings(compiled, labels[`./themes/${compiled.id}.json`]), { spaces: 2 });
      sleep(3000);

      const geo = `${window.at[0]},${window.at[1]} ${window.size[0]}x${window.size[1]}`;
      const png = path.join(OUT, `${compiled.id}.png`);
      run("grim", ["-g", geo, png]);
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
    // Encerra o VS Code de captura (SIGTERM e, se ainda estiver aberto, SIGKILL).
    for (const signal of ["SIGTERM", "SIGKILL"]) {
      for (const pid of codePids(userDataDir)) {
        try { process.kill(pid, signal); } catch { /* já encerrado */ }
      }
      sleep(3000);
    }
    if (created) spawnSync("hyprctl", ["output", "remove", MONITOR]);
    fs.removeSync(tmp);
  }

  console.log(`screenshots: ${themes.length} print(s) em assets/previews/`);
}

main();
