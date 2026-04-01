import './style.css';

// Hero media removed (image only)

// Hero net background + cursor glow
const heroSection = document.querySelector('[data-purpose="hero-section"]');
const heroNet = document.getElementById('hero-net');
if (heroSection && heroNet) {
  const ctx = heroNet.getContext('2d');
  if (ctx) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gridSize = 40;
    const accentRgb = '255, 77, 0';
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const heroImage = heroSection.querySelector('img.hero-media-fade');
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetIntensity = 0;
    let intensity = 0;
    let cursorActive = false;
    let imageRect = null;
    const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;
    const mobileAnchor = { x: 0.5, y: 0.55 };

    const updateImageRect = () => {
      if (!heroImage) {
        imageRect = null;
        return;
      }
      const sectionRect = heroSection.getBoundingClientRect();
      const imgRect = heroImage.getBoundingClientRect();
      const x = imgRect.left - sectionRect.left;
      const y = imgRect.top - sectionRect.top;
      imageRect = {
        x,
        y,
        w: imgRect.width,
        h: imgRect.height,
        right: x + imgRect.width,
        bottom: y + imgRect.height,
      };
    };

    const resize = () => {
      width = heroSection.clientWidth;
      height = heroSection.clientHeight;
      dpr = window.devicePixelRatio || 1;
      heroNet.width = Math.max(1, Math.floor(width * dpr));
      heroNet.height = Math.max(1, Math.floor(height * dpr));
      heroNet.style.width = `${width}px`;
      heroNet.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateImageRect();
      if (!isDesktop() && imageRect) {
        targetX = imageRect.x + imageRect.w * mobileAnchor.x;
        targetY = imageRect.y + imageRect.h * mobileAnchor.y;
        targetIntensity = 1;
      }
    };

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }
    };

    const drawHighlight = () => {
      const cellX = Math.floor(currentX / gridSize);
      const cellY = Math.floor(currentY / gridSize);
      const radius = isDesktop() ? 5 : 4;
      const edgeFadePx = gridSize * (isDesktop() ? 1.6 : 1.3);
      const cornerRadius = Math.min(48, gridSize * 2);
      const smoothstep = (edge0, edge1, x) => {
        const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
      };
      for (let dx = -radius; dx <= radius; dx += 1) {
        for (let dy = -radius; dy <= radius; dy += 1) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) continue;
          const alpha = (1 - dist / (radius + 0.5)) * (isDesktop() ? 0.55 : 0.5) * intensity;
          if (alpha <= 0) continue;
          const x = (cellX + dx) * gridSize;
          const y = (cellY + dy) * gridSize;
          let finalAlpha = alpha;
          if (imageRect) {
            const cx = x + gridSize * 0.5;
            const cy = y + gridSize * 0.5;
            const centerX = imageRect.x + imageRect.w * 0.5;
            const centerY = imageRect.y + imageRect.h * 0.5;
            const halfW = imageRect.w * 0.5;
            const halfH = imageRect.h * 0.5;
            const px = Math.abs(cx - centerX);
            const py = Math.abs(cy - centerY);
            const qx = px - (halfW - cornerRadius);
            const qy = py - (halfH - cornerRadius);
            const ox = Math.max(qx, 0);
            const oy = Math.max(qy, 0);
            const outside = Math.hypot(ox, oy);
            const inside = Math.min(Math.max(qx, qy), 0);
            const sdf = outside + inside - cornerRadius;
            const insideDist = -sdf;
            let edge = smoothstep(-edgeFadePx, edgeFadePx, insideDist);
            const noise =
              (Math.sin(cx * 0.18) +
                Math.sin(cy * 0.23 + 1.4) +
                Math.sin((cx + cy) * 0.08 + 0.7)) / 3;
            edge *= 1 + noise * 0.22;
            finalAlpha *= Math.min(1, Math.max(0, edge));
            if (finalAlpha <= 0.001) continue;
          }
          ctx.strokeStyle = `rgba(${accentRgb}, ${finalAlpha})`;
          ctx.lineWidth = 1.25;
          ctx.strokeRect(x + 0.5, y + 0.5, gridSize, gridSize);
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      if (!isDesktop() && imageRect) {
        cursorActive = true;
        targetIntensity = 1;
        targetX = imageRect.x + imageRect.w * mobileAnchor.x;
        targetY = imageRect.y + imageRect.h * mobileAnchor.y;
      }
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      intensity += (targetIntensity - intensity) * 0.12;
      if (cursorActive && intensity > 0.01) {
        drawHighlight();
      }
      requestAnimationFrame(render);
    };

    resize();
    heroImage?.addEventListener('load', () => {
      updateImageRect();
      if (!isDesktop() && imageRect) {
        targetX = imageRect.x + imageRect.w * mobileAnchor.x;
        targetY = imageRect.y + imageRect.h * mobileAnchor.y;
        targetIntensity = 1;
        cursorActive = true;
      }
    });

    if (!prefersReducedMotion) {
      heroSection.addEventListener('mousemove', (event) => {
      if (!isDesktop()) return;
      const rect = heroSection.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (
        imageRect &&
        (x < imageRect.x || x > imageRect.right || y < imageRect.y || y > imageRect.bottom)
      ) {
        cursorActive = false;
        targetIntensity = 0;
        intensity = 0;
        return;
      }
      targetX = x;
      targetY = y;
      targetIntensity = 1;
      cursorActive = true;
    });

    heroSection.addEventListener('mouseleave', () => {
      if (!isDesktop()) return;
      cursorActive = false;
      targetIntensity = 0;
      intensity = 0;
    });

      const observer = new ResizeObserver(() => {
        resize();
      });
      observer.observe(heroSection);
      window.addEventListener('resize', resize);
      render();
    } else {
      drawGrid();
    }
  }
}

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
