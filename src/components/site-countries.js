/* ============================================================
   组件：is-countries / is-country-card · 热门国家（v2 · 模拟数据）
   数据来自 src/data/countries.js，未来接入国家数据库
   ============================================================ */

class SiteCountries extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const rows = (Istra.countries || [])
      .map((c, i) => `
        <article class="country-row" data-reveal>
          <span class="country-row__flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" loading="lazy" width="44" height="33" /></span>
          <div>
            <h3 class="country-row__name">${c.cn}</h3>
            <p class="country-row__name-en">${c.name} · ${c.region}</p>
          </div>
          <p class="country-row__tagline">${c.tagline}</p>
          <span class="country-row__arrow" aria-hidden="true">→</span>
        </article>
      `)
      .join('');

    this.innerHTML = `
      <section class="countries" id="countries" aria-labelledby="countries-title">
        <div class="container">
          <div class="countries__head-row">
            <div class="section-head" data-reveal>
              <p class="eyebrow">Featured Countries</p>
              <h2 class="title" id="countries-title">热门国家</h2>
            </div>
            <p class="countries__note" data-reveal><span class="dot"></span> 展示数据 · 国家数据库即将上线</p>
          </div>
          <div class="countries__list">${rows}</div>
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
    this.innerHTML = `
      <article class="country-row" data-reveal>
        <span class="country-row__flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" loading="lazy" width="44" height="33" /></span>
        <div>
          <h3 class="country-row__name">${c.cn}</h3>
          <p class="country-row__name-en">${c.name} · ${c.region}</p>
        </div>
        <p class="country-row__tagline">${c.tagline}</p>
        <span class="country-row__arrow" aria-hidden="true">→</span>
      </article>
    `;
    Istra.reveal.observe(this);
  }
}
customElements.define('is-country-card', SiteCountryCard);
