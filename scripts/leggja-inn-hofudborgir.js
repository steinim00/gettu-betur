// Einskiptis skrifta: býr til verkefnið "Höfuðborgir heimsins" og hleður inn
// 183 aðildarríkjum Sameinuðu þjóðanna - öllum nema Norðurlöndunum (Danmörk,
// Finnland, Ísland, Noregur, Svíþjóð), Ísrael, Suður-Afríku, Bretlandi og
// Bandaríkjunum (sérstaklega undanskilin að beiðni notanda), auk Naúrú
// (ekkert opinbert höfuðborgar-svar til, sleppt til að forðast óskýrt svar).
// Lönd og höfuðborgir sótt og staðfest af is.wikipedia.org, ISO 3166-1
// alpha-2 landakóðar notaðir til að mynda fánatákn forritunarlega (Unicode
// regional indicator stafir) - engar myndaskrár þarf, virkar alls staðar.
// Spurningaformið forðast eignarfall ("Hver er höfuðborg Frakklands?") til
// að sleppa við beygingaráhættu yfir 183 lönd - notar í staðinn "Land: Hver
// er höfuðborgin?" sem er málfræðilega áhættulaust en samt eðlilegt.
// Verkefnið og allar spurningarnar fara inn óvirk (active: false).
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

const VERKEFNA_TITILL = "Höfuðborgir heimsins";

function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

// Myndar fánatákn úr tveggja-stafa ISO 3166-1 alpha-2 kóða með Unicode
// "regional indicator" stöfum (t.d. "IS" -> 🇮🇸) - engin myndaskrá þarf.
function fanaTakn(iso) {
  return String.fromCodePoint(...[...iso].map((staf) => 0x1f1e6 + staf.charCodeAt(0) - 65));
}

