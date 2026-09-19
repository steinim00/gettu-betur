// Býr til questions-draft.json úr slides.json (úr extract-pptx.js) og/eða
// paragraphs.json (úr extract-docx.js) með einföldum þumalputtareglum.
//
// ÞETTA ER UPPKAST — farðu alltaf yfir questions-draft.json í höndunum og
// leiðréttu/fjarlægðu spurningar merktar "needsReview": true áður en þú
// keyrir upload-questions.js.
//
// Gettu Betur er með OPNUM svörum (ekki fjölvalskostum), svo þessi skrifta
// leitar að spurningatexta og réttu svari í línunum:
//   - Lína sem byrjar á "Spurning" er spurningatextinn.
//   - Lína sem byrjar á "Svar" er rétta svarið (má hafa fleiri en eitt
//     samþykkt afbrigði aðskilið með skástriki, t.d. "Svar: Reykjavík / Rvk").
const fs = require("fs");
const path = require("path");

const slidesSkra = path.join(__dirname, "slides.json");
const paragraphsSkra = path.join(__dirname, "paragraphs.json");
const utskrift = process.argv[2] || path.join(__dirname, "questions-draft.json");

function samraema(text) {
  return text.trim().toLowerCase().replace(/\*\*/g, "").replace(/\s+/g, " ");
}

function greinaBlokk(linur, uppspretta) {
  const spurningLina =
    linur.find((l) => /^spurning\b\s*[:\-]?\s*/i.test(l)) ||
    linur.find((l) => l.trim().endsWith("?")) ||
    linur[0] ||
    "";

  const spurningTexti = spurningLina
    .replace(/^spurning\b\s*[:\-]?\s*/i, "")
    .replace(/^\d+[\.\)]\s*/, "")
    .trim();

  const svarLina = linur.find((l) => l !== spurningLina && /^svar\b\s*[:\-]?\s*/i.test(l));
  const svarTexti = svarLina ? svarLina.replace(/^svar\b\s*[:\-]?\s*/i, "").trim() : "";
  const correctAnswers = svarTexti
    ? svarTexti.split("/").map(samraema).filter(Boolean)
    : [];

  return {
    text: spurningTexti,
    correctAnswers,
    needsReview: !spurningTexti || correctAnswers.length === 0,
    source: uppspretta
  };
}

const spurningar = [];

if (fs.existsSync(slidesSkra)) {
  const skyggnur = JSON.parse(fs.readFileSync(slidesSkra, "utf8"));
  for (const skyggna of skyggnur) {
    if (skyggna.lines.length === 0) continue;
    spurningar.push(greinaBlokk(skyggna.lines, `${skyggna.file} - skyggna ${skyggna.slide}`));
  }
  console.log(`Vann úr ${skyggnur.length} skyggnum úr slides.json`);
}

if (fs.existsSync(paragraphsSkra)) {
  const skjol = JSON.parse(fs.readFileSync(paragraphsSkra, "utf8"));
  for (const skjal of skjol) {
    const blokkir = [];
    let nuverandi = null;

    for (const lina of skjal.lines) {
      const erNyBlokk = /^spurning\b/i.test(lina) || /^\d+[\.\)]\s+/.test(lina);
      if (erNyBlokk) {
        if (nuverandi) blokkir.push(nuverandi);
        nuverandi = [lina];
      } else if (nuverandi) {
        nuverandi.push(lina);
      }
    }
    if (nuverandi) blokkir.push(nuverandi);

    blokkir.forEach((linur, i) => {
      spurningar.push(greinaBlokk(linur, `${skjal.file} - efnisgrein ${i + 1}`));
    });
    console.log(`Vann úr ${blokkir.length} spurningablokkum úr ${skjal.file}`);
  }
}

if (spurningar.length === 0) {
  console.error(
    "Fann hvorki slides.json né paragraphs.json. Keyrðu fyrst extract-pptx.js eða extract-docx.js."
  );
  process.exit(1);
}

fs.writeFileSync(utskrift, JSON.stringify(spurningar, null, 2), "utf8");

const faerReview = spurningar.filter((s) => s.needsReview).length;
console.log(`\nSkrifaði ${spurningar.length} spurningar í ${utskrift}`);
console.log(`${spurningar.length - faerReview} greindust sjálfkrafa, ${faerReview} þurfa yfirferð (needsReview: true).`);
console.log("Farðu yfir skrána í höndunum áður en þú keyrir upload-questions.js.");
