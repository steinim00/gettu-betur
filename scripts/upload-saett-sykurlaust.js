// Býr til verkefnið "Súrt & Sykurlaust" (allar 79 glærur, til skoðunar) og
// hleður 92 tengdum spurningum inn, báðum hlutum virkum strax (efnið er þegar
// yfirfarið handvirkt).
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
const slidesSlodi = path.join(__dirname, "saett-sykurlaust-verkefni-slides.json");
const draftSlodi = path.join(__dirname, "saett-sykurlaust-draft.json");

for (const slodi of [serviceAccountSlodi, slidesSlodi, draftSlodi]) {
  if (!fs.existsSync(slodi)) {
    console.error(`Fann ekki ${slodi}. Keyrðu fyrst build-saett-sykurlaust.js.`);
    process.exit(1);
  }
}

admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

async function main() {
  const slides = JSON.parse(fs.readFileSync(slidesSlodi, "utf8"));
  const spurningar = JSON.parse(fs.readFileSync(draftSlodi, "utf8"));

  const verkefniRef = db.collection("verkefni").doc();
  await verkefniRef.set({
    title: "Súrt & Sykurlaust — Gettu Betur 2018",
    slides,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`Bjó til verkefni "${verkefniRef.id}" með ${slides.length} glærum.`);

  let batch = db.batch();
  let fjoldiIBatch = 0;
  let heildarfjoldi = 0;

  for (const s of spurningar) {
    const questionRef = db.collection("questions").doc();
    batch.set(questionRef, {
      text: s.text,
      verkefniId: verkefniRef.id,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    batch.set(db.collection("answers").doc(questionRef.id), { correctAnswers: s.correctAnswers });

    fjoldiIBatch += 2;
    heildarfjoldi++;

    if (fjoldiIBatch >= 480) {
      await batch.commit();
      batch = db.batch();
      fjoldiIBatch = 0;
    }
  }

  if (fjoldiIBatch > 0) await batch.commit();
  console.log(`Hlóð ${heildarfjoldi} spurningum inn, tengdum verkefninu, allar virkar.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
