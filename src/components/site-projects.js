/* ============================================================
   组件：is-projects · 项目大全（全球项目数据库探索器）
   支持 URL 参数：cat / sub / country / budget / q
   ============================================================ */

class SiteProjects extends HTMLElement {
  connectedCallback() {
    this.state = this.readParams();
    this.render();
    this.bind();
    Istra.reveal.observe(this);
  }

  readParams() {
    const p = new URLSearchParams(location.search);
    return {
      cat: p.get('cat') || '',
      sub: p.get('sub') || '',
      country: p.get('country') || '',
      budget: p.get('budget') || '',
      q: p.get('q') || ''
    };
  }

  matches(project) {
    const s = this.state;
    if (s.cat && project.category.id !== s.cat) return false;
    if (s.sub && project.subcategory.id !== s.sub) return false;
    if (s.country && project.country.id !== s.country) return false;
    if (s.budget && project.budget !== s.budget) return false;
    if (s.q) {
      const q = s.q.toLowerCase();
      const hay = (project.name + project.country.cn + project.country.en +
        project.introduction + project.subcategory.name + project.category.name).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  render() {
    const categories = Istra.categories || [];
    const countries = Istra.countries || [];
    const all = Istra.projects || [];
    const s = this.state;

    const catChips = ['<button type="button" class="filter-chip" data-cat="">全部</button>']
      .concat(categories.map((c) => `<button type="button" class="filter-chip${s.cat === c.id ? ' is-active' : ''}" data-cat="${c.id}">${c.name}</button>`))
      .join('');

    const activeCat = categories.find((c) => c.id === s.cat);
    const subOptions = ['<option value="">全部子分类</option>']
      .concat((activeCat ? activeCat.subs : categories.flatMap((c) => c.subs))
        .map((x) => `<option value="${x.id}"${s.sub === x.id ? ' selected' : ''}>${x.name}</option>`))
      .join('');

    const countryOptions = ['<option value="">全部国家</option>']
      .concat(countries.map((c) => `<option value="${c.id}"${s.country === c.id ? ' selected' : ''}>${c.cn}</option>`))
      .join('');

    const budgetOptions = [
      { v: '', l: '预算不限' }, { v: 'low', l: '50 万以内' },
      { v: 'mid', l: '50–150 万' }, { v: 'high', l: '150–300 万' }, { v: 'vip', l: '300 万以上' }
    ].map((b) => `<option value="${b.v}"${s.budget === b.v ? ' selected' : ''}>${b.l}</option>`).join('');

    const results = all.filter((p) => this.matches(p));

    const rows = results
      .map((p) => `
        <article class="project-row" data-reveal>
          <div class="project-row__country">
            <span class="project-row__flag"><img src="assets/flags/${p.country.flag}" alt="${p.country.cn} 国旗" loading="lazy" width="44" height="33" /></span>
            <div>
              <p class="project-row__country-cn">${p.country.cn}</p>
              <p class="project-row__country-en">${p.country.en}</p>
              <span class="project-row__region">${p.country.region}</span>
            </div>
          </div>
          <div>
            <h3 class="project-row__name">${p.name}</h3>
            <div class="project-row__badges">
              <span class="project-row__badge">${p.visaType}</span>
              <span class="project-row__badge project-row__badge--plain">${p.category.name}</span>
              <span class="project-row__badge project-row__badge--plain">${p.subcategory.name}</span>
            </div>
            <p class="project-row__intro">${p.introduction}</p>
          </div>
          <a class="project-row__btn" href="project-detail.html?id=${p.id}">查看详情 <span class="arr">→</span></a>
        </article>`)
      .join('');

    this.innerHTML = `
      <div class="projects">
        <header class="projects__head">
          <div class="container projects__head-inner">
            <div data-reveal>
              <p class="projects__eyebrow">Global Programs Database</p>
              <h1 class="projects__title">项目大全</h1>
              <p class="projects__sub">全球出国项目智能数据库 · 支持按国家、职业、预算与方向筛选</p>
            </div>
            <div class="projects__count" data-reveal>
              <span class="projects__count-num">${all.length}</span>
              <span class="projects__count-label">Programs</span>
            </div>
          </div>
        </header>

        <section class="projects__body">
          <div class="container">
            <div class="filter-panel" data-reveal>
              <div class="filter-panel__row">
                <span class="filter-panel__label">分类</span>
                <div class="filter-panel__chips">${catChips}</div>
              </div>
              <div class="filter-panel__row">
                <span class="filter-panel__label">筛选</span>
                <div class="filter-panel__selects">
                  <div class="filter-field">
                    <label for="fp-sub">子分类</label>
                    <select id="fp-sub" data-filter="sub">${subOptions}</select>
                  </div>
                  <div class="filter-field">
                    <label for="fp-country">国家</label>
                    <select id="fp-country" data-filter="country">${countryOptions}</select>
                  </div>
                  <div class="filter-field">
                    <label for="fp-budget">预算</label>
                    <select id="fp-budget" data-filter="budget">${budgetOptions}</select>
                  </div>
                  <div class="filter-field">
                    <label for="fp-q">职业 / 关键词</label>
                    <input id="fp-q" type="text" value="${s.q}" placeholder="如：工程师、IT、投资…" autocomplete="off" />
                  </div>
                  <div class="filter-panel__actions">
                    <button class="btn btn--primary" type="button" data-action="search">搜索</button>
                    <button class="btn btn--ghost-dark" type="button" data-action="reset">重置</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="projects__result-head" data-reveal>
              <p class="projects__result-label">共 <strong>${results.length}</strong> 个项目${s.cat ? ' · ' + activeCat.name : ''}</p>
            </div>

            ${results.length
              ? `<div class="projects__list">${rows}</div>`
              : `<div class="projects__empty">
                   <h3>未找到符合条件的项目</h3>
                   <p>请尝试调整筛选条件或搜索关键词。</p>
                   <button class="btn btn--ghost-dark" type="button" data-action="reset">重置筛选</button>
                 </div>`}
          </div>
        </section>
      </div>
    `;
  }

  bind() {
    this.querySelectorAll('[data-cat]').forEach((chip) => {
      chip.addEventListener('click', () => {
        this.state.cat = chip.dataset.cat;
        this.state.sub = '';
        this.sync();
      });
    });

    this.querySelectorAll('[data-filter]').forEach((sel) => {
      sel.addEventListener('change', () => {
        this.state[sel.dataset.filter] = sel.value;
      });
    });

    this.querySelector('[data-action="search"]').addEventListener('click', () => {
      this.state.q = this.querySelector('#fp-q').value.trim();
      this.sync();
    });
    this.querySelector('#fp-q').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this.state.q = e.target.value.trim(); this.sync(); }
    });
    this.querySelectorAll('[data-action="reset"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state = { cat: '', sub: '', country: '', budget: '', q: '' };
        this.sync();
      });
    });
  }

  sync() {
    const params = new URLSearchParams();
    ['cat', 'sub', 'country', 'budget', 'q'].forEach((k) => {
      if (this.state[k]) params.set(k, this.state[k]);
    });
    const qs = params.toString();
    history.replaceState(null, '', 'projects.html' + (qs ? '?' + qs : ''));
    this.render();
    this.bind();
    Istra.reveal.observe(this);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

customElements.define('is-projects', SiteProjects);
