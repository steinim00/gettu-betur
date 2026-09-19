// Handunnar spurningar (opið svar, að hætti Gettu Betur) fyrir
// "50 áhrifamiklir einstaklingar í sögunni" skjalið.
const fs = require("fs");
const path = require("path");

const heimild = "hrifamiklir-einstaklingar.pptx";

function samraema(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

const spurningar = [
  { text: "Hvað hét eiginkona Sókratesar?", svor: ["Xanþippa"] },
  { text: "Hvað hét skólinn sem Platón stofnaði?", svor: ["Akademía", "Akademían"] },
  { text: "Hvern var Aristóteles einkakennari fyrir?", svor: ["Alexander mikla", "Alexander", "Alexander mikli"] },
  { text: "Hvað var Alexander mikli gamall þegar hann lést?", svor: ["32", "32 ára"] },
  { text: "Hvað notaði Hannibal til að fara yfir Alpana í innrás sinni í Rómarveldi?", svor: ["fíla", "stríðsfíla", "stríðsfílar", "fílar"] },
  { text: "Hvaða fljót hélt Júlíus Sesar yfir árið 49 f.Kr., sem markaði upphaf borgarastyrjaldar?", svor: ["Rúbíkon", "Rúbíkonfljótið", "Rúbíkonfljót"] },
  { text: "Hvað hét fyrsti keisari Rómar, sem áður hét Gaius Oktavíus?", svor: ["Ágústus"] },
  { text: "Í hvaða bæ fæddist Jesús samkvæmt Jólaguðspjallinu?", svor: ["Betlehem"] },
  { text: "Í hvaða borg fæddist Múhameð spámaður?", svor: ["Mekka", "Mekku"] },
  { text: "Hvert var upprunalegt nafn Búdda?", svor: ["Siddharta Gautama", "Siddharta", "Gautama"] },
  { text: "Hvaða þjóðflokk leiddi Atli Húnakonungur?", svor: ["Húnar", "Húna", "Húnarnir"] },
  { text: "Hver krýndi Karlamagnús Rómarkeisara á jólanótt árið 800?", svor: ["Leó páfi", "Leó", "Leo páfi"] },
  { text: "Hvert var rétt nafn Djengis Khan?", svor: ["Temújin"] },
  { text: "Hvaða biblíu prentaði Jóhannes Gutenberg árið 1455?", svor: ["Gutenberg biblían", "Gutenberg biblíuna", "42 línu biblían", "42 línu biblíuna"] },
  { text: "Í hvaða borg leiddi Jóhanna af Örk franska herinn til sigurs árið 1429?", svor: ["Orléans", "Orleans"] },
  { text: "Til hvaða lands fann Vasco da Gama fyrstur Evrópubúa sjóleið, fyrir suðurodda Afríku?", svor: ["Indland", "Indlands", "Indlandi"] },
  { text: "Hvað hét flaggskip Kólumbusar í fyrstu ferð hans til Ameríku árið 1492?", svor: ["Santa María", "Santa Maria"] },
  { text: "Í hvaða safni hangir Mona Lísa eftir Leonardo da Vinci?", svor: ["Louvre", "Louvre safnið", "Louvre-safnið"] },
  { text: "Hvað heitir hin fræga höggmynd Michelangelo, gerð í Flórens 1501-1505?", svor: ["Davíð"] },
  { text: "Hversu margar greinar hengdi Marteinn Lúther á kirkjuhurðina í Wittenberg árið 1517?", svor: ["95"] },
  { text: "Hvaða viðurnefni fékk Elísabet I Englandsdrottning, þar sem hún giftist aldrei?", svor: ["Meydrottningin", "Meydrottning"] },
  { text: "Úr hvaða frægu byggingu á Galileo Galilei að hafa gert tilraun sína með fallandi hlutum?", svor: ["Skakka turninum í Písa", "Skakki turninn í Písa", "Písaturninn"] },
  { text: "Hvaða viðurnefni fékk Loðvík XIV, konungur Frakklands, vegna áhuga á ballett?", svor: ["Sólkonungurinn", "Sólkonungur"] },
  { text: "Hvað heitir höfuðrit Isaac Newton frá 1687, þar sem hann setti fram þrjú lögmál sín?", svor: ["Principia"] },
  { text: "Hvaða borg stofnaði Pétur mikli árið 1703 og gerði síðar að höfuðborg Rússlands?", svor: ["Sankti Pétursborg", "Pétursborg", "St. Pétursborg"] },
  { text: "Hver var frægastur ráðgjafi (og elskhugi) Katrínar II miklu?", svor: ["Grigoríj Potemkin", "Potemkin"] },
  { text: "Yfir hvaða fljót sigldi George Washington með her sinn í óvæntri árás í desember 1776?", svor: ["Delaware", "Delaware fljótið"] },
  { text: "Hversu gamall var Mozart þegar hann lést?", svor: ["35", "35 ára"] },
  { text: "Hvað er stjórn Robespierre og jakóbína í frönsku byltingunni jafnan kölluð?", svor: ["Ógnarstjórnin", "Ógnarstjórn jakóbína", "Ógnarstjórn"] },
  { text: "Hvar var Napóleon endanlega sigraður árið 1815?", svor: ["Waterloo"] },
  { text: "Hvað varð Beethoven fyrir, sem hafði mikil áhrif á tónsmíðar hans síðar á ævinni?", svor: ["Heyrnarleysi", "Heyrnaleysi", "Hann varð heyrnarlaus", "Heyrnarleysið"] },
  { text: "Hvað voru sjálfboðaliðasveitir Giuseppe Garibaldi kallaðar?", svor: ["Rauðstakkarnir", "Rauðstakkar"] },
  { text: "Hvað heitir rit Charles Darwin frá 1859 um þróunarkenninguna?", svor: ["Uppruni tegundanna"] },
  { text: "Hvað var stjórnmálastefna Bismarcks kölluð?", svor: ["Realpolitik"] },
  { text: "Hvað sannaði James Maxwell, með jöfnum sínum um raf- og segulsvið, að ljós væri?", svor: ["Rafsegulbylgjur", "Rafsegulbylgja"] },
  { text: "Hvað var Marie Curie fyrst kvenna til að vinna, og fyrst allra til að vinna tvisvar?", svor: ["Nóbelsverðlaun", "Nóbelsverðlaunin"] },
  { text: "Hvaða viðurnefni, sem merkir 'mikla sál', fékk Mohandas Gandhi?", svor: ["Mahatma"] },
  { text: "Hvað er byltingin sem Lenín stóð fyrir árið 1917 kölluð?", svor: ["Októberbyltingin", "Októberbylting", "Októberbyltingu"] },
  { text: "Hvaða pól komst Roald Amundsen fyrstur manna á, árið 1911?", svor: ["Suðurpólinn", "Suðurpóllinn"] },
  { text: "Hvaða hugtak, um skiptingu Evrópu í kalda stríðinu, er Churchill sagður eiga heiðurinn af?", svor: ["Járntjaldið"] },
  { text: "Hvaða embætti notaði Stalín til að ná völdum eftir dauða Leníns?", svor: ["Aðalritari", "Aðalritari kommúnistaflokksins", "Aðalritari Sovéska kommúnistaflokksins"] },
  { text: "Hvaða kenningu setti Albert Einstein fram árið 1905?", svor: ["Sérstöku afstæðiskenninguna", "Sérstaka afstæðiskenningin", "Afstæðiskenningin"] },
  { text: "Hvaða listastefnu er Picasso, ásamt Georges Braque, talinn upphafsmaður að?", svor: ["Kúbismi", "Kúbisma", "Kúbisminn"] },
  { text: "Hvað var Benito Mussolini kallaður sem leiðtogi Ítalíu?", svor: ["Il Duce"] },
  { text: "Hvað hét bókin sem Adolf Hitler ritaði í fangelsi eftir Bjórkjallarauppreisnina?", svor: ["Mein Kampf"] },
  { text: "Hvaða lýðveldi stofnaði Charles de Gaulle í Frakklandi árið 1958?", svor: ["Fimmta lýðveldið", "5. lýðveldið", "Fimmta lýðveldi Frakklands"] },
  { text: "Hvað kallaðist tilraun Mao Zedong til að iðnvæða Kína hratt, árið 1957?", svor: ["Risastökkið", "Stóra stökkið"] },
  { text: "Í hvaða borg var John F. Kennedy skotinn til bana árið 1963?", svor: ["Dallas"] },
  { text: "Hversu mörg ár sat Nelson Mandela í fangelsi, lengst af á Robben-eyju?", svor: ["27", "27 ár"] },
  { text: "Hvaða fræga ræðu hélt Martin Luther King í Göngunni til Washington árið 1963?", svor: ["I have a Dream", "Ég á mér draum"] }
];

const utkoma = spurningar.map((s, i) => ({
  text: s.text,
  correctAnswers: [...new Set(s.svor.map(samraema))],
  needsReview: false,
  source: `${heimild} - skyggna ${i + 2}`
}));

const utskrift = path.join(__dirname, "questions-draft.json");
fs.writeFileSync(utskrift, JSON.stringify(utkoma, null, 2), "utf8");
console.log(`Skrifaði ${utkoma.length} spurningar í ${utskrift}`);
