const SLEPPT_MERKI="__sleppt__";
const tolfraediStada = document.getElementById("tolfraediStada");
const tolfraediKort = document.getElementById("tolfraediKort");
const tolfraediEndurhladaBtn = document.getElementById("tolfraediEndurhladaBtn");
const heatmapNemandi = document.getElementById("heatmapNemandi");
const VIKUDAGAR = ["Mán", "Þri", "Mið", "Fim", "Fös", "Lau", "Sun"];
const VIKUDAGAR_LANGT = ["mánudagur", "þriðjudagur", "miðvikudagur", "fimmtudagur", "föstudagur", "laugardagur", "sunnudagur"];
let tolfraediNemendur = [];
let tolfraediHladid = false;
let tolfraediAdHlada = false;

function dagslykill(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function sekSemTexti(sek) {
  if (!sek) return "0 mín";
  const klst = Math.floor(sek / 3600);
  const min = Math.round((sek % 3600) / 60);
  return klst ? `${klst} klst ${min} mín` : `${min} mín`;
}

function reiknaNemanda(id, notandi, tilraunir, verkefnaTitlar) {
  const virk = notandi.virkni || {};
  const reitir = { tolva: [], simi: [] };
  for (const taeki of Object.keys(reitir)) {
    reitir[taeki] = Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => virk[taeki]?.[`d${d}h${h}`] || 0));
  }
  const samtalsTaeki = (taeki) => reitir[taeki].reduce((a, dagur) => a + dagur.reduce((x, y) => x + y, 0), 0);

  const svor = tilraunir.filter((t) => t.svar !== SLEPPT_MERKI && t.ms);
  const dagar = new Map();
  const klst = new Array(24).fill(0);
  const vikudagur = new Array(7).fill(0);
  for (const t of svor) {
    dagar.set(dagslykill(t.ms), (dagar.get(dagslykill(t.ms)) || 0) + 1);
    const d = new Date(t.ms);
    klst[d.getUTCHours()]++;
    vikudagur[(d.getUTCDay() + 6) % 7]++;
  }
  const dagalisti = [...dagar.keys()].sort();
  let lengstaRak = 0;
  let rak = 0;
  let fyrri = null;
  for (const d of dagalisti) {
    const ms = Date.parse(d);
    rak = fyrri !== null && ms - fyrri === 86400000 ? rak + 1 : 1;
    lengstaRak = Math.max(lengstaRak, rak);
    fyrri = ms;
  }
  const metDagur = [...dagar.entries()].sort((a, b) => b[1] - a[1])[0];
  const fyrirViku = Date.now() - 7 * 86400000;
  const hamark = (listi) => listi.indexOf(Math.max(...listi));

  const flokkar = Object.entries(notandi.verkefnaStada || {})
    .map(([vid, b]) => {
      const metin = (b.svarad || 0) - (b.pass || 0);
      return { titill: verkefnaTitlar.get(vid) || "Ótengdar spurningar", metin, hlutfall: metin ? (b.rett || 0) / metin : 0 };
    })
    .filter((f) => f.metin >= 10)
    .sort((a, b) => b.hlutfall - a.hlutfall);

  const tolvaSek = samtalsTaeki("tolva");
  const simiSek = samtalsTaeki("simi");
  const fjoldiRett = notandi.fjoldiRett || 0;
  const metin = (notandi.fjoldiSvarad || 0) - (notandi.fjoldiPass || 0);
  const skjatimi = notandi.screenTimeSeconds || 0;
  return {
    id,
    nafn: notandi.nafn || notandi.email,
    svarad: notandi.fjoldiSvarad || 0,
    pass: notandi.fjoldiPass || 0,
    nakvaemni: metin ? Math.round((fjoldiRett / metin) * 100) : 0,
    skjatimi,
    svorAKlst: skjatimi >= 600 ? (metin / (skjatimi / 3600)).toFixed(1) : null,
    virkirDagar: dagar.size,
    medalSvorADag: dagar.size ? Math.round(svor.length / dagar.size) : 0,
    lengstaRak,
    metDagur: metDagur ? `${metDagur[1]} svör (${metDagur[0].split("-").reverse().join(".")})` : "—",
    sidustu7: svor.filter((t) => t.ms >= fyrirViku).length,
    algengastiTimi: svor.length ? `${String(hamark(klst)).padStart(2, "0")}:00` : "—",
    algengastiDagur: svor.length ? VIKUDAGAR_LANGT[hamark(vikudagur)] : "—",
    bestiFlokkur: flokkar.length ? `${flokkar[0].titill} (${Math.round(flokkar[0].hlutfall * 100)}%)` : "—",
    verstiFlokkur: flokkar.length > 1 ? `${flokkar.at(-1).titill} (${Math.round(flokkar.at(-1).hlutfall * 100)}%)` : "—",
    tolvaSek,
    simiSek,
    reitir
  };
}

