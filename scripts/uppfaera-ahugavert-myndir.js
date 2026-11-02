// Setur mynd (images/ahugavert/*.jpg, sótt úr og:image hverrar síðu) á hlekkina
// í "ahugavert" og færir hlaðvörpin yfir á Spotify.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const MYNDIR_EFTIR_TITLI = {
  "Geography Now": "geography-now",
  OverSimplified: "oversimplified",
  "Great Art Explained": "great-art-explained",
  "Great Books Explained": "great-books-explained",
  "Í ljósi sögunnar - Vera Illugadóttir": "i-ljosi-sogunnar",
  "The Rest Is History": "rest-is-history"
};
const SPOTIFY = {
  "Í ljósi sögunnar - Vera Illugadóttir": "https://open.spotify.com/show/4z956m0MLbaecUeSjlJmw2",
  "The Rest Is History": "https://open.spotify.com/show/7Cvsbcjhtur7nplC148TWy"
};

(async () => {
  const snap = await db.collection("ahugavert").get();
  for (const d of snap.docs) {
    const g = d.data();
    const lykill = /^\d{4}$/.test(g.takn || "") ? `ruv-${g.takn}` : MYNDIR_EFTIR_TITLI[g.titill];
    if (!lykill) continue;
    const breytingar = { mynd: `images/ahugavert/${lykill}.jpg` };
    if (SPOTIFY[g.titill]) {
      breytingar.slod = SPOTIFY[g.titill];
      breytingar.takn = "🎧";
    }
    await d.ref.update(breytingar);
    console.log("Uppfært:", g.titill, "→", breytingar.mynd);
  }
})();
