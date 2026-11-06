import {createPreviewServer} from './serve.mjs';
import {launchFilmBrowser,prepareFilmPage,seekFrame} from './browser.mjs';
const preview=await createPreviewServer({port:0});
const browser=await launchFilmBrowser();
try{
  const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await prepareFilmPage(page,preview.origin);
  const cdp=await page.context().newCDPSession(page);
  for(const at of [1,12]){
    const start=performance.now();
    for(let i=0;i<10;i++){await seekFrame(page,at+i/60);await cdp.send('Page.captureScreenshot',{format:'png',optimizeForSpeed:true,fromSurface:true,captureBeyondViewport:false});}
    console.log(`${at}s: ${((performance.now()-start)/10).toFixed(0)}ms/frame`);
  }
}finally{await browser.close();await preview.close();}
