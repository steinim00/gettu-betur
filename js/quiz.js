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

const spurningaListi = document.getElementById("spurningaListi");
const notandaNafn = document.getElementById("notandaNafn");
const utskraBtn = document.getElementById("utskraBtn");
const stodurNiðurstada = document.getElementById("stodurNiðurstada");

let notandi = null;

vaktaInnskraningu({ requireAuth: true }, (user, gogn) => {
  notandi = user;
  notandaNafn.textContent = gogn.nafn || user.email;
  hladaSpurningum();
  hladaMinumStodum();
});

utskraBtn.addEventListener("click", () => skraUt());

async function hladaSpurningum() {
  spurningaListi.innerHTML = "<p>Sæki spurningar…</p>";

  const spurningarSnap = await getDocs(
    query(collection(db, "questions"), where("active", "==", true))
  );

  const svaradSnap = await getDocs(collection(db, "users", notandi.uid, "attempts"));
  const svaradIds = new Set(svaradSnap.docs.map((d) => d.id));

  spurningaListi.innerHTML = "";

  if (spurningarSnap.empty) {
    spurningaListi.innerHTML = "<p>Engar virkar spurningar eins og er.</p>";
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

  const valListi = document.createElement("div");
  valListi.className = "val-listi";

  spurning.choices.forEach((val, index) => {
    const hnappur = document.createElement("button");
    hnappur.type = "button";
    hnappur.className = "val-hnappur";
    hnappur.textContent = val;
    hnappur.disabled = buidSvarad;
    hnappur.addEventListener("click", () => svaraSpurningu(questionId, index, korti, valListi));
    valListi.appendChild(hnappur);
  });

  korti.appendChild(valListi);

  const nidurstada = document.createElement("p");
  nidurstada.className = "spurning-nidurstada";
  korti.appendChild(nidurstada);

  if (buidSvarad) {
    synaNidurstodu(questionId, korti, valListi, nidurstada);
  }

  return korti;
}

async function svaraSpurningu(questionId, valIndex, korti, valListi) {
  [...valListi.children].forEach((b) => (b.disabled = true));

  try {
    await setDoc(doc(db, "users", notandi.uid, "attempts", questionId), {
      selectedIndex: valIndex,
      answeredAt: serverTimestamp()
    });
  } catch (villa) {
    console.error(villa);
    alert("Tókst ekki að skrá svarið. Reyndu aftur.");
    [...valListi.children].forEach((b) => (b.disabled = false));
    return;
  }

  korti.classList.add("svarad");
  const nidurstada = korti.querySelector(".spurning-nidurstada");
  await synaNidurstodu(questionId, korti, valListi, nidurstada, valIndex);
  hladaMinumStodum();
}

async function synaNidurstodu(questionId, korti, valListi, nidurstada, valdIndex) {
  const svarSnap = await getDoc(doc(db, "answers", questionId));
  if (!svarSnap.exists()) return;

  const rettIndex = svarSnap.data().correctIndex;
  const hnappar = [...valListi.children];
  hnappar[rettIndex]?.classList.add("rett-svar");

  if (valdIndex === undefined) {
    const attemptSnap = await getDoc(doc(db, "users", notandi.uid, "attempts", questionId));
    valdIndex = attemptSnap.data()?.selectedIndex;
  }

  if (valdIndex === rettIndex) {
    nidurstada.textContent = "Rétt svar! 🎉";
    nidurstada.classList.add("rett");
  } else {
    hnappar[valdIndex]?.classList.add("rangt-svar");
    nidurstada.textContent = "Rangt svar.";
    nidurstada.classList.add("rangt");
  }
}

async function hladaMinumStodum() {
  const attemptsSnap = await getDocs(collection(db, "users", notandi.uid, "attempts"));
  let fjoldiSvarad = attemptsSnap.size;
  let fjoldiRett = 0;

  for (const attemptDoc of attemptsSnap.docs) {
    const svarSnap = await getDoc(doc(db, "answers", attemptDoc.id));
    if (svarSnap.exists() && svarSnap.data().correctIndex === attemptDoc.data().selectedIndex) {
      fjoldiRett++;
    }
  }

  const nakvaemni = fjoldiSvarad ? Math.round((fjoldiRett / fjoldiSvarad) * 100) : 0;
  stodurNiðurstada.textContent = `Þú hefur svarað ${fjoldiSvarad} spurningum, ${fjoldiRett} réttum (${nakvaemni}% nákvæmni).`;
}
