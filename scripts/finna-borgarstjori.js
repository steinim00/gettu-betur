// Einskiptis LESTRARskrifta: finnur spurningar sem minnast á "borgarstjór".
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

async function main() {
  const spurningarSnap = await db.collection("questions").get();
  const treffur = spurningarSnap.docs.filter((d) => (d.data().text || "").toLowerCase().includes("borgarstjór"));

  console.log(`Fann ${treffur.length} spurningu(r) sem minnast á "borgarstjór":`);
  for (const d of treffur) {
    const svarSnap = await db.collection("answers").doc(d.id).get();
    console.log(`\nID: ${d.id}`);
    console.log(`Verkefni: ${d.data().verkefniId}`);
    console.log(`Texti: ${d.data().text}`);
    console.log(`Virk: ${d.data().active}`);
    console.log(`Rétt svör: ${JSON.stringify(svarSnap.exists ? svarSnap.data().correctAnswers : "ENGIN")}`);
  }
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