async function hladaTolfraedi() {
  if (tolfraediAdHlada) return;
  tolfraediAdHlada = true;
  tolfraediStada.textContent = "Sæki gögn…";
  try {
    const [notendurSnap, verkefnaSnap] = await Promise.all([getDocs(collection(db, "users")), getDocs(collection(db, "verkefni"))]);
    const verkefnaTitlar = new Map(verkefnaSnap.docs.map((d) => [d.id, d.data().title]));
    const nemendur = notendurSnap.docs.filter((d) => d.data().role !== "admin" && (d.data().flokkur || "MS") !== "aðrir");
    tolfraediNemendur = [];
    for (const n of nemendur) {
      const snap = await getDocs(collection(db, "users", n.id, "attempts"));
      const tilraunir = snap.docs.map((d) => ({ svar: d.data().svar, ms: d.data().answeredAt?.toMillis?.() ?? null }));
      tolfraediNemendur.push(reiknaNemanda(n.id, n.data(), tilraunir, verkefnaTitlar));
    }
    tolfraediNemendur.sort((a, b) => b.svarad - a.svarad);
    tolfraediHladid = true;
    tolfraediStada.textContent = `${tolfraediNemendur.length} nemendur · uppfært ${new Date().toLocaleTimeString("is-IS", { hour: "2-digit", minute: "2-digit" })}`;
    teiknaTolfraedi();
  } catch (villa) {
    console.error(villa);
    tolfraediStada.textContent = "Tókst ekki að sækja gögn. Reyndu aftur með Endurhlaða.";
  } finally {
    tolfraediAdHlada = false;
  }
}

function teiknaTolfraedi() {
  tolfraediKort.innerHTML = "";
  for (const n of tolfraediNemendur) {
    const kort = document.createElement("div");
    kort.className = "tolfraedi-kort";
    const titill = document.createElement("h3");
    titill.textContent = n.nafn;
    const dl = document.createElement("dl");
    const samtalsSek = n.tolvaSek + n.simiSek;
    const linur = [
      ["Svarað / pass", `${n.svarad} / ${n.pass}`],
      ["Nákvæmni", `${n.nakvaemni}%`],
      ["Skjátími", sekSemTexti(n.skjatimi)],
      ["Svör á klst. á síðunni", n.svorAKlst ?? "—"],
      ["Virkir dagar", n.virkirDagar],
      ["Meðaltal svara á virkum degi", n.medalSvorADag],
      ["Lengsta rák (dagar í röð)", n.lengstaRak],
      ["Flest svör á einum degi", n.metDagur],
      ["Svör síðustu 7 daga", n.sidustu7],
      ["Algengasti tími dags", n.algengastiTimi],
      ["Algengasti vikudagur", n.algengastiDagur],
      ["Sterkasti flokkur", n.bestiFlokkur],
      ["Veikasti flokkur", n.verstiFlokkur],
      ["Tölva / sími", samtalsSek ? `${Math.round((n.tolvaSek / samtalsSek) * 100)}% / ${Math.round((n.simiSek / samtalsSek) * 100)}%` : "engin gögn enn"]
    ];
    for (const [heiti, gildi] of linur) {
      const dt = document.createElement("dt");
      dt.textContent = heiti;
      const dd = document.createElement("dd");
      dd.textContent = gildi;
      dl.append(dt, dd);
    }
    kort.append(titill, dl);
    tolfraediKort.appendChild(kort);
  }

  const gildi = heatmapNemandi.value || "allir";
  heatmapNemandi.innerHTML = "";
  heatmapNemandi.appendChild(new Option("Öll fjögur samanlagt", "allir"));
  tolfraediNemendur.forEach((n) => heatmapNemandi.appendChild(new Option(n.nafn, n.id)));
  heatmapNemandi.value = [...heatmapNemandi.options].some((o) => o.value === gildi) ? gildi : "allir";
  teiknaHeatmap();
}

