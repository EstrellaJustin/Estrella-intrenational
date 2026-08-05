/* ============================================================
   组件：is-project-detail · 项目详情页（咨询报告风格）
   通过 ?id=xxx 从 Istra.projects 读取项目
   ============================================================ */

class SiteProjectDetail extends HTMLElement {
  connectedCallback() {
    this.id = new URLSearchParams(location.search).get('id');
    this.project = (Istra.projects || []).find((p) => p.id === this.id);
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    if (!this.project) { this.renderMissing(); return; }
    const p = this.project;
    const m = p.modules;

    const sideFacts = [
      { label: '国家', value: p.country.cn },
      { label: '签证类型', value: p.visaType },
      { label: '项目类别', value: p.category }
    ].concat((m.cost || []).map((c) => ({ label: c.label, value: c.value })));

    this.innerHTML = `
      <article class="detail">
        <header class="detail__head">
          <div class="container">
            <nav class="detail__crumbs" aria-label="面包屑">
              <a href="index.html">首页</a><span class="sep">/</span>
              <a href="projects.html">全球项目</a><span class="sep">/</span>
              <span>${p.name}</span>
            </nav>
            <div class="detail__head-main">
              <div data-reveal>
                <div class="detail__country">
                  <span class="detail__flag"><img src="assets/flags/${p.country.flag}" alt="${p.country.cn} 国旗" width="56" height="42" /></span>
                  <div>
                    <p class="detail__country-cn">${p.country.cn}</p>
                    <p class="detail__country-en">${p.country.en} · ${p.country.region}</p>
                  </div>
                </div>
                <h1 class="detail__title">${p.name}</h1>
                <div class="detail__badges">
                  <span class="detail__badge">${p.visaType}</span>
                  <span class="detail__badge detail__badge--plain">${p.category}</span>
                </div>
              </div>
              <div class="detail__head-actions" data-reveal>
                <a class="btn btn--primary" href="ai-assessment.html">立即评估 <span class="btn-arrow">→</span></a>
                <a class="btn btn--ghost-light" href="projects.html">返回项目列表</a>
              </div>
            </div>
          </div>
        </header>

        <div class="detail__body">
          <div class="container detail__grid">
            <div class="report" data-reveal>
              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">01</span><h2 class="report__module-title">项目介绍</h2></div>
                <p class="report__body">${m.overview}</p>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">02</span><h2 class="report__module-title">适合人群</h2></div>
                <ul class="report__list report__body">${(m.audience || []).map((t) => `<li>${t}</li>`).join('')}</ul>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">03</span><h2 class="report__module-title">申请条件</h2></div>
                <ul class="report__list report__body">${(m.conditions || []).map((t) => `<li>${t}</li>`).join('')}</ul>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">04</span><h2 class="report__module-title">申请材料</h2></div>
                <ul class="report__list report__body">${(m.materials || []).map((t) => `<li>${t}</li>`).join('')}</ul>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">05</span><h2 class="report__module-title">申请流程</h2></div>
                <div class="report__steps report__body">
                  ${(m.process || []).map((t, i) => `
                    <div class="report__step">
                      <span class="report__step-num">${String(i + 1).padStart(2, '0')}</span>
                      <span class="report__step-text">${t}</span>
                    </div>`).join('')}
                </div>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">06</span><h2 class="report__module-title">费用与周期</h2></div>
                <div class="report__cost report__body">
                  ${(m.cost || []).map((c) => `<div class="report__cost-row"><span class="report__cost-label">${c.label}</span><span class="report__cost-value">${c.value}</span></div>`).join('')}
                </div>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">07</span><h2 class="report__module-title">优势与限制</h2></div>
                <div class="report__proscons report__body">
                  <div>
                    <h3>优势</h3>
                    <ul class="report__list report__list--check">
                      ${(m.prosCons.pros || []).map((t) => `<li>${t}</li>`).join('')}
                    </ul>
                  </div>
                  <div>
                    <h3>限制</h3>
                    <ul class="report__list report__list--minus">
                      ${(m.prosCons.cons || []).map((t) => `<li>${t}</li>`).join('')}
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            <aside class="detail__side">
              <div class="side-panel" data-reveal>
                <h2 class="side-panel__title">关键信息</h2>
                <div class="side-panel__rows">
                  ${sideFacts.map((f) => `<div class="side-panel__row"><span class="side-panel__label">${f.label}</span><span class="side-panel__value">${f.value}</span></div>`).join('')}
                </div>
              </div>
              <div class="side-panel" data-reveal>
                <div class="side-panel__actions">
                  <a class="btn btn--primary" href="ai-assessment.html">立即评估 <span class="btn-arrow">→</span></a>
                  <a class="btn btn--ghost-dark" href="projects.html">返回项目列表</a>
                </div>
                <p class="side-panel__note">* 本项目信息为展示数据，具体政策、费用与周期以官方最新公布为准。AI 分析引擎将在后续阶段接入。</p>
              </div>
            </aside>
          </div>
        </div>
      </article>
    `;
  }

  renderMissing() {
    this.innerHTML = `
      <div class="detail__missing">
        <h1>未找到该项目</h1>
        <p>项目可能已更新，请返回项目大全重新选择。</p>
        <a class="btn btn--primary" href="projects.html">返回项目大全</a>
      </div>
    `;
  }
}
customElements.define('is-project-detail', SiteProjectDetail);
