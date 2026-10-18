const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

// A3 blað er 297mm x 420mm samkvæmt ISO 216 staðlinum - spurningin hafði ranga
// seinni tölu (240mm í stað 420mm).
async function main() {
  await db.collection("questions").doc("Pj9lsvJXkETBBy09xWTQ").update({
    text: "Hvaða stærð blaða er 297mm sinnum 420 mm?"
  });
  console.log("Lagað: 297mm x 240mm -> 297mm x 420mm (ISO 216 A3).");
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
