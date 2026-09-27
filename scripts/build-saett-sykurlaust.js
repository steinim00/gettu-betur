// Handunnar spurningar (opið svar) fyrir "Súrt & Sykurlaust - Gettu Betur 2018"
// orðskýringapakkann. Býr líka til verkefnis-slides úr öllum 79 glærunum
// (mörg hugtök á hverri glæru - title er dregið úr fyrsta hugtakinu, body er
// öll glæran) svo nemandi geti flett í gegnum allt efnið til skoðunar.
const fs = require("fs");
const path = require("path");

const heimild = "saett-sykurlaust.pptx";

function samraema(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[\s.,!?;:"'`´()]+|[\s.,!?;:"'`´()]+$/g, "")
    .replace(/\s+/g, " ");
}

const spurningar = [
  { text: "Í hvaða borg á Spáni er Alhambra-höllin?", svor: ["Granada"] },
  { text: "Hvað hét fyrsti togarinn sem Alliance lét smíða, kominn til landsins 1907?", svor: ["Jón forseti"] },
  { text: "Hvaða dýri hjálpaði Andrókles með því að draga þyrni úr fæti þess?", svor: ["Ljóni", "Ljón"] },
  { text: "Í hvaða bandaríska fylki voru Aparéttarhöldin haldin árið 1925?", svor: ["Tennessee"] },
  { text: "Hvaða ár var fyrsta aprílgabb Ríkisútvarpsins gert?", svor: ["1957"] },
  { text: "Við hvaða mann er hugtakið 'aronska' kennt?", svor: ["Aron Guðbrandsson", "Aron"] },
  { text: "Hvaða íslenska skáld orti fyrst undir átthendu, í síðustu erindum Gunnarshólma?", svor: ["Jónas Hallgrímsson"] },
  { text: "Hver var kanslari Vestur-Þýskalands sem hlaut friðarverðlaun Nóbels fyrir Austurpólitíkina?", svor: ["Willy Brandt"] },
  { text: "Hvað hannaði breski stærðfræðingurinn Charles Babbage um 1820?", svor: ["Fyrstu vélrænu tölvuna", "Vélrænu tölvuna"] },
  { text: "Hver er talin fyrsti forritarinn, dóttir Byrons lávarðar sem aðstoðaði Charles Babbage?", svor: ["Ada Lovelace"] },
  { text: "Hvaða konungur vann Babýloníu og veitti Gyðingum heimfararleyfi árið 538 f.Kr.?", svor: ["Kýros"] },
  { text: "Í hvaða landi hófst Bahaitrú árið 1844?", svor: ["Íran"] },
  { text: "Hvað hétu Bakkabræður þrír?", svor: ["Gísli, Eiríkur og Helgi"] },
  { text: "Í hvaða sveit fannst hið fræga kuml við Baldursheim árið 1860?", svor: ["Mývatnssveit"] },
  { text: "Hvaða ár áttu Bartólómeusarvígin sér stað í París?", svor: ["1572"] },
  { text: "Frá hvaða ári hafa Bessastaðir verið aðsetur forseta Íslands?", svor: ["1944"] },
  { text: "Hvaða eyju er Eldeyjar-Hjalti frægur fyrir að klífa, fyrstur manna?", svor: ["Eldey"] },
  { text: "Við hvaða eyju í Kyrrahafinu er bíkiníið kennt?", svor: ["Bikini", "Bikinieyju"] },
  { text: "Hvað heitir fornenskt söguljóð sem lýsir viðureign hetjunnar við skrímslið Grendel?", svor: ["Bjólfskviða", "Beowulf"] },
  { text: "Hver myrti sex eiginkonur sínar í ævintýri C. Perrault og læsti líkum þeirra í herbergi?", svor: ["Bláskeggur"] },
  { text: "Hvað hét skipið sem Fletcher Christian gerði fræga uppreisn um borð í árið 1789?", svor: ["Bounty"] },
  { text: "Hver samdi tónverkið 4'33, þar sem ríkir þögn í fjórar mínútur og 33 sekúndur?", svor: ["John Cage"] },
  { text: "Hver stofnaði Carnegiesjóðinn sem veitir verðlaun fyrir hetjudáðir á friðartímum?", svor: ["Andrew Carnegie"] },
  { text: "Hver var hirðmaður Díónýsíosar týranna sem sverðið fræga hékk yfir á einu hrosshári?", svor: ["Damókles"] },
  { text: "Hvað varð Alfred Dreyfus sakaður um í hinu fræga franska Dreyfusmáli?", svor: ["Njósnir"] },
  { text: "Hvað þýðir orðið 'eskimói' upprunalega?", svor: ["Þeir sem éta hrátt kjöt"] },
  { text: "Hvaða pólverji bjó til tungumálið esperanto árið 1887?", svor: ["L. L. Zamenhof", "Zamenhof"] },
  { text: "Með hvaða sverði vó Sigurður Fáfnisbani orminn Fáfni?", svor: ["Gram"] },
  { text: "Hvaða ár var íslenska fálkaorðan stofnuð?", svor: ["1921"] },
  { text: "Hver orti Rís þú unga Íslands merki í tilefni Fánatökunnar 1913?", svor: ["Einar Benediktsson"] },
  { text: "Hvað þýðir latneska orðtakið 'Festina lente', eignað Ágústusi keisara?", svor: ["Flýttu þér hægt"] },
  { text: "Hvaða ár ferðaðist Willard Fiske, mikill Íslandsvinur, um Ísland?", svor: ["1879"] },
  { text: "Hvaða ár kom kona fyrst fram sem Fjallkonan á Íslendingadeginum í Winnipeg?", svor: ["1924"] },
  { text: "Í mesta lagi hversu mörg ár mátti fjörbaugsmaður dvelja erlendis samkvæmt fjörbaugsgarði?", svor: ["Þrjú ár", "Þrjú"] },
  { text: "Hvaða efni var á 18. öld talið valda bruna, uns uppgötvun súrefnis afsannaði það?", svor: ["Flógiston"] },
  { text: "Hver var helsti hvatamaður að stofnun Forngripasafns Íslands?", svor: ["Sigurður Guðmundsson"] },
  { text: "Milli hvaða tveggja landa var Fótboltastríðið árið 1969?", svor: ["El Salvador og Hondúras"] },
  { text: "Hvað hét kvörnin sem sagnakonungurinn Fróði átti, sem malaði gull og frið?", svor: ["Grotta"] },
  { text: "Hversu mörg ár lifði hver Fönix samkvæmt goðsögninni, áður en hann endurfæddist úr eldi?", svor: ["500 ár", "500"] },
  { text: "Hvað heitir norræna gyðjan sem plægði Sjáland á haf út með fjórum sonum í uxalíki?", svor: ["Gefjun"] },
  { text: "Hver hjó á Gordíonshnútinn, samkvæmt sögninni?", svor: ["Alexander mikli"] },
  { text: "Í hvaða egypsku borg standa pýramídarnir miklu og Sfinxinn?", svor: ["Giza"] },
  { text: "Hvaða dag var Háskóli Íslands stofnaður?", svor: ["17. júní 1911", "17. júní"] },
  { text: "Hver var fyrsti rektor Háskóla Íslands?", svor: ["Björn M. Olsen"] },
  { text: "Í hvaða þýsku borg fannst kjálki Heidelbergmannsins árið 1907?", svor: ["Heidelberg"] },
  { text: "Hvaða safnrit konungasagna skrifaði Snorri Sturluson?", svor: ["Heimskringla"] },
  { text: "Hvað á Arkimedes að hafa hrópað þegar hann uppgötvaði eðlismassalögmálið í baðkari sínu?", svor: ["Heureka", "Eureka"] },
  { text: "Hver stofnaði Hið íslenska Þjóðvinafélag og var fyrsti formaður þess?", svor: ["Jón Sigurðsson"] },
  { text: "Hvenær var fyrstu hreindýrunum sem lifðu af sleppt á Íslandi, í Múlasýslu?", svor: ["1777-78", "1777", "1778"] },
  { text: "Hver var síðastur Íslendinga tekinn af lífi, vegna Kambsránsins?", svor: ["Sigurður Gottsvinsson"] },
  { text: "Hvaða dagur er Jónsmessa?", svor: ["24. júní"] },
  { text: "Hvað þýðir latneska orðtakið 'Jacta est alea', sagt af Sesari við Rúbíkonfljót?", svor: ["Teningnum er kastað"] },
  { text: "Hver leiddi Jakobínaklúbbinn, mikilvægasta stjórnmálaklúbb frönsku byltingarinnar?", svor: ["Robespierre"] },
  { text: "Hver safnaði saman finnsku þjóðkvæðunum sem urðu að Kalevala?", svor: ["Elias Lönnrot", "Lönnrot"] },
  { text: "Hversu margir kílómetrar er Kínamúrinn talinn vera á lengd?", svor: ["2400 km", "2400", "2.400 km"] },
  { text: "Hver var lögreglustjórinn sem varð miðpunktur hins pólitíska Kollumáls 1934?", svor: ["Hermann Jónasson"] },
  { text: "Hvað gerði Kólumbus við eggið til að láta það standa upprétt, samkvæmt sögninni um Kólumbusaregg?", svor: ["Fletti það út í annan endann", "Fletti það"] },
  { text: "Hvaða ár fannst gröf Tútankamons í Konungadal í Egyptalandi?", svor: ["1922"] },
  { text: "Hver var fyrsti lögsögumaður Alþingis?", svor: ["Úlfljótur"] },
  { text: "Hvað er fyrsta lögmál Newtons einnig kallað?", svor: ["Tregðulögmálið"] },
  { text: "Hvaða ár var íslenska landnemabyggðin Nýja-Ísland í Kanada stofnuð?", svor: ["1875"] },
  { text: "Hvað hét helsti bær Nýja-Íslands í Kanada?", svor: ["Gimli"] },
  { text: "Hvaða ár eru fyrstu Ólympíuleikarnir taldir hafa verið haldnir?", svor: ["776 f.Kr."] },
  { text: "Hver stofnaði til nútíma Ólympíuleikanna árið 1896?", svor: ["Pierre de Coubertin", "Coubertin"] },
  { text: "Hvað urðu Kínverjar að láta Bretum eftir í kjölfar fyrra Ópíumstríðsins?", svor: ["Hong Kong"] },
  { text: "Hver hannaði hvolfþak Péturskirkjunnar í Róm?", svor: ["Michelangelo"] },
  { text: "Hvaða ár gaus Vesúvíus og gróf borgina Pompei í ösku?", svor: ["79 e.Kr.", "79"] },
  { text: "Hver var elskhugi Katrínar II miklu, kenndur við svokölluð potemkintjöld?", svor: ["Grigoríj Potemkin", "Potemkin"] },
  { text: "Hvað þýðir nafn franska rannsóknarskipsins Pourquoi Pas, sem fórst við Mýrar 1936?", svor: ["Hvers vegna ekki"] },
  { text: "Hver málaði Garð jarðneskra lystisemda, frægasta verk Prado-safnsins?", svor: ["Hieronymus Bosch", "H. Bosch", "Bosch"] },
  { text: "Hver flutti fyrstu prentsmiðjuna til Íslands árið 1530?", svor: ["Jón Arason"] },
  { text: "Hver var rússneski munkurinn sem náði miklum völdum yfir Alexöndru keisaraynju?", svor: ["Grigoríj Raspútín", "Raspútín"] },
  { text: "Hvað hét skoski sjómaðurinn sem er talinn fyrirmynd Daniel Defoe að Róbinson Krúsó?", svor: ["Alexander Selkirk", "Selkirk"] },
  { text: "Hvað þýðir latneska orðtakið 'Sic transit gloria mundi'?", svor: ["Þannig hverfur heimsins dýrð"] },
  { text: "Hvað gerðist alltaf rétt áður en Sísyfos náði steininum upp á hæðina?", svor: ["Hann valt ofan aftur", "Steinninn valt ofan aftur"] },
  { text: "Hvað hét Sitting Bull, hinn frægi indíánahöfðingi, á sínu eigin tungumáli?", svor: ["Tatanka Iyotake"] },
  { text: "Hvaða ár urðu Sjöundarármorðin á Rauðasandi?", svor: ["1802"] },
  { text: "Frá hvaða landi berast elstu heimildir um skák, frá 7. öld e.Kr.?", svor: ["Indland", "Indlandi"] },
  { text: "Hvað var þyngsta refsingin á Íslandi á Þjóðveldisöld, þyngri en útlegð og fjörbaugsgarður?", svor: ["Skóggangur"] },
  { text: "Hversu mörg ár var Grettir Ásmundarson í skóggangi, lengst allra skógarmanna?", svor: ["19 ár", "19"] },
  { text: "Hver samdi Snorra-Eddu, íslenska handbók í skáldskaparfræðum?", svor: ["Snorri Sturluson"] },
  { text: "Hvaða íslenska skáld er talið fyrst til að yrkja sonnettu, með Ég bið að heilsa?", svor: ["Jónas Hallgrímsson"] },
  { text: "Fyrir hverja var grafhýsið Taj Mahal reist?", svor: ["Mumtaz-i-Mahal", "eiginkonu Shah Jahan"] },
  { text: "Hvað varð Vilhjálmur Tell að skjóta af höfði sonar síns með boga?", svor: ["Epli"] },
  { text: "Hver er talin hafa skrifað fyrstu sögulegu skáldsöguna á Íslandi, um Brynjólf Sveinsson biskup?", svor: ["Torfhildur Þorsteinsdóttir Hólm", "Torfhildur Hólm"] },
  { text: "Hvaða listasafn í Flórens hýsir m.a. Fæðingu Venusar eftir Botticelli?", svor: ["Uffizisafnið", "Uffizi"] },
  { text: "Á hvaða grísku eyju fannst Venus frá Míló árið 1820?", svor: ["Melos"] },
  { text: "Hver skrifaði heimspekiritið Birtíng (Candide)?", svor: ["Voltaire"] },
  { text: "Hvað kallast norrænir hermenn sem þjónuðu Býsanskeisara frá 9. til 13. aldar?", svor: ["Væringjar"] },
  { text: "Hvaða íslenska fornaldarsaga rekur ævi Sigurðar Fáfnisbana?", svor: ["Völsungasaga"] },
  { text: "Hver stal hamri Þórs í Þrymskviðu og krafðist Freyju í skiptum fyrir hann?", svor: ["Þrymur"] },
  { text: "Hvaða ár varð öskudagur fyrst almennur frídagur á Íslandi?", svor: ["1917"] }
];

const utkoma = spurningar.map((s, i) => ({
  text: s.text,
  correctAnswers: [...new Set(s.svor.map(samraema))],
  needsReview: false,
  source: `${heimild} - hugtak ${i + 1}`
}));

const utskrift = path.join(__dirname, "saett-sykurlaust-draft.json");
fs.writeFileSync(utskrift, JSON.stringify(utkoma, null, 2), "utf8");
console.log(`Skrifaði ${utkoma.length} spurningar í ${utskrift}`);

// Verkefnis-glærur: allar 79 upprunalegu glærurnar, title dregið úr fyrsta
// hugtakinu á hverri glæru svo nemandi geti flett í gegnum allt efnið.
const slidesSlodi = path.join(__dirname, "saett-sykurlaust-only.json");
if (fs.existsSync(slidesSlodi)) {
  const skyggnur = JSON.parse(fs.readFileSync(slidesSlodi, "utf8"));
  const verkefnaSlides = skyggnur.map((s) => {
    const fyrstaLina = s.lines[0] || "";
    const titill = fyrstaLina.split(":")[0].trim().slice(0, 60) || `Glæra ${s.slide}`;
    return { title: titill, body: s.lines.join("  ") };
  });
  const slidesUtskrift = path.join(__dirname, "saett-sykurlaust-verkefni-slides.json");
  fs.writeFileSync(slidesUtskrift, JSON.stringify(verkefnaSlides, null, 2), "utf8");
  console.log(`Skrifaði ${verkefnaSlides.length} verkefnaglærur í ${slidesUtskrift}`);
}
