/* ============================================================
   组件：is-project-detail · 项目详情（咨询报告 · 9 大模块）
   数据来自 Istra.projects（projects.json 生成）
   ============================================================ */

class SiteProjectDetail extends HTMLElement {
  connectedCallback() {
    this.id = new URLSearchParams(location.search).get('id');
    this.project = (Istra.projects || []).find((p) => p.id === this.id);
    this.render();
    Istra.reveal.observe(this);
  }

  budgetLabel(v) {
    return { low: '50 万以内', mid: '50–150 万', high: '150–300 万', vip: '300 万以上' }[v] || '以官方公布为准';
  }

  render() {
    if (!this.project) { this.renderMissing(); return; }
    const p = this.project;
    const c = p.country;

    const sideFacts = [
      { label: '国家', value: c.cn },
      { label: '签证类型', value: p.visaType },
      { label: '一级分类', value: p.category.name },
      { label: '子分类', value: p.subcategory.name },
      { label: '办理周期', value: p.duration },
      { label: '预算参考', value: this.budgetLabel(p.budget) }
    ];

    this.innerHTML = `
      <article class="detail">
        <header class="detail__head">
          <div class="container">
            <nav class="detail__crumbs" aria-label="面包屑">
              <a href="index.html">首页</a><span class="sep">/</span>
              <a href="projects.html">项目大全</a><span class="sep">/</span>
              <span>${p.name}</span>
            </nav>
            <div class="detail__head-main">
              <div data-reveal>
                <div class="detail__country">
                  <span class="detail__flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" width="56" height="42" /></span>
                  <div>
                    <p class="detail__country-cn">${c.cn}</p>
                    <p class="detail__country-en">${c.en} · ${c.region}</p>
                  </div>
                </div>
                <h1 class="detail__title">${p.name}</h1>
                <div class="detail__badges">
                  <span class="detail__badge">${p.visaType}</span>
                  <span class="detail__badge detail__badge--plain">${p.category.name}</span>
                  <span class="detail__badge detail__badge--plain">${p.subcategory.name}</span>
                </div>
              </div>
              <div class="detail__head-actions" data-reveal>
                <a class="btn btn--primary" href="ai-assessment.html">立即评估 <span class="btn-arrow">→</span></a>
                <a class="btn btn--ghost-light" href="projects.html">返回项目大全</a>
              </div>
            </div>
          </div>
        </header>

        <div class="detail__body">
          <div class="container detail__grid">
            <div class="report" data-reveal>
              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">01</span><h2 class="report__module-title">项目介绍</h2></div>
                <p class="report__body">${p.introduction}</p>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">02</span><h2 class="report__module-title">适合人群</h2></div>
                <ul class="report__list report__body">${(p.targetUsers || []).map((t) => `<li>${t}</li>`).join('')}</ul>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">03</span><h2 class="report__module-title">申请条件</h2></div>
                <ul class="report__list report__body">${(p.requirements || []).map((t) => `<li>${t}</li>`).join('')}</ul>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">04</span><h2 class="report__module-title">所需材料</h2></div>
                <ul class="report__list report__body">${(p.documents || []).map((t) => `<li>${t}</li>`).join('')}</ul>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">05</span><h2 class="report__module-title">申请流程</h2></div>
                <div class="report__steps report__body">
                  ${(p.process || []).map((t, i) => `
                    <div class="report__step">
                      <span class="report__step-num">${String(i + 1).padStart(2, '0')}</span>
                      <span class="report__step-text">${t}</span>
                    </div>`).join('')}
                </div>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">06</span><h2 class="report__module-title">费用与周期</h2></div>
                <div class="report__cost report__body">
                  ${(p.cost || []).map((x) => `<div class="report__cost-row"><span class="report__cost-label">${x.label}</span><span class="report__cost-value">${x.value}</span></div>`).join('')}
                  <div class="report__cost-row"><span class="report__cost-label">办理周期</span><span class="report__cost-value">${p.duration}</span></div>
                </div>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">07</span><h2 class="report__module-title">优势</h2></div>
                <ul class="report__list report__list--check report__body">${(p.advantages || []).map((t) => `<li>${t}</li>`).join('')}</ul>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">08</span><h2 class="report__module-title">限制</h2></div>
                <ul class="report__list report__list--minus report__body">${(p.limitations || []).map((t) => `<li>${t}</li>`).join('')}</ul>
              </section>

              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">09</span><h2 class="report__module-title">常见问题</h2></div>
                <div class="report__faq report__body">
                  ${(p.faq || []).map((f) => `
                    <details class="faq-item">
                      <summary>${f.q}</summary>
                      <p>${f.a}</p>
                    </details>`).join('')}
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
                  <a class="btn btn--ghost-dark" href="projects.html">返回项目大全</a>
                </div>
                <p class="side-panel__note">* 项目信息为数据库展示内容，具体政策、费用与周期以各国官方最新公布为准。</p>
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
