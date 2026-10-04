const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const enterItems = document.querySelectorAll('[data-enter]');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries, currentObserver) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  enterItems.forEach((item) => observer.observe(item));
} else {
  enterItems.forEach((item) => item.classList.add('is-visible'));
}
