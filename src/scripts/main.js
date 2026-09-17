const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileNav = document.querySelector('[data-mobile-nav]');
const copyButtons = document.querySelectorAll('[data-copy-text]');
const toast = document.querySelector('[data-toast]');
const experienceModal = document.querySelector('[data-experience-modal]');
const modalTitle = document.querySelector('[data-modal-title]');
const modalContent = document.querySelector('[data-modal-content]');
const jobDetailButtons = document.querySelectorAll('[data-job-detail]');
const modalBackground = document.querySelectorAll('.site-header, .mobile-nav, main, .site-footer');
let lastFocusedElement = null;
let toastTimeout;

document.documentElement.classList.add('motion-ready');
document.querySelector('[data-year]').textContent = new Date().getFullYear();

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const setMenuOpen = (isOpen) => {
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? '关闭导航' : '打开导航');
  mobileNav.classList.toggle('open', isOpen);
  mobileNav.inert = !isOpen;
  document.body.classList.toggle('menu-open', isOpen);
};

menuButton.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});

window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
  if (event.matches) setMenuOpen(false);
});

mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setMenuOpen(false);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && experienceModal.classList.contains('open')) {
    closeExperienceModal();
  } else if (event.key === 'Escape' && mobileNav.classList.contains('open')) {
    setMenuOpen(false);
    menuButton.focus();
  }

  if (event.key === 'Tab') {
    const focusable = experienceModal.classList.contains('open')
      ? [...experienceModal.querySelectorAll('button, a[href], [tabindex="0"]')]
      : mobileNav.classList.contains('open')
        ? [menuButton, ...mobileNav.querySelectorAll('a')]
        : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (first && event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (last && !event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

const openExperienceModal = (company, key, trigger) => {
  const template = document.querySelector(`[data-job-template="${key}"]`);
  lastFocusedElement = trigger;
  modalTitle.textContent = company;
  modalContent.replaceChildren(template.content.cloneNode(true));
  modalContent.scrollTop = 0;
  experienceModal.classList.add('open');
  experienceModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modalBackground.forEach((element) => { element.inert = true; });
  experienceModal.querySelector('.experience-modal-close').focus({ preventScroll: true });
};

function closeExperienceModal() {
  experienceModal.classList.remove('open');
  experienceModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  modalBackground.forEach((element) => { element.inert = element === mobileNav; });
  modalContent.replaceChildren();
  lastFocusedElement?.focus();
}

jobDetailButtons.forEach((button) => {
  button.addEventListener('click', () => openExperienceModal(button.dataset.jobDetail, button.dataset.jobKey, button));
});

experienceModal.querySelectorAll('[data-modal-close]').forEach((element) => {
  element.addEventListener('click', closeExperienceModal);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -30px' },
);

document.querySelectorAll('[data-reveal]').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 5, 3) * 70}ms`;
  revealObserver.observe(element);
});

window.setTimeout(() => {
  document.querySelectorAll('[data-reveal]:not(.revealed)').forEach((element) => {
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 1.15) element.classList.add('revealed');
  });
}, 900);

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Support local files and browsers where the Clipboard API is unavailable.
    const input = document.createElement('textarea');
    const focusedElement = document.activeElement;
    input.value = text;
    input.readOnly = true;
    input.style.cssText = 'position: fixed; top: 0; left: 0; opacity: 0; font-size: 16px;';
    document.body.append(input);

    try {
      input.select();
      if (!document.execCommand('copy')) throw new Error('Copy failed');
    } finally {
      input.remove();
      focusedElement?.focus({ preventScroll: true });
    }
  }
};

copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await copyText(button.dataset.copyText);
      toast.textContent = `${button.dataset.copyLabel}已复制`;
    } catch {
      toast.textContent = '复制失败，请手动复制';
    }

    window.clearTimeout(toastTimeout);
    toast.classList.add('show');
    toastTimeout = window.setTimeout(() => toast.classList.remove('show'), 1800);
  });
});
