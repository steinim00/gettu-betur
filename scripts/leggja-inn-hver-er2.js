// Býr til verkefni úr hver-er-gogn2.json (kennileiti úr "Umhverfis jörðina á 80
// stöðum" I og II og listaverk) með myndum úr hver-er-myndir2.json. Hver færsla
// getur gefið fleiri en eina spurningu með sömu mynd. Endurkeyranlegt (föst
// skjalanúmer). DRY=1 prentar bara. Verkefnin eru takmörkuð við Hinrik.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const admin = require("firebase-admin");

admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
const LEYFDIR = ["5TkIf8dyi7T3EoAE10na2eR2xLl1"]; // Hinrik
const SLEPPA = new Set((process.env.SLEPPA || "").split(",").filter(Boolean)); // lyklar "verkefni|nafn" sem á að sleppa

function samraema(text) {
  return text.trim().toLowerCase().replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "").replace(/\s+/g, " ");
}

async function finnaEdaBuaTilVerkefni(titill) {
  const snap = await db.collection("verkefni").where("title", "==", titill).get();
  if (!snap.empty) return snap.docs[0].id;
  if (process.env.DRY === "1") return "(nýtt)";
  const ref = await db.collection("verkefni").add({
    title: titill,
    slides: [],
    active: true,
    leyfdirNotendur: LEYFDIR,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return ref.id;
}

async function main() {
  const gogn = JSON.parse(fs.readFileSync(path.join(__dirname, "hver-er-gogn2.json"), "utf8"));
  const myndir = JSON.parse(fs.readFileSync(path.join(__dirname, "hver-er-myndir2.json"), "utf8"));
  let batch = db.batch();
  let n = 0;
  let samtals = 0;
  const myndlausir = [];
  const grunnur = Date.now();
  let rod = 0;
  for (const g of gogn) {
    const verkefniId = await finnaEdaBuaTilVerkefni(g.titill);
    let fjoldi = 0;
    for (const e of g.entries) {
      const lykill = g.titill + "|" + e.nafn;
      const m = myndir[lykill];
      if (SLEPPA.has(lykill) || !m || !m.slod || !m.slod.includes("/wikipedia/commons/")) {
        myndlausir.push(lykill);
        continue;
      }
      e.spurningar.forEach((s, i) => {
        const id = "hverer2_" + crypto.createHash("md5").update(lykill + "|" + i).digest("hex").slice(0, 16);
        batch.set(db.collection("questions").doc(id), {
          text: s.text,
          verkefniId,
          active: true,
          createdAt: admin.firestore.Timestamp.fromMillis(grunnur + rod++),
          image: m.slod.split("?")[0],
          imageCredit: "Wikimedia Commons",
          imageAlt: "Mynd"
        });
        batch.set(db.collection("answers").doc(id), { correctAnswers: [...new Set(s.svor.map(samraema))] });
        fjoldi++;
        samtals++;
        n += 2;
      });
      if (n >= 400) {
        if (process.env.DRY !== "1") await batch.commit();
        batch = db.batch();
        n = 0;
      }
    }
    console.log(`${g.titill}: ${fjoldi} spurningar (verkefni ${verkefniId})`);
  }
  if (n && process.env.DRY !== "1") await batch.commit();
  console.log(`\nSamtals ${samtals} spurningar. Án myndar/sleppt: ${myndlausir.length}`);
  myndlausir.forEach((x) => console.log("  -", x));
}
main().catch((v) => {
  console.error(v);
  process.exit(1);
});
