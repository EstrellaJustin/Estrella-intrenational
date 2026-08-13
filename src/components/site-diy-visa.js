/* ============================================================
   组件：is-diy-visa · DIY 签证工作台 2.0
   01 项目概览 / 02 我的申请情况（动态问答）/ 03 资格条件检查 /
   04 专属申请材料（含备注）/ 05 必要前置要求（三态）/ 06 DIY申请流程 /
   07 我的准备进度 / 08 最终申请检查 / 09 官方申请入口 / 免责声明
   统一产品框架 + 每个签证项目独立规则；状态本地持久化。
   ============================================================ */

class SiteDiyVisa extends HTMLElement {
  constructor() {
    super();
    this.state = {
      projectId: '',
      docs: {}, tasks: {}, steps: {}, answers: {}, notes: {}
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

  DISCLAIMER = '本DIY签证助手用于帮助用户了解签证申请条件、材料、前置要求和申请流程。本平台不是任何国家政府、使领馆或签证审批机构的官方网站。平台提供的资格检查、信息整理和准备度分析仅供参考，不代表签证审批结果。签证政策、申请条件、材料、费用及流程可能发生变化。正式申请前，请务必核对相关国家官方机构发布的最新要求。伊斯特拉国际不保证任何签证申请成功。';

  /* ================= 数据辅助 ================= */

  config(id) { return (Istra.diyConfigs || []).find((c) => c.id === id) || null; }
  conditionsOf(id) { return (Istra.diyConditions || []).filter((c) => c.visa_id === id); }
  questionsOf(id) { return (Istra.diyQuestions || []).filter((q) => q.visa_id === id); }
  rulesOf(id) { return (Istra.diyRules || []).filter((r) => r.visa_id === id); }
  docsOf(id) { return (Istra.diyRequiredDocs || []).filter((d) => d.visa_id === id); }
  tasksOf(id) { return (Istra.diyPrepTasks || []).filter((t) => t.visa_id === id).sort((a, b) => (a.task_order || 0) - (b.task_order || 0)); }
  stepsOf(id) { return (Istra.diySteps || []).filter((s) => s.visa_id === id).sort((a, b) => (a.step_order || 0) - (b.step_order || 0)); }
  sourcesOf(id) { return (Istra.diyOfficialSources || []).filter((o) => o.visa_project_id === id); }
  countryCn(id) { const c = (Istra.countries || []).find((x) => x.id === id); return c ? c.cn : id; }
  countryFlag(id) { const c = (Istra.countries || []).find((x) => x.id === id); return c ? c.flag : ''; }

  progressKey() { return 'diy_wb2_' + this.state.projectId; }
  loadProgress() {
    try {
      const raw = localStorage.getItem(this.progressKey());
      if (raw) {
        const d = JSON.parse(raw);
        if (d && d.docs) this.state.docs = d.docs;
        if (d && d.tasks) this.state.tasks = d.tasks;
        if (d && d.steps) this.state.steps = d.steps;
        if (d && d.answers) this.state.answers = d.answers;
        if (d && d.notes) this.state.notes = d.notes;
      }
    } catch (e) { /* ignore */ }
  }
  saveProgress() {
    try { localStorage.setItem(this.progressKey(), JSON.stringify({ docs: this.state.docs, tasks: this.state.tasks, steps: this.state.steps, answers: this.state.answers, notes: this.state.notes })); } catch (e) { /* ignore */ }
  }

  statusText(v) { return v === '已完成' ? '已完成' : v === '准备中' ? '准备中' : v === '进行中' ? '进行中' : '未开始'; }

  answerOf(cond) {
    const rules = (this.rulesOf(this.state.projectId) || []).filter((r) => r.condition_type === cond.condition_type);
    const r = rules[0];
    const q = r ? (this.questionsOf(this.state.projectId) || []).find((x) => r.question_key ? x.question === r.question_key : x.condition_type === cond.condition_type) : (this.questionsOf(this.state.projectId) || []).find((x) => x.condition_type === cond.condition_type);
    return q ? (this.state.answers[q.id] || '') : '';
  }

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

  conditionAdvice(cond, result) {
    if (result === 'yes') return { why: '你的回答满足该项目官方要求。', act: '无需额外操作，保留相关证明材料。' };
    if (result === 'no') {
      const val = this.answerOf(cond);
      const rules = (this.rulesOf(this.state.projectId) || []).filter((r) => r.condition_type === cond.condition_type);
      const target = rules.map((r) => r.rule_type === 'min' ? '不低于 ' + r.rule_value : r.rule_value.split('|').join(' 或 ')).join('；');
      const advice = {
        '年龄': '建议核对项目年龄要求，若年龄不符可评估其他项目。',
        '收入': '建议提高月收入至官方最低标准，或补充其他合规收入来源证明。',
        '职业': '建议调整工作性质或取得雇主/客户证明，使工作类型符合官方要求。',
        '工作经验': '建议继续积累相关经验，或补充工作经历证明。',
        '学历': '建议完成学历认证或选择与学历匹配的其他路线。',
        '语言': '建议参加语言课程或考试，达到官方要求分数。',
        '资金': '建议补充资金证明或调整资金安排。',
        '其他': '建议按官方要求补齐相应证明或说明。'
      }[cond.condition_type] || '建议补齐相关证明并核对官方要求。';
      return { why: '你的回答（' + (val || '未填写') + '）未达到官方要求（' + target + '）。', act: advice };
    }
    return { why: '暂未提供该条件所需信息。', act: '请回答对应问题，或准备相关证明材料。' };
  }

  /* ================= 渲染 ================= */

  render() {
    this.innerHTML = `
      <div class="diy">
        <header class="diy__head">
          <div class="container">
            <p class="diy__eyebrow" data-reveal>DIY Visa Workbench</p>
            <h1 class="diy__title" data-reveal>DIY 签证工作台</h1>
            <p class="diy__sub" data-reveal>了解项目 → 填写个人情况 → 资格检查 → 材料准备 → 前置任务 → DIY申请流程 → 最终申请检查 → 官方申请入口</p>
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
    this.applyDeps();
    this.renderConditionResults();
    this.renderProgress();
  }

  guideHtml(c) {
    const flag = this.countryFlag(c.country);
    const docs = this.docsOf(c.id);
    const tasks = this.tasksOf(c.id);
    const steps = this.stepsOf(c.id);
    const sources = this.sourcesOf(c.id);
    return `
      <div class="diy__guide-head">
        <span class="diy__guide-flag"><img src="assets/flags/${flag}" alt="${this.countryCn(c.country)} 国旗" /></span>
        <div>
          <p class="diy__guide-country">${this.countryCn(c.country)} <small>${c.visa_type}</small></p>
          <h2 class="diy__guide-title">${c.visa_name} · DIY</h2>
        </div>
      </div>

      <!-- 01 项目概览 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>01</span>项目概览</h3>
        <div class="diy__facts">
          <div class="diy__fact"><span>目标国家</span><b>${this.countryCn(c.country)}</b></div>
          <div class="diy__fact"><span>签证名称</span><b>${c.visa_name}</b></div>
          <div class="diy__fact"><span>签证类型</span><b>${c.visa_type}</b></div>
          <div class="diy__fact"><span>适合人群</span><b>${c.target_people}</b></div>
          <div class="diy__fact"><span>申请难度</span><b>${c.difficulty}</b></div>
          <div class="diy__fact"><span>预计准备周期</span><b>${c.preparation_period}</b></div>
        </div>
        <p class="diy__apply-note"><span>基本申请方式：</span>${c.application_method}</p>
        <div class="diy__dates">
          <span>本 DIY 指南最后更新：${c.guide_updated_date || '—'}</span>
          <span>官方信息最后验证：${c.last_verified_date}</span>
        </div>
      </section>

      <!-- 02 我的申请情况（动态问答） -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>02</span>我的申请情况</h3>
        <p class="diy__sec-desc">根据你的回答，系统会动态出现后续问题，就像一次真实的申请预审。</p>
        <div class="diy__questions" data-questions></div>
      </section>

      <!-- 03 资格条件检查 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>03</span>资格条件检查</h3>
        <div class="diy__overall" data-overall></div>
        <div class="diy__conditions" data-conditions></div>
      </section>

      <!-- 04 专属申请材料 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>04</span>专属申请材料</h3>
        <div class="diy__tasks">
          ${docs.map((d) => {
            const st = this.statusText(this.state.docs[d.id]);
            const cls = st === '已完成' ? ' is-done' : st === '准备中' ? ' is-progress' : '';
            const note = this.state.notes[d.id] || '';
            return `
              <article class="diy__task${cls}">
                <div class="diy__task-head">
                  <span class="diy__task-name">${d.document_name}</span>
                  <span class="diy__task-tag${d.is_required ? ' is-req' : ''}">${d.is_required ? '必须' : '可选'}</span>
                  <span class="diy__task-status">${st}</span>
                </div>
                <p class="diy__task-desc"><span>适用对象：</span>${d.applicable_to}</p>
                <p class="diy__task-desc"><span>用途：</span>${d.description}</p>
                <p class="diy__task-desc"><span>准备说明：</span>${d.official_requirement}</p>
                ${d.tips ? '<p class="diy__task-desc diy__task-tip"><span>注意事项：</span>' + d.tips + '</p>' : ''}
                ${d.alternative_document ? '<p class="diy__task-desc"><span>可替代材料：</span>' + d.alternative_document + '</p>' : ''}
                <p class="diy__task-src">来源：${d.source_reference} · 最后验证 ${d.last_verified_date}</p>
                <div class="diy__task-statusbar">
                  <button type="button" class="chip${st === '未开始' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="未开始">未开始</button>
                  <button type="button" class="chip${st === '准备中' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="准备中">准备中</button>
                  <button type="button" class="chip${st === '已完成' ? ' is-selected' : ''}" data-doc-status="${d.id}" data-value="已完成">已完成</button>
                </div>
                <input class="diy__task-note" type="text" data-doc-note="${d.id}" value="${note}" placeholder="备注：如存放位置 / 需补办内容…" autocomplete="off" />
              </article>`;
          }).join('')}
        </div>
      </section>

      <!-- 05 必要前置要求 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>05</span>必要前置要求</h3>
        <div class="diy__prep">
          ${tasks.map((t) => {
            const st = this.statusText(this.state.tasks[t.id]);
            return `
              <article class="diy__prep-item${st === '已完成' ? ' is-done' : ''}">
                <div class="diy__prep-head">
                  <p class="diy__prep-name">${t.task_name}<span class="diy__prep-tag${t.required !== false ? ' is-req' : ''}">${t.required !== false ? '必须' : '建议'}</span><span class="diy__prep-time">预计 ${t.estimated_time || '—'}</span></p>
                </div>
                <p class="diy__prep-desc">${t.task_description}</p>
                ${t.why_needed ? '<p class="diy__prep-meta"><span>为什么需要：</span>' + t.why_needed + '</p>' : ''}
                ${t.official_requirement ? '<p class="diy__prep-meta"><span>官方要求：</span>' + t.official_requirement + '</p>' : ''}
                ${t.completion_criteria ? '<p class="diy__prep-meta"><span>完成标准：</span>' + t.completion_criteria + '</p>' : ''}
                <p class="diy__prep-src">来源：${t.source_reference} · 最后验证 ${t.last_verified_date}</p>
                <div class="diy__prep-statusbar">
                  <button type="button" class="chip${st === '未开始' ? ' is-selected' : ''}" data-prep-status="${t.id}" data-value="未开始">未开始</button>
                  <button type="button" class="chip${st === '进行中' ? ' is-selected' : ''}" data-prep-status="${t.id}" data-value="进行中">进行中</button>
                  <button type="button" class="chip${st === '已完成' ? ' is-selected' : ''}" data-prep-status="${t.id}" data-value="已完成">已完成</button>
                </div>
              </article>`;
          }).join('')}
        </div>
      </section>

      <!-- 06 DIY申请流程 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>06</span>DIY 申请流程</h3>
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
                <p class="diy__flow-action">完成标准：${s.completion_criteria}</p>
                <p class="diy__flow-src">官方依据：${s.source_reference} · 最后验证 ${s.last_verified_date}</p>
              </article>`;
          }).join('')}
        </div>
      </section>

      <!-- 07 我的准备进度 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>07</span>我的准备进度</h3>
        <div data-progress></div>
        <p class="diy__progress-note">* 准备度仅表示 DIY 准备完成情况，不代表签证通过率。</p>
      </section>

      <!-- 08 最终申请检查 -->
      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>08</span>最终申请检查</h3>
        <p class="diy__sec-desc">提交申请前，先完成一次完整的 DIY 准备检查。</p>
        <button type="button" class="btn btn--primary" data-final-check>开始最终检查 <span class="btn-arrow">→</span></button>
        <div data-final-result></div>
      </section>

      <!-- 09 官方申请入口 -->
      <section class="diy__sec diy__official">
        <h3 class="diy__sec-title"><span>09</span>🏛 官方申请入口</h3>
        <div class="diy__official-badge">官方申请渠道导航 · 伊斯特拉国际不是政府官方网站</div>
        <div class="diy__official-grid">
          <div class="diy__official-row"><span>官方申请机构</span><b>${c.official_authority}</b></div>
          <div class="diy__official-row"><span>申请方式</span><b>${c.application_method}</b></div>
          <div class="diy__official-row"><span>官方信息更新时间</span><b>${c.last_verified_date}</b></div>
        </div>
        <div class="diy__official-actions">
          <a class="btn btn--ghost-dark" href="${c.official_website}" target="_blank" rel="noopener noreferrer">访问官方网站 <span class="btn-arrow">→</span></a>
          <a class="btn btn--primary" href="${c.application_url}" target="_blank" rel="noopener noreferrer">进入官方申请页面 <span class="btn-arrow">→</span></a>
        </div>
        ${sources.length ? `<div class="diy__sources"><p class="diy__sources-title">官方信息来源</p>${sources.map((o) => `<p class="diy__sources-item">· ${o.source_name}${o.source_url ? '（<a href="' + o.source_url + '" target="_blank" rel="noopener noreferrer">访问</a>）' : ''} · ${o.source_type} · 验证 ${o.last_verified_date}</p>`).join('')}</div>` : ''}
        <p class="diy__official-note">* 本站提供官方申请渠道导航，不代表政府机构，不提供签证审批服务。申请前请以目标国家官方最新信息为准。</p>
      </section>
    `;
  }

  /* 动态问答 */
  renderQuestions() {
    const box = this.querySelector('[data-questions]');
    if (!box) return;
    const qs = this.questionsOf(this.state.projectId);
    box.innerHTML = qs.map((q) => {
      const val = this.state.answers[q.id] || '';
      let control;
      if (q.answer_type === 'number') control = '<input id="q-' + q.id + '" type="number" data-question="' + q.id + '" value="' + val + '" placeholder="请输入" autocomplete="off" />';
      else if (q.answer_type === 'select') control = '<select id="q-' + q.id + '" data-question="' + q.id + '"><option value="">请选择</option>' + (q.options || '').split('|').filter(Boolean).map((o) => '<option value="' + o + '"' + (val === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select>';
      else control = '<input id="q-' + q.id + '" type="text" data-question="' + q.id + '" value="' + val + '" placeholder="请输入" autocomplete="off" />';
      return '<div class="field" data-qfield="' + q.id + '" data-dep="' + (q.depends_on ? '1' : '0') + '"' + (q.depends_on ? ' style="display:none"' : '') + '><label for="q-' + q.id + '">' + q.question + '</label>' + control + '</div>';
    }).join('');
  }

  applyDeps() {
    const box = this.querySelector('[data-questions]');
    if (!box) return;
    const qs = this.questionsOf(this.state.projectId);
    qs.forEach((q) => {
      if (!q.depends_on) return;
      const dep = qs.find((x) => x.question === q.depends_on);
      const val = dep ? (this.state.answers[dep.id] || '') : '';
      const show = val === q.depends_value;
      const el = box.querySelector('[data-qfield="' + q.id + '"]');
      if (el) el.style.display = show ? '' : 'none';
    });
  }

  renderConditionResults() {
    const overall = this.querySelector('[data-overall]');
    const box = this.querySelector('[data-conditions]');
    if (!overall || !box) return;
    const conds = this.conditionsOf(this.state.projectId);
    const verdict = this.overallResult(conds);
    const cls = verdict === '符合' ? 'is-yes' : verdict === '暂不符合' ? 'is-no' : 'is-part';
    overall.innerHTML = `<div class="diy__overall-card ${cls}"><span class="diy__overall-label">资格条件检查结果</span><b class="diy__overall-verdict">${verdict}</b></div>`;
    box.innerHTML = conds.map((c) => {
      const r = this.conditionResult(c);
      const icon = r === 'yes' ? '🟢' : r === 'no' ? '🔴' : '🟡';
      const label = r === 'yes' ? '当前符合' : r === 'no' ? '当前不符合' : '需要补充信息';
      const adv = this.conditionAdvice(c, r);
      const yourVal = this.answerOf(c) || '未填写';
      return `
        <div class="diy__cond is-${r}">
          <div class="diy__cond-body">
            <p class="diy__cond-name">${c.condition_name}<span class="diy__cond-tag${c.required ? ' is-req' : ''}">${c.required ? '必须' : '可选'}</span></p>
            <p class="diy__cond-desc"><span>官方要求：</span>${c.condition_description}</p>
            <p class="diy__cond-desc"><span>你的情况：</span>${yourVal}</p>
            <p class="diy__cond-result ${r}">${icon} ${label}</p>
            <p class="diy__cond-desc"><span>为什么：</span>${adv.why}</p>
            <p class="diy__cond-desc"><span>需要做什么：</span>${adv.act}</p>
            <p class="diy__cond-src">来源：${c.source_reference} · 最后验证 ${c.last_verified_date}</p>
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
    const qs = this.questionsOf(this.state.projectId).filter((q) => !q.depends_on);
    const conds = this.conditionsOf(this.state.projectId).filter((c) => c.required);
    const docDone = docs.filter((d) => this.statusText(this.state.docs[d.id]) === '已完成').length;
    const taskDone = tasks.filter((t) => this.statusText(this.state.tasks[t.id]) === '已完成').length;
    const stepDone = steps.filter((s) => !!this.state.steps[s.id]).length;
    const condDone = conds.filter((c) => this.conditionResult(c) === 'yes').length;
    const qDone = qs.filter((q) => (this.state.answers[q.id] || '').trim() !== '').length;
    const total = docs.length + tasks.length + steps.length + conds.length + qs.length;
    const done = docDone + taskDone + stepDone + condDone + qDone;
    const pct = total ? Math.round((done / total) * 100) : 0;
    let next = '前往官方申请入口了解最新要求';
    const undoneQ = qs.find((q) => !(this.state.answers[q.id] || '').trim());
    const undoneTask = tasks.find((t) => this.statusText(this.state.tasks[t.id]) !== '已完成');
    const undoneDoc = docs.find((d) => this.statusText(this.state.docs[d.id]) !== '已完成');
    const undoneStep = steps.find((s) => !this.state.steps[s.id]);
    if (undoneQ) next = '你目前最需要完成的是：回答「' + undoneQ.question + '」';
    else if (undoneTask) next = '你目前最需要完成的是：' + undoneTask.task_name;
    else if (undoneDoc) next = '你目前最需要完成的是：' + undoneDoc.document_name;
    else if (undoneStep) next = undoneStep.step_title;
    box.innerHTML = `
      <div class="diy__progress-bar"><span style="width:${pct}%"></span><b>${pct}%</b></div>
      <div class="diy__progress-grid">
        <div class="diy__progress-row"><span>DIY 准备度</span><b>${pct}%</b></div>
        <div class="diy__progress-row"><span>资格条件</span><b>${condDone} / ${conds.length}</b></div>
        <div class="diy__progress-row"><span>申请材料</span><b>${docDone} / ${docs.length}</b></div>
        <div class="diy__progress-row"><span>前置要求</span><b>${taskDone} / ${tasks.length}</b></div>
        <div class="diy__progress-row"><span>申请流程</span><b>${stepDone} / ${steps.length}</b></div>
      </div>
      <p class="diy__next">下一步建议：${next}</p>`;
  }

  /* 最终申请检查 */
  renderFinalCheck() {
    const box = this.querySelector('[data-final-result]');
    if (!box) return;
    const c = this.config(this.state.projectId);
    const docs = this.docsOf(this.state.projectId);
    const tasks = this.tasksOf(this.state.projectId);
    const steps = this.stepsOf(this.state.projectId);
    const conds = this.conditionsOf(this.state.projectId).filter((x) => x.required);
    const qs = this.questionsOf(this.state.projectId).filter((q) => !q.depends_on);
    const docDone = docs.filter((d) => this.statusText(this.state.docs[d.id]) === '已完成').length;
    const taskDone = tasks.filter((t) => this.statusText(this.state.tasks[t.id]) === '已完成').length;
    const stepDone = steps.filter((s) => !!this.state.steps[s.id]).length;
    const condOk = this.overallResult(conds) === '符合';
    const qOk = qs.every((q) => (this.state.answers[q.id] || '').trim() !== '');
    const issues = [];
    if (!condOk) issues.push('资格条件尚未全部满足');
    if (docDone < docs.length) issues.push(docs.length - docDone + ' 项材料尚未完成');
    if (taskDone < tasks.length) issues.push(tasks.length - taskDone + ' 项前置要求尚未完成');
    if (stepDone < steps.length) issues.push(steps.length - stepDone + ' 个流程步骤尚未完成');
    if (!qOk) issues.push('申请情况信息尚未填写完整');
    const ready = issues.length === 0;
    box.innerHTML = `
      <div class="diy__final ${ready ? 'is-ready' : 'is-warn'}">
        <div class="diy__final-head">
          <span class="diy__final-label">最终申请检查</span>
          <b class="diy__final-verdict">${ready ? '已基本完成 DIY 准备' : '暂不建议正式提交'}</b>
        </div>
        <div class="diy__final-grid">
          <div class="diy__final-row"><span>资格条件</span><b>${condOk ? '✅ 已检查' : '⚠ 未全部满足'}</b></div>
          <div class="diy__final-row"><span>申请材料</span><b>${docDone} / ${docs.length}</b></div>
          <div class="diy__final-row"><span>前置要求</span><b>${taskDone} / ${tasks.length}</b></div>
          <div class="diy__final-row"><span>申请流程</span><b>${stepDone} / ${steps.length}</b></div>
          <div class="diy__final-row"><span>填写信息</span><b>${qOk ? '✅ 已完成' : '⚠ 未完成'}</b></div>
          <div class="diy__final-row"><span>官方要求更新时间</span><b>${c.last_verified_date}</b></div>
        </div>
        ${issues.length ? `<div class="diy__final-issues"><p>发现问题：</p><ul>${issues.map((i) => `<li>⚠ ${i}</li>`).join('')}</ul></div>` : ''}
        <p class="diy__final-note">${ready ? '请在正式提交前再次确认官方最新要求。' : '请先完成上述未完成项，再进行正式申请。'} 此检查结果仅代表 DIY 准备完成情况，不代表政府审批结果。</p>
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
      const fc = e.target.closest('[data-final-check]');
      if (fc) { this.renderFinalCheck(); return; }
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
      const prep = e.target.closest('[data-prep-status]');
      if (prep) {
        const id = prep.getAttribute('data-prep-status');
        const val = prep.getAttribute('data-value');
        this.state.tasks[id] = val;
        prep.parentNode.querySelectorAll('[data-prep-status]').forEach((b) => {
          b.classList.toggle('is-selected', b === prep);
          b.setAttribute('aria-pressed', String(b === prep));
        });
        const item = prep.closest('.diy__prep-item');
        if (item) item.classList.toggle('is-done', val === '已完成');
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
        this.applyDeps();
        this.renderConditionResults();
        this.renderProgress();
        return;
      }
      const note = e.target.closest('[data-doc-note]');
      if (note) {
        this.state.notes[note.dataset.docNote] = note.value;
        this.saveProgress();
      }
    });
    guide.addEventListener('change', (e) => {
      const q = e.target.closest('[data-question]');
      if (q) {
        this.state.answers[q.dataset.question] = q.value;
        this.saveProgress();
        this.applyDeps();
        this.renderConditionResults();
        this.renderProgress();
      }
    });
  }
}

customElements.define('is-diy-visa', SiteDiyVisa);