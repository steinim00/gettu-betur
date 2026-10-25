import { db } from "./firebase-config.js";
import { vaktaInnskraningu, skraUt } from "./auth.js";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  documentId,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteField,
  increment,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const notandaNafn = document.getElementById("notandaNafn");
const yfirlitVerkefni = document.getElementById("yfirlitVerkefni");
const yfirlitSpurningar = document.getElementById("yfirlitSpurningar");
const yfirlitVirkar = document.getElementById("yfirlitVirkar");
const yfirlitNotendur = document.getElementById("yfirlitNotendur");
const utskraBtn = document.getElementById("utskraBtn");
const notendaTafla = document.getElementById("notendaTafla").querySelector("tbody");
const verkefnaTafla = document.getElementById("verkefnaTafla").querySelector("tbody");
const spurningaFlokkar = document.getElementById("spurningaFlokkar");
const nySpurningForm = document.getElementById("nySpurningForm");
const verkefniValiö = document.getElementById("verkefniValiö");
const endurhladaBtn = document.getElementById("endurhladaBtn");
const innflutningsSkra = document.getElementById("innflutningsSkra");
const verkefnaTitillInnsl = document.getElementById("verkefnaTitillInnsl");
const vinnaUrSkraBtn = document.getElementById("vinnaUrSkraBtn");
const innflutningsStada = document.getElementById("innflutningsStada");
const drafListi = document.getElementById("drafListi");
const vistaValdarBtn = document.getElementById("vistaValdarBtn");
const drafGatlistaHnappar = document.getElementById("drafGatlistaHnappar");
const veljaAllarBtn = document.getElementById("veljaAllarBtn");
const afveljaAllarBtn = document.getElementById("afveljaAllarBtn");
const githubTeiknInnsl = document.getElementById("githubTeiknInnsl");
const vistaTeiknBtn = document.getElementById("vistaTeiknBtn");
const teiknStada = document.getElementById("teiknStada");
const nyttVerkefniForm = document.getElementById("nyttVerkefniForm");
const anthropicTeiknInnsl = document.getElementById("anthropicTeiknInnsl");
const vistaAnthropicTeiknBtn = document.getElementById("vistaAnthropicTeiknBtn");
const anthropicTeiknStada = document.getElementById("anthropicTeiknStada");
const aiVerkefniValiö = document.getElementById("aiVerkefniValiö");
const aiFjoldiInnsl = document.getElementById("aiFjoldiInnsl");
const generaSpurningarBtn = document.getElementById("generaSpurningarBtn");
const generaStada = document.getElementById("generaStada");
const aiDrafListi = document.getElementById("aiDrafListi");
const aiGatlistaHnappar = document.getElementById("aiGatlistaHnappar");
const aiVeljaAllarBtn = document.getElementById("aiVeljaAllarBtn");
const aiAfveljaAllarBtn = document.getElementById("aiAfveljaAllarBtn");
const aiVistaValdarBtn = document.getElementById("aiVistaValdarBtn");

const lidsmannaTafla = document.getElementById("lidsmannaTafla").querySelector("tbody");
const nyttLidsmadurInnsl = document.getElementById("nyttLidsmadurInnsl");
const bataLidsmadurBtn = document.getElementById("bataLidsmadurBtn");
const aefingDagsetning = document.getElementById("aefingDagsetning");
const maettirGatlisti = document.getElementById("maettirGatlisti");
const aefingSpurningaLeit = document.getElementById("aefingSpurningaLeit");
const aefingLeitarNidurstodur = document.getElementById("aefingLeitarNidurstodur");
const aefingValdarSpurningar = document.getElementById("aefingValdarSpurningar");
const vistaAefinguBtn = document.getElementById("vistaAefinguBtn");
const aefingStada = document.getElementById("aefingStada");
const aefingaTafla = document.getElementById("aefingaTafla").querySelector("tbody");

const embaettismadurForm = document.getElementById("embaettismadurForm");
const embNafn = document.getElementById("embNafn");
const embEmbaetti = document.getElementById("embEmbaetti");
const embMyndSlod = document.getElementById("embMyndSlod");
const embLogoSlod = document.getElementById("embLogoSlod");
const embStada = document.getElementById("embStada");
const embaettismannaTafla = document.getElementById("embaettismannaTafla").querySelector("tbody");

const bokForm = document.getElementById("bokForm");
const bokHofundur = document.getElementById("bokHofundur");
const bokTitill = document.getElementById("bokTitill");
const bokKapaSlod = document.getElementById("bokKapaSlod");
const bokStada = document.getElementById("bokStada");
const bokalistaTafla = document.getElementById("bokalistaTafla").querySelector("tbody");

const notendaValPanell = document.getElementById("notendaValPanell");
const notendaValTitill = document.getElementById("notendaValTitill");
const notendaValGatlisti = document.getElementById("notendaValGatlisti");
const vistaNotendaValBtn = document.getElementById("vistaNotendaValBtn");
const kveikjaAllarCheckbox = document.getElementById("kveikjaAllarCheckbox");
const hættaVidNotendaValBtn = document.getElementById("hættaVidNotendaValBtn");

// Breyttu þessu ef repoið er einhvern tímann flutt/endurnefnt.
const GITHUB_REPO = "steinim00/gettu-betur";
const GITHUB_TEIKN_LYKILL = "gettubetur_github_token";
const ANTHROPIC_TEIKN_LYKILL = "gettubetur_anthropic_key";
const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

let sidustuBlokkir = [];
let sidastaSkra = null;
const opnirSpurningaflokkar = new Set();

githubTeiknInnsl.value = localStorage.getItem(GITHUB_TEIKN_LYKILL) || "";
anthropicTeiknInnsl.value = localStorage.getItem(ANTHROPIC_TEIKN_LYKILL) || "";

vistaTeiknBtn.addEventListener("click", () => {
  const teikn = githubTeiknInnsl.value.trim();
  if (teikn) {
    localStorage.setItem(GITHUB_TEIKN_LYKILL, teikn);
    teiknStada.textContent = "Teikn vistað í þessum vafra.";
  } else {
    localStorage.removeItem(GITHUB_TEIKN_LYKILL);
    teiknStada.textContent = "Teikn fjarlægt.";
  }
});

vistaAnthropicTeiknBtn.addEventListener("click", () => {
  const teikn = anthropicTeiknInnsl.value.trim();
  if (teikn) {
    localStorage.setItem(ANTHROPIC_TEIKN_LYKILL, teikn);
    anthropicTeiknStada.textContent = "Lykill vistaður í þessum vafra.";
  } else {
    localStorage.removeItem(ANTHROPIC_TEIKN_LYKILL);
    anthropicTeiknStada.textContent = "Lykill fjarlægður.";
  }
});

vaktaInnskraningu({ requireAuth: true, requireAdmin: true }, (user, gogn) => {
  notandaNafn.textContent = gogn.nafn || user.email;
  hladaAllt();

  // Endurhleður allt á 5 mín fresti í stað 30 sek - stjórnborðið gerir fulla
  // yfirferð á öllum spurningum/svörum/notendum í hvert sinn, svo tíðari
  // sjálfvirk endurhleðsla getur klárað daglegan lestrarkvóta Firestore
  // (Spark-áætlun) á örfáum mínútum eftir því sem spurningabankinn stækkar.
  // Sleppir líka endurhleðslu alveg á meðan flipinn er ekki í fókus.
  setInterval(() => {
    if (document.visibilityState === "visible") hladaAllt();
  }, 300000);
});

utskraBtn.addEventListener("click", () => skraUt());
endurhladaBtn.addEventListener("click", hladaAllt);

async function hladaAllt() {
  await Promise.all([
    hladaNotendayfirlit(),
    hladaVerkefnayfirlit(),
    hladaSpurningayfirlit(),
    hladaGraenadeildarAefingar(),
    hladaSerflokkar()
  ]);
}

let graenadeildarVerkefniId = "";
let graenadeildarSpurningar = [];
let lidsmenn = [];
let valdarAefingSpurningar = [];

async function hladaGraenadeildarAefingar() {
  await finnaGraenadeildarVerkefni();
  await hladaLidsmenn();
  await hladaAefingasogu();
}

// Grænadeildar-verkefnið (spurningabankinn, birtur sem "Hraðaspurningar" í
// leiknum) er stofnað handvirkt (sjá scripts/upload-questions.js) og titillinn
// getur verið ólíkur milli keyrslna - því er leitað að undirstreng frekar en
// að treysta á fast Firestore-ID. Passar bæði gamla og nýja titilinn.
async function finnaGraenadeildarVerkefni() {
  if (graenadeildarVerkefniId && graenadeildarSpurningar.length > 0) return;

  const verkefnaSnap = await getDocs(collection(db, "verkefni"));
  const fundid = verkefnaSnap.docs.find((d) => {
    const titill = (d.data().title || "").toLowerCase();
    return titill.includes("grænadeildin") || titill.includes("hraðaspurningar");
  });

  if (!fundid) {
    graenadeildarVerkefniId = "";
    graenadeildarSpurningar = [];
    return;
  }

  graenadeildarVerkefniId = fundid.id;

  const spurningarSnap = await getDocs(
    query(collection(db, "questions"), where("verkefniId", "==", graenadeildarVerkefniId))
  );
  graenadeildarSpurningar = spurningarSnap.docs.map((d) => ({ id: d.id, text: d.data().text }));
}

async function hladaLidsmenn() {
  const snap = await getDocs(collection(db, "graenadeildinLidsmenn"));
  lidsmenn = snap.docs
    .map((d) => ({ id: d.id, nafn: d.data().nafn }))
    .sort((a, b) => a.nafn.localeCompare(b.nafn, "is"));

  renderLidsmannaTafla();
  renderMaettirGatlisti();
}

function renderLidsmannaTafla() {
  lidsmannaTafla.innerHTML = "";
  if (lidsmenn.length === 0) {
    lidsmannaTafla.innerHTML = `<tr><td colspan="2">Enginn liðsmaður skráður ennþá.</td></tr>`;
    return;
  }

  lidsmenn.forEach((madur) => {
    const tr = document.createElement("tr");
    const nafnTd = document.createElement("td");
    nafnTd.textContent = madur.nafn;

    const adgerdTd = document.createElement("td");

    const breytaBtn = document.createElement("button");
    breytaBtn.type = "button";
    breytaBtn.className = "smabtn";
    breytaBtn.textContent = "Breyta nafni";
    breytaBtn.addEventListener("click", async () => {
      const nyttNafn = prompt("Nýtt nafn:", madur.nafn);
      if (!nyttNafn || !nyttNafn.trim()) return;
      await updateDoc(doc(db, "graenadeildinLidsmenn", madur.id), { nafn: nyttNafn.trim() });
      hladaLidsmenn();
    });

    const eydaBtn = document.createElement("button");
    eydaBtn.type = "button";
    eydaBtn.className = "smabtn";
    eydaBtn.textContent = "Eyða";
    eydaBtn.addEventListener("click", async () => {
      if (!confirm(`Eyða ${madur.nafn}? Fyrri æfingar halda samt nafninu sem er skráð hjá þeim.`)) return;
      await deleteDoc(doc(db, "graenadeildinLidsmenn", madur.id));
      hladaLidsmenn();
    });

    adgerdTd.appendChild(breytaBtn);
    adgerdTd.appendChild(eydaBtn);

    tr.appendChild(nafnTd);
    tr.appendChild(adgerdTd);
    lidsmannaTafla.appendChild(tr);
  });
}

function renderMaettirGatlisti() {
  const valdirIdar = new Set(
    [...maettirGatlisti.querySelectorAll("input:checked")].map((i) => i.value)
  );

  maettirGatlisti.innerHTML = "";

  if (lidsmenn.length === 0) {
    maettirGatlisti.innerHTML = "<p>Bættu fyrst við liðsmönnum hér fyrir ofan.</p>";
    return;
  }

  lidsmenn.forEach((madur) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = madur.id;
    checkbox.checked = valdirIdar.has(madur.id);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(madur.nafn));
    maettirGatlisti.appendChild(label);
  });
}

bataLidsmadurBtn.addEventListener("click", async () => {
  const nafn = nyttLidsmadurInnsl.value.trim();
  if (!nafn) return;
  await addDoc(collection(db, "graenadeildinLidsmenn"), { nafn, createdAt: serverTimestamp() });
  nyttLidsmadurInnsl.value = "";
  hladaLidsmenn();
});

nyttLidsmadurInnsl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    bataLidsmadurBtn.click();
  }
});

aefingSpurningaLeit.addEventListener("input", () => {
  const leit = samraema(aefingSpurningaLeit.value);
  aefingLeitarNidurstodur.innerHTML = "";
  if (!leit || leit.length < 2) return;

  const valdirIdar = new Set(valdarAefingSpurningar.map((s) => s.questionId));
  const nidurstodur = graenadeildarSpurningar
    .filter((s) => !valdirIdar.has(s.id) && s.text.toLowerCase().includes(leit))
    .slice(0, 8);

  nidurstodur.forEach((s) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = s.text;
    btn.addEventListener("click", () => {
      valdarAefingSpurningar.push({ questionId: s.id, texti: s.text, rett: null });
      aefingSpurningaLeit.value = "";
      aefingLeitarNidurstodur.innerHTML = "";
      renderValdarAefingSpurningar();
    });
    aefingLeitarNidurstodur.appendChild(btn);
  });
});

