// api/admin/index.js — serves the admin dashboard
module.exports = function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>TGOSINT — Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap" onload="this.onload=null;this.rel='stylesheet'"/>
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap"/></noscript>
<style>
:root{
  --bg:#030508;--surface:#080d12;--border:#0f2a1e;
  --green:#00ff88;--cyan:#00e5ff;--dim:#1a4a32;
  --text:#c8e8d8;--muted:#3a6650;--red:#ff3355;
  --yellow:#ffcc00;--orange:#ff8800;--grid:rgba(0,255,136,0.03);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  background:var(--bg);color:var(--text);font-family:'Rajdhani',sans-serif;min-height:100vh;
  background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);
  background-size:32px 32px;
}
body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:999;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px);}

/* LOGIN */
#loginWrap{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;}
.lcard{width:100%;max-width:360px;background:var(--surface);border:1px solid var(--border);padding:36px 28px;position:relative;clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px));}
.lcard::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--green),transparent);}
.llogo{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:6px;color:var(--green);text-align:center;}
.llogo span{color:var(--cyan);}
.lsub{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:4px;color:var(--muted);text-align:center;margin-bottom:28px;margin-top:4px;}
.llbl{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--muted);display:block;margin-bottom:6px;}
.linput{width:100%;background:rgba(0,0,0,0.5);border:1px solid var(--dim);color:#fff;font-family:'Share Tech Mono',monospace;font-size:14px;letter-spacing:2px;padding:12px 14px;outline:none;transition:border-color 0.2s;margin-bottom:16px;}
.linput:focus{border-color:var(--green);}
.lbtn{width:100%;padding:14px;background:transparent;border:1px solid var(--green);color:var(--green);font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:5px;cursor:pointer;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));position:relative;overflow:hidden;transition:color 0.2s;}
.lbtn::before{content:'';position:absolute;inset:0;background:var(--green);transform:translateX(-100%);transition:transform 0.25s;z-index:0;}
.lbtn:hover::before{transform:translateX(0);}
.lbtn:hover{color:#000;}
.lbtn span{position:relative;z-index:1;}
.lerr{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--red);text-align:center;margin-top:12px;display:none;}

/* DASHBOARD */
#dash{display:none;}
header{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid var(--border);background:var(--surface);position:sticky;top:0;z-index:100;}
.hlogo{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:6px;}
.hlogo span{color:var(--cyan);}
.hbadge{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--red);border:1px solid var(--red);padding:3px 8px;}
.hbtns{display:flex;gap:8px;flex-wrap:wrap;}
.hbtn{background:none;border:1px solid var(--dim);color:var(--muted);font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:2px;padding:6px 12px;cursor:pointer;transition:all 0.2s;}
.hbtn.green:hover{border-color:var(--green);color:var(--green);}
.hbtn.red:hover{border-color:var(--red);color:var(--red);}
.main{padding:24px;max-width:1300px;margin:0 auto;}

/* Stats */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px;}
.stat{background:var(--surface);border:1px solid var(--border);padding:16px 18px;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%);}
.sv{font-family:'Bebas Neue',sans-serif;font-size:34px;letter-spacing:2px;color:var(--green);line-height:1;}
.sl{font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:3px;color:var(--muted);margin-top:4px;}

/* Section */
.sec{background:var(--surface);border:1px solid var(--border);margin-bottom:20px;}
.sec-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px;}
.sec-title{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:4px;color:var(--green);}

/* Graph */
.graph-wrap{padding:20px 18px 16px;}
.graph-bars{display:flex;gap:3px;align-items:flex-end;height:160px;}
.gb-wrap{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;position:relative;}
.gb{width:100%;border-radius:2px 2px 0 0;min-height:3px;transition:opacity 0.2s;cursor:default;position:relative;}
.gb:hover{opacity:0.8;}
.gb-tip{display:none;position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--green);padding:4px 8px;white-space:nowrap;font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--green);z-index:10;pointer-events:none;}
.gb-wrap:hover .gb-tip{display:block;}
.gb-lbl{font-family:'Share Tech Mono',monospace;font-size:6px;color:var(--muted);text-align:center;}
.graph-legend{display:flex;gap:20px;margin-top:12px;flex-wrap:wrap;}
.gl{display:flex;align-items:center;gap:6px;font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--muted);}
.gl-dot{width:8px;height:8px;border-radius:50%;}

