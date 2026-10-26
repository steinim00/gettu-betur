// Viðbót við nyjar-surt-sykurlaust.js: 18 nýjar spurningar í stíl Súrt & Sykurlaust í Hraðaspurningum
//    (virkar, ósvaraðar). Sleppir spurningum þar sem rétt svar er þegar til
//    í Hraðaspurningum fyrir. Keyrsla: node scripts/nyjar-surt-sykurlaust.js
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();
const HRADA = "nNY4cv1gLiIDGcm9vieu";
const SURT = "AQ9cPoY5QFLQkU6QYx8N";

const NYJAR = [
  ["Hver er höfuðborg Tyrklands?", ["ankara"]],
  ["Hvað heitir stærsta eyja heims, ef meginlönd eru ekki talin með?", ["grænland"]],
  ["Hvað heitir hæsti foss heims, í Venesúela?", ["angel-foss", "angelfoss", "salto ángel", "angel foss"]],
  ["Í hvaða landi er borgin Timbúktú?", ["malí"]],
  ["Hver málaði verkið Þrautseigja minnisins með bráðnandi klukkunum?", ["salvador dalí", "dalí"]],
  ["Hver samdi tónverkið Boléro?", ["maurice ravel", "ravel"]],
  ["Hver skrifaði skáldsöguna Moby Dick?", ["herman melville", "melville"]],
  ["Hver skrifaði skáldsöguna Glæp og refsingu?", ["fjodor dostojevskí", "dostojevskí", "dostojevskij"]],
  ["Hver skrifaði Hundrað ára einsemd?", ["gabriel garcía márquez", "garcía márquez", "gabriel garcia marquez", "márquez"]],
  ["Hver skrifaði barnabókina Litli prinsinn?", ["antoine de saint-exupéry", "saint-exupéry", "saint exupéry"]],
  ["Hvað heitir lengsta fljót Evrópu?", ["volga", "volgu"]],
  ["Hvað heitir sundið milli Spánar og Marokkó sem tengir Miðjarðarhaf við Atlantshaf?", ["gíbraltarsund", "gíbraltarsundið"]],
  ["Hvaða eindir í atómi bera neikvæða hleðslu?", ["rafeindir", "rafeind", "elektrónur", "elektróna"]],
  ["Hvað heitir bjartasta stjarna næturhiminsins?", ["síríus", "sirius"]],
  ["Hvert er harðasta náttúrulega efnið?", ["demantur", "demantar"]],
  ["Hver samdi lotukerfið sem frumefnum er raðað eftir?", ["dmítríj mendeleev", "mendeleev", "mendelejev"]],
  ["Hver var kennari Alexanders mikla?", ["aristóteles"]],
  ["Hver var kennari Platons?", ["sókrates"]],
  ["Hver orti Eneasarkviðu?", ["virgill", "vergilíus", "publius vergilius maro"]],
  ["Hver er talinn hafa ort Ilíonskviðu og Ódysseifskviðu?", ["hómer"]],
  ["Hver málaði Fæðingu Venusar?", ["sandro botticelli", "botticelli"]],
  ["Hvaða smáríki er umlukið borginni Róm?", ["vatíkanið", "vatíkan", "vatíkanborg"]],
  ["Hvaða skáld orti Ísland, ögrum skorið?", ["eggert ólafsson", "eggert"]],
  ["Hvaða hljómsveit gaf út plötuna Sgt. Pepper's Lonely Hearts Club Band?", ["bítlarnir", "the beatles", "beatles"]],
  ["Hvað heitir höfuðborg Marokkó?", ["rabat"]]
];

const norm = (s) => s.toLowerCase().replace(/[^a-záðéíóúýþæö0-9. ]/g, "").trim();

(async () => {
  // 2) nýjar spurningar
  const hradaSnap = await db.collection("questions").where("verkefniId", "==", HRADA).get();
  const textiTil = new Set(hradaSnap.docs.map((d) => norm(d.data().text)));
  const svorTil = new Set();
  for (const d of hradaSnap.docs) {
    const a = await db.collection("answers").doc(d.id).get();
    (a.data()?.correctAnswers || []).forEach((s) => svorTil.add(norm(s)));
  }
  const gildar = [];
  const sleppt = [];
  for (const [texti, svor] of NYJAR) {
    if (textiTil.has(norm(texti)) || svor.some((s) => svorTil.has(norm(s)))) sleppt.push(texti);
    else gildar.push([texti, svor]);
  }
  console.log("Sleppt (svar þegar til):", sleppt.length);
  sleppt.forEach((t) => console.log("  -", t));
  const val = gildar.slice(0, 18);
  const grunn = Date.now();
  let batch = db.batch();
  val.forEach(([texti, svor], i) => {
    const ref = db.collection("questions").doc();
    batch.set(ref, { text: texti, verkefniId: HRADA, active: true, createdAt: admin.firestore.Timestamp.fromMillis(grunn + i) });
    batch.set(db.collection("answers").doc(ref.id), { correctAnswers: svor });
  });
  await batch.commit();
  console.log("Bjó til", val.length, "nýjar spurningar í Hraðaspurningum (til voru", gildar.length, "gildar).");
})();
