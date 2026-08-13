/* ============================================================
   组件：is-diy-visa · DIY 签证助手（最终版 · 独立配置数据驱动）
   统一产品框架 + 项目独立规则 + 官方信息对齐
   01 项目基本信息 / 02 确认条件（可填写 + 符合·部分符合·暂不符合 + 明细）/
   03 专属材料 / 04 前置要求 / 05 专属流程 / 06 准备进度 / 07 官方申请入口 / 免责声明
   数据源：Istra.diyConfigs / diyConditions / diyQuestions / diyRules /
          diyRequiredDocs / diyPrepTasks / diySteps
   状态本地持久化；新增签证只需增加数据库配置。
   ============================================================ */

class SiteDiyVisa extends HTMLElement {
  constructor() {
    super();
    this.state = {
      projectId: '',
      docs: {}, tasks: {}, steps: {}, answers: {}
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

  DISCLAIMER = '本DIY签证助手用于帮助用户了解签证申请条件、准备材料、前置要求及申请流程。本平台不是任何国家政府、使领馆或签证审批机构的官方网站。AI分析、条件检查和DIY准备进度仅供信息参考，不代表签证审批结果。签证是否批准由相关国家政府机构依法独立决定。签证政策、申请条件、费用、材料和流程可能发生变化，请以相关官方机构发布的最新信息为准。伊斯特拉国际不保证任何签证申请成功。';

  /* ================= 数据辅助 ================= */

  config(id) { return (Istra.diyConfigs || []).find((c) => c.id === id) || null; }
  conditionsOf(id) { return (Istra.diyConditions || []).filter((c) => c.visa_id === id); }
  questionsOf(id) { return (Istra.diyQuestions || []).filter((q) => q.visa_id === id); }
  rulesOf(id) { return (Istra.diyRules || []).filter((r) => r.visa_id === id); }
  docsOf(id) { return (Istra.diyRequiredDocs || []).filter((d) => d.visa_id === id); }
  tasksOf(id) { return (Istra.diyPrepTasks || []).filter((t) => t.visa_id === id).sort((a, b) => (a.task_order || 0) - (b.task_order || 0)); }
  stepsOf(id) { return (Istra.diySteps || []).filter((s) => s.visa_id === id).sort((a, b) => (a.step_order || 0) - (b.step_order || 0)); }
  countryCn(id) { const c = (Istra.countries || []).find((x) => x.id === id); return c ? c.cn : id; }
  countryFlag(id) { const c = (Istra.countries || []).find((x) => x.id === id); return c ? c.flag : ''; }

  progressKey() { return 'diy_final_' + this.state.projectId; }
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

  /* 单条条件判定：yes / no / need */
  conditionResult(cond) {
    const rules = (this.rulesOf(this.state.projectId) || []).filter((r) => r.condition_type === cond.condition_type);
    const matched = rules.filter((r) => {
      const q = (this.questionsOf(this.state.projectId) || []).find((x) => r.question_key ? x.question === r.question_key : x.condition_type === cond.condition_type);
      const val = q ? (this.state.answers[q.id] || '') : '';
      if (!val) return false;
      if (r.rule_type === 'min') return parseFloat(val) >= parseFloat(r.rule_value);
      if (r.rule_type === 'match') return r.rule_value.split('|').indexOf(val) >= 0;
      return true;
    });
    if (matched.length) return 'yes';
    const hasAnswer = rules.some((r) => {
      const q = (this.questionsOf(this.state.projectId) || []).find((x) => r.question_key ? x.question === r.question_key : x.condition_type === cond.condition_type);
      return q && (this.state.answers[q.id] || '').trim() !== '';
    });
    return hasAnswer ? 'no' : 'need';
  }

  /* 整体判定：符合 / 部分符合 / 暂不符合 */
  overallResult(conds) {
    let no = 0, need = 0;
    conds.filter((c) => c.required).forEach((c) => {
      const r = this.conditionResult(c);
      if (r === 'no') no++;
      else if (r === 'need') need++;
    });
    if (no > 0) return '暂不符合';
    if (need > 0) return '部分符合';
    return '符合';
  }

  /* ================= 渲染 ================= */

  render() {
    this.innerHTML = `
      <div class="diy">
        <header class="diy__head">
          <div class="container">
            <p class="diy__eyebrow" data-reveal>DIY Visa Assistant</p>
            <h1 class="diy__title" data-reveal>DIY 签证助手</h1>
            <p class="diy__sub" data-reveal>了解项目 → 填写个人情况 → 判断申请条件 → 准备专属材料 → 完成前置要求 → 按专属流程准备 → 检查完成度 → 前往官方申请入口</p>
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
    this.renderQuestions();
    this.renderConditionResults();
    this.renderProgress();
  }

  guideHtml(c) {
    const flag = this.countryFlag(c.country);
    const docs = this.docsOf(c.id);
    const tasks = this.tasksOf(c.id);
    const steps = this.stepsOf(c.id);
    return `
      <div class="diy__guide-head">
        <span class="diy__guide-flag"><img src="assets/flags/${flag}" alt="${this.countryCn(c.country)} 国旗" /></span>
        <div>
          <p class="diy__guide-country">${this.countryCn(c.country)} <small>${c.visa_type}</small></p>
          <h2 class="diy__guide-title">${c.visa_name} DIY</h2>
        </div>
      </div>

      <!-- 01 项目基本信息 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>01</span>项目基本信息</h3>
        <div class="diy__facts">
          <div class="diy__fact"><span>目标国家</span><b>${this.countryCn(c.country)}</b></div>
          <div class="diy__fact"><span>签证名称</span><b>${c.visa_name}</b></div>
          <div class="diy__fact"><span>签证类型</span><b>${c.visa_type}</b></div>
          <div class="diy__fact"><span>适合人群</span><b>${c.target_people}</b></div>
          <div class="diy__fact"><span>DIY 难度</span><b>${c.difficulty}</b></div>
          <div class="diy__fact"><span>预计准备周期</span><b>${c.preparation_period}</b></div>
        </div>
        <p class="diy__apply-note"><span>基本申请方式：</span>${c.application_method}</p>
      </section>

      <!-- 02 确认自己是否符合申请条件 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>02</span>确认自己是否符合申请条件</h3>
        <p class="diy__sec-desc">回答以下专属问题，系统将给出整体判定：符合 / 部分符合 / 暂不符合，并列出已满足、不足与需补充证明的条件。</p>
        <div class="diy__questions" data-questions></div>
        <div class="diy__overall" data-overall></div>
        <div class="diy__conditions" data-conditions></div>
      </section>

      <!-- 03 专属申请材料 -->
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
                <p class="diy__task-desc"><span>适用对象：</span>${d.applicable_to}</p>
                <p class="diy__task-desc"><span>准备说明：</span>${d.description}</p>
                <p class="diy__task-src">官方要求：${d.official_requirement}${d.alternative_document ? '<br>可替代材料：' + d.alternative_document : ''}<br>来源：${d.source_reference} · 最后验证 ${d.last_verified_date}</p>
                <div class="diy__task-statusbar">
                  <button type="button" class="chip${st === '未开始' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="未开始">未开始</button>
                  <button type="button" class="chip${st === '准备中' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="准备中">准备中</button>
                  <button type="button" class="chip${st === '已完成' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="已完成">已完成</button>
                </div>
              </article>`;
          }).join('')}
        </div>
      </section>

      <!-- 04 完成必要前置要求 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>04</span>完成必要前置要求</h3>
        <div class="diy__prep">
          ${tasks.map((t) => {
            const done = !!this.state.tasks[t.id];
            return `
              <article class="diy__prep-item${done ? ' is-done' : ''}">
                <button type="button" class="diy__prep-check${done ? ' is-checked' : ''}" data-prep="${t.id}" aria-pressed="${done}">${done ? '✓' : '○'}</button>
                <div class="diy__prep-body">
                  <p class="diy__prep-name">${t.task_name}<span class="diy__prep-tag${t.required !== false ? ' is-req' : ''}">${t.required !== false ? '必须' : '建议'}</span><span class="diy__prep-time">预计 ${t.estimated_time || '—'}</span></p>
                  <p class="diy__prep-desc">${t.task_description}</p>
                  ${t.why_needed ? '<p class="diy__prep-meta"><span>为什么需要：</span>' + t.why_needed + '</p>' : ''}
                  ${t.official_requirement ? '<p class="diy__prep-meta"><span>官方要求：</span>' + t.official_requirement + '</p>' : ''}
                  ${t.completion_criteria ? '<p class="diy__prep-meta"><span>完成标准：</span>' + t.completion_criteria + '</p>' : ''}
                  <p class="diy__prep-src">来源：${t.source_reference} · 最后验证 ${t.last_verified_date}</p>
                </div>
              </article>`;
          }).join('')}
        </div>
      </section>

      <!-- 05 DIY申请流程 -->
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
                <p class="diy__flow-src">来源：${s.source_reference} · 最后验证 ${s.last_verified_date}</p>
              </article>`;
          }).join('')}
        </div>
      </section>

