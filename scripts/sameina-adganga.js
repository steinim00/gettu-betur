// Sameinar aukaaðgang notanda (SEC) í aðalaðgang (PRI).
// Notkun: NODE_PATH=... node sameina-adganga.js <PRI-uid> <SEC-uid> "<nafn>" [--apply]   (án --apply er þetta bara prófun)
// - svör (attempts) úr SEC færast yfir í PRI ef PRI á ekkert svar við spurningunni, eða ef svarið í SEC er betra
//   (rétt > rangt > pass); teljarar (alls/rétt/pass og verkefnaStada) eru reiknaðir út frá raunverulegu svörunum
// - skjátími og virknikort leggjast saman; endurtekningabunki og síðast virk/ur flytjast
// - SEC verður að "sameinað" skjali (sameinadVid): hægt er að skrá sig inn með báðum Gmail-netföngunum en forritið notar
//   gögn PRI (sjá js/auth.js og firestore.rules); afrit af SEC er vistað í ./afrit-<SEC>.json
const admin=require("firebase-admin");const fs=require("fs");
admin.initializeApp({credential:admin.credential.cert(require(require("path").join(__dirname,"serviceAccountKey.json")))});
const db=admin.firestore(); const FV=admin.firestore.FieldValue;
const [PRI,SEC,NAFN]=process.argv.slice(2,5); if(!PRI||!SEC||!NAFN){console.error("Vantar PRI, SEC og nafn");process.exit(1);}
const einf=(s)=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[.,;:!?"'„“()]/g,"").replace(/\s+/g," ").trim();
const vm=require("vm");const vmCtx={};vm.createContext(vmCtx);
{const q=fs.readFileSync(require("path").join(__dirname,"..","js","quiz.js"),"utf8");const a=q.indexOf("function samraema"),b=q.indexOf("function erSvarRett");const e=q.indexOf("\n}\n",b)+3;
vm.runInContext(q.slice(a,e)+"\nthis.erSvarRett=erSvarRett;",vmCtx);}
function erRett(svar,rett){return vmCtx.erSvarRett(svar,rett);} // sama fall og vefsíðan notar
(async()=>{
 const [p,s]=await Promise.all([db.doc("users/"+PRI).get(),db.doc("users/"+SEC).get()]);
 const P=p.data(),S=s.data();
 const pAtt=new Map((await p.ref.collection("attempts").get()).docs.map(d=>[d.id,d.data()]));
 const sAttSnap=await s.ref.collection("attempts").get();
 const ids=sAttSnap.docs.map(d=>d.id);
 // spurningar + rétt svör fyrir allar sameiginlegar/afrit
 const qs=new Map(),as=new Map();
 const allIds=[...new Set([...ids,...[...pAtt.keys()].filter(k=>ids.includes(k))])];
 for(let i=0;i<allIds.length;i+=30){const b=allIds.slice(i,i+30);
  (await db.collection("questions").where(admin.firestore.FieldPath.documentId(),"in",b).get()).forEach(d=>qs.set(d.id,d.data()));
  (await db.collection("answers").where(admin.firestore.FieldPath.documentId(),"in",b).get()).forEach(d=>as.set(d.id,d.data().correctAnswers||[]));}
 const stada=(qid,a)=>a.svar==="__sleppt__"||a.svar===SLEPPT?"pass":(erRett(a.svar,as.get(qid)||[])?"rett":"rangt");
 var SLEPPT="__SLEPPT__";
 return {P,S,pAtt,sAttSnap,qs,as,stada};
})().then(async (c)=>{
 // finna SLEPPT_MERKI úr kóða
 const src=fs.readFileSync(require("path").join(__dirname,"..","js","quiz.js"),"utf8"); const m=src.match(/const SLEPPT_MERKI = ["']([^"']+)["']/); const SL=m?m[1]:"__pass__";
 const stada=(qid,a)=>a.svar===SL?"pass":(erRett(a.svar,c.as.get(qid)||[])?"rett":"rangt");
 const rod={rett:2,rangt:1,pass:0};
 const delta={svarad:0,rett:0,pass:0}; const perV={}; const adgerdir=[]; let afrit=0,skipt=0,sleppt=0;
 const add=(vid,st,sign)=>{delta.svarad+=sign; if(st==="rett")delta.rett+=sign; if(st==="pass")delta.pass+=sign; if(vid){perV[vid]=perV[vid]||{svarad:0,rett:0,pass:0}; perV[vid].svarad+=sign; if(st==="rett")perV[vid].rett+=sign; if(st==="pass")perV[vid].pass+=sign;}};
 for(const d of c.sAttSnap.docs){const qid=d.id,a=d.data(),q=c.qs.get(qid); const vid=q?.verkefniId||null; const sSt=stada(qid,a);
  const pa=c.pAtt.get(qid);
  if(!pa){adgerdir.push({qid,a,gerd:"afrita"}); add(vid,sSt,+1); afrit++;}
  else{const pSt=stada(qid,pa); if(rod[sSt]>rod[pSt]){adgerdir.push({qid,a,gerd:"skipta"}); add(vid,pSt,-1); add(vid,sSt,+1); skipt++;} else sleppt++;}}
 console.log("PRIMARY svarad/rett/pass:",c.P.fjoldiSvarad,c.P.fjoldiRett,c.P.fjoldiPass,"| attempts:",c.pAtt.size);
 console.log("SECONDARY attempts:",c.sAttSnap.size,"| afrita:",afrit,"| skipta (betra svar):",skipt,"| sleppt (aðal heldur):",sleppt);
 console.log("delta:",JSON.stringify(delta),"| verkefni:",Object.keys(perV).length);
 console.log("skjátími:",c.P.screenTimeSeconds,"+",c.S.screenTimeSeconds,"| endurtaka sec:",Object.keys(c.S.endurtaka||{}).length);
  if(!process.argv.includes("--apply")) return console.log("(prófun - ekkert skrifað)");
 // AFRIT
 fs.writeFileSync(require("path").join(__dirname,`afrit-${SEC}.json`),JSON.stringify({user:c.S,attempts:c.sAttSnap.docs.map(d=>({id:d.id,...d.data()}))},null,1));
 // skrifa attempts
 let batch=db.batch(),n=0; const flush=async()=>{if(n){await batch.commit();batch=db.batch();n=0;}};
 for(const x of adgerdir){batch.set(db.doc(`users/${PRI}/attempts/${x.qid}`),{svar:x.a.svar,answeredAt:x.a.answeredAt}); if(++n>=400)await flush();}
 await flush();
 // teljarar
 const upd={fjoldiSvarad:FV.increment(delta.svarad),fjoldiRett:FV.increment(delta.rett),fjoldiPass:FV.increment(delta.pass)};
 for(const [vid,v] of Object.entries(perV)){ if(v.svarad)upd[`verkefnaStada.${vid}.svarad`]=FV.increment(v.svarad); if(v.rett)upd[`verkefnaStada.${vid}.rett`]=FV.increment(v.rett); if(v.pass)upd[`verkefnaStada.${vid}.pass`]=FV.increment(v.pass);}
 upd.screenTimeSeconds=FV.increment(c.S.screenTimeSeconds||0);
 for(const [tk,m] of Object.entries(c.S.virkni||{})) for(const [k,v] of Object.entries(m)) upd[`virkni.${tk}.${k}`]=FV.increment(v);
 const nyTotal=(c.P.fjoldiSvarad||0)+delta.svarad;
 for(const qid of Object.keys(c.S.endurtaka||{})){ if(!(c.P.endurtaka||{})[qid] && (adgerdir.some(x=>x.qid===qid) || !c.pAtt.has(qid))) upd[`endurtaka.${qid}`]=nyTotal; }
 const ms=(t)=>t?.toMillis?.()??0;
 if(ms(c.S.lastActive)>ms(c.P.lastActive)) upd.lastActive=c.S.lastActive;
 if(ms(c.S.sidastSvaradAt)>ms(c.P.sidastSvaradAt)) upd.sidastSvaradAt=c.S.sidastSvaradAt;
 upd.nafn=NAFN; upd.sameinadFra=SEC;
 await db.doc("users/"+PRI).update(upd);
 // legstaður: tombstone á SEC, eyða afritum
 for(const d of c.sAttSnap.docs){batch.delete(d.ref); if(++n>=400)await flush();} await flush();
 await db.doc("onlineStada/"+SEC).delete().catch(()=>{});
 await db.doc("users/"+SEC).set({nafn:c.S.nafn,email:c.S.email,role:"user",flokkur:"sameinad",sameinadVid:PRI,createdAt:c.S.createdAt});
 const f=(await db.doc("users/"+PRI).get()).data(); const ca=(await db.collection(`users/${PRI}/attempts`).count().get()).data().count;
 console.log("EFTIR: svarad/rett/pass:",f.fjoldiSvarad,f.fjoldiRett,f.fjoldiPass,"| attempts:",ca,"| skjátími:",f.screenTimeSeconds);
});
