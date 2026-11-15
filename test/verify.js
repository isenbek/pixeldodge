const { chromium, devices } = require('/opt/npm-tools/node_modules/playwright');
const URL='http://localhost:8765/';
const launch=()=>chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const out={};
(async()=>{
  // ---------- desktop: assets, menu, keys, full match, end screen ----------
  let b=await launch();
  let page=await b.newPage({viewport:{width:1100,height:640}});
  const errs=[], reqs=[], bad=[];
  page.on('pageerror',e=>errs.push(e.message));
  page.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text()); });
  page.on('request',r=>reqs.push(r.url()));
  page.on('response',r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url()); });
  await page.goto(URL+'_test.html'); await page.waitForTimeout(1500);
  out.external=reqs.filter(u=>!u.startsWith('http://localhost:8765')&&!u.startsWith('data:'));
  out.badResponses=bad;
  out.fonts=await page.evaluate(async()=>{ await document.fonts.ready; return [document.fonts.check("700 20px 'Chakra Petch'"),document.fonts.check("400 20px 'Share Tech Mono'")]; });
  await page.screenshot({path:'/tmp/shot-menu.png'});
  await page.click('.diff:nth-child(1)');
  out.diffSaved=await page.evaluate(()=>localStorage.getItem('mad.diff'));
  await page.click('#playBtn'); await page.waitForTimeout(2500);
  out.hostiles=await page.evaluate(()=>__G.units.filter(u=>u.team==='hum').length);
  await page.keyboard.down('KeyW'); await page.waitForTimeout(2500); await page.keyboard.up('KeyW');
  await page.mouse.down(); await page.waitForTimeout(1200); await page.mouse.up();
  out.movedAndFired=await page.evaluate(()=>({z:+__G.player.pos.z.toFixed(1),mag:__G.player.mag}));
  await page.screenshot({path:'/tmp/shot-play.png'});
  await page.keyboard.press('KeyM'); out.muteToast=await page.evaluate(()=>document.getElementById('toast').textContent);
  await page.keyboard.press('KeyM');
  await page.keyboard.press('KeyP'); await page.waitForTimeout(300);
  out.paused=await page.evaluate(()=>__G.game.state);
  await page.mouse.click(550,320); await page.waitForTimeout(300);
  out.resumed=await page.evaluate(()=>__G.game.state);
  await page.evaluate(()=>{ window.__TURBO__=40; });
  let st; const t0=Date.now();
  while(Date.now()-t0<200000){ await page.waitForTimeout(3000); st=await page.evaluate(()=>({t:+__G.match.time.toFixed(0),mad:__G.match.madScore,hum:__G.match.humScore,over:__G.match.over})); if(st.over) break; }
  out.match=st;
  await page.evaluate(()=>{ window.__TURBO__=0; }); await page.waitForTimeout(600);
  out.overScreen=await page.evaluate(()=>({shown:!document.getElementById('over').classList.contains('hidden'),title:document.getElementById('ovTitle').textContent,score:document.getElementById('ovScore').textContent}));
  await page.screenshot({path:'/tmp/shot-over.png'});
  await page.click('#menuBtn'); await page.waitForTimeout(300);
  out.backToMenu=await page.evaluate(()=>({state:__G.game.state,menu:!document.getElementById('menu').classList.contains('hidden')}));
  await page.click('#playBtn'); await page.waitForTimeout(1500);
  out.secondMatch=await page.evaluate(()=>({state:__G.game.state,mad:__G.match.madScore,hum:__G.match.humScore,units:__G.units.length}));
  out.desktopErrors=[...new Set(errs)];
  await b.close();

  // ---------- phone: touch controls ----------
  b=await launch();
  const ctx=await b.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  page=await ctx.newPage(); const terrs=[]; page.on('pageerror',e=>terrs.push(e.message));
  await page.goto(URL+'_test.html'); await page.waitForTimeout(1500);
  out.phoneMenuOverlap=await page.evaluate(()=>{ const a=document.getElementById('playBtn').getBoundingClientRect(); const e=document.elementFromPoint(a.left+a.width/2,a.top+a.height/2); return e&&e.id; });
  await page.screenshot({path:'/tmp/shot-phone-menu.png'});
  await page.tap('#playBtn'); await page.waitForTimeout(2500);
  out.touchMode=await page.evaluate(()=>({touch:document.body.classList.contains('touch'),layer:getComputedStyle(document.getElementById('touch')).display,state:__G.game.state,hint:getComputedStyle(document.getElementById('hint')).display}));
  const before=await page.evaluate(()=>({z:__G.player.pos.z,yaw:__G.player.yaw,mag:__G.player.mag}));
  await page.evaluate(()=>{
    const L=document.getElementById('touch');
    const mk=(type,id,x,y,target)=>{ const t=new Touch({identifier:id,target:target||L,clientX:x,clientY:y}); (target||L).dispatchEvent(new TouchEvent(type,{changedTouches:[t],touches:type==='touchend'?[]:[t],bubbles:true,cancelable:true})); };
    window.__mk=mk;
    mk('touchstart',1,150,250); mk('touchmove',1,150,170);          // left thumb: push forward
    mk('touchstart',2,600,200); mk('touchmove',2,680,200);          // right thumb: drag to turn
    mk('touchstart',3,0,0,document.getElementById('tFire'));        // hold fire
  });
  await page.waitForTimeout(2500);
  const after=await page.evaluate(()=>({z:__G.player.pos.z,yaw:__G.player.yaw,mag:__G.player.mag}));
  out.touchMove={dz:+(after.z-before.z).toFixed(2),dyaw:+(after.yaw-before.yaw).toFixed(3),shots:before.mag-after.mag};
  await page.screenshot({path:'/tmp/shot-phone-play.png'});
  await page.evaluate(()=>{ __mk('touchend',1,150,170); __mk('touchend',2,680,200); __mk('touchend',3,0,0,document.getElementById('tFire')); });
  await page.waitForTimeout(1200);
  const rest=await page.evaluate(()=>({z:__G.player.pos.z,mag:__G.player.mag}));
  await page.waitForTimeout(1000);
  const rest2=await page.evaluate(()=>({z:__G.player.pos.z,mag:__G.player.mag}));
  out.touchRelease={stillMoving:Math.abs(rest2.z-rest.z)>.05,stillFiring:rest2.mag!==rest.mag};
  await page.tap('#tPause'); await page.waitForTimeout(300);
  out.touchPause=await page.evaluate(()=>__G.game.state);
  await page.tap('#pause'); await page.waitForTimeout(400);
  out.touchResume=await page.evaluate(()=>__G.game.state);
  await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(300);
  out.portraitNotice=await page.evaluate(()=>getComputedStyle(document.getElementById('rotate')).display);
  out.phoneErrors=[...new Set(terrs)];
  await b.close();
  console.log(JSON.stringify(out,null,1));
})();
