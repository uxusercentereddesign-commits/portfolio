/*
 * Garden scene geometry: converting between screen and SVG coordinates, depth
 * (nearer things overlap farther ones), and the "can't plant here" rules + hints.
 *
 * One link in the page-logic class chain (see the script order at the bottom of index.html):
 *   GardenScene extends ClickFlowers
 */
class GardenScene extends ClickFlowers {
  persp(vy) { return Math.max(.55, Math.min(1.3, .55 + (vy - 458) / 442 * .75)); }
  // the scene's main SVG and the pond outline: found once (they're in the HTML), then reused on every pointer move
  sceneSvg() { return this.sceneSvgEl ??= document.querySelector('[data-garden] svg[data-depth="14"]'); }
  pondPath() { return this.pondEl ??= document.querySelector('[data-g-pond] > path'); }
  toVB(cx, cy) { const sv = this.sceneSvg(), m = sv && sv.getScreenCTM(); return m ? new DOMPoint(cx, cy).matrixTransform(m.inverse()) : null; }
  depthInsert(node, base) {
    const sv = this.sceneSvg(); if (!sv) return false;
    node.setAttribute('data-base', base.toFixed(1));
    let ref = null; for (const c of sv.children) { if (c === node) continue; if (parseFloat(c.getAttribute('data-base')) > base) { ref = c; break; } }
    if (ref) { if (node.parentNode !== sv || node.nextElementSibling !== ref) sv.insertBefore(node, ref); } else if (sv.lastElementChild !== node) sv.appendChild(node);
    return true;
  }
  vbToClient(x, y) { const sv = this.sceneSvg(), M = sv && sv.getScreenCTM(); return M ? new DOMPoint(x, y).matrixTransform(M) : null; }
  inWater(x, y) { const c = this.vbToClient(x, y); return c ? this.noPlantAt(c.x, c.y) === 'water' : false; }
  vbMap(top0) {
    const sv = this.sceneSvg(); if (!sv) return null;
    const rc = sv.getBoundingClientRect(), s = Math.min(rc.width / 1560, rc.height / 720), ox = rc.left + (rc.width - 1560 * s) / 2, oy = rc.top + (rc.height - 720 * s);
    return { s, x: v => ox + (v - 0) * s + window.scrollX, y: v => oy + (v - 180) * s + window.scrollY - top0 };
  }
  noPlantAt(cx, cy) {
    const sv = this.sceneSvg(); if (!sv || !sv.getScreenCTM) return null;
    const loc = el => new DOMPoint(cx, cy).matrixTransform(el.getScreenCTM().inverse());
    try {
      if (loc(sv).y < 458) return 'sky';
      const w = this.pondPath(); if (w && w.isPointInFill && w.isPointInFill(loc(w))) return 'water';
    } catch (_) {}
    return null;
  }
  noPlantMsg(why) { const h = !this.homeEl; return why === 'water' ? (h ? "can't build on water ≈" : "can't plant on water ≈") : (h ? 'build on the ground, not the sky' : 'plant on the ground, not the sky'); }
  noHomeAt(cx, cy) {
    const v = this.toVB(cx, cy), m = this.vbMap(0); if (!v || !m) return this.noPlantAt(cx, cy);
    const hw = 140 * Math.min(1, m.s / .62) * this.persp(v.y) * .42;
    for (const dx of [0, -hw, hw, -hw / 2, hw / 2]) { const r = this.noPlantAt(cx + dx, cy); if (r) return r; }
    return null;
  }
  flashNoPlant(e, why) {
    if (!this.hint) return;
    this.hint.textContent = this.noPlantMsg(why); this.noHint = true;
    this.hint.style.transform = 'translate(' + (e.clientX + 18) + 'px,' + (e.clientY + 22) + 'px)'; this.hint.dataset.shown = 'true';
    this.hint.animate([{ translate: '0 0' }, { translate: '-5px 0' }, { translate: '5px 0' }, { translate: '-3px 0' }, { translate: '0 0' }], { duration: 320 });
    clearTimeout(this.ht); this.ht = setTimeout(() => { this.hint.dataset.shown = 'false'; }, 1600);
  }
  setHint() {
    if (!this.hint || this.hintCustom) return;
    this.hint.textContent = this.homeEl ? 'click to grow a flower ✿' : 'place your home here ⌂';
  }
}
