import './style.css';

// Hero media removed (image only)

// Navigation transparency on scroll
const mainNav = document.querySelector('[data-purpose="main-navigation"]');
if (mainNav) {
  const updateNav = () => {
    if (window.scrollY > 20) {
      mainNav.classList.add('nav-scrolled');
    } else {
      mainNav.classList.remove('nav-scrolled');
    }
  };
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });
}

// Scroll reveal for section 2 (services)
const revealItems = document.querySelectorAll('.reveal-on-scroll');
if (revealItems.length) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }
}

// Mobile Menu
const menuToggle = document.querySelector('[data-purpose="mobile-menu-toggle"]');
const closeMenu = document.getElementById('close-menu');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && closeMenu && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });

  closeMenu.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    document.body.style.overflow = '';
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      document.body.style.overflow = '';
    });
  });
}

// Desktop Sidebar
const sidebarToggle = document.getElementById('desktop-sidebar-toggle');
const closeSidebar = document.getElementById('close-sidebar');
const sidebarWrapper = document.getElementById('desktop-sidebar-wrapper');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarPanel = document.getElementById('sidebar-panel');
const sidebarLinks = sidebarPanel?.querySelectorAll('.sidebar-link') ?? [];

let sidebarOpen = false;

function openSidebar() {
  if (!sidebarWrapper || !sidebarOverlay || !sidebarPanel) return;
  sidebarOpen = true;
  sidebarWrapper.classList.remove('pointer-events-none');
  sidebarOverlay.classList.remove('bg-black/0', 'pointer-events-none');
  sidebarOverlay.classList.add('bg-black/60', 'pointer-events-auto');
  sidebarPanel.classList.remove('translate-x-full');
  sidebarPanel.classList.add('translate-x-0');
  document.body.style.overflow = 'hidden';

  // Stagger-animate the sidebar links
  sidebarLinks.forEach((link, i) => {
    link.style.opacity = '0';
    link.style.transform = 'translateX(20px)';
    setTimeout(() => {
      link.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      link.style.opacity = '1';
      link.style.transform = 'translateX(0)';
    }, 100 + i * 80);
  });
}

function closeSidebarFn() {
  if (!sidebarWrapper || !sidebarOverlay || !sidebarPanel) return;
  sidebarOpen = false;
  sidebarOverlay.classList.remove('bg-black/60', 'pointer-events-auto');
  sidebarOverlay.classList.add('bg-black/0', 'pointer-events-none');
  sidebarPanel.classList.remove('translate-x-0');
  sidebarPanel.classList.add('translate-x-full');
  document.body.style.overflow = '';

  // After transition, re-add pointer-events-none to wrapper
  setTimeout(() => {
    if (!sidebarOpen) {
      sidebarWrapper.classList.add('pointer-events-none');
    }
  }, 500);
}

if (sidebarToggle && closeSidebar && sidebarOverlay) {
  sidebarToggle.addEventListener('click', () => {
    if (sidebarOpen) {
      closeSidebarFn();
    } else {
      openSidebar();
    }
  });

  closeSidebar.addEventListener('click', closeSidebarFn);
  sidebarOverlay.addEventListener('click', closeSidebarFn);

  // Close sidebar on link click
  sidebarLinks.forEach(link => {
    link.addEventListener('click', closeSidebarFn);
  });
}

// Close sidebar on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebarOpen) {
    closeSidebarFn();
  }
});

// Smooth scroll for in-page anchors
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href === '#') return;
  const target = document.querySelector(href);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const serviceValue = link.getAttribute('data-service');
  if (serviceValue) {
    const select = document.querySelector('#inquiry select[name="service"]');
    if (select) {
      setTimeout(() => {
        select.value = serviceValue;
      }, 300);
    }
  }
});

