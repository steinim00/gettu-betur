// Einskiptis skrifta: fjarlægir úrelt samþykkt svar ("heiða björk
// hilmisdóttir") af borgarstjóraspurningunni - Hildur Björnsdóttir er
// núverandi borgarstjóri og er þegar í samþykktu svörunum.
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

async function main() {
  const ref = db.collection("answers").doc("EQzG36bdXsTILgCgRU14");
  await ref.update({ correctAnswers: admin.firestore.FieldValue.arrayRemove("heiða björk hilmisdóttir") });
  const snap = await ref.get();
  console.log("Uppfært. Ný samþykkt svör:", snap.data().correctAnswers);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
