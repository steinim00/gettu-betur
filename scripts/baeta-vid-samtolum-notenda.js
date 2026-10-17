// Einskiptis bakfylling: reiknar heildartölfræði hvers notanda
// (fjoldiSvarad/fjoldiRett/fjoldiPass/verkefnaStada/sidastSvaradAt) útfrá
// núverandi attempts-skjölum og vistar beint á users/{uid}.
//
// Ástæða: stjórnborðið (js/admin.js, hladaNotendayfirlit) endurreiknaði
// þessar tölur í hvert sinn með því að lesa attempts-undirsafn HVERS
// notanda í sérstakri fyrirspurn (N+1 mynstur), á 5 mín fresti meðan
// stjórnborðið var opið - það var að klára daglega Firestore-lestrarkvótann
// (Spark-áætlun, 50K/dag). js/quiz.js heldur þessum tölum núna réttum
// jafnóðum (sjá uppfaeraSamtoluStodu) þegar nemandi svarar spurningu, svo
// stjórnborðið þurfi bara að lesa users-safnið einu sinni. En núverandi
// notendur eiga enga slíka samtölu ennþá - þessi skrifta keyrir einu sinni
// til að fylla hana út afturvirkt svo sagan tapist ekki.
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

const SLEPPT_MERKI = "__sleppt__";

function ritstjornarfjarlaegd(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let fyrriRod = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const nyRod = [i];
    for (let j = 1; j <= n; j++) {
      nyRod[j] =
        a[i - 1] === b[j - 1]
          ? fyrriRod[j - 1]
          : 1 + Math.min(fyrriRod[j - 1], fyrriRod[j], nyRod[j - 1]);
    }
    fyrriRod = nyRod;
  }
  return fyrriRod[n];
}

function erSvarRett(svar, rettSvor) {
  if (rettSvor.includes(svar)) return true;
  if (/\d/.test(svar)) return false;

  return rettSvor.some((r) => {
    if (/\d/.test(r)) return false;
    const thol = r.length <= 4 ? 0 : r.length <= 8 ? 1 : 2;
    if (thol === 0) return false;
    if (Math.abs(r.length - svar.length) > thol) return false;
    return ritstjornarfjarlaegd(svar, r) <= thol;
  });
}

async function main() {
  const [questionsSnap, answersSnap, attemptsSnap] = await Promise.all([
    db.collection("questions").get(),
    db.collection("answers").get(),
    db.collectionGroup("attempts").get()
  ]);

  const verkefniPerSpurningu = new Map(questionsSnap.docs.map((d) => [d.id, d.data().verkefniId || ""]));
  const rettSvorMap = new Map(answersSnap.docs.map((d) => [d.id, d.data().correctAnswers || []]));

  const perNotandi = new Map();

  for (const attemptDoc of attemptsSnap.docs) {
    const uid = attemptDoc.ref.parent.parent.id;
    const questionId = attemptDoc.id;
    const gogn = attemptDoc.data();
    const verkefniId = verkefniPerSpurningu.get(questionId) || "";

    if (!perNotandi.has(uid)) {
      perNotandi.set(uid, { fjoldiSvarad: 0, fjoldiPass: 0, fjoldiRett: 0, verkefnaStada: new Map(), sidastSvaradMs: 0 });
    }
    const n = perNotandi.get(uid);
    n.fjoldiSvarad++;

    // Spurningar án verkefniId ("Ótengdar spurningar") eru taldar með í
    // heildartölunum en sleppt úr verkefnaStada-sundurliðuninni - sama
    // hegðun og uppfaeraSamtoluStodu í js/quiz.js notar jafnóðum.
    let v = null;
    if (verkefniId) {
      if (!n.verkefnaStada.has(verkefniId)) n.verkefnaStada.set(verkefniId, { svarad: 0, pass: 0, rett: 0 });
      v = n.verkefnaStada.get(verkefniId);
      v.svarad++;
    }

    if (gogn.svar === SLEPPT_MERKI) {
      n.fjoldiPass++;
      if (v) v.pass++;
    } else if (erSvarRett(gogn.svar, rettSvorMap.get(questionId) || [])) {
      n.fjoldiRett++;
      if (v) v.rett++;
    }

    const timi = gogn.answeredAt?.toMillis?.() ?? 0;
    if (timi > n.sidastSvaradMs) n.sidastSvaradMs = timi;
  }

  let batch = db.batch();
  let fjoldiIBatch = 0;
  let heild = 0;

  for (const [uid, n] of perNotandi.entries()) {
    const verkefnaStada = {};
    for (const [verkefniId, v] of n.verkefnaStada.entries()) {
      verkefnaStada[verkefniId] = v;
    }

    const gildi = {
      fjoldiSvarad: n.fjoldiSvarad,
      fjoldiPass: n.fjoldiPass,
      fjoldiRett: n.fjoldiRett,
      verkefnaStada
    };
    if (n.sidastSvaradMs > 0) {
      gildi.sidastSvaradAt = admin.firestore.Timestamp.fromMillis(n.sidastSvaradMs);
    }

    batch.set(db.collection("users").doc(uid), gildi, { merge: true });
    fjoldiIBatch++;
    heild++;

    if (fjoldiIBatch >= 450) {
      await batch.commit();
      batch = db.batch();
      fjoldiIBatch = 0;
    }
  }
  if (fjoldiIBatch > 0) await batch.commit();

  console.log(`Bakfyllti samtölur fyrir ${heild} notendur (${attemptsSnap.size} attempts-skjöl samtals).`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
