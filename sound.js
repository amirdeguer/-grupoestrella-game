'use strict';
window.GuardiaAudio=class {
 constructor(){this.ctx=null;this.sound=true;this.music=true;this.timer=null;this.step=0;this.mode='menu'}
 async unlock(){try{if(!this.ctx){this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.6;this.master.connect(this.ctx.destination);this.sfx=this.ctx.createGain();this.sfx.connect(this.master);this.bgm=this.ctx.createGain();this.bgm.connect(this.master);this.apply();}if(this.ctx.state==='suspended')await this.ctx.resume();if(!this.timer)this.timer=setInterval(()=>this.tick(),280)}catch{}}
 apply(){if(!this.ctx)return;this.sfx.gain.setTargetAtTime(this.sound?1:0,this.ctx.currentTime,.03);this.bgm.gain.setTargetAtTime(this.music?1:0,this.ctx.currentTime,.1)}
 settings(sound,music){this.sound=sound;this.music=music;this.apply()}
 setMode(mode){this.mode=mode}
 note(freq,length=.12,gain=.06,type='sine',bus='sfx',delay=0,endFreq){if(!this.ctx||this.ctx.state!=='running')return;const at=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);if(endFreq)o.frequency.exponentialRampToValueAtTime(endFreq,at+length);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(gain,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+length);o.connect(g);g.connect(this[bus]);o.start(at);o.stop(at+length+.01)}
 tick(){if(!this.music||document.hidden||['paused','over'].includes(this.mode))return;const melody=[523,0,659,784,0,659,587,0,523,0,659,880,784,0,659,0];const n=melody[this.step%melody.length];if(n)this.note(n,.16,.018,'sine','bgm');if(this.step%8===0){this.note(131,.25,.024,'triangle','bgm');this.note(1046,.07,.012,'sine','bgm',.1)}this.step++}
 play(kind){if(!this.sound)return;const events={click:()=>this.note(460,.06,.045),flap:()=>this.note(480,.085,.045,'sine','sfx',0,760),point:()=>{this.note(880,.12,.06);this.note(1175,.13,.045,'sine','sfx',.07)},heart:()=>{[784,988,1175].forEach((n,i)=>this.note(n,.16,.05,'sine','sfx',i*.06))},hit:()=>this.note(220,.35,.1,'triangle','sfx',0,55)};events[kind]?.()}
 suspend(){this.ctx?.suspend().catch(()=>{})}
};
