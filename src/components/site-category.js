/* ============================================================
   组件：is-category · 分类页（一级分类 → 国家 → 具体项目）
   支持 URL 参数：cat / sub
   ============================================================ */

class SiteCategory extends HTMLElement {
  connectedCallback() {
    const p = new URLSearchParams(location.search);
    this.catId = p.get('cat') || (Istra.categories && Istra.categories[0] ? Istra.categories[0].id : 'work');
    this.sub = p.get('sub') || '';
    this.render();
    this.bind();
    Istra.reveal.observe(this);
  }

  render() {
    const cat = (Istra.categories || []).find((c) => c.id === this.catId);
    if (!cat) { this.renderMissing(); return; }
    const all = Istra.projects || [];
    const catProjects = all.filter((p) => p.category.id === cat.id && (!this.sub || p.subcategory.id === this.sub));
    const countryIds = [...new Set(catProjects.map((p) => p.country.id))];
    const countries = countryIds
      .map((id) => Istra.countries.find((c) => c.id === id))
      .filter(Boolean)
      .sort((a, b) => a.cn.localeCompare(b.cn, 'zh'));

    const subChips = ['<button type="button" class="sub-chip" data-sub="">全部子分类</button>']
      .concat(cat.subs.map((s) => `<button type="button" class="sub-chip${this.sub === s.id ? ' is-active' : ''}" data-sub="${s.id}">${s.name}</button>`))
      .join('');

    const countryTiles = countries
      .map((c) => {
        const n = catProjects.filter((p) => p.country.id === c.id).length;
        return `<a class="category__country" href="country.html?id=${c.id}">
          <img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" loading="lazy" width="26" height="19" />
          <span>${c.cn}</span><small>${n}</small>
        </a>`;
      })
      .join('');

    const groups = countries
      .map((c) => {
        const list = catProjects.filter((p) => p.country.id === c.id);
        return `
          <div class="category__group">
            <div class="category__group-head">
              <span class="category__group-flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" loading="lazy" width="30" height="22" /></span>
              <span class="category__group-name">${c.cn}</span>
              <span class="category__group-count">${list.length} 个项目</span>
            </div>
            <div class="category__list">
              ${list.map((p) => `
                <article class="project-row" data-reveal>
                  <div class="project-row__country">
                    <div>
                      <p class="project-row__country-cn">${p.name}</p>
                      <p class="project-row__country-en">${p.subcategory.name}</p>
                    </div>
                  </div>
                  <div>
                    <div class="project-row__badges">
                      <span class="project-row__badge">${p.visaType}</span>
                    </div>
                    <p class="project-row__intro">${p.introduction}</p>
                  </div>
                  <a class="project-row__btn" href="project-detail.html?id=${p.id}">查看详情 <span class="arr">→</span></a>
                </article>`).join('')}
            </div>
          </div>`;
      })
      .join('');

    this.innerHTML = `
      <div class="category">
        <header class="category__head">
          <div class="container">
            <nav class="category__crumbs" aria-label="面包屑">
              <a href="index.html">首页</a><span class="sep">/</span>
              <a href="projects.html">项目大全</a><span class="sep">/</span>
              <span>${cat.name}</span>
            </nav>
            <p class="category__eyebrow" data-reveal>${cat.en}</p>
            <h1 class="category__title" data-reveal>${cat.name}</h1>
            <p class="category__desc" data-reveal>${cat.desc}</p>
          </div>
        </header>

        <div class="category__body">
          <div class="container">
            <div class="category__subs" data-reveal>${subChips}</div>

            <div class="category__countries-head" data-reveal>
              <h2 class="category__block-title">覆盖国家</h2>
              <span class="category__block-meta">${countries.length} 个国家</span>
            </div>
            <div class="category__countries">${countryTiles}</div>

            <div class="category__projects-head" data-reveal>
              <h2 class="category__block-title">全部项目</h2>
              <span class="category__block-meta">${catProjects.length} 个项目</span>
            </div>
            ${groups}
          </div>
        </div>
      </div>
    `;
  }

  renderMissing() {
    this.innerHTML = `
      <div class="detail__missing">
        <h1>未找到该分类</h1>
        <p>请返回项目大全选择其他分类。</p>
        <a class="btn btn--primary" href="projects.html">返回项目大全</a>
      </div>
    `;
  }

  bind() {
    this.querySelectorAll('[data-sub]').forEach((chip) => {
      chip.addEventListener('click', () => {
        this.sub = chip.dataset.sub;
        const params = new URLSearchParams();
        params.set('cat', this.catId);
        if (this.sub) params.set('sub', this.sub);
        history.replaceState(null, '', 'category.html?' + params.toString());
        this.render();
        this.bind();
        Istra.reveal.observe(this);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }
}

customElements.define('is-category', SiteCategory);
