// Þáttari fyrir "Grænadeildin" sniðið: "N. Spurningatexti[TAB]SVAR: svar",
// stundum með svarið á sér línu (á eftir auðri línu, inndregið með tabi).
const fs = require("fs");
const path = require("path");

const innSlodi = process.argv[2] || "/tmp/graenadeildin.txt";
const utSlodi = process.argv[3] || path.join(__dirname, "graenadeildin-draft.json");

function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

// Sviga-innihald ("Kísill (Sílikon)") er annað samþykkt svar, ekki hluti af aðalsvarinu.
function svorurUrTexta(hraSvar) {
  const svor = [];
  const svigaMatch = hraSvar.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (svigaMatch) {
    svor.push(svigaMatch[1].trim());
    svor.push(svigaMatch[2].trim());
  } else {
    svor.push(hraSvar.trim());
  }
  return [...new Set(svor.map(samraema).filter(Boolean))];
}

const hraLinur = fs.readFileSync(innSlodi, "utf8").split("\n");

const spurningar = [];
let i = 0;

while (i < hraLinur.length) {
  const lina = hraLinur[i];
  const spurningMatch = lina.match(/^\s*(\d+)\.\s+(.+)$/);

  if (!spurningMatch) {
    i++;
    continue;
  }

  const restOfLine = spurningMatch[2];
  // Þolir smá innsláttarvillur í frumskjalinu ("SVAR 90" án tvípunkts, "SVRA:").
  const samaLinaSvar = restOfLine.match(/^(.*?)\t+SV(?:AR|RA)\s*:?\s*(.+)$/i);

  if (samaLinaSvar) {
    spurningar.push({
      text: samaLinaSvar[1].trim(),
      correctAnswers: svorurUrTexta(samaLinaSvar[2])
    });
    i++;
    continue;
  }

  // Svarið er ekki á sömu línu - leitaðu fram á við þangað til "SVAR:" finnst
  // eða næsta tölusetta spurning byrjar (þá er þessari sleppt, ekkert svar fannst).
  const spurningatexti = restOfLine.trim();
  let j = i + 1;
  let svarFundid = null;

  while (j < hraLinur.length) {
    const naestaLina = hraLinur[j];
    if (/^\s*\d+\.\s+/.test(naestaLina)) break;

    const svarMatch = naestaLina.match(/SV(?:AR|RA)\s*:?\s*(.+)$/i);
    if (svarMatch) {
      svarFundid = svarMatch[1];
      j++;
      break;
    }
    j++;
  }

  if (svarFundid) {
    spurningar.push({ text: spurningatexti, correctAnswers: svorurUrTexta(svarFundid) });
  } else {
    console.warn(`Ekkert svar fannst fyrir: "${spurningatexti}"`);
  }

  i = j;
}

const utkoma = spurningar
  .filter((s) => s.text && s.correctAnswers.length > 0)
  .map((s) => ({ ...s, needsReview: false, source: "Grænadeildin - desember 2020" }));

fs.writeFileSync(utSlodi, JSON.stringify(utkoma, null, 2), "utf8");
console.log(`Þáttaði ${utkoma.length} spurningar úr ${hraLinur.length} línum.`);
console.log(`Skrifað í ${utSlodi}`);
