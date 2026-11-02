// Bætir Horrible Histories (opinber YouTube-rás BBC) við YouTube í Áhugavert efni.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
const SLOD = "https://www.youtube.com/@HorribleHistoriesOfficial";

(async () => {
  const til = await db.collection("ahugavert").where("slod", "==", SLOD).get();
  if (!til.empty) return console.log("Horrible Histories er þegar til.");
  await db.collection("ahugavert").add({
    flokkur: "YouTube",
    takn: "📜",
    titill: "Horrible Histories",
    lysing: "Skrautlega hlið sögunnar: sketsar og lög úr BBC-þáttunum um sögu Bretlands og heimsins.",
    slod: SLOD,
    mynd: "images/ahugavert/horrible-histories.jpg",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log("Horrible Histories bætt við.");
})();
