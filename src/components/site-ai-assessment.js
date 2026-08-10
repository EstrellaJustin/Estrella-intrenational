/* ============================================================
   组件：is-ai-assessment · 全球人生路径规划评估中心（v9）
   7 步信息采集（多层级职业/资金/健康/目标/偏好）→ 20 个匹配方案
   定位：全球人生规划评估（适用于所有人）
   ============================================================ */

class SiteAiAssessment extends HTMLElement {
  constructor() {
    super();
    this.step = 0;
    this.phase = 'form';
    this.totalSteps = 6;
    this.state = {
      age: '', gender: '', curCountry: '', curCity: '', marital: '', hasKids: '', familyMembers: '',
      cat1: '', cat2: '', skills: '', years: '', position: '', cert: '', learnSkill: '',
      degree: '', major: '', gradYear: '', certDoc: '',
      englishLevel: '', otherLangs: '', learnLocal: '', langTest: '',
      funds: '', source: [], lowCost: '', workDevelop: '', studyFirst: '',
      healthNeed: '', specialMed: '', chronic: '', regularMed: '', parentsPlan: '', eduNeed: '',
      goals: [], priority1: '', priority2: '', priority3: '',
      likes: [], climate: [], pace: '', risk: '', accepts: [],
      identity: '', industry: '', developWays: [], planTime: '', idealLife: ''
    };
    this.report = null;
  }

  connectedCallback() {
    this.render();
    this.bind();
    this.updateView();
    Istra.reveal.observe(this);
  }

  /* ================= 职业数据库（14 大类 × 二级） ================= */

  careerDb() {
    return {
      tech: { name: '技术类', subs: ['机械维修', '电子技术', '自动化', '其他技术'] },
      service: { name: '服务类', subs: ['厨师', '酒店员工', '美容美发', '护理人员', '家政服务', '其他服务'] },
      manufacture: { name: '制造业', subs: ['机械操作', '焊工', '电工', '汽车维修', '生产管理', '其他制造'] },
      construction: { name: '建筑工程', subs: ['木工', '瓦工', '水电工', '工程师', '其他建筑'] },
      medical: { name: '医疗护理', subs: ['医生', '护士', '护理员', '药剂师', '其他医疗'] },
      edu: { name: '教育', subs: ['教师', '培训师', '教育管理', '其他教育'] },
      finance: { name: '金融商业', subs: ['会计', '销售', '行政', '管理', '其他商业'] },
      internet: { name: '互联网', subs: ['程序员', '产品经理', '设计师', '运营', '其他互联网'] },
      agriculture: { name: '农业', subs: ['种植', '养殖', '农业机械', '其他农业'] },
      logistics: { name: '物流运输', subs: ['司机', '仓储', '配送', '其他物流'] },
      catering: { name: '餐饮酒店', subs: ['厨师', '服务员', '前台', '客房', '其他餐饮酒店'] },
      art: { name: '艺术设计', subs: ['平面设计', '插画', '摄影', '音乐', '其他艺术'] },
      freelance: { name: '自由职业', subs: ['远程办公', '内容创作', '咨询', '其他自由职业'] },
      none: { name: '无固定职业', subs: ['待业', '退休', '家庭主妇/主夫', '其他'] }
    };
  }

  goalLabels() {
    return {
      travel: '旅游体验', short: '短期工作', work: '长期工作', study: '留学提升',
      career: '职业发展', startup: '创业', invest: '投资', family: '家庭团聚',
      pr: '长期居留', identity: '获得海外身份'
    };
  }

  /* ================= 字段构建 ================= */

  selects(name, label, options, full = false) {
    const opts = ['<option value="">请选择</option>']
      .concat(options.map((o) => `<option value="${o.value}">${o.label}</option>`))
      .join('');
    return `
      <div class="field ${full ? 'field--full' : ''}" data-field="${name}">
        <label for="f-${name}">${label}</label>
        <select id="f-${name}" data-select="${name}">${opts}</select>
        <span class="field-error">请完成此项选择</span>
      </div>`;
  }

  text(name, label, placeholder = '', full = false) {
    return `
      <div class="field ${full ? 'field--full' : ''}" data-field="${name}">
        <label for="f-${name}">${label}</label>
        <input id="f-${name}" type="text" data-input="${name}" value="${this.state[name] || ''}" placeholder="${placeholder}" autocomplete="off" />
        <span class="field-error">请填写此项</span>
      </div>`;
  }

  textarea(name, label, placeholder = '', full = true) {
    return `
      <div class="field ${full ? 'field--full' : ''}" data-field="${name}">
        <label for="f-${name}">${label}</label>
        <textarea id="f-${name}" data-input="${name}" placeholder="${placeholder}" rows="3">${this.state[name] || ''}</textarea>
        <span class="field-error">请填写此项</span>
      </div>`;
  }

  chips(name, list, stateKey, multi = true) {
    const cur = this.state[stateKey];
    return `
      <div class="field field--full" data-field="${stateKey}">
        <span class="field-label">${name}</span>
        <div class="chip-grid">
          ${list.map((o) => {
            const active = multi ? (cur || []).includes(o.id) : cur === o.id;
            return `<button type="button" class="chip${active ? ' is-selected' : ''}" data-chip="${stateKey}" data-value="${o.id}"${multi ? '' : ' data-single="1"'} aria-pressed="${active}">${o.label}</button>`;
          }).join('')}
        </div>
        <span class="field-error">请至少选择一项</span>
      </div>`;
  }

  radioRow(name, stateKey, options) {
    const cur = this.state[stateKey];
    return `
      <div class="field field--full" data-field="${stateKey}">
        <span class="field-label">${name}</span>
        <div class="chip-grid">
          ${options.map((o) => `<button type="button" class="chip${cur === o.value ? ' is-selected' : ''}" data-radio="${stateKey}" data-value="${o.value}" aria-pressed="${cur === o.value}">${o.label}</button>`).join('')}
        </div>
        <span class="field-error">请选择一项</span>
      </div>`;
  }

  question(no, title, desc) {
    return `
      <p class="wizard__panel-q">Q${no}<span>/ 06</span></p>
      <h2 class="wizard__panel-title">${title}</h2>
      <p class="wizard__panel-desc">${desc}</p>`;
  }
  /* ================= 7 个阶段 ================= */

  stepPanel(i) {
    const subByIndustry = {
      tech: ['程序员', '产品经理', '设计师', '运营', '工程师', '其他'],
      manufacture: ['机械操作', '机械维修', '焊工', '电工', '汽车维修', '生产管理', '工程师', '其他'],
      medical: ['医生', '护士', '护理员', '药剂师', '其他'],
      edu: ['教师', '培训师', '其他'],
      catering: ['厨师', '服务员', '酒店员工', '其他'],
      construction: ['木工', '瓦工', '水电工', '工程师', '其他'],
      finance: ['会计', '销售', '其他'],
      trade: ['销售', '其他'],
      other: ['其他']
    };
    switch (i) {
      case 0: /* 1 基本信息 */
        return `
          ${this.question('01', '基本信息', '先认识您，评估将从您的个人情况开始。')}
          <div class="field-grid">
            ${this.chips('年龄', [
              { id: 'u18', label: '18 岁以下' }, { id: '18-22', label: '18–22 岁' },
              { id: '23-30', label: '23–30 岁' }, { id: '31-40', label: '31–40 岁' },
              { id: '41-50', label: '41–50 岁' }, { id: '50+', label: '50 岁以上' }
            ], 'age', false)}
            ${this.chips('性别（可选）', [{ id: 'male', label: '男' }, { id: 'female', label: '女' }, { id: 'other', label: '其他' }], 'gender', false)}
            ${this.selects('curCountry', '当前所在地（国家/地区）', [{ value: 'cn', label: '中国' }, { value: 'other', label: '其他国家' }])}
            ${this.chips('婚姻情况', [{ id: 'single', label: '单身' }, { id: 'married', label: '已婚' }, { id: 'other', label: '其他' }], 'marital', false)}
            ${this.chips('是否有子女', [{ id: 'yes', label: '有' }, { id: 'no', label: '无' }], 'hasKids', false)}
          </div>
          <p class="wizard__panel-hint">* 你的信息仅用于 AI 匹配分析，不会公开展示。</p>`;
      case 1: /* 2 教育背景 */
        return `
          ${this.question('02', '教育背景', '学历与专业是匹配的重要维度。')}
          <div class="field-grid">
            ${this.chips('最高学历', [
              { id: 'below-high', label: '初中及以下' }, { id: 'high', label: '高中' },
              { id: 'vocational', label: '中专/技校' }, { id: 'college', label: '大专' },
              { id: 'bachelor', label: '本科' }, { id: 'master', label: '硕士' }, { id: 'phd', label: '博士' }
            ], 'degree', false)}
            ${this.text('major', '专业方向（选填）', '如：机电 / 护理 / 会计')}
            ${this.chips('是否有职业资格证书', [{ id: 'yes', label: '有' }, { id: 'no', label: '没有' }], 'cert', false)}
          </div>`;
      case 2: /* 3 职业与技能 */
        return `
          ${this.question('03', '职业与技能', '您的职业背景决定适合的发展路线。')}
          <div class="field-grid">
            ${this.radioRow('当前身份', 'identity', [
              { value: 'student', label: '学生' }, { value: 'employed', label: '在职人员' },
              { value: 'freelancer', label: '自由职业者' }, { value: 'owner', label: '企业主' }, { value: 'unemployed', label: '待业' }
            ])}
            ${this.radioRow('行业', 'industry', [
              { value: 'tech', label: 'IT科技' }, { value: 'manufacture', label: '工程制造' },
              { value: 'medical', label: '医疗健康' }, { value: 'edu', label: '教育' },
              { value: 'catering', label: '餐饮酒店' }, { value: 'construction', label: '建筑' },
              { value: 'finance', label: '金融' }, { value: 'trade', label: '贸易' }, { value: 'other', label: '其他' }
            ])}
            <div class="career-occ" data-career-occ style="display:none">
              ${Object.keys(subByIndustry).map((ind) => `
                <div class="career-subs" data-occsub="${ind}" style="display:none">
                  ${this.chips('具体职业', subByIndustry[ind].map((x) => ({ id: x, label: x })), 'cat2', false)}
                </div>`).join('')}
            </div>
            ${this.text('position', '具体职业（选填）', '如：焊工 / 车间主管 / 程序员')}
            ${this.chips('工作年限', [
              { id: 'none', label: '无' }, { id: '1y-', label: '1 年以内' },
              { id: '1-3', label: '1–3 年' }, { id: '3-5', label: '3–5 年' }, { id: '5y+', label: '5 年以上' }
            ], 'years', false)}
            ${this.textarea('skills', '技能描述（选填）', '如：机械维修经验 / 会焊接 / 会开车 / 面点制作…')}
          </div>
          <p class="wizard__panel-hint">* 你的信息仅用于 AI 匹配分析，不会公开展示。</p>`;
      case 3: /* 4 语言能力 */
        return `
          ${this.question('04', '语言能力', '语言水平影响可申请的路线与融入速度。')}
          <div class="field-grid">
            ${this.chips('英语水平', [
              { id: 'none', label: '不会' }, { id: 'basic', label: '基础' },
              { id: 'daily', label: '日常交流' }, { id: 'skilled', label: '熟练' }, { id: 'fluent', label: '专业水平' }
            ], 'englishLevel', false)}
            ${this.text('otherLangs', '其他语言（选填）', '如：日语 / 德语 / 粤语…')}
            ${this.chips('是否愿意学习新语言', [{ id: 'yes', label: '愿意' }, { id: 'no', label: '暂不考虑' }], 'learnLocal', false)}
          </div>`;
      case 4: /* 5 资金与规划 */
        return `
          ${this.question('05', '资金与规划', '根据您的预算匹配现实可行的路线，不做高门槛设置。')}
          <div class="field-grid">
            ${this.chips('资金预算', [
              { id: '<1w', label: '1 万元以下' }, { id: '1-3w', label: '1–5 万元' },
              { id: '5-10w', label: '5–10 万元' }, { id: '10-30w', label: '10–30 万元' },
              { id: '30-100w', label: '30 万元以上' }
            ], 'funds', false)}
            ${this.chips('计划时间', [
              { id: 'half-year', label: '半年内' }, { id: '1year', label: '1 年内' },
              { id: '1-3y', label: '1–3 年' }, { id: 'long', label: '长期规划' }
            ], 'planTime', false)}
            ${this.chips('可接受的发展方式（可多选，选填）', [
              { id: 'lowcost', label: '低成本路线' }, { id: 'work', label: '边工作边发展' }, { id: 'study', label: '先学习后就业' }
            ], 'developWays')}
          </div>
          <p class="wizard__panel-hint">* 你的收入、资金与规划信息仅用于 AI 匹配分析，不会公开展示。</p>`;
      case 5: /* 6 个人目标与偏好 */
        return `
          ${this.question('06', '个人目标与偏好', '最后一步，让我们更了解您理想中的海外生活。')}
          <div class="field-grid">
            ${this.chips('出国主要目的（可多选）', [
              { id: 'work', label: '工作就业' }, { id: 'pr', label: '长期定居' },
              { id: 'study', label: '留学提升' }, { id: 'startup', label: '创业发展' },
              { id: 'family', label: '子女教育' }, { id: 'travel', label: '生活体验' }
            ], 'goals')}
            ${this.chips('气候偏好（可多选）', [
              { id: 'warm', label: '温暖' }, { id: 'four', label: '四季分明' }, { id: 'cold', label: '寒冷' }
            ], 'climate')}
            ${this.chips('生活环境（可多选）', [
              { id: 'big', label: '大城市' }, { id: 'small', label: '小城市' }, { id: 'nature', label: '自然环境' }
            ], 'likes')}
            ${this.chips('风险接受程度', [
              { id: 'stable', label: '保守稳定' }, { id: 'long', label: '平衡发展' }, { id: 'quick', label: '愿意挑战' }
            ], 'risk', false)}
            ${this.textarea('idealLife', '请描述你理想中的海外生活', '如：希望有稳定的工作、孩子接受国际教育、周末能亲近自然…')}
          </div>
          <p class="wizard__panel-hint">* 你的个人目标与偏好仅用于 AI 匹配分析，不会公开展示。</p>
          <div class="wizard__panel-cta">
            <p class="wizard__submit-note">已填写完成 · 预计生成时间：10 秒左右</p>
            <button type="button" class="btn btn--primary" data-action="generate">生成我的全球发展分析报告 <span class="btn-arrow">→</span></button>
          </div>`;
    }
  }

