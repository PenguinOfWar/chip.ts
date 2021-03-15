(this["webpackJsonpchip.ts"]=this["webpackJsonpchip.ts"]||[]).push([[0],{56:function(e,t,s){},58:function(e,t,s){},59:function(e,t,s){"use strict";s.r(t);var i=s(0),r=s.n(i),n=s(24),a=s.n(n),c=s(14),o=s.n(c),h=s(25),u=s(29),l=s(11),b=s(28),d=s.n(b),g=s(10),k=s(6),f=s(7),m=[240,144,144,144,240,32,96,32,32,112,240,16,240,128,240,240,16,240,16,240,144,144,240,16,16,240,128,240,16,240,240,128,240,144,240,240,16,32,64,64,240,144,240,144,240,240,144,240,16,240,240,144,240,144,144,224,144,224,144,224,240,128,128,128,240,224,144,144,144,224,240,128,240,128,240,240,128,240,128,128],p=function(){function e(t,s){Object(k.a)(this,e),this.memory=new Uint8Array(new ArrayBuffer(4096)),this.registers=new Uint8Array(16),this.stack=new Uint16Array(16),this.stackPointer=0,this.counter=512,this.gfx=void 0,this.pointer=0,this.screen=new Uint8Array,this.delayTimer=0,this.soundTimer=0,this.keys={},this.key=0,this.running=!1,this.gfx=s,this.screen=new Uint8Array(this.gfx.resolution.x*this.gfx.resolution.y),this.load(t)}return Object(f.a)(e,[{key:"load",value:function(e){var t=this;this.loadFont(),e.map((function(e,s){var i=s+512;return t.memory[i]=e,e})),this.start()}},{key:"loadFont",value:function(){var e=this;return m.map((function(t,s){return e.memory[s]=t}))}},{key:"start",value:function(){this.running=!0}},{key:"stop",value:function(){this.running=!1}},{key:"next",value:function(){this.running&&this.tick()}},{key:"tick",value:function(){this.delayTimer>0&&--this.delayTimer,this.soundTimer>0&&--this.soundTimer;var e=this.memory[this.counter]<<8|this.memory[this.counter+1],t=(3840&e)>>8,s=(240&e)>>4,i=255&e,r=4095&e,n=!1;switch(61440&e){case 0:switch(e){case 224:this.gfx.disp_clear();break;case 238:0===this.stack[this.stackPointer]&&console.warn("Invalid return from subroutine."),this.counter=this.stack[this.stackPointer],this.stack[this.stackPointer]=0,this.stackPointer>0&&--this.stackPointer}break;case 4096:this.counter=r,n=!0;break;case 8192:0!==this.stack[this.stackPointer]&&++this.stackPointer,this.stack[this.stackPointer]=this.counter,this.counter=r,n=!0;break;case 12288:this.registers[t]===i&&(this.counter+=2);break;case 16384:this.registers[t]!==i&&(this.counter+=2);break;case 20480:this.registers[t]===this.registers[s]&&(this.counter+=2);break;case 24576:this.registers[t]=255&e;break;case 28672:this.registers[t]+=i;break;case 32768:switch(15&e){case 0:this.registers[t]=this.registers[s];break;case 1:this.registers[t]=this.registers[t]|this.registers[s];break;case 2:this.registers[t]=this.registers[t]&this.registers[s];break;case 3:this.registers[t]=this.registers[t]^this.registers[s];break;case 4:this.registers[t]+this.registers[s]>255?this.registers[15]=1:this.registers[15]=0,this.registers[t]+=this.registers[s];break;case 5:this.registers[t]<this.registers[s]?this.registers[15]=0:this.registers[15]=1,this.registers[t]-=this.registers[s];break;case 6:this.registers[t]%2===0?this.registers[15]=0:this.registers[15]=1,this.registers[t]=this.registers[t]>>1;break;case 7:this.registers[s]<this.registers[t]?this.registers[15]=0:this.registers[15]=1,this.registers[t]=this.registers[s]-this.registers[t];break;case 14:this.registers[t]<128?this.registers[15]=0:this.registers[15]=1,this.registers[t]=this.registers[t]<<1;break;default:throw new Error("Unknown opcode in 8000 block: ".concat(e.toString(16)))}break;case 36864:this.registers[t]!==this.registers[s]&&(this.counter+=2);break;case 40960:this.pointer=r;break;case 45056:this.counter=(4095&e)+this.registers[0],n=!0;break;case 49152:this.registers[t]=Math.floor(255*Math.random())%255&i;break;case 53248:var a,c=15&e,o={x:this.registers[t],y:this.registers[s]};this.registers[15]=0;for(var h=0;h<c;h++){a=this.memory[this.pointer+h];for(var u=0;u<this.gfx.resolution.scale;u++)o.x+u===this.gfx.resolution.x&&(o.x=-u),o.y+h===this.gfx.resolution.y&&(o.y=-h),(128&a)>0&&this.setPixel(this.registers[t]+u,this.registers[s]+h)&&(this.registers[15]=1),a<<=1;o.x=this.registers[t],o.y=this.registers[s]}break;case 57344:switch(i){case 158:this.key===this.registers[t]&&(this.counter+=2);break;case 161:this.key!==this.registers[t]&&(this.counter+=2);break;default:throw new Error("Unknown opcode in e000 block: ".concat(e.toString(16)))}break;case 61440:switch(i){case 7:this.registers[t]=this.delayTimer;break;case 10:if(0===this.key)return void this.stop();this.registers[t]=this.key,this.start();break;case 21:this.delayTimer=this.registers[t];break;case 24:this.soundTimer=this.registers[t];break;case 30:this.pointer+=this.registers[t];break;case 41:this.pointer=5*this.registers[t];break;case 51:var l=[this.registers[t]/100,this.registers[t]/10%10,this.registers[t]%10];this.memory[this.pointer]=l[0],this.memory[this.pointer+1]=l[1],this.memory[this.pointer+2]=l[2];break;case 85:for(var b=0;b<=t;b++)this.memory[this.pointer+b]=this.registers[b];break;case 101:for(var d=0;d<=t;d++)this.registers[d]=this.memory[this.pointer+d];this.pointer=this.pointer+t+1}break;default:throw new Error("Unknown opcode: ".concat(e.toString(16)))}n||(this.counter+=2)}},{key:"display",get:function(){return this.screen}},{key:"setPixel",value:function(e,t){var s=this.gfx.resolution.x,i=this.gfx.resolution.y;e>s?e-=s:e<0&&(e+=s),t>i?t-=i:t<0&&(t+=i);var r=e+t*s;return this.display[r]^=1,!this.screen[r]}},{key:"input",value:function(e){this.key=e}}]),e}(),v=function(){function e(t){Object(k.a)(this,e),this.colors={background:"#000",foreground:"#00ff00"},this.canvas=null,this.context=null,this.grid=!1,this.resolution={x:64,y:32,scale:8},this.canvas=t.current,this.boot()}return Object(f.a)(e,[{key:"toggleGrid",value:function(){this.grid=!this.grid}},{key:"boot",value:function(){this.context=this.canvas.getContext("2d"),this.canvas.width=this.resolution.x*this.resolution.scale,this.canvas.height=this.resolution.y*this.resolution.scale,this.disp_clear()}},{key:"disp_clear",value:function(){var e;(null===(e=this.context)||void 0===e?void 0:e.clearRect)&&this.context.clearRect(0,0,this.resolution.x*this.resolution.scale,this.resolution.y*this.resolution.scale)}},{key:"paint",value:function(e){var t=this;if(this.disp_clear(),this.context){var s=this.context,i=this.resolution;e.map((function(e,r){var n=r%i.x*i.scale,a=Math.floor(r/i.x)*i.scale;return s.fillStyle=[t.colors.background,t.colors.foreground][e],s.strokeStyle=[t.colors.background,t.colors.foreground][e],e||!t.grid?s.fillRect(n,a,t.resolution.scale,t.resolution.scale):s.strokeRect(n,a,t.resolution.scale,t.resolution.scale),e}))}}}]),e}(),j=function(){function e(t){Object(k.a)(this,e),this.cpu=void 0,this.cpu=t,this.listen()}return Object(f.a)(e,[{key:"press",value:function(e){var t;switch(e){case" ":case"Escape":this.cpu.running?this.cpu.stop():this.cpu.start();break;case"1":t=1;break;case"2":t=2;break;case"3":t=3;break;case"4":t=12;break;case"q":t=4;break;case"w":t=5;break;case"e":t=6;break;case"r":t=13;break;case"a":t=7;break;case"s":t=8;break;case"d":t=9;break;case"f":t=14;break;case"z":t=10;break;case"x":t=0;break;case"c":t=11;break;case"v":t=15}t&&this.cpu.input(t)}},{key:"release",value:function(){this.cpu.input(255)}},{key:"listen",value:function(){var e=this;this.cpu&&(document.addEventListener("keydown",(function(t){var s=t.key;e.press(s)})),document.addEventListener("keyup",(function(){e.release()})))}}]),e}(),y=function(){function e(t,s){Object(k.a)(this,e),this.speed=100,this.frame=0,this.cpu=void 0,this.gfx=void 0,this.keyboard=void 0;var i=new v(s),r=new p(t,i);this.cpu=r,this.gfx=i,this.keyboard=new j(r),this.start(r,i)}return Object(f.a)(e,[{key:"start",value:function(e,t){var s=this,i=!1;setInterval((function(){i||(i=!0,e.next(),i=!1)}),1e3/this.speed);this.frame=requestAnimationFrame((function i(){s.frame=requestAnimationFrame(i);var r=e.display;t.paint(r)}))}},{key:"stop",value:function(){cancelAnimationFrame(this.frame)}}]),e}(),x=(s(56),s(1));var w=function(){var e=Object(i.useRef)(null),t=["Brix","Tetris","Pong"],s={brix:"Left: Q | Right: E",tetris:"Left: W | Right: E | Rotate: Q",pong:"P1 Up: 1 | P1 Down: Q | P2 Up: 4 | P2 Down: R"},r=Object(i.useState)(t[0].toLowerCase()),n=Object(u.a)(r,2),a=n[0],c=n[1],b=Object(i.useCallback)(Object(h.a)(o.a.mark((function t(){var s,i,r,n,c;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,d()({url:"".concat("/chip.ts","/roms/").concat(a),method:"GET",responseType:"blob"});case 2:return s=t.sent,i=new Blob([s.data]),t.next=6,i.arrayBuffer();case 6:r=t.sent,n=new Uint8Array(r),c=new y(n,e),window.chip=c;case 10:case"end":return t.stop()}}),t)}))),[a]);Object(i.useEffect)((function(){Object(g.a)()&&e&&(null===e||void 0===e?void 0:e.current)&&b()}),[a,e,b]);var k=function(e){Object(g.a)()&&(window.chip.keyboard.press(e),setTimeout((function(){window.chip.keyboard.release()}),200))};return Object(x.jsxs)("div",{className:"container app",children:[Object(x.jsx)("div",{className:"row",children:Object(x.jsxs)("div",{className:"col-12 text-center mb-3",children:[Object(x.jsx)("h1",{className:"mb-0",children:"CHIP.ts"}),Object(x.jsx)("h2",{children:Object(x.jsx)("small",{className:"text-muted",children:"A CHIP-8 emulator in TypeScript"})}),Object(x.jsx)("canvas",{"data-testid":"canvas",ref:e})]})}),Object(x.jsxs)("div",{className:"row",children:[Object(x.jsx)("div",{className:"col-6 text-center mb-2",children:Object(x.jsx)("button",{className:"btn btn-secondary",onClick:function(){k("Escape")},children:"Pause (Escape / Spacebar)"})}),Object(x.jsx)("div",{className:"col-6 text-center mb-2",children:Object(x.jsx)("button",{className:"btn btn-secondary",onClick:function(){Object(g.a)()&&window.chip.gfx.toggleGrid()},children:"Toggle Grid"})}),Object(x.jsx)("div",{className:"col-12",children:[["1","2","3","4"],["q","w","e","r"],["a","s","d","f"],["z","x","c","v"]].map((function(e,t){return Object(x.jsx)("div",{className:"row",children:e.map((function(e){return Object(x.jsx)("div",{className:"col-3 text-center mb-2",children:Object(x.jsx)("button",{className:"btn btn-secondary w-100",onClick:function(){k(e)},children:e.toUpperCase()})},e)}))},t)}))})]}),s[a]&&Object(x.jsx)("div",{className:"row",children:Object(x.jsx)("div",{className:"col-12",children:Object(x.jsxs)("div",{className:"alert alert-secondary",role:"alert",children:[Object(x.jsxs)("h2",{children:[a," keys:"]}),s[a.toLowerCase()]]})})}),Object(x.jsx)(l.c,{initialValues:{slot:a},onSubmit:function(e){c(e.slot)},children:Object(x.jsx)(l.b,{className:"row justify-content-lg-center",children:Object(x.jsxs)("div",{className:"col-12 text-center",children:[Object(x.jsx)("h3",{children:"Choose a game"}),Object(x.jsx)(l.a,{as:"select",className:"form-control",name:"slot",children:t.map((function(e){return Object(x.jsx)("option",{value:e.toLowerCase(),children:e},e)}))}),Object(x.jsx)("hr",{}),Object(x.jsx)("button",{className:"btn btn-primary",type:"submit",children:"Load"}),Object(x.jsx)("hr",{}),Object(x.jsx)("a",{className:"btn btn-light",href:"https://github.com/PenguinOfWar/chip.ts",children:"View code on GitHub"})]})})})]})},O=function(e){e&&e instanceof Function&&s.e(3).then(s.bind(null,60)).then((function(t){var s=t.getCLS,i=t.getFID,r=t.getFCP,n=t.getLCP,a=t.getTTFB;s(e),i(e),r(e),n(e),a(e)}))};s(58);a.a.render(Object(x.jsx)(r.a.StrictMode,{children:Object(x.jsx)(w,{})}),document.getElementById("root")),O()}},[[59,1,2]]]);
//# sourceMappingURL=main.31fd4f1d.chunk.js.map