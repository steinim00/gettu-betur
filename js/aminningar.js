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
// Útgáfa 2: bætir við tímasettum sendingum ("Senda síðar" í Ýta við). Notið EKKI ${...} eða bakstrik hér.
export const APPS_SCRIPT_KODI = `// Gettu Betur - sendir áminningarpósta úr þínum Gmail (útgáfa 2: tímasettar sendingar).
const LYKILORD = 'BREYTTU-MER'; // sama lykilorð og í Stillingar á stjórnborðinu
const VERKEFNI = 'ms-gettu-betur'; // Firebase-verkefnið (ekki breyta)
const ONLINE_MIN = 6; // nemandi sem var virkur síðustu 6 mín telst online - þá er hætt við sendinguna
const MAX_SEINKUN_KLST = 12; // tímasett sending sem er meira en 12 klst of sein er ekki send

function doPost(e) {
  try {
    const gogn = JSON.parse(e.postData.contents);
    if (gogn.lykilord !== LYKILORD) return svar({ ok: false, villa: 'Rangt lykilorð' });
    if (gogn.adgerd === 'timasetja') return svar(timasetja(gogn));
    if (gogn.adgerd === 'afturkalla') return svar(afturkalla(gogn.id));
    if (gogn.adgerd === 'stada') return svar({ ok: true, version: 2, listi: stadaListi() });
    if (gogn.adgerd === 'hreinsa') return svar(hreinsa(gogn.ids || []));
    sendaPostinn(gogn);
    return svar({ ok: true });
  } catch (villa) {
    return svar({ ok: false, villa: String(villa) });
  }
}

function sendaPostinn(p) {
  let html = p.html;
  const myndir = {};
  if (p.mynd) {
    myndir.aminning = UrlFetchApp.fetch(p.mynd).getBlob().setName('aminning.png');
    html = html.split(p.mynd).join('cid:aminning');
  }
  GmailApp.sendEmail(p.til, p.efni, p.texti, { htmlBody: html, inlineImages: myndir, name: 'Gettu Betur' });
}

function svar(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// --- Tímasettar sendingar: ein á hvern nemanda (id = uid), geymdar þjappaðar í Script Properties ---
function geyma(id, hlutur) {
  const gz = Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(JSON.stringify(hlutur), 'application/json')).getBytes());
  if (gz.length > 8500) throw new Error('Áminningin er of stór til að geyma (' + gz.length + ' stafir). Prófaðu "Engin mynd".');
  PropertiesService.getScriptProperties().setProperty('t_' + id, gz);
}

function lesa(id) {
  const gz = PropertiesService.getScriptProperties().getProperty('t_' + id);
  if (!gz) return null;
  const json = Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(gz), 'application/x-gzip')).getDataAsString();
  return JSON.parse(json);
}

function timasetja(g) {
  if (!g.id || !g.uid || !g.pakki || !g.pakki.til) throw new Error('Vantar gögn');
  if (!(g.kl > Date.now())) throw new Error('Tíminn er liðinn');
  geyma(g.id, { id: g.id, uid: g.uid, kl: g.kl, stada: 'bid', pakki: g.pakki });
  return { ok: true, version: 2 };
}

function afturkalla(id) {
  PropertiesService.getScriptProperties().deleteProperty('t_' + id);
  return { ok: true };
}

function stadaListi() {
  const lyklar = PropertiesService.getScriptProperties().getKeys().filter(function (k) { return k.indexOf('t_') === 0; });
  return lyklar.map(function (k) {
    const h = lesa(k.slice(2));
    return h && { id: h.id, uid: h.uid, kl: h.kl, stada: h.stada, timi: h.timi || null, villa: h.villa || null };
  }).filter(Boolean);
}

function hreinsa(ids) {
  ids.forEach(function (id) {
    const h = lesa(id);
    if (h && h.stada !== 'bid') PropertiesService.getScriptProperties().deleteProperty('t_' + id);
  });
  return { ok: true };
}

// Er nemandinn online? Vefsíðan skráir "onlineStada/<uid>" á meðan nemandi með tímasetta áminningu er virkur.
function erOnline(uid) {
  const slod = 'https://firestore.googleapis.com/v1/projects/' + VERKEFNI + '/databases/(default)/documents/onlineStada/' + encodeURIComponent(uid);
  const r = UrlFetchApp.fetch(slod, { muteHttpExceptions: true });
  if (r.getResponseCode() === 404) return false;
  if (r.getResponseCode() !== 200) throw new Error('Firestore svaraði ' + r.getResponseCode());
  const f = JSON.parse(r.getContentText()).fields;
  const t = f && f.t && f.t.timestampValue;
  return !!t && Date.now() - new Date(t).getTime() < ONLINE_MIN * 60000;
}

function loka(h, stada, villa) {
  delete h.pakki;
  h.stada = stada;
  h.timi = Date.now();
  if (villa) h.villa = villa;
  geyma(h.id, h);
}

// Keyrir á 5 mínútna fresti (sjá uppsetning() hér fyrir neðan).
function athugaTimasettar() {
  const laas = LockService.getScriptLock();
  if (!laas.tryLock(20000)) return;
  try {
    const lyklar = PropertiesService.getScriptProperties().getKeys().filter(function (k) { return k.indexOf('t_') === 0; });
    lyklar.forEach(function (k) {
      const h = lesa(k.slice(2));
      if (!h || h.stada !== 'bid' || h.kl > Date.now()) return;
      if (Date.now() - h.kl > MAX_SEINKUN_KLST * 3600000) return loka(h, 'of_sein');
      let online;
      try {
        online = erOnline(h.uid);
      } catch (villa) {
        return; // reyna aftur næst
      }
      if (online) return loka(h, 'online');
      try {
        sendaPostinn(h.pakki);
        loka(h, 'sent');
      } catch (villa) {
        loka(h, 'villa', String(villa));
      }
    });
  } finally {
    laas.releaseLock();
  }
}

// Keyrðu þetta fall EINU SINNI (Run) til að búa til 5 mínútna tímastillinn.
function uppsetning() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'athugaTimasettar') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('athugaTimasettar').timeBased().everyMinutes(5).create();
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
export function byggjaPostHtml(aminning, ctx, myndahamur = "lit") {
  if (myndahamur === "engin" || myndahamur === false) {
    // Einfaldur póstur án myndar og skrauts - minni líkur á ruslpósti hjá nýjum viðtakanda.
    return `<p>${htmlHreinsa(fyllaInn(aminning.texti, ctx))}</p>
