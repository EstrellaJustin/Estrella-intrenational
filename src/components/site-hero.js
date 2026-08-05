/* ============================================================
   组件：is-hero · 首屏（v2）
   深蓝背景 / 中央大标题 / 无营销图片 / 无复杂动画
   ============================================================ */

class SiteHero extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    this.innerHTML = `
      <div class="hero__deco" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" fill="none" stroke-linecap="round">
          <path d="M 1180 60 A 460 460 0 0 1 1440 380" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
          <path d="M 1220 110 A 400 400 0 0 1 1420 330" stroke="rgba(96,165,250,0.10)" stroke-width="1"/>
          <circle cx="1180" cy="60" r="3" fill="rgba(255,255,255,0.18)"/>
          <circle cx="1310" cy="150" r="2.2" fill="rgba(96,165,250,0.5)"/>
          <circle cx="1400" cy="300" r="2.2" fill="rgba(255,255,255,0.18)"/>
          <path d="M 60 720 A 420 420 0 0 1 300 940" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
          <circle cx="60" cy="720" r="3" fill="rgba(255,255,255,0.14)"/>
          <circle cx="180" cy="820" r="2.2" fill="rgba(96,165,250,0.4)"/>
          <circle cx="40" cy="60" r="2" fill="rgba(255,255,255,0.12)"/>
          <circle cx="700" cy="820" r="2" fill="rgba(255,255,255,0.10)"/>
          <circle cx="960" cy="860" r="2" fill="rgba(255,255,255,0.08)"/>
        </svg>
      </div>

      <div class="container hero__inner">
        <p class="hero__eyebrow" data-reveal>Istra International · Global Development</p>
        <h1 class="hero__title">
          <span class="line" data-reveal>连接全球机遇</span>
          <span class="line line--accent" data-reveal>规划国际未来</span>
        </h1>
        <p class="hero__sub" data-reveal>
          全球出国项目数据库<br>
          AI 智能匹配系统<br>
          为个人与家庭提供国际发展方案
        </p>
        <div class="hero__actions" data-reveal>
          <a class="btn btn--primary" href="ai-assessment.html">立即评估 <span class="btn-arrow">→</span></a>
          <a class="btn btn--ghost-light" href="projects.html">浏览项目</a>
        </div>

        <div class="hero__meta" data-reveal>
          <span class="hero__meta-item">全球项目数据库</span>
          <span class="hero__meta-item">AI 智能匹配</span>
          <span class="hero__meta-item">国际身份规划</span>
        </div>
      </div>
    `;
  }
}

customElements.define('is-hero', SiteHero);
