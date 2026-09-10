
const $=id=>document.getElementById(id);
const screens=[...document.querySelectorAll('.screen')];
const CHAR={
 Amir:{img:'assets/amir.svg',quote:'“Siempre en movimiento”'},
 Florencia:{img:'assets/florencia.svg',quote:'“Reflejos de acero”'},
 Angela:{img:'assets/angela.svg',quote:'“Modo licenciada”'},
 Aline:{img:'assets/aline.svg',quote:'“Control total”'}
};
let selected=localStorage.getItem('ge_char')||'Amir';
let soundOn=localStorage.getItem('ge_sound')!=='off';
let audioCtx;

function show(id){screens.forEach(s=>s.classList.remove('active'));$(id).classList.add('active');if(id==='records')renderRecords()}
function goHome(){stopGame();show('home')}
document.querySelectorAll('.homeBack').forEach(b=>b.onclick=goHome);
$('playBtn').onclick=()=>show('setup');$('charsBtn').onclick=()=>show('setup');$('recordsBtn').onclick=()=>show('records');$('helpBtn').onclick=()=>show('help');$('creditsBtn').onclick=()=>show('credits');$('settingsBtn').onclick=()=>show('settings');

$('playerName').value=localStorage.getItem('ge_name')||'';
document.querySelectorAll('.char').forEach(c=>{c.classList.toggle('selected',c.dataset.char===selected);c.onclick=()=>{document.querySelectorAll('.char').forEach(x=>x.classList.remove('selected'));c.classList.add('selected');selected=c.dataset.char;localStorage.setItem('ge_char',selected);$('charName').textContent=selected.toUpperCase();$('charText').textContent=CHAR[selected].quote}});
$('charName').textContent=selected.toUpperCase();$('charText').textContent=CHAR[selected].quote;

function beep(freq,d=.07,type='sine',vol=.035){
 if(!soundOn)return;
 try{
   if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
   if(audioCtx.state==='suspended')audioCtx.resume();
   const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=vol;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+d);o.stop(audioCtx.currentTime+d);
 }catch(e){}
}
function sfxWing(){beep(540,.055,'square',.025);setTimeout(()=>beep(660,.04,'square',.018),25)}
function sfxPoint(){beep(900,.055,'sine',.03);setTimeout(()=>beep(1200,.055,'sine',.025),45)}
function sfxHit(){beep(120,.18,'sawtooth',.055)}
function sfxDie(){setTimeout(()=>beep(80,.35,'triangle',.04),100)}

function updateToggles(){document.querySelectorAll('.toggle').forEach(t=>t.classList.toggle('on',soundOn))}
function toggleSound(){soundOn=!soundOn;localStorage.setItem('ge_sound',soundOn?'on':'off');updateToggles()}
$('soundBtn').onclick=toggleSound;$('soundBtn2').onclick=toggleSound;updateToggles();

