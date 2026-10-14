// Einskiptis skrifta: bætir "image" (Wikimedia Commons slóð) og "imageCredit"
// við þær spurningar í "50 áhrifamiklir einstaklingar" verkefninu sem eiga
// skilgreinda mynd í hrifamiklir-image-data.js (sjá þá skrá fyrir val á
// myndefni og rökstuðning). Passar spurningar saman við myndir út frá
// nákvæmum "text" streng - spurningar sem ekki finnast í gagnasafninu fá
// enga mynd og eru ekki snertar.
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const { MYNDIR, commonsUrl } = require("./hrifamiklir-image-data.js");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
if (!fs.existsSync(serviceAccountSlodi)) {
  console.error(`Fann ekki ${serviceAccountSlodi}.`);
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

async function main() {
  const verkefnaSnap = await db.collection("verkefni").get();
  const verkefniDoc = verkefnaSnap.docs.find((d) =>
    (d.data().title || "").toLowerCase().includes("áhrifamiklir")
  );
  if (!verkefniDoc) {
    console.error("Fann ekki verkefnið '50 áhrifamiklir einstaklingar...'.");
    process.exit(1);
  }
  const verkefniId = verkefniDoc.id;
  console.log(`Fann verkefnið "${verkefniDoc.data().title}" (${verkefniId}).`);

  const spurningarSnap = await db.collection("questions").where("verkefniId", "==", verkefniId).get();
  console.log(`Verkefnið á ${spurningarSnap.size} spurningar í Firestore.`);

  const textToDoc = new Map(spurningarSnap.docs.map((d) => [(d.data().text || "").trim(), d]));

  let uppfaerdar = 0;
  const ofundnar = [];
  let batch = db.batch();
  let fjoldiIBatch = 0;

  for (const m of MYNDIR) {
    const doc = textToDoc.get(m.text.trim());
    if (!doc) {
      ofundnar.push(m.text);
      continue;
    }
    batch.update(doc.ref, {
      image: commonsUrl(m.file),
      imageCredit: "Wikimedia Commons",
      imageAlt: m.alt
    });
    fjoldiIBatch++;
    uppfaerdar++;
    if (fjoldiIBatch >= 450) {
      await batch.commit();
      batch = db.batch();
      fjoldiIBatch = 0;
    }
  }
  if (fjoldiIBatch > 0) await batch.commit();

  console.log(`Uppfærði ${uppfaerdar} af ${MYNDIR.length} spurningum með mynd.`);
  if (ofundnar.length > 0) {
    console.warn(`Fann EKKI eftirfarandi ${ofundnar.length} spurningatexta í Firestore (enginn stafur má skeika):`);
    ofundnar.forEach((t) => console.warn(`  - ${t}`));
  }
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
