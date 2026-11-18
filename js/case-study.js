/* Case study interactions: back link, carousels, before/after slider, section nav */
(() => {
  /* ---------- Back link: return to where the case study was opened from ----------
     The garden's project rows open this page with ?from=garden; the portfolio's project cards don't */
  const back = document.querySelector(".topbar__back");
  if (back && new URLSearchParams(location.search).get("from") === "garden") back.href = "index.html#garden";

  /* ---------- Carousels ---------- */
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const track = root.querySelector(".carousel__track");
    const slides = [...root.querySelectorAll(".carousel__slide")];
    const caption = root.querySelector(".carousel__caption");
    const title = root.querySelector(".carousel__title");
    const dotsWrap = root.querySelector(".carousel__dots");
    const prev = root.querySelector("[data-prev]");
    const next = root.querySelector("[data-next]");
    const viewport = root.querySelector(".carousel__viewport");
    let index = 0;

    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "carousel__dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => go(i));
      dotsWrap.appendChild(dot);
      return dot;
    });

    function go(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      track.style.transform = `translateX(${-index * 100}%)`;
      slides.forEach((s, n) => s.setAttribute("aria-hidden", n !== index));
      dots.forEach((d, n) => d.setAttribute("aria-current", n === index));
      if (caption) caption.textContent = slides[index].dataset.caption || "";
      if (title && slides[index].dataset.title) title.textContent = slides[index].dataset.title;
      root.classList.toggle("is-final", slides[index].hasAttribute("data-final"));
      prev.disabled = index === 0;
      next.disabled = index === slides.length - 1;
    }

    prev.addEventListener("click", () => go(index - 1));
    next.addEventListener("click", () => go(index + 1));

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "ArrowRight") go(index + 1);
    });

    // swipe / drag
    let startX = null;
    viewport.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    viewport.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40) {
        go(index + (dx < 0 ? 1 : -1));
        root.dataset.swiped = "1";           // tells the lightbox this was a swipe, not a click
        setTimeout(() => delete root.dataset.swiped, 0);
      }
      startX = null;
    });
    viewport.addEventListener("pointerleave", () => { startX = null; });

    go(0);
  });

  /* ---------- Before / After ---------- */
  document.querySelectorAll("[data-compare]").forEach((root) => {
    const range = root.querySelector(".compare__range");
    const update = () => {
      const v = Number(range.value);
      root.style.setProperty("--pos", `${v}%`);
      // left of centre = mostly "after" visible → hide Before tag; right of centre = the opposite
      root.classList.toggle("show-after", v < 50);
      root.classList.toggle("show-before", v > 50);
    };
    range.addEventListener("input", update);
    update();
  });

  /* ---------- Image viewer (click to enlarge, click anywhere to close) ---------- */
  // sections marked data-no-zoom (and the whole Challenges section) keep plain images
  const zoomables = [...document.querySelectorAll(
    ".media img, .carousel__slide img, img.rounded, .stepper-box img"
  )].filter((img) => !img.closest("#challenges, [data-no-zoom]"));
  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Enlarged image. Click anywhere or press Escape to close.");
  box.tabIndex = -1;
  box.innerHTML = '<img alt="" /><span class="lightbox__hint" aria-hidden="true">Click anywhere to close</span>';
  document.body.appendChild(box);
  const boxImg = box.querySelector("img");
  let lastFocus = null;

  // high-res copies live in images/marketing-dashboard/full/ with the same file name
  const fullSrc = (img) => img.getAttribute("src").replace("images/marketing-dashboard/", "images/marketing-dashboard/full/");

  function openViewer(img) {
    lastFocus = document.activeElement;
    boxImg.src = img.currentSrc || img.src;   // show the page image instantly…
    boxImg.alt = img.alt;
    const hi = new Image();                   // …then swap in the sharp version once it's loaded
    hi.onload = () => { if (box.classList.contains("is-open")) boxImg.src = hi.src; };
    hi.src = fullSrc(img);
    box.classList.add("is-open");
    document.documentElement.classList.add("no-scroll");
    box.focus();
  }
  function closeViewer() {
    if (!box.classList.contains("is-open")) return;
    box.classList.remove("is-open");
    document.documentElement.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  zoomables.forEach((img) => {
    if (img.closest("[data-no-zoom]")) return; // sections that shouldn't open the viewer
    img.classList.add("is-zoomable");
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `Enlarge image: ${img.alt}`);
    img.addEventListener("click", () => {
      const carousel = img.closest("[data-carousel]");
      if (carousel && carousel.dataset.swiped === "1") return;
      openViewer(img);
    });
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer(img); }
    });
  });

  box.addEventListener("click", closeViewer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeViewer(); });

  /* ---------- Section nav (scroll spy) ---------- */
  const nav = document.querySelector(".side-nav");
  if (!nav) return;
  const links = [...nav.querySelectorAll("a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  const progress = nav.querySelector(".side-nav__progress");
  const track = nav.querySelector(".side-nav__track");

  function setActive(i) {
    links.forEach((a, n) => {
      a.classList.toggle("is-active", n === i);
      a.classList.toggle("is-done", i >= 0 && n < i);
      if (n === i) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    if (i < 0) { progress.style.setProperty("--progress", "0%"); return; }
    const icon = links[i].querySelector(".side-nav__icon");
    const t = track.getBoundingClientRect();
    const c = icon.getBoundingClientRect();
    const pct = ((c.top + c.height / 2 - t.top) / t.height) * 100;
    progress.style.setProperty("--progress", `${Math.max(0, Math.min(100, pct))}%`);
  }

  // clicking a link: the nav steps through the sections in between at an even pace (0.11s each), rather than
  // following the scroll, which lingers on tall sections; then it stays on the clicked one until the page
  // stops scrolling (no scroll event for 150ms) and goes back to following the scroll
  let held = -1, stopT = 0, stepT = 0, stepping = false;
  const lessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const release = () => { clearTimeout(stopT); stopT = setTimeout(() => { if (!stepping) { held = -1; onScroll(); } }, 150); };
  links.forEach((a, target) => a.addEventListener("click", () => {
    clearInterval(stepT);
    held = Math.max(0, links.findIndex((l) => l.classList.contains("is-active")));
    if (lessMotion) held = target;   // less motion: straight there
    stepping = held !== target;
    setActive(held); release();
    if (stepping) stepT = setInterval(() => {
      held += Math.sign(target - held); setActive(held);
      if (held === target) { clearInterval(stepT); stepping = false; release(); }
    }, 110);
  }));

  function onScroll() {
    if (held >= 0) { release(); return; }
    const mark = window.innerHeight * 0.35;
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= mark) current = i; });
    setActive(Math.max(0, current));
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
