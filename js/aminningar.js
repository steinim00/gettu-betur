// Áminningar ("ýta við") sem kennarinn sendir í tölvupósti á nemendur sem eru
// orðnir óvirkir - í stíl við tilkynningar málanámsforrita: stuttar, krúttlegar
// og aðeins pirraðar. Hver áminning hefur mynd (myndir/aminningar/*.png, sjá
// scripts/ - bikarinn úr merki appsins með ólíkum svipbrigðum).
//
// Sending: stjórnborðið er stöðug síða án netþjóns, svo pósturinn fer um
// EmailJS (https://www.emailjs.com - ókeypis aðgangur dugir) ef kennarinn hefur
// stillt það í Stillingar. Annars opnast póstforritið með tilbúnum texta
// (mailto:) svo hægt sé að senda sjálfur.

export const SIDU_SLOD = "https://steinim00.github.io/gettu-betur/";
const MYND_SLOD = SIDU_SLOD + "myndir/aminningar/";

// {nafn} = fornafn nemandans, {dagar} = "3 dagar" (nefnifall), {dogum} = "3 dögum" (þágufall) - dagar síðan hann sást síðast.
export const AMINNINGAR = [
  {
    id: "saknar",
    mynd: "sorgmaedd.png",
    titill: "Bikarinn grætur 😢",
    fyrirsogn: "Bikarinn saknar þín",
    texti: "Hæ {nafn}! Það eru {dagar} síðan þú sást síðast til Gettu Betur. Bikarinn situr einn eftir og er farinn að tárast. Bara 5 mínútur í dag?"
  },
  {
    id: "reiddur",
    mynd: "reidd.png",
    titill: "{nafn}, spurningarnar svara sér ekki sjálfar",
    fyrirsogn: "Bikarinn er svolítið pirraður",
    texti: "{nafn}, ég er ekki reiður. Ég er bara að lyfta augabrúnunum mjög hátt. Síðast sást til þín fyrir {dogum} og það er alls ekki í lagi. Komdu og svaraðu nokkrum."
  },
  {
    id: "sofandi",
    mynd: "sofandi.png",
    titill: "Gettu Betur sofnaði án þín",
    fyrirsogn: "Allt er orðið svo rólegt",
    texti: "Appið er farið að hrjóta. Vaknaðu, {nafn}, og svaraðu 10 spurningum - þá vaknar bikarinn líka."
  },
  {
    id: "hissa",
    mynd: "hissa.png",
    titill: "Hvar ertu, {nafn}?",
    fyrirsogn: "Ha?! Hvert fórstu?",
    texti: "{nafn}?! Við héldum að þú værir rétt {okominn}. Það eru yfir þúsund spurningar að bíða - og engin þeirra bítur."
  },
  {
    id: "vonsvikinn",
    mynd: "vonsvikinn.png",
    titill: "Við erum ekki reið. Bara vonsvikin.",
    fyrirsogn: "Bikarinn sagði ekkert",
    texti: "Bikarinn hefur ekkert sagt. Hann bíður bara - síðast sást til þín fyrir {dogum} - með smá sorg í svipnum. Ein spurning myndi laga daginn hans, {nafn}."
  },
  {
    id: "gladur",
    mynd: "gladur.png",
    titill: "Fimm mínútur og bikarinn dansar 🎉",
    fyrirsogn: "Ein lota og allt er gott",
    texti: "Engin pressa, {nafn}. (Smá pressa.) Ein stutt lota í dag og bikarinn heldur partý. Lofar."
  }
];

// Undirskrift á áminningapóstum.
const UNDIRSKRIFT = "Steini - the goat of coaches";
// Geitin er skrifuð sem HTML-tákn (&#128016;) því emoji brotna í sumum sendingarleiðum.
const UNDIRSKRIFT_HTML_EMOJI = " &#128016;";

const YFIRSKRIFT_LYKILL = "gettuBetur_aminningarYfirskrift";
const SKRIPTU_LYKLAR = { url: "gettuBetur_appsScriptUrl", lykilord: "gettuBetur_appsScriptLykilord" };
const POST_LYKLAR = { service: "gettuBetur_emailjsService", template: "gettuBetur_emailjsTemplate", key: "gettuBetur_emailjsKey" };

function lesaYfirskrift() {
  try {
    return JSON.parse(localStorage.getItem(YFIRSKRIFT_LYKILL) || "{}");
  } catch {
    return {};
  }
}

// Áminningarnar eins og kennarinn hefur breytt þeim í Stillingar (vistað í vafranum).
export function hladaAminningar() {
  const y = lesaYfirskrift();
  return AMINNINGAR.map((a) => ({ ...a, ...(y[a.id] || {}) }));
}

