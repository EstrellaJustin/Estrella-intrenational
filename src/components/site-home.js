/* ============================================================
   组件：is-home · 首页 = 全球出国项目分类系统
   一级分类展开二级分类，点击二级分类进入项目列表页
   仅分类内容，无统计 / 热门 / AI 入口 / 营销模块
   ============================================================ */

class SiteHome extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bind();
    Istra.reveal.observe(this);
  }

  render() {
    const categories = Istra.categories || [];

    const items = categories
      .map((c, i) => `
        <div class="home__cat" data-cat="${c.id}" data-reveal>
          <button class="home__cat-head" type="button" aria-expanded="false" aria-controls="cat-body-${c.id}">
            <span class="home__cat-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="home__cat-name">${c.name}</span>
            <span class="home__cat-en">${c.en}</span>
            <span class="home__cat-arrow" aria-hidden="true">+</span>
          </button>
          <div class="home__cat-body" id="cat-body-${c.id}">
            <div class="home__cat-inner">
              <div class="home__subs">
                ${c.subs.map((s) => `
                  <a class="home__sub" href="projects.html?cat=${c.id}&sub=${s.id}">
                    ${s.name} <span class="arr">→</span>
                  </a>`).join('')}
              </div>
            </div>
          </div>
        </div>`)
      .join('');

    this.innerHTML = `
      <div class="home">
        <header class="home__head">
          <div class="container">
            <p class="home__eyebrow" data-reveal>Global Programs Database</p>
            <h1 class="home__title" data-reveal>全球出国项目大全</h1>
            <p class="home__sub" data-reveal>探索全球 200+ 国际发展项目</p>
          </div>
        </header>

        <section class="home__cats" aria-label="项目分类">
          <div class="container">
            <div class="home__accordion">${items}</div>
          </div>
        </section>
      </div>
    `;
  }

  bind() {
    this.querySelectorAll('.home__cat').forEach((item) => {
      const head = item.querySelector('.home__cat-head');
      head.addEventListener('click', () => {
        const open = item.classList.toggle('is-open');
        head.setAttribute('aria-expanded', String(open));
      });
    });
  }
}

customElements.define('is-home', SiteHome);