const LOND = [
  { land: "Afganistan", hofudborg: "Kabúl", iso: "AF" },
  { land: "Albanía", hofudborg: "Tírana", iso: "AL" },
  { land: "Alsír", hofudborg: "Algeirsborg", iso: "DZ" },
  { land: "Andorra", hofudborg: "Andorra la Vella", iso: "AD" },
  { land: "Angóla", hofudborg: "Lúanda", iso: "AO" },
  { land: "Antígva og Barbúda", hofudborg: "Saint John's", iso: "AG" },
  { land: "Argentína", hofudborg: "Búenos Aíres", iso: "AR" },
  { land: "Armenía", hofudborg: "Jerevan", iso: "AM" },
  { land: "Aserbaísjan", hofudborg: "Bakú", iso: "AZ" },
  { land: "Austur-Tímor", hofudborg: "Dili", iso: "TL" },
  { land: "Austurríki", hofudborg: "Vínarborg", iso: "AT" },
  { land: "Bahamaeyjar", hofudborg: "Nassá", iso: "BS" },
  { land: "Bangladess", hofudborg: "Dakka", iso: "BD" },
  { land: "Barbados", hofudborg: "Bridgetown", iso: "BB" },
  { land: "Barein", hofudborg: "Manama", iso: "BH" },
  { land: "Belgía", hofudborg: "Brussel", iso: "BE" },
  { land: "Belís", hofudborg: "Belmópan", iso: "BZ" },
  { land: "Benín", hofudborg: "Porto-Novo", iso: "BJ" },
  { land: "Bosnía og Hersegóvína", hofudborg: "Sarajevó", iso: "BA" },
  { land: "Botsvana", hofudborg: "Gaboróne", iso: "BW" },
  { land: "Brasilía", hofudborg: "Brasilía", iso: "BR" },
  { land: "Brúnei", hofudborg: "Bandar Seri Begawan", iso: "BN" },
  { land: "Bólivía", hofudborg: "Súkre", iso: "BO" },
  { land: "Búlgaría", hofudborg: "Sófía", iso: "BG" },
  { land: "Búrkína Fasó", hofudborg: "Ouagadougou", iso: "BF" },
  { land: "Búrúndí", hofudborg: "Gítega", iso: "BI" },
  { land: "Bútan", hofudborg: "Timfú", iso: "BT" },
  { land: "Djibútí", hofudborg: "Djibútí", iso: "DJ" },
  { land: "Dóminíka", hofudborg: "Roseau", iso: "DM" },
  { land: "Dóminíska lýðveldið", hofudborg: "Santó Dómingó", iso: "DO" },
  { land: "Egyptaland", hofudborg: "Kaíró", iso: "EG" },
  { land: "Eistland", hofudborg: "Tallinn", iso: "EE" },
  { land: "Ekvador", hofudborg: "Quito", iso: "EC" },
  { land: "El Salvador", hofudborg: "San Salvador", iso: "SV" },
  { land: "Eritrea", hofudborg: "Asmara", iso: "ER" },
  { land: "Esvatíní", hofudborg: "Mbabane", iso: "SZ" },
  { land: "Eþíópía", hofudborg: "Addis Ababa", iso: "ET" },
  { land: "Filippseyjar", hofudborg: "Maníla", iso: "PH" },
  { land: "Frakkland", hofudborg: "París", iso: "FR" },
  { land: "Fídjí", hofudborg: "Suva", iso: "FJ" },
  { land: "Fílabeinsströndin", hofudborg: "Yamoussoukro", iso: "CI" },
  { land: "Gabon", hofudborg: "Libreville", iso: "GA" },
  { land: "Gambía", hofudborg: "Banjul", iso: "GM" },
  { land: "Gana", hofudborg: "Akkra", iso: "GH" },
  { land: "Georgía", hofudborg: "Tíblisi", iso: "GE" },
  { land: "Grenada", hofudborg: "St. George's", iso: "GD" },
  { land: "Grikkland", hofudborg: "Aþena", iso: "GR" },
  { land: "Grænhöfðaeyjar", hofudborg: "Praia", iso: "CV" },
  { land: "Gvatemala", hofudborg: "Gvatemalaborg", iso: "GT" },
  { land: "Gvæjana", hofudborg: "Georgetown", iso: "GY" },
  { land: "Gínea", hofudborg: "Kónakrí", iso: "GN" },
  { land: "Gínea-Bissá", hofudborg: "Bissá", iso: "GW" },
  { land: "Haítí", hofudborg: "Port-au-Prince", iso: "HT" },
  { land: "Holland", hofudborg: "Amsterdam", iso: "NL" },
  { land: "Hondúras", hofudborg: "Tegucigalpa", iso: "HN" },
  { land: "Hvíta-Rússland", hofudborg: "Minsk", iso: "BY" },
  { land: "Indland", hofudborg: "Nýja-Delí", iso: "IN" },
  { land: "Indónesía", hofudborg: "Djakarta", iso: "ID" },
  { land: "Jamaíka", hofudborg: "Kingston", iso: "JM" },
  { land: "Japan", hofudborg: "Tókýó", iso: "JP" },
  { land: "Jemen", hofudborg: "Sana", iso: "YE" },
  { land: "Jórdanía", hofudborg: "Amman", iso: "JO" },
  { land: "Kambódía", hofudborg: "Phnom Penh", iso: "KH" },
  { land: "Kamerún", hofudborg: "Jánde", iso: "CM" },
  { land: "Kanada", hofudborg: "Ottawa", iso: "CA" },
  { land: "Kasakstan", hofudborg: "Astana", iso: "KZ" },
  { land: "Katar", hofudborg: "Dóha", iso: "QA" },
  { land: "Kenía", hofudborg: "Naíróbí", iso: "KE" },
  { land: "Kirgistan", hofudborg: "Bishkek", iso: "KG" },
  { land: "Kosta Ríka", hofudborg: "San José", iso: "CR" },
  { land: "Króatía", hofudborg: "Zagreb", iso: "HR" },
  { land: "Kína", hofudborg: "Peking", iso: "CN" },
  { land: "Kíribatí", hofudborg: "Suður-Tarawa", iso: "KI" },
  { land: "Kólumbía", hofudborg: "Bógóta", iso: "CO" },
  { land: "Kómorur", hofudborg: "Móróní", iso: "KM" },
  { land: "Kúba", hofudborg: "Havana", iso: "CU" },
  { land: "Kúveit", hofudborg: "Kúveitborg", iso: "KW" },
  { land: "Kýpur", hofudborg: "Nikósía", iso: "CY" },
  { land: "Laos", hofudborg: "Vientiane", iso: "LA" },
  { land: "Lesótó", hofudborg: "Maserú", iso: "LS" },
  { land: "Lettland", hofudborg: "Ríga", iso: "LV" },
  { land: "Liechtenstein", hofudborg: "Vaduz", iso: "LI" },
  { land: "Litáen", hofudborg: "Vilníus", iso: "LT" },
  { land: "Líbanon", hofudborg: "Beirút", iso: "LB" },
  { land: "Líbería", hofudborg: "Monróvía", iso: "LR" },
  { land: "Líbía", hofudborg: "Trípólí", iso: "LY" },
  { land: "Lúxemborg", hofudborg: "Lúxemborg", iso: "LU" },
  { land: "Lýðstjórnarlýðveldið Kongó", hofudborg: "Kinsasa", iso: "CD" },
  { land: "Lýðveldið Kongó", hofudborg: "Brazzaville", iso: "CG" },
  { land: "Madagaskar", hofudborg: "Antananarívó", iso: "MG" },
  { land: "Malasía", hofudborg: "Kúala Lúmpúr", iso: "MY" },
  { land: "Malaví", hofudborg: "Lílongve", iso: "MW" },
  { land: "Maldívur", hofudborg: "Male", iso: "MV" },
  { land: "Malta", hofudborg: "Valletta", iso: "MT" },
  { land: "Malí", hofudborg: "Bamakó", iso: "ML" },
  { land: "Marokkó", hofudborg: "Rabat", iso: "MA" },
  { land: "Marshalleyjar", hofudborg: "Majúró", iso: "MH" },
  { land: "Mexíkó", hofudborg: "Mexíkóborg", iso: "MX" },
  { land: "Mið-Afríkulýðveldið", hofudborg: "Bangví", iso: "CF" },
  { land: "Miðbaugs-Gínea", hofudborg: "Malabó", iso: "GQ" },
  { land: "Mjanmar", hofudborg: "Naypyidaw", iso: "MM" },
  { land: "Moldóva", hofudborg: "Kisínev", iso: "MD" },
  { land: "Mongólía", hofudborg: "Úlan Bator", iso: "MN" },
  { land: "Máritanía", hofudborg: "Núaksjott", iso: "MR" },
  { land: "Máritíus", hofudborg: "Port Louis", iso: "MU" },
  { land: "Míkrónesía", hofudborg: "Palikír", iso: "FM" },
  { land: "Mónakó", hofudborg: "Mónakó", iso: "MC" },
  { land: "Mósambík", hofudborg: "Mapútó", iso: "MZ" },
  { land: "Namibía", hofudborg: "Windhoek", iso: "NA" },
  { land: "Nepal", hofudborg: "Katmandú", iso: "NP" },
  { land: "Norður-Kórea", hofudborg: "Pjongjang", iso: "KP" },
  { land: "Norður-Makedónía", hofudborg: "Skopje", iso: "MK" },
  { land: "Níger", hofudborg: "Níamey", iso: "NE" },
  { land: "Nígería", hofudborg: "Abuja", iso: "NG" },
  { land: "Níkaragva", hofudborg: "Managva", iso: "NI" },
  { land: "Nýja-Sjáland", hofudborg: "Wellington", iso: "NZ" },
  { land: "Pakistan", hofudborg: "Islamabad", iso: "PK" },
  { land: "Palaú", hofudborg: "Ngerulmud", iso: "PW" },
  { land: "Panama", hofudborg: "Panamaborg", iso: "PA" },
  { land: "Papúa Nýja-Gínea", hofudborg: "Port Moresby", iso: "PG" },
  { land: "Paragvæ", hofudborg: "Asúnsjón", iso: "PY" },
  { land: "Perú", hofudborg: "Líma", iso: "PE" },
  { land: "Portúgal", hofudborg: "Lissabon", iso: "PT" },
  { land: "Pólland", hofudborg: "Varsjá", iso: "PL" },
  { land: "Rúanda", hofudborg: "Kígalí", iso: "RW" },
  { land: "Rúmenía", hofudborg: "Búkarest", iso: "RO" },
  { land: "Rússland", hofudborg: "Moskva", iso: "RU" },
  { land: "Salómonseyjar", hofudborg: "Honíara", iso: "SB" },
  { land: "Sambía", hofudborg: "Lúsaka", iso: "ZM" },
  { land: "Sameinuðu arabísku furstadæmin", hofudborg: "Abú Dabí", iso: "AE" },
  { land: "Samóa", hofudborg: "Apía", iso: "WS" },
  { land: "San Marínó", hofudborg: "San Marínó", iso: "SM" },
  { land: "Sankti Kristófer og Nevis", hofudborg: "Basseterre", iso: "KN" },
  { land: "Sankti Lúsía", hofudborg: "Castries", iso: "LC" },
  { land: "Sankti Vinsent og Grenadíneyjar", hofudborg: "Kingstown", iso: "VC" },
  { land: "Saó Tóme og Prinsípe", hofudborg: "São Tomé", iso: "ST" },
  { land: "Senegal", hofudborg: "Dakar", iso: "SN" },
  { land: "Serbía", hofudborg: "Belgrad", iso: "RS" },
  { land: "Seychelles-eyjar", hofudborg: "Viktoría", iso: "SC" },
  { land: "Simbabve", hofudborg: "Harare", iso: "ZW" },
  { land: "Singapúr", hofudborg: "Singapúr", iso: "SG" },
  { land: "Slóvakía", hofudborg: "Bratislava", iso: "SK" },
  { land: "Slóvenía", hofudborg: "Ljúbljana", iso: "SI" },
  { land: "Spánn", hofudborg: "Madríd", iso: "ES" },
  { land: "Srí Lanka", hofudborg: "Srí Jajevardenepúra", iso: "LK" },
  { land: "Suður-Kórea", hofudborg: "Seúl", iso: "KR" },
  { land: "Suður-Súdan", hofudborg: "Júba", iso: "SS" },
  { land: "Svartfjallaland", hofudborg: "Podgorica", iso: "ME" },
  { land: "Sviss", hofudborg: "Bern", iso: "CH" },
  { land: "Sádi-Arabía", hofudborg: "Ríad", iso: "SA" },
  { land: "Síerra Leóne", hofudborg: "Freetown", iso: "SL" },
  { land: "Síle", hofudborg: "Santíagó", iso: "CL" },
  { land: "Sómalía", hofudborg: "Mógadisjú", iso: "SO" },
  { land: "Súdan", hofudborg: "Kartúm", iso: "SD" },
  { land: "Súrínam", hofudborg: "Paramaríbó", iso: "SR" },
  { land: "Sýrland", hofudborg: "Damaskus", iso: "SY" },
  { land: "Tadsíkistan", hofudborg: "Dúsjanbe", iso: "TJ" },
  { land: "Tansanía", hofudborg: "Dódóma", iso: "TZ" },
  { land: "Taíland", hofudborg: "Bangkok", iso: "TH" },
  { land: "Tjad", hofudborg: "N'Djamena", iso: "TD" },
  { land: "Tonga", hofudborg: "Núkúalófa", iso: "TO" },
  { land: "Trínidad og Tóbagó", hofudborg: "Port of Spain", iso: "TT" },
  { land: "Tyrkland", hofudborg: "Ankara", iso: "TR" },
  { land: "Tékkland", hofudborg: "Prag", iso: "CZ" },
  { land: "Tógó", hofudborg: "Lomé", iso: "TG" },
  { land: "Túnis", hofudborg: "Túnis", iso: "TN" },
  { land: "Túrkmenistan", hofudborg: "Asgabat", iso: "TM" },
  { land: "Túvalú", hofudborg: "Funafuti", iso: "TV" },
  { land: "Ungverjaland", hofudborg: "Búdapest", iso: "HU" },
  { land: "Vanúatú", hofudborg: "Port Vila", iso: "VU" },
  { land: "Venesúela", hofudborg: "Karakas", iso: "VE" },
  { land: "Víetnam", hofudborg: "Hanoí", iso: "VN" },
  { land: "Ástralía", hofudborg: "Canberra", iso: "AU" },
  { land: "Írak", hofudborg: "Bagdad", iso: "IQ" },
  { land: "Íran", hofudborg: "Teheran", iso: "IR" },
  { land: "Írland", hofudborg: "Dublin", iso: "IE" },
  { land: "Ítalía", hofudborg: "Róm", iso: "IT" },
  { land: "Óman", hofudborg: "Múskat", iso: "OM" },
  { land: "Úganda", hofudborg: "Kampala", iso: "UG" },
  { land: "Úkraína", hofudborg: "Kænugarður", iso: "UA" },
  { land: "Úrúgvæ", hofudborg: "Montevídeó", iso: "UY" },
  { land: "Úsbekistan", hofudborg: "Taskent", iso: "UZ" },
  { land: "Þýskaland", hofudborg: "Berlín", iso: "DE" }
];