function renderValdarAefingSpurningar() {
  aefingValdarSpurningar.innerHTML = "";

  if (valdarAefingSpurningar.length === 0) {
    aefingValdarSpurningar.innerHTML =
      "<p>Engar spurningar valdar ennþá — leitaðu að þeim hér fyrir ofan.</p>";
    return;
  }

  valdarAefingSpurningar.forEach((s, index) => {
    const rad = document.createElement("div");
    rad.className = "aefing-spurning-rad";

    const texti = document.createElement("span");
    texti.className = "texti";
    texti.textContent = s.texti;
    rad.appendChild(texti);

    const togglar = document.createElement("div");
    togglar.className = "rett-rangt-togglar";

    const rettBtn = document.createElement("button");
    rettBtn.type = "button";
    rettBtn.textContent = "Rétt";
    rettBtn.className = "rett" + (s.rett === true ? " virkur" : "");
    rettBtn.addEventListener("click", () => {
      s.rett = s.rett === true ? null : true;
      renderValdarAefingSpurningar();
    });

    const rangtBtn = document.createElement("button");
    rangtBtn.type = "button";
    rangtBtn.textContent = "Rangt";
    rangtBtn.className = "rangt" + (s.rett === false ? " virkur" : "");
    rangtBtn.addEventListener("click", () => {
      s.rett = s.rett === false ? null : false;
      renderValdarAefingSpurningar();
    });

    togglar.appendChild(rettBtn);
    togglar.appendChild(rangtBtn);
    rad.appendChild(togglar);

    const fjarlaegjaBtn = document.createElement("button");
    fjarlaegjaBtn.type = "button";
    fjarlaegjaBtn.className = "fjarlaegja-btn";
    fjarlaegjaBtn.title = "Fjarlægja";
    fjarlaegjaBtn.textContent = "✕";
    fjarlaegjaBtn.addEventListener("click", () => {
      valdarAefingSpurningar.splice(index, 1);
      renderValdarAefingSpurningar();
    });
    rad.appendChild(fjarlaegjaBtn);

    aefingValdarSpurningar.appendChild(rad);
  });
}

renderValdarAefingSpurningar();

vistaAefinguBtn.addEventListener("click", async () => {
  const dagsetning = aefingDagsetning.value;
  if (!dagsetning) {
    aefingStada.textContent = "Veldu dagsetningu.";
    return;
  }

  if (valdarAefingSpurningar.length === 0) {
    aefingStada.textContent = "Bættu við að minnsta kosti einni spurningu.";
    return;
  }

  if (valdarAefingSpurningar.some((s) => s.rett === null)) {
    aefingStada.textContent = "Merktu allar spurningar réttar eða rangar áður en þú vistar.";
    return;
  }

  const maettir = [...maettirGatlisti.querySelectorAll("input:checked")].map((i) => i.value);

  vistaAefinguBtn.disabled = true;
  aefingStada.textContent = "Vista…";

  try {
    await addDoc(collection(db, "graenadeildinAefingar"), {
      dagsetning,
      maettir,
      spurningar: valdarAefingSpurningar.map((s) => ({
        questionId: s.questionId,
        texti: s.texti,
        rett: s.rett
      })),
      createdAt: serverTimestamp()
    });

    aefingStada.textContent = "Æfing vistuð.";
    valdarAefingSpurningar = [];
    renderValdarAefingSpurningar();
    aefingDagsetning.value = "";
    renderMaettirGatlisti();
    hladaAefingasogu();
  } catch (villa) {
    console.error(villa);
    aefingStada.textContent = `Villa við að vista (${villa.code || villa.message}).`;
  } finally {
    vistaAefinguBtn.disabled = false;
  }
});

async function hladaAefingasogu() {
  aefingaTafla.innerHTML = `<tr><td colspan="6">Sæki æfingar…</td></tr>`;

  const snap = await getDocs(collection(db, "graenadeildinAefingar"));
  if (snap.empty) {
    aefingaTafla.innerHTML = `<tr><td colspan="6">Engar æfingar skráðar ennþá.</td></tr>`;
    return;
  }

  const lidsmannaNofn = new Map(lidsmenn.map((m) => [m.id, m.nafn]));

  const aefingar = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.dagsetning || "").localeCompare(b.dagsetning || ""));

  aefingaTafla.innerHTML = "";
  aefingar.forEach((aefing) => {
    const spurningar = aefing.spurningar || [];
    const fjoldiRett = spurningar.filter((s) => s.rett).length;
    const hlutfall = spurningar.length ? Math.round((fjoldiRett / spurningar.length) * 100) : 0;
    const maettirNofn =
      (aefing.maettir || []).map((id) => lidsmannaNofn.get(id) || "Óþekktur").join(", ") || "—";

    const tr = document.createElement("tr");

    const dagsTd = document.createElement("td");
    dagsTd.textContent = aefing.dagsetning || "—";

    const maettirTd = document.createElement("td");
    maettirTd.textContent = maettirNofn;

    const fjoldiTd = document.createElement("td");
    fjoldiTd.textContent = spurningar.length;

    const rettTd = document.createElement("td");
    rettTd.textContent = fjoldiRett;

    const hlutfallTd = document.createElement("td");
    hlutfallTd.textContent = `${hlutfall}%`;

    const adgerdTd = document.createElement("td");
    const eydaBtn = document.createElement("button");
    eydaBtn.type = "button";
    eydaBtn.className = "smabtn";
    eydaBtn.textContent = "Eyða";
    eydaBtn.addEventListener("click", async () => {
      if (!confirm("Eyða þessari æfingu?")) return;
      await deleteDoc(doc(db, "graenadeildinAefingar", aefing.id));
      hladaAefingasogu();
    });
    adgerdTd.appendChild(eydaBtn);

    tr.appendChild(dagsTd);
    tr.appendChild(maettirTd);
    tr.appendChild(fjoldiTd);
    tr.appendChild(rettTd);
    tr.appendChild(hlutfallTd);
    tr.appendChild(adgerdTd);
    aefingaTafla.appendChild(tr);
  });
}

function formatSkjatimi(sekundur) {
  if (!sekundur) return "0 mín";
  // Heildarfjöldi mínútna er rúnnaður EINU SINNI, svo úrkoman getur aldrei
  // orðið "X klst 60 mín" (sem gerðist þegar klst/mín voru rúnnuð hvort í
  // sínu lagi - t.d. 59 mín 59 sek rúnnaðist upp í 60 mín án þess að bera sig
  // upp í næstu klukkustund).
  const heildarMin = Math.round(sekundur / 60);
  const klst = Math.floor(heildarMin / 60);
  const min = heildarMin % 60;
  return klst > 0 ? `${klst} klst ${min} mín` : `${min} mín`;
}

// "Online" = hefur skrifað lastActive (sjá vistaSkjatima/innskráning í
// quiz.js) á síðustu 2 mínútum - sama glugga og skjátímamælingin flæðir á.
const ONLINE_THOLMORK_MS = 2 * 60 * 1000;
function erOnline(lastActive) {
  return !!lastActive && Date.now() - lastActive < ONLINE_THOLMORK_MS;
}

function samaDagur(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDagsStutt(ms) {
  if (!ms) return "—";
  const d = new Date(ms);
  const nuna = new Date();
  const timi = d.toLocaleTimeString("is-IS", { hour: "2-digit", minute: "2-digit" });
  if (samaDagur(d, nuna)) return `í dag kl. ${timi}`;
  const igaer = new Date(nuna);
  igaer.setDate(igaer.getDate() - 1);
  if (samaDagur(d, igaer)) return `í gær kl. ${timi}`;
  return `${d.toLocaleDateString("is-IS", { day: "numeric", month: "numeric" })} kl. ${timi}`;
}

// Litar röð verkefnis í Verkefni-töflunni þegar það er takmarkað við AÐEINS
// einn notanda (leyfdirNotendur, sjá "Velja notendur") - svo sjáist í fljótu
// bragði hvers "einkaverkefni" hvert er. Handvirkur listi sem bætt er við
// eftir þörfum, engin tengsl við gögnin sjálf.
const NOTENDA_LITIR = {
  "Hekla Kristin Bjornsdottir": "#cffafe",
  "Hinrik Hugi Runarsson": "#dcfce7",
  "julia sigurdard": "#fae8ff"
};

// Hrá gildi (ekki birt strengi) fyrir hvern raðanlegan dálk, notað bæði til
// að raða og til að varðveita röðunina þegar taflan er endurbyggð.
const RODUNAR_LYKLAR = {
  nafn: (r) => (r.nafn || "").toLowerCase(),
  fjoldiSvarad: (r) => r.fjoldiSvarad,
  fjoldiPass: (r) => r.fjoldiPass,
  fjoldiRett: (r) => r.fjoldiRett,
  nakvaemni: (r) => r.nakvaemni,
  skjatimi: (r) => r.skjatimi,
  nyskraning: (r) => r.nyskraning ?? -Infinity,
  sidastSvarad: (r) => r.sidastSvarad ?? -Infinity
};

let notendaRadir = [];
let notendaRodunarDalkur = "sidastSvarad"; // nývirkasti notandinn efst
let notendaRodunarStefna = -1; // 1 = vaxandi, -1 = minnkandi

// Skjáskotssnið: falið nöfn (í staðinn "Nemandi N"), engin Aðgerð-dálkur og
// sleppir notendum í flokki "aðrir" (t.d. prufuaðgangar, ekki alvöru
// nemendur) - svo kennarinn geti tekið skjáskot af töflunni og deilt án
// þess að persónugreina neinn eða sýna stjórnunarhnappa.
let skjaskotsSnid = false;
const skjaskotsSnidBtn = document.getElementById("skjaskotsSnidBtn");
const takaSkjaskotBtn = document.getElementById("takaSkjaskotBtn");
const adgerdHaus = document.getElementById("adgerdHaus");
const nyskraningHaus = document.getElementById("nyskraningHaus");
skjaskotsSnidBtn.addEventListener("click", () => {
  skjaskotsSnid = !skjaskotsSnid;
  skjaskotsSnidBtn.textContent = skjaskotsSnid ? "Birta aftur" : "Skjáskotssnið";
  skjaskotsSnidBtn.classList.toggle("virkur", skjaskotsSnid);
  adgerdHaus.hidden = skjaskotsSnid;
  takaSkjaskotBtn.hidden = !skjaskotsSnid;
  birtaNotendaRadir();
});

// html2canvas (sjá script-merki í stjornbord.html) teiknar #notendaTafla
// upp í myndflöt og vistar hann sem PNG - svo kennarinn þurfi ekki að taka
// skjáskot handvirkt með stýrikerfinu sínu.
takaSkjaskotBtn.addEventListener("click", async () => {
  takaSkjaskotBtn.disabled = true;
  takaSkjaskotBtn.textContent = "Tek skjáskot…";
  try {
    const myndflotur = await html2canvas(notendaTafla.closest("table"), {
      backgroundColor: "#ffffff",
      scale: 2
    });
    const tengill = document.createElement("a");
    tengill.href = myndflotur.toDataURL("image/png");
    tengill.download = `frammistada-nemenda-${new Date().toISOString().slice(0, 10)}.png`;
    tengill.click();
  } catch (villa) {
    console.error(villa);
    alert("Tókst ekki að taka skjáskot. Reyndu aftur.");
  } finally {
    takaSkjaskotBtn.disabled = false;
    takaSkjaskotBtn.textContent = "Taka skjáskot";
  }
});

document.querySelectorAll("#notendaTafla thead th[data-rada]").forEach((th) => {
  th.addEventListener("click", () => {
    const dalkur = th.dataset.rada;
    if (notendaRodunarDalkur === dalkur) {
      notendaRodunarStefna *= -1;
    } else {
      notendaRodunarDalkur = dalkur;
      notendaRodunarStefna = 1;
    }
    birtaNotendaRadir();
  });
});

async function hladaNotendayfirlit() {
  notendaTafla.innerHTML = `<tr><td colspan="9">Sæki gögn…</td></tr>`;

  const [notendurSnap, spurningarSnap, verkefnaSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "questions")),
    getDocs(collection(db, "verkefni"))
  ]);

  const verkefnaTitlar = new Map(verkefnaSnap.docs.map((d) => [d.id, d.data().title]));

  // Yfirlits-tölukortin eru fyllt út frá sömu gögnum og þegar voru sótt hér
  // að ofan - engar aukafyrirspurnir.
  yfirlitVerkefni.textContent = verkefnaSnap.size;
  yfirlitSpurningar.textContent = spurningarSnap.size;
  yfirlitVirkar.textContent = spurningarSnap.docs.filter((d) => d.data().active).length;
  yfirlitNotendur.textContent = notendurSnap.docs.filter((d) => d.data().role !== "admin").length;

  // Tölfræði hvers notanda er lesin beint af users/{uid} (fjoldiSvarad,
  // fjoldiRett, fjoldiPass, verkefnaStada, sidastSvaradAt) í stað þess að
  // endursækja og endurreikna úr attempts-undirsafni hvers notanda í hvert
  // sinn sem stjórnborðið hleður - sjá uppfaeraSamtoluStodu í js/quiz.js,
  // sem heldur þessum tölum réttum jafnóðum þegar spurningu er svarað. Þetta
  // breytir lestrarkostnaði þessarar aðgerðar úr O(fjöldi svaraðra spurninga
  // samanlagt) í O(fjöldi notenda) - var að klára daglega Firestore-kvótann.
  const rows = [];
  for (const notandiDoc of notendurSnap.docs) {
    const notandi = notandiDoc.data();
    if (notandi.role === "admin") continue;

    const fjoldiSvarad = notandi.fjoldiSvarad || 0;
    const fjoldiPass = notandi.fjoldiPass || 0;
    const fjoldiRett = notandi.fjoldiRett || 0;
    const fjoldiMetin = fjoldiSvarad - fjoldiPass;
    const nakvaemni = fjoldiMetin ? Math.round((fjoldiRett / fjoldiMetin) * 100) : 0;

    const verkefnaSundurlidun = Object.entries(notandi.verkefnaStada || {})
      .map(([verkefniId, b]) => {
        const svarad = b.svarad || 0;
        const pass = b.pass || 0;
        const rett = b.rett || 0;
        const metin = svarad - pass;
        return {
          titill: verkefnaTitlar.get(verkefniId) || "Ótengdar spurningar",
          svarad,
          pass,
          rett,
          nakvaemni: metin ? Math.round((rett / metin) * 100) : 0,
          byrjadAftur: b.byrjadAftur || 0,
          sidastByrjadAftur: b.sidastByrjadAftur?.toMillis?.() ?? null
        };
      })
      .sort((a, b) => b.svarad - a.svarad);

    rows.push({
      uid: notandiDoc.id,
      nafn: notandi.nafn || notandi.email,
      email: notandi.email,
      // "aðrir" = ekki alvöru nemandi (t.d. prufuaðgangur) - sleppt úr
      // skjáskotssniði. Vantar reitinn -> gengið út frá "MS" (sjá
      // scripts/flokka-notendur.js fyrir upprunalegu flokkunina).
      flokkur: notandi.flokkur || "MS",
      fjoldiByrjadAftur: Object.values(notandi.verkefnaStada || {}).reduce((a, b) => a + (b.byrjadAftur || 0), 0),
      fjoldiSvarad,
      fjoldiPass,
      fjoldiRett,
      nakvaemni,
      skjatimi: notandi.screenTimeSeconds || 0,
      nyskraning: notandi.createdAt?.toMillis?.() ?? null,
      // "Síðast virk/ur" á að þýða hvenær notandinn sást síðast á síðunni
      // (lastActive-hjartslátturinn, skrifaður á 60 sek fresti á meðan
      // flipinn er opinn - sjá vistaSkjatima í js/quiz.js), ekki hvenær
      // hann svaraði síðustu spurningu - þær tvær stundir geta verið mjög
      // ólíkar (einhver getur verið á síðunni lengi án þess að svara).
      sidastSvarad: notandi.lastActive?.toMillis?.() ?? null,
      lastActive: notandi.lastActive?.toMillis?.() ?? null,
      verkefnaSundurlidun
    });
  }

  notendaRadir = rows;
  birtaNotendaRadir();
}