    priorityOptions() {
    return Object.entries(this.goalLabels()).map(([id, label]) => ({ value: id, label }));
  }
  /* ================= 渲染 ================= */

  render() {
    const steps = ['基本信息', '教育背景', '职业与技能', '语言能力', '资金与规划', '目标与偏好'];
    this.innerHTML = `
      <div class="assessment">
        <header class="assessment__head">
          <div class="container">
            <p class="assessment__eyebrow" data-reveal>AI Life Path Planning System</p>
            <h1 class="assessment__title" data-reveal>全球人生路径规划评估中心</h1>
            <p class="assessment__sub" data-reveal>6 步专业评估 · 覆盖学生、职场人士、创业者与家庭用户 · 生成 20 个个性化匹配方案</p>
          </div>
        </header>

        <div class="assessment__body">
          <div class="container">
            <section class="assessment__intro" data-reveal>
              <p class="assessment__intro-eyebrow">Global Development Assessment</p>
              <h2 class="assessment__intro-title">AI 全球机会评估</h2>
              <p class="assessment__intro-sub">通过你的个人情况、职业背景、发展目标等信息，AI 分析适合你的国家、项目以及未来发展路径。</p>
              <div class="assessment__intro-meta">
                <span class="assessment__intro-chip">预计耗时：3–5 分钟</span>
              </div>
              <div class="assessment__intro-list">
                <p class="assessment__intro-list-label">你将获得</p>
                <ul>
                  <li>匹配国家分析</li><li>推荐项目</li><li>个人优势分析</li><li>风险提醒</li><li>发展建议</li>
                </ul>
              </div>
            </section>

            <div class="wizard" data-reveal>
              <div class="wizard__progress">
                <div class="wizard__progress-head">
                  <span class="wizard__step-label" data-label>第 1 步 / 6 步</span>
                  <span class="wizard__step-name" data-step-name>${steps[0]}</span>
                  <span class="wizard__pct" data-pct>0%</span>
                </div>
                <div class="wizard__track">
                  <span class="wizard__track-line" aria-hidden="true"></span>
                  <span class="wizard__track-fill" aria-hidden="true"></span>
                </div>
                <div class="wizard__dots">${steps.map((x, i) => `<span class="wizard__dot" data-dot="${i}" title="${x}"></span>`).join('')}</div>
              </div>

              <div class="wizard__content">
                ${steps.map((x, i) => `<div class="wizard__panel" data-panel="${i}">${this.stepPanel(i)}</div>`).join('')}
              </div>

              <div class="wizard__actions">
                <button type="button" class="btn btn--ghost-dark" data-action="prev">上一步</button>
                <div class="wizard__actions-right">
                  <button type="button" class="btn btn--ghost-dark" data-action="restart" style="display:none">重新评估</button>
                  <button type="button" class="btn btn--primary" data-action="next">下一步 <span class="btn-arrow">→</span></button>
                </div>
              </div>
              <div class="legal-note wizard__legal">
                <p>本评估基于您填写的信息与公开规则进行智能匹配，结果仅供参考，不代表签证批准概率，不构成移民、法律、财务或职业建议；最终申请结果以相关国家政府、官方机构审核为准。请确保提交的信息真实、准确、完整。</p>
                <a href="disclaimer.html">查看完整免责声明 →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

    /* ================= 交互 ================= */

  bind() {
    this.nextBtn = this.querySelector('[data-action="next"]');
    this.prevBtn = this.querySelector('[data-action="prev"]');
    this.restartBtn = this.querySelector('[data-action="restart"]');

    this.querySelectorAll('[data-select]').forEach((sel) => {
      sel.addEventListener('change', () => {
        this.state[sel.dataset.select] = sel.value;
        this.clearInvalid(sel.dataset.select);
      });
    });

    this.querySelectorAll('[data-input]').forEach((inp) => {
      inp.addEventListener('input', () => {
        this.state[inp.dataset.input] = inp.value;
        this.clearInvalid(inp.dataset.input);
      });
    });

    this.querySelectorAll('[data-chip]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.chip;
        const val = chip.dataset.value;
        if (chip.dataset.single) {
          this.state[key] = val;
          this.querySelectorAll('[data-chip="' + key + '"]').forEach((c) => {
            c.classList.toggle('is-selected', c === chip);
            c.setAttribute('aria-pressed', String(c === chip));
          });
          this.clearInvalid(key);
          if (key === 'cat2' && val === '其他') { this.state.cat2 = ''; this.clearInvalid('cat2'); }
          return;
        }
        const arr = this.state[key] || [];
        const i = arr.indexOf(val);
        if (i >= 0) arr.splice(i, 1); else arr.push(val);
        chip.classList.toggle('is-selected', i < 0);
        chip.setAttribute('aria-pressed', String(i < 0));
        this.clearInvalid(key);
        if (key === 'developWays') {
          const ways = this.state.developWays || [];
          this.state.lowCost = ways.includes('lowcost') ? 'yes' : '';
          this.state.workDevelop = ways.includes('work') ? 'yes' : '';
          this.state.studyFirst = ways.includes('study') ? 'yes' : '';
        }
      });
    });

    this.querySelectorAll('[data-radio]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.radio;
        const val = chip.dataset.value;
        this.state[key] = val;
        this.querySelectorAll('[data-radio="' + key + '"]').forEach((c) => {
          c.classList.toggle('is-selected', c === chip);
          c.setAttribute('aria-pressed', String(c === chip));
        });
        this.clearInvalid(key);
        if (key === 'identity') this.syncIdentity();
        if (key === 'industry') this.syncIndustry(val);
      });
    });

    this.prevBtn.addEventListener('click', () => this.goTo(this.step - 1));
    this.nextBtn.addEventListener('click', () => {
      if (!this.validate(this.step)) return;
      this.goTo(this.step + 1);
    });
    this.restartBtn.addEventListener('click', () => this.reset());

    const gen = this.querySelector('[data-action="generate"]');
    if (gen) gen.addEventListener('click', () => {
      if (!this.validate(this.totalSteps - 1)) return;
      this.startAnalysis();
    });
  }

  /* 当前身份联动：学生/待业/自由职业/企业主 自动映射职业大类 */
  syncIdentity() {
    const id = this.state.identity;
    const occ = this.querySelector('[data-career-occ]');
    const fixed = id === 'student' || id === 'unemployed' ? 'none' : (id === 'freelancer' ? 'freelance' : (id === 'owner' ? 'finance' : ''));
    if (occ) occ.style.display = fixed ? 'none' : '';
    if (fixed) {
      this.state.cat1 = fixed;
      this.state.cat2 = '';
      this.querySelectorAll('[data-chip="cat2"]').forEach((c) => {
        c.classList.remove('is-selected');
        c.setAttribute('aria-pressed', 'false');
      });
    }
  }

  /* 行业联动：映射算法兼容 cat1 + 显示对应具体职业分组 */
  syncIndustry(val) {
    const map = { tech: 'tech', manufacture: 'manufacture', medical: 'medical', edu: 'edu', catering: 'catering', construction: 'construction', finance: 'finance', trade: 'finance', other: 'service' };
    this.state.cat1 = map[val] || '';
    this.querySelectorAll('[data-occsub]').forEach((g) => { g.style.display = g.dataset.occsub === val ? '' : 'none'; });
    const group = this.querySelector('[data-occsub="' + val + '"]');
    const validSubs = group ? Array.prototype.map.call(group.querySelectorAll('[data-chip="cat2"]'), (c) => c.dataset.value) : [];
    if (!validSubs.includes(this.state.cat2)) {
      this.state.cat2 = '';
      this.querySelectorAll('[data-chip="cat2"]').forEach((c) => {
        c.classList.remove('is-selected');
        c.setAttribute('aria-pressed', 'false');
      });
      this.clearInvalid('cat2');
    }
  }

    validate(step) {
    let ok = true;
    const check = (key, cond) => {
      const invalid = !cond;
      this.toggleInvalid(key, invalid);
      if (invalid) ok = false;
    };
    switch (step) {
      case 0:
        check('age', !!this.state.age);
        check('curCountry', !!this.state.curCountry);
        check('marital', !!this.state.marital);
        check('hasKids', !!this.state.hasKids);
        break;
      case 1:
        check('degree', !!this.state.degree);
        break;
      case 2:
        check('identity', !!this.state.identity);
        check('industry', this.state.identity === 'student' || this.state.identity === 'unemployed' || this.state.identity === 'freelancer' || this.state.identity === 'owner' || !!this.state.industry);
        check('years', !!this.state.years);
        break;
      case 3:
        check('englishLevel', !!this.state.englishLevel);
        check('learnLocal', !!this.state.learnLocal);
        break;
      case 4:
        check('funds', !!this.state.funds);
        check('planTime', !!this.state.planTime);
        break;
      case 5:
        check('goals', this.state.goals.length > 0);
        check('climate', this.state.climate.length > 0);
        check('likes', this.state.likes.length > 0);
        check('risk', !!this.state.risk);
        break;
    }
    return ok;
  }

    toggleInvalid(key, invalid) {
    const field = this.querySelector(`[data-field="${key}"]`);
    if (field) field.classList.toggle('is-invalid', invalid);
  }

  clearInvalid(key) {
    const field = this.querySelector(`[data-field="${key}"]`);
    if (field) field.classList.remove('is-invalid');
  }

  goTo(index) {
    this.step = Math.max(0, Math.min(this.totalSteps - 1, index));
    const steps = ['基本信息', '教育背景', '职业与技能', '语言能力', '资金与规划', '目标与偏好'];
    const pct = Math.round((this.step / (this.totalSteps - 1)) * 100);
    this.querySelectorAll('[data-panel]').forEach((panel, i) => {
      panel.classList.toggle('is-active', i === this.step);
    });
    const label = this.querySelector('[data-label]');
    if (label) label.textContent = '第 ' + (this.step + 1) + ' 步 / ' + this.totalSteps + ' 步';
    const name = this.querySelector('[data-step-name]');
    if (name) name.textContent = steps[this.step];
    const pctEl = this.querySelector('[data-pct]');
    if (pctEl) pctEl.textContent = pct + '%';
    this.querySelectorAll('[data-dot]').forEach((d, i) => {
      d.classList.toggle('is-done', i < this.step);
      d.classList.toggle('is-active', i === this.step);
    });
    const fill = this.querySelector('.wizard__track-fill');
    if (fill) fill.style.width = pct + '%';
    this.prevBtn.style.visibility = this.step === 0 ? 'hidden' : 'visible';
    this.nextBtn.style.display = this.step === this.totalSteps - 1 ? 'none' : 'inline-flex';
    this.restartBtn.style.display = 'none';
  }

    reset() {
    this.state = {
      age: '', gender: '', curCountry: '', curCity: '', marital: '', hasKids: '', familyMembers: '',
      cat1: '', cat2: '', skills: '', years: '', position: '', cert: '', learnSkill: '',
      degree: '', major: '', gradYear: '', certDoc: '',
      englishLevel: '', otherLangs: '', learnLocal: '', langTest: '',
      funds: '', source: [], lowCost: '', workDevelop: '', studyFirst: '',
      healthNeed: '', specialMed: '', chronic: '', regularMed: '', parentsPlan: '', eduNeed: '',
      goals: [], priority1: '', priority2: '', priority3: '',
      likes: [], climate: [], pace: '', risk: '', accepts: [],
      identity: '', industry: '', developWays: [], planTime: '', idealLife: ''
    };
    this.phase = 'form';
    this.render();
    this.bind();
    this.updateView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateView() {
    this.goTo(0);
  }
  /* ================= 智能匹配引擎（v9 · 新维度） ================= */

  budgetTier() {
    const f = this.state.funds;
    if (f === '<1w' || f === '1-3w' || f === '3-5w') return 'low';
    if (f === '5-10w') return 'midlow';
    if (f === '10-30w' || f === '30-100w') return 'mid';
    return 'high';
  }

  countryTags() {
    return {
      us: ['tech', 'study', 'invest', 'big', 'four', 'ocean', 'medical', 'pr'],
      ca: ['tech', 'study', 'invest', 'big', 'cold', 'four', 'family', 'pr', 'medical'],
      mx: ['warm', 'trade', 'mid'],
      gb: ['tech', 'study', 'invest', 'big', 'rain', 'ocean', 'finance', 'pr'],
      de: ['tech', 'study', 'invest', 'big', 'four', 'trade', 'pr', 'medical'],
      fr: ['study', 'invest', 'big', 'four', 'ocean', 'trade', 'pr'],
      nl: ['tech', 'study', 'big', 'rain', 'ocean', 'trade', 'pr'],
      se: ['tech', 'study', 'cold', 'four', 'pr', 'medical'],
      no: ['study', 'cold', 'ocean', 'pr', 'medical', 'trade'],
      dk: ['tech', 'study', 'cold', 'ocean', 'pr'],
      fi: ['tech', 'study', 'cold', 'four', 'pr'],
      ie: ['tech', 'study', 'rain', 'ocean', 'pr'],
      it: ['study', 'invest', 'warm', 'four', 'ocean', 'pr'],
      es: ['study', 'invest', 'warm', 'ocean', 'nomad', 'pr'],
      pt: ['invest', 'warm', 'ocean', 'nomad', 'pr'],
      ch: ['tech', 'study', 'invest', 'cold', 'four', 'finance', 'pr'],
      at: ['study', 'four', 'pr'],
      be: ['study', 'big', 'rain', 'pr', 'trade'],
      lu: ['invest', 'finance', 'pr'],
      pl: ['study', 'four', 'trade', 'pr', 'mid'],
      cz: ['study', 'four', 'trade', 'pr', 'mid'],
      hu: ['study', 'invest', 'four', 'pr', 'mid'],
      gr: ['invest', 'warm', 'ocean', 'nomad', 'pr'],
      cy: ['invest', 'warm', 'ocean', 'nomad', 'pr'],
      mt: ['invest', 'warm', 'ocean', 'nomad', 'pr'],
      hr: ['warm', 'ocean', 'nomad', 'pr'],
      si: ['four', 'pr', 'mid'],
      sk: ['four', 'trade', 'pr', 'mid'],
      ee: ['tech', 'nomad', 'pr'],
      lt: ['nomad', 'pr'],
      lv: ['nomad', 'pr'],
      ro: ['trade', 'pr', 'mid'],
      bg: ['nomad', 'pr', 'mid'],
      jp: ['tech', 'study', 'big', 'four', 'pr', 'medical'],
      kr: ['tech', 'study', 'big', 'four', 'pr'],
      sg: ['tech', 'study', 'invest', 'big', 'warm', 'finance', 'trade', 'pr'],
      my: ['study', 'warm', 'rain', 'mid'],
      th: ['warm', 'rain', 'nomad', 'mid'],
      vn: ['trade', 'warm', 'rain', 'mid'],
      ph: ['study', 'warm', 'ocean', 'mid'],
      id: ['trade', 'warm', 'rain', 'mid'],
      in: ['tech', 'trade', 'warm', 'big'],
      au: ['tech', 'study', 'invest', 'warm', 'ocean', 'family', 'pr', 'medical'],
      nz: ['study', 'invest', 'ocean', 'family', 'pr', 'medical'],
      ae: ['invest', 'big', 'warm', 'finance', 'trade', 'pr'],
      qa: ['invest', 'warm', 'finance', 'pr'],
      sa: ['invest', 'warm', 'trade', 'pr'],
      il: ['tech', 'study', 'warm', 'pr'],
      tr: ['trade', 'warm', 'pr', 'mid'],
      br: ['trade', 'warm', 'rain', 'mid'],
      ar: ['warm', 'mid'],
      cl: ['invest', 'warm', 'high', 'pr'],
      za: ['warm', 'pr', 'mid']
    };
  }

  scoreCountries() {
    const s = this.state;
    const tags = this.countryTags();
    const score = {};
    const reasons = {};
    Object.keys(tags).forEach((id) => { score[id] = 0; reasons[id] = []; });

    const add = (id, pts, reason) => {
      if (!(id in score)) return;
      score[id] += pts;
      if (reason && !reasons[id].includes(reason)) reasons[id].push(reason);
    };
    const addMany = (list, pts, reason) => list.forEach((id) => add(id, pts, reason));
    const byTag = (t) => Object.keys(tags).filter((id) => tags[id].includes(t));

    /* 目标 */
    const goalMap = {
      travel: ['nomad', 'youth'], short: ['work', 'nomad'], work: ['tech', 'trade', 'finance'],
      study: ['study'], career: ['tech', 'trade'], startup: ['invest'], invest: ['invest'],
      family: ['family', 'study'], pr: ['pr'], identity: ['pr']
    };
    s.goals.forEach((g) => {
      const list = (goalMap[g] || []).map((t) => byTag(t)).flat();
      if (g === 'work' || g === 'career') addMany(list, 2, '职业机会');
      else if (g === 'study') addMany(list, 3, '教育机会');
      else if (g === 'pr' || g === 'identity') addMany(list, 3, '长期身份');
      else if (g === 'family') addMany(list, 2, '家庭规划');
      else if (g === 'invest') addMany(list, 3, '投资环境');
      else if (g === 'startup') addMany(list, 2, '商业环境');
      else addMany(list, 2, '目标匹配');
    });

    /* 职业（一级大类） */
    const catMap = {
      tech: ['tech'], service: ['trade', 'mid'], manufacture: ['trade', 'mid'],
      construction: ['trade', 'mid'], medical: ['medical'], edu: ['study'],
      finance: ['finance', 'invest'], internet: ['tech'], agriculture: ['mid', 'trade'],
      logistics: ['trade'], catering: ['trade', 'mid'], art: ['nomad'],
      freelance: ['nomad', 'tech'], none: ['study', 'nomad']
    };
    (catMap[s.cat1] || []).forEach((t) => addMany(byTag(t), 2, '职业匹配'));

    /* 职业（二级：更精准） */
    const subMap = {
      '机械维修': 'work-bluecollar', '机械操作': 'work-bluecollar', '焊工': 'work-bluecollar',
      '电工': 'work-bluecollar', '汽车维修': 'work-bluecollar', '木工': 'work-bluecollar',
      '瓦工': 'work-bluecollar', '水电工': 'work-bluecollar', '生产管理': 'work-skilled',
      '工程师': 'tech-engineer', '电子技术': 'tech-engineer', '自动化': 'tech-engineer',
      '程序员': 'tech-it', '产品经理': 'tech-it', '设计师': 'tech-it', '运营': 'tech-it',
      '医生': 'tech-medical', '护士': 'tech-medical', '护理员': 'tech-medical', '药剂师': 'tech-medical',
      '教师': 'tech-degree', '培训师': 'tech-degree', '会计': 'finance', '销售': 'trade',
      '厨师': 'work-regular', '服务员': 'work-regular', '酒店员工': 'work-regular',
      '美容美发': 'work-regular', '家政服务': 'work-regular', '护理人员': 'work-regular',
      '司机': 'work-regular', '配送': 'work-regular', '仓储': 'work-regular',
      '种植': 'work-regular', '养殖': 'work-regular', '远程办公': 'nomad-visa', '内容创作': 'nomad-visa',
      '摄影': 'nomad-visa', '音乐': 'nomad-visa', '平面设计': 'nomad-visa', '插画': 'nomad-visa'
    };
    const subProj = subMap[s.cat2];
    if (subProj) addMany(byTag('work'), 2, '技能匹配');

    /* 年龄 */
    const ageMap = { u18: ['study'], '18-22': ['study', 'youth'], '23-30': ['tech', 'study', 'nomad'], '31-40': ['tech', 'pr'], '41-50': ['pr', 'invest'], '50+': ['pr', 'invest'] };
    (ageMap[s.age] || []).forEach((t) => addMany(byTag(t), 1, '年龄阶段'));

    /* 学历 */
    if (s.degree === 'master' || s.degree === 'phd') addMany([...byTag('tech'), ...byTag('pr')], 1, '高学历匹配');
    if (s.degree === 'bachelor') addMany(byTag('study'), 1, '教育背景');
    if (s.degree === 'below-high' || s.degree === 'high') addMany([...byTag('trade'), ...byTag('mid')], 1, '技能就业友好');

    /* 英语 */
    if (s.englishLevel === 'fluent' || s.englishLevel === 'skilled') addMany(['us', 'ca', 'gb', 'au', 'nz', 'ie', 'sg'], 2, '语言优势');
    else if (s.englishLevel === 'daily') addMany(['us', 'ca', 'gb', 'au', 'nz', 'ie', 'sg'], 1, '语言基础');
    if (s.otherLangs) {
      const lm = [
        { k: '日', ids: ['jp'] }, { k: '德', ids: ['de', 'at', 'ch'] }, { k: '法', ids: ['fr', 'be', 'ch'] },
        { k: '西', ids: ['es', 'mx', 'ar', 'cl'] }, { k: '韩', ids: ['kr'] }, { k: '粤', ids: ['sg', 'my'] }
      ];
      lm.forEach((m) => { if (s.otherLangs.includes(m.k)) m.ids.forEach((id) => add(id, 2, '语言优势')); });
    }
    if (s.learnLocal === 'yes') addMany(byTag('pr'), 1, '语言学习意愿');

    /* 资金 */
    const tier = this.budgetTier();
    if (tier === 'high') addMany(byTag('invest'), 2, '资金实力');
    if (tier === 'low' || tier === 'midlow') addMany([...byTag('nomad'), ...byTag('mid')], 1, '预算友好');
    if (s.lowCost === 'yes') addMany([...byTag('nomad'), ...byTag('mid'), ...byTag('study')], 1, '低成本优先');
    if (s.workDevelop === 'yes') addMany([...byTag('tech'), ...byTag('trade'), ...byTag('nomad')], 1, '边工作边发展');
    if (s.studyFirst === 'yes') addMany([...byTag('study'), ...byTag('tech')], 1, '先学习后就业');
    if (s.source.includes('family')) addMany(byTag('study'), 1, '家庭支持');
    if (s.source.includes('invest') || s.source.includes('business')) addMany(byTag('invest'), 1, '收入来源');

    /* 家庭 */
    if (s.marital === 'married' || s.hasKids === 'yes') addMany([...byTag('family'), ...byTag('pr')], 2, '家庭规划');
    if (s.eduNeed && s.eduNeed !== 'none') addMany([...byTag('study'), ...byTag('family')], 2, '子女教育');
    if (s.parentsPlan === 'yes') addMany([...byTag('family'), ...byTag('pr')], 1, '父母团聚');

    /* 健康（仅加权医疗资源，不作为淘汰） */
    if (s.specialMed === 'yes' || s.regularMed === 'yes' || s.healthNeed === 'yes') {
      addMany(byTag('medical'), 1, '医疗资源');
    }

    /* 居住环境 */
    if (s.likes.includes('big')) addMany(byTag('big'), 2, '城市规模');
    if (s.likes.includes('small') || s.likes.includes('rural') || s.likes.includes('nature')) addMany([...byTag('mid'), ...byTag('nomad')], 1, '生活节奏');
    if (s.likes.includes('coast')) addMany(byTag('ocean'), 1, '海岸生活');

    /* 气候 */
    const climateTag = { cold: 'cold', warm: 'warm', four: 'four', tropical: 'warm', any: '' };
    s.climate.forEach((c) => { const t = climateTag[c]; if (t) addMany(byTag(t), 2, '气候适配'); });

    /* 节奏与风险 */
    if (s.pace === 'slow') addMany([...byTag('mid'), ...byTag('nomad')], 1, '慢生活');
    const riskMap = { stable: ['pr'], quick: ['tech', 'trade'], cheap: ['nomad', 'mid'], long: ['pr'], startup: ['invest'] };
    (riskMap[s.risk] || []).forEach((t) => addMany(byTag(t), 1, '路线偏好'));

    /* 接受度 */
    if (s.accepts.includes('remote')) addMany([...byTag('mid'), ...byTag('trade')], 1, '偏远地区接受');
    if (s.accepts.includes('lang')) addMany(byTag('pr'), 1, '语言学习接受');
    if (s.accepts.includes('switch')) addMany([...byTag('study'), ...byTag('work')], 1, '职业转换接受');

    const max = Math.max(...Object.values(score), 1);
    return Object.entries(score)
      .map(([id, v]) => ({ id, score: v, pct: Math.round((v / max) * 100), reasons: reasons[id].slice(0, 3) }))
      .sort((a, b) => b.score - a.score);
  }

  portrait() {
    const s = this.state;
    const ageLabel = { u18: '青少年', '18-22': '青年', '23-30': '年轻', '31-40': '中坚', '41-50': '成熟', '50+': '资深' }[s.age] || '';
    const db = this.careerDb();
    const catName = (s.cat1 && db[s.cat1]) ? db[s.cat1].name : '';
    const labels = [];
    let main = `${ageLabel}${catName}型`;
    if (!main || main === '型') main = '多元发展型';
    labels.push(main);
    if (['tech', 'internet', 'medical', 'construction'].includes(s.cat1)) labels.push('技能型人才');
    if (s.cat1 === 'manufacture' || s.cat1 === 'service' || s.cat1 === 'logistics' || s.cat1 === 'catering' || s.cat1 === 'agriculture') labels.push('实干就业型');
    if (s.cat1 === 'finance' || s.cat1 === 'edu') labels.push('职业发展型');
    if (s.cat1 === 'freelance' || s.cat1 === 'art') labels.push('灵活发展型');
    if (s.cat1 === 'none') labels.push('转型探索型');
    if (s.funds === '100w+' || s.goals.includes('invest')) labels.push('高净值规划');
    if (s.goals.includes('study')) labels.push('国际教育需求');
    if (s.hasKids === 'yes' || s.goals.includes('family')) labels.push('家庭规划型');
    if (s.lowCost === 'yes') labels.push('低成本偏好');
    if (s.risk === 'stable' || s.risk === 'long') labels.push('稳健偏好');
    const uniq = [...new Set(labels)];
    return uniq.slice(0, 5);
  }

  identityLabel() {
    const db = this.careerDb();
    const name = (this.state.cat1 && db[this.state.cat1]) ? db[this.state.cat1].name : '';
    return { 技术类: '技术人才', 服务类: '服务工作者', 制造业: '产业工人', 建筑工程: '建筑从业者', 医疗护理: '医护人才', 教育: '教育工作者', 金融商业: '职场人士', 互联网: '互联网从业者', 农业: '农业从业者', 物流运输: '物流从业者', 餐饮酒店: '餐饮酒店从业者', 艺术设计: '艺术设计人才', 自由职业: '自由职业者', 无固定职业: '探索者' }[name] || (this.state.age === '50+' ? '人生新阶段探索者' : '评估用户');
  }

  goalLabel(id) {
    return this.goalLabels()[id] || id;
  }

  projectMatch(countryRank) {
    const s = this.state;
    const projects = Istra.projects || [];
    const cScore = {};
    countryRank.forEach((c, i) => { cScore[c.id] = (countryRank.length - i); });

    const goalCat = { travel: 'nomad', short: 'work', work: 'work', study: 'edu', career: 'work', startup: 'invest', invest: 'invest', family: 'family', pr: 'pr', identity: 'pr' };

    const scored = projects.map((p) => {
      let v = (cScore[p.country.id] || 0) * 4;
      s.goals.forEach((g) => { if (goalCat[g] === p.category.id) v += 6; });
      if (p.category.id === 'tech' && ['tech', 'internet'].includes(s.cat1)) v += 4;
      if (p.category.id === 'work' && ['manufacture', 'construction', 'service', 'logistics', 'catering', 'agriculture', 'finance'].includes(s.cat1)) v += 3;
      if (p.category.id === 'study' && (s.studyFirst === 'yes' || s.cat1 === 'none')) v += 4;
      if (p.category.id === 'invest' && this.budgetTier() === 'high') v += 5;
      if (p.category.id === 'pr' && ['stable', 'long'].includes(s.risk)) v += 2;
      if (p.category.id === 'youth' && ['u18', '18-22', '23-30'].includes(s.age)) v += 3;
      if (p.category.id === 'family' && (s.hasKids === 'yes' || s.parentsPlan === 'yes')) v += 4;
      const budgetRank = { low: 0, midlow: 1, mid: 2, high: 3 };
      const diff = Math.abs(budgetRank[p.budget.level] - budgetRank[this.budgetTier()]);
      v += diff === 0 ? 3 : (diff === 1 ? 1 : -4);
      if (s.lowCost === 'yes' && p.budget.level === 'low') v += 2;
      return { project: p, score: v };
    }).sort((a, b) => b.score - a.score);

    return { scored };
  }

  projectReason(p) {
    const s = this.state;
    const goalCat = { travel: 'nomad', short: 'work', work: 'work', study: 'edu', career: 'work', startup: 'invest', invest: 'invest', family: 'family', pr: 'pr', identity: 'pr' };
    const hits = s.goals.filter((g) => goalCat[g] === p.category.id);
    if (hits.length) return `匹配「${this.goalLabel(hits[0])}」目标`;
    const catLabel = { work: '职业发展', tech: '技术人才', edu: '教育规划', invest: '投资创业', talent: '人才引进', family: '家庭规划', pr: '长期身份', nomad: '旅居体验', youth: '青年交流', special: '特殊人才' }[p.category.id];
    return `符合「${catLabel}」方向`;
  }

  notReason(p) {
    const s = this.state;
    if (p.budget.level === 'high' && this.budgetTier() !== 'high') return '投资门槛较高，与当前可投入资金不匹配';
    if (p.category.id === 'invest' && this.budgetTier() !== 'high') return '需要较大资金投入，超出当前资金范围';
    if (p.category.id === 'study' && s.studyFirst === 'no' && s.degree !== 'phd') return '您更倾向直接就业，留学类暂不优先';
    if (p.category.id === 'youth' && s.age !== 'u18' && s.age !== '18-22' && s.age !== '23-30') return '青年类项目有年龄限制，与当前年龄不匹配';
    if (p.category.id === 'family' && s.hasKids === 'no' && s.parentsPlan === 'no') return '当前为个人规划，家庭团聚类项目暂不匹配';
    if (p.category.id === 'tech' && !['tech', 'internet', 'medical', 'construction'].includes(s.cat1)) return '技术类项目对专业背景要求较高';
    return '与该目标方向的匹配度较低';
  }

  notRecommendedDirections() {
    const s = this.state;
    const out = [];
    const tier = this.budgetTier();
    const push = (title, reason) => out.push({ title, reason });

    if (tier === 'low' || tier === 'midlow') push('投资创业类', '投资类项目通常需要较高资金门槛，与您当前可投入资金差距较大，暂不建议优先考虑。');
    if (tier !== 'high') push('大额投资移民类', '部分投资移民项目需 50 万元以上资金门槛，与当前可投入资金存在差距，暂不建议优先考虑。');
    if (s.risk === 'stable' || s.risk === 'long') push('高风险创业路线', '您偏好稳健/长期路线，创业类路径不确定性较高，建议以稳健身份规划为主。');
    if (s.age === '50+') push('青年交流 / 工作假期类', '此类项目面向青年群体，有明确年龄限制，与您当前年龄阶段不匹配。');
    if (s.englishLevel === 'none' && s.learnLocal === 'no') push('高语言门槛的留学/技术工作类', '部分项目对语言有硬性要求，当前语言条件下建议先完成语言提升。');
    if (s.hasKids === 'no' && s.parentsPlan === 'no' && s.marital === 'single') push('家庭团聚 / 父母随迁类', '当前为个人规划，家庭团聚类项目暂不匹配，未来家庭结构变化后可重新评估。');
    if (s.cat1 === 'none' && tier === 'low') push('高投入长期项目', '当前职业阶段与资金情况更适合低成本尝试或先学习后就业的路线。');
    const uniq = {};
    out.forEach((x) => { uniq[x.title] = x; });
    const list = Object.values(uniq);
    return list.length >= 2 ? list.slice(0, 3) : list.concat([{ title: '与目标方向偏离较大的项目', reason: '综合您的目标、资金与职业阶段，部分项目与该方向匹配度较低，建议聚焦上述推荐方案。' }]).slice(0, 3);
  }

  roadmap(topCountry, topProject) {
    const c = Istra.countries.find((x) => x.id === topCountry) || { cn: '目标国家' };
    const s = this.state;
    const first = s.learnLocal === 'yes' ? `学习当地语言与职业技能认证` : (s.studyFirst === 'yes' ? '完成语言与学业准备' : '准备职业资质与材料');
    return [
      { phase: '半年内 · 准备期', items: [first, '梳理资金与家庭材料', `深入了解${c.cn}政策与项目要求`] },
      { phase: '1–2 年 · 申请期', items: [`准备并递交${topProject ? topProject.name : '目标项目'}申请`, '同步推进家庭与背景材料', '保持职业与资金状态稳定'] },
      { phase: '3–5 年 · 达成期', items: [`抵达${c.cn}并完成居留登记`, '按路径要求完成语言/就业/投资条件', '实现身份转换与家庭团聚目标'] }
    ];
  }
  /* ================= 结果页：20 个个性化匹配方案 ================= */

  ageLabel() {
    return { u18: '18 岁以下', '18-22': '18–22 岁', '23-30': '23–30 岁', '31-40': '31–40 岁', '41-50': '41–50 岁', '50+': '50 岁以上' }[this.state.age] || '—';
  }

  careerLabel() {
    const db = this.careerDb();
    const c1 = (this.state.cat1 && db[this.state.cat1]) ? db[this.state.cat1].name : '';
    return c1 + (this.state.cat2 ? ' · ' + this.state.cat2 : '');
  }

  fundsLabel() {
    return { '<1w': '1 万以下', '1-3w': '1–3 万', '3-5w': '3–5 万', '5-10w': '5–10 万', '10-30w': '10–30 万', '30-100w': '30–100 万', '100w+': '100 万以上' }[this.state.funds] || '—';
  }

  langLabel() {
    return { none: '不会', basic: '基础', daily: '交流', skilled: '熟练', fluent: '流利' }[this.state.englishLevel] || '—';
  }

﻿  /* ================= 评分模型 v2：8 维度加权（真实分布） ================= */

  dimAge(p) {
    const age = this.state.age;
    const cat = p.category.id;
    const table = {
      youth: { u18: 1, '18-22': 1, '23-30': 1, '31-40': 0.5, '41-50': 0.25, '50+': 0.15 },
      study: { u18: 1, '18-22': 1, '23-30': 0.85, '31-40': 0.6, '41-50': 0.4, '50+': 0.25 },
      work: { u18: 0.3, '18-22': 0.8, '23-30': 0.95, '31-40': 1, '41-50': 0.85, '50+': 0.5 },
      tech: { u18: 0.3, '18-22': 0.8, '23-30': 0.95, '31-40': 1, '41-50': 0.85, '50+': 0.5 },
      invest: { u18: 0.3, '18-22': 0.5, '23-30': 0.7, '31-40': 0.95, '41-50': 1, '50+': 0.9 },
      talent: { u18: 0.3, '18-22': 0.7, '23-30': 0.9, '31-40': 1, '41-50': 0.95, '50+': 0.8 },
      family: { u18: 0.4, '18-22': 0.75, '23-30': 0.9, '31-40': 1, '41-50': 1, '50+': 0.9 },
      pr: { u18: 0.4, '18-22': 0.75, '23-30': 0.9, '31-40': 1, '41-50': 1, '50+': 0.9 },
      nomad: { u18: 0.2, '18-22': 1, '23-30': 1, '31-40': 0.9, '41-50': 0.7, '50+': 0.6 }
    };
    return (table[cat] && table[cat][age]) || 0.6;
  }

  dimDegree(p) {
    const idx = { 'below-high': 0, high: 1, college: 2, bachelor: 3, master: 4, phd: 5 }[this.state.degree] || 1;
    const cat = p.category.id;
    const sub = p.subcategory.id;
    if (cat === 'study') {
      const need = { 'edu-phd': 5, 'edu-master': 4, 'edu-bachelor': 3, 'edu-vocational': 2, 'edu-language': 1 }[sub] || 3;
      return Math.max(0.25, 1 - Math.abs(need - idx) * 0.18);
    }
    if (cat === 'tech' || cat === 'talent' || sub === 'work-highskill' || sub === 'work-skilled' || sub === 'pr-apply') {
      const need = (sub === 'edu-phd') ? 5 : (sub === 'tech-degree' || sub === 'talent-exceptional') ? 4 : 3;
      return Math.max(0.25, 1 - Math.max(0, need - idx) * 0.22);
    }
    if (cat === 'invest') return idx >= 2 ? 0.85 : 0.65;
    if (cat === 'work') return Math.min(1, 0.7 + idx * 0.06);
    if (cat === 'family' || cat === 'pr') return 0.8;
    return 0.75;
  }

  dimCareer(p) {
    const s = this.state;
    const cat = p.category.id;
    const sub = p.subcategory.id;
    const subMap = {
      '机械维修': 'work-bluecollar', '机械操作': 'work-bluecollar', '焊工': 'work-bluecollar',
      '电工': 'work-bluecollar', '汽车维修': 'work-bluecollar', '木工': 'work-bluecollar',
      '瓦工': 'work-bluecollar', '水电工': 'work-bluecollar', '生产管理': 'work-skilled',
      '工程师': 'tech-engineer', '电子技术': 'tech-engineer', '自动化': 'tech-engineer',
      '程序员': 'tech-it', '产品经理': 'tech-it', '设计师': 'tech-it', '运营': 'tech-it',
      '医生': 'tech-medical', '护士': 'tech-medical', '护理员': 'tech-medical', '药剂师': 'tech-medical',
      '教师': 'tech-degree', '培训师': 'tech-degree', '会计': 'finance',
      '厨师': 'work-regular', '服务员': 'work-regular', '酒店员工': 'work-regular',
      '美容美发': 'work-regular', '家政服务': 'work-regular', '护理人员': 'work-regular',
      '司机': 'work-regular', '配送': 'work-regular', '仓储': 'work-regular',
      '种植': 'work-regular', '养殖': 'work-regular', '远程办公': 'nomad-visa',
      '内容创作': 'nomad-visa', '摄影': 'nomad-visa', '音乐': 'nomad-visa',
      '平面设计': 'nomad-visa', '插画': 'nomad-visa'
    };
    if (s.cat2 && subMap[s.cat2] === sub) return 1.0;
    if (s.cat2 && subMap[s.cat2] && subMap[s.cat2].split('-')[0] === sub.split('-')[0]) return 0.85;
    const catMap = {
      tech: ['tech'], service: ['work'], manufacture: ['work'], construction: ['work', 'tech'],
      medical: ['tech'], edu: ['study', 'tech'], finance: ['work', 'invest'], internet: ['tech'],
      agriculture: ['work'], logistics: ['work'], catering: ['work'], art: ['nomad'],
      freelance: ['nomad'], none: ['study', 'nomad']
    };
    const targets = catMap[s.cat1] || [];
    if (targets.includes(cat)) return 0.75;
    if (cat === 'study' && s.studyFirst === 'yes') return 0.7;
    if (cat === 'invest' && (s.cat1 === 'finance' || s.cat1 === 'freelance' || s.source.includes('business') || s.source.includes('invest'))) return 0.65;
    return 0.35;
  }

  dimExp(p) {
    const yrs = { none: 0, '1y-': 0.2, '1-3': 0.4, '3-5': 0.7, '5y+': 1 }[this.state.years] || 0;
    const cat = p.category.id;
    if (cat === 'study') return 0.85;
    if (cat === 'youth' || cat === 'nomad') return 0.9;
    if (cat === 'family' || cat === 'pr') return 0.8;
    if (cat === 'invest') return Math.min(1, 0.5 + yrs * 0.5);
    if (cat === 'work' || cat === 'tech' || cat === 'talent') {
      const need = (p.subcategory.id === 'work-bluecollar' || p.subcategory.id === 'work-regular') ? 0.35 : 0.6;
      return Math.min(1, Math.max(0.15, yrs / need));
    }
    return 0.7;
  }

  dimLang(p) {
    const eng = { none: 0, basic: 0.35, daily: 0.6, skilled: 0.85, fluent: 1 }[this.state.englishLevel] || 0;
    const isEn = ['us', 'ca', 'gb', 'au', 'nz', 'ie', 'sg'].includes(p.country.id);
    const learn = this.state.learnLocal === 'yes';
    const testBonus = (this.state.langTest === 'cet6' || this.state.langTest === 'ielts' || this.state.langTest === 'toefl') ? 0.1 : 0;
    let v;
    if (isEn) v = Math.min(1, eng + testBonus);
    else v = Math.min(1, Math.max(eng * 0.6, learn ? 0.7 : 0.4) + testBonus * 0.5);
    if (p.category.id === 'study') v = Math.min(1, v + 0.05);
    return v;
  }

  dimFunds(p) {
    const rank = { low: 0, midlow: 1, mid: 2, high: 3 };
    const diff = Math.abs(rank[p.budget.level] - rank[this.budgetTier()]);
    let v = 1 - diff * 0.3;
    if (this.state.lowCost === 'yes' && p.budget.level === 'low') v += 0.1;
    return Math.max(0.1, Math.min(1, v));
  }

  dimFamily(p) {
    const s = this.state;
    if (p.category.id === 'family') {
      if (s.hasKids === 'yes' || s.parentsPlan === 'yes' || s.marital === 'married') return 0.95;
      return 0.35;
    }
    if (p.category.id === 'pr' && (s.hasKids === 'yes' || s.marital === 'married')) return 0.85;
    return 0.7;
  }

  dimGoals(p) {
    const s = this.state;
    const goalCat = { travel: 'nomad', short: 'work', work: 'work', study: 'edu', career: 'work', startup: 'invest', invest: 'invest', family: 'family', pr: 'pr', identity: 'pr' };
    if (s.goals.some((g) => goalCat[g] === p.category.id)) return 1.0;
    const related = { pr: ['work', 'family'], work: ['pr', 'study'], edu: ['pr'], invest: ['work'], family: ['pr'], nomad: ['youth'], youth: ['nomad'] };
    if (s.goals.some((g) => (related[p.category.id] || []).includes(goalCat[g]))) return 0.6;
    return 0.3;
  }

  nextSteps(p, dims) {
    const steps = [];
    if (dims.language < 0.55) steps.push('先提升当地语言水平（语言考试或课程）');
    if (dims.degree < 0.55) steps.push('完成学历认证或相关进修');
    if (dims.funds < 0.55) steps.push('做好资金规划或选择低成本路线');
    if (dims.experience < 0.55) steps.push('积累相关经验或考取职业证书');
    if (dims.career < 0.5) steps.push('参加技能培训后再申请');
    if (!steps.length) steps.push('准备申请材料并咨询顾问获取申请方案');
    return steps.slice(0, 3);
  }

  scoreProject(p) {
    const dims = {
      age: this.dimAge(p),
      degree: this.dimDegree(p),
      career: this.dimCareer(p),
      experience: this.dimExp(p),
      language: this.dimLang(p),
      funds: this.dimFunds(p),
      family: this.dimFamily(p),
      goals: this.dimGoals(p)
    };
    const raw = dims.age * 0.15 + dims.degree * 0.15 + dims.career * 0.20 + dims.experience * 0.15 +
      dims.language * 0.10 + dims.funds * 0.10 + dims.family * 0.05 + dims.goals * 0.10;
    const pct = Math.max(8, Math.min(95, Math.round(raw * 100)));
    const names = { age: '年龄匹配', degree: '学历匹配', career: '职业匹配', experience: '工作经验', language: '语言能力', funds: '资金能力', family: '家庭情况', goals: '出国目标' };
    const strengths = [];
    const gaps = [];
    Object.entries(dims).forEach(([k, v]) => {
      if (v >= 0.75) strengths.push(names[k]);
      else if (v < 0.55) gaps.push(names[k]);
    });
    return { pct, dims, strengths: strengths.slice(0, 4), gaps: gaps.slice(0, 4), nextSteps: this.nextSteps(p, dims) };
  }

﻿  /* ================= 评分模型 v2：8 维度加权（真实分布） ================= */

  dimAge(p) {
    const age = this.state.age;
    const cat = p.category.id;
    const table = {
      youth: { u18: 1, '18-22': 1, '23-30': 1, '31-40': 0.5, '41-50': 0.25, '50+': 0.15 },
      study: { u18: 1, '18-22': 1, '23-30': 0.85, '31-40': 0.6, '41-50': 0.4, '50+': 0.25 },
      work: { u18: 0.3, '18-22': 0.8, '23-30': 0.95, '31-40': 1, '41-50': 0.85, '50+': 0.5 },
      tech: { u18: 0.3, '18-22': 0.8, '23-30': 0.95, '31-40': 1, '41-50': 0.85, '50+': 0.5 },
      invest: { u18: 0.3, '18-22': 0.5, '23-30': 0.7, '31-40': 0.95, '41-50': 1, '50+': 0.9 },
      talent: { u18: 0.3, '18-22': 0.7, '23-30': 0.9, '31-40': 1, '41-50': 0.95, '50+': 0.8 },
      family: { u18: 0.4, '18-22': 0.75, '23-30': 0.9, '31-40': 1, '41-50': 1, '50+': 0.9 },
      pr: { u18: 0.4, '18-22': 0.75, '23-30': 0.9, '31-40': 1, '41-50': 1, '50+': 0.9 },
      nomad: { u18: 0.2, '18-22': 1, '23-30': 1, '31-40': 0.9, '41-50': 0.7, '50+': 0.6 }
    };
    return (table[cat] && table[cat][age]) || 0.6;
  }

  dimDegree(p) {
    const idx = { 'below-high': 0, high: 1, college: 2, bachelor: 3, master: 4, phd: 5 }[this.state.degree] || 1;
    const cat = p.category.id;
    const sub = p.subcategory.id;
    if (cat === 'study') {
      const need = { 'edu-phd': 5, 'edu-master': 4, 'edu-bachelor': 3, 'edu-vocational': 2, 'edu-language': 1 }[sub] || 3;
      return Math.max(0.2, 1 - Math.abs(need - idx) * 0.2);
    }
    if (cat === 'tech' || cat === 'talent' || sub === 'work-highskill' || sub === 'work-skilled' || sub === 'pr-apply') {
      const need = (sub === 'edu-phd') ? 5 : (sub === 'tech-degree' || sub === 'talent-exceptional') ? 4 : 3;
      return Math.max(0.2, 1 - Math.max(0, need - idx) * 0.28);
    }
    if (cat === 'invest') return idx >= 2 ? 0.85 : 0.6;
    if (cat === 'work') return Math.min(1, 0.6 + idx * 0.08);
    if (cat === 'family' || cat === 'pr') return 0.8;
    return 0.75;
  }

  dimCareer(p) {
    const s = this.state;
    const cat = p.category.id;
    const sub = p.subcategory.id;
    const subMap = {
      '机械维修': 'work-bluecollar', '机械操作': 'work-bluecollar', '焊工': 'work-bluecollar',
      '电工': 'work-bluecollar', '汽车维修': 'work-bluecollar', '木工': 'work-bluecollar',
      '瓦工': 'work-bluecollar', '水电工': 'work-bluecollar', '生产管理': 'work-skilled',
      '工程师': 'tech-engineer', '电子技术': 'tech-engineer', '自动化': 'tech-engineer',
      '程序员': 'tech-it', '产品经理': 'tech-it', '设计师': 'tech-it', '运营': 'tech-it',
      '医生': 'tech-medical', '护士': 'tech-medical', '护理员': 'tech-medical', '药剂师': 'tech-medical',
      '教师': 'tech-degree', '培训师': 'tech-degree', '会计': 'finance',
      '厨师': 'work-regular', '服务员': 'work-regular', '酒店员工': 'work-regular',
      '美容美发': 'work-regular', '家政服务': 'work-regular', '护理人员': 'work-regular',
      '司机': 'work-regular', '配送': 'work-regular', '仓储': 'work-regular',
      '种植': 'work-regular', '养殖': 'work-regular', '远程办公': 'nomad-visa',
      '内容创作': 'nomad-visa', '摄影': 'nomad-visa', '音乐': 'nomad-visa',
      '平面设计': 'nomad-visa', '插画': 'nomad-visa'
    };
    if (s.cat2 && subMap[s.cat2] === sub) return 1.0;
    if (s.cat2 && subMap[s.cat2] && subMap[s.cat2].split('-')[0] === sub.split('-')[0]) return 0.8;
    const catMap = {
      tech: ['tech'], service: ['work'], manufacture: ['work'], construction: ['work', 'tech'],
      medical: ['tech'], edu: ['study', 'tech'], finance: ['work', 'invest'], internet: ['tech'],
      agriculture: ['work'], logistics: ['work'], catering: ['work'], art: ['nomad'],
      freelance: ['nomad'], none: ['study', 'nomad']
    };
    const targets = catMap[s.cat1] || [];
    if (targets.includes(cat)) return 0.65;
    if (cat === 'study' && s.studyFirst === 'yes') return 0.55;
    if (cat === 'invest' && (s.cat1 === 'finance' || s.cat1 === 'freelance' || s.source.includes('business') || s.source.includes('invest'))) return 0.6;
    if (cat === 'pr' || cat === 'family') return 0.5;
    if (cat === 'nomad' && (s.cat1 === 'art' || s.cat1 === 'freelance' || s.cat1 === 'internet')) return 0.7;
    return 0.25;
  }

  dimExp(p) {
    const yrs = { none: 0, '1y-': 0.2, '1-3': 0.4, '3-5': 0.7, '5y+': 1 }[this.state.years] || 0;
    const cat = p.category.id;
    if (cat === 'study') return 0.85;
    if (cat === 'youth' || cat === 'nomad') return 0.9;
    if (cat === 'family' || cat === 'pr') return 0.8;
    if (cat === 'invest') return Math.min(1, 0.5 + yrs * 0.5);
    if (cat === 'work' || cat === 'tech' || cat === 'talent') {
      const need = (p.subcategory.id === 'work-bluecollar' || p.subcategory.id === 'work-regular') ? 0.35 : 0.6;
      return Math.min(1, Math.max(0.15, yrs / need));
    }
    return 0.7;
  }

  dimLang(p) {
    const eng = { none: 0, basic: 0.35, daily: 0.6, skilled: 0.85, fluent: 1 }[this.state.englishLevel] || 0;
    const isEn = ['us', 'ca', 'gb', 'au', 'nz', 'ie', 'sg'].includes(p.country.id);
    const learn = this.state.learnLocal === 'yes';
    const testBonus = (this.state.langTest === 'cet6' || this.state.langTest === 'ielts' || this.state.langTest === 'toefl') ? 0.1 : 0;
    let v;
    if (isEn) v = Math.min(1, eng + testBonus);
    else v = Math.min(1, Math.max(eng * 0.5, learn ? 0.6 : 0.35) + testBonus * 0.5);
    if (p.category.id === 'study') v = Math.min(1, v + 0.05);
    return v;
  }

  dimFunds(p) {
    const rank = { low: 0, midlow: 1, mid: 2, high: 3 };
    const diff = Math.abs(rank[p.budget.level] - rank[this.budgetTier()]);
    let v = 1 - diff * 0.3;
    if (this.state.lowCost === 'yes' && p.budget.level === 'low') v += 0.1;
    return Math.max(0.1, Math.min(1, v));
  }

  dimFamily(p) {
    const s = this.state;
    if (p.category.id === 'family') {
      if (s.hasKids === 'yes' || s.parentsPlan === 'yes' || s.marital === 'married') return 0.95;
      return 0.35;
    }
    if (p.category.id === 'pr' && (s.hasKids === 'yes' || s.marital === 'married')) return 0.85;
    return 0.7;
  }

  dimGoals(p) {
    const s = this.state;
    const goalCat = { travel: 'nomad', short: 'work', work: 'work', study: 'edu', career: 'work', startup: 'invest', invest: 'invest', family: 'family', pr: 'pr', identity: 'pr' };
    if (s.goals.some((g) => goalCat[g] === p.category.id)) return 1.0;
    const related = { pr: ['work', 'family'], work: ['pr', 'study'], edu: ['pr'], invest: ['work'], family: ['pr'], nomad: ['youth'], youth: ['nomad'] };
    if (s.goals.some((g) => (related[p.category.id] || []).includes(goalCat[g]))) return 0.6;
    return 0.3;
  }

  nextSteps(p, dims) {
    const steps = [];
    if (dims.language < 0.55) steps.push('先提升当地语言水平（语言考试或课程）');
    if (dims.degree < 0.55) steps.push('完成学历认证或相关进修');
    if (dims.funds < 0.55) steps.push('做好资金规划或选择低成本路线');
    if (dims.experience < 0.55) steps.push('积累相关经验或考取职业证书');
    if (dims.career < 0.5) steps.push('参加技能培训后再申请');
    if (!steps.length) steps.push('准备申请材料并咨询顾问获取申请方案');
    return steps.slice(0, 3);
  }

  scoreProject(p) {
    const dims = {
      age: this.dimAge(p),
      degree: this.dimDegree(p),
      career: this.dimCareer(p),
      experience: this.dimExp(p),
      language: this.dimLang(p),
      funds: this.dimFunds(p),
      family: this.dimFamily(p),
      goals: this.dimGoals(p)
    };
    const raw = dims.age * 0.15 + dims.degree * 0.15 + dims.career * 0.20 + dims.experience * 0.15 +
      dims.language * 0.10 + dims.funds * 0.10 + dims.family * 0.05 + dims.goals * 0.10;
    const pct = Math.max(8, Math.min(95, Math.round(raw * 100)));
    const names = { age: '年龄匹配', degree: '学历匹配', career: '职业匹配', experience: '工作经验', language: '语言能力', funds: '资金能力', family: '家庭情况', goals: '出国目标' };
    const strengths = [];
    const gaps = [];
    Object.entries(dims).forEach(([k, v]) => {
      if (v >= 0.75) strengths.push(names[k]);
      else if (v < 0.55) gaps.push(names[k]);
    });
    return { pct, dims, strengths: strengths.slice(0, 4), gaps: gaps.slice(0, 4), nextSteps: this.nextSteps(p, dims) };
  }

﻿  /* ================= 评分模型 v2：8 维度加权（真实分布） ================= */

  dimAge(p) {
    const age = this.state.age;
    const cat = p.category.id;
    const table = {
      youth: { u18: 1, '18-22': 1, '23-30': 1, '31-40': 0.5, '41-50': 0.25, '50+': 0.15 },
      study: { u18: 1, '18-22': 1, '23-30': 0.85, '31-40': 0.6, '41-50': 0.4, '50+': 0.25 },
      work: { u18: 0.3, '18-22': 0.8, '23-30': 0.95, '31-40': 1, '41-50': 0.85, '50+': 0.5 },
      tech: { u18: 0.3, '18-22': 0.8, '23-30': 0.95, '31-40': 1, '41-50': 0.85, '50+': 0.5 },
      invest: { u18: 0.3, '18-22': 0.5, '23-30': 0.7, '31-40': 0.95, '41-50': 1, '50+': 0.9 },
      talent: { u18: 0.3, '18-22': 0.7, '23-30': 0.9, '31-40': 1, '41-50': 0.95, '50+': 0.8 },
      family: { u18: 0.4, '18-22': 0.75, '23-30': 0.9, '31-40': 1, '41-50': 1, '50+': 0.9 },
      pr: { u18: 0.4, '18-22': 0.75, '23-30': 0.9, '31-40': 1, '41-50': 1, '50+': 0.9 },
      nomad: { u18: 0.2, '18-22': 1, '23-30': 1, '31-40': 0.9, '41-50': 0.7, '50+': 0.6 }
    };
    return (table[cat] && table[cat][age]) || 0.6;
  }

  dimDegree(p) {
    const idx = { 'below-high': 0, high: 1, college: 2, bachelor: 3, master: 4, phd: 5 }[this.state.degree] || 1;
    const cat = p.category.id;
    const sub = p.subcategory.id;
    if (cat === 'study') {
      const need = { 'edu-phd': 5, 'edu-master': 4, 'edu-bachelor': 3, 'edu-vocational': 2, 'edu-language': 1 }[sub] || 3;
      return Math.max(0.2, 1 - Math.abs(need - idx) * 0.2);
    }
    if (cat === 'tech' || cat === 'talent' || sub === 'work-highskill' || sub === 'work-skilled' || sub === 'pr-apply') {
      const need = (sub === 'edu-phd') ? 5 : (sub === 'tech-degree' || sub === 'talent-exceptional') ? 4 : 3;
      return Math.max(0.2, 1 - Math.max(0, need - idx) * 0.28);
    }
    if (cat === 'invest') return idx >= 2 ? 0.85 : 0.6;
    if (cat === 'work') return Math.min(1, 0.6 + idx * 0.08);
    if (cat === 'family' || cat === 'pr') return 0.8;
    return 0.75;
  }

  dimCareer(p) {
    const s = this.state;
    const cat = p.category.id;
    const sub = p.subcategory.id;
    const subMap = {
      '机械维修': 'work-bluecollar', '机械操作': 'work-bluecollar', '焊工': 'work-bluecollar',
      '电工': 'work-bluecollar', '汽车维修': 'work-bluecollar', '木工': 'work-bluecollar',
      '瓦工': 'work-bluecollar', '水电工': 'work-bluecollar', '生产管理': 'work-skilled',
      '工程师': 'tech-engineer', '电子技术': 'tech-engineer', '自动化': 'tech-engineer',
      '程序员': 'tech-it', '产品经理': 'tech-it', '设计师': 'tech-it', '运营': 'tech-it',
      '医生': 'tech-medical', '护士': 'tech-medical', '护理员': 'tech-medical', '药剂师': 'tech-medical',
      '教师': 'tech-degree', '培训师': 'tech-degree', '会计': 'finance',
      '厨师': 'work-regular', '服务员': 'work-regular', '酒店员工': 'work-regular',
      '美容美发': 'work-regular', '家政服务': 'work-regular', '护理人员': 'work-regular',
      '司机': 'work-regular', '配送': 'work-regular', '仓储': 'work-regular',
      '种植': 'work-regular', '养殖': 'work-regular', '远程办公': 'nomad-visa',
      '内容创作': 'nomad-visa', '摄影': 'nomad-visa', '音乐': 'nomad-visa',
      '平面设计': 'nomad-visa', '插画': 'nomad-visa'
    };
    if (s.cat2 && subMap[s.cat2] === sub) return 1.0;
    if (s.cat2 && subMap[s.cat2] && subMap[s.cat2].split('-')[0] === sub.split('-')[0]) return 0.8;
    const catMap = {
      tech: ['tech'], service: ['work'], manufacture: ['work'], construction: ['work', 'tech'],
      medical: ['tech'], edu: ['study', 'tech'], finance: ['work', 'invest'], internet: ['tech'],
      agriculture: ['work'], logistics: ['work'], catering: ['work'], art: ['nomad'],
      freelance: ['nomad'], none: ['study', 'nomad']
    };
    const targets = catMap[s.cat1] || [];
    if (targets.includes(cat)) return 0.55;
    if (cat === 'study' && s.studyFirst === 'yes') return 0.55;
    if (cat === 'invest' && (s.cat1 === 'finance' || s.cat1 === 'freelance' || s.source.includes('business') || s.source.includes('invest'))) return 0.6;
    if (cat === 'pr' || cat === 'family') return 0.45;
    if (cat === 'nomad' && (s.cat1 === 'art' || s.cat1 === 'freelance' || s.cat1 === 'internet')) return 0.7;
    return 0.2;
  }

  dimExp(p) {
    const yrs = { none: 0, '1y-': 0.2, '1-3': 0.4, '3-5': 0.7, '5y+': 1 }[this.state.years] || 0;
    const cat = p.category.id;
    if (cat === 'study') return 0.85;
    if (cat === 'youth' || cat === 'nomad') return 0.9;
    if (cat === 'family' || cat === 'pr') return 0.8;
    if (cat === 'invest') return Math.min(1, 0.5 + yrs * 0.5);
    if (cat === 'work' || cat === 'tech' || cat === 'talent') {
      const need = (p.subcategory.id === 'work-bluecollar' || p.subcategory.id === 'work-regular') ? 0.35 : 0.6;
      return Math.min(1, Math.max(0.15, yrs / need));
    }
    return 0.7;
  }

  dimLang(p) {
    const eng = { none: 0, basic: 0.35, daily: 0.6, skilled: 0.85, fluent: 1 }[this.state.englishLevel] || 0;
    const isEn = ['us', 'ca', 'gb', 'au', 'nz', 'ie', 'sg'].includes(p.country.id);
    const learn = this.state.learnLocal === 'yes';
    const testBonus = (this.state.langTest === 'cet6' || this.state.langTest === 'ielts' || this.state.langTest === 'toefl') ? 0.1 : 0;
    let v;
    if (isEn) v = Math.min(1, eng + testBonus);
    else v = Math.min(1, Math.max(eng * 0.5, learn ? 0.6 : 0.35) + testBonus * 0.5);
    if (p.category.id === 'study') v = Math.min(1, v + 0.05);
    return v;
  }

  dimFunds(p) {
    const rank = { low: 0, midlow: 1, mid: 2, high: 3 };
    const diff = Math.abs(rank[p.budget.level] - rank[this.budgetTier()]);
    let v = 1 - diff * 0.3;
    const highCost = ['us','ca','gb','ch','no','dk','se','fi','ie','au','nz','sg','ae','qa','sa','lu','nl'];
    const lowCost = ['mx','th','vn','ph','id','my','in','br','ar','cl','za','pl','cz','hu','ro','bg','hr','si','sk','lt','lv','ee','tr'];
    if (highCost.includes(p.country.id)) v *= 0.85;
    else if (lowCost.includes(p.country.id)) v *= 1.0;
    else v *= 0.95;
    if (this.state.lowCost === 'yes' && p.budget.level === 'low') v += 0.1;
    return Math.max(0.1, Math.min(1, v));
  }

  dimFamily(p) {
    const s = this.state;
    if (p.category.id === 'family') {
      if (s.hasKids === 'yes' || s.parentsPlan === 'yes' || s.marital === 'married') return 0.95;
      return 0.35;
    }
    if (p.category.id === 'pr' && (s.hasKids === 'yes' || s.marital === 'married')) return 0.85;
    return 0.7;
  }

  dimGoals(p) {
    const s = this.state;
    const goalCat = { travel: 'nomad', short: 'work', work: 'work', study: 'edu', career: 'work', startup: 'invest', invest: 'invest', family: 'family', pr: 'pr', identity: 'pr' };
    if (s.goals.some((g) => goalCat[g] === p.category.id)) return 1.0;
    const related = { pr: ['work', 'family'], work: ['pr', 'study'], edu: ['pr'], invest: ['work'], family: ['pr'], nomad: ['youth'], youth: ['nomad'] };
    if (s.goals.some((g) => (related[p.category.id] || []).includes(goalCat[g]))) return 0.6;
    return 0.3;
  }

  nextSteps(p, dims) {
    const steps = [];
    if (dims.language < 0.55) steps.push('先提升当地语言水平（语言考试或课程）');
    if (dims.degree < 0.55) steps.push('完成学历认证或相关进修');
    if (dims.funds < 0.55) steps.push('做好资金规划或选择低成本路线');
    if (dims.experience < 0.55) steps.push('积累相关经验或考取职业证书');
    if (dims.career < 0.5) steps.push('参加技能培训后再申请');
    if (!steps.length) steps.push('准备申请材料并咨询顾问获取申请方案');
    return steps.slice(0, 3);
  }

  scoreProject(p) {
    const dims = {
      age: this.dimAge(p),
      degree: this.dimDegree(p),
      career: this.dimCareer(p),
      experience: this.dimExp(p),
      language: this.dimLang(p),
      funds: this.dimFunds(p),
      family: this.dimFamily(p),
      goals: this.dimGoals(p)
    };
    const raw = dims.age * 0.15 + dims.degree * 0.15 + dims.career * 0.20 + dims.experience * 0.15 +
      dims.language * 0.10 + dims.funds * 0.10 + dims.family * 0.05 + dims.goals * 0.10;
    const pct = Math.max(8, Math.min(95, Math.round(raw * 100)));
    const names = { age: '年龄匹配', degree: '学历匹配', career: '职业匹配', experience: '工作经验', language: '语言能力', funds: '资金能力', family: '家庭情况', goals: '出国目标' };
    const strengths = [];
    const gaps = [];
    Object.entries(dims).forEach(([k, v]) => {
      if (v >= 0.75) strengths.push(names[k]);
      else if (v < 0.55) gaps.push(names[k]);
    });
    return { pct, dims, strengths: strengths.slice(0, 4), gaps: gaps.slice(0, 4), nextSteps: this.nextSteps(p, dims) };
  }

﻿  /* ================= 评分模型 v2：8 维度加权（真实分布） ================= */

  dimAge(p) {
    const age = this.state.age;
    const cat = p.category.id;
    const table = {
      youth: { u18: 1, '18-22': 1, '23-30': 1, '31-40': 0.5, '41-50': 0.25, '50+': 0.15 },
      study: { u18: 1, '18-22': 1, '23-30': 0.85, '31-40': 0.6, '41-50': 0.4, '50+': 0.25 },
      work: { u18: 0.3, '18-22': 0.8, '23-30': 0.95, '31-40': 1, '41-50': 0.85, '50+': 0.5 },
      tech: { u18: 0.3, '18-22': 0.8, '23-30': 0.95, '31-40': 1, '41-50': 0.85, '50+': 0.5 },
      invest: { u18: 0.3, '18-22': 0.5, '23-30': 0.7, '31-40': 0.95, '41-50': 1, '50+': 0.9 },
      talent: { u18: 0.3, '18-22': 0.7, '23-30': 0.9, '31-40': 1, '41-50': 0.95, '50+': 0.8 },
      family: { u18: 0.4, '18-22': 0.75, '23-30': 0.9, '31-40': 1, '41-50': 1, '50+': 0.9 },
      pr: { u18: 0.4, '18-22': 0.75, '23-30': 0.9, '31-40': 1, '41-50': 1, '50+': 0.9 },
      nomad: { u18: 0.2, '18-22': 1, '23-30': 1, '31-40': 0.9, '41-50': 0.7, '50+': 0.6 }
    };
    return (table[cat] && table[cat][age]) || 0.6;
  }

  dimDegree(p) {
    const idx = { 'below-high': 0, high: 1, college: 2, bachelor: 3, master: 4, phd: 5 }[this.state.degree] || 1;
    const cat = p.category.id;
    const sub = p.subcategory.id;
    if (cat === 'study') {
      const need = { 'edu-phd': 5, 'edu-master': 4, 'edu-bachelor': 3, 'edu-vocational': 2, 'edu-language': 1 }[sub] || 3;
      return Math.max(0.2, 1 - Math.abs(need - idx) * 0.2);
    }
    if (cat === 'tech' || cat === 'talent' || sub === 'work-highskill' || sub === 'work-skilled' || sub === 'pr-apply') {
      const need = (sub === 'edu-phd') ? 5 : (sub === 'tech-degree' || sub === 'talent-exceptional') ? 4 : 3;
      return Math.max(0.2, 1 - Math.max(0, need - idx) * 0.28);
    }
    if (cat === 'invest') return idx >= 2 ? 0.85 : 0.6;
    if (cat === 'work') return Math.min(1, 0.6 + idx * 0.08);
    if (cat === 'family' || cat === 'pr') return 0.8;
    return 0.75;
  }

  dimCareer(p) {
    const s = this.state;
    const cat = p.category.id;
    const sub = p.subcategory.id;
    const subMap = {
      '机械维修': 'work-bluecollar', '机械操作': 'work-bluecollar', '焊工': 'work-bluecollar',
      '电工': 'work-bluecollar', '汽车维修': 'work-bluecollar', '木工': 'work-bluecollar',
      '瓦工': 'work-bluecollar', '水电工': 'work-bluecollar', '生产管理': 'work-skilled',
      '工程师': 'tech-engineer', '电子技术': 'tech-engineer', '自动化': 'tech-engineer',
      '程序员': 'tech-it', '产品经理': 'tech-it', '设计师': 'tech-it', '运营': 'tech-it',
      '医生': 'tech-medical', '护士': 'tech-medical', '护理员': 'tech-medical', '药剂师': 'tech-medical',
      '教师': 'tech-degree', '培训师': 'tech-degree', '会计': 'finance',
      '厨师': 'work-regular', '服务员': 'work-regular', '酒店员工': 'work-regular',
      '美容美发': 'work-regular', '家政服务': 'work-regular', '护理人员': 'work-regular',
      '司机': 'work-regular', '配送': 'work-regular', '仓储': 'work-regular',
      '种植': 'work-regular', '养殖': 'work-regular', '远程办公': 'nomad-visa',
      '内容创作': 'nomad-visa', '摄影': 'nomad-visa', '音乐': 'nomad-visa',
      '平面设计': 'nomad-visa', '插画': 'nomad-visa'
    };
    if (s.cat2 && subMap[s.cat2] === sub) return 1.0;
    if (s.cat2 && subMap[s.cat2] && subMap[s.cat2].split('-')[0] === sub.split('-')[0]) return 0.8;
    const catMap = {
      tech: ['tech'], service: ['work'], manufacture: ['work'], construction: ['work', 'tech'],
      medical: ['tech'], edu: ['study', 'tech'], finance: ['work', 'invest'], internet: ['tech'],
      agriculture: ['work'], logistics: ['work'], catering: ['work'], art: ['nomad'],
      freelance: ['nomad'], none: ['study', 'nomad']
    };
    const targets = catMap[s.cat1] || [];
    if (targets.includes(cat)) return 0.55;
    if (cat === 'study' && s.studyFirst === 'yes') return 0.55;
    if (cat === 'invest' && (s.cat1 === 'finance' || s.cat1 === 'freelance' || s.source.includes('business') || s.source.includes('invest'))) return 0.6;
    if (cat === 'pr' || cat === 'family') return 0.45;
    if (cat === 'nomad' && (s.cat1 === 'art' || s.cat1 === 'freelance' || s.cat1 === 'internet')) return 0.7;
    return 0.2;
  }

  dimExp(p) {
    const yrs = { none: 0, '1y-': 0.2, '1-3': 0.4, '3-5': 0.7, '5y+': 1 }[this.state.years] || 0;
    const cat = p.category.id;
    if (cat === 'study') return 0.85;
    if (cat === 'youth' || cat === 'nomad') return 0.9;
    if (cat === 'family' || cat === 'pr') return 0.8;
    if (cat === 'invest') return Math.min(1, 0.5 + yrs * 0.5);
    if (cat === 'work' || cat === 'tech' || cat === 'talent') {
      const need = (p.subcategory.id === 'work-bluecollar' || p.subcategory.id === 'work-regular') ? 0.35 : 0.6;
      return Math.min(1, Math.max(0.15, yrs / need));
    }
    return 0.7;
  }

  dimLang(p) {
    const eng = { none: 0, basic: 0.35, daily: 0.6, skilled: 0.85, fluent: 1 }[this.state.englishLevel] || 0;
    const isEn = ['us', 'ca', 'gb', 'au', 'nz', 'ie', 'sg'].includes(p.country.id);
    const learn = this.state.learnLocal === 'yes';
    const testBonus = (this.state.langTest === 'cet6' || this.state.langTest === 'ielts' || this.state.langTest === 'toefl') ? 0.1 : 0;
    let v;
    if (isEn) v = Math.min(1, eng + testBonus);
    else v = Math.min(1, Math.max(eng * 0.5, learn ? 0.6 : 0.35) + testBonus * 0.5);
    if (p.category.id === 'study') v = Math.min(1, v + 0.05);
    return v;
  }

  dimFunds(p) {
    const rank = { low: 0, midlow: 1, mid: 2, high: 3 };
    const diff = Math.abs(rank[p.budget.level] - rank[this.budgetTier()]);
    let v = 1 - diff * 0.3;
    const highCost = ['us','ca','gb','ch','no','dk','se','fi','ie','au','nz','sg','ae','qa','sa','lu','nl'];
    const lowCost = ['mx','th','vn','ph','id','my','in','br','ar','cl','za','pl','cz','hu','ro','bg','hr','si','sk','lt','lv','ee','tr'];
    if (highCost.includes(p.country.id)) v *= 0.85;
    else if (lowCost.includes(p.country.id)) v *= 1.0;
    else v *= 0.95;
    if (this.state.lowCost === 'yes' && p.budget.level === 'low') v += 0.1;
    return Math.max(0.1, Math.min(1, v));
  }

  dimFamily(p) {
    const s = this.state;
    if (p.category.id === 'family') {
      if (s.hasKids === 'yes' || s.parentsPlan === 'yes' || s.marital === 'married') return 0.95;
      return 0.35;
    }
    if (p.category.id === 'pr' && (s.hasKids === 'yes' || s.marital === 'married')) return 0.85;
    return 0.7;
  }

  dimGoals(p) {
    const s = this.state;
    const goalCat = { travel: 'nomad', short: 'work', work: 'work', study: 'edu', career: 'work', startup: 'invest', invest: 'invest', family: 'family', pr: 'pr', identity: 'pr' };
    if (s.goals.some((g) => goalCat[g] === p.category.id)) return 1.0;
    const related = { pr: ['work', 'family'], work: ['pr', 'study'], edu: ['pr'], invest: ['work'], family: ['pr'], nomad: ['youth'], youth: ['nomad'] };
    if (s.goals.some((g) => (related[p.category.id] || []).includes(goalCat[g]))) return 0.6;
    return 0.3;
  }

  nextSteps(p, dims) {
    const steps = [];
    if (dims.language < 0.55) steps.push('先提升当地语言水平（语言考试或课程）');
    if (dims.degree < 0.55) steps.push('完成学历认证或相关进修');
    if (dims.funds < 0.55) steps.push('做好资金规划或选择低成本路线');
    if (dims.experience < 0.55) steps.push('积累相关经验或考取职业证书');
    if (dims.career < 0.5) steps.push('参加技能培训后再申请');
    if (!steps.length) steps.push('准备申请材料并咨询顾问获取申请方案');
    return steps.slice(0, 3);
  }

  scoreProject(p) {
    const dims = {
      age: this.dimAge(p),
      degree: this.dimDegree(p),
      career: this.dimCareer(p),
      experience: this.dimExp(p),
      language: this.dimLang(p),
      funds: this.dimFunds(p),
      family: this.dimFamily(p),
      goals: this.dimGoals(p)
    };
    const raw = dims.age * 0.15 + dims.degree * 0.15 + dims.career * 0.20 + dims.experience * 0.15 +
      dims.language * 0.10 + dims.funds * 0.10 + dims.family * 0.05 + dims.goals * 0.10;
    const pct = Math.max(8, Math.min(95, Math.round(raw * 100)));
    const names = { age: '年龄匹配', degree: '学历匹配', career: '职业匹配', experience: '工作经验', language: '语言能力', funds: '资金能力', family: '家庭情况', goals: '出国目标' };
    const strengths = [];
    const gaps = [];
    Object.entries(dims).forEach(([k, v]) => {
      if (v >= 0.75) strengths.push(names[k]);
      else if (v < 0.55) gaps.push(names[k]);
    });
    return { pct, dims, strengths: strengths.slice(0, 4), gaps: gaps.slice(0, 4), nextSteps: this.nextSteps(p, dims) };
  }

  planReasons(p) {
    const s = this.state;
    const out = [];
    out.push(this.projectReason(p));
    if (s.skills && s.skills.trim()) out.push('拥有「' + s.skills.trim().slice(0, 20) + '」技能');
    if (['tech', 'internet', 'medical', 'construction'].includes(s.cat1)) out.push('职业/技能方向与项目匹配');
    if (p.budget && p.budget.level === this.budgetTier()) out.push('资金档位与您的可投入资金匹配');
    else if (p.budget && p.budget.level !== 'high') out.push('成本可控，符合预算偏好');
    if (s.learnLocal === 'yes') out.push('愿意学习当地语言');
    if (p.duration) out.push('发展周期约 ' + p.duration);
    return out.slice(0, 4);
  }

  planConditions(p) {
    const grab = (keys, fb) => {
      const hit = (p.requirements || []).find((r) => keys.some((k) => r.includes(k)));
      return hit || fb;
    };
    return {
      学历: grab(['学历', '学位', '教育'], '以官方要求为准'),
      语言: grab(['语言'], '以官方要求为准'),
      职业: grab(['职业', '雇主', '技能'], '以官方要求为准'),
      资金: (p.budget && p.budget.fundsProof) || grab(['资金', '资产', '收入'], '以官方要求为准'),
      工作经验: grab(['经验', '年限'], '以官方要求为准')
    };
  }

  planCost(p) {
    if (!p.budget) return '以官方为准';
    if (p.category.id === 'invest') return p.budget.investment + '（投资金额）';
    if (p.category.id === 'edu') return p.budget.total;
    return p.budget.suggested;
  }

  buildPlans() {
    const s = this.state;
    const projects = Istra.projects || [];
    const countryRank = this.scoreCountries();
    const cScore = {};
    countryRank.forEach((c, i) => { cScore[c.id] = (countryRank.length - i); });

    const scored = projects.map((p) => {
      const score = this.scoreProject(p);
      let v = score.pct + (cScore[p.country.id] || 0) * 0.4;
      return { project: p, score: v, detail: score };
    }).sort((a, b) => b.score - a.score);

    /* 推荐集归一化：基于 8 维度加权模型的排序，映射到 55–95 自然分布区间（优秀 85-95 / 良好 70-85 / 一般 55-70） */
    const top20 = scored.slice(0, 20);
    const raws = top20.map((x) => x.detail.pct);
    const minRaw = Math.min(...raws);
    const maxRaw = Math.max(...raws);
    const norm = (raw) => Math.round(55 + ((raw - minRaw) / ((maxRaw - minRaw) || 1)) * 40);

    return top20.map((x, i) => {
      const p = x.project;
      return {
        rank: i + 1,
        project: p,
        pct: norm(x.detail.pct),
        strengths: x.detail.strengths,
        gaps: x.detail.gaps,
        nextSteps: x.detail.nextSteps,
        reasons: this.planReasons(p),
        conditions: this.planConditions(p),
        cost: this.planCost(p),
        duration: p.duration,
        type: p.visaType + ' · ' + p.category.name,
        advantages: (p.advantages || []).slice(0, 3),
        limitations: (p.limitations || []).slice(0, 3)
      };
    });
  }
  whyRecommend() {
    const s = this.state;
    const plans = this.buildPlans();
    const rows = [
      { k: '年龄', v: this.ageLabel() },
      { k: '职业', v: this.careerLabel() },
      { k: '可投入资金', v: this.fundsLabel() },
      { k: '语言', v: '英语 ' + this.langLabel() + (s.otherLangs ? ' / ' + s.otherLangs : '') }
    ];
    if (s.skills && s.skills.trim()) rows.push({ k: '技能', v: s.skills.trim().slice(0, 24) });
    if (s.learnLocal === 'yes') rows.push({ k: '语言意愿', v: '愿意学习当地语言' });
    return { rows, top3: plans.slice(0, 3) };
  }

﻿﻿﻿﻿  planCard(p, compact) {
    const c = p.project.country;
    const cond = p.conditions;
    const condHtml = compact
      ? Object.entries(cond).map(([k, v]) => `<span class="plan__cond"><b>${k}</b>${v}</span>`).join('')
      : Object.entries(cond).map(([k, v]) => `<div class="plan__cond-row"><span>${k}</span><b>${v}</b></div>`).join('');
    const tagList = (items) => items.length
      ? `<div class="plan__tags">${items.map((t) => `<span class="plan__tag">${t}</span>`).join('')}</div>`
      : '<p class="plan__tag-empty">—</p>';
    return `
      <article class="plan${compact ? ' plan--compact' : ''}">
        <div class="plan__head">
          <span class="plan__rank">TOP ${String(p.rank).padStart(2, '0')}</span>
          <span class="plan__flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" width="34" height="25" /></span>
          <div class="plan__title">
            <h3 class="plan__country">${c.cn}</h3>
            <p class="plan__name">${p.project.name}</p>
          </div>
          <div class="plan__pct">
            <span class="plan__pct-num">${p.pct}%</span>
            <span class="plan__pct-bar"><i style="width:${p.pct}%"></i></span>
            <span class="plan__pct-label">匹配指数</span>
          </div>
        </div>
        <p class="plan__type">${p.type}</p>
        <div class="plan__reasons">
          <p class="plan__block-label">推荐理由</p>
          <ul>${p.reasons.map((r) => `<li>${r}</li>`).join('')}</ul>
        </div>
        <div class="plan__profiles">
          <div class="plan__profile">
            <p class="plan__block-label">用户优势</p>
            ${tagList(p.strengths)}
          </div>
          <div class="plan__profile">
            <p class="plan__block-label">不足条件</p>
            ${tagList(p.gaps)}
          </div>
          <div class="plan__profile plan__profile--wide">
            <p class="plan__block-label">下一步建议</p>
            ${tagList(p.nextSteps)}
          </div>
        </div>
        <div class="plan__conditions">
          <p class="plan__block-label">申请条件</p>
          ${compact ? `<div class="plan__conds-inline">${condHtml}</div>` : `<div class="plan__cond-rows">${condHtml}</div>`}
        </div>
        <div class="plan__meta">
          <div class="plan__meta-item"><span>预计成本</span><b>${p.cost}</b></div>
          <div class="plan__meta-item"><span>预计周期</span><b>${p.duration}</b></div>
        </div>
        <div class="plan__proscons">
          <div class="plan__pros"><p class="plan__block-label">优势</p><ul>${p.advantages.map((a) => `<li>${a}</li>`).join('')}</ul></div>
          <div class="plan__cons"><p class="plan__block-label">限制</p><ul>${p.limitations.map((l) => `<li>${l}</li>`).join('')}</ul></div>
        </div>
        <a class="btn btn--ghost-dark plan__btn" data-project-detail="${p.project.id}" href="project-detail.html?id=${p.project.id}">查看详细项目 <span class="btn-arrow">→</span></a>
      </article>`;
  }
  /* 推荐项目详情弹层：在评估结果页内打开，不离开评估流程 */
  openProjectDetail(projectId) {
    const p = (Istra.projects || []).find((x) => x.id === projectId);
    if (!p || this._detailOverlay) return;
    const c = p.country;
    const list = (arr) => (arr && arr.length
      ? '<ul class="ai-detail__list">' + arr.map((t) => '<li>' + t + '</li>').join('') + '</ul>'
      : '<p class="ai-detail__empty">暂无资料</p>');
    const overlay = document.createElement('div');
    overlay.className = 'ai-detail-overlay';
    overlay.innerHTML = `
      <div class="ai-detail-modal" role="dialog" aria-modal="true" aria-label="${p.name}">
        <div class="ai-detail__head">
          <span class="ai-detail__flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" /></span>
          <div class="ai-detail__titlebox">
            <p class="ai-detail__country">${c.cn} <small>${c.en}</small></p>
            <h3 class="ai-detail__title">${p.name}</h3>
            <p class="ai-detail__type">${p.visaType} · ${p.category.name} · ${p.subcategory.name}</p>
          </div>
          <button class="ai-detail__close" type="button" aria-label="关闭">×</button>
        </div>
        <div class="ai-detail__body">
          <section class="ai-detail__module">
            <h4 class="ai-detail__module-title"><span>01</span>项目介绍</h4>
            <p class="ai-detail__text">${p.introduction}</p>
          </section>
          <section class="ai-detail__module">
            <h4 class="ai-detail__module-title"><span>02</span>适合人群</h4>
            ${list(p.targetUsers)}
          </section>
          <section class="ai-detail__module">
            <h4 class="ai-detail__module-title"><span>03</span>申请条件</h4>
            ${list(p.requirements)}
          </section>
          <section class="ai-detail__module">
            <h4 class="ai-detail__module-title"><span>04</span>所需材料</h4>
            ${list(p.documents)}
          </section>
          <section class="ai-detail__module">
            <h4 class="ai-detail__module-title"><span>05</span>申请流程</h4>
            <ol class="ai-detail__steps">${(p.process || []).map((t, i) => '<li><b>' + String(i + 1).padStart(2, '0') + '</b><span>' + t + '</span></li>').join('')}</ol>
          </section>
          <section class="ai-detail__module">
            <h4 class="ai-detail__module-title"><span>06</span>费用与周期</h4>
            <div class="ai-detail__facts">
              <div class="ai-detail__fact"><span>预算等级</span><b>${p.budget.label}（${p.budget.range}）</b></div>
              <div class="ai-detail__fact"><span>办理周期</span><b>${p.duration}</b></div>
              <div class="ai-detail__fact"><span>资金证明</span><b>${p.budget.fundsProof}</b></div>
              <div class="ai-detail__fact"><span>建议准备</span><b>${p.budget.suggested}</b></div>
            </div>
            ${p.budget.investment ? '<div class="ai-detail__fact"><span>投资金额</span><b>' + p.budget.investment + '</b></div>' : ''}
            <p class="ai-detail__note">* 以上预算为综合参考，不代表官方收费标准。</p>
          </section>
          <section class="ai-detail__module">
            <h4 class="ai-detail__module-title"><span>07</span>优势</h4>
            <ul class="ai-detail__list ai-detail__list--plus">${(p.advantages || []).map((t) => '<li>' + t + '</li>').join('')}</ul>
          </section>
          <section class="ai-detail__module">
            <h4 class="ai-detail__module-title"><span>08</span>限制</h4>
            <ul class="ai-detail__list ai-detail__list--minus">${(p.limitations || []).map((t) => '<li>' + t + '</li>').join('')}</ul>
          </section>
          ${p.faq && p.faq.length ? '<section class="ai-detail__module"><h4 class="ai-detail__module-title"><span>09</span>常见问题</h4><div class="ai-detail__faq">' + p.faq.map((f) => '<details class="ai-detail__faq-item"><summary>' + f.q + '</summary><p>' + f.a + '</p></details>').join('') + '</div></section>' : ''}
        </div>
        <div class="ai-detail__foot">
          <a class="btn btn--ghost-dark" href="project-detail.html?id=${p.id}" target="_blank" rel="noopener">在新页面查看完整详情</a>
          <button class="btn btn--primary" type="button" data-ai-detail-close>返回评估结果 <span class="btn-arrow">→</span></button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    this._detailOverlay = overlay;
    const close = () => this.closeProjectDetail();
    overlay.querySelector('.ai-detail__close').addEventListener('click', close);
    overlay.querySelector('[data-ai-detail-close]').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    this._detailEsc = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', this._detailEsc);
    document.body.style.overflow = 'hidden';
  }

