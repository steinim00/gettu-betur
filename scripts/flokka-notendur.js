// Einskiptis skrifta: flokkur-reiturinn er nýr (sjá skra í js/auth.js og
// birtaNotendaRadir í js/admin.js) - bakfyllir hann á núverandi notendum.
// "aðrir" = ekki alvöru nemandi (prufuaðgangar), sleppt úr skjáskotssniði
// á stjórnborðinu. Allir aðrir fá "MS".
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

const ADRIR_UIDS = [
  "WyTCijBobZX7nuUGLEVdEYGqgAF3", // Solon Hannesson
  "dQIDb0KRNWUx0oIB4e2kgJUk7nd2" // Þorsteinn Magnússon (user-aðgangur, ekki admin)
];

async function main() {
  const snap = await db.collection("users").get();
  const batch = db.batch();
  let fjoldi = 0;

  snap.forEach((d) => {
    if (d.data().role === "admin") return;
    const flokkur = ADRIR_UIDS.includes(d.id) ? "aðrir" : "MS";
    if (d.data().flokkur === flokkur) return;
    batch.update(d.ref, { flokkur });
    fjoldi++;
  });

  if (fjoldi === 0) {
    console.log("Allir notendur eru þegar réttilega flokkaðir - ekkert að laga.");
    return;
  }

  await batch.commit();
  console.log(`Flokkaði ${fjoldi} notanda/notendur.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
