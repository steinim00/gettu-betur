// Snýr "Hvaða ár ..." spurningum í Súrt & Sykurlaust við (svarið er þá atburður,
// nafn eða staður í stað ártals). Þær sem ekki er hægt að snúa við fá active:false.
// Hreinsar gömul svör nemenda við breyttu spurningunum (þau voru ártöl).
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

const BREYTA = {
  "76PDEGdx48H2s0t8kFVw": ["Hvaða bandaríski Íslandsvinur og skákáhugamaður ferðaðist um Ísland árið 1879?", ["willard fiske", "fiske", "daniel willard fiske"]],
  "BlL4Bt9bFu2jT7Fmuwyo": ["Hvaða frægu morð áttu sér stað á Rauðasandi árið 1802?", ["sjöundarármorðin", "sjöundá", "sjöundármorðin"]],
  "Kg18q1sFiv6vQen1KtNW": ["Hvaða staður hefur verið aðsetur forseta Íslands frá árinu 1944?", ["bessastaðir", "bessastaðir á álftanesi"]],
  "PQKRiiVj5YdBkhV6cP9z": ["Hvaða háskóli var stofnaður 17. júní 1911, á aldarafmæli Jóns Sigurðssonar?", ["háskóli íslands", "hí"]],
  "PVmKP4fV49AOcdUUeG4F": ["Hvaða leikar eru taldir hafa verið fyrst haldnir árið 776 f.Kr. í Ólympíu í Grikklandi?", ["ólympíuleikarnir", "ólympíuleikar", "ólympíuleikana", "ólympíuleikunum"]],
  "QNpRgbFdwX4OLhMhKkyV": ["Hvaða hlutverk á Íslendingadeginum í Winnipeg lék kona fyrst árið 1924?", ["fjallkonan", "fjallkona", "fjallkonuna"]],
  "UpN5JbYHxtLPSNLMM8cx": ["Hvaða íslenska orða var stofnuð árið 1921?", ["fálkaorðan", "fálkaorða", "hin íslenska fálkaorða", "fálkaorðuna"]],
  "bDE4VPs9DiNreP1fYB3j": ["Hvaða borg grófst í ösku þegar Vesúvíus gaus árið 79 e.Kr.?", ["pompei", "pompeii", "pompeji", "pompeí"]],
  "bmpptbhNH461UyR9eTYS": ["Hvaða íslenska landnemabyggð í Kanada var stofnuð árið 1875?", ["nýja-ísland", "nýja ísland"]],
  "pQDD29E8G7OpO7jB05ED": ["Hvaða fjöldamorð á húgenottum áttu sér stað í París árið 1572?", ["bartólómeusarvígin", "bartólómeusarvíg", "bartólómeusarnóttin", "bartholomeusarvigin"]],
  "qH2gSnlt5UsmIW0bff9e": ["Hvaða dýrum var sleppt í Múlasýslu á árunum 1777-78 og lifðu af á Íslandi?", ["hreindýrum", "hreindýr", "hreindýrunum"]]
};
const SLOKKVA = ["K3sPNzpXJHK9e1nYGb4x", "dUi8FMGlUexFjHvvl8zd"];

(async () => {
  const notendur = await db.collection("users").get();
  for (const [id, [texti, svor]] of Object.entries(BREYTA)) {
    await db.collection("questions").doc(id).update({ text: texti });
    await db.collection("answers").doc(id).set({ correctAnswers: svor });
    for (const u of notendur.docs) {
      const r = u.ref.collection("attempts").doc(id);
      if ((await r.get()).exists) await r.delete();
    }
  }
  for (const id of SLOKKVA) await db.collection("questions").doc(id).update({ active: false });
  console.log("Breytti", Object.keys(BREYTA).length, "spurningum, slökkti á", SLOKKVA.length);
})();