export function vistaAminningu(id, breytingar) {
  const y = lesaYfirskrift();
  y[id] = { ...(y[id] || {}), ...breytingar };
  localStorage.setItem(YFIRSKRIFT_LYKILL, JSON.stringify(y));
}

export function nullstillaAminningu(id) {
  const y = lesaYfirskrift();
  delete y[id];
  localStorage.setItem(YFIRSKRIFT_LYKILL, JSON.stringify(y));
}

export function lesaPostStillingar() {
  return {
    service: localStorage.getItem(POST_LYKLAR.service) || "",
    template: localStorage.getItem(POST_LYKLAR.template) || "",
    key: localStorage.getItem(POST_LYKLAR.key) || ""
  };
}

export function vistaPostStillingar({ service, template, key }) {
  for (const [k, v] of [["service", service], ["template", template], ["key", key]]) {
    if (v) localStorage.setItem(POST_LYKLAR[k], v.trim());
    else localStorage.removeItem(POST_LYKLAR[k]);
  }
}

// Google Apps Script vefforrit sem sendir póstinn úr Gmail kennarans (mælt með).
export function lesaSkriptuStillingar() {
  return { url: localStorage.getItem(SKRIPTU_LYKLAR.url) || "", lykilord: localStorage.getItem(SKRIPTU_LYKLAR.lykilord) || "" };
}

export function vistaSkriptuStillingar({ url, lykilord }) {
  for (const [k, v] of [["url", url], ["lykilord", lykilord]]) {
    if (v) localStorage.setItem(SKRIPTU_LYKLAR[k], v.trim());
    else localStorage.removeItem(SKRIPTU_LYKLAR[k]);
  }
}

export function skriptaStillt() {
  const s = lesaSkriptuStillingar();
  return !!(s.url && s.lykilord);
}

export function emailjsStillt() {
  const s = lesaPostStillingar();
  return !!(s.service && s.template && s.key);
}

export function postStillt() {
  return skriptaStillt() || emailjsStillt();
}

// Kóðinn sem kennarinn límir í Google Apps Script (sjá Stillingar → Áminningar).
export const APPS_SCRIPT_KODI = `// Gettu Betur - sendir áminningarpósta úr þínum Gmail.
const LYKILORD = 'BREYTTU-MER'; // sama lykilorð og í Stillingar á stjórnborðinu

function doPost(e) {
  try {
    const gogn = JSON.parse(e.postData.contents);
    if (gogn.lykilord !== LYKILORD) return svar({ ok: false, villa: 'Rangt lykilorð' });
    let html = gogn.html;
    const myndir = {};
    if (gogn.mynd) {
      myndir.aminning = UrlFetchApp.fetch(gogn.mynd).getBlob().setName('aminning.png');
      html = html.split(gogn.mynd).join('cid:aminning');
    }
    GmailApp.sendEmail(gogn.til, gogn.efni, gogn.texti, { htmlBody: html, inlineImages: myndir, name: 'Gettu Betur' });
    return svar({ ok: true });
  } catch (villa) {
    return svar({ ok: false, villa: String(villa) });
  }
}

function svar(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}`;

export function fyrstaNafn(nafn) {
  return (nafn || "").trim().split(/\s+/)[0] || "";
}

export function dagar(fjoldi) {
  if (fjoldi === null || fjoldi === undefined) return "dálítill tími";
  if (fjoldi <= 0) return "stuttur tími";
  return fjoldi === 1 ? "1 dagur" : `${fjoldi} dagar`;
}

export function dogum(fjoldi) {
  if (fjoldi === null || fjoldi === undefined) return "dálitlum tíma";
  if (fjoldi <= 0) return "stuttum tíma";
  return fjoldi === 1 ? "1 degi" : `${fjoldi} dögum`;
}

// Kyn nemandans ("kk" | "kvk" | undefined) - sjá kynNemanda í js/admin.js.
function kynsbeygt(ctx, kk, kvk, hvort) {
  return ctx.kyn === "kk" ? kk : ctx.kyn === "kvk" ? kvk : hvort;
}

