/* ============================================================
   组件：is-project-detail · 项目详情（咨询报告 · 9 大模块）
   数据来自 Istra.projects（projects.json 生成）
   ============================================================ */

class SiteProjectDetail extends HTMLElement {
  connectedCallback() {
    this.id = new URLSearchParams(location.search).get('id');
    this.project = (Istra.projects || []).find((p) => p.id === this.id);
    this.render();
    this.bindUserFeatures();
    this.bindAssessmentStatus();
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
      { label: '预算参考', value: p.budget.label + '（' + p.budget.range + '）' }
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
                <a class="btn btn--primary" href="ai-assessment.html" data-eval>立即评估 <span class="btn-arrow">→</span></a>
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

              ﻿              <section class="report__module">
                <div class="report__module-head"><span class="report__module-num">06</span><h2 class="report__module-title">费用与周期</h2></div>
                <div class="budget report__body">
                  <div class="budget__head">
                    <span class="budget__badge">${p.budget.label}</span>
                    <span class="budget__range">${p.budget.range}</span>
                    <span class="budget__desc">${p.budget.desc}</span>
                  </div>
                  ${p.budget.investment ? `
                  <div class="budget__special">
                    <div class="budget__special-row"><span>投资金额</span><b>${p.budget.investment}</b></div>
                    <div class="budget__special-row"><span>服务费用</span><b>${p.budget.fees}</b></div>
                  </div>` : ''}
                  ${p.budget.tuition ? `
                  <div class="budget__special">
                    <div class="budget__special-row"><span>学费</span><b>${p.budget.tuition}</b></div>
                    <div class="budget__special-row"><span>生活费</span><b>${p.budget.living}</b></div>
                    <div class="budget__special-row"><span>一年总成本</span><b>${p.budget.total}</b></div>
                  </div>` : ''}
                  <div class="budget__cols">
                    <div class="budget__col">
                      <h4 class="budget__col-title">官方申请费用</h4>
                      <ul class="budget__list">
                        ${(p.budget.official || []).map((x) => `<li><span>${x.label}</span><b>${x.value}</b></li>`).join('')}
                      </ul>
                    </div>
                    <div class="budget__col">
                      <h4 class="budget__col-title">前期准备成本</h4>
                      <ul class="budget__list">
                        ${(p.budget.preparation || []).map((x) => `<li><span>${x.label}</span><b>${x.value}</b></li>`).join('')}
                      </ul>
                    </div>
                    <div class="budget__col">
                      <h4 class="budget__col-title">初期落地成本</h4>
                      <ul class="budget__list">
                        ${(p.budget.settlement || []).map((x) => `<li><span>${x.label}</span><b>${x.value}</b></li>`).join('')}
                      </ul>
                    </div>
                  </div>
                  <div class="report__cost">
                    <div class="report__cost-row"><span class="report__cost-label">资金证明</span><span class="report__cost-value">${p.budget.fundsProof}</span></div>
                    <div class="report__cost-row"><span class="report__cost-label">建议准备</span><span class="report__cost-value">${p.budget.suggested}</span></div>
                    <div class="report__cost-row"><span class="report__cost-label">办理周期</span><span class="report__cost-value">${p.duration}</span></div>
                  </div>
                  <p class="budget__note">* 以上预算为综合参考，不代表官方收费标准。具体费用以官方与机构实际收取为准。</p>
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
                  <a class="btn btn--primary" href="ai-assessment.html" data-eval>立即评估 <span class="btn-arrow">→</span></a>
                  <a class="btn btn--ghost-dark" href="projects.html">返回项目大全</a>
                  <button type="button" class="btn btn--ghost-dark side-panel__fav" data-fav>☆ 收藏项目</button>
                </div>
                <p class="side-panel__note">* 项目信息为数据库展示内容，具体政策、费用与周期以各国官方最新公布为准。</p>
              </div>
            </aside>
          </div>
        </div>
      </article>
    `;
  }


  /* 用户系统：行为记录 + 收藏（登录用户） */
  record(type, refType, refId, title) {
    let token = '';
    try { token = localStorage.getItem('istra_token') || ''; } catch (e) {}
    if (!token || !window.Istra || !Istra.api) return;
    Istra.api.recordBehavior({ type, refType, refId, title }).catch(() => {});
  }
  bindUserFeatures() {
    const p = this.project;
    if (!p) return;
    this.record('view_project', 'project', p.id, p.name);
    const btn = this.querySelector('[data-fav]');
    if (!btn) return;
    let token = '';
    try { token = localStorage.getItem('istra_token') || ''; } catch (e) {}
    if (!token) {
      btn.addEventListener('click', () => { location.href = 'login.html?next=project-detail.html?id=' + p.id; });
      return;
    }
    btn.addEventListener('click', () => {
      this.record('favorite_project', 'project', p.id, p.name);
      btn.textContent = '★ 已收藏';
      btn.disabled = true;
    });
  }

  /* 评估状态动态按钮：未登录=开始AI评估 / 已登录未评估=立即评估 / 已评估=查看我的匹配分析+获取申请方案 */
  bindAssessmentStatus() {
    const primary = this.querySelectorAll('[data-eval]');
    let token = '';
    try { token = localStorage.getItem('istra_token') || ''; } catch (e) {}
    const setEval = (mode) => {
      primary.forEach((el) => {
        if (mode === 'assessed') {
          el.href = 'profile.html#sec-assess';
          el.textContent = '查看我的匹配分析';
        } else {
          el.href = 'ai-assessment.html';
          el.textContent = token ? '立即评估' : '开始AI评估';
        }
      });
      if (mode === 'assessed') {
        const side = this.querySelector('.side-panel__actions');
        if (side && !side.querySelector('[data-plan-link]')) {
          const plan = document.createElement('a');
          plan.className = 'btn btn--ghost-dark';
          plan.href = 'profile.html#sec-recs';
          plan.textContent = '获取申请方案';
          plan.setAttribute('data-plan-link', '1');
          const fav = side.querySelector('[data-fav]');
          if (fav) side.insertBefore(plan, fav); else side.appendChild(plan);
        }
      }
    };
    if (!token) { setEval('guest'); return; }
    if (!window.Istra || !Istra.api) { setEval('guest'); return; }
    Istra.api.listAssessments().then((d) => {
      setEval((d.assessments && d.assessments.length > 0) ? 'assessed' : 'user');
    }).catch(() => setEval('user'));
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
