'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = '+';
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
  menuButton.querySelector('span').textContent = open ? '−' : '+';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});

const resetVideoPlayers = new Map();
function wirePosterFallback(shell) {
  const poster = shell.querySelector('.video-poster');
  if (!poster) return;
  poster.addEventListener('error', () => { poster.hidden = true; }, { once: true });
  if (poster.complete && poster.naturalWidth === 0) poster.hidden = true;
}
document.querySelectorAll('.video-shell').forEach(shell => {
  const originalNodes = [...shell.childNodes].map(node => node.cloneNode(true));
  function bindPlay() {
    wirePosterFallback(shell);
    shell.querySelector('.video-play').addEventListener('click', () => {
      const frame = document.createElement('iframe');
      const id = encodeURIComponent(shell.dataset.videoId);
      frame.src = shell.dataset.player === 'youtube'
        ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
        : `https://drive.google.com/file/d/${id}/preview`;
      frame.title = shell.dataset.title;
      frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allowFullscreen = true;
      shell.replaceChildren(frame);
      frame.focus();
    }, { once: true });
  }
  resetVideoPlayers.set(shell, () => {
    if (!shell.querySelector('iframe')) return;
    shell.replaceChildren(...originalNodes.map(node => node.cloneNode(true)));
    bindPlay();
  });
  bindPlay();
});
document.querySelectorAll('.media-details').forEach(details => {
  details.addEventListener('toggle', () => {
    if (!details.open) details.querySelectorAll('.video-shell').forEach(shell => resetVideoPlayers.get(shell)?.());
  });
});

if ('IntersectionObserver' in window) {
  const links = [...navigation.querySelectorAll('a')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-15% 0px -65% 0px' });
  document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
}

