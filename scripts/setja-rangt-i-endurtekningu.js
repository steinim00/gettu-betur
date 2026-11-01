// Einskiptis skrifta: setur gömlu röngu svörin (ekki pass) í endurtekningarbunkann
// (users/{uid}.endurtaka, sjá birtaEinaSpurningu í js/quiz.js). Til að flæða ekki
// yfir nemandann koma þær ein á þriggja spurninga fresti, elstu fyrst, fyrst
// eftir 15 spurningar. Sleppir admin, óvirkum spurningum og þeim sem eru þegar í bunkanum.
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const kvizSrc = fs.readFileSync(path.join(__dirname, "..", "js", "quiz.js"), "utf8");
eval(kvizSrc.slice(kvizSrc.indexOf("function samraema(text)"), kvizSrc.indexOf("function formatSkjatimi")));

const SLEPPT_MERKI = "__sleppt__";
const BIL = 3;

(async () => {
  const [notendur, spurningar, svor] = await Promise.all([
    db.collection("users").get(),
    db.collection("questions").get(),
    db.collection("answers").get()
  ]);
  const virkar = new Set(spurningar.docs.filter((d) => d.data().active).map((d) => d.id));
  const rettSvor = new Map(svor.docs.map((d) => [d.id, d.data().correctAnswers || []]));

  for (const n of notendur.docs) {
    const gogn = n.data();
    if (gogn.role === "admin") continue;
    const attempts = await n.ref.collection("attempts").get();
    const fyrir = gogn.endurtaka || {};
    const rangar = attempts.docs
      .filter((a) => a.data().svar !== SLEPPT_MERKI && virkar.has(a.id) && !(a.id in fyrir))
      .filter((a) => !erSvarRett(a.data().svar, rettSvor.get(a.id) || []))
      .sort((x, y) => (x.data().answeredAt?.toMillis?.() ?? 0) - (y.data().answeredAt?.toMillis?.() ?? 0));
    if (rangar.length === 0) {
      console.log(`${gogn.nafn}: engin röng svör til að bæta við.`);
      continue;
    }
    const grunnur = (gogn.fjoldiSvarad || 0) + 15;
    const breytingar = {};
    rangar.forEach((a, i) => (breytingar[`endurtaka.${a.id}`] = grunnur + i * BIL));
    await n.ref.update(breytingar);
    console.log(`${gogn.nafn}: ${rangar.length} röng svör sett í endurtekningarbunkann.`);
  }
})();
