// LESTRARSKRIFTA (skrifar ekkert): kannar hversu margar spurningar eiga
// svar sem er margra orða nafn (líklega manneskja) án þess að stytt
// útgáfa (eftirnafn fyrir erlenda, eigin-/eftirnafn án millinafna fyrir
// Íslendinga) sé þegar á meðal samþykktra svara.
//
// Heuristík:
// - Spurningatexti verður að líkjast "hver" spurningu (annars er svarið
//   sjaldan mannsnafn) - annars sleppt til að forðast rangar jákvæðar.
// - Samþykkt svar er "nafn-líkt" ef það er 2+ orð, EKKERT orðanna er
//   hreint tölustafur, og textinn inniheldur ekki orð sem benda til að
//   þetta sé ekki nafn (t.d. "og", "the", dagsetningar).
// - Íslenskt nafn = síðasta orð endar á -son/-dóttir/-dottir (ævaforn
//   íslensk ættarnafnahefð er sjaldgæf, patronym algengast).
//   -> stytt útgáfa sem leitað er að: fyrsta + síðasta orð.
// - Erlent nafn = allt annað fjölorða nafn.
//   -> stytt útgáfa sem leitað er að: síðasta orðið eitt og sér.
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

const HVER_MYNSTUR = /^(hver|hverjir|hverjar|hvert var nafn|hvað hét)\b/i;
const ISL_ENDINGAR = /(son|sson|dóttir|dottir)$/i;

function erNafnLikt(svar) {
  const ord = svar.trim().split(/\s+/);
  if (ord.length < 2) return false;
  if (ord.some((o) => /^\d+$/.test(o))) return false;
  if (ord.some((o) => ["og", "the", "of", "frá", "í", "á"].includes(o))) return false;
  return true;
}

async function main() {
  const [spurningarSnap, svorSnap, verkefnaSnap] = await Promise.all([
    db.collection("questions").get(),
    db.collection("answers").get(),
    db.collection("verkefni").get()
  ]);

  const svorMap = new Map(svorSnap.docs.map((d) => [d.id, d.data().correctAnswers || []]));
  const verkefnaTitlar = new Map(verkefnaSnap.docs.map((d) => [d.id, d.data().title]));

  const vantarStytt = [];
  let heildHverSpurningar = 0;

  for (const qDoc of spurningarSnap.docs) {
    const spurning = qDoc.data();
    const texti = spurning.text || "";
    if (!HVER_MYNSTUR.test(texti.trim())) continue;
    heildHverSpurningar++;

    const svor = svorMap.get(qDoc.id) || [];
    for (const svar of svor) {
      if (!erNafnLikt(svar)) continue;
      const ord = svar.trim().split(/\s+/);
      const sidastaOrd = ord[ord.length - 1];
      const erIslenskt = ISL_ENDINGAR.test(sidastaOrd);
      const styttUtgafa = erIslenskt ? `${ord[0]} ${sidastaOrd}` : sidastaOrd;

      if (styttUtgafa === svar) continue; // þegar stutt
      if (svor.includes(styttUtgafa)) continue; // stytt útgáfa þegar til

      vantarStytt.push({
        id: qDoc.id,
        verkefni: verkefnaTitlar.get(spurning.verkefniId) || "(ótengt)",
        texti,
        fulltSvar: svar,
        stungidUppA: styttUtgafa,
        tegund: erIslenskt ? "íslenskt" : "erlent"
      });
    }
  }

  console.log(`Skoðaði ${heildHverSpurningar} "hver"-spurningar af ${spurningarSnap.size} spurningum alls.`);
  console.log(`Fann ${vantarStytt.length} svör sem gætu vantað styttri/eftirnafns-útgáfu.\n`);

  vantarStytt.forEach((v, i) => {
    console.log(`${i + 1}. [${v.tegund}] (${v.verkefni})`);
    console.log(`   Spurning: ${v.texti}`);
    console.log(`   Núverandi svar: "${v.fulltSvar}"  ->  Stinga upp á að bæta við: "${v.stungidUppA}"`);
  });

  fs.writeFileSync(path.join(__dirname, "eftirnofn-uppastungur.json"), JSON.stringify(vantarStytt, null, 2), "utf8");
  console.log(`\nVistaði fullan lista í eftirnofn-uppastungur.json (${vantarStytt.length} færslur).`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
