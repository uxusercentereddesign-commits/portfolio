/*
 * Life in the garden: the wandering sheep + kids, picnic, birds, butterflies and falling oranges.
 *
 * One link in the page-logic class chain (see the script order at the bottom of Portfolio.html):
 *   GardenLife extends GardenPlants
 */
class GardenLife extends GardenPlants {
  ensureA() {
    if (!this.aLayer) { this.aLayer = document.createElement('div'); this.aLayer.className = 'garden-layer garden-layer--life'; this.gardenEl.appendChild(this.aLayer); }
    const gs = this.gardenEl; let top0 = 0;
    if (gs) { const rc = gs.getBoundingClientRect(); top0 = rc.top + window.scrollY; this.aLayer.style.top = '0px'; this.aLayer.style.height = rc.height + 'px'; }
    this.aLayer.style.display = this.entered ? 'none' : '';
    return top0;
  }
  stopFamily() { this.padBox = null; this.famRun = false; if (this.famRaf) cancelAnimationFrame(this.famRaf); this.famRaf = 0; (this.famEls || []).forEach(n => n.remove()); this.famEls = []; }
  buildFamily(pop, anc) {
    this.stopFamily();
    const sv = this.sceneSvg(), h = anc || this.homeAnchor(); if (!sv || !h) return;
    const U = Math.max(.5, Math.min(1.6, h.hw / (216.7 * this.persp(h.y))));
    const src = { k1: sv.querySelector('[data-g-kid="1"]'), k2: sv.querySelector('[data-g-kid="2"]'), sh: sv.querySelector('[data-g-sheep]'), ball: sv.querySelector('[data-g-ball]') };
    const W = h.hw, side = this.inWater(h.x - W, h.y + 14) || this.inWater(h.x - W * .6, h.y + 22) ? -1 : 1;
    const ok = (x, y) => y > 464 && !this.inWater(x, y) && !(Math.abs(x - h.x) < W * .55 && y > h.y - 16 && y < h.y + 5);
    const defs = [['k1', -.95, 8, .81], ['k2', -.62, 22, .81], ['sh', .9, 10, .62], ['sh', 1.25, 26, .62], ['ball', -.78, 16, .87]], fam = [];
    defs.forEach(([key, fx, dy, sc], i) => {
      const n0 = src[key]; if (!n0) return;
      let x = h.x + fx * W * side, y = h.y + dy;
      if (!ok(x, y)) { x = h.x - fx * W * side; if (!ok(x, y)) return; }
      const n = n0.cloneNode(true), head = n.querySelector('[data-g-shead]');
      [n, ...n.querySelectorAll('*')].forEach(e => [...e.attributes].forEach(a => { if (a.name.startsWith('data-')) e.removeAttribute(a.name); }));
      if (head) { head.style.transition = 'transform .7s ease'; head.style.transformBox = 'fill-box'; }
      const wrap = document.createElementNS('http://www.w3.org/2000/svg', 'g'); wrap.setAttribute('data-no-bloom', '1'); wrap.style.pointerEvents = 'none'; wrap.appendChild(n);
      this.depthInsert(wrap, y); this.famEls.push(wrap);
      const inner = n.firstElementChild, sh0 = inner && inner.firstElementChild;
      fam.push({ key, n, wrap, head, shadow: sh0 && sh0.tagName.toLowerCase() === 'ellipse' ? sh0 : null, x, y, tx: x, ty: y, by: y, sc, face: key === 'sh' ? side : 1, wait: 800 + Math.random() * 2000, ph: Math.random() * 6, lift: 0 });
      if (pop) wrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 350 + i * 140, fill: 'backwards' });
    });
    let pad = null;
    try {
      const NS2 = 'http://www.w3.org/2000/svg', PW = .75 * W, okG = (x, y) => y > 464 && !this.inWater(x, y);
      const okP = (x, y) => [[-PW, -14], [PW, -14], [-PW, 50], [PW, 50], [0, 20], [-PW / 2, 50], [PW / 2, 50], [-PW / 2, -14], [PW / 2, -14]].every(([dx, dy]) => okG(x + dx, y + dy));
      let sx = null, sy = null;
      let att = false; for (const sd of [side, -side]) { const x = h.x + sd * (.47 * W + PW), y = h.y - 26; if (okP(x, y)) { sx = x; sy = y; att = true; break; } }
      if (sx === null) for (const [fx, dy] of [[1.3, -58], [-1.3, -58]]) { const x = h.x + side * fx * W, y = h.y + dy; if (okP(x, y)) { sx = x; sy = y; break; } }
      if (sx !== null) {
        const B = sy - 14, F = sy + 50, Lx = sx - PW, Rx = sx + PW, fw = sx < h.x ? -1 : 1, inX = fw > 0 ? Lx : Rx, outX = fw > 0 ? Rx : Lx; pad = { Lx: Lx - 12, Rx: Rx + 12, B: B - 10, F: F + 8 }; this.padBox = pad;
        document.querySelectorAll('[data-garden] svg[data-lush][data-kind]').forEach(n => { const cx = +n.getAttribute('x') + +n.getAttribute('width') / 2, by = +n.getAttribute('data-base'); if (cx > pad.Lx && cx < pad.Rx && by > pad.B && by < pad.F) n.style.display = 'none'; });
        const fence = segs => { const rn = v => { const t = Math.sin(v * 12.9898 + 78.233) * 43758.5453; return t - Math.floor(t); }, wood = ['#5A4E44', '#665649', '#4F443B']; let o = '';
          segs.forEach(([x1, y1, x2, y2], si) => { const n = Math.max(1, Math.round(Math.hypot(x2 - x1, (y2 - y1) * 2.2) / 30)), P = [];
            for (let k = 0; k <= n; k++) { const t = k / n, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t, sd = x * .37 + y * 1.71 + si * 5.3; P.push({ x, y, q: this.persp(y) * U, hh: 35 * this.persp(y) * U * (.9 + rn(sd) * .16), lean: (rn(sd + 1.7) - .5) * 2.6 * this.persp(y), sd }); }
            [.32, .62, .92].forEach((hf, ri) => { for (let k = 0; k < P.length - 1; k++) { const A = P[k], Bp = P[k + 1], ja = (rn(A.sd + ri * 3.1) - .5) * 2.4 * A.q, jb = (rn(Bp.sd + ri * 3.1 + .4) - .5) * 2.4 * Bp.q, ya = A.y - A.hh * hf / .92 * .92 * (hf / hf) - 0 + ja, yb = Bp.y - Bp.hh * hf + jb, ya2 = A.y - A.hh * hf + ja, mx = (A.x + Bp.x) / 2 + (A.lean + Bp.lean) * hf * .3, my = (ya2 + yb) / 2 + (1 + rn(A.sd + ri) * 2.2) * A.q, w = (1.8 + rn(A.sd + ri + 9) * .9) * A.q;
              o += '<path d="M' + (A.x + A.lean * hf).toFixed(1) + ' ' + ya2.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + (Bp.x + Bp.lean * hf).toFixed(1) + ' ' + yb.toFixed(1) + '" stroke="' + wood[(k + ri) % 3] + '" stroke-width="' + w.toFixed(2) + '" fill="none" stroke-linecap="round"></path>'; } });
            P.forEach(Pt => { const { x, y, q, hh, lean } = Pt, w1 = (1.5 + rn(Pt.sd + 4) * .6) * q, w2 = w1 * (.8 + rn(Pt.sd + 6) * .3); o += '<path d="M' + (x - w1).toFixed(1) + ' ' + (y + 1).toFixed(1) + ' Q' + (x - w1 + lean * .4 - .4 * q).toFixed(1) + ' ' + (y - hh * .5).toFixed(1) + ' ' + (x - w2 + lean).toFixed(1) + ' ' + (y - hh).toFixed(1) + ' L' + (x + w2 * .3 + lean).toFixed(1) + ' ' + (y - hh - 1.4 * q).toFixed(1) + ' L' + (x + w2 + lean).toFixed(1) + ' ' + (y - hh + .6 * q).toFixed(1) + ' Q' + (x + w1 + lean * .4 + .3 * q).toFixed(1) + ' ' + (y - hh * .5).toFixed(1) + ' ' + (x + w1).toFixed(1) + ' ' + (y + 1).toFixed(1) + 'Z" fill="' + wood[Math.floor(rn(Pt.sd + 2) * 3)] + '"></path><path d="M' + (x - w1 * .3 + lean * .5).toFixed(1) + ' ' + (y - hh * .85).toFixed(1) + ' L' + (x - w1 * .2 + lean * .1).toFixed(1) + ' ' + (y - hh * .2).toFixed(1) + '" stroke="rgba(255,235,200,.18)" stroke-width="' + (.6 * q).toFixed(2) + '"></path>'; }); }); return o; };
        const grp = (html, base, delay) => { const g = document.createElementNS(NS2, 'g'); g.setAttribute('data-no-bloom', '1'); g.style.pointerEvents = 'none'; g.innerHTML = html; this.depthInsert(g, base); this.famEls.push(g); if (pop) g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay, fill: 'backwards' }); };
        grp('<path d="M' + Lx.toFixed(1) + ' ' + B.toFixed(1) + ' L' + Rx.toFixed(1) + ' ' + B.toFixed(1) + ' L' + Rx.toFixed(1) + ' ' + F.toFixed(1) + ' L' + Lx.toFixed(1) + ' ' + F.toFixed(1) + 'Z" fill="rgba(196,170,120,.38)" filter="url(#gSoft)"></path><g style="filter:blur(.55px)" opacity=".88">' + fence(att ? [[Lx, B, Rx, B], [outX, B, outX, F]] : [[Lx, B, Rx, B], [Lx, B, Lx, F], [Rx, B, Rx, F]]) + '</g>', B, 300);
        const xs = sx + fw * PW * .45, pb = this.persp(B), pf = this.persp(B + 16), wy = B + 2, fy = B + 16, hw2 = 40 * pb;
        grp('<g style="filter:blur(.55px)" opacity=".88">' + fence((att ? [[inX, h.y + 3, inX, F]] : []).concat([[Lx, F, sx - 16 * this.persp(F), F], [sx + 16 * this.persp(F), F, Rx, F]])) + '</g>', F, 520);
        const hm = { x: sx, r: PW - 24, y0: B + 14, dy: Math.max(8, F - 10 - (B + 14)) };
        [['brown', -.35, 28], ['white', .1, 38]].forEach(([coat, ox, oy], j) => {   // two horses; their colours are in style.css
          let x = sx + fw * ox * W, y = B + oy; if (!ok(x, y)) { x = sx; y = B + 32; if (!ok(x, y)) return; }
          const n = this.art('garden-horse-art'); n.dataset.horse = coat;
          const wrap = document.createElementNS(NS2, 'g'); wrap.setAttribute('data-no-bloom', '1'); wrap.style.pointerEvents = 'none'; wrap.appendChild(n);
          this.depthInsert(wrap, y); this.famEls.push(wrap);
          fam.push({ key: 'hs', n, wrap, hEl: n.querySelector('[data-h]'), ha: 0, shadow: n.querySelector('ellipse'), x, y, tx: x, ty: y, by: y, sc: .88, face: j ? -fw : fw, wait: 1500 + Math.random() * 3000, graze: true, ph: Math.random() * 6, lift: 0, home: hm });
          if (pop) wrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 700 + j * 200, fill: 'backwards' });
        });
        fam.filter(f => f.key[0] === 'k' || f.key === 'ball').forEach(f => { if (f.x > pad.Lx && f.x < pad.Rx && f.y > pad.B && f.y < pad.F) { f.x = 2 * h.x - f.x; f.tx = f.x; f.by = -99; } });
        fam.filter(f => f.key === 'sh').forEach((f, j) => { f.home = { x: sx, r: PW + 30, y0: pad.F + 4, dy: 40 }; if (f.x > pad.Lx && f.x < pad.Rx && f.y > pad.B && f.y < pad.F) { f.x = sx + (j ? .4 : -.3) * PW; f.y = pad.F + 10 + j * 14; } if (!ok(f.x, f.y)) { f.x = 2 * h.x - f.x; } f.tx = f.x; f.ty = f.y; f.by = -99; });
      }
    } catch (e) { console.error(e); }
    if (!fam.length) return;
    const kids = fam.filter(f => f.key[0] === 'k'), ball = fam.find(f => f.key === 'ball');
    if (ball) { ball.holder = kids[0] || null; ball.wait = 1500; }
    const pick = f => { const c = f.home || (f.key === 'sh' ? { x: h.x + side * 1.15 * W, r: W, y0: h.y - 2, dy: 56 } : { x: h.x - side * .95 * W, r: .85 * W, y0: h.y - 14, dy: 62 }); for (let t = 0; t < 14; t++) { const x = c.x + (Math.random() * 2 - 1) * c.r, y = c.y0 + Math.random() * c.dy; if (ok(x, y) && (f.key === 'hs' || !pad || x < pad.Lx || x > pad.Rx || y < pad.B || y > pad.F)) return { x, y }; } return { x: f.x, y: f.y }; };
    const place = f => { const s = f.sc * this.persp(f.y) * U; f.n.setAttribute('transform', 'translate(' + f.x.toFixed(1) + ' ' + (f.y - f.lift * s).toFixed(1) + ') scale(' + (s * f.face).toFixed(3) + ' ' + s.toFixed(3) + ')'); if (f.shadow) f.shadow.setAttribute('transform', 'translate(0 ' + f.lift.toFixed(2) + ')'); if (Math.abs(f.y - f.by) > 1.5) { this.depthInsert(f.wrap, f.y); f.by = f.y; } };
    let last = performance.now(); this.famRun = true;
    const step = now => {
      if (!this.famRun) return; const dt = Math.min(.05, (now - last) / 1000); last = now;
      fam.forEach(f => {
        if (f.key === 'ball') return;
        if (f.wait > 0) { f.wait -= dt * 1000; f.lift = 0; if (f.wait <= 0) { const t = pick(f); f.tx = t.x; f.ty = t.y; if (f.head) f.head.style.transform = ''; } }
        else { const dx = f.tx - f.x, dy = f.ty - f.y, d = Math.hypot(dx, dy), sp = (f.key === 'sh' ? 5 : f.key === 'hs' ? 9 : 26) * this.persp(f.y);
          if (d < .8) { f.wait = f.key === 'sh' || f.key === 'hs' ? 2500 + Math.random() * 6000 : 300 + Math.random() * 1800; f.lift = 0; f.graze = Math.random() < .8; if (f.head && Math.random() < .85) f.head.style.transform = 'translateY(5px) rotate(18deg)'; }
          else { const k = Math.min(1, sp * dt / d); f.x += dx * k; f.y += dy * k; if (Math.abs(dx) > .3) f.face = dx > 0 ? 1 : -1; f.ph += dt * (f.key === 'sh' || f.key === 'hs' ? 8 : 15); f.lift = Math.abs(Math.sin(f.ph)) * (f.key === 'sh' ? .8 : f.key === 'hs' ? 1 : 4); } }
        if (f.hEl) { f.ha += ((f.wait > 0 && f.graze ? 72 : 0) - f.ha) * Math.min(1, dt * 2.2); f.hEl.setAttribute('transform', 'rotate(' + f.ha.toFixed(1) + ' 13 -31)'); }
        place(f);
      });
      if (ball) { const b = ball;
        if (b.fly) { b.fly.t = Math.min(1, b.fly.t + dt / b.fly.d); const t = b.fly.t, tgt = b.to; b.x = b.fly.x0 + (tgt.x + tgt.face * 7 * tgt.sc * this.persp(tgt.y) - b.fly.x0) * t; b.y = b.fly.y0 + (tgt.y + 2 - b.fly.y0) * t; b.lift = Math.sin(Math.PI * t) * 14; if (t >= 1) { b.fly = null; b.holder = tgt; b.lift = 0; b.wait = 900 + Math.random() * 2200; } }
        else if (b.holder) { const hd = b.holder, s = hd.sc * this.persp(hd.y) * U; b.x += (hd.x + hd.face * 7 * s - b.x) * Math.min(1, dt * 10); b.y += (hd.y + 2 - b.y) * Math.min(1, dt * 10); b.lift = hd.wait > 0 ? 0 : Math.abs(Math.sin(hd.ph * 1.3)) * 2; b.wait -= dt * 1000;
          if (b.wait <= 0 && kids.length > 1) { const to = kids.find(k => k !== hd); b.to = to; b.fly = { x0: b.x, y0: b.y, t: 0, d: Math.max(.45, Math.hypot(to.x - b.x, to.y - b.y) / 80) }; b.holder = null; } }
        const s = b.sc * this.persp(b.y) * U; b.n.setAttribute('transform', 'translate(' + b.x.toFixed(1) + ' ' + (b.y - 3 * s - b.lift * s).toFixed(1) + ') scale(' + s.toFixed(3) + ')'); if (Math.abs(b.y - b.by) > 1.5) { this.depthInsert(b.wrap, b.y + .5); b.by = b.y; } }
      this.famRaf = requestAnimationFrame(step);
    };
    if (this.rm) { step(performance.now()); this.famRun = false; cancelAnimationFrame(this.famRaf); this.famRaf = 0; return; }
    this.famRaf = requestAnimationFrame(step);
  }
  startAmbient() {
    if (this.rm) return;
    const NS = 'http://www.w3.org/2000/svg', inf = { iterations: Infinity };
    document.querySelectorAll('[data-g-sheep] > g').forEach((g, i) => { g.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + (i ? -18 : 16) + 'px)' }, { transform: 'translateX(0)' }], { duration: 16000 + i * 5000, easing: 'ease-in-out', ...inf }); });
    document.querySelectorAll('[data-g-shead]').forEach((g, i) => g.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(5px)', offset: .15 }, { transform: 'translateY(5px)', offset: .55 }, { transform: 'translateY(0)', offset: .7 }, { transform: 'translateY(0)' }], { duration: 4200 + i * 1300, ...inf }));
    document.querySelectorAll('[data-g-kid] > g').forEach((g, i) => g.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(' + (i ? -8 : 8) + 'px,-5px)', offset: .25 }, { transform: 'translate(' + (i ? -16 : 16) + 'px,0)', offset: .5 }, { transform: 'translate(' + (i ? -8 : 8) + 'px,-5px)', offset: .75 }, { transform: 'translate(0,0)' }], { duration: 2400, easing: 'ease-in-out', ...inf }));
    const ball = document.querySelector('[data-g-ball]'); if (ball) ball.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(25px,-26px)' }, { transform: 'translate(50px,8px)' }, { transform: 'translate(25px,-26px)' }, { transform: 'translate(0,0)' }], { duration: 2400, easing: 'ease-in-out', ...inf });
    const pg = document.querySelector('[data-g-pond]'), rg = document.querySelector('[data-g-ripples]');   // found once, not every few seconds
    setInterval(() => { if (this.entered || document.hidden || !pg) return;
      const x0 = -100 + Math.random() * 130, dir = Math.random() < .5 ? 1 : -1, span = 30 + Math.random() * 18, sx = dir > 0 ? x0 : x0 + span;
      const fi = this.art('garden-fish-art'); pg.appendChild(fi);
      const rip = (x, d) => { const e = document.createElementNS(NS, 'ellipse'); e.setAttribute('cx', x); e.setAttribute('cy', 4); e.setAttribute('rx', 5); e.setAttribute('ry', 1.6); e.setAttribute('fill', 'none'); e.setAttribute('stroke', 'rgba(255,255,255,.85)'); e.setAttribute('stroke-width', '.9'); e.style.transformBox = 'fill-box'; e.style.transformOrigin = 'center'; pg.appendChild(e); e.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(3.2)', opacity: 0 }], { duration: 1300, delay: d, fill: 'both' }).onfinish = () => e.remove(); };
      const kf = []; for (let i = 0; i <= 12; i++) { const t = i / 12; kf.push({ transform: 'translate(' + (sx + dir * span * t).toFixed(1) + 'px,' + (4 - Math.sin(Math.PI * t) * 24).toFixed(1) + 'px) scale(' + dir + ',1) rotate(' + (-60 + 120 * t).toFixed(0) + 'deg)', opacity: t < .06 || t > .94 ? 0 : 1 }); }
      rip(sx, 0); rip(sx + dir * span, 1000);
      fi.animate(kf, { duration: 1100, easing: 'linear', fill: 'both' }).onfinish = () => fi.remove();
    }, 3800);
    setInterval(() => { if (this.entered || document.hidden || !rg) return;
      const e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'), x = -100 + Math.random() * 200, y = -20 + Math.random() * 34;
      e.setAttribute('cx', x); e.setAttribute('cy', y); e.setAttribute('rx', 10); e.setAttribute('ry', 3.4); e.setAttribute('fill', 'none'); e.setAttribute('stroke', 'rgba(255,255,255,.75)'); e.setAttribute('stroke-width', '1.2');
      e.style.transformBox = 'fill-box'; e.style.transformOrigin = 'center'; rg.appendChild(e);
      e.animate([{ transform: 'scale(.3)', opacity: 0 }, { opacity: 1, offset: .15 }, { transform: 'scale(3.2)', opacity: 0 }], { duration: 2600, easing: 'ease-out', fill: 'forwards' }).onfinish = () => e.remove(); }, 1300);
    const live = () => !this.entered && !document.hidden && !this.entering;
    setInterval(() => live() && this.dropOrange(), 5000);
    setInterval(() => { if (live() && !this.birdBusy) { this.birdVisit(0); setTimeout(() => this.birdVisit(1), 900); } }, 20000);
    setInterval(() => live() && this.butterfly(), 7000);
  }
  buildPicnic() {
    try {
      const sv = this.sceneSvg(), m = this.vbMap(0), NS = 'http://www.w3.org/2000/svg'; if (!sv || !m) return;
      if (this.pic) { this.pic.els.forEach(e => e.remove()); cancelAnimationFrame(this.pic.raf); }
      const U = 140 * Math.min(1, m.s / .62) / m.s / 216.7, sc = y => 1.25 * this.persp(y) * U;
      const mk = (html, base) => { const g = document.createElementNS(NS, 'g'); g.setAttribute('data-no-bloom', '1'); g.style.pointerEvents = 'none'; g.innerHTML = html; this.depthInsert(g, base); return g; };
      const bx = 1136, by = 632, k = sc(by);
      const P = (dx, dy) => (bx + dx * k).toFixed(1) + ' ' + (by + dy * k).toFixed(1);
      let chk = ''; for (let i = -2; i <= 2; i++) chk += '<path d="M' + P(i * 8 - 4, -9) + ' L' + P(i * 8 - 3, 9) + '" stroke="rgba(255,248,236,.55)" stroke-width="' + (2.4 * k).toFixed(1) + '"></path>'; chk += '<path d="M' + P(-27, -3) + ' L' + P(28, -4) + ' M' + P(-29, 4) + ' L' + P(30, 3) + '" stroke="rgba(255,248,236,.55)" stroke-width="' + (2.2 * k).toFixed(1) + '"></path>';
      const blanket = mk('<ellipse cx="' + bx + '" cy="' + (by + 2) + '" rx="' + 34 * k + '" ry="' + 6 * k + '" fill="rgba(60,40,20,.18)" filter="url(#gBlur)"></ellipse><path d="M' + P(-30, -8) + ' L' + P(26, -10) + ' L' + P(33, 9) + ' L' + P(-27, 10) + 'Z" fill="#C9553F"></path>' + chk, by - 9);
      const basket = mk('', by - 6), bk = sc(by - 4), BP = (dx, dy) => (bx + 2 + dx * bk).toFixed(1) + ' ' + (by - 4 + dy * bk).toFixed(1);
      const drawBasket = n => { let o = '<path d="M' + BP(-6, -5) + ' Q' + BP(0, -14) + ' ' + BP(6, -5) + '" stroke="#8A6236" stroke-width="' + (1.3 * bk).toFixed(1) + '" fill="none"></path>'; for (let i = 0; i < Math.min(n, 6); i++) o += '<circle cx="' + (bx + 2 + (-3.5 + (i % 3) * 3.5) * bk).toFixed(1) + '" cy="' + (by - 4 + (-5.5 - Math.floor(i / 3) * 2.4) * bk).toFixed(1) + '" r="' + (1.9 * bk).toFixed(1) + '" fill="#E8892E"></circle>'; o += '<path d="M' + BP(-7, -5) + ' L' + BP(7, -5) + ' L' + BP(5.5, 1) + ' L' + BP(-5.5, 1) + 'Z" fill="#B08049"></path><path d="M' + BP(-6.5, -3) + ' L' + BP(6.5, -3) + ' M' + BP(-6, -1) + ' L' + BP(6, -1) + '" stroke="#8A6236" stroke-width="' + (.6 * bk).toFixed(2) + '"></path>'; basket.innerHTML = o; };
      const fig = (x, y, face, who) => { const wrap = mk('', y), n = this.art('picnic-person-art'); n.dataset.person = who; wrap.appendChild(n); const f = { wrap, n, x, y, face, by: y, sit: n.querySelector('[data-sit]'), stand: n.querySelector('[data-stand]'), up: n.querySelector('[data-up]'), l1: n.querySelector('[data-l1]'), l2: n.querySelector('[data-l2]'), hold: n.querySelector('[data-hold]') }; return f; };
      const B = fig(bx - 20 * k, by + 3, 1, 'b');   // the two people's clothes and hair are in style.css
      const A = fig(bx + 18 * k, by + 5, -1, 'a');
      const place = f => { const s = sc(f.y); f.n.setAttribute('transform', 'translate(' + f.x.toFixed(1) + ' ' + f.y.toFixed(1) + ') scale(' + (s * f.face).toFixed(3) + ' ' + s.toFixed(3) + ')'); if (Math.abs(f.y - f.by) > 1.2) { this.depthInsert(f.wrap, f.y); f.by = f.y; } };
      [A, B].forEach(place);
      this.pic = { els: [blanket, basket, A.wrap, B.wrap], n: 0, busy: false, raf: 0, A, B, home: { x: A.x, y: A.y }, place, drawBasket, sc };
      drawBasket(0);
    } catch (e) { console.error(e); }
  }
  picnicFetch(o, tx, ty) {
    const P = this.pic; if (!P || P.busy || !P.A.wrap.isConnected) return false;
    if (Math.hypot(tx - P.home.x, ty - P.home.y) > 220) return false;
    P.busy = true; const A = P.A, steps = [];
    const pose = st => { A.sit.style.display = st ? 'none' : ''; A.stand.style.display = st ? '' : 'none'; };
    let ph = 0, last = performance.now(), stage = 0, t0 = last;
    const walkTo = (x, y, dt) => { const dx = x - A.x, dy = y - A.y, d = Math.hypot(dx, dy), sp = 26 * this.persp(A.y); if (d < .6) return true; const k = Math.min(1, sp * dt / d); A.x += dx * k; A.y += dy * k; if (Math.abs(dx) > .2) A.face = dx > 0 ? 1 : -1; ph += dt * 9; const sw = Math.sin(ph) * 22; A.l1.setAttribute('transform', 'rotate(' + sw.toFixed(1) + ' -1.4 -15)'); A.l2.setAttribute('transform', 'rotate(' + (-sw).toFixed(1) + ' 1.4 -15)'); return false; };
    const still = () => { A.l1.removeAttribute('transform'); A.l2.removeAttribute('transform'); };
    pose(true);
    const step = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (stage === 0 && now - t0 > 350) stage = 1;
      else if (stage === 1) { if (walkTo(tx - 5 * (tx > A.x ? 1 : -1), ty + 1, dt)) { still(); stage = 2; t0 = now; A.up.setAttribute('transform', 'rotate(' + (A.face > 0 ? 50 : 50) + ' 0 -14)'); } }
      else if (stage === 2 && now - t0 > 550) { A.up.removeAttribute('transform'); A.hold.style.display = ''; try { o.getAnimations().forEach(a => a.cancel()); } catch (e) {} o.remove(); stage = 3; }
      else if (stage === 3) { if (walkTo(P.home.x, P.home.y, dt)) { still(); A.hold.style.display = 'none'; P.n++; P.drawBasket(P.n); A.face = -1; stage = 4; t0 = now; } }
      else if (stage === 4 && now - t0 > 300) { pose(false); P.busy = false; P.place(A); return; }
      P.place(A); P.raf = requestAnimationFrame(step);
    };
    P.raf = requestAnimationFrame(step); return true;
  }
  dropOrange() {
    const top0 = this.ensureA(), m = this.vbMap(top0); if (!m) return;
    const rnd = (a, b) => a + Math.random() * (b - a);
    let x, y, gy, sz;
    { x = m.x(rnd(1140, 1235)); y = m.y(rnd(370, 405)); gy = m.y(rnd(606, 618)); sz = Math.max(9, Math.min(16, 13 * m.s)); }
    const o = document.createElement('div');
    o.className = 'garden-orange'; o.style.left = x + 'px'; o.style.top = y + 'px'; o.style.setProperty('--size', sz + 'px');   // its look is in style.css
    this.aLayer.appendChild(o);
    const d = gy - y, rx = (Math.random() < .5 ? -1 : 1) * rnd(14, 30);
    o.animate([
      { transform: 'translate(0,0) rotate(0)', opacity: 0, easing: 'cubic-bezier(.55,0,1,.45)' },
      { opacity: 1, offset: .04, transform: 'translate(0,2px) rotate(5deg)', easing: 'cubic-bezier(.55,0,1,.45)' },
      { transform: 'translate(0,' + d + 'px) rotate(120deg)', offset: .3, easing: 'cubic-bezier(0,.5,.5,1)' },
      { transform: 'translate(' + rx * .5 + 'px,' + (d - 14) + 'px) rotate(200deg)', offset: .4, easing: 'cubic-bezier(.5,0,1,.5)' },
      { transform: 'translate(' + rx + 'px,' + d + 'px) rotate(280deg)', offset: .5, easing: 'ease-out' },
      { transform: 'translate(' + rx * 1.6 + 'px,' + d + 'px) rotate(400deg)', offset: .64 },
      { transform: 'translate(' + rx * 1.6 + 'px,' + d + 'px) rotate(400deg)', opacity: 1, offset: .9 },
      { transform: 'translate(' + rx * 1.6 + 'px,' + d + 'px) rotate(400deg)', opacity: 0 }
    ], { duration: 4400, fill: 'forwards' }).onfinish = () => o.remove();
    setTimeout(() => { if (!o.isConnected || !this.pic) return; const v = this.toVB(x + rx * 1.6 - window.scrollX, gy + top0 - window.scrollY); if (!v) return; if (this.picnicFetch(o, v.x, v.y)) { try { o.getAnimations().forEach(a => a.pause()); } catch (e) {} } }, 2850);
  }
  birdVisit(idx) {
    const top0 = this.ensureA(), m = this.vbMap(top0); if (!m) return;
    const rnd = (a, b) => a + Math.random() * (b - a);
    let tx, ty;
    if (this.homeEl) { const rc = this.homeEl.getBoundingClientRect(); tx = rc.left + rc.width * rnd(.4, .6) + window.scrollX; ty = rc.top + rc.height * .1 + window.scrollY - top0; }
    else { tx = m.x(rnd(1150, 1230)); ty = m.y(rnd(325, 345)); }
    this.birdBusy = (this.birdBusy || 0) + 1; tx += idx ? 22 : -8;
    const W = window.innerWidth, fromL = Math.random() < .5, sx = fromL ? -60 : W + 60, sy = ty - rnd(120, 220), ex = fromL ? W + 60 : -60, ey = ty - rnd(160, 260);
    const bs = Math.max(.2, Math.min(1, (this.homeEl ? this.homeEl.getBoundingClientRect().height : 7 * 25 * this.persp(612) * m.s) * .1 / 34));
    const b = this.art('garden-bird-art'); b.querySelector('svg').style.transform = 'scale(' + (fromL ? bs : -bs) + ',' + bs + ')';   // its size, facing the way it flies
    this.aLayer.appendChild(b);
    const w = b.querySelector('[data-w]'), flap = () => w.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(-.9)' }], { duration: 130, direction: 'alternate', iterations: Infinity });
    let fl = flap();
    const mx = (sx + tx) / 2, my = Math.min(sy, ty) - 40;
    b.animate([{ transform: 'translate(' + sx + 'px,' + sy + 'px)' }, { transform: 'translate(' + mx + 'px,' + my + 'px)', offset: .55 }, { transform: 'translate(' + tx + 'px,' + (ty - 6) + 'px)', offset: .92 }, { transform: 'translate(' + tx + 'px,' + ty + 'px)' }], { duration: 2600, easing: 'ease-out', fill: 'forwards' }).onfinish = () => {
      fl.cancel();
      const hop = b.querySelector('svg').animate([{ transform: b.querySelector('svg').style.transform }, { transform: b.querySelector('svg').style.transform + ' translateY(-2px) rotate(-6deg)', offset: .1 }, { transform: b.querySelector('svg').style.transform, offset: .2 }, { transform: b.querySelector('svg').style.transform }], { duration: 1600, iterations: 2 });
      setTimeout(() => { hop.cancel(); fl = flap();
        b.animate([{ transform: 'translate(' + tx + 'px,' + ty + 'px)' }, { transform: 'translate(' + (tx + (ex - tx) * .3) + 'px,' + (ty - 60) + 'px)', offset: .3 }, { transform: 'translate(' + ex + 'px,' + ey + 'px)' }], { duration: 2400, easing: 'ease-in', fill: 'forwards' }).onfinish = () => { b.remove(); this.birdBusy--; };
      }, 3400);
    };
  }
  butterfly() {
    if (this.bfly > 1) return;
    const top0 = this.ensureA(), m = this.vbMap(top0); if (!m) return;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const fk = ['flowers', 'meadow', 'bloomBush', 'hydrangea', 'cattail'];
    const pl = [...document.querySelectorAll('[data-garden] svg[data-kind]')].filter(s => fk.includes(s.dataset.kind));
    let fx, fy;
    if (pl.length && Math.random() < .7) { const rc = pl[Math.floor(Math.random() * pl.length)].querySelector('g').getBoundingClientRect(); fx = rc.left + rc.width / 2 + window.scrollX; fy = rc.top + rc.height * .2 + window.scrollY - top0; }
    else { const p = [[992, 600], [1004, 606], [300, 445]][Math.floor(Math.random() * 3)]; fx = m.x(p[0]); fy = m.y(p[1]); }
    this.bfly = (this.bfly || 0) + 1;
    const colors = Math.floor(Math.random() * 4);   // one of four wing colourings (style.css)
    const bf = this.art('garden-butterfly-art'); bf.dataset.colors = colors;
    this.aLayer.appendChild(bf);
    const [wl, wr] = bf.querySelectorAll('[data-wl]');
    const fA = wl.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(.2)' }], { duration: 150, direction: 'alternate', iterations: Infinity });
    const fB = wr.animate([{ transform: 'scaleX(-1)' }, { transform: 'scaleX(-.2)' }], { duration: 150, direction: 'alternate', iterations: Infinity });
    const W = window.innerWidth, side = Math.random() < .5, sx = side ? -40 : W + 40, sy = fy - rnd(80, 200), ex = side ? W + 40 : -40;
    const kf = [{ transform: 'translate(' + sx + 'px,' + sy + 'px)' }];
    for (let i = 0; i < 4; i++) kf.push({ transform: 'translate(' + (fx + rnd(-55, 55)) + 'px,' + (fy - rnd(15, 70)) + 'px) rotate(' + rnd(-20, 20) + 'deg)' });
    kf.push({ transform: 'translate(' + fx + 'px,' + fy + 'px)' }, { transform: 'translate(' + fx + 'px,' + fy + 'px)' });
    for (let i = 0; i < 2; i++) kf.push({ transform: 'translate(' + (fx + rnd(-45, 45)) + 'px,' + (fy - rnd(20, 60)) + 'px) rotate(' + rnd(-20, 20) + 'deg)' });
    kf.push({ transform: 'translate(' + ex + 'px,' + (fy - rnd(120, 240)) + 'px)' });
    kf.forEach(k => { k.easing = 'ease-in-out'; });
    const rest = setTimeout(() => { fA.playbackRate = .25; fB.playbackRate = .25; setTimeout(() => { fA.playbackRate = 1; fB.playbackRate = 1; }, 1100); }, 9000 * 5 / 9);
    bf.animate(kf, { duration: 9000, fill: 'forwards' }).onfinish = () => { clearTimeout(rest); bf.remove(); this.bfly--; };
  }
}
