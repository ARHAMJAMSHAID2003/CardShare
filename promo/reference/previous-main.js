import { gsap } from 'gsap';
import { createWorld } from './world.js';

const DURATION = 24;
const $ = (selector) => document.querySelector(selector);
const capture = new URLSearchParams(location.search).get('capture') === '1';
if (capture) document.body.classList.add('capture');

const api = {ready:false,duration:DURATION,time:0,playing:false,seek:()=>{},pause:()=>{},play:()=>{}};
window.cardShareFilm = api;

async function start() {
  await Promise.all([
    document.fonts.load('400 16px Poppins'), document.fonts.load('500 16px Poppins'),
    document.fonts.load('600 16px Poppins'), document.fonts.load('700 16px Poppins'),
    $('#original-logo').decode(),
  ]);
  // The DOM, 3D world, luminous thread and transport all sample this one clock.
  // There are no autonomous CSS animations or independently running timelines.
  document.querySelectorAll('[data-split]').forEach((line) => {
    const text = line.textContent;
    line.setAttribute('aria-label',text);
    line.replaceChildren(...Array.from(text).map((letter) => {
      const mask = document.createElement('span'); mask.className = 'char-mask'; mask.setAttribute('aria-hidden','true');
      const char = document.createElement('span'); char.className = 'char'; char.textContent = letter === ' ' ? '\u00a0' : letter;
      mask.append(char); return mask;
    }));
  });

  const world = await createWorld($('#world'));
  const w = world.state;
  const thread = {x0:40,y0:680,c1x:80,c1y:480,c2x:440,c2y:530,x1:405,y1:585,alpha:0,progress:0};
  const threadCore = $('#thread-core'), threadHalo = $('#thread-halo'), threadHead = $('#thread-head');
  const tl = gsap.timeline({paused:true,defaults:{ease:'power3.inOut'}});
  const hidden = ['#friction-copy','#until-copy','#connection-copy','#connection-label','#reveal-copy','#product-copy','#payoff-copy','#finale-copy'];
  gsap.set(hidden,{autoAlpha:0});
  gsap.set('.char',{yPercent:110,rotationX:-35,opacity:0,transformOrigin:'50% 100%'});
  gsap.set('#hook-two',{autoAlpha:0});
  gsap.set('#phone-rig',{x:101,y:249,scale:0.14,rotationY:0,rotationX:0});
  gsap.set('#brand-seal',{x:120,y:372,scale:0.7,rotationY:-15});
  gsap.set('#customer-panel',{x:-330,y:388,rotationY:38,rotationZ:-7});
  gsap.set('#holder-panel',{x:570,y:576,rotationY:-38,rotationZ:7});
  gsap.set('#shopping-panel',{y:145,scale:0.7,rotationX:28,rotationY:-12,rotationZ:-6});
  gsap.set('#discount-token',{x:335,y:519,scale:0.1,rotationY:50,rotationZ:-15});
  gsap.set(['#secondary-offer','#phone-offer'],{y:80,opacity:0});
  gsap.set('#match-panel',{y:95,rotationX:-18});
  gsap.set('#benefit-panel',{y:45,scale:0.92});
  gsap.set('#save-panel',{x:90,y:417,scale:0.46,rotationX:18,rotationY:-15});
  gsap.set('#earn-panel',{x:90,y:578,scale:0.46,rotationX:18,rotationY:15});
  gsap.set('#final-rule',{scaleX:0});
  gsap.set('#final-caption',{opacity:0,y:10});
  gsap.set('.reveal-subtitle',{opacity:0,y:14});
  gsap.set('#reveal-copy>.overline',{opacity:0,y:12});

  function reveal(selector,at,duration=0.65,stagger=0.026) {
    tl.to(`${selector} .char`,{yPercent:0,rotationX:0,opacity:1,duration,stagger,ease:'power3.out'},at);
  }
  function dismiss(selector,at,duration=0.45) {
    tl.to(selector,{y:-40,autoAlpha:0,filter:'blur(5px)',duration,ease:'power3.in'},at);
  }
  function morphThread(at,vars,duration=1) {tl.to(thread,{...vars,duration},at);}

  // 00—03 / A grazing light finds the edge; the camera rolls into the face.
  tl.to('#blackout',{opacity:0,duration:0.65},0.12);
  tl.to('#environment',{opacity:0.7,duration:1.4},0.25);
  tl.to('#floor-glow',{opacity:0.9,duration:1.2},0.7);
  tl.to('#film-masthead',{opacity:1,duration:0.8},0.65);
  tl.to(w,{edge:0.85,light:0.16,duration:0.75},0.1);
  tl.to(w,{cardRY:-0.18,cardRX:0.18,cardRZ:-0.11,cardY:-0.65,cameraZ:10.7,cameraX:0.3,light:0.95,reflection:0.6,duration:1.6,ease:'power2.inOut'},0.45);
  reveal('#hook-one',0.72,0.65,0.018);
  tl.to('#material-caption',{opacity:0.8,duration:0.7},1.25);
  tl.to('#hook-one',{autoAlpha:0,y:-32,filter:'blur(5px)',duration:0.3},1.92);
  tl.set('#hook-two',{autoAlpha:1},2.05);reveal('#hook-two',2.06,0.56,0.019);
  tl.to(w,{cardRY:0.12,cardRX:-0.08,cardRZ:0.05,cameraX:-0.3,percent:1,reflection:0.95,duration:1.1},1.8);
  morphThread(1.25,{alpha:0.65,progress:1},1.6);
  tl.to('#discount-token',{opacity:1,scale:0.7,rotationY:0,rotationZ:-8,duration:0.55,ease:'back.out(1.4)'},2.65);

  // 03—07 / The percentage detaches, becomes a portal, then lands on the offer.
  dismiss('#hook-two',3.03);tl.to('#material-caption',{opacity:0,duration:0.3},3.03);
  tl.to(w,{cardZ:3,cardX:-3.5,cardRY:-1.2,cardScale:1.5,cardOpacity:0,duration:0.85,ease:'power3.in'},3.02);
  tl.to('#discount-token',{x:220,y:390,scale:6.4,rotationZ:0,filter:'blur(7px)',duration:0.5,ease:'power3.in'},3.08);
  tl.to('#discount-token',{x:387,y:317,scale:0.68,filter:'blur(0px)',duration:0.7,ease:'power3.out'},3.58);
  tl.to('#shopping-panel',{opacity:1,y:0,scale:1,rotationX:5,rotationY:-5,rotationZ:-2,duration:0.9,ease:'power3.out'},3.53);
  tl.set('#friction-copy',{autoAlpha:1},3.62);reveal('#friction-copy',3.67,0.65,0.017);
  tl.to('#shopping-panel',{rotationX:0,rotationY:3,rotationZ:1,y:-8,duration:1.6,ease:'sine.inOut'},4.35);
  tl.to('#eligibility-lock',{x:-4,duration:0.09,ease:'sine.inOut',repeat:3,yoyo:true},5.25);
  morphThread(3.4,{x0:76,y0:710,c1x:120,c1y:770,c2x:500,c2y:710,x1:441,y1:351,alpha:0.6,progress:1},1.0);
  tl.to('#concept-note',{opacity:0.7,duration:0.45},3.9);
  dismiss('#friction-copy',5.87,0.42);
  tl.to('#shopping-panel',{scale:0.72,x:185,y:240,rotationY:-36,rotationZ:6,opacity:0,duration:0.65,ease:'power3.in'},5.92);
  tl.to('#discount-token',{scale:0.25,x:440,y:711,opacity:0,duration:0.55},5.95);
  tl.set('#until-copy',{autoAlpha:1},6.03);reveal('#until-copy',6.08,0.5,0.028);
  morphThread(6.0,{alpha:0.15},0.4);
  dismiss('#until-copy',6.93,0.45);

  // 07—11 / Two real people, one connection. Rectangles fold into the mark.
  tl.set('#connection-copy',{autoAlpha:1},7.13);reveal('#connection-copy',7.18,0.6,0.018);
  tl.to('#customer-panel',{x:39,y:377,rotationY:9,rotationZ:-4,opacity:1,duration:0.9,ease:'power3.out'},7.12);
  tl.to('#holder-panel',{x:202,y:575,rotationY:-9,rotationZ:4,opacity:1,duration:0.9,ease:'power3.out'},7.32);
  morphThread(7.0,{x0:190,y0:480,c1x:470,c1y:430,c2x:90,c2y:648,x1:360,y1:650,progress:0,alpha:0},0.01);
  morphThread(7.6,{alpha:1,progress:1},1.24);
  tl.to('#connection-label',{autoAlpha:1,duration:0.5},8.05);
  tl.to('#customer-panel',{x:53,y:365,rotationY:-3,rotationZ:-2,duration:1.2,ease:'sine.inOut'},8.02);
  tl.to('#holder-panel',{x:189,y:567,rotationY:3,rotationZ:2,duration:1.2,ease:'sine.inOut'},8.14);
  dismiss('#connection-copy',8.86,0.4);
  tl.to('#connection-label',{autoAlpha:0,duration:0.3},8.88);
  tl.to('#customer-panel',{x:122,y:377,scale:0.68,rotationY:65,rotationZ:0,opacity:0,duration:0.64,ease:'power3.inOut'},8.94);
  tl.to('#holder-panel',{x:122,y:377,scale:0.68,rotationY:-65,rotationZ:0,opacity:0,duration:0.64,ease:'power3.inOut'},9.02);
  morphThread(8.92,{x0:185,y0:426,c1x:233,c1y:366,c2x:311,c2y:526,x1:355,y1:476,alpha:0.5},0.62);
  tl.to('#brand-seal',{x:120,y:366,scale:1,opacity:1,rotationY:0,rotationX:0,duration:0.7,ease:'back.out(1.1)'},9.25);
  tl.to('.seal-sheen',{xPercent:200,duration:1.2,ease:'sine.inOut'},9.3);
  tl.set('#reveal-copy',{autoAlpha:1},9.32);
  tl.to('#reveal-copy>.overline',{opacity:1,y:0,duration:0.45},9.35);reveal('.reveal-wordmark',9.37,0.66,0.03);
  tl.to('.reveal-subtitle',{opacity:1,y:0,duration:0.65},9.7);
  tl.to('#concept-note',{opacity:0,duration:0.3},9.2);
  tl.to('#floor-glow',{scale:1.35,opacity:1,duration:1},9.2);

  // 11—18 / The same brand mark shrinks into the handset header.
  dismiss('#reveal-copy',10.73,0.48);
  tl.to('#brand-seal',{x:3,y:226,scale:0.107,rotationY:-7,rotationX:4,boxShadow:'0 0 0 rgba(0,0,0,0)',duration:0.93,ease:'power3.inOut'},10.68);
  tl.to('#phone-rig',{x:101,y:249,scale:1,opacity:1,rotationY:-7,rotationX:4,rotationZ:-1,duration:1.06,ease:'power3.inOut'},10.65);
  tl.set('#product-copy',{autoAlpha:1},11.0);reveal('#discover-title',11.04,0.65,0.036);
  tl.to('#phone-offer',{y:0,opacity:1,duration:0.72,ease:'back.out(0.8)'},11.45);
  tl.to('#secondary-offer',{y:0,opacity:1,duration:0.68,ease:'power3.out'},11.62);
  tl.to('#phone-caption-a',{opacity:1,y:0,duration:0.6},11.65);
  tl.to('#concept-note',{opacity:0.8,duration:0.5},11.75);
  morphThread(10.6,{x0:65,y0:720,c1x:20,c1y:460,c2x:500,c2y:430,x1:469,y1:816,alpha:0.5},1.3);
  tl.to('#phone-rig',{rotationY:4,rotationX:1,rotationZ:1,x:100,y:247,duration:2.1,ease:'sine.inOut'},11.72);
  tl.to('#brand-seal',{rotationY:4,rotationX:1,rotationZ:1,x:2,y:224,duration:2.1,ease:'sine.inOut'},11.72);
  tl.to('#discover-title',{y:-30,opacity:0,filter:'blur(3px)',duration:0.35},13.65);reveal('#connect-title',13.84,0.6,0.035);
  tl.set('#product-step',{textContent:'02 — SOMEONE YOU ALREADY TRUST'},13.85);
  tl.to('#phone-caption-a',{opacity:0,y:-14,duration:0.3},13.65);
  tl.fromTo('#phone-caption-b',{y:12},{y:0,opacity:1,duration:0.5},14.0);
  tl.to('#touch-cursor',{opacity:1,scale:1,duration:0.28},13.57);
  tl.to('#touch-cursor',{scale:0.65,duration:0.12},13.9);
  tl.to('#touch-cursor',{scale:1.55,opacity:0,duration:0.35},14.02);
  tl.to('#find-connection',{backgroundColor:'#8df3ba',duration:0.13,repeat:1,yoyo:true},13.95);
  tl.to('#secondary-offer',{y:40,opacity:0,duration:0.4},13.91);
  tl.to('.phone-greeting',{y:-18,opacity:0,duration:0.4},13.91);
  tl.to('#phone-tabs',{y:-18,opacity:0,duration:0.4},13.91);
  tl.to('#phone-offer',{y:-144,scale:0.67,x:0,duration:0.75,ease:'power3.inOut'},13.96);
  tl.to('#match-panel',{opacity:1,y:0,rotationX:0,duration:0.72,ease:'back.out(0.7)'},14.12);
  tl.to('#phone-rig',{rotationY:-3,rotationX:-2,rotationZ:-0.5,x:101,y:249,duration:1.8,ease:'sine.inOut'},14.0);
  tl.to('#brand-seal',{rotationY:-3,rotationX:-2,rotationZ:-0.5,x:3,y:226,duration:1.8,ease:'sine.inOut'},14.0);
  tl.to('#match-request-label',{opacity:0,y:-6,duration:0.28},15.1);
  tl.fromTo('#match-accepted-label',{y:7},{opacity:1,y:0,duration:0.35},15.24);
  morphThread(14.1,{c1x:-15,c1y:620,c2x:544,c2y:550,x1:457,y1:790,alpha:0.75},1.3);
  tl.to('#connect-title',{y:-30,opacity:0,filter:'blur(3px)',duration:0.35},15.75);reveal('#benefit-title',15.95,0.6,0.04);
  tl.set('#product-step',{textContent:'03 — GOOD FOR BOTH OF YOU'},16.05);
  tl.to('#phone-caption-b',{opacity:0,y:-14,duration:0.3},15.85);
  tl.fromTo('#phone-caption-c',{y:12},{y:0,opacity:1,duration:0.5},16.2);
  tl.to('#phone-offer',{scale:0.45,y:-190,opacity:0,duration:0.5,ease:'power2.in'},15.85);
  tl.to('#match-panel',{y:-50,scale:0.8,opacity:0,duration:0.5,ease:'power2.in'},15.95);
  tl.to('#benefit-panel',{y:0,scale:1,opacity:1,duration:0.7,ease:'power3.out'},16.15);
  tl.to('#success-tick',{strokeDashoffset:0,duration:0.52,ease:'power2.out'},16.35);
  tl.to('#phone-rig',{rotationY:0,rotationX:0,rotationZ:0,y:249,duration:1.4,ease:'sine.inOut'},16.25);
  tl.to('#brand-seal',{rotationY:0,rotationX:0,rotationZ:0,duration:1.4,ease:'sine.inOut'},16.25);

  // 18—21 / UI surfaces leave the phone and become two sides of the benefit.
  dismiss('#product-copy',17.83,0.48);
  tl.to('#phone-caption-c',{opacity:0,duration:0.3},17.88);
  tl.to('#phone-rig',{rotationY:25,rotationX:11,scale:0.87,y:292,opacity:0,duration:0.8,ease:'power3.inOut'},18.02);
  tl.to('#brand-seal',{opacity:0,scale:0.07,duration:0.35},18.06);
  tl.to('#save-panel',{x:38,y:365,scale:1,rotationX:0,rotationY:7,rotationZ:-4,opacity:1,duration:0.9,ease:'power3.inOut'},18.03);
  tl.to('#earn-panel',{x:142,y:605,scale:1,rotationX:0,rotationY:-7,rotationZ:4,opacity:1,duration:0.9,ease:'power3.inOut'},18.16);
  tl.set('#payoff-copy',{autoAlpha:1},18.16);reveal('#payoff-copy',18.2,0.65,0.025);
  morphThread(18.0,{x0:110,y0:530,c1x:480,c1y:450,c2x:30,c2y:790,x1:421,y1:732,alpha:0.85},1.0);
  tl.to('#save-panel',{rotationZ:-2,rotationY:1,y:354,duration:1.2,ease:'sine.inOut'},18.95);
  tl.to('#earn-panel',{rotationZ:2,rotationY:-1,y:596,duration:1.2,ease:'sine.inOut'},19.08);
  dismiss('#payoff-copy',20.18,0.5);
  tl.to('#concept-note',{opacity:0,duration:0.35},20.24);
  tl.to('#save-panel',{x:90,y:339,scale:0.56,rotationY:76,rotationZ:0,opacity:0,duration:0.9,ease:'power3.inOut'},20.2);
  tl.to('#earn-panel',{x:90,y:339,scale:0.56,rotationY:-76,rotationZ:0,opacity:0,duration:0.9,ease:'power3.inOut'},20.3);

  // 21—24 / The converged surfaces resolve as the original mark. Let it hold.
  tl.set('#brand-seal',{x:120,y:339,scale:0.75,rotationX:0,rotationY:0,rotationZ:0},20.5);
  tl.to('#brand-seal',{opacity:1,scale:1,y:330,duration:0.9,ease:'power3.out'},20.73);
  tl.to('.seal-sheen',{xPercent:0,duration:0.01},20.6);
  tl.to('.seal-sheen',{xPercent:200,duration:1.5,ease:'sine.inOut'},21.15);
  tl.set('#finale-copy',{autoAlpha:1},21.0);reveal('.final-wordmark',21.05,0.6,0.023);
  reveal('.final-tagline',21.35,0.65,0.017);
  tl.to('#final-rule',{scaleX:1,duration:0.8,ease:'power3.out'},21.8);
  tl.to('#final-caption',{opacity:1,y:0,duration:0.65},22.05);
  morphThread(20.6,{x0:70,y0:502,c1x:44,c1y:280,c2x:501,c2y:291,x1:470,y1:527,alpha:0.24},1.0);
  tl.to('#brand-seal',{y:326,scale:0.985,duration:2.4,ease:'sine.out'},21.6);
  tl.to('#finale-copy',{y:-4,duration:2.4,ease:'sine.out'},21.6);
  tl.to('#final-sweep',{opacity:1,x:1150,duration:1.8,ease:'sine.inOut'},21.7);
  tl.to('#environment',{opacity:0.5,duration:1.5},22.2);
  tl.to('#film-masthead',{opacity:0.5,duration:1},21.1);
  // Exact duration even if shorter variants are added later.
  tl.to({hold:0},{hold:1,duration:0.01},23.99);
  tl.pause(0);gsap.ticker.sleep();

  function drawThread() {
    const d = `M ${thread.x0} ${thread.y0} C ${thread.c1x} ${thread.c1y} ${thread.c2x} ${thread.c2y} ${thread.x1} ${thread.y1}`;
    threadCore.setAttribute('d',d);threadHalo.setAttribute('d',d);
    const length = threadCore.getTotalLength();
    for (const p of [threadCore,threadHalo]) {
      p.style.strokeDasharray = `${length}`;
      p.style.strokeDashoffset = `${length * (1-thread.progress)}`;
      p.style.opacity = thread.alpha;
    }
    const head = threadCore.getPointAtLength(length * thread.progress);
    threadHead.setAttribute('cx',head.x);threadHead.setAttribute('cy',head.y);threadHead.style.opacity = thread.alpha;
  }

  const soundtrack = $('#soundtrack');
  let soundOn = false;
  let showingPoster = false;
  let anchorTime = 0, anchorNow = 0, raf = 0;
  function updateControls() {
    $('#timecode').innerHTML = `${api.time.toFixed(1).padStart(4,'0')} <span>/ 24.0</span>`;
    $('#scrubber').value = api.time;
    $('#play-toggle').textContent = api.playing ? 'Pause' : 'Play';
    $('#play-toggle').setAttribute('aria-label',api.playing ? 'Pause film' : 'Play film');
  }
  function renderAt(value) {
    api.time = Math.max(0,Math.min(DURATION,Number(value)||0));
    tl.totalTime(api.time,false);
    world.render(api.time);drawThread();updateControls();
  }
  api.seek = (seconds) => {
    showingPoster = false;
    renderAt(seconds);
    anchorTime = api.time;anchorNow = performance.now();
    if (soundOn) soundtrack.currentTime = api.time;
    gsap.ticker.sleep();
    return api.time;
  };
  api.pause = () => {
    api.playing = false;cancelAnimationFrame(raf);soundtrack.pause();updateControls();
  };
  function tick(now) {
    if (!api.playing) return;
    // If sound is enabled the audio playhead IS the master clock; otherwise
    // the single monotonic transport clock drives both DOM and WebGL.
    const elapsed = soundOn && !soundtrack.paused ? soundtrack.currentTime : anchorTime + (now-anchorNow)/1000;
    renderAt(elapsed);
    if (elapsed >= DURATION-0.002) {api.pause();renderAt(DURATION);return;}
    raf = requestAnimationFrame(tick);
  }
  api.play = () => {
    if (api.playing) return;
    if (showingPoster || api.time >= DURATION-0.01) api.seek(0);
    api.playing = true;anchorTime = api.time;anchorNow = performance.now();
    if (soundOn) {soundtrack.currentTime = api.time;soundtrack.play().catch(() => {soundOn=false;updateSound();});}
    updateControls();raf = requestAnimationFrame(tick);
  };
  function updateSound() {
    $('#sound-toggle').textContent = soundOn ? 'Sound on' : 'Sound off';
    $('#sound-toggle').setAttribute('aria-pressed',String(soundOn));
    $('#sound-toggle').setAttribute('aria-label',soundOn ? 'Mute soundtrack' : 'Enable soundtrack');
  }
  function toggleSound() {
    soundOn = !soundOn;anchorTime = api.time;anchorNow = performance.now();
    if (!soundOn) soundtrack.pause();
    else {soundtrack.currentTime=api.time;if(api.playing)soundtrack.play().catch(() => {soundOn=false;updateSound();});}
    updateSound();
  }
  $('#play-toggle').addEventListener('click',()=>api.playing?api.pause():api.play());
  $('#replay').addEventListener('click',()=>{api.pause();api.seek(0);api.play();});
  $('#scrubber').addEventListener('input',(event)=>{const next=Number(event.target.value);api.pause();api.seek(next);});
  $('#sound-toggle').addEventListener('click',toggleSound);
  $('#fullscreen').addEventListener('click',()=>{
    if(document.fullscreenElement)document.exitFullscreen?.();else $('.studio').requestFullscreen?.();
  });
  document.querySelectorAll('[data-seek]').forEach((button)=>button.addEventListener('click',()=>{api.pause();api.seek(Number(button.dataset.seek));}));
  document.addEventListener('keydown',(e)=>{
    if(e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement)return;
    if(e.code==='Space'){e.preventDefault();api.playing?api.pause():api.play();}
    if(e.code==='ArrowRight'||e.code==='ArrowLeft'){e.preventDefault();api.pause();api.seek(api.time+(e.code==='ArrowRight'?0.5:-0.5));}
    if(e.code==='KeyM')toggleSound();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)api.pause();});
  function resize() {
    const width = $('#film').clientWidth;
    $('#stage-space').style.setProperty('--stage-scale',width/540);
    world.resize(540,960,Math.min(2,Math.max(1,width/540*devicePixelRatio)));
    renderAt(api.time);
  }
  new ResizeObserver(resize).observe($('#film'));
  resize();
  // Open on a useful poster, while exact capture starts in absolute black.
  api.seek(capture?0:22.5);
  showingPoster = !capture;
  api.ready = true;
  $('#load-status').textContent = 'PICTURE READY / PRESS PLAY';
}

start().catch((error)=>{
  console.error(error);
  $('#load-status').textContent = `Unable to prepare film: ${error.message}`;
});
