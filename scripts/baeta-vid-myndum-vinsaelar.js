// Einskiptis skrifta: bætir mynd af Wikimedia Commons við nokkrar af
// vinsælustu (mest svöruðu) spurningunum í Hraðaspurningar-bankanum sem
// vantaði mynd. Sama snið og add-hrifamiklir-question-images.js notar -
// Special:FilePath vísar sjálfkrafa á núverandi upphleðslu, þarf enga
// útreiknaða slóð.
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountSlodi)) });
const db = admin.firestore();

function commonsUrl(file) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;
}

const MYNDIR = [
  {
    id: "0DrhusUUQ2I5DYz9GxmJ", // Hvert er þjóðarblóm Íslendinga?
    file: "Dryas octopetala 01.JPG",
    alt: "Holtasóley, þjóðarblóm Íslendinga"
  },
  {
    id: "01yHwGC6YsB2PAqMISH5", // Hver er höfuðborg Möltu?
    file: "Valletta, Malta's Grand Harbor.jpg",
    alt: "Valletta, höfuðborg Möltu, séð yfir Grand Harbour"
  },
  {
    id: "0lfoaCDknjDheLzTsCeH", // Hver er höfuðborg Albaníu?
    file: "Tirana - Skanderbeg Square (Sheshi Skënderbej) - by Pudelek.jpg",
    alt: "Skanderbeg-torg í Tirana, höfuðborg Albaníu"
  },
  {
    id: "2SMnTIKxHUcVI5KkKeFW", // Hver gerði styttuna af Jóni Sigurðssyni?
    file: "JonSigurdssonStatue.jpg",
    alt: "Stytta Einars Jónssonar af Jóni Sigurðssyni á Austurvelli"
  },
  {
    id: "3gVfcMEOuOzZv8BvR7T5", // Á hvaða reikistjörnu er stór rauður flekkur?
    file: "Great Red Spot From Voyager 1.jpg",
    alt: "Stóri rauði flekkurinn á Júpíter, mynd Voyager 1"
  },
  {
    id: "9yM2Z9KL0vvdMkRCuySE", // Hvað hefur kameldýr marga hnúða?
    file: "Bactrian camel.jpg",
    alt: "Tvíhnúða úlfaldi (kameldýr)"
  }
];

async function main() {
  const batch = db.batch();
  for (const m of MYNDIR) {
    batch.update(db.collection("questions").doc(m.id), {
      image: commonsUrl(m.file),
      imageCredit: "Wikimedia Commons",
      imageAlt: m.alt
    });
  }
  await batch.commit();
  console.log(`Bætti mynd við ${MYNDIR.length} spurningar.`);
}

main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
