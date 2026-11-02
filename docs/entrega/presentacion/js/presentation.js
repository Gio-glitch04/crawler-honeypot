/* =========================================================================
   PRESENTATION.JS · CONTROLADOR CENTRAL DE PRESENTACIÓN CAD & SINCRONIZACIÓN
   ========================================================================= */

(function () {
  'use strict';

  let currentSlide = 0;
  const totalSlides = 17;
  let timerSeconds = 1200; // 20:00 minutos reglamentarios
  let isTimerRunning = false;
  let timerInterval = null;

  const channel = new BroadcastChannel('honeypot_presentation_sync');

  let slides = [];
  let slideBadge, btnPrevSlide, btnNextSlide, timerClock, btnTimerControl, btnLaunchPrompter, broadcastAlert;

  function init() {
    const stage = document.getElementById('slidesContainer');
    
    // Inyectar diapositivas modularizadas desde window.PRESENTATION_SLIDES
    if (window.PRESENTATION_SLIDES && Array.isArray(window.PRESENTATION_SLIDES)) {
      window.PRESENTATION_SLIDES.forEach((slideHtml) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = slideHtml.trim();
        if (tempDiv.firstElementChild) {
          stage.appendChild(tempDiv.firstElementChild);
        }
      });
    }

    slides = document.querySelectorAll('.cad-slide-page');
    slideBadge = document.getElementById('slideBadge');
    btnPrevSlide = document.getElementById('btnPrevSlide');
    btnNextSlide = document.getElementById('btnNextSlide');
    timerClock = document.getElementById('timerClock');
    btnTimerControl = document.getElementById('btnTimerControl');
    btnLaunchPrompter = document.getElementById('btnLaunchPrompter');
    broadcastAlert = document.getElementById('broadcastAlert');

    let initialSlide = 0;
    const hash = window.location.hash;
    if (hash) {
      const match = hash.match(/#slide-(\d+)/) || hash.match(/#(\d+)/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (parsed >= 0 && parsed < totalSlides) {
          initialSlide = parsed;
        }
      }
    }

    showSlide(initialSlide, false);
    updateTimerDisplay();
    triggerMathRender();

    channel.postMessage({ type: 'REQUEST_SYNC' });

    btnPrevSlide.addEventListener('click', () => changeSlide(currentSlide - 1));
    btnNextSlide.addEventListener('click', () => changeSlide(currentSlide + 1));
    btnTimerControl.addEventListener('click', toggleTimer);
    btnLaunchPrompter.addEventListener('click', openPrompterWindow);

    window.changeSlide = changeSlide;
    window.showSlide = showSlide;

    window.addEventListener('keydown', handleKeydown);
    channel.onmessage = handleBroadcastMessage;
  }

  function triggerMathRender() {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        throwOnError: false
      });
    } else {
      setTimeout(triggerMathRender, 150);
    }
  }

  function handleBroadcastMessage(event) {
    const data = event.data;
    if (!data) return;

    if (data.type === 'SLIDE_CHANGE') {
      if (data.index !== currentSlide) {
        showSlide(data.index, false);
        showAlert(`Diapositiva ${data.index + 1} desde prompter`);
      }
    } else if (data.type === 'TIMER_UPDATE') {
      timerSeconds = data.seconds;
      isTimerRunning = data.isRunning;
      updateTimerDisplay();
      updateTimerButton();
      if (isTimerRunning && !timerInterval) {
        startTimerLoop();
      } else if (!isTimerRunning && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    } else if (data.type === 'SYNC_RESPONSE' || data.type === 'SYNC_STATE') {
      if (typeof data.slideIndex === 'number') {
        showSlide(data.slideIndex, false);
      }
      if (typeof data.seconds === 'number') {
        timerSeconds = data.seconds;
        isTimerRunning = !!data.isRunning;
        updateTimerDisplay();
        updateTimerButton();
        if (isTimerRunning && !timerInterval) {
          startTimerLoop();
        } else if (!isTimerRunning && timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }
      showAlert('Teleprompter Conectado');
    } else if (data.type === 'REQUEST_SYNC') {
      channel.postMessage({
        type: 'SYNC_RESPONSE',
        slideIndex: currentSlide,
        seconds: timerSeconds,
        isRunning: isTimerRunning
      });
    }
  }

  function changeSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    showSlide(index, true);
  }

  function showSlide(index, broadcast = true) {
    currentSlide = index;
    slides.forEach((s, idx) => {
      if (idx === index) {
        s.classList.add('active');
        // Reiniciar animaciones SVG nativas de la diapositiva activa
        const animElements = s.querySelectorAll('animate, animateMotion');
        animElements.forEach(anim => {
          try {
            anim.beginElement();
          } catch (e) {}
        });
      } else {
        s.classList.remove('active');
      }
    });

    if (slideBadge) {
      slideBadge.textContent = `${String(index + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    }

    try {
      if (window.location.protocol !== 'file:') {
        history.replaceState(null, '', '#slide-' + index);
      } else {
        window.location.hash = 'slide-' + index;
      }
    } catch (e) {}

    if (broadcast) {
      channel.postMessage({ type: 'SLIDE_CHANGE', index: currentSlide });
    }
  }

  function toggleTimer() {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    updateTimerButton();
    startTimerLoop();
    channel.postMessage({ type: 'TIMER_UPDATE', isRunning: true, seconds: timerSeconds });
  }

  function pauseTimer() {
    if (!isTimerRunning) return;
    isTimerRunning = false;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    updateTimerButton();
    channel.postMessage({ type: 'TIMER_UPDATE', isRunning: false, seconds: timerSeconds });
  }

  function startTimerLoop() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
        if (timerSeconds % 5 === 0) {
          channel.postMessage({ type: 'TIMER_UPDATE', isRunning: true, seconds: timerSeconds });
        }
      } else {
        timerSeconds--;
        updateTimerDisplay();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    if (!timerClock) return;
    let absSeconds = Math.abs(timerSeconds);
    let mins = Math.floor(absSeconds / 60);
    let secs = absSeconds % 60;
    timerClock.textContent = `${timerSeconds < 0 ? '-' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    timerClock.classList.remove('warning', 'danger');
    if (timerSeconds < 60) {
      timerClock.classList.add('danger');
    } else if (timerSeconds < 300) {
      timerClock.classList.add('warning');
    }
  }

  function updateTimerButton() {
    if (btnTimerControl) {
      btnTimerControl.textContent = isTimerRunning ? '⏸' : '▶';
    }
  }

  function openPrompterWindow() {
    const width = 1000;
    const height = 800;
    const left = window.screen.width ? (window.screen.width - width) / 2 : 100;
    const top = window.screen.height ? (window.screen.height - height) / 2 : 100;

    window.open(
      'prompter.html',
      'HoneypotPrompterWindow',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no,toolbar=no`
    );
    showAlert('Teleprompter abierto');
  }

  function showAlert(msg) {
    if (!broadcastAlert) return;
    broadcastAlert.textContent = msg;
    broadcastAlert.classList.add('show');
    setTimeout(() => broadcastAlert.classList.remove('show'), 2000);
  }

  function handleKeydown(e) {
    if (e.code === 'ArrowRight' || e.code === 'KeyN') {
      e.preventDefault();
      changeSlide(currentSlide + 1);
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyB') {
      e.preventDefault();
      changeSlide(currentSlide - 1);
    } else if (e.code === 'Space') {
      e.preventDefault();
      toggleTimer();
    } else if (e.code === 'KeyP' || e.code === 'KeyO') {
      e.preventDefault();
      openPrompterWindow();
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      toggleFullscreen();
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
