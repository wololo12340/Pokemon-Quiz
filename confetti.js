// confetti.js
// Improved confetti implementation (canvas-based) + banner. Drop this file into your site (same folder as script.js)
// and add a <script src="confetti.js"></script> after your main script, or before closing </body>.
// This file replaces/defines window.triggerCelebration() so no changes to your existing script calls are required.
//
// Features:
// - Canvas-based particles (better performance than many DOM elements).
// - Multiple shapes (rectangles, circles, triangles) with rotation and spin.
// - Natural physics: gravity, drag, wind, angular velocity.
// - Responsive (resizes with viewport), supports high-DPI.
// - Banner that fades in/out and optional "sparkle" accents.
// - Cleans up after itself.
//
// Usage (no changes required if your script already calls triggerCelebration()):
//   triggerCelebration(); // will run the improved confetti + banner

(function () {
  if (window.triggerCelebration && window.triggerCelebration.__improved_confetti_loaded) {
    // already loaded once
    return;
  }

  // Utility: create element with attrs
  function el(tag, attrs = {}) {
    const d = document.createElement(tag);
    for (const k in attrs) {
      if (k === "style") Object.assign(d.style, attrs.style);
      else if (k === "text") d.textContent = attrs.text;
      else d.setAttribute(k, attrs[k]);
    }
    return d;
  }

  // Remove any existing overlays/banners from previous runs
  function cleanupExisting() {
    document.querySelectorAll(".confetti-canvas-overlay, .celebration-banner-improved").forEach(n => n.remove());
  }

  // Main improved trigger
  function triggerCelebrationImproved(options = {}) {
    cleanupExisting();

    // Options with sensible defaults
    const opts = Object.assign({
      duration: 6500,         // total time to show confetti (ms)
      particleCount: 160,     // number of particles
      colors: ["#FF5A5F","#FFB400","#00A699","#7B61FF","#FF6B6B","#00D1B2","#FFD166"],
      shapes: ["rect","circle","triangle"],
      gravity: 1200,          // px/s^2
      terminalVelocity: 2500, // px/s
      wind: 0,                // base wind, px/s
      spread: 1.2,            // lateral spread multiplier
      bannerText: "Congratulations — all found!",
      bannerDuration: 3800,   // ms
    }, options || {});

    // Create overlay container
    const overlay = el("div", { class: "confetti-canvas-overlay" });
    Object.assign(overlay.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      overflow: "hidden",
      zIndex: 9999
    });
    document.body.appendChild(overlay);

    // Create canvas
    const canvas = el("canvas");
    Object.assign(canvas.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%"
    });
    overlay.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    // Handle high-DPI
    function resizeCanvas() {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const rect = overlay.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle class
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = (Math.random() * Math.PI * 2);
        const speed = 200 + Math.random() * 900; // px/s
        this.vx = Math.cos(angle) * speed * opts.spread;
        this.vy = Math.sin(angle) * speed * (0.4 + Math.random() * 0.9);
        this.size = 6 + Math.random() * 14;
        this.shape = opts.shapes[Math.floor(Math.random() * opts.shapes.length)];
        this.color = opts.colors[Math.floor(Math.random() * opts.colors.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.angularVelocity = (-6 + Math.random() * 12); // radians/s
        this.opacity = 1;
        this.lifetime = 1.8 + Math.random() * 1.6; // seconds
        this.age = 0;
        this.drag = 0.995 + Math.random() * 0.003;
        // small horizontal bias to simulate gusts
        this.windOffset = (Math.random() - 0.5) * 300;
      }

      update(dt, height) {
        // dt in seconds
        // apply drag
        this.vx *= Math.pow(this.drag, dt * 60);
        // gravity
        this.vy += opts.gravity * dt;
        // wind effect
        this.vx += (opts.wind + this.windOffset) * dt * 0.2;
        // clamp vertical velocity
        if (this.vy > opts.terminalVelocity) this.vy = opts.terminalVelocity;
        // integrate
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.rotation += this.angularVelocity * dt;
        this.age += dt;
        // fade out near end of lifetime or when below screen
        const t = this.age / this.lifetime;
        if (t > 0.85) this.opacity = Math.max(0, 1 - (t - 0.85) / 0.15);
        if (this.y - this.size > height + 40) this.opacity = 0;
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        switch (this.shape) {
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "triangle":
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size * 0.7, this.size);
            ctx.lineTo(-this.size * 0.7, this.size);
            ctx.closePath();
            ctx.fill();
            break;
          default: // rect
            ctx.fillRect(-this.size * 0.8, -this.size * 0.5, this.size * 1.6, this.size);
        }
        ctx.restore();
      }
    }

    // Emission: create particles from a horizontal band near top center with spread
    const particles = [];
    function emitBurst(count) {
      const rect = overlay.getBoundingClientRect();
      const cx = rect.width * 0.5;
      const y = rect.height * 0.12 + Math.random() * rect.height * 0.06;
      for (let i = 0; i < count; i++) {
        const p = new Particle(
          cx + (Math.random() - 0.5) * rect.width * 0.6,
          y + (Math.random() - 0.5) * 60
        );
        particles.push(p);
      }
    }

    // Staggered bursts for nicer effect
    const bursts = [
      { t: 0, count: Math.floor(opts.particleCount * 0.28) },
      { t: 150, count: Math.floor(opts.particleCount * 0.2) },
      { t: 300, count: Math.floor(opts.particleCount * 0.18) },
      { t: 600, count: Math.floor(opts.particleCount * 0.1) },
      { t: 1000, count: Math.floor(opts.particleCount * 0.12) }
    ];

    const startTime = performance.now();
    let last = startTime;
    let rafId = null;
    let burstIndex = 0;

    function frame(now) {
      const dtMs = Math.min(40, now - last); // cap dt
      const dt = dtMs / 1000;
      last = now;
      const rect = overlay.getBoundingClientRect();
      // trigger scheduled bursts
      while (burstIndex < bursts.length && now - startTime >= bursts[burstIndex].t) {
        emitBurst(bursts[burstIndex].count);
        burstIndex++;
      }
      // clear
      ctx.clearRect(0, 0, rect.width, rect.height);
      // update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(dt, rect.height);
        if (p.opacity <= 0 || p.age > p.lifetime + 0.5) {
          particles.splice(i, 1);
        } else {
          p.draw(ctx);
        }
      }
      // continue if still have time or particles
      if (now - startTime < opts.duration || particles.length > 0) {
        rafId = requestAnimationFrame(frame);
      } else {
        // done - cleanup
        cancelAnimationFrame(rafId);
        overlay.remove();
        banner.remove();
        window.removeEventListener("resize", resizeCanvas);
      }
    }

    // Create banner
    const banner = el("div", { class: "celebration-banner-improved", text: opts.bannerText });
    Object.assign(banner.style, {
      position: "fixed",
      left: "50%",
      top: "12%",
      transform: "translateX(-50%) translateY(-20px)",
      background: "linear-gradient(90deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))",
      padding: "12px 20px",
      borderRadius: "999px",
      boxShadow: "0 6px 22px rgba(16,24,40,0.12)",
      color: "#0b1220",
      fontWeight: "600",
      fontSize: "18px",
      zIndex: 10000,
      pointerEvents: "none",
      opacity: "0",
      transition: "transform 420ms cubic-bezier(.16,1,.3,1), opacity 320ms ease"
    });
    document.body.appendChild(banner);

    // show banner (fade/slide)
    requestAnimationFrame(() => {
      banner.style.opacity = "1";
      banner.style.transform = "translateX(-50%) translateY(0)";
    });

    // start animation loop
    rafId = requestAnimationFrame(frame);

    // remove banner after duration
    setTimeout(() => {
      banner.style.opacity = "0";
      banner.style.transform = "translateX(-50%) translateY(-20px)";
      setTimeout(() => { banner.remove(); }, 420);
    }, opts.bannerDuration);

    // small sparkle accent (purely decorative) - a quick shimmering dot
    const sparkle = el("div");
    Object.assign(sparkle.style, {
      position: "fixed",
      left: "50%",
      top: "12%",
      transform: "translateX(80px) translateY(-6px)",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: "#FFD166",
      boxShadow: "0 0 18px 6px rgba(255,209,102,0.18)",
      opacity: "0",
      zIndex: 10001,
      pointerEvents: "none",
      transition: "opacity 220ms ease"
    });
    document.body.appendChild(sparkle);
    setTimeout(() => { sparkle.style.opacity = "1"; }, 60);
    setTimeout(() => { sparkle.style.opacity = "0"; }, 1400);
    setTimeout(() => { sparkle.remove(); }, 2200);
  }

  // Export to global so existing code calling triggerCelebration() works unchanged.
  window.triggerCelebration = triggerCelebrationImproved;
  // mark loaded
  window.triggerCelebration.__improved_confetti_loaded = true;
})();
