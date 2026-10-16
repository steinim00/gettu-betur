// Einskiptis skrifta: hleður "Bæjarstjórar og sveitarstjórar" spurningabankanum
// (staða október 2026, sendur sem HTML af notanda) inn sem 12 færslur í
// "embaettismenn" safnið - sama tegund og nýja Sérflokkar-formið í
// stjórnborðinu býr til, svo þessar færslur birtast og eru ritstýranlegar
// þar eftir á. Notar nákvæmlega spurningatextann/svörin sem þegar voru skrifuð
// í HTML-skránni (betur orðuð en sjálfvirka sniðmátið - "Í hvaða sveitarfélagi
// er X?" í stað "Hvaða embætti gegnir X?") í stað þess að endursemja þau.
// ENGAR myndaslóðir eru settar - upprunalega HTML-skráin vísaði í staðbundnar
// skrár (t.d. reykjavik.png) sem eru ekki til sem vefslóðir.
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

const FAERSLUR = [
  { nafn: "Hildur Björnsdóttir", merki: "👑", embaetti: "borgarstjóri í Reykjavík", q1: "Hver er borgarstjóri í Reykjavík?", q2: "Í hvaða sveitarfélagi er Hildur Björnsdóttir borgarstjóri?", svar2: "Reykjavík" },
  { nafn: "Ásdís Kristjánsdóttir", embaetti: "bæjarstjóri í Kópavogi", q1: "Hver er bæjarstjóri í Kópavogi?", q2: "Í hvaða sveitarfélagi er Ásdís Kristjánsdóttir bæjarstjóri?", svar2: "Kópavogur" },
  { nafn: "Þórður Þórarinsson", embaetti: "bæjarstjóri í Hafnarfirði", q1: "Hver er bæjarstjóri í Hafnarfirði?", q2: "Í hvaða sveitarfélagi er Þórður Þórarinsson bæjarstjóri?", svar2: "Hafnarfjörður" },
  { nafn: "Almar Guðmundsson", embaetti: "bæjarstjóri í Garðabæ", q1: "Hver er bæjarstjóri í Garðabæ?", q2: "Í hvaða sveitarfélagi er Almar Guðmundsson bæjarstjóri?", svar2: "Garðabær" },
  { nafn: "Hilmar Gunnarsson", embaetti: "bæjarstjóri í Mosfellsbæ", q1: "Hver er bæjarstjóri í Mosfellsbæ?", q2: "Í hvaða sveitarfélagi er Hilmar Gunnarsson bæjarstjóri?", svar2: "Mosfellsbær" },
  { nafn: "Þór Sigurgeirsson", embaetti: "bæjarstjóri á Seltjarnarnesi", q1: "Hver er bæjarstjóri á Seltjarnarnesi?", q2: "Í hvaða sveitarfélagi er Þór Sigurgeirsson bæjarstjóri?", svar2: "Seltjarnarnes" },
  { nafn: "Vilhjálmur Árnason", embaetti: "bæjarstjóri í Reykjanesbæ", q1: "Hver er bæjarstjóri í Reykjanesbæ?", q2: "Í hvaða sveitarfélagi er Vilhjálmur Árnason bæjarstjóri?", svar2: "Reykjanesbær" },
  { nafn: "Berglind Ósk Guðmundsdóttir", embaetti: "bæjarstjóri á Akureyri", q1: "Hver er bæjarstjóri á Akureyri?", q2: "Í hvaða sveitarfélagi er Berglind Ósk Guðmundsdóttir bæjarstjóri?", svar2: "Akureyri" },
  { nafn: "Bragi Bjarnason", embaetti: "bæjarstjóri í Árborg", q1: "Hver er bæjarstjóri í Árborg?", q2: "Í hvaða sveitarfélagi er Bragi Bjarnason bæjarstjóri?", svar2: "Árborg" },
  { nafn: "Sturlaugur Haraldsson", embaetti: "bæjarstjóri á Akranesi", q1: "Hver er bæjarstjóri á Akranesi?", q2: "Í hvaða sveitarfélagi er Sturlaugur Haraldsson bæjarstjóri?", svar2: "Akranes" },
  { nafn: "Dagmar Ýr Stefánsdóttir", embaetti: "sveitarstjóri í Múlaþingi", q1: "Hver er sveitarstjóri í Múlaþingi?", q2: "Í hvaða sveitarfélagi er Dagmar Ýr Stefánsdóttir sveitarstjóri?", svar2: "Múlaþing" },
  { nafn: "Jóna Árný Þórðardóttir", embaetti: "bæjarstjóri í Fjarðabyggð", q1: "Hver er bæjarstjóri í Fjarðabyggð?", q2: "Í hvaða sveitarfélagi er Jóna Árný Þórðardóttir bæjarstjóri?", svar2: "Fjarðabyggð" }
];

async function finnaEdaBuaTilVerkefni(titill) {
  const snap = await db.collection("verkefni").where("title", "==", titill).get();
  if (!snap.empty) return snap.docs[0].id;
  const ref = await db.collection("verkefni").add({
    title: titill,
    slides: [],
    active: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return ref.id;
}

async function main() {
  const verkefniId = await finnaEdaBuaTilVerkefni("Embættismannalisti");
  console.log(`Nota verkefnið "Embættismannalisti" (${verkefniId}).`);

  let batch = db.batch();
  let fjoldiIBatch = 0;
  let heild = 0;

  for (const f of FAERSLUR) {
    const q1Ref = db.collection("questions").doc();
    const q2Ref = db.collection("questions").doc();

    batch.set(q1Ref, { text: f.q1, verkefniId, active: false, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    // "merki" (t.d. 👑 hjá Hildi Björnsdóttur) er hreint skraut - bætt fremst
    // í correctAnswers svo það birtist í "Rétt svar: ..." textanum þegar
    // einhver svarar rangt (sjá rettSvor[0] í js/quiz.js), en teljandi svarið
    // sjálft (samraema(f.nafn), án merkis) er alltaf til staðar á eftir svo
    // skrautið hefur engin áhrif á hvort svar telst rétt.
    const q1Svor = f.merki ? [`${f.nafn} ${f.merki}`, samraema(f.nafn)] : [samraema(f.nafn)];
    batch.set(db.collection("answers").doc(q1Ref.id), { correctAnswers: q1Svor });

    batch.set(q2Ref, { text: f.q2, verkefniId, active: false, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    batch.set(db.collection("answers").doc(q2Ref.id), { correctAnswers: [samraema(f.svar2)] });

    batch.set(db.collection("embaettismenn").doc(), {
      nafn: f.nafn,
      embaetti: f.embaetti,
      myndSlod: "",
      logoSlod: "",
      verkefniId,
      q1Id: q1Ref.id,
      q2Id: q2Ref.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    fjoldiIBatch += 5;
    heild++;

    if (fjoldiIBatch >= 450) {
      await batch.commit();
      batch = db.batch();
      fjoldiIBatch = 0;
    }
  }
  if (fjoldiIBatch > 0) await batch.commit();

  console.log(`Bætti við ${heild} embættismönnum (${heild * 2} spurningar, óvirkar) í Embættismannalistann.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
