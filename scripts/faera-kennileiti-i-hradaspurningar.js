// Færir VIRKAR spurningar úr verkefninu "Kennileiti" í "Hraðaspurningar".
// Óvirkar eru skildar eftir.
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();
const HRADA = "nNY4cv1gLiIDGcm9vieu";
(async () => {
  const v = await db.collection("verkefni").where("title", "==", "Kennileiti").get();
  if (v.empty) return console.log("Verkefnið Kennileiti fannst ekki.");
  const id = v.docs[0].id;
  const snap = await db.collection("questions").where("verkefniId", "==", id).get();
  const virkar = snap.docs.filter((d) => d.data().active);
  const grunn = Date.now();
  const batch = db.batch();
  virkar.forEach((d, i) => batch.update(d.ref, { verkefniId: HRADA, createdAt: admin.firestore.Timestamp.fromMillis(grunn + i) }));
  await batch.commit();
  console.log("Færði", virkar.length, "virkar spurningar í Hraðaspurningar;", snap.size - virkar.length, "óvirkar eftir í Kennileiti.");
})();
