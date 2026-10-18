// Þriðja yfirferð: bætir við réttum svörum (arrayUnion, breytir engu öðru).
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const VIDBAETUR = {
  q9vKs1S0ne2uYWHlvdpc: ["mjöl"], // Hvað lifði Óðinn á?
  gbhzxZtDzAfHaqXVqcU5: ["3 amigos", "three amigos", "þrír amigos"] // Skytturnar þrjár
};

async function main() {
  for (const [id, nyjar] of Object.entries(VIDBAETUR)) {
    const ref = db.collection("answers").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.log("VANTAR answers-skjal:", id);
      continue;
    }
    const q = await db.collection("questions").doc(id).get();
    console.log(`${(q.data()?.text || "?").slice(0, 70)} | ${JSON.stringify(snap.data().correctAnswers)} + ${JSON.stringify(nyjar)}`);
    if (process.env.DRY !== "1") await ref.update({ correctAnswers: admin.firestore.FieldValue.arrayUnion(...nyjar) });
  }
}

main().catch((v) => {
  console.error(v);
  process.exit(1);
});
