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

  // Управление музыкой через кнопку
  if (musicToggle && bgMusic) {
    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.volume = 1;
        const promise = bgMusic.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch((err) => {
            console.warn('Музыка заблокирована:', err);
          });
        }
        musicToggle.classList.add('is-playing');
        musicToggle.querySelector('.music-text').textContent = 'Disattiva la musica';
      } else {
        bgMusic.pause();
        musicToggle.classList.remove('is-playing');
        musicToggle.querySelector('.music-text').textContent = 'Attiva la musica';
      }
    });
  }

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