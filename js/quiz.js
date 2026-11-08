import { db } from "./firebase-config.js";
import { vaktaInnskraningu, skraUt } from "./auth.js";
import {
  collection,
  query,
  where,
  documentId,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  deleteField,
  increment,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const notandaNafn = document.getElementById("notandaNafn");
const utskraBtn = document.getElementById("utskraBtn");

const minStadaBtn = document.getElementById("minStadaBtn");
const hverErBtn = document.getElementById("hverErBtn");
const hverErSvaedi = document.getElementById("hverErSvaedi");
const hverErFlokkar = document.getElementById("hverErFlokkar");
const tilbakaFraHverEr = document.getElementById("tilbakaFraHverEr");
const minStadaSvaedi = document.getElementById("minStadaSvaedi");
const tilbakaFraMinniStodu = document.getElementById("tilbakaFraMinniStodu");
const minarStodurSvarad = document.getElementById("minarStodurSvarad");
const minarStodurRett = document.getElementById("minarStodurRett");
const minarStodurNakvaemni = document.getElementById("minarStodurNakvaemni");
const minarStodurSkjatimi = document.getElementById("minarStodurSkjatimi");
const minarStodurListi = document.getElementById("minarStodurListi");
const rangarSpurningarBtn = document.getElementById("rangarSpurningarBtn");
const vikuAherslaSvaedi = document.getElementById("vikuAherslaSvaedi");

const glosurBtn = document.getElementById("glosurBtn");

// Nýja útlitið (beta) - sjá kveikjaBeta.
const betaHlid = document.getElementById("betaHlid");
const betaValmyndTakki = document.getElementById("betaValmyndTakki");
const betaNav = document.getElementById("betaNav");
const betaHaus = document.getElementById("betaHaus");
const betaFyrirsogn = document.getElementById("betaFyrirsogn");
const betaUndirtitill = document.getElementById("betaUndirtitill");
const betaNotandaNafn = document.getElementById("betaNotandaNafn");
const betaUtskraBtn = document.getElementById("betaUtskraBtn");
const ahugavertSvaedi = document.getElementById("ahugavertSvaedi");
const biolistiSvaedi = document.getElementById("biolistiSvaedi");
const biolistiFlipar = document.getElementById("biolistiFlipar");
const biolistiRodaHnappur = document.getElementById("biolistiRodaHnappur");
const biolistiRodaGildi = document.getElementById("biolistiRodaGildi");
const biolistiRodaListi = document.getElementById("biolistiRodaListi");
const biolistiListi = document.getElementById("biolistiListi");
const biolistiSiur = document.getElementById("biolistiSiur");
const biolistiSiurTakki = document.getElementById("biolistiSiurTakki");
const biolistiSiurFjoldi = document.getElementById("biolistiSiurFjoldi");
const ahugavertListi = document.getElementById("ahugavertListi");
const mittEfniSvaedi = document.getElementById("mittEfniSvaedi");
const mittEfniListi = document.getElementById("mittEfniListi");
const mittEfniAllirBtn = document.getElementById("mittEfniAllirBtn");
let betaVirkt = false;
const glosurSvaedi = document.getElementById("glosurSvaedi");
const tilbakaFraGlosum = document.getElementById("tilbakaFraGlosum");
const glosurListi = document.getElementById("glosurListi");
const glosaBox = document.getElementById("glosaBox");
const glosaTextarea = document.getElementById("glosaTextarea");
const vistaGlosuBtn = document.getElementById("vistaGlosuBtn");
const glosaStada = document.getElementById("glosaStada");
const nyGlosaBtn = document.getElementById("nyGlosaBtn");
const nyGlosaForm = document.getElementById("nyGlosaForm");
const nyGlosaVerkefni = document.getElementById("nyGlosaVerkefni");
const nyGlosaTexti = document.getElementById("nyGlosaTexti");
const nyGlosaStada = document.getElementById("nyGlosaStada");
const nyGlosaVistaBtn = document.getElementById("nyGlosaVistaBtn");
const nyGlosaHaettaBtn = document.getElementById("nyGlosaHaettaBtn");

const verkefnaSvaedi = document.getElementById("verkefnaSvaedi");
const verkefnaListi = document.getElementById("verkefnaListi");
const hradaspurningarSvaedi = document.getElementById("hradaspurningarSvaedi");
const hradaspurningarListi = document.getElementById("hradaspurningarListi");

const glaeruSvaedi = document.getElementById("glaeruSvaedi");
const verkefnaTitill = document.getElementById("verkefnaTitill");
const glaerurInnihald = document.getElementById("glaerurInnihald");
const afromISpurningar = document.getElementById("afromISpurningar");
const faraBeintISpurningarBtn = document.getElementById("faraBeintISpurningarBtn");
const tilbakaFraGlaerum = document.getElementById("tilbakaFraGlaerum");

const spurningaSvaedi = document.getElementById("spurningaSvaedi");
const spurningaTitill = document.getElementById("spurningaTitill");
const spurningaListi = document.getElementById("spurningaListi");
const heimsalfaSiur = document.getElementById("heimsalfaSiur");
const stodurNiðurstada = document.getElementById("stodurNiðurstada");
const tilbakaFraSpurningum = document.getElementById("tilbakaFraSpurningum");
const stokkaSpurningarBtn = document.getElementById("stokkaSpurningarBtn");
const byrjaAfturBtn = document.getElementById("byrjaAfturBtn");

const siduflettingarEfri = document.getElementById("siduflettingarEfri");
const fyrriSidaBtnEfri = document.getElementById("fyrriSidaBtnEfri");
const naestaSidaBtnEfri = document.getElementById("naestaSidaBtnEfri");
const siduTalningEfri = document.getElementById("siduTalningEfri");

const siduflettingar = document.getElementById("siduflettingar");
const fyrriSidaBtn = document.getElementById("fyrriSidaBtn");
const naestaSidaBtn = document.getElementById("naestaSidaBtn");
const siduTalning = document.getElementById("siduTalning");

const heilskjaBtn = document.getElementById("heilskjaBtn");
const heilskjaSvaedi = document.getElementById("heilskjaSvaedi");
const heilskjaMynd = document.getElementById("heilskjaMynd");
const heilskjaTitill = document.getElementById("heilskjaTitill");
const heilskjaTexti = document.getElementById("heilskjaTexti");
const heilskjaTalning = document.getElementById("heilskjaTalning");
const heilskjaAfturBtn = document.getElementById("heilskjaAfturBtn");
const heilskjaAframBtn = document.getElementById("heilskjaAframBtn");
const lokaHeilskjaBtn = document.getElementById("lokaHeilskjaBtn");

let notandi = null;
// Satt á meðan nemandi er að þreyta próf (sjá opnaVerkefni og svaraSpurningu) -
// stýrir viðvöruninni í beforeunload hér fyrir neðan sem reynir að letja fólk
// frá því að loka flipanum/fara af síðunni í miðju prófi. Vafrar leyfa EKKI
// sérsniðinn viðvörunartexta lengur (öryggisráðstöfun í þeirra hendi, ekki
// okkar) - þetta kveikir bara á stöðluðu "viltu fara af síðunni?" glugganum.
let profIVinnslu = false;
window.addEventListener("beforeunload", (e) => {
  if (!profIVinnslu) return;
  e.preventDefault();
  e.returnValue = "";
});

// Admin sér óvirk (lokuð) verkefni/spurningar líka - sjá hladaVerkefnaListi
// og hladaSpurningum - svo hægt sé að forskoða t.d. próf nákvæmlega eins og
// nemandi myndi sjá það, án þess að kveikja á því fyrir alla.
let erAdminNotandi = false;
let valdVerkefniId = null;
let valdVerkefniErHrada = false;
let valdHverErFlokkur = null;
let valdHeimsalfa = ""; // "" = allar heimsálfur (Höfuðborgir heimsins)
let heilskjaGlaerur = [];
let heilskjaIndex = 0;

// Sérstakt merki fyrir "sleppt" svar - geymt í sama "svar" strengjareitnum svo
// engin breyting þurfi á Firestore-reglunum. Passar aldrei við neitt rétt svar.
const SLEPPT_MERKI = "__sleppt__";

const SPURNINGAR_A_SIDU_VENJULEGT = 20;
const SPURNINGAR_A_SIDU_PROF = 5;
const SPURNINGAR_A_SIDU_PROF_SKRAD = 999; // próf merkt "tegund: prof" - allar spurningar saman á einni síðu
let spurningaBunkastaerd = SPURNINGAR_A_SIDU_VENJULEGT;
let allarSpurningaskjol = [];
let svaradIdSett = new Set();
let spurningaSida = 0;

// Verkefni geta verið sérstaklega merkt sem "próf" (tegund: "prof") í
// stjórnborðinu. Annars eru verkefni sem hafa enga alvöru glæruefni
// (eingöngu sjálfgerða lýsingarglæru úr t.d. upload-questions.js, og ekkert
// upprunalegt pptx) talin hrein spurningabanki - þau fara beint í spurningar
// í minni bútum, líkt og próf, í stað glæruflæðisins.
function erProfVerkefni(verkefni) {
  if (verkefni.tegund === "prof") return true;
  return !verkefni.pptxUrl && (verkefni.slides || []).length <= 1;
}

// Verkefni geta verið takmörkuð við ákveðna notendur (leyfdirNotendur í
// stjórnborðinu, valið eftir netfangi) - tómt/ekkert svæði þýðir að allir
// innskráðir sjái verkefnið, sem er sjálfgefna hegðunin fyrir öll eldri
// verkefni.
// "Hraðaspurningar" (sama titilleit og viku-áherslan) fær líka spurningarnar úr
// flokkum sem notandinn hefur sérstaklega fengið úthlutað (leyfdirNotendur) -
// hann getur þá annað hvort æft sinn einbeitta flokk sér eða tekið spurningarnar
// með í hraðaspurningunum.
function erHradaVerkefni(verkefni) {
  return (verkefni.title || "").toLowerCase().includes("hraðaspurningar");
}

function uthlutadVerkefniFyrirNotanda(verkefniDocs) {
  if (!notandi || erAdminNotandi) return [];
  return verkefniDocs.filter((d) => {
    const v = d.data();
    return v.active && !erHradaVerkefni(v) && (v.leyfdirNotendur || []).includes(notandi.uid);
  });
}

function synilegtNotanda(verkefni) {
  // Admin sér öll verkefni (líka þau sem eru takmörkuð við ákveðna nemendur) -
  // annars vantar flokka í "Sjá eins og nemandi".
  if (erAdminNotandi) return true;
  const leyfdir = verkefni.leyfdirNotendur;
  if (!leyfdir || leyfdir.length === 0) return true;
  return !!notandi && leyfdir.includes(notandi.uid);
}

// Próf sem eru sérstaklega skráð sem slík (tegund: "prof") birta allar
// spurningarnar saman á einni síðu, ólíkt öðrum spurningabönkum sem fara í
// gegnum litla bútinn (SPURNINGAR_A_SIDU_PROF) til að létta álagið.
function spurningaBunkastaerdFyrir(verkefni) {
  if (verkefni.tegund === "prof") return SPURNINGAR_A_SIDU_PROF_SKRAD;
  if (erProfVerkefni(verkefni)) return SPURNINGAR_A_SIDU_PROF;
  return SPURNINGAR_A_SIDU_VENJULEGT;
}

function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

// Ritstjórnarfjarlægð (Levenshtein) milli tveggja strengja - notað til að leyfa
// smávægilegar stafsetningarvillur í svörum í stað þess að krefjast nákvæmrar
// stafsetningar á við það sem admin sló inn.
function ritstjornarfjarlaegd(a, b) {
  // Optimal string alignment: eins og venjuleg ritstjórnarfjarlægð en tveir
  // aðliggjandi stafir sem víxlast (t.d. "noble" fyrir "nobel") teljast ein villa.
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const kostnadur = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + kostnadur);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
}

// Orðmyndir talnanna 1-20 (með kynjum þar sem þau eru til) svo "2", "tvö" og
// "tveir" teljist öll sama svarið, hvort sem admin skráði réttu svörin sem
// tölustaf eða orð og hvort sem nemandinn svarar með tölustaf eða orði.
const TOLUORD_1_TIL_20 = {
  1: ["einn", "ein", "eitt"],
  2: ["tveir", "tvær", "tvö"],
  3: ["þrír", "þrjár", "þrjú"],
  4: ["fjórir", "fjórar", "fjögur"],
  5: ["fimm"],
  6: ["sex"],
  7: ["sjö"],
  8: ["átta"],
  9: ["níu"],
  10: ["tíu"],
  11: ["ellefu"],
  12: ["tólf"],
  13: ["þrettán"],
  14: ["fjórtán"],
  15: ["fimmtán"],
  16: ["sextán"],
  17: ["sautján"],
  18: ["átján"],
  19: ["nítján"],
  20: ["tuttugu"]
};
const ORD_TIL_TOLUGILDIS = new Map();
for (const [tala, ordmyndir] of Object.entries(TOLUORD_1_TIL_20)) {
  for (const ord of ordmyndir) ORD_TIL_TOLUGILDIS.set(ord, Number(tala));
}

// Skilar tölugildinu (1-20) sem "svar" vísar til - hvort sem það er skrifað
// sem tölustafur eða orð - eða null ef það er hvorugt.
function tolugildi1til20(svar) {
  if (/^([1-9]|1[0-9]|20)$/.test(svar)) return Number(svar);
  return ORD_TIL_TOLUGILDIS.get(svar) ?? null;
}

// Algeng viðskeyti ákveðins greinis í íslensku (t.d. "ljón" -> "ljónið",
// "vog" -> "vogin", "naut" -> "nautið") - nemendur sleppa oft greininum þó
// svarið sjálft sé rétt. Bara stök orð (ekki orðasambönd) til að lágmarka
// hættu á fölskum jákvæðum - sjá erSvarRett.
// Kenninöfn ("hvers son/dóttir var X" -> "[faðir í eignarfalli]" + "son"/
// "dóttir", t.d. "hámundar" -> "hámundarson") eru nákvæmlega sama mynstur og
// greinisviðskeyti hér - stofn + fast viðskeyti = annað orð - svo þau fá sama
// sanngildisfall.
const AKVEDINN_GREINIR_VIDSKEYTI = [
  "num",
  "unum",
  "anna",
  "nar",
  "nn",
  "inn",
  "ið",
  "in",
  "an",
  "na",
  "nu",
  "ina",
  "inu",
  "ana",
  "una",
  "son",
  "dóttir"
];
function samiStofnMedGreini(a, b) {
  if (a.includes(" ") || b.includes(" ") || a.length < 3) return false;
  if (AKVEDINN_GREINIR_VIDSKEYTI.some((vidskeyti) => a + vidskeyti === b)) return true;
  // Kvenkynsorð á -a fá -u í aukaföllum (kúba/kúbu, elba/elbu, belgía/belgíu).
  return a.length >= 4 && a.endsWith("a") && b === a.slice(0, -1) + "u";
}

// "14. febrúar" og "14 febrúar" eiga að teljast sama svarið - punkturinn sem
// táknar raðtölu (1., 2., 3. ...) í dagsetningum er oft sleppt þegar fólk
// vélritar hratt.
function fjarlaegjaRadtolupunkt(str) {
  return str.replace(/(\d)\.\s/g, "$1 ");
}

