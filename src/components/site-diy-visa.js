/* ============================================================
   组件：is-diy-visa · DIY 签证模拟系统
   选择签证项目 → 填写个人情况 → 材料准备清单 → AI模拟审核 → DIY报告
   数据源：Istra.visaDiyProjects / Istra.visaDocuments / Istra.projects
   免责声明：DIY首页 / 提交审核按钮附近 / AI报告底部
   禁止展示：保证通过 / 成功率100% / 官方批准概率
   ============================================================ */

class SiteDiyVisa extends HTMLElement {
  constructor() {
    super();
    this.step = 0;
    this.totalSteps = 5;
    this.state = {
      projectId: '',
      country: '',
      category: '',
      profile: { age: '', degree: '', occupation: '', income: '', language: '', funds: '', travelHistory: '', family: '' },
      materials: {}
    };
    this.report = null;
  }

  connectedCallback() {
    this.render();
    this.bind();
    this.goTo(0);
    Istra.reveal.observe(this);
  }

  DISCLAIMER = '本DIY签证模拟系统仅用于帮助用户了解签证申请流程、准备材料以及分析自身条件。AI分析结果不代表任何政府机构、使领馆或签证审核部门的决定。签证批准与否由相关国家政府机构依法独立审核。本站不保证签证成功，不提供签证审批服务。用户应以目标国家官方最新政策要求为准。';

  /* ================= 数据辅助 ================= */

  allProjects() { return Istra.visaDiyProjects || []; }
  fullProject(id) { return (Istra.projects || []).find((p) => p.id === id) || null; }
  countryCn(id) { const c = (Istra.countries || []).find((x) => x.id === id); return c ? c.cn : id; }
  docsOf(id) { return (Istra.visaDocuments || []).filter((d) => d.visa_project_id === id); }

  categoryOptions() {
    return [
      { id: 'work', label: '工作就业' }, { id: 'tech', label: '技术人才' }, { id: 'edu', label: '留学教育' },
      { id: 'invest', label: '投资创业' }, { id: 'talent', label: '人才移民' }, { id: 'family', label: '家庭团聚' },
      { id: 'pr', label: '永久居留' }, { id: 'nomad', label: '数字游民' }, { id: 'youth', label: '青年交流' },
      { id: 'special', label: '特殊人才' }
    ];
  }

  /* ================= 渲染 ================= */

