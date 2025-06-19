// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Snow Effect
const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

let flakes = [];

function createFlakes() {
  for (let i = 0; i < 150; i++) {
    flakes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 4 + 1,
      d: Math.random() + 1
    });
  }
}

function drawFlakes() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "white";
  ctx.beginPath();
  for (let i = 0; i < flakes.length; i++) {
    let f = flakes[i];
    ctx.moveTo(f.x, f.y);
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
  }
  ctx.fill();
  moveFlakes();
}

let angle = 0;

function moveFlakes() {
  angle += 0.01;
  for (let i = 0; i < flakes.length; i++) {
    let f = flakes[i];
    f.y += Math.pow(f.d, 2) + 1;
    f.x += Math.sin(angle) * 2;

    if (f.y > height) {
      flakes[i] = {
        x: Math.random() * width,
        y: 0,
        r: f.r,
        d: f.d
      };
    }
  }
}

function animateSnow() {
  drawFlakes();
  requestAnimationFrame(animateSnow);
}

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

createFlakes();
animateSnow();
