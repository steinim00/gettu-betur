const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

// tPXHu4PREWDEZG5LaMzA (Wikipedia) fékk mynd sem er ekki hýst á Commons.
// pdBKFgxdQRjH8wckhwdA (Ragnheiður Jónsdóttir) fékk mynd af öðrum manni
// (Gísli Þorláksson) - greinin um hana vísar á hans mynd. Hreinsa báðar.
const idListi = ["tPXHu4PREWDEZG5LaMzA", "pdBKFgxdQRjH8wckhwdA"];

async function main() {
  const batch = db.batch();
  for (const id of idListi) {
    batch.update(db.collection("questions").doc(id), {
      image: admin.firestore.FieldValue.delete(),
      imageCredit: admin.firestore.FieldValue.delete(),
      imageAlt: admin.firestore.FieldValue.delete()
    });
  }
  await batch.commit();
  console.log(`Hreinsaði ${idListi.length} rangar/ósamþykktar myndir.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
