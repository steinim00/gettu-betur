// Sérverkefni (nóv. 2026): glærur + spurningar (30) fyrir hvern nemanda, birt á Heim hjá viðkomandi (sjá
// birtaServerkefni í js/quiz.js). Verkefnin eru takmörkuð við nemandann (leyfdirNotendur) og merkt serverkefni: true,
// svo spurningarnar blandist ekki inn í Hraðaspurningar. Keyra má aftur (sama skjal-ID = uppfærsla).
// Notkun: NODE_PATH=... node serverkefni.js  (keyrðu svo samstilla-spurningayfirlit.js)
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
const { STJORNMALASAGA, SPURNINGAR } = require("./serverkefni-gogn.js");

const NEMENDUR = {
  julia: "PJmAw5RLfzdrobwL4VZRCfXn4nz2",
  hekla: "UstjfzH6XGe53zBVhECrcAdEki63",
  hinrik: "5TkIf8dyi7T3EoAE10na2eR2xLl1"
};

(async () => {
  // Júlía: Vísindasaga I (Eðlis- og efnafræði) og II (Uppfinningamenn) - fyrstu tveir hlutar Vísindasögu-verkefnisins.
  const vs = (await db.doc("verkefni/wCC28TzKy7aQUGV9zREM").get()).data().slides;
  const lok = vs.findIndex((s) => /^3\. hluti/.test(s.title));
  const visindasaga = vs.slice(0, lok);

  // Hekla: 61 áhrifamestu kvikmyndir sögunnar (textinn úr glærunum, sama og "Um" í Bíólista) með plakati.
  const myndir = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "biolisti.json"), "utf8"))["Sögufrægustu"];
  const kvikmyndir = [
    { title: "61 áhrifamestu kvikmyndir sögunnar", body: "Kvikmyndasagan frá 1915 til 2009", image: "" },
    ...myndir.map((m) => ({
      title: `${m.titill}${m.islenskt ? ` (${m.islenskt})` : ""} – ${m.ar}`,
      body: m.um || m.lysing || "",
      image: fs.existsSync(path.join(__dirname, "..", "images", "biolisti", `${m.imdb}.jpg`)) ? `images/biolisti/${m.imdb}.jpg` : ""
    }))
  ];

  const VERKEFNI = [
    { id: "serverkefni-julia", nemandi: "julia", title: "Vísindasaga I og II", slides: visindasaga },
    { id: "serverkefni-hekla", nemandi: "hekla", title: "61 áhrifamestu kvikmyndir sögunnar", slides: kvikmyndir },
    { id: "serverkefni-hinrik", nemandi: "hinrik", title: "Stjórnmálasaga Íslands", slides: STJORNMALASAGA }
  ];

  const grunn = Date.now();
  for (const v of VERKEFNI) {
    const ref = db.doc(`verkefni/${v.id}`);
    const til = await ref.get();
    await ref.set({
      title: v.title,
      slides: v.slides,
      active: true,
      serverkefni: true,
      leyfdirNotendur: [NEMENDUR[v.nemandi]],
      createdAt: til.exists ? til.data().createdAt : admin.firestore.Timestamp.now()
    });
    const batch = db.batch();
    SPURNINGAR[v.nemandi].forEach(([texti, svor], i) => {
      const qid = `${v.id}-${String(i + 1).padStart(2, "0")}`;
      batch.set(db.doc(`questions/${qid}`), {
        text: texti,
        verkefniId: v.id,
        active: true,
        createdAt: admin.firestore.Timestamp.fromMillis(grunn + i * 1000)
      });
      batch.set(db.doc(`answers/${qid}`), { correctAnswers: svor.map((s) => s.toLowerCase()) });
    });
    await batch.commit();
    console.log(`${v.title}: ${v.slides.length} glærur, ${myndirMedMynd(v.slides)} með mynd, ${SPURNINGAR[v.nemandi].length} spurningar`);
  }
})();

function myndirMedMynd(slides) {
  return slides.filter((s) => s.image).length;
}
