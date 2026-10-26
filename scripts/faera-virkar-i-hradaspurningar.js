// Færir VIRKAR spurningar úr óvirka verkefninu "Súrt & Sykurlaust" yfir í
// "Hraðaspurningar" (óvirkar verða eftir). Teljarar eru endurreiknaðir á eftir
// með endurreikna-samtolur.js.
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();
const HRADA = "nNY4cv1gLiIDGcm9vieu";
const SURT = "AQ9cPoY5QFLQkU6QYx8N";
(async () => {
  const snap = await db.collection("questions").where("verkefniId", "==", SURT).get();
  const virkar = snap.docs.filter((d) => d.data().active);
  const grunn = Date.now();
  let batch = db.batch();
  virkar.forEach((d, i) => {
    batch.update(d.ref, { verkefniId: HRADA, createdAt: admin.firestore.Timestamp.fromMillis(grunn + i) });
  });
  await batch.commit();
  console.log("Færði", virkar.length, "virkar spurningar í Hraðaspurningar.");
})();
