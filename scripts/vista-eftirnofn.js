// Einskiptis skrifta: les eftirnofn-uppastungur.json (búið til af
// kanna-eftirnofn.js) og bætir vottuðum styttri svörum við - FRÁSKILUR þó
// orð sem reyndust ekki vera alvöru eftirnöfn/stuttform eftir handyfirferð
// (skipsnöfn, viðurnefni, bókatitlar, staðanöfn, raðtölur o.fl.).
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

// Orð sem reyndust EKKI vera alvöru eftirnöfn/stuttform við handyfirferð -
// sjá spjallsöguna fyrir rökstuðning á hverju og einu.
const UTILOKUD_ORD = new Set([
  "auðuns", "jesú", "ii", "stofuglam", "forseti", "nautið", "kampf", "eldri",
  "rock", "páfi", "lárpera", "mikli", "þrír", "súr", "maría", "maria",
  "náttúrunnar", "paulo", "lumpur", "björgvin", "svanur", "iyotake",
  "djúðauðga", "arósir", "hólm", "mósebók"
]);

async function main() {
  const allar = JSON.parse(fs.readFileSync(path.join(__dirname, "eftirnofn-uppastungur.json"), "utf8"));
  const samthykktar = allar.filter((v) => !UTILOKUD_ORD.has(v.stungidUppA));

  console.log(`${allar.length} uppástungur alls, ${samthykktar.length} samþykktar eftir handyfirferð, ${allar.length - samthykktar.length} útilokaðar.`);

  let batch = db.batch();
  let fjoldiIBatch = 0;
  let heild = 0;

  for (const v of samthykktar) {
    const ref = db.collection("answers").doc(v.id);
    batch.update(ref, { correctAnswers: admin.firestore.FieldValue.arrayUnion(v.stungidUppA) });
    fjoldiIBatch++;
    heild++;
    if (fjoldiIBatch >= 450) {
      await batch.commit();
      batch = db.batch();
      fjoldiIBatch = 0;
    }
  }
  if (fjoldiIBatch > 0) await batch.commit();

  console.log(`Uppfærði ${heild} spurningar með nýju styttra/eftirnafns-svari.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
