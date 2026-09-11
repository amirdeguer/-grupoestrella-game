'use strict';
(() => {
  const CHARACTERS = [
    {id:'amir', name:'Amir', line:'Siempre en movimiento', color:'#00bcff', gravity:850,jump:308, head:[285,155,109,121],points:[[3,47],[9,26],[29,10],[55,0],[83,8],[96,23],[98,45],[96,65],[85,81],[72,95],[57,104],[43,97],[25,87],[14,64]]},
    {id:'florencia',name:'Florencia',line:'Una sonrisa en cada guardia',color:'#ff8751',gravity:810,jump:301,head:[406,157,103,129],points:[[0,68],[7,36],[20,13],[41,0],[65,2],[84,16],[96,38],[101,83],[98,119],[82,120],[69,101],[50,107],[28,96],[17,121],[4,117]]},
    {id:'angela',name:'Angela',line:'La jefa siempre está',color:'#ffc54d',gravity:830,jump:304,head:[285,333,109,133],points:[[0,128],[0,61],[5,32],[19,14],[40,0],[67,0],[88,11],[101,36],[108,72],[105,126],[89,126],[81,107],[77,94],[69,104],[56,110],[46,108],[36,97],[28,87],[25,128],[14,133]]},
    {id:'aline',name:'Aline',line:'La energía del equipo',color:'#f26daf',gravity:870,jump:312,head:[409,334,99,128],points:[[2,107],[0,69],[3,36],[17,13],[39,1],[61,1],[80,12],[92,33],[97,62],[92,87],[74,103],[61,110],[47,106],[34,97],[25,84],[23,110],[13,113],[4,107]]}
  ];
  CHARACTERS.forEach(c=>{c.tagline=c.line;c.role=c.id==='angela'?'Licenciada · Jefa de Emergencia':'Auxiliar de Enfermería';});
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const hitRect=(x,y,r,left,top,width,height)=>height>0 && (x-clamp(x,left,left+width))**2+(y-clamp(y,top,top+height))**2<r*r;
  function heart(g,x,y,size){g.save();g.translate(x,y);g.scale(size/24,size/24);g.beginPath();g.moveTo(0,10);g.bezierCurveTo(-22,-3,-8,-17,0,-8);g.bezierCurveTo(8,-17,22,-3,0,10);g.closePath();g.fill();g.restore()}
  class GuardiaEngine {
    static CHARACTERS=CHARACTERS;
    constructor(canvas,callbacks={}){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.callbacks=callbacks;
      this.width=390;this.height=780;this.state='stopped';this.selected=0;this.frame=0;this.accumulator=0;this.last=0;this.elapsed=0;this.particles=[];this.obstacles=[];
      this.reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;this.source=new Image();
      this.ready=new Promise((resolve,reject)=>{this.source.onload=()=>{this.buildHeads();resolve(this)};this.source.onerror=()=>reject(new Error('No se pudo cargar assets/reference.png'));});
      this.source.src='assets/reference.png?v=3.0.0';
      this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();
      this.tick=this.tick.bind(this);
    }
    buildHeads(){this.heads=CHARACTERS.map(ch=>{const c=document.createElement('canvas');c.width=ch.head[2]*3;c.height=ch.head[3]*3;const g=c.getContext('2d');g.scale(3,3);g.beginPath();ch.points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.clip();g.drawImage(this.source,...ch.head,0,0,ch.head[2],ch.head[3]);return c;});}
    drawPortrait(canvas,id,size){const index=this.resolveCharacter(id),ch=CHARACTERS[index];const g=canvas.getContext('2d');const ratio=Math.min(window.devicePixelRatio||1,2);const w=size||canvas.clientWidth||120;canvas.width=w*ratio;canvas.height=w*ch.head[3]/ch.head[2]*ratio;g.setTransform(ratio,0,0,ratio,0,0);g.clearRect(0,0,w,w*ch.head[3]/ch.head[2]);if(this.heads)g.drawImage(this.heads[index],0,0,w,w*ch.head[3]/ch.head[2]);}
    renderPortrait(canvas,id,size){this.drawPortrait(canvas,id,size);}
    resolveCharacter(id){const index=typeof id==='number'?id:CHARACTERS.findIndex(c=>c.id===id||c.name===id);return index>=0&&index<4?index:0;}
    setCharacter(id){this.selected=this.resolveCharacter(id);}
    resize(){const oldHeight=this.height,oldRatio=this.aspect;const r=this.canvas.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);if(r.width&&r.height){this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.height=clamp(390*r.height/r.width,540,930);this.aspect=r.width/r.height;if(this.player&&oldHeight!==this.height){const factor=this.height/oldHeight;this.player.y*=factor;this.obstacles.forEach(o=>o.center*=factor);this.previousCenter*=factor;}if(oldRatio&&Math.abs(this.aspect-oldRatio)>.25&&this.state==='playing')this.pause();}this.draw();}
    start(){
      cancelAnimationFrame(this.frame);this.state='playing';this.score=0;this.hearts=0;this.gates=0;this.elapsed=0;this.obstacles=[];this.particles=[];this.accumulator=0;this.last=0;this.spawnIn=1.2;this.deathTime=0;
      this.seed=(Date.now()^Math.floor(Math.random()*1e8))>>>0;this.previousCenter=this.height*.46;this.player={x:110,y:this.height*.46,vy:0};
      this.callbacks.onScore?.({score:0,hearts:0,gates:0,reason:'start'});this.flap();this.frame=requestAnimationFrame(this.tick);
    }
    random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
    flap(){if(this.state!=='playing')return;this.player.vy=-CHARACTERS[this.selected].jump;this.burst(this.player.x-18,this.player.y+4,4,'trail');}
    pause(){if(this.state!=='playing')return;this.state='paused';cancelAnimationFrame(this.frame);this.frame=0;this.last=0;this.accumulator=0;this.draw();this.callbacks.onPause?.();}
    resume(){if(this.state!=='paused')return;this.state='playing';this.last=0;this.accumulator=0;this.frame=requestAnimationFrame(this.tick);}
    stop(){this.state='stopped';cancelAnimationFrame(this.frame);this.frame=0;this.last=0;this.obstacles=[];this.particles=[];this.draw();}
    destroy(){this.stop();this.resizeObserver.disconnect();this.source.onload=null;this.source.onerror=null;}
    addScore(points,reason){this.score+=points;this.callbacks.onScore?.({score:this.score,hearts:this.hearts,gates:this.gates,reason});}
    burst(x,y,count,kind){if(this.reducedMotion)return;for(let i=0;i<count;i++){const life=kind==='trail'?.5:.85;this.particles.push({x,y,vx:kind==='trail'?-35-this.random()*65:(this.random()-.5)*180,vy:(this.random()-.5)*140,life,total:life,kind,size:kind==='trail'?7+this.random()*6:9+this.random()*9});}}
    spawnObstacle(){const progress=Math.min(1,this.elapsed/95),gap=232-progress*35;const margin=62+gap/2;const target=this.previousCenter+(this.random()-.5)*160;const center=clamp(target,margin,this.height-margin);this.previousCenter=center;this.obstacles.push({x:430,center,gap,passed:false,collected:false,heart:this.random()>.22});this.spawnIn=1.92-progress*.17;}
    collide(o){const p=this.player,r=18,t=o.center-o.gap/2,b=o.center+o.gap/2;
      // Needles occupy only a narrow strip; the barrel starts 57 px behind each tip.
      return hitRect(p.x,p.y,r,o.x-2,0,4,t)||hitRect(p.x,p.y,r,o.x-21,0,42,t-57)||hitRect(p.x,p.y,r,o.x-9,t-57,18,20)||hitRect(p.x,p.y,r,o.x-2,b,4,this.height-b)||hitRect(p.x,p.y,r,o.x-21,b+57,42,this.height-b-57)||hitRect(p.x,p.y,r,o.x-9,b+37,18,20);
    }
    die(){if(this.state!=='playing')return;this.state='dying';this.deathTime=0;this.burst(this.player.x,this.player.y,15,'hit');this.callbacks.onHit?.();}
    update(dt){
      if(this.state==='playing'){
        this.elapsed+=dt;this.player.vy=Math.min(540,this.player.vy+CHARACTERS[this.selected].gravity*dt);this.player.y+=this.player.vy*dt;this.spawnIn-=dt;if(this.spawnIn<=0)this.spawnObstacle();
        const speed=123+Math.min(38,this.elapsed*.4);
        for(const o of this.obstacles){o.x-=speed*dt;if(this.collide(o)){this.die();break;}
          if(!o.passed&&o.x+25<this.player.x-18){o.passed=true;this.gates++;this.addScore(1,'gate');}
          if(o.heart&&!o.collected&&Math.hypot(this.player.x-o.x,this.player.y-o.center)<31){o.collected=true;this.hearts++;this.addScore(3,'heart');this.burst(o.x,o.center,11,'heart');}}
        this.obstacles=this.obstacles.filter(o=>o.x>-50);if(this.player.y<18||this.player.y>this.height-18)this.die();
      }else if(this.state==='dying'){
        this.deathTime+=dt;this.player.vy+=600*dt;this.player.y=Math.min(this.height+80,this.player.y+this.player.vy*dt);
        if(this.deathTime>=.5){this.state='over';this.callbacks.onGameOver?.({score:this.score,hearts:this.hearts,gates:this.gates,duration:this.elapsed,character:CHARACTERS[this.selected].id});}
      }
      for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}this.particles=this.particles.filter(p=>p.life>0);
    }
    syringe(x,tip,inverted){const g=this.ctx;g.save();g.translate(x,tip);if(inverted)g.scale(1,-1);
      // Each obstacle is drawn at native geometry: metallic needle, hub, glass and fluid.
      g.lineJoin='round';g.strokeStyle='#031523';g.lineWidth=3;
      g.beginPath();g.moveTo(0,0);g.lineTo(-2,37);g.lineTo(2,37);g.closePath();g.fillStyle='#cde8f1';g.fill();g.stroke();
      g.fillStyle='#e6f3f8';g.beginPath();g.roundRect(-8,36,16,23,3);g.fill();g.stroke();
      const length=this.height+50;const glass=g.createLinearGradient(-21,0,21,0);glass.addColorStop(0,'#96a9bb');glass.addColorStop(.2,'#edf4fb');glass.addColorStop(.55,'#ffffff');glass.addColorStop(1,'#a7bfce');g.fillStyle=glass;g.beginPath();g.roundRect(-21,57,42,length,7);g.fill();g.stroke();
      const blood=g.createLinearGradient(-17,0,17,0);blood.addColorStop(0,'#a50e2b');blood.addColorStop(.4,'#ff3953');blood.addColorStop(1,'#d80032');g.fillStyle=blood;g.fillRect(-17,68,34,86);g.fillStyle='#ffffff85';g.fillRect(-12,62,5,length-7);
      g.strokeStyle='#183548';g.lineWidth=1.5;for(let y=74;y<length;y+=14){g.beginPath();g.moveTo(10,y);g.lineTo(y%28===4?-3:3,y);g.stroke();}g.restore();
    }
    draw(){const g=this.ctx;if(!g)return;g.setTransform(this.canvas.width/this.width,0,0,this.canvas.height/this.height,0,0);g.clearRect(0,0,this.width,this.height);if(!this.player||this.state==='stopped')return;g.save();
      if(this.state==='dying'&&!this.reducedMotion){const decay=1-this.deathTime/.5;g.translate(Math.sin(this.deathTime*100)*4*decay,Math.cos(this.deathTime*75)*3*decay);}
      for(const o of this.obstacles){this.syringe(o.x,o.center-o.gap/2,true);this.syringe(o.x,o.center+o.gap/2,false);if(o.heart&&!o.collected){g.save();g.shadowColor='#ff5075';g.shadowBlur=14;g.fillStyle='#ff315b';heart(g,o.x,o.center,24+(this.reducedMotion?0:Math.sin(this.elapsed*5)*2));g.restore();}}
      for(const p of this.particles){g.globalAlpha=clamp(p.life/p.total,0,1);g.fillStyle=p.kind==='hit'?'#ffe699':'#ff6585';heart(g,p.x,p.y,p.size);}g.globalAlpha=1;
      const p=this.player;g.translate(p.x,p.y);g.rotate(clamp(p.vy*.0015,-.35,.95));if(this.heads){const ch=CHARACTERS[this.selected],h=62*ch.head[3]/ch.head[2];g.shadowColor='#001322';g.shadowBlur=9;g.drawImage(this.heads[this.selected],-31,-h/2,62,h);}g.restore();
      if(this.state==='dying'&&!this.reducedMotion){g.fillStyle=`rgba(255,77,96,${Math.max(0,.14-this.deathTime*.4)})`;g.fillRect(0,0,this.width,this.height);}
    }
    tick(now){if(!['playing','dying'].includes(this.state))return;const delta=this.last?Math.min((now-this.last)/1000,.08):0;this.last=now;this.accumulator+=delta;while(this.accumulator>=1/120&&['playing','dying'].includes(this.state)){this.update(1/120);this.accumulator-=1/120;}this.draw();if(['playing','dying'].includes(this.state))this.frame=requestAnimationFrame(this.tick);}
  }
  window.GuardiaEngine=GuardiaEngine;
})();
