// Sækir myndir af "51 minna þekktum verkum" (listaverk-minna-thekkt.js) af ensku Wikipedia - aðeins frjálsar
// myndir (pilicense=free). Vistar í images/listaverk/m{nr}.jpg (nr = 1..51). Keyra: node saekja-listaverkamyndir.js
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const VERK = require("./listaverk-minna-thekkt.js");
const MAPPA = path.join(__dirname, "..", "images", "listaverk");
const UA = { "User-Agent": "gettu-betur-skrifta/1.0" };

(async () => {
  const titlar = VERK.map((v) => v[2]);
  const slodir = {};
  for (let i = 0; i < titlar.length; i += 40) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=1000&pilicense=free&redirects=1&titles=${encodeURIComponent(titlar.slice(i, i + 40).join("|"))}`;
    const j = await (await fetch(url, { headers: UA })).json();
    const vispun = {};
    (j.query.normalized || []).forEach((n) => (vispun[n.to] = n.from));
    (j.query.redirects || []).forEach((r) => (vispun[r.to] = vispun[r.from] || r.from));
    Object.values(j.query.pages).forEach((p) => {
      if (p.thumbnail) slodir[vispun[p.title] || p.title] = p.thumbnail.source;
    });
  }
  let fjoldi = 0;
  for (let i = 0; i < VERK.length; i++) {
    const slod = slodir[titlar[i]];
    const skra = path.join(MAPPA, `m${i + 1}.jpg`);
    if (!slod) {
      console.log(`ENGIN MYND: ${i + 1} ${titlar[i]}`);
      continue;
    }
    const svar = await fetch(slod, { headers: UA });
    const tmp = skra + ".tmp";
    fs.writeFileSync(tmp, Buffer.from(await svar.arrayBuffer()));
    execFileSync("convert", [tmp, "-resize", "1000x800>", "-quality", "82", `jpg:${skra}`]);
    fs.unlinkSync(tmp);
    fjoldi++;
  }
  console.log(`${fjoldi}/${VERK.length} myndir vistaðar`);
})();
