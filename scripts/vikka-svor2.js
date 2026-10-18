// Önnur yfirferð: svör nemenda sem voru metin röng en eru í raun rétt (eða
// svargögnin sjálf röng/of þröng). Hver færsla: id -> nýjum réttum svörum bætt við.
// Færslur í SKIPTA_ALLRI_SKRANNI endurskrifa listann (svarlykillinn var rangur).
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const VIDBAETUR = {
  // --- Beygingarmyndir, ritháttur og fullkomnara orðalag ---
  GX3k2v4Lx86oy1QqbofW: ["súa", "sjú"],
  A5uFWnSJ3hxQcrroL4PD: ["4. áratug", "4. áratugurinn", "fjórða áratug", "fjórða áratugnum", "fjórði áratugurinn"],
  AM05UYibFwqO0efPfcPe: ["mánudagur", "mánudag", "mánudaginn"],
  qNFvpSKBPIKaowqC9GwV: ["mánudagur", "mánudag", "mánudaginn"],
  k6lPLEmvVMG1A4xKnGOY: ["golgota", "golgatha", "golgatahæð", "golgata hæð"],
  "8DXElVE68j3kuFysRBqK": ["tegund af skýjum", "skýjategund", "skýjum"],
  Rjw0HjBsxjTSIgjtnq3T: ["rafstraumur", "straum", "straumur", "rafmagnsstraum", "rafmagnsstraumur"],
  pOx1BTRh1M8qgaT0jHyK: ["rafspennu", "rafspenna", "spennu", "spenna", "rafmagnsspennu", "rafmagnsspenna"],
  npJAq19tLG9RrshbKhHI: ["ígulkerjur", "ígulkerið"],
  B4kVUxaw1PYm3x5K0A0f: ["6", "sex", "sex mánuðir"],
  GP3oNFbeKwW9FkLiE8Mr: ["8", "átta", "átta horn", "8 horn"],
  zqKqUdg9rCifwljY6CsG: ["grætur"],
  anOtWbywbHRpSPDh69l8: ["níels", "niels", "herra niels", "herra nilsson", "nilsson"],
  f9HT4deOwWghqAjjSixK: [
    "fönixreglan",
    "fönix reglan",
    "fönixarreglan",
    "fönisreglan",
    "harry potter og fönixreglan",
    "harry potter og fönisreglan",
    "harry potter & fönixreglan",
    "harry potter and the order of the phoenix",
    "order of the phoenix"
  ],
  VtJ82Qow2kDq1MFaKrZm: ["bianca castafiore", "castafiore"],
  eUG1DGNzYnYNMtf5lz4Q: [
    "uppruni tegunda",
    "uppruna tegundanna",
    "um uppruna tegundanna",
    "uppruni tegundanna",
    "on the origin of species",
    "origin of species"
  ],
  pA1z2NfpRfJqu4nLwwYy: ["bogey"],
  x7wfL0FBWs5znwGT06Uf: ["þorbjörn", "súr"],
  "9u9ApEefCV9b9HQMO8cC": ["stóra stökkið fram á við", "stóra stökk fram á við"],
  gLS8qaQRWWT7zTCjMARW: ["kristalsbrúðkaup", "kristalbrúðkaup", "kristalsbrúðkaupið"],
  Sm82aVH5GRhBkZESGwjk: ["vitruvian man", "vitrúvíus maðurinn", "vitrúvíusarmaður", "vitruvian maðurinn", "vitruvius maðurinn"],
  lkyoMa2IM1EdZ2UWt7xW: ["tinbrúðkaup", "tin"],
  A8fVFzNQ6npd4uGBx906: ["brottförin", "brottför", "útgangan"],
  Ly9ZIpsyu9FocqKx4DBe: ["steinn", "bjarg", "kletturinn"],
  VZkr9E1pVPDb8Sb8vGhX: [
    "hafðu ekki áhyggjur",
    "ekki áhyggjur",
    "engin vandamál",
    "áhyggjuleysi",
    "áhyggjulaus",
    "no worries"
  ],
  BSPmSznvh1AAClWIvHXD: ["fóbos og deimos", "fobos og deimos", "phobos og deimos", "fóbos deimos", "deimos og fóbos"],
  nfzoL1JJkjquXyle0VDb: ["sveskja"],
  wHPGfLCSuGRleoljf5tq: ["ásbrú", "bilröst"],
  fBEZ6XwA7BoQJKt3awSC: ["yen"],
  "4ZHycNGpTAcoMl2nJpEC": ["eagle"],
  "5U02pD5pnVBAalxX64Rt": ["raunpólitík", "raunpólitíkin", "raunpólitíkina"],
  "0DrO3cCVaAFaDEoJoIl9": ["kiwi", "kiwí", "kíwí", "kívi"],
  I3kByO1AuEW1YLp8R6O1: ["genesis", "fyrsta mósebók"],
  RhyvMBzYjobP88aFi4GR: ["genesis", "1. mósebók"],
  brBTNJcTJY9h3TX9L4Z9: ["aðalritara", "aðalritari sovétríkjanna"],
  AAgGPvpNugBddiPiHKyP: ["nóbels", "nóbel", "nóbelsverðlaunin", "friðarverðlaun nóbels", "friðarverðlaunin"],
  UCzzKYAyNbfFQfZGXfki: ["úran", "plútóníum"],
  zfLZ7MmJ1dqzfflk5Oja: ["sink", "sinkur"],
  IEzYcaUXLW8wSgkLARYx: ["krummi", "hrafn"],
  B44w9QZFfgHEnZd9HYtS: [
    "dollari",
    "dollarinn",
    "dollarar",
    "dalur",
    "ástralskur dalur",
    "ástralskir dalir",
    "ástralskir dollarar",
    "ástralskur dollar"
  ],
  SGm6uvg264XJ2Zp7nr2r: ["írska pundið", "pund"],
  BEoO8ULskjEZnla06OmS: ["racey"], // "Some Girls" var líka stór smellur með Racey (1979)
  KPJig6TSr6GmB54PLspc: ["frjálsa frakka", "frjálsum frökkum", "frjálsra frakka", "hinir frjálsu frakkar"],
  nrOgSYlEttxWvc7ZjyXX: ["kjötkrókur", "kjötkrækir"],
  "2TpHxPRvj9Crg3kLjtAC": ["sixtínsku", "sixtínska"],
  ilIq3AOpo05dGf8PyUyq: ["tottenham", "spurs"],
  xJsp7vMy5kUgho0ys32a: ["tottenham", "spurs"],
  "5jTIjUQZkB6Ttoz2C5Jt": ["mekbeð", "makbeð", "makbet"],
  Z5kWQq6nzbpUBjk7ZYm1: ["picasso"],
  RXrl7vN5tjsyWa622bJx: ["hindenburg"],
  hmFDmWagCTOLLC8jB2hl: [
    "allt sem hann snerti varð að gulli",
    "allt sem hann snerti breyttist í gull",
    "allt sem hann rerti við breyttist í gull",
    "allt varð að gulli",
    "allt sem hann snerti varð gull",
    "gull"
  ],
  sPLpM9sshAnq7usoESxa: ["jóhannes páll"],
  "38VOXWoyP0nC2LYsc5Jf": ["suður", "suðurpól", "suðurpóll"],
  pjmc0ux62on5OuUZ3HE6: ["taíland", "tæland"],
  hpEISS0ggo7cvYgzS6Md: ["ósigrandi", "armada", "armadan"],
  msnedw7uJ1ZhEZJw6veN: ["beethoven"],
  te53P3GT8tU9MMWSGGbs: ["meyjardrottningin", "meyjardrottning", "jómfrúardrottningin", "jómfrúardrottning"],
  qEk4rMz6Qqw8FYNEDEdr: ["stöðvarfirði", "á stöðvarfirði"],
  oaNJvxgWOWt4GAvAHp9A: ["skjálfanda", "skjálfandi", "skjálfandaflói"],
  A9AufPdRaZCpYknYKsm3: ["uruguay"],
  Q2Am6q9E6mpiMb6lTcrt: ["london", "lundúnir", "lundúnaborg"],
  EYCraGva0Q9gkwJeJ6pu: ["mikligarður", "miklagarður", "mikligarði", "konstantínópel", "istanbul"],
  CZ0rdlYpLe4SGsOmhMmX: ["handleggnum", "í handleggnum", "handlegg", "í handlegg", "handleggur", "framhandleggnum"],
  jVpHEJW9Ms3o26NQ5564: ["alþingi", "alþingishúsinu"],
  oc82u2jnBC9RyKKJN7gm: ["mendeleev", "mendelejev", "mendeleyev", "dmitri mendeleev", "mendeljev", "mendelejeff"],
  "4xCQNDNt6zlAJdcmL9Zx": ["saxófónn", "saxófónninn", "saxófóninn", "saxafón", "saxafónn", "saxafónninn"],
  XndaBUQEM1N75OQsiclY: ["bucharest", "bukarest"],
  lcwFOEb6NKNr1HV4shKI: ["karakas", "caracas"],
  ltvN8TKKQrxIKNUk8cMK: ["merkúr"],
  AkifO4rrlq5B1UbM2LUz: ["streymoy", "straumoy"],
  qNToimWA7KSomSpZwD8i: ["robert catesby", "catesby"],
  U2GWVtnBSBhdz0eTA94n: ["gandalf", "grái pílagrímurinn", "gandalf grái", "gandálfur grái"],
  a3CKEbk88qge65OtOtWQ: ["edda björgvins", "edda"],
  "24kmV9NQ9jTi5Twmn92X": ["rembrandt van rijn", "van rijn", "rembrandt harmenszoon van rijn"],
  "1EYZ6FLITBN2x9MU6t7B": ["jacques-louis david", "jacques louis david", "jacques-louis", "jacques louis"],
  TQCmZh7a5UowfubwzqSy: [
    "tchaikovsky",
    "tschaikovsky",
    "tchaikovskíj",
    "tsjajkovskíj",
    "tsjajkovskij",
    "tsjækovskíj",
    "tjaikovsky",
    "tsjajkovskí"
  ],
  gN1Vals6X2Qrywkk30jr: [
    "tchaikovsky",
    "tschaikovsky",
    "tchaikovskíj",
    "tsjajkovskíj",
    "tsjajkovskij",
    "tsjækovskíj",
    "tjaikovsky",
    "tsjajkovskí"
  ],
  JOl04lrxez9vMgyNUf68: ["kepler", "johannes kepler"],
  CrwXlxv0fMKjmD0DBEee: ["sygin", "sígyn"],
  "6oU2mXMnMwaI7ihuuqSa": ["nikulás", "nikulás ii", "nikuláus", "nikolaj ii", "nikolaj", "nikolai ii"],
  L6FvhiK5ert59A0P3oLl: ["ribbentrop", "joachim von ribbentrop", "von ribbentrop"],
  G3o7qAx7VgoXVvttULqJ: ["marat", "jean paul marat"],
  "1c3JhtVd8ZzRZoiY1kFp": ["með fallöxi", "fallöxi", "fallöxinni", "með fallöxinni", "guillotine"],
  B8hnV0g3LW1IyTXE1rms: ["aztekar", "astekar", "aztekakeisari"],
  y4cJFpu0g8tpuWaN686L: ["montecchi", "montague", "montagu"],
  "0RDSKSnhkxI3j0kNCvri": [
    "köngulóarmaðurinn",
    "köngulóarmaður",
    "köngurlóarmaður",
    "spiderman",
    "spider-man",
    "spider man"
  ],
  DJQE1LKUEvIG4Xd5hZ3t: ["asni", "asninn"], // svarlykillinn var "ansi" (innsláttarvilla)
  QdEsrUFNLVAtwCD3w1Mn: ["everest"],
  WHfnmj9EdUlPlrZLnlbj: ["nile", "nílin", "nílarfljót"],
  MYOsLTE7Gk4UgjkTnLQI: ["mús"],
  JGdRzWAIbWfeG23UFZra: [
    "breytti vatni í vín",
    "brúðkaup kana",
    "brúðkaupið í kana",
    "brúðkaup í kana",
    "brúðkaupinu í kana",
    "vatn í vín"
  ],
  v2Rlsgq7WRYqptRsxlHJ: ["guðríður"],
  NjjpH0BQwGktTdlIuWyC: ["upp", "upp á við"],
  Saj8kwZ8JTpGvMTGocqN: ["framsóknarflokksins", "framsóknarflokkurinn", "framsóknarflokki", "framsóknarflokkinn", "framsókn"],
  pNlsjSymBEnaSI3BJAQN: [
    "getsemane",
    "getsemane-garðinum",
    "getsemanegarðinum",
    "getsemane garðinum",
    "getsemane-garðurinn",
    "getsemane garðurinn",
    "getsemane-garður"
  ],
  it79uv0GShHMBgeZDxvi: ["miðjarðarhafið", "miðjarðarhafi", "miðjarðarhaf"],
  V4ljNKwzLM0sc8Nqg5V7: ["norðaustur", "norð austur", "norðausturkjördæmi"],
  Q0jbhtj8yEdY7L9O0Nzv: ["suður", "suðurkjördæmi"],
  EUBdP58QVZ1koiMtN2RC: ["kirkjubæjarklaustri", "kirkjubæjaklaustri"],
  kFzP4UelBNT4I86vMVI6: ["c", "c vítamín", "c-vítamín"],
  pFV3WZ1SNoilIXmVL4G1: ["marilyn monroe", "marilyn"], // svarlykillinn var "maryline monroe"
  bQwHSzYv4QNBdDjg8Zew: ["skakki turninn", "skakka turninn", "skakka turninum", "turninn í písa"],
  k0R0ppqXwj6n4KbGZGsz: ["fornleifafræðingur"],
  "1rmxKirRKndE56RLPrhE": ["akureyrarbæ", "akureyrarbær", "akureyrarbæjar"],
  ySbwO0oHYDDJtCedtVVf: ["rúbíkónfljótið", "rúbíkon", "rúbíkonfljótið"],
  uRnwjCQhxJ0llSADB9GD: ["ríó", "rio", "ríó de janeiro", "rio de janeiro"],
  Dy41TYTJuqsTwvbAR4GE: ["63"]
};

