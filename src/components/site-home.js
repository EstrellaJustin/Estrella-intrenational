/* ============================================================
   组件：is-home · 首页 = 全球出国项目分类系统（三列矩阵）
   一级分类卡片（图标+名称+二级分类+项目数）
   点击卡片 → 分类页 category.html?cat=xx
   点击二级分类 → 项目列表页 projects.html?cat=xx&sub=yy
   ============================================================ */

class SiteHome extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bind();
    Istra.reveal.observe(this);
  }

  render() {
    const categories = Istra.categories || [];
    const projects = Istra.projects || [];
    const countByCat = {};
    projects.forEach((p) => { countByCat[p.category.id] = (countByCat[p.category.id] || 0) + 1; });

    const cards = categories
      .map((c, i) => {
        const subs = c.subs
          .map((s) => `<a class="home__sub" href="projects.html?cat=${c.id}&sub=${s.id}">${s.name}</a>`)
          .join('');
        return `
          <article class="home__cat" data-cat="${c.id}" tabindex="0" role="link" aria-label="${c.name}" data-reveal>
            <div class="home__cat-top">
              <span class="home__cat-icon">${Istra.icon(c.id) || Istra.icon('compass')}</span>
              <span class="home__cat-num">${String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 class="home__cat-name">${c.name}</h3>
            <p class="home__cat-en">${c.en}</p>
            <div class="home__cat-subs">${subs}</div>
            <div class="home__cat-foot">
              <span class="home__cat-count">${countByCat[c.id] || 0} 项目</span>
              <a class="home__cat-more" href="category.html?cat=${c.id}">查看全部 <span class="arr">→</span></a>
            </div>
          </article>`;
      })
      .join('');

    this.innerHTML = `
      <div class="home">
        <header class="home__head">
          <div class="container">
            <img class="home__logo" src="assets/logo.jpg" alt="伊斯特拉国际" data-reveal />
          <p class="home__brand" data-reveal>
              <span class="home__brand-cn">伊斯特拉国际</span>
              <span class="home__brand-en">Estrella International</span>
            </p>
            <p class="home__motto" data-reveal>打破信息壁垒，让每个人都有机会重新选择人生的方向。</p>
            <p class="home__eyebrow" data-reveal>Global Programs Database</p>
            <h1 class="home__title" data-reveal>全球出国项目大全</h1>
            <p class="home__sub" data-reveal>探索全球 200+ 国际发展项目</p>
          </div>
        </header>

        <section class="home__cats" aria-label="项目分类">
          <div class="container">
            <div class="home__grid">${cards}</div>
          </div>
        </section>
      </div>
    `;
  }

  bind() {
    this.querySelectorAll('.home__cat').forEach((card) => {
      const catId = card.dataset.cat;
      const open = () => { location.href = `category.html?cat=${catId}`; };
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return; /* 二级分类/查看全部由链接处理 */
        open();
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  }
}

customElements.define('is-home', SiteHome);
