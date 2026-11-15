const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const file=process.argv[2], mode=process.argv[3]||'idle', simMax=+(process.argv[4]||600);
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const page=await b.newPage({viewport:{width:640,height:420}});
  const errs=[]; page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text()); });
  await page.goto(file.startsWith('http')?file:'file://'+file);
  await page.waitForTimeout(1500);
  if(process.env.DIFF) await page.click('.diff:nth-child('+(+process.env.DIFF+1)+')');
  await page.click('#playBtn');
  await page.waitForTimeout(800);
  if(mode==='bot'){ await page.keyboard.down('KeyW'); await page.mouse.down(); }
  await page.evaluate(()=>{ window.__TURBO__=40; window.__stuck={}; });
  const t0=Date.now(); let last=null;
  while(Date.now()-t0<240000){
    await page.waitForTimeout(3000);
    last=await page.evaluate((mode)=>{ const G=window.__G; 
      if(mode==='bot'){ // stop walking once in the pit
        const d=Math.hypot(G.player.pos.x,G.player.pos.z); window.__inpit=d<4; }
      return {t:+G.match.time.toFixed(1),mad:G.match.madScore,hum:G.match.humScore,over:G.match.over,owner:G.match.owner,cap:+G.match.cap.toFixed(0),
        state:G.game.state,kills:G.player.kills,deaths:G.player.deaths,p:[+G.player.pos.x.toFixed(1),+G.player.pos.z.toFixed(1)],
        units:G.units.filter(u=>!u.isPlayer).map(u=>u.name.slice(0,6)+(u.alive?'':'x')+'@'+u.pos.x.toFixed(0)+','+u.pos.z.toFixed(0)+' k'+u.kills).join(' | ')}; },mode);
    if(mode==='bot'){ const inpit=await page.evaluate(()=>window.__inpit); if(inpit) await page.keyboard.up('KeyW'); else await page.keyboard.down('KeyW'); }
    console.log(JSON.stringify(last));
    if(last.over||last.t>simMax) break;
  }
  console.log('ERRORS:',errs.length?[...new Set(errs)].slice(0,6).join('\n'):'none');
  await b.close();
})();
