import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createPreviewServer, PROMO_ROOT } from './serve.mjs';
import { launchFilmBrowser, prepareFilmPage, seekFrame } from './browser.mjs';

const preview = await createPreviewServer({port:0});
const browser = await launchFilmBrowser();
try {
  const page = await browser.newPage({viewport:{width:540,height:960}, deviceScaleFactor:1});
  page.on('requestfailed',r=>console.log('REQUEST',r.url(),r.failure()));
  await prepareFilmPage(page,preview.origin);
  const folder=path.join(PROMO_ROOT,'output','qa');
  await mkdir(folder,{recursive:true});
  async function state(name) {
    await page.locator('#film').screenshot({path:path.join(folder,`seek-${name}.png`)});
    return page.evaluate(()=>({time:cardShareFilm.time,dom:[...document.querySelectorAll('#film *')].map((el,i)=>({key:el.id||`${i}:${el.tagName}.${el.className?.baseVal??el.className}`,style:el.getAttribute('style'),attrs:el.tagName==='path'?el.getAttribute('d'):null,svg:el.tagName==='circle'?`${el.getAttribute('cx')},${el.getAttribute('cy')}`:null,text:el.id==='product-step'?el.textContent:null})),canvas:document.querySelector('canvas').toDataURL()}));
  }
  for(const t of [0,0.7,1.8,2.8,3.7,5.1,6.7,8,9.7,11.2,12.8,14.4,16.5,18.5,20.1,21.6,23.4])await seekFrame(page,t);
  await seekFrame(page,12.8);const a=await state('a');
  await seekFrame(page,22.2);await seekFrame(page,2.3);await seekFrame(page,12.8);const b=await state('b');
  const changes=a.dom.map((item,i)=>({a:item,b:b.dom[i]})).filter(item=>JSON.stringify(item.a)!==JSON.stringify(item.b));
  console.log('DIFF',JSON.stringify({time:[a.time,b.time],canvasSame:a.canvas===b.canvas,changes},null,2));
  await writeFile(path.join(folder,'seek-diff.json'),JSON.stringify({time:[a.time,b.time],canvasSame:a.canvas===b.canvas,changes},null,2));
  const images=await Promise.all(['a','b'].map(async label=>'data:image/png;base64,'+(await readFile(path.join(folder,`seek-${label}.png`))).toString('base64')));
  const pixelDiff=await page.evaluate(async sources=>{
    const canvas=document.createElement('canvas');canvas.width=540;canvas.height=960;const ctx=canvas.getContext('2d');
    const pixels=[];for(const source of sources){const img=new Image();img.src=source;await img.decode();ctx.drawImage(img,0,0);pixels.push(ctx.getImageData(0,0,540,960).data);}
    let count=0,maxDelta=0,minX=540,minY=960,maxX=0,maxY=0;const rows={};
    const diff=ctx.createImageData(540,960);
    for(let p=0;p<540*960;p++){const offset=p*4;let delta=0;for(let c=0;c<3;c++)delta=Math.max(delta,Math.abs(pixels[0][offset+c]-pixels[1][offset+c]));if(delta){count++;maxDelta=Math.max(maxDelta,delta);const x=p%540,y=Math.floor(p/540);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);rows[Math.floor(y/100)]=(rows[Math.floor(y/100)]||0)+1;}diff.data[offset]=delta?255:0;diff.data[offset+1]=delta?50:0;diff.data[offset+3]=255;}
    ctx.putImageData(diff,0,0);return{count,maxDelta,box:{minX,minY,maxX,maxY},rows,image:canvas.toDataURL()};
  },images);
  await writeFile(path.join(folder,'seek-pixel-diff.png'),Buffer.from(pixelDiff.image.split(',')[1],'base64'));delete pixelDiff.image;console.log('PIXELS',JSON.stringify(pixelDiff));
  await prepareFilmPage(page,preview.origin,{capture:false});
  console.log('BEFORE',await page.evaluate(()=>({time:cardShareFilm.time,value:document.querySelector('#scrubber').value})));
  await page.locator('#scrubber').evaluate(el=>{el.value='13.2';el.dispatchEvent(new Event('input',{bubbles:true}));});
  console.log('SCRUB',await page.evaluate(()=>({time:cardShareFilm.time,value:document.querySelector('#scrubber').value})));
  await page.locator('#play-toggle').click();await page.waitForTimeout(300);
  console.log('PLAY',await page.evaluate(()=>({time:cardShareFilm.time,playing:cardShareFilm.playing})));
  await page.locator('#play-toggle').click();await page.waitForTimeout(200);
  console.log('PAUSE',await page.evaluate(()=>({time:cardShareFilm.time,playing:cardShareFilm.playing})));
} finally {await browser.close();await preview.close();}
