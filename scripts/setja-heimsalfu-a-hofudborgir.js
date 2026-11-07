// Setur reitinn "heimsalfa" á spurningarnar í "Höfuðborgir heimsins" (út frá fána-emoji-inu fremst í textanum),
// svo nemendur geti valið heimsálfu. Norður-Ameríka nær líka yfir Mið-Ameríku og Karíbahaf.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const ALFUR = {
  Evrópa: "AD AL AT BA BE BG BY CH CY CZ DE EE ES FR GR HR HU IE IT LI LT LU LV MC MD ME MK MT NL PL PT RO RS RU SI SK SM UA",
  Asía: "AE AF AM AZ BD BH BN BT CN GE ID IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MV MY NP OM PH PK QA SA SG SY TH TJ TL TM TR UZ VN YE",
  Afríka: "AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RW SC SD SL SN SO SS ST SZ TD TG TN TZ UG ZM ZW",
  "Norður-Ameríka": "AG BB BS BZ CA CR CU DM DO GD GT HN HT JM KN LC MX NI PA SV TT VC",
  "Suður-Ameríka": "AR BO BR CL CO EC GY PE PY SR UY VE",
  Eyjaálfa: "AU FJ FM KI MH NZ PG PW SB TO TV VU WS"
};
const alfaEftirKodi = new Map();
for (const [alfa, kodar] of Object.entries(ALFUR)) kodar.split(" ").forEach((k) => alfaEftirKodi.set(k, alfa));

function landskodi(texti) {
  const cps = [...texti].slice(0, 2).map((c) => c.codePointAt(0));
  if (cps.length < 2 || !cps.every((c) => c >= 0x1f1e6 && c <= 0x1f1ff)) return null;
  return cps.map((c) => String.fromCharCode(c - 0x1f1e6 + 65)).join("");
}

(async () => {
  const verkefni = (await db.collection("verkefni").get()).docs.find((d) => /höfuðborg/i.test(d.data().title || ""));
  if (!verkefni) throw new Error("Fann ekki verkefnið Höfuðborgir heimsins");
  const spurningar = await db.collection("questions").where("verkefniId", "==", verkefni.id).get();
  const batch = db.batch();
  const talning = {};
  const vantar = [];
  spurningar.forEach((d) => {
    const kodi = landskodi(d.data().text || "");
    const alfa = kodi && alfaEftirKodi.get(kodi);
    if (!alfa) return vantar.push(`${kodi}: ${d.data().text}`);
    talning[alfa] = (talning[alfa] || 0) + 1;
    if (d.data().heimsalfa !== alfa) batch.update(d.ref, { heimsalfa: alfa });
  });
  if (vantar.length) console.log("Vantar heimsálfu fyrir:", vantar);
  await batch.commit();
  console.log(`${spurningar.size} spurningar, skipting:`, talning);
})();
