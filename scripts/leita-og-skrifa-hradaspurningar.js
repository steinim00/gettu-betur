// Tekur inn JSON skrá (questionId -> Wikipedia greinartitill) sem skipunarlínu-
// viðfang, sækir forsíðumynd hverrar greinar af Wikipedia REST API (alltaf á
// endanum hýst á Wikimedia Commons), skrifar niðurstöður í hliðstæða
// -nidurstodur.json (endurkeyranlegt) og skrifar svo image/imageCredit/
// imageAlt beint á questions/{id} í Firestore fyrir þær sem fundust.
const fs = require("fs");
const path = require("path");

const KORT_SLOD = process.argv[2];
if (!KORT_SLOD) {
  console.error("Notkun: node leita-og-skrifa-hradaspurningar.js <kort.json>");
  process.exit(1);
}
const NIDURSTODUR_SLOD = KORT_SLOD.replace(/\.json$/, "-nidurstodur.json");

const UA = "GettuBetur-TriviaApp/1.0 (educational project; contact: steinim00@gmail.com)";

function seinka(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sumarySlod(titill) {
  const url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(titill.replace(/ /g, "_"));
  for (let tilraun = 0; tilraun < 10; tilraun++) {
    const svar = await fetch(url, { headers: { "User-Agent": UA } });
    if (svar.status === 429) {
      await seinka(15000);
      continue;
    }
    if (svar.status === 404) return null;
    if (!svar.ok) throw new Error(`HTTP ${svar.status} fyrir "${titill}"`);
    const gogn = await svar.json();
    const slod = gogn?.originalimage?.source || gogn?.thumbnail?.source || null;
    return slod ? { slod, titill: gogn.title } : null;
  }
  throw new Error(`Gafst upp á "${titill}" eftir margar 429-tilraunir`);
}

async function leitaAllt() {
  const kort = JSON.parse(fs.readFileSync(KORT_SLOD, "utf8"));
  const nidurstodur = fs.existsSync(NIDURSTODUR_SLOD) ? JSON.parse(fs.readFileSync(NIDURSTODUR_SLOD, "utf8")) : {};

  // Skyndiminni fyrir titla sem koma oftar en einu sinni fyrir.
  const titlaKort = new Map();
  const idListi = Object.keys(kort).filter((id) => !(id in nidurstodur));
  console.log(`${idListi.length} spurningar eftir af ${Object.keys(kort).length}.`);

  for (const [i, id] of idListi.entries()) {
    const titill = kort[id];
    try {
      if (!titlaKort.has(titill)) {
        titlaKort.set(titill, await sumarySlod(titill));
        await seinka(1000);
      }
      const gildi = titlaKort.get(titill);
      nidurstodur[id] = gildi;
      console.log(`[${i + 1}/${idListi.length}] ${titill} -> ${gildi ? gildi.slod : "(ekkert fannst)"}`);
    } catch (villa) {
      console.error(`[${i + 1}/${idListi.length}] ${titill} -> VILLA: ${villa.message}`);
      nidurstodur[id] = null;
    }
    fs.writeFileSync(NIDURSTODUR_SLOD, JSON.stringify(nidurstodur, null, 2));
  }
  console.log("Leit lokið.");
  return nidurstodur;
}

async function skrifaFirestore(nidurstodur, kort) {
  const admin = require("firebase-admin");
  const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
  admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
  const db = admin.firestore();

  let batch = db.batch();
  let fjoldiIBatch = 0;
  let skrifad = 0;
  let sleppt = 0;

  for (const [id, gildi] of Object.entries(nidurstodur)) {
    if (!gildi) {
      sleppt++;
      continue;
    }
    batch.update(db.collection("questions").doc(id), {
      image: gildi.slod,
      imageCredit: "Wikimedia Commons",
      imageAlt: gildi.titill
    });
    skrifad++;
    fjoldiIBatch++;
    if (fjoldiIBatch >= 450) {
      await batch.commit();
      batch = db.batch();
      fjoldiIBatch = 0;
    }
  }
  if (fjoldiIBatch > 0) await batch.commit();
  console.log(`\nSkrifaði mynd á ${skrifad} spurningar (${sleppt} án myndar).`);
}

async function main() {
  const kort = JSON.parse(fs.readFileSync(KORT_SLOD, "utf8"));
  const nidurstodur = await leitaAllt();
  await skrifaFirestore(nidurstodur, kort);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
