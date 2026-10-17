// Einskiptis skrifta: skiptir "Hvert er efnatákn X?" spurningunum í
// "Eðlis- og efnafræði" verkefninu út fyrir "Hvaða númer er X í
// lotukerfinu?" - bæði spurningatextinn OG rétta svarið (tala í stað
// efnatákns) þurfa að breytast, ólíkt fyrri orðalags-lagfæringum í þessu
// repoi. Finnur spurningarnar með gamla textanum frekar en hörðum ID-um.
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

// gamalt efnatákn-spurningaform -> [nýr texti, rétt svar]
const BREYTINGAR = {
  "Hvert er efnatákn vetnis?": ["Hvaða númer er Vetni í lotukerfinu?", "1"],
  "Hvert er efnatákn helíns?": ["Hvaða númer er Helín í lotukerfinu?", "2"],
  "Hvert er efnatákn litíns?": ["Hvaða númer er Litín í lotukerfinu?", "3"],
  "Hvert er efnatákn beryllíns?": ["Hvaða númer er Beryllín í lotukerfinu?", "4"],
  "Hvert er efnatákn bórs?": ["Hvaða númer er Bór í lotukerfinu?", "5"],
  "Hvert er efnatákn kolefnis?": ["Hvaða númer er Kolefni í lotukerfinu?", "6"],
  "Hvert er efnatákn köfnunarefnis?": ["Hvaða númer er Köfnunarefni í lotukerfinu?", "7"],
  "Hvert er efnatákn súrefnis?": ["Hvaða númer er Súrefni í lotukerfinu?", "8"],
  "Hvert er efnatákn flúors?": ["Hvaða númer er Flúor í lotukerfinu?", "9"],
  "Hvert er efnatákn neons?": ["Hvaða númer er Neon í lotukerfinu?", "10"]
};

function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

async function main() {
  const snap = await db.collection("questions").get();
  const batch = db.batch();
  let fjoldi = 0;

  snap.forEach((d) => {
    const texti = d.data().text;
    const breyting = BREYTINGAR[texti];
    if (!breyting) return;
    const [nyrTexti, nyttSvar] = breyting;
    batch.update(d.ref, { text: nyrTexti });
    batch.update(db.collection("answers").doc(d.id), { correctAnswers: [samraema(nyttSvar)] });
    console.log(`"${texti}" -> "${nyrTexti}" (svar: ${nyttSvar})`);
    fjoldi++;
  });

  if (fjoldi === 0) {
    console.log("Fann engar spurningar með gamla efnatákn-orðalaginu - ekkert að laga.");
    return;
  }

  await batch.commit();
  console.log(`Lagaði ${fjoldi} spurningu(m).`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