function birtaNotendaRadir() {
  const lykill = RODUNAR_LYKLAR[notendaRodunarDalkur];
  const rows = (skjaskotsSnid ? notendaRadir.filter((r) => r.flokkur !== "aðrir") : [...notendaRadir]).sort((a, b) => {
    const va = lykill(a);
    const vb = lykill(b);
    if (va < vb) return -1 * notendaRodunarStefna;
    if (va > vb) return 1 * notendaRodunarStefna;
    return 0;
  });

  document.querySelectorAll("#notendaTafla thead th[data-rada]").forEach((th) => {
    const ord = th.querySelector(".rodunarord");
    if (!ord) return;
    ord.textContent = th.dataset.rada !== notendaRodunarDalkur ? "" : notendaRodunarStefna === 1 ? "▲" : "▼";
  });

  // "Nýskráð/ur" er bara áhugavert fyrsta sólarhringinn eftir nýskráningu -
  // ef enginn MS-nemandi hefur skráð sig á þeim tíma er dálkurinn bara
  // ómerkilegt skraut, svo við sleppum honum alveg.
  const SOLARHRINGUR_MS = 24 * 60 * 60 * 1000;
  const nyskradurNylega = notendaRadir.some(
    (r) => r.flokkur === "MS" && r.nyskraning && Date.now() - r.nyskraning < SOLARHRINGUR_MS
  );
  nyskraningHaus.hidden = !nyskradurNylega;

  notendaTafla.innerHTML = "";
  if (rows.length === 0) {
    notendaTafla.innerHTML = `<tr><td colspan="9">Engir notendur skráðir ennþá.</td></tr>`;
    return;
  }

  rows.forEach((r, vIndex) => {
    const tr = document.createElement("tr");

    const nafnTd = document.createElement("td");
    // Skjáskotssnið felur nöfnin - segir ekkert hver er virkur hverju sinni.
    if (!skjaskotsSnid && erOnline(r.lastActive)) {
      const punktur = document.createElement("span");
      punktur.className = "online-punktur";
      punktur.title = "Online núna";
      nafnTd.appendChild(punktur);
    }
    nafnTd.appendChild(document.createTextNode(skjaskotsSnid ? `Nemandi ${vIndex + 1}` : r.nafn));
    const svaradTd = document.createElement("td");
    svaradTd.textContent = r.fjoldiSvarad;
    const passTd = document.createElement("td");
    passTd.textContent = r.fjoldiPass;
    const rettTd = document.createElement("td");
    rettTd.textContent = r.fjoldiRett;
    const nakvaemniTd = document.createElement("td");
    nakvaemniTd.textContent = `${r.nakvaemni}%`;
    const skjatimiTd = document.createElement("td");
    skjatimiTd.textContent = formatSkjatimi(r.skjatimi);
    const sidastTd = document.createElement("td");
    sidastTd.textContent = formatDagsStutt(r.sidastSvarad);

    tr.appendChild(nafnTd);
    tr.appendChild(svaradTd);
    tr.appendChild(passTd);
    tr.appendChild(rettTd);
    tr.appendChild(nakvaemniTd);
    tr.appendChild(skjatimiTd);
    if (nyskradurNylega) {
      const nyskraningTd = document.createElement("td");
      nyskraningTd.textContent = formatDagsStutt(r.nyskraning);
      tr.appendChild(nyskraningTd);
    }
    tr.appendChild(sidastTd);

    // Skjáskotssnið: engin Aðgerð-dálkur, og þar með ekkert "Nánar"-spjald
    // (það er bara opnað gegnum þann hnapp) - sleppa restinni af þessari röð.
    if (skjaskotsSnid) {
      notendaTafla.appendChild(tr);
      return;
    }

    const adgerdTd = document.createElement("td");
    const nanarBtn = document.createElement("button");
    nanarBtn.type = "button";
    nanarBtn.className = "smabtn";
    nanarBtn.textContent = "Nánar";
    adgerdTd.appendChild(nanarBtn);
    tr.appendChild(adgerdTd);
    notendaTafla.appendChild(tr);

    const sundurlidunTr = document.createElement("tr");
    sundurlidunTr.hidden = true;
    const sundurlidunTd = document.createElement("td");
    sundurlidunTd.colSpan = 9;

    const smatolur = document.createElement("div");
    smatolur.className = "sundurlidun-smatolur";
    [
      ["Svarað samtals", r.fjoldiSvarad],
      ["Rétt", r.fjoldiRett],
      ["Pass", r.fjoldiPass],
      ["Nákvæmni", `${r.nakvaemni}%`],
      ["Skjátími", formatSkjatimi(r.skjatimi)],
      ["Byrjað aftur", r.fjoldiByrjadAftur ? `${r.fjoldiByrjadAftur} sinnum` : "aldrei"]
    ].forEach(([haus, gildi]) => {
      const kort = document.createElement("div");
      kort.className = "smatala-kort";
      const hausDiv = document.createElement("div");
      hausDiv.className = "smatala-haus";
      hausDiv.textContent = haus;
      const gildiDiv = document.createElement("div");
      gildiDiv.className = "smatala-gildi";
      gildiDiv.textContent = gildi;
      kort.appendChild(hausDiv);
      kort.appendChild(gildiDiv);
      smatolur.appendChild(kort);
    });
    sundurlidunTd.appendChild(smatolur);

    if (r.verkefnaSundurlidun.length === 0) {
      const tomtP = document.createElement("p");
      tomtP.textContent = "Engar spurningar svaraðar ennþá.";
      sundurlidunTd.appendChild(tomtP);
    } else {
      const kortNet = document.createElement("div");
      kortNet.className = "sundurlidun-kort-net";
      r.verkefnaSundurlidun.forEach((v) => {
        const kort = document.createElement("div");
        kort.className = "sundurlidun-kort";

        const titillDiv = document.createElement("div");
        titillDiv.className = "sundurlidun-kort-titill";
        titillDiv.textContent = v.titill;

        const tolurDiv = document.createElement("div");
        tolurDiv.className = "sundurlidun-kort-tolur";
        tolurDiv.innerHTML = `<span>📝 ${v.svarad} svarað</span><span>✅ ${v.rett} rétt</span><span>⏭ ${v.pass} pass</span>`;

        const barDiv = document.createElement("div");
        barDiv.className = "framvinda-bar";
        const fyllingDiv = document.createElement("div");
        fyllingDiv.className = "framvinda-fylling";
        fyllingDiv.style.width = `${v.nakvaemni}%`;
        barDiv.appendChild(fyllingDiv);

        const nakvaemniSpan = document.createElement("div");
        nakvaemniSpan.className = "sundurlidun-kort-tolur";
        nakvaemniSpan.style.marginTop = "6px";
        nakvaemniSpan.style.marginBottom = "0";
        nakvaemniSpan.innerHTML = `<span>🎯 ${v.nakvaemni}% nákvæmni</span>`;
        if (v.byrjadAftur) {
          const sidast = v.sidastByrjadAftur ? ` (síðast ${formatDagsStutt(v.sidastByrjadAftur)})` : "";
          nakvaemniSpan.innerHTML += `<span>↺ byrjað aftur ${v.byrjadAftur} ${v.byrjadAftur === 1 ? "sinni" : "sinnum"}${sidast}</span>`;
        }

        kort.appendChild(titillDiv);
        kort.appendChild(tolurDiv);
        kort.appendChild(barDiv);
        kort.appendChild(nakvaemniSpan);
        kortNet.appendChild(kort);
      });
      sundurlidunTd.appendChild(kortNet);
    }

    const svaraListaBtn = document.createElement("button");
    svaraListaBtn.type = "button";
    svaraListaBtn.className = "smabtn";
    svaraListaBtn.style.marginTop = "12px";
    svaraListaBtn.textContent = "Sýna spurningar og svör";

    const svaraListaSvaedi = document.createElement("div");
    svaraListaSvaedi.className = "svaralisti-svaedi";
    svaraListaSvaedi.hidden = true;

    let svaralistiHladinn = false;
    svaraListaBtn.addEventListener("click", async () => {
      svaraListaSvaedi.hidden = !svaraListaSvaedi.hidden;
      svaraListaBtn.textContent = svaraListaSvaedi.hidden ? "Sýna spurningar og svör" : "Loka spurningum og svörum";
      if (svaraListaSvaedi.hidden || svaralistiHladinn) return;
      svaralistiHladinn = true;
      await hladaSvaralista(r.uid, svaraListaSvaedi);
    });

    sundurlidunTd.appendChild(svaraListaBtn);
    sundurlidunTd.appendChild(svaraListaSvaedi);

    sundurlidunTr.appendChild(sundurlidunTd);
    notendaTafla.appendChild(sundurlidunTr);

    nanarBtn.addEventListener("click", () => {
      sundurlidunTr.hidden = !sundurlidunTr.hidden;
      nanarBtn.textContent = sundurlidunTr.hidden ? "Nánar" : "Loka";
    });
  });
}

