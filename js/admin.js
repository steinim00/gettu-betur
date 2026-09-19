import { db } from "./firebase-config.js";
import { vaktaInnskraningu, skraUt } from "./auth.js";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const notandaNafn = document.getElementById("notandaNafn");
const utskraBtn = document.getElementById("utskraBtn");
const notendaTafla = document.getElementById("notendaTafla").querySelector("tbody");
const spurningaTafla = document.getElementById("spurningaTafla").querySelector("tbody");
const nySpurningForm = document.getElementById("nySpurningForm");
const endurhladaBtn = document.getElementById("endurhladaBtn");

vaktaInnskraningu({ requireAuth: true, requireAdmin: true }, (user, gogn) => {
  notandaNafn.textContent = gogn.nafn || user.email;
  hladaAllt();
  setInterval(hladaAllt, 30000);
});

utskraBtn.addEventListener("click", () => skraUt());
endurhladaBtn.addEventListener("click", hladaAllt);

async function hladaAllt() {
  await Promise.all([hladaNotendayfirlit(), hladaSpurningayfirlit()]);
}

async function hladaNotendayfirlit() {
  notendaTafla.innerHTML = `<tr><td colspan="5">Sæki gögn…</td></tr>`;

  const [notendurSnap, svorSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "answers"))
  ]);

  const rettSvor = new Map(svorSnap.docs.map((d) => [d.id, d.data().correctAnswers || []]));

  const rows = [];
  for (const notandiDoc of notendurSnap.docs) {
    const notandi = notandiDoc.data();
    if (notandi.role === "admin") continue;

    const attemptsSnap = await getDocs(collection(db, "users", notandiDoc.id, "attempts"));
    let fjoldiRett = 0;
    let sidastSvarad = null;

    attemptsSnap.forEach((a) => {
      const gogn = a.data();
      if ((rettSvor.get(a.id) || []).includes(gogn.svar)) fjoldiRett++;
      const timi = gogn.answeredAt?.toMillis?.() ?? 0;
      if (!sidastSvarad || timi > sidastSvarad) sidastSvarad = timi;
    });

    const fjoldiSvarad = attemptsSnap.size;
    const nakvaemni = fjoldiSvarad ? Math.round((fjoldiRett / fjoldiSvarad) * 100) : 0;

    rows.push({
      nafn: notandi.nafn || notandi.email,
      email: notandi.email,
      fjoldiSvarad,
      fjoldiRett,
      nakvaemni,
      sidastSvarad
    });
  }

  rows.sort((a, b) => b.nakvaemni - a.nakvaemni || b.fjoldiSvarad - a.fjoldiSvarad);

  notendaTafla.innerHTML = "";
  if (rows.length === 0) {
    notendaTafla.innerHTML = `<tr><td colspan="5">Engir notendur skráðir ennþá.</td></tr>`;
    return;
  }

  for (const r of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.nafn}</td>
      <td>${r.fjoldiSvarad}</td>
      <td>${r.fjoldiRett}</td>
      <td>${r.nakvaemni}%</td>
      <td>${r.sidastSvarad ? new Date(r.sidastSvarad).toLocaleString("is-IS") : "—"}</td>
    `;
    notendaTafla.appendChild(tr);
  }
}

async function hladaSpurningayfirlit() {
  const [spurningarSnap, svorSnap] = await Promise.all([
    getDocs(collection(db, "questions")),
    getDocs(collection(db, "answers"))
  ]);
  const rettSvor = new Map(svorSnap.docs.map((d) => [d.id, d.data().correctAnswers || []]));

  spurningaTafla.innerHTML = "";
  if (spurningarSnap.empty) {
    spurningaTafla.innerHTML = `<tr><td colspan="4">Engar spurningar ennþá.</td></tr>`;
    return;
  }

  spurningarSnap.forEach((qDoc) => {
    const spurning = qDoc.data();
    const tr = document.createElement("tr");

    const kveikjaKnappur = document.createElement("button");
    kveikjaKnappur.type = "button";
    kveikjaKnappur.className = "smabtn";
    kveikjaKnappur.textContent = spurning.active ? "Slökkva" : "Kveikja";
    kveikjaKnappur.addEventListener("click", async () => {
      await updateDoc(doc(db, "questions", qDoc.id), { active: !spurning.active });
      hladaSpurningayfirlit();
    });

    const textTd = document.createElement("td");
    textTd.textContent = spurning.text;

    const svarTd = document.createElement("td");
    svarTd.textContent = (rettSvor.get(qDoc.id) || [])[0] ?? "—";

    const stodaTd = document.createElement("td");
    stodaTd.textContent = spurning.active ? "Virk" : "Óvirk";

    const adgerdTd = document.createElement("td");
    adgerdTd.appendChild(kveikjaKnappur);

    tr.appendChild(textTd);
    tr.appendChild(svarTd);
    tr.appendChild(stodaTd);
    tr.appendChild(adgerdTd);
    spurningaTafla.appendChild(tr);
  });
}

function samraema(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

nySpurningForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const gogn = new FormData(nySpurningForm);

  const text = gogn.get("text").trim();
  const rettSvar = samraema(gogn.get("rettSvar") || "");
  const onnurSvor = (gogn.get("onnurSvor") || "")
    .split(",")
    .map(samraema)
    .filter(Boolean);

  if (!text || !rettSvar) {
    alert("Skráðu spurningatexta og rétt svar.");
    return;
  }

  const correctAnswers = [...new Set([rettSvar, ...onnurSvor])];

  const questionRef = doc(collection(db, "questions"));
  const batch = writeBatch(db);
  batch.set(questionRef, {
    text,
    active: true,
    createdAt: serverTimestamp()
  });
  batch.set(doc(db, "answers", questionRef.id), { correctAnswers });
  await batch.commit();

  nySpurningForm.reset();
  hladaSpurningayfirlit();
});
