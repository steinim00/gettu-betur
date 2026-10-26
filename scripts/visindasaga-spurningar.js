// 1) Eyðir tómu verkefni "Súrt & Sykurlaust".
// 2) Býr til verkefnið "Vísindasaga" (óvirkt) með 50 óvirkum spurningum úr
//    Drive-glærunum VÍSINDASAGA 1-6 og ÍSLENSKIR VÍSINDAMENN, til yfirferðar.
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();
const HRADA = "nNY4cv1gLiIDGcm9vieu";
const SURT = "AQ9cPoY5QFLQkU6QYx8N";

const SPURNINGAR = [
  ["Hvaða forngríski heimspekingur frá Míletus taldi að vatn væri grunneining alls?", ["þales", "þales frá míletus"]],
  ["Hver setti fram hugmyndina um fjögur frumefni: vatn, eld, loft og jörð?", ["empedókles", "empedókles frá agrigentum"]],
  ["Hvaða fimmta frumefni bætti Aristóteles við þau fjögur, sem átti að vera í geimnum?", ["eter", "eisa"]],
  ["Hver var kallaður heimspekingurinn hlæjandi og er upphafsmaður atómkenningarinnar ásamt Levkippos?", ["demókrítos"]],
  ["Hvaða konungur fékk Arkímedes til að kanna hvort kóróna hans væri úr gulli?", ["híeron", "híeron konungur", "híeron ii"]],
  ["Hvað kallast tækið sem Arkímedes fann upp til að flytja vatn upp á við?", ["arkímedesarskrúfan", "arkímedesar-skrúfan", "arkímedesarskrúfa", "skrúfa arkímedesar"]],
  ["Hvað kallast leitin að viskusteininum, sem átti að breyta óæðri málmum í gull?", ["gullgerðarlist", "gullgerðarlistin"]],
  ["Hvað kallast tærandi vökvi úr saltpéturssýru og saltsýru sem getur leyst upp gull?", ["kóngavatn", "aqua regia"]],
  ["Hvað hét helsta miðstöð lærdóms í arabaheiminum, starfrækt í Bagdad á 9. öld?", ["hús viskunnar", "bayt al-hikmah"]],
  ["Hver sýndi fram á að misþungir hlutir falla jafnhratt til jarðar, gegn kenningu Aristótelesar?", ["galíleó galílei", "galíleó", "galilei"]],
  ["Hver fann upp loftþyngdarmælinn (barómeterinn) og fyllti glerpípu af kvikasilfri?", ["evangelista torricelli", "torricelli"]],
  ["Hver fann upp sáningavélina og breska rokksveit er kennd við?", ["jethro tull", "tull"]],
  ["Hvaða enski klukkusmiður smíðaði sjóklukku sem leysti gátuna um staðarákvörðun á sjó?", ["john harrison", "harrison"]],
  ["Hver sannaði með flugdreka að eldingar væru rafmagn og fann upp eldingavarann?", ["benjamin franklin", "franklin"]],
  ["Hver hannaði fyrstu spunavélina, Spuna-Jenný?", ["james hargreaves", "hargreaves"]],
  ["Hver endurbætti gufuvélina svo hún varð drifkraftur bresku iðnbyltingarinnar?", ["james watt", "watt"]],
  ["Hver smíðaði fyrsta gufuskipið og kafbátinn Nautilus?", ["robert fulton", "fulton"]],
  ["Hvað hét eimreiðin sem George Stephenson hannaði og vann samkeppni með?", ["rocket"]],
  ["Hverjum er almennt eignuð uppfinning sjónaukans, þótt það sé umdeilt?", ["hans lippershey", "lippershey"]],
  ["Hvað hét fyrsti prentarinn á Íslandi, sænskur að uppruna, sem starfaði á Hólum?", ["jón matthíasson"]],
  ["Hver er oft kallaður faðir vestrænna lækninga og er kenndur við eiðinn sem læknar sverja?", ["hippókrates"]],
  ["Hver útskýrði fyrstur hringrás blóðsins og að hjartað dæli því um líkamann?", ["william harvey", "harvey"]],
  ["Hvaða enski læknir uppgötvaði að sítrusávextir lækna skyrbjúg?", ["james lind", "lind"]],
  ["Skortur á hvaða vítamíni veldur skyrbjúg?", ["c-vítamín", "c vítamín", "cvítamín"]],
  ["Hvaða vægari sjúkdóm notaði Edward Jenner til að bólusetja gegn bólusótt?", ["kúabóla", "kúabólu", "kúabólan"]],
  ["Hvaða enski læknir sýndi fram á að kólera smitaðist með drykkjarvatni?", ["john snow", "snow"]],
  ["Hver setti fram frumukenninguna ásamt Matthias Schleiden?", ["theodor schwann", "schwann"]],
  ["Hvaða íslenski goðorðsmaður og læknir bjó á Eyri við Arnarfjörð, sem síðar nefndist Hrafnseyri?", ["hrafn sveinbjarnarson", "hrafn"]],
  ["Hver reiknaði ummál jarðar út frá skugga prika í Alexandríu og Sýene?", ["eratosþenes", "eratosþenes frá kýrene"]],
  ["Hver setti fyrstur fram sólmiðjukenninguna í fornöld?", ["aristarkus frá samos", "aristarkus"]],
  ["Hvað hét helsta stjörnufræðirit Ptólemeusar sem var ráðandi í nærri 1400 ár?", ["almagest"]],
  ["Hver setti fram sólmiðjukenninguna sem leysti Almagest af hólmi, í bókinni De Revolutionibus?", ["nicolas kópernikus", "kópernikus", "kóperníkus", "nikulás kópernikus"]],
  ["Hvaða danski stjörnufræðingur reisti stjörnuskoðunarstöð á eyjunni Hven?", ["tycho brahe", "brahe"]],
  ["Hver skrifaði ritið Frumþættir (Stóíkeia), grundvallarrit í rúmfræði?", ["evklíð"]],
  ["Hvaða indverski stærðfræðingur skilgreindi fyrstur nútíma núllið?", ["brahmagupta"]],
  ["Hvaða ítalski stærðfræðingur kynnti arabíska tölustafi til Evrópu með bókinni Liber Abbaci?", ["fibonacci", "leonardo af pisa"]],
  ["Hvaða skoski stærðfræðingur þróaði kerfi logra (lógariþma)?", ["john napier", "napier"]],
  ["Hver er kenndur við regluna um langhlið rétthyrnds þríhyrnings?", ["pýþagóras"]],
  ["Hver lagði grunninn að tvínafnakerfi í líffræði og skrifaði Systema Naturae?", ["carl von linné", "linné", "carl linnaeus", "linnaeus"]],
  ["Hver bjó til kvarðann um hörku steinda, þar sem demantur er 10?", ["friedrich mohs", "mohs"]],
  ["Hvaða steind er mjúkust á Mohs-kvarðanum, með einkunnina 1?", ["talkúm"]],
  ["Hver bjó til kvarða yfir vindstig, með 12 stigum?", ["francis beaufort", "beaufort"]],
  ["Hver bjó til fræðiheitið Dinosauria yfir risaeðlur?", ["richard owen", "owen"]],
  ["Hver setti fram kenninguna um ísöld eftir að hafa rannsakað jökla í Ölpunum?", ["jean agassiz", "agassiz", "louis agassiz"]],
  ["Hver setti fram kenningu um áunna eiginleika dýra, t.d. háls gíraffans?", ["jean-baptiste de lamarck", "lamarck", "lemarck"]],
  ["Hver var íslenskur áhugamaður um stjörnufræði á 12. öld, höfundur Oddatölu?", ["stjörnu-oddi", "oddi helgason", "stjörnu oddi"]],
  ["Hver gerði fyrsta vísindalega uppdráttinn að Íslandi?", ["björn gunnlaugsson"]],
  ["Hver varð fyrstur Íslendinga til að nema jarðfræði og gaf út Lýsingu Íslands?", ["þorvaldur thoroddsen"]],
  ["Hver var fyrst kvenna í heiminum til að stýra veðurstofu, forstjóri Veðurstofu Íslands?", ["teresía guðmundsson", "teresía"]],
  ["Hver þróaði gjóskulagafræði, þar sem öskulög eru notuð til aldursgreiningar?", ["sigurður þórarinsson"]],
  // varaspurningar ef einhverjar ofangreindar eru þegar til:
  ["Hver stofnaði fyrirtækið deCODE genetics?", ["kári stefánsson", "kári"]],
  ["Hver varð fyrst kvenna prófessor við Háskóla Íslands, í veirufræði, og starfaði á Keldum?", ["margrét guðnadóttir"]],
  ["Hvaða íslenski eldfjallafræðingur fann þorpið sem grófst undir Tambora-gosinu?", ["haraldur sigurðsson"]],
  ["Hver varð fyrstur Íslendinga til að ljúka doktorsnámi í jarðfræði og skrifaði Nýal?", ["helgi pjeturss", "helgi pjeturss"]]
];

