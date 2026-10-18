const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

async function main() {
  const qSnap = await db.collection("questions").where("verkefniId", "==", "nNY4cv1gLiIDGcm9vieu").get();
  const qMap = new Map(qSnap.docs.map((d) => [d.id, d.data().text]));
  const ids = [...qMap.keys()];
  const out = [];
  for (let i = 0; i < ids.length; i += 30) {
    const batch = ids.slice(i, i + 30);
    const snap = await db
      .collection("answers")
      .where(admin.firestore.FieldPath.documentId(), "in", batch)
      .get();
    snap.forEach((d) => out.push({ id: d.id, text: qMap.get(d.id), correctAnswers: d.data().correctAnswers }));
  }
  fs.writeFileSync(
    "/tmp/claude-0/-home-user-N-STI/d42fecff-b3b6-5587-b28c-de34dc362f47/scratchpad/hrada-allar-svor.json",
    JSON.stringify(out)
  );
  console.log("total:", out.length);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
