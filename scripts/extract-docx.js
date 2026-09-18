// Les allar .docx skrár í ./innsláttur og skrifar hrátt textaefni (með feitletrun
// varðveittri sem **texti**) í paragraphs.json, tilbúið fyrir build-questions.js.
//
// Notkun: node extract-docx.js [mappa-með-docx-skrám] [úttaksskrá]
const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

const innMappa = process.argv[2] || path.join(__dirname, "innsláttur");
const utskrift = process.argv[3] || path.join(__dirname, "paragraphs.json");

async function lesDocx(docxSlodi) {
  const { value: markdown } = await mammoth.convertToMarkdown({ path: docxSlodi });
  const linur = markdown
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return { file: path.basename(docxSlodi), lines: linur };
}

async function main() {
  if (!fs.existsSync(innMappa)) {
    console.error(`Mappan '${innMappa}' er ekki til. Settu .docx skjölin þín þar.`);
    process.exit(1);
  }

  const docxSkrar = fs.readdirSync(innMappa).filter((f) => f.toLowerCase().endsWith(".docx"));
  if (docxSkrar.length === 0) {
    console.error(`Fann engar .docx skrár í '${innMappa}'.`);
    process.exit(1);
  }

  const niðurstöður = [];
  for (const skra of docxSkrar) {
    console.log(`Les ${skra}…`);
    niðurstöður.push(await lesDocx(path.join(innMappa, skra)));
  }

  fs.writeFileSync(utskrift, JSON.stringify(niðurstöður, null, 2), "utf8");
  console.log(`Skrifaði efni úr ${niðurstöður.length} skjali/skjölum í ${utskrift}`);
}

main();
