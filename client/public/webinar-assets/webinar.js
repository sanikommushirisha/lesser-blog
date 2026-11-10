/* Where the host blocks the Luma frame, show a plain button to the Luma page instead of an empty box */
document.addEventListener("securitypolicyviolation", function (e) {
  if (String(e.blockedURI).indexOf("luma.com") < 0) return;
  var f = document.querySelector("iframe.luma"), b = document.getElementById("luma-btn"), a = document.getElementById("luma-alt");
  if (f) f.hidden = true; if (b) b.hidden = false; if (a) a.hidden = true;
});

/* Motion layer shared by both landing pages. Page scripts tag elements, then call FX.init(). */
window.FX = (function () {
  var doc = document.documentElement;
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canIO = "IntersectionObserver" in window;
  var on = canIO && !RM;
  function $(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function count(el) {
    if (el._c) return; el._c = 1;
    if (RM) return;
    var full = el.textContent, m = full.match(/^([^0-9]*)([0-9.,]+)(.*)$/);
    if (!m) return;
    var end = parseFloat(m[2].replace(/,/g, "")), dec = (m[2].split(".")[1] || "").length;
    var from = parseFloat(el.getAttribute("data-from") || "0"), t0 = null, D = 1500;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / D), e = 1 - Math.pow(1 - p, 4);
      el.textContent = m[1] + (from + (end - from) * e).toFixed(dec) + m[3];
      if (p < 1) requestAnimationFrame(step); else el.textContent = full;
    }
    requestAnimationFrame(step);
  }
  function fire(el) { $("[data-count]", el).forEach(count); if (el.hasAttribute("data-count")) count(el); }

  /* Tag a list of selectors for reveal, staggered among siblings */
  function reveal(selectors) {
    selectors.forEach(function (sel) {
      $(sel).forEach(function (el) {
        var i = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.setAttribute("data-rv", "");
        el.style.setProperty("--d", Math.min(i, 3) * 40 + "ms");
      });
    });
  }

  function splitWords(h) {
    var text = h.textContent.trim(), words = text.split(/\s+/);
    h.setAttribute("aria-label", text); h.textContent = "";
    words.forEach(function (w, i) {
      var s = document.createElement("span"); s.className = "w"; s.setAttribute("aria-hidden", "true"); s.textContent = w;
      h.appendChild(s); if (i < words.length - 1) h.appendChild(document.createTextNode(" "));
    });
  }

  var barEl = null, barOff = false;
  function init() {
    var prog = document.createElement("div"); prog.className = "fx-progress"; document.body.appendChild(prog);
    var ticking = false;
    function onScroll() {
      ticking = false;
      var max = doc.scrollHeight - window.innerHeight;
      prog.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

    if (on) {
      doc.classList.add("fx");
      function show(el) {
        if (el._shown) return; el._shown = 1; io.unobserve(el); el.classList.add("in"); fire(el);
        setTimeout(function () { el.removeAttribute("data-rv"); el.classList.remove("in"); el.style.removeProperty("--d"); }, 900);
      }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) show(e.target); });
      }, { rootMargin: "0px 0px 18% 0px", threshold: 0 });
      $("[data-rv]").forEach(function (el) { io.observe(el); });

      function lightWords(h) {
        if (h._lit) return; h._lit = 1; wio.unobserve(h);
        $(".w", h).forEach(function (w, i) { setTimeout(function () { w.classList.add("on"); }, i * 35); });
      }
      var wio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) lightWords(e.target); });
      }, { rootMargin: "0px 0px 10% 0px", threshold: 0 });
      $("[data-words]").forEach(function (h) { splitWords(h); wio.observe(h); });

      /* Reveal speed follows the scroll. A fast flick drops the animation to a quick fade (class wb-fast),
         and when scrolling settles, anything already passed or on screen is shown at once. */
      var root = document.querySelector(".wbn"), lastY = window.scrollY, lastT = performance.now(), fastTimer = null, settleTimer = null;
      window.addEventListener("scroll", function () {
        var now = performance.now(), dy = Math.abs(window.scrollY - lastY), dt = Math.max(1, now - lastT);
        lastY = window.scrollY; lastT = now;
        if (root && dy / dt > 1.2) {
          root.classList.add("wb-fast");
          clearTimeout(fastTimer); fastTimer = setTimeout(function () { root.classList.remove("wb-fast"); }, 350);
        }
        clearTimeout(settleTimer);
        settleTimer = setTimeout(function () {
          var limit = window.innerHeight * 1.18;
          $("[data-rv]").forEach(function (el) { if (el.getBoundingClientRect().top < limit) show(el); });
          $("[data-words]").forEach(function (h) { if (h.getBoundingClientRect().top < limit) lightWords(h); });
        }, 90);
      }, { passive: true });

      $(".ticker .track").forEach(function (t) {
        var kids = Array.prototype.slice.call(t.children);
        for (var r = 0; r < 3; r++) kids.forEach(function (k) { var c = k.cloneNode(true); c.setAttribute("aria-hidden", "true"); t.appendChild(c); });
      });
    } else {
      $("[data-rv]").forEach(fire);
    }
    $("[data-count]").forEach(function (el) { if (!el.closest("[data-rv]")) count(el); });

    document.addEventListener("pointermove", function (e) {
      var c = e.target.closest && e.target.closest(".spot"); if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });

    barEl = document.querySelector(".fx-bar");
    var target = document.querySelector("[data-cta-target]");
    if (barEl && target && canIO) {
      new IntersectionObserver(function (es) { if (!barOff) barEl.classList.toggle("show", !es[0].isIntersecting); }, { threshold: 0.15 }).observe(target);
    }
    /* In-page buttons scroll to the form without touching the address hash */
    $("[data-goto]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var t = document.getElementById(a.getAttribute("data-goto")); if (!t) return;
        e.preventDefault(); t.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "center" });
        var f = t.querySelector("input"); if (f) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (x) {} }, 600);
      });
    });
    onScroll();
  }

  function done() { barOff = true; if (barEl) barEl.classList.remove("show"); }

  function confetti() {
    if (RM) return;
    var c = document.createElement("canvas"); c.className = "fx-confetti"; document.body.appendChild(c);
    var x = c.getContext("2d"), W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    var cols = ["#7FD0BC", "#F2C14E", "#F6EFD9", "#0B7A6B", "#FFFFFF"], ps = [], t0 = performance.now();
    for (var i = 0; i < 150; i++) ps.push({ x: W / 2, y: H * 0.4, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 3, r: 3 + Math.random() * 5, c: cols[i % 5], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4 });
    (function f(now) {
      var el = now - t0; x.clearRect(0, 0, W, H);
      ps.forEach(function (p) {
        p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.a += p.va;
        x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = Math.max(0, 1 - el / 2400); x.fillStyle = p.c; x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore();
      });
      if (el < 2400) requestAnimationFrame(f); else c.remove();
    })(t0);
  }

  return { init: init, reveal: reveal, count: count, confetti: confetti, done: done, on: on, RM: RM, $: $ };
})();

