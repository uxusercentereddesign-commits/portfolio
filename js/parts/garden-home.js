/*
 * Your home in the garden: placing, dragging and removing it.
 *
 * One link in the page-logic class chain (see the script order at the bottom of Portfolio.html):
 *   GardenHome extends GardenScene
 */
class GardenHome extends GardenScene {
  // The home you see is a copy drawn inside the scene's SVG, so it sits at the right depth among the trees
  // (the real element stays invisible and catches the drags). followHome() keeps the copy in step:
  // it updates it, and keeps updating every frame only while the home is being dragged or is animating.
  mirrorHome(el) {
    const NS = 'http://www.w3.org/2000/svg', inner = el.querySelector('svg'); if (!this.sceneSvg() || !inner) return;
    const wrap = document.createElementNS(NS, 'g'); wrap.setAttribute('data-home-mirror', '1'); wrap.style.pointerEvents = 'none'; wrap.innerHTML = this.homeSVG();
    const copy = wrap.firstElementChild; copy.style.overflow = 'visible'; inner.style.visibility = 'hidden';
    let lastBase = null, raf = 0;
    const sync = () => {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      if (cs.display === 'none' || cs.visibility === 'hidden' || !r.width) { wrap.style.display = 'none'; return; }
      const a = this.toVB(r.left, r.top), b = this.toVB(r.right, r.bottom); if (!a || !b) return;
      wrap.style.display = '';
      copy.setAttribute('x', a.x.toFixed(1)); copy.setAttribute('y', a.y.toFixed(1));
      copy.setAttribute('width', Math.max(0, b.x - a.x).toFixed(1)); copy.setAttribute('height', Math.max(0, b.y - a.y).toFixed(1));
      wrap.style.opacity = cs.opacity; wrap.style.filter = cs.filter;
      const base = a.y + (b.y - a.y) * 114 / 120;   // the home's footing, for depth order
      if (lastBase === null || Math.abs(base - lastBase) > .5 || !wrap.isConnected) { this.depthInsert(wrap, base); lastBase = base; }
    };
    this.followHome = () => {
      if (raf) return;
      const frame = () => {
        raf = 0;
        if (!el.isConnected) { wrap.remove(); return; }   // home removed
        sync();
        if (this.homeDragging || el.getAnimations().some(a => a.playState === 'running')) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };
    sync();
    this.followHome();
  }
  homeAnchor() {
    const el = this.homeEl, m = this.vbMap(0); if (!el || !m || el.style.visibility === 'hidden' || el.style.display === 'none') return null;
    const b = this.toVB((parseFloat(el.style.left) || 0) - window.scrollX, (parseFloat(el.style.top) || 0) - window.scrollY); if (!b) return null;
    return { x: b.x, y: b.y, hw: 140 * (parseFloat(el.style.scale) || 1) / m.s };
  }
  clearExtras() { if (this.pathEl) { this.pathEl.remove(); this.pathEl = null; } this.stopFamily(); }
  homeExtras(pop) { try { if (this.pathEl) { this.pathEl.remove(); this.pathEl = null; } this.buildFamily(pop); } catch (e) { console.error(e); } }
  // keep the home clear of the side panel and the right edge
  homeClamp(el) {
    const panel = document.querySelector('[data-g-panel]'), min = (panel ? panel.offsetWidth : 0) + 74, max = window.innerWidth - 74;
    el.style.left = Math.max(min, Math.min(max, parseFloat(el.style.left) || 0)) + 'px';
  }
  // scales the home with its depth; if the scene has no size yet, the scene's ResizeObserver calls this again once it does
  homeDepth(el) {
    this.homeClamp(el);
    const m = this.vbMap(0); if (!m || !(m.s > 0)) return;
    const spot = this.toVB((parseFloat(el.style.left) || 0) - window.scrollX, (parseFloat(el.style.top) || 0) - window.scrollY);
    const k = Math.min(1, m.s / .62) * (spot ? this.persp(spot.y) : 1);   // smaller when the scene is small, and farther back
    el.style.transformOrigin = '50% 95%'; el.style.scale = k.toFixed(3);
    if (this.followHome) this.followHome();
  }
  // the house drawing (its <template> is in Portfolio.html)
  homeSVG() { return document.getElementById('garden-home-art').innerHTML; }
  setCursor() {
    const plant = "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M16 30 V14' stroke='#5E6B3A' stroke-width='1.8' stroke-linecap='round' fill='none'/><path d='M16 18 C9 18 6 13 6 8 C12 8 16 12 16 18Z' fill='#8DA35F' stroke='#3F4A24' stroke-width='1.2'/><path d='M16 14 C22 14 26 9 26 4 C20 4 16 8 16 14Z' fill='#A8B978' stroke='#3F4A24' stroke-width='1.2'/></svg>";
    const house = "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M4 15 L16 5 L28 15' fill='#B5573A' stroke='#3A2E22' stroke-width='1.6' stroke-linejoin='round'/><rect x='7' y='14' width='18' height='14' rx='1.5' fill='#F5E9CF' stroke='#3A2E22' stroke-width='1.6'/><rect x='14' y='20' width='5' height='8' fill='#6E4F33'/></svg>";
    if (this.lush) { this.cursorVal = ''; if (this.refreshCursor) this.refreshCursor(); return; }
    const s = this.homeEl ? plant : house, hot = this.homeEl ? '16 30' : '16 28';
    this.cursorVal = 'url("data:image/svg+xml,' + encodeURIComponent(s) + '") ' + hot + ', auto'; if (this.refreshCursor) this.refreshCursor();
  }
  placeHome(px, py, quiet) {
    if (this.homeEl) return;
    const el = document.createElement('div');
    el.setAttribute('data-home', '1'); el.setAttribute('data-no-bloom', '1'); el.setAttribute('data-hint', 'drag me anywhere · × to remove');
    el.className = 'garden-home';   // size, shadow, night glow and the × button's look are in style.css
    el.style.left = px + 'px'; el.style.top = py + 'px';
    el.innerHTML = this.homeSVG() + '<button class="garden-home__remove" aria-label="Remove home">×</button>';
    const x = el.querySelector('button');
    x.addEventListener('click', ev => { ev.stopPropagation(); this.removeHome(); });
    x.addEventListener('pointerdown', ev => ev.stopPropagation());
    el.addEventListener('mouseenter', ev => { const r = el.getBoundingClientRect(), sc = r.width / 140 || 1; x.style.right = 'auto'; x.style.transformOrigin = '0 100%'; x.style.scale = (1 / sc).toFixed(3); x.style.left = ((ev.clientX - r.left + 8) / sc) + 'px'; x.style.top = ((ev.clientY - r.top - 8) / sc - 26) + 'px'; });
    el.addEventListener('pointerdown', ev => {
      if (ev.button !== 0) return; ev.stopPropagation(); ev.preventDefault();
      el.setPointerCapture(ev.pointerId); el.style.cursor = 'grabbing'; this.homeDragging = true;
      const sx = ev.pageX - parseFloat(el.style.left), sy = ev.pageY - parseFloat(el.style.top);
      el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08) rotate(-3deg)' }], { duration: 160, fill: 'forwards' });
      const mv = e2 => { const nl = e2.pageX - sx, nt = e2.pageY - sy, bad = this.noHomeAt(nl - window.scrollX, nt - window.scrollY); if (bad) { this.hint.textContent = bad === 'water' ? "can't build on water ≈" : 'build on the ground, not the sky'; this.hint.style.transform = 'translate(' + (e2.clientX + 18) + 'px,' + (e2.clientY + 22) + 'px)'; this.hint.dataset.shown = 'true'; clearTimeout(this.ht); this.ht = setTimeout(() => { this.hint.dataset.shown = 'false'; this.setHint(); }, 1200); return; } el.style.left = nl + 'px'; el.style.top = nt + 'px'; this.homeDepth(el); if (this.pathEl) this.pathEl.style.display = 'none'; (this.famEls || []).forEach(n => { n.style.opacity = '0'; }); };
      const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.style.cursor = 'grab'; this.homeDragging = false; el.animate([{ transform: 'scale(1.08) rotate(-3deg)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 320, fill: 'forwards' }); this.saveHome(); this.homeExtras(); this.followHome(); this.suppress = true; setTimeout(() => { this.suppress = false; }, 0); };
      el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up);
      this.followHome();
    });
    this.gardenEl.appendChild(el);
    this.homeEl = el; this.homeDepth(el); this.mirrorHome(el); this.homeExtras(!quiet);
    if (!quiet && this.rm) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' }); else if (!quiet) el.animate([{ transform: 'translateY(-40px) scale(.3)', opacity: 0 }, { transform: 'translateY(4px) scale(1.06)', opacity: 1, offset: .65 }, { transform: 'none', opacity: 1 }], { duration: 650, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    this.saveHome(); this.setCursor(); this.setHint();
  }
  removeHome() {
    if (!this.homeEl) return;
    const el = this.homeEl, followHome = this.followHome; this.homeEl = null; this.clearExtras();
    el.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.2) translateY(30px)', opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => { el.remove(); followHome(); };
    followHome();
    this.setCursor(); this.setHint();
  }
  // remember where the home sits in the scene, so it stays put when the window resizes
  saveHome() {
    if (!this.homeEl) return;
    { const v = this.toVB((parseFloat(this.homeEl.style.left) || 0) - window.scrollX, (parseFloat(this.homeEl.style.top) || 0) - window.scrollY); if (v) this.homeVB = { x: v.x, y: v.y }; }
  }
}
