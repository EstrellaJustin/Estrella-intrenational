/* ============================================================
   组件：is-diy-visa · DIY 签证助手（项目数据驱动架构）
   用户选择签证项目 → 加载该项目专属：
   项目要求 / 用户填写信息（项目专属字段）/ DIY申请流程（独立配置）/
   材料清单（按项目展示）/ 当前完成状态
   数据源：Istra.diyGuides / Istra.diySteps / Istra.diyRequiredDocs
   无官网入口、无 AI 评分；状态本地持久化。
   ============================================================ */

class SiteDiyVisa extends HTMLElement {
  constructor() {
    super();
    this.state = {
      projectId: '',
      docs: {},    // docId -> 未开始/准备中/已完成
      steps: {},   // stepId -> true/false
      profile: {}  // form field key -> value
    };
  }

  connectedCallback() {
    const urlId = new URLSearchParams(location.search).get('id');
    const first = (Istra.diyGuides && Istra.diyGuides[0]) ? Istra.diyGuides[0].id : '';
    this.state.projectId = (urlId && (Istra.diyGuides || []).some((g) => g.id === urlId)) ? urlId : (first || '');
    this.loadProgress();
    this.render();
    this.bind();
    Istra.reveal.observe(this);
  }

  DISCLAIMER = '本DIY签证助手用于帮助用户了解签证申请流程、准备材料和规划申请步骤。本工具不代表任何政府机构、使领馆或签证审批部门。签证是否批准由相关国家官方机构独立审核。本站不保证签证成功。';

  /* ================= 数据辅助 ================= */

  guides() { return Istra.diyGuides || []; }
  guide(id) { return this.guides().find((g) => g.id === id) || null; }
  stepsOf(id) { return (Istra.diySteps || []).filter((s) => s.visa_project_id === id).sort((a, b) => a.step_order - b.step_order); }
  docsOf(id) { return (Istra.diyRequiredDocs || []).filter((d) => d.visa_project_id === id); }
  countryCn(id) { const c = (Istra.countries || []).find((x) => x.id === id); return c ? c.cn : id; }
  countryFlag(id) { const c = (Istra.countries || []).find((x) => x.id === id); return c ? c.flag : ''; }