// Fjarlægir íslenska/erlenda áherslustafi (á,é,í,ó,ú,ý,ö -> a,e,i,o,u,y,o) svo
// "nikósía"/"nikosia" eða "katmandú"/"kathmandu" teljist sama svarið - fólk
// vélritar oft erlend sérnöfn án áherslumerkja, eða með öðrum ritham en er í
// svargögnunum.
function fjarlaegjaAherslumerki(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Svar sem inniheldur rétta svarið ORÐRÉTT ásamt í mesta lagi tveimur aukaorðum
// ("hannibal barca" fyrir "hannibal", "14. nóvember 1963" fyrir "1963",
// "gabríel erkiengill" fyrir "gabríel") er rétt - nema nemandinn hafi gefið
// upp tvo kosti ("x eða y") eða neitað ("ekki x").
function innihaldiRettOrd(svar, r) {
  if (r.length < 4) return false;
  const sv = fjarlaegjaAherslumerki(svar).split(" ").filter(Boolean);
  const rv = fjarlaegjaAherslumerki(r).split(" ").filter(Boolean);
  if (rv.length === 0 || sv.length <= rv.length || sv.length > rv.length + 2) return false;
  if (sv.includes("eða") || sv.includes("eda") || sv.includes("ekki")) return false;
  for (let i = 0; i + rv.length <= sv.length; i++) {
    if (rv.every((ord, j) => sv[i + j] === ord)) return true;
  }
  return false;
}

// Svarið má vera í hvaða falli sem er, með eða án ákveðins greinis: orð teljast
// sama orðið ef þau eiga sameiginlegan stofn (>= 3 stafir) og það sem eftir
// stendur af hvoru þeirra er dæmigerð beygingar-/greinisending (eða ekkert).
// Hljóðvarp (a/ö, ó/æ) er jafnað út svo "bók"/"bækur" og "land"/"lönd" teljist
// sama orðið. Svör með tölustöfum verða áfram að vera nákvæm.
const BEYGINGARENDINGAR = new Set([
  "", "a", "i", "u", "s", "r", "n", "ar", "ir", "ur", "um", "ja", "ju", "jum", "na", "nn", "in", "ið",
  "inn", "ins", "inu", "ina", "num", "nu", "ni", "nna", "ana", "anna", "anum", "unum", "inum", "nir",
  "nar", "nnar", "una", "unni", "inni"
]);
function ordastofn(ord) {
  return fjarlaegjaAherslumerki(ord).replace(/[æo]/g, "a");
}
function sammaOrdIOdruFalli(a, b) {
  const x = ordastofn(a);
  const y = ordastofn(b);
  if (x === y) return true;
  let p = 0;
  while (p < x.length && p < y.length && x[p] === y[p]) p++;
  // Sameiginlegi forhlutinn getur náð inn í endinguna ("bakur"/"bakum"), svo
  // allar mögulegar skiptingar stofns og endingar eru reyndar.
  for (let i = p; i >= 3; i--) {
    if (BEYGINGARENDINGAR.has(x.slice(i)) && BEYGINGARENDINGAR.has(y.slice(i))) return true;
  }
  return false;
}
function samaSvarIOdruFalli(svar, r) {
  const sv = svar.split(" ").filter(Boolean);
  const rv = r.split(" ").filter(Boolean);
  if (sv.length === 0 || sv.length !== rv.length) return false;
  return sv.every((o, i) => (/\d/.test(o) || /\d/.test(rv[i]) ? o === rv[i] : sammaOrdIOdruFalli(o, rv[i])));
}

// Leyfir svari sem er mjög nálægt (fá stafsetningarvilla) einhverju af réttu
// svörunum að teljast rétt, í stað þess að krefjast nákvæmrar stafsetningar.
// Þolið vex með lengd svarsins - stutt svör þurfa áfram að vera nákvæm.
// Tölugildi eru UNDANSKILIN - þau eiga alltaf að vera nákvæm (sveigjanleikinn
// á eingöngu við stafsetningu, ekki tölur: "20000" á ekki að teljast sama og
// "20001" þó ritstjórnarfjarlægðin sé lítil) - nema töluorð 1-20 (sbr.
// tolugildi1til20 hér fyrir ofan), sem eru jafngild tölustafnum sínum.
function erSvarRett(svar, rettSvor) {
  if (rettSvor.includes(svar)) return true;

  const svarTala = tolugildi1til20(svar);
  if (svarTala !== null && rettSvor.some((r) => tolugildi1til20(r) === svarTala)) return true;

  if (
    rettSvor.some(
      (r) =>
        samiStofnMedGreini(svar, r) ||
        samiStofnMedGreini(r, svar) ||
        samiStofnMedGreini(fjarlaegjaAherslumerki(svar), fjarlaegjaAherslumerki(r)) ||
        samiStofnMedGreini(fjarlaegjaAherslumerki(r), fjarlaegjaAherslumerki(svar))
    )
  )
    return true;

  if (rettSvor.some((r) => fjarlaegjaRadtolupunkt(svar) === fjarlaegjaRadtolupunkt(r))) return true;

  if (rettSvor.some((r) => fjarlaegjaAherslumerki(svar) === fjarlaegjaAherslumerki(r))) return true;

  if (rettSvor.some((r) => samaSvarIOdruFalli(svar, r))) return true;

  if (rettSvor.some((r) => innihaldiRettOrd(svar, r))) return true;

  return rettSvor.some((r) => {
    // Tölugildi eiga að vera nákvæm: sveigjanleikinn nær bara til bókstafanna.
    // "appóllo 11" má vera nálægt "apollo 11" en "20001" er aldrei "20000".
    if (svar.replace(/\D/g, "") !== r.replace(/\D/g, "")) return false;
    const svarFolded = fjarlaegjaAherslumerki(svar);
    const rFolded = fjarlaegjaAherslumerki(r);
    const thol = rFolded.length <= 4 ? 0 : rFolded.length <= 8 ? 1 : 2;
    if (thol === 0) return false;
    if (Math.abs(rFolded.length - svarFolded.length) > thol) return false;
    return ritstjornarfjarlaegd(svarFolded, rFolded) <= thol;
  });
}

function formatSkjatimi(sekundur) {
  if (!sekundur) return "0 mín";
  // Sjá athugasemdina við sömu fall í js/admin.js: heildarmínútur eru
  // rúnnaðar einu sinni svo úrkoman getur aldrei orðið "X klst 60 mín".
  const heildarMin = Math.round(sekundur / 60);
  const klst = Math.floor(heildarMin / 60);
  const min = heildarMin % 60;
  return klst > 0 ? `${klst} klst ${min} mín` : `${min} mín`;
}

// --- Skjátímamæling ---
// Mælir hversu lengi notandinn er með flipann virkan (ekki falinn/í bakgrunni)
// og vistar uppsafnaðan tíma reglulega á users/{uid}.screenTimeSeconds með
// increment() svo ekkert tapist þó margir flipar/lotur skrifi samtímis.
let virkTimamaeling = null;
let ovistadurSkjatimi = 0;

// Admin er ekki mældur (hjartsláttur, skjátími, virkni) - sparar skrif og heldur tölunum hreinum.
function maelaNotanda() {
  return !!notandi && !erAdminNotandi;
}

function hefjaTimamaelingu() {
  if (maelaNotanda() && document.visibilityState === "visible" && !virkTimamaeling) {
    virkTimamaeling = Date.now();
  }
}

// Skjátími telst bara á meðan notandinn gerir eitthvað (smellur, snerting,
// áslátt, skrun, músarhreyfing) - opinn en ónotaður flipi telur ekki með,
// annars sýnist notandi "virkur" þó enginn sé við tölvuna.
const OVIRKUR_EFTIR_MS = 30000;
let sidastaSnerting = Date.now();
let hreyfingSidanVistun = true;
function skraSnertingu() {
  sidastaSnerting = Date.now();
  hreyfingSidanVistun = true;
}
["click", "touchstart", "keydown", "scroll", "mousemove"].forEach((heiti) => {
  window.addEventListener(heiti, skraSnertingu, { passive: true });
});

function stodvaTimamaelingu() {
  if (virkTimamaeling) {
    const nuna = Date.now();
    const lok = Math.min(nuna, sidastaSnerting + OVIRKUR_EFTIR_MS);
    ovistadurSkjatimi += Math.max(0, lok - virkTimamaeling) / 1000;
    virkTimamaeling = null;
  }
}

// Tæki notandans ("simi" eða "tolva") og reitur í virknikortinu (vikudagur 0-6
// með mánudag = 0, klukkustund 0-23, í UTC = íslenskur tími). Skjátíminn er
// talinn í sekúndum á hvern reit og birtist sem heatmap á Tölfræði-síðu
// stjórnborðsins (users/{uid}.virkni.{tæki}.d{dagur}h{klst}).
function taekiTegund() {
  const erSimi =
    /Android.+Mobile|iPhone|iPod|Mobile|Windows Phone/i.test(navigator.userAgent) ||
    (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(hover: hover)").matches && window.innerWidth < 900);
  return erSimi ? "simi" : "tolva";
}

function virkniReitur(sekundur) {
  const nuna = new Date();
  const dagur = (nuna.getUTCDay() + 6) % 7;
  return { [`virkni.${taekiTegund()}.d${dagur}h${nuna.getUTCHours()}`]: increment(sekundur) };
}

// Tímasett áminning bíður þessa notanda: onlineStada/<uid> sýnir Apps Script hvenær hann var síðast virkur.
let bidAminning = false;
function skraOnlineStodu() {
  if (!notandi || !bidAminning) return;
  setDoc(doc(db, "onlineStada", notandi.uid), { t: serverTimestamp() }).catch(() => {});
}

function vistaSkjatima() {
  stodvaTimamaelingu();
  if (!maelaNotanda()) {
    hefjaTimamaelingu();
    return;
  }
  const sekundur = Math.round(ovistadurSkjatimi);
  ovistadurSkjatimi = 0;
  // lastActive fylgir með hér, sama skrif og skjátíminn - en aðeins ef
  // notandinn gerði eitthvað frá síðustu vistun (opinn, ónotaður flipi er ekki
  // "virkur").
  const breytingar = {};
  if (hreyfingSidanVistun || sekundur >= 1) {
    breytingar.lastActive = serverTimestamp();
    skraOnlineStodu();
  }
  hreyfingSidanVistun = false;
  if (sekundur >= 1) {
    breytingar.screenTimeSeconds = increment(sekundur);
    Object.assign(breytingar, virkniReitur(sekundur));
  }
  if (Object.keys(breytingar).length === 0) {
    hefjaTimamaelingu();
    return;
  }
  updateDoc(doc(db, "users", notandi.uid), breytingar).catch((villa) => {
    console.error(villa);
    ovistadurSkjatimi += sekundur;
  });
  hefjaTimamaelingu();
}

// Auka lastActive-skrif um leið og notandinn gerir eitthvað raunverulegt
// (smellur, snertir skjáinn, slær á lykilborð) - til viðbótar við skrifið í
// vistaSkjatima að ofan, svo "síðast virk/ur" uppfærist samstundis í stað
// þess að bíða eftir næstu 2 mín flautun. Takmarkað við eitt Firestore-skrif
// á 2 mínútna fresti svo tíðar smellir/áslættir skrifaflæði ekki yfir kvótann.
let sidastaVirkniSkrif = 0;
function skraVirkni() {
  if (!maelaNotanda()) return;
  const nuna = Date.now();
  if (nuna - sidastaVirkniSkrif < 120000) return;
  sidastaVirkniSkrif = nuna;
  updateDoc(doc(db, "users", notandi.uid), { lastActive: serverTimestamp() }).catch(() => {});
  skraOnlineStodu();
}
["click", "touchstart", "keydown"].forEach((heiti) => {
  document.addEventListener(heiti, skraVirkni, { passive: true });
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    vistaSkjatima();
  } else {
    hefjaTimamaelingu();
  }
});

window.addEventListener("beforeunload", () => {
  stodvaTimamaelingu();
  if (maelaNotanda() && ovistadurSkjatimi >= 1) {
    const sekundur = Math.round(ovistadurSkjatimi);
    const breytingar = {};
    if (sekundur >= 1) Object.assign(breytingar, { screenTimeSeconds: increment(sekundur) }, virkniReitur(sekundur));
    updateDoc(doc(db, "users", notandi.uid), breytingar).catch(() => {});
  }
});

setInterval(vistaSkjatima, 120000);

// TÍMABUNDIÐ meðan á þróun/grunnvinnu stendur: requireAuth er false svo hægt sé
// að skoða verkefni/glærur án innskráningar. Innskráning er samt áskilin til að
// svara spurningum (sjá byggjaSpurningaKort). Fyrir alvöru notkun: settu
// requireAuth aftur í true hér, og "if true" aftur í "if innskradur()" fyrir
// verkefni/questions í firestore.rules.
vaktaInnskraningu({ requireAuth: false }, (user, gogn) => {
  notandi = user;
  erAdminNotandi = gogn?.role === "admin";
  biolistiSed = gogn?.biolistiSed || {};
  notandaKyn = gogn?.kyn || kynNemandaUrNafni(gogn?.nafn);
  kveikjaBeta(gogn, user);
  // Tímasett áminning bíður nemandans: skráum að hann er online svo hætt sé við sendinguna (sjá Ýta við í stjórnborðinu).
  bidAminning = !!gogn?.aaetladAminning && !!user && gogn.role !== "admin";
  if (bidAminning) skraOnlineStodu();
  // "Hver er" flipinn sést aðeins hjá admin (ekki í "Sjá eins og nemandi").
  hverErBtn.hidden = !erKennileitaYfirferd();

  if (user) {
    notandaNafn.textContent = gogn.nafn || user.email;
    utskraBtn.hidden = false;
    minStadaBtn.hidden = false;
    glosurBtn.hidden = false;
    hefjaTimamaelingu();
    if (!erAdminNotandi) updateDoc(doc(db, "users", user.uid), { lastActive: serverTimestamp() }).catch(() => {});

    // "Mín staða" er upphafspunktur innskráðra nemenda - þau sjá eigin
    // stöðu um leið og þau koma inn, frekar en að þurfa að smella á hnapp.
    synaSvaedi("minstada");
    hladaMinaStodu();
    // Nýja útlitið: farið á síðuna sem slóðin (#...) vísar á.
    if (betaVirkt) {
      if (betaUpphafsLeid !== "heim") betaFaraI(betaUpphafsLeid);
      betaFyrstaHledsla = false;
    }

    // "?forskodun=1" (hlekkurinn "Sjá eins og nemandi" á stjórnborðinu) felur
    // stjórnborðs-sértæku snertifletina svo síðan birtist nákvæmlega eins og
    // venjulegur nemandi sér hana, jafnvel þó notandinn sé admin.
    const erForskodun = new URLSearchParams(window.location.search).get("forskodun") === "1";
    if (gogn.role === "admin" && !erForskodun) {
      notandaNafn.classList.add("nafn-stjornbord");
      notandaNafn.title = "Fara í stjórnborðið";
      notandaNafn.addEventListener("click", () => {
        window.location.href = "stjornbord.html";
      });
    }
  } else {
    notandaNafn.textContent = "Gestur (ekki skráð/ur inn)";
    utskraBtn.hidden = true;
    minStadaBtn.hidden = true;
    glosurBtn.hidden = true;
  }

  hladaVerkefnaListi();

  // "?prof=<id>" (sjá "Byrja" hnappinn í byggjaHradaspurningarKort, sem opnar
  // próf í nýjum flipa) - hoppar beint í spurningar þess prófs í stað
  // venjulega upphafsskjásins.
  const profIdUrSlod = new URLSearchParams(window.location.search).get("prof");
  if (profIdUrSlod) opnaProfUrSlod(profIdUrSlod);
});

async function opnaProfUrSlod(profId) {
  const snap = await getDoc(doc(db, "verkefni", profId));
  if (!snap.exists()) return;
  opnaVerkefni(snap.id, snap.data());
}

utskraBtn.addEventListener("click", () => skraUt());

// --- Nýja útlitið (beta) ---
// Hliðarvalmynd á tölvu og þriggja lína valmynd í haus á síma, líkt og stjórnborðið.
function kveikjaBeta(gogn, user) {
  const params = new URLSearchParams(window.location.search);
  // Allir innskráðir fá nýja útlitið (admin líka). "?utlit=gamalt" sýnir gamla útlitið admin til samanburðar.
  const erAdmin = gogn?.role === "admin";
  if (!user || (erAdmin && params.get("utlit") === "gamalt")) return;
  betaVirkt = true;
  document.body.classList.add("beta");
  betaHlid.hidden = false;
  betaHaus.hidden = false;
  betaValmyndTakki.hidden = false;
  // "Hver er" og "Stjórnborð" sjást aðeins admin (ekki í "Sjá eins og nemandi").
  document.querySelectorAll(".beta-admin").forEach((e) => (e.hidden = !erKennileitaYfirferd()));
  betaNotandaNafn.textContent = gogn.nafn || user.email;
  const fornafn = (gogn.nafn || user.email || "").split(" ")[0];
  BETA_FYRIRSAGNIR.heim[0] = `Hæ, ${fornafn} 👋`;
  // Hver síða hefur sína slóð (#ahugavert o.s.frv.) svo endurhleðsla heldur nemandanum
  // á sömu síðu og bakkhnappurinn virkar. Upphafssíðan er munuð áður en nokkuð breytir slóðinni.
  const upphaf = location.hash.replace("#", "");
  betaUpphafsLeid = BETA_SIDUR.includes(upphaf) ? upphaf : "heim";
}

const BETA_FYRIRSAGNIR = {
  heim: ["Heim", ""],
  verkefni: ["Verkefni", ""],
  glosur: ["Glósur", ""],
  ahugavert: ["Áhugavert efni", ""],
  biolisti: ["Bíólisti", ""],
  hverer: ["Hver er", ""]
};
const BETA_LEIDIR = {
  minstada: "heim",
  verkefni: "verkefni",
  glaerur: "verkefni",
  spurningar: "verkefni",
  hverEr: "hverer",
  glosur: "glosur",
  ahugavert: "ahugavert",
  biolisti: "biolisti"
};

const BETA_SIDUR = ["heim", "verkefni", "glosur", "ahugavert", "biolisti", "hverer"];
let betaUpphafsLeid = "heim";
let betaFyrstaHledsla = true;

function betaSetjaHash(leid) {
  if (location.hash === `#${leid}`) return;
  // Fyrsta hleðslan skiptir um færslu (replace) svo bakkhnappurinn fari ekki í tóma stöðu.
  if (betaFyrstaHledsla) history.replaceState(null, "", `#${leid}`);
  else history.pushState(null, "", `#${leid}`);
}

window.addEventListener("hashchange", () => {
  if (!betaVirkt) return;
  const leid = location.hash.replace("#", "");
  if (BETA_SIDUR.includes(leid)) betaFaraI(leid);
});

function uppfaeraBetaNav(svaedi) {
  const leid = BETA_LEIDIR[svaedi] || "heim";
  betaSetjaHash(leid);
  betaNav.querySelectorAll("button[data-leid]").forEach((b) => b.classList.toggle("virkur", b.dataset.leid === leid));
  const fyrirsogn = BETA_FYRIRSAGNIR[svaedi === "minstada" ? "heim" : svaedi === "hverEr" ? "hverer" : svaedi];
  betaHaus.hidden = !fyrirsogn;
  if (fyrirsogn) {
    betaFyrirsogn.textContent = fyrirsogn[0];
    betaUndirtitill.textContent = fyrirsogn[1];
  }
}

function betaFaraI(leid) {
  if (leid === "heim") minStadaBtn.click();
  else if (leid === "verkefni") synaSvaedi("verkefni");
  else if (leid === "glosur") glosurBtn.click();
  else if (leid === "ahugavert") {
    synaSvaedi("ahugavert");
    hladaAhugavertFyrirNemendur();
  } else if (leid === "biolisti") {
    synaSvaedi("biolisti");
    hladaBiolista();
  } else if (leid === "hverer") {
    if (erKennileitaYfirferd()) hverErBtn.click();
  } else if (leid === "stjornbord") {
    if (erKennileitaYfirferd()) window.location.href = "stjornbord.html";
  } else if (leid === "utskra") utskraBtn.click();
}
// Á síma opnast valmyndin með þriggja lína takka í hausnum
function betaValmyndOpin(opin) {
  betaHlid.classList.toggle("opin", opin);
  betaValmyndTakki.classList.toggle("opin", opin);
  betaValmyndTakki.setAttribute("aria-expanded", String(opin));
  betaValmyndTakki.setAttribute("aria-label", opin ? "Loka valmynd" : "Opna valmynd");
  document.body.classList.toggle("beta-valmynd-opin", opin);
}
betaValmyndTakki.addEventListener("click", () => betaValmyndOpin(!betaHlid.classList.contains("opin")));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") betaValmyndOpin(false);
});
window.matchMedia("(min-width: 901px)").addEventListener("change", () => betaValmyndOpin(false));
betaNav.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-leid]");
  if (btn) {
    betaValmyndOpin(false);
    betaFaraI(btn.dataset.leid);
  }
});
document.querySelector(".beta-flytileidir").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-leid]");
  if (btn) betaFaraI(btn.dataset.leid);
});
betaUtskraBtn.addEventListener("click", () => utskraBtn.click());

// "Áhugavert efni": hlekkir sem admin skráir á stjórnborðinu (ahugavert safnið),
// birtir í flokkum (flokkur) með tákni (takn) - flokkarnir raðast eftir því
// hvaða hlekkur var skráður fyrst.
const AHUGAVERT_FLOKKAR = {
  "Gamlar keppnir": { takn: "📺", lysing: "", litur: "dokkt", logo: "ruv" },
  YouTube: { takn: "▶️", lysing: "", litur: "rautt", logo: "youtube" },
  "Hlaðvörp": { takn: "🎧", lysing: "", litur: "fjolublatt", logo: "spotify" }
};
// Lógó flokkanna (innbyggð SVG) í stað emoji-tákna í fyrirsögnum.
const AHUGAVERT_LOGO = {
  ruv: '<img src="images/ahugavert/ruv-logo.png" alt="RÚV">',
  youtube: '<svg viewBox="0 0 36 26" role="img" aria-label="YouTube"><rect width="36" height="26" rx="7" fill="#ff0000"/><path d="M14.5 7.5l9 5.5-9 5.5z" fill="#fff"/></svg>',
  apple: '<svg viewBox="0 0 26 26" role="img" aria-label="Apple Podcasts"><defs><linearGradient id="apGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f452ff"/><stop offset="1" stop-color="#832bc1"/></linearGradient></defs><rect width="26" height="26" rx="6" fill="url(#apGrad)"/><g fill="none" stroke="#fff" stroke-linecap="round" stroke-width="1.7"><path d="M8.2 15.6a5.6 5.6 0 1 1 9.6 0"/><path d="M5.6 17.2a8.6 8.6 0 1 1 14.8 0"/></g><circle cx="13" cy="11.2" r="2.1" fill="#fff"/><path d="M13 14.2c-1.5 0-2.2 1-2 2.3l.5 3.5c.1.8.7 1.4 1.5 1.4s1.4-.6 1.5-1.4l.5-3.5c.2-1.3-.5-2.3-2-2.3z" fill="#fff"/></svg>',
  spotify: '<svg viewBox="0 0 26 26" role="img" aria-label="Spotify"><circle cx="13" cy="13" r="13" fill="#1db954"/><g fill="none" stroke="#161616" stroke-linecap="round"><path d="M6 9.2c4.4-1.3 9.8-.9 13.9 1.5" stroke-width="2.1"/><path d="M6.8 13.2c3.7-1.1 8.1-.7 11.5 1.2" stroke-width="1.8"/><path d="M7.6 16.9c3-.8 6.4-.5 9.1 1.1" stroke-width="1.5"/></g></svg>'
};
const AHUGAVERT_LITIR = ["graent", "blatt", "appelsinugult"];
let ahugavertGogn = [];
let ahugavertHladid = false;

// "Tek þetta" er aðeins á hlekkjum í þessum flokkum - nemandinn merkir hvað hann
// ætlar að taka (geymt á users/{uid}.ahugavertTek.{hlekkjaID}).
const AHUGAVERT_TEK_FLOKKAR = ["Gamlar keppnir", "YouTube", "Hlaðvörp"];
let ahugavertTek = {};

function byggjaTekHnapp(g) {
  const tekBtn = document.createElement("button");
  tekBtn.type = "button";
  tekBtn.className = "ahugavert-tek";
  const uppfaera = () => {
    const tek = !!ahugavertTek[g.id];
    tekBtn.classList.toggle("tek", tek);
    tekBtn.setAttribute("aria-pressed", String(tek));
    tekBtn.textContent = tek ? "✅ Tek þetta" : "☐ Tek þetta";
  };
  uppfaera();
  tekBtn.addEventListener("click", async () => {
    const nyttGildi = !ahugavertTek[g.id];
    if (nyttGildi) ahugavertTek[g.id] = true;
    else delete ahugavertTek[g.id];
    uppfaera();
    try {
      await updateDoc(doc(db, "users", notandi.uid), {
        [`ahugavertTek.${g.id}`]: nyttGildi ? true : deleteField()
      });
    } catch (villa) {
      console.error(villa);
      if (nyttGildi) delete ahugavertTek[g.id];
      else ahugavertTek[g.id] = true;
      uppfaera();
      alert("Tókst ekki að vista - reyndu aftur.");
    }
  });
  return tekBtn;
}

