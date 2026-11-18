/*
 * Page logic — the main class. Starts everything (start()), wires the garden's buttons (setupGarden()),
 * the scroll "walk", and the garden ↔ portfolio switch (enterGarden()).
 *
 * Feature code lives in js/portfolio/*.js as a chain of classes:
 *   Portfolio → ClickFlowers → GardenScene → GardenHome → GardenPlants → GardenLife → Component
 * The script tags at the bottom of index.html load them in that order.
 */
class Component extends GardenLife {
  start() {
    // the visitor's settings, read once and used by every feature below
    const mq = q => !!(window.matchMedia && window.matchMedia(q).matches);
    this.rm = mq('(prefers-reduced-motion: reduce)'); this.noHover = mq('(hover: none)');

    this.setupPortfolio();
    this.setupGarden();
    this.mountSideNav();
    this.mountHScroll();
    this.setupHoverPreview();
    this.setupTimeOfDay();
    this.setCursor();
    this.setupWalk();
    this.setupDrawLayer();
    this.setupBloomAndSketch();
    this.startAmbient();
    this.setupSceneResize();
    this.openFromLink();
  }

  // Arriving from a case study's "back to portfolio" link: index.html#garden (it was opened from the garden)
  // lands on the garden; index.html#work (opened from inside the portfolio) opens the portfolio at Projects.
  // Either way behind the same soft fade as the garden switch (already covered, as the page is only just
  // opening; then it fades away).
  async openFromLink() {
    const fade = document.querySelector('.page-fade'), text = fade.querySelector('.page-fade__text');
    const toGarden = location.hash === '#garden';
    const target = !toGarden && location.hash && document.getElementById(location.hash.slice(1));
    if (!toGarden && (!target || !target.closest('.portfolio'))) { delete document.documentElement.dataset.arriving; return; }   // not one of ours: uncover
    this.entering = true;
    text.textContent = toGarden ? 'back to your garden…' : 'back to the portfolio…';
    fade.dataset.active = 'true';                       // keep it covered…
    fade.offsetWidth;
    delete document.documentElement.dataset.arriving;   // …as the first-frame cover from the <head> hands over
    if (!toGarden) {
      this.showPortfolio(true);
      requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant' }));
    }
    await new Promise(done => setTimeout(done, 650));   // let the message be read for a moment
    fade.dataset.active = 'false';
    await Promise.all(fade.getAnimations({ subtree: true }).map(a => a.finished.catch(() => {})));
    this.entering = false;
  }

  // Swap the garden for the portfolio (on = true) or back
  showPortfolio(on) {
    this.entered = on;
    document.querySelector('.garden').hidden = on;
    document.querySelector('.portfolio').hidden = !on;
    [this.homeEl, this.gLayer, this.aLayer].forEach(el => { if (el) el.style.display = on ? 'none' : ''; });
    if (this.followHome) this.followHome();
    if (this.layer) this.layer.innerHTML = '';
  }

  // Project-row hover preview: a small framed cover beside the garden panel, level with the hovered row.
  // JS only places it and picks the picture; CSS does the pop in/out (data-active) and the glide when it moves.
  setupHoverPreview() {
    const el = document.querySelector('.hover-preview'), img = el.querySelector('img'), W = 230;
    let row = null;
    // right of the panel (left if there's no room), level with the row, kept on screen
    const place = () => {
      const H = el.offsetHeight, r = row.getBoundingClientRect(), side = (row.closest('aside') || row).getBoundingClientRect();
      let x = side.right + 24; if (x + W > innerWidth - 8) x = Math.max(8, side.left - W - 24);
      el.style.translate = x + 'px ' + Math.max(8, Math.min(innerHeight - H - 8, r.top + r.height / 2 - H / 2)) + 'px';
    };
    // match the frame's height to each picture once it loads, then re-centre it on the row
    // (and fade the new picture in if it was a swap)
    img.addEventListener('load', () => { delete el.dataset.swap; if (!img.naturalWidth) return; el.style.height = Math.round((W - 6) * img.naturalHeight / img.naturalWidth + 6) + 'px'; if (row) place(); });
    img.addEventListener('error', () => { delete el.dataset.swap; });
    let hideT = 0;
    this.wPv = (hovered, src) => {
      row = this.noHover ? null : hovered;
      clearTimeout(hideT);
      // leaving a row: wait a moment, so moving straight onto the other row glides there instead of hiding
      if (!row) { hideT = setTimeout(() => { el.dataset.active = 'false'; }, 120); return; }
      if (img.getAttribute('src') !== src) { if (el.dataset.active === 'true') el.dataset.swap = 'true'; img.setAttribute('src', src); }
      place();
      if (el.dataset.active !== 'true') { el.offsetWidth; el.dataset.active = 'true'; }   // first show: jump into place, then pop in
    };
  }