// Count-up animation in About section
const countItems = document.querySelectorAll('[data-countup]');
if (countItems.length) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const runCount = (el) => {
    const target = Number(el.getAttribute('data-count')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = `${value}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${target}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    countItems.forEach((el) => {
      const target = el.getAttribute('data-count') || '0';
      const suffix = el.getAttribute('data-suffix') || '';
      el.textContent = `${target}${suffix}`;
    });
  } else {
    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    countItems.forEach((el) => countObserver.observe(el));
  }
}

// Legal modals (Privacy / Terms)
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-legal-trigger]');
  if (!trigger) return;
  const targetSelector = trigger.getAttribute('data-legal-target');
  if (!targetSelector) return;
  const modal = document.querySelector(targetSelector);
  if (!modal) return;
  openModal(modal);
});

document.querySelectorAll('#privacy-modal, #terms-modal').forEach((modal) => {
  const closeBtn = modal.querySelector('[data-modal-close]');
  closeBtn?.addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

// 3D tilt on About image
const tiltCards = document.querySelectorAll('[data-tilt]');
tiltCards.forEach((card) => {
  const inner = card.querySelector('.tilt-inner');
  if (!inner) return;
  const maxTilt = 10;
  let rafId = null;

  const handleMove = (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateY = x * maxTilt * 2;
    const rotateX = -y * maxTilt * 2;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.classList.add('is-tilting');
    });
  };

  const resetTilt = () => {
    if (rafId) cancelAnimationFrame(rafId);
    inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
    card.classList.remove('is-tilting');
  };

  card.addEventListener('mousemove', handleMove);
  card.addEventListener('mouseleave', resetTilt);
  card.addEventListener('blur', resetTilt);
});

// UI/UX work modal
const uiuxModal = document.getElementById('uiux-modal');
const webModal = document.getElementById('web-modal');
const logoModal = document.getElementById('logo-modal');
const flyersModal = document.getElementById('flyers-modal');
const socialModal = document.getElementById('social-modal');
const tshirtModal = document.getElementById('tshirt-modal');

const openModal = (modal) => {
  if (!modal) return;
  modal.removeAttribute('hidden');
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => {
    if (!modal.classList.contains('is-open')) {
      modal.setAttribute('hidden', '');
    }
  }, 300);
};

// Close any open modal when clicking inquiry link
document.addEventListener('click', (event) => {
  const inquiryLink = event.target.closest('[data-inquiry-link]');
  if (!inquiryLink) return;
  [uiuxModal, webModal, logoModal, flyersModal, socialModal, tshirtModal].forEach((modal) => {
    if (modal?.classList.contains('is-open')) {
      closeModal(modal);
    }
  });
});

if (uiuxModal) {
  const uiuxImage = uiuxModal.querySelector('[data-uiux-image]');
  const uiuxNext = uiuxModal.querySelector('[data-uiux-next]');
  const uiuxPrev = uiuxModal.querySelector('[data-uiux-prev]');
  const uiuxClose = uiuxModal.querySelector('[data-modal-close]');
  const uiuxImages = ['/u1.png', '/u2.png', '/u3.jpg', '/u4.png', '/u5.png'];
  let uiuxIndex = 0;

  const setUiuxImage = (index) => {
    if (!uiuxImage) return;
    uiuxImage.classList.add('is-fading');
    setTimeout(() => {
      uiuxImage.src = uiuxImages[index];
      uiuxImage.alt = `UI/UX showcase ${index + 1}`;
      uiuxImage.classList.remove('is-fading');
    }, 150);
  };

  const openUiuxModal = () => {
    uiuxIndex = 0;
    setUiuxImage(uiuxIndex);
    openModal(uiuxModal);
  };

  const nextUiuxImage = () => {
    uiuxIndex = (uiuxIndex + 1) % uiuxImages.length;
    setUiuxImage(uiuxIndex);
  };

  const prevUiuxImage = () => {
    uiuxIndex = (uiuxIndex - 1 + uiuxImages.length) % uiuxImages.length;
    setUiuxImage(uiuxIndex);
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-work-trigger="uiux"]');
    if (trigger) {
      openUiuxModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const trigger = event.target.closest('[data-work-trigger="uiux"]');
      if (trigger) {
        event.preventDefault();
        openUiuxModal();
      }
    }
  });

  uiuxNext?.addEventListener('click', nextUiuxImage);
  uiuxPrev?.addEventListener('click', prevUiuxImage);
  uiuxClose?.addEventListener('click', () => closeModal(uiuxModal));

  uiuxModal.addEventListener('click', (event) => {
    if (event.target === uiuxModal) {
      closeModal(uiuxModal);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!uiuxModal.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      closeModal(uiuxModal);
    }
    if (event.key === 'ArrowRight') {
      nextUiuxImage();
    }
    if (event.key === 'ArrowLeft') {
      prevUiuxImage();
    }
  });
}

if (webModal) {
  const webImage = webModal.querySelector('[data-web-image]');
  const webNext = webModal.querySelector('[data-web-next]');
  const webPrev = webModal.querySelector('[data-web-prev]');
  const webClose = webModal.querySelector('[data-modal-close]');
  const webImages = ['/web1.png', '/web2.png', '/web3.png', '/web4.png'];
  let webIndex = 0;

  const setWebImage = (index) => {
    if (!webImage) return;
    webImage.classList.add('is-fading');
    setTimeout(() => {
      webImage.src = webImages[index];
      webImage.alt = `Web development showcase ${index + 1}`;
      webImage.classList.remove('is-fading');
    }, 150);
  };

  const openWebModal = () => {
    webIndex = 0;
    setWebImage(webIndex);
    openModal(webModal);
  };

  const nextWebImage = () => {
    webIndex = (webIndex + 1) % webImages.length;
    setWebImage(webIndex);
  };

  const prevWebImage = () => {
    webIndex = (webIndex - 1 + webImages.length) % webImages.length;
    setWebImage(webIndex);
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-work-trigger=\"web\"]');
    if (trigger) {
      openWebModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const trigger = event.target.closest('[data-work-trigger=\"web\"]');
      if (trigger) {
        event.preventDefault();
        openWebModal();
      }
    }
  });

  webNext?.addEventListener('click', nextWebImage);
  webPrev?.addEventListener('click', prevWebImage);
  webClose?.addEventListener('click', () => closeModal(webModal));

  webModal.addEventListener('click', (event) => {
    if (event.target === webModal) {
      closeModal(webModal);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!webModal.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      closeModal(webModal);
    }
    if (event.key === 'ArrowRight') {
      nextWebImage();
    }
    if (event.key === 'ArrowLeft') {
      prevWebImage();
    }
  });
}

if (logoModal) {
  const logoClose = logoModal.querySelector('[data-modal-close]');

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-work-trigger="logo"]');
    if (trigger) {
      openModal(logoModal);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const trigger = event.target.closest('[data-work-trigger="logo"]');
      if (trigger) {
        event.preventDefault();
        openModal(logoModal);
      }
    }
  });

  logoClose?.addEventListener('click', () => closeModal(logoModal));

  logoModal.addEventListener('click', (event) => {
    if (event.target === logoModal) {
      closeModal(logoModal);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && logoModal.classList.contains('is-open')) {
      closeModal(logoModal);
    }
  });
}

if (flyersModal) {
  const flyersClose = flyersModal.querySelector('[data-modal-close]');

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-work-trigger="flyers"]');
    if (trigger) {
      openModal(flyersModal);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const trigger = event.target.closest('[data-work-trigger="flyers"]');
      if (trigger) {
        event.preventDefault();
        openModal(flyersModal);
      }
    }
  });

  flyersClose?.addEventListener('click', () => closeModal(flyersModal));

  flyersModal.addEventListener('click', (event) => {
    if (event.target === flyersModal) {
      closeModal(flyersModal);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && flyersModal.classList.contains('is-open')) {
      closeModal(flyersModal);
    }
  });
}

if (socialModal) {
  const socialClose = socialModal.querySelector('[data-modal-close]');

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-work-trigger="social"]');
    if (trigger) {
      openModal(socialModal);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const trigger = event.target.closest('[data-work-trigger="social"]');
      if (trigger) {
        event.preventDefault();
        openModal(socialModal);
      }
    }
  });

  socialClose?.addEventListener('click', () => closeModal(socialModal));

  socialModal.addEventListener('click', (event) => {
    if (event.target === socialModal) {
      closeModal(socialModal);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && socialModal.classList.contains('is-open')) {
      closeModal(socialModal);
    }
  });
}

if (tshirtModal) {
  const tshirtClose = tshirtModal.querySelector('[data-modal-close]');

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-work-trigger="tshirt"]');
    if (trigger) {
      openModal(tshirtModal);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const trigger = event.target.closest('[data-work-trigger="tshirt"]');
      if (trigger) {
        event.preventDefault();
        openModal(tshirtModal);
      }
    }
  });

  tshirtClose?.addEventListener('click', () => closeModal(tshirtModal));

  tshirtModal.addEventListener('click', (event) => {
    if (event.target === tshirtModal) {
      closeModal(tshirtModal);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && tshirtModal.classList.contains('is-open')) {
      closeModal(tshirtModal);
    }
  });
}
