/* ════════════════════════════════════════════════════════
   CAROUSEL
════════════════════════════════════════════════════════ */
class Carousel {
  constructor(el) {
    this.el       = el;
    this.vp       = el.querySelector('.carousel-vp');
    this.track    = el.querySelector('.carousel-track');
    this.items    = Array.from(el.querySelectorAll('.carousel-item'));
    this.prevBtn  = el.querySelector('.cr-btn--prev');
    this.nextBtn  = el.querySelector('.cr-btn--next');
    this.dotsEl   = el.querySelector('.cr-dots');

    this.count    = this.items.length;
    this.index    = 0;
    this.timer    = null;

    this._drag    = { active: false, startX: 0, startOffset: 0 };

    this._setWidths();
    this._buildDots();
    this._bindEvents();
    this._render(false);
    this._startAuto();

    window.addEventListener('resize', () => {
      this._setWidths();
      this._render(false);
    });
  }

  /* — Setup ————————————————————————————————— */
  _setWidths() {
    const w = this.vp.offsetWidth;
    this.itemW = w;
    this.items.forEach(item => {
      item.style.width    = w + 'px';
      item.style.minWidth = w + 'px';
    });
  }

  _buildDots() {
    this.dots = this.items.map((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'cr-dot';
      btn.setAttribute('aria-label', `Imagen ${i + 1}`);
      btn.addEventListener('click', () => this.goTo(i));
      this.dotsEl.appendChild(btn);
      return btn;
    });
  }

  _bindEvents() {
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());

    /* mouse drag */
    this.vp.addEventListener('mousedown', e => this._onDragStart(e.clientX));
    window.addEventListener('mousemove', e => { if (this._drag.active) this._onDragMove(e.clientX); });
    window.addEventListener('mouseup',   ()  => { if (this._drag.active) this._onDragEnd(); });

    /* touch drag */
    this.vp.addEventListener('touchstart', e => this._onDragStart(e.touches[0].clientX), { passive: true });
    this.vp.addEventListener('touchmove',  e => { if (this._drag.active) this._onDragMove(e.touches[0].clientX); }, { passive: true });
    this.vp.addEventListener('touchend',   ()  => { if (this._drag.active) this._onDragEnd(); });

    /* pause auto-play on hover */
    this.el.addEventListener('mouseenter', () => this._stopAuto());
    this.el.addEventListener('mouseleave', () => this._startAuto());
  }

  /* — Drag ————————————————————————————————— */
  _onDragStart(x) {
    this._drag.active     = true;
    this._drag.startX     = x;
    this._drag.startOffset = -(this.index * this.itemW);
    this.track.style.transition = 'none';
    this.vp.classList.add('is-dragging');
  }

  _onDragMove(x) {
    const delta = x - this._drag.startX;
    this.track.style.transform = `translateX(${this._drag.startOffset + delta}px)`;
  }

  _onDragEnd() {
    this._drag.active = false;
    this.vp.classList.remove('is-dragging');

    const raw   = this.track.style.transform;
    const match = raw.match(/translateX\(([\-\d.]+)px\)/);
    if (!match) { this._render(); return; }

    const currentOffset = parseFloat(match[1]);
    const threshold     = this.itemW * 0.18;
    const delta         = currentOffset - this._drag.startOffset;

    if (delta < -threshold && this.index < this.count - 1) {
      this.index++;
    } else if (delta > threshold && this.index > 0) {
      this.index--;
    }

    this._render();
  }

  /* — Render ————————————————————————————————— */
  _render(animate = true) {
    this.track.style.transition = animate
      ? 'transform 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none';
    this.track.style.transform = `translateX(${-(this.index * this.itemW)}px)`;

    this.dots.forEach((d, i) => d.classList.toggle('active', i === this.index));
    this.prevBtn.setAttribute('data-disabled', this.index === 0);
    this.nextBtn.setAttribute('data-disabled', this.index === this.count - 1);
  }

  /* — Public API —————————————————————————————— */
  goTo(i) {
    this.index = Math.max(0, Math.min(i, this.count - 1));
    this._render();
  }

  prev() { this.goTo(this.index - 1); }
  next() { this.goTo(this.index + 1); }

  /* — Auto-play —————————————————————————————— */
  _startAuto() {
    this._stopAuto();
    this.timer = setInterval(() => {
      this.index = (this.index + 1) % this.count;
      this._render();
    }, 4200);
  }

  _stopAuto() {
    clearInterval(this.timer);
    this.timer = null;
  }
}

/* Initialise all carousels */
document.querySelectorAll('.js-carousel').forEach(el => new Carousel(el));

/* ════════════════════════════════════════════════════════
   NAVBAR
════════════════════════════════════════════════════════ */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

/* hamburger toggle */
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

/* close on link click (mobile) */
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  })
);

/* scrolled state */
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* active link on scroll */
const sections = Array.from(document.querySelectorAll('section[id]'));
const navAs    = Array.from(navLinks.querySelectorAll('a'));

function updateActiveLink() {
  const y = window.scrollY + 120;
  let active = null;
  for (const sec of sections) {
    if (y >= sec.offsetTop) active = sec.id;
  }
  navAs.forEach(a => {
    const href = a.getAttribute('href').slice(1); // strip '#'
    a.classList.toggle('active', href === active);
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

/* ════════════════════════════════════════════════════════
   CONTACT MODAL
════════════════════════════════════════════════════════ */
const contactModal = document.getElementById('contactModal');
const openContact  = document.getElementById('openContact');
const closeContact = document.getElementById('closeContact');

openContact.addEventListener('click', () => {
  contactModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  /* close mobile nav if open */
  navLinks.classList.remove('open');
  navToggle.classList.remove('open');
});

function closeModal() {
  contactModal.classList.remove('open');
  document.body.style.overflow = '';
}

closeContact.addEventListener('click', closeModal);

contactModal.addEventListener('click', e => {
  if (e.target === contactModal) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
