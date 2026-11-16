/* ============================================================
   组件：is-projects · 全球机会搜索引擎
   搜索：国家/项目/签证/职业/行业/类型，支持中英文与模糊匹配
   筛选：国家多选、项目类型、学历、语言、行业、年龄、资金
   排序：综合推荐 / 资金 / 门槛 / 更新 / 语言
   URL 参数持久化：q, countries, types, degrees, languages, industries, age, funds, sort, page
   ============================================================ */

const TYPE_OPTIONS = ['海外工作', '工作签证', '技术移民', '雇主担保', '留学', '留学后就业', '永久居留', '创业', '投资', '数字游民', '季节性工作', '其他'];
const DEGREE_OPTIONS = ['无学历要求', '初中及以下', '高中', '中专/技校', '大专', '本科', '硕士', '博士'];
const LANGUAGE_OPTIONS = ['无语言要求', '基础英语', '日常交流', '商务英语', 'IELTS', 'TOEFL', '日语', '德语', '法语', '其他语言'];
const INDUSTRY_OPTIONS = ['IT', '工程制造', '医疗', '建筑', '餐饮', '物流', '教育', '农业', '金融', '其他'];
const PAGE_SIZE = 20;

const DEGREE_INDEX = { '无学历要求': 0, '初中及以下': 1, '高中': 2, '中专/技校': 3, '大专': 4, '本科': 5, '硕士': 6, '博士': 7 };
const LANG_INDEX = { '无语言要求': 0, '基础英语': 1, '日常交流': 2, '商务英语': 3, 'IELTS': 4, 'TOEFL': 4, '日语': 4, '德语': 4, '法语': 4, '其他语言': 4 };
const BUDGET_INDEX = { low: 0, midlow: 1, mid: 2, high: 3 };

/* 职业/行业同义词：用户常用词 → 数据中的实际用词 */
const SYNONYMS = {
  '护士': ['护理', 'nurse'], '护理': ['护士'], '护工': ['护理'],
  '医生': ['医疗', 'medical'], '医疗': ['医生'],
  '厨师': ['餐饮', '酒店', 'chef'], '餐饮': ['厨师'],
  '司机': ['物流', '运输', 'driver', '卡车'],
  '会计': ['金融', 'finance'], '教师': ['教育', 'teacher'],
  '程序员': ['it', '软件', '开发', 'developer'], '工程师': ['工程', '技术'],
  '农业': ['农场', 'agriculture'], 'it': ['软件', '互联网', '信息']
};

/* ---------- 文本规则识别（依据项目现有文本，不虚构） ---------- */
function textOf(p) {
  return [
    p.name, p.visaType, (p.category || {}).name, (p.subcategory || {}).name,
    p.introduction, (p.requirements || []).join(' '), (p.targetUsers || []).join(' '),
    p.official_authority, p.application_method
  ].filter(Boolean).join(' ');
}

function detectTypes(p) {
  const t = textOf(p);
  const out = new Set();
  if (/数字游民|远程工作|digital nomad/i.test(t)) out.add('数字游民');
  if (/季节|seasonal/i.test(t)) out.add('季节性工作');
  if (/投资|investor|投资移民/i.test(t)) out.add('投资');
  if (/创业|startup|企业家/i.test(t)) out.add('创业');
  if (/雇主担保|sponsor|担保/i.test(t)) out.add('雇主担保');
  if (/技术移民|积分|points|skilled/i.test(t)) out.add('技术移民');
  if (/留学后|毕业工签|post-?study|psw/i.test(t)) out.add('留学后就业');
  if (/留学|学生签证|study|student/i.test(t)) out.add('留学');
  if (/永久居留|永居|绿卡|permanent residen|pr\b/i.test(t)) out.add('永久居留');
  if (/工作签证|work visa|h-?1b|工签/i.test(t)) out.add('工作签证');
  if (/海外工作|就业|求职|employment|job/i.test(t)) out.add('海外工作');
  if (!out.size) out.add('其他');
  return [...out];
}

