// 50 AUKA spurningar (ein ný stutt-svara spurning á hvern af sömu 50
// einstaklingum og upprunalega "50 áhrifamiklir einstaklingar í sögunni"
// settið - sjá build-hrifamiklir.js). Ólíkar staðreyndir en upprunalegu
// spurningarnar, sama Gettu Betur-stíll (stutt, afmörkuð svör).
const fs = require("fs");
const path = require("path");

function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

const spurningar = [
  { text: "Hvaða lærisveinn Sókratesar skráði samræður hans, þar sem Sókrates skrifaði sjálfur ekkert niður?", svor: ["Platón"] },
  { text: "Hvaða fræga rit skrifaði Platón, m.a. um hugmyndaheiminn og hið fullkomna ríki?", svor: ["Ríkið"] },
  { text: "Hver var kennari Aristótelesar, einn frægasti heimspekingur Forn-Grikklands?", svor: ["Platón"] },
  { text: "Hvaða persneska konung sigraði Alexander mikli í orrustunni við Gaugamela árið 331 f.Kr.?", svor: ["Daríus III", "Daríus"] },
  { text: "Frá hvaða borg í Norður-Afríku kom Hannibal, sem átti í miklum átökum við Rómaveldi?", svor: ["Karþagó"] },
  { text: "Hvaða ár var Júlíus Sesar myrtur af öldungaráðsmönnum, þ.á.m. Brútusi?", svor: ["44 f.Kr.", "44"] },
  { text: "Hver var kjörfaðir og frændi Ágústusar, sem gerði hann að erfingja sínum?", svor: ["Júlíus Sesar", "Sesar"] },
  { text: "Í hvaða borg var Jesú krossfestur, samkvæmt Nýja testamentinu?", svor: ["Jerúsalem"] },
  { text: "Til hvaða borgar flúði Múhameð árið 622, atburður sem markar upphaf íslamska tímatalsins?", svor: ["Medína"] },
  { text: "Undir hvers konar tré á Búdda að hafa náð uppljómun?", svor: ["Bodhi-tré", "Bodhitré", "Bodhi tré", "Fíkjutré"] },
  { text: "Hvaða viðurnefni, sem merkir 'plága guðs', fékk Atli Húnakonungur af Rómverjum?", svor: ["Plága guðs", "Plága Guðs"] },
  { text: "Hvaða ríki/heimsveldi stjórnaði Karlamagnús, sem náði yfir stóran hluta Vestur-Evrópu?", svor: ["Frankaríkið", "Frankaveldi", "Frankaríki"] },
  { text: "Hvaða heimsveldi stofnaði Djengis Khan, sem varð það stærsta samfellda í sögunni?", svor: ["Mongólaveldið", "Mongólska heimsveldið", "Mongólaveldi"] },
  { text: "Í hvaða borg í Þýskalandi er Jóhannes Gutenberg oftast tengdur, þar sem hann þróaði prentvélina?", svor: ["Mainz"] },
  { text: "Hvernig lést Jóhanna af Örk árið 1431?", svor: ["Brennd á báli", "Var brennd á báli", "Á báli"] },
  { text: "Frá hvaða landi lagði Vasco da Gama af stað í sjóferð sína til Indlands?", svor: ["Portúgal"] },
  { text: "Fyrir hvaða land sigldi Kristófer Kólumbus þegar hann \"fann\" Ameríku árið 1492?", svor: ["Spánn", "Spán", "Spánar"] },
  { text: "Hvað kallast fræga teikning Leonardo da Vinci af manni með útrétta útlimi, sem sýnir hlutföll mannslíkamans?", svor: ["Vitrúvíusarmaðurinn", "Vítrúvíusarmaðurinn"] },
  { text: "Hvaða kapellu í Páfagarði málaði Michelangelo loftið á, eitt frægasta listaverk sögunnar?", svor: ["Sixtínsku kapelluna", "Sixtínska kapellan", "Sixtínsku kapelluna í Páfagarði"] },
  { text: "Á hvaða tungumál þýddi Marteinn Lúther Nýja testamentið, sem hjálpaði til við að staðla það tungumál?", svor: ["Þýsku", "Þýska"] },
  { text: "Hvaða spænska flota gjöreyddi England undir stjórn Elísabetar I árið 1588?", svor: ["Spænska flotann", "Ósigrandi flotann", "Spænski flotinn", "Ósigrandi flotinn"] },
  { text: "Fyrir hvað var Galileo Galilei dæmdur af rannsóknarréttinum árið 1633, vegna stuðnings síns við sólmiðjukenninguna?", svor: ["Villutrú", "Trúvillu", "Trúvilla"] },
  { text: "Hvaða fræga höll lét Loðvík XIV byggja/stækka, sem varð tákn um vald hans?", svor: ["Versali", "Versalahöll", "Versölum"] },
  { text: "Hvað er sagt hafa fallið á höfuð Isaac Newton og veitt honum hugljómun um þyngdarlögmálið?", svor: ["Epli"] },
  { text: "Um hvaða land ferðaðist Pétur mikli huldu höfði til að læra skipasmíði og vestræna tækni?", svor: ["Holland", "Hollandi", "England", "Englandi"] },
  { text: "Hvaða skaga innlimaði Katrín mikla að stórum hluta árið 1783?", svor: ["Krímskaga", "Krím", "Krímskagann"] },
  { text: "Hvaða embætti var George Washington kjörinn til árið 1789, fyrstur til að gegna?", svor: ["Forseti Bandaríkjanna", "Forseti"] },
  { text: "Í hvaða borg fæddist Wolfgang Amadeus Mozart?", svor: ["Salzburg"] },
  { text: "Hvernig lést Maximilien Robespierre árið 1794?", svor: ["Hálshöggvinn", "Í fallöxinni", "Gillótín", "Var hálshöggvinn"] },
  { text: "Til hvaða eyju var Napóleon fyrst gerður útlægur árið 1814, áður en hann sneri aftur til valda?", svor: ["Elba"] },
  { text: "Í hvaða borg fæddist tónskáldið Ludwig van Beethoven?", svor: ["Bonn"] },
  { text: "Hvaða land var Giuseppe Garibaldi stór þáttur í að sameina undir stjórn Viktors Emmanúels II?", svor: ["Ítalía", "Ítalíu"] },
  { text: "Á hvaða skipi sigldi Charles Darwin í fimm ára rannsóknarleiðangri sem lagði grunn að kenningum hans?", svor: ["HMS Beagle", "Beagle"] },
  { text: "Hvaða land sameinaði Otto von Bismarck undir stjórn Prússlands árið 1871?", svor: ["Þýskaland", "Þýskalands", "Þýskalandi"] },
  { text: "Frá hvaða landi var eðlisfræðingurinn James Clerk Maxwell upprunninn?", svor: ["Skotland", "Skotlandi"] },
  { text: "Hvaða geislavirka frumefni, nefnt eftir heimalandi hennar, uppgötvaði Marie Curie?", svor: ["Pólon"] },
  { text: "Hvaða aðferð notaði Gandhi í baráttu sinni fyrir sjálfstæði Indlands, sem einkenndist af friðsamlegri mótspyrnu?", svor: ["Borgaraleg óhlýðni", "Ofbeldislaus andspyrna", "Satyagraha"] },
  { text: "Hvað hét flokkurinn sem Lenín leiddi til valda í Rússlandi?", svor: ["Bolsévikar", "Bolsévikaflokkurinn", "Bolsévikaflokkur"] },
  { text: "Frá hvaða landi var landkönnuðurinn Roald Amundsen upprunninn?", svor: ["Noregur", "Noregi"] },
  { text: "Hvaða embætti gegndi Winston Churchill sem leiðtogi Bretlands í seinni heimsstyrjöldinni?", svor: ["Forsætisráðherra", "Forsætisráðherra Bretlands"] },
  { text: "Hvað hét upprunalegt eftirnafn Jósefs Stalíns, áður en hann tók upp dulnefnið sem þýðir 'maður úr stáli'?", svor: ["Dzjúgashvílí", "Dzhugashvili", "Djúgasvílí"] },
  { text: "Í hvaða borg var Albert Einstein fæddur?", svor: ["Ulm"] },
  { text: "Hvaða frægt málverk, sem sýnir hryllinginn af loftárás í spænsku borgarastyrjöldinni, málaði Picasso árið 1937?", svor: ["Guernica"] },
  { text: "Hvaða stjórnmálaflokk/-hreyfingu stofnaði Mussolini, sem réð ríkjum á Ítalíu?", svor: ["Fasistaflokkurinn", "Fasismi", "Fasisminn", "Fasistaflokkur"] },
  { text: "Hvaða flokk leiddi Adolf Hitler til valda í Þýskalandi árið 1933?", svor: ["Nasistaflokkurinn", "NSDAP", "Nasistaflokkur"] },
  { text: "Hvaða hreyfingu leiddi Charles de Gaulle frá Lundúnum gegn hernámi Þjóðverja í seinni heimsstyrjöldinni?", svor: ["Frjálsa Frakkland", "Frjálsir Frakkar", "Frjálst Frakkland"] },
  { text: "Hvað kallaðist herferð Maos á sjöunda áratugnum sem miðaði að því að hreinsa borgaraleg öfl úr samfélaginu, með miklum félagslegum usla?", svor: ["Menningarbyltingin", "Menningarbylting"] },
  { text: "Hvaða eyju tengist misheppnaða innrásin í Svínaflóa á forsetatíð Kennedys?", svor: ["Kúba", "Kúbu"] },
  { text: "Hvað varð Nelson Mandela árið 1994, fyrstur svartra manna til að gegna því embætti í Suður-Afríku?", svor: ["Forseti", "Forseti Suður-Afríku"] },
  { text: "Hvaða friðarverðlaun hlaut Martin Luther King árið 1964 fyrir baráttu sína gegn kynþáttamisrétti?", svor: ["Friðarverðlaun Nóbels", "Nóbelsverðlaun", "Nóbels friðarverðlaunin", "Friðarverðlaun Nóbel"] }
];

if (spurningar.length !== 50) {
  console.error(`Villa: á að vera 50 spurningar, er ${spurningar.length}.`);
  process.exit(1);
}

const utkoma = spurningar.map((s) => ({
  text: s.text,
  correctAnswers: [...new Set(s.svor.map(samraema))],
  needsReview: false
}));

const utskrift = path.join(__dirname, "hrifamiklir-extra-draft.json");
fs.writeFileSync(utskrift, JSON.stringify(utkoma, null, 2), "utf8");
console.log(`Skrifaði ${utkoma.length} nýjar spurningar í ${utskrift}`);
