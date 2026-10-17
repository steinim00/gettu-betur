// Einskiptis skrifta: býr til verkefnið "Eðlis- og efnafræði" og hleður inn
// þremur efnisflokkum - SI-grunneiningum, fyrstu 10 frumefnum lotukerfisins
// (bæði nafn->tákn og tákn->nafn átt) og E=MC²-jöfnunni - allt sem venjulegar
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

  // --- Fyrstu 10 frumefni lotukerfisins (nafn + efnatákn, báðar áttir) ---
  ["Hvaða frumefni er númer 1 í lotukerfinu?", ["Vetni"]],
  ["Hvert er efnatákn vetnis?", ["H"]],
  ["Hvaða frumefni er númer 2 í lotukerfinu?", ["Helín", "Helíum"]],
  ["Hvert er efnatákn helíns?", ["He"]],
  ["Hvaða frumefni er númer 3 í lotukerfinu?", ["Litín", "Litíum"]],
  ["Hvert er efnatákn litíns?", ["Li"]],
  ["Hvaða frumefni er númer 4 í lotukerfinu?", ["Beryllín", "Beryllíum"]],
  ["Hvert er efnatákn beryllíns?", ["Be"]],
  ["Hvaða frumefni er númer 5 í lotukerfinu?", ["Bór"]],
  ["Hvert er efnatákn bórs?", ["B"]],
  ["Hvaða frumefni er númer 6 í lotukerfinu?", ["Kolefni"]],
  ["Hvert er efnatákn kolefnis?", ["C"]],
  ["Hvaða frumefni er númer 7 í lotukerfinu?", ["Köfnunarefni"]],
  ["Hvert er efnatákn köfnunarefnis?", ["N"]],
  ["Hvaða frumefni er númer 8 í lotukerfinu?", ["Súrefni"]],
  ["Hvert er efnatákn súrefnis?", ["O"]],
  ["Hvaða frumefni er númer 9 í lotukerfinu?", ["Flúor"]],
  ["Hvert er efnatákn flúors?", ["F"]],
  ["Hvaða frumefni er númer 10 í lotukerfinu?", ["Neon"]],
  ["Hvert er efnatákn neons?", ["Ne"]],

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
