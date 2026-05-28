import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────
const POSTER_W    = 794;
const POSTER_H    = 1123;
const STORAGE_KEY = "plaka_settings_v4";
const VD_KEY      = { ap:"plaka_vordruck_ap_v1", np:"plaka_vordruck_np_v1" };

const GEBINDE_OPTS = ["Dose","Flasche","Träger","Packung","Kiste","Becher","Karton","Beutel","Kanister","Palette","Stück","Riegel","Tube"];
const ANGABE_OPTS  = ["L","cl","ml","KG","g","Wäsche","Stk"];
const OG_EINH_OPTS = ["kg","100g","Stück","Bündel","Kopf","Bund","Schale","Netz","Kiste","Tray"];

const FONT_OPTIONS = [
  { id:"barlow", label:"Barlow Condensed", css:"'Barlow Condensed','Arial Narrow',sans-serif", gf:"Barlow+Condensed:wght@700;900" },
  { id:"oswald", label:"Oswald",           css:"'Oswald',sans-serif",                          gf:"Oswald:wght@600;700" },
  { id:"anton",  label:"Anton",            css:"'Anton',sans-serif",                           gf:"Anton" },
  { id:"bebas",  label:"Bebas Neue",       css:"'Bebas Neue',sans-serif",                      gf:"Bebas+Neue" },
  { id:"roboto", label:"Roboto Condensed", css:"'Roboto Condensed',sans-serif",                gf:"Roboto+Condensed:ital,wght@0,700;0,900" },
  { id:"impact", label:"Impact",           css:"Impact,'Arial Narrow',Arial,sans-serif",       gf:null },
];

const DEFAULT_SETTINGS = { posterFont:"barlow", spacingTop:50, spacingBottom:64, activeVordruck:"np" };

const DEFAULT_LADEN = {
  mode:"laden", hersteller:"Desperados", produkt:"Tropical Daiquiri",
  produktGroesse:"0.33", angabe:"L", info:"", menge:"24", gebinde:"Dose",
  mehrwegStatus:"mehrweg", pfand:"", preis:"45.99", showBarcode:false, artikelNr:"",
};
const DEFAULT_OG = {
  mode:"og", produkt:"Tomaten", herkunft:"Deutschland",
  anzeigeTyp:"wiege", wiegeNr:"3", pePreis:"", peEinheit:"kg",
  preis:"1.99", showBarcode:false, artikelNr:"",
};

// ─────────────────────────────────────────────────────────────
//  DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const T = {
  bg0:    "#07090f",
  bg1:    "#0c1018",
  bg2:    "#111620",
  bg3:    "#161d2c",
  bg4:    "#1c2538",
  b1:     "#1a2236",
  b2:     "#223049",
  b3:     "#2d4060",
  t1:     "#d6dff0",
  t2:     "#5a6a88",
  t3:     "#2e3d58",
  gold:   "#c49a28",
  goldBg: "rgba(196,154,40,0.07)",
  goldBd: "rgba(196,154,40,0.22)",
  green:  "#3a9060",
  greenBg:"rgba(58,144,96,0.08)",
  greenBd:"rgba(58,144,96,0.25)",
  amber:  "#c46a28",
  amberBg:"rgba(196,106,40,0.08)",
  amberBd:"rgba(196,106,40,0.25)",
  red:    "#9b3030",
  redBg:  "rgba(155,48,48,0.08)",
  redBd:  "rgba(155,48,48,0.28)",
  radius: { sm:4, md:6, lg:8, xl:10 },
  font:   "'Syne', sans-serif",
};

// ─────────────────────────────────────────────────────────────
//  SVG ICONS  (no emojis anywhere)
// ─────────────────────────────────────────────────────────────
const Icon = {
  print: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  settings: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  upload: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  trash: (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  refresh: (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  close: (s=11) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  lock: (s=11) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  check: (s=11) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  tag: (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
};

// ─────────────────────────────────────────────────────────────
//  FONT LOADER
// ─────────────────────────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    if (document.getElementById("plaka-gf")) return;
    const fams = FONT_OPTIONS.filter(f=>f.gf).map(f=>f.gf).join("&family=");
    const l = document.createElement("link");
    l.id="plaka-gf"; l.rel="stylesheet";
    l.href=`https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=${fams}&display=swap`;
    document.head.appendChild(l);
  }, []);
}

// ─────────────────────────────────────────────────────────────
//  SETTINGS HOOK
// ─────────────────────────────────────────────────────────────
function useSettings() {
  const [s, setRaw] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(STORAGE_KEY); if (r?.value) setRaw(p=>({...DEFAULT_SETTINGS,...p,...JSON.parse(r.value)})); }
      catch(_) {}
      setLoaded(true);
    })();
  }, []);
  const set = useCallback(upd => {
    setRaw(prev => {
      const next = typeof upd==="function" ? upd(prev) : {...prev,...upd};
      (async()=>{ try { await window.storage.set(STORAGE_KEY,JSON.stringify(next)); } catch(_){} })();
      return next;
    });
  }, []);
  return [s, set, loaded];
}

