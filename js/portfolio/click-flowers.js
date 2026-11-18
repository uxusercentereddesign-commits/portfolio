/*
 * Click flowers: draws a little SVG plant that pops up wherever you click.
 *
 * One link in the page-logic class chain (see the script order at the bottom of index.html):
 *   ClickFlowers extends Portfolio
 */
class ClickFlowers extends Portfolio {
  // the layer kept flowers and plants are drawn on (made the first time it's needed)
  flowerLayer() {
    if (!this.gLayer) { this.gLayer = document.createElement('div'); this.gLayer.className = 'garden-layer garden-layer--flowers'; this.gardenEl.appendChild(this.gLayer); }
    return this.gLayer;
  }
  bloom(x, y, keep) {
    const NS = 'http://www.w3.org/2000/svg';
    const rnd = (a, b) => a + Math.random() * (b - a);
    const R = a => a[Math.floor(Math.random() * a.length)];
    const INK = '#2A2620', W = 320, HT = 300;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', (-W / 2) + ' ' + (-HT + 30) + ' ' + W + ' ' + HT);
    svg.style.cssText = 'position:absolute;left:' + (x - W / 2) + 'px;top:' + (y - HT + 30) + 'px;width:' + W + 'px;height:' + HT + 'px;overflow:visible';
    this.fc = (this.fc || 0) + 1; const fid = 'rough' + this.fc;
    svg.innerHTML = '<defs><filter id="' + fid + '" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="' + Math.floor(rnd(1, 99)) + '" result="n"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"></feDisplacementMap></filter></defs>';
    const sc = rnd(.85, 1.08), flip = Math.random() < .5 ? -1 : 1;
    const root = document.createElementNS(NS, 'g');
    root.setAttribute('filter', 'url(#' + fid + ')'); root.setAttribute('transform', 'scale(' + sc * flip + ' ' + sc + ')');
    svg.appendChild(root);
    const P = (d, o = {}) => {
      const g = o.g || root, at = o.at || 0, dur = o.dur || 450;
      if (o.fill) {
        const w = document.createElementNS(NS, 'path'); w.setAttribute('d', d); w.setAttribute('fill', o.fill);
        w.setAttribute('transform', (o.tf || '') + ' translate(1.4 -1)'); g.appendChild(w);
        w.animate([{ opacity: 0 }, { opacity: o.fo || .55 }], { duration: 700, delay: at + dur * .5, fill: 'both' });
      }
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d); p.setAttribute('pathLength', '1'); p.setAttribute('fill', 'none');
      p.setAttribute('stroke', o.c || INK); p.setAttribute('stroke-width', o.w || 1.15);
      p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
      if (o.op) p.setAttribute('stroke-opacity', o.op);
      if (o.tf) p.setAttribute('transform', o.tf);
      p.style.strokeDasharray = '1';
      g.appendChild(p);
      p.animate([{ strokeDashoffset: 1, opacity: 0 }, { opacity: 1, offset: .02 }, { strokeDashoffset: 0, opacity: 1 }], { duration: dur, delay: at, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'both' });
      return p;
    };
    const G = (tf, g) => { const e = document.createElementNS(NS, 'g'); e.setAttribute('transform', tf); (g || root).appendChild(e); return e; };
    const dot = (cx, cy, r, c, at, g) => { const e = document.createElementNS(NS, 'circle'); e.setAttribute('cx', cx); e.setAttribute('cy', cy); e.setAttribute('r', r); e.setAttribute('fill', c); (g || root).appendChild(e); e.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: at, fill: 'both' }); };
    const cubic = (p0, p1, p2, p3) => ({
      d: 'M' + p0[0] + ' ' + p0[1] + ' C' + p1[0] + ' ' + p1[1] + ' ' + p2[0] + ' ' + p2[1] + ' ' + p3[0] + ' ' + p3[1],
      at: t => { const u = 1 - t, bz = i => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i], db = i => 3 * u * u * (p1[i] - p0[i]) + 6 * u * t * (p2[i] - p1[i]) + 3 * t * t * (p3[i] - p2[i]); return { x: bz(0), y: bz(1), a: Math.atan2(db(1), db(0)) * 180 / Math.PI + 90 }; }
    });
    const stem = (s, at, dur, w) => { P(s.d, { at, dur, w: w || 1.3 }); P(s.d, { at: at + 120, dur, w: .6, op: .45, tf: 'translate(1.3 0)' }); };
    const leaf = (x, y, rot, len, wid, at, fill, parent) => {
      const g = G('translate(' + x + ' ' + y + ') rotate(' + rot + ')', parent);
      P('M0 0 C' + wid + ' ' + (-len * .12) + ' ' + wid * 1.15 + ' ' + (-len * .62) + ' ' + wid * .1 + ' ' + (-len) + ' C' + (-wid * .7) + ' ' + (-len * .7) + ' ' + (-wid * 1.05) + ' ' + (-len * .22) + ' 0 0', { g, at, dur: 520, w: 1.05, fill: fill || '#A7C49A' });
      P('M0 -2 Q' + wid * .25 + ' ' + (-len * .5) + ' ' + wid * .08 + ' ' + (-len * .9), { g, at: at + 300, dur: 360, w: .6, op: .8 });
      const n = len > 30 ? 3 : 2;
      for (let i = 1; i <= n; i++) {
        const yy = -len * i / (n + 1.3);
        P('M' + wid * .05 + ' ' + yy + ' q' + wid * .45 + ' ' + (-len * .05) + ' ' + wid * .7 + ' ' + (-len * .17), { g, at: at + 480 + i * 50, dur: 160, w: .5, op: .7 });
        P('M' + wid * .05 + ' ' + (yy - 2) + ' q' + (-wid * .45) + ' ' + (-len * .05) + ' ' + (-wid * .65) + ' ' + (-len * .16), { g, at: at + 500 + i * 50, dur: 160, w: .5, op: .7 });
      }
    };
    const petal = (g, rot, len, wid, at, fill, o = {}) => {
      const b = o.base || 0;
      const tip = o.notch ? 'L' + wid * .1 + ' ' + (-len) + ' L0 ' + (-len * .93) + ' L' + (-wid * .1) + ' ' + (-len) + ' L' + (-wid * .35) + ' ' + (-len * .93) : 'Q0 ' + (-len * 1.06) + ' ' + (-wid * .35) + ' ' + (-len * .93);
      const d = 'M0 ' + (-b) + ' C' + wid * .55 + ' ' + (-b - 3) + ' ' + wid * 1.05 + ' ' + (-len * .5) + ' ' + wid * .35 + ' ' + (-len * .93) + ' ' + tip + ' C' + (-wid * 1.05) + ' ' + (-len * .5) + ' ' + (-wid * .55) + ' ' + (-b - 3) + ' 0 ' + (-b);
      P(d, { g, tf: 'rotate(' + rot + ')', at, dur: o.dur || 380, w: o.w || 1, fill, fo: o.fo });
      if (o.vein !== false) P('M0 ' + (-b - 2) + ' Q' + wid * .12 + ' ' + (-len * .5) + ' 0 ' + (-len * .78), { g, tf: 'rotate(' + rot + ')', at: at + 250, dur: 260, w: .5, op: .6 });
    };
    const ground = () => {
      P('M-22 1 q10 -1.5 20 0 t22 0', { dur: 400, w: .8, op: .6 });
      for (let i = 0; i < 4; i++) { const gx = rnd(-18, 18); P('M' + gx + ' 1 q' + rnd(-2, 2) + ' -4 ' + rnd(-4, 4) + ' ' + (-rnd(5, 9)), { at: 100 + i * 60, dur: 200, w: .7, op: .7 }); }
    };
    const all = ['lily', 'cactus', 'sunflower', 'tulip', 'daisy', 'rose', 'lavender', 'bells'];
    let sp = R(all); while (sp === this.lastSp) sp = R(all); this.lastSp = sp;
    if (sp === 'lily') {
      const H = rnd(155, 185), ex = rnd(-10, 25);
      const s = cubic([0, 0], [rnd(-14, 6), -H * .35], [ex - rnd(10, 25), -H * .75], [ex, -H]);
      ground(); stem(s, 0, 900);
      [.18, .32, .46, .6].forEach((t, i) => { const q = s.at(t), sd = i % 2 ? 1 : -1; leaf(q.x, q.y, q.a + sd * rnd(28, 42), rnd(32, 42), 5.5, 400 + i * 120); });
      const bq = s.at(.72), bs = cubic([bq.x, bq.y], [bq.x - 8, bq.y - 10], [bq.x - 20, bq.y - 16], [bq.x - 26, bq.y - 30]);
      P(bs.d, { at: 900, dur: 300, w: 1 });
      const be = bs.at(1);
      P('M0 0 C5 -4 6 -16 0 -26 C-6 -16 -5 -4 0 0', { g: G('translate(' + be.x + ' ' + be.y + ') rotate(' + be.a + ')'), at: 1150, dur: 400, w: 1, fill: '#D9E3C4' });
      const top = s.at(1), g = G('translate(' + top.x + ' ' + top.y + ') rotate(' + (top.a + rnd(35, 55)) + ')');
      const pc = R(['#F2B8C6', '#F6D2DA', '#F3E3D0']);
      [-78, -48, -16, 16, 48, 78].forEach((r, i) => petal(g, r, rnd(44, 52), 11, 1100 + i * 110, pc, { base: 2, fo: .6 }));
      for (let i = 0; i < 14; i++) { const r = R([-48, -16, 16, 48]) * Math.PI / 180, l = rnd(10, 26); dot(Math.sin(r) * l + rnd(-2, 2), -Math.cos(r) * l, .9, '#9E3B5A', 1900 + i * 30, g); }
      [-22, -8, 6, 20].forEach((r, i) => { const a = r * Math.PI / 180, ax = Math.sin(a) * 36, ay = -Math.cos(a) * 36; P('M0 -3 Q' + ax * .3 + ' ' + ay * .6 + ' ' + ax + ' ' + ay, { g, at: 1800 + i * 80, dur: 300, w: .6 }); P('M' + (ax - 2.5) + ' ' + ay + ' a2.5 1.2 ' + r + ' 1 0 5 0 a2.5 1.2 ' + r + ' 1 0 -5 0', { g, at: 2050 + i * 80, dur: 200, w: .8, fill: '#B8642E', fo: .8 }); });
    } else if (sp === 'sunflower') {
      const H = rnd(160, 190), ex = rnd(-8, 8);
      const s = cubic([0, 0], [3, -H * .3], [ex - 4, -H * .7], [ex, -H]);
      ground(); P(s.d, { dur: 900, w: 1.3 }); P(s.d, { at: 80, dur: 900, w: 1.1, tf: 'translate(3.2 0)' });
      const q1 = s.at(.3), q2 = s.at(.52), q3 = s.at(.74);
      leaf(q1.x, q1.y, -62, 48, 20, 500, '#9FBF86'); leaf(q2.x + 3, q2.y, 58, 44, 18, 650, '#9FBF86'); leaf(q3.x, q3.y, -50, 30, 12, 800, '#9FBF86');
      const top = s.at(1), g = G('translate(' + top.x + ' ' + (top.y - 4) + ') rotate(' + rnd(-18, 18) + ') scale(1 .86)');
      for (let i = 0; i < 20; i++) petal(g, i * 18 + 9, 38, 7, 1000 + i * 28, '#E3A82F', { base: 14, fo: .7, dur: 300, vein: false });
      for (let i = 0; i < 20; i++) petal(g, i * 18, 33, 7.5, 1250 + i * 28, '#F2CB55', { base: 13, fo: .75, dur: 300 });
      P('M-16 0 A16 16 0 1 0 16 0 A16 16 0 1 0 -16 0', { g, at: 950, dur: 500, w: 1.1, fill: '#6E4A26', fo: .85 });
      for (let i = 0; i < 46; i++) { const a = i * 2.39996, r = 1.2 + Math.sqrt(i) * 2.1; dot(Math.cos(a) * r, Math.sin(a) * r, .85, i % 3 ? '#2A1A0C' : '#B98A3E', 1700 + i * 14, g); }
    } else if (sp === 'cactus') {
      const potC = R(['#D08A5E', '#C9B8A4', '#9DB2D6']);
      P('M-24 0 L-20 -30 L20 -30 L24 0 Z', { dur: 600, w: 1.15, fill: potC, fo: .6 });
      P('M-27 -30 L27 -30 L27 -38 L-27 -38 Z', { at: 250, dur: 450, w: 1.15, fill: potC, fo: .75 });
      for (let i = 0; i < 6; i++) P('M' + (-14 + i * 6) + ' -4 l4 -6', { at: 500 + i * 40, dur: 120, w: .5, op: .55 });
      const g = G('translate(0 -38)');
      if (Math.random() < .5) {
        const ch = rnd(70, 95);
        P('M-12 0 L-12 ' + (-ch + 12) + ' C-12 ' + (-ch - 4) + ' 12 ' + (-ch - 4) + ' 12 ' + (-ch + 12) + ' L12 0', { g, at: 500, dur: 800, w: 1.2, fill: '#8DB385', fo: .55 });
        const aL = -ch * rnd(.35, .45), aR = -ch * rnd(.5, .6);
        P('M-12 ' + aL + ' C-26 ' + aL + ' -27 ' + (aL - 4) + ' -27 ' + (aL - 14) + ' L-27 ' + (aL - 30) + ' C-27 ' + (aL - 39) + ' -18 ' + (aL - 39) + ' -18 ' + (aL - 30) + ' L-18 ' + (aL - 14) + ' C-18 ' + (aL - 10) + ' -15 ' + (aL - 9) + ' -12 ' + (aL - 9), { g, at: 1050, dur: 550, w: 1.1, fill: '#8DB385', fo: .55 });
        P('M12 ' + aR + ' C25 ' + aR + ' 26 ' + (aR - 4) + ' 26 ' + (aR - 12) + ' L26 ' + (aR - 24) + ' C26 ' + (aR - 32) + ' 18 ' + (aR - 32) + ' 18 ' + (aR - 24) + ' L18 ' + (aR - 12) + ' C18 ' + (aR - 9) + ' 15 ' + (aR - 8) + ' 12 ' + (aR - 8), { g, at: 1200, dur: 550, w: 1.1, fill: '#8DB385', fo: .55 });
        [-5, 0, 5].forEach((rx, i) => P('M' + rx + ' -2 L' + rx + ' ' + (-ch + (i === 1 ? 2 : 8)), { g, at: 900 + i * 80, dur: 600, w: .55, op: .55 }));
        for (let i = 0; i < 16; i++) { const yy = -6 - Math.random() * (ch - 12), xx = R([-12, -5, 5, 12]), s2 = xx < 0 ? -1 : 1; P('M' + xx + ' ' + yy + ' l' + s2 * 3.5 + ' -1.5 M' + xx + ' ' + yy + ' l' + s2 * 3 + ' 1.5', { g, at: 1500 + i * 35, dur: 120, w: .5 }); }
        const fg = G('translate(0 ' + (-ch - 1) + ')', g);
        for (let i = 0; i < 7; i++) petal(fg, -72 + i * 24, 13, 4.5, 1900 + i * 60, '#EE8FA8', { fo: .7, dur: 220, vein: false });
        dot(0, -1, 2, '#B98A3E', 2300, fg);
      } else {
        const pad = (cx, cy, rx, ry, rot, at) => {
          const pg = G('translate(' + cx + ' ' + cy + ') rotate(' + rot + ')', g);
          P('M0 0 C' + rx * 1.1 + ' ' + (-ry * .1) + ' ' + rx * 1.05 + ' ' + (-ry * 1.9) + ' 0 ' + (-ry * 2) + ' C' + (-rx * 1.05) + ' ' + (-ry * 1.9) + ' ' + (-rx * 1.1) + ' ' + (-ry * .1) + ' 0 0', { g: pg, at, dur: 600, w: 1.15, fill: '#94B98A', fo: .55 });
          for (let i = 0; i < 7; i++) { const px = rnd(-rx * .6, rx * .6), py = -rnd(ry * .3, ry * 1.7); dot(px, py, .8, INK, at + 500 + i * 40, pg); P('M' + px + ' ' + py + ' l-2 -2 M' + px + ' ' + py + ' l2 -2.4', { g: pg, at: at + 520 + i * 40, dur: 100, w: .45 }); }
          return pg;
        };
        pad(0, 0, 17, 26, rnd(-6, 6), 500);
        const p2 = pad(-10, -44, 12, 19, -28, 1000), p3 = pad(10, -46, 13, 20, 24, 1150);
        [p2, p3].forEach((pp, k) => { const fg = G('translate(0 -39)', pp); const fc = R(['#F2C84B', '#EE8FA8']); for (let i = 0; i < 6; i++) petal(fg, -60 + i * 24, 11, 4.5, 1800 + k * 200 + i * 50, fc, { fo: .75, dur: 200, vein: false }); });
      }
    } else if (sp === 'tulip') {
      const H = rnd(130, 160), ex = rnd(-30, 30);
      const s = cubic([0, 0], [ex * .1, -H * .4], [ex * .6, -H * .8], [ex, -H]);
      ground(); stem(s, 0, 850);
      P('M0 0 C-12 -20 -26 -50 -18 -92 C-14 -60 -6 -30 2 -4', { at: 350, dur: 700, w: 1.1, fill: '#A3C295' });
      P('M-1 -6 C-10 -30 -16 -55 -17 -86', { at: 800, dur: 400, w: .55, op: .7 });
      P('M2 0 C14 -18 28 -42 34 -70 C24 -52 12 -30 -1 -4', { at: 500, dur: 650, w: 1.1, fill: '#9DBF8E' });
      const top = s.at(1), g = G('translate(' + top.x + ' ' + top.y + ') rotate(' + top.a * .6 + ')');
      const c = R([['#E46A6A', '#B23A48'], ['#F2A65A', '#B5622A'], ['#D98BC9', '#8E4A86'], ['#F4D35E', '#B58A1E']]);
      P('M0 2 C-14 0 -20 -14 -15 -36 C-8 -30 -4 -30 0 -38 C4 -30 8 -30 15 -36 C20 -14 14 0 0 2 Z', { g, at: 900, dur: 700, w: 1.1, fill: c[0], fo: .55 });
      P('M0 2 C-9 -6 -10 -24 -6 -40 C-2 -34 2 -34 6 -40 C10 -24 9 -6 0 2', { g, at: 1350, dur: 600, w: 1, fill: c[0], fo: .35 });
      [-9, 0, 9].forEach((vx, i) => P('M' + vx * .3 + ' 0 Q' + vx + ' -16 ' + vx * 1.1 + ' -30', { g, at: 1700 + i * 80, dur: 300, w: .5, c: c[1], op: .7 }));
    } else if (sp === 'daisy') {
      const H = rnd(130, 160);
      const s = cubic([0, 0], [rnd(-8, 8), -H * .35], [rnd(-15, 15), -H * .7], [rnd(-12, 12), -H]);
      ground(); stem(s, 0, 850, 1.1);
      const b1q = s.at(.45), b1 = cubic([b1q.x, b1q.y], [b1q.x - 10, b1q.y - 12], [b1q.x - 26, b1q.y - 24], [b1q.x - rnd(32, 42), b1q.y - rnd(40, 55)]);
      const b2q = s.at(.62), b2 = cubic([b2q.x, b2q.y], [b2q.x + 8, b2q.y - 8], [b2q.x + 20, b2q.y - 14], [b2q.x + rnd(26, 34), b2q.y - rnd(22, 34)]);
      P(b1.d, { at: 500, dur: 500, w: .95 }); P(b2.d, { at: 650, dur: 450, w: .95 });
      [.2, .36].forEach((t, i) => { const q = s.at(t); leaf(q.x, q.y, q.a + (i ? 40 : -40), 22, 4, 400 + i * 120); });
      [[s.at(1), 20, 0], [b1.at(1), 15, 1], [b2.at(1), 11, 2]].forEach(([q, r, k]) => {
        const g = G('translate(' + q.x + ' ' + q.y + ') rotate(' + q.a * .5 + ') scale(1 ' + (k === 2 ? .45 : rnd(.75, 1)) + ')');
        const at0 = 1000 + k * 250;
        for (let i = 0; i < 16; i++) petal(g, i * 22.5 + rnd(-4, 4), r * rnd(.9, 1.05), r * .2, at0 + i * 30, '#FFFDF7', { base: r * .22, fo: .9, dur: 220, vein: false, w: .9 });
        const cr = r * .26;
        P('M' + (-cr) + ' 0 A' + cr + ' ' + cr + ' 0 1 0 ' + cr + ' 0 A' + cr + ' ' + cr + ' 0 1 0 ' + (-cr) + ' 0', { g, at: at0 + 400, dur: 300, w: .9, fill: '#B98A3E', fo: .85 });
      });
    } else if (sp === 'rose') {
      const H = rnd(140, 170), ex = rnd(-20, 20);
      const s = cubic([0, 0], [rnd(-10, 10), -H * .35], [ex + rnd(-15, 15), -H * .7], [ex, -H]);
      ground(); stem(s, 0, 900, 1.25);
      [.15, .3, .5, .66, .82].forEach((t, i) => { const q = s.at(t), sd = i % 2 ? 1 : -1; P('M0 0 l' + sd * 4 + ' -3 l' + (-sd * 3.5) + ' -2', { g: G('translate(' + q.x + ' ' + q.y + ') rotate(' + q.a + ')'), at: 600 + i * 60, dur: 150, w: .8 }); });
      [[.42, 50], [.64, -48]].forEach(([t, ang], j) => {
        const q = s.at(t), lg = G('translate(' + q.x + ' ' + q.y + ') rotate(' + (q.a + ang) + ')');
        P('M0 0 L0 -28', { g: lg, at: 600 + j * 200, dur: 300, w: .8 });
        [[-28, 0, 15, 6], [-18, -55, 12, 5], [-18, 55, 12, 5]].forEach(([ly, r, l, w], i) => leaf(0, ly, r, l, w, 800 + j * 200 + i * 80, '#A7C49A', lg));
      });
      const top = s.at(1), g = G('translate(' + top.x + ' ' + top.y + ') rotate(' + top.a * .7 + ')');
      const c = R(['#E77A8A', '#F0A3A8', '#E8B4C8', '#F2B07E']);
      [-40, 0, 40].forEach((r, i) => leaf(0, -2, 180 + r, 11, 3.5, 1000 + i * 60, '#A7C49A', g));
      P('M-20 -6 C-24 -22 -12 -34 0 -32 C12 -34 24 -22 20 -6 C14 4 -14 4 -20 -6 Z', { g, at: 1100, dur: 700, w: 1.1, fill: c, fo: .5 });
      P('M-20 -6 C-14 -16 -6 -18 0 -14', { g, at: 1500, dur: 300, w: .9 });
      P('M20 -6 C14 -18 6 -20 -2 -16', { g, at: 1600, dur: 300, w: .9 });
      P('M-12 -22 C-10 -30 4 -32 10 -26 C14 -20 6 -14 -2 -16 C-8 -18 -6 -26 2 -26 C6 -26 6 -22 2 -21', { g, at: 1700, dur: 700, w: .9, fill: c, fo: .35 });
      P('M-16 -2 C-8 2 8 2 16 -2', { g, at: 2000, dur: 300, w: .6, op: .6 });
    } else if (sp === 'lavender') {
      ground();
      [[-14, rnd(120, 140)], [0, rnd(150, 175)], [14, rnd(125, 150)], [rnd(-6, 6), rnd(100, 120)]].forEach(([dx, h], k) => {
        const s = cubic([0, 0], [dx * .3, -h * .4], [dx * .9, -h * .7], [dx * 1.6, -h]);
        P(s.d, { at: k * 120, dur: 800, w: .9 });
        for (let i = 0; i < 9; i++) { const q = s.at(Math.min(.62 + i * .042, 1)), sd = i % 2 ? 1 : -1; P('M0 0 C2.6 -1.5 2.8 -5 0 -7 C-2.8 -5 -2.6 -1.5 0 0', { g: G('translate(' + q.x + ' ' + q.y + ') rotate(' + (q.a + sd * 30) + ')'), at: 900 + k * 120 + i * 60, dur: 200, w: .7, fill: R(['#9B87D6', '#B3A2E3', '#8572C4']), fo: .8 }); }
      });
      [[-30, 40], [28, 36], [-12, 30]].forEach(([r, l], i) => leaf(0, -2, r, l, 3, 500 + i * 100, '#B4C7A8'));
    } else {
      const H = rnd(110, 130);
      const s = cubic([0, 0], [2, -H * .6], [18, -H * 1.05], [50, -H * .8]);
      leaf(-3, 0, -18, 80, 16, 300, '#A3C295'); leaf(3, 0, 14, 70, 14, 450, '#9DBF8E');
      ground(); stem(s, 0, 900, 1);
      const bc = R([['#FFFDF7', 'Convallaria majalis'], ['#B9C8EC', 'Hyacinthoides']]);
      [.42, .54, .65, .75, .84, .93].forEach((t, i) => {
        const q = s.at(t), pl = 7 + i * .4;
        P('M' + q.x + ' ' + q.y + ' q3 2 2 ' + pl, { at: 900 + i * 90, dur: 180, w: .7 });
        P('M-5 0 C-6 4 -7 8 -8 10 Q-6 12 -4 10 Q-2 13 0 10.5 Q2 13 4 10 Q6 12 8 10 C7 8 6 4 5 0 C3 -2 -3 -2 -5 0 Z', { g: G('translate(' + (q.x + 2) + ' ' + (q.y + pl) + ') scale(' + (1 - i * .07) + ')'), at: 1050 + i * 90, dur: 350, w: .9, fill: bc[0], fo: .9 });
      });
    }
    if (keep) {
      this.flowerLayer();
      const g = this.gardenEl; if (g) { const r = g.getBoundingClientRect(); this.gLayer.style.top = '0px'; this.gLayer.style.height = r.height + 'px'; svg.style.top = (parseFloat(svg.style.top) - r.top - window.scrollY) + 'px'; }
      this.gLayer.appendChild(svg); return;
    }
    this.layer.appendChild(svg);
    svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 3200, fill: 'forwards' }).onfinish = () => svg.remove();
    while (this.layer.children.length > 12) this.layer.firstChild.remove();
  }
}
