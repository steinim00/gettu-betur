import { db } from "./firebase-config.js";
import { vaktaInnskraningu, skraUt } from "./auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const notandaNafn = document.getElementById("notandaNafn");
const utskraBtn = document.getElementById("utskraBtn");

const verkefnaSvaedi = document.getElementById("verkefnaSvaedi");
const verkefnaListi = document.getElementById("verkefnaListi");
const hradaspurningarSvaedi = document.getElementById("hradaspurningarSvaedi");
const hradaspurningarListi = document.getElementById("hradaspurningarListi");

const glaeruSvaedi = document.getElementById("glaeruSvaedi");
const verkefnaTitill = document.getElementById("verkefnaTitill");
const glaerurInnihald = document.getElementById("glaerurInnihald");
const afromISpurningar = document.getElementById("afromISpurningar");
const tilbakaFraGlaerum = document.getElementById("tilbakaFraGlaerum");

const spurningaSvaedi = document.getElementById("spurningaSvaedi");
const spurningaTitill = document.getElementById("spurningaTitill");
const spurningaListi = document.getElementById("spurningaListi");
const stodurNiðurstada = document.getElementById("stodurNiðurstada");
const tilbakaFraSpurningum = document.getElementById("tilbakaFraSpurningum");

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
let valdVerkefniId = null;
let heilskjaGlaerur = [];
let heilskjaIndex = 0;

// Sérstakt merki fyrir "sleppt" svar - geymt í sama "svar" strengjareitnum svo
// engin breyting þurfi á Firestore-reglunum. Passar aldrei við neitt rétt svar.
const SLEPPT_MERKI = "__sleppt__";

const SPURNINGAR_A_SIDU_VENJULEGT = 20;
const SPURNINGAR_A_SIDU_PROF = 5;
let spurningaBunkastaerd = SPURNINGAR_A_SIDU_VENJULEGT;
let allarSpurningaskjol = [];
let svaradIdSett = new Set();
let spurningaSida = 0;

// Verkefni sem hafa enga alvöru glæruefni (eingöngu sjálfgerða lýsingarglæru úr
// t.d. upload-questions.js, og ekkert upprunalegt pptx) eru hrein spurningabanka -
// þau fara beint í spurningar í minni bútum, líkt og próf, í stað glæruflæðisins.
function erProfVerkefni(verkefni) {
  return !verkefni.pptxUrl && (verkefni.slides || []).length <= 1;
}

function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

// TÍMABUNDIÐ meðan á þróun/grunnvinnu stendur: requireAuth er false svo hægt sé
// að skoða verkefni/glærur án innskráningar. Innskráning er samt áskilin til að
// svara spurningum (sjá byggjaSpurningaKort). Fyrir alvöru notkun: settu
// requireAuth aftur í true hér, og "if true" aftur í "if innskradur()" fyrir
// verkefni/questions í firestore.rules.
vaktaInnskraningu({ requireAuth: false }, (user, gogn) => {
  notandi = user;

  if (user) {
    notandaNafn.textContent = gogn.nafn || user.email;
    utskraBtn.hidden = false;

    if (gogn.role === "admin") {
      notandaNafn.classList.add("nafn-stjornbord");
      notandaNafn.title = "Fara í stjórnborðið";
      notandaNafn.addEventListener("click", () => {
        window.location.href = "stjornbord.html";
      });
    }
  } else {
    notandaNafn.textContent = "Gestur (ekki skráð/ur inn)";
    utskraBtn.hidden = true;
  }

  hladaVerkefnaListi();
});

utskraBtn.addEventListener("click", () => skraUt());

function synaSvaedi(svaedi) {
  verkefnaSvaedi.hidden = svaedi !== "verkefni";
  glaeruSvaedi.hidden = svaedi !== "glaerur";
  spurningaSvaedi.hidden = svaedi !== "spurningar";
}

tilbakaFraGlaerum.addEventListener("click", () => synaSvaedi("verkefni"));
tilbakaFraSpurningum.addEventListener("click", () => synaSvaedi("verkefni"));

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

  const lysing = document.createElement("p");
  lysing.className = "verkefni-lysing";
  lysing.textContent = `${fjoldiGlaera} ${fjoldiGlaera === 1 ? "glæra" : "glærur"} · ${spurningaIds.length} spurningar`;
  kort.appendChild(lysing);

  if (notandi && spurningaIds.length > 0) {
    kort.appendChild(byggjaFramvindukort(spurningaIds, svaradIds));
  }

  const hnappur = document.createElement("button");
  hnappur.type = "button";
  hnappur.className = "aðal-hnappur";
  hnappur.textContent = "Skoða glærur";
  hnappur.addEventListener("click", () => opnaVerkefni(vDoc.id, verkefni));
  kort.appendChild(hnappur);

  return kort;
}

function byggjaHradaspurningarKort(vDoc, verkefni, spurningaIds, svaradIds) {
  const kort = document.createElement("article");
  kort.className = "hradaspurning-kort";

  const titill = document.createElement("h3");
  titill.textContent = verkefni.title;
  kort.appendChild(titill);

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
  hnappur.addEventListener("click", () => opnaVerkefni(vDoc.id, verkefni));
  kort.appendChild(hnappur);

  return kort;
}

