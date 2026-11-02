// Bætir Gettu betur 1999 og 2000 (RÚV) við "Gamlar keppnir" í Áhugavert efni.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const KEPPNIR = [
  [2000, "https://www.ruv.is/sjonvarp/spila/gettu-betur-2000/29849/8sl64h"],
  [1999, "https://www.ruv.is/sjonvarp/spila/gettu-betur-1999/29848/8sksc7"]
];

(async () => {
  const til = await db.collection("ahugavert").get();
  const slodir = new Set(til.docs.map((d) => d.data().slod));
  const grunn = Date.now();
  let fjoldi = 0;
  for (const [i, [ar, slod]] of KEPPNIR.entries()) {
    if (slodir.has(slod)) continue;
    await db.collection("ahugavert").add({
      flokkur: "Gamlar keppnir",
      takn: String(ar),
      titill: String(ar),
      lysing: "",
      slod,
      mynd: `images/ahugavert/ruv-${ar}.jpg`,
      createdAt: admin.firestore.Timestamp.fromMillis(grunn + i * 1000)
    });
    fjoldi++;
  }
  console.log(`Bætti við ${fjoldi} keppnum.`);
})();