// Sækir attempts-undirsafn EINS notanda (ekki allra - sjá athugasemdina við
// hladaNotendayfirlit um hvers vegna) og birtir hverja spurningu sem hann
// hefur svarað ásamt svarinu hans, svo kennarinn sjái nákvæmlega hvað
// nemandinn er að þreyta sig á núna, ekki bara samtölurnar. Sótt í fyrsta
// skipti sem "Sýna spurningar og svör" er opnað fyrir þennan notanda -
// ekki sjálfkrafa með restinni af yfirlitinu.
async function hladaSvaralista(uid, svaedi) {
  svaedi.innerHTML = "<p>Sæki gögn…</p>";

  const [attemptsSnap, verkefnaSnap] = await Promise.all([
    getDocs(collection(db, "users", uid, "attempts")),
    getDocs(collection(db, "verkefni"))
  ]);

  if (attemptsSnap.empty) {
    svaedi.innerHTML = "<p>Engar spurningar svaraðar ennþá.</p>";
    return;
  }

  const verkefnaTitlar = new Map(verkefnaSnap.docs.map((d) => [d.id, d.data().title]));
  const questionIds = attemptsSnap.docs.map((d) => d.id);

  const spurningaKort = new Map();
  const svaraKort = new Map();
  for (let i = 0; i < questionIds.length; i += 30) {
    const biti = questionIds.slice(i, i + 30);
    const [spurningarBiti, svorBiti] = await Promise.all([
      getDocs(query(collection(db, "questions"), where(documentId(), "in", biti))),
      getDocs(query(collection(db, "answers"), where(documentId(), "in", biti)))
    ]);
    spurningarBiti.forEach((d) => spurningaKort.set(d.id, d.data()));
    svorBiti.forEach((d) => svaraKort.set(d.id, d.data()));
  }

  const radir = attemptsSnap.docs
    .map((d) => {
      const { svar, answeredAt } = d.data();
      const spurning = spurningaKort.get(d.id);
      const rettSvor = [...(svaraKort.get(d.id)?.correctAnswers || [])];
      return {
        qid: d.id,
        verkefniId: spurning?.verkefniId || null,
        texti: spurning?.text || "(spurning fannst ekki - hefur verið eytt)",
        verkefni: verkefnaTitlar.get(spurning?.verkefniId) || "Ótengdar spurningar",
        svar,
        pass: svar === SLEPPT_MERKI,
        rett: svar !== SLEPPT_MERKI && erSvarRett(svar, rettSvor),
        rettSvor,
        hvenaer: answeredAt?.toMillis?.() ?? null
      };
    })
    .sort((a, b) => (b.hvenaer ?? 0) - (a.hvenaer ?? 0));

  // --- Síur: niðurstaða (rétt/rangt/pass), flokkur (verkefni) og leit ---
  const sia = { nidurstada: "allt", verkefni: "allt", leit: "" };

  const siaVefja = document.createElement("div");
  siaVefja.className = "svaralisti-siur";

  const nidurstadaVal = document.createElement("select");
  nidurstadaVal.setAttribute("aria-label", "Sía eftir niðurstöðu");
  [
    ["allt", "Öll svör"],
    ["rett", "Rétt ✅"],
    ["rangt", "Rangt ❌"],
    ["pass", "Pass ⏭"]
  ].forEach(([gildi, texti]) => nidurstadaVal.appendChild(new Option(texti, gildi)));

  const verkefniVal = document.createElement("select");
  verkefniVal.setAttribute("aria-label", "Sía eftir flokki");
  verkefniVal.appendChild(new Option("Allir flokkar", "allt"));
  [...new Set(radir.map((r) => r.verkefni))]
    .sort((a, b) => a.localeCompare(b, "is"))
    .forEach((titill) => verkefniVal.appendChild(new Option(titill, titill)));

  const leitInntak = document.createElement("input");
  leitInntak.type = "search";
  leitInntak.placeholder = "Leita í spurningum og svörum";
  leitInntak.setAttribute("aria-label", "Leita");

  const fjoldiSpan = document.createElement("span");
  fjoldiSpan.className = "svaralisti-fjoldi";

  siaVefja.append(nidurstadaVal, verkefniVal, leitInntak, fjoldiSpan);

  const tafla = document.createElement("table");
  tafla.className = "sundurlidun-tafla";
  tafla.innerHTML = `<thead><tr><th>Spurning</th><th>Verkefni</th><th>Svar</th><th>Niðurstaða</th><th>Hvenær</th><th>Aðgerð</th></tr></thead>`;
  const biti = document.createElement("tbody");
  tafla.appendChild(biti);

  function erSynileg(rad) {
    if (sia.nidurstada === "rett" && !(rad.rett && !rad.pass)) return false;
    if (sia.nidurstada === "rangt" && (rad.rett || rad.pass)) return false;
    if (sia.nidurstada === "pass" && !rad.pass) return false;
    if (sia.verkefni !== "allt" && rad.verkefni !== sia.verkefni) return false;
    if (sia.leit) {
      const heystakkur = `${rad.texti} ${rad.pass ? "" : rad.svar} ${rad.rettSvor.join(" ")}`.toLowerCase();
      if (!heystakkur.includes(sia.leit)) return false;
    }
    return true;
  }

  function teikna() {
    biti.innerHTML = "";
    let synd = 0;
    radir.forEach((rad) => {
      if (!erSynileg(rad)) return;
      synd++;
      const tr = document.createElement("tr");

      const spurningTd = document.createElement("td");
      spurningTd.textContent = rad.texti;

      const verkefniTd = document.createElement("td");
      verkefniTd.textContent = rad.verkefni;

      const svarTd = document.createElement("td");
      svarTd.textContent = rad.pass ? "—" : rad.svar;

      const nidurstadaTd = document.createElement("td");
      if (rad.pass) {
        nidurstadaTd.textContent = "Pass ⏭";
      } else if (rad.rett) {
        nidurstadaTd.textContent = "Rétt ✅";
        nidurstadaTd.style.color = "var(--litur-rett)";
      } else {
        nidurstadaTd.textContent = `Rangt ❌ (rétt: ${rad.rettSvor.join(" / ") || "—"})`;
        nidurstadaTd.style.color = "var(--litur-rangt)";
      }

      const hvenaerTd = document.createElement("td");
      hvenaerTd.textContent = formatDagsStutt(rad.hvenaer);

      const adgerdTd = document.createElement("td");
      if (!rad.pass && !rad.rett) {
        const gefaRettBtn = document.createElement("button");
        gefaRettBtn.type = "button";
        gefaRettBtn.className = "smabtn";
        gefaRettBtn.textContent = "Gefa rétt";
        gefaRettBtn.title = "Bæta þessu svari við sem réttu svari fyrir alla nemendur";
        gefaRettBtn.addEventListener("click", async () => {
          if (!confirm(`Telja „${rad.svar}“ rétt svar við spurningunni?\n\n${rad.texti}\n\nÞetta gildir fyrir alla nemendur sem svöruðu eins.`)) return;
          gefaRettBtn.disabled = true;
          try {
            const fjoldiNemenda = await gefaSvariRett(rad);
            teikna();
            alert(
              `„${rad.svar}“ er nú rétt svar. ${fjoldiNemenda} nemandi/nemendur fengu stig. Smelltu á Endurhlaða til að sjá nýjar heildartölur.`
            );
          } catch (villa) {
            console.error(villa);
            alert("Tókst ekki að vista. Reyndu aftur.");
            gefaRettBtn.disabled = false;
          }
        });
        adgerdTd.appendChild(gefaRettBtn);
      }

      tr.append(spurningTd, verkefniTd, svarTd, nidurstadaTd, hvenaerTd, adgerdTd);
      biti.appendChild(tr);
    });
    fjoldiSpan.textContent = `${synd} af ${radir.length} svörum`;
  }

  nidurstadaVal.addEventListener("change", () => {
    sia.nidurstada = nidurstadaVal.value;
    teikna();
  });
  verkefniVal.addEventListener("change", () => {
    sia.verkefni = verkefniVal.value;
    teikna();
  });
  leitInntak.addEventListener("input", () => {
    sia.leit = leitInntak.value.trim().toLowerCase();
    teikna();
  });

  teikna();
  svaedi.innerHTML = "";
  svaedi.append(siaVefja, tafla);
}

// Bætir svari nemanda við sem réttu svari spurningarinnar (gildir fyrir alla)
// og hækkar teljara þeirra nemenda sem gáfu nákvæmlega þetta svar og fá nú rétt.
// Teljararnir (fjoldiRett, verkefnaStada) eru geymdir á notandanum og
// uppfærðir jafnóðum - þess vegna þarf að leiðrétta þá hér líka.
async function gefaSvariRett(rad) {
  const gamlirRettir = [...rad.rettSvor];
  const nyirRettir = [...gamlirRettir, rad.svar];
  await updateDoc(doc(db, "answers", rad.qid), { correctAnswers: arrayUnion(rad.svar) });

  const notendurSnap = await getDocs(collection(db, "users"));
  let fjoldi = 0;
  for (const n of notendurSnap.docs) {
    if (n.data().role === "admin") continue;
    const tilraunSnap = await getDoc(doc(db, "users", n.id, "attempts", rad.qid));
    if (!tilraunSnap.exists()) continue;
    const svar = tilraunSnap.data().svar;
    if (svar === SLEPPT_MERKI) continue;
    if (erSvarRett(svar, gamlirRettir) || !erSvarRett(svar, nyirRettir)) continue;
    const uppfaersla = { fjoldiRett: increment(1) };
    if (rad.verkefniId) uppfaersla[`verkefnaStada.${rad.verkefniId}.rett`] = increment(1);
    await updateDoc(n.ref, uppfaersla);
    fjoldi++;
  }

  rad.rettSvor.push(rad.svar);
  rad.rett = true;
  return fjoldi;
}

// Setur margar aðgerðir saman í einn "..." hnapp með fellivalmynd í stað
// þess að hrúga mörgum hnöppum í sama Aðgerð-reitinn. adgerdir: [{texti,
// smella}]. Aðeins ein valmynd er opin í einu - smellur annars staðar lokar.
function byggjaAdgerdaValmynd(adgerdir) {
  const vefja = document.createElement("div");
  vefja.className = "adgerd-valmynd-vefja";

  const takki = document.createElement("button");
  takki.type = "button";
  takki.className = "smabtn adgerd-valmynd-takki";
  takki.textContent = "⋮";
  takki.setAttribute("aria-label", "Aðgerðir");

  const valmynd = document.createElement("div");
  valmynd.className = "adgerd-valmynd";
  valmynd.hidden = true;

  adgerdir.forEach(({ texti, smella }) => {
    const hnappur = document.createElement("button");
    hnappur.type = "button";
    hnappur.textContent = texti;
    hnappur.addEventListener("click", () => {
      valmynd.hidden = true;
      smella();
    });
    valmynd.appendChild(hnappur);
  });

  takki.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".adgerd-valmynd").forEach((v) => {
      if (v !== valmynd) v.hidden = true;
    });
    valmynd.hidden = !valmynd.hidden;
  });

  vefja.appendChild(takki);
  vefja.appendChild(valmynd);
  return vefja;
}

document.addEventListener("click", () => {
  document.querySelectorAll(".adgerd-valmynd").forEach((v) => {
    v.hidden = true;
  });
});

async function hladaVerkefnayfirlit() {
  const [verkefnaSnap, spurningarSnap, notendaLitaSnap] = await Promise.all([
    getDocs(collection(db, "verkefni")),
    getDocs(collection(db, "questions")),
    getDocs(collection(db, "users"))
  ]);

  const fjoldiSpurningaPerVerkefni = new Map();
  const fjoldiVirkraSpurningaPerVerkefni = new Map();
  spurningarSnap.forEach((qDoc) => {
    const gogn = qDoc.data();
    const id = gogn.verkefniId;
    if (!id) return;
    fjoldiSpurningaPerVerkefni.set(id, (fjoldiSpurningaPerVerkefni.get(id) || 0) + 1);
    if (gogn.active) {
      fjoldiVirkraSpurningaPerVerkefni.set(id, (fjoldiVirkraSpurningaPerVerkefni.get(id) || 0) + 1);
    }
  });

  // uid -> litur, fyrir notendurna sem eru í NOTENDA_LITIR - notað til að
  // lita verkefni sem eru takmörkuð við nákvæmlega einn þeirra.
  const litirPerUid = new Map();
  notendaLitaSnap.forEach((d) => {
    const litur = NOTENDA_LITIR[d.data().nafn];
    if (litur) litirPerUid.set(d.id, litur);
  });

  hladaVerkefniSelect(verkefnaSnap);

  verkefnaTafla.innerHTML = "";
  if (verkefnaSnap.empty) {
    verkefnaTafla.innerHTML = `<tr><td colspan="7">Engin verkefni ennþá.</td></tr>`;
    return;
  }

  verkefnaSnap.forEach((vDoc) => {
    const verkefni = vDoc.data();
    const tr = document.createElement("tr");
    const erProf = verkefni.tegund === "prof";

    const leyfdir = verkefni.leyfdirNotendur || [];
    if (leyfdir.length === 1 && litirPerUid.has(leyfdir[0])) {
      tr.style.background = litirPerUid.get(leyfdir[0]);
    }

    const titillTd = document.createElement("td");
    titillTd.textContent = verkefni.title;

    const tegundTd = document.createElement("td");
    tegundTd.textContent = erProf ? "📝 Próf" : "Verkefni";

    const glaeruTd = document.createElement("td");
    glaeruTd.textContent = (verkefni.slides || []).length;

    const spurningaTd = document.createElement("td");
    const heildSpurninga = fjoldiSpurningaPerVerkefni.get(vDoc.id) || 0;
    const virkarSpurningar = fjoldiVirkraSpurningaPerVerkefni.get(vDoc.id) || 0;
    spurningaTd.textContent = `${heildSpurninga} (${virkarSpurningar} virkar)`;

    const stodaTd = document.createElement("td");
    stodaTd.textContent = verkefni.active ? "Virkt" : "Óvirkt";

    const syileikiTd = document.createElement("td");
    syileikiTd.textContent = leyfdir.length > 0 ? `${leyfdir.length} valdir` : "Allir";

    const adgerdTd = document.createElement("td");
    adgerdTd.appendChild(
      byggjaAdgerdaValmynd([
        {
          texti: verkefni.active ? "Slökkva" : "Kveikja",
          smella: async () => {
            await updateDoc(doc(db, "verkefni", vDoc.id), { active: !verkefni.active });
            hladaVerkefnayfirlit();
          }
        },
        {
          texti: "Kveikja á öllum spurningum",
          smella: async () => {
            const fjoldi = await kveikjaVerkefniOgSpurningar(vDoc.id);
            alert(`Kveikt á verkefninu og ${fjoldi} óvirkum spurningum.`);
            hladaVerkefnayfirlit();
          }
        },
        {
          texti: "Breyta titli",
          smella: async () => {
            const nyttNafn = prompt("Nýr titill:", verkefni.title);
            if (!nyttNafn || !nyttNafn.trim() || nyttNafn.trim() === verkefni.title) return;
            await updateDoc(doc(db, "verkefni", vDoc.id), { title: nyttNafn.trim() });
            hladaVerkefnayfirlit();
          }
        },
        {
          texti: erProf ? "Gera að verkefni" : "Gera að prófi",
          smella: async () => {
            await updateDoc(doc(db, "verkefni", vDoc.id), { tegund: erProf ? "verkefni" : "prof" });
            hladaVerkefnayfirlit();
          }
        },
        {
          texti: "Velja notendur",
          smella: () => opnaNotendaValPanell(vDoc.id, verkefni)
        },
        {
          texti: "Generera spurningar",
          smella: () => {
            aiVerkefniValiö.value = vDoc.id;
            generaSpurningarBtn.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      ])
    );

    tr.appendChild(titillTd);
    tr.appendChild(tegundTd);
    tr.appendChild(glaeruTd);
    tr.appendChild(spurningaTd);
    tr.appendChild(stodaTd);
    tr.appendChild(syileikiTd);
    tr.appendChild(adgerdTd);
    verkefnaTafla.appendChild(tr);
  });
}

function hladaVerkefniSelect(verkefnaSnap) {
  fyllaVerkefniSelect(verkefniValiö, verkefnaSnap, "Ekkert verkefni (almenn spurning)");
  fyllaVerkefniSelect(aiVerkefniValiö, verkefnaSnap, "Veldu verkefni…");
}

function fyllaVerkefniSelect(selectEl, verkefnaSnap, tomurValkostur) {
  const valid = selectEl.value;
  selectEl.innerHTML = `<option value="">${tomurValkostur}</option>`;
  verkefnaSnap.forEach((vDoc) => {
    const opt = document.createElement("option");
    opt.value = vDoc.id;
    opt.textContent = vDoc.data().title;
    selectEl.appendChild(opt);
  });
  if ([...selectEl.options].some((o) => o.value === valid)) {
    selectEl.value = valid;
  }
}

let notendaValVerkefniId = "";

// Fyllir gátlistann af öllum skráðum (ekki-admin) notendum með nafni sem
// merki, forhakar þá sem þegar eru í leyfdirNotendur, og opnar panelinn.
async function opnaNotendaValPanell(verkefniId, verkefni) {
  notendaValVerkefniId = verkefniId;
  notendaValTitill.textContent = `Veldu notendur - "${verkefni.title}"`;
  kveikjaAllarCheckbox.checked = true;
  notendaValGatlisti.innerHTML = "<p>Sæki notendur…</p>";
  notendaValPanell.hidden = false;
  notendaValPanell.scrollIntoView({ behavior: "smooth", block: "center" });

  const notendurSnap = await getDocs(collection(db, "users"));
  const notendur = notendurSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((n) => n.role !== "admin")
    .sort((a, b) => (a.nafn || a.email || "").localeCompare(b.nafn || b.email || "", "is"));

  const nuverandiLeyfdir = new Set(verkefni.leyfdirNotendur || []);

  notendaValGatlisti.innerHTML = "";
  if (notendur.length === 0) {
    notendaValGatlisti.innerHTML = "<p>Engir notendur skráðir ennþá.</p>";
    return;
  }
  notendur.forEach((n) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = n.id;
    checkbox.checked = nuverandiLeyfdir.has(n.id);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(n.nafn || n.email || n.id));
    notendaValGatlisti.appendChild(label);
  });
}

