// Safnar öllum svörum sem eru enn metin röng (ekki pass) með núverandi erSvarRett
// úr js/quiz.js, til yfirferðar: eru einhver þeirra í raun rétt?
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const kvizSrc = fs.readFileSync(path.join(__dirname, "..", "js", "quiz.js"), "utf8");
const start = kvizSrc.indexOf("function samraema(text)");
const end = kvizSrc.indexOf("function formatSkjatimi");
eval(kvizSrc.slice(start, end));

const SLEPPT_MERKI = "__sleppt__";

async function main() {
  const [notendurSnap, spurningarSnap, svorSnap] = await Promise.all([
    db.collection("users").get(),
    db.collection("questions").get(),
    db.collection("answers").get()
  ]);
  const texti = new Map(spurningarSnap.docs.map((d) => [d.id, d.data().text]));
  const rett = new Map(svorSnap.docs.map((d) => [d.id, d.data().correctAnswers || []]));

  const hopur = new Map();
  for (const n of notendurSnap.docs) {
    if (n.data().role === "admin") continue;
    const att = await db.collection("users").doc(n.id).collection("attempts").get();
    att.forEach((a) => {
      const svar = a.data().svar;
      if (svar === SLEPPT_MERKI) return;
      const rs = rett.get(a.id) || [];
      if (erSvarRett(svar, rs)) return;
      if (!hopur.has(a.id)) hopur.set(a.id, new Map());
      hopur.get(a.id).set(svar, (hopur.get(a.id).get(svar) || 0) + 1);
    });
  }

  const linur = [];
  for (const [id, svorMap] of hopur) {
    linur.push(
      `${id} | ${texti.get(id)} | rétt: ${JSON.stringify(rett.get(id))} | röng svör: ${[...svorMap.entries()]
        .map(([s, n]) => (n > 1 ? `${s} (x${n})` : s))
        .join(" ; ")}`
    );
  }
  linur.sort((a, b) => a.split(" | ")[1].localeCompare(b.split(" | ")[1], "is"));
  fs.writeFileSync(
    "/tmp/claude-0/-home-user-N-STI/d42fecff-b3b6-5587-b28c-de34dc362f47/scratchpad/ronq-svor.txt",
    linur.join("\n")
  );
  console.log("spurningar með röngum svörum:", linur.length);
}

main().catch((v) => {
  console.error(v);
  process.exit(1);
});