const norm = (s) => s.toLowerCase().replace(/[^a-záðéíóúýþæö0-9. ]/g, "").trim();

(async () => {
  const surtQ = await db.collection("questions").where("verkefniId", "==", SURT).get();
  if (surtQ.empty) {
    await db.collection("verkefni").doc(SURT).delete();
    console.log("Eyddi tómu verkefni Súrt & Sykurlaust.");
  } else console.log("Súrt & Sykurlaust er ekki tómt, ekki eytt.");

  const hradaSnap = await db.collection("questions").where("verkefniId", "==", HRADA).get();
  const textiTil = new Set(hradaSnap.docs.map((d) => norm(d.data().text)));
  const svorTil = new Set();
  for (const d of hradaSnap.docs) {
    const a = await db.collection("answers").doc(d.id).get();
    (a.data()?.correctAnswers || []).forEach((s) => svorTil.add(norm(s)));
  }
  const gildar = [];
  SPURNINGAR.forEach(([t, s]) => {
    if (textiTil.has(norm(t)) || s.some((x) => svorTil.has(norm(x)))) console.log("Sleppt (svar til):", t);
    else gildar.push([t, s]);
  });
  const val = gildar.slice(0, 50);

  const vRef = await db.collection("verkefni").add({
    title: "Vísindasaga",
    slides: [],
    active: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const grunn = Date.now();
  const batch = db.batch();
  val.forEach(([t, s], i) => {
    const ref = db.collection("questions").doc();
    batch.set(ref, { text: t, verkefniId: vRef.id, active: false, createdAt: admin.firestore.Timestamp.fromMillis(grunn + i) });
    batch.set(db.collection("answers").doc(ref.id), { correctAnswers: s });
  });
  await batch.commit();
  console.log("Bjó til", val.length, "óvirkar spurningar í Vísindasaga (", vRef.id, ")");
})();
