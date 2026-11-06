import {spawn} from 'node:child_process';
import {writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import ffmpegStatic from 'ffmpeg-static';
import {PROMO_ROOT} from './serve.mjs';

const file=path.join(PROMO_ROOT,'output','CardShare-1080x1920-60fps.mp4');
const executable=process.env.FFMPEG_PATH||ffmpegStatic;
function ffmpeg(args){return new Promise((resolve,reject)=>{
  const child=spawn(executable,args,{windowsHide:true});let stdout='',stderr='';
  child.stdout.on('data',data=>stdout+=data);child.stderr.on('data',data=>stderr+=data);
  child.on('error',reject);child.on('close',code=>code===0?resolve({stdout,stderr}):reject(new Error(stderr)));
});}
const decoded=await ffmpeg(['-hide_banner','-nostats','-threads','4','-i',file,'-map','0:v:0','-map','0:a:0','-progress','pipe:1','-f','null','-']);
const frames=Number([...decoded.stdout.matchAll(/^frame=(\d+)/gm)].at(-1)?.[1]);
const durationMatch=decoded.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
const duration=durationMatch?Number(durationMatch[1])*3600+Number(durationMatch[2])*60+Number(durationMatch[3]):NaN;
const video=decoded.stderr.split('\n').find(line=>line.includes('Video: h264'))?.trim();
const audio=decoded.stderr.split('\n').find(line=>line.includes('Audio: aac'))?.trim();
const report={file,bytes:(await stat(file)).size,frames,duration,video,audio,passed:frames===2640&&Math.abs(duration-44)<.05&&video?.includes('1080x1920')&&video?.includes('60 fps')&&audio?.includes('48000 Hz')&&audio?.includes('stereo')};
await writeFile(path.join(PROMO_ROOT,'output','qa','video-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
await ffmpeg(['-hide_banner','-loglevel','error','-y','-ss','24.9','-i',file,'-frames:v','1',path.join(PROMO_ROOT,'output','qa','encoded-order.png')]);
await ffmpeg(['-hide_banner','-loglevel','error','-y','-ss','41','-i',file,'-frames:v','1',path.join(PROMO_ROOT,'output','qa','encoded-ending.png')]);
