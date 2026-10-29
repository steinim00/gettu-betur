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
    titill: "Þessar spurningar svara sér ekki sjálfar",
    fyrirsogn: "Bikarinn er svolítið pirraður",
    texti: "{nafn}, ég er ekki reiður. Ég er bara að lyfta augabrúnunum mjög hátt. Síðast sást til þín fyrir {dogum} og það er EKKI í lagi. Komdu og svaraðu nokkrum."
  },
  {
    id: "sofandi",
    mynd: "sofandi.png",
    titill: "Zzz… Gettu Betur sofnaði",
    fyrirsogn: "Allt er orðið svo rólegt",
    texti: "Appið er farið að hrjóta. Vaknaðu, {nafn}, og svaraðu 10 spurningum - þá vaknar bikarinn líka."
  },
  {
    id: "hissa",
    mynd: "hissa.png",
    titill: "Bíddu, hvað?! Hvar ertu?",
    fyrirsogn: "Ha?! Hvert fórstu?",
    texti: "{nafn}?! Við héldum að þú værir rétt ókomin(n). Það eru yfir þúsund spurningar að bíða - og engin þeirra bítur."
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

const YFIRSKRIFT_LYKILL = "gettuBetur_aminningarYfirskrift";
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

export function postStillt() {
  const s = lesaPostStillingar();
  return !!(s.service && s.template && s.key);
}

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

export function fyllaInn(strengur, ctx) {
  return (strengur || "")
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
export function byggjaPostHtml(aminning, ctx) {
  const fyrirsogn = fyllaInn(aminning.fyrirsogn, ctx);
  const texti = fyllaInn(aminning.texti, ctx);
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e6e0;">
<img src="${myndaSlod(aminning)}" alt="" width="520" style="display:block;width:100%;height:auto;">
<div style="padding:22px 26px 28px;color:#161616;">
<h1 style="font-size:24px;margin:0 0 12px;">${htmlHreinsa(fyrirsogn)}</h1>
<p style="font-size:16px;line-height:1.5;margin:0 0 22px;">${htmlHreinsa(texti)}</p>
<a href="${SIDU_SLOD}leikur.html" style="display:inline-block;background:#161616;color:#d7ff3e;text-decoration:none;font-weight:bold;padding:13px 26px;border-radius:999px;">Halda áfram í Gettu Betur →</a>
</div></div>`;
}

export function byggjaPostTexta(aminning, ctx) {
  return `${fyllaInn(aminning.fyrirsogn, ctx)}\n\n${fyllaInn(aminning.texti, ctx)}\n\nHalda áfram: ${SIDU_SLOD}leikur.html\n(Mynd: ${myndaSlod(aminning)})`;
}

export function mailtoSlod(til, aminning, ctx) {
  return `mailto:${encodeURIComponent(til)}?subject=${encodeURIComponent(fyllaInn(aminning.titill, ctx))}&body=${encodeURIComponent(byggjaPostTexta(aminning, ctx))}`;
}

// Sendir póst um EmailJS. Kastar villu ef það er ekki stillt eða sendingin mistekst.
export async function sendaPost({ til, nafn, aminning, dagar }) {
  const s = lesaPostStillingar();
  if (!postStillt()) throw new Error("Póstsending er ekki stillt (sjá Stillingar → Áminningar).");
  const ctx = { nafn, dagar };
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
        subject: fyllaInn(aminning.titill, ctx),
        message_html: byggjaPostHtml(aminning, ctx),
        message_text: byggjaPostTexta(aminning, ctx)
      }
    })
  });
  if (!svar.ok) throw new Error(`EmailJS svaraði ${svar.status}: ${await svar.text()}`);
}
