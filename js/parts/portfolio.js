/*
 * Portfolio page: project-row previews, side nav,
 * the After Hours carousel, and copy-email.
 *
 * First link in the page-logic class chain (see the script order at the bottom of Portfolio.html).
 */
class Portfolio {
  constructor(props) {
    this.props = props || {};
    this.gardenEl = document.querySelector('.garden');   // found once, used by every garden feature
  }

  // A fresh copy of a piece of garden artwork from its <template> at the bottom of Portfolio.html.
  // (SVG pieces sit inside a bare <svg> there so the browser reads them as SVG; the copy is the piece itself.)
  art(id) {
    const piece = document.getElementById(id).content.firstElementChild;
    return (piece.tagName === 'svg' && !piece.attributes.length ? piece.firstElementChild : piece).cloneNode(true);
  }

  // Wires the portfolio's moving parts. The project rows and cards are written in Portfolio.html
  // and are plain links (target="_blank" opens the case study in a new tab).
  setupPortfolio() {
    // garden panel rows: hovering shows a small preview of the cover (data-preview) beside the panel
    document.querySelectorAll('.garden-panel__card').forEach(row => {
      row.addEventListener('mouseenter', () => this.wPv(row, row.dataset.preview));
      row.addEventListener('focus', () => this.wPv(row, row.dataset.preview));
      row.addEventListener('mouseleave', () => this.wPv(null));
      row.addEventListener('blur', () => this.wPv(null));
    });

    document.querySelector('.portfolio-nav__back').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.enterGarden(true); });
    document.querySelector('.thanks__email').addEventListener('click', this.copy);
  }

  // Side nav: HTML and CSS handle showing it, the smooth jump to each section and the green line.
  // JS only works out which section you're in and tells the nav (data-current on the nav, data-state on each link).
  mountSideNav() {
    const nav = document.querySelector('.side-nav'), links = [...nav.querySelectorAll('.side-nav__link')];
    const sections = links.map(a => document.getElementById(a.hash.slice(1)));
    let crossing = 0, atBottom = false;
    let held = -1, stopT = 0, stepT = 0, stepping = false;   // after a click: the section the nav shows while the page scrolls there
    const mark = () => {
      const current = held >= 0 ? held : atBottom ? links.length - 1 : crossing;
      nav.dataset.current = current;
      links.forEach((a, i) => { a.dataset.state = i === current ? 'active' : i < current ? 'past' : 'upcoming'; });
    };
    // the section you're in is the one under a thin band a third of the way down the screen
    // (high enough that short sections like Design Challenge still reach it after a nav jump)
    const band = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) crossing = sections.indexOf(e.target); });
      mark();
    }, { rootMargin: '-30% 0px -69% 0px' });
    sections.forEach(el => band.observe(el));
    // the footer is too short to reach that band, so it lights up once it's (almost) fully in view: the bottom of the page
    new IntersectionObserver(([e]) => { atBottom = e.intersectionRatio >= .99; mark(); }, { threshold: [0, .99] }).observe(sections[sections.length - 1]);
    // clicking a link: the nav steps through the sections in between at an even pace (0.11s each), rather than
    // following the scroll, which lingers on tall sections like After Hours; then it stays on the clicked one
    // until the page stops scrolling (no scroll event for 150ms) and goes back to following the scroll
    const release = () => { clearTimeout(stopT); stopT = setTimeout(() => { if (!stepping) { held = -1; mark(); } }, 150); };
    links.forEach((a, target) => a.addEventListener('click', () => {
      clearInterval(stepT);
      held = +nav.dataset.current || 0;
      if (this.rm) held = target;   // less motion: straight there
      stepping = held !== target;
      mark(); release();
      if (stepping) stepT = setInterval(() => {
        held += Math.sign(target - held); mark();
        if (held === target) { clearInterval(stepT); stepping = false; release(); }
      }, 110);
    }));
    window.addEventListener('scroll', () => { if (held >= 0) release(); }, { passive: true });
    mark();
  }

  // After Hours carousel: runs full screen width; while you scroll down past it, it stays pinned
  // on screen and the scroll slides the pictures sideways, with the progress bar filling
  mountHScroll() {
    const wrap = document.querySelector('[data-hs]'), track = wrap.querySelector('[data-hs-track]'), bar = wrap.querySelector('[data-hs-bar]');
    const pin = wrap.querySelector('[data-hs-pin]');
    let dist = 0, stickTop = 0;   // how far the strip slides; where on screen the pin sticks
    const size = () => {
      // full screen width without the scrollbar (100vw would include it)
      wrap.style.marginLeft = '0px'; wrap.style.marginLeft = (-wrap.getBoundingClientRect().left) + 'px';
      wrap.style.width = document.documentElement.clientWidth + 'px';
      // first picture lines up with the heading; the last one stops clear of the side nav
      const nav = document.getElementById('side-nav'), navW = nav.getClientRects().length ? Math.max(0, window.innerWidth - nav.getBoundingClientRect().left) : 0;
      track.style.paddingRight = Math.max(28, navW + 20) + 'px';
      // the heading and the first picture line up with the page column (measured from the section's own edge,
      // which never animates; the heading itself eases in and out)
      const section = wrap.parentElement;
      wrap.style.setProperty('--hs-left', Math.max(16, Math.round(section.getBoundingClientRect().left + parseFloat(getComputedStyle(section).paddingLeft))) + 'px');
      dist = Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
      // heading + pictures + bar stick centred on the screen
      stickTop = Math.max(0, (window.innerHeight - pin.offsetHeight) / 2);
      pin.style.top = stickTop + 'px';
      wrap.style.height = (pin.offsetHeight + dist) + 'px';   // extra scroll room = the slide distance
      slide();
    };
    const slide = () => {
      const progress = dist ? Math.min(1, Math.max(0, (stickTop - wrap.getBoundingClientRect().top) / dist)) : 0;   // starts once the pin sticks
      track.style.transform = 'translate3d(' + (-progress * dist).toFixed(1) + 'px,0,0)';
      bar.style.transform = 'scaleX(' + progress.toFixed(3) + ')';
    };
    size();
    window.addEventListener('scroll', slide, { passive: true });
    window.addEventListener('resize', size);
    // the strip changes size when its pictures load and when the portfolio is opened: re-measure then too
    new ResizeObserver(size).observe(track);
  }


  // Copy email: copies whatever the button says (so the email lives only in the HTML),
  // then marks the row as copied for a moment (CSS swaps "click to copy" for "copied!")
  copy = () => {
    const contact = document.querySelector('.thanks__contact');
    navigator.clipboard?.writeText(document.querySelector('.thanks__email').textContent.trim()).catch(() => {});
    contact.dataset.copied = 'true';
    clearTimeout(this.ct);
    this.ct = setTimeout(() => delete contact.dataset.copied, 1800);
  };
}
