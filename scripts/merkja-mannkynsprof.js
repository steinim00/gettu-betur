// Einskiptis skrifta: merkir verkefnið "Mannkynssöguprófið" sem próf
// (tegund: "prof") svo það fari í Hraðaspurningar-dálkinn og birti allar
// spurningarnar saman á einni síðu í stað þess að reiða sig á heuristíkina.
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

async function main() {
  const snap = await db.collection("verkefni").where("title", "==", "Mannkynssöguprófið").get();
  if (snap.empty) {
    console.error('Fann ekki verkefni með titlinum "Mannkynssöguprófið".');
    process.exit(1);
  }
  for (const vDoc of snap.docs) {
    await vDoc.ref.update({ tegund: "prof" });
    console.log(`Merkti "${vDoc.data().title}" (${vDoc.id}) sem próf.`);
  }
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
