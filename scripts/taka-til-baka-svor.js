// Tekur til baka fjórar viðbætur úr vikka-svor2.js sem voru of frjálslegar.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const FJARLAEGJA = {
  EC75OOgQKe04ZM4Ib6WV: ["enginn"], // spámaðurinn á eftir Múhameð
  D1B6Aq4GOVHAdY9Cv0Yg: ["haförn", "haförninn", "örn"], // stærsti íslenski varpfuglinn
  B8hnV0g3LW1IyTXE1rms: ["mexíkó", "mexíkóskur", "mexico", "mexiko"], // þjóðerni Montezuma
  z4N4oxrFB7JmorX6wfBw: ["hannes hafstein"] // fyrsti forsætisráðherra Íslands
};

async function main() {
  for (const [id, burt] of Object.entries(FJARLAEGJA)) {
    const ref = db.collection("answers").doc(id);
    const gamalt = (await ref.get()).data().correctAnswers || [];
    const nytt = gamalt.filter((x) => !burt.includes(x));
    await ref.update({ correctAnswers: nytt });
    console.log(id, JSON.stringify(gamalt), "->", JSON.stringify(nytt));
  }
}
main().catch((v) => {
  console.error(v);
  process.exit(1);
});
