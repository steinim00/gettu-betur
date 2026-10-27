// Bætir við kennileitum úr glærunum UMHVERFIS JÖRÐINA Á 80 STÖÐUM I og II sem vantaði
// í "Hver er" (mynd + "Hvaða kennileiti er þetta?"). Keyrsla: node scripts/baeta-kennileitum-sem-vantar.js <json>
const fs = require("fs");
const crypto = require("crypto");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();
const HVER_ER = "rd1E7YKAcLPkol9116UR";
(async () => {
  const gogn = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const batch = db.batch();
  let i = 0;
  for (const [lykill, g] of Object.entries(gogn)) {
    const id = "hverer3_" + crypto.createHash("md5").update(lykill).digest("hex").slice(0, 16);
    batch.set(db.collection("questions").doc(id), {
      text: "Hvaða kennileiti er þetta?",
      verkefniId: HVER_ER,
      active: true,
      image: g.slod,
      imageCredit: "Wikimedia Commons",
      imageAlt: g.titill,
      createdAt: admin.firestore.Timestamp.fromMillis(Date.now() + i++)
    });
    batch.set(db.collection("answers").doc(id), { correctAnswers: g.svor });
  }
  await batch.commit();
  console.log("Bætti við", Object.keys(gogn).length, "kennileitum.");
})();