  // Time of day: the slider (and the signpost hover) sets one number, this.curMx: 0 = early light … 1 = night.
  // JS works out the positions and hands everything to CSS as variables on .garden; style.css draws it
  // (sky colours, sun, moon, glows, the night overlay, the lamp, and the night lights on the home and drawings).
  setupTimeOfDay() {
    const garden = document.querySelector('.garden'), scene = garden.querySelector('.garden-scene'), sky = scene.querySelector('.garden-scene__sky');
    const sign = scene.querySelector('.garden-sign'), label = garden.querySelector('.garden-scene__time-label'), range = garden.querySelector('.garden-scene__time-range');
    const set = (name, value) => garden.style.setProperty(name, value);
    const px = (name, value) => set(name, value.toFixed(1) + 'px');
    this.nameAt = mx => mx < .14 ? 'early light' : mx < .38 ? 'golden hour' : mx < .62 ? 'afternoon' : mx < .84 ? 'late evening' : 'night';

    let raf = 0;
    const render = () => {
      raf = 0;
      const mx = this.curMx, r = scene.getBoundingClientRect(); if (!r.width) return;
      // sky: which two of the five skies in style.css to blend, and how far between them
      const f = Math.max(0, Math.min(.999, mx)) * 4, i = Math.floor(f);
      sky.dataset.from = i; sky.dataset.to = i + 1; set('--sky-mix', (f - i).toFixed(3));
      // night: 0 by day, eases up to 1 from late evening on
      const nt = Math.max(0, Math.min(1, (mx - .7) / .22)); set('--night', (nt * nt * (3 - 2 * nt)).toFixed(3));
      // the sun arcs up and back down across the scene; the moon stays near the top
      const sunY = r.height * (.42 - .3 * Math.sin(Math.PI * Math.min(1, mx)));
      px('--sun-x', mx * r.width); px('--sun-y', sunY); px('--moon-y', Math.min(r.height * .2, Math.max(40, sunY)));
      // the lamp glow (and the hole it lights in the night) sits on the signpost; the home glow on the home
      const s = sign.getBoundingClientRect(); px('--lamp-x', s.left + s.width / 2 - r.left); px('--lamp-y', s.top + s.height / 2 - r.top);
      const home = this.homeEl && this.homeEl.style.display !== 'none' ? this.homeEl.getBoundingClientRect() : null;
      set('--home-lit', home ? 1 : 0);
      if (home) { px('--home-x', home.left + home.width / 2 - r.left); px('--home-y', home.top + home.height * .6 - r.top); }
      label.textContent = this.timeName || this.nameAt(mx);
      if (this.followHome) this.followHome();   // the home's night glow changed
    };
    this.applyMx = mx => { this.curMx = mx; garden.dataset.night = mx > .8 ? '1' : ''; if (!raf) raf = requestAnimationFrame(render); };

    // glide to a time over 0.65s (used by the signpost hover), then move the slider to match
    this.tweenTo = (to, name) => {
      cancelAnimationFrame(this.twR);
      const from = this.curMx, t0 = performance.now();
      this.timeName = name;
      const frame = now => {
        const k = Math.min(1, (now - t0) / 650);
        const eased = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;   // ease in and out
        this.applyMx(from + (to - from) * eased);
        if (k < 1) this.twR = requestAnimationFrame(frame);
        else range.value = String(Math.round(this.curMx * 1000));
      };
      this.twR = requestAnimationFrame(frame);
    };
    // signpost hover: remember the time you were at, glide to night; on leave, glide back
    this.signNight = on => {
      if (on) {
        if (this.preNight == null) this.preNight = { mx: this.curMx, name: this.timeName };
        this.tweenTo(.93, 'night');
      } else if (this.preNight != null) {
        const before = this.preNight;
        this.preNight = null;
        this.tweenTo(before.mx, before.name);
      }
    };

    // the slider; its clicks shouldn't plant anything in the garden underneath
    range.addEventListener('input', ev => {
      ev.stopPropagation();
      this.preNight = null;
      cancelAnimationFrame(this.twR);
      const mx = +range.value / 1000;
      this.timeName = this.nameAt(mx);
      this.applyMx(mx);
    });
    ['pointerdown', 'mousedown', 'click', 'touchstart'].forEach(t => range.addEventListener(t, ev => ev.stopPropagation()));

    // start at afternoon, and redraw whenever the scene changes size (window resized, panel opened or closed)
    this.timeName = 'afternoon'; this.curMx = .5; range.value = '500';
    new ResizeObserver(() => this.applyMx(this.curMx)).observe(scene);
  }