function detectIndustries(p) {
  const t = textOf(p);
  const rules = [
    ['IT', /it\b|互联网|软件|程序员|工程师.*软件|人工智能|数据|ai\b/i],
    ['工程制造', /工程|制造|机械|automotive|焊|技术工人/i],
    ['医疗', /医疗|护理|护士|医生|health|nurse|medical/i],
    ['建筑', /建筑|施工|construction|土木/i],
    ['餐饮', /餐饮|厨师|酒店|hospitality|chef/i],
    ['物流', /物流|运输|司机|logistic|driver|卡车/i],
    ['教育', /教育|教师|teaching|teacher/i],
    ['农业', /农业|农场|agricultur|farm/i],
    ['金融', /金融|会计|finance|account/i]
  ];
  const out = rules.filter(([, re]) => re.test(t)).map(([name]) => name);
  return out.length ? out : ['其他'];
}

function detectDegree(p) {
  const t = textOf(p);
  if (/无学历要求|学历不限|不限学历/.test(t)) return '无学历要求';
  const order = [['博士', /博士|phd/i], ['硕士', /硕士|master/i], ['本科', /本科|学士|bachelor/i], ['大专', /大专|专科|associate degree/i], ['中专/技校', /中专|技校|职业高中|vocational/i], ['高中', /高中|high school/i], ['初中及以下', /初中/i]];
  for (const [name, re] of order) if (re.test(t)) return name;
  return null;
}

function detectLanguage(p) {
  const t = textOf(p);
  if (/无语言要求|语言不限|无需语言/.test(t)) return '无语言要求';
  const order = [['IELTS', /雅思|ielts/i], ['TOEFL', /托福|toefl/i], ['日语', /日语|japanese|jlpt/i], ['德语', /德语|german/i], ['法语', /法语|french/i], ['商务英语', /商务英语|business english/i], ['日常交流', /日常交流|流利|fluent/i], ['基础英语', /基础英语|basic english|英语基础/i]];
  for (const [name, re] of order) if (re.test(t)) return name;
  if (/英语|english/i.test(t)) return '基础英语';
  return null;
}

function detectAge(p) {
  const t = textOf(p);
  let m = t.match(/(\d{2})\s*[-–~至]\s*(\d{2})\s*(?:周)?岁/);
  if (m) return { min: Number(m[1]), max: Number(m[2]) };
  m = t.match(/年满\s*(\d{2})\s*(?:周)?岁/);
  if (m) return { min: Number(m[1]), max: null };
  m = t.match(/(?:不超过|低于|以下)\s*(\d{2})\s*(?:周)?岁|(\d{2})\s*(?:周)?岁以下/);
  if (m) return { min: null, max: Number(m[1] || m[2]) };
  return null;
}

function budgetOrder(p) { return BUDGET_INDEX[p.budgetLevel] != null ? BUDGET_INDEX[p.budgetLevel] : 99; }
function budgetText(p) { return (p.budget && (p.budget.range || p.budget.label)) || '未标注'; }
function budgetMinWan(p) {
  const r = (p.budget && p.budget.range) || '';
  const m = r.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const v = Number(m[1]);
  return /万/.test(r) ? v : v / 10000;
}


class SiteProjects extends HTMLElement {
  connectedCallback() {
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
    this.buildIndex();
    this.state = this.readParams();
    this.render();
    this.bind();
    Istra.reveal.observe(this);
    this.restoreScroll();
  }

  /* 从项目详情返回时恢复滚动位置 */
  restoreScroll() {
    try {
      const raw = sessionStorage.getItem('istra_projects_scroll');
      if (!raw) return;
      sessionStorage.removeItem('istra_projects_scroll');
      const data = JSON.parse(raw);
      if (!data || data.y <= 0) return;
      const cur = location.pathname + location.search;
      if (data.url !== cur && decodeURIComponent(data.url) !== decodeURIComponent(cur)) return;
      const y = data.y;
      setTimeout(() => { window.scrollTo(0, y); }, 120);
    } catch (e) {}
  }

