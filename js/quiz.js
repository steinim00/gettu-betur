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
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const notandaNafn = document.getElementById("notandaNafn");
const utskraBtn = document.getElementById("utskraBtn");

const minStadaBtn = document.getElementById("minStadaBtn");
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
const glosurSvaedi = document.getElementById("glosurSvaedi");
const tilbakaFraGlosum = document.getElementById("tilbakaFraGlosum");
const glosurListi = document.getElementById("glosurListi");
const glosaBox = document.getElementById("glosaBox");
const glosaTextarea = document.getElementById("glosaTextarea");
const vistaGlosuBtn = document.getElementById("vistaGlosuBtn");
const glosaStada = document.getElementById("glosaStada");

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

function hefjaTimamaelingu() {
  if (notandi && document.visibilityState === "visible" && !virkTimamaeling) {
    virkTimamaeling = Date.now();
  }
}

function stodvaTimamaelingu() {
  if (virkTimamaeling) {
    ovistadurSkjatimi += (Date.now() - virkTimamaeling) / 1000;
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

// --- Heatmap-skráning: smellir og skrunardýpt, eftir tæki og "síðu" ---
// Geymt á users/{uid}.heatmap.{tæki}.{lykill}: smellir í reitum (c<dx>_<dy>,
// 20px reitir; dx er lárétt færsla frá miðju síðunnar svo miðjuð uppsetning
// stemmi á ólíkum skjábreiddum) og skrun (s<röð> = fjöldi lota sem komust
// niður í 100px-röð, n = fjöldi lota). Stjórnborðið teiknar þetta ofan á
// lifandi útgáfu síðunnar (sjá Tölfræði-síðuna í js/admin.js).
const HEATMAP_REITUR = 20;
const SKRUNAR_ROD = 100;
let virktSvaedi = null;
let virktHeatmapLykill = null;
let bidHeatmap = {};
let dypstaSkrun = 0;

function heatmapVirkt() {
  return !!notandi && !erAdminNotandi && !!virktHeatmapLykill;
}

function skraHeatmap(slod, fjoldi = 1) {
  bidHeatmap[slod] = (bidHeatmap[slod] || 0) + fjoldi;
}

function hefjaSkrunarlotu() {
  dypstaSkrun = window.scrollY + window.innerHeight;
}

function lokaSkrunarlotu() {
  if (heatmapVirkt()) {
    const hamark = document.documentElement.scrollHeight;
    const dypt = Math.min(Math.max(dypstaSkrun, window.scrollY + window.innerHeight), hamark);
    const rodir = Math.min(Math.ceil(dypt / SKRUNAR_ROD), 100);
    const grunnur = `heatmap.${taekiTegund()}.${virktHeatmapLykill}`;
    for (let r = 0; r < rodir; r++) skraHeatmap(`${grunnur}.s${r}`);
    skraHeatmap(`${grunnur}.n`);
  }
  dypstaSkrun = 0;
}

document.addEventListener(
  "click",
  (e) => {
    if (!heatmapVirkt()) return;
    const dx = Math.floor((e.pageX - document.documentElement.clientWidth / 2) / HEATMAP_REITUR) + 100;
    const dy = Math.floor(e.pageY / HEATMAP_REITUR);
    if (dx < 0 || dy < 0) return;
    skraHeatmap(`heatmap.${taekiTegund()}.${virktHeatmapLykill}.c${dx}_${dy}`);
  },
  { passive: true }
);
window.addEventListener(
  "scroll",
  () => {
    dypstaSkrun = Math.max(dypstaSkrun, window.scrollY + window.innerHeight);
  },
  { passive: true }
);

function vistaSkjatima() {
  stodvaTimamaelingu();
  if (!notandi) {
    hefjaTimamaelingu();
    return;
  }
  const sekundur = Math.round(ovistadurSkjatimi);
  ovistadurSkjatimi = 0;
  // lastActive fylgir alltaf með hér, sama skrif og skjátíminn - óháð því
  // hvort einhver sekúnda safnaðist upp (t.d. strax eftir að flipinn var
  // opnaður), svo þetta nái líka tilvikum sem skraVirkni ein og sér myndi
  // missa af.
  const breytingar = { lastActive: serverTimestamp() };
  if (sekundur >= 1) {
    breytingar.screenTimeSeconds = increment(sekundur);
    Object.assign(breytingar, virkniReitur(sekundur));
  }
  const heatmapPakki = bidHeatmap;
  bidHeatmap = {};
  for (const [slod, fjoldi] of Object.entries(heatmapPakki)) breytingar[slod] = increment(fjoldi);
  updateDoc(doc(db, "users", notandi.uid), breytingar).catch((villa) => {
    console.error(villa);
    ovistadurSkjatimi += sekundur;
    for (const [slod, fjoldi] of Object.entries(heatmapPakki)) skraHeatmap(slod, fjoldi);
  });
  hefjaTimamaelingu();
}

// Auka lastActive-skrif um leið og notandinn gerir eitthvað raunverulegt
// (smellur, snertir skjáinn, slær á lykilborð) - til viðbótar við skrifið í
// vistaSkjatima að ofan, svo "síðast virk/ur" uppfærist samstundis í stað
// þess að bíða eftir næstu 60 sek flautun. Takmarkað við eitt Firestore-skrif
// á mínútu svo tíðar smellir/áslættir skrifaflæði ekki yfir kvótann.
let sidastaVirkniSkrif = 0;
function skraVirkni() {
  if (!notandi) return;
  const nuna = Date.now();
  if (nuna - sidastaVirkniSkrif < 60000) return;
  sidastaVirkniSkrif = nuna;
  updateDoc(doc(db, "users", notandi.uid), { lastActive: serverTimestamp() }).catch(() => {});
}
["click", "touchstart", "keydown"].forEach((heiti) => {
  document.addEventListener(heiti, skraVirkni, { passive: true });
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    lokaSkrunarlotu();
    vistaSkjatima();
  } else {
    hefjaTimamaelingu();
    hefjaSkrunarlotu();
  }
});

window.addEventListener("beforeunload", () => {
  stodvaTimamaelingu();
  lokaSkrunarlotu();
  if (notandi && (ovistadurSkjatimi >= 1 || Object.keys(bidHeatmap).length)) {
    const sekundur = Math.round(ovistadurSkjatimi);
    const breytingar = {};
    if (sekundur >= 1) Object.assign(breytingar, { screenTimeSeconds: increment(sekundur) }, virkniReitur(sekundur));
    for (const [slod, fjoldi] of Object.entries(bidHeatmap)) breytingar[slod] = increment(fjoldi);
    bidHeatmap = {};
    updateDoc(doc(db, "users", notandi.uid), breytingar).catch(() => {});
  }
});

setInterval(vistaSkjatima, 60000);

// TÍMABUNDIÐ meðan á þróun/grunnvinnu stendur: requireAuth er false svo hægt sé
// að skoða verkefni/glærur án innskráningar. Innskráning er samt áskilin til að
// svara spurningum (sjá byggjaSpurningaKort). Fyrir alvöru notkun: settu
// requireAuth aftur í true hér, og "if true" aftur í "if innskradur()" fyrir
// verkefni/questions í firestore.rules.
vaktaInnskraningu({ requireAuth: false }, (user, gogn) => {
  notandi = user;
  erAdminNotandi = gogn?.role === "admin";

  if (user) {
    notandaNafn.textContent = gogn.nafn || user.email;
    utskraBtn.hidden = false;
    minStadaBtn.hidden = false;
    glosurBtn.hidden = false;
    hefjaTimamaelingu();
    updateDoc(doc(db, "users", user.uid), { lastActive: serverTimestamp() }).catch(() => {});

    // "Mín staða" er upphafspunktur innskráðra nemenda - þau sjá eigin
    // stöðu um leið og þau koma inn, frekar en að þurfa að smella á hnapp.
    synaSvaedi("minstada");
    hladaMinaStodu();

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

  // "?heatmapsida=<svæði>[_<verkefniId>]" - notað af heatmap-yfirlitinu á
  // stjórnborðinu til að sýna rétta síðu undir heatmappinu (admin skráir ekki
  // eigin smelli, sjá heatmapVirkt).
  const heatmapSida = new URLSearchParams(window.location.search).get("heatmapsida");
  if (heatmapSida && user && gogn?.role === "admin") opnaHeatmapSidu(heatmapSida);
});

async function opnaHeatmapSidu(sida) {
  const [svaedi, id] = sida.split("_");
  if (svaedi === "verkefni") return synaSvaedi("verkefni");
  if (svaedi === "glosur") {
    synaSvaedi("glosur");
    return hladaGlosur();
  }
  if (!id) return;
  const snap = await getDoc(doc(db, "verkefni", id));
  if (!snap.exists()) return;
  if (svaedi === "spurningar") opnaSpurningarBeint(snap.id, snap.data());
  else opnaVerkefni(snap.id, snap.data());
}

async function opnaProfUrSlod(profId) {
  const snap = await getDoc(doc(db, "verkefni", profId));
  if (!snap.exists()) return;
  opnaVerkefni(snap.id, snap.data());
}

utskraBtn.addEventListener("click", () => skraUt());

function synaSvaedi(svaedi) {
  lokaSkrunarlotu();
  minStadaSvaedi.hidden = svaedi !== "minstada";
  glosurSvaedi.hidden = svaedi !== "glosur";
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
  virktSvaedi = svaedi;
  virktHeatmapLykill = (svaedi === "spurningar" || svaedi === "glaerur") && valdVerkefniId ? `${svaedi}_${valdVerkefniId}` : svaedi;
  hefjaSkrunarlotu();
}

tilbakaFraGlaerum.addEventListener("click", () => synaSvaedi("verkefni"));
tilbakaFraSpurningum.addEventListener("click", () => synaSvaedi("verkefni"));
tilbakaFraMinniStodu.addEventListener("click", () => synaSvaedi("verkefni"));
tilbakaFraGlosum.addEventListener("click", () => synaSvaedi("verkefni"));

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

// "Glósurnar mínar" - yfirlit yfir öll verkefni sem notandinn hefur skrifað
// glósu um, með flýtileið til að breyta eða eyða hverri glósu.
async function hladaGlosur() {
  if (!notandi) return;
  glosurListi.innerHTML = skeletonKort(3, 1);

  const glosurSnap = await getDocs(collection(db, "users", notandi.uid, "glosur"));
  const glosur = glosurSnap.docs.filter((d) => (d.data().texti || "").trim().length > 0);

  glosurListi.innerHTML = "";
  if (glosur.length === 0) {
    glosurListi.innerHTML = "<p>Þú hefur ekki skrifað neinar glósur ennþá. Opnaðu glærur verkefnis og skrifaðu glósu þar.</p>";
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
  const notandaGogn = notandiSnap.data() || {};

  birtaVikuAherslu(verkefnaSnap);

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
  valdVerkefniId = null;
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
function opnaSpurningarBeint(verkefniId, verkefni) {
  valdVerkefniId = verkefniId;
  spurningaBunkastaerd = spurningaBunkastaerdFyrir(verkefni);
  spurningaTitill.textContent = verkefni.title;
  synaSvaedi("spurningar");
  hladaSpurningum();
  hladaMinumStodum();
}

// Áberandi borði efst á "Mín staða" sem bendir beint á verkefni vikunnar -
// núna "50 áhrifamiklir einstaklingar". Finnur verkefnið með titilleit
// (sama mynstur og upload-hrifamiklir-extra.js notar), svo ekkert
// harðkóðað skjal-ID þarf að uppfæra ef verkefnið er endurskapað.
function birtaVikuAherslu(verkefnaSnap) {
  const vDoc = verkefnaSnap.docs.find((d) => (d.data().title || "").toLowerCase().includes("áhrifamiklir"));
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
  hnappar.appendChild(glaeruBtn);

  borði.appendChild(titill);
  borði.appendChild(hnappar);
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

  return kort;
}

async function hladaVerkefnaListi() {
  verkefnaListi.innerHTML = skeletonKort(3);
  hradaspurningarSvaedi.hidden = true;

  // Admin sér líka óvirk verkefni (forskoðun) - allir aðrir bara virk.
  const snap = await getDocs(
    erAdminNotandi ? collection(db, "verkefni") : query(collection(db, "verkefni"), where("active", "==", true))
  );

  if (snap.empty) {
    verkefnaListi.innerHTML = "<p>Engin verkefni eru virk eins og er.</p>";
    return;
  }

  // Ein fyrirspurn fyrir allar virkar spurningar, flokkuð eftir verkefni í JS -
  // mun ódýrara en að spyrja Firestore einu sinni fyrir hvert verkefni.
  const spurningarSnap = await getDocs(
    erAdminNotandi ? collection(db, "questions") : query(collection(db, "questions"), where("active", "==", true))
  );
  const spurningaIdEftirVerkefni = new Map();
  spurningarSnap.forEach((qDoc) => {
    const vid = qDoc.data().verkefniId;
    if (!spurningaIdEftirVerkefni.has(vid)) spurningaIdEftirVerkefni.set(vid, []);
    spurningaIdEftirVerkefni.get(vid).push(qDoc.id);
  });

  const svaradIds = notandi
    ? new Set((await getDocs(collection(db, "users", notandi.uid, "attempts"))).docs.map((d) => d.id))
    : new Set();

  verkefnaListi.innerHTML = "";
  hradaspurningarListi.innerHTML = "";

  let fjoldiGlaeruverkefna = 0;
  let fjoldiHradaspurninga = 0;

  snap.forEach((vDoc) => {
    const verkefni = vDoc.data();
    if (!synilegtNotanda(verkefni)) return;
    const spurningaIds = spurningaIdEftirVerkefni.get(vDoc.id) || [];

    if (erProfVerkefni(verkefni)) {
      hradaspurningarListi.appendChild(byggjaHradaspurningarKort(vDoc, verkefni, spurningaIds, svaradIds));
      fjoldiHradaspurninga++;
    } else {
      verkefnaListi.appendChild(byggjaVerkefniKort(vDoc, verkefni, spurningaIds, svaradIds));
      fjoldiGlaeruverkefna++;
    }
  });

  if (fjoldiGlaeruverkefna === 0) {
    verkefnaListi.innerHTML = "<p>Engin verkefni með glærum eru virk eins og er.</p>";
  }
  hradaspurningarSvaedi.hidden = fjoldiHradaspurninga === 0;
}

let pptxIframe = null;

function opnaVerkefni(verkefniId, verkefni) {
  valdVerkefniId = verkefniId;
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

async function hladaSpurningum() {
  spurningaListi.innerHTML = skeletonKort(5, 1);
  siduflettingarEfri.hidden = true;
  siduflettingar.hidden = true;

  // Admin sér líka óvirkar spurningar (forskoðun) - allir aðrir bara virkar.
  const spurningarSnap = await getDocs(
    erAdminNotandi
      ? query(collection(db, "questions"), where("verkefniId", "==", valdVerkefniId))
      : query(
          collection(db, "questions"),
          where("verkefniId", "==", valdVerkefniId),
          where("active", "==", true)
        )
  );

  svaradIdSett = notandi
    ? new Set((await getDocs(collection(db, "users", notandi.uid, "attempts"))).docs.map((d) => d.id))
    : new Set();

  // Aðeins hægt að "byrja aftur" innan eins verkefnis - ekki á rangar-spurningar
  // yfirlitinu (valdVerkefniId er þá null) og ekki fyrir gesti.
  byrjaAfturBtn.hidden = !notandi || valdVerkefniId === null;

  if (spurningarSnap.empty) {
    allarSpurningaskjol = [];
    spurningaListi.innerHTML = "<p>Engar virkar spurningar í þessu verkefni eins og er.</p>";
    return;
  }

  allarSpurningaskjol = spurningarSnap.docs.slice().sort((a, b) => {
    const ta = a.data().createdAt?.toMillis?.() ?? 0;
    const tb = b.data().createdAt?.toMillis?.() ?? 0;
    return ta - tb;
  });

  spurningaSida = 0;
  synaSpurningaSidu();
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
  synaSpurningaSidu();
}
stokkaSpurningarBtn.addEventListener("click", stokkaSpurningar);

// Eyðir öllum tilraunum notandans fyrir spurningarnar í núverandi verkefni
// (öllum í einu, ekki bara stökum röngum svörum - heldur upphaflega
// tilganginum með að svör séu óbreytanleg eftir á) svo hægt sé að svara
// þeim aftur, og dregur frá samtölunum á users/{uid} til samræmis.
async function byrjaVerkefniAftur() {
  if (!notandi || valdVerkefniId === null) return;
  if (
    !confirm(
      "Byrja þetta verkefni aftur? Þetta eyðir svarasögu þinni fyrir allar spurningarnar hér og þú getur svarað þeim aftur."
    )
  ) {
    return;
  }

  const spurningaIdSett = new Set(allarSpurningaskjol.map((d) => d.id));
  const attemptsSnap = await getDocs(collection(db, "users", notandi.uid, "attempts"));
  const tilEydingar = attemptsSnap.docs.filter((a) => spurningaIdSett.has(a.id));
  if (tilEydingar.length === 0) return;

  let svaradBreyting = 0;
  let passBreyting = 0;
  let rettBreyting = 0;

  const batch = writeBatch(db);
  for (const attemptDoc of tilEydingar) {
    const svar = attemptDoc.data().svar;
    svaradBreyting--;
    if (svar === SLEPPT_MERKI) {
      passBreyting--;
    } else {
      const svarSnap = await getDoc(doc(db, "answers", attemptDoc.id));
      const rettSvor = svarSnap.exists() ? svarSnap.data().correctAnswers || [] : [];
      if (erSvarRett(svar, rettSvor)) rettBreyting--;
    }
    batch.delete(attemptDoc.ref);
  }

  const breytingar = {
    fjoldiSvarad: increment(svaradBreyting),
    [`verkefnaStada.${valdVerkefniId}.svarad`]: increment(svaradBreyting)
  };
  if (passBreyting) {
    breytingar.fjoldiPass = increment(passBreyting);
    breytingar[`verkefnaStada.${valdVerkefniId}.pass`] = increment(passBreyting);
  }
  if (rettBreyting) {
    breytingar.fjoldiRett = increment(rettBreyting);
    breytingar[`verkefnaStada.${valdVerkefniId}.rett`] = increment(rettBreyting);
  }
  batch.update(doc(db, "users", notandi.uid), breytingar);

  await batch.commit();

  svaradIdSett.clear();
  spurningaSida = 0;
  synaSpurningaSidu();
  hladaMinumStodum();
}
byrjaAfturBtn.addEventListener("click", byrjaVerkefniAftur);

function byggjaSpurningaKort(questionId, spurning, buidSvarad) {
  const korti = document.createElement("article");
  korti.className = "spurning-kort" + (buidSvarad ? " svarad" : "");

  const titill = document.createElement("h3");
  titill.textContent = spurning.text;
  korti.appendChild(titill);

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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    svaraSpurningu(questionId, innslattur.value, korti, form, nidurstada, aefingaSvaedi, spurning);
  });

  sleppaBtn.addEventListener("click", () => {
    svaraSpurningu(questionId, SLEPPT_MERKI, korti, form, nidurstada, aefingaSvaedi, spurning);
  });

  if (buidSvarad) {
    synaNidurstodu(questionId, korti, nidurstada, undefined, aefingaSvaedi, spurning);
  }

  return korti;
}

// Það "svar" sem þegar er skráð í Firestore er óbreytanlegt (sjá
// firestore.rules - attempts leyfa ekki update/delete), svo "rétta svarið"
// sem þegar var skráð helst óhaggað. Þessi reitur er hrein æfing: ber svarið
// saman við réttu svörin í vafranum sjálfum, skrifar ekkert, og lætur
// nemandann vita (skýrt orðað) að þetta breyti ekki skráðu niðurstöðunni.
function birtaAeftinguEftirRangt(svaedi, rettSvor) {
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
      aefingaNidurstada.textContent = "Rétt núna! 🎉 (æfing - breytir ekki skráðu svari)";
      aefingaNidurstada.classList.add("rett");
      synaSvarBtn.remove();
    } else {
      aefingaNidurstada.textContent = "Ennþá ekki rétt - prófaðu aftur.";
      aefingaNidurstada.classList.add("rangt");
    }
  });

  svaedi.appendChild(form);
  svaedi.appendChild(synaSvarBtn);
  svaedi.appendChild(aefingaNidurstada);
}

