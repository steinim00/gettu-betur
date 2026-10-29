// Sameinar "Eðlis- og efnafræði" inn í "Vísindasaga" og setur sameinuðu glærurnar
// (/tmp/vs/slides_final.json) á Vísindasaga-verkefnið.
const fs = require("fs");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();
const VISINDASAGA = "wCC28TzKy7aQUGV9zREM";
const EDLIS = "eOgIohjYywycfVFywgyf";
(async () => {
  const glaerur = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const edlis = await db.collection("questions").where("verkefniId", "==", EDLIS).get();
  const batch = db.batch();
  edlis.docs.forEach((d) => batch.update(d.ref, { verkefniId: VISINDASAGA }));
  batch.update(db.doc("verkefni/" + VISINDASAGA), { slides: glaerur });
  await batch.commit();
  await db.doc("verkefni/" + EDLIS).delete();
  const eftir = await db.collection("questions").where("verkefniId", "==", VISINDASAGA).get();
  console.log(`Færði ${edlis.size} spurningar; Vísindasaga hefur nú ${eftir.size} spurningar og ${glaerur.length} glærur; Eðlis- og efnafræði eytt.`);
})();
