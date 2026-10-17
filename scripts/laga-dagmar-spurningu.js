// Einskiptis skrifta: lagar orðalag spurningarinnar um Dagmar Ýr Stefánsdóttur
// (Múlaþing) í Embættismannalistanum - "er ... sveitarstjóri?" átti að vera
// "fer ... með völd?" til samræmis við fyrirsögnina á þeim hluta listans.
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

const GAMALL_TEXTI = "Í hvaða sveitarfélagi er Dagmar Ýr Stefánsdóttir sveitarstjóri?";
const NYR_TEXTI = "Í hvaða sveitarfélagi fer Dagmar Ýr Stefánsdóttir með völd?";

async function main() {
  const snap = await db.collection("questions").where("text", "==", GAMALL_TEXTI).get();
  if (snap.empty) {
    console.log("Fann enga spurningu með gamla orðalaginu - ekkert að laga (kannski þegar lagað).");
    return;
  }
  const batch = db.batch();
  snap.forEach((d) => batch.update(d.ref, { text: NYR_TEXTI }));
  await batch.commit();
  console.log(`Lagaði orðalag á ${snap.size} spurningu(m).`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
