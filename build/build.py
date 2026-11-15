#!/usr/bin/env python3
"""Builds site/index.html from the original single-file game by applying named patches.
Every patch asserts its anchor exists exactly once, so a drifted source fails loudly."""
import sys, pathlib
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
s = src.read_text(encoding='utf-8')
def rep(name, old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f'patch {name}: expected {count} anchor(s), found {n}'
    s = s.replace(old, new)

# ---------- self-hosted assets + page metadata ----------
rep('fonts', '''<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
<style>''', '''<meta name="description" content="MAD Protocol: pilot an eight-foot armored robot and hold the hill against human infantry. A browser king-of-the-hill shooter.">
<meta name="theme-color" content="#070b0f">
<meta property="og:title" content="MAD PROTOCOL">
<meta property="og:description" content="Pilot an eight-foot armored robot. Hold the hill.">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23070b0f'/%3E%3Crect x='17' y='17' width='30' height='30' fill='none' stroke='%233dff8a' stroke-width='4' transform='rotate(45 32 32)'/%3E%3Crect x='25' y='25' width='14' height='14' fill='%233dff8a' transform='rotate(45 32 32)'/%3E%3C/svg%3E">
<style>
  @font-face{font-family:'Chakra Petch';font-weight:400;font-style:normal;font-display:swap;src:url(assets/fonts/chakra-petch-latin-400-normal.woff2) format('woff2')}
  @font-face{font-family:'Chakra Petch';font-weight:600;font-style:normal;font-display:swap;src:url(assets/fonts/chakra-petch-latin-600-normal.woff2) format('woff2')}
  @font-face{font-family:'Chakra Petch';font-weight:700;font-style:normal;font-display:swap;src:url(assets/fonts/chakra-petch-latin-700-normal.woff2) format('woff2')}
  @font-face{font-family:'Share Tech Mono';font-weight:400;font-style:normal;font-display:swap;src:url(assets/fonts/share-tech-mono-latin-400-normal.woff2) format('woff2')}''')
rep('three', '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', '<script src="assets/three.min.js"></script>')
rep('three-msg', 'Three.js could not load. Check the connection and reload.', 'The renderer could not load. Reload the page.')

# ---------- CSS: difficulty row, menu on short screens, touch controls ----------
rep('css', '''  .note{margin-top:20px;font-size:10px;letter-spacing:.2em;color:#4d5560;max-width:470px;line-height:1.7}
</style>''', '''  .note{margin-top:20px;font-size:10px;letter-spacing:.2em;color:#4d5560;max-width:470px;line-height:1.7}

  html,body{touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
  /* ---------- difficulty ---------- */
  #diffRow{position:relative;z-index:4;display:flex;gap:10px;margin-bottom:22px;flex-wrap:wrap;justify-content:center}
  .diff,.ghost{pointer-events:auto;cursor:pointer;font-family:'Chakra Petch',sans-serif;font-size:10px;letter-spacing:.3em;text-indent:.3em;
    color:#8a9099;background:transparent;border:1px solid rgba(138,144,153,.28);padding:9px 16px;transition:all .2s}
  .diff:hover,.ghost:hover{color:#f2f6f9;border-color:rgba(242,246,249,.5)}
  .diff.on{color:var(--mad);border-color:var(--mad);background:rgba(61,255,138,.07)}
  .ghost{margin-top:22px;position:relative;z-index:4}
  #diffNote{position:relative;z-index:4;font-size:9px;letter-spacing:.24em;color:#5d656e;margin:-10px 0 22px;min-height:12px}
  /* the key hints sat on top of the PLAY button on short windows */
  @media (max-height:600px){ .hintline{display:none} #logo{margin-bottom:18px} #diffRow{margin-bottom:14px} #diffNote{margin:-6px 0 14px} }

  /* ---------- touch controls ---------- */
  #touch{position:fixed;inset:0;z-index:12;display:none}
  body.touch.playing #touch{display:block}
  #stick{position:absolute;width:112px;height:112px;margin:-56px 0 0 -56px;border-radius:50%;border:1px solid rgba(61,255,138,.35);
    background:rgba(61,255,138,.05);display:none;pointer-events:none}
  #stick i{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(61,255,138,.35)}
  .tb{position:absolute;border-radius:50%;border:1px solid rgba(242,246,249,.4);background:rgba(19,26,34,.5);color:#f2f6f9;
    font-family:'Chakra Petch',sans-serif;font-size:10px;letter-spacing:.14em;display:flex;align-items:center;justify-content:center;padding:0}
  .tb.held{background:rgba(61,255,138,.25);border-color:var(--mad);color:var(--mad)}
  #tFire{right:22px;bottom:34px;width:88px;height:88px;font-size:12px;border-color:rgba(255,170,43,.7);color:var(--amber)}
  #tAds{right:122px;bottom:26px;width:58px;height:58px}
  #tBoost{right:34px;bottom:136px;width:58px;height:58px}
  #tReload{right:106px;bottom:98px;width:50px;height:50px}
  #tPause{right:14px;top:12px;width:40px;height:40px;border-radius:4px}
  body.touch #hint{display:none!important}
  body.touch #ammo{right:auto;left:50%;bottom:8px;transform:translateX(-50%) scale(.72);transform-origin:center bottom;text-align:center}
  body.touch #chassis{transform:scale(.72);transform-origin:left bottom;left:14px;bottom:10px}
  body.touch #roster{transform:scale(.8);transform-origin:left top;left:12px;top:10px}
  body.touch #topbar{top:8px;transform:translateX(-50%) scale(.8);transform-origin:center top}
  body.touch #banner .big{font-size:26px}
  body.touch #ammo .lbl{display:none}
  #rotate{position:fixed;inset:0;z-index:60;background:#000;color:var(--mad);display:none;align-items:center;justify-content:center;
    text-align:center;font-size:13px;letter-spacing:.34em;line-height:2;padding:30px}
  @media (orientation:portrait){ body.touch #rotate{display:flex} }
</style>''')

# ---------- markup ----------
rep('menu', '''  <button id="playBtn">PLAY</button>
  <div class="hintline">WASD move &middot; mouse aim &middot; click fire &middot; right-click sight &middot; shift thrusters &middot; R reload</div>''',
'''  <div id="diffRow">
    <button class="diff" type="button">RECRUIT</button>
    <button class="diff" type="button">VETERAN</button>
    <button class="diff" type="button">WAR MACHINE</button>
  </div>
  <div id="diffNote"></div>
  <button id="playBtn">PLAY</button>
  <div class="hintline">WASD move &middot; mouse aim &middot; click fire &middot; right-click sight &middot; shift thrusters &middot; R reload &middot; P pause &middot; M mute</div>''')
rep('over', '''  <div class="deploy">CLICK TO REDEPLOY</div>
</div>''', '''  <div class="deploy">CLICK TO REDEPLOY</div>
  <button class="ghost" id="menuBtn" type="button">MAIN MENU</button>
</div>

<div id="touch">
  <div id="stick"><i></i></div>
  <button class="tb" id="tFire" type="button">FIRE</button>
  <button class="tb" id="tAds" type="button">SIGHT</button>
  <button class="tb" id="tBoost" type="button">THRUST</button>
  <button class="tb" id="tReload" type="button">LOAD</button>
  <button class="tb" id="tPause" type="button">II</button>
</div>
<div id="rotate">ROTATE YOUR DEVICE<br>MAD PROTOCOL PLAYS IN LANDSCAPE</div>''')

# ---------- audio mute ----------
rep('mute-init', "this.master=this.ctx.createGain(); this.master.gain.value=.32;", "this.master=this.ctx.createGain(); this.master.gain.value=muted?0:.32;")
rep('mute-decl', "/* ============================== audio ============================== */\n", "/* ============================== audio ============================== */\nlet muted=false;\n")

# ---------- difficulty applied to the human side ----------
rep('ai-dmg', "hitscan(mp,dir,u,u.cfg.dmg,u.team==='mad'?0x9ff0e4:0xffc09a);", "hitscan(mp,dir,u,u.cfg.dmg*(u.team==='hum'?DIFFS[diffIdx].dmg:1),u.team==='mad'?0x9ff0e4:0xffc09a);")
rep('ai-spread', "  const s=u.cfg.spread;\n  dir.x+=rnd(-s,s); dir.y+=rnd(-s*.7,s*.7)", "  const s=u.cfg.spread*(u.team==='hum'?DIFFS[diffIdx].spread:1);\n  dir.x+=rnd(-s,s); dir.y+=rnd(-s*.7,s*.7)")
rep('rocket-dmg', "if(d<4.6) damageUnit(u,58*(1-d/4.6),tmpV,owner,false);", "if(d<4.6) damageUnit(u,58*DIFFS[diffIdx].dmg*(1-d/4.6),tmpV,owner,false);")

# ---------- match pacing + copy ----------
rep('tick', "if(match.tick>=.42){", "if(match.tick>=SCORE_TICK){")
rep('tick-decl', "const match={cap:0, owner:null, madScore:0, humScore:0, tick:0, over:false, target:100, time:0};",
    "const match={cap:0, owner:null, madScore:0, humScore:0, tick:0, over:false, target:100, time:0};\n"
    "// Seconds of holding per point. At the original .42 a full match was over in about 45 seconds.\nconst SCORE_TICK=SCORE_TICK_VALUE;")
rep('copy1', "banner2('HILL CAPTURED','MAD HOLDS THE PLATFORM',C_MAD)", "banner2('HILL CAPTURED','MAD HOLDS THE HILL',C_MAD)")
rep('copy2', "banner2('HILL LOST','HUMANS HOLD THE PLATFORM',C_HUM)", "banner2('HILL LOST','HUMANS HOLD THE HILL',C_HUM)")
rep('debug', "  window.__TW=tw;\n", "")

# ---------- input: pause, mute, touch ----------
rep('keys', "  if(e.code==='Escape'&&game.state==='playing'&&steerMode) pauseGame();\n});",
'''  if(e.code==='Escape'&&game.state==='playing'&&steerMode) pauseGame();
  if(e.code==='KeyP'&&game.state==='playing'){ if(document.pointerLockElement===canvas) document.exitPointerLock(); else pauseGame(); }
  if(e.code==='KeyM') toggleMute();
});
function toggleMute(){ muted=!muted; if(A.master) A.master.gain.value=muted?0:.32; toast(muted?'AUDIO OFF':'AUDIO ON'); }
// a hidden tab keeps no clock, so stand by rather than let the match run blind
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&game.state==='playing'){ if(document.pointerLockElement===canvas) document.exitPointerLock(); pauseGame(); }
});''')
rep('pause-touch', "function pauseGame(){ game.state='paused'; el('pause').classList.remove('hidden'); firing=false; ads=false; }",
    "function pauseGame(){ game.state='paused'; el('pause').classList.remove('hidden'); firing=false; ads=false;\n  touchMove.x=0; touchMove.z=0; touchBoost=false; el('tAds').classList.remove('held'); }")
rep('trylock', "function tryLock(){\n", "function tryLock(){\n  if(touchMode) return;          // no cursor to lock on a touch screen\n")
rep('move-touch', '''    if(keys['KeyA'])ix-=1; if(keys['KeyD'])ix+=1;
  }
  const boosting=keys['ShiftLeft']&&player.boost>1&&(ix||iz)&&pUnit.alive;''', '''    if(keys['KeyA'])ix-=1; if(keys['KeyD'])ix+=1;
    ix+=touchMove.x; iz+=touchMove.z;
  }
  const boosting=(keys['ShiftLeft']||touchBoost)&&player.boost>1&&(ix||iz)&&pUnit.alive;''')
rep('move-norm', "const len=Math.hypot(ix,iz)||1; ix/=len; iz/=len;", "const len=Math.max(1,Math.hypot(ix,iz)); ix/=len; iz/=len;   // analogue stick keeps its partial deflection")

rep('touch-code', "function crtOn(){", '''/* ---------- touch: left thumb moves, right thumb aims, buttons for the rest ---------- */
let touchMode=false, touchBoost=false;
const touchMove={x:0,z:0};
(function(){
  const layer=el('touch'), stick=el('stick'), knob=stick.firstElementChild;
  const R=52;
  let moveId=null, lookId=null, m0x=0, m0y=0, lx=0, ly=0;
  const held={};                                   // touch id -> button id
  addEventListener('touchstart',()=>{
    if(touchMode) return;
    touchMode=true; document.body.classList.add('touch');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.25));   // phones: favour frame rate
    renderer.setSize(innerWidth,innerHeight);
    document.querySelector('.hintline').innerHTML='left thumb move &middot; right thumb aim &middot; hold FIRE';
  },{passive:true,capture:true});
  function press(id,on){
    const b=el(id); if(b&&id!=='tAds') b.classList.toggle('held',on);
    if(id==='tFire') firing=on&&game.state==='playing';
    else if(id==='tBoost') touchBoost=on;
    else if(id==='tAds'){ if(on){ ads=!ads; b.classList.toggle('held',ads); } }
    else if(id==='tReload'){ if(on) startReload(); }
    else if(id==='tPause'){ if(on) pauseGame(); }
  }
  function endMove(){ moveId=null; touchMove.x=0; touchMove.z=0; stick.style.display='none'; }
  layer.addEventListener('touchstart',e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      const b=t.target.closest?t.target.closest('.tb'):null;
      if(b){ held[t.identifier]=b.id; press(b.id,true); continue; }
      if(t.clientX<innerWidth*.45&&moveId===null){
        moveId=t.identifier; m0x=t.clientX; m0y=t.clientY;
        stick.style.left=m0x+'px'; stick.style.top=m0y+'px'; stick.style.display='block'; knob.style.transform='';
      }else if(lookId===null){ lookId=t.identifier; lx=t.clientX; ly=t.clientY; }
    }
  },{passive:false});
  layer.addEventListener('touchmove',e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      if(t.identifier===moveId){
        let dx=(t.clientX-m0x)/R, dy=(t.clientY-m0y)/R; const m=Math.hypot(dx,dy);
        if(m>1){ dx/=m; dy/=m; }
        knob.style.transform='translate('+(dx*R)+'px,'+(dy*R)+'px)';
        if(m<.18){ dx=0; dy=0; }
        touchMove.x=dx; touchMove.z=dy;
      }else if(t.identifier===lookId){
        const s=.0052*aimFric*(ads?.6:1);
        player.yaw-=(t.clientX-lx)*s;
        player.pitch=clamp(player.pitch-(t.clientY-ly)*s,-1.45,1.45);
        lx=t.clientX; ly=t.clientY;
      }
    }
  },{passive:false});
  function release(e){
    for(const t of e.changedTouches){
      if(held[t.identifier]){ press(held[t.identifier],false); delete held[t.identifier]; }
      if(t.identifier===moveId) endMove();
      if(t.identifier===lookId) lookId=null;
    }
  }
  layer.addEventListener('touchend',release); layer.addEventListener('touchcancel',release);
  // losing focus drops every held control, so the chassis cannot keep walking on its own
  window.addEventListener('blur',()=>{ endMove(); lookId=null; touchBoost=false; });
})();
function crtOn(){''')

# ---------- difficulty model, menu wiring, match setup ----------
rep('diff-decl', "const game={state:'menu'};\n", '''const game={state:'menu'};
// Humans only: the MAD squad is the same at every level.
const DIFFS=[
  {name:'RECRUIT',    rifles:3, rockets:1, dmg:.85, spread:1.15, note:'4 HOSTILES · LIGHT FIRE'},
  {name:'VETERAN',    rifles:4, rockets:2, dmg:1,   spread:1,    note:'6 HOSTILES · STANDARD FIRE'},
  {name:'WAR MACHINE',rifles:5, rockets:3, dmg:1.2, spread:.85,  note:'8 HOSTILES · HEAVY, ACCURATE FIRE'}
];
let diffIdx=1;
try{ const sv=localStorage.getItem('mad.diff'); if(sv!==null&&DIFFS[+sv]) diffIdx=+sv; }catch(e){}
function setDiff(i){
  diffIdx=i;
  document.querySelectorAll('.diff').forEach((b,k)=>b.classList.toggle('on',k===i));
  el('diffNote').textContent=DIFFS[i].note;
  try{ localStorage.setItem('mad.diff',String(i)); }catch(e){}
}
document.querySelectorAll('.diff').forEach((b,k)=>b.addEventListener('click',e=>{ e.stopPropagation(); setDiff(k); }));
setDiff(diffIdx);
el('menuBtn').addEventListener('click',e=>{
  e.stopPropagation(); el('over').classList.add('hidden'); el('menu').classList.remove('hidden'); game.state='menu';
});
''')
rep('spawn', '''  for(let i=0;i<3;i++) makeUnit('rifle',false,'RIFLE-'+(i+1));
  makeUnit('rocket',false,'ROCKET-1');''', '''  const D=DIFFS[diffIdx];
  for(let i=0;i<D.rifles;i++) makeUnit('rifle',false,'RIFLE-'+(i+1));
  for(let i=0;i<D.rockets;i++) makeUnit('rocket',false,'ROCKET-'+(i+1));''')
rep('banner', "banner2('HOLD THE HILL','MAD SQUAD · 2 UNITS VS 4 HOSTILES',C_MAD);", "banner2('HOLD THE HILL','MAD SQUAD · 2 UNITS VS '+(D.rifles+D.rockets)+' HOSTILES',C_MAD);")
rep('begin-reset', "  player.boost=100; player.stompCd=0; player.kills=0; player.deaths=0;", "  player.boost=100; player.stompCd=0; player.kills=0; player.deaths=0;\n  firing=false; ads=false; el('tAds').classList.remove('held');")
rep('frame', "  renderer.render(scene,camera);\n}\nframe();", "  document.body.classList.toggle('playing',game.state==='playing');\n  renderer.render(scene,camera);\n}\nframe();")

tick = sys.argv[3] if len(sys.argv) > 3 else '.9'
s = s.replace('SCORE_TICK_VALUE', tick)
dst.parent.mkdir(parents=True, exist_ok=True)
dst.write_text(s, encoding='utf-8')
print('built', dst, len(s), 'bytes')
