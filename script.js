/**
 * ============================================================================
 * MINI LOVE WEBSITE - JAVASCRIPT
 * ============================================================================
 * Không phụ thuộc thư viện ngoài. Hoạt động offline và trên GitHub Pages.
 */

// ============================================================================
// 15. CONFIG - KHU VỰC DỄ DÀNG CHỈNH SỬA
// Thay đổi nội dung theo ý bạn tại đây mà không cần sửa code bên dưới!
// ============================================================================
const CONFIG = {
  // Tên hiển thị ở màn hình Reveal (ví dụ: "❤️ LÀ EM ❤️" hoặc "❤️ LÀ HOÀNG ANH ❤️")
  targetName: "❤️ LÀ EM ❤️",

  // Tiêu đề trang
  pageTitle: "A Little Gift For You 💌",

  // Đường dẫn nhạc nền (file mp3 tương đối)
  musicSrc: "music.mp3",

  // Danh sách ảnh và caption trong Gallery
  // Bạn có thể dùng định dạng .png hoặc .jpg tuỳ ý
  images: [
    {
      src: "images/1.png",
      caption: "Một người rất đặc biệt. ✨"
    },
    {
      src: "images/2.png",
      caption: "Một nụ cười rất đáng nhớ. 😊"
    },
    {
      src: "images/3.png",
      caption: "Một trong những khoảnh khắc anh thích. 📸"
    },
    {
      src: "images/4.png",
      caption: "Mỗi ngày có thêm một niềm vui nhỏ. 🌸"
    },
    {
      src: "images/5.png",
      caption: "Chỉ đơn giản là... vì đó là em. ❤️"
    }
  ],

  // Màn hình 6: Từng dòng suy nghĩ xuất hiện tuần tự
  thoughtLines: [
    "Có một điều anh đã suy nghĩ khá lâu...",
    "Anh không biết tương lai sẽ như thế nào.",
    "Nhưng hiện tại...",
    "Anh rất vui vì đã gặp em. ❤️"
  ],

  // Màn hình 7: Mối quan hệ bí mật
  statusTitle: "BÍ MẬT KHÔNG ĐƯỢC CÔNG KHAI 🤫❤️",
  statusSubtext: "Nhưng bí mật này...<br>anh lại khá thích.",

  // Màn hình 8: Đoạn kết & P/S
  finalPs: "Nếu em đã xem đến đây...<br>thì coi như anh thắng rồi. 😌"
};


// ============================================================================
// STATE & DOM ELEMENTS
// ============================================================================
let currentScreenIndex = 0;
const screenIds = [
  'screen-intro',     // 0
  'screen-question',  // 1
  'screen-dossier',   // 2
  'screen-reveal',    // 3
  'screen-gallery',   // 4
  'screen-thoughts',  // 5
  'screen-status',    // 6
  'screen-final'      // 7
];

let currentSlide = 0;
let isAudioPlaying = false;
let confettiActive = false;
let animationFrameId = null;

// ============================================================================
// AUDIO MANAGER (Tuân thủ chính sách Autoplay của trình duyệt di động)
// ============================================================================
const bgAudio = document.getElementById('bg-audio');
const musicToggle = document.getElementById('music-toggle');
const musicLabel = document.getElementById('music-label');

function initAudio() {
  if (CONFIG.musicSrc) {
    bgAudio.src = CONFIG.musicSrc;
  }

  musicToggle.addEventListener('click', () => {
    toggleAudio();
  });
}

function playAudio() {
  if (!bgAudio) return;
  bgAudio.play().then(() => {
    isAudioPlaying = true;
    musicToggle.classList.add('playing');
    musicLabel.textContent = 'Music ON';
  }).catch(() => {
    // Trình duyệt chặn hoặc chưa có file nhạc -> giữ trạng thái an toàn không lỗi console
    isAudioPlaying = false;
    musicToggle.classList.remove('playing');
    musicLabel.textContent = 'Music OFF';
  });
}

