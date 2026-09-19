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

const glaeruSvaedi = document.getElementById("glaeruSvaedi");
const verkefnaTitill = document.getElementById("verkefnaTitill");
const glaerurInnihald = document.getElementById("glaerurInnihald");
const afromISpurningar = document.getElementById("afromISpurningar");
const tilbakaFraGlaerum = document.getElementById("tilbakaFraGlaerum");

const spurningaSvaedi = document.getElementById("spurningaSvaedi");
const spurningaListi = document.getElementById("spurningaListi");
const stodurNiðurstada = document.getElementById("stodurNiðurstada");
const tilbakaFraSpurningum = document.getElementById("tilbakaFraSpurningum");

let notandi = null;
let valdVerkefniId = null;

function samraema(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

vaktaInnskraningu({ requireAuth: true }, (user, gogn) => {
  notandi = user;
  notandaNafn.textContent = gogn.nafn || user.email;

  if (gogn.role === "admin") {
    notandaNafn.classList.add("nafn-stjornbord");
    notandaNafn.title = "Fara í stjórnborðið";
    notandaNafn.addEventListener("click", () => {
      window.location.href = "stjornbord.html";
    });
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

async function hladaVerkefnaListi() {
  verkefnaListi.innerHTML = "<p>Sæki verkefni…</p>";

  const snap = await getDocs(query(collection(db, "verkefni"), where("active", "==", true)));

  if (snap.empty) {
    verkefnaListi.innerHTML = "<p>Engin verkefni eru virk eins og er.</p>";
    return;
  }

  verkefnaListi.innerHTML = "";
  snap.forEach((vDoc) => {
    const verkefni = vDoc.data();
    const kort = document.createElement("article");
    kort.className = "spurning-kort verkefni-kort";

    const titill = document.createElement("h3");
    titill.textContent = verkefni.title;
    kort.appendChild(titill);

    const lysing = document.createElement("p");
    lysing.className = "verkefni-lysing";
    lysing.textContent = `${(verkefni.slides || []).length} glærur`;
    kort.appendChild(lysing);

    const hnappur = document.createElement("button");
    hnappur.type = "button";
    hnappur.className = "aðal-hnappur";
    hnappur.textContent = "Skoða glærur";
    hnappur.addEventListener("click", () => opnaVerkefni(vDoc.id, verkefni));
    kort.appendChild(hnappur);

    verkefnaListi.appendChild(kort);
  });
}

function opnaVerkefni(verkefniId, verkefni) {
  valdVerkefniId = verkefniId;
  verkefnaTitill.textContent = verkefni.title;
  glaerurInnihald.innerHTML = "";

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

  synaSvaedi("glaerur");
}

afromISpurningar.addEventListener("click", () => {
  synaSvaedi("spurningar");
  hladaSpurningum();
  hladaMinumStodum();
});

async function hladaSpurningum() {
  spurningaListi.innerHTML = "<p>Sæki spurningar…</p>";

  const spurningarSnap = await getDocs(
    query(
      collection(db, "questions"),
      where("verkefniId", "==", valdVerkefniId),
      where("active", "==", true)
    )
  );

  const svaradSnap = await getDocs(collection(db, "users", notandi.uid, "attempts"));
  const svaradIds = new Set(svaradSnap.docs.map((d) => d.id));

  spurningaListi.innerHTML = "";

  if (spurningarSnap.empty) {
    spurningaListi.innerHTML = "<p>Engar virkar spurningar í þessu verkefni eins og er.</p>";
    return;
  }

  const spurningaskjol = spurningarSnap.docs.slice().sort((a, b) => {
    const ta = a.data().createdAt?.toMillis?.() ?? 0;
    const tb = b.data().createdAt?.toMillis?.() ?? 0;
    return ta - tb;
  });

  spurningaskjol.forEach((qDoc) => {
    const spurning = qDoc.data();
    const korti = byggjaSpurningaKort(qDoc.id, spurning, svaradIds.has(qDoc.id));
    spurningaListi.appendChild(korti);
  });
}

function byggjaSpurningaKort(questionId, spurning, buidSvarad) {
  const korti = document.createElement("article");
  korti.className = "spurning-kort" + (buidSvarad ? " svarad" : "");

  const titill = document.createElement("h3");
  titill.textContent = spurning.text;
  korti.appendChild(titill);

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

  form.appendChild(innslattur);
  form.appendChild(sendaBtn);
  korti.appendChild(form);

  const nidurstada = document.createElement("p");
  nidurstada.className = "spurning-nidurstada";
  korti.appendChild(nidurstada);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    svaraSpurningu(questionId, innslattur.value, korti, form, nidurstada);
  });

  if (buidSvarad) {
    synaNidurstodu(questionId, korti, nidurstada);
  }

  return korti;
}

async function svaraSpurningu(questionId, hraSvar, korti, form, nidurstada) {
  const svar = samraema(hraSvar);
  if (!svar) return;

  form.querySelector("input").disabled = true;
  form.querySelector("button").disabled = true;

  try {
    await setDoc(doc(db, "users", notandi.uid, "attempts", questionId), {
      svar,
      answeredAt: serverTimestamp()
    });
  } catch (villa) {
    console.error(villa);
    alert("Tókst ekki að skrá svarið. Reyndu aftur.");
    form.querySelector("input").disabled = false;
    form.querySelector("button").disabled = false;
    return;
  }

  korti.classList.add("svarad");
  await synaNidurstodu(questionId, korti, nidurstada, svar);
  hladaMinumStodum();
}

async function synaNidurstodu(questionId, korti, nidurstada, gefidSvar) {
  const svarSnap = await getDoc(doc(db, "answers", questionId));
  if (!svarSnap.exists()) return;

  const rettSvor = svarSnap.data().correctAnswers || [];

  let mittSvar = gefidSvar;
  if (mittSvar === undefined) {
    const attemptSnap = await getDoc(doc(db, "users", notandi.uid, "attempts", questionId));
    mittSvar = attemptSnap.data()?.svar;
  }

  if (rettSvor.includes(mittSvar)) {
    nidurstada.textContent = "Rétt svar! 🎉";
    nidurstada.classList.add("rett");
  } else {
    nidurstada.textContent = `Rangt svar. Rétt svar: ${rettSvor[0] ?? "—"}`;
    nidurstada.classList.add("rangt");
  }
}

async function hladaMinumStodum() {
  const spurningarSnap = await getDocs(
    query(collection(db, "questions"), where("verkefniId", "==", valdVerkefniId))
  );
  const spurningaIds = new Set(spurningarSnap.docs.map((d) => d.id));

  const attemptsSnap = await getDocs(collection(db, "users", notandi.uid, "attempts"));
  const minarTilraunir = attemptsSnap.docs.filter((a) => spurningaIds.has(a.id));

  let fjoldiRett = 0;
  for (const attemptDoc of minarTilraunir) {
    const svarSnap = await getDoc(doc(db, "answers", attemptDoc.id));
    const rettSvor = svarSnap.exists() ? svarSnap.data().correctAnswers || [] : [];
    if (rettSvor.includes(attemptDoc.data().svar)) fjoldiRett++;
  }

  const fjoldiSvarad = minarTilraunir.length;
  const nakvaemni = fjoldiSvarad ? Math.round((fjoldiRett / fjoldiSvarad) * 100) : 0;
  stodurNiðurstada.textContent = `Þú hefur svarað ${fjoldiSvarad} spurningum í þessu verkefni, ${fjoldiRett} réttum (${nakvaemni}% nákvæmni).`;
}