// Emoji í efnislínu birtast sem "???" í sumum póstforritum (Apps Script/EmailJS
// senda þau ekki rétt) - tökum þau úr efnislínunni, þau haldast í sjálfum póstinum.
export function efnislina(strengur, ctx) {
  return fyllaInn(strengur, ctx)
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function fyllaInn(strengur, ctx) {
  return (strengur || "")
    .replaceAll("{okominn}", kynsbeygt(ctx, "ókominn", "ókomin", "ókomin(n)"))
    .replaceAll("{nafn}", fyrstaNafn(ctx.nafn) || "þú")
    .replaceAll("{dagar}", dagar(ctx.dagar))
    .replaceAll("{dogum}", dogum(ctx.dagar));
}

function htmlHreinsa(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

// Alger slóð (fyrir póstinn - verður að vera á netinu).
export function myndaSlod(aminning) {
  return MYND_SLOD + aminning.mynd;
}

// Slóð miðað við stjórnborðið sjálft (forskoðun í stjórnborðinu).
export function myndaForskodun(aminning) {
  return "myndir/aminningar/" + aminning.mynd;
}

// Pósturinn sjálfur (HTML með innfelldum stílum - virkar í flestum póstforritum).
export function byggjaPostHtml(aminning, ctx, medMynd = true) {
  if (!medMynd) {
    // Einfaldur póstur án myndar og skrauts - minni líkur á ruslpósti hjá nýjum viðtakanda.
    return `<p>${htmlHreinsa(fyllaInn(aminning.texti, ctx))}</p>
<p>Halda áfram: <a href="${SIDU_SLOD}leikur.html">${SIDU_SLOD}leikur.html</a></p>
<p>Kveðja,<br>${htmlHreinsa(ctx.sendandi || UNDIRSKRIFT)}${ctx.sendandi ? "" : UNDIRSKRIFT_HTML_EMOJI}</p>`;
  }
  const fyrirsogn = fyllaInn(aminning.fyrirsogn, ctx);
  const texti = fyllaInn(aminning.texti, ctx);
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e6e0;">
<img src="${myndaSlod(aminning)}" alt="" width="520" style="display:block;width:100%;height:auto;">
<div style="padding:22px 26px 28px;color:#161616;">
<h1 style="font-size:24px;margin:0 0 12px;">${htmlHreinsa(fyrirsogn)}</h1>
<p style="font-size:16px;line-height:1.5;margin:0 0 22px;">${htmlHreinsa(texti)}</p>
<a href="${SIDU_SLOD}leikur.html" style="display:inline-block;background:#161616;color:#d7ff3e;text-decoration:none;font-weight:bold;padding:13px 26px;border-radius:999px;">Halda áfram í Gettu Betur →</a>
<p style="font-size:14px;line-height:1.5;color:#555;margin:22px 0 0;">Kveðja,<br>${htmlHreinsa(ctx.sendandi || UNDIRSKRIFT)}${ctx.sendandi ? "" : UNDIRSKRIFT_HTML_EMOJI}<br><span style="font-size:12px;color:#888;">Þessi áminning er send beint frá mér - þú mátt svara þessum pósti.</span></p>
</div></div>`;
}

export function byggjaPostTexta(aminning, ctx) {
  return `${fyllaInn(aminning.fyrirsogn, ctx)}\n\n${fyllaInn(aminning.texti, ctx)}\n\nHalda áfram: ${SIDU_SLOD}leikur.html\n\nKveðja,\n${ctx.sendandi || UNDIRSKRIFT}\n(Þú mátt svara þessum pósti.)`;
}

export function mailtoSlod(til, aminning, ctx) {
  return `mailto:${encodeURIComponent(til)}?subject=${encodeURIComponent(fyllaInn(aminning.titill, ctx))}&body=${encodeURIComponent(byggjaPostTexta(aminning, ctx))}`;
}

// Sendir póst um EmailJS. Kastar villu ef það er ekki stillt eða sendingin mistekst.
export async function sendaPost({ til, nafn, aminning, dagar, kyn, sendandi, medMynd = true }) {
  if (!postStillt()) throw new Error("Póstsending er ekki stillt (sjá Stillingar → Áminningar).");
  const ctx = { nafn, dagar, kyn, sendandi };
  if (skriptaStillt()) {
    const sk = lesaSkriptuStillingar();
    let svar;
    try {
      svar = await fetch(sk.url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          lykilord: sk.lykilord,
          til,
          efni: efnislina(aminning.titill, ctx),
          html: byggjaPostHtml(aminning, ctx, medMynd),
          texti: byggjaPostTexta(aminning, ctx),
          mynd: medMynd ? myndaSlod(aminning) : ""
        })
      });
    } catch (villa) {
      throw new Error("Náði ekki sambandi við Apps Script (athugaðu slóðina). Gæti samt hafa sendst - kíktu í Sent í Gmail.");
    }
    const j = await svar.json().catch(() => null);
    if (!j || !j.ok) throw new Error(j?.villa || "Apps Script svaraði ekki rétt.");
    return;
  }
  const s = lesaPostStillingar();
  const svar = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: s.service,
      template_id: s.template,
      user_id: s.key,
      template_params: {
        to_email: til,
        to_name: fyrstaNafn(nafn),
        subject: efnislina(aminning.titill, ctx),
        message_html: byggjaPostHtml(aminning, ctx, medMynd),
        message_text: byggjaPostTexta(aminning, ctx)
      }
    })
  });
  if (!svar.ok) throw new Error(`EmailJS svaraði ${svar.status}: ${await svar.text()}`);
}
