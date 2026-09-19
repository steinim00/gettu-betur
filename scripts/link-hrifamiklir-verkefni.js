// Einskiptis fólksflutningur: býr til "verkefni" úr scripts/slides.json (glærurnar úr
// "50 áhrifamiklir einstaklingar í sögunni") og tengir þær 50 spurningar sem voru
// hlaðnar inn af build-hrifamiklir.js/upload-questions.js við það verkefni.
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
const slidesSlodi = path.join(__dirname, "slides.json");

if (!fs.existsSync(serviceAccountSlodi)) {
  console.error("Fann ekki scripts/serviceAccountKey.json.");
  process.exit(1);
}
if (!fs.existsSync(slidesSlodi)) {
  console.error("Fann ekki scripts/slides.json (keyrðu extract-pptx.js aftur ef þörf er).");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

// Sömu 50 spurningatextar og í build-hrifamiklir.js, til að finna réttu skjölin öruggt.
const SPURNINGATEXTAR = [
  "Hvað hét eiginkona Sókratesar?",
  "Hvað hét skólinn sem Platón stofnaði?",
  "Hvern var Aristóteles einkakennari fyrir?",
  "Hvað var Alexander mikli gamall þegar hann lést?",
  "Hvað notaði Hannibal til að fara yfir Alpana í innrás sinni í Rómarveldi?",
  "Hvaða fljót hélt Júlíus Sesar yfir árið 49 f.Kr., sem markaði upphaf borgarastyrjaldar?",
  "Hvað hét fyrsti keisari Rómar, sem áður hét Gaius Oktavíus?",
  "Í hvaða bæ fæddist Jesús samkvæmt Jólaguðspjallinu?",
  "Í hvaða borg fæddist Múhameð spámaður?",
  "Hvert var upprunalegt nafn Búdda?",
  "Hvaða þjóðflokk leiddi Atli Húnakonungur?",
  "Hver krýndi Karlamagnús Rómarkeisara á jólanótt árið 800?",
  "Hvert var rétt nafn Djengis Khan?",
  "Hvaða biblíu prentaði Jóhannes Gutenberg árið 1455?",
  "Í hvaða borg leiddi Jóhanna af Örk franska herinn til sigurs árið 1429?",
  "Til hvaða lands fann Vasco da Gama fyrstur Evrópubúa sjóleið, fyrir suðurodda Afríku?",
  "Hvað hét flaggskip Kólumbusar í fyrstu ferð hans til Ameríku árið 1492?",
  "Í hvaða safni hangir Mona Lísa eftir Leonardo da Vinci?",
  "Hvað heitir hin fræga höggmynd Michelangelo, gerð í Flórens 1501-1505?",
  "Hversu margar greinar hengdi Marteinn Lúther á kirkjuhurðina í Wittenberg árið 1517?",
  "Hvaða viðurnefni fékk Elísabet I Englandsdrottning, þar sem hún giftist aldrei?",
  "Úr hvaða frægu byggingu á Galileo Galilei að hafa gert tilraun sína með fallandi hlutum?",
  "Hvaða viðurnefni fékk Loðvík XIV, konungur Frakklands, vegna áhuga á ballett?",
  "Hvað heitir höfuðrit Isaac Newton frá 1687, þar sem hann setti fram þrjú lögmál sín?",
  "Hvaða borg stofnaði Pétur mikli árið 1703 og gerði síðar að höfuðborg Rússlands?",
  "Hver var frægastur ráðgjafi (og elskhugi) Katrínar II miklu?",
  "Yfir hvaða fljót sigldi George Washington með her sinn í óvæntri árás í desember 1776?",
  "Hversu gamall var Mozart þegar hann lést?",
  "Hvað er stjórn Robespierre og jakóbína í frönsku byltingunni jafnan kölluð?",
  "Hvar var Napóleon endanlega sigraður árið 1815?",
  "Hvað varð Beethoven fyrir, sem hafði mikil áhrif á tónsmíðar hans síðar á ævinni?",
  "Hvað voru sjálfboðaliðasveitir Giuseppe Garibaldi kallaðar?",
  "Hvað heitir rit Charles Darwin frá 1859 um þróunarkenninguna?",
  "Hvað var stjórnmálastefna Bismarcks kölluð?",
  "Hvað sannaði James Maxwell, með jöfnum sínum um raf- og segulsvið, að ljós væri?",
  "Hvað var Marie Curie fyrst kvenna til að vinna, og fyrst allra til að vinna tvisvar?",
  "Hvaða viðurnefni, sem merkir 'mikla sál', fékk Mohandas Gandhi?",
  "Hvað er byltingin sem Lenín stóð fyrir árið 1917 kölluð?",
  "Hvaða pól komst Roald Amundsen fyrstur manna á, árið 1911?",
  "Hvaða hugtak, um skiptingu Evrópu í kalda stríðinu, er Churchill sagður eiga heiðurinn af?",
  "Hvaða embætti notaði Stalín til að ná völdum eftir dauða Leníns?",
  "Hvaða kenningu setti Albert Einstein fram árið 1905?",
  "Hvaða listastefnu er Picasso, ásamt Georges Braque, talinn upphafsmaður að?",
  "Hvað var Benito Mussolini kallaður sem leiðtogi Ítalíu?",
  "Hvað hét bókin sem Adolf Hitler ritaði í fangelsi eftir Bjórkjallarauppreisnina?",
  "Hvaða lýðveldi stofnaði Charles de Gaulle í Frakklandi árið 1958?",
  "Hvað kallaðist tilraun Mao Zedong til að iðnvæða Kína hratt, árið 1957?",
  "Í hvaða borg var John F. Kennedy skotinn til bana árið 1963?",
  "Hversu mörg ár sat Nelson Mandela í fangelsi, lengst af á Robben-eyju?",
  "Hvaða fræga ræðu hélt Martin Luther King í Göngunni til Washington árið 1963?"
];

async function main() {
  const skyggnur = JSON.parse(fs.readFileSync(slidesSlodi, "utf8"));
  // Slide 1 er forsíðuglæra ("50 ÁHRIFAMIKLIR EINSTAKLINGAR Í SÖGUNNI" / "MS 2025") - sleppa henni.
  const slides = skyggnur
    .filter((s) => s.slide !== 1)
    .map((s) => ({ title: s.lines[0], body: s.lines.slice(1).join(" ") }));

  const verkefniRef = db.collection("verkefni").doc();
  await verkefniRef.set({
    title: "50 áhrifamiklir einstaklingar í sögunni",
    slides,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`Bjó til verkefni "${verkefniRef.id}" með ${slides.length} glærum.`);

  const spurningarSnap = await db.collection("questions").get();
  const batch = db.batch();
  let fjoldi = 0;

  spurningarSnap.forEach((qDoc) => {
    if (SPURNINGATEXTAR.includes(qDoc.data().text)) {
      batch.update(qDoc.ref, { verkefniId: verkefniRef.id });
      fjoldi++;
    }
  });

  await batch.commit();
  console.log(`Tengdi ${fjoldi} spurningar við verkefnið.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
