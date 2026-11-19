// Setur númer spurninga úr "Grænadeildin (3)" (Google Doc) á hraðaspurningarnar sem reitinn grNr,
// svo hægt sé að lesa þær í réttri röð á æfingu (stjórnborð → Grænadeildin → "Í röð frá nr.").
// Notkun: node numera-graenadeildina.js <textaskrá úr skjalinu> [--apply]
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
const HRADASPURNINGAR = "nNY4cv1gLiIDGcm9vieu";

const samraema = (t) => t.trim().toLowerCase().replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "").replace(/\s+/g, " ");
const lykill = (t) => samraema(t).replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ");

const linur = fs.readFileSync(process.argv[2], "utf8").replace(/^﻿/, "").split(/\r?\n/);
const skjal = [];
linur.forEach((l) => {
  const m = l.match(/^\s*(\d+)\.\s+(.+)$/);
  if (!m) return;
  const texti = m[2].split(/\t+SV(?:AR|RA)\s*:?/i)[0].trim();
  skjal.push({ nr: Number(m[1]), texti });
});

(async () => {
  const snap = await db.collection("questions").where("verkefniId", "==", HRADASPURNINGAR).get();
  const eftirLykli = new Map();
  snap.docs.forEach((d) => {
    const k = lykill(d.data().text || "");
    if (!eftirLykli.has(k)) eftirLykli.set(k, []);
    eftirLykli.get(k).push(d);
  });
  const breytingar = [];
  const vantar = [];
  // Nálgun: sumum spurningum hefur verið breytt á síðunni (stafsetning o.þ.h.) - þá er sú líkasta tekin
  // ef munurinn er lítill (Levenshtein, max ~9% af lengdinni).
  function fjarlaegd(a, b) {
    const d = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let fyrri = d[0];
      d[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const t = d[j];
        d[j] = Math.min(d[j] + 1, d[j - 1] + 1, fyrri + (a[i - 1] === b[j - 1] ? 0 : 1));
        fyrri = t;
      }
    }
    return d[b.length];
  }
  // Spurning sem passar nákvæmlega við aðra línu í skjalinu kemur ekki til greina í nálgun.
  const nakvaemir = new Set(skjal.map(({ texti }) => lykill(texti)));
  const allirLyklar = [...eftirLykli.keys()].filter((k) => !nakvaemir.has(k));
  const notadir = new Set();
  function finna(texti) {
    const k = lykill(texti);
    if (eftirLykli.has(k)) return eftirLykli.get(k);
    const k2 = lykill(texti.replace(/\([^)]*\)/g, ""));
    if (eftirLykli.has(k2)) return eftirLykli.get(k2);
    let best = null, bestD = Infinity;
    for (const kk of allirLyklar) {
      if (Math.abs(kk.length - k2.length) > 8) continue;
      const dd = fjarlaegd(k2, kk);
      if (dd < bestD) { bestD = dd; best = kk; }
    }
    if (best && bestD <= Math.max(2, Math.round(k2.length * 0.09))) {
      console.log(`  ~ "${texti}" ≈ "${eftirLykli.get(best)[0].data().text}"`);
      return eftirLykli.get(best);
    }
    return null;
  }
  skjal.forEach(({ nr, texti }) => {
    const fundid = finna(texti);
    if (!fundid) return vantar.push(nr);
    fundid.forEach((d) => { if (d.data().grNr !== nr) breytingar.push([d.ref, nr]); });
  });
  console.log(`Skjal: ${skjal.length} spurningar (nr. ${skjal[0]?.nr}-${skjal[skjal.length - 1]?.nr}). Fundust: ${skjal.length - vantar.length}. Vantar: ${vantar.length}.`);
  const vantarFra910 = vantar.filter((n) => n >= 910);
  console.log(`Vantar frá 910: ${vantarFra910.length}`, vantarFra910.slice(0, 40).join(","));
  if (process.argv.includes("--apply")) {
    for (let i = 0; i < breytingar.length; i += 400) {
      const b = db.batch();
      breytingar.slice(i, i + 400).forEach(([ref, nr]) => b.update(ref, { grNr: nr }));
      await b.commit();
    }
    console.log(`Skrifað grNr á ${breytingar.length} spurningar.`);
  } else console.log(`(prufukeyrsla - ${breytingar.length} myndu breytast)`);
  process.exit(0);
})();
