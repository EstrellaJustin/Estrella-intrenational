/* ============================================================
   组件：is-ai-assessment · 全球身份规划深度评估中心
   10 阶段问答式评估 → 智能匹配 → 《全球身份规划分析报告》
   深蓝私人银行风：深色透明输入框 + 白底按钮 + 步骤/数据分析动画
   ============================================================ */

class SiteAiAssessment extends HTMLElement {
  constructor() {
    super();
    this.step = 0;
    this.phase = 'form'; /* form | analyzing | report */
    this.state = {
      name: '', age: '', gender: '', curCountry: '', curCity: '', marital: '', hasKids: '', familyMembers: '',
      reasons: [], priority1: '', priority2: '', priority3: '',
      career: '', position: '', years: '', industryExp: '', mgmtExp: '', techSkills: '',
      degree: '', major: '', gradCountry: '', gradYear: '', overseasStudy: '',
      languages: [], langLevel: '', learnNewLang: '',
      income: '', assets: '', investAbility: '', budget: '',
      travelType: '', childAge: '', eduNeed: '', parentsPlan: '',
      climates: [], weather: { cold: '', hot: '', humid: '', dry: '' },
      citySize: '', international: '', pace: '', safety: '',
      futurePlan: [], willing: []
    };
    this.totalSteps = 10;
    this.report = null;
  }