async function svaraSpurningu(questionId, hraSvar, korti, form, nidurstada, aefingaSvaedi, spurning) {
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
}

// Heldur fjoldiSvarad/fjoldiRett/fjoldiPass/verkefnaStada/sidastSvaradAt á
// users/{uid} réttum jafnóðum þegar svarað er - stjórnborðið les þessar tölur
// beint í stað þess að endurreikna úr öllum attempts-skjölum hvers notanda í
// hvert sinn sem stjórnborðið hleður (sjá hladaNotendayfirlit í js/admin.js),
// sem var að klára daglega Firestore-lestrarkvótann.
function uppfaeraSamtoluStodu(verkefniId, nidurstodur) {
  if (!notandi || !nidurstodur) return;
  const { pass, rett } = nidurstodur;
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
  korti.appendChild(mynd);
  if (spurning.imageCredit) {
    const heimild = document.createElement("p");
    heimild.className = "heimild-tilvitnun";
    heimild.textContent = `Mynd: ${spurning.imageCredit}`;
    korti.appendChild(heimild);
  }
}

async function synaNidurstodu(questionId, korti, nidurstada, gefidSvar, aefingaSvaedi, spurning) {
  let mittSvar = gefidSvar;
  if (mittSvar === undefined) {
    const attemptSnap = await getDoc(doc(db, "users", notandi.uid, "attempts", questionId));
    mittSvar = attemptSnap.data()?.svar;
  }

  if (mittSvar === SLEPPT_MERKI) {
    nidurstada.textContent = "Pass ⏭";
    nidurstada.classList.add("sleppt");
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
    birtaAeftinguEftirRangt(aefingaSvaedi, rettSvor);
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
  const notandiSnap = await getDoc(doc(db, "users", notandi.uid));
  const b = notandiSnap.data()?.verkefnaStada?.[valdVerkefniId] || { svarad: 0, pass: 0, rett: 0 };
  const fjoldiSvarad = b.svarad || 0;
  const fjoldiSleppt = b.pass || 0;
  const fjoldiRett = b.rett || 0;
  const fjoldiMetin = fjoldiSvarad - fjoldiSleppt;
  const nakvaemni = fjoldiMetin ? Math.round((fjoldiRett / fjoldiMetin) * 100) : 0;
  const sleppTexti = fjoldiSleppt ? `, ${fjoldiSleppt} pass` : "";
  stodurNiðurstada.textContent =
    `Þú hefur svarað ${fjoldiSvarad} spurningum í þessu verkefni${sleppTexti}, ${fjoldiRett} réttum (${nakvaemni}% nákvæmni).`;
}
