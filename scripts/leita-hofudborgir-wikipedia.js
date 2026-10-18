// Fyrir borgirnar sem leita-hofudborgir.js fann ekkert gott á (PDF-skjöl eða
// ekkert) - notar Wikipedia REST API í staðinn, sem skilar beint forsíðu-
// myndinni (originalimage) af viðkomandi Wikipedia-grein. Miklu áreiðanlegra
// en Commons-leit í fullum texta fyrir litlar/sjaldgæfar höfuðborgir - myndin
// er sú sem Wikipedia sjálft notar til að tákna staðinn, og kemur samt af
// Wikimedia Commons undir hettunni.
const fs = require("fs");
const path = require("path");

const UA = "GettuBetur-TriviaApp/1.0 (educational project; contact: steinim00@gmail.com)";
const NIDURSTODUR_SLOD = path.join(__dirname, "hofudborgir-nidurstodur.json");

// Titill Wikipedia-greinar fyrir hverja borg sem þarf að endurleita -
// stundum sá sami og leitarstrengurinn, stundum þarf að tilgreina
// nákvæmlega til að lenda á réttri grein (t.d. "Palikir" er lítil grein).
const ENDURLEITA = {
  "Lusaka, Zambia": "Lusaka",
  "Gitega, Burundi": "Gitega",
  "Ngerulmud, Palau": "Ngerulmud",
  "Porto-Novo, Benin": "Porto-Novo",
  "Vaduz, Liechtenstein": "Vaduz",
  "Yamoussoukro, Ivory Coast": "Yamoussoukro",
  "Dushanbe, Tajikistan": "Dushanbe",
  "Bangui, Central African Republic": "Bangui",
  "Podgorica, Montenegro": "Podgorica",
  "Mbabane, Eswatini": "Mbabane",
  "Palikir, Micronesia": "Palikir",
  "Libreville, Gabon": "Libreville",
  "Sri Jayawardenepura Kotte, Sri Lanka": "Sri Jayawardenepura Kotte",
  "Roseau, Dominica": "Roseau",
  "Castries, Saint Lucia": "Castries",
  "Funafuti, Tuvalu": "Funafuti",
  "Belmopan, Belize": "Belmopan",
  "Moroni, Comoros": "Moroni",
  "Kingstown, Saint Vincent and the Grenadines": "Kingstown",
  "Kinshasa, DR Congo": "Kinshasa",
  "Tarawa, Kiribati": "South Tarawa",
  "Dodoma, Tanzania": "Dodoma",
  "Skopje, North Macedonia": "Skopje",
  "Naypyidaw, Myanmar": "Naypyidaw",
  "Ashgabat, Turkmenistan": "Ashgabat",
  "Malabo, Equatorial Guinea": "Malabo",
  "Port Vila, Vanuatu": "Port Vila",
  "Republic of Congo Brazzaville": "Brazzaville",
  "Nouakchott, Mauritania": "Nouakchott",
  "Conakry, Guinea": "Conakry",
  "Bamako, Mali": "Bamako",
  "Yaounde, Cameroon": "Yaoundé",
  "Rabat, Morocco": "Rabat",
  "N'Djamena, Chad": "N'Djamena",
  "Muscat, Oman": "Muscat",
  "Thimphu, Bhutan": "Thimphu",
  "Majuro, Marshall Islands": "Majuro",
  "Djibouti City": "Djibouti City",
  "Lome, Togo": "Lomé",
  "Basseterre, Saint Kitts and Nevis": "Basseterre",
  "Bissau, Guinea-Bissau": "Bissau",
  "Maseru, Lesotho": "Maseru",
  "Freetown, Sierra Leone": "Freetown, Sierra Leone",
  "Saint George's, Grenada": "St. George's, Grenada",
  "Dili, East Timor": "Dili",
  "San Marino city": "City of San Marino",
  "Georgetown, Guyana": "Georgetown, Guyana",
  "Juba, South Sudan": "Juba",
  "Sao Tome": "São Tomé, São Tomé and Príncipe",
  "Port-au-Prince, Haiti": "Port-au-Prince",
  "Lilongwe, Malawi": "Lilongwe",
  "Apia, Samoa": "Apia",
  "Bridgetown, Barbados": "Bridgetown",
  "Vientiane, Laos": "Vientiane",
  "Kingston, Jamaica": "Kingston, Jamaica"
};

function seinka(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sumarySlod(titill) {
  const url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(titill.replace(/ /g, "_"));
  for (let tilraun = 0; tilraun < 10; tilraun++) {
    const svar = await fetch(url, { headers: { "User-Agent": UA } });
    if (svar.status === 429) {
      await seinka(15000);
      continue;
    }
    if (svar.status === 404) return null;
    if (!svar.ok) throw new Error(`HTTP ${svar.status} fyrir "${titill}"`);
    const gogn = await svar.json();
    return gogn?.originalimage?.source || gogn?.thumbnail?.source || null;
  }
  throw new Error(`Gafst upp á "${titill}" eftir margar 429-tilraunir`);
}

async function main() {
  const nidurstodur = JSON.parse(fs.readFileSync(NIDURSTODUR_SLOD, "utf8"));
  const borgir = Object.keys(ENDURLEITA);

  for (const [i, borg] of borgir.entries()) {
    const titill = ENDURLEITA[borg];
    try {
      const imageUrl = await sumarySlod(titill);
      nidurstodur[borg] = imageUrl ? { beinSlod: imageUrl } : null;
      console.log(`[${i + 1}/${borgir.length}] ${borg} (${titill}) -> ${imageUrl || "(ekkert fannst)"}`);
    } catch (villa) {
      console.error(`[${i + 1}/${borgir.length}] ${borg} -> VILLA: ${villa.message}`);
    }
    fs.writeFileSync(NIDURSTODUR_SLOD, JSON.stringify(nidurstodur, null, 2));
    await seinka(1000);
  }

  console.log("Lokið.");
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