      <!-- 06 我的DIY准备进度 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>06</span>我的 DIY 准备进度</h3>
        <div data-progress></div>
      </section>

      <!-- 07 官方申请入口 -->
      <section class="diy__sec diy__official">
        <h3 class="diy__sec-title"><span>07</span>🏛 官方申请入口</h3>
        <div class="diy__official-badge">官方申请渠道导航</div>
        <div class="diy__official-grid">
          <div class="diy__official-row"><span>官方申请机构</span><b>${c.official_authority}</b></div>
          <div class="diy__official-row"><span>申请方式</span><b>${c.application_method}</b></div>
          <div class="diy__official-row"><span>信息来源</span><b>${c.source_reference}</b></div>
          <div class="diy__official-row"><span>官方信息更新时间</span><b>${c.last_verified_date}</b></div>
        </div>
        <div class="diy__official-actions">
          <a class="btn btn--ghost-dark" href="${c.official_website}" target="_blank" rel="noopener noreferrer">访问官方网站 <span class="btn-arrow">→</span></a>
          <a class="btn btn--primary" href="${c.application_url}" target="_blank" rel="noopener noreferrer">进入官方申请页面 <span class="btn-arrow">→</span></a>
        </div>
        <p class="diy__official-note">* 本站提供官方申请渠道导航，不代表政府机构，不提供签证审批服务。申请前请以目标国家官方最新信息为准。</p>
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
        return `<div class="field" data-qfield="${q.id}"><label for="q-${q.id}">${q.question}</label><input id="q-${q.id}" type="number" data-question="${q.id}" value="${val}" placeholder="请输入" autocomplete="off" /></div>`;
      }
      if (q.answer_type === 'select') {
        return `<div class="field" data-qfield="${q.id}"><label for="q-${q.id}">${q.question}</label><select id="q-${q.id}" data-question="${q.id}"><option value="">请选择</option>${(q.options || '').split('|').filter(Boolean).map((o) => `<option value="${o}"${val === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div>`;
      }
      return `<div class="field" data-qfield="${q.id}"><label for="q-${q.id}">${q.question}</label><input id="q-${q.id}" type="text" data-question="${q.id}" value="${val}" placeholder="请输入" autocomplete="off" /></div>`;
    }).join('');
  }

  renderConditionResults() {
    const overall = this.querySelector('[data-overall]');
    const box = this.querySelector('[data-conditions]');
    if (!overall || !box) return;
    const conds = this.conditionsOf(this.state.projectId);
    const verdict = this.overallResult(conds);
    const cls = verdict === '符合' ? 'is-yes' : verdict === '暂不符合' ? 'is-no' : 'is-part';
    overall.innerHTML = `
      <div class="diy__overall-card ${cls}">
        <span class="diy__overall-label">条件检查结果</span>
        <b class="diy__overall-verdict">${verdict}</b>
      </div>`;
    const yesList = [], noList = [], needList = [];
    conds.forEach((c) => {
      const r = this.conditionResult(c);
      const item = { name: c.condition_name, desc: c.condition_description, req: c.required };
      if (r === 'yes') yesList.push(item);
      else if (r === 'no') noList.push(item);
      else needList.push(item);
    });
    const sec = (title, list, cls2) => `
      <div class="diy__cond-group ${cls2}">
        <p class="diy__cond-group-title">${title}（${list.length}）</p>
        ${list.length ? list.map((x) => `<div class="diy__cond"><span class="diy__cond-badge">${cls2 === 'ok' ? '已满足' : cls2 === 'bad' ? '不足' : '需补充证明'}</span><div class="diy__cond-body"><p class="diy__cond-name">${x.name}${x.req ? '<span class="diy__cond-tag is-req">必须</span>' : ''}</p><p class="diy__cond-desc">${x.desc}</p></div></div>`).join('') : '<p class="diy__cond-empty">无</p>'}
      </div>`;
    box.innerHTML = sec('已满足的条件', yesList, 'ok') + sec('不足的条件', noList, 'bad') + sec('需要补充证明的条件', needList, 'need');
  }

  renderProgress() {
    const box = this.querySelector('[data-progress]');
    if (!box) return;
    const docs = this.docsOf(this.state.projectId);
    const tasks = this.tasksOf(this.state.projectId);
    const steps = this.stepsOf(this.state.projectId);
    const qs = this.questionsOf(this.state.projectId);
    const conds = this.conditionsOf(this.state.projectId);
    const docDone = docs.filter((d) => this.statusText(this.state.docs[d.id]) === '已完成').length;
    const taskDone = tasks.filter((t) => !!this.state.tasks[t.id]).length;
    const stepDone = steps.filter((s) => !!this.state.steps[s.id]).length;
    const qDone = qs.filter((q) => (this.state.answers[q.id] || '').trim() !== '').length;
    const condDone = conds.filter((c) => this.conditionResult(c) === 'yes').length;
    const total = docs.length + tasks.length + steps.length + qs.length + conds.length;
    const done = docDone + taskDone + stepDone + qDone + condDone;
    const pct = total ? Math.round((done / total) * 100) : 0;
    let next = '前往官方申请入口了解最新要求';
    const undoneQ = qs.find((q) => !(this.state.answers[q.id] || '').trim());
    const undoneTask = tasks.find((t) => !this.state.tasks[t.id]);
    const undoneDoc = docs.find((d) => this.statusText(this.state.docs[d.id]) !== '已完成');
    const undoneStep = steps.find((s) => !this.state.steps[s.id]);
    if (undoneQ) next = '你目前最需要完成的是：回答「' + undoneQ.question + '」';
    else if (undoneTask) next = '你目前最需要完成的是：' + undoneTask.task_name;
    else if (undoneDoc) next = '你目前最需要完成的是：' + undoneDoc.document_name;
    else if (undoneStep) next = undoneStep.step_title;
    const condLabel = conds.length && condDone === conds.length ? '✓ 已完成' : condDone + ' / ' + conds.length;
    box.innerHTML = `
      <div class="diy__progress-bar"><span style="width:${pct}%"></span><b>${pct}%</b></div>
      <div class="diy__progress-grid">
        <div class="diy__progress-row"><span>总体准备度</span><b>${pct}%</b></div>
        <div class="diy__progress-row"><span>申请条件</span><b>${condLabel}</b></div>
        <div class="diy__progress-row"><span>申请材料</span><b>${docDone} / ${docs.length}</b></div>
        <div class="diy__progress-row"><span>前置要求</span><b>${taskDone} / ${tasks.length}</b></div>
        <div class="diy__progress-row"><span>申请流程</span><b>${stepDone} / ${steps.length}</b></div>
      </div>
      <p class="diy__next">下一步建议：${next}</p>`;
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
        this.renderConditionResults();
        this.renderProgress();
      }
    });
    guide.addEventListener('change', (e) => {
      const q = e.target.closest('[data-question]');
      if (q) {
        this.state.answers[q.dataset.question] = q.value;
        this.saveProgress();
        this.renderConditionResults();
        this.renderProgress();
      }
    });
  }
}

customElements.define('is-diy-visa', SiteDiyVisa);