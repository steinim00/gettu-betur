// Sérverkefni 2 (fyrir prófið í des. 2026): ný glærusöfn + 20 spurningar fyrir Júlíu (listaverk), Hinrik
// (sumarólympíuleikar) og Heklu (erlend dægurlög 5 og 6). Fyrri sérverkefni þeirra eru falin (active: false) en gögnin haldast - til að sýna þau
// aftur: setja active: true á verkefni/serverkefni-julia, -hinrik eða -hekla. Keyra má aftur (sama skjal-ID = uppfærsla).
// Notkun: NODE_PATH=... node serverkefni2.js  (keyrðu svo samstilla-spurningayfirlit.js)
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
const { SPURNINGAR } = require("./serverkefni2-gogn.js");
const GLAERUR = require("../data/serverkefni2-glaerur.json");

const NEMENDUR = {
  julia: "PJmAw5RLfzdrobwL4VZRCfXn4nz2",
  hinrik: "5TkIf8dyi7T3EoAE10na2eR2xLl1",
  hekla: "UstjfzH6XGe53zBVhECrcAdEki63"
};
const ADEINS = process.argv[2]; // t.d. "hekla" - keyra bara fyrir einn nemanda
const VERKEFNI = [
  { id: "serverkefni2-julia", nemandi: "julia", gamla: "serverkefni-julia", title: "Listaverk: 51 frægustu og 51 minna þekkt" },
  { id: "serverkefni2-hinrik", nemandi: "hinrik", gamla: "serverkefni-hinrik", title: "Svipmyndir af sumarólympíuleikum" },
  { id: "serverkefni2-hekla", nemandi: "hekla", gamla: "serverkefni-hekla", title: "Erlend dægurlög 5 og 6 (1980–2000)" }
];

(async () => {
  const grunn = Date.now();
  for (const v of VERKEFNI.filter((x) => !ADEINS || x.nemandi === ADEINS)) {
    const ref = db.doc(`verkefni/${v.id}`);
    const til = await ref.get();
    const slides = GLAERUR[v.nemandi];
    await ref.set({
      title: v.title,
      slides,
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
    // Spurningar umfram fjöldann (t.d. 21-30 frá fyrri keyrslu) eru gerðar óvirkar.
    for (let i = SPURNINGAR[v.nemandi].length + 1; i <= 30; i++) {
      const qid = `${v.id}-${String(i).padStart(2, "0")}`;
      if ((await db.doc(`questions/${qid}`).get()).exists) batch.update(db.doc(`questions/${qid}`), { active: false });
    }
    batch.update(db.doc(`verkefni/${v.gamla}`), { active: false });
    await batch.commit();
    console.log(`${v.title}: ${slides.length} glærur (${slides.filter((s) => s.image).length} með mynd), ${SPURNINGAR[v.nemandi].length} spurningar; ${v.gamla} falið`);
  }
})();