function pauseAudio() {
  if (!bgAudio) return;
  bgAudio.pause();
  isAudioPlaying = false;
  musicToggle.classList.remove('playing');
  musicLabel.textContent = 'Music OFF';
}

function toggleAudio() {
  if (isAudioPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

// ============================================================================
// SCREEN ROUTER & TRANSITIONS
// ============================================================================
function showScreen(nextIndex) {
  const currentScreen = document.getElementById(screenIds[currentScreenIndex]);
  const nextScreen = document.getElementById(screenIds[nextIndex]);

  if (!nextScreen) return;

  // Xử lý theme buổi tối cho màn hình suy nghĩ
  if (screenIds[nextIndex] === 'screen-thoughts') {
    document.body.classList.add('twilight-theme');
  } else {
    document.body.classList.remove('twilight-theme');
  }

  // Animation mượt mà khi chuyển cảnh
  if (currentScreen) {
    currentScreen.classList.remove('active');
    currentScreen.classList.add('exit-left');
    setTimeout(() => {
      currentScreen.classList.remove('exit-left');
    }, 500);
  }

  nextScreen.classList.add('active');
  currentScreenIndex = nextIndex;

  // Kích hoạt logic tương ứng với từng màn hình
  onScreenActivated(screenIds[nextIndex]);
}

function onScreenActivated(screenId) {
  if (screenId === 'screen-reveal') {
    triggerRevealAnimation();
  } else if (screenId === 'screen-thoughts') {
    triggerThoughtsAnimation();
  } else if (screenId === 'screen-final') {
    triggerFinalConfetti();
  }
}

// ============================================================================
// SCREEN 1: INTRO
// ============================================================================
const btnStart = document.getElementById('btn-start');
btnStart.addEventListener('click', (e) => {
  createHeartBurst(e.clientX, e.clientY, 15);
  playAudio(); // Kích hoạt nhạc sau khi người dùng tương tác
  setTimeout(() => {
    showScreen(1);
  }, 400);
});

// ============================================================================
// SCREEN 2: QUESTION & ANALYSIS
// ============================================================================
const answersContainer = document.getElementById('answers-container');
const analysisBox = document.getElementById('analysis-box');
const analysisText = document.getElementById('analysis-text');
const analysisBar = document.getElementById('analysis-bar');
const choiceButtons = document.querySelectorAll('.btn-choice');

choiceButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    createHeartBurst(e.clientX, e.clientY, 8);
    btn.classList.add('selected');

    // Ẩn các nút đáp án sau nhấp nhẹ
    setTimeout(() => {
      answersContainer.classList.add('hidden');
      analysisBox.classList.remove('hidden');
      startAnalysisSimulation();
    }, 350);
  });
});

function startAnalysisSimulation() {
  // Giai đoạn 1: Đang phân tích (0s)
  analysisText.textContent = '🔍 Đang phân tích...';
  analysisBar.style.width = '25%';

  // Giai đoạn 2: Đang kiểm tra dữ liệu (800ms)
  setTimeout(() => {
    analysisText.textContent = '⏳ Đang kiểm tra dữ liệu...';
    analysisBar.style.width = '65%';
  }, 800);

  // Giai đoạn 3: Đã tìm thấy đáp án (1600ms)
  setTimeout(() => {
    analysisText.textContent = '✨ Đã tìm thấy đáp án.';
    analysisBar.style.width = '92%';
  }, 1600);

  // Giai đoạn 4: Chính xác! ❤️ (2200ms)
  setTimeout(() => {
    analysisText.innerHTML = '<strong>Chính xác! ❤️</strong>';
    analysisBar.style.width = '100%';
    createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 25);
  }, 2200);

  // Chuyển màn hình hồ sơ bí mật (3100ms)
  setTimeout(() => {
    showScreen(2);
  }, 3100);
}

