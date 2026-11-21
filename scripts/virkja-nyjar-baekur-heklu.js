// Einskiptis skrifta: gerir nýju bókaspurningarnar (jólin 2026, sjá baeta-vid-nyjum-bokum-2026.js) virkar.
// "Bókalisti" verkefnið er virkt og aðeins sýnilegt Heklu (leyfdirNotendur), svo þær sjást bara hjá henni.
// Útkall: nýju Útkall-spurningunum er eytt - í staðinn bætist nýja kápan við eldri spurninguna
// 'Hver skrifaði "Útkall"?' (aukaMyndir, birtist hlið við hlið við eldri kápuna).
// Uppfærir meta/virkarSpurningar (nemendayfirlit) og meta/spurningaBreytingar (minni stjórnborðs) beint.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
const FV = admin.firestore.FieldValue;
const VERKEFNI = "Hli3E3djhF2kOokdDP1Z"; // Bókalisti
const NY_UTKALL_KAPA = "myndir/baekur/utkall-bjargvaettir-i-hamforum.webp";

(async () => {
  const v = (await db.collection("verkefni").doc(VERKEFNI).get()).data();
  if (v.title !== "Bókalisti" || !v.active) throw new Error("Bókalisti fannst ekki eða er óvirkt");
  console.log("Sýnilegt:", JSON.stringify(v.leyfdirNotendur));

  const q = await db.collection("questions").where("verkefniId", "==", VERKEFNI).get();
  const nyjar = q.docs.filter((d) => (d.data().image || "").endsWith(".webp") && !d.data().active);
  const nyttUtkall = nyjar.filter((d) => d.data().image === NY_UTKALL_KAPA);
  const virkja = nyjar.filter((d) => d.data().image !== NY_UTKALL_KAPA);
  const gamlaUtkall = q.docs.find((d) => d.data().text === 'Hver skrifaði "Útkall"?');
  if (nyttUtkall.length !== 2 || virkja.length !== 12 || !gamlaUtkall) {
    throw new Error(`Óvænt staða: ${nyttUtkall.length} Útkall, ${virkja.length} til að virkja, gamla Útkall ${!!gamlaUtkall}`);
  }

  const batch = db.batch();
  const breyttIds = [];
  nyttUtkall.forEach((d) => {
    batch.delete(d.ref);
    batch.delete(db.collection("answers").doc(d.id));
    breyttIds.push(d.id);
    console.log("- eyði:", d.data().text);
  });
  const bokDocs = await db.collection("bokalisti").where("titill", "==", "Útkall: Bjargvættir í hamförum").get();
  bokDocs.forEach((d) => batch.delete(d.ref));

  batch.update(gamlaUtkall.ref, { aukaMyndir: FV.arrayUnion(NY_UTKALL_KAPA) });
  breyttIds.push(gamlaUtkall.id);
  console.log("+ kápa bætt við:", gamlaUtkall.data().text);

  const yfirlit = {};
  virkja.forEach((d) => {
    batch.update(d.ref, { active: true });
    yfirlit[`spurningar.${d.id}`] = VERKEFNI;
    breyttIds.push(d.id);
    console.log("✓ virk:", d.data().text);
  });
  batch.update(db.collection("meta").doc("virkarSpurningar"), { ...yfirlit, updatedAt: FV.serverTimestamp() });
  const breytt = {};
  breyttIds.forEach((id) => (breytt[id] = FV.serverTimestamp()));
  batch.set(db.collection("meta").doc("spurningaBreytingar"), { breytt, uppfaert: FV.serverTimestamp() }, { merge: true });
  await batch.commit();
  console.log(`Lokið: ${virkja.length} virkar, ${nyttUtkall.length} eytt, kápa bætt við Útkall.`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
