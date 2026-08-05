/* ============================================================
   组件：is-travel · 全球旅游探索首页
   区域分类（亚洲/欧洲/北美洲/南美洲/大洋洲/非洲）+ 国家卡片
   ============================================================ */

class SiteTravel extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const travel = Istra.travel || [];
    const regions = [
      { id: 'ASIA', cn: '亚洲', en: 'Asia' },
      { id: 'EUROPE', cn: '欧洲', en: 'Europe' },
      { id: 'NORTH AMERICA', cn: '北美洲', en: 'North America' },
      { id: 'SOUTH AMERICA', cn: '南美洲', en: 'South America' },
      { id: 'OCEANIA', cn: '大洋洲', en: 'Oceania' },
      { id: 'AFRICA', cn: '非洲', en: 'Africa' }
    ];

    const regionSections = regions
      .map((r) => {
        const list = travel.filter((t) => t.region === r.id);
        if (!list.length) return '';
        return `
          <section class="travel__region">
            <div class="travel__region-head" data-reveal>
              <div>
                <h2 class="travel__region-title">${r.cn}</h2>
                <p class="travel__region-en">${r.en}</p>
              </div>
              <span class="travel__region-count">${list.length} 个国家</span>
            </div>
            <div class="travel__grid">
              ${list.map((t, i) => `
                <a class="tcard" href="travel-country.html?id=${t.id}" data-reveal>
                  <div class="tcard__media">
                    <img src="${t.image}" alt="${t.country.cn} 风景" loading="lazy" />
                    <span class="tcard__flag"><img src="assets/flags/${t.country.flag}" alt="" width="30" height="22" /></span>
                    <p class="tcard__name">${t.country.cn}<small>${t.country.en}</small></p>
                  </div>
                  <div class="tcard__body">
                    <p class="tcard__season">最佳季节：<b>${t.bestSeason}</b></p>
                  </div>
                </a>`).join('')}
            </div>
          </section>`;
      })
      .join('');

    this.innerHTML = `
      <div class="travel">
        <header class="travel__hero">
          <div class="travel__hero-bg" style="background-image:url('assets/images/travel/country/jp.jpg')"></div>
          <div class="container travel__hero-inner">
            <p class="travel__eyebrow" data-reveal>Global Travel Exploration</p>
            <h1 class="travel__title" data-reveal>探索世界，开启全球旅程</h1>
            <p class="travel__sub" data-reveal>发现全球目的地、旅行路线与文化体验。</p>
            <div class="travel__meta" data-reveal>
              <span class="travel__meta-item">${travel.length} 个国家目的地</span>
              <span class="travel__meta-item">6 大洲旅行探索</span>
              <span class="travel__meta-item">签证 · 预算 · 城市 · 体验</span>
            </div>
          </div>
        </header>

        <section class="travel__body">
          <div class="container">${regionSections}</div>
        </section>
      </div>
    `;
  }
}

customElements.define('is-travel', SiteTravel);

