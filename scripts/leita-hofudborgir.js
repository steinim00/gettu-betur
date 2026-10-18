// Leitar á Wikimedia Commons að einni mynd fyrir hverja (stakstæða) höfuðborg
// í hofudborgir-kort.json og skrifar niðurstöður í hofudborgir-nidurstodur.json
// jafnóðum (endurkeyranleg - sleppir borgum sem þegar eru komnar með
// niðurstöðu). Skrifar EKKERT í Firestore - bara leitin, til yfirferðar.
const fs = require("fs");
const path = require("path");

const UA = "GettuBetur-TriviaApp/1.0 (educational project; contact: steinim00@gmail.com)";
const KORT_SLOD = path.join(__dirname, "hofudborgir-kort.json");
const NIDURSTODUR_SLOD = path.join(__dirname, "hofudborgir-nidurstodur.json");

function seinka(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function leitaCommons(fyrirspurn) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=3&format=json&srsearch=" +
    encodeURIComponent(fyrirspurn);

  for (let tilraun = 0; tilraun < 15; tilraun++) {
    const svar = await fetch(url, { headers: { "User-Agent": UA } });
    if (svar.status === 429) {
      await seinka(20000);
      continue;
    }
    if (!svar.ok) throw new Error(`HTTP ${svar.status} fyrir "${fyrirspurn}"`);
    const gogn = await svar.json();
    const hit = gogn?.query?.search?.[0];
    return hit ? hit.title.replace(/^File:/, "") : null;
  }
  throw new Error(`Gafst upp á "${fyrirspurn}" eftir margar 429-tilraunir`);
}

async function main() {
  const kort = JSON.parse(fs.readFileSync(KORT_SLOD, "utf8"));
  const nidurstodur = fs.existsSync(NIDURSTODUR_SLOD) ? JSON.parse(fs.readFileSync(NIDURSTODUR_SLOD, "utf8")) : {};

  const borgir = Object.keys(kort).filter((b) => !(b in nidurstodur));
  console.log(`${borgir.length} borgir eftir af ${Object.keys(kort).length} (${Object.keys(nidurstodur).length} þegar leitaðar).`);

  for (const [i, borg] of borgir.entries()) {
    try {
      const file = await leitaCommons(`${borg} skyline`);
      nidurstodur[borg] = file;
      console.log(`[${i + 1}/${borgir.length}] ${borg} -> ${file || "(ekkert fannst)"}`);
    } catch (villa) {
      console.error(`[${i + 1}/${borgir.length}] ${borg} -> VILLA: ${villa.message}`);
      nidurstodur[borg] = null;
    }
    fs.writeFileSync(NIDURSTODUR_SLOD, JSON.stringify(nidurstodur, null, 2));
    await seinka(2000);
  }

  console.log("Lokið.");
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
