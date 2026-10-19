// Skrifar myndir (Wikimedia Commons) á Hraðaspurningar úr JSON skrá
// { questionId: { slod, titill } } - önnur umferð eftir yfirferð á þeim
// spurningum sem fengu ekki mynd í fyrstu umferð. Skrifar aðeins á
// spurningar sem hafa enga mynd fyrir.
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

async function main() {
  const gogn = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  let batch = db.batch();
  let n = 0;
  let skrifad = 0;
  for (const [id, g] of Object.entries(gogn)) {
    const ref = db.collection("questions").doc(id);
    const snap = await ref.get();
    if (!snap.exists || snap.data().image) continue;
    batch.update(ref, { image: g.slod, imageCredit: "Wikimedia Commons", imageAlt: g.titill });
    skrifad++;
    if (++n >= 400) {
      await batch.commit();
      batch = db.batch();
      n = 0;
    }
  }
  if (n) await batch.commit();
  console.log(`Skrifaði mynd á ${skrifad} spurningar.`);
}
main().catch((v) => {
  console.error(v);
  process.exit(1);
});