function scores(){try{return JSON.parse(localStorage.getItem('ge_scores')||'[]')}catch{return[]}}
function saveScore(row){const a=scores();a.push(row);a.sort((a,b)=>b.score-a.score);localStorage.setItem('ge_scores',JSON.stringify(a.slice(0,30)));localStorage.setItem('ge_last',row.score)}
function renderRecords(){const a=scores();$('recordsBody').innerHTML=a.length?a.slice(0,10).map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.name)}</td><td>${r.char}</td><td><b>${r.score}</b></td></tr>`).join(''):'<tr><td colspan="4">Todavía no hay récords.</td></tr>';$('myBest').textContent=a[0]?.score||0;$('lastScore').textContent=localStorage.getItem('ge_last')||0}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
$('clearScores').onclick=()=>{localStorage.removeItem('ge_scores');localStorage.removeItem('ge_last');renderRecords()};

const canvas=$('gameCanvas'),ctx=canvas.getContext('2d');
const syringe=new Image();syringe.src='assets/syringe.svg';
const charImgs={};Object.entries(CHAR).forEach(([k,v])=>{const im=new Image();im.src=v.img;charImgs[k]=im});
let CW=390,CH=844,DPR=1;
function resize(){DPR=Math.min(devicePixelRatio||1,2);const r=canvas.getBoundingClientRect();CW=r.width;CH=r.height;canvas.width=Math.round(CW*DPR);canvas.height=Math.round(CH*DPR);ctx.setTransform(DPR,0,0,DPR,0,0)}
addEventListener('resize',resize);

let running=false,paused=false,started=false,dead=false,raf=0,last=0,spawnTimer=0,score=0,bgScroll=0;
let bird={x:95,y:400,vy:0,r:27,rot:0},pipes=[],particles=[];
const GRAV=.00074,JUMP=-.345,PIPE_INTERVAL=1450;

function resetGame(){
 resize();running=true;paused=false;started=false;dead=false;score=0;spawnTimer=0;bgScroll=0;pipes=[];particles=[];last=performance.now();
 bird={x:CW*.27,y:CH*.5,vy:0,r:Math.max(24,Math.min(31,CW*.074)),rot:0};
 $('score').textContent='0';$('getReady').style.display='block';
}
$('startBtn').onclick=()=>{localStorage.setItem('ge_name',($('playerName').value||selected).trim());show('game');resetGame();loop(performance.now())};

function flap(){
 if(!running||paused||dead)return;
 if(!started){started=true;$('getReady').style.display='none'}
 bird.vy=JUMP;bird.rot=-.26;sfxWing();
 for(let i=0;i<5;i++)particles.push({x:bird.x-18,y:bird.y+(Math.random()-.5)*18,vx:-35-Math.random()*30,vy:(Math.random()-.5)*15,a:1});
}
canvas.addEventListener('pointerdown',e=>{e.preventDefault();flap()},{passive:false});
addEventListener('keydown',e=>{if(e.code==='Space'&&$('game').classList.contains('active')){e.preventDefault();flap()}},{passive:false});

function spawnPipe(){
 const gap=Math.max(185,Math.min(230,CH*.275));
 const margin=95;
 const gy=margin+gap/2+Math.random()*(CH-margin*2-gap);
 pipes.push({x:CW+70,gy,gap,passed:false});
}
function circleRect(cx,cy,r,rx,ry,rw,rh){const nx=Math.max(rx,Math.min(cx,rx+rw)),ny=Math.max(ry,Math.min(cy,ry+rh)),dx=cx-nx,dy=cy-ny;return dx*dx+dy*dy<r*r}

function update(dt){
 if(!started||paused||dead)return;
 bgScroll+=dt*.02;spawnTimer+=dt;
 if(spawnTimer>PIPE_INTERVAL){spawnTimer=0;spawnPipe()}
 bird.vy+=GRAV*dt;bird.y+=bird.vy*dt;bird.rot=Math.min(.5,bird.rot+.0013*dt);
 const speed=.165*dt;
 for(const p of pipes){
   p.x-=speed;const w=58,top=p.gy-p.gap/2,bottom=p.gy+p.gap/2;
   if(circleRect(bird.x,bird.y,bird.r-6,p.x,0,w,top-8)||circleRect(bird.x,bird.y,bird.r-6,p.x,bottom+8,w,CH-bottom)) return die();
   if(!p.passed&&p.x+w<bird.x){p.passed=true;score++;$('score').textContent=score;sfxPoint()}
 }
 pipes=pipes.filter(p=>p.x>-90);
 particles.forEach(p=>{p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.a-=dt/500});particles=particles.filter(p=>p.a>0);
 if(bird.y-bird.r<0||bird.y+bird.r>CH)return die();
}

function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function drawBackground(){
 const g=ctx.createLinearGradient(0,0,0,CH);g.addColorStop(0,'#2a5872');g.addColorStop(.55,'#193c55');g.addColorStop(1,'#091a28');ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH);
 ctx.fillStyle='rgba(255,255,255,.055)';for(let x=-110+(bgScroll%110);x<CW+120;x+=110)ctx.fillRect(x,115,72,CH*.45);
 ctx.fillStyle='#0a2030';ctx.fillRect(0,CH*.73,CW,CH*.27);
 ctx.fillStyle='#c91f41';rr(CW/2-68,72,136,32,6);ctx.fill();ctx.strokeStyle='#ff7f94';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 12px Arial';ctx.textAlign='center';ctx.fillText('EMERGENCIA',CW/2,93);
 // silhouettes and depth
 ctx.fillStyle='rgba(232,245,250,.08)';rr(20,CH*.39,92,54,10);ctx.fill();rr(150,CH*.41,90,52,10);ctx.fill();
 ctx.strokeStyle='rgba(107,157,184,.28)';ctx.lineWidth=1;for(let y=CH*.78;y<CH;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke()}
 // monitor
 ctx.fillStyle='#061723';rr(CW-108,CH*.43,90,70,8);ctx.fill();ctx.strokeStyle='#728995';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#45e8ad';ctx.font='900 8px Arial';ctx.textAlign='left';ctx.fillText('SIN LÍMITES',CW-94,CH*.43+22);ctx.strokeStyle='#45e8ad';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(CW-94,CH*.43+45);ctx.lineTo(CW-78,CH*.43+45);ctx.lineTo(CW-70,CH*.43+33);ctx.lineTo(CW-61,CH*.43+55);ctx.lineTo(CW-50,CH*.43+45);ctx.lineTo(CW-30,CH*.43+45);ctx.stroke();
 const vign=ctx.createRadialGradient(CW/2,CH*.4,40,CW/2,CH*.4,Math.max(CW,CH)*.65);vign.addColorStop(0,'rgba(0,0,0,0)');vign.addColorStop(1,'rgba(0,7,15,.45)');ctx.fillStyle=vign;ctx.fillRect(0,0,CW,CH);
}
function drawSyringe(x,y,h,up){ctx.save();if(up){ctx.translate(x+58,y+h);ctx.rotate(Math.PI);ctx.drawImage(syringe,0,0,58,h)}else ctx.drawImage(syringe,x,y,58,h);ctx.restore()}
function drawBird(){const im=charImgs[selected];ctx.save();ctx.translate(bird.x,bird.y);ctx.rotate(bird.rot);ctx.shadowColor='#34d9ff';ctx.shadowBlur=16;if(im.complete)ctx.drawImage(im,-bird.r,-bird.r,bird.r*2,bird.r*2);ctx.restore()}
function draw(){
 ctx.clearRect(0,0,CW,CH);drawBackground();
 for(const p of pipes){const top=p.gy-p.gap/2,bottom=p.gy+p.gap/2;drawSyringe(p.x,0,top,true);drawSyringe(p.x,bottom,CH-bottom,false)}
 particles.forEach(p=>{ctx.globalAlpha=p.a;ctx.fillStyle='#ff3159';ctx.font='18px Arial';ctx.fillText('♥',p.x,p.y);ctx.globalAlpha=1});
 drawBird();
}
function loop(t){if(!running)return;const dt=Math.min(34,t-last||16);last=t;update(dt);draw();raf=requestAnimationFrame(loop)}

function die(){
 if(dead)return;dead=true;sfxHit();sfxDie();
 setTimeout(()=>{
   running=false;cancelAnimationFrame(raf);
   const name=($('playerName').value||selected).trim();saveScore({name,char:selected,score,date:Date.now()});
   $('finalScore').textContent=score;$('bestScore').textContent=scores()[0]?.score||score;$('overChar').src=CHAR[selected].img;
   const medal=$('medal'); if(score>=40){medal.textContent='💎';medal.style.background='#63e7ff'}else if(score>=30){medal.textContent='🥇';medal.style.background='#ffc846'}else if(score>=20){medal.textContent='🥈';medal.style.background='#bfcbd4'}else if(score>=10){medal.textContent='🥉';medal.style.background='#b76c36'}else{medal.textContent='♡';medal.style.background='#6c7882'}
   show('gameOver');
 },420);
}
function stopGame(){running=false;paused=false;cancelAnimationFrame(raf)}
$('pauseBtn').onclick=()=>{if(!running)return;paused=true;show('pause')};
$('resumeBtn').onclick=()=>{show('game');paused=false;last=performance.now();if(running)loop(last)};
$('restartPauseBtn').onclick=()=>{show('game');resetGame();loop(performance.now())};
$('againBtn').onclick=()=>{show('game');resetGame();loop(performance.now())};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&$('game').classList.contains('active')){paused=true;show('pause')}});

if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
