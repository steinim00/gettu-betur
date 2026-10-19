// Einskiptis skrifta: bætir forstjórum/embættismönnum stórra ríkisstofnana
// við Embættismannalistann - sama form og bæjarstjórarnir
// (leggja-inn-baejarstjora.js): tvær spurningar á mann (óvirkar), færsla í
// "embaettismenn" safnið svo þær birtast og eru ritstýranlegar í Sérflokkum.
// Staða: október 2026 (heimildir: opinberir vefir stofnana, Stjórnarráðið og
// fréttir; RÚV, Landhelgisgæslan og Samkeppniseftirlitið eru sú staða sem
// síðast fannst, og skipunartími forseta Hæstaréttar rennur út 31.12.2026 -
// vert að staðfesta). Myndir (myndir/forstjorar/): Wikimedia Commons (Georg,
// Stefán, Ásgeir, merki LHG og RÚV) og opinberir vefir stofnananna sjálfra
// (merki og ljósmyndir af Salvöru, Kristínu og Höllu Bergþóru); þar sem engin
// mynd fannst er spurningin án myndar.
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
  { nafn: "Runólfur Pálsson", embaetti: "forstjóri Landspítala", q1: "Hver er forstjóri Landspítala?", q2: "Hjá hvaða stofnun er Runólfur Pálsson forstjóri?", svar2: ["Landspítali", "Landspítali háskólasjúkrahús"], logo: "myndir/forstjorar/landspitali.png", mynd: "myndir/forstjorar/runolfur_palsson.jpg" },
  { nafn: "Snorri Olsen", embaetti: "ríkisskattstjóri", q1: "Hver er ríkisskattstjóri?", q2: "Hjá hvaða stofnun er Snorri Olsen ríkisskattstjóri?", svar2: ["Skatturinn", "Ríkisskattstjóri"], logo: "myndir/forstjorar/skatturinn.svg", mynd: "myndir/forstjorar/snorri_olsen.jpg" },
  { nafn: "Georg Kr. Lárusson", nafnaafbrigdi: ["Georg Lárusson"], embaetti: "forstjóri Landhelgisgæslu Íslands", q1: "Hver er forstjóri Landhelgisgæslu Íslands?", q2: "Hjá hvaða stofnun er Georg Kr. Lárusson forstjóri?", svar2: ["Landhelgisgæsla Íslands", "Landhelgisgæslan"], logo: "myndir/forstjorar/landhelgisgaesla.png", mynd: "myndir/forstjorar/georg_larusson.jpg" },
  { nafn: "Stefán Eiríksson", embaetti: "útvarpsstjóri RÚV", q1: "Hver er útvarpsstjóri?", q2: "Hjá hvaða stofnun er Stefán Eiríksson útvarpsstjóri?", svar2: ["RÚV", "Ríkisútvarpið"], logo: "myndir/forstjorar/ruv.png", mynd: "myndir/forstjorar/stefan_eiriksson_ruv.jpg" },
  { nafn: "Salvör Nordal", embaetti: "umboðsmaður barna", q1: "Hver er umboðsmaður barna?", q2: "Hvaða embætti gegnir Salvör Nordal?", svar2: ["Umboðsmaður barna"], logo: "myndir/forstjorar/umbodsmadur_barna.svg", mynd: "myndir/forstjorar/salvor_nordal.jpg" },
  { nafn: "Benedikt Bogason", embaetti: "forseti Hæstaréttar", q1: "Hver er forseti Hæstaréttar?", q2: "Hvaða embætti gegnir Benedikt Bogason?", svar2: ["Forseti Hæstaréttar"], logo: "myndir/forstjorar/haestirettur.svg", mynd: "myndir/forstjorar/benedikt_bogason.jpg" },
  { nafn: "Halla Bergþóra Björnsdóttir", nafnaafbrigdi: ["Halla Bergþóra"], embaetti: "ríkislögreglustjóri", q1: "Hver er ríkislögreglustjóri?", q2: "Hvaða embætti gegnir Halla Bergþóra Björnsdóttir?", svar2: ["Ríkislögreglustjóri"], logo: "myndir/forstjorar/logreglustjarnan.png", mynd: "myndir/forstjorar/halla_bergthora_bjornsdottir.jpg" },
  { nafn: "Kristín Benediktsdóttir", embaetti: "umboðsmaður Alþingis", q1: "Hver er umboðsmaður Alþingis?", q2: "Hvaða embætti gegnir Kristín Benediktsdóttir?", svar2: ["Umboðsmaður Alþingis"], logo: "myndir/forstjorar/umbodsmadur_althingis.svg", mynd: "myndir/forstjorar/kristin_benediktsdottir.jpeg" },
  { nafn: "Páll Gunnar Pálsson", embaetti: "forstjóri Samkeppniseftirlitsins", q1: "Hver er forstjóri Samkeppniseftirlitsins?", q2: "Hjá hvaða stofnun er Páll Gunnar Pálsson forstjóri?", svar2: ["Samkeppniseftirlitið", "Samkeppniseftirlit"], logo: "myndir/forstjorar/samkeppniseftirlitid.svg", mynd: "myndir/forstjorar/pall_gunnar_palsson.webp" },
  { nafn: "Sigríður J. Friðjónsdóttir", nafnaafbrigdi: ["Sigríður Friðjónsdóttir"], embaetti: "ríkissaksóknari", q1: "Hver er ríkissaksóknari?", q2: "Hvaða embætti gegnir Sigríður J. Friðjónsdóttir?", svar2: ["Ríkissaksóknari"], logo: "myndir/forstjorar/skjaldarmerki.svg" },
  { nafn: "Ásgeir Jónsson", embaetti: "seðlabankastjóri", q1: "Hver er seðlabankastjóri?", q2: "Hvaða embætti gegnir Ásgeir Jónsson?", svar2: ["Seðlabankastjóri"], mynd: "myndir/forstjorar/asgeir_jonsson.jpg" }
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
