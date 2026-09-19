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
const verkefnaTafla = document.getElementById("verkefnaTafla").querySelector("tbody");
const spurningaTafla = document.getElementById("spurningaTafla").querySelector("tbody");
const nySpurningForm = document.getElementById("nySpurningForm");
const verkefniValiö = document.getElementById("verkefniValiö");
const endurhladaBtn = document.getElementById("endurhladaBtn");
const innflutningsSkra = document.getElementById("innflutningsSkra");
const verkefnaTitillInnsl = document.getElementById("verkefnaTitillInnsl");
const vinnaUrSkraBtn = document.getElementById("vinnaUrSkraBtn");
const innflutningsStada = document.getElementById("innflutningsStada");
const drafListi = document.getElementById("drafListi");
const vistaValdarBtn = document.getElementById("vistaValdarBtn");

let sidustuBlokkir = [];

vaktaInnskraningu({ requireAuth: true, requireAdmin: true }, (user, gogn) => {
  notandaNafn.textContent = gogn.nafn || user.email;
  hladaAllt();
  setInterval(hladaAllt, 30000);
});

utskraBtn.addEventListener("click", () => skraUt());
endurhladaBtn.addEventListener("click", hladaAllt);

async function hladaAllt() {
  await Promise.all([hladaNotendayfirlit(), hladaVerkefnayfirlit(), hladaSpurningayfirlit()]);
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

async function hladaVerkefnayfirlit() {
  const [verkefnaSnap, spurningarSnap] = await Promise.all([
    getDocs(collection(db, "verkefni")),
    getDocs(collection(db, "questions"))
  ]);

  const fjoldiSpurningaPerVerkefni = new Map();
  spurningarSnap.forEach((qDoc) => {
    const id = qDoc.data().verkefniId;
    if (!id) return;
    fjoldiSpurningaPerVerkefni.set(id, (fjoldiSpurningaPerVerkefni.get(id) || 0) + 1);
  });

  hladaVerkefniSelect(verkefnaSnap);

  verkefnaTafla.innerHTML = "";
  if (verkefnaSnap.empty) {
    verkefnaTafla.innerHTML = `<tr><td colspan="5">Engin verkefni ennþá.</td></tr>`;
    return;
  }

  verkefnaSnap.forEach((vDoc) => {
    const verkefni = vDoc.data();
    const tr = document.createElement("tr");

    const kveikjaKnappur = document.createElement("button");
    kveikjaKnappur.type = "button";
    kveikjaKnappur.className = "smabtn";
    kveikjaKnappur.textContent = verkefni.active ? "Slökkva" : "Kveikja";
    kveikjaKnappur.addEventListener("click", async () => {
      await updateDoc(doc(db, "verkefni", vDoc.id), { active: !verkefni.active });
      hladaVerkefnayfirlit();
    });

    const titillTd = document.createElement("td");
    titillTd.textContent = verkefni.title;

    const glaeruTd = document.createElement("td");
    glaeruTd.textContent = (verkefni.slides || []).length;

    const spurningaTd = document.createElement("td");
    spurningaTd.textContent = fjoldiSpurningaPerVerkefni.get(vDoc.id) || 0;

    const stodaTd = document.createElement("td");
    stodaTd.textContent = verkefni.active ? "Virkt" : "Óvirkt";

    const adgerdTd = document.createElement("td");
    adgerdTd.appendChild(kveikjaKnappur);

    tr.appendChild(titillTd);
    tr.appendChild(glaeruTd);
    tr.appendChild(spurningaTd);
    tr.appendChild(stodaTd);
    tr.appendChild(adgerdTd);
    verkefnaTafla.appendChild(tr);
  });
}

function hladaVerkefniSelect(verkefnaSnap) {
  const valid = verkefniValiö.value;
  verkefniValiö.innerHTML = '<option value="">Ekkert verkefni (almenn spurning)</option>';
  verkefnaSnap.forEach((vDoc) => {
    const opt = document.createElement("option");
    opt.value = vDoc.id;
    opt.textContent = vDoc.data().title;
    verkefniValiö.appendChild(opt);
  });
  if ([...verkefniValiö.options].some((o) => o.value === valid)) {
    verkefniValiö.value = valid;
  }
}

async function hladaSpurningayfirlit() {
  const [spurningarSnap, svorSnap, verkefnaSnap] = await Promise.all([
    getDocs(collection(db, "questions")),
    getDocs(collection(db, "answers")),
    getDocs(collection(db, "verkefni"))
  ]);
  const rettSvor = new Map(svorSnap.docs.map((d) => [d.id, d.data().correctAnswers || []]));
  const verkefnaTitlar = new Map(verkefnaSnap.docs.map((d) => [d.id, d.data().title]));

  spurningaTafla.innerHTML = "";
  if (spurningarSnap.empty) {
    spurningaTafla.innerHTML = `<tr><td colspan="5">Engar spurningar ennþá.</td></tr>`;
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

    const verkefniTd = document.createElement("td");
    verkefniTd.textContent = verkefnaTitlar.get(spurning.verkefniId) || "—";

    const stodaTd = document.createElement("td");
    stodaTd.textContent = spurning.active ? "Virk" : "Óvirk";

    const adgerdTd = document.createElement("td");
    adgerdTd.appendChild(kveikjaKnappur);

    tr.appendChild(textTd);
    tr.appendChild(svarTd);
    tr.appendChild(verkefniTd);
    tr.appendChild(stodaTd);
    tr.appendChild(adgerdTd);
    spurningaTafla.appendChild(tr);
  });
}

