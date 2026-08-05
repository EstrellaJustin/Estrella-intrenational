/* ============================================================
   组件：is-services · 核心服务三模块（v2 · 列表行，数据驱动）
   ============================================================ */

class SiteServices extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const rows = (Istra.services || [])
      .map((s) => `
        <article class="service-row" data-reveal>
          <span class="service-row__num">${s.num}</span>
          <span class="service-row__icon">${Istra.icon(s.icon)}</span>
          <div>
            <h3 class="service-row__title">${s.title}</h3>
            <p class="service-row__en">${s.en}</p>
            <p class="service-row__desc">${s.desc}</p>
          </div>
          <a class="service-row__link" href="${s.href}">了解更多 <span class="arr">→</span></a>
        </article>
      `)
      .join('');

    this.innerHTML = `
      <section class="services" id="services" aria-labelledby="services-title">
        <div class="container">
          <div class="services__head-row">
            <div class="section-head" data-reveal>
              <p class="eyebrow">Core Services</p>
              <h2 class="title" id="services-title">三大核心模块，构建你的全球发展蓝图</h2>
            </div>
            <p class="services__index">01 — 03</p>
          </div>
          <div class="services__list">${rows}</div>
        </div>
      </section>
    `;
  }
}
customElements.define('is-services', SiteServices);

/* 服务行也可独立使用（数据驱动） */
class SiteServiceCard extends HTMLElement {
  connectedCallback() {
    const index = Number(this.getAttribute('index') || 0);
    const s = (Istra.services || [])[index];
    if (!s) return;
    this.innerHTML = `
      <article class="service-row" data-reveal>
        <span class="service-row__num">${s.num}</span>
        <span class="service-row__icon">${Istra.icon(s.icon)}</span>
        <div>
          <h3 class="service-row__title">${s.title}</h3>
          <p class="service-row__en">${s.en}</p>
          <p class="service-row__desc">${s.desc}</p>
        </div>
        <a class="service-row__link" href="${s.href}">了解更多 <span class="arr">→</span></a>
      </article>
    `;
    Istra.reveal.observe(this);
  }
}
customElements.define('is-service-card', SiteServiceCard);
