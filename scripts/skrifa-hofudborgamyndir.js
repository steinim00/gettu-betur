// Skrifar niðurstöður hofudborgir-nidurstodur.json (sjá leita-hofudborgir.js
// og leita-hofudborgir-wikipedia.js) á spurningarnar í hofudborgir-kort.json.
// Gildi í nidurstodur er annaðhvort Commons skráarheiti (strengur - þá er
// Special:FilePath notað, sama snið og annars staðar) eða {beinSlod} frá
// Wikipedia REST API (þegar full-texta Commons-leitin brást - beinSlod er
// samt alltaf á endanum hýst á Wikimedia Commons, sótt í gegnum Wikipedia).
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

function commonsUrl(file) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;
}

async function main() {
  const kort = JSON.parse(fs.readFileSync(path.join(__dirname, "hofudborgir-kort.json"), "utf8"));
  const nidurstodur = JSON.parse(fs.readFileSync(path.join(__dirname, "hofudborgir-nidurstodur.json"), "utf8"));

  let batch = db.batch();
  let fjoldiIBatch = 0;
  let fjoldiSpurninga = 0;
  let sleppt = 0;

  for (const [borg, idListi] of Object.entries(kort)) {
    const gildi = nidurstodur[borg];
    if (!gildi) {
      sleppt++;
      console.log("SLEPPT (engin mynd):", borg);
      continue;
    }
    const imageUrl = typeof gildi === "string" ? commonsUrl(gildi) : gildi.beinSlod;

    for (const id of idListi) {
      batch.update(db.collection("questions").doc(id), {
        image: imageUrl,
        imageCredit: "Wikimedia Commons",
        imageAlt: borg
      });
      fjoldiSpurninga++;
      fjoldiIBatch++;
      if (fjoldiIBatch >= 450) {
        await batch.commit();
        batch = db.batch();
        fjoldiIBatch = 0;
      }
    }
  }

  if (fjoldiIBatch > 0) await batch.commit();
  console.log(`\nSkrifaði mynd á ${fjoldiSpurninga} spurningar (${sleppt} borgir sleppt - engin mynd fannst).`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
