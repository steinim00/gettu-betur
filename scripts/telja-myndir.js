const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

const HRADA_ID = "nNY4cv1gLiIDGcm9vieu";

async function main() {
  const snap = await db.collection("questions").where("verkefniId", "==", HRADA_ID).get();
  let total = 0;
  let meðMynd = 0;
  snap.forEach((d) => {
    total++;
    if (d.data().image) meðMynd++;
  });
  console.log(`Hraðaspurningar: ${meðMynd} af ${total} með mynd (${total - meðMynd} eftir).`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
