/**
 * validate.js
 *
 * Valida todos os temas sem gerar arquivos. Sai com código 1 se houver erro.
 *
 * Uso: npm run validate            (erros + avisos)
 *      npm run validate -- --quiet (só erros)
 */

const { loadThemes } = require("./lib/themes");
const { validate } = require("./lib/validate");

const quiet = process.argv.includes("--quiet");

function run() {
  let errorCount = 0;
  let warningCount = 0;

  for (const compiled of loadThemes()) {
    const { errors, warnings } = validate(compiled);
    errorCount += errors.length;
    warningCount += warnings.length;

    const shown = quiet ? errors : [...errors, ...warnings];
    if (!shown.length) continue;

    console.log(`\n${compiled.theme.name} (${compiled.file})`);
    errors.forEach((e) => console.log(`  ✗ ${e}`));
    if (!quiet) warnings.forEach((w) => console.log(`  ! ${w}`));
  }

  console.log(`\nvalidate: ${errorCount} erro(s), ${warningCount} aviso(s)`);
  return errorCount === 0;
}

module.exports = { run };

if (require.main === module) {
  process.exitCode = run() ? 0 : 1;
}
