// Færir allar spurningar Mannkynssöguprófsins yfir í Hraðaspurningar-verkefnið
// og felur prófið sjálft (active: false, ekki eytt - formSlod varðveitist).
// Endurreiknar svo samtölur nemenda (verkefnaStada fylgir verkefnaauðkenni).
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
(async () => {
  const prof = await db.collection("verkefni").where("title", "==", "Mannkynssöguprófið").get();
  const hrada = await db.collection("verkefni").where("title", "==", "Hraðaspurningar").get();
  if (prof.size !== 1 || hrada.size !== 1) throw new Error(`prof=${prof.size}, hrada=${hrada.size}`);
  const profId = prof.docs[0].id;
  const hradaId = hrada.docs[0].id;
  const [pq, hq] = await Promise.all([
    db.collection("questions").where("verkefniId", "==", profId).get(),
    db.collection("questions").where("verkefniId", "==", hradaId).get()
  ]);
  const til = new Map(hq.docs.map((d) => [d.data().text.trim().toLowerCase(), d.id]));
  const batch = db.batch();
  pq.forEach((d) => {
    const t = d.data().text.trim().toLowerCase();
    if (til.has(t)) console.log("Tvítekin spurning (til líka í Hraðaspurningum):", d.data().text);
    batch.update(d.ref, { verkefniId: hradaId, active: true });
  });
  batch.update(prof.docs[0].ref, { active: false });
  await batch.commit();
  console.log(`Færði ${pq.size} spurningar í Hraðaspurningar (${hradaId}). Prófið (${profId}) er nú falið.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
