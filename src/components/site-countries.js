/* ============================================================
   组件：is-countries / is-country-card · 热门国家（模拟数据）
   展示界面；数据来自 src/data/countries.js，未来接入国家数据库
   ============================================================ */

class SiteCountries extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const cards = (Istra.countries || [])
      .map((c, i) => `
        <article class="country-card" data-reveal>
          <div class="country-card__top">
            <span class="country-card__region">${c.region}</span>
            <span class="country-card__index">${String(i + 1).padStart(2, '0')}</span>
          </div>
          <h3 class="country-card__name-en">${c.name}</h3>
          <p class="country-card__name-cn">${c.cn}</p>
          <p class="country-card__tagline">${c.tagline}</p>
          <ul class="country-card__facts">
            ${c.facts.map((f) => `<li class="country-card__fact">${f}</li>`).join('')}
          </ul>
          <div class="country-card__foot">
            <span class="country-card__status">详情即将开放</span>
            <span class="country-card__arrow">→</span>
          </div>
        </article>
      `)
      .join('');

    this.innerHTML = `
      <section class="countries" id="countries" aria-labelledby="countries-title">
        <div class="container">
          <div class="countries__head-row">
            <div class="section-head" data-reveal>
              <p class="eyebrow">03 · Featured Countries</p>
              <h2 class="title" id="countries-title">热门国家</h2>
            </div>
            <p class="countries__note" data-reveal><span class="dot"></span> 展示数据 · 国家数据库即将上线</p>
          </div>
          <div class="countries__grid">${cards}</div>
        </div>
      </section>
    `;
  }
}
customElements.define('is-countries', SiteCountries);

class SiteCountryCard extends HTMLElement {
  connectedCallback() {
    const id = this.getAttribute('country');
    const c = (Istra.countries || []).find((item) => item.id === id);
    if (!c) return;
    const i = Istra.countries.indexOf(c);
    this.innerHTML = `
      <article class="country-card" data-reveal>
        <div class="country-card__top">
          <span class="country-card__region">${c.region}</span>
          <span class="country-card__index">${String(i + 1).padStart(2, '0')}</span>
        </div>
        <h3 class="country-card__name-en">${c.name}</h3>
        <p class="country-card__name-cn">${c.cn}</p>
        <p class="country-card__tagline">${c.tagline}</p>
        <ul class="country-card__facts">
          ${c.facts.map((f) => `<li class="country-card__fact">${f}</li>`).join('')}
        </ul>
        <div class="country-card__foot">
          <span class="country-card__status">详情即将开放</span>
          <span class="country-card__arrow">→</span>
        </div>
      </article>
    `;
    Istra.reveal.observe(this);
  }
}
customElements.define('is-country-card', SiteCountryCard);
