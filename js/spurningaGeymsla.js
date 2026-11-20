// Spurningasafnið (questions + answers) geymt í vafranum fyrir admin (stjórnborð og leikur.html).
//
// Í stað þess að lesa allar ~2.400 spurningarnar (og ~2.400 svör) í hvert sinn er safnið geymt í
// localStorage og aðeins sótt það sem hefur BREYST. Breytingar eru skráðar í eitt lítið skjal,
// meta/spurningaBreytingar = { breytt: { spurningaID: tími }, uppfaert: tími, alltFra: tími }:
//   - Hver skrifaðgerð admin á questions/answers (sjá merkjaBreyttar) skráir ID-in þar.
//   - Við samstillingu er lesið 1 skjal (meta) + talning (~3 lestrar) + aðeins breyttu spurningarnar.
//   - Skriftur (scripts/) sem breyta mörgum spurningum setja alltFra (sjá scripts/ogilda-spurningasafn.js)
//     og þá er allt sótt upp á nýtt. Ef fjöldi spurninga stemmir ekki er líka allt sótt.
// Virkar á milli tækja (sími/tölva) því breytingaskráin er í gagnagrunninum.
import { db } from "./firebase-config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  documentId,
  getCountFromServer,
  serverTimestamp,
  deleteField,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const LYKILL = "gb_spurningasafn_v1";
const HAMARKSALDUR_MS = 30 * 24 * 3600 * 1000;
const META = doc(db, "meta", "spurningaBreytingar");

// Timestamp þolir ekki JSON - geymt sem { __ts: ms } og vakið aftur.
function ut(v) {
  if (v instanceof Timestamp) return { __ts: v.toMillis() };
  if (Array.isArray(v)) return v.map(ut);
  if (v && typeof v === "object") {
    const o = {};
    for (const k of Object.keys(v)) o[k] = ut(v[k]);
    return o;
  }
  return v;
}
function inn(v) {
  if (Array.isArray(v)) return v.map(inn);
  if (v && typeof v === "object") {
    if (typeof v.__ts === "number" && Object.keys(v).length === 1) return Timestamp.fromMillis(v.__ts);
    const o = {};
    for (const k of Object.keys(v)) o[k] = inn(v[k]);
    return o;
  }
  return v;
}

let minni = null; // { t (vatnsborð, ms netþjóns), hladid (ms), q: Map, a: Map|null }
const ohreint = new Set(); // breytt í þessum flipa - sótt aftur við næstu samstillingu
let sidastaMeta = null;

function lesaGeymslu() {
  if (minni) return minni;
  try {
    const c = JSON.parse(localStorage.getItem(LYKILL) || "null");
    if (!c) return null;
    minni = {
      t: c.t || 0,
      hladid: c.hladid || 0,
      q: new Map(c.q.map(([id, g]) => [id, inn(g)])),
      a: c.a ? new Map(c.a) : null
    };
    return minni;
  } catch (villa) {
    console.warn(villa);
    return null;
  }
}

function vistaGeymslu() {
  if (!minni) return;
  try {
    localStorage.setItem(
      LYKILL,
      JSON.stringify({
        t: minni.t,
        hladid: minni.hladid,
        q: [...minni.q].map(([id, g]) => [id, ut(g)]),
        a: minni.a ? [...minni.a] : null
      })
    );
  } catch (villa) {
    // T.d. localStorage fullt - þá virkar þetta bara innan flipans.
    console.warn("Gat ekki vistað spurningasafnið í vafranum", villa);
  }
}

async function saekjaEftirIds(safn, ids) {
  const nidurstodur = new Map();
  for (let i = 0; i < ids.length; i += 30) {
    const biti = ids.slice(i, i + 30);
    const snap = await getDocs(query(collection(db, safn), where(documentId(), "in", biti)));
    snap.forEach((d) => nidurstodur.set(d.id, d.data()));
  }
  return nidurstodur;
}

let samstillingIGangi = null;

