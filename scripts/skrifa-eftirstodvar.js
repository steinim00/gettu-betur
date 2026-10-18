const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

const gogn = {
  UEAqGNZGnSuOropSJpZt: {
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Magn%C3%BAs_Stephensen.jpg",
    imageCredit: "Wikimedia Commons",
    imageAlt: "Magnús Stephensen"
  },
  UjC4fxRR4FrHBdb5j2DQ: {
    image: "https://upload.wikimedia.org/wikipedia/commons/8/88/%C3%8Dsafj%C3%B6r%C3%B0ur_12_June_2019.jpg",
    imageCredit: "Wikimedia Commons",
    imageAlt: "Ísafjörður"
  }
};

async function main() {
  const batch = db.batch();
  for (const [id, data] of Object.entries(gogn)) {
    batch.update(db.collection("questions").doc(id), data);
  }
  await batch.commit();
  console.log(`Skrifaði mynd á ${Object.keys(gogn).length} spurningar.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