function samraema(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

// entries: [{ text, correctAnswers: string[], verkefniId? }]. Skrifar questions+answers
// í Firestore, hólfað niður í bútum af 480 aðgerðum (Firestore hámark er 500 í einum batch).
async function vistaSpurningar(entries, { active }) {
  let batch = writeBatch(db);
  let fjoldiIBatch = 0;

  for (const entry of entries) {
    const questionRef = doc(collection(db, "questions"));
    batch.set(questionRef, {
      text: entry.text,
      verkefniId: entry.verkefniId || "",
      active,
      createdAt: serverTimestamp()
    });
    batch.set(doc(db, "answers", questionRef.id), { correctAnswers: entry.correctAnswers });
    fjoldiIBatch += 2;

    if (fjoldiIBatch >= 480) {
      await batch.commit();
      batch = writeBatch(db);
      fjoldiIBatch = 0;
    }
  }

  if (fjoldiIBatch > 0) await batch.commit();
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
  const verkefniId = gogn.get("verkefniValiö") || "";

  if (!text || !rettSvar) {
    alert("Skráðu spurningatexta og rétt svar.");
    return;
  }

  await vistaSpurningar(
    [{ text, correctAnswers: [...new Set([rettSvar, ...onnurSvor])], verkefniId }],
    { active: true }
  );

  nySpurningForm.reset();
  hladaAllt();
});

// --- Innflutningur úr .pptx/.docx beint í vafranum ---

function afkodaXmlStafi(str) {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

async function pptxIBlokkir(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slideSkrar = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => Number(a.match(/slide(\d+)\.xml/)[1]) - Number(b.match(/slide(\d+)\.xml/)[1]));

  const blokkir = [];
  for (const nafn of slideSkrar) {
    const xml = await zip.files[nafn].async("string");
    const malsgreinar = xml.match(/<a:p>.*?<\/a:p>/gs) || [];
    const linur = malsgreinar
      .map((mg) => {
        const textar = mg.match(/<a:t>(.*?)<\/a:t>/gs) || [];
        return textar.map((t) => afkodaXmlStafi(t.replace(/<\/?a:t>/g, ""))).join("");
      })
      .filter((l) => l.trim().length > 0);
    if (linur.length > 0) blokkir.push(linur);
  }
  return blokkir;
}

async function docxIBlokkir(arrayBuffer) {
  const { value: text } = await mammoth.extractRawText({ arrayBuffer });
  const linur = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const blokkir = [];
  let nuverandi = null;
  for (const lina of linur) {
    const erNyBlokk = /^spurning\b/i.test(lina) || /^\d+[\.\)]\s+/.test(lina);
    if (erNyBlokk) {
      if (nuverandi) blokkir.push(nuverandi);
      nuverandi = [lina];
    } else if (nuverandi) {
      nuverandi.push(lina);
    }
  }
  if (nuverandi) blokkir.push(nuverandi);
  return blokkir.length > 0 ? blokkir : [linur];
}

// Sömu þumalputtareglur og scripts/build-questions.js - leitar að "Spurning:" og "Svar:" línum.
function greinaBlokk(linur) {
  const spurningLina =
    linur.find((l) => /^spurning\b\s*[:\-]?\s*/i.test(l)) ||
    linur.find((l) => l.trim().endsWith("?")) ||
    linur[0] ||
    "";

  const text = spurningLina
    .replace(/^spurning\b\s*[:\-]?\s*/i, "")
    .replace(/^\d+[\.\)]\s*/, "")
    .trim();

  const svarLina = linur.find((l) => l !== spurningLina && /^svar\b\s*[:\-]?\s*/i.test(l));
  const svarTexti = svarLina ? svarLina.replace(/^svar\b\s*[:\-]?\s*/i, "").trim() : "";
  const correctAnswers = svarTexti ? svarTexti.split("/").map(samraema).filter(Boolean) : [];

  return { text, correctAnswers, needsReview: !text || correctAnswers.length === 0 };
}

