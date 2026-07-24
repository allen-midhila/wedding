
(function(){
  "use strict";

  const petalLayer = document.getElementById('petals');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let petalTimer = null;

  function spawnPetal(){
    if (!petalLayer) return;
    const p = document.createElement('div');
    p.className = 'petal';
    const size = 7 + Math.random()*11;
    p.style.width = size + 'px';
    p.style.height = size * 0.85 + 'px';
    p.style.left = Math.random()*100 + 'vw';
    p.style.animationDuration = (7 + Math.random()*8) + 's';
    p.style.opacity = 0.35 + Math.random()*0.45;
    petalLayer.appendChild(p);
    setTimeout(()=>p.remove(), 16000);
  }

  function startPetals(){
    if (reduceMotion || petalTimer) return;
    for (let i = 0; i < 8; i++) setTimeout(spawnPetal, i * 400);
    petalTimer = setInterval(spawnPetal, 900);
  }

  function stopPetals(){
    if (petalTimer){
      clearInterval(petalTimer);
      petalTimer = null;
    }
    if (petalLayer) petalLayer.innerHTML = '';
  }

  /* =====================================================
     EDIT ME — wedding details
     ===================================================== */
  const CONFIG = {
    groomFirst: "Allen",
    weddingDateISO: "2026-08-24T11:30:00+05:30",
    ceremonyVenueLine: "Thevalakkara Mar Thoma Valiyapalli",
    ceremonyTimeLabel: "11:30 AM · Monday, Aug 24, 2026",
    receptionVenueLine: "Church Parish Hall",
    receptionTimeLabel: "Immediately after ceremony",
    rsvpDeadlineLabel: "Please RSVP by Aug 10, 2026",
    rsvpEmail: "allen.abraham05@gmail.com",
    rsvpPhoneDisplay1: "+971-585954112",
    rsvpPhoneHref1: "+971585954112",
    rsvpPhoneDisplay2: "+91-9895987872",
    rsvpPhoneHref2: "+919895987872",
  };
  document.getElementById('ceremony-detail').innerHTML =
    CONFIG.ceremonyVenueLine + '<small id="ceremony-time"></small>';
  document.getElementById('ceremony-time').textContent = CONFIG.ceremonyTimeLabel;
  document.getElementById('reception-detail').innerHTML =
    CONFIG.receptionVenueLine + '<small id="reception-time"></small>';
  document.getElementById('reception-time').textContent = CONFIG.receptionTimeLabel;

  const rsvpFormEl = document.getElementById('rsvp-form');
  const rsvpNameEl = document.getElementById('rsvp-name');
  const rsvpGuestsEl = document.getElementById('rsvp-guests');
  const rsvpChoiceEl = document.getElementById('rsvp-choice');
  const rsvpSuccessEl = document.getElementById('rsvp-success');
  const rsvpChoiceButtons = Array.from(document.querySelectorAll('.rsvp-choice'));

  document.getElementById('rsvp-form-msg').textContent = CONFIG.rsvpDeadlineLabel;
  document.getElementById('rsvp-note').innerHTML =
    'Email: <a href="mailto:' + CONFIG.rsvpEmail + '">' + CONFIG.rsvpEmail + '</a>' +
    ' · Call/WhatsApp: <a href="tel:' + CONFIG.rsvpPhoneHref1 + '">' + CONFIG.rsvpPhoneDisplay1 + '</a>' +
    ' / <a href="tel:' + CONFIG.rsvpPhoneHref2 + '">' + CONFIG.rsvpPhoneDisplay2 + '</a>';

  rsvpChoiceButtons.forEach((btn)=>{
    btn.addEventListener('click', ()=>{
      const selected = btn.getAttribute('data-choice') || '';
      rsvpChoiceEl.value = selected;
      rsvpChoiceButtons.forEach((b)=> b.classList.toggle('active', b === btn));
    });
  });

  rsvpFormEl.addEventListener('submit', (e)=>{
    e.preventDefault();
    if (!rsvpNameEl.value.trim()) return;
    if (!rsvpChoiceEl.value) return;

    const note = [
      'Name: ' + rsvpNameEl.value.trim(),
      'Choice: ' + rsvpChoiceEl.value,
      'Guests: ' + (rsvpGuestsEl.value || 'Not provided')
    ].join(' | ');
    rsvpFormEl.setAttribute('data-last-rsvp', note);
    rsvpSuccessEl.classList.add('show');
  });

  const MOMENT_PHOTOS = [
    "images/photo-1.jpeg",
    "images/photo-2.jpeg",
    "images/photo-3.jpeg",
    "images/photo-4.jpeg",
    "images/photo-5.jpeg",
    "images/photo-6.jpeg",
    "images/photo-7.jpeg",
    "images/photo-8.jpeg",
    "images/photo-9.jpeg"
  ];
  const MOMENT_CAPTIONS = [
    "Just us",
    "Smiles and stories",
    "Our happy place",
    "A little louder together",
    "Coffee and forever",
    "This kind of joy",
    "Side by side",
    "Made for this",
    "Always us"
  ];

  let momentIndex = 0;
  const momentsPhotoEl = document.getElementById('moments-photo');
  const momentsCaptionEl = document.getElementById('moments-caption');
  const momentsCountEl = document.getElementById('moments-count');
  const momentsDotsEl = document.getElementById('moments-dots');
  const momentsPrevBtn = document.getElementById('moments-prev');
  const momentsNextBtn = document.getElementById('moments-next');
  const momentsStage = document.getElementById('moments-stage');

  function renderMomentPhoto(){
    momentsPhotoEl.src = MOMENT_PHOTOS[momentIndex];
    momentsPhotoEl.alt = 'Our moments photo ' + (momentIndex + 1);
    momentsCaptionEl.textContent = MOMENT_CAPTIONS[momentIndex] || 'Our moment';
    momentsCountEl.textContent = (momentIndex + 1) + ' / ' + MOMENT_PHOTOS.length;
    const dots = momentsDotsEl.querySelectorAll('.moments-dot');
    dots.forEach((dot, idx)=> dot.classList.toggle('active', idx === momentIndex));
  }

  function moveMoment(step){
    momentIndex = (momentIndex + step + MOMENT_PHOTOS.length) % MOMENT_PHOTOS.length;
    renderMomentPhoto();
  }

  MOMENT_PHOTOS.forEach((_, idx)=>{
    const dot = document.createElement('button');
    dot.className = 'moments-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Go to photo ' + (idx + 1));
    dot.addEventListener('click', ()=>{
      momentIndex = idx;
      renderMomentPhoto();
    });
    momentsDotsEl.appendChild(dot);
  });
  renderMomentPhoto();

  momentsPrevBtn.addEventListener('click', ()=> moveMoment(-1));
  momentsNextBtn.addEventListener('click', ()=> moveMoment(1));

  let momentTouchStartX = null;
  momentsStage.addEventListener('touchstart', (e)=>{
    momentTouchStartX = e.changedTouches[0].clientX;
  }, {passive:true});
  momentsStage.addEventListener('touchend', (e)=>{
    if (momentTouchStartX === null) return;
    const dx = e.changedTouches[0].clientX - momentTouchStartX;
    if (Math.abs(dx) > 35) moveMoment(dx > 0 ? -1 : 1);
    momentTouchStartX = null;
  }, {passive:true});

  /* =====================================================
     MAZE DEFINITION  (17 cols x 13 rows, validated reachable)
     ===================================================== */
  // Real photos of the couple, used as the in-maze sprites (base64-embedded so the file stays self-contained)
  const groomImg = new Image();
  groomImg.src = 'images/groom-sprite.png';
  const brideImg = new Image();
  const grandfatherImg = new Image();
  grandfatherImg.src = 'images/grandfather-sprite.png';
  brideImg.src = 'images/bride-sprite.png';

  const MAZE = [
    "#################",
    "#S......#......B#",
    "#.#####.#.#####.#",
    "#.#...#.#.#...#.#",
    "#.#.#.#.#.#.#.#.#",
    "#...#.......#...#",
    "###.#.#####.#.###",
    "#...#...#...#...#",
    "#.#####.#.#####.#",
    "#.......#.......#",
    "#.#############.#",
    "#...............#",
    "#################",
  ];
  const COLS = MAZE[0].length, ROWS = MAZE.length;
  const TILE = 28;

  function isWall(x,y){
    if (x<0||y<0||x>=COLS||y>=ROWS) return true;
    return MAZE[y][x] === '#';
  }

  const DIRS = {
    up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]
  };

  let startPos=null, bridePos=null;
  const pelletSet = new Set();
  for (let y=0;y<ROWS;y++){
    for (let x=0;x<COLS;x++){
      const c = MAZE[y][x];
      if (c==='S') startPos=[x,y];
      if (c==='B') bridePos=[x,y];
      if (c!=='#' && c!=='S' && c!=='B') pelletSet.add(x+','+y);
    }
  }

  // grid BFS distance map from a source cell (used to keep ghosts away from both ends)
  function bfsDistMap(src){
    const dist = Array.from({length:ROWS},()=>Array(COLS).fill(-1));
    dist[src[1]][src[0]] = 0;
    const q = [src];
    while(q.length){
      const [x,y] = q.shift();
      for (const dname in DIRS){
        const [dx,dy] = DIRS[dname];
        const nx=x+dx, ny=y+dy;
        if (isWall(nx,ny)) continue;
        if (dist[ny][nx] !== -1) continue;
        dist[ny][nx] = dist[y][x] + 1;
        q.push([nx,ny]);
      }
    }
    return dist;
  }

  // choose ghost spawns that are far from the START (so the player gets a real head start)
  // and not camped right on top of the BRIDE (so the finish isn't guarded)
  function pickGhostSpawns(){
    const distS = bfsDistMap(startPos);
    const distB = bfsDistMap(bridePos);
    let maxDS = 0;
    for (let y=0;y<ROWS;y++) for (let x=0;x<COLS;x++) if (MAZE[y][x]!=='#') maxDS = Math.max(maxDS, distS[y][x]);

    const candidates = [];
    for (let y=0;y<ROWS;y++){
      for (let x=0;x<COLS;x++){
        if (MAZE[y][x]==='#') continue;
        if ((x===startPos[0]&&y===startPos[1]) || (x===bridePos[0]&&y===bridePos[1])) continue;
        const fracFromStart = distS[y][x] / maxDS;
        if (fracFromStart >= 0.45 && distB[y][x] >= 6) candidates.push([x,y]);
      }
    }
    candidates.sort((a,b)=> a[0]-b[0]);
    const spawns = [];
    const wanted = 3; // fewer ghosts, easier to read and dodge
    for (let i=0;i<wanted;i++){
      const idx = Math.floor(i*(candidates.length-1)/(wanted-1||1));
      spawns.push(candidates[idx] || candidates[0]);
    }
    return spawns;
  }
  const GHOST_SPAWNS = pickGhostSpawns();
  const GHOST_DEFS = [
    {emoji:'🏢', name:'AGX Office'},
    {img:grandfatherImg, name:"Gen A's advice"},
    {emoji:'🌧️', name:'Monsoon'},
  ];

  /* =====================================================
     GAME STATE
     ===================================================== */
  let canvas, ctx;
  let player, ghosts, pellets, score, lives, running, gameOverFlag;
  let queuedDir = null;

  function resetEntities(){
    player = { x:startPos[0], y:startPos[1], px:startPos[0], py:startPos[1], dir:null,
               fromX:startPos[0], fromY:startPos[1], t:1 };
    ghosts = GHOST_SPAWNS.map((p,i)=>({
      x:p[0], y:p[1], fromX:p[0], fromY:p[1], t:1, def: GHOST_DEFS[i]
    }));
    pellets = new Set(pelletSet);
    score = 0;
    lives = 4;
    queuedDir = null;
    tickCount = 0;
    updateHud();
  }

  function updateHud(){
    document.getElementById('lives-display').textContent = '❤️'.repeat(Math.max(lives,0)) || '—';
    document.getElementById('score-display').textContent = 'Blessings collected: ' + score;
  }

  function bfsNextStep(fromX,fromY,toX,toY){
    if (fromX===toX && fromY===toY) return null;
    const key = (x,y)=>x+','+y;
    const visited = new Set([key(fromX,fromY)]);
    const queue = [[fromX,fromY,[]]];
    while(queue.length){
      const [cx,cy,path] = queue.shift();
      for (const dname in DIRS){
        const [dx,dy] = DIRS[dname];
        const nx=cx+dx, ny=cy+dy;
        if (isWall(nx,ny)) continue;
        const k = key(nx,ny);
        if (visited.has(k)) continue;
        const newPath = path.concat([[nx,ny]]);
        if (nx===toX && ny===toY) return newPath[0];
        visited.add(k);
        queue.push([nx,ny,newPath]);
      }
    }
    return null;
  }

  const TICK_MS = 190;
  const GHOST_GRACE_TICKS = 14;   // ~2.6s where ghosts don't move at all, so the player can get moving first
  const GHOST_CHASE_CHANCE = 0.45; // lower = more wandering, easier to shake off
  let tickAccum = 0, lastTime = null, tickCount = 0;
  let arcadeAudioCtx = null;
  let arcadeLoopTimer = null;
  let arcadeStep = 0;

  function startArcadeMusic(){
    if (arcadeLoopTimer || reduceMotion) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!arcadeAudioCtx || arcadeAudioCtx.state === 'closed') arcadeAudioCtx = new AudioCtx();

    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 783.99, 698.46];
    const bass = [130.81, 146.83, 164.81, 146.83];

    const playStep = ()=>{
      if (!arcadeAudioCtx || arcadeAudioCtx.state === 'closed') return;
      if (arcadeAudioCtx.state === 'suspended') arcadeAudioCtx.resume().catch(()=>{});

      const t0 = arcadeAudioCtx.currentTime;
      const melodyFreq = melody[arcadeStep % melody.length];
      const bassFreq = bass[Math.floor(arcadeStep / 2) % bass.length];

      const leadOsc = arcadeAudioCtx.createOscillator();
      const leadGain = arcadeAudioCtx.createGain();
      leadOsc.type = 'square';
      leadOsc.frequency.setValueAtTime(melodyFreq, t0);
      leadGain.gain.setValueAtTime(0.0001, t0);
      leadGain.gain.exponentialRampToValueAtTime(0.05, t0 + 0.01);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.19);
      leadOsc.connect(leadGain);
      leadGain.connect(arcadeAudioCtx.destination);
      leadOsc.start(t0);
      leadOsc.stop(t0 + 0.2);

      const bassOsc = arcadeAudioCtx.createOscillator();
      const bassGain = arcadeAudioCtx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassFreq, t0);
      bassGain.gain.setValueAtTime(0.0001, t0);
      bassGain.gain.exponentialRampToValueAtTime(0.035, t0 + 0.015);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      bassOsc.connect(bassGain);
      bassGain.connect(arcadeAudioCtx.destination);
      bassOsc.start(t0);
      bassOsc.stop(t0 + 0.23);

      arcadeStep++;
    };

    playStep();
    arcadeLoopTimer = setInterval(playStep, 240);
  }

  function stopArcadeMusic(){
    if (arcadeLoopTimer){
      clearInterval(arcadeLoopTimer);
      arcadeLoopTimer = null;
    }
    arcadeStep = 0;
    if (arcadeAudioCtx && arcadeAudioCtx.state !== 'closed'){
      arcadeAudioCtx.close().catch(()=>{});
    }
    arcadeAudioCtx = null;
  }

  function playLosingTone(){
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctxAudio = new AudioCtx();
    const now = ctxAudio.currentTime;
    const notes = [392, 294, 220, 164];

    notes.forEach((freq, i)=>{
      const osc = ctxAudio.createOscillator();
      const gain = ctxAudio.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0.0001, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.12 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.11);
      osc.connect(gain);
      gain.connect(ctxAudio.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.12);
    });

    setTimeout(()=>ctxAudio.close().catch(()=>{}), 1200);
  }

  function playWinningTone(){
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctxAudio = new AudioCtx();
    const now = ctxAudio.currentTime;
    const notes = [392, 523.25, 659.25, 783.99];

    notes.forEach((freq, i)=>{
      const osc = ctxAudio.createOscillator();
      const gain = ctxAudio.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.0001, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.16, now + i * 0.1 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.12);
      osc.connect(gain);
      gain.connect(ctxAudio.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.13);
    });

    setTimeout(()=>ctxAudio.close().catch(()=>{}), 1200);
  }

  function playCaughtTone(){
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctxAudio = new AudioCtx();
    const now = ctxAudio.currentTime;
    const notes = [349.23, 293.66];

    notes.forEach((freq, i)=>{
      const osc = ctxAudio.createOscillator();
      const gain = ctxAudio.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.11);
      gain.gain.setValueAtTime(0.0001, now + i * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.15, now + i * 0.11 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.11 + 0.1);
      osc.connect(gain);
      gain.connect(ctxAudio.destination);
      osc.start(now + i * 0.11);
      osc.stop(now + i * 0.11 + 0.1);
    });

    setTimeout(()=>ctxAudio.close().catch(()=>{}), 600);
  }

  function performTick(){
    tickCount++;
    // ---- player ----
    let dir = null;
    if (queuedDir && !isWall(player.x+DIRS[queuedDir][0], player.y+DIRS[queuedDir][1])){
      dir = queuedDir;
    } else if (player.dir && !isWall(player.x+DIRS[player.dir][0], player.y+DIRS[player.dir][1])){
      dir = player.dir;
    }
    if (dir){
      player.fromX = player.x; player.fromY = player.y;
      player.x += DIRS[dir][0]; player.y += DIRS[dir][1];
      player.dir = dir;
      player.t = 0;
      const key = player.x+','+player.y;
      if (pellets.has(key)){ pellets.delete(key); score++; updateHud(); }
    } else {
      player.fromX = player.x; player.fromY = player.y; player.t = 0;
    }

    // ---- ghosts ----
    const ghostsShouldMove = tickCount > GHOST_GRACE_TICKS;
    ghosts.forEach(g=>{
      g.fromX = g.x; g.fromY = g.y; g.t = 0;
      if (!ghostsShouldMove) return;
      let step = null;
      if (Math.random() < GHOST_CHASE_CHANCE){
        step = bfsNextStep(g.x, g.y, player.x, player.y);
      }
      if (!step){
        const options = Object.values(DIRS).filter(([dx,dy])=>!isWall(g.x+dx,g.y+dy));
        if (options.length){
          const [dx,dy] = options[Math.floor(Math.random()*options.length)];
          step = [g.x+dx, g.y+dy];
        }
      }
      if (step){ g.x = step[0]; g.y = step[1]; }
    });

    // ---- collisions ----
    const caught = ghosts.some(g=> g.x===player.x && g.y===player.y);
    if (caught){
      lives--;
      updateHud();
      if (lives<=0){
        gameOverFlag = true;
        stopArcadeMusic();
        playLosingTone();
        showOverlay('Game Over', "The day's chaos finally caught up with him. Take a breath and try again.", 'Play again', ()=>{
          resetEntities();
          gameOverFlag = false;
          running = true;
          lastTime = null;
          tickAccum = 0;
          startArcadeMusic();
          hideOverlay();
        }, {variant:'game-over'});
      } else {
        playCaughtTone();
        showOverlay('Caught!', "Almost — " + (ghosts.find(g=>g.x===player.x&&g.y===player.y).def.name) + " got in the way. " + lives + " " + (lives===1?'life':'lives') + " left.", 'Continue', ()=>{
          player.x=startPos[0]; player.y=startPos[1]; player.fromX=player.x; player.fromY=player.y; player.t=1; player.dir=null;
          ghosts.forEach((g,i)=>{ g.x=GHOST_SPAWNS[i][0]; g.y=GHOST_SPAWNS[i][1]; g.fromX=g.x; g.fromY=g.y; g.t=1; });
          queuedDir=null;
          tickCount=0;
          hideOverlay();
        });
      }
      return;
    }
    if (player.x===bridePos[0] && player.y===bridePos[1]){
      winGame();
    }
  }

  let overlayResolve = null;
  function showOverlay(title, text, btnLabel, onClose, opts){
    const options = opts || {};
    const overlayEl = document.getElementById('overlay-msg');
    overlayEl.classList.toggle('game-over', options.variant === 'game-over');
    overlayEl.classList.toggle('game-win', options.variant === 'game-win');
    document.getElementById('overlay-title').textContent = title;
    document.getElementById('overlay-text').textContent = text;
    document.getElementById('overlay-btn').textContent = btnLabel;
    overlayEl.classList.add('active');
    overlayResolve = onClose;
  }
  function hideOverlay(){
    const overlayEl = document.getElementById('overlay-msg');
    overlayEl.classList.remove('active', 'game-over', 'game-win');
  }
  document.getElementById('overlay-btn').addEventListener('click', ()=>{
    if (overlayResolve){ const fn = overlayResolve; overlayResolve=null; fn(); }
  });

  function drawTile(x,y,w,h,color){
    ctx.fillStyle = color;
    const r = 6;
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
    ctx.fill();
  }

  function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // floor
    ctx.fillStyle = '#123430';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    // walls
    for (let y=0;y<ROWS;y++){
      for (let x=0;x<COLS;x++){
        if (MAZE[y][x]==='#'){
          drawTile(x*TILE+1.5, y*TILE+1.5, TILE-3, TILE-3, '#1F4B43');
          ctx.strokeStyle = 'rgba(201,162,39,0.55)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x*TILE+2.5, y*TILE+2.5, TILE-5, TILE-5);
        }
      }
    }
    // pellets
    ctx.fillStyle = '#E4C766';
    pellets.forEach(k=>{
      const [x,y] = k.split(',').map(Number);
      ctx.beginPath();
      ctx.arc(x*TILE+TILE/2, y*TILE+TILE/2, 2.6, 0, Math.PI*2);
      ctx.fill();
    });
    // bride
    drawPersonIcon(brideImg, bridePos[0]*TILE+TILE/2, bridePos[1]*TILE+TILE/2, TILE*0.95, '👰');
    // ghosts
    ghosts.forEach(g=>{
      const lerp = g.t;
      const gx = (g.fromX + (g.x-g.fromX)*lerp)*TILE + TILE/2;
      const gy = (g.fromY + (g.y-g.fromY)*lerp)*TILE + TILE/2;
      if (g.def.img){
        drawPersonIcon(g.def.img, gx, gy, TILE*0.9, '👤');
      } else {
        ctx.font = (TILE*0.8)+'px sans-serif';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(g.def.emoji, gx, gy+2);
      }
    });
    // player
    {
      const lerp = player.t;
      const px = (player.fromX + (player.x-player.fromX)*lerp)*TILE + TILE/2;
      const py = (player.fromY + (player.y-player.fromY)*lerp)*TILE + TILE/2;
      drawPersonIcon(groomImg, px, py, TILE*0.95, '🤵');
    }
  }

  function drawPersonIcon(img, cx, cy, size, fallbackEmoji){
    if (img && img.complete && img.naturalWidth){
      const r = size/2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, cx-r, cy-r, size, size);
      ctx.restore();
    } else {
      ctx.font = size+'px sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(fallbackEmoji, cx, cy+2);
    }
  }

  function loop(ts){
    if (!running) return;
    if (lastTime===null) lastTime = ts;
    const dt = ts - lastTime;
    lastTime = ts;

    player.t = Math.min(1, player.t + dt/TICK_MS);
    ghosts.forEach(g=> g.t = Math.min(1, g.t + dt/TICK_MS));

    tickAccum += dt;
    if (tickAccum >= TICK_MS && !document.getElementById('overlay-msg').classList.contains('active') && !gameOverFlag){
      tickAccum = 0;
      performTick();
    }
    render();
    requestAnimationFrame(loop);
  }

  function sizeCanvas(){
    canvas.width = COLS*TILE;
    canvas.height = ROWS*TILE;
  }

  function winGame(){
    running = false;
    stopArcadeMusic();
    showConfetti();
    playWinningTone();
    showOverlay('You are invited!', 'Allen made it to Midhila. The celebration awaits.', 'Open invitation', ()=>{
      hideOverlay();
      window.location.href = 'index.html';
    }, {variant:'game-win'});
  }

  function showConfetti(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pieces = ['🎉','✨','🌸','💛'];
    for (let i=0;i<28;i++){
      const el = document.createElement('div');
      el.className = 'confetti';
      el.textContent = pieces[Math.floor(Math.random()*pieces.length)];
      el.style.left = Math.random()*100+'vw';
      el.style.animationDuration = (2.2+Math.random()*1.6)+'s';
      el.style.fontSize = (14+Math.random()*14)+'px';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(), 4000);
    }
  }

  /* =====================================================
     CONTROLS
     ===================================================== */
  const KEYMAP = {
    ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
    w:'up', s:'down', a:'left', d:'right', W:'up', S:'down', A:'left', D:'right'
  };
  window.addEventListener('keydown', (e)=>{
    if (KEYMAP[e.key]){ queuedDir = KEYMAP[e.key]; e.preventDefault(); }
  }, {passive:false});

  function bindHold(id, dirName){
    const el = document.getElementById(id);
    el.addEventListener('click', ()=>{ queuedDir = dirName; });
  }
  bindHold('dpad-up','up'); bindHold('dpad-down','down');
  bindHold('dpad-left','left'); bindHold('dpad-right','right');

  let touchStart = null;
  let canvasTouchBound = false;

  /* =====================================================
     SCREEN MANAGEMENT
     ===================================================== */
  function switchScreen(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'invite-screen') startPetals();
    else stopPetals();
    if (id !== 'game-screen') stopArcadeMusic();
  }

  function startGameSession(){
    switchScreen('game-screen');
    canvas = document.getElementById('maze-canvas');
    ctx = canvas.getContext('2d');
    sizeCanvas();
    resetEntities();
    running = true; gameOverFlag = false; lastTime = null; tickAccum = 0;
    startArcadeMusic();

    if (!canvasTouchBound){
      canvas.addEventListener('touchstart', (e)=>{
        const t = e.changedTouches[0];
        touchStart = {x:t.clientX, y:t.clientY};
      }, {passive:true});
      canvas.addEventListener('touchend', (e)=>{
        if (!touchStart) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
        if (Math.abs(dx) > Math.abs(dy)){
          queuedDir = dx > 0 ? 'right' : 'left';
        } else {
          queuedDir = dy > 0 ? 'down' : 'up';
        }
        touchStart = null;
      }, {passive:true});
      canvasTouchBound = true;
    }

    requestAnimationFrame(loop);
  }

  document.getElementById('start-btn').addEventListener('click', ()=>{
    startGameSession();
  });

  document.getElementById('replay-btn').addEventListener('click', ()=>{
    startGameSession();
  });

  document.getElementById('skip-game-btn').addEventListener('click', ()=>{
    running = false;
    stopArcadeMusic();
    window.location.href = 'index.html';
  });

  /* =====================================================
     COUNTDOWN + CALENDAR
     ===================================================== */
  let countdownTimer = null;
  function startCountdown(){
    const target = new Date(CONFIG.weddingDateISO).getTime();
    function tick(){
      const now = Date.now();
      let diff = Math.max(0, target - now);
      const d = Math.floor(diff/86400000); diff -= d*86400000;
      const h = Math.floor(diff/3600000); diff -= h*3600000;
      const m = Math.floor(diff/60000); diff -= m*60000;
      const s = Math.floor(diff/1000);
      document.getElementById('cd-days').textContent = d;
      document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
      document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
      document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
    }
    tick();
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(tick, 1000);
  }

  document.getElementById('calendar-btn').addEventListener('click', (e)=>{
    e.preventDefault();
    const start = new Date(CONFIG.weddingDateISO);
    const end = new Date(start.getTime() + 3*60*60*1000);
    const fmt = (d)=> d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',
      "SUMMARY:Allen & Midhila's Wedding",
      'DESCRIPTION:'+CONFIG.ceremonyVenueLine,
      'LOCATION:'+CONFIG.ceremonyVenueLine,
      'DTSTART:'+fmt(start),
      'DTEND:'+fmt(end),
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], {type:'text/calendar'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'allen-midhila-wedding.ics';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

})();

