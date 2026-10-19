// Einskiptis skrifta: bætir 10 forstjórum/stjórnendum stórra ríkisstofnana og
// ríkisfyrirtækja við Embættismannalistann - sama form og bæjarstjórarnir
// (leggja-inn-baejarstjora.js): tvær spurningar á mann (óvirkar), færsla í
// "embaettismenn" safnið svo þær birtast og eru ritstýranlegar í Sérflokkum.
// Staða: október 2026 (heimildir: opinberir vefir stofnana, Stjórnarráðið og
// fréttir; Vegagerðin, RÚV og Landhelgisgæslan eru sú staða sem síðast fannst
// og vert að staðfesta). Myndir eru af Wikimedia Commons (myndir/forstjorar/);
// þar sem engin frjáls mynd fannst er spurningin án myndar.
// Keyrsla: node scripts/leggja-inn-forstjora.js   (DRY=1 prentar bara)
const path = require("path");
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

const FAERSLUR = [
  { nafn: "Runólfur Pálsson", embaetti: "forstjóri Landspítala", q1: "Hver er forstjóri Landspítala?", q2: "Hjá hvaða stofnun er Runólfur Pálsson forstjóri?", svar2: ["Landspítali", "Landspítali háskólasjúkrahús"] },
  { nafn: "Huld Magnúsdóttir", embaetti: "forstjóri Tryggingastofnunar", q1: "Hver er forstjóri Tryggingastofnunar?", q2: "Hjá hvaða stofnun er Huld Magnúsdóttir forstjóri?", svar2: ["Tryggingastofnun", "Tryggingastofnun ríkisins", "TR"] },
  { nafn: "Sigurður Helgi Helgason", embaetti: "forstjóri Sjúkratrygginga Íslands", q1: "Hver er forstjóri Sjúkratrygginga Íslands?", q2: "Hjá hvaða stofnun er Sigurður Helgi Helgason forstjóri?", svar2: ["Sjúkratryggingar Íslands", "Sjúkratryggingar"] },
  { nafn: "Hildigunnur H. H. Thorsteinsson", nafnaafbrigdi: ["Hildigunnur Thorsteinsson"], embaetti: "forstjóri Veðurstofu Íslands", q1: "Hver er forstjóri Veðurstofu Íslands?", q2: "Hjá hvaða stofnun er Hildigunnur H. H. Thorsteinsson forstjóri?", svar2: ["Veðurstofa Íslands", "Veðurstofan"] },
  { nafn: "Bergþóra Þorkelsdóttir", embaetti: "forstjóri Vegagerðarinnar", q1: "Hver er forstjóri Vegagerðarinnar?", q2: "Hjá hvaða stofnun er Bergþóra Þorkelsdóttir forstjóri?", svar2: ["Vegagerðin"] },
  { nafn: "Snorri Olsen", embaetti: "ríkisskattstjóri", q1: "Hver er ríkisskattstjóri?", q2: "Hjá hvaða stofnun er Snorri Olsen ríkisskattstjóri?", svar2: ["Skatturinn", "Ríkisskattstjóri"] },
  { nafn: "Georg Kr. Lárusson", nafnaafbrigdi: ["Georg Lárusson"], embaetti: "forstjóri Landhelgisgæslu Íslands", q1: "Hver er forstjóri Landhelgisgæslu Íslands?", q2: "Hjá hvaða stofnun er Georg Kr. Lárusson forstjóri?", svar2: ["Landhelgisgæsla Íslands", "Landhelgisgæslan"], logo: "myndir/forstjorar/landhelgisgaesla.png", mynd: "myndir/forstjorar/georg_larusson.jpg" },
  { nafn: "Stefán Eiríksson", embaetti: "útvarpsstjóri RÚV", q1: "Hver er útvarpsstjóri?", q2: "Hjá hvaða stofnun er Stefán Eiríksson útvarpsstjóri?", svar2: ["RÚV", "Ríkisútvarpið"], logo: "myndir/forstjorar/ruv.png", mynd: "myndir/forstjorar/stefan_eiriksson.jpg" },
  { nafn: "Sveinbjörn Indriðason", embaetti: "forstjóri Isavia", q1: "Hver er forstjóri Isavia?", q2: "Hjá hvaða fyrirtæki er Sveinbjörn Indriðason forstjóri?", svar2: ["Isavia"], logo: "myndir/forstjorar/isavia.png" },
  { nafn: "Hörður Arnarson", embaetti: "forstjóri Landsvirkjunar", q1: "Hver er forstjóri Landsvirkjunar?", q2: "Hjá hvaða fyrirtæki er Hörður Arnarson forstjóri?", svar2: ["Landsvirkjun"], logo: "myndir/forstjorar/landsvirkjun.png" }
];

async function finnaEdaBuaTilVerkefni(titill) {
  const snap = await db.collection("verkefni").where("title", "==", titill).get();
  if (!snap.empty) return snap.docs[0].id;
  const ref = await db.collection("verkefni").add({ title: titill, slides: [], active: false, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return ref.id;
}

async function main() {
  const verkefniId = await finnaEdaBuaTilVerkefni("Embættismannalisti");
  const til = new Set((await db.collection("embaettismenn").get()).docs.map((d) => d.data().nafn));
  const batch = db.batch();
  let fjoldi = 0;
  for (const f of FAERSLUR) {
    if (til.has(f.nafn)) {
      console.log("Til nú þegar, sleppi:", f.nafn);
      continue;
    }
    const q1Ref = db.collection("questions").doc();
    const q2Ref = db.collection("questions").doc();
    const now = admin.firestore.FieldValue.serverTimestamp();
    batch.set(q1Ref, { text: f.q1, verkefniId, active: false, createdAt: now, ...(f.logo ? { image: f.logo } : {}) });
    batch.set(db.collection("answers").doc(q1Ref.id), { correctAnswers: [...new Set([f.nafn, ...(f.nafnaafbrigdi || [])].map(samraema))] });
    batch.set(q2Ref, { text: f.q2, verkefniId, active: false, createdAt: now, ...(f.mynd ? { image: f.mynd } : {}) });
    batch.set(db.collection("answers").doc(q2Ref.id), { correctAnswers: f.svar2.map(samraema) });
    batch.set(db.collection("embaettismenn").doc(), {
      nafn: f.nafn,
      embaetti: f.embaetti,
      myndSlod: f.mynd || "",
      logoSlod: f.logo || "",
      verkefniId,
      q1Id: q1Ref.id,
      q2Id: q2Ref.id,
      createdAt: now
    });
    fjoldi++;
    console.log(`+ ${f.nafn} - ${f.embaetti}`);
  }
  if (process.env.DRY === "1") return console.log(`ÞURRKEYRSLA - ${fjoldi} færslur.`);
  if (fjoldi) await batch.commit();
  console.log(`Bætti við ${fjoldi} embættismönnum (${fjoldi * 2} spurningar, óvirkar) í Embættismannalistann.`);
}

main().catch((v) => {
  console.error(v);
  process.exit(1);
});