/* Search */
.sinp{background:rgba(0,0,0,0.4);border:1px solid var(--dim);color:#fff;font-family:'Share Tech Mono',monospace;font-size:11px;padding:7px 12px;outline:none;transition:border-color 0.2s;width:200px;}
.sinp:focus{border-color:var(--green);}
.sinp::placeholder{color:var(--muted);}

/* Keys grid */
.kgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px;padding:16px;}
.kcard{background:rgba(0,0,0,0.3);border:1px solid var(--border);padding:16px;transition:border-color 0.2s;}
.kcard:hover{border-color:var(--dim);}
.kcard.off{border-color:rgba(255,51,85,0.35);opacity:0.7;}
.ktop{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.kname{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:3px;color:var(--text);}
.kbadge{font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:2px;padding:3px 7px;border:1px solid;}
.kbadge.on{color:var(--green);border-color:var(--green);}
.kbadge.off{color:var(--red);border-color:var(--red);}
.krows{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin-bottom:12px;}
.kr{display:flex;flex-direction:column;gap:1px;}
.krl{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:2px;color:var(--muted);}
.krv{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.mchart{margin-bottom:12px;}
.mc-title{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:2px;color:var(--muted);margin-bottom:5px;}
.mbars{display:flex;gap:3px;align-items:flex-end;height:36px;}
.bwrap{display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;}
.bar{width:100%;min-height:2px;border-radius:1px 1px 0 0;opacity:0.7;}
.blbl{font-family:'Share Tech Mono',monospace;font-size:6px;color:var(--muted);}
.kacts{display:flex;gap:6px;padding-top:10px;border-top:1px solid var(--border);flex-wrap:wrap;}
.kbtn{font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:2px;padding:5px 10px;cursor:pointer;background:none;border:1px solid;transition:all 0.15s;}
.kbtn.copy{border-color:var(--dim);color:var(--muted);}
.kbtn.copy:hover{border-color:var(--cyan);color:var(--cyan);}
.kbtn.block{border-color:var(--red);color:var(--red);}
.kbtn.block:hover{background:var(--red);color:#000;}
.kbtn.unblock{border-color:var(--green);color:var(--green);}
.kbtn.unblock:hover{background:var(--green);color:#000;}
.kbtn.del{border-color:var(--muted);color:var(--muted);}
.kbtn.del:hover{border-color:var(--red);color:var(--red);}

/* Log table */
.log-wrap{overflow-x:auto;max-height:500px;overflow-y:auto;}
.log-wrap::-webkit-scrollbar{width:4px;height:4px;}
.log-wrap::-webkit-scrollbar-thumb{background:var(--dim);}
.ltable{width:100%;border-collapse:collapse;font-family:'Share Tech Mono',monospace;font-size:11px;}
.ltable th{padding:10px 14px;text-align:left;font-size:8px;letter-spacing:3px;color:var(--muted);border-bottom:1px solid var(--border);font-weight:normal;white-space:nowrap;}
.ltable td{padding:9px 14px;border-bottom:1px solid rgba(15,42,30,0.5);vertical-align:middle;}
.ltable tr:hover td{background:rgba(0,255,136,0.02);}
.ltable tr:last-child td{border-bottom:none;}
.tag{font-size:9px;letter-spacing:1px;padding:2px 7px;border:1px solid;display:inline-block;}
.tag.ok{color:var(--green);border-color:var(--green);}
.tag.fail{color:var(--red);border-color:var(--red);}
.tag.warn{color:var(--yellow);border-color:var(--yellow);}
.log-filter{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.fbtn{font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:2px;padding:5px 10px;cursor:pointer;background:none;border:1px solid var(--dim);color:var(--muted);transition:all 0.15s;}
.fbtn.active{border-color:var(--green);color:var(--green);}
.no-data{padding:32px;text-align:center;font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--muted);}

/* Modals */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:500;align-items:center;justify-content:center;padding:20px;}
.overlay.open{display:flex;}
.modal{background:var(--surface);border:1px solid var(--border);max-width:440px;width:100%;padding:28px;position:relative;clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));}
.modal::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent);}
.mtitle{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:4px;color:var(--cyan);margin-bottom:18px;}
.mfield{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
.mlbl{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--muted);}
.minput{width:100%;background:rgba(0,0,0,0.4);border:1px solid var(--dim);color:#fff;font-family:'Share Tech Mono',monospace;font-size:14px;letter-spacing:2px;padding:11px 14px;outline:none;transition:border-color 0.2s;}
.minput:focus{border-color:var(--cyan);}
.mhint{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--muted);margin-top:3px;}
.mfooter{display:flex;gap:10px;justify-content:flex-end;margin-top:8px;}
.mbtn{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:2px;padding:9px 18px;cursor:pointer;background:none;border:1px solid;transition:all 0.2s;}
.mbtn.ok{border-color:var(--green);color:var(--green);}
.mbtn.ok:hover{background:var(--green);color:#000;}
.mbtn.cancel{border-color:var(--dim);color:var(--muted);}
.mbtn.cancel:hover{border-color:var(--text);color:var(--text);}
.merr{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--red);margin-top:8px;display:none;}
.mbody{font-size:14px;line-height:1.7;color:var(--text);margin-bottom:20px;}

