// Býr til "Hver er?" verkefnin úr Drive-möppunni "Hver er" (höfundar, íslenskir
// leikarar, tennis, golf, fótbolti, Formúla 1): ein mynd af hverjum einstaklingi
// (Wikimedia Commons) og spurningin "Hver er þessi ...?". Gögnin (nöfn og
// Wikipedia-titlar) eru í hver-er-gogn.json og myndirnar sem fundust í
// hver-er-myndir.json (búið til með hver-er-leita-mynda.js).
// Endurkeyranlegt: spurningar fá fast skjalanúmer. Keyrsla: node scripts/leggja-inn-hver-er.js
// (DRY=1 prentar bara). Spurningarnar fara í eitt óvirkt verkefni, "Hver er".
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const admin = require("firebase-admin");

admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();


function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

async function finnaEdaBuaTilVerkefni(titill) {
  const snap = await db.collection("verkefni").where("title", "==", titill).get();
  if (!snap.empty) return snap.docs[0].id;
  if (process.env.DRY === "1") return "(nýtt)";
  const ref = await db.collection("verkefni").add({
    title: titill,
    slides: [],
    active: false, // falið fyrir nemendum (sjá sameina-hver-er.js)
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return ref.id;
}

async function main() {
  const gogn = JSON.parse(fs.readFileSync(path.join(__dirname, "hver-er-gogn.json"), "utf8"));
  const myndir = JSON.parse(fs.readFileSync(path.join(__dirname, "hver-er-myndir.json"), "utf8"));
  let batch = db.batch();
  let n = 0;
  let samtals = 0;
  const myndlausir = [];
  const grunnur = Date.now();
  let rod = 0;

  for (const flokkur of gogn) {
    const verkefniId = await finnaEdaBuaTilVerkefni("Hver er");
    let fjoldi = 0;
    for (const [nafn, , afbrigdi, serstokSpurning] of flokkur["fólk"]) {
      const m = myndir[nafn];
      if (!m || !m.slod || !m.slod.includes("/wikipedia/commons/")) {
        myndlausir.push(`${flokkur.titill}: ${nafn}`);
        continue;
      }
      const id = "hverer_" + crypto.createHash("md5").update(flokkur.titill + "|" + nafn).digest("hex").slice(0, 16);
      const svor = [...new Set([nafn, ...afbrigdi].map(samraema))];
      batch.set(db.collection("questions").doc(id), {
        text: serstokSpurning || flokkur.spurn,
        verkefniId,
        active: true,
        createdAt: admin.firestore.Timestamp.fromMillis(grunnur + rod++),
        image: m.slod.split("?")[0],
        imageCredit: "Wikimedia Commons",
        imageAlt: "Mynd af einstaklingi"
      });
      batch.set(db.collection("answers").doc(id), { correctAnswers: svor });
      fjoldi++;
      samtals++;
      if (++n >= 200) {
        if (process.env.DRY !== "1") await batch.commit();
        batch = db.batch();
        n = 0;
      }
    }
    console.log(`${flokkur.titill}: ${fjoldi} spurningar (verkefni ${verkefniId})`);
  }
  if (n && process.env.DRY !== "1") await batch.commit();
  console.log(`\nSamtals ${samtals} spurningar. Án myndar (sleppt): ${myndlausir.length}`);
  myndlausir.forEach((x) => console.log("  -", x));
}

main().catch((v) => {
  console.error(v);
  process.exit(1);
});
