/*
 * Planting: click to plant a tree / bush / flower, drag to sketch, and "garden in bloom" (lush) mode.
 *
 * One link in the page-logic class chain (see the script order at the bottom of index.html):
 *   GardenPlants extends GardenHome
 */
class GardenPlants extends GardenHome {
  startSketch(d) {
    const NS = 'http://www.w3.org/2000/svg';
    this.layer.style.pointerEvents = 'auto'; this.layer.style.cursor = document.body.style.cursor || 'default';
    document.documentElement.style.userSelect = 'none';
    if (window.getSelection) window.getSelection().removeAllRanges();
    const svg = document.createElementNS(NS, 'svg');
    svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible';
    this.sk = (this.sk || 0) + 1; const fid = 'pr' + this.sk;
    svg.innerHTML = '<defs><filter id="' + fid + '"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" result="n"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="1.8"></feDisplacementMap></filter></defs>';
    const mk = (w, op, dx) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#4A3C2C'); p.setAttribute('stroke-width', w); p.setAttribute('stroke-opacity', op); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); p.setAttribute('filter', 'url(#' + fid + ')'); if (dx) p.setAttribute('transform', 'translate(' + dx + ' ' + dx * .6 + ')'); svg.appendChild(p); return p; };
    d.paths = [mk(1.8, .85, 0), mk(.8, .4, 1)]; d.svg = svg;
    this.layer.appendChild(svg);
  }
  drawSketch(d) {
    const p = d.pts; let s = 'M' + p[0][0] + ' ' + p[0][1];
    for (let i = 1; i < p.length - 1; i++) s += ' Q' + p[i][0] + ' ' + p[i][1] + ' ' + (p[i][0] + p[i + 1][0]) / 2 + ' ' + (p[i][1] + p[i + 1][1]) / 2;
    const l = p[p.length - 1]; s += ' L' + l[0] + ' ' + l[1];
    d.paths.forEach(x => x.setAttribute('d', s));
  }
  endSketch(d) {
    this.layer.style.pointerEvents = 'none'; this.layer.style.cursor = '';
    document.documentElement.style.userSelect = '';
    d.svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1400, delay: 3500, fill: 'forwards' }).onfinish = () => d.svg.remove();
  }
  toggleLush(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const on = this.lush = !this.lush; document.querySelector('.garden-scene__lush-label').textContent = on ? 'back to your garden' : 'View Shreya’s garden in bloom'; this.lushLock(on); if (this.homeEl) { this.homeEl.style.visibility = on ? 'hidden' : ''; if (this.followHome) this.followHome(); this.homeExtras(); }
    const gs = this.gardenEl;
    if (!on) { if (!this.homeEl) this.stopFamily(); document.querySelectorAll('[data-garden] [data-lush]').forEach(n => { n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).onfinish = () => n.remove(); }); const L = this.lushLayer; this.lushLayer = null; if (L) L.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).onfinish = () => L.remove(); return; }
    const L = document.createElement('div'); L.className = 'garden-layer garden-layer--lush'; gs.appendChild(L); this.lushLayer = L;
    const m = this.vbMap(0); if (!m) return;
    const items = [];
    const hsc = Math.min(1, m.s / .62) * this.persp(620), hw = 140 * hsc / m.s, hh = 120 * hsc / m.s, hb = 620 + 10 / m.s;
    const hv = document.createElementNS('http://www.w3.org/2000/svg', 'g'); hv.innerHTML = this.homeSVG(); const hs = hv.firstElementChild;
    hs.setAttribute('x', (560 - hw / 2).toFixed(1)); hs.setAttribute('y', (hb - hh).toFixed(1)); hs.setAttribute('width', hw.toFixed(1)); hs.setAttribute('height', hh.toFixed(1)); hs.style.overflow = 'visible';
    hv.style.filter = 'drop-shadow(0 10px 12px rgba(46,36,24,.25))'; hv.style.pointerEvents = 'none'; hv.setAttribute('data-lush', '1'); this.depthInsert(hv, hb - 6 * hsc / m.s);
    setTimeout(() => { if (this.lushLayer === L) this.buildFamily(true, { x: 560, y: hb - 6 * hsc / m.s, hw }); }, 300);
    hv.animate(this.rm ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(-24px)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'both' });
    const pc = ['#F2B8C6', '#F7E2A6', '#D9C4E8', '#FFF6E4'];
    for (let p = 0; p < (this.rm ? 0 : 18); p++) { const d = document.createElement('div'); const sz = 5 + Math.random() * 5; d.style.cssText = 'position:absolute;top:-20px;left:' + (Math.random() * 100) + '%;width:' + sz + 'px;height:' + (sz * .7) + 'px;border-radius:60% 40% 60% 40%;background:' + pc[p % 4] + ';opacity:.85'; L.appendChild(d); d.animate([{ transform: 'translate(0,0) rotate(0deg)' }, { transform: 'translate(' + (60 - Math.random() * 120) + 'px,' + (gs.clientHeight * .5) + 'px) rotate(200deg)', offset: .5 }, { transform: 'translate(' + (40 - Math.random() * 80) + 'px,' + (gs.clientHeight + 40) + 'px) rotate(420deg)' }], { duration: 9000 + Math.random() * 7000, delay: Math.random() * 8000, iterations: Infinity, easing: 'linear' }); }
    items.push(...this.lushExtra());
    items.sort((a, b) => a[2] - b[2]).forEach(([k, x, y, s, t], i) => setTimeout(() => { if (this.lushLayer === L && y > 464 && !this.inWater(x, y) && !(this.padBox && x > this.padBox.Lx && x < this.padBox.Rx && y > this.padBox.B && y < this.padBox.F)) this.gardenPlant(m.x(x), m.y(y), { kind: k, layer: L, s, tint: t && t.length ? t : null, v: t && !t.length ? t.v : undefined }); }, Math.round(i * Math.min(38, 700 / Math.max(1, items.length)))));
  }
  lushExtra() {
    let a = 4021; const r = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const g = () => (r() + r() + r() - 1.5) / 1.5, pick = arr => arr[Math.floor(r() * arr.length)];
    const Y = ['#F2C84B', '#E3B23C'], W = ['#FFF6E4', '#F2EAD3'], P = ['#F2C7CF', '#E58FA3'], L = ['#C9B8E6', '#A996D6'], O = ['#E98A6A', '#F4B49A'], out = [];
    const add = (k, x, y, tint, v) => out.push([k, x, y, 1, tint || (v ? { v } : null)]);
    const wild = (cx, cy, spread, n, pal) => { for (let i = 0; i < n; i++) { const d = Math.abs(g()) * spread, ang = r() * Math.PI * 2; add(r() < .55 ? 'flowers' : 'meadow', cx + Math.cos(ang) * d * 1.4, cy + Math.sin(ang) * d * .45, r() < .8 ? pal : pick([W, Y, P, L])); } };
    const trees = [], free = (x, y, w) => trees.every(t => Math.abs(t.x - x) > (t.w + w) * .5 * this.persp(Math.max(t.y, y)) || Math.abs(t.y - y) > 140);
    const grove = (cx, cy, kinds, spread, pal) => { kinds.forEach((k, i) => { const v = .8 + r() * .35, w = (k === 'pine' ? 70 : 92) * v; let x = null, y = null; for (let tr = 0; tr < 30; tr++) { const tx = cx + g() * spread * 1.6, ty = cy + g() * spread * .2; if (free(tx, ty, w)) { x = tx; y = ty; break; } } if (x === null) return; trees.push({ x, y, w }); add(k, x, y, null, v); if (r() < .75) wild(x + g() * 12, y + 5, 30 + r() * 20, 4 + Math.floor(r() * 6), pal); });
      for (let i = 0, n = 2 + Math.floor(r() * 3); i < n; i++) add(pick(['bush', 'bloomBush', 'bush', 'hydrangea']), cx + g() * spread * 1.4, cy + 8 + Math.abs(g()) * 22, null, .75 + r() * .5); };
    grove(175, 508, ['tree', 'blossom', 'tree', 'pine'], 70, W);
    grove(1010, 490, ['tree', 'pine', 'blossom'], 60, L);
    grove(1405, 480, ['pine', 'tree'], 40, Y);
    grove(120, 892, ['tree', 'tree'], 70, Y);
    grove(1150, 902, ['blossom', 'tree'], 55, P);
    if (free(1550, 884, 80)) { trees.push({ x: 1550, y: 884, w: 80 }); add('pine', 1550, 884, null, 1.1); }
    for (let i = 0; i < 9; i++) { const x = 330 + r() * 480, y = 490 + r() * 22; if (r() < .6) add(pick(['bush', 'bloomBush', 'meadow', 'meadow']), x, y, pick([W, Y, P]), .7 + r() * .5); }
    [[105, 722], [215, 731], [318, 722], [400, 704], [436, 662], [36, 692]].forEach(([x, y]) => { if (r() < .8) { const n = 1 + Math.floor(r() * 3); for (let i = 0; i < n; i++) add('cattail', x + g() * 14, y + g() * 5, null, .75 + r() * .4); } if (r() < .7) wild(x + 10, y + 8, 18, 2 + Math.floor(r() * 3), pick([W, L])); });
    add('hydrangea', 470 + g() * 6, 621, null, .9); add('bloomBush', 498, 632, null, .7); wild(540, 640, 26, 5, P);
    wild(940, 640, 20, 4, Y);
    for (let i = 0; i < 7; i++) { const x = 380 + r() * 900, y = 690 + r() * 150; if (!(x > 1220 && x < 1520)) add(r() < .6 ? 'meadow' : 'flowers', x, y, pick([W, Y, W, P]), .7 + r() * .4); }
    return out;
  }
  lushLock(on) {
    document.querySelectorAll('[data-garden] svg[data-kind]:not([data-lush])').forEach(n => { n.style.display = on ? 'none' : ''; });
    const cap = document.querySelector('[data-g-cap]'); if (cap) cap.style.display = on ? 'none' : 'flex';
    if (this.hint) this.hint.dataset.shown = 'false';
    this.setCursor();
  }
  gardenPlant(x, y, opts) {
    const NS = 'http://www.w3.org/2000/svg';
    const rnd = (a, b) => a + Math.random() * (b - a), R = a => a[Math.floor(Math.random() * a.length)];
    this.flowerLayer();
    const gs = this.gardenEl; let top0 = 0;
    if (gs) { const rc = gs.getBoundingClientRect(); top0 = rc.top + window.scrollY; this.gLayer.style.top = '0px'; this.gLayer.style.height = rc.height + 'px'; }
    const vh = window.innerHeight, mm0 = this.vbMap(0), depth = (mm0 ? Math.min(1, mm0.s / .62) : 1) * ((opts && opts.s) || 1);
    const W = 300, H = 300, svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '-150 -270 300 300');
    const vb = this.toVB(x - window.scrollX, y - window.scrollY), inScene = !!(vb && mm0 && mm0.s > 0);
    const pf = inScene ? this.persp(vb.y) : 1; let rf = 1;
    if (inScene) { const kk = (opts && opts.layer && opts.s ? depth / opts.s : depth) * pf / mm0.s; svg.setAttribute('x', (vb.x - 150 * kk).toFixed(1)); svg.setAttribute('y', (vb.y - 270 * kk).toFixed(1)); svg.setAttribute('width', (W * kk).toFixed(1)); svg.setAttribute('height', (H * kk).toFixed(1)); svg.style.cssText = 'overflow:visible;pointer-events:none'; }
    else svg.style.cssText = 'position:absolute;overflow:visible;pointer-events:none;left:' + (x - W / 2) + 'px;top:' + (y - top0 - 270) + 'px;width:' + W + 'px;height:' + H + 'px;transform:scale(' + depth + ');transform-origin:50% 90%';
    let s = '';
    const blob = (cx, cy, rr, n, grad, spread) => { let o = ''; for (let i = 0; i < n; i++) o += '<circle cx="' + (cx + rnd(-spread, spread)).toFixed(1) + '" cy="' + (cy + rnd(-spread * .6, spread * .5)).toFixed(1) + '" r="' + (rr * rnd(.7, 1.05)).toFixed(1) + '" fill="url(#' + grad + ')"></circle>'; return o; };
    const specks = (cx, cy, sp, n, c, rr) => { let o = ''; for (let i = 0; i < n; i++) o += '<circle cx="' + (cx + rnd(-sp, sp)).toFixed(1) + '" cy="' + (cy + rnd(-sp * .6, sp * .5)).toFixed(1) + '" r="' + rnd(rr * .6, rr).toFixed(1) + '" fill="' + c + '"></circle>'; return o; };
    const shadow = (rx) => '<ellipse cx="4" cy="2" rx="' + rx + '" ry="' + (rx * .2) + '" fill="rgba(70,55,30,.3)" filter="url(#gBlur)"></ellipse>';
    const kinds = ['bush', 'bloomBush', 'tree', 'pine', 'flowers', 'cattail', 'meadow', 'hydrangea'];
    const groups = { tree: ['tree', 'pine'], bush: ['bush', 'bloomBush', 'hydrangea'], flower: ['flowers', 'meadow', 'cattail'] };
    let pool; if (opts && opts.kind) pool = [opts.kind]; else if (groups[this.plantPick]) pool = groups[this.plantPick]; else { const seq = ['tree', 'tree', 'bush', 'bush', 'flower', 'flower', 'flower'], si = this.seqI || 0; this.seqI = si + 1; pool = groups[seq[si % 7]]; }
    let k = R(pool); if (pool.length > 1) while (k === this.lastGP) k = R(pool); this.lastGP = k;
    if (k === 'bush' || k === 'bloomBush') {
      const rr = rnd(20, 27), g = R(['gBush', 'gBush2']);
      s += shadow(rr * 2.1) + '<g filter="url(#gPaint)">' + blob(0, -rr * .9, rr, 12, g, rr * .9) + '<circle cx="' + (-rr * .4) + '" cy="' + (-rr * 1.5) + '" r="' + rr * .8 + '" fill="rgba(255,240,190,.25)"></circle></g>';
      s += specks(0, -rr, rr * 1.3, 8, 'rgba(255,250,215,.55)', 3) + specks(0, -rr * .8, rr * 1.2, 7, 'rgba(50,62,28,.45)', 1.9);
      if (k === 'bloomBush') { const c = R([['#E98A6A', '#F4B49A'], ['#F2C7CF', '#E58FA3'], ['#FFF6E4', '#F3D9A8']]); for (let i = 0; i < 14; i++) s += '<circle cx="' + rnd(-rr * 1.3, rr * 1.3).toFixed(1) + '" cy="' + (-rr * .9 + rnd(-rr * .8, rr * .5)).toFixed(1) + '" r="' + rnd(2.2, 4).toFixed(1) + '" fill="' + R(c) + '"></circle>'; }
    } else if (k === 'hydrangea') {
      const rr = rnd(17, 21);
      s += shadow(rr * 2) + '<g filter="url(#gPaint)">' + blob(0, -rr * .7, rr, 9, 'gBush', rr * .9) + '</g>';
      const c = R([['#B9C3E6', '#9FA9D9', '#D7DCF2'], ['#E8B3C6', '#D990AC', '#F3D3DE']]);
      [[-rr * .8, -rr * 1.4], [rr * .7, -rr * 1.6], [0, -rr * 2.1], [rr * 1.3, -rr * .9]].forEach(([hx, hy]) => { s += '<g filter="url(#gPaint)">'; for (let i = 0; i < 9; i++) s += '<circle cx="' + (hx + rnd(-8, 8)).toFixed(1) + '" cy="' + (hy + rnd(-6, 6)).toFixed(1) + '" r="' + rnd(3.5, 5.6).toFixed(1) + '" fill="' + R(c) + '"></circle>'; s += '</g>'; });
    } else if (k === 'pebble') {
      s += shadow(34);
      const n = 2 + Math.floor(rnd(0, 2.99)), ps = [];
      for (let i = 0; i < n; i++) ps.push([i ? rnd(-30, 30) : 0, i ? rnd(-3, 7) : -4, i ? rnd(10, 17) : rnd(22, 30)]);
      ps.sort((a, b) => a[1] - b[1]).forEach(([px, py, rx]) => { const ry = rx * rnd(.42, .55), rot = rnd(-15, 15);
        s += '<g transform="translate(' + px.toFixed(1) + ' ' + py.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')"><ellipse cx="2" cy="' + (ry * .6).toFixed(1) + '" rx="' + (rx * 1.05).toFixed(1) + '" ry="' + (ry * .6).toFixed(1) + '" fill="rgba(110,80,50,.28)" filter="url(#gBlur)"></ellipse><g filter="url(#gPaint)"><path d="M' + (-rx) + ' 0 C' + (-rx * .95) + ' ' + (-ry * 1.1) + ' ' + rx * .6 + ' ' + (-ry * 1.15) + ' ' + rx + ' ' + (-ry * .2) + ' C' + rx * 1.1 + ' ' + ry * .9 + ' ' + (-rx * .4) + ' ' + ry + ' ' + (-rx) + ' 0Z" fill="url(#gStone)"></path><path d="M' + (-rx * .6) + ' ' + (-ry * .45) + ' C' + (-rx * .2) + ' ' + (-ry * .8) + ' ' + rx * .3 + ' ' + (-ry * .8) + ' ' + rx * .6 + ' ' + (-ry * .4) + '" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2" stroke-linecap="round"></path></g></g>'; });
    } else if (k === 'tree') {
      const th = rnd(110, 150), rr = rnd(32, 40);
      s += shadow(rr * 2.4) + '<path d="M-5 0 C-3 ' + (-th * .4) + ' 2 ' + (-th * .7) + ' 0 ' + (-th) + ' L6 ' + (-th) + ' C7 ' + (-th * .6) + ' 6 ' + (-th * .3) + ' 7 0Z" fill="#6E4F33"></path><path d="M2 ' + (-th * .55) + ' q14 -10 22 -30 M1 ' + (-th * .7) + ' q-14 -8 -20 -24" stroke="#6E4F33" stroke-width="4" fill="none" stroke-linecap="round"></path>';
      s += '<g filter="url(#gPaint)">' + blob(0, -th - rr * .3, rr, 16, 'gTree', rr * 1.1) + '<circle cx="' + (-rr * .5) + '" cy="' + (-th - rr * .9) + '" r="' + rr * .9 + '" fill="rgba(255,240,190,.28)"></circle></g>' + specks(0, -th - rr * .2, rr * 1.4, 9, 'rgba(45,58,25,.45)', 2.8);
    } else if (k === 'pine') {
      const th = rnd(130, 170), w = rnd(34, 42);
      s += shadow(w * 1.5) + '<rect x="-4" y="-24" width="8" height="26" fill="#5E432B"></rect><g filter="url(#gPaint)">';
      for (let j = 0; j < 4; j++) { const y0 = -18 - j * th * .21, ww = w * (1 - j * .2), hh = th * .38; s += '<path d="M' + (-ww).toFixed(1) + ' ' + y0.toFixed(1) + ' Q0 ' + (y0 + 6).toFixed(1) + ' ' + ww.toFixed(1) + ' ' + y0.toFixed(1) + ' L0 ' + (y0 - hh).toFixed(1) + 'Z" fill="' + ['#4A6639', '#567543', '#62844C', '#729456'][j] + '"></path>'; }
      s += '</g>' + specks(0, -th * .45, w * .6, 8, 'rgba(255,250,215,.3)', 2.2);
    } else if (k === 'blossom') {
      const th = rnd(95, 120), rr = rnd(30, 36);
      s += shadow(rr * 2.2) + '<path d="M-5 0 C-2 ' + (-th * .4) + ' -8 ' + (-th * .7) + ' -2 ' + (-th) + ' L4 ' + (-th) + ' C2 ' + (-th * .6) + ' 8 ' + (-th * .3) + ' 6 0Z" fill="#5A3E2E"></path><path d="M0 ' + (-th * .6) + ' q-16 -8 -26 -26 M1 ' + (-th * .75) + ' q16 -6 24 -22" stroke="#5A3E2E" stroke-width="3.5" fill="none" stroke-linecap="round"></path><g filter="url(#gPaint)">';
      for (let i = 0; i < 16; i++) s += '<circle cx="' + rnd(-rr * 1.2, rr * 1.2).toFixed(1) + '" cy="' + (-th - rr * .2 + rnd(-rr * .7, rr * .5)).toFixed(1) + '" r="' + (rr * rnd(.5, .8)).toFixed(1) + '" fill="' + R(['#F2C7CF', '#E8A7B8', '#F7DCE1', '#EDB6C4']) + '"></circle>';
      s += '</g>' + specks(0, -th - rr * .2, rr * 1.2, 10, 'rgba(255,255,255,.6)', 2.4) + specks(0, 4, 30, 8, '#F2C7CF', 2);
    } else if (k === 'flowers') {
      const c = opts && opts.tint ? opts.tint : R([['#E98A6A', '#D9533A'], ['#F2C84B', '#E3A82F'], ['#F2C7CF', '#E58FA3'], ['#FFF6E4', '#F0E0B8']]);
      for (let i = 0; i < 9; i++) { const sx = rnd(-22, 22), h = rnd(32, 60), cx = sx + rnd(-6, 6); s += '<path d="M' + sx.toFixed(1) + ' 0 q' + rnd(-6, 6).toFixed(1) + ' ' + (-h / 2).toFixed(1) + ' ' + (cx - sx).toFixed(1) + ' ' + (-h).toFixed(1) + '" stroke="#5E7040" stroke-width="1.6" fill="none"></path><circle cx="' + cx.toFixed(1) + '" cy="' + (-h).toFixed(1) + '" r="' + rnd(4.5, 6.5).toFixed(1) + '" fill="' + R(c) + '"></circle>'; }
      for (let i = 0; i < 3; i++) { const bx = rnd(-20, 20), w = rnd(.8, 1.2); s += '<path d="M' + bx + ' 0 q-3 -11 -9 -19 M' + (bx + 3) + ' 0 q0 -14 3 -24 M' + (bx + 6) + ' 0 q4 -10 11 -16 M' + (bx - 3) + ' 0 q-6 -6 -14 -10" stroke="#55663A" stroke-width="' + (1.6 * w) + '" fill="none" stroke-linecap="round"></path>'; }
    } else if (k === 'cattail') {
      for (let i = 0; i < 6; i++) { const sx = -18 + i * 7 + rnd(-2, 2), h = rnd(60, 90), bend = rnd(-8, 8); s += '<path d="M' + sx.toFixed(1) + ' 0 q' + bend.toFixed(1) + ' ' + (-h / 2).toFixed(1) + ' ' + (bend * .4).toFixed(1) + ' ' + (-h).toFixed(1) + '" stroke="#5E7040" stroke-width="1.8" fill="none"></path>'; if (i % 2 === 0) s += '<rect x="' + (sx + bend * .4 - 2.5).toFixed(1) + '" y="' + (-h - 4).toFixed(1) + '" width="5" height="16" rx="2.5" fill="#C97B3A"></rect>'; }
      s += '<path d="M-24 0 q6 -14 4 -34 M-14 0 q-8 -10 -20 -16 M12 0 q10 -10 20 -14 M18 0 q2 -16 -4 -30 M0 0 q-4 -18 -10 -26" stroke="#55663A" stroke-width="1.6" fill="none" stroke-linecap="round"></path>';
    } else {
      for (let i = 0; i < 16; i++) { const sx = rnd(-34, 34), h = rnd(18, 40); s += '<path d="M' + sx.toFixed(1) + ' 0 q' + rnd(-4, 4).toFixed(1) + ' ' + (-h * .6).toFixed(1) + ' ' + rnd(-10, 10).toFixed(1) + ' ' + (-h).toFixed(1) + '" stroke="' + R(['#55663A', '#6E8048', '#8C9A55']) + '" stroke-width="1.4" fill="none" stroke-linecap="round"></path>'; }
      for (let i = 0; i < 7; i++) s += '<circle cx="' + rnd(-30, 30).toFixed(1) + '" cy="' + (-rnd(20, 42)).toFixed(1) + '" r="' + rnd(2.2, 3.6).toFixed(1) + '" fill="' + R(opts && opts.tint ? opts.tint : ['#FFF6E4', '#F2C84B', '#E98A6A', '#B9C3E6']) + '"></circle>';
    }
    rf = { tree: .78, pine: 1.1, blossom: .6, bush: .6, bloomBush: .6, hydrangea: .58, flowers: .38, meadow: .43, cattail: .48, pebble: .35 }[k] || 1;
    if (inScene) { const kk = (opts && opts.layer && opts.s ? depth / opts.s : depth) * pf * rf * ((opts && opts.v) || 1) / mm0.s; svg.setAttribute('x', (vb.x - 150 * kk).toFixed(1)); svg.setAttribute('y', (vb.y - 270 * kk).toFixed(1)); svg.setAttribute('width', (W * kk).toFixed(1)); svg.setAttribute('height', (H * kk).toFixed(1)); }
    const g = document.createElementNS(NS, 'g'); g.innerHTML = s; svg.appendChild(g);
    svg.setAttribute('data-no-bloom', '1'); svg.dataset.kind = k;
    g.style.pointerEvents = 'auto'; g.style.cursor = 'default';
    g.style.transformBox = 'fill-box'; g.style.transformOrigin = '50% 100%';
    if (this.rm) g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out', fill: 'both' }); else g.animate([{ transform: 'scale(.2,0)', opacity: 0 }, { transform: 'scale(1.06,1.08)', opacity: 1, offset: .65 }, { transform: 'scale(1,1)', opacity: 1 }], { duration: 750, easing: 'cubic-bezier(.3,1.2,.5,1)', fill: 'both' });
    if (opts && opts.layer) { g.style.pointerEvents = 'none'; svg.removeAttribute('data-no-bloom'); if (inScene) { svg.setAttribute('data-lush', '1'); this.depthInsert(svg, vb.y); } else opts.layer.appendChild(svg); return svg; }
    if (inScene) this.depthInsert(svg, vb.y); else this.gLayer.appendChild(svg);
    const bb = g.getBBox(), rm = document.createElementNS(NS, 'g');
    rm.setAttribute('transform', 'translate(' + (bb.x + bb.width - 2).toFixed(1) + ' ' + (bb.y + 4).toFixed(1) + ') scale(' + (1 / (depth * pf * rf)).toFixed(2) + ')');
    rm.setAttribute('class', 'garden-plant__remove');   // shows while the plant is hovered (style.css)
    rm.innerHTML = '<circle class="garden-plant__remove-disc" r="11"></circle><path class="garden-plant__remove-x" d="M-4 -4 L4 4 M4 -4 L-4 4"></path>';
    svg.appendChild(rm);
    rm.addEventListener('pointerdown', ev => ev.stopPropagation());
    const placeRm = ev => { if (parseFloat(getComputedStyle(rm).opacity) > .05) return; const M = svg.getScreenCTM(); if (!M) return; const pt = new DOMPoint(ev.clientX + 16, ev.clientY - 16).matrixTransform(M.inverse()); rm.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ') scale(' + (1 / (depth * pf * rf)).toFixed(2) + ')'); };
    g.addEventListener('mouseenter', placeRm);
    rm.addEventListener('click', ev => { ev.stopPropagation(); rm.style.pointerEvents = 'none'; g.animate([{ transform: 'scale(1,1)', opacity: 1 }, { transform: 'scale(.3,.1)', opacity: 0 }], { duration: 300, easing: 'ease-in', fill: 'forwards' }).onfinish = () => svg.remove(); });
    g.addEventListener('pointerdown', ev => ev.stopPropagation());
    const planted = [...document.querySelectorAll('[data-garden] svg[data-kind]:not([data-lush])')]; if (planted.length > 40) planted[0].remove();
  }
}
