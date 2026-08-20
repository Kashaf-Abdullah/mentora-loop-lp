/* ==========================================================================
   Mentora Loop — Interactions
   Waits for partials:loaded (fired by loader.js) since these elements are
   injected at runtime rather than present in the initial DOM.
   ========================================================================== */

document.addEventListener('partials:loaded', () => {
  initNav();
  initScrollReveal();
  initCourseFinder();
  initLoopDiagram();
  initRoleTabs();
  initYear();
});

/* ---------------- Navbar: scroll shadow + mobile toggle ---------------- */
function initNav() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  const onScroll = () => {
    if (window.scrollY > 40) navbar.classList.add('is-scrolled');
    else navbar.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ---------------- Scroll reveal via IntersectionObserver ---------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || targets.length === 0) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => observer.observe(el));
}

/* ---------------- Hero course-finder demo interaction ---------------- */
const COURSE_DEMO_DATA = [
  { title: 'MDCAT / MCAT / ECAT Test Prep', mentor: 'Approved mentors · live + recorded', format: 'Timed tests + practice', seats: 'Results & progress tracking', fee: 'Admin-managed enrollment' },
  { title: 'Interview Preparation', mentor: 'with an approved mentor', format: 'Live practice + feedback', seats: 'Questions + mock interviews', fee: 'Admin-managed enrollment' },
  { title: 'Videography for Beginners', mentor: 'Learn camera, editing & storytelling', format: 'Live + project practice', seats: 'Portfolio-focused learning', fee: 'Admin-managed enrollment' },
  { title: 'Needlework & Crochet', mentor: 'Hands-on learning with a mentor', format: 'Live + project reviews', seats: 'Step-by-step practice', fee: 'Admin-managed enrollment' },
  { title: 'Home Baking Essentials', mentor: 'Recipes, technique & practice', format: 'Live + practical projects', seats: 'Feedback on your work', fee: 'Admin-managed enrollment' },
  { title: 'Coding & Programming Basics', mentor: 'Python, Scratch, HTML & more', format: 'Live + recorded', seats: 'Practice + project work', fee: 'Admin-managed enrollment' },
  { title: 'Your custom learning path', mentor: 'Request what you want to learn', format: 'Demand-driven course', seats: 'Mentors can apply', fee: 'Set after course setup' },
];

function initCourseFinder() {
  const pills = document.querySelectorAll('#coursePills .course-pill');
  const preview = document.getElementById('coursePreview');
  const title = document.getElementById('cpTitle');
  const mentor = document.getElementById('cpMentor');
  const format = document.getElementById('cpFormat');
  const seats = document.getElementById('cpSeats');
  const fee = document.getElementById('cpFee');
  if (!pills.length || !preview) return;

  function render(index) {
    const data = COURSE_DEMO_DATA[index];
    if (!data) return;
    preview.style.animation = 'none';
    // Force reflow so the fadeUp animation replays on every switch
    void preview.offsetWidth;
    preview.style.animation = '';
    title.textContent = data.title;
    mentor.textContent = data.mentor;
    format.textContent = data.format;
    seats.textContent = data.seats;
    fee.textContent = data.fee;
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      render(Number(pill.dataset.course));
    });
  });
}

/* ---------------- Mastery Loop diagram: auto-cycling + scroll-triggered draw ---------------- */
function initLoopDiagram() {
  const diagram = document.getElementById('loopDiagram');
  const progress = document.getElementById('loopProgress');
  const nodes = document.querySelectorAll('.loop-node');
  const steps = document.querySelectorAll('.loop-step');
  if (!diagram || !nodes.length) return;

  const CIRCUMFERENCE = 804.2; // 2 * PI * r(128)
  let activeIndex = 0;
  let intervalId = null;

  function setActive(index) {
    activeIndex = index;
    nodes.forEach(n => n.classList.toggle('is-active', Number(n.dataset.node) === index));
    steps.forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) === index));
    if (progress) {
      const fraction = (index + 1) / nodes.length;
      progress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - fraction));
    }
  }

  function startCycle() {
    if (intervalId) return;
    intervalId = setInterval(() => {
      setActive((activeIndex + 1) % nodes.length);
    }, 2600);
  }

  // Only start animating once the diagram scrolls into view
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(0);
          startCycle();
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    io.observe(diagram);
  } else {
    setActive(0);
    startCycle();
  }

  // Allow manual hover-to-preview on desktop
  nodes.forEach(node => {
    node.addEventListener('mouseenter', () => setActive(Number(node.dataset.node)));
  });
}

/* ---------------- Role tabs (Admin / Teacher / Student) ---------------- */
function initRoleTabs() {
  const tabs = document.querySelectorAll('.role-tab');
  const panels = document.querySelectorAll('.role-panel');
  const indicator = document.getElementById('roleIndicator');
  if (!tabs.length) return;

  function activate(role, index) {
    tabs.forEach(t => {
      const isMatch = t.dataset.role === role;
      t.classList.toggle('is-active', isMatch);
      t.setAttribute('aria-selected', String(isMatch));
    });
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === role));
    if (indicator) {
      const tabWidth = 100 / tabs.length;
      indicator.style.width = `${tabWidth}%`;
      indicator.style.transform = `translateX(${index * 100}%)`;
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.role, index));
  });
}

/* ---------------- Footer year ---------------- */
function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
