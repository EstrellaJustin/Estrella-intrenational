/* ============================================================
   组件：is-about · 关于我们页
   ============================================================ */

class SiteAbout extends HTMLElement {
  connectedCallback() {
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    const caps = [
      { idx: '01', t: '全球国家数据库', d: '覆盖全球 50+ 国家的政策、机遇与发展环境，为身份规划提供数据基础。' },
      { idx: '02', t: '全球项目数据库', d: '收录 200+ 出国项目，覆盖工作、教育、投资、创业与长期身份等十大分类。' },
      { idx: '03', t: 'AI 智能匹配', d: '基于个人与家庭背景，智能分析适合的国际发展路线与优先方案。' }
    ];
    const principles = [
      { idx: 'A', t: '数据驱动', d: '以真实政策与项目数据为基础，让每一次规划都有据可依。' },
      { idx: 'B', t: '客观透明', d: '清晰呈现申请条件、费用与周期，以各国官方最新公布为准。' },
      { idx: 'C', t: '长期视野', d: '从身份、事业与家庭角度出发，构建可持续的全球发展方案。' }
    ];

    this.innerHTML = `
      <div class="about">
        <header class="about__head">
          <div class="container">
            <p class="about__eyebrow" data-reveal>About Estrella International</p>
            <h1 class="about__title" data-reveal>关于我们</h1>
            <p class="about__sub" data-reveal>高端国际身份规划平台 · 全球机会探索的智能起点</p>
          </div>
        </header>

        <div class="about__body">
          <div class="container">
            <p class="about__intro" data-reveal>
              伊斯特拉国际以「飞向全球，探索新的可能」为理念，通过全球国家数据库、
              全球项目数据库与 AI 智能分析，帮助个人与家庭发现适合自己的国际发展路径。
              我们不是传统中介，而是一个面向全球机会探索与身份规划的数据智能平台。打破信息壁垒，让每个人都有机会重新选择人生的方向。
            </p>

            <p class="about__contact" data-reveal>售后客服 QQ：3279331550 · 服务时间 9:00 – 21:00</p>
            <div class="legal-note about__legal" data-reveal>
              <p>伊斯特拉国际（Estrella International）是一个全球信息探索与 AI 辅助分析平台。本站信息来源于公开资料整理、官方公开信息以及人工智能辅助分析，仅供信息展示与比较参考，不构成移民、法律、财务或职业建议；最终申请结果以相关国家政府、官方机构审核为准。</p>
              <a href="disclaimer.html">查看完整免责声明 →</a>
            </div>

            <div class="about__caps" id="philosophy">
              ${caps.map((x) => `
                <div class="about__cap" data-reveal>
                  <p class="about__cap-num">${x.idx}</p>
                  <h3 class="about__cap-title">${x.t}</h3>
                  <p class="about__cap-desc">${x.d}</p>
                </div>`).join('')}
            </div>

            <div class="about__principles">
              <div class="about__principles-head section-head" data-reveal>
                <p class="eyebrow">Principles</p>
                <h2 class="title">我们的原则</h2>
              </div>
              <div class="about__principles-grid">
                ${principles.map((x) => `
                  <div class="about__principle" data-reveal>
                    <p class="about__principle-idx">${x.idx}</p>
                    <h3 class="about__principle-title">${x.t}</h3>
                    <p class="about__principle-desc">${x.d}</p>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('is-about', SiteAbout);
