document.addEventListener('DOMContentLoaded', () => {
  const initScrollReveal = () => {
    const revealSections = document.querySelectorAll(
      '.hero, .intro-text-block, .section--calendar, .section--location, .section--celebration, .section--countdown, .section--timing-custom, .section--guest-form, .section--hotels, .section--wishes'
    );

    if (!revealSections.length) return;

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          threshold: 0.25,
        }
      );

      revealSections.forEach((sec) => revealObserver.observe(sec));
    } else {
      revealSections.forEach((sec) => sec.classList.add('is-visible'));
    }
  };

  const startPageAnimations = () => {
    initScrollReveal();
  };

  const intro = document.querySelector('.intro-screen');
  const introHint = document.querySelector('.intro-tap-hint');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');

  if (intro) {
    const startExperience = async () => {
      if (startExperience.started) return;
      startExperience.started = true;

      intro.classList.add('card-out');
      intro.classList.add('hide-hint');

      const finishIntro = () => {
        intro.classList.add('is-hidden');
        setTimeout(() => {
          intro.style.display = 'none';
          startPageAnimations();
        }, 600);
      };

      const card = intro.querySelector('.intro-card');
      if (card) {
        card.addEventListener('transitionend', finishIntro, { once: true });
      } else {
        setTimeout(finishIntro, 900);
      }
    };

    const trigger = () => startExperience();

    intro.addEventListener('touchend', trigger, { once: true });
    intro.addEventListener('pointerdown', trigger, { once: true });
    intro.addEventListener('click', trigger, { once: true });

    if (introHint) {
      introHint.addEventListener('touchend', trigger, { once: true });
      introHint.addEventListener('pointerdown', trigger, { once: true });
      introHint.addEventListener('click', trigger, { once: true });
    }
  } else {
    startPageAnimations();
  }

  // ---------- RILASCIO AUDIO AL PRIMO GESTO ----------

  const unlockAudio = () => {
    if (!bgMusic) return;

    bgMusic.muted = true;
    const p = bgMusic.play();

    if (p && typeof p.then === 'function') {
      p.then(() => {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        bgMusic.muted = false;
      }).catch(() => {
        // Se anche il play silenzioso fallisce, non facciamo nulla
      });
    }

    document.removeEventListener('touchend', unlockAudio);
    document.removeEventListener('click', unlockAudio);
    if (intro) {
      intro.removeEventListener('touchend', unlockAudio);
      intro.removeEventListener('click', unlockAudio);
    }
  };

  // Primo gesto sul documento
  document.addEventListener('touchend', unlockAudio, { once: true });
  document.addEventListener('click', unlockAudio, { once: true });

  // E anche sull'intro, che copre tutto lo schermo
  if (intro) {
    intro.addEventListener('touchend', unlockAudio, { once: true });
    intro.addEventListener('click', unlockAudio, { once: true });
  }

  // ---------- CONTROLLO MUSICA TRAMITE BOTTONE ----------

  const setMusicUi = (isPlaying) => {
    if (!musicToggle) return;
    const textEl = musicToggle.querySelector('.music-text');
    if (isPlaying) {
      musicToggle.classList.add('is-playing');
      if (textEl) textEl.textContent = 'Disattiva la musica';
    } else {
      musicToggle.classList.remove('is-playing');
      if (textEl) textEl.textContent = 'Attiva la musica';
    }
  };

  const tryPlayMusic = async () => {
    if (!bgMusic) return;

    bgMusic.volume = 1;

    try {
      await bgMusic.play();
      setMusicUi(true);
    } catch (err) {
      console.warn('Music play blocked or failed:', err);
      setMusicUi(false);
    }
  };

  const pauseMusic = () => {
    if (!bgMusic) return;
    bgMusic.pause();
    setMusicUi(false);
  };

  if (musicToggle && bgMusic) {
    const handleToggle = () => {
      if (bgMusic.paused) {
        tryPlayMusic();
      } else {
        pauseMusic();
      }
    };

    musicToggle.addEventListener('click', handleToggle);
    musicToggle.addEventListener('touchend', handleToggle, { passive: true });
    musicToggle.addEventListener('pointerdown', handleToggle);
  }

  // ---------- COUNTDOWN ----------

  const targetDate = new Date('2026-09-19T12:00:00+03:00').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (daysEl && hoursEl && minutesEl && secondsEl) {
    const pad = (n) => String(n).padStart(2, '0');

    const updateCountdown = () => {
      const now = Date.now();
      let diff = targetDate - now;

      if (diff <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
      const minutes = Math.floor((totalSeconds / 60) % 60);
      const seconds = totalSeconds % 60;

      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ---------- COPIARE I DATI DI PAGAMENTO ----------

  const paymentBlocks = document.querySelectorAll('.payment-block');

  paymentBlocks.forEach((block) => {
    const btn = block.querySelector('.payment-copy');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const text = block.dataset.payment || block.textContent.trim();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          const prev = btn.textContent;
          btn.textContent = 'copiato';
          setTimeout(() => {
            btn.textContent = prev;
          }, 2000);
        });
      }
    });
  });

  // ---------- MOSTRARE LA SEZIONE CALENDARIO ----------

  const calendarSection = document.querySelector('.section--calendar');

  if (calendarSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            calendarSection.classList.add('is-visible');
            obs.unobserve(calendarSection);
          }
        });
      },
      {
        root: null,
        threshold: 0.3,
      }
    );

    observer.observe(calendarSection);
  } else if (calendarSection) {
    calendarSection.classList.add('is-visible');
  }

  // ---------- FORM OSPITI ----------

  const guestForm = document.querySelector('.guest-form');
  if (guestForm) {
    let statusEl = document.querySelector('.guest-form-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.className = 'guest-form-status';
      statusEl.style.marginTop = '1rem';
      statusEl.style.fontFamily = '"Bebas Neue", system-ui, sans-serif';
      statusEl.style.fontSize = '0.95rem';
      statusEl.style.letterSpacing = '0.14em';
      statusEl.style.textTransform = 'uppercase';
      guestForm.appendChild(statusEl);
    }

    guestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      statusEl.textContent = 'Invio in corso...';

      const formData = new FormData(guestForm);
      const payload = {
        form_type: 'rsvp-form',
        first_name: formData.get('first_name') || '',
        last_name: formData.get('last_name') || '',
        attendance: formData.get('attendance') || '',
        food_preference: formData.get('food_preference') || '',
        child: formData.get('child') || '',
        message: formData.get('message') || '',
        event: 'Wedding 19.09.2026',
        language: 'it',
      };

      const BACKEND_URL = 'https://wedding-yulia-francesco-backend.vercel.app/api/send';

      fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success) {
            statusEl.textContent = data.message || 'Grazie! Il modulo è stato inviato.';
            guestForm.reset();
          } else {
            statusEl.textContent =
              (data && data.message) || "Si è verificato un errore durante l'invio. Riprova più tardi.";
          }
        })
        .catch((err) => {
          console.error(err);
          statusEl.textContent = "Si è verificato un errore durante l'invio. Riprova più tardi.";
        });
    });
  }
});