const fs = require("fs");
const path = require("path");

const UA = "GettuBetur-TriviaApp/1.0 (educational project; contact: steinim00@gmail.com)";
const NIDURSTODUR_SLOD = path.join(__dirname, "hofudborgir-nidurstodur.json");

function seinka(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function leitaCommons(fyrirspurn) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=5&format=json&srsearch=" +
    encodeURIComponent(fyrirspurn);
  for (let tilraun = 0; tilraun < 10; tilraun++) {
    const svar = await fetch(url, { headers: { "User-Agent": UA } });
    if (svar.status === 429) {
      await seinka(15000);
      continue;
    }
    if (!svar.ok) throw new Error(`HTTP ${svar.status}`);
    const gogn = await svar.json();
    return (gogn?.query?.search || []).map((h) => h.title.replace(/^File:/, ""));
  }
  throw new Error("Gafst upp eftir margar 429-tilraunir");
}

const FYRIRSPURNIR = {
  "Ngerulmud, Palau": "Palau Capitol Melekeok",
  "Moroni, Comoros": "Moroni Comoros",
  "Apia, Samoa": "Apia Samoa",
  "Vientiane, Laos": "Vientiane Patuxai"
};

async function main() {
  const nidurstodur = JSON.parse(fs.readFileSync(NIDURSTODUR_SLOD, "utf8"));
  for (const [borg, fyrirspurn] of Object.entries(FYRIRSPURNIR)) {
    const niðurstöður = await leitaCommons(fyrirspurn);
    console.log(borg, "->", JSON.stringify(niðurstöður, null, 2));
    await seinka(3000);
  }
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
