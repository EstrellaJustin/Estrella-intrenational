/* ============================================================
   组件：is-disclaimer · 法律页面（免责声明 / 隐私政策 / 用户协议）
   数据源：Istra.legal（src/data/legal.js）
   用法：<is-disclaimer type="disclaimer|privacy|terms"></is-disclaimer>
   ============================================================ */

class SiteDisclaimer extends HTMLElement {
  connectedCallback() {
    this.type = this.getAttribute('type') || 'disclaimer';
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const meta = {
      disclaimer: { eyebrow: 'Legal · Disclaimer', title: '免责声明', sub: '平台定位、信息来源与责任边界' },
      privacy: { eyebrow: 'Legal · Privacy', title: '隐私政策', sub: '我们如何收集、使用与保护您的信息' },
      terms: { eyebrow: 'Legal · Terms', title: '用户协议', sub: '使用本平台前请阅读以下条款' }
    };
    const m = meta[this.type] || meta.disclaimer;
    const sections = (Istra.legal && Istra.legal[this.type]) || (Istra.legal && Istra.legal.disclaimer) || [];

    this.innerHTML = `
      <div class="legal">
        <header class="legal__head">
          <div class="container">
            <p class="legal__eyebrow" data-reveal>${m.eyebrow}</p>
            <h1 class="legal__title" data-reveal>${m.title}</h1>
            <p class="legal__sub" data-reveal>${m.sub}</p>
          </div>
        </header>
        <div class="legal__body">
          <div class="container container--narrow">
            ${sections.map((sec, i) => `
              <section class="legal__section" data-reveal>
                <h2 class="legal__section-title"><span>${String(i + 1).padStart(2, '0')}</span>${sec.title}</h2>
                <div class="legal__section-body">
                  ${sec.body.map((t) => `<p>${t}</p>`).join('')}
                </div>
              </section>`).join('')}
            <p class="legal__note" data-reveal>如对本页面内容有任何疑问，欢迎通过页面底部联系方式与我们沟通。更新日期：2026-08-07。</p>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('is-disclaimer', SiteDisclaimer);