function byggjaAhugavertKort(g, litur) {
  const kort = document.createElement("div");
  kort.className = `ahugavert-kort litur-${litur}`;

  const erKeppni = /^\d{4}$/.test(g.takn || "");
  let takn;
  if (g.mynd && erKeppni) {
    // Keppnir: borði með mynd úr þættinum og ártalið yfir (ekkert annað nafn).
    takn = document.createElement("div");
    takn.className = "ahugavert-bordi";
    const mynd = document.createElement("img");
    mynd.src = g.mynd;
    mynd.alt = "";
    mynd.loading = "lazy";
    const ar = document.createElement("span");
    ar.textContent = g.takn;
    takn.append(mynd, ar);
    kort.classList.add("ahugavert-med-borda");
  } else if (g.mynd) {
    takn = document.createElement("img");
    takn.className = "ahugavert-takn ahugavert-takn-mynd";
    takn.src = g.mynd;
    takn.alt = "";
    takn.loading = "lazy";
  } else {
    takn = document.createElement("div");
    takn.className = "ahugavert-takn";
    takn.textContent = g.takn || "🔗";
    if (erKeppni) takn.classList.add("ahugavert-ar");
  }

  // Telur smelli á hlekki (Apple-hlekkur hlaðvarps telst sér).
  const talaSmell = (e) => {
    const a = e.target.closest("a");
    if (a && g.id) skraSmell("ahugavertSmellir", a.dataset.veita === "apple" ? `${g.id}_apple` : g.id);
  };
  kort.addEventListener("click", talaSmell);
  kort.addEventListener("auxclick", talaSmell);

  const texti = document.createElement("div");
  texti.className = "ahugavert-texti";
  // Titillinn er hlekkurinn sjálfur og teygist yfir allt spjaldið (::after).
  const tengill = document.createElement("a");
  tengill.className = "ahugavert-nafn";
  tengill.href = g.slod;
  tengill.target = "_blank";
  tengill.rel = "noopener noreferrer";
  tengill.setAttribute("aria-label", g.titill || g.slod);
  if (erKeppni) {
    tengill.classList.add("ahugavert-nafn-falid");
  } else {
    const titill = document.createElement("strong");
    titill.textContent = g.titill || g.slod;
    tengill.appendChild(titill);
  }
  texti.appendChild(tengill);
  // Keppnir sýna aðeins myndina með ártalinu - engan texta undir.
  if (erKeppni && g.mynd) {
    kort.append(takn, tengill);
    if (g.id && AHUGAVERT_TEK_FLOKKAR.includes(g.flokkur)) {
      const tekBtn = byggjaTekHnapp(g);
      tekBtn.classList.add("ahugavert-tek-litill");
      kort.appendChild(tekBtn);
    }
    return kort;
  }
  if (g.lysing) {
    const lysing = document.createElement("span");
    lysing.textContent = g.lysing;
    texti.appendChild(lysing);
  }
  const host = document.createElement("span");
  host.className = "ahugavert-host";
  try {
    host.textContent = new URL(g.slod).hostname.replace(/^www\./, "");
  } catch (villa) {
    host.textContent = "Opna";
  }
  if (!g.slodApple) texti.appendChild(host);

  // Hlaðvörp sem eru bæði á Spotify og Apple Podcasts: tveir hlekkir, einn fyrir hvora veitu.
  if (g.slodApple && /^https?:\/\//i.test(g.slodApple)) {
    const veitur = document.createElement("div");
    veitur.className = "ahugavert-veitur";
    [
      ["spotify", "Spotify", g.slod],
      ["apple", "Apple", g.slodApple]
    ].forEach(([lykill, nafn, slod]) => {
      const a = document.createElement("a");
      a.className = "ahugavert-veita";
      a.dataset.veita = lykill;
      a.href = slod;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerHTML = `${AHUGAVERT_LOGO[lykill]}<span></span>`;
      a.querySelector("span").textContent = nafn;
      a.title = lykill === "apple" ? "Opna í Apple Podcasts" : "Opna á Spotify";
      a.setAttribute("aria-label", a.title);
      veitur.appendChild(a);
    });
    texti.appendChild(veitur);
  }

  if (g.id && AHUGAVERT_TEK_FLOKKAR.includes(g.flokkur)) texti.appendChild(byggjaTekHnapp(g));

  const orEl = document.createElement("div");
  orEl.className = "ahugavert-or";
  orEl.textContent = "↗";

  kort.append(takn, texti, orEl);
  return kort;
}

function birtaAhugavert(leit = "") {
  const q = leit.trim().toLowerCase();
  ahugavertListi.innerHTML = "";
  const flokkar = new Map();
  ahugavertGogn.forEach((g) => {
    const hluti = `${g.titill} ${g.lysing || ""} ${g.flokkur || ""}`.toLowerCase();
    if (q && !hluti.includes(q)) return;
    const f = g.flokkur || "Annað";
    if (!flokkar.has(f)) flokkar.set(f, []);
    flokkar.get(f).push(g);
  });
  if (flokkar.size === 0) {
    ahugavertListi.innerHTML = `<p class="ahugavert-tomt">${q ? "Ekkert fannst - prófaðu annað leitarorð." : "Ekkert áhugavert efni ennþá - kíktu aftur seinna."}</p>`;
    return;
  }
  let nr = 0;
  flokkar.forEach((hlekkir, nafn) => {
    const upplysingar = AHUGAVERT_FLOKKAR[nafn] || {};
    const litur = upplysingar.litur || AHUGAVERT_LITIR[nr % AHUGAVERT_LITIR.length];
    nr++;
    const kafli = document.createElement("section");
    kafli.className = "ahugavert-kafli";
    const haus = document.createElement("div");
    haus.className = "ahugavert-kafli-haus";
    const fyrirsogn = document.createElement("h2");
    if (upplysingar.logo) {
      const logo = document.createElement("span");
      logo.className = "ahugavert-logo";
      logo.innerHTML = AHUGAVERT_LOGO[upplysingar.logo];
      fyrirsogn.append(logo, nafn);
    } else {
      fyrirsogn.textContent = `${upplysingar.takn || "✨"} ${nafn}`;
    }
    const fjoldi = document.createElement("span");
    fjoldi.className = "ahugavert-fjoldi";
    fjoldi.textContent = hlekkir.length;
    haus.append(fyrirsogn, fjoldi);
    kafli.appendChild(haus);
    if (upplysingar.lysing) {
      const lysing = document.createElement("p");
      lysing.className = "ahugavert-kafli-lysing";
      lysing.textContent = upplysingar.lysing;
      kafli.appendChild(lysing);
    }
    // Keppnirnar eru raðaðar eftir ártali (nýjasta fyrst), óháð því í hvaða röð þær voru skráðar.
    if (nafn === "Gamlar keppnir") hlekkir.sort((a, b) => (Number(b.takn) || 0) - (Number(a.takn) || 0));
    const net = document.createElement("div");
    net.className = nafn === "Gamlar keppnir" ? "ahugavert-net ahugavert-net-litid" : "ahugavert-net";
    hlekkir.forEach((g) => net.appendChild(byggjaAhugavertKort(g, litur)));
    kafli.appendChild(net);
    ahugavertListi.appendChild(kafli);
  });
}

// Sækir hlekkina einu sinni (deilt milli Áhugavert efni flipans og "Efnið sem ég tek" á Heim).
async function sotaAhugavertGogn() {
  if (ahugavertHladid) return;
  const snap = await getDocs(collection(db, "ahugavert"));
  ahugavertGogn = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((g) => /^https?:\/\//i.test(g.slod || ""))
    .sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
  ahugavertHladid = true;
}

async function hladaAhugavertFyrirNemendur() {
  ahugavertListi.innerHTML = skeletonKort(3);
  try {
    if (notandi) {
      const uSnap = await getDoc(doc(db, "users", notandi.uid));
      ahugavertTek = uSnap.data()?.ahugavertTek || {};
    }
    await sotaAhugavertGogn();
    birtaAhugavert();
  } catch (villa) {
    console.error(villa);
    ahugavertListi.innerHTML = "<p>Tókst ekki að sækja efnið. Reyndu aftur síðar.</p>";
  }
}

// "Efnið sem ég tek" á Heim: það sem nemandinn hefur merkt "Tek þetta", með
// flýtileið á hlekkinn og möguleika á að taka það af.
async function birtaMittEfni(tek) {
  ahugavertTek = tek;
  try {
    await sotaAhugavertGogn();
  } catch (villa) {
    console.error(villa);
    mittEfniSvaedi.hidden = true;
    return;
  }
  const valin = ahugavertGogn.filter((g) => ahugavertTek[g.id]);
  mittEfniListi.innerHTML = "";
  // Hlutinn sést aðeins ef nemandinn hefur valið eitthvað.
  mittEfniSvaedi.hidden = valin.length === 0;
  if (valin.length === 0) return;
  valin.forEach((g) => {
    const kort = document.createElement("div");
    kort.className = `mitt-efni-kort litur-${(AHUGAVERT_FLOKKAR[g.flokkur] || {}).litur || "graent"}`;
    const mynd = document.createElement(g.mynd ? "img" : "div");
    mynd.className = "mitt-efni-mynd";
    if (g.mynd) {
      mynd.src = g.mynd;
      mynd.alt = "";
      mynd.loading = "lazy";
    } else {
      mynd.textContent = g.takn || "🔗";
    }
    const texti = document.createElement("div");
    texti.className = "mitt-efni-texti";
    const tengill = document.createElement("a");
    tengill.className = "ahugavert-nafn";
    tengill.href = g.slod;
    tengill.target = "_blank";
    tengill.rel = "noopener noreferrer";
    const titill = document.createElement("strong");
    titill.textContent = /^\d{4}$/.test(g.titill || "") ? `Gettu betur ${g.titill}` : g.titill;
    tengill.appendChild(titill);
    const undir = document.createElement("span");
    undir.className = "mitt-efni-undir";
    const logo = /spotify\.com/i.test(g.slod) ? AHUGAVERT_LOGO.spotify : /youtube\.com/i.test(g.slod) ? AHUGAVERT_LOGO.youtube : "";
    if (logo) {
      const l = document.createElement("span");
      l.className = "mitt-efni-logo";
      l.innerHTML = logo;
      undir.appendChild(l);
    }
    undir.append(g.flokkur || "");
    texti.append(tengill, undir);
    const takaAf = document.createElement("button");
    takaAf.type = "button";
    takaAf.className = "mitt-efni-takaaf";
    takaAf.title = "Taka af listanum";
    takaAf.setAttribute("aria-label", `Taka ${g.titill} af listanum`);
    takaAf.textContent = "✕";
    takaAf.addEventListener("click", async () => {
      delete ahugavertTek[g.id];
      kort.remove();
      if (mittEfniListi.children.length === 0) birtaMittEfni(ahugavertTek);
      try {
        await updateDoc(doc(db, "users", notandi.uid), { [`ahugavertTek.${g.id}`]: deleteField() });
      } catch (villa) {
        console.error(villa);
        ahugavertTek[g.id] = true;
        birtaMittEfni(ahugavertTek);
      }
    });
    kort.append(mynd, texti, takaAf);
    mittEfniListi.appendChild(kort);
  });
}
mittEfniAllirBtn.addEventListener("click", () => betaFaraI("ahugavert"));

// --- Bíólisti (beta): tveir flokkar mynda með lengd og IMDb einkunn ---
// Gögnin eru í data/biolisti.json (búin til með scripts/bua-til-biolista.py).
let biolistiGogn = null;
const BIOLISTI_ALLAR = "Allar myndirnar";
let biolistiFlokkur = BIOLISTI_ALLAR;
// Hvað nemandinn hefur séð og gefið stjörnur (users/{uid}.biolistiSed.{imdbID}.stjornur, 0-5 eða null).
let biolistiSed = {};
let notandaKyn;

// Kyn eftir fyrsta nafni (Hinrik og Sólon strákar, Hekla og Júlía stelpur) - sama og kynNemanda í admin.js.
function kynNemandaUrNafni(nafn) {
  const fyrsta = (nafn || "").trim().split(/\s+/)[0] || "";
  const n = fyrsta.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (["hinrik", "solon", "thorsteinn", "steini"].includes(n)) return "kk";
  if (["hekla", "julia"].includes(n)) return "kvk";
  return undefined;
}

function sedTexti() {
  return notandaKyn === "kk" ? "Búinn að sjá" : notandaKyn === "kvk" ? "Búin að sjá" : "Búin(n) að sjá";
}

// Talning á smellum (sést í stjórnborðinu): "Um" í Bíólista og hlekkir í Áhugavert efni.
// Geymt sem teljari á users/{uid}.<reitur>.<lykill>. Admin telst ekki með.
function skraSmell(reitur, lykill) {
  if (!notandi || erAdminNotandi || !lykill) return;
  updateDoc(doc(db, "users", notandi.uid), { [`${reitur}.${lykill}`]: increment(1) }).catch((villa) => console.error(villa));
}

async function vistaBiolistaSed(imdb, gildi) {
  try {
    await updateDoc(doc(db, "users", notandi.uid), { [`biolistiSed.${imdb}`]: gildi === null ? deleteField() : gildi });
  } catch (villa) {
    console.error(villa);
    alert("Tókst ekki að vista - reyndu aftur.");
  }
}

function byggjaSedHluta(m) {
  const kassi = document.createElement("div");
  kassi.className = "biolisti-sed";
  if (!m.imdb || !notandi) return kassi;

  const teikna = () => {
    kassi.innerHTML = "";
    const sed = biolistiSed[m.imdb];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "biolisti-sed-takki" + (sed ? " sed" : "");
    btn.setAttribute("aria-pressed", String(!!sed));
    btn.textContent = `${sed ? "✅" : "☐"} ${sedTexti()}`;
    btn.addEventListener("click", () => {
      if (biolistiSed[m.imdb]) {
        delete biolistiSed[m.imdb];
        vistaBiolistaSed(m.imdb, null);
      } else {
        biolistiSed[m.imdb] = { stjornur: null };
        vistaBiolistaSed(m.imdb, { stjornur: null });
      }
      teikna();
    });
    kassi.appendChild(btn);

    if (sed) {
      const stjornur = document.createElement("div");
      stjornur.className = "biolisti-stjornur";
      stjornur.setAttribute("role", "group");
      stjornur.setAttribute("aria-label", "Þín einkunn, 0 til 5 stjörnur");
      const nuna = typeof sed.stjornur === "number" ? sed.stjornur : null;
      const veldu = (n) => {
        biolistiSed[m.imdb] = { stjornur: n };
        vistaBiolistaSed(m.imdb, { stjornur: n });
        teikna();
      };
      const nullBtn = document.createElement("button");
      nullBtn.type = "button";
      nullBtn.className = "biolisti-stjarna-null" + (nuna === 0 ? " valin" : "");
      nullBtn.textContent = "0";
      nullBtn.title = "0 stjörnur";
      nullBtn.addEventListener("click", () => veldu(0));
      stjornur.appendChild(nullBtn);
      for (let i = 1; i <= 5; i++) {
        const st = document.createElement("button");
        st.type = "button";
        st.className = "biolisti-stjarna" + (nuna !== null && i <= nuna ? " full" : "");
        st.textContent = "★";
        st.title = `${i} ${i === 1 ? "stjarna" : "stjörnur"}`;
        st.setAttribute("aria-label", st.title);
        st.addEventListener("click", () => veldu(i));
        stjornur.appendChild(st);
      }
      const texti = document.createElement("span");
      texti.className = "biolisti-stjornur-texti";
      texti.textContent = nuna === null ? "Gefðu stjörnur" : `${nuna}/5`;
      stjornur.appendChild(texti);
      kassi.appendChild(stjornur);
    }
  };
  teikna();
  return kassi;
}

function formatLengd(minutur) {
  if (!minutur) return "";
  const klst = Math.floor(minutur / 60);
  const min = minutur % 60;
  return klst > 0 ? `${klst} klst ${min} mín` : `${min} mín`;
}

function birtaBiolista() {
  biolistiFlipar.innerHTML = "";
  // "Allar myndirnar": báðir flokkar saman. Sé mynd í báðum er sögufræga útgáfan (með "Um") notuð;
  // einkunn nemandans gildir samt í báðum því hún er geymd eftir IMDb-númeri.
  const sogu = biolistiGogn["Sögufrægustu"] || [];
  const soguIds = new Set(sogu.map((m) => m.imdb).filter(Boolean));
  const samsett = [...sogu, ...(biolistiGogn["Byggt á sönnum atburðum"] || []).filter((m) => !m.imdb || !soguIds.has(m.imdb))];
  const flokkar = { [BIOLISTI_ALLAR]: samsett, ...biolistiGogn };
  Object.entries(flokkar).forEach(([nafn, myndir]) => {
    const flipi = document.createElement("button");
    flipi.type = "button";
    flipi.setAttribute("role", "tab");
    flipi.className = "biolisti-flipi" + (nafn === biolistiFlokkur ? " virkur" : "");
    flipi.innerHTML = `<span></span><b>${myndir.length}</b>`;
    flipi.querySelector("span").textContent = nafn;
    flipi.addEventListener("click", () => {
      biolistiFlokkur = nafn;
      birtaBiolista();
    });
    biolistiFlipar.appendChild(flipi);
  });

  const iFlokki = flokkar[biolistiFlokkur] || [];

  // Síur: hnappur fyrir hverja tegund sem er til í flokknum (með fjölda).
  const talning = new Map();
  iFlokki.forEach((m) => (m.tegundir || []).forEach((t) => talning.set(t, (talning.get(t) || 0) + 1)));
  biolistiSiur.innerHTML = "";
  [...talning.entries()]
    .filter(([t]) => BIOLISTI_TEGUNDIR[t])
    .sort((a, b) => b[1] - a[1])
    .forEach(([t, fjoldi]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "biolisti-sia" + (biolistiValdarTegundir.has(t) ? " valin" : "");
      btn.setAttribute("aria-pressed", String(biolistiValdarTegundir.has(t)));
      btn.innerHTML = "<span></span><b></b>";
      btn.querySelector("span").textContent = BIOLISTI_TEGUNDIR[t];
      btn.querySelector("b").textContent = fjoldi;
      btn.addEventListener("click", () => {
        if (biolistiValdarTegundir.has(t)) biolistiValdarTegundir.delete(t);
        else biolistiValdarTegundir.add(t);
        birtaBiolista();
      });
      biolistiSiur.appendChild(btn);
    });
  if (biolistiValdarTegundir.size > 0) {
    const hreinsa = document.createElement("button");
    hreinsa.type = "button";
    hreinsa.className = "biolisti-sia hreinsa";
    hreinsa.textContent = "✕ Hreinsa";
    hreinsa.addEventListener("click", () => {
      biolistiValdarTegundir.clear();
      birtaBiolista();
    });
    biolistiSiur.appendChild(hreinsa);
  }

  uppfaeraSiuTakka();
  const siadar = biolistiValdarTegundir.size
    ? iFlokki.filter((m) => (m.tegundir || []).some((t) => biolistiValdarTegundir.has(t)))
    : iFlokki;
  const radad = [...siadar].sort(BIOLISTI_RODUN[biolistiRodun].radar);
  biolistiListi.innerHTML = radad.length === 0 ? "<p>Engar myndir í þessum flokki passa við valdar tegundir.</p>" : "";
  radad.forEach((m) => {
    const kort = document.createElement("div");
    kort.className = "biolisti-kort";

    // Plakat (ef það er til) - annars IMDb-gula reitinn sjálfan.
    const plagat = document.createElement(m.plagat ? "img" : "div");
    plagat.className = "biolisti-plagat";
    if (m.plagat) {
      plagat.src = m.plagat;
      plagat.alt = `Plakat: ${m.titill}`;
      plagat.loading = "lazy";
    } else {
      plagat.textContent = "🎬";
    }

    const texti = document.createElement("div");
    texti.className = "biolisti-texti";
    const titill = document.createElement("a");
    titill.className = "ahugavert-nafn biolisti-titill";
    titill.target = "_blank";
    titill.rel = "noopener noreferrer";
    titill.href = m.imdb ? `https://www.imdb.com/title/${m.imdb}/` : `https://www.imdb.com/find/?q=${encodeURIComponent(m.titill)}`;
    const nafn = document.createElement("strong");
    nafn.textContent = m.titill;
    titill.appendChild(nafn);
    const undir = document.createElement("span");
    undir.className = "biolisti-undir";
    undir.textContent = [m.islenskt, m.ar].filter(Boolean).join(" · ");

    const merki = document.createElement("div");
    merki.className = "biolisti-merki";
    const einkunn = document.createElement("span");
    einkunn.className = "biolisti-einkunn";
    einkunn.title = m.atkvaedi ? `${m.atkvaedi.toLocaleString("is-IS")} atkvæði á IMDb` : "IMDb";
    einkunn.innerHTML = "<small>IMDb</small><b></b>";
    einkunn.querySelector("b").textContent = m.einkunn ? `★ ${m.einkunn.toFixed(1).replace(".", ",")}` : "-";
    const lengd = document.createElement("span");
    lengd.className = "biolisti-lengd";
    lengd.textContent = `⏱ ${formatLengd(m.minutur) || "-"}`;
    merki.append(einkunn, lengd);

    const lysing = document.createElement("span");
    lysing.className = "biolisti-lysing";
    lysing.textContent = m.lysing || "";
    const folk = document.createElement("span");
    folk.className = "biolisti-folk";
    folk.textContent = m.folk || "";
    // "Búinn að sjá" og "Um" eru í sömu línu (stjörnugjöfin fer í línuna fyrir neðan ef hún passar ekki).
    const adgerdir = document.createElement("div");
    adgerdir.className = "biolisti-adgerdir";
    adgerdir.appendChild(byggjaSedHluta(m));
    texti.append(titill, undir, merki, lysing, folk, adgerdir);

    // "Um": allur textinn úr glærunum um myndina (aðeins sögufrægustu).
    if (m.um) {
      const umBtn = document.createElement("button");
      umBtn.type = "button";
      umBtn.className = "biolisti-um-takki";
      umBtn.textContent = "Um";
      umBtn.setAttribute("aria-expanded", "false");
      const umTexti = document.createElement("div");
      umTexti.className = "biolisti-um";
      umTexti.hidden = true;
      m.um.split("\n\n").forEach((mgr) => {
        const pEl = document.createElement("p");
        pEl.textContent = mgr;
        umTexti.appendChild(pEl);
      });
      umBtn.addEventListener("click", () => {
        const opid = umTexti.hidden;
        umTexti.hidden = !opid;
        umBtn.setAttribute("aria-expanded", String(opid));
        umBtn.textContent = opid ? "Loka" : "Um";
        if (opid) skraSmell("biolistiUm", m.imdb);
        kort.classList.toggle("opid", opid);
      });
      adgerdir.appendChild(umBtn);
      kort.append(plagat, texti, umTexti);
    } else {
      kort.append(plagat, texti);
    }
    biolistiListi.appendChild(kort);
  });
}

async function hladaBiolista() {
  if (biolistiGogn) return birtaBiolista();
  biolistiListi.innerHTML = skeletonKort(4);
  try {
    const svar = await fetch("data/biolisti.json", { cache: "no-cache" });
    if (!svar.ok) throw new Error(svar.status);
    biolistiGogn = await svar.json();
    birtaBiolista();
  } catch (villa) {
    console.error(villa);
    biolistiListi.innerHTML = "<p>Tókst ekki að sækja bíólistann. Reyndu aftur síðar.</p>";
  }
}
// "Raða eftir" í sama stíl og á ntc.is: reitur með ramma, merkið á rammanum og listi sem opnast undir.
const BIOLISTI_RODUN = {
  "ar-elst": { texti: "Ár - elst fyrst", radar: (a, b) => a.ar - b.ar },
  "ar-nyjast": { texti: "Ár - nýjast fyrst", radar: (a, b) => b.ar - a.ar },
  "einkunn-haest": { texti: "Einkunn - hæst fyrst", radar: (a, b) => (b.einkunn || 0) - (a.einkunn || 0) },
  "einkunn-laegst": { texti: "Einkunn - lægst fyrst", radar: (a, b) => (a.einkunn || 99) - (b.einkunn || 99) },
  "lengd-lengst": { texti: "Lengd - lengst fyrst", radar: (a, b) => (b.minutur || 0) - (a.minutur || 0) },
  "lengd-styst": { texti: "Lengd - styst fyrst", radar: (a, b) => (a.minutur || 9999) - (b.minutur || 9999) },
  nafn: { texti: "Nafn - a til ö", radar: (a, b) => a.titill.localeCompare(b.titill, "is") }
};
let biolistiRodun = "ar-elst";

// Tegundir (IMDb genres) á íslensku - síur í Bíólista. Margar tegundir saman sýna myndir sem passa við einhverja þeirra.
const BIOLISTI_TEGUNDIR = {
  Animation: "Teiknimyndir",
  Action: "Hasarmyndir",
  Thriller: "Spennumyndir",
  Comedy: "Gamanmyndir",
  Drama: "Drama",
  Romance: "Rómantík",
  Horror: "Hrollvekjur",
  "Sci-Fi": "Vísindaskáldskapur",
  Fantasy: "Fantasía",
  Adventure: "Ævintýramyndir",
  Crime: "Glæpamyndir",
  Mystery: "Ráðgátur",
  War: "Stríðsmyndir",
  History: "Sögulegar",
  Biography: "Ævisögur",
  Western: "Vestrar",
  Music: "Tónlist",
  Musical: "Söngleikir",
  Family: "Fjölskyldumyndir",
  Sport: "Íþróttir",
  Documentary: "Heimildarmyndir",
  "Film-Noir": "Film noir"
};
const biolistiValdarTegundir = new Set();
let biolistiSiurOpnar = false; // síurnar eru faldar í upphafi - "Síur" hnappurinn opnar þær

function uppfaeraSiuTakka() {
  biolistiSiur.hidden = !biolistiSiurOpnar;
  biolistiSiurTakki.setAttribute("aria-expanded", String(biolistiSiurOpnar));
  biolistiSiurTakki.classList.toggle("opid", biolistiSiurOpnar);
  biolistiSiurFjoldi.hidden = biolistiValdarTegundir.size === 0;
  biolistiSiurFjoldi.textContent = biolistiValdarTegundir.size;
}
biolistiSiurTakki.addEventListener("click", () => {
  biolistiSiurOpnar = !biolistiSiurOpnar;
  uppfaeraSiuTakka();
});

function lokaRodunarLista() {
  biolistiRodaListi.hidden = true;
  biolistiRodaHnappur.setAttribute("aria-expanded", "false");
}

function byggjaRodunarLista() {
  biolistiRodaGildi.textContent = BIOLISTI_RODUN[biolistiRodun].texti;
  biolistiRodaListi.innerHTML = "";
  Object.entries(BIOLISTI_RODUN).forEach(([lykill, val]) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.tabIndex = -1;
    li.textContent = val.texti;
    if (lykill === biolistiRodun) {
      li.classList.add("valin");
      li.setAttribute("aria-selected", "true");
    }
    li.addEventListener("click", () => {
      biolistiRodun = lykill;
      lokaRodunarLista();
      byggjaRodunarLista();
      if (biolistiGogn) birtaBiolista();
    });
    biolistiRodaListi.appendChild(li);
  });
}
biolistiRodaHnappur.addEventListener("click", (e) => {
  e.stopPropagation();
  const opna = biolistiRodaListi.hidden;
  biolistiRodaListi.hidden = !opna;
  biolistiRodaHnappur.setAttribute("aria-expanded", String(opna));
});
document.addEventListener("click", lokaRodunarLista);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") lokaRodunarLista();
});
byggjaRodunarLista();

