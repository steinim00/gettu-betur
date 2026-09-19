// Hleður spurningum úr questions-draft.json (eftir handvirka yfirferð!) inn í Firestore.
// Spurningar sem enn eru merktar "needsReview": true eru sleppt.
// Nýjar spurningar fara inn sem "active": false svo þær birtast ekki í leiknum
// fyrr en admin kveikir sérstaklega á þeim í stjórnborðinu.
//
// Undirbúningur:
//   1. Firebase Console -> Project settings -> Service accounts -> Generate new private key
//   2. Vista skrána sem scripts/serviceAccountKey.json (hún er í .gitignore, lekur ekki upp)
//
// Notkun: node upload-questions.js [questions-draft.json] ["Titill verkefnis"]
// Ef titill er gefinn er búið til eitt verkefni (með lýsingarglæru) og allar
// spurningarnar tengdar við það - annars fara þær inn ótengdar neinu verkefni.
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const draftSkra = process.argv[2] || path.join(__dirname, "questions-draft.json");
const verkefnaTitill = process.argv[3] || null;
const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");

if (!fs.existsSync(serviceAccountSlodi)) {
  console.error(
    "Fann ekki scripts/serviceAccountKey.json. Sæktu hana í Firebase Console -> Project settings -> Service accounts."
  );
  process.exit(1);
}

if (!fs.existsSync(draftSkra)) {
  console.error(`Fann ekki ${draftSkra}. Keyrðu fyrst build-questions.js.`);
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

async function main() {
  const spurningar = JSON.parse(fs.readFileSync(draftSkra, "utf8"));
  const tilbunar = spurningar.filter((s) => !s.needsReview);
  const slepptar = spurningar.length - tilbunar.length;

  if (slepptar > 0) {
    console.log(`Sleppi ${slepptar} spurningum sem eru merktar needsReview: true.`);
  }
  if (tilbunar.length === 0) {
    console.log("Engar spurningar tilbúnar til að hlaða inn.");
    return;
  }

  let verkefniId = "";
  if (verkefnaTitill) {
    const verkefniRef = db.collection("verkefni").doc();
    await verkefniRef.set({
      title: verkefnaTitill,
      slides: [
        {
          title: verkefnaTitill,
          body: `${tilbunar.length} spurningar. Smelltu á "Áfram í spurningar" til að byrja.`
        }
      ],
      active: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    verkefniId = verkefniRef.id;
    console.log(`Bjó til verkefni "${verkefnaTitill}" (${verkefniId}).`);
  }

  let batch = db.batch();
  let fjoldiIBatch = 0;
  let heildarfjoldi = 0;

  for (const s of tilbunar) {
    const questionRef = db.collection("questions").doc();
    batch.set(questionRef, {
      text: s.text,
      verkefniId,
      active: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    batch.set(db.collection("answers").doc(questionRef.id), { correctAnswers: s.correctAnswers });

    fjoldiIBatch += 2;
    heildarfjoldi++;

    // Firestore leyfir hámark 500 aðgerðir í einum batch.
    if (fjoldiIBatch >= 480) {
      await batch.commit();
      batch = db.batch();
      fjoldiIBatch = 0;
    }
  }

  if (fjoldiIBatch > 0) await batch.commit();

  console.log(`Hlóð ${heildarfjoldi} spurningum inn í Firestore (óvirkar - kveiktu á þeim í stjórnborðinu).`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