@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;margin-right:5px;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{display:inline-block;width:10px;height:10px;border:2px solid var(--dim);border-top-color:var(--green);border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:4px;}

footer{text-align:center;padding:20px;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--muted);border-top:1px solid var(--border);}
footer a{color:inherit;text-decoration:none;}
footer a:hover{color:var(--green);}
</style>
</head>
<body>

<!-- LOGIN -->
<div id="loginWrap">
  <div class="lcard">
    <div class="llogo">TG<span>OSINT</span></div>
    <div class="lsub">// ADMIN TERMINAL</div>
    <label class="llbl">ADMIN KEY</label>
    <input class="linput" type="password" id="adminInp" placeholder="enter admin key" autocomplete="off"/>
    <button class="lbtn" onclick="doLogin()"><span>ACCESS SYSTEM</span></button>
    <div class="lerr" id="lerr">INVALID KEY — ACCESS DENIED</div>
  </div>
</div>

<!-- DASHBOARD -->
<div id="dash">
  <header>
    <div style="display:flex;align-items:center;gap:14px;">
      <div class="hlogo">TG<span>OSINT</span></div>
      <div class="hbadge">ADMIN</div>
    </div>
    <div class="hbtns">
      <button class="hbtn green" onclick="openAdd()">+ NEW KEY</button>
      <button class="hbtn green" onclick="refreshAll()">REFRESH</button>
      <button class="hbtn green" onclick="exportCSV()">EXPORT LOG</button>
      <button class="hbtn red"   onclick="logout()">LOGOUT</button>
    </div>
  </header>

  <div class="main">

    <!-- Stats -->
    <div class="stats">
      <div class="stat"><div class="sv" id="sTotal">—</div><div class="sl">TOTAL KEYS</div></div>
      <div class="stat"><div class="sv" id="sActive" style="color:var(--green)">—</div><div class="sl">ACTIVE</div></div>
      <div class="stat"><div class="sv" id="sBlocked" style="color:var(--red)">—</div><div class="sl">BLOCKED</div></div>
      <div class="stat"><div class="sv" id="sReqs" style="color:var(--cyan)">—</div><div class="sl">TOTAL REQUESTS</div></div>
      <div class="stat"><div class="sv" id="sToday" style="color:var(--yellow)">—</div><div class="sl">TODAY</div></div>
      <div class="stat"><div class="sv" id="sRejected" style="color:var(--red)">—</div><div class="sl">REJECTED TODAY</div></div>
    </div>

    <!-- Overall Graph -->
    <div class="sec">
      <div class="sec-hdr">
        <div class="sec-title">// OVERALL API USAGE — LAST 30 DAYS</div>
        <div class="graph-legend">
          <div class="gl"><div class="gl-dot" style="background:var(--green)"></div>REQUESTS</div>
          <div class="gl"><div class="gl-dot" style="background:var(--red)"></div>REJECTED</div>
          <div class="gl"><div class="gl-dot" style="background:var(--cyan)"></div>TODAY</div>
        </div>
      </div>
      <div class="graph-wrap">
        <div class="graph-bars" id="graphBars">
          <div class="no-data"><span class="spin"></span> LOADING...</div>
        </div>
      </div>
    </div>

    <!-- Keys -->
    <div class="sec">
      <div class="sec-hdr">
        <div class="sec-title">// API KEYS</div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <input class="sinp" type="text" id="searchInp" placeholder="SEARCH..." oninput="filterKeys(this.value)"/>
          <span style="font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:2px;"><span class="dot"></span>LIVE</span>
        </div>
      </div>
      <div id="kgrid" class="kgrid">
        <div class="no-data"><span class="spin"></span> LOADING...</div>
      </div>
    </div>

    <!-- Request Log -->
    <div class="sec">
      <div class="sec-hdr">
        <div class="sec-title">// REQUEST LOG</div>
        <div class="log-filter">
          <button class="fbtn active" data-filter="all"     onclick="setFilter('all',this)">ALL</button>
          <button class="fbtn"        data-filter="success" onclick="setFilter('success',this)">SUCCESS</button>
          <button class="fbtn"        data-filter="rejected" onclick="setFilter('rejected',this)">REJECTED</button>
          <input class="sinp" type="text" id="logSearch" placeholder="SEARCH LOG..." oninput="filterLog()" style="width:160px"/>
        </div>
      </div>
      <div class="log-wrap">
        <table class="ltable">
          <thead>
            <tr>
              <th>STATUS</th>
              <th>TIME</th>
              <th>KEY</th>
              <th>LABEL</th>
              <th>QUERY</th>
              <th>IP</th>
              <th>REASON</th>
            </tr>
          </thead>
          <tbody id="logBody">
            <tr><td colspan="7" class="no-data"><span class="spin"></span> LOADING...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
  <footer>TGOSINT &nbsp;|&nbsp; ADMIN PANEL &nbsp;|&nbsp; BY <a href="https://t.me/drazeforce" target="_blank">@drazeforce</a></footer>
