// Les allar .pptx skrár í ./innsláttur og skrifar hrátt textaefni hverrar skyggnu
// í slides.json, tilbúið fyrir build-questions.js.
//
// Notkun: node extract-pptx.js [mappa-með-pptx-skrám] [úttaksskrá]
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const innMappa = process.argv[2] || path.join(__dirname, "innsláttur");
const utskrift = process.argv[3] || path.join(__dirname, "slides.json");

function afkodaXmlStafi(str) {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function lesSkyggnur(pptxSlodi) {
  const zip = new AdmZip(pptxSlodi);
  const slideSkrar = zip
    .getEntries()
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
    .sort((a, b) => {
      const na = Number(a.entryName.match(/slide(\d+)\.xml/)[1]);
      const nb = Number(b.entryName.match(/slide(\d+)\.xml/)[1]);
      return na - nb;
    });

  return slideSkrar.map((entry, index) => {
    const xml = entry.getData().toString("utf8");
    // Hver <a:p> er efnisgrein/punktur; texti innan hennar er í <a:t> tögum.
    const malsgreinar = xml.match(/<a:p>.*?<\/a:p>/gs) || [];
    const linur = malsgreinar
      .map((mg) => {
        const textar = mg.match(/<a:t>(.*?)<\/a:t>/gs) || [];
        return textar.map((t) => afkodaXmlStafi(t.replace(/<\/?a:t>/g, ""))).join("");
      })
      .filter((lina) => lina.trim().length > 0);

    return { slide: index + 1, file: path.basename(pptxSlodi), lines: linur };
  });
}

if (!fs.existsSync(innMappa)) {
  console.error(`Mappan '${innMappa}' er ekki til. Settu .pptx skjölin þín þar.`);
  process.exit(1);
}

const pptxSkrar = fs.readdirSync(innMappa).filter((f) => f.toLowerCase().endsWith(".pptx"));
if (pptxSkrar.length === 0) {
  console.error(`Fann engar .pptx skrár í '${innMappa}'.`);
  process.exit(1);
}

let allarSkyggnur = [];
for (const skra of pptxSkrar) {
  console.log(`Les ${skra}…`);
  allarSkyggnur = allarSkyggnur.concat(lesSkyggnur(path.join(innMappa, skra)));
}

fs.writeFileSync(utskrift, JSON.stringify(allarSkyggnur, null, 2), "utf8");
console.log(`Skrifaði ${allarSkyggnur.length} skyggnur í ${utskrift}`);
