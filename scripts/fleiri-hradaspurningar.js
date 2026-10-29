// Bætir virkum spurningum (almenn þekking, íslenskt efni) við Hraðaspurningar.
// Sleppir spurningum þar sem rétt svar er þegar til í Hraðaspurningum fyrir.
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();
const HRADA = "nNY4cv1gLiIDGcm9vieu";
const MARKTAL = 75;

const SPURNINGAR = [
  ["Hver var fyrsti forseti lýðveldisins Íslands?", ["sveinn björnsson"]],
  ["Hver var fyrsta konan sem var kjörin forseti Íslands?", ["vigdís finnbogadóttir"]],
  ["Hver er núverandi forseti Íslands?", ["halla tómasdóttir"]],
  ["Hvaða á er lengst á Íslandi?", ["þjórsá"]],
  ["Hvað heitir stærsti jökull Íslands?", ["vatnajökull"]],
  ["Hvað heitir stærsta náttúrulega stöðuvatn Íslands?", ["þingvallavatn"]],
  ["Hvað kallast fimmta gangtegund íslenska hestsins?", ["skeið"]],
  ["Hvaða fugl er þjóðarfugl Íslands?", ["fálki", "fálkinn", "íslenski fálkinn"]],
  ["Hvaða blóm er þjóðarblóm Íslands?", ["holtasóley"]],
  ["Hver teiknaði Hallgrímskirkju í Reykjavík?", ["guðjón samúelsson"]],
  ["Hvaða íslenska tónlistarkona gaf út plötuna Debut árið 1993?", ["björk guðmundsdóttir", "björk"]],
  ["Hvaða íslenska hljómsveit gaf út lagið Hoppípolla?", ["sigur rós"]],
  ["Hver söng íslenska Eurovision-lagið Is It True? árið 2009?", ["jóhanna guðrún jónsdóttir", "jóhanna guðrún"]],
  ["Hver leikstýrði kvikmyndinni Hrafninn flýgur?", ["hrafn gunnlaugsson"]],
  ["Hver leikstýrði kvikmyndinni Djöflaeyjunni?", ["friðrik þór friðriksson"]],
  ["Hver leikstýrði kvikmyndinni Hross í oss?", ["benedikt erlingsson"]],
  ["Hver var fyrirliði íslenska karlalandsliðsins í fótbolta á EM 2016?", ["aron einar gunnarsson"]],
  ["Hvaða íslenski kraftakarl varð sterkasti maður heims árið 2018?", ["hafþór júlíus björnsson"]],
  ["Hver er höfuðborg Portúgals?", ["lissabon"]],
  ["Hver er höfuðborg Egyptalands?", ["kaíró"]],
  ["Hver er höfuðborg Suður-Kóreu?", ["seúl"]],
  ["Hver er höfuðborg Nýja-Sjálands?", ["wellington"]],
  ["Hver er höfuðborg Perú?", ["líma", "lima"]],
  ["Hver er höfuðborg Kenýa?", ["naíróbí", "nairobi"]],
  ["Hver er höfuðborg Sviss?", ["bern"]],
  ["Hver er höfuðborg Írlands?", ["dyflinn", "dublin"]],
  ["Hver er höfuðborg Austurríkis?", ["vín", "vínarborg"]],
  ["Hver er höfuðborg Finnlands?", ["helsinki"]],
  ["Hver er stærsta eyja Miðjarðarhafsins?", ["sikiley"]],
  ["Hvaða borg er kölluð Stóra eplið?", ["new york", "new york borg"]],
  ["Hvaða haf liggur milli Evrópu og Ameríku?", ["atlantshaf", "atlantshafið"]],
  ["Hvað heitir hæsta fjall Afríku?", ["kilimanjaró", "kilimanjaro"]],
  ["Hvað heitir hæsta fjall Norður-Ameríku?", ["denali", "mckinley", "mount mckinley"]],
  ["Hvaða reikistjarna er þekktust fyrir hringina sína?", ["satúrnus"]],
  ["Hvaða reikistjarna er næst sólinni?", ["merkúr", "merkúríus"]],
  ["Hvað heitir stærsta tungl Satúrnusar?", ["títan"]],
  ["Hver var fyrstur til að sigla sjóleiðis til Indlands frá Evrópu?", ["vasco da gama"]],
  ["Hver var rómverski guð stríðsins?", ["mars"]],
  ["Hver var gríski guð hafsins?", ["póseidon"]],
  ["Hver var æðsti guð Grikkja?", ["seifur", "zeus"]],
  ["Hver var gyðja viskunnar hjá Grikkjum?", ["aþena", "pallas aþena"]],
  ["Hver skrifaði bækurnar um Harry Potter?", ["j. k. rowling", "j.k. rowling", "rowling"]],
  ["Hver skrifaði Hungurleikana?", ["suzanne collins", "collins"]],
  ["Hver skapaði Múmínálfana?", ["tove jansson", "jansson"]],
  ["Hver skrifaði bækurnar um Línu Langsokk?", ["astrid lindgren", "lindgren"]],
  ["Hver teiknaði og skrifaði Ævintýri Tinna?", ["hergé", "herge"]],
  ["Hver samdi Tunglskinssónötuna?", ["ludwig van beethoven", "beethoven"]],
  ["Hver var söngvari hljómsveitarinnar Queen?", ["freddie mercury", "mercury"]],
  ["Hver söng lagið Thriller?", ["michael jackson"]],
  ["Hver málaði Kossinn, sem er gullskreytt verk frá Vín?", ["gustav klimt", "klimt"]],
  ["Hver málaði Stúlkuna með perlueyrnalokkinn?", ["johannes vermeer", "vermeer"]],
  ["Hver gerði styttuna Hugsuðinn?", ["auguste rodin", "rodin"]],
  ["Hver var fyrsta konan í geimnum?", ["valentína tereskóva", "tereskóva", "valentina tereshkova"]],
  ["Hver var fyrsti Bandaríkjamaðurinn í geimnum?", ["alan shepard", "shepard"]],
  ["Hvað hét geimskutlan sem sprakk skömmu eftir flugtak árið 1986?", ["challenger"]],
  ["Hvað heitir stærsta spendýr heims?", ["steypireyður", "steypireyðurin"]],
  ["Hvaða fugl er stærstur allra núlifandi fugla?", ["strútur", "strúturinn"]],
  ["Hvaða fugl er hraðskreiðastur í dýfingu og nær yfir 300 km/klst?", ["förufálki", "förufálkinn"]],
  ["Hvað kallast það þegar vatn breytist í gufu?", ["uppgufun", "gufun"]],
  ["Hvert er efnatákn járns?", ["fe"]],
  ["Hvert er efnatákn natríums?", ["na"]],
  ["Hver er efnaformúla vatns?", ["h2o"]],
  ["Hver stofnaði Microsoft ásamt Paul Allen?", ["bill gates", "gates"]],
  ["Hver stofnaði Apple ásamt Steve Wozniak?", ["steve jobs", "jobs"]],
  ["Hver stofnaði Facebook?", ["mark zuckerberg", "zuckerberg"]],
  ["Hver stofnaði Amazon?", ["jeff bezos", "bezos"]],
  ["Hversu margir leikmenn eru inni á vellinum í hverju fótboltaliði?", ["11", "ellefu"]],
  ["Hvaða þjóð varð heimsmeistari í fótbolta karla árið 2022?", ["argentína", "argentína"]],
  ["Hver er markahæsti leikmaður í sögu heimsmeistaramóts karla í fótbolta?", ["miroslav klose", "klose"]],
  ["Í hvaða borg voru sumarólympíuleikarnir haldnir árið 2024?", ["parís", "paris"]],
  ["Hvað heitir stærsta atvinnumannadeild í körfubolta í heimi?", ["nba"]],
  ["Hversu margir hringir eru í tákni Ólympíuleikanna?", ["5", "fimm"]],
  ["Frá hvaða landi er glímuíþróttin sumó?", ["japan"]],
  ["Hvað hét Muhammad Ali áður en hann breytti nafni sínu?", ["cassius clay", "clay"]],
  ["Hvaða mánuður kemur á eftir ágúst?", ["september"]],
  ["Hversu margar reikistjörnur eru í sólkerfinu okkar?", ["8", "átta"]],
  ["Hversu margir litir eru í regnboganum?", ["7", "sjö"]],
  ["Hversu margar mínútur eru í einum sólarhring?", ["1440"]],
  ["Hvaða íþrótt er spiluð á Wimbledon-mótinu?", ["tennis"]],
  ["Hvaða land er kallað land sólarupprásarinnar?", ["japan"]],
  ["Hver er höfuðborg Tékklands?", ["prag"]],
  ["Hver er höfuðborg Grikklands?", ["aþena"]],
  ["Hver er höfuðborg Noregs?", ["osló"]],
  ["Hver er höfuðborg Danmerkur?", ["kaupmannahöfn"]],
  ["Hver er höfuðborg Svíþjóðar?", ["stokkhólmur"]],
  ["Hvað heitir stærsta eyja heims sem er ekki meginland (tilheyrir Danmörku)?", ["grænland"]],
  ["Hvaða litur fæst þegar blár og gulur eru blandaðir?", ["grænn"]],
  ["Hversu margar tennur hefur fullorðið barn án endajaxla?", ["28"]]
];