  // Scroll walk: the signs beside the portfolio, redrawn when the page changes size
  setupWalk() {
    let wait = 0, raf = 0;
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; this.walkTick(); }); }, { passive: true });
    // redraw the signs whenever the page changes size (window resized, portfolio opened, pictures loaded), once it settles
    new ResizeObserver(() => { clearTimeout(wait); wait = setTimeout(() => this.placeWalk(), 250); }).observe(document.querySelector('[data-walk-root]'));
  }

  // The layer click flowers and sketches are drawn on, and the cursor hint
  setupDrawLayer() {
    document.body.style.position = 'relative';
    this.layer = document.createElement('div');
    this.layer.className = 'draw-layer';
    document.body.appendChild(this.layer);
    this.hint = document.querySelector('.cursor-hint');
    this.setCursor();
  }

  // Click to plant or bloom, drag to sketch, and the hint that follows the cursor
  setupBloomAndSketch() {
    const on = () => (this.props.clickFlowers ?? true) !== false;
    const isUI = t => t && t.closest && t.closest('a,button,input,textarea,select,[data-no-bloom]');
    // the house / plant cursor shows only over open ground in the garden (not the sky, the pond or a button)
    this.refreshCursor = () => {
      const [target, x, y] = this.lastPt || [];
      let ok = !!(target && this.cursorVal && !this.entered && !this.lush && target.closest && target.closest('[data-g-scene]') && !isUI(target));
      if (ok) ok = !(this.homeEl ? this.noPlantAt(x, y) : this.noHomeAt(x, y));
      const cursor = ok ? this.cursorVal : '';
      if (document.body.style.cursor !== cursor) document.body.style.cursor = cursor;
    };
    // a click: in the portfolio a flower pops up; in the garden it places your home, then plants
    this.onBloom = e => {
      if (!on() || this.suppress || this.lush || isUI(e.target)) return;
      if (this.entered) { this.bloom(e.pageX, e.pageY); return; }
      const notHere = this.homeEl ? this.noPlantAt(e.clientX, e.clientY) : this.noHomeAt(e.clientX, e.clientY);   // sky or water
      if (notHere) { this.flashNoPlant(e, notHere); return; }
      if (this.homeEl) this.gardenPlant(e.pageX, e.pageY);
      else this.placeHome(e.pageX, e.pageY);
    };
    // press: maybe the start of a sketch (it becomes one once you move 6px)
    this.onDown = e => {
      if (!on() || this.lush || e.button !== 0 || e.pointerType === 'touch' || isUI(e.target)) return;
      this.drag = { x: e.pageX, y: e.pageY, moved: false, pts: [] };
    };
    this.onMove = e => {
      const d = this.drag;
      if (d) {
        if (!d.moved) { if (Math.hypot(e.pageX - d.x, e.pageY - d.y) < 6) return; d.moved = true; d.pts.push([d.x, d.y]); this.startSketch(d); }
        d.pts.push([e.pageX, e.pageY]); this.drawSketch(d); this.hint.dataset.shown = 'false'; return;
      }
      this.lastPt = [e.target, e.clientX, e.clientY]; this.refreshCursor();
      if (this.entered) { this.hint.dataset.shown = 'false'; if (document.body.style.cursor) document.body.style.cursor = ''; return; }
      if (this.lush) { this.hint.dataset.shown = 'false'; return; }
      if ((this.props.cursorHint ?? true) === false) { this.hint.dataset.shown = 'false'; return; }
      const dh = e.target.closest && e.target.closest('[data-hint]');
      if (dh && e.pointerType !== 'touch') { this.hint.textContent = dh.getAttribute('data-hint'); this.hintCustom = true; }
      else { if (this.hintCustom) { this.hintCustom = false; this.setHint(); } if (!on() || e.pointerType === 'touch' || isUI(e.target)) { this.hint.dataset.shown = 'false'; return; } }
      if (!dh) { const no = this.entered ? null : this.homeEl ? this.noPlantAt(e.clientX, e.clientY) : this.noHomeAt(e.clientX, e.clientY); if (no) { this.hint.textContent = this.noPlantMsg(no); this.noHint = true; } else if (this.noHint) { this.noHint = false; this.setHint(); } }
      this.hint.style.transform = 'translate(' + (e.clientX + 18) + 'px,' + (e.clientY + 22) + 'px)';
      this.hint.dataset.shown = 'true';
      clearTimeout(this.ht); this.ht = setTimeout(() => { this.hint.dataset.shown = 'false'; }, 1600);
    };
    // release: finish the sketch, and swallow the click the browser sends right after (so it doesn't plant too)
    this.onUp = () => {
      const d = this.drag;
      this.drag = null;
      if (!d || !d.moved) return;
      this.endSketch(d);
      this.setHint();
      this.suppress = true;
      setTimeout(() => { this.suppress = false; }, 0);
    };
    this.setHint();
    document.addEventListener('click', this.onBloom);
    document.addEventListener('pointerdown', this.onDown);
    document.addEventListener('pointermove', this.onMove);
    document.addEventListener('pointerup', this.onUp);
  }

  // When the scene changes size (window resized, panel opened or closed, garden shown again):
  // keep the home on its spot as it changes, and once it has settled, redraw the things sized to the scene
  // (the family's path around the home, the picnic). Also runs once at the start.
  setupSceneResize() {
    // put the home back on its remembered spot in the scene (homeVB), at the right size for its depth
    this.homePos = () => {
      const el = this.homeEl; if (!el) return;
      const spot = this.homeVB && this.vbToClient(this.homeVB.x, this.homeVB.y);
      if (spot) { el.style.left = (spot.x + window.scrollX) + 'px'; el.style.top = (spot.y + window.scrollY) + 'px'; }
      this.homeDepth(el);
    };
    let settle = 0;
    new ResizeObserver(([entry]) => {
      if (!entry.contentRect.width) return;   // garden hidden (portfolio open)
      this.homePos();
      clearTimeout(settle);
      settle = setTimeout(() => { this.buildPicnic(); if (this.homeEl) { this.homePos(); this.homeExtras(); } }, 300);
    }).observe(document.querySelector('.garden-scene'));
  }
  // Scroll walk: the stops are written in index.html. JS lines each one up beside its section
  // (right or left margin from data-side) and hides the walk when the margins are too narrow.
  placeWalk() {
    const root = document.querySelector('[data-walk-root]'), walk = root.querySelector('.walk-path');
    const W = root.clientWidth, gut = (W - 1080) / 2, top0 = root.getBoundingClientRect().top;
    walk.hidden = gut < 96;
    if (walk.hidden) return;
    walk.style.setProperty('--board-max', Math.max(80, gut - 20) + 'px');
    walk.querySelectorAll('.walk-path__stop').forEach(stop => {
      stop.style.left = (stop.dataset.side === 'right' ? W - gut / 2 : gut / 2) + 'px';
      stop.style.top = (document.getElementById(stop.dataset.for).getBoundingClientRect().top - top0 + 120) + 'px';
      delete stop.dataset.shown;   // start hidden again; walkTick shows the ones already scrolled to
    });
    this.walkTick();
  }
  // reveal each stop once it's 85% of the way up the screen
  walkTick = () => {
    const root = document.querySelector('[data-walk-root]'), lim = innerHeight * .85 - root.getBoundingClientRect().top;
    root.querySelectorAll('.walk-path:not([hidden]) .walk-path__stop').forEach(stop => { if (parseFloat(stop.style.top) < lim) stop.dataset.shown = 'true'; });
  };
  // Garden → full portfolio (back = false), or portfolio → garden (back = true), behind a soft fade.
  // Waits for the fade's own CSS transition (style.css .page-fade) rather than timers that copy its length.
  async enterGarden(back) {
    if (this.entering) return; this.entering = true;
    const fade = document.querySelector('.page-fade');
    const fadeDone = () => Promise.all(fade.getAnimations({ subtree: true }).map(a => a.finished.catch(() => {})));
    fade.querySelector('.page-fade__text').textContent = back ? 'back to your garden…' : 'stepping into the portfolio…';
    fade.dataset.active = 'true';
    await fadeDone();   // screen fully covered
    this.showPortfolio(!back);
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise(done => setTimeout(done, 450));   // let the message be read for a moment
    fade.dataset.active = 'false';
    await fadeDone();
    this.entering = false;
  }
  // The garden's buttons: panel collapse, enter, plant picker, lush mode, signpost.
  // (Stone and project-card hovers are plain CSS.)
  setupGarden() {
    const $ = sel => document.querySelector(sel);
    const enter = e => { e.preventDefault(); e.stopPropagation(); this.enterGarden(false); };
    $('.garden-panel .icon-button[title="Expand to full portfolio"]').addEventListener('click', enter);
    $('.garden-panel__enter').addEventListener('click', enter);

    // Side panel: ‹ collapses it to a thin strip, › opens it again. CSS sets the width from data-panel.
    const garden = $('.garden'), openParts = [$('.garden-panel__actions'), $('.garden-panel__scroll'), $('.garden-panel__enter')], reopen = $('.garden-panel__reopen');
    const togglePanel = e => {
      e.preventDefault(); e.stopPropagation();
      const closing = garden.dataset.panel !== 'closed';
      garden.dataset.panel = closing ? 'closed' : 'open';
      openParts.forEach(part => { part.hidden = closing; });
      reopen.hidden = !closing;
    };
    $('.garden-panel .icon-button[title="Collapse panel"]').addEventListener('click', togglePanel);
    reopen.addEventListener('click', togglePanel);

    // Plant picker: remember the choice and mark the pressed button
    const plantButtons = document.querySelectorAll('.plant-picker__button');
    plantButtons.forEach(button => button.addEventListener('click', e => {
      e.stopPropagation();
      this.plantPick = button.dataset.plant;
      plantButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    }));

    $('.garden-scene__lush-button').addEventListener('click', e => this.toggleLush(e));

    // Signpost: click → portfolio; hover → it wobbles (alternating direction) and the sky turns to night
    const sign = $('.garden-sign'), post = $('.garden-sign__post');
    let wobbles = 0;
    sign.addEventListener('click', enter);
    sign.addEventListener('mouseenter', () => { post.dataset.wobble = ++wobbles % 2 ? 'left' : 'right'; this.signNight(true); });
    sign.addEventListener('mouseleave', () => this.signNight(false));
  }
}

// Start the page. These are the "Playful bits" settings (clickFlowers and cursorHint are the ones in use).
new Component({ clickFlowers: true, cursorHint: true }).start();
