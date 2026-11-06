import { gsap } from 'gsap';
import { createWorld } from './world.js';
import { createScreens } from './screens.js';
const DURATION=44,$=s=>document.querySelector(s);
const capture=new URLSearchParams(location.search).get('capture')==='1';
if(capture)document.body.classList.add('capture');
const api={ready:false,duration:DURATION,time:0,playing:false};window.cardShareFilm=api;

async function start(){
  await Promise.all([document.fonts.load('600 16px Poppins'),document.fonts.load('400 16px Poppins'),document.fonts.load('500 16px Poppins'),...Array.from(document.images,i=>i.decode())]);
  document.querySelectorAll('.line').forEach(line=>{const mask=document.createElement('span');mask.className='line-mask';line.before(mask);mask.append(line);});
  document.querySelectorAll('.source-crop').forEach(el=>{
    const [x,y,w,h]=el.dataset.crop.split(',').map(Number),scale=el.offsetWidth/w;
    el.style.height=`${h*scale}px`;const img=el.querySelector('img');
    Object.assign(img.style,{width:`${720*scale}px`,left:`${-x*scale}px`,top:`${-y*scale}px`});
  });
  const world=await createWorld($('#world'),$('#source-01')),w=world.state;
  const screen=createScreens($('#app-screen')),s=screen.state;
  const tl=gsap.timeline({paused:true,defaults:{ease:'power3.inOut'}});
  gsap.set(['#intro','#finale','.heading','#saved-art','#earned-art','#benefit-art p'],{autoAlpha:0});
  gsap.set('.line',{yPercent:110});
  gsap.set('#device',{scale:.68,y:155,rotationY:24,rotationX:9});
  gsap.set('#actual-cta',{y:15,opacity:0});
  function heading(id,start,end){
    tl.set(id,{autoAlpha:1},start);
    tl.to(`${id} .line`,{yPercent:0,duration:.7,stagger:.09,ease:'power3.out'},start);
    tl.to(id,{autoAlpha:0,y:-14,duration:.35},end);
  }
  function navigate(previous,page,at,{from=0,to=0,style='slide',duration=.62}={}){
    tl.set(s,{previous,page,previousScroll:from,scroll:to,transition:0,style},at);
    tl.to(s,{transition:1,duration,ease:'power3.inOut'},at);
  }
  function tap(x,y,at){
    tl.set('#touch',{x:x*454/720-18,y:y*454/720-18,scale:1.2,opacity:0},at);
    tl.to('#touch',{opacity:1,scale:.65,duration:.16},at);
    tl.to('#touch',{opacity:0,scale:1.6,duration:.38},at+.16);
  }
  // Brand mark: the actual screenshot becomes a lit, extruded physical surface.
  tl.to('#blackout',{opacity:0,duration:.55},0);
  tl.to(w,{ry:0,rx:0,rz:0,scale:1,lightX:4,duration:1.8,ease:'power3.out'},.1);
  heading('#intro',.45,3.65);
  tl.to(w,{y:2.5,scale:.22,opacity:0,ry:.6,duration:1.05},3.5);
  tl.to('#device',{opacity:1,y:0,scale:1,rotationY:0,rotationX:0,duration:1.15,ease:'power3.inOut'},3.65);
  heading('#heading-cards',4.05,9.65);
  // Content is stitched from matching areas of the two supplied scroll positions.
  tl.to(s,{scroll:577,duration:1.65,ease:'power2.inOut'},6.7);
  tl.to('#halo',{x:90,opacity:.8,duration:3},5);
  tap(240,65,9.72);
  navigate('cards','circle',10,{from:577,style:'fade',duration:.34});
  heading('#heading-circle',10.05,15.85);
  tl.to(s,{scroll:790,duration:2,ease:'power2.inOut'},12.45);
  // A gentle camera push gives the shared card and real Request card button room.
  tl.to('#device',{scale:1.035,y:-8,duration:1.7,ease:'sine.inOut'},13);
  tl.to('#device',{scale:1,y:0,duration:.75},15.3);
  tap(66,64,16);
  navigate('circle','menu',16.2,{from:790});
  heading('#heading-history',16.15,20.05);
  tap(190,574,17.65);
  navigate('menu','history',17.9);
  // A real Daraz row in the supplied History opens its matching order screen.
  tap(300,650,20.15);
  navigate('history','order',20.4);
  heading('#heading-order',20.45,26.7);
  tl.to(s,{scroll:330,duration:1.65,ease:'power2.inOut'},23.1);
  tl.to('#device',{scale:1.025,y:-5,duration:1.5,ease:'sine.inOut'},23.2);
  // Chat is a separate feature vignette; no fabricated message send or payment.
  tl.to('#device',{rotationY:-7,scale:.95,x:-20,duration:.42},26.78);
  navigate('order','chat',27.05,{from:330,style:'fade',duration:.4});
  tl.to('#device',{rotationY:0,scale:1,x:0,y:0,duration:.75,ease:'power3.out'},27.12);
  heading('#heading-chat',27.08,31.75);
  tl.to(s,{scroll:420,duration:1.65,ease:'power2.inOut'},29.35);
  // The same History components leave the handset at their true proportions.
  navigate('chat','history',32,{from:420,style:'fade',duration:.38});
  heading('#heading-benefit',32,37.65);
  tl.to('#device',{scale:.75,rotationY:10,y:100,opacity:0,duration:.85},32.45);
  tl.fromTo('#saved-art',{y:-12,scale:.96,rotationY:-5},{autoAlpha:1,y:0,scale:1,rotationY:0,duration:.85,ease:'power3.out',immediateRender:false},32.6);
  tl.fromTo('#earned-art',{y:70,scale:.94,rotationY:6},{autoAlpha:1,y:0,scale:1,rotationY:0,duration:.9,ease:'power3.out',immediateRender:false},33.1);
  tl.to('#benefit-art p',{autoAlpha:1,duration:.6},33.6);
  tl.to('#saved-art',{scale:.48,x:0,y:45,rotationY:45,autoAlpha:0,duration:1},37.5);
  tl.to('#earned-art',{scale:.48,x:0,y:-260,rotationY:-45,autoAlpha:0,duration:1},37.58);
  tl.to('#benefit-art p',{autoAlpha:0,duration:.4},37.6);
  tl.set(w,{x:0,y:1.28,z:0,scale:.68,ry:-.35,rx:.06,rz:0},37.6);
  tl.to(w,{opacity:1,scale:.93,ry:0,rx:0,lightX:-4,duration:1.3,ease:'power3.out'},37.9);
  heading('#finale',38.35,44.5);
  tl.to('#actual-cta',{opacity:1,y:0,duration:.65,ease:'power3.out'},39.3);
  tl.to(w,{lightX:4,y:1.31,duration:4,ease:'sine.inOut'},39);
  tl.to('#halo',{x:0,scale:1.2,opacity:1,duration:2},38);
  tl.to('#progress i',{scaleX:1,duration:DURATION,ease:'none'},0);
  tl.to('#orbit',{rotation:12,duration:DURATION,ease:'none'},0);
  // Clamp the master to exactly 44 seconds; the ending holds without fading out.
  tl.duration();tl.pause(0);gsap.ticker.sleep();

  const audio=$('#soundtrack');let soundOn=false,poster=!capture,anchorTime=0,anchorNow=0,raf=0;
  function controls(){
    $('#timecode').textContent=`${api.time.toFixed(1).padStart(4,'0')} / 44.0`;
    $('#scrubber').value=api.time;$('#play-toggle').textContent=api.playing?'Pause':'Play';
    $('#play-toggle').setAttribute('aria-label',api.playing?'Pause film':'Play film');
  }
  function renderAt(time){api.time=Math.max(0,Math.min(DURATION,Number(time)||0));tl.totalTime(api.time,false);screen.render();world.render();controls();}
  api.seek=time=>{poster=false;renderAt(time);anchorTime=api.time;anchorNow=performance.now();if(soundOn)audio.currentTime=api.time;gsap.ticker.sleep();return api.time;};
  api.pause=()=>{api.playing=false;cancelAnimationFrame(raf);audio.pause();controls();};
  function tick(now){if(!api.playing)return;const t=soundOn&&!audio.paused?audio.currentTime:anchorTime+(now-anchorNow)/1000;renderAt(t);if(t>=DURATION-.002){api.pause();renderAt(DURATION);return;}raf=requestAnimationFrame(tick);}
  function updateSound(){$('#sound-toggle').textContent=soundOn?'Sound on':'Sound off';$('#sound-toggle').setAttribute('aria-pressed',String(soundOn));$('#sound-toggle').setAttribute('aria-label',soundOn?'Mute soundtrack':'Enable soundtrack');}
  function playAudio(){audio.currentTime=api.time;audio.play().catch(()=>{soundOn=false;anchorTime=api.time;anchorNow=performance.now();updateSound();});}
  api.play=()=>{if(api.playing)return;if(poster||api.time>=DURATION-.01)api.seek(0);api.playing=true;anchorTime=api.time;anchorNow=performance.now();if(soundOn)playAudio();controls();raf=requestAnimationFrame(tick);};
  function toggleSound(){soundOn=!soundOn;anchorTime=api.time;anchorNow=performance.now();if(!soundOn)audio.pause();else if(api.playing)playAudio();updateSound();}
  $('#play-toggle').onclick=()=>api.playing?api.pause():api.play();
  $('#replay').onclick=()=>{api.pause();api.seek(0);api.play();};
  $('#scrubber').oninput=e=>{const time=Number(e.target.value);api.pause();api.seek(time);};
  $('#sound-toggle').onclick=toggleSound;
  $('#fullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen?.():$('.studio').requestFullscreen?.();
  document.querySelectorAll('[data-seek]').forEach(el=>el.onclick=()=>{api.pause();api.seek(Number(el.dataset.seek));});
  document.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLButtonElement)return;if(e.code==='Space'){e.preventDefault();api.playing?api.pause():api.play();}if(['ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();api.pause();api.seek(api.time+(e.code==='ArrowRight'?.5:-.5));}if(e.code==='KeyM')toggleSound();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)api.pause();});
  function resize(){const width=$('#film').clientWidth;$('#stage-space').style.setProperty('--stage-scale',width/540);world.resize(540,960,Math.min(2,Math.max(1,width/540*devicePixelRatio)));renderAt(api.time);}
  new ResizeObserver(resize).observe($('#film'));resize();renderAt(capture?0:40.5);api.ready=true;
  $('#load-status').textContent='READY / PRESS PLAY';
}
start().catch(error=>{console.error(error);$('#load-status').textContent=`Unable to prepare film: ${error.message}`;});
