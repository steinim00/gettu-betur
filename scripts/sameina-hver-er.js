// Sameinar "Hver er" verkefnin (höfundar, leikarar, íþróttir, kennileiti,
// listaverk) í eitt verkefni, "Hver er", og felur það fyrir nemendum
// (active: false - admin sér það samt í forskoðun). Spurningarnar fylgja með
// og halda myndunum. Verkefnin sem tæmast eru eydd.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const TITLAR = [
  "Hver er höfundurinn?",
  "Hver er íslenski leikarinn?",
  "Frægir tennisleikarar",
  "Frægir golfarar",
  "Frægir knattspyrnukappar",
  "Ökuþórar í Formúlu 1",
  "Umhverfis jörðina á 80 stöðum I",
  "Umhverfis jörðina á 80 stöðum II",
  "Fræg listaverk",
  "Minna þekkt listaverk",
  "Fræg íslensk listaverk"
];

async function main() {
  const gomul = [];
  for (const t of TITLAR) {
    const s = await db.collection("verkefni").where("title", "==", t).get();
    s.forEach((d) => gomul.push(d.id));
  }
  console.log(`Fann ${gomul.length} verkefni til að sameina.`);

  const nyttSnap = await db.collection("verkefni").where("title", "==", "Hver er").get();
  let nyttId;
  if (nyttSnap.empty) {
    const ref = await db.collection("verkefni").add({
      title: "Hver er",
      slides: [],
      active: false, // falið fyrir nemendum - admin kveikir þegar það á að birtast
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    nyttId = ref.id;
  } else {
    nyttId = nyttSnap.docs[0].id;
    await nyttSnap.docs[0].ref.update({ active: false, leyfdirNotendur: admin.firestore.FieldValue.delete() });
  }

  let faert = 0;
  for (const id of gomul) {
    const q = await db.collection("questions").where("verkefniId", "==", id).get();
    let batch = db.batch();
    let n = 0;
    for (const d of q.docs) {
      batch.update(d.ref, { verkefniId: nyttId });
      faert++;
      if (++n >= 400) {
        await batch.commit();
        batch = db.batch();
        n = 0;
      }
    }
    if (n) await batch.commit();
    await db.collection("verkefni").doc(id).delete();
  }
  console.log(`Færði ${faert} spurningar í verkefnið "Hver er" (${nyttId}), óvirkt fyrir nemendur. Eyddi ${gomul.length} gömlum verkefnum.`);
}
main().catch((v) => {
  console.error(v);
  process.exit(1);
});