  saveScroll() {
    try { sessionStorage.setItem('istra_projects_scroll', JSON.stringify({ url: location.pathname + location.search, y: window.scrollY })); } catch (e) {}
  }

  /* 预计算派生字段，避免每次筛选重复解析 */
  buildIndex() {
    const all = Istra.projects || [];
    this.index = all.map((p) => ({
      p,
      types: detectTypes(p),
      industries: detectIndustries(p),
      degree: detectDegree(p),
      language: detectLanguage(p),
      age: detectAge(p),
      budgetOrder: budgetOrder(p),
      budgetMin: budgetMinWan(p),
      hay: textOf(p).toLowerCase() + ' ' + (p.country ? (p.country.cn + ' ' + p.country.en) : '').toLowerCase()
    }));
    this.countries = (Istra.countries || []).slice().sort((a, b) => a.cn.localeCompare(b.cn, 'zh'));
    this.countryIndex = {};
    (Istra.countries || []).forEach((c) => { this.countryIndex[c.id] = c; });
    this.countryNameIndex = {};
    (Istra.countries || []).forEach((c) => {
      if (c.cn) this.countryNameIndex[String(c.cn).toLowerCase()] = c;
      if (c.en) this.countryNameIndex[String(c.en).toLowerCase()] = c;
    });
  }

  readParams() {
    const p = new URLSearchParams(location.search);
    const list = (k) => (p.get(k) || '').split(',').filter(Boolean);
    return {
      q: p.get('q') || '',
      countries: list('countries'),
      types: list('types'),
      degrees: list('degrees'),
      languages: list('languages'),
      industries: list('industries'),
      age: p.get('age') || '',
      funds: p.get('funds') || '',
      sort: p.get('sort') || 'recommend',
      page: Math.max(1, Number(p.get('page')) || 1)
    };
  }

