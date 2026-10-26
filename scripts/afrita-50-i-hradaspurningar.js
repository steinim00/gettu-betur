// Afritar virkar spurningar úr "50 áhrifamiklir einstaklingar í sögunni" í
// "Hraðaspurningar" sem NÝJAR spurningar (ósvaraðar hjá öllum) og hreinsar
// svör við "Hver sagði „Teningunum er kastað“?" svo hún sé líka ósvöruð.
// Keyrsla: NODE_PATH=... node scripts/afrita-50-i-hradaspurningar.js
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

const HRADA = "nNY4cv1gLiIDGcm9vieu";
const FIMMTIU = "8LqMijZ2qpfWjZifxci0";
const TENINGAR_ID = "HGHWkhNer2cso8bTqRjO";

(async () => {
  const snap = await db.collection("questions").where("verkefniId", "==", FIMMTIU).get();
  const virkar = snap.docs
    .filter((d) => d.data().active)
    .sort((a, b) => (a.data().createdAt?.toMillis() ?? 0) - (b.data().createdAt?.toMillis() ?? 0));

  const hradaSnap = await db.collection("questions").where("verkefniId", "==", HRADA).get();
  const afritad = new Set(hradaSnap.docs.map((d) => d.data().afritadFra).filter(Boolean));

  const grunn = Date.now();
  let batch = db.batch();
  let n = 0;
  let nyjar = 0;
  for (const [i, d] of virkar.entries()) {
    if (afritad.has(d.id)) continue;
    const g = d.data();
    const nyRef = db.collection("questions").doc();
    const nytt = {
      text: g.text,
      verkefniId: HRADA,
      active: true,
      createdAt: admin.firestore.Timestamp.fromMillis(grunn + i),
      afritadFra: d.id
    };
    for (const k of ["image", "imageAlt", "imageCredit"]) if (g[k]) nytt[k] = g[k];
    const svarSnap = await db.collection("answers").doc(d.id).get();
    batch.set(nyRef, nytt);
    batch.set(db.collection("answers").doc(nyRef.id), { correctAnswers: svarSnap.data()?.correctAnswers || [] });
    nyjar++;
    n += 2;
    if (n >= 480) { await batch.commit(); batch = db.batch(); n = 0; }
  }
  if (n) await batch.commit();
  console.log("Afritaði", nyjar, "spurningar í Hraðaspurningar.");

  const notendur = await db.collection("users").get();
  for (const u of notendur.docs) {
    const ref = u.ref.collection("attempts").doc(TENINGAR_ID);
    if ((await ref.get()).exists) {
      await ref.delete();
      console.log("Eyddi svari við „Hver sagði …“ hjá", u.data().nafn || u.id);
    }
  }
})();
