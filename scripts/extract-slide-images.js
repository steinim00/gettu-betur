// Dregur út myndina sem fylgir hverri glæru í .pptx skjali (ein portrett-mynd á
// glæru í þessu tilviki) og vistar þær í ../images/<undirmappa>/<skyggnunúmer>.<ending>.
//
// Notkun: node extract-slide-images.js <slóð-á-pptx> <undirmappa-fyrir-myndir>
// Dæmi:   node extract-slide-images.js innsláttur/hrifamiklir-einstaklingar.pptx hrifamiklir
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const pptxSlodi = process.argv[2];
const undirmappa = process.argv[3];

if (!pptxSlodi || !undirmappa) {
  console.error("Notkun: node extract-slide-images.js <slóð-á-pptx> <undirmappa-fyrir-myndir>");
  process.exit(1);
}

const utMappa = path.join(__dirname, "..", "images", undirmappa);
fs.mkdirSync(utMappa, { recursive: true });

const zip = new AdmZip(pptxSlodi);
const entries = zip.getEntries();
const entryMap = new Map(entries.map((e) => [e.entryName, e]));

const slideSkrar = entries
  .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
  .map((e) => ({ n: Number(e.entryName.match(/slide(\d+)\.xml/)[1]), entry: e }))
  .sort((a, b) => a.n - b.n);

const niðurstada = {};

for (const { n, entry } of slideSkrar) {
  const relsNafn = `ppt/slides/_rels/slide${n}.xml.rels`;
  const relsEntry = entryMap.get(relsNafn);
  if (!relsEntry) continue;

  const relsXml = relsEntry.getData().toString("utf8");
  const slideXml = entry.getData().toString("utf8");

  const embedMatch = slideXml.match(/r:embed="([^"]+)"/);
  if (!embedMatch) continue;
  const rId = embedMatch[1];

  const relMatch = relsXml.match(
    new RegExp(`<Relationship Id="${rId}"[^>]*Target="([^"]+)"`)
  );
  if (!relMatch) continue;

  const midlaSlodRelative = relMatch[1].replace(/^\.\.\//, "");
  const midlaEntry = entryMap.get(`ppt/${midlaSlodRelative}`);
  if (!midlaEntry) continue;

  const ending = path.extname(midlaSlodRelative) || ".jpg";
  const utskriftarnafn = `${n}${ending}`;
  fs.writeFileSync(path.join(utMappa, utskriftarnafn), midlaEntry.getData());
  niðurstada[n] = `images/${undirmappa}/${utskriftarnafn}`;
  console.log(`Skyggna ${n}: ${utskriftarnafn}`);
}

const kortSlodi = path.join(__dirname, `${undirmappa}-myndir.json`);
fs.writeFileSync(kortSlodi, JSON.stringify(niðurstada, null, 2), "utf8");
console.log(`\nVistaði ${Object.keys(niðurstada).length} myndir í ${utMappa}`);
console.log(`Kort (skyggnunúmer -> slóð) skrifað í ${kortSlodi}`);
