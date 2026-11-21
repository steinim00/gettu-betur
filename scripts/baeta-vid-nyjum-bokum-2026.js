// Einskiptis skrifta: nýjar bækur (jólin 2026) höfunda af metsölulista jólin 2025 - aðeins bækur sem eru
// á núverandi metsölulistum Pennans (heimild: penninn.is, kápur af Bókatíðindum, sótt 21. nóv 2026).
// Kápurnar eru minnkaðar (450 px háar) og geymdar í myndir/baekur/ - aðeins notaðar í appinu sjálfu.
// Tvær spurningar á bók í "Bókalisti" verkefnið (óvirkar þar til admin kveikir á þeim), kápan sést með svarinu.
// Breyttu spurningarnar eru skráðar í meta/spurningaBreytingar svo stjórnborðið sæki bara þær.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
const FV = admin.firestore.FieldValue;

const samraema = (t) => t.trim().toLowerCase().replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "").replace(/\s+/g, " ");

const BAEKUR = [
  { hofundur: "Arnaldur Indriðason", hofSvor: ["Arnaldur"], titill: "Morðið á Evelyn Gray", titSvor: ["Morðið á Evelyn Grey"], kapa: "mordid-a-evelyn-gray" },
  { hofundur: "Yrsa Sigurðardóttir", hofSvor: ["Yrsa"], titill: "Mara", titSvor: [], kapa: "mara" },
  { hofundur: "Eva Björg Ægisdóttir", hofSvor: ["Eva Björg"], titill: "Þau sem urðu eftir", titSvor: [], kapa: "thau-sem-urdu-eftir" },
  { hofundur: "Stefán Máni", hofSvor: ["Stefán Máni Sigþórsson"], titill: "Gleym mér ei", titSvor: ["Gleymmérei"], kapa: "gleym-mer-ei" },
  { hofundur: "Ragnar Jónasson", hofSvor: [], titill: "Svartakóf", titSvor: ["Svarta kóf"], kapa: "svartakof" },
  { hofundur: "Óttar Sveinsson", hofSvor: [], titill: "Útkall: Bjargvættir í hamförum", titSvor: ["Útkall bjargvættir í hamförum", "Bjargvættir í hamförum"], kapa: "utkall-bjargvaettir-i-hamforum" },
  { hofundur: "Ævar Þór Benediktsson", hofSvor: ["Ævar Þór", "Ævar vísindamaður"], titill: "Teiknimyndaránið", titSvor: ["Teiknimynda ránið"], kapa: "teiknimyndaranid" }
];

(async () => {
  const vSnap = await db.collection("verkefni").where("title", "==", "Bókalisti").get();
  if (vSnap.empty) throw new Error('Verkefnið "Bókalisti" fannst ekki');
  const verkefniId = vSnap.docs[0].id;
  const fyrir = await db.collection("bokalisti").where("verkefniId", "==", verkefniId).get();
  const tilFyrir = new Set(fyrir.docs.map((d) => d.data().titill));

  const batch = db.batch();
  const nyIds = [];
  for (const b of BAEKUR) {
    if (tilFyrir.has(b.titill)) {
      console.log(`Sleppi "${b.titill}" - er þegar í Bókalistanum.`);
      continue;
    }
    const mynd = { image: `myndir/baekur/${b.kapa}.webp`, imageAlt: `Kápa bókarinnar ${b.titill}`, imageCredit: "Bókatíðindi" };
    const q1 = db.collection("questions").doc();
    const q2 = db.collection("questions").doc();
    batch.set(q1, { text: `Hver skrifaði "${b.titill}"?`, verkefniId, active: false, createdAt: FV.serverTimestamp(), ...mynd });
    batch.set(db.collection("answers").doc(q1.id), { correctAnswers: [...new Set([b.hofundur, ...b.hofSvor].map(samraema))] });
    batch.set(q2, { text: `Hvaða bók gaf ${b.hofundur} út fyrir jólin 2026?`, verkefniId, active: false, createdAt: FV.serverTimestamp(), ...mynd });
    batch.set(db.collection("answers").doc(q2.id), { correctAnswers: [...new Set([b.titill, ...b.titSvor].map(samraema))] });
    batch.set(db.collection("bokalisti").doc(), {
      hofundur: b.hofundur, titill: b.titill, kapaSlod: mynd.image, verkefniId, q1Id: q1.id, q2Id: q2.id, createdAt: FV.serverTimestamp()
    });
    nyIds.push(q1.id, q2.id);
    console.log(`+ ${b.titill} (${b.hofundur})`);
  }
  if (nyIds.length) {
    const breytt = {};
    nyIds.forEach((id) => (breytt[id] = FV.serverTimestamp()));
    batch.set(db.collection("meta").doc("spurningaBreytingar"), { breytt, uppfaert: FV.serverTimestamp() }, { merge: true });
  }
  await batch.commit();
  console.log(`${nyIds.length} spurningar búnar til í Bókalista (${verkefniId}), óvirkar.`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
