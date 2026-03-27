import './style.css';

// Hero video: play for 4 seconds then pause
const heroVideo = document.querySelector('[data-purpose="hero-video"]');
if (heroVideo) {
  const pauseAfterMs = 4000;
  let pauseTimeout;

  const startHeroVideo = () => {
    clearTimeout(pauseTimeout);
    heroVideo.currentTime = 0;
    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
    pauseTimeout = setTimeout(() => {
      heroVideo.pause();
    }, pauseAfterMs);
  };

  if (heroVideo.readyState >= 2) {
    startHeroVideo();
  } else {
    heroVideo.addEventListener('loadeddata', startHeroVideo, { once: true });
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

// Desktop Sidebar
const sidebarToggle = document.getElementById('desktop-sidebar-toggle');
const closeSidebar = document.getElementById('close-sidebar');
const sidebarWrapper = document.getElementById('desktop-sidebar-wrapper');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebarPanel = document.getElementById('sidebar-panel');
const sidebarLinks = sidebarPanel.querySelectorAll('.sidebar-link');

let sidebarOpen = false;

function openSidebar() {
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

// Close sidebar on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebarOpen) {
    closeSidebarFn();
  }
});
