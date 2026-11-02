// Bætir The Infinite Monkey Cage og In Our Time við Hlaðvörp (Áhugavert efni),
// tekur lýsinguna af 2021-keppninni og sleppir hlekkjum sem eru þegar til.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const NYIR = [
  {
    flokkur: "Hlaðvörp",
    takn: "🎧",
    titill: "The Infinite Monkey Cage",
    lysing: "Vísindi og húmor frá BBC - vísindamenn og grínistar taka eitt efni fyrir í hverjum þætti.",
    slod: "https://open.spotify.com/show/6Ijz5uEUxN6FvJI49ZGJAJ",
    mynd: "images/ahugavert/infinite-monkey-cage.jpg"
  },
  {
    flokkur: "Hlaðvörp",
    takn: "🎧",
    titill: "In Our Time",
    lysing: "BBC Radio 4: fræðimenn ræða eitt efni úr sögu, vísindum, bókmenntum eða heimspeki í hverjum þætti.",
    slod: "https://open.spotify.com/show/17YfG23eMbfLBaDPqucgzZ",
    mynd: "images/ahugavert/in-our-time.jpg"
  }
];

(async () => {
  const snap = await db.collection("ahugavert").get();
  const slodir = new Set(snap.docs.map((d) => d.data().slod));
  for (const d of snap.docs) {
    if (/^\d{4}$/.test(d.data().takn || "") && d.data().lysing) await d.ref.update({ lysing: "" });
  }
  const grunn = Date.now();
  let fjoldi = 0;
  for (const [i, h] of NYIR.entries()) {
    if (slodir.has(h.slod)) continue;
    await db.collection("ahugavert").add({ ...h, createdAt: admin.firestore.Timestamp.fromMillis(grunn + i * 1000) });
    fjoldi++;
  }
  console.log(`Bætti við ${fjoldi} hlaðvörpum; lýsing tekin af keppnum.`);
})();