// Kveikir á verkefninu sjálfu og öllum óvirkum spurningum þess - nemendur sjá
// bara spurningar með active == true í verkefni með active == true.
async function kveikjaVerkefniOgSpurningar(verkefniId) {
  await updateDoc(doc(db, "verkefni", verkefniId), { active: true });
  const snap = await getDocs(query(collection(db, "questions"), where("verkefniId", "==", verkefniId)));
  const oviRkar = snap.docs.filter((d) => !d.data().active);
  for (let i = 0; i < oviRkar.length; i += 400) {
    const batch = writeBatch(db);
    oviRkar.slice(i, i + 400).forEach((d) => batch.update(d.ref, { active: true }));
    await batch.commit();
  }
  return oviRkar.length;
}

vistaNotendaValBtn.addEventListener("click", async () => {
  const voldUid = [...notendaValGatlisti.querySelectorAll("input:checked")].map((i) => i.value);
  await updateDoc(doc(db, "verkefni", notendaValVerkefniId), { leyfdirNotendur: voldUid });
  if (kveikjaAllarCheckbox.checked) {
    await kveikjaVerkefniOgSpurningar(notendaValVerkefniId);
  }
  notendaValPanell.hidden = true;
  hladaVerkefnayfirlit();
});

hættaVidNotendaValBtn.addEventListener("click", () => {
  notendaValPanell.hidden = true;
});

// Finnur verkefni með nákvæmlega þessum titli, eða býr það til (ógallerí,
// engar glærur - lendir því sjálfkrafa í "Hraðaspurningar" dálkinum hjá
// nemendum, sbr. erProfVerkefni() í js/quiz.js).
async function finnaEdaBuaTilVerkefni(titill) {
  const snap = await getDocs(query(collection(db, "verkefni"), where("title", "==", titill)));
  if (!snap.empty) return snap.docs[0].id;
  const ref = await addDoc(collection(db, "verkefni"), {
    title: titill,
    slides: [],
    active: false,
    createdAt: serverTimestamp()
  });
  return ref.id;
}

// Sameiginleg eyðing fyrir eina "sérflokka" færslu (embættismaður eða bók) -
// eyðir sjálfri færslunni og báðum spurningunum/svörunum sem hún bjó til.
async function eydaSerflokkaFaerslu(faerslaRef, gogn) {
  const batch = writeBatch(db);
  if (gogn.q1Id) {
    batch.delete(doc(db, "questions", gogn.q1Id));
    batch.delete(doc(db, "answers", gogn.q1Id));
  }
  if (gogn.q2Id) {
    batch.delete(doc(db, "questions", gogn.q2Id));
    batch.delete(doc(db, "answers", gogn.q2Id));
  }
  batch.delete(faerslaRef);
  await batch.commit();
  hladaSerflokkar();
  hladaVerkefnayfirlit();
  hladaSpurningayfirlit();
}

async function hladaSerflokkar() {
  const [embSnap, bokSnap] = await Promise.all([
    getDocs(collection(db, "embaettismenn")),
    getDocs(collection(db, "bokalisti"))
  ]);

  embaettismannaTafla.innerHTML = "";
  if (embSnap.empty) {
    embaettismannaTafla.innerHTML = `<tr><td colspan="3">Engir embættismenn skráðir ennþá.</td></tr>`;
  }
  embSnap.forEach((eDoc) => {
    const gogn = eDoc.data();
    const tr = document.createElement("tr");

    const nafnTd = document.createElement("td");
    nafnTd.textContent = gogn.nafn;
    const embaettiTd = document.createElement("td");
    embaettiTd.textContent = gogn.embaetti;

    const eydaBtn = document.createElement("button");
    eydaBtn.type = "button";
    eydaBtn.className = "smabtn";
    eydaBtn.textContent = "Eyða";
    eydaBtn.addEventListener("click", () => {
      if (!confirm(`Eyða "${gogn.nafn}" og báðum spurningunum sem fylgja?`)) return;
      eydaSerflokkaFaerslu(eDoc.ref, gogn);
    });
    const adgerdTd = document.createElement("td");
    adgerdTd.appendChild(eydaBtn);

    tr.appendChild(nafnTd);
    tr.appendChild(embaettiTd);
    tr.appendChild(adgerdTd);
    embaettismannaTafla.appendChild(tr);
  });

  bokalistaTafla.innerHTML = "";
  if (bokSnap.empty) {
    bokalistaTafla.innerHTML = `<tr><td colspan="3">Engar bækur skráðar ennþá.</td></tr>`;
  }
  bokSnap.forEach((bDoc) => {
    const gogn = bDoc.data();
    const tr = document.createElement("tr");

    const hofundurTd = document.createElement("td");
    hofundurTd.textContent = gogn.hofundur;
    const titillTd = document.createElement("td");
    titillTd.textContent = gogn.titill;

    const eydaBtn = document.createElement("button");
    eydaBtn.type = "button";
    eydaBtn.className = "smabtn";
    eydaBtn.textContent = "Eyða";
    eydaBtn.addEventListener("click", () => {
      if (!confirm(`Eyða "${gogn.titill}" og báðum spurningunum sem fylgja?`)) return;
      eydaSerflokkaFaerslu(bDoc.ref, gogn);
    });
    const adgerdTd = document.createElement("td");
    adgerdTd.appendChild(eydaBtn);

    tr.appendChild(hofundurTd);
    tr.appendChild(titillTd);
    tr.appendChild(adgerdTd);
    bokalistaTafla.appendChild(tr);
  });
}

embaettismadurForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nafn = embNafn.value.trim();
  const embaetti = embEmbaetti.value.trim();
  const myndSlod = embMyndSlod.value.trim();
  const logoSlod = embLogoSlod.value.trim();
  if (!nafn || !embaetti) return;

  embStada.textContent = "Vista…";
  try {
    const verkefniId = await finnaEdaBuaTilVerkefni("Embættismannalisti");

    const q1Ref = doc(collection(db, "questions"));
    const q2Ref = doc(collection(db, "questions"));
    const batch = writeBatch(db);

    // Spurning 1: embætti -> nafn. Sýnir lógó embættisins sem vísbendingu.
    batch.set(q1Ref, {
      text: `Hver er ${embaetti}?`,
      verkefniId,
      active: false,
      createdAt: serverTimestamp(),
      ...(logoSlod ? { image: logoSlod } : {})
    });
    batch.set(doc(db, "answers", q1Ref.id), { correctAnswers: [samraema(nafn)] });

    // Spurning 2: nafn -> embætti. Sýnir mynd af einstaklingnum.
    batch.set(q2Ref, {
      text: `Hvaða embætti gegnir ${nafn}?`,
      verkefniId,
      active: false,
      createdAt: serverTimestamp(),
      ...(myndSlod ? { image: myndSlod } : {})
    });
    batch.set(doc(db, "answers", q2Ref.id), { correctAnswers: [samraema(embaetti)] });

    await batch.commit();
    await addDoc(collection(db, "embaettismenn"), {
      nafn,
      embaetti,
      myndSlod,
      logoSlod,
      verkefniId,
      q1Id: q1Ref.id,
      q2Id: q2Ref.id,
      createdAt: serverTimestamp()
    });

    embaettismadurForm.reset();
    embStada.textContent = `Bætti við "${nafn}" - tvær spurningar búnar til (óvirkar, kveiktu á þeim í Verkefni-flipanum).`;
    hladaSerflokkar();
    hladaVerkefnayfirlit();
    hladaSpurningayfirlit();
  } catch (villa) {
    console.error(villa);
    embStada.textContent = "Villa: " + villa.message;
  }
});

bokForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const hofundur = bokHofundur.value.trim();
  const titill = bokTitill.value.trim();
  const kapaSlod = bokKapaSlod.value.trim();
  if (!hofundur || !titill) return;

  bokStada.textContent = "Vista…";
  try {
    const verkefniId = await finnaEdaBuaTilVerkefni("Bókalisti");

    const q1Ref = doc(collection(db, "questions"));
    const q2Ref = doc(collection(db, "questions"));
    const batch = writeBatch(db);

    // Spurning 1: titill -> höfundur. Sýnir bókarkápuna sem vísbendingu.
    batch.set(q1Ref, {
      text: `Hver skrifaði "${titill}"?`,
      verkefniId,
      active: false,
      createdAt: serverTimestamp(),
      ...(kapaSlod ? { image: kapaSlod } : {})
    });
    batch.set(doc(db, "answers", q1Ref.id), { correctAnswers: [samraema(hofundur)] });

    // Spurning 2: höfundur -> titill.
    batch.set(q2Ref, {
      text: `Hvaða bók skrifaði ${hofundur}?`,
      verkefniId,
      active: false,
      createdAt: serverTimestamp()
    });
    batch.set(doc(db, "answers", q2Ref.id), { correctAnswers: [samraema(titill)] });

    await batch.commit();
    await addDoc(collection(db, "bokalisti"), {
      hofundur,
      titill,
      kapaSlod,
      verkefniId,
      q1Id: q1Ref.id,
      q2Id: q2Ref.id,
      createdAt: serverTimestamp()
    });

    bokForm.reset();
    bokStada.textContent = `Bætti við "${titill}" - tvær spurningar búnar til (óvirkar, kveiktu á þeim í Verkefni-flipanum).`;
    hladaSerflokkar();
    hladaVerkefnayfirlit();
    hladaSpurningayfirlit();
  } catch (villa) {
    console.error(villa);
    bokStada.textContent = "Villa: " + villa.message;
  }
});

async function hladaSpurningayfirlit() {
  const [spurningarSnap, svorSnap, verkefnaSnap] = await Promise.all([
    getDocs(collection(db, "questions")),
    getDocs(collection(db, "answers")),
    getDocs(collection(db, "verkefni"))
  ]);
  const rettSvor = new Map(svorSnap.docs.map((d) => [d.id, d.data().correctAnswers || []]));
  const verkefnaTitlar = new Map(verkefnaSnap.docs.map((d) => [d.id, d.data().title]));

  spurningaFlokkar.innerHTML = "";
  if (spurningarSnap.empty) {
    spurningaFlokkar.innerHTML = "<p>Engar spurningar ennþá.</p>";
    return;
  }

  const spurningarPerVerkefni = new Map();
  spurningarSnap.forEach((qDoc) => {
    const verkefniId = qDoc.data().verkefniId || "";
    if (!spurningarPerVerkefni.has(verkefniId)) spurningarPerVerkefni.set(verkefniId, []);
    spurningarPerVerkefni.get(verkefniId).push(qDoc);
  });

  const flokkar = [...spurningarPerVerkefni.entries()]
    .map(([verkefniId, skjol]) => ({
      verkefniId,
      titill: verkefnaTitlar.get(verkefniId) || "Ótengdar spurningar",
      skjol
    }))
    .sort((a, b) => a.titill.localeCompare(b.titill, "is"));

  flokkar.forEach((flokkur) => {
    spurningaFlokkar.appendChild(byggjaSpurningaflokkur(flokkur, rettSvor));
  });
}