<p>Halda áfram: <a href="${SIDU_SLOD}leikur.html">${SIDU_SLOD}leikur.html</a></p>
<p>Kveðja,<br>${htmlHreinsa(ctx.sendandi || UNDIRSKRIFT)}${ctx.sendandi ? "" : UNDIRSKRIFT_HTML_EMOJI}</p>`;
  }
  const fyrirsogn = fyllaInn(aminning.fyrirsogn, ctx);
  const texti = fyllaInn(aminning.texti, ctx);
  if (myndahamur === "lit" || myndahamur === true) {
    // Texti fyrst, lítil mynd og venjuleg slóð - líkist venjulegum pósti frá manneskju
    // og lendir síður í ruslpósti en stór myndborði með hnappi.
    return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#161616;max-width:520px;">
<p style="margin:0 0 12px;"><strong>${htmlHreinsa(fyrirsogn)}</strong></p>
<p style="margin:0 0 14px;">${htmlHreinsa(texti)}</p>
<p style="margin:0 0 14px;"><img src="${myndaSlod(aminning)}" alt="Bikarinn" width="240" style="display:block;border-radius:12px;"></p>
<p style="margin:0 0 14px;">Halda áfram: <a href="${SIDU_SLOD}leikur.html">${SIDU_SLOD}leikur.html</a></p>
<p style="margin:0;">Kveðja,<br>${htmlHreinsa(ctx.sendandi || UNDIRSKRIFT)}${ctx.sendandi ? "" : UNDIRSKRIFT_HTML_EMOJI}</p>
</div>`;
  }
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

// Pakkinn sem Apps Script sendir (líka tímasettur).
function byggjaSkriptuPakka({ til, nafn, aminning, dagar, kyn, sendandi, myndahamur = "lit" }) {
  const ctx = { nafn, dagar, kyn, sendandi };
  return {
    til,
    efni: efnislina(aminning.titill, ctx),
    html: byggjaPostHtml(aminning, ctx, myndahamur),
    texti: byggjaPostTexta(aminning, ctx),
    mynd: myndahamur === "engin" ? "" : myndaSlod(aminning)
  };
}

async function skriptaKall(body) {
  const sk = lesaSkriptuStillingar();
  let svar;
  try {
    svar = await fetch(sk.url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ lykilord: sk.lykilord, ...body })
    });
  } catch (villa) {
    throw new Error("Náði ekki sambandi við Apps Script (athugaðu slóðina).");
  }
  const j = await svar.json().catch(() => null);
  if (!j || !j.ok) throw new Error(j?.villa || "Apps Script svaraði ekki rétt.");
  return j;
}

// Tímasett sending (stök): Apps Script sendir póstinn á tímanum sendaKl (ms) nema nemandinn sé online.
// Krefst útgáfu 2 af Apps Script kóðanum - gamla útgáfan neitar (og sendir ekkert).
export async function timasetjaPost({ id, uid, sendaKl, ...rest }) {
  if (!skriptaStillt()) throw new Error("Tímasettar sendingar krefjast Apps Script (Stillingar → Áminningar).");
  const j = await skriptaKall({ adgerd: "timasetja", id, uid, kl: sendaKl, pakki: byggjaSkriptuPakka(rest) });
  if (!j.version || j.version < 2) throw new Error("Apps Script kóðinn er gamall - uppfærðu hann (Stillingar → Áminningar).");
}

export const afturkallaTimasetta = (id) => skriptaKall({ adgerd: "afturkalla", id });
export async function saekjaTimasettar() {
  const j = await skriptaKall({ adgerd: "stada" });
  return j.listi || [];
}
export const hreinsaTimasettar = (ids) => skriptaKall({ adgerd: "hreinsa", ids });

// Sendir póst um EmailJS. Kastar villu ef það er ekki stillt eða sendingin mistekst.
export async function sendaPost({ til, nafn, aminning, dagar, kyn, sendandi, myndahamur = "lit" }) {
  if (!postStillt()) throw new Error("Póstsending er ekki stillt (sjá Stillingar → Áminningar).");
  const ctx = { nafn, dagar, kyn, sendandi };
  if (skriptaStillt()) {
    try {
      await skriptaKall(byggjaSkriptuPakka({ til, nafn, aminning, dagar, kyn, sendandi, myndahamur }));
    } catch (villa) {
      throw new Error(villa.message.startsWith("Náði ekki") ? villa.message + " Gæti samt hafa sendst - kíktu í Sent í Gmail." : villa.message);
    }
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
        message_html: byggjaPostHtml(aminning, ctx, myndahamur),
        message_text: byggjaPostTexta(aminning, ctx)
      }
    })
  });
  if (!svar.ok) throw new Error(`EmailJS svaraði ${svar.status}: ${await svar.text()}`);
}
