// Uppfærir slides fylkið í "50 áhrifamiklir einstaklingar" verkefninu sem
// link-hrifamiklir-verkefni.js bjó til: bætir við mynd hverrar glæru
// (úr hrifamiklir-myndir.json, sjá extract-slide-images.js) og forsíðuglærunni
// sem áður var sleppt.
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
const slidesSlodi = path.join(__dirname, "slides.json");
const myndaKortSlodi = path.join(__dirname, "hrifamiklir-myndir.json");
const VERKEFNI_ID = "8LqMijZ2qpfWjZifxci0";

for (const slodi of [serviceAccountSlodi, slidesSlodi, myndaKortSlodi]) {
  if (!fs.existsSync(slodi)) {
    console.error(`Fann ekki ${slodi}`);
    process.exit(1);
  }
}

admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

async function main() {
  const skyggnur = JSON.parse(fs.readFileSync(slidesSlodi, "utf8"));
  const myndaKort = JSON.parse(fs.readFileSync(myndaKortSlodi, "utf8"));

  const slides = skyggnur.map((s) => ({
    title: s.lines[0],
    body: s.lines.slice(1).join(" "),
    image: myndaKort[s.slide] || null
  }));

  await db.collection("verkefni").doc(VERKEFNI_ID).update({ slides });
  console.log(`Uppfærði verkefni ${VERKEFNI_ID} með ${slides.length} glærum (forsíða meðtalin, myndir tengdar).`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
