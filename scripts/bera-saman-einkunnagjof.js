// Ber saman erSvarRett úr git (viðmiðunarútgáfa) við núverandi útgáfu og
// prentar HVERT svar sem breytist úr röngu í rétt (og öfugt), til yfirferðar.
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

function hladaErSvarRett(kodi) {
  const start = kodi.indexOf("function samraema(text)");
  const end = kodi.indexOf("function formatSkjatimi");
  return new Function(kodi.slice(start, end) + "; return erSvarRett;")();
}

const VIDMID = process.argv[2] || "9140e71"; // útgáfan áður en þessi yfirferð hófst
const gamli = hladaErSvarRett(execSync(`git show ${VIDMID}:js/quiz.js`, { cwd: path.join(__dirname, "..") }).toString());
const nyi = hladaErSvarRett(fs.readFileSync(path.join(__dirname, "..", "js", "quiz.js"), "utf8"));
const SLEPPT_MERKI = "__sleppt__";

async function main() {
  const [notendurSnap, spurningarSnap, svorSnap] = await Promise.all([
    db.collection("users").get(),
    db.collection("questions").get(),
    db.collection("answers").get()
  ]);
  const texti = new Map(spurningarSnap.docs.map((d) => [d.id, d.data().text]));
  const rett = new Map(svorSnap.docs.map((d) => [d.id, d.data().correctAnswers || []]));
  // Endurbyggjum svarlistana eins og þeir voru áður en vikka-svor2.js keyrði.
  const vikkunSrc = fs.readFileSync(path.join(__dirname, "vikka-svor2.js"), "utf8");
  const vidbaeturTexti = vikkunSrc.slice(vikkunSrc.indexOf("const VIDBAETUR = {") + "const VIDBAETUR = ".length, vikkunSrc.indexOf("\n};", vikkunSrc.indexOf("const VIDBAETUR = {")) + 2);
  const VIDBAETUR = new Function("return " + vidbaeturTexti)();
  const fyrir = new Map();
  for (const [id, rs] of rett) {
    const bættu = new Set(VIDBAETUR[id] || []);
    fyrir.set(id, rs.filter((x) => !bættu.has(x) || ["adam smith", "smith"].includes(x)));
  }
  fyrir.set("x3FcYGYGzEbJTKl676wL", ["legubekkur, húsgagn"]);
  fyrir.set("HH04mBq6jEukjmmDwTLE", ["adam smith", "smith"]);
  fyrir.set("q9vKs1S0ne2uYWHlvdpc", ["öl"]);
  // merkúr var bætt við "Hvaða reikistjarna er næst sólu?" eftir texta
  for (const [id, t] of texti) if (t === "Hvaða reikistjarna er næst sólu?") fyrir.set(id, (fyrir.get(id) || []).filter((x) => x !== "merkúr"));
  const breytingar = new Map();
  for (const n of notendurSnap.docs) {
    if (n.data().role === "admin") continue;
    const att = await db.collection("users").doc(n.id).collection("attempts").get();
    att.forEach((a) => {
      const svar = a.data().svar;
      if (svar === SLEPPT_MERKI) return;
      const rs = rett.get(a.id) || [];
      const g = gamli(svar, process.env.GOMUL_GOGN ? fyrir.get(a.id) || [] : rs);
      const nn = nyi(svar, rs);
      if (g !== nn) {
        const lykill = `${a.id}|${svar}`;
        breytingar.set(lykill, {
          texti: texti.get(a.id),
          svar,
          rs,
          g,
          nn,
          fjoldi: (breytingar.get(lykill)?.fjoldi || 0) + 1
        });
      }
    });
  }
  const linur = [...breytingar.values()]
    .sort((a, b) => a.texti.localeCompare(b.texti, "is"))
    .map((b) => `${b.nn ? "NÝTT RÉTT" : "NÝTT RANGT"} | ${b.texti} | svar: ${b.svar} | rétt: ${JSON.stringify(b.rs)}${b.fjoldi > 1 ? ` (x${b.fjoldi})` : ""}`);
  fs.writeFileSync(
    "/tmp/claude-0/-home-user-N-STI/d42fecff-b3b6-5587-b28c-de34dc362f47/scratchpad/breytingar.txt",
    linur.join("\n")
  );
  console.log("mismunandi svör:", linur.length);
}

main().catch((v) => {
  console.error(v);
  process.exit(1);
});