vinnaUrSkraBtn.addEventListener("click", async () => {
  const file = innflutningsSkra.files[0];
  if (!file) {
    innflutningsStada.textContent = "Veldu skrá fyrst.";
    return;
  }

  innflutningsStada.textContent = "Vinn úr skrá…";
  drafListi.innerHTML = "";
  vistaValdarBtn.hidden = true;
  sidustuBlokkir = [];

  try {
    const buffer = await file.arrayBuffer();
    const endirer = file.name.toLowerCase();
    let blokkir;
    if (endirer.endsWith(".pptx")) {
      blokkir = await pptxIBlokkir(buffer);
    } else if (endirer.endsWith(".docx")) {
      blokkir = await docxIBlokkir(buffer);
    } else {
      innflutningsStada.textContent = "Aðeins .pptx og .docx eru studd.";
      return;
    }

    sidustuBlokkir = blokkir;
    const draftir = blokkir.map(greinaBlokk);
    renderDraftRows(draftir);

    const faerReview = draftir.filter((d) => d.needsReview).length;
    innflutningsStada.textContent =
      `Fann ${draftir.length} glæru(r)/blokkir, ${draftir.length - faerReview} mögulegar ` +
      `spurningar greindust sjálfkrafa (${faerReview} þurfa yfirferð eða á að sleppa). ` +
      `Efni allra glæra verður vistað sem verkefni óháð vali hér fyrir neðan.`;
    vistaValdarBtn.hidden = draftir.length === 0;
  } catch (villa) {
    console.error(villa);
    innflutningsStada.textContent = "Tókst ekki að vinna úr skránni: " + villa.message;
  }
});

function renderDraftRows(draftir) {
  drafListi.innerHTML = "";

  draftir.forEach((draft) => {
    const rad = document.createElement("div");
    rad.className = "draft-rad" + (draft.needsReview ? " tharf-yfirferd" : "");

    const gatlisti = document.createElement("input");
    gatlisti.type = "checkbox";
    gatlisti.checked = !draft.needsReview;

    const spurningInput = document.createElement("input");
    spurningInput.type = "text";
    spurningInput.value = draft.text;
    spurningInput.placeholder = "Spurning";

    const svarSvaedi = document.createElement("div");
    if (draft.needsReview) {
      const merki = document.createElement("span");
      merki.className = "draft-yfirferd-merki";
      merki.textContent = "Þarf yfirferð";
      svarSvaedi.appendChild(merki);
    }
    const svarInput = document.createElement("input");
    svarInput.type = "text";
    svarInput.value = draft.correctAnswers.join(" / ");
    svarInput.placeholder = "Rétt svar (má hafa fleiri afbrigði aðskilin með /)";
    svarSvaedi.appendChild(svarInput);

    rad.appendChild(gatlisti);
    rad.appendChild(spurningInput);
    rad.appendChild(svarSvaedi);

    rad._faSpurningu = () => ({
      tokinMed: gatlisti.checked,
      text: spurningInput.value.trim(),
      correctAnswers: [...new Set(svarInput.value.split("/").map(samraema).filter(Boolean))]
    });

    drafListi.appendChild(rad);
  });
}

vistaValdarBtn.addEventListener("click", async () => {
  const radir = [...drafListi.querySelectorAll(".draft-rad")].map((r) => r._faSpurningu());
  const valdar = radir.filter((r) => r.tokinMed && r.text && r.correctAnswers.length > 0);

  if (valdar.length === 0) {
    alert("Engar gildar spurningar valdar (þarf spurningatexta og minnst eitt rétt svar).");
    return;
  }

  vistaValdarBtn.disabled = true;
  try {
    const verkefnaTitill = verkefnaTitillInnsl.value.trim();
    let verkefniId = "";

    if (verkefnaTitill) {
      const verkefniRef = doc(collection(db, "verkefni"));
      const slides = sidustuBlokkir.map((linur) => ({
        title: linur[0],
        body: linur.slice(1).join(" ")
      }));
      await writeBatch(db)
        .set(verkefniRef, {
          title: verkefnaTitill,
          slides,
          active: false,
          createdAt: serverTimestamp()
        })
        .commit();
      verkefniId = verkefniRef.id;
    }

    await vistaSpurningar(
      valdar.map((v) => ({ ...v, verkefniId })),
      { active: false }
    );

    innflutningsStada.textContent = verkefniId
      ? `Vistaði verkefnið "${verkefnaTitill}" með ${valdar.length} spurningum (óvirkt - kveiktu á því hér fyrir ofan).`
      : `Vistaði ${valdar.length} spurningar (óvirkar - kveiktu á þeim hér fyrir ofan).`;
    drafListi.innerHTML = "";
    vistaValdarBtn.hidden = true;
    innflutningsSkra.value = "";
    verkefnaTitillInnsl.value = "";
    sidustuBlokkir = [];
    hladaAllt();
  } finally {
    vistaValdarBtn.disabled = false;
  }
});
