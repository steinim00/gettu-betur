// Býr til / uppfærir meta/virkarSpurningar (spurningaID -> verkefniID fyrir virkar spurningar).
// Admin-síðan gerir þetta sjálfkrafa þegar hún er opnuð; þetta skripta er fyrir handvirka keyrslu.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

(async () => {
  const snap = await db.collection("questions").where("active", "==", true).get();
  const spurningar = {};
  snap.docs.sort((a, b) => (a.id < b.id ? -1 : 1)).forEach((d) => {
    if (d.data().verkefniId) spurningar[d.id] = d.data().verkefniId;
  });
  await db.collection("meta").doc("virkarSpurningar").set({ spurningar, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  console.log(`Yfirlit skráð: ${Object.keys(spurningar).length} virkar spurningar.`);
})();