  progressKey() { return 'diy_progress_' + this.state.projectId; }
  profileKey() { return 'diy_profile_' + this.state.projectId; }
  loadProgress() {
    try {
      const raw = localStorage.getItem(this.progressKey());
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.docs) this.state.docs = data.docs;
        if (data && data.steps) this.state.steps = data.steps;
      }
      const pRaw = localStorage.getItem(this.profileKey());
      if (pRaw) { const p = JSON.parse(pRaw); if (p) this.state.profile = p; }
    } catch (e) { /* ignore */ }
  }
  saveProgress() {
    try {
      localStorage.setItem(this.progressKey(), JSON.stringify({ docs: this.state.docs, steps: this.state.steps }));
      localStorage.setItem(this.profileKey(), JSON.stringify(this.state.profile));
    } catch (e) { /* ignore */ }
  }

  statusText(v) { return v === '已完成' ? '已完成' : v === '准备中' ? '准备中' : '未开始'; }

  /* ================= 渲染 ================= */

  render() {
    this.innerHTML = `
      <div class="diy">
        <header class="diy__head">
          <div class="container">
            <p class="diy__eyebrow" data-reveal>DIY Visa Assistant</p>
            <h1 class="diy__title" data-reveal>DIY 签证助手</h1>
            <p class="diy__sub" data-reveal>项目数据驱动：每个签证项目拥有专属流程、专属材料清单与专属信息填写，按步骤自主准备签证申请。</p>
          </div>
        </header>
        <div class="diy__body">
          <div class="container">
            <div class="diy__picker" data-reveal>
              <span class="diy__picker-label">选择签证项目：</span>
              <select class="diy__picker-select" data-picker="country"></select>
              <select class="diy__picker-select" data-picker="category"></select>
              <select class="diy__picker-select" data-picker="project"></select>
            </div>
            <div class="diy__guide" data-guide></div>
            <div class="diy__disclaimer" data-reveal>${this.DISCLAIMER}</div>
          </div>
        </div>
      </div>
    `;
    this.fillPickers();
    this.renderGuide();
  }

  fillPickers() {
    const countrySel = this.querySelector('[data-picker="country"]');
    const catSel = this.querySelector('[data-picker="category"]');
    const countries = (Istra.countries || []).filter((c) => c.is_available !== false);
    countrySel.innerHTML = '<option value="">全部国家</option>' + countries.map((c) => '<option value="' + c.id + '">' + c.cn + '</option>').join('');
    catSel.innerHTML = '<option value="">全部类别</option>' + this.categoryOptions().map((c) => '<option value="' + c.id + '">' + c.label + '</option>').join('');
    this.fillProjectPicker();
  }

  categoryOptions() {
    return [
      { id: 'work', label: '工作就业' }, { id: 'tech', label: '技术人才' }, { id: 'edu', label: '留学教育' },
      { id: 'invest', label: '投资创业' }, { id: 'talent', label: '人才移民' }, { id: 'family', label: '家庭团聚' },
      { id: 'pr', label: '永久居留' }, { id: 'nomad', label: '数字游民' }, { id: 'youth', label: '青年交流' },
      { id: 'special', label: '特殊人才' }
    ];
  }

  filteredGuides() {
    const countrySel = this.querySelector('[data-picker="country"]');
    const catSel = this.querySelector('[data-picker="category"]');
    const c = countrySel ? countrySel.value : '';
    const cat = catSel ? catSel.value : '';
    let list = this.guides();
    if (c) list = list.filter((g) => g.country === c);
    if (cat) list = list.filter((g) => {
      const full = (Istra.projects || []).find((p) => p.id === g.id);
      return full && full.category.id === cat;
    });
    return list;
  }

  fillProjectPicker() {
    const projSel = this.querySelector('[data-picker="project"]');
    const list = this.filteredGuides();
    if (!list.some((g) => g.id === this.state.projectId) && list.length) this.state.projectId = list[0].id;
    projSel.innerHTML = list.map((g) => '<option value="' + g.id + '"' + (g.id === this.state.projectId ? ' selected' : '') + '>' + this.countryCn(g.country) + ' · ' + g.visa_name + '</option>').join('');
  }

  renderGuide() {
    const g = this.guide(this.state.projectId);
    const guide = this.querySelector('[data-guide]');
    if (!g) { guide.innerHTML = '<p class="diy__empty">暂无可选签证项目，请选择其他项目。</p>'; return; }
    guide.innerHTML = this.guideHtml(g);
    this.renderProgress();
  }

  guideHtml(g) {
    const steps = this.stepsOf(g.id);
    const docs = this.docsOf(g.id);
    const flag = this.countryFlag(g.country);
    const fields = g.form_fields || [];
    const li = (arr) => (arr && arr.length ? '<ul class="diy__sec-list">' + arr.map((t) => '<li>' + t + '</li>').join('') + '</ul>' : '');
    return `
      <div class="diy__guide-head">
        <span class="diy__guide-flag"><img src="assets/flags/${flag}" alt="${this.countryCn(g.country)} 国旗" /></span>
        <div>
          <p class="diy__guide-country">${this.countryCn(g.country)} <small>${g.visa_type}</small></p>
          <h2 class="diy__guide-title">${g.visa_name} DIY指南</h2>
        </div>
      </div>

      <!-- 模块1：签证基础信息 + 项目要求 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>01</span>签证基础信息</h3>
        <div class="diy__facts">
          <div class="diy__fact"><span>签证名称</span><b>${g.visa_name}</b></div>
          <div class="diy__fact"><span>目标国家</span><b>${this.countryCn(g.country)}</b></div>
          <div class="diy__fact"><span>签证类型</span><b>${g.visa_type}</b></div>
          <div class="diy__fact"><span>适合人群</span><b>${g.target_people}</b></div>
          <div class="diy__fact"><span>申请难度</span><b>${g.difficulty}</b></div>
          <div class="diy__fact"><span>预计准备周期</span><b>${g.preparation_period}</b></div>
        </div>
        <h4 class="diy__subhead">项目要求（官方公开信息）</h4>
        ${li(g.requirements)}
      </section>

      <!-- 模块2：用户填写信息（项目专属字段） -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>02</span>用户填写信息</h3>
        <p class="diy__sec-desc">本项目的专属信息字段，填写后用于你的 DIY 准备核对，不会公开。</p>
        <div class="diy__profile">
          ${fields.map((f) => {
            const val = this.state.profile[f.key] || '';
            if (f.type === 'select') {
              return `
                <div class="field" data-field="${f.key}">
                  <label for="p-${f.key}">${f.label}</label>
                  <select id="p-${f.key}" data-profile="${f.key}">
                    <option value="">请选择</option>
                    ${(f.options || []).map((o) => `<option value="${o}"${val === o ? ' selected' : ''}>${o}</option>`).join('')}
                  </select>
                </div>`;
            }
            return `
              <div class="field" data-field="${f.key}">
                <label for="p-${f.key}">${f.label}</label>
                <input id="p-${f.key}" type="text" data-profile="${f.key}" value="${val}" placeholder="${f.placeholder || ''}" autocomplete="off" />
              </div>`;
          }).join('')}
        </div>
      </section>

      <!-- 模块3：DIY申请流程（项目独立配置） -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>03</span>DIY 申请流程</h3>
        <div class="diy__flow">
          ${steps.map((s) => {
            const done = !!this.state.steps[s.id];
            return `
              <article class="diy__flow-step${done ? ' is-done' : ''}">
                <div class="diy__flow-head">
                  <span class="diy__flow-no">${String(s.step_order).padStart(2, '0')}</span>
                  <h4 class="diy__flow-name">${s.step_name}</h4>
                  <button type="button" class="diy__flow-toggle${done ? ' is-checked' : ''}" data-step="${s.id}" aria-pressed="${done}">${done ? '✓ 已完成' : '标记完成'}</button>
                </div>
                <p class="diy__flow-desc">${s.step_description}</p>
                <p class="diy__flow-action">要做：${s.required_action}</p>
                <p class="diy__flow-src">来源：${s.source_reference} · 更新于 ${s.last_updated}</p>
              </article>`;
          }).join('')}
        </div>
      </section>

      <!-- 模块4：申请材料清单（按项目展示） -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>04</span>申请材料清单</h3>
        <p class="diy__sec-desc">材料按本项目官方要求展示，点击状态按钮更新准备状态。</p>
        <div class="diy__tasks">
          ${docs.map((d) => {
            const st = this.statusText(this.state.docs[d.id]);
            const cls = st === '已完成' ? ' is-done' : st === '准备中' ? ' is-progress' : '';
            const lv = d.requirement_level === '必须' ? ' is-req' : '';
            return `
              <article class="diy__task${cls}">
                <div class="diy__task-head">
                  <span class="diy__task-name">${d.document_name}</span>
                  <span class="diy__task-tag${lv}">${d.requirement_level}</span>
                  <span class="diy__task-status">${st}</span>
                </div>
                <p class="diy__task-desc">${d.document_description}</p>
                <p class="diy__task-src">官方要求：${d.official_requirement}<br>来源：${d.source_reference} · 更新于 ${d.last_updated}</p>
                <div class="diy__task-statusbar">
                  <button type="button" class="chip${st === '未开始' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="未开始">未开始</button>
                  <button type="button" class="chip${st === '准备中' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="准备中">准备中</button>
                  <button type="button" class="chip${st === '已完成' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="已完成">已完成</button>
                </div>
              </article>`;
          }).join('')}
        </div>
      </section>

      <!-- 模块5：我的DIY进度 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>05</span>我的 DIY 进度</h3>
        <div data-progress></div>
      </section>

      <!-- 模块6：常见问题 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>06</span>常见问题</h3>
        <div class="diy__faq">
          ${(g.faq || []).map((f) => `
            <div class="diy__faq-item">
              <p class="diy__faq-q">${f.q}</p>
              <p class="diy__faq-a">${f.a}</p>
            </div>`).join('')}
        </div>
      </section>
    `;
  }

  renderProgress() {
    const box = this.querySelector('[data-progress]');
    if (!box) return;
    const g = this.guide(this.state.projectId);
    if (!g) return;
    const docs = this.docsOf(g.id);
    const steps = this.stepsOf(g.id);
    const fields = g.form_fields || [];
    const docDone = docs.filter((d) => this.statusText(this.state.docs[d.id]) === '已完成').length;
    const stepDone = steps.filter((s) => !!this.state.steps[s.id]).length;
    const fieldDone = fields.filter((f) => {
      const v = this.state.profile[f.key];
      return typeof v === 'string' && v.trim() !== '';
    }).length;
    const total = docs.length + steps.length + fields.length;
    const done = docDone + stepDone + fieldDone;
    const pct = total ? Math.round((done / total) * 100) : 0;
    let next = '核对官方最新要求并准备提交';
    const undoneStep = steps.find((s) => !this.state.steps[s.id]);
    const undoneDoc = docs.find((d) => this.statusText(this.state.docs[d.id]) !== '已完成');
    const undoneField = fields.find((f) => !((this.state.profile[f.key] || '').trim()));
    if (undoneStep) next = undoneStep.step_name;
    else if (undoneDoc) next = '准备材料：' + undoneDoc.document_name;
    else if (undoneField) next = '填写信息：' + undoneField.label;
    box.innerHTML = `
      <div class="diy__progress-bar"><span style="width:${pct}%"></span><b>${pct}%</b></div>
      <div class="diy__progress-stats">
        <div class="diy__stat"><span>总体完成度</span><b>${pct}%</b></div>
        <div class="diy__stat"><span>已完成任务</span><b>${done} / ${total}</b></div>
        <div class="diy__stat"><span>未完成任务</span><b>${total - done}</b></div>
        <div class="diy__stat"><span>下一步行动</span><b>${next}</b></div>
      </div>`;
  }

  /* ================= 交互 ================= */

  bind() {
    this.querySelectorAll('[data-picker]').forEach((sel) => {
      sel.addEventListener('change', () => {
        if (sel.getAttribute('data-picker') === 'project') {
          this.state.projectId = sel.value;
          this.loadProgress();
          this.renderGuide();
        } else {
          this.fillProjectPicker();
        }
      });
    });

    const guide = this.querySelector('[data-guide]');
    guide.addEventListener('click', (e) => {
      const docStatus = e.target.closest('[data-doc-status]');
      if (docStatus) {
        const id = docStatus.getAttribute('data-doc-status');
        const val = docStatus.getAttribute('data-value');
        this.state.docs[id] = val;
        docStatus.parentNode.querySelectorAll('[data-doc-status]').forEach((b) => {
          b.classList.toggle('is-selected', b === docStatus);
          b.setAttribute('aria-pressed', String(b === docStatus));
        });
        const card = docStatus.closest('.diy__task');
        const st = this.statusText(this.state.docs[id]);
        if (card) {
          card.classList.toggle('is-done', st === '已完成');
          card.classList.toggle('is-progress', st === '准备中');
          const tag = card.querySelector('.diy__task-status');
          if (tag) tag.textContent = st;
        }
        this.saveProgress();
        this.renderProgress();
        return;
      }
      const step = e.target.closest('[data-step]');
      if (step) {
        const id = step.getAttribute('data-step');
        this.state.steps[id] = !this.state.steps[id];
        step.classList.toggle('is-checked', this.state.steps[id]);
        step.setAttribute('aria-pressed', String(this.state.steps[id]));
        step.textContent = this.state.steps[id] ? '✓ 已完成' : '标记完成';
        const article = step.closest('.diy__flow-step');
        if (article) article.classList.toggle('is-done', this.state.steps[id]);
        this.saveProgress();
        this.renderProgress();
      }
    });

    guide.addEventListener('input', (e) => {
      const inp = e.target.closest('[data-profile]');
      if (inp) {
        this.state.profile[inp.dataset.profile] = inp.value;
        this.saveProgress();
        this.renderProgress();
      }
    });
    guide.addEventListener('change', (e) => {
      const sel = e.target.closest('[data-profile]');
      if (sel) {
        this.state.profile[sel.dataset.profile] = sel.value;
        this.saveProgress();
        this.renderProgress();
      }
    });
  }
}

customElements.define('is-diy-visa', SiteDiyVisa);