const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

// Fundið með því að skoða svarasögu notanda: spurningar sem spyrja um þjóðerni
// ("Hverrar þjóðar..."/"Hvers lenskur...") tóku bara við þjóðernislýsingarorðinu
// (t.d. "spænskur"), ekki landsheitinu (t.d. "spánn") sem margir svara með í
// staðinn - og eitt tilvik ("frökkum") tók bara við þágufalli fólksheitisins,
// ekki landsheitinu "Frakkland". Víkkað út með öllum eðlilegum beygingarmyndum.
const vidbaetur = {
  "9qUBm78s1fZzjgWeyJou": ["frakkland", "frakklandi", "frakkar"], // Louisiana - "frá hverjum"
  P9n39suX8Jjc2wve6Fuk: ["spánn", "spáni", "spánverji"], // Picasso
  Ropce7ohyEe7xexNsoKt: ["írland", "írlandi"], // Oscar Wilde
  XVDpdvzVKIJLRmUOxPIi: ["mexíkó"], // Frida Kahlo
  bcP8hCzdsahFZ9oM5CNy: ["ungverjaland", "ungverjalandi"], // Franz Liszt
  c5HJJZWmwMnoqsBjvMmk: ["sviss"], // dr. Frankenstein
  fhYsphH3Qmf59sLXv4li: ["danmörk", "danmörku"], // Hamlet
  t8fNBB7EOfO5FZO2vPWF: ["danmörk", "danmörku"], // Bering
  vaxOvNZGaio41EQRwP4Q: ["finnland", "finnlandi"], // Jean Sibelius
  yD3BP1vqzxxeS6w3Dqxv: ["kanada"], // Leonard Cohen
  tQbSVt4OAmivMBZUAlbc: ["björgvin"], // Brann - Bergen á íslensku heitir Björgvin
  xpr7nkFSe75BSLFo4aUP: ["kúba"], // Capablanca - stutt landsheiti fær annars enga málfræðislegu-beygingar vikmörk
  "2NitrygBbMgZ2iC6SqPg": ["íslendingadagsræða", "íslendingadagsræðu"], // ljóðið - "1904" óþarfi til að telja rétt
  RM2MSqeyNRCoC6g53yOA: ["bækur", "bóka"], // ISBN - "bók" er sterkt beygt (bækur/bókum/bóka), ekki einfalt viðskeyti
};

async function main() {
  const batch = db.batch();
  for (const [id, nyjuSvor] of Object.entries(vidbaetur)) {
    const svarSnap = await db.collection("answers").doc(id).get();
    const gamalt = svarSnap.data()?.correctAnswers || [];
    const nytt = [...new Set([...gamalt, ...nyjuSvor])];
    batch.update(db.collection("answers").doc(id), { correctAnswers: nytt });
    console.log(id, JSON.stringify(gamalt), "->", JSON.stringify(nytt));
  }
  await batch.commit();
  console.log(`\nVíkkaði ${Object.keys(vidbaetur).length} svarasett.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
