/* ============================================================
   组件：is-home · 首页 = 全球出国项目搜索中心
   搜索（国家/职业/预算/目标）+ 十大分类大模块 + 热门国家
   ============================================================ */

class SiteHome extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const countries = Istra.countries || [];
    const categories = Istra.categories || [];
    const projects = Istra.projects || [];

    const countryOptions = countries
      .map((c) => `<option value="${c.id}">${c.cn}</option>`)
      .join('');

    const budgetOptions = [
      { v: '', l: '预算不限' },
      { v: 'low', l: '50 万以内' },
      { v: 'mid', l: '50–150 万' },
      { v: 'high', l: '150–300 万' },
      { v: 'vip', l: '300 万以上' }
    ].map((b) => `<option value="${b.v}">${b.l}</option>`).join('');

    const catOptions = ['<option value="">方向不限</option>']
      .concat(categories.map((c) => `<option value="${c.id}">${c.name}</option>`))
      .join('');

    const countByCat = {};
    projects.forEach((p) => { countByCat[p.category.id] = (countByCat[p.category.id] || 0) + 1; });

    const catModules = categories
      .map((c, i) => `
        <a class="home__cat" href="category.html?cat=${c.id}" data-reveal>
          <span class="home__cat-num">${String(i + 1).padStart(2, '0')}</span>
          <div>
            <p class="home__cat-name">${c.name}</p>
            <p class="home__cat-en">${c.en}</p>
          </div>
          <div class="home__cat-meta">
            <span class="home__cat-count">${countByCat[c.id] || 0} 项目</span>
            <span class="home__cat-arrow" aria-hidden="true">→</span>
          </div>
        </a>`)
      .join('');

    const hotCountries = ['us', 'ca', 'jp', 'de', 'au', 'sg', 'gb', 'nz', 'ae', 'fr', 'es', 'kr']
      .map((id) => countries.find((c) => c.id === id))
      .filter(Boolean)
      .map((c) => `
        <a class="home__country" href="country.html?id=${c.id}" title="${c.cn}">
          <img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" loading="lazy" width="26" height="19" />
          <span>${c.cn}</span>
        </a>`)
      .join('');

    this.innerHTML = `
      <div class="home">
        <section class="home__hero">
          <div class="container">
            <p class="home__eyebrow" data-reveal>Global Programs Database</p>
            <h1 class="home__title" data-reveal>全球出国项目大全</h1>
            <p class="home__sub" data-reveal>全球国家 × 项目分类，快速找到适合你的国际发展路径</p>

            <form class="home__search" data-reveal id="home-search">
              <div class="home__search-fields">
                <div class="home__search-field">
                  <label for="hs-country">国家</label>
                  <select id="hs-country" name="country">
                    <option value="">全部国家</option>
                    ${countryOptions}
                  </select>
                </div>
                <div class="home__search-field">
                  <label for="hs-q">职业 / 关键词</label>
                  <input id="hs-q" name="q" type="text" placeholder="如：工程师、IT、投资…" autocomplete="off" />
                </div>
                <div class="home__search-field">
                  <label for="hs-budget">预算</label>
                  <select id="hs-budget" name="budget">${budgetOptions}</select>
                </div>
                <div class="home__search-field">
                  <label for="hs-cat">目标方向</label>
                  <select id="hs-cat" name="cat">${catOptions}</select>
                </div>
                <button class="btn btn--primary home__search-submit" type="submit">搜索项目 <span class="btn-arrow">→</span></button>
              </div>
            </form>

            <div class="home__stats" data-reveal>
              <div class="home__stat"><span class="home__stat-num">${projects.length}</span><span class="home__stat-label">全球项目</span></div>
              <div class="home__stat"><span class="home__stat-num">${countries.length}</span><span class="home__stat-label">覆盖国家</span></div>
              <div class="home__stat"><span class="home__stat-num">${categories.length}</span><span class="home__stat-label">项目分类</span></div>
            </div>
          </div>
        </section>

        <section class="home__cats">
          <div class="container">
            <div class="section-head" data-reveal>
              <p class="eyebrow">Categories</p>
              <h2 class="title">项目分类</h2>
            </div>
            <div class="home__cats-grid">${catModules}</div>
          </div>
        </section>

        <section class="home__countries">
          <div class="container">
            <div class="section-head" data-reveal>
              <p class="eyebrow">Countries</p>
              <h2 class="title">热门国家</h2>
            </div>
            <div class="home__country-list">${hotCountries}</div>
          </div>
        </section>
      </div>
    `;

    this.querySelector('#home-search').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const params = new URLSearchParams();
      ['country', 'q', 'budget', 'cat'].forEach((k) => {
        const v = (fd.get(k) || '').trim();
        if (v) params.set(k, v);
      });
      location.href = 'projects.html' + (params.toString() ? '?' + params.toString() : '');
    });
  }
}

customElements.define('is-home', SiteHome);
