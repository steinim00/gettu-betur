// Einskiptis skrifta: samræmir orðalag allra "Í hvaða sveitarfélagi ...?"
// spurninganna í Embættismannalistanum við fyrirsögn þess hluta - "er X
// bæjarstjóri/borgarstjóri?" verður "fer X með völd?" (Dagmar var þegar löguð
// í laga-dagmar-spurningu.js). Finnur spurningarnar með regex á gamla
// orðalaginu frekar en hörðum ID-um, svo skriftan virkar óháð því hvenær hún
// er keyrð.
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

const GAMALT_MYNSTUR = /^Í hvaða sveitarfélagi er (.+?) (bæjarstjóri|borgarstjóri)\?$/;

async function main() {
  const snap = await db.collection("questions").get();
  let fjoldi = 0;
  const batch = db.batch();

  snap.forEach((d) => {
    const texti = d.data().text || "";
    const samsvar = texti.match(GAMALT_MYNSTUR);
    if (!samsvar) return;
    const nyrTexti = `Í hvaða sveitarfélagi fer ${samsvar[1]} með völd?`;
    batch.update(d.ref, { text: nyrTexti });
    console.log(`"${texti}" -> "${nyrTexti}"`);
    fjoldi++;
  });

  if (fjoldi === 0) {
    console.log("Fann engar spurningar með gamla orðalaginu - ekkert að laga.");
    return;
  }

  await batch.commit();
  console.log(`Lagaði orðalag á ${fjoldi} spurningu(m).`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
