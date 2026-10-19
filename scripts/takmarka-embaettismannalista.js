// Takmarkar verkefnið "Embættismannalisti" við einn nemanda (leyfdirNotendur).
// Notkun: node scripts/takmarka-embaettismannalista.js "Hinrik"
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

async function main() {
  const leit = (process.argv[2] || "").toLowerCase();
  const notendur = (await db.collection("users").get()).docs.filter((d) => (d.data().nafn || d.data().name || "").toLowerCase().includes(leit));
  if (notendur.length !== 1) {
    console.log("Fann ekki nákvæmlega einn notanda:", notendur.map((d) => d.data().nafn || d.data().name));
    return;
  }
  const v = await db.collection("verkefni").where("title", "==", "Embættismannalisti").get();
  if (v.size !== 1) throw new Error("Embættismannalisti fannst ekki (eða oftar en einu sinni)");
  await v.docs[0].ref.update({ leyfdirNotendur: [notendur[0].id] });
  console.log("Verkefnið er nú aðeins sýnilegt fyrir:", notendur[0].data().nafn || notendur[0].data().name, notendur[0].id);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