function byggjaSpurningaflokkur(flokkur, rettSvor) {
  const { verkefniId, titill, skjol } = flokkur;
  const erOpinn = opnirSpurningaflokkar.has(verkefniId);

  const kort = document.createElement("div");
  kort.className = "spurningaflokkur";

  const haus = document.createElement("div");
  haus.className = "spurningaflokkur-haus";

  const titillSpan = document.createElement("span");
  titillSpan.className = "spurningaflokkur-titill";
  titillSpan.textContent = `${titill} (${skjol.length})`;
  haus.appendChild(titillSpan);

  const hnappar = document.createElement("div");

  const skodaBtn = document.createElement("button");
  skodaBtn.type = "button";
  skodaBtn.className = "smabtn";
  skodaBtn.textContent = erOpinn ? "Loka" : "Skoða";

  const hendaBtn = document.createElement("button");
  hendaBtn.type = "button";
  hendaBtn.className = "smabtn";
  hendaBtn.textContent = "Henda";
  hendaBtn.addEventListener("click", async () => {
    if (!confirm(`Eyða öllum ${skjol.length} spurningum í "${titill}"? Þetta er óafturkræft.`)) return;
    hendaBtn.disabled = true;
    try {
      await eydaSpurningaflokki(skjol.map((d) => d.id));
      hladaSpurningayfirlit();
    } catch (villa) {
      console.error(villa);
      alert("Tókst ekki að eyða möppunni: " + villa.message);
      hendaBtn.disabled = false;
    }
  });

  hnappar.appendChild(skodaBtn);
  hnappar.appendChild(hendaBtn);
  haus.appendChild(hnappar);
  kort.appendChild(haus);

  const innihaldsTafla = document.createElement("table");
  innihaldsTafla.className = "spurningaflokkur-tafla";
  innihaldsTafla.hidden = !erOpinn;
  innihaldsTafla.innerHTML = "<thead><tr><th>Texti</th><th>Rétt svar</th><th>Staða</th><th>Aðgerð</th></tr></thead>";

  const tbody = document.createElement("tbody");
  skjol.forEach((qDoc) => {
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

    const bataSvariKnappur = document.createElement("button");
    bataSvariKnappur.type = "button";
    bataSvariKnappur.className = "smabtn";
    bataSvariKnappur.textContent = "Bæta við svari";
    bataSvariKnappur.title = "Bættu við öðru málfræðilega réttu svari (t.d. annað orðform) - gildir líka afturvirkt fyrir þá sem þegar svöruðu því";
    bataSvariKnappur.addEventListener("click", async () => {
      const nyttSvar = prompt("Nýtt samþykkt svar (annað orðform/samheiti sem á líka að teljast rétt):");
      if (!nyttSvar || !nyttSvar.trim()) return;
      const samraemt = samraema(nyttSvar);
      if (!samraemt) return;
      await updateDoc(doc(db, "answers", qDoc.id), { correctAnswers: arrayUnion(samraemt) });
      hladaSpurningayfirlit();
    });

    const fjarlaegjaSvarKnappur = document.createElement("button");
    fjarlaegjaSvarKnappur.type = "button";
    fjarlaegjaSvarKnappur.className = "smabtn";
    fjarlaegjaSvarKnappur.textContent = "Fjarlægja svar";
    fjarlaegjaSvarKnappur.title = "Fjarlægðu rangt/úrelt samþykkt svar (t.d. gamalt nafn þegar staðreynd breytist, eins og nýr borgarstjóri)";
    fjarlaegjaSvarKnappur.addEventListener("click", async () => {
      const nuverandi = (rettSvor.get(qDoc.id) || []).join(" / ") || "(engin skráð)";
      const svarTilFjarlaegingar = prompt(`Hvaða svar á að fjarlægja?\nNúverandi samþykkt svör: ${nuverandi}`);
      if (!svarTilFjarlaegingar || !svarTilFjarlaegingar.trim()) return;
      const samraemt = samraema(svarTilFjarlaegingar);
      if (!samraemt) return;
      await updateDoc(doc(db, "answers", qDoc.id), { correctAnswers: arrayRemove(samraemt) });
      hladaSpurningayfirlit();
    });

    const myndKnappur = document.createElement("button");
    myndKnappur.type = "button";
    myndKnappur.className = "smabtn";
    myndKnappur.textContent = spurning.image ? "Breyta mynd" : "Setja mynd";
    myndKnappur.title = "Vefslóð á mynd af Wikimedia Commons sem birtist með spurningunni þegar nemandi svarar (ekki AI-generað) - sama eiginleiki og sumar spurningar í '50 áhrifamiklir einstaklingar' hafa. Tómt fjarlægir myndina.";
    myndKnappur.addEventListener("click", async () => {
      const nyMyndaslod = prompt("Vefslóð á mynd af Wikimedia Commons (ekki AI-generað - tómt til að fjarlægja):", spurning.image || "");
      if (nyMyndaslod === null) return;
      const hreinsud = nyMyndaslod.trim();
      await updateDoc(doc(db, "questions", qDoc.id), hreinsud ? { image: hreinsud } : { image: deleteField() });
      hladaSpurningayfirlit();
    });

    const textTd = document.createElement("td");
    textTd.textContent = spurning.text;

    const svarTd = document.createElement("td");
    svarTd.textContent = (rettSvor.get(qDoc.id) || []).join(" / ") || "—";

    const stodaTd = document.createElement("td");
    stodaTd.textContent = spurning.active ? "Virk" : "Óvirk";

    const adgerdTd = document.createElement("td");
    adgerdTd.appendChild(kveikjaKnappur);
    adgerdTd.appendChild(bataSvariKnappur);
    adgerdTd.appendChild(fjarlaegjaSvarKnappur);
    adgerdTd.appendChild(myndKnappur);

    tr.appendChild(textTd);
    tr.appendChild(svarTd);
    tr.appendChild(stodaTd);
    tr.appendChild(adgerdTd);
    tbody.appendChild(tr);
  });
  innihaldsTafla.appendChild(tbody);
  kort.appendChild(innihaldsTafla);

  skodaBtn.addEventListener("click", () => {
    innihaldsTafla.hidden = !innihaldsTafla.hidden;
    skodaBtn.textContent = innihaldsTafla.hidden ? "Skoða" : "Loka";
    if (innihaldsTafla.hidden) opnirSpurningaflokkar.delete(verkefniId);
    else opnirSpurningaflokkar.add(verkefniId);
  });

  return kort;
}

// Eyðir öllum spurningunum (og samsvarandi réttu svörunum) í heilli möppu í
// bútum af 480 aðgerðum (Firestore hámark er 500 í einum batch).
async function eydaSpurningaflokki(questionIds) {
  let batch = writeBatch(db);
  let fjoldiIBatch = 0;

  for (const id of questionIds) {
    batch.delete(doc(db, "questions", id));
    batch.delete(doc(db, "answers", id));
    fjoldiIBatch += 2;

    if (fjoldiIBatch >= 480) {
      await batch.commit();
      batch = writeBatch(db);
      fjoldiIBatch = 0;
    }
  }

  if (fjoldiIBatch > 0) await batch.commit();
}

function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

const SLEPPT_MERKI = "__sleppt__";

// Sömu reglur og erSvarRett í js/quiz.js (sjá þá skrá fyrir ítarlegri
// skýringum) - endurtekið hér svo stjórnborðið geti sýnt rétt/rangt á
// sama hátt og lifandi einkunnagjöfin gerir, fyrir "Spurningar og svör"
// yfirlitið hjá hverjum notanda.
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
      createdAt: serverTimestamp(),
      ...(entry.image ? { image: entry.image } : {})
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
  const image = (gogn.get("spurningMynd") || "").trim();

  if (!text || !rettSvar) {
    alert("Skráðu spurningatexta og rétt svar.");
    return;
  }

  await vistaSpurningar(
    [{ text, correctAnswers: [...new Set([rettSvar, ...onnurSvor])], verkefniId, image }],
    { active: true }
  );

  nySpurningForm.reset();
  hladaAllt();
});

nyttVerkefniForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const gogn = new FormData(nyttVerkefniForm);
  const titill = gogn.get("titill").trim();
  const efni = (gogn.get("efni") || "").trim();

  if (!titill || !efni) {
    alert("Skráðu titil og efni.");
    return;
  }

  const slides = efni
    .split(/\n\s*\n/)
    .map((blokk) => blokk.trim())
    .filter(Boolean)
    .map((blokk) => {
      const linur = blokk.split("\n").map((l) => l.trim()).filter(Boolean);
      return { title: linur[0], body: linur.slice(1).join(" ") };
    });

  if (slides.length === 0) {
    alert("Fann engar efnisgreinar í efninu.");
    return;
  }

  await writeBatch(db)
    .set(doc(collection(db, "verkefni")), {
      title: titill,
      slides,
      active: true,
      createdAt: serverTimestamp()
    })
    .commit();

  nyttVerkefniForm.reset();
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

// Sviga-innihald ("Kísill (Sílikon)") er annað samþykkt svar, ekki hluti af aðalsvarinu.
// Má líka skrifa fleiri afbrigði aðskilin með skástriki ("Svar: Reykjavík / Rvk").
function svorurUrTexta(hraSvar) {
  const svor = [];
  for (const biti of hraSvar.split("/")) {
    const svigaMatch = biti.trim().match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    if (svigaMatch) {
      svor.push(svigaMatch[1], svigaMatch[2]);
    } else {
      svor.push(biti);
    }
  }
  return [...new Set(svor.map(samraema).filter(Boolean))];
}

// Sömu þumalputtareglur og scripts/build-questions.js - leitar að "Spurning:"/"Svar:"
// línum, eða "N. Spurning [TAB] SVAR: svar" á einni línu (Gettu Betur spurningabankar
// eru oft á því sniði). Þolir "SVRA:" innsláttarvillu og vantandi tvípunkt.
function greinaBlokk(linur) {
  const samaLinaSvar = (linur[0] || "").match(/^\s*\d+[.)]\s*(.+?)\t+SV(?:AR|RA)\s*:?\s*(.+)$/i);
  if (samaLinaSvar) {
    const correctAnswers = svorurUrTexta(samaLinaSvar[2]);
    return { text: samaLinaSvar[1].trim(), correctAnswers, needsReview: correctAnswers.length === 0 };
  }

  const spurningLina =
    linur.find((l) => /^spurning\b\s*[:\-]?\s*/i.test(l)) ||
    linur.find((l) => l.trim().endsWith("?")) ||
    linur[0] ||
    "";

  const text = spurningLina
    .replace(/^spurning\b\s*[:\-]?\s*/i, "")
    .replace(/^\d+[\.\)]\s*/, "")
    .trim();

  const svarLina = linur.find((l) => l !== spurningLina && /^\s*SV(?:AR|RA)\s*:?\s*/i.test(l));
  const svarTexti = svarLina ? svarLina.replace(/^\s*SV(?:AR|RA)\s*:?\s*/i, "").trim() : "";
  const correctAnswers = svarTexti ? svorurUrTexta(svarTexti) : [];

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
  sidastaSkra = file;

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
    drafGatlistaHnappar.hidden = draftir.length === 0;
  } catch (villa) {
    console.error(villa);
    innflutningsStada.textContent = "Tókst ekki að vinna úr skránni: " + villa.message;
  }
});

function renderDraftRows(draftir, targetListi = drafListi) {
  targetListi.innerHTML = "";

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

    if (draft.heimild) {
      const heimildP = document.createElement("p");
      heimildP.className = "heimild-tilvitnun";
      heimildP.textContent = `„${draft.heimild}“`;
      svarSvaedi.appendChild(heimildP);
    }

    const myndInput = document.createElement("input");
    myndInput.type = "text";
    myndInput.value = draft.image || "";
    myndInput.placeholder = "Mynd af Wikimedia Commons (slóð, valfrjálst - ekki AI-generað)";
    svarSvaedi.appendChild(myndInput);

    rad.appendChild(gatlisti);
    rad.appendChild(spurningInput);
    rad.appendChild(svarSvaedi);

    rad._faSpurningu = () => ({
      tokinMed: gatlisti.checked,
      text: spurningInput.value.trim(),
      correctAnswers: [...new Set(svarInput.value.split("/").map(samraema).filter(Boolean))],
      image: myndInput.value.trim()
    });

    targetListi.appendChild(rad);
  });
}

