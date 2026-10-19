// Setur myndir af forstjórunum (frá opinberum vefjum stofnananna) á seinni
// spurningu hverrar færslu í Embættismannalistanum og á embaettismenn-skjalið.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const M = "myndir/forstjorar/";
const MYNDIR = {
  "Runólfur Pálsson": M + "runolfur_palsson.jpg",
  "Stefán Eiríksson": M + "stefan_eiriksson_ruv.jpg",
  "Benedikt Bogason": M + "benedikt_bogason.jpg",
  "Páll Gunnar Pálsson": M + "pall_gunnar_palsson.webp"
};

async function main() {
  const snap = await db.collection("embaettismenn").get();
  for (const d of snap.docs) {
    const x = d.data();
    const mynd = MYNDIR[x.nafn];
    if (!mynd) continue;
    await db.collection("questions").doc(x.q2Id).update({ image: mynd });
    await d.ref.update({ myndSlod: mynd });
    console.log("uppfært:", x.nafn, "->", mynd);
  }
}
main().catch((v) => {
  console.error(v);
  process.exit(1);
});
