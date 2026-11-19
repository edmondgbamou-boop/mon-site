// ===== Progress bar =====
const progress = document.getElementById('progress');
function updateProgress(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = scrolled + '%';
}
document.addEventListener('scroll', updateProgress, { passive: true });

// ===== Mobile nav =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== Tabs (Parcours) =====
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected','true');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ===== Skill bars: animate when visible =====
const skillFills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.style.width = getComputedStyle(entry.target).getPropertyValue('--w');
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
skillFills.forEach(el => skillObserver.observe(el));

// ===== Hero canvas: curve with moving tangent line =====
const canvas = document.getElementById('tangentCanvas');
const ctx = canvas.getContext('2d');
let W, H, dpr;

function resizeCanvas(){
  dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  W = rect.width;
  H = rect.height;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const colors = {
  curve: '#2e2a6e',
  tangent: '#ff5a5f',
  point: '#ffc145',
  grid: 'rgba(20,20,43,0.06)'
};

// f(x) = amplitude * sin(freq * x) over a normalized domain
function f(x){ return 0.55 * Math.sin(1.6 * x) + 0.15 * Math.sin(3.1 * x + 1.0); }
function fPrime(x){ return 0.55 * 1.6 * Math.cos(1.6 * x) + 0.15 * 3.1 * Math.cos(3.1 * x + 1.0); }

let t = 0;
let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function toScreen(x, y){
  const px = (x + 3.4) / 6.8 * W;
  const py = H / 2 - y * (H * 0.32);
  return [px, py];
}

function draw(){
  ctx.clearRect(0, 0, W, H);

  // subtle grid
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= W; gx += W / 10){
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (let gy = 0; gy <= H; gy += H / 6){
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  // curve
  ctx.beginPath();
  ctx.strokeStyle = colors.curve;
  ctx.lineWidth = 2.5;
  for (let px = 0; px <= W; px += 2){
    const x = (px / W) * 6.8 - 3.4;
    const y = f(x);
    const [sx, sy] = toScreen(x, y);
    if (px === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // moving point + tangent line
  const x0 = Math.sin(t * 0.4) * 2.6;
  const y0 = f(x0);
  const slope = fPrime(x0);
  const [px0, py0] = toScreen(x0, y0);

  const dx = 1.1;
  const [tx1, ty1] = toScreen(x0 - dx, y0 - slope * dx);
  const [tx2, ty2] = toScreen(x0 + dx, y0 + slope * dx);

  ctx.beginPath();
  ctx.strokeStyle = colors.tangent;
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.moveTo(tx1, ty1);
  ctx.lineTo(tx2, ty2);
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = colors.point;
  ctx.arc(px0, py0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fff';
  ctx.stroke();

  if (!reduceMotion){
    t += 0.012;
    requestAnimationFrame(draw);
  }
}
draw();

// ===== Contact form (FormSubmit) =====
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
if (form){
  form.addEventListener('submit', () => {
    formNote.textContent = 'Envoi en cours…';
  });
}

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();
