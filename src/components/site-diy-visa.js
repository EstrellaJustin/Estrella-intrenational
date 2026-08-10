/* ============================================================
   组件：is-diy-visa · DIY 签证模拟系统（单页全量展开版）
   用户进入页面即看到完整 DIY 指南：
   项目介绍 / 适合人群 / 申请条件 / DIY申请流程 / 完整材料清单（含每项说明）/
   AI模拟评估 / 风险分析 / 提升建议 / 免责声明
   禁止折叠面板、手风琴、点击展开、隐藏内容。
   数据源：Istra.visaDiyProjects / Istra.visaDocuments / Istra.projects
   ============================================================ */

class SiteDiyVisa extends HTMLElement {
  constructor() {
    super();
    this.state = {
      projectId: '',
      profile: { age: '', degree: '', occupation: '', income: '', language: '', funds: '', travelHistory: '', family: '' },
      materials: {}
    };
    this._evaluating = false;
  }

  connectedCallback() {
    const urlId = new URLSearchParams(location.search).get('id');
    const first = (Istra.visaDiyProjects && Istra.visaDiyProjects[0]) ? Istra.visaDiyProjects[0].id : '';
    this.state.projectId = (urlId && (Istra.visaDiyProjects || []).some((p) => p.id === urlId)) ? urlId : (first || '');
    this.render();
    this.bind();
    Istra.reveal.observe(this);
  }

  DISCLAIMER = '本DIY签证模拟系统仅用于帮助用户了解签证申请流程、准备材料以及分析自身条件。AI分析结果不代表任何政府机构、使领馆或签证审核部门的决定。签证批准与否由相关国家政府机构依法独立审核。本站不保证签证成功，不提供签证审批服务。用户应以目标国家官方最新政策要求为准。';

  /* ================= 数据辅助 ================= */

  allProjects() { return Istra.visaDiyProjects || []; }
  fullProject(id) { return (Istra.projects || []).find((p) => p.id === id) || null; }
  countryCn(id) { const c = (Istra.countries || []).find((x) => x.id === id); return c ? c.cn : id; }
  docsOf(id) { return (Istra.visaDocuments || []).filter((d) => d.visa_project_id === id); }
  categoryLabel(cid) {
    const map = { work: '工作就业', tech: '技术人才', edu: '留学教育', invest: '投资创业', talent: '人才移民', family: '家庭团聚', pr: '永久居留', nomad: '数字游民', youth: '青年交流', special: '特殊人才' };
    return map[cid] || cid;
  }

  /* ================= 渲染（单页全量） ================= */

