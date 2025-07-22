const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let starMemories = [];
let galleryMemories = [];

let backgroundStars = [];
let memoryStars = [];

const numBackgroundStars = 100;
const numMemoryStars = 9;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

function setupStars() {
  backgroundStars = [];
  memoryStars = [];

  for (let i = 0; i < numBackgroundStars; i++) {
    backgroundStars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.2 + 0.3,
      alpha: Math.random(),
      delta: Math.random() * 0.005 + 0.001
    });
  }

  for (let i = 0; i < numMemoryStars; i++) {
    const mem = starMemories[i] || {
      title: `Memory Star ${i + 1}`,
      text: "A beautiful moment remembered."
    };

    memoryStars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 4,
      alpha: 1,
      delta: 0.01,
      memory: mem
    });
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const star of backgroundStars) {
    star.alpha += star.delta;
    if (star.alpha <= 0.2 || star.alpha >= 1) star.delta *= -1;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.fill();
  }

  for (const star of memoryStars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  requestAnimationFrame(animate);
}

function showMemoryModal(memory) {
  const modal = document.createElement("div");
  modal.className = "memory-modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${memory.title}</h2>
      ${memory.image ? `<img src="${memory.image}" alt="${memory.title}" class="memory-image" />` : ""}
      <p>${memory.text}</p>
      ${memory.audio ? `<audio controls autoplay style="width: 100%; margin-top: 1rem;">
                          <source src="${memory.audio}" type="audio/mpeg">Your browser does not support the audio element.
                        </audio>` : ""}
      <button onclick="this.closest('.memory-modal').remove()">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function showGalleryModal() {
  const modal = document.createElement("div");
  modal.className = "memory-modal";

  let currentIndex = 0;
  const images = galleryMemories.filter(m => m.image);

  function updateSlide() {
  const slideContainer = modal.querySelector(".gallery-slide");

  if (!images.length || !images[currentIndex]) {
    slideContainer.innerHTML = `<p>No memories to display 🥺</p>`;
    return;
  }

  const memory = images[currentIndex];

  slideContainer.innerHTML = `
    <h2>${memory.title || "Untitled Memory"}</h2>
    ${memory.image ? `<img src="${memory.image}" alt="${memory.title || "Memory"}" class="memory-image" />` : ""}
    <p>${memory.text || ""}</p>
  `;
}


  modal.innerHTML = `
    <div class="modal-content">
      <div class="gallery-slide"></div>
      <div class="gallery-controls">
        <button id="prev-slide" style="padding: 6px 10px; font-size: 0.9rem;">◀</button>
        <button id="next-slide" style="padding: 6px 10px; font-size: 0.9rem;">▶</button>
      </div>
      <button onclick="this.closest('.memory-modal').remove()">Close</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Button listeners
  modal.querySelector("#prev-slide").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateSlide();
  });

  modal.querySelector("#next-slide").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateSlide();
  });

  // Swipe support
  let startX = 0;
  let endX = 0;
  const slideArea = modal.querySelector(".gallery-slide");

  slideArea.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  slideArea.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        currentIndex = (currentIndex + 1) % images.length;
      } else {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
      }
      updateSlide();
    }
  });

  updateSlide();
}

canvas.addEventListener('click', (e) => {
  const clickX = e.clientX;
  const clickY = e.clientY;

  for (const star of memoryStars) {
    const dx = clickX - star.x;
    const dy = clickY - star.y;
    if (Math.sqrt(dx * dx + dy * dy) < star.radius + 6) {
      showMemoryModal(star.memory);
      break;
    }
  }
});

window.addEventListener('resize', () => {
  resizeCanvas();
  setupStars();
});

fetch('memories.json')
  .then(res => res.json())
  .then(data => {
    starMemories = data.slice(0, numMemoryStars);
    galleryMemories = data.slice(numMemoryStars);
    setupStars();
    animate();
  })
  .catch(() => {
    starMemories = [ /* fallback memories */ ];
    galleryMemories = [];
    setupStars();
    animate();
  });

document.getElementById("gallery-button").addEventListener("click", showGalleryModal);

document.getElementById('comfort-moon').addEventListener('click', () => {
  showMemoryModal({
    title: "🌙 The Comfort Moon",
    text: `
      <p style="font-size: 1.1rem; line-height: 1.6;">
        <strong>Hey my love 💗</strong><br><br>
        On days like these, I want you to remember:<br><br>
        🌸 You're allowed to slow down.<br>
        🌙 You are not alone. I'm with you. Just text me!<br>
        💧 Let yourself feel everything; you're safe.<br>
        🧸 Rest, hydrate, and wrap yourself in warmth.<br>
        ☕ A soft blanket, a favorite song, a warm cup. You deserve all the comfort.<br><br>
        <em>I wish I could be there to bring this to you. But until then, I’m sending this virtual hug 🤗 and a reminder that you’re strong, soft, and loved.</em>
        <em>Tonight, the moon is our shared sky hug, glowing quietly just for you.</em>
      </p>
    `
  });
});
