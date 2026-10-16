// Einskiptis skrifta: býr til verkefnið "Mannkynssöguprófið" og hleður inn
// spurningatextunum (sóttir úr Form-svarblaðinu í Drive - sjá spjallsöguna).
// Verkefnið OG allar spurningarnar fara inn óvirk (active: false) svo
// nemendur sjái þau ekki fyrr en kennari kveikir sérstaklega á þeim í
// stjórnborðinu. Engin rétt svör eru sett - þau þarf að bæta við handvirkt
// í stjórnborðinu áður en kveikt er á spurningunum.
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

const VERKEFNA_TITILL = "Mannkynssöguprófið";

const SPURNINGAR = [
  "Hver vóg Gordíashnútinn?",
  "Yfir hvaða á fór Júlíus Sesar þegar hann sagði \"teningunum er kastað\"?",
  "Hver var fyrsti keisari Rómarveldis?",
  "Hver hlaut mikinn ósigur við Katalánsvelli árið 451?",
  "Hvaða ár flúði Múhameð spámaður frá Mekku til Medínu?",
  "Hver lét krýna sig Rómarkeisara á jólanótt árið 800?",
  "Hver fullkomaði prentæknina?",
  "Hver hannaði hvolfþak Péturskirkunar í Róm?",
  "Hver var kölluð meydrotningin?",
  "Hver á að hafa sagt: \"Ríkið, það er ég\"?",
  "Hvað hét byltingahreyfingin sem var leidd af Maximilien de Robespierre?",
  "Hver var fyrsti einstaklingurinn til að vinna tvenn Nóbelverðlaun?",
  "Undir hvaða nafni þekkjum við Vladimir Uljanov betur?",
  "Hvað hét könnunarskip Roald Amundsen að Suðurpólnum?",
  "Hver málaði verkið Guernica?",
  "Hvaða dag og ár varð Winston Churchill forsætisráðherra Breta?",
  "Hvað hét eiginkona Adolfs Hitlers?",
  "Hver stofnaði fimmta lýðveldið í Frakklandi?",
  "Hver drap John F. Kennedy?",
  "Hvað var Nelson Mandela lengi í fangelsi?"
];

async function main() {
  const verkefniRef = db.collection("verkefni").doc();
  await verkefniRef.set({
    title: VERKEFNA_TITILL,
    slides: [
      {
        title: VERKEFNA_TITILL,
        body: `${SPURNINGAR.length} spurningar. Smelltu á "Áfram í spurningar" til að byrja.`
      }
    ],
    active: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`Bjó til verkefnið "${VERKEFNA_TITILL}" (${verkefniRef.id}), óvirkt.`);

  let batch = db.batch();
  let fjoldiIBatch = 0;
  let heild = 0;

  for (const texti of SPURNINGAR) {
    const questionRef = db.collection("questions").doc();
    batch.set(questionRef, {
      text: texti,
      verkefniId: verkefniRef.id,
      active: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    batch.set(db.collection("answers").doc(questionRef.id), { correctAnswers: [] });
    fjoldiIBatch += 2;
    heild++;

    if (fjoldiIBatch >= 450) {
      await batch.commit();
      batch = db.batch();
      fjoldiIBatch = 0;
    }
  }
  if (fjoldiIBatch > 0) await batch.commit();

  console.log(`Hlóð inn ${heild} spurningum (óvirkar, engin svör sett enn).`);
  console.log("Næstu skref: bættu réttu svari við hverja spurningu í stjórnborðinu, kveiktu svo á þeim og á verkefninu sjálfu þegar þú ert tilbúin/n.");
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
