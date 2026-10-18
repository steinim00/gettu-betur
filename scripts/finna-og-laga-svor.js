const path = require("path");
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, "serviceAccountKey.json"))) });
const db = admin.firestore();

async function main() {
  // UakpPCYWkcLHoPLIDDf4: "Hver fann upp á loftskeytatækninni?" - svar vantaði
  // fulla nafnið Marconi notaði sjálfur (Guglielmo), bara skammstöfun/eftirnafn
  // voru í svargögnunum.
  await db.collection("answers").doc("UakpPCYWkcLHoPLIDDf4").update({
    correctAnswers: ["g. marconi", "marconi", "guglielmo marconi"]
  });
  // f33m9JfZ103vBpBiTCCp: "Hver útskýrði fyrstur hringrás blóðsins?" - svarið
  // "thomas harvey" var rangt í gögnunum, rétta nafnið er William Harvey.
  await db.collection("answers").doc("f33m9JfZ103vBpBiTCCp").update({
    correctAnswers: ["william harvey", "harvey"]
  });
  console.log("Lagað: Marconi (fullt nafn bætt við), William Harvey (rangt nafn lagað).");
}
main().catch((villa) => {
  console.error(villa);
  process.exit(1);
});