</div>

<!-- ADD KEY MODAL -->
<div class="overlay" id="addModal">
  <div class="modal">
    <div class="mtitle">// NEW API KEY</div>
    <div class="mfield">
      <label class="mlbl">KEY STRING</label>
      <input class="minput" id="nkStr" type="text" placeholder="e.g. drazeX2" autocomplete="off" spellcheck="false"/>
      <div class="mhint">What your friend puts in ?key=</div>
    </div>
    <div class="mfield">
      <label class="mlbl">LABEL (optional)</label>
      <input class="minput" id="nkLabel" type="text" placeholder="e.g. Raj's Key" autocomplete="off"/>
    </div>
    <div class="merr" id="addErr"></div>
    <div class="mfooter">
      <button class="mbtn cancel" onclick="closeModal('addModal')">CANCEL</button>
      <button class="mbtn ok" onclick="addKey()">CREATE</button>
    </div>
  </div>
</div>

<!-- CONFIRM MODAL -->
<div class="overlay" id="confModal">
  <div class="modal">
    <div class="mtitle" id="confTitle">// CONFIRM</div>
    <div class="mbody" id="confBody"></div>
    <div class="mfooter">
      <button class="mbtn cancel" onclick="closeModal('confModal')">CANCEL</button>
      <button class="mbtn ok" id="confOk">CONFIRM</button>
    </div>
  </div>
</div>

<script>
const TODAY = new Date().toISOString().slice(0,10);
let _key="", _data={}, _filtered=null, _log=[], _logFilter="all";

// ── Auth ──────────────────────────────────────────────────────────────────────
function doLogin(){
  _key=document.getElementById("adminInp").value.trim();
  if(!_key)return;
  loadKeys(true);
}
document.getElementById("adminInp").addEventListener("keydown",e=>{ if(e.key==="Enter")doLogin(); });

function logout(){
  _key="";_data={};
  sessionStorage.removeItem("tgosint_admin");
  document.getElementById("dash").style.display="none";
  document.getElementById("loginWrap").style.display="flex";
  document.getElementById("adminInp").value="";
}

// Auto-login if session exists
(function(){
  const saved = sessionStorage.getItem("tgosint_admin");
  if(saved){ _key=saved; loadKeys(true); }
})();

