/* ═══════════════════════════════════════════════
   MED LAB – LANDING PAGE INTERACTIONS
   ═══════════════════════════════════════════════ */

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#' || href.length <= 1) return;
    try {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      // Ignore invalid selectors like "#"
    }
  });
});

// ── Navbar scroll shadow ──
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (nav) nav.style.boxShadow = window.scrollY > 10 ? '0 4px 12px rgba(0,0,0,0.08)' : '';
});

// ── Animate elements on scroll (Intersection Observer) ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.pain-card, .feature-card, .matrix-card, .step').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ── Mockup timeline animation ──
(function animateTimeline() {
  const slots = document.querySelectorAll('.t-slot');
  let i = 0;
  setInterval(() => {
    slots.forEach(s => s.style.boxShadow = '');
    if (slots[i]) slots[i].style.boxShadow = '0 0 0 2px rgba(37,99,235,0.5)';
    i = (i + 1) % slots.length;
  }, 1800);
})();
