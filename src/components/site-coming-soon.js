/* ============================================================
   组件：is-coming-soon · 模块建设中占位页（v2）
   ============================================================ */

class SiteComingSoon extends HTMLElement {
  connectedCallback() {
    const params = new URLSearchParams(location.search);
    this.name = params.get('name') || this.getAttribute('name') || '新模块';
    this.code = params.get('code') || this.getAttribute('code') || 'MODULE';
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    this.innerHTML = `
      <section class="soon">
        <span class="soon__watermark" aria-hidden="true">${this.code}</span>
        <div class="soon__inner">
          <p class="soon__code" data-reveal>ESTRELLA INTERNATIONAL · ${this.code}</p>
          <h1 class="soon__title" data-reveal>${this.name} · 即将上线</h1>
          <p class="soon__desc" data-reveal>该模块将在后续阶段逐步开放，敬请期待。</p>
          <div class="soon__actions" data-reveal>
            <a class="btn btn--ghost-light" href="index.html">返回首页</a>
            <a class="btn btn--primary" href="ai-assessment.html">立即评估</a>
          </div>
        </div>
      </section>
    `;
  }
}
customElements.define('is-coming-soon', SiteComingSoon);
