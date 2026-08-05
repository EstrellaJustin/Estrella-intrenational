/* ============================================================
   组件：is-countries-browse · 全球国家数据库浏览
   ============================================================ */

class SiteCountriesBrowse extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const countries = Istra.countries || [];
    const projects = Istra.projects || [];
    const countByCountry = {};
    projects.forEach((p) => { countByCountry[p.country.id] = (countByCountry[p.country.id] || 0) + 1; });

    const items = countries
      .map((c) => `
        <a class="countriesb__item" href="country.html?id=${c.id}" data-reveal>
          <img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" loading="lazy" width="34" height="25" />
          <div>
            <p class="countriesb__item-name">${c.cn}</p>
            <p class="countriesb__item-en">${c.en}</p>
          </div>
          <div class="countriesb__item-meta">
            <span class="countriesb__item-num">${countByCountry[c.id] || 0}</span>
            <span class="countriesb__item-region">${c.region}</span>
          </div>
        </a>`)
      .join('');

    this.innerHTML = `
      <div class="countriesb">
        <header class="countriesb__head">
          <div class="container countriesb__head-inner">
            <div data-reveal>
              <p class="countriesb__eyebrow">Global Countries</p>
              <h1 class="countriesb__title">全球国家</h1>
              <p class="countriesb__sub">浏览全球 50+ 国家的出国项目，点击国家查看其全部项目。</p>
            </div>
            <div class="countriesb__count" data-reveal>
              <span class="countriesb__count-num">${countries.length}</span>
              <span class="countriesb__count-label">Countries</span>
            </div>
          </div>
        </header>
        <section class="countriesb__body">
          <div class="container">
            <div class="countriesb__grid">${items}</div>
          </div>
        </section>
      </div>
    `;
  }
}

customElements.define('is-countries-browse', SiteCountriesBrowse);
