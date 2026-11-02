// Setur Apple Podcasts slóð (slodApple) á hlaðvörpin í Áhugavert efni.
const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

const APPLE = {
  "Í ljósi sögunnar - Vera Illugadóttir": "https://podcasts.apple.com/is/podcast/%C3%AD-lj%C3%B3si-s%C3%B6gunnar/id1093079601",
  "The Rest Is History": "https://podcasts.apple.com/us/podcast/the-rest-is-history/id1537788786",
  "The Infinite Monkey Cage": "https://podcasts.apple.com/us/podcast/the-infinite-monkey-cage/id343580439",
  "In Our Time": "https://podcasts.apple.com/us/podcast/in-our-time/id73330895"
};

(async () => {
  const snap = await db.collection("ahugavert").where("flokkur", "==", "Hlaðvörp").get();
  for (const d of snap.docs) {
    const slod = APPLE[d.data().titill];
    if (!slod) continue;
    await d.ref.update({ slodApple: slod });
    console.log("Apple Podcasts slóð sett á:", d.data().titill);
  }
})();
