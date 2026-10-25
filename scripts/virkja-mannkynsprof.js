// Kveikir á verkefninu "Mannkynssöguprófið" og spurningum þess. Prófið er
// tegund "prof" og birtist því í "Hraðaspurningar" dálkinum í leiknum.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
(async () => {
  const v = await db.collection("verkefni").where("title", "==", "Mannkynssöguprófið").get();
  if (v.size !== 1) throw new Error(`Fann ${v.size} verkefni`);
  const q = await db.collection("questions").where("verkefniId", "==", v.docs[0].id).get();
  const batch = db.batch();
  batch.update(v.docs[0].ref, { active: true });
  q.forEach((d) => batch.update(d.ref, { active: true }));
  await batch.commit();
  console.log(`Kveikti á prófinu (${v.docs[0].id}) og ${q.size} spurningum. tegund: ${v.docs[0].data().tegund}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
