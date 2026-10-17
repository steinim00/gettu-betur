// Einskiptis skrifta: býr til verkefnið "Eðlis- og efnafræði" og hleður inn
// þremur efnisflokkum - SI-grunneiningum, fyrstu 10 frumefnum lotukerfisins
// (bæði nafn->númer og númer->nafn átt) og E=MC²-jöfnunni - allt sem venjulegar
// spurningar+svör, óvirkt (active: false) þar til kveikt er á í stjórnborðinu.
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

const VERKEFNA_TITILL = "Eðlis- og efnafræði";

function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

// [spurning, [rétt svör]]
const SPURNINGAR = [
  // --- SI-grunneiningar ---
  ["Hvaða SI-eining er notuð til að mæla lengd?", ["Metri"]],
  ["Hvaða SI-eining er notuð til að mæla massa?", ["Kílógramm"]],
  ["Hvaða SI-eining er notuð til að mæla tíma?", ["Sekúnda"]],
  ["Hvaða SI-eining er notuð til að mæla rafstraum?", ["Amper"]],
  ["Hvaða SI-eining er notuð til að mæla hitastig?", ["Kelvin"]],
  ["Hvaða SI-eining er notuð til að mæla efnismagn?", ["Mól"]],
  ["Hvaða SI-eining er notuð til að mæla ljósstyrk?", ["Kandela"]],

  // --- Fyrstu 10 frumefni lotukerfisins (nafn <-> númer, báðar áttir) ---
  ["Hvaða frumefni er númer 1 í lotukerfinu?", ["Vetni"]],
  ["Hvaða númer er Vetni í lotukerfinu?", ["1"]],
  ["Hvaða frumefni er númer 2 í lotukerfinu?", ["Helín", "Helíum"]],
  ["Hvaða númer er Helín í lotukerfinu?", ["2"]],
  ["Hvaða frumefni er númer 3 í lotukerfinu?", ["Litín", "Litíum"]],
  ["Hvaða númer er Litín í lotukerfinu?", ["3"]],
  ["Hvaða frumefni er númer 4 í lotukerfinu?", ["Beryllín", "Beryllíum"]],
  ["Hvaða númer er Beryllín í lotukerfinu?", ["4"]],
  ["Hvaða frumefni er númer 5 í lotukerfinu?", ["Bór"]],
  ["Hvaða númer er Bór í lotukerfinu?", ["5"]],
  ["Hvaða frumefni er númer 6 í lotukerfinu?", ["Kolefni"]],
  ["Hvaða númer er Kolefni í lotukerfinu?", ["6"]],
  ["Hvaða frumefni er númer 7 í lotukerfinu?", ["Köfnunarefni"]],
  ["Hvaða númer er Köfnunarefni í lotukerfinu?", ["7"]],
  ["Hvaða frumefni er númer 8 í lotukerfinu?", ["Súrefni"]],
  ["Hvaða númer er Súrefni í lotukerfinu?", ["8"]],
  ["Hvaða frumefni er númer 9 í lotukerfinu?", ["Flúor"]],
  ["Hvaða númer er Flúor í lotukerfinu?", ["9"]],
  ["Hvaða frumefni er númer 10 í lotukerfinu?", ["Neon"]],
  ["Hvaða númer er Neon í lotukerfinu?", ["10"]],

  // --- E = MC² ---
  ["Hvað táknar E í jöfnunni E = MC²?", ["Orka"]],
  ["Hvað táknar M í jöfnunni E = MC²?", ["Massi"]],
  ["Hvað táknar C í jöfnunni E = MC²?", ["Ljóshraði"]]
];

async function main() {
  const verkefniRef = db.collection("verkefni").doc();
  await verkefniRef.set({
    title: VERKEFNA_TITILL,
    slides: [
      {
        title: VERKEFNA_TITILL,
        body: `${SPURNINGAR.length} spurningar um SI-einingar, fyrstu 10 frumefni lotukerfisins og E=MC². Smelltu á "Áfram í spurningar" til að byrja.`
      }
    ],
    active: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`Bjó til verkefnið "${VERKEFNA_TITILL}" (${verkefniRef.id}), óvirkt.`);

  let batch = db.batch();
  let fjoldiIBatch = 0;
  let heild = 0;

  for (const [texti, svor] of SPURNINGAR) {
    const questionRef = db.collection("questions").doc();
    batch.set(questionRef, {
      text: texti,
      verkefniId: verkefniRef.id,
      active: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    batch.set(db.collection("answers").doc(questionRef.id), {
      correctAnswers: svor.map(samraema)
    });
    fjoldiIBatch += 2;
    heild++;

    if (fjoldiIBatch >= 450) {
      await batch.commit();
      batch = db.batch();
      fjoldiIBatch = 0;
    }
  }
  if (fjoldiIBatch > 0) await batch.commit();

  console.log(`Hlóð inn ${heild} spurningum (óvirkar, svör sett) í "${VERKEFNA_TITILL}".`);
  console.log("Kveiktu á verkefninu og spurningunum í stjórnborðinu þegar þú ert tilbúin/n.");
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
