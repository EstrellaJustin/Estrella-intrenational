/* ============================================================
   组件：is-hero · 首屏
   深色商务背景 / Canvas 星辰与全球连接线 / 高级排版
   ============================================================ */

class SiteHero extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupCanvas();
  }

  render() {
    this.innerHTML = `
      <canvas class="hero__canvas" aria-hidden="true"></canvas>
      <div class="hero__vignette" aria-hidden="true"></div>

      <div class="container hero__inner">
        <p class="hero__eyebrow" data-reveal>Istra International · Global Development Platform</p>
        <h1 class="hero__title">
          <span class="line" data-reveal>探索全球机会</span>
          <span class="line line--gold" data-reveal>规划未来身份</span>
        </h1>
        <p class="hero__sub" data-reveal>通过全球信息数据库与人工智能分析，帮助个人发现适合自己的国际发展方向。</p>
        <div class="hero__actions" data-reveal>
          <a class="btn btn--gold" href="coming-soon.html?name=AI智能评估&code=AI">开始AI智能评估 <span class="btn-arrow">→</span></a>
          <a class="btn btn--ghost" href="coming-soon.html?name=全球项目&code=PROGRAMS">探索全球项目</a>
        </div>

        <div class="hero__meta" data-reveal>
          <div class="hero__meta-item"><span class="hero__meta-label">Data</span><span class="hero__meta-value">全球国家数据库</span></div>
          <div class="hero__meta-item"><span class="hero__meta-label">Programs</span><span class="hero__meta-value">全球项目数据库</span></div>
          <div class="hero__meta-item"><span class="hero__meta-label">Intelligence</span><span class="hero__meta-value">AI 智能分析</span></div>
        </div>
      </div>

      <div class="hero__scroll" aria-hidden="true">
        <span>SCROLL</span>
        <span class="hero__scroll-line"></span>
      </div>
    `;

    Istra.reveal.observe(this);
  }

  setupCanvas() {
    const canvas = this.querySelector('.hero__canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width, height, stars = [], arcs = [];
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * DPR);
      canvas.height = Math.round(height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildStars();
      buildArcs();
    }

    function buildStars() {
      const count = Math.min(150, Math.round((width * height) / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        gold: Math.random() < 0.18
      }));
    }

    function buildArcs() {
      arcs = [
        { x: width * 0.72, y: height * 0.18, r: Math.min(width, height) * 0.55 },
        { x: width * 0.18, y: height * 0.85, r: Math.min(width, height) * 0.42 }
      ];
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height);

      // 连接线：相邻星点之间的细线（全球连接感）
      const linkDist = 120;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i], b = stars[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.10;
            ctx.strokeStyle = `rgba(200, 169, 106, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // 大圆弧：全球轨迹意象
      arcs.forEach((arc) => {
        ctx.strokeStyle = 'rgba(200, 169, 106, 0.07)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 10]);
        ctx.beginPath();
        ctx.arc(arc.x, arc.y, arc.r, Math.PI * 0.15, Math.PI * 0.62);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 星点呼吸
      stars.forEach((s) => {
        const twinkle = reduceMotion ? 0.6 : 0.45 + 0.45 * Math.sin(time * 0.001 * s.speed + s.phase);
        ctx.beginPath();
        ctx.fillStyle = s.gold
          ? `rgba(200, 169, 106, ${0.5 * twinkle})`
          : `rgba(255, 255, 255, ${0.55 * twinkle})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    let rafId = null;
    function loop(time) {
      draw(time);
      if (!reduceMotion) rafId = requestAnimationFrame(loop);
    }

    resize();
    if (reduceMotion) { draw(0); }
    else { rafId = requestAnimationFrame(loop); }

    window.addEventListener('resize', resize, { passive: true });
    this._cleanup = () => {
      window.removeEventListener('resize', resize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }

  disconnectedCallback() {
    if (this._cleanup) this._cleanup();
  }
}

customElements.define('is-hero', SiteHero);