  render() {
    this.innerHTML = `
      <div class="diy">
        <header class="diy__head">
          <div class="container">
            <p class="diy__eyebrow" data-reveal>DIY Visa Simulation</p>
            <h1 class="diy__title" data-reveal>DIY 签证模拟系统</h1>
            <p class="diy__sub" data-reveal>选择目标签证项目 → 填写个人情况 → 对照官方材料清单 → AI 模拟审核 → 获得 DIY 准备路线</p>
          </div>
        </header>

        <div class="diy__body">
          <div class="container">
            <div class="diy__wizard" data-reveal>
              <div class="diy__progress">
                <div class="diy__progress-head">
                  <span class="diy__step-label" data-label>第 1 步 / 5 步</span>
                  <span class="diy__step-name" data-step-name>选择签证项目</span>
                  <span class="diy__pct" data-pct>0%</span>
                </div>
                <div class="diy__track"><span class="diy__track-fill" data-fill></span></div>
              </div>
              <div class="diy__content" data-content></div>
              <div class="diy__actions">
                <button type="button" class="btn btn--ghost-dark" data-action="prev">上一步</button>
                <div class="diy__actions-right">
                  <button type="button" class="btn btn--ghost-dark" data-action="restart" style="display:none">重新开始</button>
                  <button type="button" class="btn btn--primary" data-action="next">下一步 <span class="btn-arrow">→</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  field(name, label, placeholder, full) {
    return `
      <div class="field ${full ? 'field--full' : ''}" data-field="${name}">
        <label for="f-${name}">${label}</label>
        <input id="f-${name}" type="text" data-input="${name}" value="${this.state.profile[name] || ''}" placeholder="${placeholder}" autocomplete="off" />
        <span class="field-error">请填写此项</span>
      </div>`;
  }

  chips(name, list, key, single) {
    const cur = this.state.profile[key];
    return `
      <div class="field field--full" data-field="${key}">
        <span class="field-label">${name}</span>
        <div class="chip-grid">
          ${list.map((o) => `<button type="button" class="chip${cur === o.id ? ' is-selected' : ''}" data-chip="${key}" data-value="${o.id}"${single ? ' data-single="1"' : ''} aria-pressed="${cur === o.id}">${o.label}</button>`).join('')}
        </div>
        <span class="field-error">请选择一项</span>
      </div>`;
  }

  question(no, title, desc) {
    return `<p class="diy__q">STEP ${no}<span>/ 05</span></p>
      <h2 class="diy__panel-title">${title}</h2>
      <p class="diy__panel-desc">${desc}</p>`;
  }

  /* 步骤 1：选择签证项目 */
  stepProject() {
    const countries = (Istra.countries || []).filter((c) => c.is_available !== false);
    const countryOpts = countries.map((c) => `<option value="${c.id}">${c.cn}</option>`).join('');
    const catOpts = this.categoryOptions().map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
    const list = this.filteredProjects();
    return `
      ${this.question('01', '选择你的目标签证项目', '从全球项目中挑选一个你想 DIY 模拟的签证项目。')}
      <div class="diy__filters">
        <div class="field"><label for="f-diy-country">国家</label>
          <select id="f-diy-country" data-filter="country"><option value="">全部国家</option>${countryOpts}</select>
        </div>
        <div class="field"><label for="f-diy-cat">类别</label>
          <select id="f-diy-cat" data-filter="category"><option value="">全部类别</option>${catOpts}</select>
        </div>
      </div>
      <div class="diy__projects" data-project-list>
        ${list.map((p) => {
          const full = this.fullProject(p.id);
          return `
            <button type="button" class="diy__project${this.state.projectId === p.id ? ' is-selected' : ''}" data-project="${p.id}">
              <span class="diy__project-flag"><img src="assets/flags/${full ? full.country.flag : ''}" alt="" width="34" height="25" /></span>
              <span class="diy__project-body">
                <span class="diy__project-name">${p.visa_name}</span>
                <span class="diy__project-meta">${this.countryCn(p.country)} · ${p.visa_type}</span>
              </span>
              <span class="diy__project-check">${this.state.projectId === p.id ? '✓' : ''}</span>
            </button>`;
        }).join('')}
      </div>
      ${this.state.projectId ? this.projectSummary(this.state.projectId) : ''}
      <div class="diy__disclaimer">${this.DISCLAIMER}</div>
    `;
  }

  projectSummary(id) {
    const p = this.allProjects().find((x) => x.id === id);
    const full = this.fullProject(id);
    if (!p) return '';
    return `
      <div class="diy__selected">
        <span class="diy__selected-flag"><img src="assets/flags/${full ? full.country.flag : ''}" alt="" width="40" height="30" /></span>
        <div>
          <p class="diy__selected-name">${p.visa_name}</p>
          <p class="diy__selected-meta">${this.countryCn(p.country)} · ${p.visa_type} · ${full ? full.official_authority : ''}</p>
        </div>
      </div>`;
  }

  filteredProjects() {
    let list = this.allProjects();
    if (this.state.country) list = list.filter((p) => p.country === this.state.country);
    if (this.state.category) list = list.filter((p) => {
      const full = this.fullProject(p.id);
      return full && full.category.id === this.state.category;
    });
    return list;
  }

  /* 步骤 2：个人信息 */
  stepProfile() {
    return `
      ${this.question('02', '填写你的个人情况', '用于 AI 模拟审核分析，信息仅用于本次模拟。')}
      <div class="field-grid">
        ${this.field('age', '年龄', '如：30')}
        ${this.chips('学历', [
          { id: '高中以下', label: '高中以下' }, { id: '高中', label: '高中' }, { id: '大专', label: '大专' },
          { id: '本科', label: '本科' }, { id: '硕士', label: '硕士' }, { id: '博士', label: '博士' }
        ], 'degree', true)}
        ${this.field('occupation', '职业', '如：软件工程师 / 教师')}
        ${this.chips('月收入', [
          { id: '无', label: '无收入' }, { id: '1万以下', label: '1 万以下' }, { id: '1-3万', label: '1–3 万' },
          { id: '3-5万', label: '3–5 万' }, { id: '5-10万', label: '5–10 万' }, { id: '10万以上', label: '10 万以上' }
        ], 'income', true)}
        ${this.chips('语言水平', [
          { id: '不会', label: '不会' }, { id: '基础', label: '基础' }, { id: '日常交流', label: '日常交流' },
          { id: '熟练', label: '熟练' }, { id: '专业', label: '专业' }
        ], 'language', true)}
        ${this.chips('可投入资金', [
          { id: '1万以下', label: '1 万以下' }, { id: '1-5万', label: '1–5 万' }, { id: '5-10万', label: '5–10 万' },
          { id: '10-30万', label: '10–30 万' }, { id: '30万以上', label: '30 万以上' }
        ], 'funds', true)}
        ${this.chips('出境记录', [
          { id: '无', label: '暂无出境' }, { id: '短期出境', label: '有短期出境' }, { id: '长期海外', label: '有长期海外经历' }
        ], 'travelHistory', true)}
        ${this.chips('家庭情况', [
          { id: '单身', label: '单身' }, { id: '已婚无子女', label: '已婚无子女' },
          { id: '已婚有子女', label: '已婚有子女' }, { id: '其他', label: '其他' }
        ], 'family', true)}
      </div>`;
  }

  /* 步骤 3：材料准备清单 */
  stepMaterials() {
    const id = this.state.projectId;
    const p = this.allProjects().find((x) => x.id === id);
    const docs = this.docsOf(id);
    const done = docs.filter((d) => this.state.materials[d.id] === 'done').length;
    const total = docs.length;
    return `
      ${this.question('03', '官方申请材料清单', '基于官方公开要求整理，逐项标记你的准备状态。')}
      ${this.projectSummary(id)}
      <div class="diy__materials-progress">材料完成度：<b>${done} / ${total}</b></div>
      <div class="diy__materials">
        ${docs.map((d) => `
          <article class="diy__doc">
            <div class="diy__doc-head">
              <h3 class="diy__doc-name">${d.document_name}</h3>
              <span class="diy__doc-tag${d.is_required ? ' is-req' : ''}">${d.is_required ? '必须' : '视情况'}</span>
              <span class="diy__doc-cat">${d.document_category}</span>
            </div>
            <div class="diy__doc-body">
              <p class="diy__doc-req"><span>官方要求：</span>${d.official_requirement}</p>
              <p class="diy__doc-tip"><span>准备建议：</span>${d.preparation_tips}</p>
              <p class="diy__doc-src"><span>来源：</span>${d.source_reference} · 更新于 ${d.last_updated}</p>
            </div>
            <div class="diy__doc-status">
              <span class="diy__doc-status-label">我的状态：</span>
              <button type="button" class="chip${this.state.materials[d.id] === '' || !this.state.materials[d.id] ? ' is-selected' : ''}" data-mstatus="${d.id}" data-value="todo">未准备</button>
              <button type="button" class="chip${this.state.materials[d.id] === 'preparing' ? ' is-selected' : ''}" data-mstatus="${d.id}" data-value="preparing">准备中</button>
              <button type="button" class="chip${this.state.materials[d.id] === 'done' ? ' is-selected' : ''}" data-mstatus="${d.id}" data-value="done">已完成</button>
            </div>
          </article>`).join('')}
      </div>
      <div class="diy__disclaimer">${this.DISCLAIMER}</div>
    `;
  }

  /* 步骤 4：AI 模拟审核 */
  stepAnalyze() {
    const a = this.analyze();
    return `
      ${this.question('04', 'AI 模拟审核结果', '基于你填写的条件与材料准备情况生成，用于自我评估与准备参考。')}
      <div class="diy__scores">
        <div class="diy__score">
          <p class="diy__score-label">申请条件匹配度</p>
          <p class="diy__score-num">${a.cond}</p>
          <div class="diy__score-track"><span style="width:${a.cond}%"></span></div>
        </div>
        <div class="diy__score">
          <p class="diy__score-label">材料完整度</p>
          <p class="diy__score-num">${a.mat}</p>
          <div class="diy__score-track"><span style="width:${a.mat}%"></span></div>
        </div>
        <div class="diy__score">
          <p class="diy__score-label">风险等级</p>
          <p class="diy__score-num diy__score-num--risk is-${a.risk}">${a.risk}</p>
        </div>
      </div>
      <div class="diy__blocks">
        <div class="diy__block">
          <h3 class="diy__block-title">优势</h3>
          <ul>${a.strengths.map((t) => `<li>${t}</li>`).join('')}</ul>
        </div>
        <div class="diy__block">
          <h3 class="diy__block-title">风险</h3>
          <ul>${a.risks.map((t) => `<li>${t}</li>`).join('')}</ul>
        </div>
        <div class="diy__block">
          <h3 class="diy__block-title">建议</h3>
          <ul>${a.tips.map((t) => `<li>${t}</li>`).join('')}</ul>
        </div>
      </div>`;
  }

  /* 步骤 5：DIY 报告 */
  stepReport() {
    const a = this.analyze();
    const p = this.allProjects().find((x) => x.id === this.state.projectId);
    const full = this.fullProject(this.state.projectId);
    const docs = this.docsOf(this.state.projectId);
    const undone = docs.filter((d) => this.state.materials[d.id] !== 'done');
    const now = new Date();
    const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    const steps = [
      { phase: '第一阶段（1–2 周）', items: ['确认护照有效期并准备证件照', '在线填写官方签证申请表'] },
      { phase: '第二阶段（2–6 周）', items: undone.length ? undone.slice(0, 4).map((d) => '准备材料：' + d.document_name) : ['核对全部官方材料是否齐备'] },
      { phase: '第三阶段（提交与跟进）', items: ['核对目标国家官方最新政策要求', '通过官方渠道提交申请并保留回执', '关注审核进度与补件通知'] }
    ];
    return `
      <div class="diy__report">
        <div class="diy__report-head">
          <p class="diy__report-eyebrow">DIY Visa Preparation Report</p>
          <h2 class="diy__report-title">我的 DIY 签证准备报告</h2>
          <p class="diy__report-meta">${p ? p.visa_name : ''} · ${p ? this.countryCn(p.country) : ''} · ${dateStr}</p>
        </div>
        <div class="diy__scores">
          <div class="diy__score">
            <p class="diy__score-label">申请条件匹配度</p>
            <p class="diy__score-num">${a.cond}</p>
            <div class="diy__score-track"><span style="width:${a.cond}%"></span></div>
          </div>
          <div class="diy__score">
            <p class="diy__score-label">材料完整度</p>
            <p class="diy__score-num">${a.mat}</p>
            <div class="diy__score-track"><span style="width:${a.mat}%"></span></div>
          </div>
          <div class="diy__score">
            <p class="diy__score-label">风险等级</p>
            <p class="diy__score-num diy__score-num--risk is-${a.risk}">${a.risk}</p>
          </div>
        </div>
        <div class="diy__blocks">
          <div class="diy__block"><h3 class="diy__block-title">优势</h3><ul>${a.strengths.map((t) => `<li>${t}</li>`).join('')}</ul></div>
          <div class="diy__block"><h3 class="diy__block-title">风险</h3><ul>${a.risks.map((t) => `<li>${t}</li>`).join('')}</ul></div>
          <div class="diy__block"><h3 class="diy__block-title">建议</h3><ul>${a.tips.map((t) => `<li>${t}</li>`).join('')}</ul></div>
        </div>
        <div class="diy__roadmap">
          <h3 class="diy__block-title">DIY 准备路线</h3>
          ${steps.map((r) => `
            <div class="diy__roadmap-step">
              <span class="diy__roadmap-dot"></span>
              <div>
                <p class="diy__roadmap-phase">${r.phase}</p>
                <ul>${r.items.map((it) => `<li>${it}</li>`).join('')}</ul>
              </div>
            </div>`).join('')}
        </div>
        ${full ? `<div class="diy__report-more"><a class="btn btn--ghost-dark" href="project-detail.html?id=${full.id}">查看项目详情 <span class="btn-arrow">→</span></a></div>` : ''}
        <div class="diy__disclaimer">${this.DISCLAIMER}</div>
      </div>
    `;
  }

  /* ================= AI 模拟审核 ================= */

  analyze() {
    const id = this.state.projectId;
    const p = this.allProjects().find((x) => x.id === id);
    const full = this.fullProject(id);
    const prof = this.state.profile;
    const docs = this.docsOf(id);
    const cat = full ? full.category.id : '';
    const age = parseInt(prof.age, 10);
    const lv = { '不会': 0, '基础': 1, '日常交流': 2, '熟练': 3, '专业': 4 }[prof.language] || 0;
    const fv = { '1万以下': 1, '1-5万': 2, '5-10万': 3, '10-30万': 4, '30万以上': 5 }[prof.funds] || 0;
    const iv = { '无': 0, '1万以下': 1, '1-3万': 2, '3-5万': 3, '5-10万': 4, '10万以上': 5 }[prof.income] || 0;

    let score = 60;
    if (!isNaN(age)) {
      if (cat === 'youth') { if (age >= 18 && age <= 30) score += 10; else score -= 15; }
      if (cat === 'work' || cat === 'tech') { if (age >= 22 && age <= 45) score += 8; else if (age > 50) score -= 10; }
      if (cat === 'edu') { if (age >= 18 && age <= 35) score += 8; }
      if (cat === 'pr' || cat === 'invest') score += 5;
    }
    if (cat === 'edu' || cat === 'tech') {
      if (['本科', '硕士', '博士'].includes(prof.degree)) score += 10;
      else if (prof.degree === '大专') score += 4;
      else if (prof.degree) score -= 8;
    }
    if (cat === 'edu' || cat === 'work' || cat === 'tech') {
      if (lv >= 2) score += 8; else if (prof.language) score -= 8;
    }
    if (cat === 'invest') { if (fv >= 4) score += 12; else if (fv) score -= 15; }
    else if (cat === 'edu') { if (fv >= 3) score += 8; else if (fv) score -= 6; }
    else if (cat === 'work' || cat === 'nomad') { if (fv >= 2) score += 5; }
    if (cat === 'invest' || cat === 'pr') { if (iv >= 3) score += 6; }
    if (cat === 'family') score += 5;
    if (prof.travelHistory === '长期海外') score += 4;
    const cond = Math.max(20, Math.min(95, Math.round(score)));

    let done = 0, partial = 0;
    docs.forEach((d) => {
      const st = this.state.materials[d.id] || '';
      if (st === 'done') done++;
      else if (st === 'preparing') partial++;
    });
    const mat = docs.length ? Math.round(((done + partial * 0.5) / docs.length) * 100) : 0;

    let risk = '低';
    if (mat < 50) risk = '高';
    else if (mat < 80 || cond < 60) risk = '中';

    const strengths = [], risks = [], tips = [];
    if (!isNaN(age) && age >= 22 && age <= 45) strengths.push('年龄处于多数签证项目的适龄区间');
    if (['本科', '硕士', '博士'].includes(prof.degree)) strengths.push('学历背景良好，可满足多数项目的学历要求');
    if (lv >= 3) strengths.push('语言能力较强，是申请中的重要加分项');
    if (fv >= 3) strengths.push('资金准备相对充足');
    if (iv >= 3) strengths.push('收入水平稳定，具备一定的资金持续性');
    if (prof.travelHistory === '长期海外') strengths.push('具备海外经历，材料可信度与适应力更受认可');
    if (prof.family === '已婚有子女' && cat === 'family') strengths.push('家庭结构与该类项目需求契合');
    if (!strengths.length) strengths.push('基础信息完整，可按官方清单逐项补齐条件');

    if (!isNaN(age) && (age < 18 || age > 50)) risks.push('年龄可能与部分项目要求存在差距，请核对项目年龄限制');
    if (lv < 2 && (cat === 'edu' || cat === 'work' || cat === 'tech')) risks.push('语言水平可能与项目要求存在差距，建议先提升语言');
    if (fv < 3 && (cat === 'invest' || cat === 'edu')) risks.push('资金规模可能未达项目门槛，建议核对官方资金要求');
    if (mat < 80) risks.push('材料完整度不足，未完成材料可能影响审核进度');
    if (!risks.length) risks.push('暂无明显短板，继续保持材料与条件的一致性');

    if (mat < 80) {
      const undone = docs.filter((d) => this.state.materials[d.id] !== 'done').slice(0, 2);
      if (undone.length) tips.push('优先完成 ' + undone.map((d) => d.document_name).join('、') + ' 等必需材料');
    }
    if (lv < 2 && (cat === 'edu' || cat === 'work')) tips.push('制定语言提升计划（课程或考试），目标达到项目要求分数');
    if (fv < 3 && (cat === 'invest' || cat === 'edu')) tips.push('补充资金证明，或选择资金要求更匹配的路线');
    if (prof.travelHistory === '无' && (cat === 'pr' || cat === 'invest')) tips.push('提前规划一次合规出境记录，增强背景连续性');
    if (!tips.length) tips.push('材料齐备后按官方流程提交，保持信息一致并关注补件通知');

    return { cond, mat, risk, strengths: strengths.slice(0, 4), risks: risks.slice(0, 4), tips: tips.slice(0, 4) };
  }

  /* ================= 交互 ================= */

  bind() {
    this.nextBtn = this.querySelector('[data-action="next"]');
    this.prevBtn = this.querySelector('[data-action="prev"]');
    this.restartBtn = this.querySelector('[data-action="restart"]');
    this.content = this.querySelector('[data-content]');

    this.nextBtn.addEventListener('click', () => {
      if (!this.validate()) return;
      this.goTo(this.step + 1);
    });
    this.prevBtn.addEventListener('click', () => this.goTo(this.step - 1));
    this.restartBtn.addEventListener('click', () => this.reset());

    this.content.addEventListener('click', (e) => {
      const proj = e.target.closest('[data-project]');
      if (proj) {
        this.state.projectId = proj.getAttribute('data-project');
        this.state.materials = {};
        this.renderStep();
        this.clearInvalid('projectId');
        return;
      }
      const mstatus = e.target.closest('[data-mstatus]');
      if (mstatus) {
        const id = mstatus.getAttribute('data-mstatus');
        const val = mstatus.getAttribute('data-value');
        this.state.materials[id] = val;
        mstatus.parentNode.querySelectorAll('[data-mstatus]').forEach((b) => {
          b.classList.toggle('is-selected', b === mstatus);
          b.setAttribute('aria-pressed', String(b === mstatus));
        });
        const dlist = this.docsOf(this.state.projectId);
        const doneCount = dlist.filter((d) => this.state.materials[d.id] === 'done').length;
        const prog = this.content.querySelector('.diy__materials-progress b');
        if (prog) prog.textContent = doneCount + ' / ' + dlist.length;
        return;
      }
      const chip = e.target.closest('[data-chip]');
      if (chip) {
        const key = chip.dataset.chip;
        this.state.profile[key] = chip.dataset.value;
        this.content.querySelectorAll('[data-chip="' + key + '"]').forEach((c) => {
          c.classList.toggle('is-selected', c === chip);
          c.setAttribute('aria-pressed', String(c === chip));
        });
        this.clearInvalid(key);
      }
    });

    this.content.addEventListener('input', (e) => {
      const inp = e.target.closest('[data-input]');
      if (inp) {
        this.state.profile[inp.dataset.input] = inp.value;
        this.clearInvalid(inp.dataset.input);
      }
    });
    this.content.addEventListener('change', (e) => {
      const sel = e.target.closest('[data-filter]');
      if (sel) {
        this.state[sel.dataset.filter] = sel.value;
        this.renderStep();
      }
    });
  }

  validate() {
    let ok = true;
    const check = (key, cond) => {
      const field = this.content.querySelector('[data-field="' + key + '"]');
      const invalid = !cond;
      if (field) field.classList.toggle('is-invalid', invalid);
      if (invalid) ok = false;
    };
    if (this.step === 0) check('projectId', !!this.state.projectId);
    if (this.step === 1) {
      check('age', /^\d{1,3}$/.test((this.state.profile.age || '').trim()) && parseInt(this.state.profile.age, 10) >= 5 && parseInt(this.state.profile.age, 10) <= 100);
      check('degree', !!this.state.profile.degree);
      check('income', !!this.state.profile.income);
      check('language', !!this.state.profile.language);
      check('funds', !!this.state.profile.funds);
      check('travelHistory', !!this.state.profile.travelHistory);
      check('family', !!this.state.profile.family);
    }
    return ok;
  }

  goTo(index) {
    this.step = Math.max(0, Math.min(this.totalSteps - 1, index));
    const names = ['选择签证项目', '填写个人情况', '材料准备清单', 'AI模拟审核', '生成DIY报告'];
    const pct = Math.round((this.step / (this.totalSteps - 1)) * 100);
    this.renderStep();
    const label = this.querySelector('[data-label]');
    if (label) label.textContent = '第 ' + (this.step + 1) + ' 步 / ' + this.totalSteps + ' 步';
    const name = this.querySelector('[data-step-name]');
    if (name) name.textContent = names[this.step];
    const pctEl = this.querySelector('[data-pct]');
    if (pctEl) pctEl.textContent = pct + '%';
    const fill = this.querySelector('[data-fill]');
    if (fill) fill.style.width = pct + '%';
    this.prevBtn.style.visibility = this.step === 0 ? 'hidden' : 'visible';
    this.nextBtn.style.display = this.step === this.totalSteps - 1 ? 'none' : 'inline-flex';
    this.restartBtn.style.display = this.step === this.totalSteps - 1 ? 'inline-flex' : 'none';
    if (this.step === 4) this.restartBtn.style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderStep() {
    const html = [this.stepProject, this.stepProfile, this.stepMaterials, this.stepAnalyze, this.stepReport][this.step].call(this);
    this.content.innerHTML = html;
    if (Istra.reveal) Istra.reveal.observe(this.content);
  }

  clearInvalid(key) {
    const field = this.content.querySelector('[data-field="' + key + '"]');
    if (field) field.classList.remove('is-invalid');
  }

  reset() {
    this.state = {
      projectId: '', country: '', category: '',
      profile: { age: '', degree: '', occupation: '', income: '', language: '', funds: '', travelHistory: '', family: '' },
      materials: {}
    };
    this.report = null;
    this.step = 0;
    this.goTo(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

customElements.define('is-diy-visa', SiteDiyVisa);