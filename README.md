# Gettu Betur

Keppnisvefur með innskráningu, þar sem admin sér yfirlit yfir hvernig hverjum
notanda/liði vegnar. Spurningar eru fluttar inn úr `.pptx`/`.docx` skjölum.

Static frontend (HTML/CSS/JS, engin byggingarskref) + Firebase (Auth + Firestore).

## 1. Stofna Firebase verkefni

1. Farðu á https://console.firebase.google.com og stofnaðu nýtt verkefni.
2. **Authentication** -> Sign-in method -> kveiktu á **Email/Password**.
3. **Firestore Database** -> Create database -> veldu staðsetningu (t.d. `eur3`) -> byrjaðu í production mode.
4. **Project settings** (gírtáknið) -> "Your apps" -> smelltu á vef-táknið (`</>`) til að skrá vefapp -> afritaðu `firebaseConfig` gildin.
5. Settu þau gildi inn í [`js/firebase-config.js`](js/firebase-config.js) í stað `SKIPTU-UT-...` gildanna.

## 2. Setja upp öryggisreglur (Firestore rules)

Farðu í **Firestore Database -> Rules** í Firebase Console og límdu inn innihald
[`firestore.rules`](firestore.rules) (eða keyrðu `firebase deploy --only firestore:rules`
ef þú notar Firebase CLI, sjá kafla 5).

Reglurnar eru hannaðar þannig að:

- Notandi má aðeins lesa/breyta eigin gögnum, admin má sjá allt.
- Rétt svar við spurningu (`answers/{id}`) er **ekki** lesanlegt fyrr en notandinn
  er sjálfur búinn að svara þeirri spurningu — kemur í veg fyrir svindl með því
  að skoða netumferð í vafranum.
- Svör (`attempts`) eru óbreytanleg eftir að þau eru skráð — einn notandi getur
  aðeins svarað hverri spurningu einu sinni.

Þetta virkar allt innan **Spark (frí) planinu** hjá Firebase — engin þörf á
Cloud Functions eða greiðslukorti.

## 3. Gera fyrsta notandann að admin

Það er engin sjálfvirk leið til að verða admin (viljandi, til að venjulegir
notendur geti ekki gert það sjálfir). Skrefin eru:

1. Nýskráðu þig venjulega á síðunni (`index.html` -> Nýskráning).
2. Farðu í Firebase Console -> Firestore Database -> `users` safnið -> finndu
   skjalið með þínu `uid`.
3. Breyttu reitnum `role` úr `"user"` í `"admin"`.
4. Skráðu þig út og inn aftur — þú sérð núna hlekk á stjórnborðið.

## 4. Keyra síðuna

Þetta er static síða — engin byggingarskref þarf. Til að prófa staðbundið:

```bash
npx serve .
```

eða opnaðu `index.html` beint í vafra (Firebase Auth virkar líka af `file://`
að einhverju leyti, en `npx serve .` er öruggara).

### Hýsing

- **GitHub Pages**: `.github/workflows/deploy.yml` er þegar til staðar og
  deployar sjálfkrafa við push á `main` — kveiktu bara á GitHub Pages fyrir
  repoið undir Settings -> Pages -> Source: GitHub Actions.
- **Firebase Hosting** (valkostur): `npm install -g firebase-tools`, svo
  `firebase login`, `firebase deploy --only hosting,firestore:rules`.

## 5. Flytja inn spurningar úr .pptx / .docx

Í `scripts/` möppunni:

```bash
cd scripts
npm install
mkdir innsláttur          # settu .pptx/.docx skjölin þín hér
npm run extract:pptx      # ef þú ert með .pptx skjöl -> slides.json
npm run extract:docx      # ef þú ert með .docx skjöl -> paragraphs.json
npm run build             # býr til questions-draft.json úr ofangreindu
```

**Farðu svo yfir `questions-draft.json` í höndunum.** Skrifturnar reyna að
greina spurningu/valmöguleika/rétt svar sjálfkrafa út frá einföldum reglum
(sjá athugasemdir efst í [`build-questions.js`](scripts/build-questions.js)),
en allt sem er merkt `"needsReview": true` þarf handvirka yfirferð eða
leiðréttingu — annars sleppir næsta skref því sjálfkrafa.

Þegar skráin lítur vel út:

1. Sæktu `serviceAccountKey.json`: Firebase Console -> Project settings ->
   Service accounts -> Generate new private key. Vistaðu hana sem
   `scripts/serviceAccountKey.json` (hún er í `.gitignore`, fer aldrei í Git).
2. Keyrðu:

   ```bash
   npm run upload
   ```

Nýjar spurningar fara inn sem **óvirkar** — farðu í stjórnborðið (`stjornbord.html`)
og kveiktu á þeim spurningum sem þú vilt hafa í leiknum.

Ef sniðið á þínum skjölum passar ekki vel við þumalputtareglurnar er einfaldast
að senda mér nokkur dæmi þegar skjölin eru tilbúin — þá stilli ég heuristíkina
í `build-questions.js` að raunverulega sniðinu þínu.

## 6. Handvirk spurningaskráning

Í stjórnborðinu (`stjornbord.html`) er líka einfalt eyðublað til að bæta við
stökum spurningum handvirkt, án þess að fara í gegnum innflutningsskrifturnar.

## Gagnalíkan (Firestore)

```
users/{uid}                  { nafn, email, role: "user" | "admin", createdAt }
users/{uid}/attempts/{qId}   { selectedIndex, answeredAt }   — skjal-ID = spurningarID
questions/{qId}              { text, choices: [...], active, createdAt }
answers/{qId}                { correctIndex }                — sama ID og questions/{qId}
```