function slugja(nafn) {
  return nafn
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function skraIBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Hleður hráu skjalinu upp á GitHub (Contents API) svo hægt sé að birta það
// óbreytt með Office-skjalaskoðaranum. Skilar slóðinni innan repósins (pptxUrl).
async function hladaSkraAGithub(file) {
  const teikn = localStorage.getItem(GITHUB_TEIKN_LYKILL);
  if (!teikn) return null;

  const endingRegex = /\.(pptx|docx)$/i;
  const ending = (file.name.match(endingRegex) || [".pptx"])[0];
  const slod = `pptx/${Date.now()}-${slugja(file.name)}${ending}`;
  const innihald = await skraIBase64(file);

  const svar = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${slod}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${teikn}`,
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify({
      message: `Bæta við ${file.name} fyrir verkefni`,
      content: innihald,
      branch: "main"
    })
  });

  if (!svar.ok) {
    const villuGogn = await svar.json().catch(() => ({}));
    throw new Error(villuGogn.message || `GitHub svaraði ${svar.status}`);
  }

  return slod;
}

veljaAllarBtn.addEventListener("click", () => {
  drafListi.querySelectorAll('.draft-rad input[type="checkbox"]').forEach((c) => (c.checked = true));
});

afveljaAllarBtn.addEventListener("click", () => {
  drafListi.querySelectorAll('.draft-rad input[type="checkbox"]').forEach((c) => (c.checked = false));
});

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
      let pptxUrl = null;
      if (sidastaSkra && localStorage.getItem(GITHUB_TEIKN_LYKILL)) {
        innflutningsStada.textContent = "Hleð upprunalega skjalinu upp á GitHub…";
        try {
          pptxUrl = await hladaSkraAGithub(sidastaSkra);
        } catch (villa) {
          console.error(villa);
          alert(
            "Tókst ekki að hlaða skjalinu upp á GitHub (athugaðu að teiknið hafi skrifheimild): " +
              villa.message +
              "\n\nHeld áfram og vista verkefnið með endursömdum texta í staðinn."
          );
        }
      }

      const verkefniRef = doc(collection(db, "verkefni"));
      const slides = sidustuBlokkir.map((linur) => ({
        title: linur[0],
        body: linur.slice(1).join(" ")
      }));
      await writeBatch(db)
        .set(verkefniRef, {
          title: verkefnaTitill,
          slides,
          ...(pptxUrl ? { pptxUrl } : {}),
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
    drafGatlistaHnappar.hidden = true;
    innflutningsSkra.value = "";
    verkefnaTitillInnsl.value = "";
    sidustuBlokkir = [];
    sidastaSkra = null;
    hladaAllt();
  } finally {
    vistaValdarBtn.disabled = false;
  }
});

// --- Spurningagerð með gervigreind (Claude API) ---

function skerdaTexta(texti, hamark) {
  return texti.length > hamark ? texti.slice(0, hamark) + "…" : texti;
}

async function kallaAClaude(prompt) {
  const teikn = localStorage.getItem(ANTHROPIC_TEIKN_LYKILL);
  const svar = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": teikn,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!svar.ok) {
    const villuGogn = await svar.json().catch(() => ({}));
    throw new Error(villuGogn.error?.message || `Anthropic svaraði ${svar.status}`);
  }

  const gogn = await svar.json();
  return gogn.content?.[0]?.text || "";
}

function draguJsonUt(texti) {
  const hreinsad = texti.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const upphaf = hreinsad.indexOf("[");
  const endir = hreinsad.lastIndexOf("]");
  if (upphaf === -1 || endir === -1) throw new Error("Fann ekki JSON fylki í svarinu.");
  return JSON.parse(hreinsad.slice(upphaf, endir + 1));
}

generaSpurningarBtn.addEventListener("click", async () => {
  const verkefniId = aiVerkefniValiö.value;
  const fjoldi = Math.max(1, Math.min(100, Number(aiFjoldiInnsl.value) || 50));

  if (!verkefniId) {
    generaStada.textContent = "Veldu verkefni fyrst.";
    return;
  }
  if (!localStorage.getItem(ANTHROPIC_TEIKN_LYKILL)) {
    generaStada.textContent = "Settu inn Anthropic API-lykil í Stillingum hér fyrir ofan fyrst.";
    return;
  }

  generaSpurningarBtn.disabled = true;
  generaStada.textContent = "Sæki efni verkefnis…";
  aiDrafListi.innerHTML = "";
  aiGatlistaHnappar.hidden = true;
  aiVistaValdarBtn.hidden = true;

  try {
    const verkefniSnap = await getDoc(doc(db, "verkefni", verkefniId));
    if (!verkefniSnap.exists()) throw new Error("Verkefnið fannst ekki.");

    const slides = verkefniSnap.data().slides || [];
    if (slides.length === 0) throw new Error("Verkefnið hefur engar glærur/efni til að vinna úr.");

    const efnistexti = skerdaTexta(
      slides.map((s) => `${s.title}\n${s.body}`).join("\n\n"),
      60000
    );

    const prompt =
      `Hér er efni úr glærusafni á íslensku:\n\n${efnistexti}\n\n` +
      `Búðu til ${fjoldi} spurninga-og-svara pör á íslensku, í anda "Gettu Betur" ` +
      `spurningakeppni: stutt, afmörkuð svör (nöfn, ártöl, staðir, tölur - ekki heilar ` +
      `setningar), ein skýr rétt spurning per glæru/staðreynd, byggð eingöngu á efninu ` +
      `hér að ofan. Ekki endurtaka sömu spurningu tvisvar. Fyrir hverja spurningu skaltu ` +
      `líka skila beinni tilvitnun (orðrétt, óstytt) í þann hluta frumtextans hér að ofan ` +
      `sem svarið er byggt á, svo yfirferðaraðili geti sannreynt svarið á augabragði.\n\n` +
      `Skilaðu EINGÖNGU gildu JSON fylki, nákvæmlega á þessu formi, ekkert annað ` +
      `(enga skýringartexta, engar markdown-girðingar):\n` +
      `[{"text": "Spurningatexti?", "correctAnswers": ["Rétt svar"], "heimild": "bein tilvitnun í frumtextann"}, ...]`;

    generaStada.textContent = "Claude er að semja spurningar (getur tekið smástund)…";
    const svarTexti = await kallaAClaude(prompt);
    const hraSpurningar = draguJsonUt(svarTexti);

    const draftir = hraSpurningar
      .map((s) => ({
        text: (s.text || "").trim(),
        correctAnswers: [...new Set((s.correctAnswers || []).map(samraema).filter(Boolean))],
        heimild: (s.heimild || "").trim()
      }))
      .filter((s) => s.text)
      .map((s) => ({ ...s, needsReview: s.correctAnswers.length === 0 }));

    if (draftir.length === 0) throw new Error("Claude skilaði engum nothæfum spurningum.");

    renderDraftRows(draftir, aiDrafListi);
    aiGatlistaHnappar.hidden = false;
    aiVistaValdarBtn.hidden = false;
    generaStada.textContent = `Fékk ${draftir.length} spurningar frá Claude. Farðu yfir og veldu hverjar á að vista.`;
  } catch (villa) {
    console.error(villa);
    generaStada.textContent = "Tókst ekki að generera spurningar: " + villa.message;
  } finally {
    generaSpurningarBtn.disabled = false;
  }
});

aiVeljaAllarBtn.addEventListener("click", () => {
  aiDrafListi.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = true));
});

aiAfveljaAllarBtn.addEventListener("click", () => {
  aiDrafListi.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));
});

aiVistaValdarBtn.addEventListener("click", async () => {
  const verkefniId = aiVerkefniValiö.value;
  const radir = [...aiDrafListi.querySelectorAll(".draft-rad")].map((r) => r._faSpurningu());
  const valdar = radir.filter((r) => r.tokinMed && r.text && r.correctAnswers.length > 0);

  if (valdar.length === 0) {
    alert("Engar gildar spurningar valdar (þarf spurningatexta og minnst eitt rétt svar).");
    return;
  }

  aiVistaValdarBtn.disabled = true;
  try {
    await vistaSpurningar(
      valdar.map((v) => ({ ...v, verkefniId })),
      { active: false }
    );
    generaStada.textContent = `Vistaði ${valdar.length} spurningar (óvirkar - kveiktu á þeim í spurningatöflunni).`;
    aiDrafListi.innerHTML = "";
    aiGatlistaHnappar.hidden = true;
    aiVistaValdarBtn.hidden = true;
    hladaAllt();
  } finally {
    aiVistaValdarBtn.disabled = false;
  }
});


// --- Tölfræði-síða: nánari tölfræði um nemendurna og heatmap eftir tæki ---
// Les attempts-undirsöfn nemendanna (ekki gert í hladaAllt) - bara þegar
// síðan er opnuð eða smellt er á Endurhlaða, til að spara Firestore-lestra.
const tolfraediStada = document.getElementById("tolfraediStada");
const tolfraediKort = document.getElementById("tolfraediKort");
const tolfraediEndurhladaBtn = document.getElementById("tolfraediEndurhladaBtn");
const heatmapNemandi = document.getElementById("heatmapNemandi");
const VIKUDAGAR = ["Mán", "Þri", "Mið", "Fim", "Fös", "Lau", "Sun"];
const VIKUDAGAR_LANGT = ["mánudagur", "þriðjudagur", "miðvikudagur", "fimmtudagur", "föstudagur", "laugardagur", "sunnudagur"];
let tolfraediNemendur = [];
let tolfraediVerkefnaTitlar = new Map();
let tolfraediHladid = false;
let tolfraediAdHlada = false;

function dagslykill(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function sekSemTexti(sek) {
  if (!sek) return "0 mín";
  const klst = Math.floor(sek / 3600);
  const min = Math.round((sek % 3600) / 60);
  return klst ? `${klst} klst ${min} mín` : `${min} mín`;
}

function reiknaNemanda(id, notandi, tilraunir, verkefnaTitlar) {
  const virk = notandi.virkni || {};
  const reitir = { tolva: [], simi: [] };
  for (const taeki of Object.keys(reitir)) {
    reitir[taeki] = Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => virk[taeki]?.[`d${d}h${h}`] || 0));
  }
  const samtalsTaeki = (taeki) => reitir[taeki].reduce((a, dagur) => a + dagur.reduce((x, y) => x + y, 0), 0);

  const svor = tilraunir.filter((t) => t.svar !== SLEPPT_MERKI && t.ms);
  const dagar = new Map();
  const klst = new Array(24).fill(0);
  const vikudagur = new Array(7).fill(0);
  for (const t of svor) {
    dagar.set(dagslykill(t.ms), (dagar.get(dagslykill(t.ms)) || 0) + 1);
    const d = new Date(t.ms);
    klst[d.getUTCHours()]++;
    vikudagur[(d.getUTCDay() + 6) % 7]++;
  }
  const dagalisti = [...dagar.keys()].sort();
  let lengstaRak = 0;
  let rak = 0;
  let fyrri = null;
  for (const d of dagalisti) {
    const ms = Date.parse(d);
    rak = fyrri !== null && ms - fyrri === 86400000 ? rak + 1 : 1;
    lengstaRak = Math.max(lengstaRak, rak);
    fyrri = ms;
  }
  const metDagur = [...dagar.entries()].sort((a, b) => b[1] - a[1])[0];
  const fyrirViku = Date.now() - 7 * 86400000;
  const hamark = (listi) => listi.indexOf(Math.max(...listi));

  const flokkar = Object.entries(notandi.verkefnaStada || {})
    .map(([vid, b]) => {
      const metin = (b.svarad || 0) - (b.pass || 0);
      return { titill: verkefnaTitlar.get(vid) || "Ótengdar spurningar", metin, hlutfall: metin ? (b.rett || 0) / metin : 0 };
    })
    .filter((f) => f.metin >= 10)
    .sort((a, b) => b.hlutfall - a.hlutfall);

  const tolvaSek = samtalsTaeki("tolva");
  const simiSek = samtalsTaeki("simi");
  const fjoldiRett = notandi.fjoldiRett || 0;
  const metin = (notandi.fjoldiSvarad || 0) - (notandi.fjoldiPass || 0);
  const skjatimi = notandi.screenTimeSeconds || 0;
  return {
    id,
    nafn: notandi.nafn || notandi.email,
    svarad: notandi.fjoldiSvarad || 0,
    byrjadAftur: Object.values(notandi.verkefnaStada || {}).reduce((a, b) => a + (b.byrjadAftur || 0), 0),
    pass: notandi.fjoldiPass || 0,
    nakvaemni: metin ? Math.round((fjoldiRett / metin) * 100) : 0,
    skjatimi,
    svorAKlst: skjatimi >= 600 ? (metin / (skjatimi / 3600)).toFixed(1) : null,
    virkirDagar: dagar.size,
    medalSvorADag: dagar.size ? Math.round(svor.length / dagar.size) : 0,
    lengstaRak,
    metDagur: metDagur ? `${metDagur[1]} svör (${metDagur[0].split("-").reverse().join(".")})` : "—",
    sidustu7: svor.filter((t) => t.ms >= fyrirViku).length,
    algengastiTimi: svor.length ? `${String(hamark(klst)).padStart(2, "0")}:00` : "—",
    algengastiDagur: svor.length ? VIKUDAGAR_LANGT[hamark(vikudagur)] : "—",
    bestiFlokkur: flokkar.length ? `${flokkar[0].titill} (${Math.round(flokkar[0].hlutfall * 100)}%)` : "—",
    verstiFlokkur: flokkar.length > 1 ? `${flokkar.at(-1).titill} (${Math.round(flokkar.at(-1).hlutfall * 100)}%)` : "—",
    tolvaSek,
    simiSek,
    reitir,
    heatmap: notandi.heatmap || {}
  };
}

async function hladaTolfraedi() {
  if (tolfraediAdHlada) return;
  tolfraediAdHlada = true;
  tolfraediStada.textContent = "Sæki gögn…";
  try {
    const [notendurSnap, verkefnaSnap] = await Promise.all([getDocs(collection(db, "users")), getDocs(collection(db, "verkefni"))]);
    const verkefnaTitlar = new Map(verkefnaSnap.docs.map((d) => [d.id, d.data().title]));
    tolfraediVerkefnaTitlar = verkefnaTitlar;
    const nemendur = notendurSnap.docs.filter((d) => d.data().role !== "admin" && (d.data().flokkur || "MS") !== "aðrir");
    tolfraediNemendur = [];
    for (const n of nemendur) {
      const snap = await getDocs(collection(db, "users", n.id, "attempts"));
      const tilraunir = snap.docs.map((d) => ({ svar: d.data().svar, ms: d.data().answeredAt?.toMillis?.() ?? null }));
      tolfraediNemendur.push(reiknaNemanda(n.id, n.data(), tilraunir, verkefnaTitlar));
    }
    tolfraediNemendur.sort((a, b) => b.svarad - a.svarad);
    tolfraediHladid = true;
    tolfraediStada.textContent = `${tolfraediNemendur.length} nemendur · uppfært ${new Date().toLocaleTimeString("is-IS", { hour: "2-digit", minute: "2-digit" })}`;
    teiknaTolfraedi();
  } catch (villa) {
    console.error(villa);
    tolfraediStada.textContent = "Tókst ekki að sækja gögn. Reyndu aftur með Endurhlaða.";
  } finally {
    tolfraediAdHlada = false;
  }
}

function teiknaTolfraedi() {
  tolfraediKort.innerHTML = "";
  for (const n of tolfraediNemendur) {
    const kort = document.createElement("div");
    kort.className = "tolfraedi-kort";
    const titill = document.createElement("h3");
    titill.textContent = n.nafn;
    const dl = document.createElement("dl");
    const samtalsSek = n.tolvaSek + n.simiSek;
    const linur = [
      ["Svarað / pass", `${n.svarad} / ${n.pass}`],
      ["Nákvæmni", `${n.nakvaemni}%`],
      ["Skjátími", sekSemTexti(n.skjatimi)],
      ["Byrjaði verkefni aftur", n.byrjadAftur ? `${n.byrjadAftur} sinnum` : "aldrei"],
      ["Svör á klst. á síðunni", n.svorAKlst ?? "—"],
      ["Virkir dagar", n.virkirDagar],
      ["Meðaltal svara á virkum degi", n.medalSvorADag],
      ["Lengsta rák (dagar í röð)", n.lengstaRak],
      ["Flest svör á einum degi", n.metDagur],
      ["Svör síðustu 7 daga", n.sidustu7],
      ["Algengasti tími dags", n.algengastiTimi],
      ["Algengasti vikudagur", n.algengastiDagur],
      ["Sterkasti flokkur", n.bestiFlokkur],
      ["Veikasti flokkur", n.verstiFlokkur],
      ["Tölva / sími", samtalsSek ? `${Math.round((n.tolvaSek / samtalsSek) * 100)}% / ${Math.round((n.simiSek / samtalsSek) * 100)}%` : "engin gögn enn"]
    ];
    for (const [heiti, gildi] of linur) {
      const dt = document.createElement("dt");
      dt.textContent = heiti;
      const dd = document.createElement("dd");
      dd.textContent = gildi;
      dl.append(dt, dd);
    }
    kort.append(titill, dl);
    tolfraediKort.appendChild(kort);
  }

  const gildi = heatmapNemandi.value || "allir";
  heatmapNemandi.innerHTML = "";
  heatmapNemandi.appendChild(new Option("Öll fjögur samanlagt", "allir"));
  tolfraediNemendur.forEach((n) => heatmapNemandi.appendChild(new Option(n.nafn, n.id)));
  heatmapNemandi.value = [...heatmapNemandi.options].some((o) => o.value === gildi) ? gildi : "allir";
  teiknaHeatmap();
  uppfaeraHmSidur();
  teiknaHmAllt(true);
}

function teiknaHeatmap() {
  const valdir = heatmapNemandi.value === "allir" ? tolfraediNemendur : tolfraediNemendur.filter((n) => n.id === heatmapNemandi.value);
  [["tolva", "heatmapTolva"], ["simi", "heatmapSimi"]].forEach(([taeki, elId]) => {
    const el = document.getElementById(elId);
    const gildi = Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => valdir.reduce((a, n) => a + n.reitir[taeki][d][h], 0)));
    const hamark = Math.max(0, ...gildi.flat());
    const samtals = gildi.flat().reduce((a, b) => a + b, 0);
    el.innerHTML = "";
    el.appendChild(document.createElement("span"));
    for (let h = 0; h < 24; h++) {
      const t = document.createElement("span");
      t.className = "hm-klst";
      t.textContent = h % 3 === 0 ? h : "";
      el.appendChild(t);
    }
    VIKUDAGAR.forEach((nafn, d) => {
      const heiti = document.createElement("span");
      heiti.textContent = nafn;
      el.appendChild(heiti);
      for (let h = 0; h < 24; h++) {
        const reitur = document.createElement("span");
        reitur.className = "hm-reitur";
        const v = gildi[d][h];
        if (v > 0) reitur.style.background = `rgba(93, 143, 31, ${(0.15 + 0.85 * (v / hamark)).toFixed(2)})`;
        reitur.title = `${VIKUDAGAR[d]} ${String(h).padStart(2, "0")}:00 – ${sekSemTexti(v)}`;
        el.appendChild(reitur);
      }
    });
    const skyring = document.createElement("div");
    skyring.className = "heatmap-skyring";
    skyring.innerHTML = `<span>minna</span><span class="hm-kvardi"></span><span>meira</span>`;
    const samtalsSpan = document.createElement("span");
    samtalsSpan.style.marginLeft = "auto";
    samtalsSpan.textContent = samtals ? `Samtals ${sekSemTexti(samtals)}` : "Engin gögn enn";
    skyring.appendChild(samtalsSpan);
    el.appendChild(skyring);
  });
}

heatmapNemandi.addEventListener("change", () => {
  teiknaHeatmap();
  teiknaHmAllt(false);
});
tolfraediEndurhladaBtn.addEventListener("click", hladaTolfraedi);
document.querySelectorAll("[data-skjaskot]").forEach((hnappur) => {
  hnappur.addEventListener("click", async () => {
    const kort = document.getElementById(hnappur.dataset.skjaskot);
    hnappur.hidden = true;
    try {
      const myndflotur = await html2canvas(kort, { backgroundColor: "#ffffff", scale: 2 });
      const tengill = document.createElement("a");
      tengill.href = myndflotur.toDataURL("image/png");
      tengill.download = `heatmap-${hnappur.dataset.skjaskot.replace("heatmap", "").replace("Kort", "").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.png`;
      tengill.click();
    } catch (villa) {
      console.error(villa);
      alert("Tókst ekki að taka skjáskot. Reyndu aftur.");
    } finally {
      hnappur.hidden = false;
    }
  });
});

// Hleður tölfræðinni þegar síðan er opnuð (smellt á valmynd, kort eða
// opnuð beint með #tolfraedi í slóðinni) - ekki í sjálfvirku endurhleðslunni.
function athugaTolfraediOpnun() {
  if (!tolfraediHladid && document.getElementById("sida-tolfraedi").classList.contains("virk")) hladaTolfraedi();
}
document.getElementById("stjornNav").addEventListener("click", () => setTimeout(athugaTolfraediOpnun, 0));
vaktaInnskraningu({ requireAuth: true, requireAdmin: true }, () => athugaTolfraediOpnun());

// --- Heatmap ofan á lifandi útgáfu leiksins (smellir og skrun) ---
const hmSida = document.getElementById("hmSida");
const hmGerd = document.getElementById("hmGerd");
const hmStada = document.getElementById("hmStada");
const HM_BREIDD = { tolva: 1200, simi: 390 };
const HM_REITUR = 20;
const HM_SKRUNAR_ROD = 100;
const HM_HAMARKSHAED = 6000;
const hmPanelar = {}; // taeki -> { lykill, W, H, k, canvas, tilbuid }
let hmPalletta = null;

function hmSidaHeiti(lykill) {
  const [svaedi, id] = lykill.split("_");
  const heiti = { minstada: "Mín staða", verkefni: "Verkefnalisti", glosur: "Glósur", spurningar: "Spurningar", glaerur: "Glærur" }[svaedi] || svaedi;
  return id ? `${heiti}: ${tolfraediVerkefnaTitlar.get(id) || id}` : heiti;
}

function uppfaeraHmSidur() {
  const fyrra = hmSida.value;
  const lyklar = new Set(["minstada", "verkefni", "glosur"]);
  for (const n of tolfraediNemendur) {
    for (const taeki of Object.keys(HM_BREIDD)) Object.keys(n.heatmap?.[taeki] || {}).forEach((l) => lyklar.add(l));
  }
  hmSida.innerHTML = "";
  [...lyklar].sort((a, b) => hmSidaHeiti(a).localeCompare(hmSidaHeiti(b), "is")).forEach((l) => hmSida.appendChild(new Option(hmSidaHeiti(l), l)));
  hmSida.value = lyklar.has(fyrra) ? fyrra : "verkefni";
}

// Leggur saman gögn valinna nemenda fyrir tæki og síðu.
function hmGogn(taeki, lykill) {
  const valdir = heatmapNemandi.value === "allir" ? tolfraediNemendur : tolfraediNemendur.filter((n) => n.id === heatmapNemandi.value);
  const smellir = new Map();
  const skrun = [];
  let lotur = 0;
  for (const n of valdir) {
    const g = n.heatmap?.[taeki]?.[lykill];
    if (!g) continue;
    lotur += g.n || 0;
    for (const [k, v] of Object.entries(g)) {
      if (k[0] === "c") smellir.set(k.slice(1), (smellir.get(k.slice(1)) || 0) + v);
      else if (k[0] === "s") skrun[Number(k.slice(1))] = (skrun[Number(k.slice(1))] || 0) + v;
    }
  }
  return { smellir, skrun, lotur, fjoldiSmella: [...smellir.values()].reduce((a, b) => a + b, 0) };
}

function hmLitaPalletta() {
  if (hmPalletta) return hmPalletta;
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 1;
  const ctx = cv.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  [[0, "#2b4bff"], [0.35, "#00c8ff"], [0.55, "#2ee66b"], [0.75, "#ffe600"], [1, "#ff2a1a"]].forEach(([p, c]) => g.addColorStop(p, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 1);
  hmPalletta = ctx.getImageData(0, 0, 256, 1).data;
  return hmPalletta;
}

function hmTeiknaSmelli(cv, smellir) {
  const { width: W, height: H } = cv;
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  if (!smellir.size) return;
  const hamark = Math.max(...smellir.values());
  const buf = document.createElement("canvas");
  buf.width = W;
  buf.height = H;
  const bctx = buf.getContext("2d");
  const r = 28;
  for (const [lykill, fjoldi] of smellir) {
    const [dx, dy] = lykill.split("_").map(Number);
    const x = W / 2 + (dx - 100) * HM_REITUR + HM_REITUR / 2;
    const y = dy * HM_REITUR + HM_REITUR / 2;
    const g = bctx.createRadialGradient(x, y, 0, x, y, r);
    const a = Math.max(0.18, fjoldi / hamark) * 0.75;
    g.addColorStop(0, `rgba(0,0,0,${a})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    bctx.fillStyle = g;
    bctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const mynd = bctx.getImageData(0, 0, W, H);
  const pal = hmLitaPalletta();
  const d = mynd.data;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (!a) continue;
    d[i] = pal[a * 4];
    d[i + 1] = pal[a * 4 + 1];
    d[i + 2] = pal[a * 4 + 2];
    d[i + 3] = Math.min(235, a + 40);
  }
  ctx.putImageData(mynd, 0, 0);
}

function hmTeiknaSkrun(cv, skrun, lotur) {
  const { width: W, height: H } = cv;
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  if (!lotur) return;
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "right";
  for (let r = 0; r < skrun.length; r++) {
    const p = Math.min(1, (skrun[r] || 0) / lotur);
    const y = r * HM_SKRUNAR_ROD;
    if (y >= H) break;
    ctx.fillStyle = `hsla(${Math.round((1 - p) * 240)}, 90%, 50%, 0.42)`;
    ctx.fillRect(0, y, W, HM_SKRUNAR_ROD);
    if (r % 3 === 0) {
      const texti = `${Math.round(p * 100)}%`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.75)";
      ctx.strokeText(texti, W - 8, y + 18);
      ctx.fillStyle = "#fff";
      ctx.fillText(texti, W - 8, y + 18);
    }
  }
}