function synaSvaedi(svaedi) {
  minStadaSvaedi.hidden = svaedi !== "minstada";
  glosurSvaedi.hidden = svaedi !== "glosur";
  ahugavertSvaedi.hidden = svaedi !== "ahugavert";
  biolistiSvaedi.hidden = svaedi !== "biolisti";
  if (betaVirkt) uppfaeraBetaNav(svaedi);
  hverErSvaedi.hidden = svaedi !== "hverEr";
  verkefnaSvaedi.hidden = svaedi !== "verkefni";
  glaeruSvaedi.hidden = svaedi !== "glaerur";
  spurningaSvaedi.hidden = svaedi !== "spurningar";
  if (svaedi === "spurningar") {
    // Skrollar beint á sjálfan spurningalistann (ekki bara efst á síðu) svo
    // "Byrja"/"Fara beint í spurningar" lendi á spurningunum sjálfum, í stað
    // fyrirsagnar/takka fyrir ofan þær.
    spurningaListi.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // Án þessa getur t.d. "Fara beint í spurningar" virst ekkert gera, ef
    // notandinn var skrollaður niður þegar hann smellti.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

tilbakaFraGlaerum.addEventListener("click", () => synaSvaedi("verkefni"));
tilbakaFraSpurningum.addEventListener("click", () => {
  if (valdHverErFlokkur) {
    synaSvaedi("hverEr");
    hladaHverEr();
  } else {
    synaSvaedi("verkefni");
  }
});
tilbakaFraHverEr.addEventListener("click", () => synaSvaedi("verkefni"));
hverErBtn.addEventListener("click", () => {
  synaSvaedi("hverEr");
  hladaHverEr();
});
tilbakaFraMinniStodu.addEventListener("click", () => synaSvaedi("verkefni"));
tilbakaFraGlosum.addEventListener("click", () => synaSvaedi("verkefni"));

// "Hver er" flipinn: spurningarnar (með mynd) eru í verkefninu "Hver er" sem er
// falið fyrir nemendum á verkefnalistanum (active: false) - hér eru þær
// flokkaðar eftir spurningatexta og spilaðar flokk fyrir flokk.
// Aðeins kennileiti og listaverk eru birt í flipanum núna - hinir flokkarnir
// (fólk) eru til í gögnunum og birtast aftur ef "falid" er tekið af.
const HVER_ER_FLOKKAR = [
  { titill: "Rithöfundar", takn: "📚", textar: ["Hver er þessi rithöfundur?"], falid: true },
  { titill: "Íslenskir leikarar", takn: "🎭", textar: ["Hver er þessi íslenski leikari?"], falid: true },
  { titill: "Tennisleikarar", takn: "🎾", textar: ["Hver er þessi tennisleikari?"], falid: true },
  { titill: "Kylfingar", takn: "⛳", textar: ["Hver er þessi kylfingur?"], falid: true },
  { titill: "Knattspyrna", takn: "⚽", textar: ["Hver er þessi knattspyrnumaður?", "Hver er þessi knattspyrnukona?"], falid: true },
  { titill: "Formúla 1", takn: "🏎️", textar: ["Hver er þessi ökuþór?"], falid: true },
  { titill: "Kennileiti", takn: "🗺️", textar: ["Hvaða kennileiti er þetta?"], adminEingongu: true },
  { titill: "Listaverk", takn: "🖼️", textar: ["Hver gerði þetta listaverk?"] }
];
// "Í hvaða landi er þetta kennileiti?" er ekki lengur spilað í flipanum en
// myndin á samt að sjást strax ef spurningin kemur fyrir annars staðar.
const HVER_ER_TEXTAR = new Set([
  ...HVER_ER_FLOKKAR.flatMap((f) => f.textar),
  "Í hvaða landi er þetta kennileiti?",
  "Hvað heitir þetta listaverk?"
]);

// Kennileitin eru enn í yfirferð hjá admin - sést aðeins þar (ekki í
// "Sjá eins og nemandi"). Merkið "þarf nýja mynd" gildir aðeins til miðnættis
// (UTC = íslenskur tími), sjá erNyMyndMerkt.
function erKennileitaYfirferd() {
  const erForskodun = new URLSearchParams(window.location.search).get("forskodun") === "1";
  return erAdminNotandi && !erForskodun;
}

function upphafDagsMs() {
  const nu = new Date();
  return Date.UTC(nu.getUTCFullYear(), nu.getUTCMonth(), nu.getUTCDate());
}

function erNyMyndMerkt(spurning) {
  const t = spurning?.nyMyndMerktAt;
  const ms = typeof t?.toMillis === "function" ? t.toMillis() : typeof t === "number" ? t : 0;
  return !!spurning?.nyMyndMerkt && ms >= upphafDagsMs();
}

function erHverErSpurning(spurning) {
  return !!spurning?.image && HVER_ER_TEXTAR.has(spurning.text);
}

let hverErVerkefniIdCache = null;
async function saekjaHverErVerkefniId() {
  if (hverErVerkefniIdCache) return hverErVerkefniIdCache;
  const snap = await getDocs(query(collection(db, "verkefni"), where("title", "==", "Hver er")));
  hverErVerkefniIdCache = snap.empty ? null : snap.docs[0].id;
  return hverErVerkefniIdCache;
}

async function hladaHverEr() {
  hverErFlokkar.innerHTML = skeletonKort(4, 1);
  const verkefniId = await saekjaHverErVerkefniId();
  if (!verkefniId) {
    hverErFlokkar.innerHTML = "<p>Hver er er ekki tilbúið ennþá.</p>";
    return;
  }
  const [spurningarSnap, svaradIds] = await Promise.all([
    getDocs(query(collection(db, "questions"), where("verkefniId", "==", verkefniId), where("active", "==", true))),
    notandi
      ? getDocs(collection(db, "users", notandi.uid, "attempts")).then((s) => new Set(s.docs.map((d) => d.id)))
      : Promise.resolve(new Set())
  ]);

  hverErFlokkar.innerHTML = "";
  HVER_ER_FLOKKAR.filter((f) => !f.falid && (!f.adminEingongu || erKennileitaYfirferd())).forEach((flokkur) => {
    const ids = spurningarSnap.docs.filter((d) => flokkur.textar.includes(d.data().text)).map((d) => d.id);
    if (ids.length === 0) return;

    const kort = document.createElement("button");
    kort.type = "button";
    kort.className = "hver-er-flokkur";

    const takn = document.createElement("span");
    takn.className = "hver-er-takn";
    takn.textContent = flokkur.takn;
    const titill = document.createElement("h3");
    titill.textContent = flokkur.titill;
    const lysing = document.createElement("p");
    lysing.className = "verkefni-lysing";
    lysing.textContent = `${ids.length} myndir`;
    kort.append(takn, titill, lysing);
    if (notandi) kort.appendChild(byggjaFramvindukort(ids, svaradIds));

    kort.addEventListener("click", () => opnaHverErFlokk(flokkur, verkefniId));
    hverErFlokkar.appendChild(kort);
  });
}

// Fjarlægir merki sem runnu út á miðnætti (gildið er hvort eð er hunsað í
// erNyMyndMerkt - þetta heldur bara gagnagrunninum hreinum).
async function hreinsaUtrunninMerki(skjol) {
  const utrunnin = skjol.filter((d) => d.data().nyMyndMerkt && !erNyMyndMerkt(d.data()));
  for (let i = 0; i < utrunnin.length; i += 400) {
    const batch = writeBatch(db);
    utrunnin.slice(i, i + 400).forEach((d) => batch.update(d.ref, { nyMyndMerkt: deleteField(), nyMyndMerktAt: deleteField() }));
    await batch.commit().catch((villa) => console.error(villa));
  }
}

// Yfirferðarhnappur á kennileitaspurningu: merkir hvort kennileitið þarf nýja
// mynd. Sýnir líka rétta svarið svo hægt sé að meta myndina.
const virkStada = new Map(); // questionId -> virk? (til að halda stöðunni milli síðna)
const nyMyndStada = new Map(); // questionId -> merkt? (til að halda stöðunni milli síðna)
function byggjaKennileitaYfirferd(korti, questionId, spurning) {
  const stjorn = document.createElement("div");
  stjorn.className = "kennileiti-yfirferd";

  const svarTexti = document.createElement("span");
  svarTexti.className = "kennileiti-svar";
  svarTexti.textContent = "Svar: …";
  getDoc(doc(db, "answers", questionId))
    .then((snap) => {
      svarTexti.textContent = `Svar: ${(snap.data()?.correctAnswers || []).join(" / ") || "—"}`;
    })
    .catch(() => {
      svarTexti.textContent = "";
    });

  const merkiBtn = document.createElement("button");
  merkiBtn.type = "button";
  merkiBtn.className = "smabtn";
  const uppfaeraTakka = () => {
    const merkt = nyMyndStada.has(questionId) ? nyMyndStada.get(questionId) : erNyMyndMerkt(spurning);
    merkiBtn.textContent = merkt ? "🔄 Þarf nýja mynd" : "🔄 Merkja: ný mynd";
    merkiBtn.classList.toggle("merkt", merkt);
  };
  uppfaeraTakka();
  merkiBtn.addEventListener("click", async () => {
    const nyttGildi = !(nyMyndStada.has(questionId) ? nyMyndStada.get(questionId) : erNyMyndMerkt(spurning));
    merkiBtn.disabled = true;
    try {
      await updateDoc(
        doc(db, "questions", questionId),
        nyttGildi
          ? { nyMyndMerkt: true, nyMyndMerktAt: serverTimestamp() }
          : { nyMyndMerkt: deleteField(), nyMyndMerktAt: deleteField() }
      );
      nyMyndStada.set(questionId, nyttGildi);
    } catch (villa) {
      console.error(villa);
      alert("Tókst ekki að vista merkið: " + villa.message);
    }
    merkiBtn.disabled = false;
    uppfaeraTakka();
  });

  // Slekkur/kveikir á spurningunni sjálfri (active) - t.d. ef kennileitið á ekki heima hér.
  const virkBtn = document.createElement("button");
  virkBtn.type = "button";
  virkBtn.className = "smabtn";
  const erVirk = () => (virkStada.has(questionId) ? virkStada.get(questionId) : spurning.active !== false);
  const uppfaeraVirkBtn = () => {
    virkBtn.textContent = erVirk() ? "⛔ Gera óvirkt" : "✅ Gera virkt";
    korti.classList.toggle("ovirkt-kort", !erVirk());
  };
  uppfaeraVirkBtn();
  virkBtn.addEventListener("click", async () => {
    const nyttGildi = !erVirk();
    virkBtn.disabled = true;
    try {
      await updateDoc(doc(db, "questions", questionId), { active: nyttGildi });
      virkStada.set(questionId, nyttGildi);
    } catch (villa) {
      console.error(villa);
      alert("Tókst ekki að breyta stöðunni: " + villa.message);
    }
    virkBtn.disabled = false;
    uppfaeraVirkBtn();
  });

  const takkar = document.createElement("div");
  takkar.className = "kennileiti-takkar";
  takkar.append(merkiBtn, virkBtn);
  stjorn.append(svarTexti, takkar);
  korti.appendChild(stjorn);
}

function opnaHverErFlokk(flokkur, verkefniId) {
  stillaFormTengil(null);
  valdVerkefniId = verkefniId;
  valdVerkefniErHrada = false;
  valdHverErFlokkur = flokkur;
  spurningaBunkastaerd = 10;
  spurningaTitill.textContent = `Hver er? — ${flokkur.titill}`;
  synaSvaedi("spurningar");
  hladaSpurningum();
  hladaMinumStodum();
}

minStadaBtn.addEventListener("click", () => {
  synaSvaedi("minstada");
  hladaMinaStodu();
});

glosurBtn.addEventListener("click", () => {
  synaSvaedi("glosur");
  hladaGlosur();
});

// Sækir (ef til) og birtir glósu notandans fyrir verkefnið sem verið er að
// skoða glærur fyrir - kallað úr opnaVerkefni(). Ein glósa á hvert verkefni,
// skjal-ID = verkefniID.
async function hladaGlosa(verkefniId) {
  if (!notandi) {
    glosaBox.hidden = true;
    return;
  }
  glosaBox.hidden = false;
  glosaTextarea.value = "";
  glosaStada.textContent = "Sæki glósu…";

  const snap = await getDoc(doc(db, "users", notandi.uid, "glosur", verkefniId));
  glosaTextarea.value = snap.exists() ? snap.data().texti || "" : "";
  glosaStada.textContent = "Aðeins þú sérð þetta.";
}

vistaGlosuBtn.addEventListener("click", async () => {
  if (!notandi || !valdVerkefniId) return;
  const texti = glosaTextarea.value.trim();
  vistaGlosuBtn.disabled = true;
  glosaStada.textContent = "Vista…";

  try {
    await setDoc(doc(db, "users", notandi.uid, "glosur", valdVerkefniId), {
      texti,
      verkefniTitill: verkefnaTitill.textContent,
      updatedAt: serverTimestamp()
    });
    glosaStada.textContent = "Vistað ✓ (aðeins þú sérð þetta)";
  } catch (villa) {
    console.error(villa);
    glosaStada.textContent = "Tókst ekki að vista - reyndu aftur.";
  } finally {
    vistaGlosuBtn.disabled = false;
  }
});

// "Bæta við glósu" í Glósur flipanum: velja verkefni og skrifa glósu. Ein glósa
// á hvert verkefni (skjal-ID = verkefniID), svo glósa sem þegar er til opnast
// til breytingar í stað þess að búa til nýja.
let nyGlosaTitlar = new Map();

async function opnaNyjaGlosu() {
  nyGlosaForm.hidden = false;
  nyGlosaBtn.hidden = true;
  nyGlosaTexti.value = "";
  nyGlosaStada.textContent = "Sæki verkefni…";
  const snap = await getDocs(query(collection(db, "verkefni"), where("active", "==", true)));
  const verkefni = snap.docs
    .filter((d) => synilegtNotanda(d.data()))
    .sort((a, b) => (a.data().title || "").localeCompare(b.data().title || "", "is"));
  nyGlosaTitlar = new Map(verkefni.map((d) => [d.id, d.data().title]));
  nyGlosaVerkefni.innerHTML = "";
  verkefni.forEach((d) => nyGlosaVerkefni.appendChild(new Option(d.data().title, d.id)));
  nyGlosaStada.textContent = "Aðeins þú sérð þetta. Ein glósa á hvert verkefni.";
  await fyllaInnFyrriGlosu();
  nyGlosaTexti.focus();
}

async function fyllaInnFyrriGlosu() {
  const id = nyGlosaVerkefni.value;
  if (!id) return;
  const snap = await getDoc(doc(db, "users", notandi.uid, "glosur", id));
  nyGlosaTexti.value = snap.exists() ? snap.data().texti || "" : "";
  nyGlosaStada.textContent = nyGlosaTexti.value
    ? "Þú átt þegar glósu um þetta verkefni - þú ert að breyta henni."
    : "Aðeins þú sérð þetta. Ein glósa á hvert verkefni.";
}

function lokaNyrriGlosu() {
  nyGlosaForm.hidden = true;
  nyGlosaBtn.hidden = false;
}

nyGlosaBtn.addEventListener("click", opnaNyjaGlosu);
nyGlosaHaettaBtn.addEventListener("click", lokaNyrriGlosu);
nyGlosaVerkefni.addEventListener("change", fyllaInnFyrriGlosu);
nyGlosaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = nyGlosaVerkefni.value;
  const texti = nyGlosaTexti.value.trim();
  if (!notandi || !id || !texti) return;
  nyGlosaVistaBtn.disabled = true;
  nyGlosaStada.textContent = "Vista…";
  try {
    await setDoc(doc(db, "users", notandi.uid, "glosur", id), {
      texti,
      verkefniTitill: nyGlosaTitlar.get(id) || "",
      updatedAt: serverTimestamp()
    });
    lokaNyrriGlosu();
    hladaGlosur();
  } catch (villa) {
    console.error(villa);
    nyGlosaStada.textContent = "Tókst ekki að vista - reyndu aftur.";
  } finally {
    nyGlosaVistaBtn.disabled = false;
  }
});

