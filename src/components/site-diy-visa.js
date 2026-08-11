/* ============================================================
   组件：is-diy-visa · DIY 签证助手（独立配置数据驱动系统 v3）
   每个签证项目独立：申请资格条件 / 用户填写问题 / 专属材料 / 前置任务 / DIY流程
   数据源：Istra.diyConfigs / diyConditions / diyQuestions / diyRequiredDocs / diyPrepTasks / diySteps
   模块1 签证基础信息 / 模块2 确认条件（动态问题 + 符合判定）/
   模块3 专属材料 / 模块4 前置任务 / 模块5 DIY流程 + 免责声明
   无官网入口、无 AI 评分；状态本地持久化；新增签证只需增加数据。
   ============================================================ */

class SiteDiyVisa extends HTMLElement {
  constructor() {
    super();
    this.state = {
      projectId: '',
      docs: {},   // docId -> 未开始/准备中/已完成
      tasks: {},  // taskId -> true/false
      steps: {},  // stepId -> true/false
      answers: {} // questionId -> 用户回答
    };
  }

  connectedCallback() {
    const urlId = new URLSearchParams(location.search).get('id');
    const first = (Istra.diyConfigs && Istra.diyConfigs[0]) ? Istra.diyConfigs[0].id : '';
    this.state.projectId = (urlId && (Istra.diyConfigs || []).some((c) => c.id === urlId)) ? urlId : (first || '');
    this.loadProgress();
    this.render();
    this.bind();
    Istra.reveal.observe(this);
  }

  DISCLAIMER = '本DIY签证助手用于帮助用户了解签证申请流程、准备材料和规划申请步骤。本工具不代表任何政府机构、使领馆或签证审批部门。签证是否批准由相关国家官方机构独立审核。本站不保证签证成功。';

  /* ================= 数据辅助 ================= */

  config(id) { return (Istra.diyConfigs || []).find((c) => c.id === id) || null; }
  conditionsOf(id) { return (Istra.diyConditions || []).filter((c) => c.visa_id === id); }
  questionsOf(id) { return (Istra.diyQuestions || []).filter((q) => q.visa_id === id); }
  docsOf(id) { return (Istra.diyRequiredDocs || []).filter((d) => d.visa_id === id); }
  tasksOf(id) { return (Istra.diyPrepTasks || []).filter((t) => t.visa_id === id).sort((a, b) => (a.task_order || 0) - (b.task_order || 0)); }
  stepsOf(id) { return (Istra.diySteps || []).filter((s) => s.visa_id === id).sort((a, b) => (a.step_order || 0) - (b.step_order || 0)); }
  guideMeta(id) {
    const g = (Istra.diyGuides || []).find((x) => x.id === id);
    return g || null;
  }
  countryCn(id) { const c = (Istra.countries || []).find((x) => x.id === id); return c ? c.cn : id; }
  countryFlag(id) { const c = (Istra.countries || []).find((x) => x.id === id); return c ? c.flag : ''; }

  progressKey() { return 'diy_v3_' + this.state.projectId; }
  loadProgress() {
    try {
      const raw = localStorage.getItem(this.progressKey());
      if (raw) {
        const d = JSON.parse(raw);
        if (d && d.docs) this.state.docs = d.docs;
        if (d && d.tasks) this.state.tasks = d.tasks;
        if (d && d.steps) this.state.steps = d.steps;
        if (d && d.answers) this.state.answers = d.answers;
      }
    } catch (e) { /* ignore */ }
  }
  saveProgress() {
    try { localStorage.setItem(this.progressKey(), JSON.stringify({ docs: this.state.docs, tasks: this.state.tasks, steps: this.state.steps, answers: this.state.answers })); } catch (e) { /* ignore */ }
  }

  statusText(v) { return v === '已完成' ? '已完成' : v === '准备中' ? '准备中' : '未开始'; }

