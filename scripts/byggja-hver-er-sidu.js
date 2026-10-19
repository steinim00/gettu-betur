// Býr til hver-er.html (námssíða: "Hver er ...?" fyrir forstjóra og embættismenn
// stofnana) úr FAERSLUR í leggja-inn-forstjora.js - sama útlit og
// baejarstjorar.html. Keyrsla: node scripts/byggja-hver-er-sidu.js
const fs = require("fs");
const path = require("path");

const rot = path.join(__dirname, "..");
const kodi = fs.readFileSync(path.join(__dirname, "leggja-inn-forstjora.js"), "utf8");
const lysing = kodi.slice(kodi.indexOf("const FAERSLUR = ["), kodi.indexOf("];", kodi.indexOf("const FAERSLUR = [")) + 1);
const FAERSLUR = new Function(lysing.replace("const FAERSLUR =", "return"))();

const bjarga = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const stil = fs.readFileSync(path.join(rot, "baejarstjorar.html"), "utf8").match(/<style>[\s\S]*?<\/style>/)[0];

function kort(nr, spurning, svar, myndHtml) {
  return `  <div class="spb-kort"><div class="spb-spurning">${nr}. ${bjarga(spurning)}</div><details><summary>Svar</summary><div class="spb-svar-box">${myndHtml}<div class="spb-svar">${bjarga(svar)}</div></div></details></div>`;
}

let nr = 0;
const hlutiEitt = FAERSLUR.map((f) => {
  nr++;
  const mynd = f.mynd ? `<img class="mynd" src="${f.mynd}" alt="${bjarga(f.nafn)}">` : "";
  return kort(nr, f.q1, f.nafn, mynd);
});
const hlutiTvo = FAERSLUR.map((f) => {
  nr++;
  const merki = f.logo ? `<img class="merki" src="${f.logo}" alt="Merki">` : "";
  return kort(nr, f.q2, f.svar2[0], merki);
});

const html = `<!DOCTYPE html>
<html lang="is">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hver er? — Gettu Betur</title>
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
${stil}
</head>
<body>
<header class="sida-haus">
  <a class="merki" href="leikur.html"><img class="merki-icon" src="favicon.svg" alt=""><span>Gettu</span> Betur</a>
</header>
<main class="spb-efni" id="efni" hidden>
  <a class="smabtn spb-til-baka" href="leikur.html">← Til baka í leikinn</a>
  <h1>Hver er?</h1>

${hlutiEitt.join("\n")}

  <h2>Hjá hvaða stofnun? Hvaða embætti?</h2>
${hlutiTvo.join("\n")}
</main>
<script type="module">
  // Aðeins Hinrik (og admin) sjá þessa síðu - sama takmörkun og á verkefninu
  // "Embættismannalisti" í leiknum (leyfdirNotendur). Athugið: þetta er
  // takmörkun í vafranum, ekki á efni skrárinnar sjálfrar.
  import { vaktaInnskraningu } from "./js/auth.js";
  const LEYFDIR_UID = ["5TkIf8dyi7T3EoAE10na2eR2xLl1"];
  vaktaInnskraningu({ requireAuth: true }, (user, gogn) => {
    if (user && (gogn?.role === "admin" || LEYFDIR_UID.includes(user.uid))) {
      document.getElementById("efni").hidden = false;
    } else {
      window.location.href = "leikur.html";
    }
  });
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(rot, "hver-er.html"), html);
console.log(`hver-er.html: ${FAERSLUR.length} embættismenn, ${nr} spurningar.`);
