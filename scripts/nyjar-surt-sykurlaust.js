// 1) Eyðir óvirkum spurningum (og svörum/tilraunum) í "Súrt & Sykurlaust".
// 2) Býr til 75 nýjar spurningar í stíl Súrt & Sykurlaust í Hraðaspurningum
//    (virkar, ósvaraðar). Sleppir spurningum þar sem rétt svar er þegar til
//    í Hraðaspurningum fyrir. Keyrsla: node scripts/nyjar-surt-sykurlaust.js
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();
const HRADA = "nNY4cv1gLiIDGcm9vieu";
const SURT = "AQ9cPoY5QFLQkU6QYx8N";

const NYJAR = [
  ["Hver var eiginkona Gunnars á Hlíðarenda?", ["hallgerður langbrók", "hallgerður"]],
  ["Hvað hét átta fætti hestur Óðins?", ["sleipnir"]],
  ["Hvaða skáld bjargaði lífi sínu með því að yrkja Höfuðlausn?", ["egill skallagrímsson", "egill"]],
  ["Hver samdi Pilt og stúlku, sem oft er kölluð fyrsta íslenska skáldsagan?", ["jón thoroddsen", "jón thoroddsen eldri"]],
  ["Hvað heitir hæsta fjall Íslands?", ["hvannadalshnúkur", "hvannadalshnjúkur"]],
  ["Hvaða eyja myndaðist í neðansjávargosi suður af Íslandi og var friðuð?", ["surtsey"]],
  ["Hvað hét eldfjallið sem gaus á Heimaey og olli rýmingu Vestmannaeyja?", ["eldfell"]],
  ["Hver nefndi Grænland og stofnaði fyrstu byggð norrænna manna þar?", ["eiríkur rauði", "eiríkur þorvaldsson"]],
  ["Hver er talinn hafa fundið Vínland, sonur Eiríks rauða?", ["leifur heppni", "leifur eiríksson", "leifur"]],
  ["Hvaða skáldsaga Gunnars Gunnarssonar byggir á Sjöundármorðunum?", ["svartfugl"]],
  ["Hver samdi texta þjóðsöngsins Ó, Guð vors lands?", ["matthías jochumsson", "matthías"]],
  ["Hver var höfundur Passíusálmanna?", ["hallgrímur pétursson", "hallgrímur"]],
  ["Hvaða biskup á Hólum gaf út fyrstu heildarþýðingu Biblíunnar á íslensku?", ["guðbrandur þorláksson", "guðbrandur"]],
  ["Hvaða skáld orti Hver á sér fegra föðurland?", ["hulda", "unnur benediktsdóttir bjarklind"]],
  ["Hver var fyrsta konan sem tók sæti á Alþingi, kjörin árið 1922?", ["ingibjörg h. bjarnason", "ingibjörg bjarnason"]],
  ["Hver var fyrsti forsætisráðherra Íslands?", ["hannes hafstein"]],
  ["Hvaða eldstöð gaus árið 2010 og stöðvaði flugumferð yfir Evrópu?", ["eyjafjallajökull"]],
  ["Hvað heitir hverinn sem öll erlend heiti yfir goshvera eru dregin af?", ["geysir"]],
  ["Hver er höfuðborg Færeyja?", ["þórshöfn"]],
  ["Hver var rómverski keisarinn sem á að hafa spilað á hörpu meðan Róm brann?", ["neró"]],
  ["Hver stofnaði mongólska heimsveldið?", ["djengis khan", "genghis khan", "gengis kan", "djengis kan"]],
  ["Hver var kanslari sem sameinaði Þýskaland árið 1871?", ["otto von bismarck", "bismarck"]],
  ["Hver var kölluð Járnfrúin og var forsætisráðherra Bretlands?", ["margaret thatcher", "thatcher"]],
  ["Hvaða indverski leiðtogi beitti ofbeldislausri mótstöðu gegn yfirráðum Breta?", ["mahatma gandhi", "gandhi"]],
  ["Hver var fyrstur manna til að stíga á tunglið?", ["neil armstrong", "armstrong"]],
  ["Hver var fyrsti maðurinn sem fór út í geiminn?", ["júrí gagarín", "gagarín"]],
  ["Hvað hét flaggskip Kólumbusar í fyrstu ferðinni vestur um haf?", ["santa maría", "santa maria"]],
  ["Hvað hét skipið sem flutti pílagrímana til Nýja-Englands árið 1620?", ["mayflower"]],
  ["Hvaða múr var rifinn niður árið 1989 og varð tákn um endalok kalda stríðsins?", ["berlínarmúrinn", "berlínarmúr"]],
  ["Hver var forseti Bandaríkjanna í borgarastyrjöldinni og var myrtur í leikhúsi?", ["abraham lincoln", "lincoln"]],
  ["Hver leiddi byltinguna á Kúbu 1959?", ["fidel castro", "castro"]],
  ["Hvaða drottning Egyptalands lést af völdum slöngubits samkvæmt sögunni?", ["kleópatra", "kleópatra vii"]],
  ["Hvaða tvíburi stofnaði Róm samkvæmt goðsögninni, eftir að hafa drepið bróður sinn?", ["rómúlus"]],
  ["Hver var sigraður í orrustunni við Waterloo?", ["napóleon", "napóleon bónaparte", "napóleon 1."]],
  ["Hver samdi óperuna Carmen?", ["georges bizet", "bizet"]],
  ["Hver samdi Töfraflautuna?", ["wolfgang amadeus mozart", "mozart"]],
  ["Hver samdi ballettinn Svanavatnið?", ["tsjajkovskíj", "pjotr tsjajkovskíj", "tjajkovskíj"]],
  ["Hver málaði Hrópið?", ["edvard munch", "munch"]],
  ["Hver málaði Stjörnubjarta nótt?", ["vincent van gogh", "van gogh"]],
  ["Hver skrifaði Stríð og frið?", ["leó tolstoj", "tolstoj", "lev tolstoj"]],
  ["Hver skrifaði Don Kíkóta?", ["miguel de cervantes", "cervantes"]],
  ["Hver skrifaði Hroka og hleypidóma?", ["jane austen", "austen"]],
  ["Hver skrifaði skáldsöguna Frankenstein?", ["mary shelley", "shelley"]],
  ["Hver skapaði persónuna Sherlock Holmes?", ["arthur conan doyle", "conan doyle"]],
  ["Hver skrifaði ævintýrið um Litlu hafmeyjuna?", ["h. c. andersen", "hans christian andersen", "andersen", "h.c. andersen"]],
  ["Hver skrifaði Hobbitann?", ["j. r. r. tolkien", "tolkien", "j.r.r. tolkien"]],
  ["Hver skrifaði skáldsöguna 1984?", ["george orwell", "orwell"]],
  ["Hver skrifaði Kommúnistaávarpið ásamt Friedrich Engels?", ["karl marx", "marx"]],
  ["Hver setti fram afstæðiskenninguna?", ["albert einstein", "einstein"]],
  ["Hver setti fram þróunarkenninguna í bókinni Uppruni tegundanna?", ["charles darwin", "darwin"]],
  ["Hver uppgötvaði pensilínið?", ["alexander fleming", "fleming"]],
  ["Hver þróaði fyrsta bóluefnið, gegn bólusótt?", ["edward jenner", "jenner"]],
  ["Hver fann upp símann?", ["alexander graham bell", "graham bell", "bell"]],
  ["Hver er talinn hafa fundið upp ljósaperuna?", ["thomas edison", "edison"]],
  ["Hvað stendur efnatáknið Au fyrir?", ["gull"]],
  ["Hvaða málmur er fljótandi við stofuhita?", ["kvikasilfur"]],
  ["Hvað er stærsta líffæri mannslíkamans?", ["húðin", "húð"]],
  ["Hversu margar tennur hefur fullorðinn maður, að endajöxlum meðtöldum?", ["32", "þrjátíu og tvær"]],
  ["Hvað heitir hraðskreiðasta landdýr jarðar?", ["blettatígur", "blettatígurinn"]],
  ["Hvaða lofttegund gefa plöntur frá sér við ljóstillífun?", ["súrefni"]],
  ["Hver er höfuðborg Ástralíu?", ["canberra"]],
  ["Hver er höfuðborg Kanada?", ["ottawa"]],
  ["Hver er höfuðborg Mongólíu?", ["úlan bator", "ulan bator", "úlaanbaatar"]],
  ["Hver er höfuðborg Argentínu?", ["buenos aires"]],
  ["Hvaða fljót rennur í gegnum París?", ["signa", "signu", "seine"]],
  ["Hvaða fljót rennur í gegnum Búdapest?", ["dóná", "dóná"]],
  ["Hvaða fjall er hæst í Ölpunum?", ["mont blanc", "montblanc"]],
  ["Hvaða eyðimörk er stærst heitra eyðimarka?", ["sahara", "saharaeyðimörkin"]],
  ["Hvaða borg er kölluð Borgin eilífa?", ["róm"]],
  ["Í hvaða landi er hin forna borg Machu Picchu?", ["perú"]],
  ["Hvaða vatn er dýpsta stöðuvatn heims?", ["bajkalvatn", "bajkal", "bajkalvatnið"]],
  ["Á hvaða eyju fæddist Napóleon Bónaparte?", ["korsíka", "korsíku"]],
  ["Hvaða land gaf Bandaríkjunum Frelsisstyttuna?", ["frakkland"]],
  ["Hvað hét ferjumaðurinn sem flutti sálir yfir ána Styx?", ["karon", "kharon"]],
  ["Hvaða grísku hetju tókst að drepa Medúsu?", ["perseifur", "perseus"]],
  ["Hvað hét hundurinn með þrjú höfuð sem gætti Undirheima?", ["kerberos", "kerberus"]],
  ["Hver gætti Bifrastar í norrænni goðafræði?", ["heimdallur"]],
  ["Hvað heitir lífsins tré sem tengir heimana níu í norrænni goðafræði?", ["yggdrasill", "askur yggdrasils"]],
  ["Hver stýrði fyrsta leiðangrinum umhverfis jörðina en lést á Filippseyjum?", ["ferdinand magellan", "magellan"]],
  ["Hvaða ítalski kaupmaður ferðaðist til Kína á 13. öld og skrifaði um það?", ["marco polo"]],
  ["Hvaða land hefur höfuðborgina Jakarta?", ["indónesía"]],
  ["Hver samdi tónverkið Vor, hluta af Árstíðunum fjórum?", ["antonio vivaldi", "vivaldi"]],
  ["Hver skrifaði skáldsöguna Sjálfstætt fólk um Bjart í Sumarhúsum?", ["halldór laxness", "halldór kiljan laxness", "laxness"]]
];