  connectedCallback() {
    this.render();
    this.bind();
    this.updateView();
    Istra.reveal.observe(this);
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

  chips(name, list, stateKey, multi = true, withFlag = false) {
    const cur = this.state[stateKey];
    return `
      <div class="field field--full" data-field="${stateKey}">
        <span class="field-label">${name}</span>
        <div class="chip-grid">
          ${list.map((o) => {
            const active = multi ? (cur || []).includes(o.id) : cur === o.id;
            return `<button type="button" class="chip${active ? ' is-selected' : ''}" data-chip="${stateKey}" data-value="${o.id}"${multi ? '' : ' data-single="1"'} aria-pressed="${active}">
              ${withFlag && o.flag ? `<img src="assets/flags/${o.flag}" alt="" width="18" height="13" />` : ''}
              ${o.label}
            </button>`;
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

  /* ================= 10 个阶段 ================= */

  stepPanel(i) {
    const countries = Istra.countries || [];
    const countryOptions = countries.map((c) => `<option value="${c.id}">${c.cn}</option>`).join('');

    switch (i) {
      case 0:
        return `
          <h2 class="wizard__panel-title">基础身份信息</h2>
          <p class="wizard__panel-desc">第一步，让我们了解您与家庭的基本情况，用于判断家庭迁移需求。</p>
          <div class="field-grid">
            ${this.text('name', '姓名', '您的称呼', true)}
            ${this.selects('age', '年龄', [
              { value: '18-25', label: '18–25 岁' }, { value: '26-35', label: '26–35 岁' },
              { value: '36-45', label: '36–45 岁' }, { value: '46-55', label: '46–55 岁' },
              { value: '55+', label: '55 岁以上' }
            ])}
            ${this.selects('gender', '性别', [{ value: 'male', label: '男' }, { value: 'female', label: '女' }, { value: 'other', label: '其他' }])}
            ${this.selects('curCountry', '当前国家', [{ value: 'cn', label: '中国' }, { value: 'other', label: '其他国家' }])}
            ${this.text('curCity', '当前城市')}
            ${this.selects('marital', '婚姻状态', [{ value: 'single', label: '单身' }, { value: 'married', label: '已婚' }, { value: 'other', label: '其他' }])}
            ${this.selects('hasKids', '是否有子女', [{ value: 'no', label: '无子女' }, { value: 'yes', label: '有子女' }])}
            ${this.text('familyMembers', '家庭成员情况', '如：夫妻+1个子女', true)}
          </div>`;

      case 1:
        return `
          <h2 class="wizard__panel-title">出国核心目的</h2>
          <p class="wizard__panel-desc">你为什么考虑出国？（可多选，并请对前三个目标进行优先级排序）</p>
          ${this.chips('出国原因（多选）', [
            { id: 'income', label: '获得更好的收入' }, { id: 'education', label: '获得更好的教育' },
            { id: 'child-edu', label: '子女教育规划' }, { id: 'permanent', label: '获得永久身份' },
            { id: 'business', label: '商业发展' }, { id: 'startup', label: '创业机会' },
            { id: 'invest', label: '投资资产配置' }, { id: 'lifestyle', label: '生活环境改善' },
            { id: 'medical', label: '医疗资源' }, { id: 'experience', label: '探索人生体验' }
          ], 'reasons')}
          <div class="field-grid">
            ${this.selects('priority1', '第一目标', this.priorityOptions())}
            ${this.selects('priority2', '第二目标', this.priorityOptions())}
            ${this.selects('priority3', '第三目标', this.priorityOptions())}
          </div>`;

      case 2:
        return `
          <h2 class="wizard__panel-title">职业与能力背景</h2>
          <p class="wizard__panel-desc">职业与技能是国际发展评估的核心维度之一。</p>
          ${this.chips('职业类型', [
            { id: 'it', label: 'IT' }, { id: 'eng', label: '工程' }, { id: 'finance', label: '金融' },
            { id: 'medical', label: '医疗' }, { id: 'edu', label: '教育' }, { id: 'research', label: '科研' },
            { id: 'manufacture', label: '制造' }, { id: 'trade', label: '贸易' }, { id: 'entrepreneur', label: '创业者' },
            { id: 'freelancer', label: '自由职业' }, { id: 'student', label: '学生' }, { id: 'other', label: '其他' }
          ], 'career', false)}
          <div class="field-grid">
            ${this.text('position', '当前职位', '如：高级工程师 / 部门经理')}
            ${this.selects('years', '工作年限', [
              { value: '0', label: '无 / 应届' }, { value: '1-3', label: '1–3 年' },
              { value: '3-5', label: '3–5 年' }, { value: '5-10', label: '5–10 年' },
              { value: '10+', label: '10 年以上' }
            ])}
            ${this.selects('industryExp', '行业经验', [
              { value: '1-3', label: '1–3 年' }, { value: '3-5', label: '3–5 年' },
              { value: '5-10', label: '5–10 年' }, { value: '10+', label: '10 年以上' }
            ])}
            ${this.selects('mgmtExp', '管理经验', [
              { value: 'none', label: '无' }, { value: 'team', label: '团队管理' },
              { value: 'dept', label: '部门管理' }, { value: 'exec', label: '高管 / 合伙人' }
            ])}
            ${this.text('techSkills', '技术技能', '如：软件开发 / 数据分析 / 医疗执业', true)}
          </div>`;

      case 3:
        return `
          <h2 class="wizard__panel-title">教育背景</h2>
          <p class="wizard__panel-desc">学历与专业影响留学、技术人才与永居类项目的匹配。</p>
          <div class="field-grid">
            ${this.selects('degree', '最高学历', [
              { value: 'high', label: '高中' }, { value: 'college', label: '专科' },
              { value: 'bachelor', label: '本科' }, { value: 'master', label: '硕士' },
              { value: 'phd', label: '博士' }
            ])}
            ${this.text('major', '专业', '如：计算机 / 金融 / 医学')}
            ${this.selects('gradCountry', '毕业国家', [{ value: 'cn', label: '中国' }].concat(countries.map((c) => ({ value: c.id, label: c.cn }))))}
            ${this.selects('gradYear', '毕业时间', [
              { value: '2020+', label: '2020 年以后' }, { value: '2015-2020', label: '2015–2020' },
              { value: '2010-2015', label: '2010–2015' }, { value: '2000-2010', label: '2000–2010' },
              { value: '2000-', label: '2000 年以前' }
            ])}
            ${this.radioRow('是否有海外学习经历', 'overseasStudy', [{ value: 'yes', label: '有' }, { value: 'no', label: '没有' }])}
          </div>`;
      case 4:
        return `
          <h2 class="wizard__panel-title">语言能力</h2>
          <p class="wizard__panel-desc">语言是国际发展的重要基础，也影响目标国家的匹配。</p>
          ${this.chips('掌握的语言（可多选）', [
            { id: 'en', label: '英语' }, { id: 'ja', label: '日语' }, { id: 'de', label: '德语' },
            { id: 'fr', label: '法语' }, { id: 'es', label: '西班牙语' }, { id: 'other', label: '其他' }
          ], 'languages')}
          <div class="field-grid">
            ${this.selects('langLevel', '语言水平（按最高水平）', [
              { value: 'native', label: '母语级' }, { value: 'fluent', label: '流利' },
              { value: 'daily', label: '日常交流' }, { value: 'basic', label: '基础' }
            ])}
            ${this.radioRow('是否愿意学习新语言', 'learnNewLang', [{ value: 'yes', label: '愿意' }, { value: 'no', label: '不愿意' }])}
          </div>`;

      case 5:
        return `
          <h2 class="wizard__panel-title">经济情况</h2>
          <p class="wizard__panel-desc">经济能力用于判断投资、创业类项目的匹配程度。</p>
          <div class="field-grid">
            ${this.selects('income', '月收入范围', [
              { value: '1w', label: '1 万以内' }, { value: '1-3w', label: '1–3 万' },
              { value: '3-5w', label: '3–5 万' }, { value: '5w+', label: '5 万以上' }
            ])}
            ${this.selects('assets', '个人资产范围', [
              { value: '50w', label: '50 万以内' }, { value: '50-150w', label: '50–150 万' },
              { value: '150-300w', label: '150–300 万' }, { value: '300w+', label: '300 万以上' }
            ])}
            ${this.radioRow('投资能力', 'investAbility', [{ value: 'low', label: '低' }, { value: 'mid', label: '中' }, { value: 'high', label: '高' }])}
            ${this.selects('budget', '可接受投入预算', [
              { value: 'low', label: '0–10 万' }, { value: 'mid', label: '10–50 万' },
              { value: 'high', label: '50–100 万' }, { value: 'vip', label: '100 万以上' }
            ])}
          </div>`;

      case 6:
        return `
          <h2 class="wizard__panel-title">家庭规划</h2>
          <p class="wizard__panel-desc">家庭成员与子女教育需求，影响整体方案设计。</p>
          <div class="field-grid">
            ${this.radioRow('出国方式', 'travelType', [
              { value: 'solo', label: '单人出国' }, { value: 'couple', label: '夫妻同行' },
              { value: 'kids', label: '带孩子' }, { value: 'whole', label: '全家' }
            ])}
            ${this.selects('childAge', '子女年龄（如有）', [
              { value: 'none', label: '无 / 不适用' }, { value: '0-6', label: '0–6 岁' },
              { value: '7-12', label: '7–12 岁' }, { value: '13-18', label: '13–18 岁' },
              { value: '18+', label: '18 岁以上' }
            ])}
            ${this.selects('eduNeed', '子女教育需求', [
              { value: 'none', label: '暂不涉及' }, { value: 'primary', label: '小学' },
              { value: 'middle', label: '中学' }, { value: 'university', label: '大学' }
            ])}
            ${this.radioRow('是否考虑父母未来团聚', 'parentsPlan', [{ value: 'yes', label: '考虑' }, { value: 'no', label: '暂不考虑' }])}
          </div>`;

      case 7:
        return `
          <h2 class="wizard__panel-title">生活方式偏好</h2>
          <p class="wizard__panel-desc">气候与生活方式的适配，是长期幸福感的关键。</p>
          ${this.chips('你喜欢什么气候？（可多选）', [
            { id: 'warm', label: '☀ 温暖阳光' }, { id: 'rain', label: '🌧 湿润多雨' },
            { id: 'cold', label: '❄ 寒冷冬季' }, { id: 'four', label: '🌸 四季分明' },
            { id: 'ocean', label: '🌊 海洋气候' }, { id: 'high', label: '🏔 高海拔环境' }
          ], 'climates')}
          <div class="weather-grid">
            ${this.weatherRow('寒冷', 'cold')}
            ${this.weatherRow('炎热', 'hot')}
            ${this.weatherRow('潮湿', 'humid')}
            ${this.weatherRow('干燥', 'dry')}
          </div>`;

      case 8:
        return `
          <h2 class="wizard__panel-title">城市与社会偏好</h2>
          <p class="wizard__panel-desc">您更倾向于怎样的城市规模与社会环境？</p>
          <div class="field-grid">
            ${this.radioRow('城市规模偏好', 'citySize', [
              { value: 'big', label: '大城市' }, { value: 'mid', label: '中型城市' },
              { value: 'small', label: '小城市' }, { value: 'rural', label: '乡村生活' }
            ])}
            ${this.radioRow('国际化程度偏好', 'international', [{ value: 'high', label: '高' }, { value: 'mid', label: '中' }, { value: 'low', label: '低' }])}
            ${this.radioRow('生活节奏偏好', 'pace', [{ value: 'fast', label: '快速' }, { value: 'balance', label: '平衡' }, { value: 'slow', label: '慢节奏' }])}
            ${this.radioRow('安全要求', 'safety', [{ value: 'normal', label: '普通' }, { value: 'high', label: '较高' }, { value: 'extreme', label: '极高' }])}
          </div>`;

      case 9:
        return `
          <h2 class="wizard__panel-title">价值观与未来规划</h2>
          <p class="wizard__panel-desc">最后一步，让我们了解您对未来 10 年的期待与融入意愿。</p>
          ${this.chips('未来 10 年规划（可多选）', [
            { id: 'career', label: '职业发展' }, { id: 'startup', label: '创业' },
            { id: 'wealth', label: '财富增长' }, { id: 'family', label: '家庭稳定' },
            { id: 'education', label: '教育规划' }, { id: 'retire', label: '养老生活' }
          ], 'futurePlan')}
          ${this.chips('愿意接受（可多选）', [
            { id: 'learn', label: '重新学习' }, { id: 'career-change', label: '改变职业' },
            { id: 'culture', label: '接受文化差异' }, { id: 'integrate', label: '长期融入当地社会' }
          ], 'willing')}
          <div class="wizard__panel-cta">
            <button type="button" class="btn btn--primary" data-action="generate">生成分析报告 <span class="btn-arrow">→</span></button>
          </div>`;
    }
  }

  weatherRow(label, key) {
    const cur = this.state.weather[key];
    return `
      <div class="weather-row" data-field="weather-${key}">
        <span class="weather-label">${label}</span>
        <div class="chip-grid">
          ${[{ v: 'very', l: '非常接受' }, { v: 'ok', l: '一般' }, { v: 'no', l: '无法接受' }].map((o) =>
            `<button type="button" class="chip weather-chip${cur === o.v ? ' is-selected' : ''}" data-weather="${key}" data-value="${o.v}" aria-pressed="${cur === o.v}">${o.l}</button>`).join('')}
        </div>
        <span class="field-error">请选择一项</span>
      </div>`;
  }

  priorityOptions() {
    return [
      { value: 'income', label: '获得更好的收入' }, { value: 'education', label: '获得更好的教育' },
      { value: 'child-edu', label: '子女教育规划' }, { value: 'permanent', label: '获得永久身份' },
      { value: 'business', label: '商业发展' }, { value: 'startup', label: '创业机会' },
      { value: 'invest', label: '投资资产配置' }, { value: 'lifestyle', label: '生活环境改善' },
      { value: 'medical', label: '医疗资源' }, { value: 'experience', label: '探索人生体验' }
    ];
  }

  /* ================= 渲染 ================= */

  render() {
    const steps = [
      '基础身份信息', '出国核心目的', '职业与能力背景', '教育背景', '语言能力',
      '经济情况', '家庭规划', '生活方式偏好', '城市与社会偏好', '价值观与未来规划'
    ];

    this.innerHTML = `
      <div class="assessment">
        <header class="assessment__head">
          <div class="container">
            <p class="assessment__eyebrow" data-reveal>AI Global Assessment Center</p>
            <h1 class="assessment__title" data-reveal>全球身份规划深度评估中心</h1>
            <p class="assessment__sub" data-reveal>十阶段深度评估 · 基于全球项目数据库生成《全球身份规划分析报告》</p>
          </div>
        </header>

        <div class="assessment__body">
          <div class="container">
            <div class="wizard" data-reveal>
              <div class="wizard__progress">
                <div class="wizard__progress-head">
                  <span class="wizard__step-label" data-label>Step 01 / ${this.totalSteps}</span>
                  <span class="wizard__step-name" data-step-name>${steps[0]}</span>
                </div>
                <div class="wizard__track">
                  <span class="wizard__track-line" aria-hidden="true"></span>
                  <span class="wizard__track-fill" aria-hidden="true"></span>
                </div>
                <div class="wizard__dots">${steps.map((s, i) => `<span class="wizard__dot" data-dot="${i}" title="${s}"></span>`).join('')}</div>
              </div>

              <div class="wizard__content">
                ${steps.map((s, i) => `<div class="wizard__panel" data-panel="${i}">${this.stepPanel(i)}</div>`).join('')}
              </div>

              <div class="wizard__actions">
                <button type="button" class="btn btn--ghost-dark" data-action="prev">上一步</button>
                <div class="wizard__actions-right">
                  <button type="button" class="btn btn--ghost-dark" data-action="restart" style="display:none">重新评估</button>
                  <button type="button" class="btn btn--primary" data-action="next">下一步 <span class="btn-arrow">→</span></button>
                </div>
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
          this.querySelectorAll(`[data-chip="${key}"]`).forEach((c) => {
            c.classList.toggle('is-selected', c === chip);
            c.setAttribute('aria-pressed', String(c === chip));
          });
          this.clearInvalid(key);
          return;
        }
        const arr = this.state[key] || [];
        const i = arr.indexOf(val);
        if (i >= 0) arr.splice(i, 1); else arr.push(val);
        chip.classList.toggle('is-selected', i < 0);
        chip.setAttribute('aria-pressed', String(i < 0));
        this.clearInvalid(key);
      });
    });

    this.querySelectorAll('[data-radio]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.radio;
        this.state[key] = chip.dataset.value;
        this.querySelectorAll(`[data-radio="${key}"]`).forEach((c) => {
          c.classList.toggle('is-selected', c === chip);
          c.setAttribute('aria-pressed', String(c === chip));
        });
        this.clearInvalid(key);
      });
    });

    this.querySelectorAll('[data-weather]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.weather;
        this.state.weather[key] = chip.dataset.value;
        this.querySelectorAll(`[data-weather="${key}"]`).forEach((c) => {
          c.classList.toggle('is-selected', c === chip);
          c.setAttribute('aria-pressed', String(c === chip));
        });
        this.clearInvalid(`weather-${key}`);
      });
    });

    this.prevBtn.addEventListener('click', () => this.goTo(this.step - 1));
    this.nextBtn.addEventListener('click', () => {
      if (!this.validate(this.step)) return;
      this.goTo(this.step + 1);
    });
    this.restartBtn.addEventListener('click', () => this.reset());

    this.querySelector('[data-action="generate"]').addEventListener('click', () => {
      if (!this.validate(9)) return;
      this.startAnalysis();
    });
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
        check('name', this.state.name.trim().length > 0);
        check('age', !!this.state.age);
        check('gender', !!this.state.gender);
        check('curCountry', !!this.state.curCountry);
        check('curCity', this.state.curCity.trim().length > 0);
        break;
      case 1:
        check('reasons', this.state.reasons.length > 0);
        check('priority1', !!this.state.priority1);
        break;
      case 2:
        check('career', !!this.state.career);
        check('position', this.state.position.trim().length > 0);
        check('years', !!this.state.years);
        break;
      case 3:
        check('degree', !!this.state.degree);
        check('major', this.state.major.trim().length > 0);
        check('gradYear', !!this.state.gradYear);
        check('overseasStudy', !!this.state.overseasStudy);
        break;
      case 4:
        check('languages', this.state.languages.length > 0);
        check('langLevel', !!this.state.langLevel);
        check('learnNewLang', !!this.state.learnNewLang);
        break;
      case 5:
        check('income', !!this.state.income);
        check('assets', !!this.state.assets);
        check('investAbility', !!this.state.investAbility);
        check('budget', !!this.state.budget);
        break;
      case 6:
        check('travelType', !!this.state.travelType);
        check('childAge', !!this.state.childAge);
        check('eduNeed', !!this.state.eduNeed);
        check('parentsPlan', !!this.state.parentsPlan);
        break;
      case 7:
        check('climates', this.state.climates.length > 0);
        ['cold', 'hot', 'humid', 'dry'].forEach((k) => check(`weather-${k}`, !!this.state.weather[k]));
        break;
      case 8:
        check('citySize', !!this.state.citySize);
        check('international', !!this.state.international);
        check('pace', !!this.state.pace);
        check('safety', !!this.state.safety);
        break;
      case 9:
        check('futurePlan', this.state.futurePlan.length > 0);
        check('willing', this.state.willing.length > 0);
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
    const steps = ['基础身份信息', '出国核心目的', '职业与能力背景', '教育背景', '语言能力',
      '经济情况', '家庭规划', '生活方式偏好', '城市与社会偏好', '价值观与未来规划'];

    this.querySelectorAll('[data-panel]').forEach((panel, i) => {
      panel.classList.toggle('is-active', i === this.step);
    });
    this.querySelector('[data-label]').textContent = `Step ${String(this.step + 1).padStart(2, '0')} / ${this.totalSteps}`;
    this.querySelector('[data-step-name]').textContent = steps[this.step];
    this.querySelectorAll('[data-dot]').forEach((d, i) => {
      d.classList.toggle('is-done', i < this.step);
      d.classList.toggle('is-active', i === this.step);
    });
    this.querySelector('.wizard__track-fill').style.width = `${(this.step / (this.totalSteps - 1)) * 100}%`;
    this.prevBtn.style.visibility = this.step === 0 ? 'hidden' : 'visible';
    this.nextBtn.style.display = this.step === this.totalSteps - 1 ? 'none' : 'inline-flex';
    this.restartBtn.style.display = 'none';
  }

  reset() {
    this.state = {
      name: '', age: '', gender: '', curCountry: '', curCity: '', marital: '', hasKids: '', familyMembers: '',
      reasons: [], priority1: '', priority2: '', priority3: '',
      career: '', position: '', years: '', industryExp: '', mgmtExp: '', techSkills: '',
      degree: '', major: '', gradCountry: '', gradYear: '', overseasStudy: '',
      languages: [], langLevel: '', learnNewLang: '',
      income: '', assets: '', investAbility: '', budget: '',
      travelType: '', childAge: '', eduNeed: '', parentsPlan: '',
      climates: [], weather: { cold: '', hot: '', humid: '', dry: '' },
      citySize: '', international: '', pace: '', safety: '',
      futurePlan: [], willing: []
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

  /* ================= 智能匹配引擎 ================= */

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

    s.reasons.forEach((r) => {
      if (r === 'education' || r === 'child-edu') addMany(byTag('study'), 2, '教育机会');
      if (r === 'income') addMany([...byTag('tech'), ...byTag('trade'), ...byTag('finance')], 2, '职业机会');
      if (r === 'permanent') addMany(byTag('pr'), 3, '永居政策');
      if (r === 'business' || r === 'startup') addMany([...byTag('invest'), ...byTag('trade')], 2, '商业环境');
      if (r === 'invest') addMany(byTag('invest'), 3, '投资环境');
      if (r === 'lifestyle') addMany([...byTag('pr'), ...byTag('nomad')], 1, '生活品质');
      if (r === 'medical') addMany(byTag('medical'), 3, '医疗资源');
      if (r === 'experience') addMany(byTag('nomad'), 2, '旅居体验');
    });

    const careerMap = {
      it: ['tech'], eng: ['tech'], finance: ['finance', 'invest'], medical: ['medical'],
      edu: ['study'], research: ['study', 'tech'], manufacture: ['trade'],
      trade: ['trade'], entrepreneur: ['invest'], freelancer: ['nomad', 'tech'], student: ['study']
    };
    (careerMap[s.career] || []).forEach((t) => addMany(byTag(t), 2, '职业匹配'));

    if (s.budget === 'vip') addMany(byTag('invest'), 2, '投资能力');
    if (s.budget === 'low') addMany([...byTag('nomad'), ...byTag('mid')], 1, '预算友好');

    if (s.travelType === 'kids' || s.travelType === 'whole') addMany([...byTag('family'), ...byTag('pr')], 2, '家庭环境');
    if (s.eduNeed && s.eduNeed !== 'none') addMany(byTag('study'), 2, '子女教育');
    if (s.parentsPlan === 'yes') addMany([...byTag('family'), ...byTag('pr')], 1, '家庭团聚');

    if (s.degree === 'master' || s.degree === 'phd') addMany([...byTag('tech'), ...byTag('pr')], 1, '高学历匹配');

    const langMap = { en: ['us', 'ca', 'gb', 'au', 'nz', 'ie', 'sg'], ja: ['jp'], de: ['de', 'at', 'ch'], fr: ['fr', 'be', 'ch'], es: ['es', 'mx', 'ar', 'cl'], other: [] };
    s.languages.forEach((l) => (langMap[l] || []).forEach((id) => add(id, 2, '语言优势')));

    s.climates.forEach((c) => addMany(byTag(c), 2, '气候适配'));
    const weatherTag = { cold: 'cold', hot: 'warm', humid: 'rain', dry: 'high' };
    Object.keys(s.weather).forEach((k) => {
      if (s.weather[k] === 'no') addMany(byTag(weatherTag[k]), -3, '气候不符');
    });

    if (s.citySize === 'big') addMany(byTag('big'), 2, '城市规模');
    if (s.citySize === 'small' || s.citySize === 'rural') addMany(byTag('mid'), 1, '生活节奏');
    if (s.safety === 'extreme') addMany(['sg', 'jp', 'ch', 'nz', 'au', 'ca', 'no', 'dk'], 1, '安全要求');

    const max = Math.max(...Object.values(score), 1);
    return Object.entries(score)
      .map(([id, v]) => ({ id, score: v, pct: Math.round((v / max) * 100), reasons: reasons[id].slice(0, 3) }))
      .sort((a, b) => b.score - a.score);
  }

  portrait() {
    const s = this.state;
    const labels = [];
    if (s.degree === 'phd' || s.degree === 'master') labels.push('高学历专业型');
    else if (s.degree === 'bachelor') labels.push('本科知识型');
    if (['it', 'eng', 'research'].includes(s.career)) labels.push('技术型人才');
    if (s.career === 'finance' || s.career === 'trade') labels.push('商业职业型');
    if (s.career === 'entrepreneur') labels.push('创业驱动型');
    if (s.career === 'student') labels.push('求学成长型');
    if (s.budget === 'vip' || s.budget === 'high') labels.push('高净值投资者');
    if (s.travelType === 'kids' || s.travelType === 'whole') labels.push('家庭规划型');
    if (s.reasons.includes('child-edu') || s.eduNeed !== 'none') labels.push('国际教育需求');
    if (s.reasons.includes('experience')) labels.push('人生体验探索');
    if (s.reasons.includes('medical')) labels.push('健康与医疗需求');
    if (s.age === '18-25') labels.push('青年起步期');
    if (s.learnNewLang === 'yes') labels.push('语言学习意愿强');
    return labels.length ? labels.slice(0, 5) : ['多元发展型'];
  }

  projectMatch(countryRank) {
    const s = this.state;
    const projects = Istra.projects || [];
    const cScore = {};
    countryRank.forEach((c, i) => { cScore[c.id] = (countryRank.length - i); });

    const purposeCat = { education: 'edu', 'child-edu': 'edu', income: 'work', permanent: 'pr', business: 'invest', startup: 'invest', invest: 'invest', lifestyle: 'pr', medical: 'work', experience: 'nomad' };

    const scored = projects.map((p) => {
      let v = (cScore[p.country.id] || 0) * 4;
      s.reasons.forEach((r) => { if (purposeCat[r] === p.category.id) v += 6; });
      if (p.category.id === 'tech' && ['it', 'eng', 'research'].includes(s.career)) v += 4;
      if (p.category.id === 'work' && ['it', 'eng', 'finance', 'trade', 'medical'].includes(s.career)) v += 3;
      if (p.category.id === 'study' && s.degree !== 'phd') v += 2;
      if (p.category.id === 'family' && (s.travelType === 'kids' || s.travelType === 'whole' || s.parentsPlan === 'yes')) v += 4;
      const budgetRank = { low: 0, mid: 1, high: 2, vip: 3 };
      const diff = Math.abs(budgetRank[p.budget] - budgetRank[s.budget]);
      v += diff === 0 ? 3 : (diff === 1 ? 1 : -4);
      return { project: p, score: v };
    }).sort((a, b) => b.score - a.score);

    const top = scored.slice(0, 3).map((x) => ({
      id: x.project.id,
      name: x.project.name,
      country: x.project.country,
      visaType: x.project.visaType,
      reason: this.projectReason(x.project)
    }));
    const bottom = scored.slice(-2).reverse().map((x) => ({
      id: x.project.id,
      name: x.project.name,
      country: x.project.country,
      reason: this.notReason(x.project)
    }));
    return { top, bottom };
  }

  projectReason(p) {
    const s = this.state;
    const purposeCat = { education: 'edu', 'child-edu': 'edu', income: 'work', permanent: 'pr', business: 'invest', startup: 'invest', invest: 'invest', lifestyle: 'pr', medical: 'work', experience: 'nomad' };
    const labels = { income: '获得更好的收入', education: '获得更好的教育', 'child-edu': '子女教育规划', permanent: '获得永久身份', business: '商业发展', startup: '创业机会', invest: '投资资产配置', lifestyle: '生活环境改善', medical: '医疗资源', experience: '探索人生体验' };
    const hits = s.reasons.filter((r) => purposeCat[r] === p.category.id);
    if (hits.length) return `匹配「${labels[hits[0]]}」目标`;
    const catLabel = { work: '职业发展', tech: '技术人才', edu: '教育规划', invest: '投资创业', talent: '人才引进', family: '家庭规划', pr: '长期身份', nomad: '旅居体验', youth: '青年交流', special: '特殊身份' }[p.category.id];
    return `符合「${catLabel}」方向`;
  }

  notReason(p) {
    const s = this.state;
    if (p.budget === 'vip' && s.budget !== 'vip') return '投资门槛较高，与当前预算不匹配';
    if (p.category.id === 'invest' && s.budget !== 'vip' && s.budget !== 'high') return '需要较大资金投入，超出当前预算范围';
    if (p.category.id === 'study' && (s.degree === 'phd' || s.years === '10+')) return '与当前职业阶段匹配度较低';
    if (p.category.id === 'youth' && s.age !== '18-25' && s.age !== '26-35') return '青年类项目有年龄限制，与当前年龄不匹配';
    if (p.category.id === 'family' && s.travelType === 'solo') return '当前为单人规划，家庭团聚类项目暂不匹配';
    if (p.category.id === 'tech' && !['it', 'eng', 'research'].includes(s.career)) return '技术类项目对专业背景要求较高';
    return '与该目标方向的匹配度较低';
  }

  roadmap(topCountry, topProject) {
    const c = Istra.countries.find((x) => x.id === topCountry) || { cn: '目标国家' };
    return [
      { phase: '第一阶段 · 准备期（0–6 个月）', items: ['评估并提升语言能力', '完成学历认证与资金规划', `深入了解${c.cn}政策与项目要求`] },
      { phase: '第二阶段 · 申请期（6–18 个月）', items: [`准备并递交${topProject ? topProject.name : '目标项目'}申请`, '同步推进家庭材料与背景审查', '保持职业与资金状态稳定'] },
      { phase: '第三阶段 · 落地期（18 个月后）', items: [`抵达${c.cn}并完成居留登记`, '按项目要求完成语言/投资/就业条件', '规划长期身份与家庭团聚路径'] }
    ];
  }

  startAnalysis() {
    this.phase = 'analyzing';
    const steps = ['正在构建用户画像…', '正在匹配目标国家…', '正在匹配全球项目…', '正在生成个性化路线…'];
    this.innerHTML = `
      <div class="assessment">
        <header class="assessment__head">
          <div class="container">
            <p class="assessment__eyebrow" data-reveal>AI Global Assessment Center</p>
            <h1 class="assessment__title" data-reveal>全球身份规划深度评估中心</h1>
          </div>
        </header>
        <div class="assessment__body">
          <div class="container">
            <div class="analyzing" data-reveal>
              <div class="analyzing__ring" aria-hidden="true"><span></span></div>
              <h2 class="analyzing__title">正在生成您的分析报告</h2>
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

  showReport() {
    this.phase = 'report';
    const countryRank = this.scoreCountries();
    const topCountries = countryRank.slice(0, 5);
    const match = this.projectMatch(countryRank);
    const topCountry = topCountries[0] ? topCountries[0].id : 'ca';
    const topProject = match.top[0];
    const roadmap = this.roadmap(topCountry, topProject);
    const portrait = this.portrait();
    const s = this.state;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    this.innerHTML = `
      <div class="assessment">
        <header class="assessment__head">
          <div class="container">
            <p class="assessment__eyebrow" data-reveal>AI Global Assessment Center</p>
            <h1 class="assessment__title" data-reveal>全球身份规划深度评估中心</h1>
          </div>
        </header>

        <div class="assessment__body">
          <div class="container report">
            <div class="report__cover" data-reveal>
              <p class="report__cover-eyebrow">Global Identity Planning Report</p>
              <h2 class="report__cover-title">全球身份规划分析报告</h2>
              <p class="report__cover-meta">${s.name || '评估用户'} · ${dateStr} · 基于全球项目数据库智能匹配</p>
            </div>

            <section class="report__section" data-reveal>
              <h3 class="report__section-title"><span>01</span>用户画像</h3>
              <div class="report__portrait">
                ${portrait.map((l) => `<span class="report__tag">${l}</span>`).join('')}
              </div>
              <p class="report__summary">综合您的职业、学历、家庭与预算情况，评估建议以「${portrait[0]}」视角规划国际发展路线。</p>
            </section>

            <section class="report__section" data-reveal>
              <h3 class="report__section-title"><span>02</span>国家匹配排名</h3>
              <div class="report__rank">
                ${topCountries.map((c, i) => {
                  const country = Istra.countries.find((x) => x.id === c.id) || {};
                  return `
                    <div class="report__rank-row">
                      <span class="report__rank-no">${i + 1}</span>
                      <img class="report__rank-flag" src="assets/flags/${country.flag || ''}" alt="" width="34" height="25" />
                      <div class="report__rank-info">
                        <p class="report__rank-name">${country.cn || c.id}</p>
                        <p class="report__rank-reason">${(c.reasons || []).join(' · ') || '综合匹配'}</p>
                      </div>
                      <div class="report__rank-bar"><span style="width:${Math.max(c.pct, 8)}%"></span></div>
                      <span class="report__rank-pct">${c.pct}%</span>
                    </div>`;
                }).join('')}
              </div>
            </section>

            <section class="report__section" data-reveal>
              <h3 class="report__section-title"><span>03</span>推荐项目</h3>
              <div class="report__list">
                ${match.top.map((p) => `
                  <a class="report__project" href="project-detail.html?id=${p.id}">
                    <img src="assets/flags/${p.country.flag}" alt="" width="34" height="25" />
                    <div class="report__project-info">
                      <p class="report__project-name">${p.name}</p>
                      <p class="report__project-reason">${p.reason}</p>
                    </div>
                    <span class="report__project-cta">查看详情 →</span>
                  </a>`).join('')}
              </div>
            </section>

            <section class="report__section" data-reveal>
              <h3 class="report__section-title"><span>04</span>不推荐项目</h3>
              <div class="report__list">
                ${match.bottom.map((p) => `
                  <div class="report__project report__project--muted">
                    <img src="assets/flags/${p.country.flag}" alt="" width="34" height="25" />
                    <div class="report__project-info">
                      <p class="report__project-name">${p.name}</p>
                      <p class="report__project-reason">${p.reason}</p>
                    </div>
                  </div>`).join('')}
              </div>
            </section>

            <section class="report__section" data-reveal>
              <h3 class="report__section-title"><span>05</span>个性化路线 · 未来 3 年规划</h3>
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

            <div class="report__actions" data-reveal>
              <button type="button" class="btn btn--primary" data-action="restart">重新评估</button>
              <a class="btn btn--ghost-dark" href="projects.html">浏览全部项目</a>
            </div>
            <p class="report__note">* 本报告由智能匹配引擎基于您填写的信息与项目数据库生成，供规划参考；具体政策、费用与周期以各国官方最新公布为准。AI 引擎将在后续阶段接入更多模型。</p>
          </div>
        </div>
      </div>
    `;
    this.querySelector('[data-action="restart"]').addEventListener('click', () => this.reset());
    Istra.reveal.observe(this);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

customElements.define('is-ai-assessment', SiteAiAssessment);