// "Glósurnar mínar" - yfirlit yfir öll verkefni sem notandinn hefur skrifað
// glósu um, með flýtileið til að breyta eða eyða hverri glósu.
async function hladaGlosur() {
  if (!notandi) return;
  nyGlosaBtn.hidden = false;
  nyGlosaForm.hidden = true;
  glosurListi.innerHTML = skeletonKort(3, 1);

  const [glosurSnap, spurningaGlosur] = await Promise.all([
    getDocs(collection(db, "users", notandi.uid, "glosur")),
    (spurningaGlosurMinni = null, saekjaSpurningaGlosur())
  ]);
  const glosur = glosurSnap.docs.filter((d) => (d.data().texti || "").trim().length > 0);

  glosurListi.innerHTML = "";
  if (glosur.length === 0 && spurningaGlosur.size === 0) {
    glosurListi.innerHTML = "<p>Engar glósur ennþá.</p>";
    return;
  }

  glosur.forEach((gDoc) => {
    const gogn = gDoc.data();
    const kort = document.createElement("article");
    kort.className = "spurning-kort";

    const titill = document.createElement("h3");
    titill.textContent = gogn.verkefniTitill || "Ótengt verkefni";
    kort.appendChild(titill);

    const texti = document.createElement("p");
    texti.style.whiteSpace = "pre-wrap";
    texti.textContent = gogn.texti;
    kort.appendChild(texti);

    const breytaBtn = document.createElement("button");
    breytaBtn.type = "button";
    breytaBtn.className = "smabtn";
    breytaBtn.textContent = "Breyta glósu →";
    breytaBtn.addEventListener("click", async () => {
      const verkefniSnap = await getDoc(doc(db, "verkefni", gDoc.id));
      if (!verkefniSnap.exists()) {
        alert("Þetta verkefni er ekki lengur til.");
        return;
      }
      opnaVerkefni(gDoc.id, verkefniSnap.data());
    });

    const eydaBtn = document.createElement("button");
    eydaBtn.type = "button";
    eydaBtn.className = "smabtn";
    eydaBtn.textContent = "Eyða glósu";
    eydaBtn.addEventListener("click", async () => {
      if (!confirm(`Eyða glósunni um "${gogn.verkefniTitill}"?`)) return;
      await deleteDoc(gDoc.ref);
      hladaGlosur();
    });

    kort.appendChild(breytaBtn);
    kort.appendChild(eydaBtn);
    glosurListi.appendChild(kort);
  });

  // Glósur við einstakar spurningar
  if (spurningaGlosur.size > 0) {
    const fyrirsogn = document.createElement("h3");
    fyrirsogn.textContent = "Glósur um spurningar";
    fyrirsogn.style.margin = "22px 0 10px";
    glosurListi.appendChild(fyrirsogn);
    [...spurningaGlosur.entries()]
      .sort((a, b) => (b[1].updatedAt?.toMillis?.() ?? 0) - (a[1].updatedAt?.toMillis?.() ?? 0))
      .forEach(([qId, g]) => {
        const kort = document.createElement("article");
        kort.className = "spurning-kort";
        const q = document.createElement("h3");
        q.textContent = g.spurning || "Spurning";
        const t = document.createElement("p");
        t.style.whiteSpace = "pre-wrap";
        t.textContent = g.texti;
        const eyda = document.createElement("button");
        eyda.type = "button";
        eyda.className = "smabtn";
        eyda.textContent = "Eyða glósu";
        eyda.addEventListener("click", async () => {
          if (!confirm("Eyða þessari glósu?")) return;
          await deleteDoc(doc(db, "users", notandi.uid, "spurningaGlosur", qId));
          spurningaGlosurMinni = null;
          hladaGlosur();
        });
        kort.append(q, t, eyda);
        glosurListi.appendChild(kort);
      });
  }
}

// Les tölfræðina beint af users/{uid} (fjoldiSvarad/fjoldiRett/fjoldiPass/
// verkefnaStada) í stað þess að endurreikna úr öllum attempts- og
// answers-skjölum í hvert sinn - sjá uppfaeraSamtoluStodu, sem heldur þessu
// réttu jafnóðum (sama mynstur og admin.js notar fyrir stjórnborðið).
async function hladaMinaStodu() {
  if (!notandi) return;

  minarStodurListi.innerHTML = skeletonKort(3, 1);
  minarStodurSvarad.textContent = "—";
  minarStodurRett.textContent = "—";
  minarStodurNakvaemni.textContent = "—";
  minarStodurSkjatimi.textContent = "—";

  const [verkefnaSnap, notandiSnap] = await Promise.all([
    getDocs(collection(db, "verkefni")),
    getDoc(doc(db, "users", notandi.uid))
  ]);

  const verkefnaTitlar = new Map(verkefnaSnap.docs.map((d) => [d.id, d.data().title]));
  const verkefnaGogn = new Map(verkefnaSnap.docs.map((d) => [d.id, d.data()]));
  const notandaGogn = notandiSnap.data() || {};

  birtaVikuAherslu(verkefnaSnap);
  if (betaVirkt) birtaMittEfni(notandaGogn.ahugavertTek || {});

  // Núverandi óvistaður skjátími (síðan á síðustu skrifum) talinn með svo talan sé lifandi.
  const grunnSkjatimi = notandaGogn.screenTimeSeconds || 0;
  const birturSkjatimi = grunnSkjatimi + Math.round(ovistadurSkjatimi);
  minarStodurSkjatimi.textContent = formatSkjatimi(birturSkjatimi);

  const fjoldiSvarad = notandaGogn.fjoldiSvarad || 0;
  const fjoldiPass = notandaGogn.fjoldiPass || 0;
  const fjoldiRett = notandaGogn.fjoldiRett || 0;
  const fjoldiMetin = fjoldiSvarad - fjoldiPass;
  const nakvaemni = fjoldiMetin ? Math.round((fjoldiRett / fjoldiMetin) * 100) : 0;

  minarStodurSvarad.textContent = fjoldiSvarad;
  minarStodurRett.textContent = fjoldiRett;
  minarStodurNakvaemni.textContent = `${nakvaemni}%`;

  minarStodurListi.innerHTML = "";

  const perVerkefni = notandaGogn.verkefnaStada || {};
  const verkefniIds = Object.keys(perVerkefni);

  if (verkefniIds.length === 0) {
    minarStodurListi.innerHTML = "<p>Þú hefur ekki svarað neinum spurningum ennþá.</p>";
    return;
  }

  const rodud = verkefniIds
    .map((id) => [id, perVerkefni[id]])
    .sort((a, b) => (b[1].svarad || 0) - (a[1].svarad || 0));

  rodud.forEach(([verkefniId, bHra]) => {
    const b = { svarad: bHra.svarad || 0, pass: bHra.pass || 0, rett: bHra.rett || 0 };
    const metin = b.svarad - b.pass;
    const hlutfall = metin ? Math.round((b.rett / metin) * 100) : 0;

    const kort = document.createElement("article");
    kort.className = "spurning-kort";

    const haus = document.createElement("div");
    haus.style.display = "flex";
    haus.style.justifyContent = "space-between";
    haus.style.alignItems = "center";
    haus.style.marginBottom = "10px";

    const titill = document.createElement("strong");
    titill.textContent = verkefnaTitlar.get(verkefniId) || "Ótengdar spurningar";

    const lysing = document.createElement("span");
    lysing.className = "framvinda-lysing";
    lysing.style.margin = "0";
    lysing.textContent = `${b.rett}/${metin} rétt`;

    haus.appendChild(titill);
    haus.appendChild(lysing);
    kort.appendChild(haus);

    const bar = document.createElement("div");
    bar.className = "framvinda-bar";
    bar.style.marginBottom = "6px";
    const fylling = document.createElement("div");
    fylling.className = "framvinda-fylling";
    fylling.style.width = `${hlutfall}%`;
    bar.appendChild(fylling);
    kort.appendChild(bar);

    const smatexti = document.createElement("p");
    smatexti.className = "verkefni-lysing";
    smatexti.style.margin = "0";
    smatexti.style.fontSize = "0.82rem";
    smatexti.textContent = `${hlutfall}% nákvæmni${b.pass ? ` · ${b.pass} pass` : ""}`;
    kort.appendChild(smatexti);

    // Smellt á verkefnið: fara í spurningarnar og á síðustu ósvöruðu (hoppar
    // aðeins ef verkefnið er til og notandinn má sjá það).
    const verkefniGogn = verkefnaGogn.get(verkefniId);
    if (verkefniGogn && (erAdminNotandi || (verkefniGogn.active && synilegtNotanda(verkefniGogn)))) {
      kort.classList.add("smellanlegt-kort");
      kort.tabIndex = 0;
      kort.setAttribute("role", "button");
      kort.title = "Opna spurningarnar og halda áfram þar sem frá var horfið";
      const opna = () => opnaSpurningarBeint(verkefniId, verkefniGogn, true);
      kort.addEventListener("click", opna);
      kort.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          opna();
        }
      });
      smatexti.textContent += " · Halda áfram →";
    }

    minarStodurListi.appendChild(kort);
  });
}

rangarSpurningarBtn.addEventListener("click", () => {
  synaSvaedi("spurningar");
  hladaRangarSpurningar();
});

// Safnar saman spurningum úr ÖLLUM verkefnum sem notandinn hefur svarað
// rangt (ekki pass, ekki rétt) og birtir þær í sömu síðuflettu spurningalistu
// og venjulegt verkefni notar - svo "Reyna aftur"-æfingasvæðið á hverju korti
// virkar sjálfkrafa eins, án nokkurs auka kóða.
async function hladaRangarSpurningar() {
  stillaFormTengil(null);
  valdVerkefniId = null;
  valdHverErFlokkur = null;
  heimsalfaSiur.hidden = true;
  spurningaTitill.textContent = "Rangt svaraðar spurningar";
  spurningaListi.innerHTML = skeletonKort(5, 1);
  siduflettingarEfri.hidden = true;
  siduflettingar.hidden = true;
  stodurNiðurstada.textContent = "";
  byrjaAfturBtn.hidden = true;

  const attemptsSnap = await getDocs(collection(db, "users", notandi.uid, "attempts"));
  const rangarIds = [];

  for (const a of attemptsSnap.docs) {
    const svar = a.data().svar;
    if (svar === SLEPPT_MERKI) continue;
    const svarSnap = await getDoc(doc(db, "answers", a.id));
    const rettSvor = svarSnap.exists() ? svarSnap.data().correctAnswers || [] : [];
    if (!erSvarRett(svar, rettSvor)) rangarIds.push(a.id);
  }

  if (rangarIds.length === 0) {
    allarSpurningaskjol = [];
    spurningaListi.innerHTML = "<p>Engar rangt svaraðar spurningar eins og er - vel gert! 🎉</p>";
    return;
  }

  // Firestore leyfir mest 30 gildi í "in" fyrirspurn - hólfað niður ef þörf krefur.
  const skjol = [];
  for (let i = 0; i < rangarIds.length; i += 30) {
    const biti = rangarIds.slice(i, i + 30);
    const snap = await getDocs(query(collection(db, "questions"), where(documentId(), "in", biti)));
    snap.forEach((d) => skjol.push(d));
  }

  svaradIdSett = new Set(rangarIds);
  spurningaBunkastaerd = SPURNINGAR_A_SIDU_VENJULEGT;
  allarSpurningaskjol = skjol;
  spurningaSida = 0;
  synaSpurningaSidu();
  stodurNiðurstada.textContent = `${skjol.length} spurning${skjol.length === 1 ? "" : "ar"} sem þú átt eftir að ná réttri.`;
}

function skeletonKort(fjoldi, linurPerKort = 2) {
  let html = "";
  for (let i = 0; i < fjoldi; i++) {
    html += '<div class="skeleton-kort"><div class="skeleton-lina" style="width:55%"></div>';
    for (let j = 0; j < linurPerKort; j++) html += '<div class="skeleton-lina stutt"></div>';
    html += "</div>";
  }
  return html;
}

function framvinda(spurningaIds, svaradIds) {
  const svaradFjoldi = spurningaIds.filter((id) => svaradIds.has(id)).length;
  const hlutfall = spurningaIds.length ? Math.round((svaradFjoldi / spurningaIds.length) * 100) : 0;
  return { svaradFjoldi, hlutfall };
}

function byggjaFramvindukort(spurningaIds, svaradIds) {
  const { svaradFjoldi, hlutfall } = framvinda(spurningaIds, svaradIds);

  const framvindaLysing = document.createElement("p");
  framvindaLysing.className = "framvinda-lysing";
  framvindaLysing.textContent = `Svarað ${svaradFjoldi} af ${spurningaIds.length} (${hlutfall}%)`;

  const bar = document.createElement("div");
  bar.className = "framvinda-bar";
  const fylling = document.createElement("div");
  fylling.className = "framvinda-fylling";
  fylling.style.width = `${hlutfall}%`;
  bar.appendChild(fylling);

  const brot = document.createDocumentFragment();
  brot.appendChild(framvindaLysing);
  brot.appendChild(bar);
  return brot;
}

function byggjaVerkefniKort(vDoc, verkefni, spurningaIds, svaradIds) {
  const fjoldiGlaera = (verkefni.slides || []).length;
  const kort = document.createElement("article");
  kort.className = "spurning-kort verkefni-kort";

  const titill = document.createElement("h3");
  titill.textContent = verkefni.title;
  kort.appendChild(titill);

  // Bara þú (admin) sérð þetta kort yfir höfuð - nemendur sjá ekki óvirk
  // verkefni (sjá hladaVerkefnaListi). Minnir á að slökkt er á því fyrir þau.
  if (!verkefni.active && erAdminNotandi) {
    const ovirktMerki = document.createElement("p");
    ovirktMerki.className = "forskodun-ovirkt-merki";
    ovirktMerki.textContent = "Lokað fyrir nemendur - bara þú sérð þetta";
    kort.appendChild(ovirktMerki);
  }

  const lysing = document.createElement("p");
  lysing.className = "verkefni-lysing";
  lysing.textContent = `${fjoldiGlaera} ${fjoldiGlaera === 1 ? "glæra" : "glærur"} · ${spurningaIds.length} spurningar`;
  kort.appendChild(lysing);

  if (notandi && spurningaIds.length > 0) {
    kort.appendChild(byggjaFramvindukort(spurningaIds, svaradIds));
  }

  const beintBtn = document.createElement("button");
  beintBtn.type = "button";
  beintBtn.className = "aðal-hnappur";
  beintBtn.textContent = "Fara í spurningar →";
  beintBtn.addEventListener("click", () => opnaSpurningarBeint(vDoc.id, verkefni));
  kort.appendChild(beintBtn);

  const hnappur = document.createElement("button");
  hnappur.type = "button";
  hnappur.className = "smabtn";
  hnappur.style.marginTop = "10px";
  hnappur.textContent = "Skoða glærur";
  hnappur.addEventListener("click", () => opnaVerkefni(vDoc.id, verkefni));
  kort.appendChild(hnappur);

  return kort;
}

// Hoppar beint í spurningalistu verkefnisins, án þess að fara í gegnum
// glærurnar fyrst - flýtileið fyrir nemendur sem vilja bara svara.
// Verkefni geta verið með tengil á Google Form (reiturinn formSlod á verkefninu,
// t.d. svarblað Mannkynssöguprófsins) - birtist sem hnappur í spurningasvæðinu.
function stillaFormTengil(verkefni) {
  const tengill = document.getElementById("verkefniFormTengill");
  if (!tengill) return;
  const slod = verkefni && verkefni.formSlod;
  tengill.hidden = !slod;
  if (slod) tengill.href = slod;
}

function opnaSpurningarBeint(verkefniId, verkefni, hoppaIOsvaradar = true) {
  stillaFormTengil(verkefni);
  valdVerkefniId = verkefniId;
  valdHeimsalfa = lesaHeimsalfu(verkefniId);
  valdVerkefniErHrada = erHradaVerkefni(verkefni);
  valdHverErFlokkur = null;
  spurningaBunkastaerd = spurningaBunkastaerdFyrir(verkefni);
  spurningaTitill.textContent = verkefni.title;
  synaSvaedi("spurningar");
  hladaSpurningum(hoppaIOsvaradar);
  hladaMinumStodum();
}

// Áberandi borði efst á "Mín staða" sem bendir beint á verkefni vikunnar -
// núna "Hraðaspurningar". Finnur verkefnið með titilleit, svo ekkert
// harðkóðað skjal-ID þarf að uppfæra ef verkefnið er endurskapað.
const VIKU_AHERSLA_LEIT = "hraðaspurningar";
function birtaVikuAherslu(verkefnaSnap) {
  const vDoc = verkefnaSnap.docs.find((d) => (d.data().title || "").toLowerCase().includes(VIKU_AHERSLA_LEIT));
  vikuAherslaSvaedi.innerHTML = "";
  vikuAherslaSvaedi.hidden = true;
  if (!vDoc) return;

  const verkefni = vDoc.data();
  if (!verkefni.active) return;

  const borði = document.createElement("div");
  borði.className = "viku-ahersla";

  const titill = document.createElement("h3");
  titill.textContent = verkefni.title;

  const hnappar = document.createElement("div");
  hnappar.className = "viku-ahersla-hnappar";

  const spurningaBtn = document.createElement("button");
  spurningaBtn.type = "button";
  spurningaBtn.textContent = "Fara í spurningar →";
  spurningaBtn.addEventListener("click", () => opnaSpurningarBeint(vDoc.id, verkefni));

  const glaeruBtn = document.createElement("button");
  glaeruBtn.type = "button";
  glaeruBtn.className = "hvitur";
  glaeruBtn.textContent = "Fara í glærur";
  glaeruBtn.addEventListener("click", () => opnaVerkefni(vDoc.id, verkefni));

  hnappar.appendChild(spurningaBtn);
  // Hraðaspurningar eru bara spurningar - "Fara í glærur" er aðeins sýnt ef
  // verkefnið er með raunverulegt glæruefni.
  if (!erProfVerkefni(verkefni)) hnappar.appendChild(glaeruBtn);

  borði.appendChild(titill);
  // Allur borðinn er takki - aðeins nafnið sést (hnapparnir sjást ekki í nýja útlitinu, sjá CSS).
  borði.appendChild(hnappar);

  // Allur borðinn er takki (ekki bara hnappurinn inni í honum): smellt hvar sem er opnar spurningarnar.
  borði.classList.add("smellanlegur");
  borði.tabIndex = 0;
  borði.setAttribute("role", "button");
  borði.setAttribute("aria-label", `${verkefni.title} - fara í spurningar`);
  const opnaBordann = (e) => {
    if (e.target.closest("button")) return;
    opnaSpurningarBeint(vDoc.id, verkefni);
  };
  borði.addEventListener("click", opnaBordann);
  borði.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target === borði) {
      e.preventDefault();
      opnaSpurningarBeint(vDoc.id, verkefni);
    }
  });
  vikuAherslaSvaedi.appendChild(borði);
  vikuAherslaSvaedi.hidden = false;
}