function hmRitaCanvas(taeki) {
  const p = hmPanelar[taeki];
  if (!p || !p.tilbuid) return;
  const gogn = hmGogn(taeki, p.lykill);
  if (hmGerd.value === "skrun") hmTeiknaSkrun(p.canvas, gogn.skrun, gogn.lotur);
  else hmTeiknaSmelli(p.canvas, gogn.smellir);
}

function hmBygguPanel(taeki, lykill) {
  const ramma = document.getElementById(taeki === "tolva" ? "hmTolvaRamma" : "hmSimiRamma");
  const gogn = hmGogn(taeki, lykill);
  ramma.innerHTML = "";
  delete hmPanelar[taeki];
  if (!gogn.lotur && !gogn.fjoldiSmella) {
    const tomt = document.createElement("div");
    tomt.className = "hm-tomt";
    tomt.textContent = "Engin gögn enn fyrir þetta tæki og þessa síðu.";
    ramma.appendChild(tomt);
    return;
  }
  const W = HM_BREIDD[taeki];
  const k = Math.min(1, (ramma.clientWidth || 600) / W);
  const innra = document.createElement("div");
  innra.className = "hm-innra";
  innra.style.width = `${W}px`;
  innra.style.transform = `scale(${k})`;
  const iframe = document.createElement("iframe");
  iframe.width = W;
  iframe.height = 700;
  iframe.scrolling = "no";
  iframe.title = "Forskoðun síðu";
  iframe.src = `leikur.html?forskodun=1&heatmapsida=${encodeURIComponent(lykill)}`;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = 700;
  innra.append(iframe, canvas);
  ramma.style.height = `${Math.round(700 * k)}px`;
  ramma.appendChild(innra);
  const p = { lykill, W, H: 700, k, canvas, iframe, innra, ramma, tilbuid: false };
  hmPanelar[taeki] = p;

  // Efnið í iframe hleðst ósamstillt - bíðum þar til hæðin er stöðug.
  iframe.addEventListener("load", () => {
    let fyrriHaed = 0;
    let stodugt = 0;
    let talning = 0;
    const bid = setInterval(() => {
      talning++;
      const haed = Math.min(HM_HAMARKSHAED, iframe.contentDocument?.documentElement?.scrollHeight || 0);
      stodugt = haed && haed === fyrriHaed ? stodugt + 1 : 0;
      fyrriHaed = haed;
      if ((stodugt >= 3 || talning > 25) && haed) {
        clearInterval(bid);
        if (hmPanelar[taeki] !== p) return;
        p.H = haed;
        iframe.height = haed;
        canvas.height = haed;
        innra.style.height = `${haed}px`;
        ramma.style.height = `${Math.round(Math.min(haed * k, 900))}px`;
        p.tilbuid = true;
        hmRitaCanvas(taeki);
      }
    }, 400);
  });
}

function teiknaHmAllt(endurbyggja) {
  const lykill = hmSida.value;
  if (!lykill) return;
  const nemandi = heatmapNemandi.value;
  for (const taeki of Object.keys(HM_BREIDD)) {
    const p = hmPanelar[taeki];
    if (endurbyggja || !p || p.lykill !== lykill) hmBygguPanel(taeki, lykill);
    else hmRitaCanvas(taeki);
  }
  const heiti = nemandi === "allir" ? "öll fjögur" : tolfraediNemendur.find((n) => n.id === nemandi)?.nafn;
  hmStada.textContent = `${hmGerd.value === "skrun" ? "Skrun: hlutfall lota sem komust niður á hverja dýpt" : "Smellir: rautt = flestir smellir"} · ${heiti || ""}. Staðsetningin er áætluð - efni síðunnar getur verið mislangt hjá hverjum nemanda.`;
}

hmSida.addEventListener("change", () => teiknaHmAllt(true));
hmGerd.addEventListener("change", () => teiknaHmAllt(false));
document.querySelectorAll("[data-hm-skjaskot]").forEach((hnappur) => {
  hnappur.addEventListener("click", async () => {
    const taeki = hnappur.dataset.hmSkjaskot;
    const p = hmPanelar[taeki];
    if (!p || !p.tilbuid) {
      alert("Engin mynd til að taka skjáskot af ennþá.");
      return;
    }
    hnappur.disabled = true;
    try {
      const grunnur = await html2canvas(p.iframe.contentDocument.documentElement, {
        width: p.W,
        height: p.H,
        windowWidth: p.W,
        windowHeight: p.H,
        backgroundColor: "#ffffff",
        scale: 1,
        useCORS: true
      });
      const ut = document.createElement("canvas");
      ut.width = p.W;
      ut.height = p.H;
      const ctx = ut.getContext("2d");
      ctx.drawImage(grunnur, 0, 0);
      ctx.drawImage(p.canvas, 0, 0);
      const tengill = document.createElement("a");
      tengill.href = ut.toDataURL("image/png");
      tengill.download = `heatmap-${hmGerd.value}-${taeki}-${new Date().toISOString().slice(0, 10)}.png`;
      tengill.click();
    } catch (villa) {
      console.error(villa);
      alert("Tókst ekki að taka skjáskot. Reyndu aftur.");
    } finally {
      hnappur.disabled = false;
    }
  });
});
