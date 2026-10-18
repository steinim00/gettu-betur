const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

async function main() {
  const batch = db.batch();

  // Borgarfjarðarbrúin fannst á is.wikipedia - skrifa réttu myndina.
  batch.update(db.collection("questions").doc("gZlgT3tmoMn496uaKGKh"), {
    image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Borgarfjar%C3%B0arbr%C3%BA_2024_%28cropped%29.jpg",
    imageCredit: "Wikimedia Commons",
    imageAlt: "Borgarfjarðarbrúin"
  });

  // Gerpir fékk ranga mynd (Geography of Iceland - gervitunglamynd, ekki Gerpir
  // sjálft) og Gerður Helgadóttir fékk mynd sem er ekki hýst á Commons -
  // fjarlægja báðar þar til betri mynd finnst.
  batch.update(db.collection("questions").doc("hU7SPvuY3iaQLxXa5tMg"), {
    image: admin.firestore.FieldValue.delete(),
    imageCredit: admin.firestore.FieldValue.delete(),
    imageAlt: admin.firestore.FieldValue.delete()
  });
  batch.update(db.collection("questions").doc("cKagXas5okL6EXiYZe43"), {
    image: admin.firestore.FieldValue.delete(),
    imageCredit: admin.firestore.FieldValue.delete(),
    imageAlt: admin.firestore.FieldValue.delete()
  });

  await batch.commit();
  console.log("Lagað: Borgarfjarðarbrúin skrifuð, Gerpir + Gerður Helgadóttir hreinsaðar.");
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
