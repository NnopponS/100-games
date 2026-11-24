'use strict';
const assert=require('node:assert/strict');
const {readFileSync,readdirSync}=require('node:fs');
const vm=require('node:vm');
const root=require('node:path').resolve(__dirname,'..');
const src=readFileSync(root+'/assets/stage-light.js','utf8');
const rules=readFileSync(root+'/assets/stage-light.css','utf8');
function sandbox(stage){
 class Gradient {constructor(){this.stops=[];} addColorStop(offset,color){this.stops.push([offset,color]);}}
 class Canvas {
  constructor(connected=true,w=480,h=320){this.canvas={width:w,height:h,isConnected:connected,id:'game',closest:()=>null};this.globalCompositeOperation='source-over';this.record=[];this.fillStyle='white';}
  getTransform(){return this.tx??{a:1,b:0,c:0,d:1,e:0,f:0};}
  createLinearGradient(){return new Gradient;} createRadialGradient(){return new Gradient;}
  fillRect(...args){this.record.push({name:'rect',fill:this.fillStyle,args});}
  clearRect(...args){this.record.push({name:'clear',args});}
  fillText(...args){this.record.push({name:'text',fill:this.fillStyle,args});}
  strokeText(...args){this.record.push({name:'strokeText',fill:this.strokeStyle,args});}
  stroke(...args){this.record.push({name:'stroke',fill:this.strokeStyle,args});}
  createImageData(width,height){return {width,height,data:new Uint8ClampedArray(width*height*4)};}
  putImageData(...args){this.record.push({name:'image',args});}
 }
 const doc={documentElement:{dataset:{}}};
 const win={CanvasGradient:Gradient,CanvasRenderingContext2D:Canvas};
 vm.runInNewContext(src,{window:win,document:doc,location:{pathname:'/100-games/'+stage+'-test/index.html'}});
 assert.equal(doc.documentElement.dataset.arcadeStage,stage);
 return Canvas;
}
const ids=readdirSync(root).filter(x=>/^\d{2,3}-/.test(x)).map(x=>x.split('-')[0]);
assert.equal(ids.length,100);
for(const id of ids){
 assert(rules.includes('html[data-arcade-stage="'+id+'"] body{background-color:#f3f6fc;color:#17233a}'),id);
 const Canvas=sandbox(id),c=new Canvas;
 c.fillStyle='#101621'; c.fillRect(0,0,480,320); assert.notEqual(c.record[0].fill,'#101621'); assert.equal(c.fillStyle,'#101621');
 c.fillRect(50,70,12,12); assert.equal(c.record[1].fill,'#101621');
 const gradient=c.createLinearGradient(10,0,10,320);
 gradient.addColorStop(0,'#112233');gradient.addColorStop(1,'rgba(0,0,0,0.4)');
 c.fillStyle=gradient;
 c.fillRect(0,0,480,320); assert.notEqual(c.record[2].fill,gradient); assert.equal(gradient.stops[0][1],'#112233');
 assert.equal(c.fillStyle,gradient);
 c.fillRect(20,20,16,16); assert.equal(c.record[3].fill,gradient);
 c.fillStyle='white';c.fillText('Score',40,100);assert.notEqual(c.record[4].fill,'white');assert.equal(c.fillStyle,'white');
 c.tx={a:2,b:0,c:0,d:2,e:0,f:0};c.fillStyle='#111111';c.fillRect(0,0,240,160); assert.notEqual(c.record[5].fill,'#111111');
 c.globalCompositeOperation='destination-in'; c.fillRect(0,0,240,160); assert.equal(c.record[6].fill,'#111111');
 const spriteCtx=new Canvas(false,256,128);
 spriteCtx.fillStyle='#183033';spriteCtx.fillRect(0,0,256,128);
 assert.equal(spriteCtx.record[0].fill==='#183033',!['25','71','82'].includes(id));
}
const Sand=sandbox('70'),s=new Sand(true,160,100),im=s.createImageData(160,100);
im.data.set([20,21,26,255,221,190,75,255]);s.putImageData(im,0,0);
const image=s.record[0].args[0];
assert.deepEqual([...image.data.slice(0,8)],[236,240,249,255,221,190,75,255]);
assert.deepEqual([...im.data.slice(0,8)],[20,21,26,255,221,190,75,255]);
assert(rules.includes('color-scheme:only light!important'));
console.log('100 stage palettes and canvas route markers; full backdrop/gradient/Text whitelisted; sprite, composite masks, and Sand materials preserved.');
