/* ============================================================
   组件：is-ai-cta · AI 智能评估入口（v2 · 仅入口，无评估逻辑）
   ============================================================ */

class SiteAiCta extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const dims = ['职业背景', '教育经历', '资金情况', '家庭规划', '目标方向'];

    this.innerHTML = `
      <section class="ai-cta" id="ai" aria-labelledby="ai-cta-title">
        <div class="container">
          <div class="ai-cta__panel" data-reveal>
            <div class="ai-cta__main">
              <span class="ai-cta__badge"><span class="pulse"></span>AI ASSESSMENT</span>
              <h2 class="ai-cta__title" id="ai-cta-title">找到属于你的<br>全球发展路线</h2>
              <p class="ai-cta__desc">输入个人信息，获取 AI 智能分析。</p>
              <div class="ai-cta__actions">
                <a class="btn btn--primary" href="ai-assessment.html">立即评估 <span class="btn-arrow">→</span></a>
              </div>
            </div>
            <div class="ai-cta__side">
              <p class="ai-cta__side-label">Assessment Dimensions</p>
              <ul class="ai-cta__side-list">
                ${dims.map((d, i) => `<li class="ai-cta__side-item"><span class="idx">${String(i + 1).padStart(2, '0')}</span>${d}</li>`).join('')}
              </ul>
              <p class="ai-cta__side-note">* AI 分析引擎将在后续阶段接入，当前为评估中心入口。</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
customElements.define('is-ai-cta', SiteAiCta);