// ─────────────────────────────────────────────────────────────
//  VORDRUCK HOOK
// ─────────────────────────────────────────────────────────────
function useVordrucke() {
  const [imgs, setImgs] = useState({ ap:null, np:null });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      const loaded = { ap:null, np:null };
      for (const t of ["ap","np"]) {
        try { const r = await window.storage.get(VD_KEY[t]); if (r?.value) loaded[t]=r.value; } catch(_) {}
      }
      setImgs(loaded); setReady(true);
    })();
  }, []);
  const save = useCallback(async (type, file) => {
    if (file.size > 4.5*1024*1024) { alert("Datei zu groß (max. 4,5 MB)."); return; }
    return new Promise((res,rej) => {
      const reader = new FileReader();
      reader.onload = async e => {
        const b64 = e.target.result;
        try { await window.storage.set(VD_KEY[type],b64); setImgs(prev=>({...prev,[type]:b64})); res(b64); }
        catch(err) { rej(err); }
      };
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }, []);
  const remove = useCallback(async type => {
    try { await window.storage.delete(VD_KEY[type]); } catch(_) {}
    setImgs(prev=>({...prev,[type]:null}));
  }, []);
  return [imgs, save, remove, ready];
}

// ─────────────────────────────────────────────────────────────
//  CODE 39 BARCODE ENGINE
// ─────────────────────────────────────────────────────────────
const C39 = {
  "0":"101001101101","1":"110100101011","2":"101100101011","3":"110110010101",
  "4":"101001101011","5":"110100110101","6":"101100110101","7":"101001011011",
  "8":"110100101101","9":"101100101101","A":"110101001011","B":"101101001011",
  "C":"110110100101","D":"101011001011","E":"110101100101","F":"101101100101",
  "G":"101010011011","H":"110101001101","I":"101101001101","J":"101011001101",
  "K":"110101010011","L":"101101010011","M":"110110101001","N":"101011010011",
  "O":"110101101001","P":"101101101001","Q":"101010110011","R":"110101011001",
  "S":"101101011001","T":"101011011001","U":"110010101011","V":"100110101011",
  "W":"110011010101","X":"100101101011","Y":"110010110101","Z":"100110110101",
  "-":"100101011011",".":"110010101101"," ":"100110101101","$":"100100100101",
  "/":"100100101001","+":"100101001001","%":"101001001001","*":"100101101101",
};
function parseC39(p) {
  const els=[]; let i=0,isBar=true;
  while(i<p.length){
    if(isBar){ if(i+1<p.length&&p[i]==='1'&&p[i+1]==='1'){els.push({bar:true,w:3});i+=2;}else{els.push({bar:true,w:1});i++;} }
    else{ if(i+1<p.length&&p[i]==='0'&&p[i+1]==='0'){els.push({bar:false,w:3});i+=2;}else{els.push({bar:false,w:1});i++;} }
    isBar=!isBar;
  }
  return els;
}
function buildC39(text) {
  const clean=text.toUpperCase().replace(/[^0-9A-Z\-\. \$\/\+\%]/g,'');
  const input='*'+clean+'*'; const all=[];
  for(let ci=0;ci<input.length;ci++){
    const ch=input[ci]; if(!C39[ch]) continue;
    all.push(...parseC39(C39[ch]));
    if(ci<input.length-1) all.push({bar:false,w:1});
  }
  return all;
}
function renderC39(text,{barHeight=70,quietZone=10}={}) {
  if(!text) return null;
  const els=buildC39(text); if(!els.length) return null;
  const units=els.reduce((s,e)=>s+e.w,0);
  const unit=Math.max(1,Math.min(3,Math.floor((POSTER_W-100)/(units+quietZone*2))));
  const totalW=(units+quietZone*2)*unit;
  let x=quietZone*unit,rects='';
  for(const el of els){ const w=el.w*unit; if(el.bar) rects+=`<rect x="${x}" y="0" width="${w}" height="${barHeight}" fill="#000"/>`; x+=w; }
  return { svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${barHeight}" viewBox="0 0 ${totalW} ${barHeight}">${rects}</svg>`, width:totalW, height:barHeight };
}

// ─────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────
const toNum      = s => parseFloat(String(s).replace(",","."))||0;
const fmtDE      = (n,d=2) => isNaN(n)?"0":n.toFixed(d).replace(".",",");
const getFontCss = id => FONT_OPTIONS.find(f=>f.id===id)?.css??FONT_OPTIONS[0].css;
const splitPrice = s => { const n=parseFloat(String(s).replace(",",".")); if(isNaN(n)) return{int:"–",dec:"–"}; const[i,d="00"]=n.toFixed(2).split("."); return{int:i,dec:d}; };
function buildLadenData(form) {
  const menge=Math.max(1,Math.round(toNum(form.menge))), gr=toNum(form.produktGroesse), pr=toNum(form.preis);
  const gebindeBox=`Je ${menge}\u00D7${form.gebinde}`;
  const ppe=(menge*gr>0&&pr>0)?`${fmtDE(pr/(menge*gr))}€/${form.angabe}`:"";
  return{gebindeBox,ppe};
}
function buildOGData(form) {
  if(form.anzeigeTyp==="wiege") return{infoBox:`Waage Nr.\u202F${form.wiegeNr||"–"}`};
  const b=toNum(form.pePreis);
  return{infoBox:b>0?`${fmtDE(b)}€\u202F/\u202F${form.peEinheit}`:`–\u202F/\u202F${form.peEinheit}`};
}

// ─────────────────────────────────────────────────────────────
//  PLACEHOLDER BACKGROUND
// ─────────────────────────────────────────────────────────────
function PlaceholderBg() {
  return(
    <div style={{position:"absolute",inset:0,background:"#fff"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:58,background:"linear-gradient(90deg,#c8001a,#a00015)",display:"flex",alignItems:"center",justifyContent:"center",gap:16}}>
        <div style={{width:28,height:28,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,.45)"}}/>
        <span style={{color:"rgba(255,255,255,.45)",fontSize:20,fontWeight:800,letterSpacing:8,fontFamily:"'Syne',sans-serif"}}>MEIN MARKT</span>
      </div>
      <div style={{position:"absolute",top:58,left:0,right:0,height:2,background:"rgba(200,0,26,.1)"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:44,background:"linear-gradient(90deg,#c8001a,#a00015)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{color:"rgba(255,255,255,.35)",fontSize:11,letterSpacing:3,fontWeight:600,fontFamily:"'Syne',sans-serif"}}>TÄGLICH FRISCH · TÄGLICH GUT · WWW.MEIN-MARKT.DE</span>
      </div>
      <div style={{position:"absolute",bottom:44,left:0,right:0,height:2,background:"rgba(200,0,26,.1)"}}/>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",pointerEvents:"none"}}>
        <span style={{fontSize:88,fontWeight:900,color:"#000",opacity:.022,transform:"rotate(-28deg)",letterSpacing:14,userSelect:"none",fontFamily:"'Syne',sans-serif"}}>VORDRUCK</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  POSTER
// ─────────────────────────────────────────────────────────────
function PosterView({form,bgImage,settings,scale=1}) {
  const FONT=getFontCss(settings.posterFont);
  const spTop=settings.spacingTop, spBottom=settings.spacingBottom;
  const {int,dec}=splitPrice(form.preis);
  const showBC=form.showBarcode&&form.artikelNr;
  const bcBottom=spBottom+156+28;
  return(
    <div style={{width:POSTER_W,height:POSTER_H,position:"relative",overflow:"hidden",transformOrigin:"top left",transform:`scale(${scale})`,flexShrink:0,boxShadow:scale<1?"0 12px 48px rgba(0,0,0,.5),0 2px 8px rgba(0,0,0,.3)":"none",background:"#fff"}}>
      {bgImage?<img src={bgImage} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>:<PlaceholderBg/>}
      {form.mode==="laden"
        ?<LadenContent form={form} FONT={FONT} spTop={spTop} spBottom={spBottom} showBC={showBC} bcBottom={bcBottom}/>
        :<OGContent    form={form} FONT={FONT} spTop={spTop} spBottom={spBottom} showBC={showBC} bcBottom={bcBottom}/>
      }
      {showBC&&(
        <div style={{position:"absolute",bottom:bcBottom,left:0,right:0,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <div dangerouslySetInnerHTML={{__html:(renderC39(form.artikelNr,{barHeight:68,quietZone:8})?.svg||"")}}/>
          <div style={{fontFamily:FONT,fontSize:26,fontWeight:400,color:"#222",letterSpacing:3}}>
            {form.artikelNr.toUpperCase().replace(/[^0-9A-Z\-\. \$\/\+\%]/g,'')}
          </div>
        </div>
      )}
      {form.preis&&(
        <div style={{position:"absolute",bottom:spBottom,left:0,right:0,display:"flex",justifyContent:"center",alignItems:"flex-end",fontFamily:FONT,fontWeight:900,color:"#0f0f0f",lineHeight:1}}>
          <span style={{fontSize:158}}>{int},</span>
          <span style={{fontSize:98,marginBottom:18,letterSpacing:1}}>{dec}€</span>
        </div>
      )}
    </div>
  );
}
function LadenContent({form,FONT,spTop,spBottom,showBC,bcBottom}) {
  const{gebindeBox,ppe}=buildLadenData(form);
  const hasMW=form.mehrwegStatus==="mehrweg", hasEW=form.mehrwegStatus==="einweg";
  const cb=showBC?bcBottom+68+24:spBottom+170;
  return(
    <div style={{position:"absolute",top:72,left:0,right:0,bottom:cb,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",paddingTop:spTop,paddingLeft:24,paddingRight:24,overflow:"hidden"}}>
      {form.hersteller&&<div style={{fontFamily:FONT,fontSize:102,fontWeight:900,lineHeight:.95,color:"#0f0f0f",letterSpacing:-1}}>{form.hersteller}</div>}
      {form.produkt&&   <div style={{fontFamily:FONT,fontSize:86, fontWeight:900,lineHeight:1.0,color:"#0f0f0f",letterSpacing:-.5,marginTop:2}}>{form.produkt}</div>}
      {form.info&&      <div style={{fontFamily:FONT,fontSize:34, fontWeight:400,color:"#555",marginTop:18,lineHeight:1.2}}>{form.info}</div>}
      <div style={{marginTop:form.info?34:48,background:"#b2b2b2",padding:"12px 48px",fontFamily:FONT,fontSize:43,fontWeight:700,color:"#0f0f0f",letterSpacing:.5}}>{gebindeBox}</div>
      {ppe&&<div style={{fontFamily:FONT,fontSize:43,fontWeight:400,color:"#1a1a1a",marginTop:26}}>{ppe}</div>}
      {(hasMW||hasEW)&&<div style={{fontFamily:FONT,fontSize:46,fontWeight:400,color:"#333",marginTop:ppe?16:26,letterSpacing:6}}>{hasMW?"MEHRWEG":"EINWEG"}</div>}
      {form.pfand&&<div style={{fontFamily:FONT,fontSize:34,fontWeight:400,color:"#555",marginTop:14}}>zzgl. {form.pfand} Pfand</div>}
    </div>
  );
}
function OGContent({form,FONT,spTop,spBottom,showBC,bcBottom}) {
  const{infoBox}=buildOGData(form);
  const cb=showBC?bcBottom+68+24:spBottom+170;
  return(
    <div style={{position:"absolute",top:72,left:0,right:0,bottom:cb,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",paddingTop:spTop,paddingLeft:24,paddingRight:24,overflow:"hidden"}}>
      {form.produkt&&  <div style={{fontFamily:FONT,fontSize:114,fontWeight:900,lineHeight:.92,color:"#0f0f0f",letterSpacing:-1}}>{form.produkt}</div>}
      {form.herkunft&& <div style={{fontFamily:FONT,fontSize:42, fontWeight:400,color:"#444",marginTop:22,letterSpacing:2}}>{form.herkunft}</div>}
      <div style={{marginTop:form.herkunft?44:60,background:"#b2b2b2",padding:"12px 48px",fontFamily:FONT,fontSize:46,fontWeight:700,color:"#0f0f0f"}}>{infoBox}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PRINT
// ─────────────────────────────────────────────────────────────
function doPrint(form,bgImage,settings) {
  const FONT=getFontCss(settings.posterFont), spTop=settings.spacingTop, spBottom=settings.spacingBottom;
  const{int,dec}=splitPrice(form.preis);
  const bgStyle=bgImage?`background-image:url('${bgImage}');background-size:cover;background-position:center;`:"";
  const fOpt=FONT_OPTIONS.find(f=>f.id===settings.posterFont);
  const fontImport=fOpt?.gf?`@import url('https://fonts.googleapis.com/css2?family=${fOpt.gf}&display=swap');`:"";
  const showBC=form.showBarcode&&form.artikelNr;
  const bcBottom=spBottom+156+28, contentBottom=showBC?bcBottom+68+24:spBottom+170;
  const placeholderHTML=bgImage?"":
    `<div id="bg"><div class="ts"><div class="ci"></div><span>MEIN MARKT</span></div><div class="bs"><span>TÄGLICH FRISCH · TÄGLICH GUT · WWW.MEIN-MARKT.DE</span></div><div class="wm">VORDRUCK</div></div>`;
  let bcBlock="";
  if(showBC){const bc=renderC39(form.artikelNr,{barHeight:68,quietZone:8}); if(bc){const clean=form.artikelNr.toUpperCase().replace(/[^0-9A-Z\-\. \$\/\+\%]/g,''); bcBlock=`<div id="bc">${bc.svg}<div class="bc-nr">${clean}</div></div>`;}}
  let contentHTML="";
  if(form.mode==="laden"){
    const{gebindeBox,ppe}=buildLadenData(form); const hasMW=form.mehrwegStatus==="mehrweg",hasEW=form.mehrwegStatus==="einweg";
    contentHTML=`${form.hersteller?`<div class="h1">${form.hersteller}</div>`:""}${form.produkt?`<div class="h2">${form.produkt}</div>`:""}${form.info?`<div class="info">${form.info}</div>`:""}
    <div class="gbox">${gebindeBox}</div>${ppe?`<div class="ppe">${ppe}</div>`:""}${hasMW||hasEW?`<div class="mw">${hasMW?"MEHRWEG":"EINWEG"}</div>`:""}${form.pfand?`<div class="pf">zzgl. ${form.pfand} Pfand</div>`:""}`;
  } else {
    const{infoBox}=buildOGData(form);
    contentHTML=`${form.produkt?`<div class="og1">${form.produkt}</div>`:""}${form.herkunft?`<div class="og2">${form.herkunft}</div>`:""}${`<div class="gbox og3">${infoBox}</div>`}`;
  }
  const html=`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Preisplakat</title>
<style>${fontImport}
*{margin:0;padding:0;box-sizing:border-box;}html,body{width:210mm;height:297mm;overflow:hidden;}
body{position:relative;background:#fff;${bgStyle}font-family:${FONT};}
#bg{position:absolute;inset:0;background:#fff;}.ts{position:absolute;top:0;left:0;right:0;height:58px;background:linear-gradient(90deg,#c8001a,#a00015);display:flex;align-items:center;justify-content:center;gap:16px;}
.ci{width:28px;height:28px;border-radius:50%;border:2.5px solid rgba(255,255,255,.45);}.ts span{color:rgba(255,255,255,.45);font-size:20px;font-weight:800;letter-spacing:8px;}
.bs{position:absolute;bottom:0;left:0;right:0;height:44px;background:linear-gradient(90deg,#c8001a,#a00015);display:flex;align-items:center;justify-content:center;}
.bs span{color:rgba(255,255,255,.35);font-size:11px;letter-spacing:3px;font-weight:600;}.wm{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:88px;font-weight:900;color:#000;opacity:.022;transform:rotate(-28deg);letter-spacing:14px;}
#ct{position:absolute;top:72px;left:0;right:0;bottom:${contentBottom}px;display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:${spTop}px;padding-left:24px;padding-right:24px;overflow:hidden;}
.h1{font-size:102px;font-weight:900;line-height:.95;color:#0f0f0f;letter-spacing:-1px;}.h2{font-size:86px;font-weight:900;line-height:1;color:#0f0f0f;margin-top:2px;}
.og1{font-size:114px;font-weight:900;line-height:.92;color:#0f0f0f;letter-spacing:-1px;}.og2{font-size:42px;font-weight:400;color:#444;margin-top:22px;letter-spacing:2px;}
.info{font-size:34px;font-weight:400;color:#555;margin-top:18px;}.gbox{margin-top:48px;background:#b2b2b2;padding:12px 48px;font-size:43px;font-weight:700;color:#0f0f0f;}
.og3{margin-top:44px;font-size:46px;}.ppe{font-size:43px;font-weight:400;color:#1a1a1a;margin-top:26px;}.mw{font-size:46px;font-weight:400;color:#333;margin-top:16px;letter-spacing:6px;}
.pf{font-size:34px;font-weight:400;color:#555;margin-top:14px;}
#bc{position:absolute;bottom:${bcBottom}px;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:8px;}.bc-nr{font-size:26px;font-weight:400;color:#222;letter-spacing:3px;}
.price{position:absolute;bottom:${spBottom}px;left:0;right:0;display:flex;justify-content:center;align-items:flex-end;font-weight:900;color:#0f0f0f;line-height:1;}
.pi{font-size:158px;}.pd{font-size:98px;margin-bottom:18px;letter-spacing:1px;}
@media print{html,body{width:210mm;height:297mm;}}
</style></head><body>
${placeholderHTML}<div id="ct">${contentHTML}</div>${bcBlock}
${form.preis?`<div class="price"><span class="pi">${int},</span><span class="pd">${dec}€</span></div>`:""}
</body></html>`;
  const win=window.open("","_blank");
  if(!win){alert("Popup blockiert.");return;}
  win.document.write(html); win.document.close();
  win.onload=()=>setTimeout(()=>win.print(),800);
}

// ─────────────────────────────────────────────────────────────
//  UI PRIMITIVES
// ─────────────────────────────────────────────────────────────
const F = T.font;
const inputBase = { width:"100%",background:T.bg1,border:`1.5px solid ${T.b2}`,borderRadius:T.radius.md,padding:"9px 12px",color:T.t1,fontSize:13,fontFamily:F,outline:"none",boxSizing:"border-box",transition:"border-color .15s,background .15s" };
const selectBase = { ...inputBase, cursor:"pointer", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a5878'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 11px center" };

function Field({label,value,onChange,placeholder="",type="text",hint,style={}}) {
  const [f,setF]=useState(false);
  return(
    <div>
      <label style={{display:"block",color:T.t2,fontSize:10,fontWeight:600,letterSpacing:1,marginBottom:5,textTransform:"uppercase",fontFamily:F}}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{...inputBase,borderColor:f?T.gold:T.b2,background:f?T.bg2:T.bg1,...style}}/>
      {hint&&<div style={{color:T.t3,fontSize:10,marginTop:4,fontFamily:F}}>{hint}</div>}
    </div>
  );
}
function SelField({label,value,onChange,options}) {
  return(
    <div style={{flex:1}}>
      <label style={{display:"block",color:T.t2,fontSize:10,fontWeight:600,letterSpacing:1,marginBottom:5,textTransform:"uppercase",fontFamily:F}}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={selectBase}>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Toggle({label,checked,onChange,desc}) {
  return(
    <div onClick={()=>onChange(!checked)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:T.radius.lg,cursor:"pointer",background:checked?T.goldBg:T.bg2,border:`1px solid ${checked?T.goldBd:T.b1}`,transition:"all .15s",userSelect:"none"}}>
      <div>
        <div style={{color:T.t1,fontSize:13,fontWeight:600,fontFamily:F}}>{label}</div>
        {desc&&<div style={{color:T.t2,fontSize:11,marginTop:2,fontFamily:F}}>{desc}</div>}
      </div>
      <div style={{width:38,height:21,borderRadius:11,background:checked?T.gold:T.b3,border:`1px solid ${checked?T.gold:T.b2}`,position:"relative",flexShrink:0,transition:"all .2s",marginLeft:12}}>
        <div style={{position:"absolute",top:2,left:checked?19:2,width:15,height:15,borderRadius:"50%",background:"#fff",transition:"left .18s",boxShadow:"0 1px 4px rgba(0,0,0,.4)"}}/>
      </div>
    </div>
  );
}
function SectionTitle({children}) {
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
      <div style={{width:2,height:12,background:T.gold,borderRadius:1,flexShrink:0}}/>
      <span style={{color:T.t2,fontSize:9,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",fontFamily:F}}>{children}</span>
    </div>
  );
}
function Section({title,children,last}) {
  return(
    <div style={{marginBottom:last?0:24,paddingBottom:last?0:24,borderBottom:last?`none`:`1px solid ${T.b1}`}}>
      {title&&<SectionTitle>{title}</SectionTitle>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>{children}</div>
    </div>
  );
}
function Row({children}) { return <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>{children}</div>; }
function CalcBadge({label,value}) {
  if(!value) return null;
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 12px",borderRadius:T.radius.md,background:T.goldBg,border:`1px solid ${T.goldBd}`}}>
      <span style={{color:T.t2,fontSize:11,fontFamily:F}}>{label}</span>
      <span style={{color:T.gold,fontSize:13,fontWeight:700,fontFamily:F}}>{value}</span>
    </div>
  );
}
function InternalBox({children}) {
  return(
    <div style={{padding:"12px",borderRadius:T.radius.lg,background:T.bg0,border:`1px solid ${T.b1}`}}>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8}}>
        {Icon.lock(10)}
        <span style={{color:T.t3,fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",fontFamily:F}}>Interne Berechnung — nicht auf Plakat</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MEHRWEG PICKER
// ─────────────────────────────────────────────────────────────
function MehrwegPicker({value,onChange}) {
  const opts=[{id:"mehrweg",label:"Mehrweg",c:T.green,bg:T.greenBg,bd:T.greenBd},{id:"einweg",label:"Einweg",c:T.amber,bg:T.amberBg,bd:T.amberBd},{id:"",label:"Keine Angabe",c:T.t3,bg:"transparent",bd:T.b1}];
  return(
    <div>
      <label style={{display:"block",color:T.t2,fontSize:10,fontWeight:600,letterSpacing:1,marginBottom:6,textTransform:"uppercase",fontFamily:F}}>Pfand-Kennzeichnung</label>
      <div style={{display:"flex",gap:5}}>
        {opts.map(o=>(
          <div key={o.id} onClick={()=>onChange(o.id)} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRadius:T.radius.md,cursor:"pointer",border:`1.5px solid ${value===o.id?o.bd:T.b1}`,background:value===o.id?o.bg:T.bg2,color:value===o.id?o.c:T.t3,fontSize:10,fontWeight:700,letterSpacing:.5,fontFamily:F,transition:"all .15s",userSelect:"none"}}>{o.label}</div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MODE TABS
// ─────────────────────────────────────────────────────────────
function ModeTabs({value,onChange}) {
  return(
    <div style={{display:"flex",gap:0,marginBottom:24,borderRadius:T.radius.lg,overflow:"hidden",border:`1px solid ${T.b2}`,flexShrink:0}}>
      {[{id:"laden",label:"Laden"},{id:"og",label:"Obst & Gemüse"}].map((t,i)=>(
        <div key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,padding:"9px 8px",textAlign:"center",cursor:"pointer",background:value===t.id?T.bg4:"transparent",color:value===t.id?T.t1:T.t2,fontFamily:F,fontSize:11,fontWeight:700,letterSpacing:1,transition:"all .2s",borderRight:i===0?`1px solid ${T.b2}`:"none",userSelect:"none"}}>
          {t.label}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  OG ANZEIGE TYPE PICKER
// ─────────────────────────────────────────────────────────────
function AnzeigePicker({value,onChange}) {
  return(
    <div>
      <label style={{display:"block",color:T.t2,fontSize:10,fontWeight:600,letterSpacing:1,marginBottom:6,textTransform:"uppercase",fontFamily:F}}>Art der Anzeige</label>
      <div style={{display:"flex",gap:5}}>
        {[{id:"wiege",label:"Waage Nr."},{id:"preiseinheit",label:"Preis / Einheit"}].map(o=>(
          <div key={o.id} onClick={()=>onChange(o.id)} style={{flex:1,textAlign:"center",padding:"9px 6px",borderRadius:T.radius.md,cursor:"pointer",border:`1.5px solid ${value===o.id?T.goldBd:T.b1}`,background:value===o.id?T.goldBg:T.bg2,color:value===o.id?T.gold:T.t2,fontSize:11,fontWeight:600,fontFamily:F,transition:"all .15s",userSelect:"none"}}>{o.label}</div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  BARCODE SECTION
// ─────────────────────────────────────────────────────────────
function BarcodePreviewMini({artikelNr}) {
  if(!artikelNr) return null;
  const result=renderC39(artikelNr,{barHeight:36,quietZone:6});
  if(!result) return null;
  return(
    <div style={{padding:"10px 12px",borderRadius:T.radius.md,background:T.bg0,border:`1px solid ${T.b1}`,display:"flex",justifyContent:"center",alignItems:"center",overflow:"hidden"}}>
      <div dangerouslySetInnerHTML={{__html:result.svg}} style={{filter:"invert(0.75) sepia(0.2)"}}/>
    </div>
  );
}
function BarcodeSection({form,up}) {
  return(
    <Section title="Barcode">
      <Toggle label="Barcode auf Plakat anzeigen" desc="Code 39 — positioniert über dem Preis" checked={form.showBarcode} onChange={v=>up("showBarcode",v)}/>
      {form.showBarcode&&<>
        <Field label="Artikel-Nr." value={form.artikelNr} onChange={v=>up("artikelNr",v)} placeholder="z.B. 12345678 oder ABC-001" hint="Erlaubte Zeichen: 0–9, A–Z, Bindestrich, Punkt, Leerzeichen"/>
        <BarcodePreviewMini artikelNr={form.artikelNr}/>
      </>}
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────
//  FORM PANELS
// ─────────────────────────────────────────────────────────────
function LadenForm({form,up}) {
  const{ppe}=buildLadenData(form);
  return(<>
    <Section title="Produkt">
      <Field label="Hersteller"      value={form.hersteller} onChange={v=>up("hersteller",v)} placeholder="z.B. Coca-Cola"/>
      <Field label="Produkt"         value={form.produkt}    onChange={v=>up("produkt",v)}    placeholder="z.B. Classic"/>
      <Field label="Info (optional)" value={form.info}       onChange={v=>up("info",v)}       placeholder="z.B. Verschiedene Sorten"/>
    </Section>
    <Section title="Je Gebinde">
      <Row><Field label="Anzahl" value={form.menge} onChange={v=>up("menge",v)} placeholder="24" type="number" style={{flex:1}}/><SelField label="Einheit" value={form.gebinde} onChange={v=>up("gebinde",v)} options={GEBINDE_OPTS}/></Row>
      <InternalBox>
        <Row>
          <Field label="Inhalt pro Einheit" value={form.produktGroesse} onChange={v=>up("produktGroesse",v)} placeholder="0.33" style={{flex:1.5}}/>
          <SelField label="Einheit" value={form.angabe} onChange={v=>up("angabe",v)} options={ANGABE_OPTS}/>
        </Row>
      </InternalBox>
      <CalcBadge label={`Berechnet: €/${form.angabe}`} value={ppe}/>
    </Section>
    <Section title="Konditionen">
      <MehrwegPicker value={form.mehrwegStatus} onChange={v=>up("mehrwegStatus",v)}/>
      <Field label="Pfand (optional)" value={form.pfand} onChange={v=>up("pfand",v)} placeholder="z.B. 0,25€  /  3,30€"/>
    </Section>
    <Section title="Preis">
      <Field label="Verkaufspreis (€)" value={form.preis} onChange={v=>up("preis",v)} placeholder="0,00"/>
    </Section>
    <BarcodeSection form={form} up={up}/>
  </>);
}
function OGForm({form,up}) {
  return(<>
    <Section title="Produkt">
      <Field label="Produkt"  value={form.produkt}  onChange={v=>up("produkt",v)}  placeholder="z.B. Tomaten"/>
      <Field label="Herkunft" value={form.herkunft} onChange={v=>up("herkunft",v)} placeholder="z.B. Deutschland"/>
    </Section>
    <Section title="Anzeige im Kasten">
      <AnzeigePicker value={form.anzeigeTyp} onChange={v=>up("anzeigeTyp",v)}/>
      {form.anzeigeTyp==="wiege"
        ?<Field label="Waage Nummer" value={form.wiegeNr} onChange={v=>up("wiegeNr",v)} placeholder="z.B. 3" type="number"/>
        :<Row><Field label="Preis" value={form.pePreis} onChange={v=>up("pePreis",v)} placeholder="1,99" style={{flex:1.5}}/><SelField label="Einheit" value={form.peEinheit} onChange={v=>up("peEinheit",v)} options={OG_EINH_OPTS}/></Row>
      }
    </Section>
    <Section title="Preis">
      <Field label="Verkaufspreis (€)" value={form.preis} onChange={v=>up("preis",v)} placeholder="0,00"/>
    </Section>
    <BarcodeSection form={form} up={up}/>
  </>);
}

// ─────────────────────────────────────────────────────────────
//  VORDRUCK SLOT
// ─────────────────────────────────────────────────────────────
function VordruckSlot({type,label,accentColor,accentBg,accentBd,images,saveVD,removeVD,active,setActive}) {
  const fileRef=useRef(null);
  const [saving,setSaving]=useState(false);
  const hasImg=!!images[type], isActive=active===type;
  const handleFile=async e=>{
    const f=e.target.files?.[0]; if(!f) return;
    setSaving(true);
    try{await saveVD(type,f); setActive(type);}
    catch(_){alert("Speichern fehlgeschlagen.");}
    finally{setSaving(false); e.target.value="";}
  };
  return(
    <div style={{borderRadius:T.radius.xl,border:`1px solid ${isActive?accentBd:T.b1}`,background:isActive?accentBg:T.bg2,overflow:"hidden",transition:"all .2s"}}>
      <div style={{padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${isActive?accentBd:T.b1}`}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:hasImg?accentColor:T.b3,transition:"background .2s"}}/>
          <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:isActive?accentColor:T.t2,letterSpacing:.5}}>
            {type.toUpperCase()} — {label}
          </span>
        </div>
        {hasImg&&!isActive&&(
          <button onClick={()=>setActive(type)} style={{background:"transparent",border:`1px solid ${accentBd}`,borderRadius:T.radius.sm,padding:"3px 10px",color:accentColor,cursor:"pointer",fontSize:9,fontWeight:700,fontFamily:F,letterSpacing:.5}}>Aktivieren</button>
        )}
        {hasImg&&isActive&&(
          <span style={{display:"flex",alignItems:"center",gap:4,color:accentColor,fontSize:9,fontWeight:700,fontFamily:F}}>
            {Icon.check(9)} Aktiv
          </span>
        )}
      </div>
      {hasImg?(
        <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
          <img src={images[type]} alt={label} style={{width:60,height:85,objectFit:"cover",borderRadius:T.radius.md,border:`1px solid ${T.b2}`,flexShrink:0}}/>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
            <div style={{color:T.t2,fontSize:10,fontFamily:F,lineHeight:1.5}}>{type.toUpperCase()}.png gespeichert</div>
            <button onClick={()=>fileRef.current?.click()} style={{display:"flex",alignItems:"center",gap:5,background:"transparent",border:`1px solid ${T.b2}`,borderRadius:T.radius.sm,padding:"5px 10px",color:T.t2,cursor:"pointer",fontSize:10,fontFamily:F,fontWeight:600}}>
              {Icon.refresh(12)} Ersetzen
            </button>
            <button onClick={()=>removeVD(type)} style={{display:"flex",alignItems:"center",gap:5,background:T.redBg,border:`1px solid ${T.redBd}`,borderRadius:T.radius.sm,padding:"5px 10px",color:T.red,cursor:"pointer",fontSize:10,fontFamily:F,fontWeight:600}}>
              {Icon.trash(12)} Entfernen
            </button>
          </div>
        </div>
      ):(
        <div onClick={()=>fileRef.current?.click()} style={{margin:"12px 14px",padding:"20px",borderRadius:T.radius.lg,border:`1px dashed ${T.b2}`,display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",transition:"all .15s",userSelect:"none"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=accentColor; e.currentTarget.style.background=accentBg;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.b2; e.currentTarget.style.background="transparent";}}>
          {Icon.upload(18)}
          <div style={{color:T.t2,fontSize:11,fontFamily:F,fontWeight:600}}>{saving?"Wird gespeichert …":`${type.toUpperCase()}.png hochladen`}</div>
          <div style={{color:T.t3,fontSize:9,fontFamily:F}}>PNG, max. 4,5 MB</div>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/png,image/*" onChange={handleFile} style={{display:"none"}}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SETTINGS DRAWER
// ─────────────────────────────────────────────────────────────
function Slider({label,value,min,max,unit,onChange}) {
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <label style={{color:T.t2,fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase",fontFamily:F}}>{label}</label>
        <span style={{color:T.gold,fontSize:12,fontWeight:700,fontFamily:F,background:T.goldBg,padding:"2px 8px",borderRadius:T.radius.sm,border:`1px solid ${T.goldBd}`}}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",accentColor:T.gold,cursor:"pointer",height:3}}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        <span style={{color:T.t3,fontSize:9,fontFamily:F}}>{min}{unit}</span>
        <span style={{color:T.t3,fontSize:9,fontFamily:F}}>{max}{unit}</span>
      </div>
    </div>
  );
}
function FontCard({f,active,onSelect}) {
  return(
    <div onClick={()=>onSelect(f.id)} style={{padding:"11px 14px",borderRadius:T.radius.lg,cursor:"pointer",border:`1px solid ${active?T.goldBd:T.b1}`,background:active?T.goldBg:T.bg2,transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"space-between",userSelect:"none"}}>
      <div>
        <div style={{fontFamily:f.css,fontSize:26,fontWeight:900,color:active?T.gold:T.t1,lineHeight:1}}>45,99€</div>
        <div style={{color:T.t2,fontSize:10,marginTop:3,fontFamily:F}}>{f.label}</div>
      </div>
      {active&&<div style={{width:16,height:16,borderRadius:"50%",background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Icon.check(9)}</div>}
    </div>
  );
}
function SettingsDrawer({open,onClose,settings,setSettings,images,saveVD,removeVD}) {
  const upS=(k,v)=>setSettings(p=>({...p,[k]:v}));
  const vdProps={images,saveVD,removeVD,active:settings.activeVordruck,setActive:v=>upS("activeVordruck",v)};
  return(<>
    {open&&<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:100,backdropFilter:"blur(3px)"}}/>}
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:340,background:T.bg1,borderLeft:`1px solid ${T.b1}`,zIndex:101,transform:open?"translateX(0)":"translateX(100%)",transition:"transform .28s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column",boxShadow:open?"-16px 0 48px rgba(0,0,0,.6)":"none"}}>
      {/* Header */}
      <div style={{padding:"18px 20px",borderBottom:`1px solid ${T.b1}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div>
          <div style={{color:T.t1,fontWeight:800,fontSize:14,letterSpacing:2,fontFamily:F}}>EINSTELLUNGEN</div>
          <div style={{color:T.t3,fontSize:10,marginTop:2,fontFamily:F}}>Automatisch gespeichert</div>
        </div>
        <button onClick={onClose} style={{background:T.bg3,border:`1px solid ${T.b1}`,borderRadius:T.radius.md,width:30,height:30,color:T.t2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.b3}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.b1}>
          {Icon.close(10)}
        </button>
      </div>
      {/* Body */}
      <div style={{flex:1,overflowY:"auto",padding:"20px"}}>
        {/* Vordruck */}
        <div style={{marginBottom:24,paddingBottom:24,borderBottom:`1px solid ${T.b1}`}}>
          <SectionTitle>Vordruck</SectionTitle>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <VordruckSlot type="ap" label="Aktionspreis" accentColor={T.amber} accentBg={T.amberBg} accentBd={T.amberBd} {...vdProps}/>
            <VordruckSlot type="np" label="Normal Preis"  accentColor={T.green} accentBg={T.greenBg} accentBd={T.greenBd} {...vdProps}/>
          </div>
        </div>
        {/* Schriftart */}
        <div style={{marginBottom:24,paddingBottom:24,borderBottom:`1px solid ${T.b1}`}}>
          <SectionTitle>Schriftart Plakat</SectionTitle>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {FONT_OPTIONS.map(f=><FontCard key={f.id} f={f} active={settings.posterFont===f.id} onSelect={v=>upS("posterFont",v)}/>)}
          </div>
        </div>
        {/* Abstände */}
        <div style={{marginBottom:24,paddingBottom:24,borderBottom:`1px solid ${T.b1}`}}>
          <SectionTitle>Abstände</SectionTitle>
          <div style={{display:"flex",flexDirection:"column",gap:22}}>
            <Slider label="Abstand oben" value={settings.spacingTop}    min={0}  max={160} unit=" px" onChange={v=>upS("spacingTop",v)}/>
            <Slider label="Abstand unten (Preis)" value={settings.spacingBottom} min={20} max={200} unit=" px" onChange={v=>upS("spacingBottom",v)}/>
          </div>
        </div>
        {/* Reset */}
        <button onClick={()=>setSettings(DEFAULT_SETTINGS)} style={{width:"100%",background:T.redBg,border:`1px solid ${T.redBd}`,borderRadius:T.radius.md,padding:"9px",color:T.red,cursor:"pointer",fontSize:11,fontFamily:F,fontWeight:600,letterSpacing:.5,transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(155,48,48,.14)"}
          onMouseLeave={e=>e.currentTarget.style.background=T.redBg}>
          {Icon.refresh(12)} Einstellungen zurücksetzen
        </button>
        <div style={{marginTop:14,padding:"10px 12px",borderRadius:T.radius.md,background:T.bg0,border:`1px solid ${T.b1}`}}>
          <div style={{color:T.t3,fontSize:10,lineHeight:1.6,fontFamily:F}}>Alle Einstellungen und Vordrucke werden <span style={{color:T.t2}}>geräteübergreifend gespeichert</span>.</div>
        </div>
      </div>
    </div>
  </>);
}

// ─────────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────────
export default function PlakaApp() {
  useFonts();
  const [settings,setSettings,settingsLoaded] = useSettings();
  const [images,saveVD,removeVD,vdReady]      = useVordrucke();
  const [settingsOpen,setSettingsOpen] = useState(false);
  const [form,setForm] = useState(DEFAULT_LADEN);
  const previewRef = useRef(null);
  const [previewW, setPreviewW] = useState(460);
  const up = useCallback((k,v)=>setForm(f=>({...f,[k]:v})),[]);
  const switchMode = m=>setForm(m==="laden"?DEFAULT_LADEN:DEFAULT_OG);
  useEffect(()=>{
    if(!previewRef.current) return;
    const ro=new ResizeObserver(e=>setPreviewW(Math.max(200,e[0].contentRect.width-80)));
    ro.observe(previewRef.current); return()=>ro.disconnect();
  },[]);
  const scale=Math.min(1,previewW/POSTER_W);
  const activeBgImage=images[settings.activeVordruck]??null;

  if(!settingsLoaded||!vdReady) return(
    <div style={{minHeight:"100vh",background:T.bg0,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:T.t3,fontFamily:F,fontSize:12,letterSpacing:3}}>WIRD GELADEN</div>
    </div>
  );

  const av=settings.activeVordruck;
  const avColor=av==="ap"?T.amber:T.green;
  const avBg=av==="ap"?T.amberBg:T.greenBg;
  const avBd=av==="ap"?T.amberBd:T.greenBd;

  return(
    <div style={{height:"100vh",background:T.bg0,fontFamily:F,display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* ═══ HEADER ═══ */}
      <header style={{height:60,background:T.bg1,borderBottom:`1px solid ${T.b1}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",flexShrink:0}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{display:"flex",flexDirection:"column",gap:1}}>
            <div style={{color:T.gold,fontWeight:800,fontSize:17,letterSpacing:5,lineHeight:1}}>PLAKA</div>
            <div style={{color:T.t3,fontSize:8,letterSpacing:3,fontWeight:600,lineHeight:1}}>PREISPLAKAT GENERATOR</div>
          </div>
          <div style={{width:1,height:28,background:T.b2,margin:"0 4px"}}/>
          {/* Mode indicator */}
          <div style={{padding:"3px 10px",borderRadius:T.radius.sm,background:T.bg3,border:`1px solid ${T.b2}`,color:T.t2,fontSize:9,fontWeight:700,letterSpacing:1.5}}>
            {form.mode==="og"?"OBST & GEMÜSE":"LADEN"} · DIN A4
          </div>
        </div>

        {/* Right controls */}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* AP / NP toggle */}
          <div style={{display:"flex",alignItems:"center",gap:1,background:T.bg2,borderRadius:T.radius.lg,border:`1px solid ${T.b2}`,padding:3}}>
            {[{id:"ap",label:"AP",c:T.amber,bg:T.amberBg,bd:T.amberBd},{id:"np",label:"NP",c:T.green,bg:T.greenBg,bd:T.greenBd}].map(v=>{
              const isA=settings.activeVordruck===v.id, hasI=!!images[v.id];
              return(
                <button key={v.id} onClick={()=>setSettings(s=>({...s,activeVordruck:v.id}))} title={`${v.id==="ap"?"Aktionspreis":"Normalpreis"}${hasI?"":" — noch nicht hochgeladen"}`}
                  style={{position:"relative",padding:"5px 16px",borderRadius:T.radius.md,border:`1px solid ${isA?v.bd:"transparent"}`,cursor:"pointer",fontFamily:F,fontSize:11,fontWeight:800,letterSpacing:1.5,background:isA?v.bg:"transparent",color:isA?v.c:T.t3,transition:"all .15s"}}>
                  {v.label}
                  {!hasI&&<span style={{position:"absolute",top:3,right:3,width:4,height:4,borderRadius:"50%",background:T.red}}/>}
                </button>
              );
            })}
          </div>
          {/* Settings */}
          <button onClick={()=>setSettingsOpen(true)} style={{display:"flex",alignItems:"center",gap:7,background:settingsOpen?T.bg4:"transparent",border:`1px solid ${settingsOpen?T.b3:T.b1}`,borderRadius:T.radius.lg,padding:"7px 14px",color:settingsOpen?T.t1:T.t2,cursor:"pointer",fontFamily:F,fontSize:11,fontWeight:600,transition:"all .15s",letterSpacing:.5}}>
            {Icon.settings(13)} Einstellungen
          </button>
          {/* Print */}
          <button onClick={()=>doPrint(form,activeBgImage,settings)} style={{display:"flex",alignItems:"center",gap:8,background:T.gold,border:"none",borderRadius:T.radius.lg,padding:"8px 20px",color:"#0a0a0a",cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:800,letterSpacing:1,transition:"all .15s",boxShadow:`0 2px 16px rgba(196,154,40,.3)`}}
            onMouseDown={e=>e.currentTarget.style.opacity=".85"}
            onMouseUp={e=>e.currentTarget.style.opacity="1"}>
            {Icon.print(13)} Drucken
          </button>
        </div>
      </header>

      {/* ═══ BODY ═══ */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* ─── Form ─── */}
        <div style={{width:320,background:T.bg1,borderRight:`1px solid ${T.b1}`,overflowY:"auto",padding:"20px 18px",flexShrink:0}}>
          <ModeTabs value={form.mode} onChange={switchMode}/>
          {form.mode==="laden"?<LadenForm form={form} up={up}/>:<OGForm form={form} up={up}/>}
          <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${T.b1}`}}>
            <button onClick={()=>setForm(form.mode==="laden"?DEFAULT_LADEN:DEFAULT_OG)}
              style={{width:"100%",background:"transparent",border:`1px solid ${T.b1}`,borderRadius:T.radius.md,padding:"8px",color:T.t3,cursor:"pointer",fontSize:10,fontFamily:F,fontWeight:600,letterSpacing:1,transition:"all .15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.red}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.b1}>
              Formular leeren
            </button>
          </div>
        </div>

        {/* ─── Preview ─── */}
        <div ref={previewRef} style={{flex:1,overflowY:"auto",background:T.bg0,display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 40px 48px"}}>
          {/* Status bar */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22,alignSelf:"flex-start"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:T.gold,boxShadow:`0 0 8px ${T.gold}`}}/>
            <span style={{color:T.t3,fontSize:9,fontWeight:700,letterSpacing:2.5}}>LIVE VORSCHAU · DIN A4</span>
            <span style={{padding:"2px 9px",borderRadius:T.radius.sm,background:avBg,border:`1px solid ${avBd}`,color:avColor,fontSize:9,fontWeight:700,letterSpacing:.5}}>
              {av.toUpperCase()} — {av==="ap"?"Aktionspreis":"Normalpreis"}{!images[av]?" · nicht geladen":""}
            </span>
            <span style={{padding:"2px 9px",borderRadius:T.radius.sm,background:T.bg2,border:`1px solid ${T.b1}`,color:T.t3,fontSize:9,fontWeight:500}}>
              {FONT_OPTIONS.find(f=>f.id===settings.posterFont)?.label}
            </span>
          </div>

          {/* Poster */}
          <div style={{width:POSTER_W*scale,height:POSTER_H*scale,flexShrink:0}}>
            <PosterView form={form} bgImage={activeBgImage} settings={settings} scale={scale}/>
          </div>

          {/* Info */}
          <div style={{marginTop:20,padding:"10px 16px",background:T.bg1,border:`1px solid ${T.b1}`,borderRadius:T.radius.lg,maxWidth:POSTER_W*scale,width:"100%"}}>
            <div style={{color:T.t3,fontSize:10,lineHeight:1.6,textAlign:"center",fontFamily:F}}>
              Maßstabsgetreue Vorschau · <span style={{color:T.t2}}>DIN A4 (210 × 297 mm)</span> · Code 39 Barcode
            </div>
          </div>
        </div>
      </div>

      <SettingsDrawer open={settingsOpen} onClose={()=>setSettingsOpen(false)} settings={settings} setSettings={setSettings} images={images} saveVD={saveVD} removeVD={removeVD}/>

      <style>{`
        *{box-sizing:border-box;}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
        input[type=number]{-moz-appearance:textfield;}
        input[type=range]{-webkit-appearance:none;appearance:none;height:3px;border-radius:2px;background:${T.b2};outline:none;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${T.gold};cursor:pointer;box-shadow:0 0 0 3px rgba(196,154,40,.18);}
        input::placeholder,select::placeholder{color:${T.t3};}
        option{background:${T.bg1};color:${T.t1};}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${T.b2};border-radius:2px;}
        ::-webkit-scrollbar-thumb:hover{background:${T.b3};}
      `}</style>
    </div>
  );
}
