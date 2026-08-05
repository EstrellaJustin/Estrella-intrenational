/* ============================================================
   组件：is-ai-assessment · 国际身份评估中心
   步骤式流程（个人信息 / 职业背景 / 目标国家 / AI 分析）+ 进度条
   仅界面交互，不含真实 AI 分析逻辑
   ============================================================ */

class SiteAiAssessment extends HTMLElement {
  constructor() {
    super();
    this.step = 0;
    this.state = {
      salutation: '', age: '', family: '', eduNeed: '',
      field: '', level: '', degree: '', english: '',
      direction: '', budget: '', countries: []
    };
    this.fieldSets = {
      step1: ['salutation', 'age', 'family', 'eduNeed'],
      step2: ['field', 'level', 'degree', 'english'],
      step3: ['direction', 'budget']
    };
  }

  connectedCallback() {
    this.render();
    this.bind();
    this.updateView();
    Istra.reveal.observe(this);
  }

  /* ---------- 字段配置 ---------- */

  selects(name, label, options, full = false) {
    this.selectOptions[name] = options;
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

  chips(list) {
    return list.map((c) => `
      <button type="button" class="chip" data-country="${c.id}" aria-pressed="false">
        <img src="assets/flags/${c.flag}" alt="" width="18" height="13" />
        ${c.cn}
      </button>`).join('');
  }

  stepPanel(i) {
    if (i === 0) {
      return `
        <h2 class="wizard__panel-title">个人信息</h2>
        <p class="wizard__panel-desc">让我们初步了解您的基本情况。</p>
        <div class="field-grid">
          ${this.selects('salutation', '称呼', [{ value: '先生', label: '先生' }, { value: '女士', label: '女士' }])}
          ${this.selects('age', '年龄区间', [
            { value: '18-25', label: '18–25 岁' }, { value: '26-35', label: '26–35 岁' },
            { value: '36-45', label: '36–45 岁' }, { value: '46-55', label: '46–55 岁' },
            { value: '55+', label: '55 岁以上' }
          ])}
          ${this.selects('family', '家庭情况', [
            { value: 'single', label: '单身' }, { value: 'couple', label: '已婚无子女' },
            { value: 'with-kids', label: '已婚有子女' }, { value: 'other', label: '其他' }
          ])}
          ${this.selects('eduNeed', '子女教育规划', [
            { value: 'none', label: '暂不考虑' }, { value: 'basic', label: '基础教育' },
            { value: 'higher', label: '高等教育' }
          ])}
        </div>`;
    }
    if (i === 1) {
      return `
        <h2 class="wizard__panel-title">职业背景</h2>
        <p class="wizard__panel-desc">职业与教育背景是国际发展评估的核心维度。</p>
        <div class="field-grid">
          ${this.selects('field', '职业领域', [
            { value: 'tech', label: '科技 / 互联网' }, { value: 'finance', label: '金融 / 投资' },
            { value: 'health', label: '医疗 / 健康' }, { value: 'edu', label: '教育 / 科研' },
            { value: 'manufacture', label: '制造业' }, { value: 'freelance', label: '自由职业' },
            { value: 'owner', label: '企业主 / 创始人' }, { value: 'other', label: '其他' }
          ])}
          ${this.selects('level', '职位级别', [
            { value: 'entry', label: '初级 / 专员' }, { value: 'mid', label: '中级 / 主管' },
            { value: 'senior', label: '高级 / 总监' }, { value: 'exec', label: '高管 / 合伙人' }
          ])}
          ${this.selects('degree', '最高学历', [
            { value: 'high', label: '高中及以下' }, { value: 'bachelor', label: '本科' },
            { value: 'master', label: '硕士' }, { value: 'phd', label: '博士' }
          ])}
          ${this.selects('english', '英语水平', [
            { value: 'basic', label: '基础' }, { value: 'good', label: '良好' },
            { value: 'fluent', label: '流利' }, { value: 'native', label: '母语级' }
          ])}
        </div>`;
    }
    if (i === 2) {
      const countryList = Istra.countries || [];
      const featured = ['us', 'ca', 'jp', 'de', 'au', 'sg', 'gb', 'nz', 'ae', 'fr', 'es', 'kr'];
      const countries = featured
        .map((id) => countryList.find((c) => c.id === id))
        .filter(Boolean);
      return `
        <h2 class="wizard__panel-title">目标国家与方向</h2>
        <p class="wizard__panel-desc">选择您关注的发展方向与意向国家（可多选）。</p>
        <div class="field-grid">
          ${this.selects('direction', '目标方向', [
            { value: 'work', label: '工作发展' }, { value: 'edu', label: '子女教育' },
            { value: 'invest', label: '投资布局' }, { value: 'startup', label: '创业' },
            { value: 'identity', label: '长期身份规划' }
          ])}
          ${this.selects('budget', '预算区间', [
            { value: 'low', label: '50 万以内' }, { value: 'mid', label: '50–150 万' },
            { value: 'high', label: '150–300 万' }, { value: 'vip', label: '300 万以上' }
          ])}
          <div class="field field--full" data-field="countries">
            <span class="wizard__panel-desc" style="margin:0;font-weight:600;color:var(--color-heading)">意向国家</span>
            <div class="chip-grid">${this.chips(countries)}</div>
            <span class="field-error">请至少选择一个意向国家</span>
          </div>
        </div>`;
    }
    /* Step 4: AI 分析 */
    const labelOf = (key) => {
      const map = {
        salutation: '称呼', age: '年龄', family: '家庭情况', eduNeed: '子女教育',
        field: '职业领域', level: '职位级别', degree: '最高学历', english: '英语水平',
        direction: '目标方向', budget: '预算区间'
      };
      return map[key] || key;
    };
    const rows = Object.keys(this.state)
      .filter((k) => k !== 'countries' && this.state[k])
      .map((k) => {
        const options = this.selectOptions[k] || [];
        const found = options.find((o) => o.value === this.state[k]);
        return `<div class="summary__row"><span class="summary__label">${labelOf(k)}</span><span class="summary__value">${found ? found.label : this.state[k]}</span></div>`;
      });
    const countryChips = this.state.countries.length
      ? `<div class="summary__row"><span class="summary__label">意向国家</span><span class="summary__value summary__value--chips">${this.state.countries.map((c) => `<span class="mini-chip">${c.cn}</span>`).join('')}</span></div>`
      : '';
    return `
      <h2 class="wizard__panel-title">AI 分析</h2>
      <p class="wizard__panel-desc">您的评估摘要已生成，AI 分析引擎将在后续阶段接入。</p>
      <div class="summary">${rows.join('')}${countryChips}</div>
      <p class="assessment__note">
        AI 智能匹配引擎将在下一阶段接入。当前为「国际身份评估中心」界面预览，
        您填写的维度将作为未来智能分析的输入标准。
      </p>`;
  }

  /* ---------- 渲染 ---------- */

  render() {
    const steps = ['个人信息', '职业背景', '目标国家', 'AI 分析'];
    this.selectOptions = {};

    this.innerHTML = `
      <div class="assessment">
        <header class="assessment__head">
          <div class="container">
            <p class="assessment__eyebrow" data-reveal>AI Assessment Center</p>
            <h1 class="assessment__title" data-reveal>国际身份评估中心</h1>
            <p class="assessment__sub" data-reveal>四步完成评估：个人信息 → 职业背景 → 目标国家 → AI 分析</p>
          </div>
        </header>

        <div class="assessment__body">
          <div class="container">
            <div class="wizard" data-reveal>
              <div class="wizard__steps">
                <div class="wizard__track">
                  <span class="wizard__track-line" aria-hidden="true"></span>
                  <span class="wizard__track-fill" aria-hidden="true"></span>
                  ${steps.map((s, i) => `
                    <div class="wizard__step" data-step="${i}">
                      <span class="wizard__step-dot">${i + 1}</span>
                      <span class="wizard__step-label">Step 0${i + 1} · ${s}</span>
                    </div>`).join('')}
                </div>
              </div>

              <div class="wizard__content">
                ${steps.map((s, i) => `<div class="wizard__panel" data-panel="${i}">${this.stepPanel(i)}</div>`).join('')}
              </div>

              <div class="wizard__actions">
                <button type="button" class="btn btn--ghost-dark" data-action="prev">上一步</button>
                <div class="wizard__actions-right">
                  <button type="button" class="btn btn--ghost-dark" data-action="restart" style="display:none">重新评估</button>
                  <a class="btn btn--primary" data-action="next" href="#">下一步 <span class="btn-arrow">→</span></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ---------- 交互 ---------- */

  bind() {
    this.trackFill = this.querySelector('.wizard__track-fill');
    this.nextBtn = this.querySelector('[data-action="next"]');
    this.prevBtn = this.querySelector('[data-action="prev"]');
    this.restartBtn = this.querySelector('[data-action="restart"]');

    this.querySelectorAll('[data-select]').forEach((sel) => {
      sel.addEventListener('change', () => {
        this.state[sel.dataset.select] = sel.value;
        this.clearInvalid(sel.dataset.select);
      });
    });

    this.querySelectorAll('[data-country]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const id = chip.dataset.country;
        const c = { id, cn: chip.textContent.trim() };
        const i = this.state.countries.findIndex((x) => x.id === id);
        if (i >= 0) this.state.countries.splice(i, 1);
        else this.state.countries.push(c);
        chip.classList.toggle('is-selected', i < 0);
        chip.setAttribute('aria-pressed', String(i < 0));
        this.clearInvalid('countries');
      });
    });

    this.prevBtn.addEventListener('click', () => this.goTo(this.step - 1));
    this.nextBtn.addEventListener('click', (e) => {
      if (this.step >= 3) return; /* 最后一步为“完成评估”，放行跳转 */
      e.preventDefault();
      if (!this.validate(this.step)) return;
      this.goTo(this.step + 1);
    });
    this.restartBtn.addEventListener('click', () => {
      this.state = {
        salutation: '', age: '', family: '', eduNeed: '',
        field: '', level: '', degree: '', english: '',
        direction: '', budget: '', countries: []
      };
      this.querySelectorAll('[data-select]').forEach((s) => { s.value = ''; });
      this.querySelectorAll('[data-country]').forEach((c) => { c.classList.remove('is-selected'); c.setAttribute('aria-pressed', 'false'); });
      this.goTo(0);
    });
  }

  validate(step) {
    let ok = true;
    const names = step === 3 ? ['direction', 'budget'] : this.fieldSets['step' + (step + 1)];
    names.forEach((name) => {
      const invalid = !this.state[name];
      this.toggleInvalid(name, invalid);
      if (invalid) ok = false;
    });
    if (step === 2) {
      const invalid = this.state.countries.length === 0;
      this.toggleInvalid('countries', invalid);
      if (invalid) ok = false;
    }
    return ok;
  }

  toggleInvalid(name, invalid) {
    const field = this.querySelector(`[data-field="${name}"]`);
    if (field) field.classList.toggle('is-invalid', invalid);
  }

  clearInvalid(name) {
    const field = this.querySelector(`[data-field="${name}"]`);
    if (field) field.classList.remove('is-invalid');
  }

  goTo(index) {
    this.step = Math.max(0, Math.min(3, index));
    /* 进入 AI 分析步骤时，用最新填写内容重建摘要 */
    if (this.step === 3) {
      this.querySelector('[data-panel="3"]').innerHTML = this.stepPanel(3);
    }
    this.querySelectorAll('[data-panel]').forEach((panel, i) => {
      panel.classList.toggle('is-active', i === this.step);
      if (i === this.step) panel.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('is-revealed'));
    });
    this.querySelectorAll('[data-step]').forEach((s, i) => {
      s.classList.toggle('is-active', i === this.step);
      s.classList.toggle('is-done', i < this.step);
    });
    this.trackFill.style.width = `${(this.step / 3) * 84}%`;
    this.prevBtn.style.visibility = this.step === 0 ? 'hidden' : 'visible';
    this.restartBtn.style.display = this.step === 3 ? 'inline-flex' : 'none';
    const isLast = this.step === 3;
    this.nextBtn.innerHTML = isLast
      ? '完成评估 <span class="btn-arrow">→</span>'
      : '下一步 <span class="btn-arrow">→</span>';
    this.nextBtn.href = isLast ? 'index.html' : '#';
    this.nextBtn.style.pointerEvents = '';
  }

  updateView() {
    this.goTo(0);
  }
}

customElements.define('is-ai-assessment', SiteAiAssessment);



