// Próf 26. nóv (Google Doc "Próf 26. nov" á Drive): persónubundin próf - eitt á nemanda, 10 spurningar hvert.
// Hvert próf er verkefni með tegund "prof", aðeins sýnilegt viðkomandi nemanda (leyfdirNotendur), og LOKAÐ
// (active: false) þar til admin opnar þau öll í einu á stjórnborðinu (Yfirlit → Próf → "Opna fyrir öll").
// Prófin í sama hópi deila profHopur. Svör sem vantaði í skjalið eru tekin úr glærum nemandans.
// handvirk: true á spurningunum - nemandinn sér ekki rétt/rangt; þjálfarinn fer yfir á stjórnborðinu (✍️ Fara yfir).
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();
const FV = admin.firestore.FieldValue;
const samraema = (t) => t.trim().toLowerCase().replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "").replace(/\s+/g, " ");

const HOPUR = "prof-26-nov";
const HOPUR_HEITI = "Próf 26. nóv";
const PROF = [
  {
    id: "prof-26nov-hekla", uid: "UstjfzH6XGe53zBVhECrcAdEki63", titill: "Próf 26. nóv – Bíó",
    spurningar: [
      ["Hvaða samtök voru endurreist þökk sé Birth of a Nation?", ["KKK", "Ku Klux Klan"]],
      ["Hver skapaði James Bond?", ["Ian Fleming", "Fleming", "Ian Flemming"]],
      ["Hver fór með þrjú hlutverk í Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb (Dr. Strangelove)?", ["Peter Sellers", "Sellers"]],
      ["Hvaða mynd á metið yfir flesta leikara í einu atriði, eða um 300.000?", ["Gandhi", "Gandí"]],
      ["Nefndu aðra af tveimur áróðursmyndum Leni Riefenstahl fyrir nasista.", ["Sigur viljans", "Triumph des Willens", "Triumph of the Will", "Olympia", "Olympía"]],
      ["Hver var fyrsta teiknimyndin í fullri lengd?", ["Mjallhvít og dvergarnir sjö", "Mjallhvít og dvergarnir 7", "Mjallhvít", "Snow White"]],
      ["Hvaða stórleikkona fór með aðalhlutverkið í Galdrakarlinum í Oz, þá aðeins 16 ára?", ["Judy Garland", "Garland"]],
      ["Hvaða undirtitil ber fyrsta Star Wars-myndin (IV)?", ["A New Hope", "New Hope", "Ný von"]],
      ["Við hvaða kennileiti var frægt atriði í La Dolce Vita sem er núna vinsæll Instagram-staður?", ["Trevi-brunnurinn", "Trevi brunnurinn", "Trevi", "Trevi gosbrunnurinn", "Trevi Fountain"]],
      ["Hvaða mynd notaði John Hinckley sem ástæðu fyrir því að hann reyndi að drepa Ronald Reagan árið 1981?", ["Taxi Driver"]]
    ]
  },
  {
    id: "prof-26nov-hinrik", uid: "5TkIf8dyi7T3EoAE10na2eR2xLl1", titill: "Próf 26. nóv – Stjórnmálasaga",
    spurningar: [
      ["Hvað kallaðist deilan sem olli vinslitum milli Ólafs Thors og Hermanns Jónassonar?", ["Eiðrofsmálið", "Eiðrofsmál"]],
      ["Hvað kallaðist bandalag Framsóknarflokksins og Alþýðuflokksins í kosningunum 1956?", ["Hræðslubandalagið", "Hræðslubandalag"]],
      ["Hvað kallaðist frumvarp ríkisstjórnar Ólafs Jóhannessonar um verðtryggingu?", ["Ólafslög"]],
      ["Hvaða heiti bar grein Jónasar frá Hriflu í Tímanum árið 1930 þar sem hann svaraði fullyrðingum um geðheilsu sína?", ["Stóra bomban", "Stóra bombam"]],
      ["Hver varð óvænt forsætisráðherra í febrúar 1980, sem varaformaður síns flokks?", ["Gunnar Thoroddsen", "Thoroddsen", "Gunnar Thoreldsen"]],
      ["Hver varð fyrsti ráðherra Íslands?", ["Hannes Hafstein", "Hafstein"]],
      ["Hver var utanríkisráðherra þegar Ísland gekk í NATO?", ["Bjarni Benediktsson"]],
      ["Hver var formaður Sósíalistaflokksins frá 1939 til 1968?", ["Einar Olgeirsson", "Olgeirsson"]],
      ["Hver hefði orðið fyrsta konan á þingi ef hún hefði ekki verið strikuð út af lista?", ["Bríet Bjarnhéðinsdóttir", "Bríet"]],
      ["Hver hefur oftast allra verið forsætisráðherra, eða fimm sinnum?", ["Ólafur Thors", "Thors"]]
    ]
  },
  {
    id: "prof-26nov-julia", uid: "PJmAw5RLfzdrobwL4VZRCfXn4nz2", titill: "Próf 26. nóv – Vísindasaga",
    spurningar: [
      ["Hver fann upp lotukerfið?", ["Mendeljef", "Mendelejev", "Mendeleev", "Mendelejeff", "Dmitri Mendeleev", "Dmítríj Mendeljev"]],
      ["Hver er sagður hafa hlaupið nakinn um götur Sýrakúsu og hrópað Eureka!?", ["Arkímedes", "Archimedes"]],
      ["Hver hlaut fyrstur nóbelsverðlaun í eðlisfræði?", ["Röntgen", "Wilhelm Röntgen", "Wilhelm Conrad Röntgen", "Rontgen"]],
      ["Hvaða stórfyrirtæki er kennt við Eastman-ættina?", ["Kodak", "Eastman Kodak", "Eastman-Kodak"]],
      ["Hvaða enski stærðfræðingur sýndi fram á tilvist algóriþma og leiddi svo hópinn sem leysti ENIGMA-dulkóðunina?", ["Alan Turing", "Turing"]],
      ["Hvaða uppfinningamaður fékk 1.093 einkaleyfi í Bandaríkjunum?", ["Thomas Edison", "Edison", "Thomas Alva Edison"]],
      ["Hvaða uppfinningamaður þróaði riðstraumsmótorinn eftir að Edison hafði svikið hann um greiðslu?", ["Nikola Tesla", "Tesla"]],
      ["Hvaða ungverski uppfinningamaður fann upp kúlupennann?", ["László Bíró", "Bíró", "Laszlo Biro"]],
      ["Hver uppgötvaði nifteindina?", ["James Chadwick", "Chadwick"]],
      ["Hver útskýrði fyrstur manna Golfstrauminn?", ["Benjamin Franklin", "Franklin", "Benjamín Franklín", "Franklín"]]
    ]
  }
];
module.exports = { PROF };

if (require.main === module) (async () => {
  const batch = db.batch();
  const breytt = {};
  for (const p of PROF) {
    batch.set(db.collection("verkefni").doc(p.id), {
      title: p.titill, tegund: "prof", active: false, leyfdirNotendur: [p.uid], slides: [],
      profHopur: HOPUR, profHopurHeiti: HOPUR_HEITI, fjoldiSpurninga: p.spurningar.length, createdAt: FV.serverTimestamp()
    });
    p.spurningar.forEach(([texti, svor], i) => {
      const qid = `${p.id}-${String(i + 1).padStart(2, "0")}`;
      batch.set(db.collection("questions").doc(qid), { text: texti, verkefniId: p.id, active: false, handvirk: true, createdAt: FV.serverTimestamp() });
      batch.set(db.collection("answers").doc(qid), { correctAnswers: [...new Set(svor.map(samraema))] });
      breytt[qid] = FV.serverTimestamp();
    });
    console.log(`${p.titill}: ${p.spurningar.length} spurningar (lokað)`);
  }
  batch.set(db.collection("meta").doc("spurningaBreytingar"), { breytt, uppfaert: FV.serverTimestamp() }, { merge: true });
  await batch.commit();
  console.log("Lokið.");
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
