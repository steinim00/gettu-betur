// Sækir mynd (Wikipedia -> Commons) fyrir hvert kennileiti/listaverk í
// hver-er-gogn2.json og vistar í hver-er-myndir2.json (endurkeyranlegt).
const fs = require("fs");
const path = require("path");
const gogn = JSON.parse(fs.readFileSync(path.join(__dirname, "hver-er-gogn2.json"), "utf8"));
const OUT = path.join(__dirname, "hver-er-myndir2.json");
const res = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const UA = "GettuBetur-TriviaApp/1.0 (educational project; contact: steinim00@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(w, t) {
  const url = `https://${w}.wikipedia.org/api/rest_v1/page/summary/` + encodeURIComponent(t.replace(/ /g, "_"));
  for (let i = 0; i < 8; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429) {
      await sleep(15000);
      continue;
    }
    if (!r.ok) return null;
    const j = await r.json();
    if (j.type === "disambiguation") return null;
    return { titill: j.title, lysing: (j.description || "").slice(0, 70), slod: j.originalimage?.source || null, wiki: w };
  }
  return null;
}

(async () => {
  for (const g of gogn) {
    for (const e of g.entries) {
      const key = g.titill + "|" + e.nafn;
      if (key in res) continue;
      let best = null;
      for (const [w, t] of e.wiki) {
        const r = await get(w, t);
        await sleep(1100);
        if (r && r.slod && r.slod.includes("/wikipedia/commons/")) {
          best = r;
          break;
        }
        if (r && !best) best = r;
      }
      res[key] = best;
      fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
    }
  }
  console.log("lokið");
})();
