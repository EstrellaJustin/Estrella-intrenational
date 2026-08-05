/* ============================================================
   组件：is-ai-cta · AI 智能评估入口（仅入口，不包含评估逻辑）
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
              <span class="ai-cta__badge"><span class="pulse"></span>AI ASSESSMENT · 即将上线</span>
              <h2 class="ai-cta__title" id="ai-cta-title">找到属于你的<br>全球发展路线</h2>
              <p class="ai-cta__desc">输入个人信息，获取AI智能分析。</p>
              <div class="ai-cta__actions">
                <a class="btn btn--gold" href="coming-soon.html?name=AI智能评估&code=AI">开始评估 <span class="btn-arrow">→</span></a>
              </div>
            </div>
            <div class="ai-cta__side">
              <p class="ai-cta__side-label">Assessment Dimensions</p>
              <ul class="ai-cta__side-list">
                ${dims.map((d, i) => `<li class="ai-cta__side-item"><span class="idx">${String(i + 1).padStart(2, '0')}</span>${d}</li>`).join('')}
              </ul>
              <p class="ai-cta__side-note">* 评估逻辑将在后续阶段接入，当前仅展示入口界面。</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
customElements.define('is-ai-cta', SiteAiCta);