function teiknaHeatmap() {
  const valdir = heatmapNemandi.value === "allir" ? tolfraediNemendur : tolfraediNemendur.filter((n) => n.id === heatmapNemandi.value);
  [["tolva", "heatmapTolva"], ["simi", "heatmapSimi"]].forEach(([taeki, elId]) => {
    const el = document.getElementById(elId);
    const gildi = Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => valdir.reduce((a, n) => a + n.reitir[taeki][d][h], 0)));
    const hamark = Math.max(0, ...gildi.flat());
    const samtals = gildi.flat().reduce((a, b) => a + b, 0);
    el.innerHTML = "";
    el.appendChild(document.createElement("span"));
    for (let h = 0; h < 24; h++) {
      const t = document.createElement("span");
      t.className = "hm-klst";
      t.textContent = h % 3 === 0 ? h : "";
      el.appendChild(t);
    }
    VIKUDAGAR.forEach((nafn, d) => {
      const heiti = document.createElement("span");
      heiti.textContent = nafn;
      el.appendChild(heiti);
      for (let h = 0; h < 24; h++) {
        const reitur = document.createElement("span");
        reitur.className = "hm-reitur";
        const v = gildi[d][h];
        if (v > 0) reitur.style.background = `rgba(93, 143, 31, ${(0.15 + 0.85 * (v / hamark)).toFixed(2)})`;
        reitur.title = `${VIKUDAGAR[d]} ${String(h).padStart(2, "0")}:00 – ${sekSemTexti(v)}`;
        el.appendChild(reitur);
      }
    });
    const skyring = document.createElement("div");
    skyring.className = "heatmap-skyring";
    skyring.innerHTML = `<span>minna</span><span class="hm-kvardi"></span><span>meira</span>`;
    const samtalsSpan = document.createElement("span");
    samtalsSpan.style.marginLeft = "auto";
    samtalsSpan.textContent = samtals ? `Samtals ${sekSemTexti(samtals)}` : "Engin gögn enn";
    skyring.appendChild(samtalsSpan);
    el.appendChild(skyring);
  });
}


const verk=new Map([["v1","Hraðaspurningar"],["v2","Biblían"]]);
function slump(i){const n={nafn:["Hinrik","Freyja","Julia","Hekla"][i],fjoldiSvarad:300+i*50,fjoldiPass:20,fjoldiRett:150,screenTimeSeconds:36000,verkefnaStada:{v1:{svarad:100,pass:5,rett:70},v2:{svarad:40,pass:2,rett:10}},virkni:{tolva:{},simi:{}}};
for(let d=0;d<7;d++)for(let h=0;h<24;h++){if(Math.random()<.4)n.virkni.tolva["d"+d+"h"+h]=Math.floor(Math.random()*3000);if(h>14&&Math.random()<.5)n.virkni.simi["d"+d+"h"+h]=Math.floor(Math.random()*3000);}
const t=[];for(let k=0;k<200;k++)t.push({svar:k%9?"x":SLEPPT_MERKI,ms:Date.now()-Math.random()*20*86400000});
return reiknaNemanda("u"+i,n,t,verk);}
tolfraediNemendur=[0,1,2,3].map(slump);
document.getElementById("sida-tolfraedi").classList.add("virk");
teiknaTolfraedi();