// ============================================================================
// SCREEN 3: CLASSIFIED DOSSIER
// ============================================================================
const btnUnlock = document.getElementById('btn-unlock');
btnUnlock.addEventListener('click', (e) => {
  createHeartBurst(e.clientX, e.clientY, 12);
  btnUnlock.innerHTML = '<span>🔓 Đang giải mã...</span>';
  btnUnlock.style.opacity = '0.7';

  setTimeout(() => {
    showScreen(3);
    btnUnlock.innerHTML = '<span class="lock-icon">🔓</span><span>Mở hồ sơ</span>';
    btnUnlock.style.opacity = '1';
  }, 600);
});

// ============================================================================
// SCREEN 4: REVEAL
// ============================================================================
const revealLine1 = document.getElementById('reveal-line-1');
const revealLine2 = document.getElementById('reveal-line-2');
const revealHero = document.getElementById('reveal-hero');
const targetNameDisplay = document.getElementById('target-name-display');
const btnGotoGallery = document.getElementById('btn-goto-gallery');

function triggerRevealAnimation() {
  targetNameDisplay.textContent = CONFIG.targetName;
  revealLine1.classList.remove('show');
  revealLine2.classList.remove('show');
  revealHero.classList.remove('show');

  setTimeout(() => {
    revealLine1.classList.add('show');
  }, 400);

  setTimeout(() => {
    revealLine2.classList.add('show');
  }, 1300);

  setTimeout(() => {
    revealHero.classList.add('show');
    createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 20);
  }, 2200);
}

btnGotoGallery.addEventListener('click', (e) => {
  createHeartBurst(e.clientX, e.clientY, 10);
  showScreen(4);
});

// ============================================================================
// SCREEN 5: IMAGE GALLERY (Hỗ trợ Touch Swipe & Nút điều hướng)
// ============================================================================
const gallerySlider = document.getElementById('gallery-slider');
const galleryDots = document.getElementById('gallery-dots');
const galleryCounter = document.getElementById('gallery-counter');
const galleryCaption = document.getElementById('gallery-caption');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnToThoughts = document.getElementById('btn-to-thoughts');
const galleryTouchArea = document.getElementById('gallery-touch-area');
const gallerySparkles = document.getElementById('gallery-sparkles');

