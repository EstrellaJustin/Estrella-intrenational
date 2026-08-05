/* ============================================================
   组件：is-projects · 项目大全页（数据驱动，来自 Istra.projects）
   ============================================================ */

class SiteProjects extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const list = Istra.projects || [];

    const rows = list
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
              <span class="project-row__badge project-row__badge--category">${p.category}</span>
            </div>
            <p class="project-row__intro">${p.intro}</p>
          </div>
          <a class="project-row__btn" href="project-detail.html?id=${p.id}">查看详情 <span class="arr">→</span></a>
        </article>
      `)
      .join('');

    this.innerHTML = `
      <div class="projects">
        <header class="projects__head">
          <div class="container projects__head-inner">
            <div data-reveal>
              <p class="projects__eyebrow">Global Programs</p>
              <h1 class="projects__title">全球项目大全</h1>
              <p class="projects__sub">工作 · 学习 · 投资 · 创业，国际发展项目一览。点击项目查看咨询报告。</p>
            </div>
            <div class="projects__count" data-reveal>
              <span class="projects__count-num">${String(list.length).padStart(2, '0')}</span>
              <span class="projects__count-label">Programs</span>
            </div>
          </div>
        </header>
        <section class="projects__body" aria-label="项目列表">
          <div class="container">
            <div class="projects__list">${rows}</div>
            <p class="projects__footnote">* 以上为展示数据，项目数据库将在后续阶段接入真实内容。</p>
          </div>
        </section>
      </div>
    `;
  }
}
customElements.define('is-projects', SiteProjects);