  closeProjectDetail() {
    if (!this._detailOverlay) return;
    this._detailOverlay.remove();
    this._detailOverlay = null;
    document.body.style.overflow = '';
    if (this._detailEsc) { document.removeEventListener('keydown', this._detailEsc); this._detailEsc = null; }
  }

  getUnlock() {
    let token = '';
    try { token = localStorage.getItem('istra_token') || ''; } catch (e) {}
    if (!token || !window.Istra || !Istra.api) return Promise.resolve(false);
    return Istra.api.me().then((d) => !!d.user.assessmentUnlock).catch(() => false);
  }

  revealFull() {
    const plans = this._plans || [];
    if (!plans.length) return;
    this._unlocked = true;
    const topEl = this.querySelector('#plans-top');
    if (topEl) topEl.innerHTML = plans.slice(0, 5).map((p) => this.planCard(p, false)).join('');
    const title = this.querySelector('[data-top-title]');
    if (title) title.textContent = '高匹配 · TOP 5';
    const banner = this.querySelector('[data-unlock-sec]');
    if (banner) banner.remove();
    const midSec = this.querySelector('[data-mid-sec]');
    const backupSec = this.querySelector('[data-backup-sec]');
    if (midSec) midSec.style.display = '';
    if (backupSec) backupSec.style.display = '';
    const n1 = this.querySelector('[data-notrec-sec] .report__section-title span');
    const n2 = this.querySelector('[data-roadmap-sec] .report__section-title span');
    if (n1) n1.textContent = '05';
    if (n2) n2.textContent = '06';
    if (window.Istra && Istra.reveal) Istra.reveal.observe(this);
    if (midSec) midSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  startAnalysis() {
    this.phase = 'analyzing';
    const steps = ['正在理解您的个人画像…', '正在匹配目标国家…', '正在匹配 20 个方案…', '正在规划未来路线…'];
    this.innerHTML = `
      <div class="assessment">
        <header class="assessment__head">
          <div class="container">
            <p class="assessment__eyebrow" data-reveal>AI Life Path Planning System</p>
            <h1 class="assessment__title" data-reveal>全球人生路径规划评估中心</h1>
          </div>
        </header>
        <div class="assessment__body">
          <div class="container">
            <div class="analyzing" data-reveal>
              <div class="analyzing__ring" aria-hidden="true"><span></span></div>
              <h2 class="analyzing__title">正在生成您的全球人生路径规划</h2>
              <ul class="analyzing__steps">
                ${steps.map((s, i) => `<li data-ast="${i}"><span class="analyzing__check">○</span>${s}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
    let i = 0;
    const timer = setInterval(() => {
      const el = this.querySelector(`[data-ast="${i}"]`);
      if (el) {
        el.classList.add('is-done');
        el.querySelector('.analyzing__check').textContent = '●';
      }
      i++;
      if (i > steps.length) {
        clearInterval(timer);
        setTimeout(() => this.showReport(), 300);
      }
    }, 500);
  }

  async showReport() {
    this.phase = 'report';
    const plans = this.buildPlans();
    const top = plans.slice(0, 5);
    const mid = plans.slice(5, 15);
    const backup = plans.slice(15, 20);
    const notRec = this.notRecommendedDirections();
    const topCountry = plans[0] ? plans[0].project.country.id : 'ca';
    const topProject = plans[0] ? plans[0].project : null;
    const roadmap = this.roadmap(topCountry, topProject);
    const why = this.whyRecommend();
    const unlocked = await this.getUnlock();
    this._plans = plans;
    this._unlocked = unlocked;
    const s = this.state;
    const now = new Date();
    const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    this.innerHTML = `
      <div class="assessment">
        <header class="assessment__head">
          <div class="container">
            <p class="assessment__eyebrow" data-reveal>AI Life Path Planning System</p>
            <h1 class="assessment__title" data-reveal>全球人生路径规划评估中心</h1>
          </div>
        </header>

        <div class="assessment__body">
          <div class="container report">
            <div class="report__cover" data-reveal>
              <p class="report__cover-eyebrow">Global Life Path Planning Report</p>
              <h2 class="report__cover-title">全球人生路径规划报告</h2>
              <p class="report__cover-meta">${this.identityLabel()} · ${dateStr} · 20 个个性化匹配方案</p>
            </div>

            <section class="report__section" data-reveal>
              <h3 class="report__section-title"><span>01</span>为什么推荐这些方案</h3>
              <p class="why__lead">因为你：</p>
              <div class="why__rows">
                ${why.rows.map((r) => `<div class="why__row"><span>${r.k}</span><b>${r.v}</b></div>`).join('')}
              </div>
              <p class="why__lead" style="margin-top:1rem">所以为你推荐：</p>
              <div class="why__top3">
                ${why.top3.map((p) => `
                  <a class="why__item" data-project-detail="${p.project.id}" href="project-detail.html?id=${p.project.id}">
                    <img src="assets/flags/${p.project.country.flag}" alt="${p.project.country.cn}" width="26" height="19" />
                    <span>${p.project.name}</span><b>${p.pct}%</b>
                  </a>`).join('')}
              </div>
            </section>

            <section class="report__section" data-reveal>
              <h3 class="report__section-title" data-top-title><span>02</span>高匹配 · ${unlocked ? 'TOP 5' : 'TOP 3'}</h3>
              <div class="plans" id="plans-top">${(unlocked ? top : top.slice(0, 3)).map((p) => this.planCard(p, false)).join('')}</div>
            </section>

            ${unlocked ? '' : `
            <section class="report__section" data-unlock-sec data-reveal>
              <h3 class="report__section-title"><span>03</span>解锁完整方案</h3>
              <div class="unlock">
                <p class="unlock__text">还有 ${plans.length - 3} 个适合您的项目已隐藏</p>
                <button class="btn btn--primary" type="button" data-unlock>¥9.9 解锁完整方案 <span class="btn-arrow">→</span></button>
                <p class="unlock__note">解锁后可查看全部 ${plans.length} 个项目与推荐方案。支付仅解锁已有 AI 评估结果，不会重新生成评估。</p>
              </div>
            </section>`}

            <section class="report__section" data-mid-sec data-reveal${unlocked ? '' : ' style="display:none"'}>
              <h3 class="report__section-title"><span>03</span>推荐考虑 · 6–15</h3>
              <div class="plans plans--grid">${mid.map((p) => this.planCard(p, true)).join('')}</div>
            </section>

            <section class="report__section" data-backup-sec data-reveal${unlocked ? '' : ' style="display:none"'}>
              <h3 class="report__section-title"><span>04</span>备用方案 · 16–20</h3>
              <div class="plans plans--grid">${backup.map((p) => this.planCard(p, true)).join('')}</div>
            </section>

            <section class="report__section" data-notrec-sec data-reveal>
              <h3 class="report__section-title"><span>${unlocked ? '05' : '04'}</span>不推荐方向</h3>
              <div class="report__notrec">
                ${notRec.map((x) => `
                  <div class="report__notrec-item">
                    <span class="report__notrec-tag">暂不推荐</span>
                    <div>
                      <p class="report__notrec-title">${x.title}</p>
                      <p class="report__notrec-reason">${x.reason}</p>
                    </div>
                  </div>`).join('')}
              </div>
            </section>

            <section class="report__section" data-roadmap-sec data-reveal>
              <h3 class="report__section-title"><span>${unlocked ? '06' : '05'}</span>未来路线规划</h3>
              <div class="report__roadmap">
                ${roadmap.map((r) => `
                  <div class="report__roadmap-step">
                    <span class="report__roadmap-dot"></span>
                    <div>
                      <p class="report__roadmap-phase">${r.phase}</p>
                      <ul class="report__roadmap-items">
                        ${r.items.map((it) => `<li>${it}</li>`).join('')}
                      </ul>
                    </div>
                  </div>`).join('')}
              </div>
            </section>

            <div class="report__saved" data-reveal></div>
            <div class="report__actions" data-reveal>
              <button type="button" class="btn btn--primary" data-action="restart">重新评估</button>
              <a class="btn btn--ghost-dark" href="projects.html">浏览全部项目</a>
            </div>
            <p class="report__note">* 匹配度为 8 维度加权模型（年龄15% / 学历15% / 职业20% / 工作经验15% / 语言10% / 资金10% / 家庭5% / 出国目标10%）在推荐集中的归一化结果（55–95），最高不超过 95%。具体政策、费用与周期以各国官方最新公布为准；健康信息仅用于匹配生活环境与医疗资源，不构成任何淘汰条件。</p>
              <div class="legal-note report__legal">
                <p>伊斯特拉国际为全球信息探索与 AI 辅助分析平台。AI 评估结果基于您填写的信息与公开规则进行智能匹配，不代表签证批准概率，不构成移民、法律、财务或职业建议；最终申请结果以相关国家政府、官方机构审核为准。不同用户因年龄、学历、职业、语言、资金等因素可能存在不同结果，平台不承诺签证一定获批、移民一定成功、就业一定获得或收入达到预期。</p>
                <a href="disclaimer.html">查看完整免责声明 →</a>
              </div>
          </div>
        </div>
      </div>
    `;
    this.querySelector('[data-action="restart"]').addEventListener('click', () => this.reset());
    const unlockBtn = this.querySelector('[data-unlock]');
    if (unlockBtn && !unlocked) {
      unlockBtn.addEventListener('click', () => {
        let token = '';
        try { token = localStorage.getItem('istra_token') || ''; } catch (e) {}
        if (!token || !window.Istra || !Istra.pay) { location.href = 'login.html?next=ai-assessment.html'; return; }
        Istra.pay.openUnlockModal({ onDone: () => this.revealFull() });
      });
    }

    /* 推荐项目 → 评估结果页内打开项目详情（不离开评估流程） */
    this.querySelectorAll('[data-project-detail]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.openProjectDetail(a.getAttribute('data-project-detail'));
      });
    });

    /* 保存评估与推荐到个人中心（登录用户） */
    const saveBox = this.querySelector('.report__saved');
    let token = '';
    try { token = localStorage.getItem('istra_token') || ''; } catch (e) {}
    if (token && window.Istra && Istra.api) {
      const payload = {
        inputs: {
          age: s.age, gender: s.gender, marital: s.marital, hasKids: s.hasKids,
          cat1: s.cat1, cat2: s.cat2, identity: s.identity, industry: s.industry, skills: s.skills, years: s.years,
          degree: s.degree, major: s.major, englishLevel: s.englishLevel, otherLangs: s.otherLangs,
          funds: s.funds, source: s.source, lowCost: s.lowCost, workDevelop: s.workDevelop, studyFirst: s.studyFirst, planTime: s.planTime, idealLife: s.idealLife, developWays: s.developWays,
          parentsPlan: s.parentsPlan, eduNeed: s.eduNeed, goals: s.goals,
          likes: s.likes, climate: s.climate, pace: s.pace, risk: s.risk, accepts: s.accepts
        },
        health: { healthNeed: s.healthNeed, specialMed: s.specialMed, chronic: s.chronic, regularMed: s.regularMed },
        recommendations: plans.slice(0, 20).map((pp) => ({ country: pp.project.country.cn, project: pp.project.name, score: pp.pct, reason: pp.reasons[0] || '' }))
      };
      Istra.api.saveAssessment(payload).then((r) => {
        if (saveBox) saveBox.innerHTML = '✅ 已保存到个人中心（评估 #' + r.id + '）· <a href="profile.html">查看我的评估</a>';
      }).catch(() => { if (saveBox) saveBox.innerHTML = '保存失败，请稍后在个人中心查看。'; });
    } else if (saveBox) {
      saveBox.innerHTML = '💡 <a href="login.html?next=ai-assessment.html">登录 / 注册</a>后，可保存本次评估记录与 20 个推荐方案到个人中心。';
    }

    Istra.reveal.observe(this);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

customElements.define('is-ai-assessment', SiteAiAssessment);