function initGallery() {
  gallerySlider.innerHTML = '';
  galleryDots.innerHTML = '';

  const total = CONFIG.images.length;

  CONFIG.images.forEach((item, index) => {
    // Slide container
    const slide = document.createElement('div');
    slide.className = `gallery-slide ${index === 0 ? 'active' : ''}`;
    
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = `Ảnh kỷ niệm ${index + 1}`;
    img.loading = 'lazy';
    
    // Fallback phòng khi đường dẫn ảnh khác đuôi
    img.onerror = function() {
      if (item.src.endsWith('.png')) {
        img.src = item.src.replace('.png', '.jpg');
      } else if (item.src.endsWith('.jpg')) {
        img.src = item.src.replace('.jpg', '.png');
      }
    };

    slide.appendChild(img);
    gallerySlider.appendChild(slide);

    // Dot indicator
    const dot = document.createElement('div');
    dot.className = `gallery-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
    galleryDots.appendChild(dot);
  });

  updateGalleryUI();
}

function updateGalleryUI() {
  const slides = document.querySelectorAll('.gallery-slide');
  const dots = document.querySelectorAll('.gallery-dot');
  const total = CONFIG.images.length;

  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === currentSlide);
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlide);
  });

  galleryCounter.textContent = `${currentSlide + 1} / ${total}`;

  // Cập nhật caption với hiệu ứng mượt
  galleryCaption.style.opacity = '0';
  galleryCaption.style.transform = 'translateY(6px)';
  
  setTimeout(() => {
    galleryCaption.textContent = CONFIG.images[currentSlide]?.caption || '';
    galleryCaption.style.opacity = '1';
    galleryCaption.style.transform = 'translateY(0)';
  }, 200);

  // Hiệu ứng hạt bay nhẹ khi đổi ảnh
  emitSlideSparkles();
}

function goToSlide(index) {
  if (index < 0) {
    currentSlide = CONFIG.images.length - 1;
  } else if (index >= CONFIG.images.length) {
    currentSlide = 0;
  } else {
    currentSlide = index;
  }
  updateGalleryUI();
}

btnPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
btnNext.addEventListener('click', () => goToSlide(currentSlide + 1));

// Swipe touch gesture trên điện thoại
let touchStartX = 0;
let touchEndX = 0;

galleryTouchArea.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

galleryTouchArea.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
}, { passive: true });

function handleSwipeGesture() {
  const swipeDistance = touchEndX - touchStartX;
  const threshold = 45; // Khoảng cách vuốt tối thiểu

  if (swipeDistance < -threshold) {
    // Vuốt sang trái -> Ảnh tiếp theo
    goToSlide(currentSlide + 1);
  } else if (swipeDistance > threshold) {
    // Vuốt sang phải -> Ảnh trước
    goToSlide(currentSlide - 1);
  }
}

function emitSlideSparkles() {
  const heartIcons = ['✨', '💖', '🌸', '💫'];
  for (let i = 0; i < 4; i++) {
    const el = document.createElement('span');
    el.className = 'burst-particle';
    el.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
    el.style.left = `${40 + Math.random() * 20}%`;
    el.style.top = `${40 + Math.random() * 20}%`;
    el.style.setProperty('--tx', `${(Math.random() - 0.5) * 140}px`);
    el.style.setProperty('--ty', `${(Math.random() - 0.5) * 140}px`);
    gallerySparkles.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 900);
  }
}

btnToThoughts.addEventListener('click', (e) => {
  createHeartBurst(e.clientX, e.clientY, 12);
  showScreen(5);
});

// ============================================================================
// SCREEN 6: MONOLOGUE / THOUGHTS
// ============================================================================
const thoughtLinesContainer = document.getElementById('thought-lines-container');
const btnToStatus = document.getElementById('btn-to-status');

function triggerThoughtsAnimation() {
  thoughtLinesContainer.innerHTML = '';
  btnToStatus.classList.add('hidden');

  CONFIG.thoughtLines.forEach((text, index) => {
    const p = document.createElement('p');
    p.className = 'thought-line';
    if (index === CONFIG.thoughtLines.length - 1) {
      p.classList.add('highlight');
    }
    p.textContent = text;
    thoughtLinesContainer.appendChild(p);

    // Xuất hiện từng dòng tuần tự với độ trễ êm dịu
    setTimeout(() => {
      p.classList.add('show');
    }, 600 + index * 1300);
  });

  // Hiển thị nút tiếp tục sau khi tất cả dòng đã hiện
  setTimeout(() => {
    btnToStatus.classList.remove('hidden');
  }, 600 + CONFIG.thoughtLines.length * 1300 + 400);
}

btnToStatus.addEventListener('click', (e) => {
  createHeartBurst(e.clientX, e.clientY, 10);
  showScreen(6);
});

// ============================================================================
// SCREEN 7: CLASSIFIED STATUS
// ============================================================================
const statusTitleDisplay = document.getElementById('status-title-display');
const statusSubtextDisplay = document.getElementById('status-subtext-display');
const btnToFinal = document.getElementById('btn-to-final');

statusTitleDisplay.innerHTML = CONFIG.statusTitle;
statusSubtextDisplay.innerHTML = CONFIG.statusSubtext;

btnToFinal.addEventListener('click', (e) => {
  createHeartBurst(e.clientX, e.clientY, 15);
  showScreen(7);
});

// ============================================================================
// SCREEN 8: FINALE & REPLAY
// ============================================================================
const finalPsDisplay = document.getElementById('final-ps-display');
const btnReplay = document.getElementById('btn-replay');

finalPsDisplay.innerHTML = CONFIG.finalPs;

btnReplay.addEventListener('click', () => {
  confettiActive = false;
  answersContainer.classList.remove('hidden');
  analysisBox.classList.add('hidden');
  choiceButtons.forEach(b => b.classList.remove('selected'));
  goToSlide(0);
  showScreen(0);
});

// ============================================================================
// CANVAS 1: AMBIENT FLOATING HEARTS & PARTICLES (Hiệu năng cao, chạy êm ái)
// ============================================================================
const ambientCanvas = document.getElementById('ambient-canvas');
const ambientCtx = ambientCanvas.getContext('2d');
let ambientParticles = [];

function resizeAmbientCanvas() {
  ambientCanvas.width = window.innerWidth;
  ambientCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeAmbientCanvas);
resizeAmbientCanvas();

class AmbientHeart {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * ambientCanvas.width;
    this.y = initial ? Math.random() * ambientCanvas.height : ambientCanvas.height + 20;
    this.size = Math.random() * 14 + 10;
    this.speed = Math.random() * 0.8 + 0.5;
    this.alpha = Math.random() * 0.4 + 0.2;
    this.angle = Math.random() * Math.PI * 2;
    this.angleSpeed = (Math.random() - 0.5) * 0.02;
    this.oscillation = Math.random() * 1.5;
    this.symbol = ['❤️', '💖', '🌸', '✨', '🤍'][Math.floor(Math.random() * 5)];
  }

  update() {
    this.y -= this.speed;
    this.angle += this.angleSpeed;
    this.x += Math.sin(this.angle) * this.oscillation;

    if (this.y < -30) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = `${this.size}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText(this.symbol, this.x, this.y);
    ctx.restore();
  }
}

// Khởi tạo hạt bay nhẹ nhàng trong nền
const ambientCount = window.innerWidth < 600 ? 18 : 28;
for (let i = 0; i < ambientCount; i++) {
  ambientParticles.push(new AmbientHeart());
}

function animateAmbient() {
  ambientCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
  for (let p of ambientParticles) {
    p.update();
    p.draw(ambientCtx);
  }
  requestAnimationFrame(animateAmbient);
}
animateAmbient();

// ============================================================================
// CANVAS 2: CONFETTI HÌNH TRÁI TIM KHI VỀ ĐÍCH (Grand Finale)
// ============================================================================
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');
let confettiParticles = [];

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

class HeartConfetti {
  constructor() {
    this.x = Math.random() * confettiCanvas.width;
    this.y = Math.random() * -confettiCanvas.height;
    this.size = Math.random() * 16 + 12;
    this.speedY = Math.random() * 2.5 + 2;
    this.speedX = (Math.random() - 0.5) * 2;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 4;
    this.alpha = 1;
    this.symbols = ['💖', '❤️', '💕', '✨', '🌸', '💐'];
    this.symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;

    if (this.y > confettiCanvas.height) {
      this.y = -20;
      this.x = Math.random() * confettiCanvas.width;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.font = `${this.size}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText(this.symbol, 0, 0);
    ctx.restore();
  }
}

function triggerFinalConfetti() {
  confettiActive = true;
  confettiParticles = [];
  const count = window.innerWidth < 600 ? 35 : 60;
  for (let i = 0; i < count; i++) {
    confettiParticles.push(new HeartConfetti());
  }
  animateConfetti();
}

function animateConfetti() {
  if (!confettiActive) {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    return;
  }
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  for (let p of confettiParticles) {
    p.update();
    p.draw(confettiCtx);
  }
  requestAnimationFrame(animateConfetti);
}

// ============================================================================
// INTERACTIVE BURST ON TAP / CLICK
// ============================================================================
function createHeartBurst(clientX, clientY, count = 10) {
  if (!clientX || !clientY) {
    clientX = window.innerWidth / 2;
    clientY = window.innerHeight / 2;
  }

  const icons = ['❤️', '💖', '✨', '🌸'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'burst-particle';
    el.textContent = icons[Math.floor(Math.random() * icons.length)];
    el.style.left = `${clientX}px`;
    el.style.top = `${clientY}px`;
    el.style.fontSize = `${Math.random() * 12 + 16}px`;

    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
    const distance = Math.random() * 70 + 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);
    document.body.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 900);
  }
}

// Ripple Effect trên các button
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.ripple-btn');
  if (btn) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'ripple';
    btn.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  document.title = CONFIG.pageTitle;
  initAudio();
  initGallery();
});