// ── API calls ─────────────────────────────────────────────────────────────────
async function api(method, body, extraQuery="", endpoint="/api/admin/keys"){
  const opts={method,headers:{"Content-Type":"application/json"}};
  if(body) opts.body=JSON.stringify(body);
  const res=await fetch(\`\${endpoint}?adminkey=\${encodeURIComponent(_key)}\${extraQuery}\`,opts);
  return{ok:res.ok,status:res.status,data:await res.json()};
}

function refreshAll(){ loadKeys(); loadLog(); loadGraph(); }

// ── Keys ──────────────────────────────────────────────────────────────────────
async function loadKeys(isLogin=false){
  const{ok,data}=await api("GET");
  if(!ok){ if(isLogin){const e=document.getElementById("lerr");e.style.display="block";setTimeout(()=>e.style.display="none",3000);} return; }
  if(isLogin){ sessionStorage.setItem("tgosint_admin",_key); document.getElementById("loginWrap").style.display="none"; document.getElementById("dash").style.display="block"; loadLog(); loadGraph(); }
  _data=data.keys||{}; _filtered=null; renderStats(); renderKeys();
}

function filterKeys(q){ const v=q.trim().toLowerCase(); _filtered=v?Object.entries(_data).filter(([k,d])=>k.toLowerCase().includes(v)||(d.label||"").toLowerCase().includes(v)):null; renderKeys(); }

function renderStats(){
  const keys=Object.values(_data);
  document.getElementById("sTotal").textContent=keys.length;
  document.getElementById("sActive").textContent=keys.filter(k=>k.active).length;
  document.getElementById("sBlocked").textContent=keys.filter(k=>!k.active).length;
  document.getElementById("sReqs").textContent=keys.reduce((a,k)=>a+(k.totalRequests||0),0);
  document.getElementById("sToday").textContent=keys.reduce((a,k)=>a+((k.dailyUsage||{})[TODAY]||0),0);
}

function renderKeys(){
  const grid=document.getElementById("kgrid");
  const entries=(_filtered||Object.entries(_data)).sort((a,b)=>(b[1].totalRequests||0)-(a[1].totalRequests||0));
  if(!entries.length){ grid.innerHTML='<div class="no-data">NO KEYS FOUND</div>'; return; }
  grid.innerHTML=entries.map(([ks,k])=>{
    const on=k.active;
    const todayN=(k.dailyUsage||{})[TODAY]||0;
    const blockBtn=on?\`<button class="kbtn block" data-a="block" data-k="\${ks}">BLOCK</button>\`:\`<button class="kbtn unblock" data-a="unblock" data-k="\${ks}">UNBLOCK</button>\`;
    const days=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const dk=d.toISOString().slice(0,10);days.push({lbl:d.toLocaleDateString("en-IN",{weekday:"short"}).slice(0,2).toUpperCase(),n:(k.dailyUsage||{})[dk]||0,today:dk===TODAY});}
    const max=Math.max(...days.map(d=>d.n),1);
    const bars=days.map(d=>\`<div class="bwrap"><div class="bar" style="height:\${Math.max(2,Math.round((d.n/max)*36))}px;background:\${d.today?'var(--cyan)':'var(--green)'}"></div><span class="blbl">\${d.lbl}</span></div>\`).join("");
    return\`<div class="kcard\${on?'':' off'}">
      <div class="ktop"><span class="kname">\${k.label||ks}</span><span class="kbadge \${on?'on':'off'}">\${on?'ACTIVE':'BLOCKED'}</span></div>
      <div class="krows">
        <div class="kr"><span class="krl">KEY</span><span class="krv" style="color:var(--cyan)">\${ks}</span></div>
        <div class="kr"><span class="krl">TOTAL REQUESTS</span><span class="krv" style="color:var(--green)">\${k.totalRequests||0}</span></div>
        <div class="kr"><span class="krl">TODAY</span><span class="krv" style="color:var(--yellow)">\${todayN}</span></div>
        <div class="kr"><span class="krl">LAST USED</span><span class="krv">\${k.lastUsed?timeSince(k.lastUsed):"NEVER"}</span></div>
        <div class="kr"><span class="krl">CREATED</span><span class="krv">\${k.createdAt?fmtDate(k.createdAt):"—"}</span></div>
      </div>
      <div class="mchart"><div class="mc-title">LAST 7 DAYS</div><div class="mbars">\${bars}</div></div>
      <div class="kacts">
        <button class="kbtn copy" data-a="copy" data-k="\${ks}">COPY KEY</button>
        <button class="kbtn copy" data-a="copyapi" data-k="\${ks}">COPY API URL</button>
        \${blockBtn}
        <button class="kbtn del" data-a="del" data-k="\${ks}">DELETE</button>
      </div>
    </div>\`;
  }).join("");
  grid.onclick=e=>{ const b=e.target.closest("[data-a]"); if(!b)return; const{a,k}=b.dataset;
    if(a==="copy") copyKey(k,b);
    if(a==="copyapi") copyApiUrl(k,b);
    if(a==="block") confirm2(\`BLOCK KEY: \${k}\`,\`Block "\${k}"? All requests with this key will be rejected.\`,()=>toggle(k,false));
    if(a==="unblock") confirm2(\`UNBLOCK KEY: \${k}\`,\`Restore access for "\${k}"?\`,()=>toggle(k,true));
    if(a==="del") confirm2(\`DELETE KEY: \${k}\`,\`Permanently delete "\${k}"? Cannot be undone.\`,()=>del(k));
  };
}

// ── Graph ─────────────────────────────────────────────────────────────────────
async function loadGraph(){
  const{ok,data}=await api("GET",null,"","/api/admin/stats");
  if(!ok)return;
  const usage=data.usage||{}, rejected=data.rejected||{};
  const days=[];
  for(let i=29;i>=0;i--){ const d=new Date();d.setDate(d.getDate()-i);const dk=d.toISOString().slice(0,10);const lbl=d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});days.push({dk,lbl,n:usage[dk]||0,r:rejected[dk]||0,today:dk===TODAY}); }
  const max=Math.max(...days.map(d=>d.n+d.r),1);
  const container=document.getElementById("graphBars");

  // Update rejected stat
  const todayRej=rejected[TODAY]||0;
  document.getElementById("sRejected").textContent=todayRej;

  container.innerHTML=days.map(d=>{
    const hn=Math.max(3,Math.round((d.n/max)*150));
    const hr=Math.max(d.r>0?3:0,Math.round((d.r/max)*150));
    const col=d.today?"var(--cyan)":"var(--green)";
    return\`<div class="gb-wrap">
      <div class="gb-tip">\${d.lbl}<br>\${d.n} req / \${d.r} rejected</div>
      \${d.r>0?\`<div class="gb" style="height:\${hr}px;background:var(--red);opacity:0.7"></div>\`:''}
      <div class="gb" style="height:\${hn}px;background:\${col};opacity:\${d.n===0?'0.15':'0.75'}"></div>
      <span class="gb-lbl">\${d.today?"NOW":d.lbl.split(" ")[0]}</span>
    </div>\`;
  }).join("");
}

// ── Log ───────────────────────────────────────────────────────────────────────
async function loadLog(){
  const{ok,data}=await api("GET",null,"&limit=500","/api/admin/log");
  if(!ok)return;
  _log=data.log||[];
  renderLog();
}

function setFilter(f,btn){ _logFilter=f; document.querySelectorAll(".fbtn").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); renderLog(); }

function filterLog(){ renderLog(); }

function renderLog(){
  const search=document.getElementById("logSearch").value.trim().toLowerCase();
  let entries=_log;
  if(_logFilter!=="all") entries=entries.filter(e=>e.type===_logFilter);
  if(search) entries=entries.filter(e=>(e.key||"").toLowerCase().includes(search)||(e.query||"").toLowerCase().includes(search)||(e.ip||"").toLowerCase().includes(search)||(e.label||"").toLowerCase().includes(search));
  const tbody=document.getElementById("logBody");
  if(!entries.length){ tbody.innerHTML=\`<tr><td colspan="7" class="no-data">NO ENTRIES FOUND</td></tr>\`; return; }
  tbody.innerHTML=entries.map(e=>{
    const isOk=e.type==="success";
    const tagCls=isOk?"ok":"fail";
    const tagTxt=isOk?"SUCCESS":"REJECTED";
    return\`<tr>
      <td><span class="tag \${tagCls}">\${tagTxt}</span></td>
      <td style="color:var(--muted);white-space:nowrap">\${fmtTime(e.time)}</td>
      <td style="color:var(--cyan)">\${e.key||"—"}</td>
      <td style="color:var(--text)">\${e.label||"—"}</td>
      <td style="color:var(--green)">\${e.query||"—"}</td>
      <td style="color:var(--muted)">\${e.ip||"—"}</td>
      <td style="color:var(--red);font-size:9px">\${e.reason||"—"}</td>
    </tr>\`;
  }).join("");
}

// ── Export CSV ────────────────────────────────────────────────────────────────
function exportCSV(){
  if(!_log.length)return;
  const rows=[["STATUS","TIME","KEY","LABEL","QUERY","IP","REASON"],..._log.map(e=>[e.type,e.time,e.key||"",e.label||"",e.query||"",e.ip||"",e.reason||""])];
  const csv=rows.map(r=>r.map(v=>\`"\${String(v).replace(/"/g,'""')}"\`).join(",")).join("\\n");
  const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="tgosint-log.csv"; a.click();
}

// ── Key actions ───────────────────────────────────────────────────────────────
async function addKey(){
  const ks=document.getElementById("nkStr").value.trim(), lb=document.getElementById("nkLabel").value.trim();
  if(!ks){showErr("addErr","KEY STRING IS REQUIRED");return;}
  if(/\\s/.test(ks)){showErr("addErr","KEY CANNOT HAVE SPACES");return;}
  const{ok,data}=await api("POST",{key:ks,label:lb||ks});
  if(!ok){showErr("addErr",data.error||"FAILED");return;}
  closeModal("addModal"); document.getElementById("nkStr").value=""; document.getElementById("nkLabel").value=""; document.getElementById("addErr").style.display="none"; loadKeys();
}
async function toggle(ks,active){ await api("PATCH",{key:ks,active}); loadKeys(); }
async function del(ks){ await api("DELETE",null,\`&key=\${encodeURIComponent(ks)}\`); loadKeys(); }
function copyKey(ks,btn){ navigator.clipboard.writeText(ks).then(()=>{ const o=btn.textContent;btn.textContent="COPIED!";btn.style.color="var(--green)";setTimeout(()=>{btn.textContent=o;btn.style.color="";},1500); }); }
function copyApiUrl(ks,btn){ const url=\`https://tgosint.vercel.app/?key=\${ks}&q=@username\`; navigator.clipboard.writeText(url).then(()=>{ const o=btn.textContent;btn.textContent="COPIED!";btn.style.color="var(--cyan)";setTimeout(()=>{btn.textContent=o;btn.style.color="";},1500); }); }

// ── Modals ────────────────────────────────────────────────────────────────────
function openAdd(){ document.getElementById("addModal").classList.add("open"); setTimeout(()=>document.getElementById("nkStr").focus(),80); }
function closeModal(id){ document.getElementById(id).classList.remove("open"); }
function confirm2(title,body,onOk){ document.getElementById("confTitle").textContent="// "+title; document.getElementById("confBody").textContent=body; document.getElementById("confOk").onclick=()=>{closeModal("confModal");onOk();}; document.getElementById("confModal").classList.add("open"); }
function showErr(id,msg){ const e=document.getElementById(id);e.textContent=msg;e.style.display="block"; }
document.querySelectorAll(".overlay").forEach(el=>el.addEventListener("click",e=>{if(e.target===el)el.classList.remove("open");}));
document.addEventListener("keydown",e=>{ if(e.key==="Escape")document.querySelectorAll(".overlay.open").forEach(el=>el.classList.remove("open")); if(e.key==="Enter"&&document.getElementById("addModal").classList.contains("open"))addKey(); });

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeSince(ts){ const s=Math.floor((Date.now()-new Date(ts))/1000); if(s<60)return s+"s ago"; if(s<3600)return Math.floor(s/60)+"m ago"; if(s<86400)return Math.floor(s/3600)+"h ago"; return Math.floor(s/86400)+"d ago"; }
function fmtDate(ts){ return new Date(ts).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"2-digit"}); }
function fmtTime(ts){ const d=new Date(ts); return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})+" "+d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}); }

// Auto-refresh every 30s
setInterval(()=>{ if(document.getElementById("dash").style.display!=="none") refreshAll(); },30000);
</script>
</body>
</html>
`;
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
};