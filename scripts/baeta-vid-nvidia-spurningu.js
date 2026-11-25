// Bætir "Hver er forstjóri Nvidia?" í Hraðaspurningar sem 3. spurningu í pakkanum frá nr. 910
// (grNr 911.5 = á milli 911 og 912 í "Allar í röð frá þessu nr." á æfingu). Engu eytt.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
const FV = admin.firestore.FieldValue;
const HRADASPURNINGAR = "nNY4cv1gLiIDGcm9vieu";
(async () => {
  const til = await db.collection("questions").where("text", "==", "Hver er forstjóri Nvidia?").get();
  if (!til.empty) { console.log("Spurningin er þegar til:", til.docs[0].id); process.exit(0); }
  const ref = db.collection("questions").doc();
  const b = db.batch();
  b.set(ref, { text: "Hver er forstjóri Nvidia?", verkefniId: HRADASPURNINGAR, active: true, grNr: 911.5, createdAt: FV.serverTimestamp() });
  b.set(db.collection("answers").doc(ref.id), { correctAnswers: ["jensen huang", "huang", "jensen", "jen-hsun huang"] });
  b.update(db.collection("meta").doc("virkarSpurningar"), { [`spurningar.${ref.id}`]: HRADASPURNINGAR, updatedAt: FV.serverTimestamp() });
  b.set(db.collection("meta").doc("spurningaBreytingar"), { breytt: { [ref.id]: FV.serverTimestamp() }, uppfaert: FV.serverTimestamp() }, { merge: true });
  await b.commit();
  console.log("Bætt við:", ref.id);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
