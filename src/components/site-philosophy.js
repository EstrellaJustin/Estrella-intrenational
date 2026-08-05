/* ============================================================
   组件：is-philosophy · 品牌理念
   ============================================================ */

class SitePhilosophy extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const principles = [
      { idx: 'A', title: '数据驱动', desc: '以全球国家与项目数据为基础，让每一次规划都有据可依。' },
      { idx: 'B', title: '智能分析', desc: '借助 AI 理解个人背景，匹配更适合的国际发展路线。' },
      { idx: 'C', title: '全球视野', desc: '跨越地域与政策边界，为长期发展构建多元选择。' }
    ];

    this.innerHTML = `
      <section class="philosophy" id="philosophy" aria-labelledby="philosophy-title">
        <span class="philosophy__watermark" aria-hidden="true">I</span>
        <div class="container philosophy__inner">
          <div class="philosophy__left">
            <div class="section-head section-head--dark" data-reveal>
              <p class="eyebrow">02 · Philosophy</p>
              <h2 class="title" id="philosophy-title">重新定义<br>全球发展的方式</h2>
            </div>
            <p class="philosophy__text" data-reveal>
              世界正在连接，个人拥有更多国际发展的可能。<br>
              伊斯特拉国际通过数据、技术和智能分析，帮助用户探索未来方向。
            </p>
          </div>
          <div class="philosophy__right">
            ${principles.map((p, i) => `
              <div class="philosophy__principle" data-reveal>
                <span class="philosophy__principle-index">${p.idx}</span>
                <div>
                  <h3 class="philosophy__principle-title">${p.title}</h3>
                  <p class="philosophy__principle-desc">${p.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }
}
customElements.define('is-philosophy', SitePhilosophy);