  /* 条件判定：符合 / 不符合 / 需要补充 */
  conditionResult(cond) {
    const q = (this.questionsOf(this.state.projectId) || []).find((x) => (x.condition_type || '') === cond.condition_type);
    const val = q ? (this.state.answers[q.id] || '') : '';
    if (!val) return 'need';
    const rule = q ? (q.validation_rule || '') : '';
    if (rule.indexOf('min:') >= 0) {
      const nums = rule.split('|').filter((r) => r.indexOf('min:') === 0 || r.indexOf('max:') === 0);
      const n = parseFloat(val);
      for (const r of nums) {
        if (r.indexOf('min:') === 0 && !(n >= parseFloat(r.slice(4)))) return 'no';
        if (r.indexOf('max:') === 0 && !(n <= parseFloat(r.slice(4)))) return 'no';
      }
      return 'yes';
    }
    if (rule.indexOf('match:') >= 0) {
      const allowed = rule.slice(6).split('|');
      return allowed.indexOf(val) >= 0 ? 'yes' : 'no';
    }
    return val.trim() ? 'yes' : 'need';
  }

  /* ================= 渲染 ================= */

  render() {
    this.innerHTML = `
      <div class="diy">
        <header class="diy__head">
          <div class="container">
            <p class="diy__eyebrow" data-reveal>DIY Visa Assistant</p>
            <h1 class="diy__title" data-reveal>DIY 签证助手</h1>
            <p class="diy__sub" data-reveal>独立配置数据驱动：每个签证项目拥有专属申请条件、专属问题、专属材料、专属前置任务与专属流程。</p>
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

  filteredConfigs() {
    const countrySel = this.querySelector('[data-picker="country"]');
    const catSel = this.querySelector('[data-picker="category"]');
    const c = countrySel ? countrySel.value : '';
    const cat = catSel ? catSel.value : '';
    let list = Istra.diyConfigs || [];
    if (c) list = list.filter((x) => x.country === c);
    if (cat) list = list.filter((x) => {
      const full = (Istra.projects || []).find((p) => p.id === x.id);
      return full && full.category.id === cat;
    });
    return list;
  }

  fillProjectPicker() {
    const projSel = this.querySelector('[data-picker="project"]');
    const list = this.filteredConfigs();
    if (!list.some((c) => c.id === this.state.projectId) && list.length) this.state.projectId = list[0].id;
    projSel.innerHTML = list.map((c) => '<option value="' + c.id + '"' + (c.id === this.state.projectId ? ' selected' : '') + '>' + this.countryCn(c.country) + ' · ' + c.visa_name + '</option>').join('');
  }

  renderGuide() {
    const c = this.config(this.state.projectId);
    const guide = this.querySelector('[data-guide]');
    if (!c) { guide.innerHTML = '<p class="diy__empty">暂无可选签证项目，请选择其他项目。</p>'; return; }
    guide.innerHTML = this.guideHtml(c);
    this.renderProgress();
    this.renderConditions();
  }

  guideHtml(c) {
    const meta = this.guideMeta(c.id);
    const flag = this.countryFlag(c.country);
    const docs = this.docsOf(c.id);
    const tasks = this.tasksOf(c.id);
    const steps = this.stepsOf(c.id);
    return `
      <div class="diy__guide-head">
        <span class="diy__guide-flag"><img src="assets/flags/${flag}" alt="${this.countryCn(c.country)} 国旗" /></span>
        <div>
          <p class="diy__guide-country">${this.countryCn(c.country)} <small>${c.visa_type || ''}</small></p>
          <h2 class="diy__guide-title">${c.visa_name} DIY</h2>
        </div>
      </div>

      <!-- 模块1：签证基础信息 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>01</span>签证基础信息</h3>
        <div class="diy__facts">
          <div class="diy__fact"><span>目标国家</span><b>${this.countryCn(c.country)}</b></div>
          <div class="diy__fact"><span>签证名称</span><b>${c.visa_name}</b></div>
          <div class="diy__fact"><span>适合人群</span><b>${meta ? meta.target_people : '—'}</b></div>
          <div class="diy__fact"><span>申请难度</span><b>${meta ? meta.difficulty : '—'}</b></div>
          <div class="diy__fact"><span>预计准备周期</span><b>${meta ? meta.preparation_period : '—'}</b></div>
        </div>
      </section>

      <!-- 模块2：确认自己是否符合条件 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>02</span>确认自己是否符合条件</h3>
        <p class="diy__sec-desc">回答以下专属问题，系统将逐项判断：符合 / 不符合 / 需要补充。</p>
        <div class="diy__questions" data-questions></div>
        <div class="diy__conditions" data-conditions></div>
      </section>

      <!-- 模块3：专属申请材料 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>03</span>专属申请材料</h3>
        <div class="diy__tasks">
          ${docs.map((d) => {
            const st = this.statusText(this.state.docs[d.id]);
            const cls = st === '已完成' ? ' is-done' : st === '准备中' ? ' is-progress' : '';
            return `
              <article class="diy__task${cls}">
                <div class="diy__task-head">
                  <span class="diy__task-name">${d.document_name}</span>
                  <span class="diy__task-tag${d.is_required ? ' is-req' : ''}">${d.is_required ? '必须' : '可选'}</span>
                  <span class="diy__task-status">${st}</span>
                </div>
                <p class="diy__task-desc"><span>用途：</span>${d.description}</p>
                <p class="diy__task-src">官方要求：${d.official_requirement}${d.alternative_document ? '<br>可替代材料：' + d.alternative_document : ''}<br>来源：${d.source_reference} · 更新于 ${d.last_updated}</p>
                <div class="diy__task-statusbar">
                  <button type="button" class="chip${st === '未开始' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="未开始">未开始</button>
                  <button type="button" class="chip${st === '准备中' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="准备中">准备中</button>
                  <button type="button" class="chip${st === '已完成' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="已完成">已完成</button>
                </div>
              </article>`;
          }).join('')}
        </div>
      </section>

      <!-- 模块4：完成必要前置要求 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>04</span>完成必要前置要求</h3>
        <div class="diy__prep">
          ${tasks.map((t) => {
            const done = !!this.state.tasks[t.id];
            return `
              <article class="diy__prep-item${done ? ' is-done' : ''}">
                <button type="button" class="diy__prep-check${done ? ' is-checked' : ''}" data-prep="${t.id}" aria-pressed="${done}">${done ? '✓' : '○'}</button>
                <div class="diy__prep-body">
                  <p class="diy__prep-name">${t.task_name}<span class="diy__prep-tag${t.required !== false ? ' is-req' : ''}">${t.required !== false ? '必须' : '建议'}</span></p>
                  <p class="diy__prep-desc">${t.task_description}</p>
                  <p class="diy__prep-meta">预计时间：${t.estimated_time || '—'} · 来源：${t.source_reference || '官方'}</p>
                </div>
              </article>`;
          }).join('')}
        </div>
      </section>

      <!-- 模块5：DIY申请流程 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>05</span>DIY 申请流程</h3>
        <div class="diy__flow">
          ${steps.map((s) => {
            const done = !!this.state.steps[s.id];
            return `
              <article class="diy__flow-step${done ? ' is-done' : ''}">
                <div class="diy__flow-head">
                  <span class="diy__flow-no">${String(s.step_order).padStart(2, '0')}</span>
                  <h4 class="diy__flow-name">${s.step_title}</h4>
                  <button type="button" class="diy__flow-toggle${done ? ' is-checked' : ''}" data-step="${s.id}" aria-pressed="${done}">${done ? '✓ 已完成' : '标记完成'}</button>
                </div>
                <p class="diy__flow-desc">${s.step_description}</p>
                <p class="diy__flow-action">用户操作：${s.user_action}</p>
                <p class="diy__flow-src">来源：${s.source_reference} · 更新于 ${s.last_updated}</p>
              </article>`;
          }).join('')}
        </div>
      </section>

      <!-- 模块6：我的DIY进度 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>06</span>我的 DIY 进度</h3>
        <div data-progress></div>
      </section>
    `;
  }

  renderQuestions() {
    const box = this.querySelector('[data-questions]');
    if (!box) return;
    const qs = this.questionsOf(this.state.projectId);
    box.innerHTML = qs.map((q) => {
      const val = this.state.answers[q.id] || '';
      if (q.answer_type === 'number') {
        return `
          <div class="field" data-qfield="${q.id}">
            <label for="q-${q.id}">${q.question}</label>
            <input id="q-${q.id}" type="number" data-question="${q.id}" value="${val}" placeholder="请输入" autocomplete="off" />
          </div>`;
      }
      if (q.answer_type === 'select') {
        return `
          <div class="field" data-qfield="${q.id}">
            <label for="q-${q.id}">${q.question}</label>
            <select id="q-${q.id}" data-question="${q.id}">
              <option value="">请选择</option>
              ${(q.options || '').split('|').filter(Boolean).map((o) => `<option value="${o}"${val === o ? ' selected' : ''}>${o}</option>`).join('')}
            </select>
          </div>`;
      }
      return `
        <div class="field" data-qfield="${q.id}">
          <label for="q-${q.id}">${q.question}</label>
          <input id="q-${q.id}" type="text" data-question="${q.id}" value="${val}" placeholder="请输入" autocomplete="off" />
        </div>`;
    }).join('');
  }

  renderConditions() {
    this.renderQuestions();
    const box = this.querySelector('[data-conditions]');
    if (!box) return;
    const conds = this.conditionsOf(this.state.projectId);
    box.innerHTML = conds.map((c) => {
      const r = this.conditionResult(c);
      const label = r === 'yes' ? '符合' : r === 'no' ? '不符合' : '需要补充';
      return `
        <div class="diy__cond is-${r}">
          <span class="diy__cond-badge">${label}</span>
          <div class="diy__cond-body">
            <p class="diy__cond-name">${c.condition_name}<span class="diy__cond-tag${c.required ? ' is-req' : ''}">${c.required ? '必须' : '可选'}</span></p>
            <p class="diy__cond-desc">${c.condition_description}</p>
            <p class="diy__cond-src">来源：${c.source_reference} · 更新于 ${c.last_updated}</p>
          </div>
        </div>`;
    }).join('');
  }

  renderProgress() {
    const box = this.querySelector('[data-progress]');
    if (!box) return;
    const docs = this.docsOf(this.state.projectId);
    const tasks = this.tasksOf(this.state.projectId);
    const steps = this.stepsOf(this.state.projectId);
    const qs = this.questionsOf(this.state.projectId);
    const docDone = docs.filter((d) => this.statusText(this.state.docs[d.id]) === '已完成').length;
    const taskDone = tasks.filter((t) => !!this.state.tasks[t.id]).length;
    const stepDone = steps.filter((s) => !!this.state.steps[s.id]).length;
    const qDone = qs.filter((q) => (this.state.answers[q.id] || '').trim() !== '').length;
    const total = docs.length + tasks.length + steps.length + qs.length;
    const done = docDone + taskDone + stepDone + qDone;
    const pct = total ? Math.round((done / total) * 100) : 0;
    let next = '核对官方最新要求并准备提交';
    const undoneStep = steps.find((s) => !this.state.steps[s.id]);
    const undoneDoc = docs.find((d) => this.statusText(this.state.docs[d.id]) !== '已完成');
    const undoneTask = tasks.find((t) => !this.state.tasks[t.id]);
    const undoneQ = qs.find((q) => !(this.state.answers[q.id] || '').trim());
    if (undoneQ) next = '回答问题：' + undoneQ.question;
    else if (undoneTask) next = '完成任务：' + undoneTask.task_name;
    else if (undoneDoc) next = '准备材料：' + undoneDoc.document_name;
    else if (undoneStep) next = undoneStep.step_title;
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
      const prep = e.target.closest('[data-prep]');
      if (prep) {
        const id = prep.getAttribute('data-prep');
        this.state.tasks[id] = !this.state.tasks[id];
        prep.classList.toggle('is-checked', this.state.tasks[id]);
        prep.setAttribute('aria-pressed', String(this.state.tasks[id]));
        prep.textContent = this.state.tasks[id] ? '✓' : '○';
        const item = prep.closest('.diy__prep-item');
        if (item) item.classList.toggle('is-done', this.state.tasks[id]);
        this.saveProgress();
        this.renderProgress();
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
      const q = e.target.closest('[data-question]');
      if (q) {
        this.state.answers[q.dataset.question] = q.value;
        this.saveProgress();
        this.renderConditions();
        this.renderProgress();
      }
    });
    guide.addEventListener('change', (e) => {
      const q = e.target.closest('[data-question]');
      if (q) {
        this.state.answers[q.dataset.question] = q.value;
        this.saveProgress();
        this.renderConditions();
        this.renderProgress();
      }
    });
  }
}

customElements.define('is-diy-visa', SiteDiyVisa);