const norm = (s) => s.toLowerCase().replace(/[^a-záðéíóúýþæö0-9. ]/g, "").trim();

(async () => {
  // 1) eyða óvirkum í Súrt & Sykurlaust
  const surtSnap = await db.collection("questions").where("verkefniId", "==", SURT).get();
  const ovirkar = surtSnap.docs.filter((d) => !d.data().active);
  const notendur = await db.collection("users").get();
  for (const d of ovirkar) {
    for (const u of notendur.docs) {
      const r = u.ref.collection("attempts").doc(d.id);
      if ((await r.get()).exists) await r.delete();
    }
  }
  let batch = db.batch();
  let n = 0;
  for (const d of ovirkar) {
    batch.delete(d.ref);
    batch.delete(db.collection("answers").doc(d.id));
    n += 2;
    if (n >= 480) { await batch.commit(); batch = db.batch(); n = 0; }
  }
  if (n) await batch.commit();
  console.log("Eyddi", ovirkar.length, "óvirkum spurningum úr Súrt & Sykurlaust.");

  // 2) nýjar spurningar
  const hradaSnap = await db.collection("questions").where("verkefniId", "==", HRADA).get();
  const textiTil = new Set(hradaSnap.docs.map((d) => norm(d.data().text)));
  const svorTil = new Set();
  for (const d of hradaSnap.docs) {
    const a = await db.collection("answers").doc(d.id).get();
    (a.data()?.correctAnswers || []).forEach((s) => svorTil.add(norm(s)));
  }
  const gildar = [];
  const sleppt = [];
  for (const [texti, svor] of NYJAR) {
    if (textiTil.has(norm(texti)) || svor.some((s) => svorTil.has(norm(s)))) sleppt.push(texti);
    else gildar.push([texti, svor]);
  }
  console.log("Sleppt (svar þegar til):", sleppt.length);
  sleppt.forEach((t) => console.log("  -", t));
  const val = gildar.slice(0, 75);
  const grunn = Date.now();
  batch = db.batch();
  val.forEach(([texti, svor], i) => {
    const ref = db.collection("questions").doc();
    batch.set(ref, { text: texti, verkefniId: HRADA, active: true, createdAt: admin.firestore.Timestamp.fromMillis(grunn + i) });
    batch.set(db.collection("answers").doc(ref.id), { correctAnswers: svor });
  });
  await batch.commit();
  console.log("Bjó til", val.length, "nýjar spurningar í Hraðaspurningum (til voru", gildar.length, "gildar).");
})();
