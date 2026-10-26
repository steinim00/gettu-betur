// Breytingar eftir yfirferð á nýju Súrt & Sykurlaust spurningunum.
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();
const SURT = "AQ9cPoY5QFLQkU6QYx8N";

const BREYTA = [
  ["Hver skrifaði Kommúnistaávarpið ásamt Friedrich Engels?", "Hver skrifaði Kommúnistaávarpið ásamt Karli Marx?", ["friedrich engels", "engels"]],
  ["Hver var forseti Bandaríkjanna í borgarastyrjöldinni og var myrtur í leikhúsi?", "Hver var forseti Bandaríkjanna í borgarastyrjöldinni?", ["abraham lincoln", "lincoln"]],
  ["Hver samdi Pilt og stúlku, sem oft er kölluð fyrsta íslenska skáldsagan?", "Hvaða skáldsaga eftir Jón Thoroddsen er oft kölluð fyrsta íslenska skáldsagan?", ["piltur og stúlka", "pilt og stúlku", "piltur og stulka"]],
  ["Hver skrifaði skáldsöguna Sjálfstætt fólk um Bjart í Sumarhúsum?", "Í hvaða skáldsögu eftir Halldór Laxness er Bjartur í Sumarhúsum aðalpersónan?", ["sjálfstætt fólk"]]
];
const EYDA = ["Hvaða drottning Egyptalands lést af völdum slöngubits samkvæmt sögunni?"];

(async () => {
  const snap = await db.collection("questions").where("verkefniId", "==", SURT).get();
  for (const [gamalt, nytt, svor] of BREYTA) {
    const d = snap.docs.find((x) => x.data().text === gamalt);
    if (!d) { console.log("Fannst ekki:", gamalt); continue; }
    await d.ref.update({ text: nytt });
    await db.collection("answers").doc(d.id).set({ correctAnswers: svor });
    console.log("Breytt:", nytt);
  }
  for (const texti of EYDA) {
    const d = snap.docs.find((x) => x.data().text === texti);
    if (!d) { console.log("Fannst ekki:", texti); continue; }
    await d.ref.delete();
    await db.collection("answers").doc(d.id).delete();
    console.log("Eytt:", texti);
  }
})();