(function () {
  var $ = FX.$;
  /* Valuation bars, all three companies on one scale (largest figure = full width) */
  var cards = $(".num[data-a]"), max = 0;
  cards.forEach(function (c) { max = Math.max(max, +c.dataset.b); });
  cards.forEach(function (c) {
    var bars = document.createElement("div"); bars.className = "bars"; bars.setAttribute("aria-hidden", "true");
    bars.innerHTML = '<div class="vbar"><i style="--w:' + (c.dataset.a / max * 100).toFixed(1) + '%"></i></div><div class="vbar to"><i style="--w:' + (c.dataset.b / max * 100).toFixed(1) + '%"></i></div>';
    c.querySelector(".path").after(bars);
    $(".path strong", c).forEach(function (s) { s.setAttribute("data-count", ""); });
  });
  $(".num, .sp, .who blockquote").forEach(function (el) { el.classList.add("spot"); });
  FX.reveal([".kicker", "h2.big:not([data-words])", ".lede", ".num", ".learn li", ".sp", ".who blockquote", ".faq details", ".closer .box"]);

  /* Countdown to Sunday, November 15, 2026, 10:00 AM Pacific (18:00 UTC) */
  var START = Date.UTC(2026, 10, 15, 18, 0, 0), END = START + 3600000;
  var ids = ["cd-d", "cd-h", "cd-m", "cd-s"], last = [], mini = document.getElementById("cd-mini");
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var left = START - Date.now();
    if (left <= 0) {
      document.getElementById("cd").hidden = true;
      document.getElementById("cd-label").textContent = Date.now() < END ? "We are live now" : "This session has ended";
      if (mini) mini.textContent = "Sun, Nov 15 · 10 AM PT";
      return;
    }
    var s = Math.floor(left / 1000), v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
    v.forEach(function (n, i) {
      if (last[i] === n) return;
      var el = document.getElementById(ids[i]); el.textContent = i ? pad(n) : n;
      if (last.length) { el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip"); }
      last[i] = n;
    });
    if (mini) mini.textContent = "Starts in " + v[0] + "d " + pad(v[1]) + "h " + pad(v[2]) + "m";
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }
  tick();

  /* Hero backdrop: a skyline that climbs to the right, with a light running along its edge */
  var c = document.getElementById("herofx");
  if (c && c.getContext) {
    var x = c.getContext("2d"), W = 0, H = 0, D = Math.min(2, window.devicePixelRatio || 1), t = 0, run = false, P = [];
    for (var i = 0; i < 44; i++) P.push({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random() * 1.3, v: 0.02 + Math.random() * 0.05 });
    function size() { var r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = W * D; c.height = H * D; x.setTransform(D, 0, 0, D, 0, 0); }
    function draw() {
      x.clearRect(0, 0, W, H);
      var n = Math.max(16, Math.floor(W / 28)), bw = W / n, top = [];
      for (var i = 0; i < n; i++) {
        var u = (i + 0.5) / n, h = (0.04 + 0.5 * Math.pow(u, 3.2)) * H * (1 + 0.07 * Math.sin(t * 1.3 + i * 0.7)), X = i * bw, Y = H - h;
        top.push([X + bw / 2, Y]);
        var g = x.createLinearGradient(0, Y, 0, H);
        g.addColorStop(0, "rgba(127,208,188," + (0.06 + 0.2 * u) + ")"); g.addColorStop(1, "rgba(127,208,188,0)");
        x.fillStyle = g; x.fillRect(X + 2, Y, bw - 4, h);
      }
      x.beginPath(); top.forEach(function (p, i) { if (i) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); });
      x.strokeStyle = "rgba(246,239,217,.34)"; x.lineWidth = 1.5; x.stroke();
      var k = (t * 0.11) % 1, f = k * (n - 1), i0 = Math.floor(f), i1 = Math.min(n - 1, i0 + 1), q = f - i0;
      var px = top[i0][0] + (top[i1][0] - top[i0][0]) * q, py = top[i0][1] + (top[i1][1] - top[i0][1]) * q;
      x.beginPath(); x.arc(px, py, 4, 0, 7); x.fillStyle = "#F6EFD9"; x.shadowColor = "#F6EFD9"; x.shadowBlur = 18; x.fill(); x.shadowBlur = 0;
      P.forEach(function (p) {
        p.y -= p.v * 0.016; if (p.y < 0) { p.y = 1; p.x = Math.random(); }
        x.beginPath(); x.arc(p.x * W, p.y * H, p.s, 0, 7); x.fillStyle = "rgba(255,255,255,.26)"; x.fill();
      });
    }
    function loop() { if (!run) return; t += 0.016; draw(); requestAnimationFrame(loop); }
    function start() { if (run || FX.RM || document.hidden) return; run = true; requestAnimationFrame(loop); }
    size(); t = 2; draw();
    window.addEventListener("resize", function () { size(); draw(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) run = false; else start(); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) start(); else run = false; }).observe(c); else start();
  }
  FX.init();
})();

