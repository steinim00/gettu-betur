// Einskiptis skrifta: hleður bókum úr metsölulistanum (jólabókaflóð 2026)
// inn í "bokalisti" safnið - sömu bækur og eru í bokalisti.html,
// þ.e. þær einu sem höfðu staðfesta kápumynd til að vitna í. Myndirnar eru
// þegar í repo-inu (myndir/baekur/), vísað í með relative slóð.
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

const BAEKUR = [
  { hofundur: "Hallgrímur Helgason", titill: "Enginn deyr í IKEA", kapaSlod: "myndir/baekur/enginn-deyr-i-ikea.jpg" },
  { hofundur: "Bergur Ebbi Benediktsson", titill: "Öld ímyndunaraflsins", kapaSlod: "myndir/baekur/old-imyndunaraflsins.jpg" },
  { hofundur: "Gisèle Pelicot", titill: "Óður til lífsins", kapaSlod: "myndir/baekur/odur-til-lifsins.jpg" },
  { hofundur: "Ólafur Ragnar Grímsson", titill: "Vegferð um veröldina", kapaSlod: "myndir/baekur/vegferd-um-veroldina.jpg" },
  { hofundur: "Óttar Sveinsson", titill: "Útkall - Þrekvirki í Djúpinu", kapaSlod: "myndir/baekur/utkall.jpg" }
];

async function finnaEdaBuaTilVerkefni(titill) {
  const snap = await db.collection("verkefni").where("title", "==", titill).get();
  if (!snap.empty) return snap.docs[0].id;
  const ref = await db.collection("verkefni").add({
    title: titill,
    slides: [],
    active: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return ref.id;
}

async function main() {
  const verkefniId = await finnaEdaBuaTilVerkefni("Bókalisti");
  console.log(`Nota verkefnið "Bókalisti" (${verkefniId}).`);

  let batch = db.batch();
  let fjoldiIBatch = 0;
  let heild = 0;

  for (const b of BAEKUR) {
    const q1Ref = db.collection("questions").doc();
    const q2Ref = db.collection("questions").doc();

    batch.set(q1Ref, {
      text: `Hver skrifaði "${b.titill}"?`,
      verkefniId,
      active: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      image: b.kapaSlod
    });
    batch.set(db.collection("answers").doc(q1Ref.id), { correctAnswers: [samraema(b.hofundur)] });

    batch.set(q2Ref, {
      text: `Hvaða bók skrifaði ${b.hofundur}?`,
      verkefniId,
      active: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    batch.set(db.collection("answers").doc(q2Ref.id), { correctAnswers: [samraema(b.titill)] });

    batch.set(db.collection("bokalisti").doc(), {
      hofundur: b.hofundur,
      titill: b.titill,
      kapaSlod: b.kapaSlod,
      verkefniId,
      q1Id: q1Ref.id,
      q2Id: q2Ref.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    fjoldiIBatch += 5;
    heild++;
  }
  await batch.commit();

  console.log(`Bætti við ${heild} bókum (${heild * 2} spurningar, óvirkar) í Bókalistann.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
