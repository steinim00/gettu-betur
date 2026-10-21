// Setur tengil á Google Form (formSlod) á verkefni.
// Notkun: node scripts/setja-form-slod.js "<titill verkefnis>" "<slóð>"
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
(async () => {
  const [titill, slod] = process.argv.slice(2);
  const s = await db.collection("verkefni").where("title", "==", titill).get();
  if (s.size !== 1) throw new Error(`Fann ${s.size} verkefni með titilinn "${titill}"`);
  await s.docs[0].ref.update({ formSlod: slod });
  console.log(`Setti formSlod á "${titill}" (${s.docs[0].id}): ${slod}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
