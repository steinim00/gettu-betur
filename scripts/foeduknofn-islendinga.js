// Íslendingar í svörum skulu svara með föðurnafni/ættarnafni: fjarlægir svör sem
// eru bara skírnarnafnið þegar fullt nafn er skráð líka. Lagar líka Pompidou-spurninguna.
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

// [fullt nafn (verður að vera í svarlistanum), svör sem á að fjarlægja, svör sem á að bæta við]
const REGLUR = [
  ["hallgerður langbrók", ["hallgerður"], ["hallgerður höskuldsdóttir"]],
  ["egill skallagrímsson", ["egill"], []],
  ["leifur heppni", ["leifur"], []],
  ["matthías jochumsson", ["matthías"], []],
  ["hallgrímur pétursson", ["hallgrímur"], []],
  ["guðbrandur þorláksson", ["guðbrandur"], []],
  ["hulda", [], ["unnur benediktsdóttir"]],
  ["eggert ólafsson", ["eggert"], []],
  ["hrafn sveinbjarnarson", ["hrafn"], []],
  ["kári stefánsson", ["kári"], []],
  ["teresía guðmundsson", ["teresía"], []]
];

(async () => {
  const snap = await db.collection("answers").get();
  let breytt = 0;
  for (const d of snap.docs) {
    const svor = d.data().correctAnswers || [];
    let nyjar = svor.slice();
    for (const [fullt, fjarlaegja, baeta] of REGLUR) {
      if (!nyjar.includes(fullt)) continue;
      nyjar = nyjar.filter((s) => !fjarlaegja.includes(s));
      baeta.forEach((b) => { if (!nyjar.includes(b)) nyjar.push(b); });
    }
    if (JSON.stringify(nyjar) !== JSON.stringify(svor)) {
      await d.ref.update({ correctAnswers: nyjar });
      breytt++;
      console.log(d.id, JSON.stringify(svor), "->", JSON.stringify(nyjar));
    }
  }
  console.log("Breytti", breytt, "svarlistum.");

  const q = await db.collection("questions").where("text", "==", "Eftir hvaða forseta Frakklands er Pompidou-miðstöðin í París nefnd?").get();
  for (const d of q.docs) {
    await d.ref.update({ text: "Eftir hvaða forseta Frakklands er nýlistasafnið í París nefnt?" });
    console.log("Pompidou-spurning lagfærð:", d.id);
  }
  if (q.empty) console.log("Pompidou-spurning fannst ekki.");
})();
