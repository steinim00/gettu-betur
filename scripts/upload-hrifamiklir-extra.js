// Einskiptis skrifta:
// 1) Finnur "50 áhrifamiklir einstaklingar" verkefnið og Beethoven-spurninguna
//    í því, og uppfærir orðalag hennar til að spyrja beint um fötlunina.
// 2) Hleður 50 nýjum spurningum úr hrifamiklir-extra-draft.json inn, tengdum
//    sama verkefni, virkum strax.
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
const draftSlodi = path.join(__dirname, "hrifamiklir-extra-draft.json");

for (const slodi of [serviceAccountSlodi, draftSlodi]) {
  if (!fs.existsSync(slodi)) {
    console.error(`Fann ekki ${slodi}.`);
    process.exit(1);
  }
}

admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

const NYR_BEETHOVEN_TEXTI = "Hvaða fötlun hrjáði tónskáldið Ludwig van Beethoven, einkum síðari hluta ævi hans?";
const BEETHOVEN_SVOR = ["heyrnarleysi", "heyrnarlaus", "hann var heyrnarlaus", "heyrnleysi", "heyrnarskerðing"];

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
  const beethovenDoc = spurningarSnap.docs.find((d) => (d.data().text || "").toLowerCase().includes("beethoven"));

  if (beethovenDoc) {
    await beethovenDoc.ref.update({ text: NYR_BEETHOVEN_TEXTI });
    await db.collection("answers").doc(beethovenDoc.id).set({ correctAnswers: BEETHOVEN_SVOR });
    console.log(`Uppfærði Beethoven-spurninguna (${beethovenDoc.id}) með nýju orðalagi.`);
  } else {
    console.warn("Fann enga Beethoven-spurningu til að uppfæra - sleppi því skrefi.");
  }

  const nyjarSpurningar = JSON.parse(fs.readFileSync(draftSlodi, "utf8"));
  let batch = db.batch();
  let fjoldiIBatch = 0;
  let heildarfjoldi = 0;

  for (const s of nyjarSpurningar) {
    const questionRef = db.collection("questions").doc();
    batch.set(questionRef, {
      text: s.text,
      verkefniId,
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

  console.log(`Hlóð ${heildarfjoldi} nýjum spurningum inn, tengdum verkefninu, allar virkar.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
