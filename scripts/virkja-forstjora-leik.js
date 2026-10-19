// Gerir forstjóra/embættismannaspurningarnar (úr leggja-inn-forstjora.js) að
// virkum leik: kveikir á spurningunum þeirra og á verkefninu "Embættismannalisti"
// og fjarlægir notendatakmörkun (leyfdirNotendur) af verkefninu. Spurningar
// bæjarstjóranna eru óbreyttar (áfram óvirkar).
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const kodi = fs.readFileSync(path.join(__dirname, "leggja-inn-forstjora.js"), "utf8");
const lysing = kodi.slice(kodi.indexOf("const FAERSLUR = ["), kodi.indexOf("];", kodi.indexOf("const FAERSLUR = [")) + 1);
const NOFN = new Set(new Function(lysing.replace("const FAERSLUR =", "return"))().map((f) => f.nafn));

async function main() {
  const snap = await db.collection("embaettismenn").get();
  const batch = db.batch();
  let n = 0;
  let verkefniId = null;
  for (const d of snap.docs) {
    const x = d.data();
    if (!NOFN.has(x.nafn)) continue;
    verkefniId = x.verkefniId;
    batch.update(db.collection("questions").doc(x.q1Id), { active: true });
    batch.update(db.collection("questions").doc(x.q2Id), { active: true });
    n += 2;
  }
  batch.update(db.collection("verkefni").doc(verkefniId), { active: true, leyfdirNotendur: admin.firestore.FieldValue.delete() });
  await batch.commit();
  console.log(`Kveikti á ${n} spurningum og á verkefninu (${verkefniId}).`);
}
main().catch((v) => {
  console.error(v);
  process.exit(1);
});
