// Deployar firestore.rules beint í gegnum Firebase Rules API með service account
// lyklinum, án þess að fara í gegnum firebase-tools CLI (sem gerir auka
// serviceusage.services.get athugun sem sjálfgefni Admin SDK lykillinn hefur ekki).
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountSlodi = path.join(__dirname, "serviceAccountKey.json");
const rulesSlodi = path.join(__dirname, "..", "firestore.rules");

const serviceAccount = require(serviceAccountSlodi);
const projectId = serviceAccount.project_id;
const cred = admin.credential.cert(serviceAccount);

async function main() {
  const { access_token } = await cred.getAccessToken();
  const heimild = { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" };
  const rulesText = fs.readFileSync(rulesSlodi, "utf8");

  console.log("Bý til nýtt ruleset...");
  const rulesetSvar = await fetch(`https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`, {
    method: "POST",
    headers: heimild,
    body: JSON.stringify({
      source: {
        files: [{ name: "firestore.rules", content: rulesText }]
      }
    })
  });
  const rulesetGogn = await rulesetSvar.json();
  if (!rulesetSvar.ok) {
    console.error("Villa við að búa til ruleset:", JSON.stringify(rulesetGogn, null, 2));
    process.exit(1);
  }
  const rulesetName = rulesetGogn.name;
  console.log("Ruleset búið til:", rulesetName);

  const releaseNafn = `projects/${projectId}/releases/cloud.firestore`;
  console.log("Uppfæri release cloud.firestore...");
  let releaseSvar = await fetch(`https://firebaserules.googleapis.com/v1/${releaseNafn}`, {
    method: "PATCH",
    headers: heimild,
    body: JSON.stringify({ release: { name: releaseNafn, rulesetName } })
  });

  if (releaseSvar.status === 404) {
    console.log("Release var ekki til, bý til nýtt...");
    releaseSvar = await fetch(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`, {
      method: "POST",
      headers: heimild,
      body: JSON.stringify({ name: releaseNafn, rulesetName })
    });
  }

  const releaseGogn = await releaseSvar.json();
  if (!releaseSvar.ok) {
    console.error("Villa við að uppfæra release:", JSON.stringify(releaseGogn, null, 2));
    process.exit(1);
  }

  console.log("Tókst! Öryggisreglurnar eru komnar í gagn:", JSON.stringify(releaseGogn, null, 2));
}

main().catch((villa) => {
  console.error("Óvænt villa:", villa);
  process.exit(1);
});
