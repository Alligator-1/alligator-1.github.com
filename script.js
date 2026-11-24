// Фон: частицы, которые плывут по «полю течения» и оставляют светящиеся следы

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

const BG_COLOR = "#0a0c19";
let w, h;
let particles = [];
const mouse = { x: -9999, y: -9999 };

function spawn() {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    life: 120 + Math.random() * 240,
  };
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, w, h);

  const count = Math.min(900, Math.floor((w * h) / 2500));
  particles = Array.from({ length: count }, spawn);
}

// Направление течения в точке (x, y) в момент времени t
function flowAngle(x, y, t) {
  return (
    (Math.sin(x * 0.003 + t * 0.0003) + Math.cos(y * 0.004 - t * 0.0002)) * Math.PI +
    Math.sin((x + y) * 0.002 + t * 0.0004) * 2
  );
}

function frame(t) {
  // Лёгкое затухание предыдущего кадра — так появляются шлейфы
  ctx.fillStyle = "rgba(10, 12, 25, 0.08)";
  ctx.fillRect(0, 0, w, h);

  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";

  for (const p of particles) {
    const a = flowAngle(p.x, p.y, t);
    const px = p.x;
    const py = p.y;

    p.x += Math.cos(a) * 1.4;
    p.y += Math.sin(a) * 1.4;

    // Курсор слегка отталкивает частицы
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 120 && dist > 0.1) {
      const push = (120 - dist) / 120;
      p.x += (dx / dist) * push * 3;
      p.y += (dy / dist) * push * 3;
    }

    // Цвет зависит от направления: от голубого до фиолетового
    const hue = 200 + Math.sin(a) * 60;
    ctx.strokeStyle = `hsla(${hue}, 100%, 65%, 0.8)`;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    p.life--;
    if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
      Object.assign(p, spawn());
    }
  }

  requestAnimationFrame(frame);
}

window.addEventListener("resize", resize);
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener("mouseleave", () => {
  mouse.x = mouse.y = -9999;
});
window.addEventListener("touchmove", (e) => {
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
}, { passive: true });

resize();
requestAnimationFrame(frame);
