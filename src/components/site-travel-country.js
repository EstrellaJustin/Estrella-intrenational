/* ============================================================
   组件：is-travel-country · 国家旅游详情页（升级版）
   国家概览（7 项）+ 热门城市（5-10 城，链接城市详情）+ 旅行信息 + 特色体验 + 长期发展关联
   ============================================================ */

class SiteTravelCountry extends HTMLElement {
  connectedCallback() {
    this.id = new URLSearchParams(location.search).get('id');
    this.t = (Istra.travel || []).find((x) => x.id === this.id);
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    if (!this.t) { this.renderMissing(); return; }
    const t = this.t;
    const c = t.country;
    const projects = Istra.projects || [];
    const related = (t.relatedProjects || [])
      .map((pid) => projects.find((p) => p.id === pid))
      .filter(Boolean)
      .slice(0, 3);

    /* 城市列表（来自城市数据库） */
    const cities = (Istra.cities || []).filter((x) => x.country.id === t.id);
    const location = cities[0] ? cities[0].location : '';

    this.innerHTML = `
      <div class="tdetail">
        <header class="tdetail__hero">
          <div class="tdetail__hero-bg" style="background-image:url('${t.image}')"></div>
          <div class="container tdetail__hero-inner">
            <nav class="tdetail__crumbs" aria-label="面包屑">
              <a href="index.html">首页</a><span class="sep">/</span>
              <a href="travel.html">旅游探索</a><span class="sep">/</span>
              <span>${c.cn}</span>
            </nav>
            <div class="tdetail__country">
              <span class="tdetail__flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" width="48" height="36" /></span>
              <div>
                <p class="tdetail__country-cn">${c.cn}</p>
                <p class="tdetail__country-en">${c.en} · ${this.regionCn(t.region)}</p>
              </div>
            </div>
            <h1 class="tdetail__title">${c.cn}旅行探索</h1>
            <p class="tdetail__intro">${t.intro}</p>
            <div class="tdetail__facts" data-reveal>
              <span class="tdetail__fact">最佳季节 <b>${t.bestSeason}</b></span>
              <span class="tdetail__fact">气候 <b>${t.climate}</b></span>
              <span class="tdetail__fact">语言 <b>${t.language}</b></span>
              <span class="tdetail__fact">货币 <b>${t.currency}</b></span>
              <span class="tdetail__fact">城市探索 <b>${cities.length} 城</b></span>
            </div>
          </div>
        </header>

        <div class="tdetail__body">
          <div class="container">
            <section class="tdetail__section" data-reveal>
              <h2 class="tdetail__section-title"><span>01</span>国家概览</h2>
              <div class="tdetail__overview">
                <div class="tdetail__ov"><p class="tdetail__ov-label">国家简介</p><p class="tdetail__ov-value"><b>${c.cn}（${c.en}）</b> — ${t.intro}</p></div>
                <div class="tdetail__ov"><p class="tdetail__ov-label">地理位置</p><p class="tdetail__ov-value">${location}</p></div>
                <div class="tdetail__ov"><p class="tdetail__ov-label">气候特点</p><p class="tdetail__ov-value">${t.climate}</p></div>
                <div class="tdetail__ov"><p class="tdetail__ov-label">最佳旅游时间</p><p class="tdetail__ov-value">${t.bestSeason}</p></div>
                <div class="tdetail__ov"><p class="tdetail__ov-label">文化特色</p><p class="tdetail__ov-value">${(t.culture || []).join('、')}</p></div>
                <div class="tdetail__ov"><p class="tdetail__ov-label">货币</p><p class="tdetail__ov-value">${t.currency}</p></div>
                <div class="tdetail__ov"><p class="tdetail__ov-label">语言</p><p class="tdetail__ov-value">${t.language}</p></div>
              </div>
            </section>

            <section class="tdetail__section" data-reveal>
              <h2 class="tdetail__section-title"><span>02</span>热门城市 · 全球城市探索</h2>
              <p class="tdetail__city-hint">每个城市都有独立详情页：城市介绍、景点、游玩攻略、旅行预算与签证推荐。</p>
              <div class="tdetail__cities">
                ${cities.map((city) => `
                  <a class="tdetail__city" href="travel-city.html?id=${city.id}">
                    <span class="tdetail__city-thumb"><img src="${city.image}" alt="${city.city} 实景" loading="lazy" width="72" height="54" /></span>
                    <div>
                      <p class="tdetail__city-name">${city.city}</p>
                      <p class="tdetail__city-note">${city.note}</p>
                    </div>
                    <span class="tdetail__city-cta">进入城市 →</span>
                  </a>`).join('')}
              </div>
            </section>

            <section class="tdetail__section" data-reveal>
              <h2 class="tdetail__section-title"><span>03</span>旅行信息</h2>
              <div class="tdetail__overview">
                <div class="tdetail__ov"><p class="tdetail__ov-label">签证要求</p><p class="tdetail__ov-value">${t.visaInfo}</p></div>
                <div class="tdetail__ov"><p class="tdetail__ov-label">建议旅行时间</p><p class="tdetail__ov-value">${t.duration}</p></div>
                <div class="tdetail__ov"><p class="tdetail__ov-label">预算范围</p><p class="tdetail__ov-value">${t.budget}</p></div>
                <div class="tdetail__ov"><p class="tdetail__ov-label">交通方式</p><p class="tdetail__ov-value">${t.transport}</p></div>
                <div class="tdetail__ov"><p class="tdetail__ov-label">住宿建议</p><p class="tdetail__ov-value">${t.accommodation}</p></div>
              </div>
            </section>

            <section class="tdetail__section" data-reveal>
              <h2 class="tdetail__section-title"><span>04</span>特色体验</h2>
              <div class="tdetail__exp">
                <div class="tdetail__exp-item">
                  <p class="tdetail__exp-label">文化体验</p>
                  <ul class="tdetail__exp-list">${(t.culture || []).map((x) => `<li>${x}</li>`).join('')}</ul>
                </div>
                <div class="tdetail__exp-item">
                  <p class="tdetail__exp-label">自然与景点</p>
                  <ul class="tdetail__exp-list">${(t.attractions || []).map((x) => `<li>${x}</li>`).join('')}</ul>
                </div>
                <div class="tdetail__exp-item">
                  <p class="tdetail__exp-label">地道美食</p>
                  <ul class="tdetail__exp-list">${(t.food || []).map((x) => `<li>${x}</li>`).join('')}</ul>
                </div>
              </div>
            </section>

            <section class="tdetail__section" data-reveal>
              <h2 class="tdetail__section-title"><span>05</span>长期发展关联</h2>
              <p class="tdetail__related-hint">如果喜欢这个国家，可以进一步了解它的留学、工作与长期居留项目——仅供您参考，不构成任何建议。</p>
              <div class="tdetail__related-list">
                ${related.map((p) => `
                  <a class="tdetail__related-item" href="project-detail.html?id=${p.id}">
                    <img src="assets/flags/${p.country.flag}" alt="" width="34" height="25" />
                    <div>
                      <p class="tdetail__related-name">${p.name}</p>
                      <p class="tdetail__related-type">${p.visaType} · ${p.category.name}</p>
                    </div>
                    <span class="tdetail__related-cta">查看详情 →</span>
                  </a>`).join('')}
              </div>
            </section>

            <p class="tdetail__note">* 旅游信息为探索参考，签证、费用与政策以各国官方最新公布为准。</p>
          </div>
        </div>
      </div>
    `;
  }

  renderMissing() {
    this.innerHTML = `
      <div class="detail__missing">
        <h1>未找到该目的地</h1>
        <p>请返回全球旅游探索重新选择。</p>
        <a class="btn btn--primary" href="travel.html">返回旅游探索</a>
      </div>
    `;
  }

  regionCn(region) {
    return { ASIA: '亚洲', EUROPE: '欧洲', 'NORTH AMERICA': '北美洲', 'SOUTH AMERICA': '南美洲', OCEANIA: '大洋洲', AFRICA: '非洲', 'MIDDLE EAST': '中东' }[region] || region;
  }
}

customElements.define('is-travel-country', SiteTravelCountry);
