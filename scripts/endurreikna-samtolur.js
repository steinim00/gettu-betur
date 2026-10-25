// Einskiptis skrifta: fjoldiRett/fjoldiPass/fjoldiSvarad/verkefnaStada á
// users/{uid} eru jafnóðum-taldir (sjá uppfaeraSamtoluStodu í js/quiz.js) -
// svöruðu réttilega eftir þeirri erSvarRett sem gilti ÞEGAR svarað var.
// Eftir nokkrar lagfæringar á erSvarRett ("eða"-klofning í svargögnum,
// töluorð 1-20, ákveðinn greinir sleppt, raðtölupunktur) eru þessar tölur
// orðnar vantaldar fyrir svör sem áður voru ranglega metin röng. Þessi
// skrifta endurreiknar þær ALVEG FRÁ GRUNNI út frá núverandi attempts +
// núverandi (löguðu) erSvarRett - frekar en að reyna að gera "diff"-
// leiðréttingu á gömlu tölunum.
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

// Nær nákvæmlega sömu erSvarRett (+ hjálparföllin sem hún notar) og er í
// lifandi kóðanum núna - sneitt beint úr skránni svo engin hætta sé á að
// afrit hér fari úr takti við raunverulegu einkunnagjöfina.
const kvizSrc = fs.readFileSync(path.join(__dirname, "..", "js", "quiz.js"), "utf8");
const start = kvizSrc.indexOf("function samraema(text)");
const end = kvizSrc.indexOf("function formatSkjatimi");
eval(kvizSrc.slice(start, end));

const SLEPPT_MERKI = "__sleppt__";

async function main() {
  const [notendurSnap, spurningarSnap, svorSnap] = await Promise.all([
    db.collection("users").get(),
    db.collection("questions").get(),
    db.collection("answers").get()
  ]);

  const verkefniIdPerSpurningu = new Map(spurningarSnap.docs.map((d) => [d.id, d.data().verkefniId]));
  const rettSvorPerSpurningu = new Map(svorSnap.docs.map((d) => [d.id, d.data().correctAnswers || []]));

  let notendurBreyttir = 0;

  for (const notandaDoc of notendurSnap.docs) {
    const notandi = notandaDoc.data();
    if (notandi.role === "admin") continue;

    const attemptsSnap = await db.collection("users").doc(notandaDoc.id).collection("attempts").get();
    if (attemptsSnap.empty) continue;

    let fjoldiSvarad = 0;
    let fjoldiPass = 0;
    let fjoldiRett = 0;
    const verkefnaStada = {};

    attemptsSnap.forEach((attemptDoc) => {
      const svar = attemptDoc.data().svar;
      const verkefniId = verkefniIdPerSpurningu.get(attemptDoc.id);

      fjoldiSvarad++;
      if (verkefniId) {
        if (!verkefnaStada[verkefniId]) verkefnaStada[verkefniId] = { svarad: 0, pass: 0, rett: 0 };
        verkefnaStada[verkefniId].svarad++;
      }

      if (svar === SLEPPT_MERKI) {
        fjoldiPass++;
        if (verkefniId) verkefnaStada[verkefniId].pass++;
        return;
      }

      const rettSvor = rettSvorPerSpurningu.get(attemptDoc.id) || [];
      if (erSvarRett(svar, rettSvor)) {
        fjoldiRett++;
        if (verkefniId) verkefnaStada[verkefniId].rett++;
      }
    });

    // Talning á "Byrja aftur" er ekki leidd af svörunum - flytjum hana yfir svo
    // endurreikningurinn eyði henni ekki.
    for (const [vid, gamalt] of Object.entries(notandi.verkefnaStada || {})) {
      if (!gamalt.byrjadAftur) continue;
      if (!verkefnaStada[vid]) verkefnaStada[vid] = { svarad: 0, pass: 0, rett: 0 };
      verkefnaStada[vid].byrjadAftur = gamalt.byrjadAftur;
      if (gamalt.sidastByrjadAftur) verkefnaStada[vid].sidastByrjadAftur = gamalt.sidastByrjadAftur;
    }

    const breyttiEinhverju =
      notandi.fjoldiSvarad !== fjoldiSvarad || notandi.fjoldiPass !== fjoldiPass || notandi.fjoldiRett !== fjoldiRett;

    await notandaDoc.ref.update({ fjoldiSvarad, fjoldiPass, fjoldiRett, verkefnaStada });

    if (breyttiEinhverju) {
      notendurBreyttir++;
      console.log(
        `${notandi.nafn}: fjoldiRett ${notandi.fjoldiRett ?? 0} -> ${fjoldiRett} (svarad ${notandi.fjoldiSvarad ?? 0} -> ${fjoldiSvarad}, pass ${notandi.fjoldiPass ?? 0} -> ${fjoldiPass})`
      );
    } else {
      console.log(`${notandi.nafn}: engin breyting (fjoldiRett ${fjoldiRett}).`);
    }
  }

  console.log(`\nEndurreiknaði ${notendurBreyttir} notanda/notendur með breyttum tölum.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