async function hladaVerkefnaListi() {
  verkefnaListi.innerHTML = skeletonKort(3);
  hradaspurningarSvaedi.hidden = true;

  const snap = await getDocs(query(collection(db, "verkefni"), where("active", "==", true)));

  if (snap.empty) {
    verkefnaListi.innerHTML = "<p>Engin verkefni eru virk eins og er.</p>";
    return;
  }

  // Ein fyrirspurn fyrir allar virkar spurningar, flokkuð eftir verkefni í JS -
  // mun ódýrara en að spyrja Firestore einu sinni fyrir hvert verkefni.
  const spurningarSnap = await getDocs(query(collection(db, "questions"), where("active", "==", true)));
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
  spurningaBunkastaerd = erProfVerkefni(verkefni) ? SPURNINGAR_A_SIDU_PROF : SPURNINGAR_A_SIDU_VENJULEGT;
  pptxIframe = null;

  if (erProfVerkefni(verkefni)) {
    // Ekkert alvöru glæruefni til að skoða - farið beint í spurningarnar.
    spurningaTitill.textContent = verkefni.title;
    synaSvaedi("spurningar");
    hladaSpurningum();
    hladaMinumStodum();
    return;
  }

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

afromISpurningar.addEventListener("click", () => {
  spurningaTitill.textContent = verkefnaTitill.textContent;
  synaSvaedi("spurningar");
  hladaSpurningum();
  hladaMinumStodum();
});

async function hladaSpurningum() {
  spurningaListi.innerHTML = skeletonKort(5, 1);
  siduflettingarEfri.hidden = true;
  siduflettingar.hidden = true;

  const spurningarSnap = await getDocs(
    query(
      collection(db, "questions"),
      where("verkefniId", "==", valdVerkefniId),
      where("active", "==", true)
    )
  );

  svaradIdSett = notandi
    ? new Set((await getDocs(collection(db, "users", notandi.uid, "attempts"))).docs.map((d) => d.id))
    : new Set();

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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    svaraSpurningu(questionId, innslattur.value, korti, form, nidurstada);
  });

  sleppaBtn.addEventListener("click", () => {
    svaraSpurningu(questionId, SLEPPT_MERKI, korti, form, nidurstada);
  });

  if (buidSvarad) {
    synaNidurstodu(questionId, korti, nidurstada);
  }

  return korti;
}

async function svaraSpurningu(questionId, hraSvar, korti, form, nidurstada) {
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
  await synaNidurstodu(questionId, korti, nidurstada, svar);
  hladaMinumStodum();
}

async function synaNidurstodu(questionId, korti, nidurstada, gefidSvar) {
  let mittSvar = gefidSvar;
  if (mittSvar === undefined) {
    const attemptSnap = await getDoc(doc(db, "users", notandi.uid, "attempts", questionId));
    mittSvar = attemptSnap.data()?.svar;
  }

  if (mittSvar === SLEPPT_MERKI) {
    nidurstada.textContent = "Pass ⏭";
    nidurstada.classList.add("sleppt");
    return;
  }

  const svarSnap = await getDoc(doc(db, "answers", questionId));
  if (!svarSnap.exists()) return;

  const rettSvor = svarSnap.data().correctAnswers || [];

  if (rettSvor.includes(mittSvar)) {
    nidurstada.textContent = "Rétt svar! 🎉";
    nidurstada.classList.add("rett");
  } else {
    nidurstada.textContent = `Rangt svar. Rétt svar: ${rettSvor[0] ?? "—"}`;
    nidurstada.classList.add("rangt");
  }
}

async function hladaMinumStodum() {
  if (!notandi) {
    stodurNiðurstada.textContent = "";
    return;
  }

  const spurningarSnap = await getDocs(
    query(collection(db, "questions"), where("verkefniId", "==", valdVerkefniId))
  );
  const spurningaIds = new Set(spurningarSnap.docs.map((d) => d.id));

  const attemptsSnap = await getDocs(collection(db, "users", notandi.uid, "attempts"));
  const minarTilraunir = attemptsSnap.docs.filter((a) => spurningaIds.has(a.id));

  let fjoldiRett = 0;
  let fjoldiSleppt = 0;
  for (const attemptDoc of minarTilraunir) {
    const svar = attemptDoc.data().svar;
    if (svar === SLEPPT_MERKI) {
      fjoldiSleppt++;
      continue;
    }
    const svarSnap = await getDoc(doc(db, "answers", attemptDoc.id));
    const rettSvor = svarSnap.exists() ? svarSnap.data().correctAnswers || [] : [];
    if (rettSvor.includes(svar)) fjoldiRett++;
  }

  const fjoldiSvarad = minarTilraunir.length;
  const fjoldiMetin = fjoldiSvarad - fjoldiSleppt;
  const nakvaemni = fjoldiMetin ? Math.round((fjoldiRett / fjoldiMetin) * 100) : 0;
  const sleppTexti = fjoldiSleppt ? `, ${fjoldiSleppt} pass` : "";
  stodurNiðurstada.textContent =
    `Þú hefur svarað ${fjoldiSvarad} spurningum í þessu verkefni${sleppTexti}, ${fjoldiRett} réttum (${nakvaemni}% nákvæmni).`;
}