const norm = (s) => s.toLowerCase().replace(/[^a-záðéíóúýþæö0-9. ]/g, "").trim();

(async () => {
  const snap = await db.collection("questions").where("verkefniId", "==", HRADA).get();
  const textiTil = new Set(snap.docs.map((d) => norm(d.data().text)));
  const svorTil = new Set();
  for (let i = 0; i < snap.docs.length; i += 50) {
    const as = await Promise.all(snap.docs.slice(i, i + 50).map((d) => db.collection("answers").doc(d.id).get()));
    as.forEach((a) => (a.data()?.correctAnswers || []).forEach((s) => svorTil.add(norm(s))));
  }
  const gildar = [];
  const sleppt = [];
  for (const [t, s] of SPURNINGAR) {
    if (textiTil.has(norm(t)) || svorTil.has(norm(s[0]))) sleppt.push(t);
    else gildar.push([t, s]);
  }
  console.log("Sleppt (svar til):", sleppt.length, "Gildar:", gildar.length);
  const val = gildar.slice(0, MARKTAL);
  const grunn = Date.now();
  let batch = db.batch();
  val.forEach(([t, s], i) => {
    const ref = db.collection("questions").doc();
    batch.set(ref, { text: t, verkefniId: HRADA, active: true, createdAt: admin.firestore.Timestamp.fromMillis(grunn + i) });
    batch.set(db.collection("answers").doc(ref.id), { correctAnswers: s });
  });
  await batch.commit();
  console.log("Bjó til", val.length, "virkar spurningar í Hraðaspurningum.");
  val.forEach(([t]) => console.log(" +", t));
})();
