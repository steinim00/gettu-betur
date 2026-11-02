// Bætir History Matters (YouTube) við Áhugavert efni.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
const SLOD = "https://www.youtube.com/@HistoryMatters";

(async () => {
  const til = await db.collection("ahugavert").where("slod", "==", SLOD).get();
  if (!til.empty) return console.log("History Matters er þegar til.");
  await db.collection("ahugavert").add({
    flokkur: "YouTube",
    takn: "⏳",
    titill: "History Matters",
    lysing: "Stuttar og skýrar kynningar á sögulegum efnum, upphaflega gerðar fyrir nemendur.",
    slod: SLOD,
    mynd: "images/ahugavert/history-matters.jpg",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log("History Matters bætt við.");
})();