// Skilar { q: Map(id -> gögn), a: Map(id -> correctAnswers) | null }.
// medSvorum: sækir líka answers (Verkefni-flipinn). alltFerskt: hunsar geymsluna.
export function samstillaSpurningasafn({ medSvorum = false, alltFerskt = false } = {}) {
  // Samhliða köll deila einni samstillingu (nema beðið sé um meira en sú sem er í gangi).
  if (samstillingIGangi && !alltFerskt && (!medSvorum || samstillingIGangi.medSvorum)) return samstillingIGangi.lofordi;
  const lofordi = (async () => {
    const [metaSnap, talning] = await Promise.all([getDoc(META), getCountFromServer(collection(db, "questions"))]);
    const meta = metaSnap.exists() ? metaSnap.data() : {};
    sidastaMeta = meta;
    const vatnsbord = meta.uppfaert?.toMillis?.() || 0;
    const c = alltFerskt ? null : lesaGeymslu();
    const fjoldi = talning.data().count;
    const allt =
      !c ||
      Date.now() - c.hladid > HAMARKSALDUR_MS ||
      (meta.alltFra?.toMillis?.() || 0) > c.t ||
      c.q.size !== fjoldi;

    if (allt) {
      const [qs, as] = await Promise.all([
        getDocs(collection(db, "questions")),
        medSvorum ? getDocs(collection(db, "answers")) : Promise.resolve(null)
      ]);
      minni = {
        t: vatnsbord,
        hladid: Date.now(),
        q: new Map(qs.docs.map((d) => [d.id, d.data()])),
        a: as ? new Map(as.docs.map((d) => [d.id, d.data().correctAnswers || []])) : null
      };
      ohreint.clear();
    } else {
      const breytt = new Set(ohreint);
      Object.entries(meta.breytt || {}).forEach(([id, t]) => {
        if ((t?.toMillis?.() || 0) > c.t) breytt.add(id);
      });
      const ids = [...breytt];
      ohreint.clear();
      const vantarSvor = medSvorum && !c.a;
      const [nyjarQ, nyjarA, allarA] = await Promise.all([
        ids.length ? saekjaEftirIds("questions", ids) : Promise.resolve(new Map()),
        ids.length && c.a && !vantarSvor ? saekjaEftirIds("answers", ids) : Promise.resolve(new Map()),
        vantarSvor ? getDocs(collection(db, "answers")) : Promise.resolve(null)
      ]);
      ids.forEach((id) => {
        if (nyjarQ.has(id)) c.q.set(id, nyjarQ.get(id));
        else c.q.delete(id);
        if (c.a && !vantarSvor) {
          if (nyjarA.has(id)) c.a.set(id, nyjarA.get(id).correctAnswers || []);
          else c.a.delete(id);
        }
      });
      if (allarA) c.a = new Map(allarA.docs.map((d) => [d.id, d.data().correctAnswers || []]));
      c.t = Math.max(c.t, vatnsbord);
      minni = c;
    }
    vistaGeymslu();
    return minni;
  })();
  samstillingIGangi = { lofordi, medSvorum };
  lofordi.finally(() => {
    if (samstillingIGangi && samstillingIGangi.lofordi === lofordi) samstillingIGangi = null;
  });
  return lofordi;
}

// Skjal-lík hlutir svo eldri kóði (snap.docs, d.id, d.data(), d.ref, forEach, size, empty) virki óbreyttur.
function semSnap(safn, faerslur) {
  const docs = faerslur.map(([id, gogn]) => ({ id, ref: doc(db, safn, id), exists: () => true, data: () => gogn }));
  return { docs, size: docs.length, empty: docs.length === 0, forEach: (f) => docs.forEach(f) };
}
export function spurningaSnap(c, sia = null) {
  const faerslur = [...c.q];
  return semSnap("questions", sia ? faerslur.filter(([, g]) => sia(g)) : faerslur);
}
export function svaraSnap(c) {
  return semSnap("answers", [...(c.a || new Map())].map(([id, svor]) => [id, { correctAnswers: svor }]));
}

// Skráir að spurningar (eða svör þeirra) hafi breyst - allir vafrar admin sækja þær aftur við næstu
// samstillingu. Gamlar færslur (> 31 dagur) eru hreinsaðar burt um leið.
export async function merkjaBreyttar(ids) {
  const einstok = [...new Set(ids)].filter(Boolean);
  if (einstok.length === 0) return;
  einstok.forEach((id) => ohreint.add(id));
  const breytt = {};
  einstok.forEach((id) => (breytt[id] = serverTimestamp()));
  const mork = Date.now() - 31 * 24 * 3600 * 1000;
  Object.entries(sidastaMeta?.breytt || {}).forEach(([id, t]) => {
    if (!(id in breytt) && (t?.toMillis?.() || 0) < mork) breytt[id] = deleteField();
  });
  try {
    await setDoc(META, { breytt, uppfaert: serverTimestamp() }, { merge: true });
  } catch (villa) {
    console.error("Tókst ekki að skrá breyttar spurningar", villa);
  }
}

// Spurninga-/svarauðkenni út frá slóð skjals ("questions/ID" eða "answers/ID"), annars null.
export function spurningaIdUrSlod(slod) {
  const m = /^(questions|answers)\/([^/]+)$/.exec(slod || "");
  return m ? m[2] : null;
}

export function hreinsaSpurningasafn() {
  minni = null;
  try {
    localStorage.removeItem(LYKILL);
  } catch (villa) {
    console.warn(villa);
  }
}
