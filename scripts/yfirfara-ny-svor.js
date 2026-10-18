// Dagleg yfirferð nýrra svara.
//   node scripts/yfirfara-ny-svor.js --athuga   telur ný svör frá síðustu yfirferð; ef >= 100 prentar
//                                               röngu svörin með spurningu og réttum svörum
//   node scripts/yfirfara-ny-svor.js --merkja   merkir að yfirferð sé lokið (færir tímamerkið)
// Lykill: scripts/serviceAccountKey.json eða umhverfisbreytan FIREBASE_SERVICE_ACCOUNT_JSON.
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const LYKILL = path.join(__dirname, "serviceAccountKey.json");
const lykill = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : fs.existsSync(LYKILL)
    ? require(LYKILL)
    : null;
if (!lykill) {
  console.error("VANTAR LYKIL: settu FIREBASE_SERVICE_ACCOUNT_JSON í umhverfið eða scripts/serviceAccountKey.json.");
  process.exit(2);
}
admin.initializeApp({ credential: admin.credential.cert(lykill) });
const db = admin.firestore();

const LAGMARK = 100;
const SLEPPT_MERKI = "__sleppt__";
const merkiRef = db.collection("meta").doc("yfirferdSvara");

function hladaErSvarRett() {
  const kodi = fs.readFileSync(path.join(__dirname, "..", "js", "quiz.js"), "utf8");
  const start = kodi.indexOf("function samraema(text)");
  const end = kodi.indexOf("function formatSkjatimi");
  return new Function(kodi.slice(start, end) + "; return erSvarRett;")();
}

async function nySvor(fra) {
  const notendur = await db.collection("users").get();
  const svor = [];
  for (const n of notendur.docs) {
    if (n.data().role === "admin") continue;
    const q = db.collection("users").doc(n.id).collection("attempts");
    const snap = fra ? await q.where("answeredAt", ">", fra).get() : await q.get();
    snap.forEach((a) => svor.push({ nafn: n.data().name || n.id, qid: a.id, ...a.data() }));
  }
  return svor;
}

async function main() {
  const adgerd = process.argv[2];
  const merkiSnap = await merkiRef.get();
  const fra = merkiSnap.exists ? merkiSnap.data().timi : null;

  if (adgerd === "--merkja") {
    await merkiRef.set({ timi: admin.firestore.Timestamp.now(), merkt: new Date().toISOString() });
    console.log("Yfirferð merkt sem lokið.");
    return;
  }

  const svor = await nySvor(fra);
  const ekkiPass = svor.filter((s) => s.svar !== SLEPPT_MERKI);
  console.log(`Ný svör frá síðustu yfirferð (${fra ? fra.toDate().toISOString() : "aldrei yfirfarið"}): ${svor.length} (þar af ${svor.length - ekkiPass.length} pass)`);
  if (svor.length < LAGMARK) {
    console.log(`Færri en ${LAGMARK} - sleppa yfirferð í dag.`);
    return;
  }

  const [spurn, rettSnap] = await Promise.all([db.collection("questions").get(), db.collection("answers").get()]);
  const texti = new Map(spurn.docs.map((d) => [d.id, d.data().text]));
  const rett = new Map(rettSnap.docs.map((d) => [d.id, d.data().correctAnswers || []]));
  const erSvarRett = hladaErSvarRett();

  const rongu = new Map();
  for (const s of ekkiPass) {
    const rs = rett.get(s.qid) || [];
    if (erSvarRett(s.svar, rs)) continue;
    const lykillRong = `${s.qid}|${s.svar}`;
    const f = rongu.get(lykillRong) || { id: s.qid, texti: texti.get(s.qid), svar: s.svar, rs, fjoldi: 0 };
    f.fjoldi++;
    rongu.set(lykillRong, f);
  }
  console.log(`\nRöng svör til yfirferðar: ${rongu.size}\n`);
  for (const f of [...rongu.values()].sort((a, b) => String(a.texti).localeCompare(String(b.texti), "is"))) {
    console.log(`${f.id} | ${f.texti} | svar: ${f.svar} | rétt: ${JSON.stringify(f.rs)}${f.fjoldi > 1 ? ` (x${f.fjoldi})` : ""}`);
  }
}

main().catch((v) => {
  console.error(v);
  process.exit(1);
});
