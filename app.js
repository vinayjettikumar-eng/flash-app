/**
 * =========================================================
 * FLASH ₹5,000 - MAIN APP CONTROLLER (app.js)
 * Implements the exact 4-step prank state machine:
 *  - Step 1: Home Screen (FLASH CONTROL) -> [START] -> Flash ON
 *  - Step 2: Flashlight Locked Screen (⚠️ FLASHLIGHT LOCKED, ₹5,000) -> [CONTINUE]
 *  - Step 3: Fake Payment Screen (PAYMENT REQUIRED, ₹5,000) -> [PROCEED TO PAYMENT]
 *            -> Simulated processing (3s "Processing payment..." + 2s "Payment verification...")
 *  - Step 4: Final Reveal (😂 GOTCHA! 😂, Flash OFF, Confetti, PLAY AGAIN / EXIT)
 *  - Discreet Emergency "Turn Flashlight OFF" controls
 * =========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------
  // 1. STATE & DOM REFERENCES
  // ---------------------------------------------------------
  const state = {
    currentScreenId: 'screen-home',
    processingTimer1: null,
    processingTimer2: null,
    confettiRunning: false,
    processingInterval: null
  };

  // Screens
  const screens = {
    home: document.getElementById('screen-home'),
    locked: document.getElementById('screen-locked'),
    payment: document.getElementById('screen-payment'),
    reveal: document.getElementById('screen-reveal')
  };

  // Payment sub-views
  const paymentViewEntry = document.getElementById('payment-view-entry');
  const paymentViewProcessing = document.getElementById('payment-view-processing');
  const processingStage1 = document.getElementById('processing-stage-1');
  const processingStage2 = document.getElementById('processing-stage-2');

  // Header & indicators
  const clockEl = document.getElementById('live-clock');
  const torchDotEl = document.getElementById('hardware-torch-dot');
  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const soundIcon = document.getElementById('sound-icon');
  const btnToggleFrame = document.getElementById('btn-toggle-frame');
  const toastEl = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');

  // Primary action buttons
  const btnStart = document.getElementById('btn-start');
  const btnContinue = document.getElementById('btn-continue');
  const btnProceedPayment = document.getElementById('btn-proceed-payment');
  const btnPlayAgain = document.getElementById('btn-play-again');
  const btnExit = document.getElementById('btn-exit');

  // Emergency links
  const emergencyButtons = [
    document.getElementById('btn-emergency-off-1'),
    document.getElementById('btn-emergency-off-2'),
    document.getElementById('btn-emergency-off-3')
  ];

  // Exit Modal
  const exitModal = document.getElementById('exit-modal');
  const btnModalRestart = document.getElementById('btn-modal-restart');
  const btnModalClose = document.getElementById('btn-modal-close');

  // Confetti Canvas
  const canvas = document.getElementById('confetti-canvas');
  let ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let confettiAnimFrame = null;

  // ---------------------------------------------------------
  // 2. LIVE STATUS BAR & AUDIO SYNC
  // ---------------------------------------------------------
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Sound toggle button
  if (btnToggleSound) {
    soundIcon.textContent = window.prankAudio.isMuted ? '🔇' : '🔊';
    btnToggleSound.addEventListener('click', () => {
      const muted = window.prankAudio.toggleMute();
      soundIcon.textContent = muted ? '🔇' : '🔊';
      showToast(muted ? 'Sound Muted 🔇' : 'Sound Unmuted 🔊');
    });
  }

  // Desktop Frame Toggle (Device mockup vs fullscreen)
  if (btnToggleFrame) {
    btnToggleFrame.addEventListener('click', () => {
      document.body.classList.toggle('desktop-mockup-mode');
      const isMock = document.body.classList.contains('desktop-mockup-mode');
      showToast(isMock ? 'Phone Mockup View 📱' : 'Full Window View 🖥️');
    });
  }

  function updateTorchIndicator(isActive) {
    if (torchDotEl) {
      if (isActive) {
        torchDotEl.classList.add('active');
      } else {
        torchDotEl.classList.remove('active');
      }
    }
  }

  function showToast(message, icon = 'ℹ️') {
    if (!toastEl) return;
    toastMsg.textContent = message;
    const iconEl = document.getElementById('toast-icon');
    if (iconEl) iconEl.textContent = icon;

    toastEl.classList.remove('hidden');
    toastEl.classList.add('show');

    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => toastEl.classList.add('hidden'), 300);
    }, 2800);
  }

  // ---------------------------------------------------------
  // 3. SCREEN SWITCHING ENGINE
  // ---------------------------------------------------------
  function showScreen(screenId) {
    state.currentScreenId = screenId;

    Object.keys(screens).forEach(key => {
      const s = screens[key];
      if (!s) return;
      if (s.id === screenId) {
        s.classList.add('active');
        s.style.display = 'flex';
      } else {
        s.classList.remove('active');
        s.style.display = 'none';
      }
    });

    // Scroll to top of active screen
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
      activeScreen.scrollTop = 0;
    }
  }

  // ---------------------------------------------------------
  // 4. STEP 1 — HOME SCREEN ("FLASH CONTROL")
  // ---------------------------------------------------------
  if (btnStart) {
    btnStart.addEventListener('click', async () => {
      window.prankAudio.playClick();
      btnStart.disabled = true;
      btnStart.classList.add('loading');

      // Request flashlight/camera permission and turn flashlight ON
      try {
        await window.flashlightCtrl.activateTorch();
        updateTorchIndicator(true);
      } catch (err) {
        console.warn('Torch activation error:', err);
      }

      // Play alert sound for the upcoming security lock
      setTimeout(() => {
        window.prankAudio.playLockAlert();
      }, 400);

      // Transition to STEP 2 (FLASHLIGHT LOCKED)
      setTimeout(() => {
        btnStart.disabled = false;
        btnStart.classList.remove('loading');
        showScreen('screen-locked');
      }, 500);
    });
  }

  // ---------------------------------------------------------
  // 5. STEP 2 — FLASHLIGHT LOCKED SCREEN
  // ---------------------------------------------------------
  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      window.prankAudio.playClick();

      // Reset payment view states before showing
      if (paymentViewEntry) paymentViewEntry.classList.remove('hidden');
      if (paymentViewProcessing) paymentViewProcessing.classList.add('hidden');
      if (processingStage1) processingStage1.classList.remove('hidden');
      if (processingStage2) processingStage2.classList.add('hidden');

      // Move to STEP 3 (Fake Payment Screen)
      showScreen('screen-payment');
    });
  }

  // ---------------------------------------------------------
  // 6. STEP 3 — FAKE PAYMENT & SIMULATED PROCESSING
  // ---------------------------------------------------------
  if (btnProceedPayment) {
    btnProceedPayment.addEventListener('click', () => {
      window.prankAudio.playClick();

      // Switch to processing view inside payment screen
      if (paymentViewEntry) paymentViewEntry.classList.add('hidden');
      if (paymentViewProcessing) {
        paymentViewProcessing.classList.remove('hidden');
        paymentViewProcessing.style.display = 'flex';
      }

      // Stage 1: "Processing payment..." with loading animation (~3 seconds)
      if (processingStage1) processingStage1.classList.remove('hidden');
      if (processingStage2) processingStage2.classList.add('hidden');

      window.prankAudio.playProcessingBlip();
      let blipCounter = 0;
      state.processingInterval = setInterval(() => {
        blipCounter++;
        if (blipCounter < 3) {
          window.prankAudio.playProcessingBlip();
        }
      }, 1000);

      // Wait 3 seconds -> Transition to Stage 2
      state.processingTimer1 = setTimeout(() => {
        clearInterval(state.processingInterval);

        // Stage 2: "Payment verification in progress..." (~2 seconds)
        if (processingStage1) processingStage1.classList.add('hidden');
        if (processingStage2) {
          processingStage2.classList.remove('hidden');
          processingStage2.classList.add('active');
        }

        window.prankAudio.playVerificationChime();

        // Wait another 2 seconds -> Transition to STEP 4 (Final Reveal)
        state.processingTimer2 = setTimeout(() => {
          triggerFinalReveal();
        }, 2000);

      }, 3000);
    });
  }

  // ---------------------------------------------------------
  // 7. STEP 4 — FINAL REVEAL ("😂 GOTCHA! 😂")
  // ---------------------------------------------------------
  function triggerFinalReveal() {
    // Clear any timers
    clearTimeout(state.processingTimer1);
    clearTimeout(state.processingTimer2);
    clearInterval(state.processingInterval);

    // CRITICAL: Immediately turn the flashlight OFF
    window.flashlightCtrl.turnOffAll();
    updateTorchIndicator(false);

    // Transition to Reveal Screen
    showScreen('screen-reveal');

    // Play triumphant victory celebration & fanfare!
    window.prankAudio.playGotchaFanfare();

    // Start confetti particle celebration
    startConfetti();
  }

  // "PLAY AGAIN" Button
  if (btnPlayAgain) {
    btnPlayAgain.addEventListener('click', () => {
      window.prankAudio.playClick();
      stopConfetti();

      // Ensure flash remains OFF
      window.flashlightCtrl.turnOffAll();
      updateTorchIndicator(false);

      // Reset Payment sub-views
      if (paymentViewEntry) paymentViewEntry.classList.remove('hidden');
      if (paymentViewProcessing) paymentViewProcessing.classList.add('hidden');
      if (processingStage1) processingStage1.classList.remove('hidden');
      if (processingStage2) processingStage2.classList.add('hidden');

      // Return to STEP 1 (Home Screen)
      showScreen('screen-home');
      showToast('Prank Reset! Ready for your next victim! 😂', '🔄');
    });
  }

  // "EXIT" Button
  if (btnExit) {
    btnExit.addEventListener('click', () => {
      window.prankAudio.playClick();
      stopConfetti();
      window.flashlightCtrl.turnOffAll();
      updateTorchIndicator(false);

      if (exitModal) {
        exitModal.classList.remove('hidden');
      }
    });
  }

  // Exit Modal actions
  if (btnModalRestart) {
    btnModalRestart.addEventListener('click', () => {
      window.prankAudio.playClick();
      if (exitModal) exitModal.classList.add('hidden');
      showScreen('screen-home');
    });
  }

  if (btnModalClose) {
    btnModalClose.addEventListener('click', () => {
      window.prankAudio.playClick();
      if (exitModal) exitModal.classList.add('hidden');
      showScreen('screen-home');
      showToast('Flash ₹5000 safely closed.', '🔦');
    });
  }

  // ---------------------------------------------------------
  // 8. DISCREET EMERGENCY "Turn Flashlight OFF" CONTROLS
  // ---------------------------------------------------------
  emergencyButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Clear any pending timers
      clearTimeout(state.processingTimer1);
      clearTimeout(state.processingTimer2);
      clearInterval(state.processingInterval);

      // Immediately shut off all flashlight and strobe operations
      window.flashlightCtrl.emergencyTurnOff();
      updateTorchIndicator(false);

      showToast('Flashlight turned OFF via emergency control.', '🛡️');

      // Provide a brief pause and return to Home Screen safely
      setTimeout(() => {
        showScreen('screen-home');
      }, 700);
    });
  });

  // ---------------------------------------------------------
  // 9. CELEBRATORY CONFETTI ENGINE (Canvas-based, 60FPS)
  // ---------------------------------------------------------
  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function startConfetti() {
    if (!canvas || !ctx) return;
    stopConfetti();
    resizeCanvas();
    state.confettiRunning = true;

    const colors = [
      '#ff1744', '#ffd600', '#00e676', '#2979ff',
      '#e040fb', '#00e5ff', '#ff9100', '#ffeb3b'
    ];

    particles = [];
    const count = 120;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 60,
        y: canvas.height * 0.4 + (Math.random() - 0.5) * 40,
        size: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -16 - 6,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.38,
        drag: 0.985,
        opacity: 1
      });
    }

    renderConfetti();

    // Auto-fade after 5 seconds to preserve performance
    setTimeout(() => {
      stopConfetti();
    }, 5500);
  }

  function renderConfetti() {
    if (!state.confettiRunning || !ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeParticles = 0;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.rotation += p.rotSpeed;

      if (p.y < canvas.height + 20) {
        activeParticles++;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (activeParticles > 0 && state.confettiRunning) {
      confettiAnimFrame = requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      state.confettiRunning = false;
    }
  }

  function stopConfetti() {
    state.confettiRunning = false;
    if (confettiAnimFrame) {
      cancelAnimationFrame(confettiAnimFrame);
      confettiAnimFrame = null;
    }
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    particles = [];
  }

  // Initial screen display
  showScreen('screen-home');
});
