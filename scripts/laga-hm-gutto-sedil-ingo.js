// Lagfæringar: heimsmeistari 2026 (Spánn), mynd við Gúttóslaginn og 5000 kr seðilinn, Ingó-spurningu eytt.
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();
(async () => {
  const notendur = await db.collection("users").get();
  const hreinsaSvor = async (id) => {
    for (const u of notendur.docs) {
      const r = u.ref.collection("attempts").doc(id);
      if ((await r.get()).exists) await r.delete();
    }
  };
  const finna = async (text) => (await db.collection("questions").where("text", "==", text).get()).docs;

  // 1) Heimsmeistari: 2022 -> 2026 (Spánn), ósvarað hjá öllum
  for (const d of await finna("Hvaða þjóð varð heimsmeistari í fótbolta karla árið 2022?")) {
    await d.ref.update({
      text: "Hvaða þjóð varð heimsmeistari í fótbolta karla árið 2026?",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/e1/FIFA_World_Cup_Trophy_%28Ank_Kumar%2C_Infosys_Limited%29_03.jpg",
      imageAlt: "Heimsmeistarabikarinn",
      imageCredit: "Wikimedia Commons"
    });
    await db.collection("answers").doc(d.id).set({ correctAnswers: ["spánn", "spáni", "spánverjar", "spanverjar"] });
    await hreinsaSvor(d.id);
    console.log("HM lagað:", d.id);
  }
  // 2) Gúttóslagurinn: Gúttó (Góðtemplarahúsið við Templarasund)
  for (const d of await finna("Hvað nefndust átökin sem áttu sér stað í Reykjavík 9. nóvember 1932?")) {
    await d.ref.update({
      image: "https://upload.wikimedia.org/wikipedia/commons/e/e1/The_meeting_%E2%80%93_house_%E2%80%9EG%C3%B3%C3%B0templarah%C3%BAsi%C3%B0%E2%80%9C_on_Templarasund%2C1923-1935.jpg",
      imageAlt: "Góðtemplarahúsið (Gúttó) við Templarasund í Reykjavík",
      imageCredit: "Wikimedia Commons"
    });
    console.log("Gúttó mynd:", d.id);
  }
  // 3) 5000 kr seðillinn: mynd frá Seðlabanka Íslands
  for (const d of await finna("Hver prýðir framhlið 5000 kr seðilsins?")) {
    await d.ref.update({
      image: "https://cb.is/library/?itemid=d10202fa-24f2-400c-beb6-8fb3aedb50ca",
      imageAlt: "5000 króna seðillinn með mynd af Ragnheiði Jónsdóttur",
      imageCredit: "Seðlabanki Íslands"
    });
    console.log("Seðill mynd:", d.id);
  }
  // 4) Ingó veðurguð - eytt
  for (const d of await finna("Hvers son er Ingó veðurguð?")) {
    await hreinsaSvor(d.id);
    await d.ref.delete();
    await db.collection("answers").doc(d.id).delete();
    console.log("Ingó eytt:", d.id, "(í verkefni", d.data().verkefniId, ")");
  }
})();
