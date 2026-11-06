import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {PROMO_ROOT} from './serve.mjs';
import {launchFilmBrowser,monitorPage,seekFrame} from './browser.mjs';
const target=path.join(PROMO_ROOT,'output','CardShare — One Connection.html');
const browser=await launchFilmBrowser();
try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=monitorPage(page),external=[];
  page.on('pageerror',error=>console.log(`Browser error: ${error.message}`));
  await page.route(/^https?:/,route=>{external.push(route.request().url());return route.abort();});
  await page.goto(pathToFileURL(target).href,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.cardShareFilm?.ready,null,{timeout:90000});
  console.log('Offline picture ready.');
  await page.locator('#sound-toggle').click();await page.locator('#play-toggle').click();
  await page.waitForTimeout(700);
  const audio=await page.evaluate(()=>{const a=document.querySelector('audio');return{duration:a.duration,playing:!a.paused,time:a.currentTime,film:window.cardShareFilm.time};});
  await page.evaluate(()=>window.cardShareFilm.pause());
  const before=await page.evaluate(()=>window.cardShareFilm.time);
  const states=[];
  for(const at of [8.8,15.1,18.8,24.9,31.2,34.5,41]){
    await seekFrame(page,at);
    const first=await page.evaluate(()=>Array.from(document.querySelectorAll('canvas'),c=>c.toDataURL()));
    await seekFrame(page,43);await seekFrame(page,.1);await seekFrame(page,at);
    const second=await page.evaluate(()=>Array.from(document.querySelectorAll('canvas'),c=>c.toDataURL()));
    states.push({at,equal:JSON.stringify(first)===JSON.stringify(second)});
  }
  const loaded=await page.evaluate(()=>({duration:window.cardShareFilm.duration,broken:Array.from(document.images).filter(i=>!i.naturalWidth).length,overflow:document.documentElement.scrollWidth>innerWidth+1}));
  const html=await readFile(target,'utf8');
  const report={...loaded,externalRequests:external,errors,audio,repeatSeeks:states,paused:before>0,embeddedImages:!html.includes('./assets/app/'),passed:loaded.duration===44&&!loaded.broken&&!loaded.overflow&&!external.length&&!errors.length&&audio.duration===44&&audio.playing&&audio.time>0&&Math.abs(audio.film-audio.time)<.15&&states.every(s=>s.equal)};
  await writeFile(path.join(PROMO_ROOT,'output','qa','standalone-report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}finally{await browser.close();}