/* Tracking: the visitor's ad tags go into Luma, and a finished registration is reported to Meta.
   - Tags come from the page address (utm_*, fbclid, gclid) and, for a returning visitor, the lsr_attr cookie
     the site keeps for 90 days. They are added to the Luma form's address and to the Register button's link,
     so Luma shows which ad brought each registration.
   - When the Luma form finishes a registration it posts {type: "luma:purchase"} to this page; that is the
     moment we send Meta's CompleteRegistration (and a GA event). */
(function () {
  var LUMA_PAGE = "https://luma.com/5c2cffuo";
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"];
  function stored() {
    try { var m = document.cookie.match(/(?:^|; )lsr_attr=([^;]*)/); return m ? JSON.parse(decodeURIComponent(m[1])) : {}; } catch (e) { return {}; }
  }
  function tags() {
    var q = new URLSearchParams(location.search), c = stored(), out = {};
    KEYS.forEach(function (k) { var v = q.get(k) || c[k]; if (v) out[k] = String(v).slice(0, 120); });
    return out;
  }
  var t = tags(), has = Object.keys(t).length > 0;

  var frame = document.querySelector("iframe.luma");
  if (frame && has) {
    var u = new URL(frame.getAttribute("src"));
    Object.keys(t).forEach(function (k) { u.searchParams.set(k, t[k]); });
    frame.src = u.toString();
  }

  var b = document.querySelector(".reg-cta");
  if (b) {
    var link = new URL(LUMA_PAGE);
    if (has) Object.keys(t).forEach(function (k) { link.searchParams.set(k, t[k]); });
    else { link.searchParams.set("utm_source", "website"); link.searchParams.set("utm_medium", "webinar_page"); link.searchParams.set("utm_campaign", "15x_webinar_nov15"); }
    b.href = link.toString();
  }

  var sent = false;
  window.addEventListener("message", function (e) {
    if (sent || !frame || e.source !== frame.contentWindow || !/^https:\/\/([a-z0-9-]+\.)*luma\.com$/.test(e.origin)) return;
    var d = e.data;
    if (!d || d.type !== "luma:purchase") return;
    sent = true;
    var id = "reg-" + (d.transaction_id || d.event_api_id || Date.now());
    if (window.fbq) window.fbq("track", "CompleteRegistration", { content_name: "The 15x You Missed", value: 0, currency: "USD" }, { eventID: id });
    if (window.gtag) window.gtag("event", "webinar_registration", { webinar: "15x_you_missed" });
  });
})();

(function () {
  var b = document.querySelector(".reg-cta"), root = document.querySelector(".wbn");
  if (!b || !root || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(function (es) { root.classList.toggle("cta-in-view", es[0].isIntersecting); }, { threshold: 0.6 }).observe(b);
})();
