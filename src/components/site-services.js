/* ============================================================
   组件：is-services · 核心服务三模块（数据驱动渲染）
   ============================================================ */

class SiteServices extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const cards = (Istra.services || [])
      .map((s) => `
        <article class="service-card" data-reveal>
          <span class="service-card__num">${s.num}</span>
          <span class="service-card__icon">${Istra.icon(s.icon)}</span>
          <h3 class="service-card__title">${s.title}</h3>
          <p class="service-card__en">${s.en}</p>
          <p class="service-card__desc">${s.desc}</p>
          <a class="service-card__link" href="${s.href}">了解更多 <span class="arr">→</span></a>
        </article>
      `)
      .join('');

    this.innerHTML = `
      <section class="services" id="services" aria-labelledby="services-title">
        <div class="container">
          <div class="services__head-row">
            <div class="section-head" data-reveal>
              <p class="eyebrow">01 · Core Services</p>
              <h2 class="title" id="services-title">三大核心模块，构建你的全球发展蓝图</h2>
            </div>
            <p class="services__index">01 / 03</p>
          </div>
          <div class="services__grid">${cards}</div>
        </div>
      </section>
    `;
  }
}
customElements.define('is-services', SiteServices);

/* 服务卡片也可独立使用（数据驱动），此处仅为可组合性示例 */
class SiteServiceCard extends HTMLElement {
  connectedCallback() {
    const index = Number(this.getAttribute('index') || 0);
    const s = (Istra.services || [])[index];
    if (!s) return;
    this.innerHTML = `
      <article class="service-card" data-reveal>
        <span class="service-card__num">${s.num}</span>
        <span class="service-card__icon">${Istra.icon(s.icon)}</span>
        <h3 class="service-card__title">${s.title}</h3>
        <p class="service-card__en">${s.en}</p>
        <p class="service-card__desc">${s.desc}</p>
        <a class="service-card__link" href="${s.href}">了解更多 <span class="arr">→</span></a>
      </article>
    `;
    Istra.reveal.observe(this);
  }
}
customElements.define('is-service-card', SiteServiceCard);