// Svarlykillinn sjálfur var rangur eða samsettur í einn streng - listinn endurskrifaður.
const SKIPTA_ALLRI_SKRANNI = {
  x3FcYGYGzEbJTKl676wL: ["legubekkur", "húsgagn", "legubekkur, húsgagn"], // tvö svör voru í einum streng
  HH04mBq6jEukjmmDwTLE: ["joseph smith", "smith"], // var "adam smith" - Mormónakirkjan var stofnuð af Joseph Smith
  q9vKs1S0ne2uYWHlvdpc: ["vín", "öl"] // samkvæmt Snorra-Eddu lifir Óðinn eingöngu á víni
};

async function main() {
  // Spurning þar sem ég þekki bara textann.
  const textaleit = await db.collection("questions").where("text", "==", "Hvaða reikistjarna er næst sólu?").get();
  textaleit.forEach((d) => {
    VIDBAETUR[d.id] = [...(VIDBAETUR[d.id] || []), "merkúr"];
  });

  const batch = db.batch();
  let fjoldi = 0;
  for (const [id, nyjar] of Object.entries(VIDBAETUR)) {
    const ref = db.collection("answers").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.log("VANTAR answers-skjal:", id);
      continue;
    }
    const gamalt = snap.data().correctAnswers || [];
    const nytt = [...new Set([...gamalt, ...nyjar])];
    if (nytt.length === gamalt.length) continue;
    batch.update(ref, { correctAnswers: nytt });
    fjoldi++;
    const q = await db.collection("questions").doc(id).get();
    console.log(`${(q.data()?.text || "?").slice(0, 60).padEnd(60)} | ${JSON.stringify(gamalt)} + ${JSON.stringify(nyjar.filter((x) => !gamalt.includes(x)))}`);
  }
  for (const [id, nytt] of Object.entries(SKIPTA_ALLRI_SKRANNI)) {
    batch.update(db.collection("answers").doc(id), { correctAnswers: nytt });
    fjoldi++;
  }
  if (process.env.DRY === "1") {
    console.log(`ÞURRKEYRSLA - ${fjoldi} svarasett hefðu verið uppfærð.`);
    return;
  }
  await batch.commit();
  console.log(`Uppfærði ${fjoldi} svarasett.`);
}

main().catch((v) => {
  console.error(v);
  process.exit(1);
});
