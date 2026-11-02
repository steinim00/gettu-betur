// Fyllir "ahugavert" safnið (flipinn Áhugavert efni) úr Drive-skjalinu
// "Áhugaverðir linkar". Sleppir hlekkjum sem eru þegar til (sama slóð).
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const KEPPNIR = [
  [2023, "https://www.ruv.is/sjonvarp/spila/gettu-betur-2023/34075/a4urlj", ""],
  [2022, "https://www.ruv.is/sjonvarp/spila/gettu-betur-2022/32260/9jkv21", ""],
  [2021, "https://www.ruv.is/sjonvarp/spila/gettu-betur-2021/30942/972nv1", "Einn mjög sætur í Tæknó"],
  [2020, "https://www.ruv.is/sjonvarp/spila/gettu-betur-2020/29059/8l439h", ""],
  [2019, "https://www.ruv.is/sjonvarp/spila/gettu-betur-2019/27854/89kbn1", ""],
  [2018, "https://www.ruv.is/sjonvarp/spila/gettu-betur-2018/25763/7lm7ph", ""],
  [2017, "https://www.ruv.is/sjonvarp/spila/gettu-betur-2017/24061/75eqmh", ""],
  [2016, "https://www.ruv.is/sjonvarp/spila/gettu-betur-2016/21247/6ak27h", ""],
  [2015, "https://www.ruv.is/sjonvarp/spila/gettu-betur-2015/19766/5sg3b2", ""]
];

const HLEKKIR = [
  ...KEPPNIR.map(([ar, slod, lysing]) => ({
    flokkur: "Gamlar keppnir",
    takn: String(ar),
    titill: `Gettu betur ${ar}`,
    lysing,
    slod
  })),
  {
    flokkur: "YouTube",
    takn: "🌍",
    titill: "Geography Now",
    lysing: "Fjallar um hvert og einasta ríki í heiminum - finndu eitthvað land sem þú fílar!",
    slod: "https://www.youtube.com/@GeographyNow/playlists"
  },
  {
    flokkur: "YouTube",
    takn: "⚔️",
    titill: "OverSimplified",
    lysing: "Tekur fyrir stærstu viðburði sögunnar. Miniseríurnar má sleppa.",
    slod: "https://www.youtube.com/@OverSimplified"
  },
  {
    flokkur: "YouTube",
    takn: "🎨",
    titill: "Great Art Explained",
    lysing: "Listfræðingur fjallar (oftast) stuttlega um frægustu málverk sögunnar, af hverju þau eru það og aðeins um málarann.",
    slod: "https://www.youtube.com/@GreatArtExplained"
  },
  {
    flokkur: "YouTube",
    takn: "📚",
    titill: "Great Books Explained",
    lysing: "Sama og með listaverkin, nema núna um bókmenntaverk.",
    slod: "https://www.youtube.com/@greatbooksexplained371"
  },
  {
    flokkur: "Hlaðvörp",
    takn: "🎙️",
    titill: "Í ljósi sögunnar - Vera Illugadóttir",
    lysing: "Mjög oft það sem spurningahöfundar spyrja beint úr þáttunum.",
    slod: "https://playpodcasts.com/podcasts/i-ljosi-sogunnar"
  },
  {
    flokkur: "Hlaðvörp",
    takn: "🏛️",
    titill: "The Rest Is History",
    lysing: "Tveir sagnfræðingar fjalla um allskonar sögulega viðburði. Skemmtilegu efnin eru mjög skemmtileg en þau óspennandi eru mjög óspennandi.",
    slod: "https://therestishistory.com/"
  }
];

(async () => {
  const til = await db.collection("ahugavert").get();
  const slodir = new Set(til.docs.map((d) => d.data().slod));
  const grunn = Date.now();
  let fjoldi = 0;
  for (const [i, h] of HLEKKIR.entries()) {
    if (slodir.has(h.slod)) continue;
    await db.collection("ahugavert").add({ ...h, createdAt: admin.firestore.Timestamp.fromMillis(grunn + i * 1000) });
    fjoldi++;
  }
  console.log(`Bætti við ${fjoldi} hlekkjum (${HLEKKIR.length - fjoldi} voru þegar til).`);
})();
