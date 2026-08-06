/* ============================================================
   组件：is-ai-assessment · 全球人生路径规划评估中心（v8）
   12 阶段智能对话式问卷 → 先理解用户 → 再匹配项目
   生成《全球人生路径规划报告》
   ============================================================ */

class SiteAiAssessment extends HTMLElement {
  constructor() {
    super();
    this.step = 0;
    this.phase = 'form';
    this.totalSteps = 12;
    this.state = {
      age: '', gender: '', curCountry: '', curCity: '', identity: '', situation: '',
      motives: [], priority1: '', priority2: '', priority3: '',
      occupation: '', industry: '', experience: '', skills: '',
      degree: '', major: '', school: '', overseas: '',
      languages: '', englishLevel: '', otherLangs: '', learnNewLang: '',
      income: '', funds: '', futureFunds: '', loanWilling: '', workDevelop: '', lowCost: '',
      marital: '', kids: '', planWith: [], familyNeeds: '',
      climates: [], climateNo: '', cityPref: '', pace: '',
      adapt: { lang: '', culture: '', integrate: '', lifestyle: '' }, adaptScore: '',
      risk: '', prepareYears: '',
      targetCountry: '', vision: ''
    };
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
      <p class="wizard__panel-q">Q${no}<span>/ 12</span></p>
      <h2 class="wizard__panel-title">${title}</h2>
      <p class="wizard__panel-desc">${desc}</p>`;
  }

  /* ================= 12 个阶段 ================= */

  stepPanel(i) {
    const countries = Istra.countries || [];
    const countryOptions = countries.map((c) => `<option value="${c.id}">${c.cn}</option>`).join('');

    switch (i) {
      case 0:
        return `
          ${this.question('01', '先认识您——您目前处于人生的哪个阶段？', '选择为主，补充填写为辅。')}
          <div class="field-grid">
            ${this.chips('年龄', [
              { id: 'u18', label: '18 岁以下' }, { id: '18-22', label: '18–22 岁' },
              { id: '23-30', label: '23–30 岁' }, { id: '31-40', label: '31–40 岁' },
              { id: '41-50', label: '41–50 岁' }, { id: '50+', label: '50 岁以上' }
            ], 'age', false)}
            ${this.chips('性别（可选）', [{ id: 'male', label: '男' }, { id: 'female', label: '女' }, { id: 'other', label: '其他' }], 'gender', false)}
            ${this.selects('curCountry', '当前所在地 · 国家', [{ value: 'cn', label: '中国' }, { value: 'other', label: '其他国家' }])}
            ${this.text('curCity', '当前所在地 · 城市')}
            ${this.chips('当前身份', [
              { id: 'student', label: '学生' }, { id: 'worker', label: '工作人士' },
              { id: 'entrepreneur', label: '创业者' }, { id: 'business', label: '企业经营者' },
              { id: 'freelancer', label: '自由职业' }, { id: 'none', label: '暂无职业' },
              { id: 'retired', label: '退休' }
            ], 'identity', false)}
            ${this.textarea('situation', '你的目前情况（选填）', '例如：刚毕业 / 考虑换赛道 / 孩子准备升学…')}
          </div>`;

      case 1:
        return `
          ${this.question('02', '为什么考虑国际发展？', '可多选，并请排列前三个最重要目标。')}
          ${this.chips('核心动机（多选）', [
            { id: 'work', label: '寻找更好的工作机会' }, { id: 'income', label: '提升收入' },
            { id: 'lifestyle', label: '改变生活环境' }, { id: 'child-edu', label: '子女教育' },
            { id: 'permanent', label: '获得长期身份' }, { id: 'business', label: '商业发展' },
            { id: 'startup', label: '创业' }, { id: 'invest', label: '投资' },
            { id: 'culture', label: '体验不同文化' }, { id: 'family', label: '家庭规划' },
            { id: 'explore', label: '暂时探索' }
          ], 'motives')}
          <div class="field-grid">
            ${this.selects('priority1', '第一重要目标', this.priorityOptions())}
            ${this.selects('priority2', '第二重要目标', this.priorityOptions())}
            ${this.selects('priority3', '第三重要目标', this.priorityOptions())}
          </div>`;

      case 2:
        return `
          ${this.question('03', '您的职业与能力画像？', '帮助 AI 理解您能做什么、擅长什么。')}
          <div class="field-grid">
            ${this.text('occupation', '当前职业', '自由填写，如：软件工程师 / 教师 / 自由设计师')}
            ${this.chips('所属行业', [
              { id: 'tech', label: '科技' }, { id: 'finance', label: '金融' }, { id: 'edu', label: '教育' },
              { id: 'medical', label: '医疗' }, { id: 'manufacture', label: '制造' }, { id: 'trade', label: '贸易' },
              { id: 'service', label: '服务业' }, { id: 'art', label: '艺术' }, { id: 'internet', label: '互联网' },
              { id: 'other', label: '其他' }
            ], 'industry', false)}
            ${this.chips('工作经验', [
              { id: 'none', label: '无' }, { id: '1y-', label: '1 年以内' },
              { id: '1-3', label: '1–3 年' }, { id: '3-5', label: '3–5 年' }, { id: '5y+', label: '5 年以上' }
            ], 'experience', false)}
            ${this.textarea('skills', '核心技能（选填）', '如：编程 / 销售 / 管理 / 设计 / 机械 / 语言…')}
          </div>`;

      case 3:
        return `
          ${this.question('04', '您的教育背景？', '学历与专业影响留学、工作与长期身份的匹配。')}
          <div class="field-grid">
            ${this.chips('最高学历', [
              { id: 'below-high', label: '高中以下' }, { id: 'high', label: '高中' },
              { id: 'college', label: '大专' }, { id: 'bachelor', label: '本科' },
              { id: 'master', label: '硕士' }, { id: 'phd', label: '博士' }
            ], 'degree', false)}
            ${this.text('major', '专业（选填）', '如：计算机 / 金融 / 医学')}
            ${this.text('school', '学校背景（选填）', '自由填写')}
            ${this.chips('是否有海外经历', [{ id: 'yes', label: '有' }, { id: 'no', label: '无' }], 'overseas', false)}
          </div>`;

      case 4:
        return `
          ${this.question('05', '您的语言能力？', '语言是通往世界的桥梁，也是匹配的关键维度。')}
          <div class="field-grid">
            ${this.text('languages', '掌握的语言（选填）', '如：中文 / 英语 / 日语…')}
            ${this.chips('英语水平', [
              { id: 'none', label: '不会' }, { id: 'basic', label: '基础' },
              { id: 'daily', label: '交流' }, { id: 'skilled', label: '熟练' }, { id: 'fluent', label: '流利' }
            ], 'englishLevel', false)}
            ${this.text('otherLangs', '其他语言（选填）', '如：日语 / 德语 / 法语…')}
            ${this.chips('是否愿意学习新语言', [{ id: 'yes', label: '是' }, { id: 'no', label: '否' }], 'learnNewLang', false)}
          </div>`;

      case 5:
        return `
          ${this.question('06', '您的经济与资源情况？', '用于判断哪类路径更适合您，不代表任何资格审核。')}
          <div class="field-grid">
            ${this.chips('月收入', [
              { id: 'none', label: '无收入' }, { id: '1w-', label: '1 万元以下' },
              { id: '1-3w', label: '1–3 万元' }, { id: '3-5w', label: '3–5 万元' },
              { id: '5-10w', label: '5–10 万元' }, { id: '10w+', label: '10 万元以上' }
            ], 'income', false)}
            ${this.chips('当前资金准备', [
              { id: '1w-', label: '1 万元以下' }, { id: '1-5w', label: '1–5 万元' },
              { id: '5-10w', label: '5–10 万元' }, { id: '10-50w', label: '10–50 万元' },
              { id: '50-100w', label: '50–100 万元' }, { id: '100w+', label: '100 万元以上' }
            ], 'funds', false)}
            ${this.selects('budget', '可接受投入', [
              { value: '<1w', label: '1 万元以内' }, { value: '1-5w', label: '1–5 万元' },
              { value: '5-10w', label: '5–10 万元' }, { value: '10-50w', label: '10–50 万元' },
              { value: 'high', label: '50 万元以上' }
            ])}
            ${this.radioRow('是否愿意贷款', 'loanWilling', [{ value: 'yes', label: '愿意' }, { value: 'no', label: '不愿意' }])}
            ${this.radioRow('是否接受边工作边发展', 'workDevelop', [{ value: 'yes', label: '可以接受' }, { value: 'no', label: '不太接受' }])}
            ${this.radioRow('是否优先低成本路线', 'lowCost', [{ value: 'yes', label: '是' }, { value: 'no', label: '否' }])}
            ${this.text('futureFunds', '未来 3 年预计可投入（选填）', '如：30 万 / 100 万 / 暂不确定')}
          </div>`;

      case 6:
        return `
          ${this.question('07', '家庭因素？', '家庭是人生规划的重要部分。')}
          <div class="field-grid">
            ${this.chips('婚姻状态', [{ id: 'single', label: '单身' }, { id: 'married', label: '已婚' }, { id: 'other', label: '其他' }], 'marital', false)}
            ${this.chips('子女情况', [{ id: 'yes', label: '有子女' }, { id: 'no', label: '无子女' }], 'kids', false)}
            ${this.chips('考虑与谁共同规划（可多选）', [
              { id: 'parents', label: '父母' }, { id: 'partner', label: '伴侣' },
              { id: 'children', label: '子女' }, { id: 'whole', label: '共同规划' }
            ], 'planWith')}
            ${this.textarea('familyNeeds', '家庭需求（选填）', '如：希望子女接受国际教育 / 照顾父母…')}
          </div>`;

      case 7:
        return `
          ${this.question('08', '您喜欢怎样的生活方式？', '长期幸福感取决于生活方式的适配。')}
          <div class="field-grid">
            ${this.chips('气候偏好（多选）', [
              { id: 'warm', label: '温暖' }, { id: 'cold', label: '寒冷' },
              { id: 'four', label: '四季分明' }, { id: 'sunny', label: '阳光充足' },
              { id: 'humid', label: '湿润' }, { id: 'dry', label: '干燥' },
              { id: 'ocean', label: '海边' }, { id: 'any', label: '无要求' }
            ], 'climates')}
            ${this.text('climateNo', '不能接受的气候（选填）', '如：严寒 / 酷热 / 潮湿…')}
            ${this.chips('城市偏好', [
              { id: 'metro', label: '国际大都市' }, { id: 'city', label: '普通城市' },
              { id: 'small', label: '小城市' }, { id: 'nature', label: '自然环境优先' }
            ], 'cityPref', false)}
            ${this.chips('生活节奏', [{ id: 'fast', label: '快节奏' }, { id: 'balance', label: '平衡' }, { id: 'slow', label: '慢生活' }], 'pace', false)}
          </div>`;

      case 8:
        return `
          ${this.question('09', '您的文化适应能力？', '融入意愿越高，长期发展的选择空间越大。')}
          <div class="field-grid">
            ${this.radioRow('是否愿意学习当地语言', 'adapt-lang', [{ value: 'yes', label: '愿意' }, { value: 'no', label: '不太愿意' }])}
            ${this.radioRow('是否愿意接受不同文化', 'adapt-culture', [{ value: 'yes', label: '愿意' }, { value: 'no', label: '不太愿意' }])}
            ${this.radioRow('是否愿意长期融入当地社会', 'adapt-integrate', [{ value: 'yes', label: '愿意' }, { value: 'no', label: '不太愿意' }])}
            ${this.radioRow('是否愿意改变生活方式', 'adapt-lifestyle', [{ value: 'yes', label: '愿意' }, { value: 'no', label: '不太愿意' }])}
            ${this.selects('adaptScore', '整体适应能力自评（1–10 分）', [
              { value: '1', label: '1 分' }, { value: '2', label: '2 分' }, { value: '3', label: '3 分' },
              { value: '4', label: '4 分' }, { value: '5', label: '5 分' }, { value: '6', label: '6 分' },
              { value: '7', label: '7 分' }, { value: '8', label: '8 分' }, { value: '9', label: '9 分' },
              { value: '10', label: '10 分' }
            ])}
          </div>`;

      case 9:
        return `
          ${this.question('10', '您的风险偏好？', '不同的选择节奏，对应不同的国际发展路径。')}
          <div class="field-grid">
            ${this.chips('更倾向的路线', [
              { id: 'stable', label: '稳定路线' }, { id: 'balance', label: '平衡发展' },
              { id: 'high', label: '高机会路线' }
            ], 'risk', false)}
            ${this.text('prepareYears', '愿意投入几年准备？（选填）', '如：1 年 / 3 年 / 5 年')}
          </div>`;

      case 10:
        return `
          ${this.question('11', '是否有目标国家？', '如果有请填写；如果没有，AI 将根据您的答案自动推荐。')}
          <div class="field-grid">
            ${this.text('targetCountry', '目标国家（选填）', '如：加拿大 / 日本 / 欧洲 / 美国…')}
          </div>`;

      case 11:
        return `
          ${this.question('12', '最后一个问题——你希望未来 5-10 年的生活是什么样？', '请自由描述，AI 将据此完善您的长期路线。')}
          ${this.textarea('vision', '未来 5–10 年的生活', '例如：希望孩子在国际学校上学，自己在稳定的环境中继续做技术工作，周末可以海边生活…')}
          <div class="wizard__panel-cta">
            <button type="button" class="btn btn--primary" data-action="generate">生成人生路径报告 <span class="btn-arrow">→</span></button>
          </div>`;
    }
  }

  priorityOptions() {
    return [
      { value: 'work', label: '寻找更好的工作机会' }, { value: 'income', label: '提升收入' },
      { value: 'lifestyle', label: '改变生活环境' }, { value: 'child-edu', label: '子女教育' },
      { value: 'permanent', label: '获得长期身份' }, { value: 'business', label: '商业发展' },
      { value: 'startup', label: '创业' }, { value: 'invest', label: '投资' },
      { value: 'culture', label: '体验不同文化' }, { value: 'family', label: '家庭规划' },
      { value: 'explore', label: '暂时探索' }
    ];
  }
  /* ================= 渲染 ================= */

  render() {
    const steps = [
      '个人基本画像', '出国核心动机', '职业与能力画像', '教育背景', '语言能力',
      '经济与资源情况', '家庭因素', '生活方式偏好', '文化适应能力', '风险偏好',
      '国家偏好', '未来愿景'
    ];

    this.innerHTML = `
      <div class="assessment">
        <header class="assessment__head">
          <div class="container">
            <p class="assessment__eyebrow" data-reveal>AI Life Path Planning System</p>
            <h1 class="assessment__title" data-reveal>全球人生路径规划评估中心</h1>
            <p class="assessment__sub" data-reveal>覆盖所有人群的 12 阶段智能对话式评估 · 先理解您，再匹配项目，生成《全球人生路径规划报告》</p>
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
        const target = key.startsWith('adapt-') ? this.state.adapt : this.state;
        target[key.replace('adapt-', '')] = chip.dataset.value;
        this.querySelectorAll(`[data-radio="${key}"]`).forEach((c) => {
          c.classList.toggle('is-selected', c === chip);
          c.setAttribute('aria-pressed', String(c === chip));
        });
        this.clearInvalid(key);
      });
    });

    this.prevBtn.addEventListener('click', () => this.goTo(this.step - 1));
    this.nextBtn.addEventListener('click', () => {
      if (!this.validate(this.step)) return;
      this.goTo(this.step + 1);
    });
    this.restartBtn.addEventListener('click', () => this.reset());

    this.querySelector('[data-action="generate"]').addEventListener('click', () => {
      if (!this.validate(11)) return;
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
        check('age', !!this.state.age);
        check('curCountry', !!this.state.curCountry);
        check('curCity', this.state.curCity.trim().length > 0);
        check('identity', !!this.state.identity);
        break;
      case 1:
        check('motives', this.state.motives.length > 0);
        check('priority1', !!this.state.priority1);
        break;
      case 2:
        check('industry', !!this.state.industry);
        check('experience', !!this.state.experience);
        break;
      case 3:
        check('degree', !!this.state.degree);
        check('overseas', !!this.state.overseas);
        break;
      case 4:
        check('englishLevel', !!this.state.englishLevel);
        check('learnNewLang', !!this.state.learnNewLang);
        break;
      case 5:
        check('income', !!this.state.income);
        check('funds', !!this.state.funds);
        check('budget', !!this.state.budget);
        check('loanWilling', !!this.state.loanWilling);
        check('workDevelop', !!this.state.workDevelop);
        check('lowCost', !!this.state.lowCost);
        break;
      case 6:
        check('marital', !!this.state.marital);
        check('kids', !!this.state.kids);
        break;
      case 7:
        check('climates', this.state.climates.length > 0);
        check('cityPref', !!this.state.cityPref);
        check('pace', !!this.state.pace);
        break;
      case 8:
        ['adapt-lang', 'adapt-culture', 'adapt-integrate', 'adapt-lifestyle'].forEach((k) => check(k, !!this.state.adapt[k.replace('adapt-', '')]));
        check('adaptScore', !!this.state.adaptScore);
        break;
      case 9:
        check('risk', !!this.state.risk);
        break;
      case 11:
        check('vision', this.state.vision.trim().length > 0);
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
    const steps = [
      '个人基本画像', '出国核心动机', '职业与能力画像', '教育背景', '语言能力',
      '经济与资源情况', '家庭因素', '生活方式偏好', '文化适应能力', '风险偏好',
      '国家偏好', '未来愿景'
    ];

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
      age: '', gender: '', curCountry: '', curCity: '', identity: '', situation: '',
      motives: [], priority1: '', priority2: '', priority3: '',
      occupation: '', industry: '', experience: '', skills: '',
      degree: '', major: '', school: '', overseas: '',
      languages: '', englishLevel: '', otherLangs: '', learnNewLang: '',
      income: '', funds: '', futureFunds: '',
      marital: '', kids: '', planWith: [], familyNeeds: '',
      climates: [], climateNo: '', cityPref: '', pace: '',
      adapt: { lang: '', culture: '', integrate: '', lifestyle: '' }, adaptScore: '',
      risk: '', prepareYears: '',
      targetCountry: '', vision: ''
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
  /* ================= 智能匹配引擎（先理解用户，再匹配项目） ================= */

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

  budgetTier() {
    const b = this.state.budget;
    if (b === '<1w' || b === '1-5w') return 'low';
    if (b === '5-10w') return 'midlow';
    if (b === '10-50w') return 'mid';
    return 'high';
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

    /* 动机 */
    s.motives.forEach((r) => {
      if (r === 'work' || r === 'income') addMany([...byTag('tech'), ...byTag('trade'), ...byTag('finance')], 2, '职业机会');
      if (r === 'lifestyle') addMany([...byTag('pr'), ...byTag('nomad')], 1, '生活品质');
      if (r === 'child-edu' || r === 'family') addMany([...byTag('study'), ...byTag('family')], 2, '家庭与教育');
      if (r === 'permanent') addMany(byTag('pr'), 3, '长期身份');
      if (r === 'business' || r === 'startup') addMany([...byTag('invest'), ...byTag('trade')], 2, '商业环境');
      if (r === 'invest') addMany(byTag('invest'), 3, '投资环境');
      if (r === 'culture' || r === 'explore') addMany(byTag('nomad'), 2, '体验与探索');
    });

    /* 身份 */
    const identityMap = {
      student: ['study', 'youth'], worker: ['work', 'tech'], entrepreneur: ['invest'],
      business: ['invest', 'trade'], freelancer: ['nomad', 'tech'], none: ['study', 'nomad'],
      retired: ['pr', 'lifestyle']
    };
    (identityMap[s.identity] || []).forEach((t) => {
      if (t === 'work') addMany(byTag('tech'), 2, '职业发展');
      else if (t === 'lifestyle') addMany([...byTag('pr'), ...byTag('nomad')], 1, '生活品质');
      else addMany(byTag(t), 2, '身份匹配');
    });

    /* 年龄 */
    const ageMap = { u18: ['study'], '18-22': ['study', 'youth'], '23-30': ['tech', 'study', 'nomad'], '31-40': ['tech', 'pr'], '41-50': ['pr', 'invest'], '50+': ['pr', 'invest'] };
    (ageMap[s.age] || []).forEach((t) => addMany(byTag(t), 1, '年龄阶段'));

    /* 行业 */
    const industryMap = { tech: ['tech'], internet: ['tech'], finance: ['finance', 'invest'], medical: ['medical'], edu: ['study'], manufacture: ['trade'], trade: ['trade'], service: ['trade'], art: ['nomad'], other: [] };
    (industryMap[s.industry] || []).forEach((t) => addMany(byTag(t), 2, '行业匹配'));

    /* 学历 */
    if (s.degree === 'master' || s.degree === 'phd') addMany([...byTag('tech'), ...byTag('pr')], 1, '高学历匹配');
    if (s.degree === 'bachelor') addMany(byTag('study'), 1, '教育背景');

    /* 英语 */
    if (s.englishLevel === 'fluent' || s.englishLevel === 'skilled') addMany(['us', 'ca', 'gb', 'au', 'nz', 'ie', 'sg'], 2, '语言优势');
    else if (s.englishLevel === 'daily') addMany(['us', 'ca', 'gb', 'au', 'nz', 'ie', 'sg'], 1, '语言基础');
    if (s.otherLangs) {
      const langMatch = [
        { k: '日', ids: ['jp'] }, { k: '德', ids: ['de', 'at', 'ch'] },
        { k: '法', ids: ['fr', 'be', 'ch'] }, { k: '西', ids: ['es', 'mx', 'ar', 'cl'] },
        { k: '韩', ids: ['kr'] }
      ];
      langMatch.forEach((m) => { if (s.otherLangs.includes(m.k)) m.ids.forEach((id) => add(id, 2, '语言优势')); });
    }

    /* 经济 */
    const tier = this.budgetTier();
    if (tier === 'high') addMany(byTag('invest'), 2, '资金实力');
    if (tier === 'low' || tier === 'midlow') addMany([...byTag('nomad'), ...byTag('mid')], 1, '预算友好');
    if (s.lowCost === 'yes') addMany([...byTag('nomad'), ...byTag('mid'), ...byTag('study')], 1, '低成本优先');
    if (s.loanWilling === 'yes') addMany([...byTag('tech'), ...byTag('trade'), ...byTag('study')], 1, '可接受贷款');
    if (s.workDevelop === 'yes') addMany([...byTag('tech'), ...byTag('nomad')], 1, '边工作边发展');

    /* 家庭 */
    if (s.marital === 'married' || s.planWith.length > 0) addMany([...byTag('family'), ...byTag('pr')], 2, '家庭规划');
    if (s.kids === 'yes') addMany([...byTag('study'), ...byTag('family'), ...byTag('pr')], 2, '子女教育');
    if (s.planWith.includes('parents')) addMany([...byTag('family'), ...byTag('pr')], 1, '父母团聚');

    /* 气候 */
    const climateTag = { warm: 'warm', cold: 'cold', four: 'four', sunny: 'warm', humid: 'rain', dry: 'high', ocean: 'ocean', any: '' };
    s.climates.forEach((c) => { const t = climateTag[c]; if (t) addMany(byTag(t), 2, '气候适配'); });
    if (s.climateNo) {
      const dislike = [
        { k: '冷', t: 'cold' }, { k: '寒', t: 'cold' }, { k: '热', t: 'warm' },
        { k: '暖', t: 'warm' }, { k: '湿', t: 'rain' }, { k: '干', t: 'high' }
      ];
      dislike.forEach((d) => { if (s.climateNo.includes(d.k)) addMany(byTag(d.t), -3, '气候不符'); });
    }

    /* 城市与节奏 */
    if (s.cityPref === 'metro') addMany(byTag('big'), 2, '城市规模');
    if (s.cityPref === 'small' || s.cityPref === 'nature') addMany(byTag('mid'), 1, '生活节奏');
    if (s.pace === 'slow') addMany([...byTag('mid'), ...byTag('nomad')], 1, '慢生活');

    /* 文化适应 */
    const adapt = s.adapt;
    const adaptYes = [adapt.lang, adapt.culture, adapt.integrate, adapt.lifestyle].filter((v) => v === 'yes').length;
    if (adapt.integrate === 'yes' || Number(s.adaptScore || 0) >= 7) addMany(byTag('pr'), 1, '融入意愿');
    if (adapt.culture === 'yes') addMany([...byTag('nomad'), ...byTag('youth')], 1, '文化适应');
    if (adaptYes <= 1 && Number(s.adaptScore || 0) <= 3) addMany(byTag('pr'), -1, '融入门槛');

    /* 风险偏好 */
    if (s.risk === 'stable') addMany([...byTag('pr'), ...byTag('work')], 1, '稳健路线');
    if (s.risk === 'high') addMany([...byTag('invest'), ...byTag('startup')], 1, '机会导向');

    /* 目标国家 */
    if (s.targetCountry) {
      (Istra.countries || []).forEach((c) => {
        const hit = s.targetCountry.includes(c.cn) || s.targetCountry.includes(c.en) ||
          (c.cn === '英国' && s.targetCountry.includes('英')) ||
          (c.cn === '德国' && s.targetCountry.includes('德')) ||
          (c.cn === '法国' && s.targetCountry.includes('法')) ||
          (c.cn === '日本' && s.targetCountry.includes('日')) ||
          (c.cn === '韩国' && s.targetCountry.includes('韩')) ||
          (c.cn === '新加坡' && s.targetCountry.includes('新加坡')) ||
          (c.cn === '澳大利亚' && s.targetCountry.includes('澳')) ||
          (c.cn === '加拿大' && s.targetCountry.includes('加')) ||
          (c.cn === '美国' && s.targetCountry.includes('美')) ||
          (c.en && s.targetCountry.toLowerCase().includes(c.en.toLowerCase()));
        if (hit) add(c.id, 10, '目标国家');
      });
      if (s.targetCountry.includes('欧洲')) {
        (Istra.countries || []).filter((c) => c.region === 'EUROPE').forEach((c) => add(c.id, 4, '目标地区'));
      }
    }

    const max = Math.max(...Object.values(score), 1);
    return Object.entries(score)
      .map(([id, v]) => ({ id, score: v, pct: Math.round((v / max) * 100), reasons: reasons[id].slice(0, 3) }))
      .sort((a, b) => b.score - a.score);
  }

  portrait() {
    const s = this.state;
    const ageLabel = { u18: '青少年', '18-22': '青年', '23-30': '年轻', '31-40': '中坚', '41-50': '成熟', '50+': '资深' }[s.age] || '';
    const identityLabel = {
      student: '求学成长', worker: '职业发展', entrepreneur: '创业探索', business: '企业经营',
      freelancer: '自由发展', none: '转型探索', retired: '人生新阶段'
    }[s.identity] || '';
    const labels = [];
    let main = `${ageLabel}${identityLabel}型`;
    if (!main || main === '型') main = '多元发展型';
    labels.push(main);
    if (s.industry === 'tech' || s.industry === 'internet') labels.push('技术发展型');
    if (s.motives.includes('child-edu') || s.kids === 'yes') labels.push('家庭教育规划型');
    if (s.motives.includes('invest') || this.budgetTier() === 'high') labels.push('高净值投资布局型');
    if (s.lowCost === 'yes') labels.push('低成本偏好');
    if (s.motives.includes('startup') || s.identity === 'entrepreneur') labels.push('创业探索型');
    if (s.motives.includes('culture') || s.motives.includes('explore')) labels.push('体验探索型');
    if (s.pace === 'slow' || s.cityPref === 'nature') labels.push('慢生活宜居型');
    if (s.degree === 'master' || s.degree === 'phd') labels.push('高学历背景');
    if (s.risk === 'stable') labels.push('稳健偏好');
    if (s.risk === 'high') labels.push('机会导向');
    const uniq = [...new Set(labels)];
    return uniq.slice(0, 5);
  }

  projectMatch(countryRank) {
    const s = this.state;
    const projects = Istra.projects || [];
    const cScore = {};
    countryRank.forEach((c, i) => { cScore[c.id] = (countryRank.length - i); });

    const motiveCat = { work: 'work', income: 'work', lifestyle: 'pr', 'child-edu': 'edu', permanent: 'pr', business: 'invest', startup: 'invest', invest: 'invest', culture: 'nomad', family: 'family', explore: 'nomad' };

    const scored = projects.map((p) => {
      let v = (cScore[p.country.id] || 0) * 4;
      s.motives.forEach((r) => { if (motiveCat[r] === p.category.id) v += 6; });
      if (p.category.id === 'tech' && ['tech', 'internet'].includes(s.industry)) v += 4;
      if (p.category.id === 'work' && ['tech', 'finance', 'medical', 'trade', 'service', 'manufacture'].includes(s.industry)) v += 3;
      if (p.category.id === 'study' && ['student', 'none'].includes(s.identity)) v += 4;
      if (p.category.id === 'invest' && this.budgetTier() === 'high') v += 5;
      if (p.category.id === 'pr' && ['stable', 'balance'].includes(s.risk)) v += 2;
      if (p.category.id === 'youth' && ['u18', '18-22', '23-30'].includes(s.age)) v += 3;
      if (p.category.id === 'family' && (s.kids === 'yes' || s.planWith.length > 0)) v += 4;
      const budgetRank = { low: 0, midlow: 1, mid: 2, high: 3 };
      const diff = Math.abs(budgetRank[p.budget] - budgetRank[this.budgetTier()]);
      v += diff === 0 ? 3 : (diff === 1 ? 1 : -4);
      return { project: p, score: v };
    }).sort((a, b) => b.score - a.score);

    const dirLabel = { work: '工作类', tech: '技术人才类', edu: '留学类', invest: '投资创业类', talent: '人才移民类', family: '家庭类', pr: '永居类', nomad: '数字游民类', youth: '青年交流类', special: '特殊人才类' };
    const top = scored.slice(0, 3).map((x) => ({
      id: x.project.id,
      name: x.project.name,
      country: x.project.country,
      visaType: x.project.visaType,
      direction: dirLabel[x.project.category.id] || x.project.category.name,
      reason: this.projectReason(x.project)
    }));
    return { top, dirLabel };
  }

  projectReason(p) {
    const s = this.state;
    const motiveCat = { work: 'work', income: 'work', lifestyle: 'pr', 'child-edu': 'edu', permanent: 'pr', business: 'invest', startup: 'invest', invest: 'invest', culture: 'nomad', family: 'family', explore: 'nomad' };
    const labels = { work: '寻找更好的工作机会', income: '提升收入', lifestyle: '改变生活环境', 'child-edu': '子女教育', permanent: '获得长期身份', business: '商业发展', startup: '创业', invest: '投资', culture: '体验不同文化', family: '家庭规划', explore: '暂时探索' };
    const hits = s.motives.filter((r) => motiveCat[r] === p.category.id);
    if (hits.length) return `匹配「${labels[hits[0]]}」目标`;
    const catLabel = { work: '职业发展', tech: '技术人才', edu: '教育规划', invest: '投资创业', talent: '人才引进', family: '家庭规划', pr: '长期身份', nomad: '旅居体验', youth: '青年交流', special: '特殊人才' }[p.category.id];
    return `符合「${catLabel}」方向`;
  }

  notRecommendedDirections() {
    const s = this.state;
    const out = [];
    const tier = this.budgetTier();
    const push = (title, reason) => out.push({ title, reason });

    if (tier === 'low' || tier === 'midlow') {
      push('投资创业类', '投资类项目通常需要较高资金门槛，与您当前资金准备差距较大，暂不建议优先考虑。');
    }
    if (s.age === 'u18' || s.age === '18-22') {
      push('投资移民类', '投资移民项目对资金来源与经营管理要求较高，更适合职业与学业积累后的阶段。');
    }
    if (s.age === '50+') {
      push('青年交流 / 工作假期类', '此类项目面向青年群体，有明确年龄限制，与您当前年龄阶段不匹配。');
    }
    if (s.englishLevel === 'none' || (s.englishLevel === 'basic' && s.learnNewLang === 'no')) {
      push('高语言门槛的技术工作类', '部分技术工作与留学项目对语言有硬性要求，当前语言条件下建议先完成语言提升。');
    }
    if (s.risk === 'stable' && (s.motives.includes('startup') || s.identity === 'entrepreneur')) {
      push('高风险创业路线', '创业类路径不确定性较高，与您偏好的稳定路线存在冲突，建议以稳健身份 + 副业方式过渡。');
    }
    if (s.risk === 'stable') {
      push('高风险创业类', '您偏好稳定路线，创业类路径存在较高不确定性，建议以稳健身份规划为主，创业可作为长期副线。');
    }
    if (tier !== 'high') {
      push('大额投资移民类', '部分投资移民项目需 50 万元以上资金门槛，与当前可接受投入存在差距，暂不建议优先考虑。');
    }
    if (s.kids === 'no' && s.marital === 'single' && s.planWith.length === 0) {
      push('家庭团聚 / 父母随迁类', '当前为个人规划，家庭团聚类项目暂不匹配，未来家庭结构变化后可重新评估。');
    }
    if (s.identity === 'retired' && tier === 'low') {
      push('高净值投资类', '投资类身份项目资金门槛高，退休阶段建议优先考虑成本可控的长期居留路径。');
    }
    if (s.adapt.integrate === 'no' && Number(s.adaptScore || 0) <= 3) {
      push('强融入要求的永居类', '部分永居项目对居住与融入有较长时间要求，与当前融入意愿存在差距。');
    }
    const uniq = {};
    out.forEach((x) => { uniq[x.title] = x; });
    const list = Object.values(uniq);
    return list.length >= 2 ? list.slice(0, 3) : list.concat([{ title: '与目标方向偏离较大的项目', reason: '综合您的动机、预算与身份阶段，部分项目与该目标方向匹配度较低，建议聚焦上述推荐方向。' }]).slice(0, 3);
  }

  roadmap(topCountry, topProject) {
    const c = Istra.countries.find((x) => x.id === topCountry) || { cn: '目标国家' };
    const s = this.state;
    const first = s.identity === 'student' ? '完成学业规划与语言考试' : (s.identity === 'retired' ? '梳理资产与生活安排' : '提升语言与职业/资质认证');
    return [
      { phase: '半年内 · 准备期', items: [first, '完成学历与资金资料梳理', `深入了解${c.cn}政策与项目要求`] },
      { phase: '1–2 年 · 申请期', items: [`准备并递交${topProject ? topProject.name : '目标项目'}申请`, '同步推进家庭与背景材料', '保持职业与资金状态稳定'] },
      { phase: '3–5 年 · 达成期', items: [`抵达${c.cn}并完成居留登记`, '按路径要求完成语言/投资/就业条件', '实现身份转换与家庭团聚目标'] }
    ];
  }
  startAnalysis() {
    this.phase = 'analyzing';
    const steps = ['正在理解您的个人画像…', '正在匹配目标国家…', '正在匹配项目方向…', '正在规划未来路线…'];
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

  showReport() {
    this.phase = 'report';
    const countryRank = this.scoreCountries();
    const topCountries = countryRank.slice(0, 5);
    const match = this.projectMatch(countryRank);
    const topCountry = topCountries[0] ? topCountries[0].id : 'ca';
    const topProject = match.top[0];
    const roadmap = this.roadmap(topCountry, topProject);
    const portrait = this.portrait();
    const notRec = this.notRecommendedDirections();
    const s = this.state;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

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
              <p class="report__cover-meta">${s.identity ? this.identityLabel(s.identity) : '评估用户'} · ${dateStr} · 先理解您，再匹配项目</p>
            </div>

            <section class="report__section" data-reveal>
              <h3 class="report__section-title"><span>01</span>用户全球画像</h3>
              <div class="report__portrait">
                ${portrait.map((l) => `<span class="report__tag">${l}</span>`).join('')}
              </div>
              <p class="report__summary">综合您的年龄、身份、职业、学历、资金、家庭与偏好，AI 将您定位为「${portrait[0]}」，并以此为基础匹配最适合的国际发展路径。</p>
            </section>

            <section class="report__section" data-reveal>
              <h3 class="report__section-title"><span>02</span>国家匹配度</h3>
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
              <h3 class="report__section-title"><span>03</span>项目匹配</h3>
              <div class="report__list">
                ${match.top.map((p) => `
                  <a class="report__project" href="project-detail.html?id=${p.id}">
                    <img src="assets/flags/${p.country.flag}" alt="" width="34" height="25" />
                    <div class="report__project-info">
                      <p class="report__project-name">${p.name} <span class="report__dir">${p.direction}</span></p>
                      <p class="report__project-reason">${p.reason}</p>
                    </div>
                    <span class="report__project-cta">查看详情 →</span>
                  </a>`).join('')}
              </div>
            </section>

            <section class="report__section" data-reveal>
              <h3 class="report__section-title"><span>04</span>不推荐方向</h3>
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

            <section class="report__section" data-reveal>
              <h3 class="report__section-title"><span>05</span>未来路线规划</h3>
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
            <p class="report__note">* 本报告由智能匹配引擎基于您的回答与全球项目数据库生成，作为人生路径规划参考；具体政策、费用与周期以各国官方最新公布为准。伊斯特拉国际不是签证测试工具，而是全球人生路径规划 AI 系统。</p>
          </div>
        </div>
      </div>
    `;
    this.querySelector('[data-action="restart"]').addEventListener('click', () => this.reset());
    Istra.reveal.observe(this);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  identityLabel(id) {
    return { student: '学生', worker: '职场人士', entrepreneur: '创业者', business: '企业经营者', freelancer: '自由职业者', none: '探索者', retired: '人生新阶段探索者' }[id] || '评估用户';
  }
}

customElements.define('is-ai-assessment', SiteAiAssessment);