async function finnaEdaBuaTilVerkefni(titill) {
  const snap = await db.collection("verkefni").where("title", "==", titill).get();
  if (!snap.empty) return snap.docs[0].id;
  const ref = await db.collection("verkefni").add({
    title: titill,
    slides: [],
    active: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return ref.id;
}

async function main() {
  const verkefniId = await finnaEdaBuaTilVerkefni(VERKEFNA_TITILL);
  console.log(`Nota verkefnið "${VERKEFNA_TITILL}" (${verkefniId}).`);

  let batch = db.batch();
  let fjoldiIBatch = 0;
  let heild = 0;

  for (const l of LOND) {
    const questionRef = db.collection("questions").doc();
    batch.set(questionRef, {
      text: `${fanaTakn(l.iso)} ${l.land}: Hver er höfuðborgin?`,
      verkefniId,
      active: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    batch.set(db.collection("answers").doc(questionRef.id), {
      correctAnswers: [samraema(l.hofudborg)]
    });

    fjoldiIBatch += 2;
    heild++;

    if (fjoldiIBatch >= 450) {
      await batch.commit();
      batch = db.batch();
      fjoldiIBatch = 0;
    }
  }
  if (fjoldiIBatch > 0) await batch.commit();

  console.log(`Hlóð inn ${heild} spurningum (óvirkar, svör sett) í "${VERKEFNA_TITILL}".`);
  console.log("Kveiktu á verkefninu og spurningunum í stjórnborðinu þegar þú ert tilbúin/n.");
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