  matches(item) {
    const s = this.state;
    const p = item.p;
    if (s.countries.length && !s.countries.includes(p.country && p.country.id)) return false;
    if (s.types.length && !s.types.some((t) => item.types.includes(t))) return false;
    if (s.degrees.length && !s.degrees.includes(item.degree || '未标注')) return false;
    if (s.languages.length && !s.languages.includes(item.language || '未标注')) return false;
    if (s.industries.length && !s.industries.some((t) => item.industries.includes(t))) return false;
    if (s.age) {
      const age = Number(s.age);
      if (item.age) {
        if (item.age.min != null && age < item.age.min) return false;
        if (item.age.max != null && age > item.age.max) return false;
      }
    }
    if (s.funds) {
      const funds = Number(s.funds);
      if (item.budgetMin != null && item.budgetMin > funds) return false;
    }
    if (s.q) {
      const tokens = s.q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!tokens.every((t) => {
        const alts = [t].concat(SYNONYMS[t] || []);
        return alts.some((a) => item.hay.includes(a));
      })) return false;
    }
    return true;
  }

  currentResults() {
    const filtered = this.index.filter((it) => this.matches(it));
    return this.sortResults(filtered);
  }

  sortResults(items) {
    const s = this.state.sort;
    const arr = items.slice();
    if (s === 'budget-asc') arr.sort((a, b) => (a.budgetMin == null ? 1e9 : a.budgetMin) - (b.budgetMin == null ? 1e9 : b.budgetMin));
    else if (s === 'budget-desc') arr.sort((a, b) => (b.budgetMin == null ? -1 : b.budgetMin) - (a.budgetMin == null ? -1 : a.budgetMin));
    else if (s === 'threshold-asc') arr.sort((a, b) => (DEGREE_INDEX[a.degree] == null ? 99 : DEGREE_INDEX[a.degree]) - (DEGREE_INDEX[b.degree] == null ? 99 : DEGREE_INDEX[b.degree]));
    else if (s === 'lang-asc') arr.sort((a, b) => (LANG_INDEX[a.language] == null ? 99 : LANG_INDEX[a.language]) - (LANG_INDEX[b.language] == null ? 99 : LANG_INDEX[b.language]));
    else if (s === 'updated') arr.sort((a, b) => String(b.p.last_verified_date || '').localeCompare(String(a.p.last_verified_date || '')));
    else arr.sort((a, b) => (b.p.category && a.p.category ? 0 : 0));
    return arr;
  }

  chips(options, selected, key, label) {
    return `<div class="search-group">
      <p class="search-group__label">${label}</p>
      <div class="search-group__chips">
        ${options.map((o) => `<button type="button" class="filter-chip${selected.includes(o) ? ' is-active' : ''}" data-multi="${key}" data-value="${o}">${o}</button>`).join('')}
      </div>
    </div>`;
  }

  countryPicker() {
    const s = this.state;
    const sel = s.countries;
    const q = (this.countryQuery || '').toLowerCase();
    const list = this.countries.filter((c) => !q || c.cn.toLowerCase().includes(q) || (c.en || '').toLowerCase().includes(q));
    return `<div class="search-group search-group--country">
      <p class="search-group__label">国家 / 地区 <span class="search-group__hint">可多选（已选 ${sel.length}）</span></p>
      <input type="text" class="search-input search-input--mini" id="country-search" placeholder="搜索国家（中英文）…" value="${this.countryQuery || ''}" autocomplete="off" />
      <div class="country-list">
        ${list.map((c) => `<label class="country-item${sel.includes(c.id) ? ' is-active' : ''}">
          <input type="checkbox" data-country="${c.id}" ${sel.includes(c.id) ? 'checked' : ''} />
          <span>${c.cn}</span><small>${c.en || ''}</small>
        </label>`).join('') || '<p class="search-empty-tip">未找到国家</p>'}
      </div>
      ${sel.length ? '<button type="button" class="link-btn" data-clear="countries">清除国家选择</button>' : ''}
    </div>`;
  }

  activeFilters() {
    const s = this.state;
    const items = [];
    if (s.q) items.push({ k: 'q', label: '关键词：' + s.q });
    s.countries.forEach((id) => {
      const c = this.countries.find((x) => x.id === id);
      items.push({ k: 'countries', v: id, label: '国家：' + (c ? c.cn : id) });
    });
    s.types.forEach((v) => items.push({ k: 'types', v, label: '类型：' + v }));
    s.degrees.forEach((v) => items.push({ k: 'degrees', v, label: '学历：' + v }));
    s.languages.forEach((v) => items.push({ k: 'languages', v, label: '语言：' + v }));
    s.industries.forEach((v) => items.push({ k: 'industries', v, label: '行业：' + v }));
    if (s.age) items.push({ k: 'age', label: '年龄：' + s.age + ' 岁' });
    if (s.funds) items.push({ k: 'funds', label: '资金：≤' + s.funds + ' 万元' });
    if (!items.length) return '';
    return `<div class="active-filters">
      <span class="active-filters__label">已启用筛选</span>
      ${items.map((i) => `<button type="button" class="active-chip" data-remove="${i.k}" data-value="${i.v || ''}">${i.label} ×</button>`).join('')}
      <button type="button" class="link-btn" data-action="reset">清除全部</button>
    </div>`;
  }

  flagHtml(p) {
    const c = (p && p.country) || {};
    let country = this.countryIndex ? this.countryIndex[c.id] : null;
    if (!country) {
      const byName = this.countryNameIndex || {};
      country = byName[String(c.cn || '').toLowerCase()] || byName[String(c.en || '').toLowerCase()] || null;
    }
    const flagFile = (country && country.flag) || c.flag || '';
    const label = (country && country.cn) || c.cn || c.en || '';
    if (!flagFile) {
      return '<span class="project-card__flag project-card__flag--unknown" title="国家信息未知" aria-label="国家未知">?</span>';
    }
    return '<span class="project-card__flag"><img src="assets/flags/' + flagFile + '" alt="' + label + ' 国旗" loading="lazy" width="36" height="27" onerror="this.parentNode.classList.add(\'project-card__flag--unknown\');this.remove();" /></span>';
  }

  card(item) {
    const p = item.p;
    const meta = [];
    meta.push(['学历', item.degree]);
    meta.push(['年龄', item.age ? ((item.age.min != null ? item.age.min : '') + (item.age.min != null && item.age.max != null ? '–' : '') + (item.age.max != null ? item.age.max : '') + ' 岁') : null]);
    meta.push(['语言', item.language]);
    meta.push(['资金', budgetText(p)]);
    meta.push(['更新', p.last_verified_date || null]);
    const metaHtml = meta.map(([k, v]) => `<span class="project-card__meta-item"><em>${k}</em>${v ? v : '<i>未标注</i>'}</span>`).join('');
    return `<article class="project-card" data-reveal>
      <div class="project-card__top">
        ${this.flagHtml(p)}
        <div class="project-card__country"><b>${p.country.cn}</b><small>${p.country.en}</small></div>
        <span class="project-card__type">${p.visaType}</span>
      </div>
      <h3 class="project-card__name">${p.name}</h3>
      <p class="project-card__intro">${(p.introduction || '').slice(0, 110)}${(p.introduction || '').length > 110 ? '…' : ''}</p>
      <div class="project-card__meta">${metaHtml}</div>
      <div class="project-card__foot">
        <span class="project-card__cat">${p.category.name} · ${p.subcategory.name}</span>
        <a class="project-card__btn" href="project-detail.html?id=${encodeURIComponent(p.id)}">查看详情 →</a>
      </div>
    </article>`;
  }

  render() {
    const s = this.state;
    const all = this.index;
    const results = this.currentResults();
    const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
    if (s.page > totalPages) s.page = totalPages;
    const pageItems = results.slice((s.page - 1) * PAGE_SIZE, s.page * PAGE_SIZE);
    const sortOptions = [
      ['recommend', '综合推荐'], ['budget-asc', '资金要求：低 → 高'], ['budget-desc', '资金要求：高 → 低'],
      ['threshold-asc', '申请门槛：低 → 高'], ['updated', '最新更新'], ['lang-asc', '语言要求：低 → 高']
    ].map(([v, l]) => `<option value="${v}"${s.sort === v ? ' selected' : ''}>${l}</option>`).join('');

    this.innerHTML = `
      <div class="projects">
        <header class="projects__head">
          <div class="container projects__head-inner">
            <div data-reveal>
              <p class="projects__eyebrow">Global Opportunity Search</p>
              <h1 class="projects__title">全球机会搜索</h1>
              <p class="projects__sub">按国家、职业、学历、资金、语言与签证类型，快速找到适合你的海外项目</p>
            </div>
            <div class="projects__count" data-reveal>
              <span class="projects__count-num">${all.length}</span>
              <span class="projects__count-label">Programs</span>
            </div>
          </div>
        </header>

        <section class="projects__body">
          <div class="container">
            <div class="search-hero" data-reveal>
              <div class="search-bar">
                <input id="search-q" class="search-input search-input--main" type="search" value="${s.q}" placeholder="搜索国家、项目、签证、职业、行业…（支持中英文）" autocomplete="off" />
                <button class="btn btn--primary" type="button" data-action="search">搜索</button>
                <button class="btn btn--ghost-dark" type="button" data-action="clear-q">清空</button>
              </div>
              <div class="search-hero__row">
                <span class="search-hero__hint">支持模糊搜索 · 中英文关键词 · 多个关键词用空格分隔</span>
                <label class="search-sort">排序
                  <select id="search-sort">${sortOptions}</select>
                </label>
              </div>
            </div>

            <div class="search-panel" data-reveal>
              ${this.countryPicker()}
              ${this.chips(TYPE_OPTIONS, s.types, 'types', '项目类型')}
              ${this.chips(DEGREE_OPTIONS, s.degrees, 'degrees', '学历要求')}
              ${this.chips(LANGUAGE_OPTIONS, s.languages, 'languages', '语言要求')}
              ${this.chips(INDUSTRY_OPTIONS, s.industries, 'industries', '职业与行业')}
              <div class="search-group search-group--inline">
                <p class="search-group__label">年龄与资金</p>
                <div class="search-inline">
                  <label class="search-field">年龄<input id="f-age" type="number" min="14" max="80" value="${s.age}" placeholder="如 30" /></label>
                  <label class="search-field">可投入资金（万元）<input id="f-funds" type="number" min="0" step="1" value="${s.funds}" placeholder="如 10" /></label>
                  <button class="btn btn--ghost-dark" type="button" data-action="apply-num">应用</button>
                </div>
              </div>
              <p class="search-note">说明：学历 / 语言 / 年龄依据各项目「申请要求」文本自动识别，未标注的项目表示原文未明确说明，仅供参考；请以官方要求为准。</p>
            </div>

            ${this.activeFilters()}

            <div class="projects__result-head" data-reveal>
              <p class="projects__result-label">共 <strong>${results.length}</strong> 个匹配项目${results.length ? ' · 第 ' + s.page + ' / ' + totalPages + ' 页' : ''}</p>
            </div>

            ${results.length
              ? `<div class="project-grid">${pageItems.map((it) => this.card(it)).join('')}</div>
                 ${this.pagination(s.page, totalPages)}`
              : `<div class="projects__empty">
                   <h3>没有找到符合条件的项目</h3>
                   <p>可以尝试：减少筛选条件、换用更短的关键词（如「加拿大」「IT」「护士」），或放宽资金/年龄限制。</p>
                   <button class="btn btn--primary" type="button" data-action="reset">清除全部筛选</button>
                 </div>`}
          </div>
        </section>
      </div>`;
  }

  pagination(page, total) {
    if (total <= 1) return '';
    const pages = [];
    const add = (n, label, active) => pages.push(`<button type="button" class="page-btn${active ? ' is-active' : ''}" data-page="${n}">${label || n}</button>`);
    if (page > 1) add(page - 1, '←');
    const start = Math.max(1, page - 2), end = Math.min(total, page + 2);
    if (start > 1) add(1);
    if (start > 2) pages.push('<span class="page-gap">…</span>');
    for (let i = start; i <= end; i++) add(i, null, i === page);
    if (end < total - 1) pages.push('<span class="page-gap">…</span>');
    if (end < total) add(total);
    if (page < total) add(page + 1, '→');
    return `<nav class="pagination" aria-label="分页">${pages.join('')}</nav>`;
  }

  bind() {
    const $ = (sel) => this.querySelector(sel);

    const doSearch = () => { this.state.q = $('#search-q').value.trim(); this.state.page = 1; this.sync({ scrollTo: 'none' }); };
    $('[data-action="search"]').addEventListener('click', doSearch);
    $('#search-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });
    $('[data-action="clear-q"]').addEventListener('click', () => { this.state.q = ''; this.state.page = 1; this.sync({ scrollTo: 'none' }); });
    $('#search-sort').addEventListener('change', (e) => { this.state.sort = e.target.value; this.state.page = 1; this.sync({ scrollTo: 'none' }); });

    this.querySelectorAll('[data-multi]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-multi');
        const val = btn.getAttribute('data-value');
        const arr = this.state[key];
        const i = arr.indexOf(val);
        if (i >= 0) arr.splice(i, 1); else arr.push(val);
        this.state.page = 1;
        this.sync({ scrollTo: 'none' });
      });
    });

    const countrySearch = $('#country-search');
    if (countrySearch) {
      countrySearch.addEventListener('input', () => { this.countryQuery = countrySearch.value; this.renderCountryList(); });
    }
    this.bindCountryCheckboxes();

    const clearCountries = $('[data-clear="countries"]');
    if (clearCountries) clearCountries.addEventListener('click', () => { this.state.countries = []; this.state.page = 1; this.sync({ scrollTo: 'none' }); });

    const applyNum = $('[data-action="apply-num"]');
    if (applyNum) applyNum.addEventListener('click', () => {
      this.state.age = $('#f-age').value.trim();
      this.state.funds = $('#f-funds').value.trim();
      this.state.page = 1;
      this.sync({ scrollTo: 'none' });
    });

    this.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const k = btn.getAttribute('data-remove');
        const v = btn.getAttribute('data-value');
        if (Array.isArray(this.state[k])) this.state[k] = this.state[k].filter((x) => x !== v);
        else this.state[k] = '';
        this.state.page = 1;
        this.sync({ scrollTo: 'none' });
      });
    });

    this.querySelectorAll('[data-action="reset"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state = { q: '', countries: [], types: [], degrees: [], languages: [], industries: [], age: '', funds: '', sort: 'recommend', page: 1 };
        this.countryQuery = '';
        this.sync({ scrollTo: 'none' });
      });
    });

    this.querySelectorAll('[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => { this.state.page = Number(btn.getAttribute('data-page')) || 1; this.sync({ scrollTo: 'results' }); });
    });

    /* 进入项目详情前记录滚动位置，返回时恢复 */
    this.querySelectorAll('.project-card__btn').forEach((a) => {
      a.addEventListener('click', () => this.saveScroll());
    });
  }

  bindCountryCheckboxes() {
    this.querySelectorAll('[data-country]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const id = cb.getAttribute('data-country');
        const arr = this.state.countries;
        const i = arr.indexOf(id);
        if (cb.checked && i < 0) arr.push(id);
        if (!cb.checked && i >= 0) arr.splice(i, 1);
        this.state.page = 1;
        this.sync({ scrollTo: 'none' });
      });
    });
  }

  renderCountryList() {
    const box = this.querySelector('.country-list');
    if (!box) return;
    const q = (this.countryQuery || '').toLowerCase();
    const sel = this.state.countries;
    const list = this.countries.filter((c) => !q || c.cn.toLowerCase().includes(q) || (c.en || '').toLowerCase().includes(q));
    box.innerHTML = list.map((c) => `<label class="country-item${sel.includes(c.id) ? ' is-active' : ''}">
      <input type="checkbox" data-country="${c.id}" ${sel.includes(c.id) ? 'checked' : ''} />
      <span>${c.cn}</span><small>${c.en || ''}</small>
    </label>`).join('') || '<p class="search-empty-tip">未找到国家</p>';
    this.bindCountryCheckboxes();
  }

  sync(options) {
    const opts = options || {};
    const active = document.activeElement;
    const focusId = active && active.id ? active.id : '';
    let selStart = null, selEnd = null;
    try { if (active && active.selectionStart != null) { selStart = active.selectionStart; selEnd = active.selectionEnd; } } catch (e) {}
    const keepY = window.scrollY;
    const s = this.state;
    const params = new URLSearchParams();
    if (s.q) params.set('q', s.q);
    ['countries', 'types', 'degrees', 'languages', 'industries'].forEach((k) => { if (s[k].length) params.set(k, s[k].join(',')); });
    if (s.age) params.set('age', s.age);
    if (s.funds) params.set('funds', s.funds);
    if (s.sort && s.sort !== 'recommend') params.set('sort', s.sort);
    if (s.page > 1) params.set('page', String(s.page));
    const qs = params.toString();
    history.replaceState(null, '', 'projects.html' + (qs ? '?' + qs : ''));
    this.render();
    this.bind();
    Istra.reveal.observe(this);

    /* 恢复输入焦点（搜索框/筛选输入不被重新渲染打断） */
    if (focusId) {
      const el = this.querySelector('#' + focusId);
      if (el) {
        el.focus();
        try { if (selStart != null && el.setSelectionRange) el.setSelectionRange(selStart, selEnd); } catch (e) {}
      }
    }

    /* 滚动策略：默认保持原位置；仅翻页时滚动到结果区顶部 */
    if (opts.scrollTo === 'results') {
      const anchor = this.querySelector('.projects__result-head');
      if (anchor && anchor.scrollIntoView) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo(0, keepY);
    }
  }
}

customElements.define('is-projects', SiteProjects);
