// Færir 75 nýju spurningarnar (úr nyjar-surt-sykurlaust*.js) úr Hraðaspurningum
// yfir í "Súrt & Sykurlaust" sem ÓVIRKAR, svo hægt sé að fara yfir þær og
// kveikja á þeim góðu (virkar spurningar má svo færa með faera-virkar-i-hradaspurningar.js).
const fs = require("fs");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();
const HRADA = "nNY4cv1gLiIDGcm9vieu";
const SURT = "AQ9cPoY5QFLQkU6QYx8N";

function textarUr(skra) {
  const s = fs.readFileSync(__dirname + "/" + skra, "utf8");
  const blokk = s.slice(s.indexOf("const NYJAR = ["), s.indexOf("\n];"));
  return [...blokk.matchAll(/^\s*\["(.+?)", \[/gm)].map((m) => m[1]);
}

(async () => {
  const textar = new Set([...textarUr("nyjar-surt-sykurlaust.js"), ...textarUr("nyjar-surt-sykurlaust2.js")]);
  const snap = await db.collection("questions").where("verkefniId", "==", HRADA).get();
  const val = snap.docs.filter((d) => textar.has(d.data().text));
  const notendur = await db.collection("users").get();
  for (const d of val) {
    for (const u of notendur.docs) {
      const r = u.ref.collection("attempts").doc(d.id);
      if ((await r.get()).exists) { console.log("Athugið: svar til hjá", u.id, d.id); }
    }
  }
  let batch = db.batch();
  val.forEach((d) => batch.update(d.ref, { verkefniId: SURT, active: false }));
  await batch.commit();
  console.log("Færði", val.length, "spurningar í Súrt & Sykurlaust (óvirkar).");
})();
