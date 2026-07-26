
/* ---------- Door intro ---------- */
const intro = document.getElementById('intro');
const main = document.getElementById('main');
const bgMusic = document.getElementById('bg-music');
let opened = false;

if ('scrollRestoration' in history){
  history.scrollRestoration = 'manual';
}

function resetScrollToTop(){
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

resetScrollToTop();
window.addEventListener('load', resetScrollToTop);

function startBackgroundMusic(){
  if (!bgMusic) return;
  bgMusic.volume = 0.35;
  const playAttempt = bgMusic.play();
  if (playAttempt && typeof playAttempt.catch === 'function'){
    playAttempt.catch(()=>{
      // If autoplay is blocked, retry on first explicit user interaction.
      const resumeOnInteraction = ()=>{
        bgMusic.play().catch(()=>{});
        window.removeEventListener('click', resumeOnInteraction);
        window.removeEventListener('touchstart', resumeOnInteraction);
        window.removeEventListener('keydown', resumeOnInteraction);
      };
      window.addEventListener('click', resumeOnInteraction, {once:true});
      window.addEventListener('touchstart', resumeOnInteraction, {once:true, passive:true});
      window.addEventListener('keydown', resumeOnInteraction, {once:true});
    });
  }
}

function openDoors(){
  if(opened) return;
  opened = true;
  resetScrollToTop();
  requestAnimationFrame(resetScrollToTop);
  intro.classList.add('opened');
  main.classList.add('visible');
  /* keep scroll locked until the walk-through zoom completes */
  setTimeout(()=>{
    resetScrollToTop();
    document.body.classList.remove('locked');
    setTimeout(resetScrollToTop, 0);
  }, 4300);
  startPetals();
  startBackgroundMusic();
}
intro.addEventListener('click', openDoors);
intro.addEventListener('touchend', openDoors, {passive:true});
window.addEventListener('wheel', openDoors, {once:true, passive:true});
window.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') openDoors(); }, {once:true});
/* auto-open after a pause, like the reel */
setTimeout(openDoors, 4000);

/* ---------- Falling petals ---------- */
const petalLayer = document.getElementById('petals');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function spawnPetal(){
  const p = document.createElement('div');
  p.className = 'petal';
  const size = 7 + Math.random()*11;
  p.style.width = size+'px';
  p.style.height = size*0.85+'px';
  p.style.left = Math.random()*100+'vw';
  p.style.animationDuration = (7+Math.random()*8)+'s';
  p.style.opacity = 0.35 + Math.random()*0.45;
  petalLayer.appendChild(p);
  setTimeout(()=>p.remove(), 16000);
}
let petalTimer = null;
function startPetals(){
  if(reduceMotion || petalTimer) return;
  for(let i=0;i<8;i++) setTimeout(spawnPetal, i*400);
  petalTimer = setInterval(spawnPetal, 900);
}

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
},{threshold:0.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ---------- Polaroid gallery ---------- */
const cards = [...document.querySelectorAll('.polaroid')];
const total = cards.length;
let current = 0;
const dotsWrap = document.getElementById('dots');
const counter = document.getElementById('counter');
for(let i=0;i<total;i++){
  const d = document.createElement('div');
  d.className = 'dot'+(i===0?' active':'');
  dotsWrap.appendChild(d);
}
const dots = [...dotsWrap.children];
function layout(){
  cards.forEach(c=>{
    const idx = +c.dataset.index;
    const pos = (idx - current + total) % total;
    c.dataset.pos = pos;
    c.style.pointerEvents = pos===0 ? 'auto' : 'none';
  });
  dots.forEach((d,i)=>d.classList.toggle('active', i===current));
  counter.textContent = (current+1)+' / '+total;
}
function next(){
  const top = cards.find(c=>+c.dataset.index===current);
  top.classList.add('flying');
  setTimeout(()=>{
    current = (current+1)%total;
    top.classList.remove('flying');
    layout();
  }, 420);
}
function prev(){
  current = (current-1+total)%total;
  layout();
}
document.getElementById('nextBtn').addEventListener('click', next);
document.getElementById('prevBtn').addEventListener('click', prev);
const stage = document.getElementById('stage');
stage.addEventListener('click', e=>{ if(e.target.closest('.polaroid')) next(); });
let touchX = null;
stage.addEventListener('touchstart', e=>{ touchX = e.touches[0].clientX; }, {passive:true});
stage.addEventListener('touchend', e=>{
  if(touchX===null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if(dx < -40) next(); else if(dx > 40) prev();
  touchX = null;
}, {passive:true});
layout();

/* ---------- Playlist ---------- */
const songForm = document.getElementById('songForm');
const songList = document.getElementById('songList');
const emptyNote = document.getElementById('emptyNote');
const songs = [];

const FORM_SUBMIT_ACTION_URL = 'https://script.google.com/macros/s/AKfycbxfrgcIgrOinJMouFcC8lt3ad_E608kaU1JWZcMA_mqCytaUYAbyS0H0CTHRkFXPUS1Qg/exec';
const SONG_GOOGLE_FORM_FIELDS = {
  name: 'name',
  artist: 'artist',
  song: 'song',
  submittedAt: 'submittedAt',
  action: 'action'
};

function sendSongToGoogleForm(payload){
  if(!FORM_SUBMIT_ACTION_URL) return Promise.resolve(false);

  const form = document.createElement('form');
  form.action = FORM_SUBMIT_ACTION_URL;
  form.method = 'POST';
  form.target = 'song-form-target';
  form.style.display = 'none';

  const ensureTarget = ()=>{
    let targetFrame = document.getElementById('song-form-target');
    if(!targetFrame){
      targetFrame = document.createElement('iframe');
      targetFrame.name = 'song-form-target';
      targetFrame.id = 'song-form-target';
      targetFrame.style.display = 'none';
      document.body.appendChild(targetFrame);
    }
    return targetFrame;
  };

  ensureTarget();

  Object.entries({
    [SONG_GOOGLE_FORM_FIELDS.name]: payload.name,
    [SONG_GOOGLE_FORM_FIELDS.artist]: payload.artist,
    [SONG_GOOGLE_FORM_FIELDS.song]: payload.song,
    [SONG_GOOGLE_FORM_FIELDS.submittedAt]: payload.submittedAt,
    [SONG_GOOGLE_FORM_FIELDS.action]: payload.action
  }).forEach(([fieldName, value])=>{
    if(!fieldName) return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = fieldName;
    input.value = value ?? '';
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();

  return Promise.resolve(true);
}

songForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('reqName').value.trim();
  const artist = document.getElementById('reqArtist').value.trim();
  const song = document.getElementById('reqSong').value.trim();
  if(!name||!artist||!song) return;
  sendSongToGoogleForm({
    name,
    artist,
    song,
    submittedAt: new Date().toISOString(),
    action: 'SongRequest'
  }).catch(()=>{}).finally(()=>{
    songs.push({name, artist, song});
    emptyNote.style.display = 'none';
    const item = document.createElement('div');
    item.className = 'song-item';
    const icon = document.createElement('span');
    icon.className = 'note-icon'; icon.textContent = '♪';
    const text = document.createElement('div');
    const t = document.createElement('div'); t.className='s-title'; t.textContent = song;
    const m = document.createElement('div'); m.className='s-meta'; m.textContent = artist+' — requested by '+name;
    text.append(t,m);
    item.append(icon,text);
    songList.appendChild(item);
    songForm.reset();
  });
});

const RSVP_GOOGLE_FORM_FIELDS = {
  name: 'name',
  email: 'email',
  attending: 'attending',
  notes: 'notes',
  submittedAt: 'submittedAt',
  action: 'action'
};

function sendRsvpToGoogleForm(payload){
  if(!FORM_SUBMIT_ACTION_URL) return Promise.resolve(false);

  const form = document.createElement('form');
  form.action = FORM_SUBMIT_ACTION_URL;
  form.method = 'POST';
  form.target = 'rsvp-form-target';
  form.style.display = 'none';

  const ensureTarget = ()=>{
    let targetFrame = document.getElementById('rsvp-form-target');
    if(!targetFrame){
      targetFrame = document.createElement('iframe');
      targetFrame.name = 'rsvp-form-target';
      targetFrame.id = 'rsvp-form-target';
      targetFrame.style.display = 'none';
      document.body.appendChild(targetFrame);
    }
    return targetFrame;
  };

  ensureTarget();

  Object.entries({
    [RSVP_GOOGLE_FORM_FIELDS.name]: payload.name,
    [RSVP_GOOGLE_FORM_FIELDS.email]: payload.email,
    [RSVP_GOOGLE_FORM_FIELDS.attending]: payload.attending,
    [RSVP_GOOGLE_FORM_FIELDS.notes]: payload.notes,
    [RSVP_GOOGLE_FORM_FIELDS.submittedAt]: payload.submittedAt,
    [RSVP_GOOGLE_FORM_FIELDS.action]: payload.action
  }).forEach(([fieldName, value])=>{
    if(!fieldName) return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = fieldName;
    input.value = value ?? '';
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();

  return Promise.resolve(true);
}

/* ---------- Countdown ---------- */
const target = new Date('2026-08-24T11:30:00+05:30').getTime();
function tick(){
  let diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff/86400000); diff -= d*86400000;
  const h = Math.floor(diff/3600000); diff -= h*3600000;
  const m = Math.floor(diff/60000); diff -= m*60000;
  const s = Math.floor(diff/1000);
  cdD.textContent = String(d).padStart(2,'0');
  cdH.textContent = String(h).padStart(2,'0');
  cdM.textContent = String(m).padStart(2,'0');
  cdS.textContent = String(s).padStart(2,'0');
}
tick(); setInterval(tick,1000);

/* ---------- RSVP ---------- */
let attending = null;
document.querySelectorAll('.attend-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.attend-btn').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    attending = btn.dataset.val;
  });
});
document.getElementById('rsvpForm').addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('rsvpName').value.trim();
  const email = document.getElementById('rsvpEmail').value.trim();
  const notes = document.getElementById('rsvpNotes').value.trim();
  if(!name) return;
  if(!email) return;
  if(!attending){ alert('Please let us know if you can attend 💌'); return; }
  const success = document.getElementById('rsvpSuccess');

  sendRsvpToGoogleForm({
    name,
    email,
    attending,
    notes,
    source: 'invite.html',
    submittedAt: new Date().toISOString(),
    action: 'RSVP'
  }).catch(()=>{}).finally(()=>{
    document.getElementById('rsvpForm').style.display = 'none';
    document.querySelector('#rsvp .deadline').style.display = 'none';
    document.querySelector('#rsvp .cal-links').style.display = 'none';
    document.getElementById('rsvpSuccessMsg').textContent =
      attending==='yes'
        ? 'We can\'t wait to celebrate with you, '+name+'!'
        : 'You will be dearly missed, '+name+'. Thank you for letting us know.';
    success.classList.add('show');
  });
});

/* ---------- Add to Calendar (.ics) ---------- */
document.getElementById('icsLink').addEventListener('click', e=>{
  e.preventDefault();
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AllenAndMidhila//Wedding//EN','BEGIN:VEVENT',
  'UID:allen-midhila-2026@wedding','DTSTAMP:20260101T000000Z','DTSTART:20260824T060000Z','DTEND:20260824T100000Z',
  'SUMMARY:Allen & Midhila — Wedding','LOCATION:Thevalakkara Mar Thoma Valiyapalli\\, Thevalakkara\\, Kerala',
  'DESCRIPTION:Holy Matrimony at 11:30 AM\\, and thereafter reception at the Church Parish Hall.','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const blob = new Blob([ics],{type:'text/calendar'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'allen-midhila-wedding.ics';
  a.click();
  URL.revokeObjectURL(a.href);
});
