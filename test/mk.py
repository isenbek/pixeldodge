import sys
src,dst,three=sys.argv[1],sys.argv[2],sys.argv[3]
s=open(src,encoding='utf-8').read()
import re
if three!='keep': s=re.sub(r'<script src="[^"]*three[^"]*"></script>','<script src="file://%s"></script>'%three,s)
s=s.replace("renderer.shadowMap.enabled=true;","renderer.shadowMap.enabled=false;")
old="""function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(clock.getDelta(),.05);
  if(game.state==='playing'&&!match.over) update(dt);"""
assert old in s, 'frame hook missing'
new="""window.__G={units,match,player,game,pUnit,obstacles};
function frame(){
  requestAnimationFrame(frame);
  let dt=Math.min(clock.getDelta(),.05);
  const N=window.__TURBO__||0;
  for(let i=0;i<N;i++){ if(game.state==='playing'&&!match.over) update(1/60); }
  if(N) dt=0;
  if(!N&&game.state==='playing'&&!match.over) update(dt);"""
s=s.replace(old,new)
open(dst,'w',encoding='utf-8').write(s)