function byggjaHradaspurningarKort(vDoc, verkefni, spurningaIds, svaradIds) {
  const kort = document.createElement("article");
  kort.className = "hradaspurning-kort";

  const titill = document.createElement("h3");
  titill.textContent = verkefni.title;
  kort.appendChild(titill);

  if (!verkefni.active && erAdminNotandi) {
    const ovirktMerki = document.createElement("p");
    ovirktMerki.className = "forskodun-ovirkt-merki";
    ovirktMerki.textContent = "Lokað fyrir nemendur - bara þú sérð þetta";
    kort.appendChild(ovirktMerki);
  }

  const lysing = document.createElement("p");
  lysing.className = "verkefni-lysing";
  lysing.textContent = `${spurningaIds.length} spurningar`;
  kort.appendChild(lysing);

  if (notandi && spurningaIds.length > 0) {
    kort.appendChild(byggjaFramvindukort(spurningaIds, svaradIds));
  }

  const hnappur = document.createElement("button");
  hnappur.type = "button";
  hnappur.className = "aðal-hnappur";
  hnappur.textContent = "Byrja";
  hnappur.addEventListener("click", () => {
    if (verkefni.tegund === "prof") {
      // Alvöru próf (tegund: "prof" - t.d. "Mannkynssöguprófið") opnast í
      // sérstökum flipa (sjá líka "?prof="-vöktunina neðar í skránni) með
      // viðvörun við að fara út. Fastanafn á flipanum ("gettu-betur-prof")
      // þýðir að endurteknir smellir opna EKKI nýjan flipa í hvert sinn -
      // sami flipinn er bara endurnýttur/færður í forgrunn.
      window.open(`leikur.html?prof=${encodeURIComponent(vDoc.id)}`, "gettu-betur-prof");
    } else {
      // Venjulegir spurningabankar (Hraðaspurningar, Höfuðborgir heimsins
      // o.fl. - ekkert alvöru "próf" þó þau birtist eins hér) opnast
      // áfram í sama flipa, engin "fara út?" viðvörun.
      opnaVerkefni(vDoc.id, verkefni);
    }
  });
  kort.appendChild(hnappur);

  // Hraðaspurningar-spjaldið er allt takki, eins og borðinn á Heim.
  if (erHradaVerkefni(verkefni)) {
    kort.classList.add("smellanlegt-kort");
    kort.tabIndex = 0;
    kort.setAttribute("role", "button");
    kort.setAttribute("aria-label", `${verkefni.title} - byrja`);
    kort.addEventListener("click", (e) => {
      if (!e.target.closest("button")) hnappur.click();
    });
    kort.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target === kort) {
        e.preventDefault();
        hnappur.click();
      }
    });
  }

  if (verkefni.formSlod) {
    const formTengill = document.createElement("a");
    formTengill.className = "smabtn";
    formTengill.href = verkefni.formSlod;
    formTengill.target = "_blank";
    formTengill.rel = "noopener";
    formTengill.textContent = "📝 Skila svörum";
    formTengill.style.marginLeft = "8px";
    kort.appendChild(formTengill);
  }

  return kort;
}

async function hladaVerkefnaListi() {
  verkefnaListi.innerHTML = skeletonKort(3);
  hradaspurningarSvaedi.hidden = true;

  // Admin sér líka óvirk verkefni (forskoðun) - allir aðrir bara virk.
  // Verkefni, spurningayfirlit og svörin sótt samhliða. Nemendur lesa lítið yfirlitsskjal í stað
  // allra spurninganna (sjá saekjaSpurningaYfirlit) - mun ódýrara og fljótara.
  const [snap, yfirlit, svaradIds] = await Promise.all([
    getDocs(erAdminNotandi ? collection(db, "verkefni") : query(collection(db, "verkefni"), where("active", "==", true))),
    erAdminNotandi ? getDocs(collection(db, "questions")).then((s) => s.docs.map((d) => [d.id, d.data().verkefniId])) : saekjaSpurningaYfirlit().then(Object.entries),
    saekjaSvaradIds()
  ]);

  if (snap.empty) {
    verkefnaListi.innerHTML = "<p>Engin verkefni eru virk eins og er.</p>";
    return;
  }

  const spurningaIdEftirVerkefni = new Map();
  yfirlit.forEach(([id, vid]) => {
    if (!spurningaIdEftirVerkefni.has(vid)) spurningaIdEftirVerkefni.set(vid, []);
    spurningaIdEftirVerkefni.get(vid).push(id);
  });

  verkefnaListi.innerHTML = "";
  hradaspurningarListi.innerHTML = "";

  let fjoldiGlaeruverkefna = 0;
  let fjoldiHradaspurninga = 0;

  snap.forEach((vDoc) => {
    const verkefni = vDoc.data();
    if (!synilegtNotanda(verkefni)) return;
    let spurningaIds = spurningaIdEftirVerkefni.get(vDoc.id) || [];
    if (erHradaVerkefni(verkefni)) {
      const aukaIds = uthlutadVerkefniFyrirNotanda(snap.docs).flatMap((d) => spurningaIdEftirVerkefni.get(d.id) || []);
      spurningaIds = spurningaIds.concat(aukaIds);
    }

    if (erProfVerkefni(verkefni)) {
      hradaspurningarListi.appendChild(byggjaHradaspurningarKort(vDoc, verkefni, spurningaIds, svaradIds));
      fjoldiHradaspurninga++;
    } else {
      verkefnaListi.appendChild(byggjaVerkefniKort(vDoc, verkefni, spurningaIds, svaradIds));
      fjoldiGlaeruverkefna++;
    }
  });

  // Engin glæruverkefni: fela "Verkefni" dálkinn ef Hraðaspurningar eru til
  // (annars lítur út eins og eitthvað vanti), annars segja að ekkert sé virkt.
  const adalDalkur = verkefnaListi.closest(".verkefna-adal");
  if (adalDalkur) adalDalkur.hidden = fjoldiGlaeruverkefna === 0 && fjoldiHradaspurninga > 0;
  if (fjoldiGlaeruverkefna === 0 && fjoldiHradaspurninga === 0) {
    verkefnaListi.innerHTML = "<p>Engin verkefni eru virk eins og er.</p>";
  }
  hradaspurningarSvaedi.hidden = fjoldiHradaspurninga === 0;
}

let pptxIframe = null;