  render() {
    this.innerHTML = `
      <div class="diy">
        <header class="diy__head">
          <div class="container">
            <p class="diy__eyebrow" data-reveal>DIY Visa Simulation</p>
            <h1 class="diy__title" data-reveal>DIY 签证模拟系统</h1>
            <p class="diy__sub" data-reveal>像阅读官方申请指南一样，一次查看完整 DIY 流程：项目介绍、申请条件、材料清单、AI 模拟评估与风险分析。</p>
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
    const projSel = this.querySelector('[data-picker="project"]');
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

  filteredProjects() {
    const countrySel = this.querySelector('[data-picker="country"]');
    const catSel = this.querySelector('[data-picker="category"]');
    const c = countrySel ? countrySel.value : '';
    const cat = catSel ? catSel.value : '';
    let list = this.allProjects();
    if (c) list = list.filter((p) => p.country === c);
    if (cat) list = list.filter((p) => { const f = this.fullProject(p.id); return f && f.category.id === cat; });
    return list;
  }

  fillProjectPicker() {
    const projSel = this.querySelector('[data-picker="project"]');
    const list = this.filteredProjects();
    const valid = list.some((p) => p.id === this.state.projectId);
    if (!valid && list.length) this.state.projectId = list[0].id;
    projSel.innerHTML = list.map((p) => `<option value="${p.id}"${p.id === this.state.projectId ? ' selected' : ''}>${this.countryCn(p.country)} · ${p.visa_name}</option>`).join('');
  }

  renderGuide() {
    const id = this.state.projectId;
    const p = this.allProjects().find((x) => x.id === id);
    const full = this.fullProject(id);
    const guide = this.querySelector('[data-guide]');
    if (!p || !full) { guide.innerHTML = '<p class="diy__empty">暂无可模拟项目，请选择其他签证项目。</p>'; return; }
    this.state.materials = {};
    guide.innerHTML = this.guideHtml(p, full);
    this.renderEval();
  }

  guideHtml(p, full) {
    const c = full.country;
    const docs = this.docsOf(p.id);
    const li = (arr) => (arr && arr.length ? `<ul class="diy__sec-list">${arr.map((t) => `<li>${t}</li>`).join('')}</ul>` : '<p class="diy__sec-empty">—</p>');
    return `
      <div class="diy__guide-head">
        <span class="diy__guide-flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" /></span>
        <div>
          <p class="diy__guide-country">${c.cn} <small>${c.en}</small></p>
          <h2 class="diy__guide-title">${p.visa_name}</h2>
          <p class="diy__guide-meta">${p.visa_type} · ${this.categoryLabel(full.category.id)} · ${full.subcategory.name}</p>
        </div>
      </div>

      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>01</span>签证项目介绍</h3>
        <p class="diy__sec-text">${full.introduction}</p>
        <div class="diy__facts">
          <div class="diy__fact"><span>国家</span><b>${c.cn}</b></div>
          <div class="diy__fact"><span>签证类型</span><b>${p.visa_type}</b></div>
          <div class="diy__fact"><span>办理周期</span><b>${full.duration}</b></div>
          <div class="diy__fact"><span>官方申请机构</span><b>${full.official_authority}</b></div>
        </div>
      </section>

      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>02</span>适合人群</h3>
        ${li(full.targetUsers)}
      </section>

      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>03</span>申请条件</h3>
        ${li(full.requirements)}
      </section>

      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>04</span>DIY 申请流程</h3>
        <ol class="diy__steps">
          ${(full.process || []).map((t, i) => `<li><b>${String(i + 1).padStart(2, '0')}</b><span>${t}</span></li>`).join('')}
        </ol>
        <div class="diy__official">
          <a class="btn btn--primary" href="${full.application_url}" target="_blank" rel="noopener noreferrer">进入官方申请页面 <span class="btn-arrow">→</span></a>
          <a class="btn btn--ghost-dark" href="${full.official_website}" target="_blank" rel="noopener noreferrer">访问官方网站 <span class="btn-arrow">→</span></a>
        </div>
      </section>

      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>05</span>完整申请材料清单</h3>
        <p class="diy__sec-desc">以下材料基于官方公开要求整理，每项均附官方要求、准备建议与来源，请逐项核对并标记你的准备状态。</p>
        <div class="diy__materials">
          ${docs.map((d) => `
            <article class="diy__doc">
              <div class="diy__doc-head">
                <h4 class="diy__doc-name">${d.document_name}</h4>
                <span class="diy__doc-tag${d.is_required ? ' is-req' : ''}">${d.is_required ? '必须' : '视情况'}</span>
                <span class="diy__doc-cat">${d.document_category}</span>
              </div>
              <div class="diy__doc-body">
                <p><span>官方要求：</span>${d.official_requirement}</p>
                <p><span>准备建议：</span>${d.preparation_tips}</p>
                <p class="diy__doc-src"><span>来源：</span>${d.source_reference} · 更新于 ${d.last_updated}</p>
              </div>
              <div class="diy__doc-status">
                <span class="diy__doc-status-label">我的状态：</span>
                <button type="button" class="chip is-selected" data-mstatus="${d.id}" data-value="todo">未准备</button>
                <button type="button" class="chip" data-mstatus="${d.id}" data-value="preparing">准备中</button>
                <button type="button" class="chip" data-mstatus="${d.id}" data-value="done">已完成</button>
              </div>
            </article>`).join('')}
        </div>
      </section>

      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>06</span>AI 模拟评估</h3>
        <p class="diy__sec-desc">填写你的个人情况，系统将结合你的条件与材料准备状态，实时生成模拟评估。信息仅用于本次模拟，不会公开。</p>
        <div class="diy__eval-grid">
          <div class="diy__eval-form" data-eval-form>
            <div class="field-grid">
              <div class="field" data-field="age"><label for="e-age">年龄</label><input id="e-age" type="text" data-input="age" value="${this.state.profile.age}" placeholder="如：30" autocomplete="off" /></div>
              <div class="field field--full" data-field="degree"><span class="field-label">学历</span><div class="chip-grid">${this.profileChips('degree', ['高中以下', '高中', '大专', '本科', '硕士', '博士'])}</div></div>
              <div class="field field--full" data-field="income"><span class="field-label">月收入</span><div class="chip-grid">${this.profileChips('income', ['无', '1万以下', '1-3万', '3-5万', '5-10万', '10万以上'])}</div></div>
              <div class="field field--full" data-field="language"><span class="field-label">语言水平</span><div class="chip-grid">${this.profileChips('language', ['不会', '基础', '日常交流', '熟练', '专业'])}</div></div>
              <div class="field field--full" data-field="funds"><span class="field-label">可投入资金</span><div class="chip-grid">${this.profileChips('funds', ['1万以下', '1-5万', '5-10万', '10-30万', '30万以上'])}</div></div>
              <div class="field field--full" data-field="travelHistory"><span class="field-label">出境记录</span><div class="chip-grid">${this.profileChips('travelHistory', ['无', '短期出境', '长期海外'])}</div></div>
              <div class="field field--full" data-field="family"><span class="field-label">家庭情况</span><div class="chip-grid">${this.profileChips('family', ['单身', '已婚无子女', '已婚有子女', '其他'])}</div></div>
            </div>
            <p class="diy__eval-hint">* 填写后评估结果实时更新，可随时修改重新评估。</p>
          </div>
          <div class="diy__eval-result" data-eval-result></div>
        </div>
      </section>

      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>07</span>风险分析</h3>
        <div data-eval-risks></div>
      </section>

      <section class="diy__sec">
        <h3 class="diy__sec-title"><span>08</span>提升建议</h3>
        <div data-eval-tips></div>
      </section>

      <div class="diy__disclaimer">${this.DISCLAIMER}</div>
    `;
  }

  profileChips(key, options) {
    const cur = this.state.profile[key];
    return options.map((o) => `<button type="button" class="chip${cur === o ? ' is-selected' : ''}" data-chip="${key}" data-value="${o}" aria-pressed="${cur === o}">${o}</button>`).join('');
  }

  /* ================= AI 模拟评估 ================= */

  renderEval() {
    const result = this.querySelector('[data-eval-result]');
    if (!result) return;
    const a = this.analyze();
    result.innerHTML = `
      <div class="diy__scores">
        <div class="diy__score"><p class="diy__score-label">申请条件匹配度</p><p class="diy__score-num">${a.cond}</p><div class="diy__score-track"><span style="width:${a.cond}%"></span></div></div>
        <div class="diy__score"><p class="diy__score-label">材料完整度</p><p class="diy__score-num">${a.mat}</p><div class="diy__score-track"><span style="width:${a.mat}%"></span></div></div>
        <div class="diy__score"><p class="diy__score-label">风险等级</p><p class="diy__score-num diy__score-num--risk is-${a.risk}">${a.risk}</p></div>
      </div>`;
    const risks = this.querySelector('[data-eval-risks]');
    if (risks) risks.innerHTML = `<div class="diy__block"><ul>${a.risks.map((t) => `<li>${t}</li>`).join('')}</ul></div>`;
    const tips = this.querySelector('[data-eval-tips]');
    if (tips) tips.innerHTML = `<div class="diy__block"><ul>${a.tips.map((t) => `<li>${t}</li>`).join('')}</ul></div>`;
  }

  analyze() {
    const id = this.state.projectId;
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
    if (!strengths.length) strengths.push('填写完整个人信息后，可更准确地分析你的申请条件优势');

    if (!isNaN(age) && (age < 18 || age > 50)) risks.push('年龄可能与部分项目要求存在差距，请核对项目年龄限制');
    if (lv < 2 && (cat === 'edu' || cat === 'work' || cat === 'tech')) risks.push('语言水平可能与项目要求存在差距，建议先提升语言');
    if (fv < 3 && (cat === 'invest' || cat === 'edu')) risks.push('资金规模可能未达项目门槛，建议核对官方资金要求');
    if (mat < 80) risks.push('材料完整度不足，未完成材料可能影响审核进度');
    if (!risks.length) risks.push('暂无明显短板，继续保持材料与条件的一致性');

    if (mat < 80) {
      const undone = docs.filter((d) => this.state.materials[d.id] !== 'done').slice(0, 2);
      if (undone.length) tips.push('优先准备 ' + undone.map((d) => d.document_name).join('、') + ' 等必需材料');
    }
    if (lv < 2 && (cat === 'edu' || cat === 'work')) tips.push('制定语言提升计划（课程或考试），目标达到项目要求分数');
    if (fv < 3 && (cat === 'invest' || cat === 'edu')) tips.push('补充资金证明，或选择资金要求更匹配的路线');
    if (prof.travelHistory === '无' && (cat === 'pr' || cat === 'invest')) tips.push('提前规划一次合规出境记录，增强背景连续性');
    if (!tips.length) tips.push('材料齐备后按官方流程提交，保持信息一致并关注补件通知');

    return { cond, mat, risk, strengths: strengths.slice(0, 4), risks: risks.slice(0, 4), tips: tips.slice(0, 4) };
  }

  /* ================= 交互 ================= */

  bind() {
    this.querySelectorAll('[data-picker]').forEach((sel) => {
      sel.addEventListener('change', () => {
        if (sel.getAttribute('data-picker') === 'project') {
          this.state.projectId = sel.value;
          this.renderGuide();
        } else {
          this.fillProjectPicker();
        }
      });
    });

    const guide = this.querySelector('[data-guide]');
    guide.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-chip]');
      if (chip) {
        const key = chip.dataset.chip;
        this.state.profile[key] = chip.dataset.value;
        guide.querySelectorAll('[data-chip="' + key + '"]').forEach((c) => {
          c.classList.toggle('is-selected', c === chip);
          c.setAttribute('aria-pressed', String(c === chip));
        });
        this.renderEval();
        return;
      }
      const ms = e.target.closest('[data-mstatus]');
      if (ms) {
        const id = ms.getAttribute('data-mstatus');
        const val = ms.getAttribute('data-value');
        this.state.materials[id] = val;
        ms.parentNode.querySelectorAll('[data-mstatus]').forEach((b) => {
          b.classList.toggle('is-selected', b === ms);
          b.setAttribute('aria-pressed', String(b === ms));
        });
        this.renderEval();
      }
    });

    guide.addEventListener('input', (e) => {
      const inp = e.target.closest('[data-input]');
      if (inp) {
        this.state.profile[inp.dataset.input] = inp.value;
        this.renderEval();
      }
    });
  }
}

customElements.define('is-diy-visa', SiteDiyVisa);