// Myndir sem lýsa svarinu við flestum spurningum í "50 áhrifamiklir
// einstaklingar í sögunni" - eitt myndskeið (file) af Wikimedia Commons á
// hverja spurningu sem fær mynd. Ekki allar spurningar fá mynd: sumar eiga
// ekkert gott, eitt-svar myndefni (t.d. hrein tölugildi eða óhlutbundin
// hugtök), og viðkvæmt myndefni (t.d. nasista-/fasistatákn) var sleppt
// vísvitandi.
//
// `file` er nákvæmt skráarheiti á Wikimedia Commons (staðfest með leit),
// notað í https://commons.wikimedia.org/wiki/Special:FilePath/<file> sem
// vísar sjálfkrafa á núverandi upphleðslu - þarf enga útreiknaða slóð.
const samraema = (t) =>
  t
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");

function commonsUrl(file) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;
}

// { text: nákvæm spurningatexti (eins og í Firestore), file: Commons skrá, alt: stuttur lýsitexti }
const MYNDIR = [
  // --- Platón ---
  { text: "Hvað hét skólinn sem Platón stofnaði?", file: "Sanzio 01 Plato Aristotle.jpg", alt: "Platón og Aristóteles, úr fresku Rafaels „Skólinn í Aþenu“" },
  // --- Aristóteles ---
  { text: "Hvern var Aristóteles einkakennari fyrir?", file: "Alexander and Bucephalus - Battle of Issus mosaic - Museo Archeologico Nazionale - Naples BW.jpg", alt: "Alexander mikli á hesti sínum Búkefalosi, mósaík frá Pompei" },
  // --- Alexander mikli ---
  { text: "Hvaða persneska konung sigraði Alexander mikli í orrustunni við Gaugamela árið 331 f.Kr.?", file: "Darius III mosaic.jpg", alt: "Daríus III Persakonungur, mósaík frá Pompei" },
  // --- Hannibal ---
  { text: "Hvað notaði Hannibal til að fara yfir Alpana í innrás sinni í Rómarveldi?", file: "Heinrich Leutemann - Hannibals Übergang über die Alpen.jpg", alt: "Hannibal fer yfir Alpana með stríðsfíla" },
  // --- Júlíus Sesar ---
  { text: "Hvaða ár var Júlíus Sesar myrtur af öldungaráðsmönnum, þ.á.m. Brútusi?", file: "Jean-Léon Gérôme - The Death of Caesar - Walters 37884.jpg", alt: "Dauði Júlíusar Sesars, málverk eftir Jean-Léon Gérôme" },
  // --- Ágústus ---
  { text: "Hvað hét fyrsti keisari Rómar, sem áður hét Gaius Oktavíus?", file: "Statue-Augustus.jpg", alt: "Stytta af Ágústusi keisara" },
  // --- Jesús ---
  { text: "Í hvaða bæ fæddist Jesús samkvæmt Jólaguðspjallinu?", file: "Bethlehem BW 10.JPG", alt: "Fæðingarkirkjan í Betlehem" },
  // --- Múhameð ---
  { text: "Í hvaða borg fæddist Múhameð spámaður?", file: "The Kaaba during Hajj.jpg", alt: "Kaaba í Mekka" },
  { text: "Til hvaða borgar flúði Múhameð árið 622, atburður sem markar upphaf íslamska tímatalsins?", file: "Al-Masjid al-Nabawi 02.jpg", alt: "Mosku spámannsins í Medínu" },
  // --- Búdda ---
  { text: "Hvert var upprunalegt nafn Búdda?", file: "Buddha in Sarnath Museum (Dhammajak Mutra).jpg", alt: "Búdda-stytta frá Sarnath" },
  { text: "Undir hvers konar tré á Búdda að hafa náð uppljómun?", file: "Mahabodhitree.jpg", alt: "Bodhi-tréð í Bodh Gaya" },
  // --- Atli Húnakonungur ---
  { text: "Hvaða viðurnefni, sem merkir 'plága guðs', fékk Atli Húnakonungur af Rómverjum?", file: "Leoattila-Raphael.jpg", alt: "Fundur Leós páfa og Atla Húnakonungs, fresca eftir Rafael" },
  // --- Karlamagnús ---
  { text: "Hver krýndi Karlamagnús Rómarkeisara á jólanótt árið 800?", file: "Raphael Charlemagne.jpg", alt: "Krýning Karlamagnúsar, fresca eftir Rafael" },
  // --- Djengis Khan ---
  { text: "Hvert var rétt nafn Djengis Khan?", file: "YuanEmperorAlbumGenghisPortrait.jpg", alt: "Djengis Khan, mynd frá Yuan-tímabilinu" },
  // --- Jóhannes Gutenberg ---
  { text: "Hvaða biblíu prentaði Jóhannes Gutenberg árið 1455?", file: "Gutenberg Bible.jpg", alt: "Gutenberg-biblían" },
  // --- Jóhanna af Örk ---
  { text: "Í hvaða borg leiddi Jóhanna af Örk franska herinn til sigurs árið 1429?", file: "Scherrer jeanne enters orlean.jpg", alt: "Jóhanna af Örk í Orléans" },
  { text: "Hvernig lést Jóhanna af Örk árið 1431?", file: "Joan of arc burning at stake.jpg", alt: "Jóhanna af Örk brennd á báli" },
  // --- Vasco da Gama ---
  { text: "Til hvaða lands fann Vasco da Gama fyrstur Evrópubúa sjóleið, fyrir suðurodda Afríku?", file: "Vasco da Gama perante o Samorim de Calecute.png", alt: "Vasco da Gama kemur til Indlands" },
  { text: "Frá hvaða landi lagði Vasco da Gama af stað í sjóferð sína til Indlands?", file: "Vasco da Gama - 1838.png", alt: "Vasco da Gama" },
  // --- Kristófer Kólumbus ---
  { text: "Hvað hét flaggskip Kólumbusar í fyrstu ferð hans til Ameríku árið 1492?", file: "Santa-Maria.jpg", alt: "Santa María, flaggskip Kólumbusar" },
  { text: "Fyrir hvaða land sigldi Kristófer Kólumbus þegar hann \"fann\" Ameríku árið 1492?", file: "Landing of Columbus (2).jpg", alt: "Lending Kólumbusar, málverk eftir John Vanderlyn" },
  // --- Leonardo da Vinci ---
  { text: "Í hvaða safni hangir Mona Lísa eftir Leonardo da Vinci?", file: "Leonardo da Vinci - Mona Lisa.jpg", alt: "Mona Lísa eftir Leonardo da Vinci" },
  { text: "Hvað kallast fræga teikning Leonardo da Vinci af manni með útrétta útlimi, sem sýnir hlutföll mannslíkamans?", file: "Da Vinci Vitruve Luc Viatour.jpg", alt: "Vitrúvíusarmaðurinn eftir Leonardo da Vinci" },
  // --- Michelangelo ---
  { text: "Hvað heitir hin fræga höggmynd Michelangelo, gerð í Flórens 1501-1505?", file: "Michelangelo's David - right view 2.jpg", alt: "Davíð eftir Michelangelo" },
  { text: "Hvaða kapellu í Páfagarði málaði Michelangelo loftið á, eitt frægasta listaverk sögunnar?", file: "CAPPELLA SISTINA Ceiling.jpg", alt: "Loft Sixtínsku kapellunnar" },
  // --- Marteinn Lúther ---
  { text: "Hversu margar greinar hengdi Marteinn Lúther á kirkjuhurðina í Wittenberg árið 1517?", file: "Luther95theses.jpg", alt: "95 greinar Marteins Lúthers" },
  { text: "Á hvaða tungumál þýddi Marteinn Lúther Nýja testamentið, sem hjálpaði til við að staðla það tungumál?", file: "Lutherbibel.jpg", alt: "Þýska Lúthersbiblían" },
  // --- Elísabet I ---
  { text: "Hvaða viðurnefni fékk Elísabet I Englandsdrottning, þar sem hún giftist aldrei?", file: "Elizabeth I (Armada Portrait).jpg", alt: "Elísabet I, Armada-portrettið" },
  { text: "Hvaða spænska flota gjöreyddi England undir stjórn Elísabetar I árið 1588?", file: "Spanish Armada.jpg", alt: "Spænski flotinn 1588" },
  // --- Galileo Galilei ---
  { text: "Úr hvaða frægu byggingu á Galileo Galilei að hafa gert tilraun sína með fallandi hlutum?", file: "Leaning tower of Pisa.jpg", alt: "Skakki turninn í Písa" },
  { text: "Fyrir hvað var Galileo Galilei dæmdur af rannsóknarréttinum árið 1633, vegna stuðnings síns við sólmiðjukenninguna?", file: "Galileo before the Holy Office.jpg", alt: "Galíleó fyrir rannsóknarréttinum" },
  // --- Loðvík XIV ---
  { text: "Hvaða viðurnefni fékk Loðvík XIV, konungur Frakklands, vegna áhuga á ballett?", file: "Louis XIV of France.jpg", alt: "Loðvík XIV, Sólkonungurinn" },
  { text: "Hvaða fræga höll lét Loðvík XIV byggja/stækka, sem varð tákn um vald hans?", file: "Chateau Versailles Galerie des Glaces.jpg", alt: "Spegilsalurinn í Versölum" },
  // --- Isaac Newton ---
  { text: "Hvað heitir höfuðrit Isaac Newton frá 1687, þar sem hann setti fram þrjú lögmál sín?", file: "Prinicipia-title.png", alt: "Titilsíða Principia Mathematica eftir Newton" },
  { text: "Hvað er sagt hafa fallið á höfuð Isaac Newton og veitt honum hugljómun um þyngdarlögmálið?", file: "GodfreyKneller-IsaacNewton-1689.jpg", alt: "Isaac Newton, portrett eftir Godfrey Kneller" },
  // --- Pétur mikli ---
  { text: "Hvaða borg stofnaði Pétur mikli árið 1703 og gerði síðar að höfuðborg Rússlands?", file: "Peter and Paul Cathedral and Fortress in St Petersburg.jpg", alt: "Pétur og Páls virkið, Sankti Pétursborg" },
  { text: "Um hvaða land ferðaðist Pétur mikli huldu höfði til að læra skipasmíði og vestræna tækni?", file: "Peter I by Kneller.jpg", alt: "Pétur mikli, portrett eftir Godfrey Kneller frá Lundúnaheimsókninni" },
  // --- Katrín mikla ---
  { text: "Hver var frægastur ráðgjafi (og elskhugi) Katrínar II miklu?", file: "Grigory Potemkin.PNG", alt: "Grigoríj Potemkin" },
  // --- George Washington ---
  { text: "Yfir hvaða fljót sigldi George Washington með her sinn í óvæntri árás í desember 1776?", file: "Emanuel Leutze Washington Crossing the Delaware The Metropolitan Museum of Art.jpg", alt: "Washington fer yfir Delaware-fljótið" },
  { text: "Hvaða embætti var George Washington kjörinn til árið 1789, fyrstur til að gegna?", file: "Gilbert Stuart Williamstown Portrait of George Washington.jpg", alt: "George Washington, portrett eftir Gilbert Stuart" },
  // --- Mozart ---
  { text: "Hversu gamall var Mozart þegar hann lést?", file: "Wolfgang-amadeus-mozart 1.jpg", alt: "Wolfgang Amadeus Mozart, portrett eftir Barböru Krafft" },
  { text: "Í hvaða borg fæddist Wolfgang Amadeus Mozart?", file: "Getreidegasse 9, Salzburg.jpg", alt: "Fæðingarhús Mozarts í Salzburg" },
  // --- Robespierre ---
  { text: "Hvernig lést Maximilien Robespierre árið 1794?", file: "Louis Boilly Robespierre.jpg", alt: "Maximilien Robespierre" },
  // --- Napóleon ---
  { text: "Hvar var Napóleon endanlega sigraður árið 1815?", file: "Bataille de Waterloo, 18 juin 1815 (par Clément-Auguste Andrieux).jpg", alt: "Orrustan við Waterloo 1815" },
  // --- Beethoven ---
  { text: "Hvaða fötlun hrjáði tónskáldið Ludwig van Beethoven, einkum síðari hluta ævi hans?", file: "Beethoven.jpg", alt: "Ludwig van Beethoven, portrett eftir Joseph Karl Stieler" },
  { text: "Í hvaða borg fæddist tónskáldið Ludwig van Beethoven?", file: "Beethoven house.jpg", alt: "Fæðingarhús Beethovens í Bonn" },
  // --- Giuseppe Garibaldi ---
  { text: "Hvað voru sjálfboðaliðasveitir Giuseppe Garibaldi kallaðar?", file: "Giuseppe Garibaldi Circa 1860.jpg", alt: "Giuseppe Garibaldi" },
  { text: "Hvaða land var Giuseppe Garibaldi stór þáttur í að sameina undir stjórn Viktors Emmanúels II?", file: "Italy unification 1815 1870.jpg", alt: "Sameining Ítalíu 1815-1870" },
  // --- Charles Darwin ---
  { text: "Hvað heitir rit Charles Darwin frá 1859 um þróunarkenninguna?", file: "Origin of Species title page.jpg", alt: "Titilsíða Uppruna tegundanna eftir Darwin" },
  { text: "Á hvaða skipi sigldi Charles Darwin í fimm ára rannsóknarleiðangri sem lagði grunn að kenningum hans?", file: "HMS Beagle by Conrad Martens.jpg", alt: "HMS Beagle, málverk eftir Conrad Martens" },
  // --- Otto von Bismarck ---
  { text: "Hvað var stjórnmálastefna Bismarcks kölluð?", file: "Bismarckottovon.jpg", alt: "Otto von Bismarck" },
  { text: "Hvaða land sameinaði Otto von Bismarck undir stjórn Prússlands árið 1871?", file: "1871 Proclamation of the German Empire.jpg", alt: "Útkoma þýska keisaradæmisins 1871, málverk eftir Anton von Werner" },
  // --- James Clerk Maxwell ---
  { text: "Hvað sannaði James Maxwell, með jöfnum sínum um raf- og segulsvið, að ljós væri?", file: "James Clerk Maxwell profile.jpg", alt: "James Clerk Maxwell" },
  // --- Marie Curie ---
  { text: "Hvað var Marie Curie fyrst kvenna til að vinna, og fyrst allra til að vinna tvisvar?", file: "Marie Curie c1920.jpg", alt: "Marie Curie um 1920" },
  { text: "Hvaða geislavirka frumefni, nefnt eftir heimalandi hennar, uppgötvaði Marie Curie?", file: "Marie Curie in her laboratory.jpg", alt: "Marie Curie í rannsóknarstofu sinni" },
  // --- Mohandas Gandhi ---
  { text: "Hvaða viðurnefni, sem merkir 'mikla sál', fékk Mohandas Gandhi?", file: "Mahatma-Gandhi, studio, 1931.jpg", alt: "Mahatma Gandhi, 1931" },
  { text: "Hvaða aðferð notaði Gandhi í baráttu sinni fyrir sjálfstæði Indlands, sem einkenndist af friðsamlegri mótspyrnu?", file: "Salt March.jpg", alt: "Saltgangan undir forystu Gandhis, 1930" },
  // --- Lenín ---
  { text: "Hvað er byltingin sem Lenín stóð fyrir árið 1917 kölluð?", file: "Kustodiev The Bolshevik.jpg", alt: "„Bolsévikinn“, málverk eftir Boris Kustodiev" },
  // --- Roald Amundsen ---
  { text: "Hvaða pól komst Roald Amundsen fyrstur manna á, árið 1911?", file: "Amundsen Expedition at South Pole.jpg", alt: "Leiðangur Amundsens á Suðurpólnum 1911" },
  { text: "Frá hvaða landi var landkönnuðurinn Roald Amundsen upprunninn?", file: "RoaldAmundsen.JPG", alt: "Roald Amundsen" },
  // --- Winston Churchill ---
  { text: "Hvaða hugtak, um skiptingu Evrópu í kalda stríðinu, er Churchill sagður eiga heiðurinn af?", file: "Churchill V sign HU 55521.jpg", alt: "Winston Churchill" },
  { text: "Hvaða embætti gegndi Winston Churchill sem leiðtogi Bretlands í seinni heimsstyrjöldinni?", file: "The Big Three at the Yalta Conference.jpg", alt: "Churchill, Roosevelt og Stalín á Jalta-ráðstefnunni 1945" },
  // --- Jósef Stalín ---
  { text: "Hvaða embætti notaði Stalín til að ná völdum eftir dauða Leníns?", file: "Joseph Stalin official portrait.jpg", alt: "Jósef Stalín" },
  { text: "Hvað hét upprunalegt eftirnafn Jósefs Stalíns, áður en hann tók upp dulnefnið sem þýðir 'maður úr stáli'?", file: "Stalin 1902-1.jpg", alt: "Jósef Stalín árið 1902" },
  // --- Albert Einstein ---
  { text: "Hvaða kenningu setti Albert Einstein fram árið 1905?", file: "Albert Einstein photo 1921.jpg", alt: "Albert Einstein, 1921" },
  { text: "Í hvaða borg var Albert Einstein fæddur?", file: "Ulm Minster.jpg", alt: "Ulm-dómkirkjan, fæðingarborg Einsteins" },
  // --- Pablo Picasso ---
  { text: "Hvaða frægt málverk, sem sýnir hryllinginn af loftárás í spænsku borgarastyrjöldinni, málaði Picasso árið 1937?", file: "Guernica - Pablo Picasso - 1937 - Museo Nacional Centro de Arte Reina Sofía a Madrid, 2024.jpg", alt: "Guernica eftir Pablo Picasso" },
  // --- Charles de Gaulle ---
  { text: "Hvaða lýðveldi stofnaði Charles de Gaulle í Frakklandi árið 1958?", file: "De Gaulle-OWI.jpg", alt: "Charles de Gaulle" },
  { text: "Hvaða hreyfingu leiddi Charles de Gaulle frá Lundúnum gegn hernámi Þjóðverja í seinni heimsstyrjöldinni?", file: "Flag of Free France (1940-1944).svg", alt: "Fáni Frjálsa Frakklands" },
  // --- John F. Kennedy ---
  { text: "Í hvaða borg var John F. Kennedy skotinn til bana árið 1963?", file: "John F. Kennedy, White House color photo portrait.jpg", alt: "John F. Kennedy" },
  { text: "Hvaða eyju tengist misheppnaða innrásin í Svínaflóa á forsetatíð Kennedys?", file: "Flag of Cuba (3-2).svg", alt: "Fáni Kúbu" },
  // --- Nelson Mandela ---
  { text: "Hversu mörg ár sat Nelson Mandela í fangelsi, lengst af á Robben-eyju?", file: "Nelson Mandela's prison cell, Robben Island, South Africa.jpg", alt: "Fangaklefi Nelsons Mandela á Robben-eyju" },
  { text: "Hvað varð Nelson Mandela árið 1994, fyrstur svartra manna til að gegna því embætti í Suður-Afríku?", file: "Nelson Mandela.jpg", alt: "Nelson Mandela" },
  // --- Martin Luther King ---
  { text: "Hvaða fræga ræðu hélt Martin Luther King í Göngunni til Washington árið 1963?", file: "Martin Luther King - March on Washington.jpg", alt: "Martin Luther King flytur ræðu sína í Göngunni til Washington, 1963" },
  { text: "Hvaða friðarverðlaun hlaut Martin Luther King árið 1964 fyrir baráttu sína gegn kynþáttamisrétti?", file: "Martin Luther King Jr NYWTS.jpg", alt: "Martin Luther King" }
];

module.exports = { MYNDIR, commonsUrl, samraema };