function opnaVerkefni(verkefniId, verkefni) {
  stillaFormTengil(verkefni);
  valdVerkefniId = verkefniId;
  valdHeimsalfa = lesaHeimsalfu(verkefniId);
  valdVerkefniErHrada = erHradaVerkefni(verkefni);
  valdHverErFlokkur = null;
  heilskjaGlaerur = verkefni.slides || [];
  spurningaBunkastaerd = spurningaBunkastaerdFyrir(verkefni);
  pptxIframe = null;

  if (erProfVerkefni(verkefni)) {
    // Ekkert alvöru glæruefni til að skoða - farið beint í spurningarnar.
    // beforeunload-viðvörunin á bara við alvöru próf (tegund: "prof"), ekki
    // hvern sem er spurningabanka sem vantar bara glærur (sjá "Byrja" í
    // byggjaHradaspurningarKort hér fyrir ofan).
    if (verkefni.tegund === "prof") profIVinnslu = true;
    spurningaTitill.textContent = verkefni.title;
    synaSvaedi("spurningar");
    hladaSpurningum();
    hladaMinumStodum();
    return;
  }

  hladaGlosa(verkefniId);

  verkefnaTitill.textContent = verkefni.title;
  glaerurInnihald.innerHTML = "";

  if (verkefni.pptxUrl) {
    // Upprunalega .pptx skjalið sjálft, birt með Office skjalaskoðaranum -
    // nákvæmlega eins og PowerPoint sýnir það, með þess eigin glæruflettingu.
    const fullSlod = new URL(verkefni.pptxUrl, window.location.href).href;
    pptxIframe = document.createElement("iframe");
    pptxIframe.className = "pptx-skodari";
    pptxIframe.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullSlod)}`;
    pptxIframe.allowFullscreen = true;
    glaerurInnihald.appendChild(pptxIframe);
  } else {
    (verkefni.slides || []).forEach((glaera) => {
      const kafli = document.createElement("article");
      kafli.className = "glaera-kort";

      if (glaera.image) {
        const mynd = document.createElement("img");
        mynd.src = glaera.image;
        mynd.alt = glaera.title;
        mynd.loading = "lazy";
        kafli.appendChild(mynd);
      }

      const h = document.createElement("h3");
      h.textContent = glaera.title;
      const p = document.createElement("p");
      p.textContent = glaera.body;
      kafli.appendChild(h);
      kafli.appendChild(p);
      glaerurInnihald.appendChild(kafli);
    });
  }

  synaSvaedi("glaerur");
}

function synaHeilskjaGlaeru() {
  const glaera = heilskjaGlaerur[heilskjaIndex];
  if (!glaera) return;

  if (glaera.image) {
    heilskjaMynd.src = glaera.image;
    heilskjaMynd.alt = glaera.title;
    heilskjaMynd.hidden = false;
  } else {
    heilskjaMynd.hidden = true;
  }

  heilskjaTitill.textContent = glaera.title;
  heilskjaTexti.textContent = glaera.body;
  heilskjaTalning.textContent = `${heilskjaIndex + 1} / ${heilskjaGlaerur.length}`;
  heilskjaAfturBtn.disabled = heilskjaIndex === 0;
  heilskjaAframBtn.disabled = heilskjaIndex === heilskjaGlaerur.length - 1;
}

heilskjaBtn.addEventListener("click", async () => {
  // Ef upprunalega .pptx skjalið er birt (sjá opnaVerkefni), heilskjáum við
  // sjálft iframe-ið í staðinn fyrir eigin skyggnuyfirlag.
  if (pptxIframe) {
    try {
      await pptxIframe.requestFullscreen?.();
    } catch {
      // Heilskjá ekki studd/leyfð.
    }
    return;
  }

  if (heilskjaGlaerur.length === 0) return;
  heilskjaIndex = 0;
  synaHeilskjaGlaeru();
  heilskjaSvaedi.hidden = false;
  try {
    await heilskjaSvaedi.requestFullscreen?.();
  } catch {
    // Heilskjá ekki studd/leyfð - skjárinn er samt sýnilegur sem yfirlag.
  }
});

function lokaHeilskja() {
  heilskjaSvaedi.hidden = true;
  if (document.fullscreenElement) document.exitFullscreen();
}

lokaHeilskjaBtn.addEventListener("click", lokaHeilskja);
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) heilskjaSvaedi.hidden = true;
});

heilskjaAfturBtn.addEventListener("click", () => {
  if (heilskjaIndex > 0) {
    heilskjaIndex--;
    synaHeilskjaGlaeru();
  }
});

heilskjaAframBtn.addEventListener("click", () => {
  if (heilskjaIndex < heilskjaGlaerur.length - 1) {
    heilskjaIndex++;
    synaHeilskjaGlaeru();
  }
});

document.addEventListener("keydown", (e) => {
  if (heilskjaSvaedi.hidden) return;
  if (e.key === "ArrowRight") heilskjaAframBtn.click();
  if (e.key === "ArrowLeft") heilskjaAfturBtn.click();
  if (e.key === "Escape") lokaHeilskja();
});

function faraISpurningarFraGlaerum() {
  spurningaTitill.textContent = verkefnaTitill.textContent;
  synaSvaedi("spurningar");
  hladaSpurningum();
  hladaMinumStodum();
}
afromISpurningar.addEventListener("click", faraISpurningarFraGlaerum);
faraBeintISpurningarBtn.addEventListener("click", faraISpurningarFraGlaerum);

// --- Lestrarsparnaður (Firestore rukkar fyrir hvern lesinn skjal) ---
// Allar virkar spurningar (um 1.200) eru geymdar í vafranum í hálftíma í stað
// þess að vera lesnar upp á nýtt við hverja innhleðslu og hvert verkefni. Admin
// sér alltaf ferskar spurningar. Svöruðu-spurninga-listinn er sóttur
// stigvaxandi: aðeins ný svör frá síðustu heimsókn eru lesin.
const SPURNINGA_GEYMSLA_LYKILL = "gb_virkar_spurningar_v1";
try {
  // Gamla geymslan (allar spurningar í einu) er ekki lengur notuð nema yfirlitsskjalið vanti - hún tók mikið pláss.
  if (!localStorage.getItem("gb_spurningayfirlit_v1")) localStorage.removeItem(SPURNINGA_GEYMSLA_LYKILL);
} catch (villa) {
  console.warn(villa);
}
const SPURNINGA_GEYMSLA_MS = 30 * 60 * 1000;
let virkarSpurningarMinni = null;

function thjappaSpurningu(gogn) {
  const ut = {};
  for (const [k, v] of Object.entries(gogn)) ut[k] = v && typeof v.toMillis === "function" ? { __ms: v.toMillis() } : v;
  return ut;
}

function endurlifgaSpurningu(gogn) {
  const ut = {};
  for (const [k, v] of Object.entries(gogn)) {
    ut[k] = v && typeof v === "object" && "__ms" in v ? { toMillis: () => v.__ms, toDate: () => new Date(v.__ms) } : v;
  }
  return ut;
}

async function saekjaVirkarSpurningar() {
  if (virkarSpurningarMinni && Date.now() - virkarSpurningarMinni.t < SPURNINGA_GEYMSLA_MS) return virkarSpurningarMinni.docs;
  try {
    const c = JSON.parse(localStorage.getItem(SPURNINGA_GEYMSLA_LYKILL) || "null");
    if (c && Date.now() - c.t < SPURNINGA_GEYMSLA_MS) {
      const docs = c.d.map(([id, g]) => {
        const gogn = endurlifgaSpurningu(g);
        return { id, data: () => gogn };
      });
      virkarSpurningarMinni = { t: c.t, docs };
      return docs;
    }
  } catch (villa) {
    console.warn(villa);
  }
  const snap = await getDocs(query(collection(db, "questions"), where("active", "==", true)));
  virkarSpurningarMinni = { t: Date.now(), docs: snap.docs };
  try {
    localStorage.setItem(
      SPURNINGA_GEYMSLA_LYKILL,
      JSON.stringify({ t: Date.now(), d: snap.docs.map((d) => [d.id, thjappaSpurningu(d.data())]) })
    );
  } catch (villa) {
    console.warn(villa);
  }
  return snap.docs;
}

// Yfirlit yfir virkar spurningar (spurningaID -> verkefniID) - eitt lítið skjal (meta/virkarSpurningar)
// sem admin heldur uppfærðu. Verkefnalistinn þarf bara fjöldann, svo nemendur sækja ekki allar
// spurningarnar fyrr en þeir opna verkefni (sjá saekjaVirkarVerkefnis).
const YFIRLIT_GEYMSLA_LYKILL = "gb_spurningayfirlit_v1";
let spurningaYfirlitMinni = null;
async function saekjaSpurningaYfirlit() {
  if (spurningaYfirlitMinni && Date.now() - spurningaYfirlitMinni.t < SPURNINGA_GEYMSLA_MS) return spurningaYfirlitMinni.map;
  try {
    const c = JSON.parse(localStorage.getItem(YFIRLIT_GEYMSLA_LYKILL) || "null");
    if (c && Date.now() - c.t < SPURNINGA_GEYMSLA_MS) {
      spurningaYfirlitMinni = { t: c.t, map: c.m };
      return c.m;
    }
  } catch (villa) {
    console.warn(villa);
  }
  let map;
  const snap = await getDoc(doc(db, "meta", "virkarSpurningar")).catch(() => null);
  if (snap && snap.exists()) {
    map = snap.data().spurningar || {};
  } else {
    // Yfirlitið er ekki til ennþá - reikna það úr öllum virkum spurningum (hægara).
    map = {};
    (await saekjaVirkarSpurningar()).forEach((d) => (map[d.id] = d.data().verkefniId));
  }
  spurningaYfirlitMinni = { t: Date.now(), map };
  try {
    localStorage.setItem(YFIRLIT_GEYMSLA_LYKILL, JSON.stringify({ t: Date.now(), m: map }));
  } catch (villa) {
    console.warn(villa);
  }
  return map;
}

// Virkar spurningar EINS verkefnis, geymdar í vafranum í 30 mín.
const verkefnaSpurningarMinni = new Map();
async function saekjaVirkarVerkefnis(verkefniId) {
  const minni = verkefnaSpurningarMinni.get(verkefniId);
  if (minni && Date.now() - minni.t < SPURNINGA_GEYMSLA_MS) return minni.docs;
  const lykill = `gb_vspurn_v1_${verkefniId}`;
  try {
    const c = JSON.parse(localStorage.getItem(lykill) || "null");
    if (c && Date.now() - c.t < SPURNINGA_GEYMSLA_MS) {
      const docs = c.d.map(([id, g]) => {
        const gogn = endurlifgaSpurningu(g);
        return { id, data: () => gogn };
      });
      verkefnaSpurningarMinni.set(verkefniId, { t: c.t, docs });
      return docs;
    }
  } catch (villa) {
    console.warn(villa);
  }
  const snap = await getDocs(
    query(collection(db, "questions"), where("verkefniId", "==", verkefniId), where("active", "==", true))
  );
  verkefnaSpurningarMinni.set(verkefniId, { t: Date.now(), docs: snap.docs });
  try {
    localStorage.setItem(lykill, JSON.stringify({ t: Date.now(), d: snap.docs.map((d) => [d.id, thjappaSpurningu(d.data())]) }));
  } catch (villa) {
    console.warn(villa);
  }
  return snap.docs;
}

// Spurningar eins verkefnis: virkar úr geymslunni fyrir nemendur, allar (líka
// óvirkar) beint úr gagnagrunninum fyrir admin.
async function saekjaSpurningarVerkefnis(verkefniId) {
  if (erAdminNotandi) {
    return (await getDocs(query(collection(db, "questions"), where("verkefniId", "==", verkefniId)))).docs;
  }
  return saekjaVirkarVerkefnis(verkefniId);
}

let sidastiNotandaGogn = null;
// Heldur staðbundna afritinu af teljurunum réttu jafnóðum og svarað er, svo "Þú hefur svarað ..."
// textinn þurfi ekki að lesa notendaskjalið aftur eftir hvert svar.
function beitaStodu(verkefniId, { svarad = 0, pass = 0, rett = 0 }) {
  if (!sidastiNotandaGogn || !verkefniId) return;
  const g = sidastiNotandaGogn;
  g.fjoldiSvarad = (g.fjoldiSvarad || 0) + svarad;
  g.verkefnaStada = g.verkefnaStada || {};
  const b = (g.verkefnaStada[verkefniId] = g.verkefnaStada[verkefniId] || {});
  b.svarad = (b.svarad || 0) + svarad;
  b.pass = (b.pass || 0) + pass;
  b.rett = (b.rett || 0) + rett;
}
async function saekjaSvaradIds() {
  if (!notandi) return new Set();
  const lykill = `gb_svorud_${notandi.uid}`;
  const notandaSnap = await getDoc(doc(db, "users", notandi.uid));
  sidastiNotandaGogn = notandaSnap.data() || {};
  const vantar = sidastiNotandaGogn.fjoldiSvarad || 0;
  let geymt = null;
  try {
    geymt = JSON.parse(localStorage.getItem(lykill) || "null");
  } catch (villa) {
    console.warn(villa);
  }
  let ids;
  let sidast = 0;
  if (geymt && Array.isArray(geymt.ids)) {
    ids = new Set(geymt.ids);
    sidast = geymt.sidast || 0;
    const nytt = await getDocs(
      query(collection(db, "users", notandi.uid, "attempts"), where("answeredAt", ">", Timestamp.fromMillis(sidast)))
    );
    nytt.forEach((d) => {
      ids.add(d.id);
      sidast = Math.max(sidast, d.data().answeredAt?.toMillis?.() ?? 0);
    });
    // Fjöldinn stemmir ekki við teljarann (t.d. "byrja aftur" á öðru tæki) - sækja allt.
    if (ids.size !== vantar) ids = null;
  }
  if (!ids) {
    const allt = await getDocs(collection(db, "users", notandi.uid, "attempts"));
    ids = new Set(allt.docs.map((d) => d.id));
    sidast = allt.docs.reduce((m, d) => Math.max(m, d.data().answeredAt?.toMillis?.() ?? 0), 0);
  }
  try {
    localStorage.setItem(lykill, JSON.stringify({ ids: [...ids], sidast }));
  } catch (villa) {
    console.warn(villa);
  }
  return ids;
}

const HEIMSALFUR = ["Evrópa", "Asía", "Afríka", "Norður-Ameríka", "Suður-Ameríka", "Eyjaálfa"];
function lesaHeimsalfu(verkefniId) {
  try {
    const v = localStorage.getItem(`gb_heimsalfa_${verkefniId}`) || "";
    return HEIMSALFUR.includes(v) ? v : "";
  } catch (villa) {
    return "";
  }
}

function byggjaHeimsalfuSiur(docs) {
  const talning = new Map();
  docs.forEach((d) => {
    const a = d.data().heimsalfa;
    if (a) talning.set(a, (talning.get(a) || 0) + 1);
  });
  // Aðeins í verkefni þar sem spurningarnar hafa heimsálfu (ekki Hraðaspurningar eða "Hver er").
  heimsalfaSiur.hidden = talning.size === 0 || valdVerkefniErHrada || !!valdHverErFlokkur;
  heimsalfaSiur.innerHTML = "";
  if (heimsalfaSiur.hidden) return;
  if (valdHeimsalfa && !talning.has(valdHeimsalfa)) valdHeimsalfa = "";
  const val = [["", "Allar", docs.length], ...HEIMSALFUR.filter((a) => talning.has(a)).map((a) => [a, a, talning.get(a)])];
  val.forEach(([gildi, nafn, fjoldi]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "heimsalfa-takki" + (gildi === valdHeimsalfa ? " virkur" : "");
    b.setAttribute("aria-pressed", String(gildi === valdHeimsalfa));
    b.innerHTML = `<span></span><b>${fjoldi}</b>`;
    b.firstChild.textContent = nafn;
    b.addEventListener("click", () => {
      if (gildi === valdHeimsalfa) return;
      valdHeimsalfa = gildi;
      try {
        localStorage.setItem(`gb_heimsalfa_${valdVerkefniId}`, gildi);
      } catch (villa) {
        console.warn(villa);
      }
      hladaSpurningum();
    });
    heimsalfaSiur.appendChild(b);
  });
}

async function hladaSpurningum(hoppaIOsvaradar = false) {
  spurningaListi.innerHTML = skeletonKort(5, 1);
  siduflettingarEfri.hidden = true;
  siduflettingar.hidden = true;

  // Admin sér líka óvirkar spurningar (forskoðun) - allir aðrir bara virkar.
  let spurningaDocs = await saekjaSpurningarVerkefnis(valdVerkefniId);
  if (valdHverErFlokkur) {
    spurningaDocs = spurningaDocs.filter((d) => valdHverErFlokkur.textar.includes(d.data().text));
    if (valdHverErFlokkur.adminEingongu && erKennileitaYfirferd()) hreinsaUtrunninMerki(spurningaDocs);
  }
  if (valdVerkefniErHrada && notandi && !erAdminNotandi) {
    const verkefnaSnap = await getDocs(query(collection(db, "verkefni"), where("active", "==", true)));
    const aukaVerkefniIds = uthlutadVerkefniFyrirNotanda(verkefnaSnap.docs).map((d) => d.id);
    if (aukaVerkefniIds.length > 0) {
      const aukaSpurningar = await Promise.all(aukaVerkefniIds.map((vid) => saekjaVirkarVerkefnis(vid)));
      spurningaDocs = spurningaDocs.concat(aukaSpurningar.flat());
    }
  }

  svaradIdSett = await saekjaSvaradIds();

  // Höfuðborgir heimsins: hægt að velja heimsálfu (reiturinn "heimsalfa" á spurningunum).
  byggjaHeimsalfuSiur(spurningaDocs);
  if (valdHeimsalfa && !heimsalfaSiur.hidden) spurningaDocs = spurningaDocs.filter((d) => d.data().heimsalfa === valdHeimsalfa);

  // Aðeins hægt að "byrja aftur" innan eins verkefnis - ekki á rangar-spurningar
  // yfirlitinu (valdVerkefniId er þá null) og ekki fyrir gesti.
  byrjaAfturBtn.hidden = !notandi || valdVerkefniId === null;

  if (spurningaDocs.length === 0) {
    allarSpurningaskjol = [];
    spurningaListi.innerHTML = "<p>Engar virkar spurningar í þessu verkefni eins og er.</p>";
    return;
  }

  allarSpurningaskjol = spurningaDocs.slice().sort((a, b) => {
    const ta = a.data().createdAt?.toMillis?.() ?? 0;
    const tb = b.data().createdAt?.toMillis?.() ?? 0;
    return ta - tb;
  });

  spurningaSida = 0;
  if (valdVerkefniErHrada) hladaMinumStodum();

  // Hver er: óséðar myndir fyrst, í tilviljunarkenndri röð.
  if (valdHverErFlokkur) {
    for (let i = allarSpurningaskjol.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allarSpurningaskjol[i], allarSpurningaskjol[j]] = [allarSpurningaskjol[j], allarSpurningaskjol[i]];
    }
    allarSpurningaskjol.sort((a, b) => svaradIdSett.has(a.id) - svaradIdSett.has(b.id));
  }

  // Nemendur fá eina spurningu í einu (sjá birtaEinaSpurningu).
  if (einnHamur()) {
    await hladaEndurtokuStodu();
    birtaEinaSpurningu();
    return;
  }

  // Verkefni opnast beint á fyrstu spurningunni sem
  // notandinn á eftir að svara - síðan sem hún er á og skrunað að henni.
  let hoppaIndex = -1;
  if (hoppaIOsvaradar) {
    hoppaIndex = allarSpurningaskjol.findIndex((d) => !svaradIdSett.has(d.id));
    if (hoppaIndex > 0) spurningaSida = Math.floor(hoppaIndex / spurningaBunkastaerd);
  }
  synaSpurningaSidu();
  if (hoppaIndex > 0) {
    const korti = spurningaListi.children[hoppaIndex % spurningaBunkastaerd];
    if (korti) {
      // synaSvaedi skrunar líka (á efst á listann) - bíðum aðeins svo þessi vinni.
      setTimeout(() => {
        korti.scrollIntoView({ behavior: "smooth", block: "center" });
        korti.classList.add("naest-osvarad");
        setTimeout(() => korti.classList.remove("naest-osvarad"), 2500);
      }, 350);
    }
  }
}

function fjoldiSidna() {
  return Math.max(1, Math.ceil(allarSpurningaskjol.length / spurningaBunkastaerd));
}

function synaSpurningaSidu() {
  const heild = fjoldiSidna();
  spurningaSida = Math.min(Math.max(spurningaSida, 0), heild - 1);

  const upphaf = spurningaSida * spurningaBunkastaerd;
  const siduskjol = allarSpurningaskjol.slice(upphaf, upphaf + spurningaBunkastaerd);

  spurningaListi.innerHTML = "";
  siduskjol.forEach((qDoc) => {
    const spurning = qDoc.data();
    const korti = byggjaSpurningaKort(qDoc.id, spurning, svaradIdSett.has(qDoc.id));
    spurningaListi.appendChild(korti);
  });

  const synaFlettingar = heild > 1;
  siduflettingarEfri.hidden = !synaFlettingar;
  siduflettingar.hidden = !synaFlettingar;

  if (synaFlettingar) {
    const texti = `Síða ${spurningaSida + 1} af ${heild}`;
    siduTalningEfri.textContent = texti;
    siduTalning.textContent = texti;

    const aFyrstuSidu = spurningaSida === 0;
    const aSidustuSidu = spurningaSida === heild - 1;
    fyrriSidaBtnEfri.disabled = aFyrstuSidu;
    fyrriSidaBtn.disabled = aFyrstuSidu;
    naestaSidaBtnEfri.disabled = aSidustuSidu;
    naestaSidaBtn.disabled = aSidustuSidu;
  }
}

function faraASidu(delta) {
  spurningaSida += delta;
  synaSpurningaSidu();
  spurningaListi.scrollIntoView({ behavior: "smooth", block: "start" });
}

fyrriSidaBtnEfri.addEventListener("click", () => faraASidu(-1));
naestaSidaBtnEfri.addEventListener("click", () => faraASidu(1));
fyrriSidaBtn.addEventListener("click", () => faraASidu(-1));
naestaSidaBtn.addEventListener("click", () => faraASidu(1));

// Stokkar röð spurninganna af handahófi (Fisher-Yates) og byrjar á fyrstu síðu
// aftur - hrein staðbundin umröðun, engin Firestore-skrif.
function stokkaSpurningar() {
  for (let i = allarSpurningaskjol.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allarSpurningaskjol[i], allarSpurningaskjol[j]] = [allarSpurningaskjol[j], allarSpurningaskjol[i]];
  }
  spurningaSida = 0;
  birtaSpurningar();
}
stokkaSpurningarBtn.addEventListener("click", stokkaSpurningar);

// Eyðir öllum tilraunum notandans fyrir spurningarnar í núverandi verkefni
// (öllum í einu, ekki bara stökum röngum svörum - heldur upphaflega
// tilganginum með að svör séu óbreytanleg eftir á) svo hægt sé að svara
// þeim aftur, og dregur frá samtölunum á users/{uid} til samræmis.
// Ver gegn tvísmelli: aðgerðin les margar tilraunir eitt og eitt og tekur
// nokkrar sekúndur - önnur keyrsla á meðan hefði dregið sömu svör tvisvar frá
// samtölunum (svo fjöldi svara varð neikvæður).
let byrjaAftur_ikeyrslu = false;
async function byrjaVerkefniAftur() {
  if (!notandi || valdVerkefniId === null || byrjaAftur_ikeyrslu) return;
  if (
    !confirm(
      valdHeimsalfa && !heimsalfaSiur.hidden
        ? `Byrja spurningarnar um ${valdHeimsalfa} aftur? Þetta eyðir svarasögu þinni fyrir þær og þú getur svarað þeim aftur.`
        : "Byrja þetta verkefni aftur? Þetta eyðir svarasögu þinni fyrir allar spurningarnar hér og þú getur svarað þeim aftur."
    )
  ) {
    return;
  }
  byrjaAftur_ikeyrslu = true;
  byrjaAfturBtn.disabled = true;
  try {
    await keyraByrjaVerkefniAftur();
  } finally {
    byrjaAftur_ikeyrslu = false;
    byrjaAfturBtn.disabled = false;
  }
}

async function keyraByrjaVerkefniAftur() {

  const spurningaIdSett = new Set(allarSpurningaskjol.map((d) => d.id));
  const attemptsSnap = await getDocs(collection(db, "users", notandi.uid, "attempts"));
  const tilEydingar = attemptsSnap.docs.filter((a) => spurningaIdSett.has(a.id));
  if (tilEydingar.length === 0) return;

  // Svör teljast á verkefnið sem spurningin tilheyrir (í Hraðaspurningum geta
  // verið spurningar úr úthlutuðum flokkum), svo dregið er frá þar.
  const verkefniEftirSpurningu = new Map(allarSpurningaskjol.map((d) => [d.id, d.data().verkefniId]));
  const stadaBreytingar = new Map();
  const breytingFyrir = (vid) => {
    if (!stadaBreytingar.has(vid)) stadaBreytingar.set(vid, { svarad: 0, pass: 0, rett: 0 });
    return stadaBreytingar.get(vid);
  };
  let svaradBreyting = 0;
  let passBreyting = 0;
  let rettBreyting = 0;

  const batch = writeBatch(db);
  const endurtokuBreytingar = {};
  for (const attemptDoc of tilEydingar) {
    const svar = attemptDoc.data().svar;
    const stada = breytingFyrir(verkefniEftirSpurningu.get(attemptDoc.id) || valdVerkefniId);
    svaradBreyting--;
    stada.svarad--;
    if (svar === SLEPPT_MERKI) {
      passBreyting--;
      stada.pass--;
    } else {
      const svarSnap = await getDoc(doc(db, "answers", attemptDoc.id));
      const rettSvor = svarSnap.exists() ? svarSnap.data().correctAnswers || [] : [];
      if (erSvarRett(svar, rettSvor)) {
        rettBreyting--;
        stada.rett--;
      }
    }
    batch.delete(attemptDoc.ref);
    endurtokuBreytingar[`endurtaka.${attemptDoc.id}`] = deleteField();
    endurtaka.delete(attemptDoc.id);
  }

  const breytingar = {
    ...endurtokuBreytingar,
    fjoldiSvarad: increment(svaradBreyting),
    // Telur hversu oft notandinn byrjar verkefni aftur (sést í stjórnborðinu).
    fjoldiByrjadAftur: increment(1),
    [`verkefnaStada.${valdVerkefniId}.byrjadAftur`]: increment(1),
    [`verkefnaStada.${valdVerkefniId}.sidastByrjadAftur`]: serverTimestamp()
  };
  stadaBreytingar.forEach((st, vid) => {
    if (st.svarad) breytingar[`verkefnaStada.${vid}.svarad`] = increment(st.svarad);
    if (st.pass) breytingar[`verkefnaStada.${vid}.pass`] = increment(st.pass);
    if (st.rett) breytingar[`verkefnaStada.${vid}.rett`] = increment(st.rett);
  });
  if (passBreyting) breytingar.fjoldiPass = increment(passBreyting);
  if (rettBreyting) breytingar.fjoldiRett = increment(rettBreyting);
  batch.update(doc(db, "users", notandi.uid), breytingar);

  await batch.commit();
  sidastiNotandaGogn = null; // teljararnir breyttust mikið - lesa notendaskjalið ferskt næst

  svaradIdSett.clear();
  spurningaSida = 0;
  birtaSpurningar();
  hladaMinumStodum();
}
byrjaAfturBtn.addEventListener("click", byrjaVerkefniAftur);

// --- Ein spurning í einu (nemendur) ---
// Nemandi sér eina spurningu í einu með framvindustiku; eftir svar kemur
// "Næsta" takki (Enter virkar líka) og fókusinn fer á svarreitinn í næstu
// spurningu. Rangt svar er sýnt strax með réttu svari og spurningin kemur aftur
// 15-20 spurningum seinna (endurtaka, geymt á users/{uid}.endurtaka). Ef hún er
// þá svöruð rétt kemur nýtt svar í stað þess ranga og hún telst rétt.
const ENDURTAKA_LAGMARK = 15;
const ENDURTAKA_HAMARK = 20;
let endurtaka = new Map(); // spurningaID -> "fjoldiSvarad" þegar hún á að koma aftur
let svaradTalning = 0; // fjöldi svarða spurninga hjá notandanum (users/{uid}.fjoldiSvarad)

function einnHamur() {
  return (
    !!notandi &&
    !erAdminNotandi &&
    valdVerkefniId !== null &&
    !valdHverErFlokkur &&
    spurningaBunkastaerd !== SPURNINGAR_A_SIDU_PROF_SKRAD
  );
}

function birtaSpurningar() {
  if (einnHamur()) birtaEinaSpurningu();
  else synaSpurningaSidu();
}

async function hladaEndurtokuStodu() {
  try {
    const gogn = sidastiNotandaGogn || (await getDoc(doc(db, "users", notandi.uid))).data() || {};
    svaradTalning = gogn.fjoldiSvarad || 0;
    endurtaka = new Map(Object.entries(gogn.endurtaka || {}));
  } catch (villa) {
    console.error(villa);
    svaradTalning = 0;
    endurtaka = new Map();
  }
}

function naestiEndurtekningardagur() {
  return svaradTalning + ENDURTAKA_LAGMARK + Math.floor(Math.random() * (ENDURTAKA_HAMARK - ENDURTAKA_LAGMARK + 1));
}

function skraEndurtekningu(questionId) {
  const dagur = naestiEndurtekningardagur();
  endurtaka.set(questionId, dagur);
  updateDoc(doc(db, "users", notandi.uid), { [`endurtaka.${questionId}`]: dagur }).catch((villa) => console.error(villa));
}

function afskraEndurtekningu(questionId) {
  if (!endurtaka.has(questionId)) return;
  endurtaka.delete(questionId);
  updateDoc(doc(db, "users", notandi.uid), { [`endurtaka.${questionId}`]: deleteField() }).catch((villa) => console.error(villa));
}

// Næsta spurning: fyrst endurtekin spurning sem er komin á tíma, annars fyrsta
// ósvaraða. Þegar engin er ósvöruð eru endurtekningar sýndar þó þær séu ekki
// komnar á tíma.
function veljaNaestuSpurningu() {
  const iBodi = allarSpurningaskjol
    .filter((d) => svaradIdSett.has(d.id) && endurtaka.has(d.id))
    .sort((a, b) => endurtaka.get(a.id) - endurtaka.get(b.id));
  const komin = iBodi.find((d) => endurtaka.get(d.id) <= svaradTalning);
  if (komin) return { qDoc: komin, endurtekning: true };
  const osvarad = allarSpurningaskjol.find((d) => !svaradIdSett.has(d.id));
  if (osvarad) return { qDoc: osvarad, endurtekning: false };
  if (iBodi.length > 0) return { qDoc: iBodi[0], endurtekning: true };
  return null;
}

function birtaEinaSpurningu(fokus = false) {
  siduflettingarEfri.hidden = true;
  siduflettingar.hidden = true;
  spurningaListi.innerHTML = "";

  const svaradAlls = allarSpurningaskjol.filter((d) => svaradIdSett.has(d.id)).length;
  const heild = allarSpurningaskjol.length;

  const framvinda = document.createElement("div");
  framvinda.className = "ein-framvinda";
  const framvindaTexti = document.createElement("span");
  framvindaTexti.textContent = `Svarað ${svaradAlls} af ${heild}`;
  const stika = document.createElement("div");
  stika.className = "ein-stika";
  const stikaFyllt = document.createElement("div");
  stikaFyllt.style.width = `${heild ? Math.round((svaradAlls / heild) * 100) : 0}%`;
  stika.appendChild(stikaFyllt);
  framvinda.append(framvindaTexti, stika);
  spurningaListi.appendChild(framvinda);

  const naest = veljaNaestuSpurningu();
  if (!naest) {
    const lok = document.createElement("div");
    lok.className = "spurning-kort";
    lok.innerHTML = "<h3>Þú hefur svarað öllum spurningunum hér 🎉</h3><p>Þú getur stokkað eða byrjað verkefnið aftur hér fyrir ofan.</p>";
    spurningaListi.appendChild(lok);
    return;
  }

  const { qDoc, endurtekning } = naest;
  const spurning = qDoc.data();
  const naestaBtn = document.createElement("button");
  naestaBtn.type = "button";
  naestaBtn.className = "aðal-hnappur ein-naesta";
  naestaBtn.textContent = "Næsta →";
  naestaBtn.hidden = true;
  naestaBtn.addEventListener("click", () => birtaEinaSpurningu(true));

  const klaradi = () => {
    naestaBtn.hidden = false;
    naestaBtn.focus({ preventScroll: true });
    naestaBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const korti = byggjaSpurningaKort(qDoc.id, spurning, false, {
    einn: true,
    endurtekning,
    eftirLokid: klaradi,
    eftirSvar: (nidurstodur) => {
      svaradTalning++;
      const nyttSvarad = allarSpurningaskjol.filter((d) => svaradIdSett.has(d.id)).length;
      framvindaTexti.textContent = `Svarað ${nyttSvarad} af ${heild}`;
      stikaFyllt.style.width = `${heild ? Math.round((nyttSvarad / heild) * 100) : 0}%`;
      if (nidurstodur && !nidurstodur.pass && !nidurstodur.rett) skraEndurtekningu(qDoc.id);
      else afskraEndurtekningu(qDoc.id);
      klaradi();
    }
  });
  spurningaListi.appendChild(korti);
  spurningaListi.appendChild(naestaBtn);

  if (fokus) {
    const reitur = korti.querySelector(".svar-form input");
    if (reitur) reitur.focus({ preventScroll: true });
    korti.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Rangt svar skipt út fyrir rétt: gamla svarinu er eytt og nýtt skráð (attempts eru óbreytanlegar).
async function skraRettEftirRangt(questionId, svar, spurning) {
  try {
    const attemptRef = doc(db, "users", notandi.uid, "attempts", questionId);
    await deleteDoc(attemptRef);
    await setDoc(attemptRef, { svar, answeredAt: serverTimestamp() });
    const breytingar = { fjoldiRett: increment(1), [`endurtaka.${questionId}`]: deleteField() };
    if (spurning?.verkefniId) breytingar[`verkefnaStada.${spurning.verkefniId}.rett`] = increment(1);
    await updateDoc(doc(db, "users", notandi.uid), breytingar);
    beitaStodu(spurning?.verkefniId, { rett: 1 });
    endurtaka.delete(questionId);
  } catch (villa) {
    console.error(villa);
  }
}

// Endurtekin spurning: svarið skráist ekki sem nýtt svar nema það sé rétt - þá
// kemur það í stað ranga svarsins (attempts eru óbreytanlegar svo því gamla er
// eytt og nýtt skráð) og telst rétt í samtölunum.
async function svaraEndurtekningu(questionId, hraSvar, form, nidurstada, spurning, valkostir) {
  const svar = hraSvar === SLEPPT_MERKI ? SLEPPT_MERKI : samraema(hraSvar);
  if (!svar) return;
  form.querySelector("input").disabled = true;
  form.querySelectorAll("button").forEach((b) => (b.disabled = true));

  const svarSnap = await getDoc(doc(db, "answers", questionId));
  const rettSvor = svarSnap.exists() ? svarSnap.data().correctAnswers || [] : [];
  const rett = svar !== SLEPPT_MERKI && erSvarRett(svar, rettSvor);

  if (rett) {
    try {
      const attemptRef = doc(db, "users", notandi.uid, "attempts", questionId);
      await deleteDoc(attemptRef);
      await setDoc(attemptRef, { svar, answeredAt: serverTimestamp() });
      const breytingar = { fjoldiRett: increment(1), [`endurtaka.${questionId}`]: deleteField() };
      if (spurning?.verkefniId) breytingar[`verkefnaStada.${spurning.verkefniId}.rett`] = increment(1);
      await updateDoc(doc(db, "users", notandi.uid), breytingar);
      beitaStodu(spurning?.verkefniId, { rett: 1 });
      endurtaka.delete(questionId);
    } catch (villa) {
      console.error(villa);
      alert("Tókst ekki að skrá svarið. Reyndu aftur.");
      form.querySelector("input").disabled = false;
      form.querySelectorAll("button").forEach((b) => (b.disabled = false));
      return;
    }
    nidurstada.textContent = "Rétt núna! 🎉 Þetta telst nú rétt.";
    nidurstada.classList.add("rett");
  } else {
    nidurstada.textContent = `${svar === SLEPPT_MERKI ? "Pass" : "Rangt aftur"}. Rétt svar: ${rettSvor[0] ?? "—"} - hún kemur aftur seinna.`;
    nidurstada.classList.add("rangt");
    skraEndurtekningu(questionId);
  }
  birtaSpurningamynd(form.closest(".spurning-kort"), spurning);
  hladaMinumStodum();
  valkostir.eftirLokid?.();
}

// --- Glósa við hverja spurningu ---
// users/{uid}/spurningaGlosur/{spurningaID} = { texti, spurning (texti spurningarinnar), verkefniId, updatedAt }.
// Öll glósusöfnin eru sótt einu sinni á lotu (fá skjöl) svo hnappurinn geti sýnt hvort glósa er til.
let spurningaGlosurMinni = null;
function saekjaSpurningaGlosur() {
  if (!spurningaGlosurMinni) {
    spurningaGlosurMinni = getDocs(collection(db, "users", notandi.uid, "spurningaGlosur"))
      .then((snap) => new Map(snap.docs.map((d) => [d.id, d.data()])))
      .catch((villa) => {
        console.error(villa);
        spurningaGlosurMinni = null;
        return new Map();
      });
  }
  return spurningaGlosurMinni;
}

function byggjaSpurningaGlosu(questionId, spurning) {
  const kassi = document.createElement("div");
  kassi.className = "spurning-glosa";

  const takki = document.createElement("button");
  takki.type = "button";
  takki.className = "smabtn glosa-takki";
  takki.textContent = "📝 Glósa";
  takki.setAttribute("aria-expanded", "false");

  const svaedi = document.createElement("div");
  svaedi.className = "glosa-svaedi";
  svaedi.hidden = true;
  const texti = document.createElement("textarea");
  texti.rows = 3;
  texti.maxLength = 1900;
  texti.placeholder = "Glósa um þessa spurningu - aðeins þú sérð hana…";
  const adgerdir = document.createElement("div");
  adgerdir.className = "glosa-adgerdir";
  const vistaBtn = document.createElement("button");
  vistaBtn.type = "button";
  vistaBtn.className = "smabtn";
  vistaBtn.textContent = "Vista";
  const eydaBtn = document.createElement("button");
  eydaBtn.type = "button";
  eydaBtn.className = "smabtn";
  eydaBtn.textContent = "Eyða";
  eydaBtn.hidden = true;
  const stada = document.createElement("span");
  stada.className = "glosa-stada";
  adgerdir.append(vistaBtn, eydaBtn, stada);
  svaedi.append(texti, adgerdir);
  kassi.append(takki, svaedi);

  const uppfaeraTakka = (til) => {
    takki.textContent = til ? "📝 Glósa ✓" : "📝 Glósa";
    eydaBtn.hidden = !til;
  };
  saekjaSpurningaGlosur().then((m) => {
    const g = m.get(questionId);
    if (g) {
      texti.value = g.texti || "";
      uppfaeraTakka(true);
    }
  });

  takki.addEventListener("click", async () => {
    const opna = svaedi.hidden;
    svaedi.hidden = !opna;
    takki.setAttribute("aria-expanded", String(opna));
    if (opna) {
      stada.textContent = "";
      const m = await saekjaSpurningaGlosur();
      if (!texti.value && m.get(questionId)) texti.value = m.get(questionId).texti || "";
      texti.focus({ preventScroll: true });
    }
  });

  vistaBtn.addEventListener("click", async () => {
    const t = texti.value.trim();
    if (!t) {
      stada.textContent = "Skrifaðu eitthvað fyrst.";
      return;
    }
    vistaBtn.disabled = true;
    stada.textContent = "Vista…";
    try {
      const gogn = { texti: t, spurning: (spurning?.text || "").slice(0, 480), verkefniId: spurning?.verkefniId || "", updatedAt: serverTimestamp() };
      await setDoc(doc(db, "users", notandi.uid, "spurningaGlosur", questionId), gogn);
      (await saekjaSpurningaGlosur()).set(questionId, { ...gogn, texti: t });
      uppfaeraTakka(true);
      stada.textContent = "Vistað ✓";
    } catch (villa) {
      console.error(villa);
      stada.textContent = "Tókst ekki að vista - reyndu aftur.";
    }
    vistaBtn.disabled = false;
  });

  eydaBtn.addEventListener("click", async () => {
    try {
      await deleteDoc(doc(db, "users", notandi.uid, "spurningaGlosur", questionId));
      (await saekjaSpurningaGlosur()).delete(questionId);
      texti.value = "";
      uppfaeraTakka(false);
      svaedi.hidden = true;
      takki.setAttribute("aria-expanded", "false");
    } catch (villa) {
      console.error(villa);
      stada.textContent = "Tókst ekki að eyða - reyndu aftur.";
    }
  });

  return kassi;
}

function byggjaSpurningaKort(questionId, spurning, buidSvarad, valkostir = {}) {
  const korti = document.createElement("article");
  korti.className = "spurning-kort" + (buidSvarad ? " svarad" : "");

  if (valkostir.endurtekning) {
    const merki = document.createElement("p");
    merki.className = "endurtekning-merki";
    merki.textContent = "🔁 Endurtekin spurning - svaraðu núna rétt og hún telst rétt";
    korti.appendChild(merki);
  }

  const titill = document.createElement("h3");
  titill.textContent = spurning.text;
  korti.appendChild(titill);

  // "Hver er": myndin ER spurningin, svo hún er sýnd strax (annars birtist
  // mynd bara eftir svar, sjá synaNidurstodu).
  if (erHverErSpurning(spurning)) birtaSpurningamynd(korti, spurning);
  if (valdHverErFlokkur?.adminEingongu && erKennileitaYfirferd()) byggjaKennileitaYfirferd(korti, questionId, spurning);

  if (!notandi) {
    const abending = document.createElement("p");
    abending.className = "spurning-nidurstada";
    abending.innerHTML = 'Þú þarft að <a class="tengill" href="index.html">skrá þig inn</a> til að svara.';
    korti.appendChild(abending);
    return korti;
  }

  const form = document.createElement("form");
  form.className = "svar-form";

  const innslattur = document.createElement("input");
  innslattur.type = "text";
  innslattur.placeholder = "Svarið þitt…";
  innslattur.autocomplete = "off";
  innslattur.disabled = buidSvarad;
  innslattur.required = true;

  const sendaBtn = document.createElement("button");
  sendaBtn.type = "submit";
  sendaBtn.textContent = "Svara";
  sendaBtn.disabled = buidSvarad;

  const sleppaBtn = document.createElement("button");
  sleppaBtn.type = "button";
  sleppaBtn.className = "sleppa-btn";
  sleppaBtn.textContent = "Pass";
  sleppaBtn.disabled = buidSvarad;

  form.appendChild(innslattur);
  form.appendChild(sendaBtn);
  form.appendChild(sleppaBtn);
  korti.appendChild(form);

  const nidurstada = document.createElement("p");
  nidurstada.className = "spurning-nidurstada";
  korti.appendChild(nidurstada);

  const aefingaSvaedi = document.createElement("div");
  aefingaSvaedi.hidden = true;
  korti.appendChild(aefingaSvaedi);

  if (notandi) korti.appendChild(byggjaSpurningaGlosu(questionId, spurning));

  // Ein spurning í einu: engin "reyndu aftur" æfing (svarið er sýnt strax og
  // spurningin kemur aftur eftir nokkrar spurningar, sjá endurtaka).
  const aefing = valkostir.einn ? null : aefingaSvaedi;
  const sendaSvar = (svarTexti) => {
    if (valkostir.endurtekning) {
      svaraEndurtekningu(questionId, svarTexti, form, nidurstada, spurning, valkostir);
    } else {
      svaraSpurningu(questionId, svarTexti, korti, form, nidurstada, aefing, spurning, valkostir);
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendaSvar(innslattur.value);
  });

  sleppaBtn.addEventListener("click", () => {
    sendaSvar(SLEPPT_MERKI);
  });

  if (buidSvarad) {
    synaNidurstodu(questionId, korti, nidurstada, undefined, aefingaSvaedi, spurning);
  }

  return korti;
}

// "Reyndu aftur" reiturinn: ef nemandinn svarar núna rétt kemur nýja svarið í
// stað ranga svarsins (eins og í svaraEndurtekningu) og spurningin telst rétt.
function birtaAeftinguEftirRangt(svaedi, rettSvor, questionId, spurning, korti) {
  svaedi.innerHTML = "";
  svaedi.hidden = false;
  svaedi.style.marginTop = "10px";

  const form = document.createElement("form");
  form.className = "svar-form";

  const innslattur = document.createElement("input");
  innslattur.type = "text";
  innslattur.placeholder = "Reyndu aftur (æfing)…";
  innslattur.autocomplete = "off";

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.textContent = "Athuga";

  form.appendChild(innslattur);
  form.appendChild(btn);

  const aefingaNidurstada = document.createElement("p");
  aefingaNidurstada.className = "spurning-nidurstada";
  let skradRett = false;

  // Svarið er ekki ljóstrað upp fyrr en nemandinn biður sjálfur um það - annars
  // væri "reyndu aftur" tilgangslaust (svarið stæði þegar fyrir ofan).
  const synaSvarBtn = document.createElement("button");
  synaSvarBtn.type = "button";
  synaSvarBtn.className = "smabtn";
  synaSvarBtn.style.marginTop = "8px";
  synaSvarBtn.textContent = "Sýna rétt svar";
  synaSvarBtn.addEventListener("click", () => {
    aefingaNidurstada.className = "spurning-nidurstada";
    aefingaNidurstada.textContent = `Rétt svar: ${rettSvor[0] ?? "—"}`;
    synaSvarBtn.remove();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const svar = samraema(innslattur.value);
    if (!svar) return;
    aefingaNidurstada.className = "spurning-nidurstada";
    if (erSvarRett(svar, rettSvor)) {
      aefingaNidurstada.textContent = "Rétt núna! 🎉 Þetta telst nú rétt.";
      aefingaNidurstada.classList.add("rett");
      synaSvarBtn.remove();
      form.querySelectorAll("input, button").forEach((e) => (e.disabled = true));
      if (questionId && notandi && !skradRett) {
        skradRett = true;
        skraRettEftirRangt(questionId, svar, spurning).then(() => {
          korti?.classList.add("svarad");
          hladaMinumStodum();
        });
      }
    } else {
      aefingaNidurstada.textContent = "Ennþá ekki rétt - prófaðu aftur.";
      aefingaNidurstada.classList.add("rangt");
    }
  });

  svaedi.appendChild(form);
  svaedi.appendChild(synaSvarBtn);
  svaedi.appendChild(aefingaNidurstada);
}

async function svaraSpurningu(questionId, hraSvar, korti, form, nidurstada, aefingaSvaedi, spurning, valkostir = {}) {
  const svar = hraSvar === SLEPPT_MERKI ? SLEPPT_MERKI : samraema(hraSvar);
  if (!svar) return;

  form.querySelector("input").disabled = true;
  form.querySelectorAll("button").forEach((b) => (b.disabled = true));

  try {
    await setDoc(doc(db, "users", notandi.uid, "attempts", questionId), {
      svar,
      answeredAt: serverTimestamp()
    });
  } catch (villa) {
    console.error(villa);
    alert("Tókst ekki að skrá svarið. Reyndu aftur.");
    form.querySelector("input").disabled = false;
    form.querySelectorAll("button").forEach((b) => (b.disabled = false));
    return;
  }

  korti.classList.add("svarad");
  svaradIdSett.add(questionId);

  // Allar spurningar prófsins svaraðar - viðvörunin í beforeunload á ekki
  // lengur við, prófinu er lokið.
  if (profIVinnslu && allarSpurningaskjol.length > 0 && allarSpurningaskjol.every((d) => svaradIdSett.has(d.id))) {
    profIVinnslu = false;
  }

  const nidurstodur = await synaNidurstodu(questionId, korti, nidurstada, svar, aefingaSvaedi, spurning);
  uppfaeraSamtoluStodu(spurning?.verkefniId, nidurstodur);
  hladaMinumStodum();
  if (valkostir.eftirSvar) valkostir.eftirSvar(nidurstodur);
}

// Heldur fjoldiSvarad/fjoldiRett/fjoldiPass/verkefnaStada/sidastSvaradAt á
// users/{uid} réttum jafnóðum þegar svarað er - stjórnborðið les þessar tölur
// beint í stað þess að endurreikna úr öllum attempts-skjölum hvers notanda í
// hvert sinn sem stjórnborðið hleður (sjá hladaNotendayfirlit í js/admin.js),
// sem var að klára daglega Firestore-lestrarkvótann.
function uppfaeraSamtoluStodu(verkefniId, nidurstodur) {
  if (!notandi || !nidurstodur) return;
  const { pass, rett } = nidurstodur;
  beitaStodu(verkefniId, { svarad: 1, pass: pass ? 1 : 0, rett: !pass && rett ? 1 : 0 });
  const breytingar = {
    fjoldiSvarad: increment(1),
    sidastSvaradAt: serverTimestamp()
  };
  if (pass) breytingar.fjoldiPass = increment(1);
  else if (rett) breytingar.fjoldiRett = increment(1);
  if (verkefniId) {
    breytingar[`verkefnaStada.${verkefniId}.svarad`] = increment(1);
    if (pass) breytingar[`verkefnaStada.${verkefniId}.pass`] = increment(1);
    else if (rett) breytingar[`verkefnaStada.${verkefniId}.rett`] = increment(1);
  }
  updateDoc(doc(db, "users", notandi.uid), breytingar).catch((villa) => console.error(villa));
}

// Birtir mynd sem lýsir svarinu við spurningunni, þegar hún er til (sjá
// scripts/add-hrifamiklir-question-images.js) - aðeins eftir að spurningin
// er metin (rétt/rangt), aldrei fyrirfram.
function birtaSpurningamynd(korti, spurning) {
  if (!spurning?.image || korti.querySelector(".spurning-mynd")) return;
  const mynd = document.createElement("img");
  mynd.className = "spurning-mynd";
  mynd.src = spurning.image;
  mynd.alt = spurning.imageAlt || "";
  mynd.loading = "lazy";
  const glosa = korti.querySelector(".spurning-glosa"); // myndin kemur á undan glósuhnappnum
  korti.insertBefore(mynd, glosa);
  if (spurning.imageCredit) {
    const heimild = document.createElement("p");
    heimild.className = "heimild-tilvitnun";
    heimild.textContent = `Mynd: ${spurning.imageCredit}`;
    korti.insertBefore(heimild, glosa);
  }
}

async function synaNidurstodu(questionId, korti, nidurstada, gefidSvar, aefingaSvaedi, spurning) {
  let mittSvar = gefidSvar;
  if (mittSvar === undefined) {
    const attemptSnap = await getDoc(doc(db, "users", notandi.uid, "attempts", questionId));
    mittSvar = attemptSnap.data()?.svar;
  }

  if (mittSvar === SLEPPT_MERKI) {
    // Pass sýnir rétta svarið svo nemandinn læri það.
    const passSvarSnap = await getDoc(doc(db, "answers", questionId));
    const passRettSvar = passSvarSnap.exists() ? (passSvarSnap.data().correctAnswers || [])[0] : null;
    nidurstada.textContent = passRettSvar ? `Pass ⏭ Rétt svar: ${passRettSvar}` : "Pass ⏭";
    nidurstada.classList.add("sleppt");
    birtaSpurningamynd(korti, spurning);
    return { pass: true, rett: false };
  }

  const svarSnap = await getDoc(doc(db, "answers", questionId));
  if (!svarSnap.exists()) return { pass: false, rett: false };

  const rettSvor = svarSnap.data().correctAnswers || [];
  const rett = erSvarRett(mittSvar, rettSvor);

  if (rett) {
    nidurstada.textContent = "Rétt svar! 🎉";
    nidurstada.classList.add("rett");
  } else if (aefingaSvaedi) {
    // Svarið er ekki birt strax - þá væri "reyndu aftur" hér fyrir neðan
    // tilgangslaust. Nemandinn getur sjálfur beðið um að sjá það (sjá
    // birtaAeftinguEftirRangt).
    nidurstada.textContent = "Rangt svar. Reyndu aftur hér fyrir neðan!";
    nidurstada.classList.add("rangt");
    birtaAeftinguEftirRangt(aefingaSvaedi, rettSvor, questionId, spurning, korti);
  } else {
    nidurstada.textContent = `Rangt svar. Rétt svar: ${rettSvor[0] ?? "—"}`;
    nidurstada.classList.add("rangt");
  }
  birtaSpurningamynd(korti, spurning);
  return { pass: false, rett };
}

async function hladaMinumStodum() {
  if (!notandi) {
    stodurNiðurstada.textContent = "";
    return;
  }
  // Á rangar-spurningar yfirlitinu er valdVerkefniId null (spurningar koma úr
  // mörgum verkefnum) - þar setur hladaRangarSpurningar sinn eigin stöðutexta.
  if (valdVerkefniId === null) return;

  // Les beint af users/{uid}.verkefnaStada í stað þess að endursækja spurningar
  // + attempts + hvert answers-skjal í hvert sinn sem spurningu er svarað.
  if (!sidastiNotandaGogn) sidastiNotandaGogn = (await getDoc(doc(db, "users", notandi.uid))).data() || {};
  const stodur = sidastiNotandaGogn.verkefnaStada || {};
  // Í Hraðaspurningum teljast líka spurningar úr úthlutuðum flokkum.
  const verkefniIds = new Set([valdVerkefniId]);
  if (valdVerkefniErHrada) allarSpurningaskjol.forEach((d) => verkefniIds.add(d.data().verkefniId));
  const b = { svarad: 0, pass: 0, rett: 0 };
  verkefniIds.forEach((vid) => {
    b.svarad += stodur[vid]?.svarad || 0;
    b.pass += stodur[vid]?.pass || 0;
    b.rett += stodur[vid]?.rett || 0;
  });
  const fjoldiSvarad = b.svarad || 0;
  const fjoldiSleppt = b.pass || 0;
  const fjoldiRett = b.rett || 0;
  const fjoldiMetin = fjoldiSvarad - fjoldiSleppt;
  const nakvaemni = fjoldiMetin ? Math.round((fjoldiRett / fjoldiMetin) * 100) : 0;
  const sleppTexti = fjoldiSleppt ? `, ${fjoldiSleppt} pass` : "";
  stodurNiðurstada.textContent =
    `Þú hefur svarað ${fjoldiSvarad} spurningum í þessu verkefni${sleppTexti}, ${fjoldiRett} réttum (${nakvaemni}% nákvæmni).`;
}
