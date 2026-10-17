// Einskiptis skrifta: lastActive er nýr reitur (sjá vistaSkjatima/innskráning
// í js/quiz.js) sem var aldrei til fyrir núverandi notendur - bara skrifaður
// upp frá þessu við innskráningu/skjátímaflæði. Þess vegna sýndi "Síðast
// virk/ur" dálkurinn ekkert fyrir neinn sem ekki hefur opnað síðuna aftur
// eftir að sá eiginleiki fór í gagn. Notar sidastSvaradAt sem besta
// staðgengilinn þar sem hann er til (notandinn var örugglega á síðunni þá) -
// lætur notendur sem hafa aldrei svarað neinu alveg ósnerta (lastActive er þá
// áfram ótilgreint, sem er rétt - við vitum það einfaldlega ekki).
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

async function main() {
  const snap = await db.collection("users").get();
  const batch = db.batch();
  let fjoldi = 0;

  snap.forEach((d) => {
    const gogn = d.data();
    if (gogn.lastActive || !gogn.sidastSvaradAt) return;
    batch.update(d.ref, { lastActive: gogn.sidastSvaradAt });
    fjoldi++;
  });

  if (fjoldi === 0) {
    console.log("Enginn notandi vantaði lastActive með sidastSvaradAt til staðar - ekkert að laga.");
    return;
  }

  await batch.commit();
  console.log(`Bakfyllti lastActive fyrir ${fjoldi} notanda/notendur (úr sidastSvaradAt).`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
