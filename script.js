gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Pecah teks jadi huruf (untuk .split) */
document.querySelectorAll(".split").forEach(el => {
  const text = el.textContent;
  el.setAttribute("aria-label", text);
  el.innerHTML = text.split(" ").map(w =>
    `<span class="w">${[...w].map(c => `<span class="ch" aria-hidden="true">${c}</span>`).join("")}</span>`
  ).join(" ");
});

/* Loader lalu intro hero */
function heroIntro() {
  const tl = gsap.timeline();
  tl.from(".nav", { y: -60, opacity: 0, duration: 0.8, ease: "power3.out" })
    .fromTo(".title span", { yPercent: 120, rotate: 8, opacity: 0 },
      { yPercent: 0, rotate: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: "expo.out" }, 0.2)
    .fromTo(".sub", { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 0.6)
    .fromTo(".scroll-hint", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1);
  gsap.to(".scroll-hint i", { scaleY: 0.2, repeat: -1, yoyo: true, duration: 1, ease: "sine.inOut" });
}

const counter = { v: 0 };
const countEl = document.getElementById("count");
gsap.timeline({ onComplete: () => document.querySelector(".loader").remove() })
  .to(counter, {
    v: 100, duration: reduce ? 0.3 : 1.8, ease: "power2.inOut",
    onUpdate: () => countEl.textContent = Math.round(counter.v)
  })
  .to(".loader-bar i", { width: "100%", duration: reduce ? 0.3 : 1.8, ease: "power2.inOut" }, 0)
  .to(".loader", { yPercent: -100, duration: 0.9, ease: "power4.inOut" })
  .call(heroIntro, null, "-=0.5");

if (!reduce) {

  /* Kursor komet: kepala terang + ekor api + percikan */
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    const cv = document.querySelector(".comet"), ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W, H;
    const U = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--u")) || 1;
    const resize = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener("resize", resize);
    const mouse = { x: 0, y: 0 }, head = { x: 0, y: 0, r: 20 * U }, trail = [], sparks = [];
    let seen = false, targetR = 20 * U;
    addEventListener("mousemove", e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (!seen) { head.x = mouse.x; head.y = mouse.y; seen = true; document.documentElement.classList.add("has-comet"); }
      targetR = e.target.closest("a, button, .c-inner") ? 34 * U : 20 * U;
    });
    gsap.ticker.add(() => {
      ctx.clearRect(0, 0, W, H);
      if (!seen) return;
      const dx = mouse.x - head.x, dy = mouse.y - head.y;
      head.x += dx * 0.34; head.y += dy * 0.34; head.r += (targetR - head.r) * 0.15;
      trail.push({ x: head.x, y: head.y });
      if (trail.length > 30) trail.shift();
      if (Math.hypot(dx, dy) > 3 && Math.random() < 0.7)
        sparks.push({ x: head.x, y: head.y, vx: (Math.random() - 0.5) * 1.6, vy: (Math.random() - 0.5) * 1.6, life: 1 });
      ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
      for (let i = 1; i < trail.length; i++) {
        const t = i / trail.length;
        ctx.strokeStyle = `rgba(255,${Math.round(60 + 160 * t)},${Math.round(20 + 70 * t * t)},${t * 0.85})`;
        ctx.lineWidth = (1 + t * 9) * U;
        ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke();
      }
      const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, head.r);
      g.addColorStop(0, "rgba(255,250,230,1)"); g.addColorStop(0.3, "rgba(255,180,70,.85)"); g.addColorStop(1, "rgba(255,80,20,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(head.x, head.y, head.r, 0, 7); ctx.fill();
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.x += s.vx; s.y += s.vy + 0.2; s.life -= 0.03;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(255,${Math.round(120 + 100 * s.life)},50,${s.life})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, (1 + s.life * 1.8) * U, 0, 7); ctx.fill();
      }
    });
  }

  /* Progress bar scroll */
  gsap.to(".progress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 }
  });

  /* Parallax video */
  document.querySelectorAll(".parallax-video").forEach(v => {
    gsap.to(v, {
      yPercent: -12, ease: "none",
      scrollTrigger: { trigger: v.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* Judul AKAZA menghilang saat scroll */
  gsap.to(".akaza-content", {
    yPercent: -60, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".akaza-bg", start: "top top", end: "bottom top", scrub: true }
  });

  /* Teks huruf per huruf */
  document.querySelectorAll(".split").forEach(el => {
    gsap.from(el.querySelectorAll(".ch"), {
      yPercent: 110, opacity: 0, rotate: 6,
      duration: 0.9, stagger: 0.03, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play reverse play reverse" }
    });
  });

  /* Panel Tanjiro */
  gsap.from(".tanjiro-content", {
    opacity: 0, scale: 0.85, z: -150, duration: 1.2, ease: "power3.out",
    scrollTrigger: { trigger: ".tanjiro-bg", start: "top 60%", toggleActions: "play reverse play reverse" }
  });

  /* Galeri berjalan tanpa putus (gandakan isi lalu geser setengahnya) */
  function marquee(sel, dir) {
    const row = document.querySelector(sel);
    row.innerHTML += row.innerHTML;
    row.innerHTML += row.innerHTML;
    const half = row.scrollWidth / 2;
    gsap.fromTo(row,
      { x: dir > 0 ? -half : 0 },
      { x: dir > 0 ? 0 : -half, duration: 30, ease: "none", repeat: -1 });
  }
  window.addEventListener("load", () => {
    marquee(".runing-up", 1);
    marquee(".runing-down", -1);
    gsap.from(".img-runing img", {
      y: 60, opacity: 0, duration: 0.8, stagger: 0.05, ease: "power2.out",
      scrollTrigger: { trigger: ".img-runing", start: "top 95%", toggleActions: "play reverse play reverse" }
    });
  });

  /* Duel: scroll horizontal dengan pin */
  const track = document.querySelector(".duel-track");
  const scrollDist = () => track.scrollWidth - window.innerWidth;
  const hScroll = gsap.to(track, {
    x: () => -scrollDist(), ease: "none",
    scrollTrigger: {
      trigger: ".duel", pin: true, scrub: 0.8,
      start: "top top", end: () => "+=" + scrollDist(),
      invalidateOnRefresh: true
    }
  });

  document.querySelectorAll(".card").forEach(card => {
    const inner = card.querySelector(".c-inner");
    const st = { trigger: card, containerAnimation: hScroll, start: "left 85%", toggleActions: "play none none reverse" };
    gsap.set(inner, { transformPerspective: 900 });
    gsap.from(inner, { y: 70, opacity: 0, rotationY: -14, duration: 1, ease: "power3.out", scrollTrigger: st });
    gsap.from(card.querySelectorAll(".c-body > *"), { y: 30, opacity: 0, stagger: 0.1, duration: 0.8, delay: 0.2, scrollTrigger: st });
    gsap.from(card.querySelectorAll(".bar i"), { scaleX: 0, transformOrigin: "left", duration: 1.2, stagger: 0.15, delay: 0.6, ease: "power3.out", scrollTrigger: st });
    const rx = gsap.quickTo(inner, "rotationY", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(inner, "rotationX", { duration: 0.5, ease: "power3" });
    card.addEventListener("mousemove", e => {
      const r = inner.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      rx((px - 0.5) * 10); ry(-(py - 0.5) * 10);
      inner.style.setProperty("--mx", px * 100 + "%");
      inner.style.setProperty("--my", py * 100 + "%");
    });
    card.addEventListener("mouseleave", () => { rx(0); ry(0); });
  });

  /* Hitung angka statistik */
  document.querySelectorAll(".stat b").forEach(b => {
    const target = +b.dataset.n;
    const o = { v: 0 };
    gsap.to(o, {
      v: target, duration: 2, ease: "power2.out",
      onUpdate: () => b.textContent = Math.round(o.v),
      scrollTrigger: { trigger: b, start: "top 85%", once: true }
    });
  });


  /* Band kanji: jalan terus, makin cepat saat scroll kencang */
  const bandRow = document.querySelector(".band-row");
  bandRow.innerHTML += bandRow.innerHTML;
  const bandTween = gsap.to(bandRow, { xPercent: -50, duration: 25, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    onUpdate: self => {
      bandTween.timeScale(1 + Math.abs(self.getVelocity()) / 200);
      gsap.to(bandTween, { timeScale: 1, duration: 0.6, overwrite: true });
    }
  });

  /* Kutipan: kata menyala mengikuti scroll */
  const q = document.getElementById("quoteText");
  q.innerHTML = q.textContent.split(" ").map(w => `<span class="qw">${w}</span>`).join("");
  gsap.fromTo(".qw", { opacity: 0.12 }, {
    opacity: 1, stagger: 0.1, ease: "none",
    scrollTrigger: { trigger: ".quote", start: "top 65%", end: "bottom 60%", scrub: true }
  });

  /* Timeline: garis tergambar, item masuk dari kanan */
  gsap.from(".tl-line", {
    scaleY: 0, ease: "none",
    scrollTrigger: { trigger: ".tl", start: "top 70%", end: "bottom 70%", scrub: true }
  });
  gsap.utils.toArray(".tl-item").forEach(it => {
    gsap.from(it, {
      x: 60, opacity: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: it, start: "top 85%", toggleActions: "play none none reverse" }
    });
  });


  /* Foto timeline: terbuka dari kiri + zoom keluar */
  gsap.utils.toArray(".tl-item figure").forEach(f => {
    const img = f.querySelector("img");
    gsap.fromTo(f, { clipPath: "inset(0 100% 0 0)" }, {
      clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "power4.out",
      scrollTrigger: { trigger: f, start: "top 85%", toggleActions: "play none none reverse" }
    });
    gsap.fromTo(img, { scale: 1.35 }, { scale: 1, ease: "none",
      scrollTrigger: { trigger: f, start: "top bottom", end: "bottom 40%", scrub: true } });
  });


  /* Shinobu */
  const shTrig = { trigger: ".shinobu-bg", start: "top 40%", toggleActions: "play reverse play reverse" };
  gsap.fromTo(".title2 span", { yPercent: 120, rotate: 8, opacity: 0 },
    { yPercent: 0, rotate: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: "expo.out", scrollTrigger: shTrig });
  gsap.fromTo(".shinobu-content .char-eyebrow", { x: -30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.8, delay: 0.3, scrollTrigger: shTrig });
  gsap.to(".shinobu-content", {
    yPercent: -60, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".shinobu-bg", start: "center top", end: "bottom top", scrub: true }
  });

  /* Giyu: kolase parallax + grid muncul berurutan */
  gsap.utils.toArray(".gc").forEach(f => {
    gsap.to(f, {
      y: +f.dataset.speed, ease: "none",
      scrollTrigger: { trigger: ".giyu-top", start: "top bottom", end: "bottom top", scrub: true }
    });
  });
  gsap.from(".giyu-copy > *:not(.giyu-name)", {
    y: 40, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".giyu-copy", start: "top 75%", toggleActions: "play none none reverse" }
  });
  gsap.from(".giyu-grid figure", {
    y: 70, opacity: 0, scale: 0.94, stagger: 0.15, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".giyu-grid", start: "top 85%", toggleActions: "play none none reverse" }
  });

  /* Bagian akhir */
  gsap.from(".big span", {
    yPercent: 100, opacity: 0, stagger: 0.2, duration: 1.2, ease: "expo.out",
    scrollTrigger: { trigger: ".end", start: "top 60%", toggleActions: "play reverse play reverse" }
  });

  /* Tombol magnet */
  const btn = document.getElementById("btnTop");
  btn.addEventListener("mousemove", e => {
    const r = btn.getBoundingClientRect();
    gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.3 });
  });
  btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" }));
}

/* Navigasi & tombol atas pakai scroll GSAP-friendly */
document.querySelectorAll(".nav a").forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute("href"));
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
  });
});
document.getElementById("btnTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});