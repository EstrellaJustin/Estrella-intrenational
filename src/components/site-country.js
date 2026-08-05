/* ============================================================
   组件：is-country · 国家页（?id=xx）
   国家信息 + 按一级分类分组的项目列表
   ============================================================ */

class SiteCountry extends HTMLElement {
  connectedCallback() {
    this.id = new URLSearchParams(location.search).get('id') || 'us';
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const c = (Istra.countries || []).find((x) => x.id === this.id);
    if (!c) { this.renderMissing(); return; }
    const all = Istra.projects || [];
    const projects = all.filter((p) => p.country.id === this.id);
    const cats = (Istra.categories || []).filter((cat) => projects.some((p) => p.category.id === cat.id));

    const groups = cats
      .map((cat) => {
        const list = projects.filter((p) => p.category.id === cat.id);
        return `
          <section class="country__group">
            <div class="country__group-head">
              <h2 class="country__group-name">${cat.name}</h2>
              <span class="country__group-count">${list.length} 个项目</span>
            </div>
            <div class="country__list">
              ${list.map((p) => `
                <article class="project-row" data-reveal>
                  <div class="project-row__country">
                    <div>
                      <p class="project-row__country-cn">${p.name}</p>
                      <p class="project-row__country-en">${p.subcategory.name} · ${p.visaType}</p>
                    </div>
                  </div>
                  <div>
                    <div class="project-row__badges">
                      <span class="project-row__badge">${p.category.name}</span>
                    </div>
                    <p class="project-row__intro">${p.introduction}</p>
                  </div>
                  <a class="project-row__btn" href="project-detail.html?id=${p.id}">查看详情 <span class="arr">→</span></a>
                </article>`).join('')}
            </div>
          </section>`;
      })
      .join('');

    this.innerHTML = `
      <div class="country">
        <header class="country__head">
          <div class="container">
            <nav class="country__crumbs" aria-label="面包屑">
              <a href="index.html">首页</a><span class="sep">/</span>
              <a href="countries.html">全球国家</a><span class="sep">/</span>
              <span>${c.cn}</span>
            </nav>
            <div class="country__head-main">
              <div data-reveal>
                <span class="country__flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" width="64" height="48" /></span>
                <h1 class="country__name">${c.cn}</h1>
                <p class="country__en">${c.en} · ${c.region}</p>
                <span class="country__region">${c.region}</span>
                <p class="country__brief">${c.brief}。伊斯特拉国际为您整理该国的国际发展项目，覆盖工作、教育、投资与身份规划。</p>
              </div>
              <div class="country__stats" data-reveal>
                <div class="country__stat"><span class="country__stat-num">${projects.length}</span><span class="country__stat-label">项目</span></div>
                <div class="country__stat"><span class="country__stat-num">${cats.length}</span><span class="country__stat-label">分类</span></div>
                <a class="btn btn--primary" href="ai-assessment.html">立即评估 <span class="btn-arrow">→</span></a>
              </div>
            </div>
          </div>
        </header>

        <div class="country__body">
          <div class="container">
            ${groups || '<div class="country__empty">该国家暂无收录项目</div>'}
          </div>
        </div>
      </div>
    `;
  }

  renderMissing() {
    this.innerHTML = `
      <div class="detail__missing">
        <h1>未找到该国家</h1>
        <p>请返回全球国家列表重新选择。</p>
        <a class="btn btn--primary" href="countries.html">返回全球国家</a>
      </div>
    `;
  }
}

customElements.define('is-country', SiteCountry);
