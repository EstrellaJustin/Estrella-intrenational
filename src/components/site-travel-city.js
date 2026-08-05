/* ============================================================
   组件：is-travel-city · 城市详情页（全球城市探索系统）
   城市介绍 / 城市风景 / 游玩攻略 / 旅行预算 / 适合季节 / 签证推荐 / 如果你喜欢这里
   ============================================================ */

class SiteTravelCity extends HTMLElement {
  connectedCallback() {
    this.id = new URLSearchParams(location.search).get('id');
    this.city = (Istra.cities || []).find((x) => x.id === this.id);
    this.render();
    Istra.reveal.observe(this);
  }

  render() {
    if (!this.city) { this.renderMissing(); return; }
    const city = this.city;
    const c = city.country;
    const projects = Istra.projects || [];
    const related = (city.relatedProjects || [])
      .map((pid) => projects.find((p) => p.id === pid))
      .filter(Boolean)
      .slice(0, 3);

    const seasonOrder = [
      { k: 'spring', label: '春季' }, { k: 'summer', label: '夏季' },
      { k: 'autumn', label: '秋季' }, { k: 'winter', label: '冬季' }
    ];

    this.innerHTML = `
      <div class="city">
        <header class="city__hero">
          <div class="city__hero-bg" style="background-image:url('${city.image}')"></div>
          <div class="container city__hero-inner">
            <nav class="city__crumbs" aria-label="面包屑">
              <a href="index.html">首页</a><span class="sep">/</span>
              <a href="travel.html">旅游探索</a><span class="sep">/</span>
              <a href="travel-country.html?id=${c.id}">${c.cn}</a><span class="sep">/</span>
              <span>${city.city}</span>
            </nav>
            <div class="city__country">
              <span class="city__flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" width="44" height="33" /></span>
              <span class="city__country-name">${c.cn} · ${c.en}</span>
            </div>
            <h1 class="city__title">${city.city}</h1>
            <p class="city__tagline">${city.note}</p>
          </div>
        </header>

        <div class="city__body">
          <div class="container">
            <section class="city__section" data-reveal>
              <h2 class="city__section-title"><span>01</span>城市介绍</h2>
              <div class="city__overview">
                <div class="city__ov city__ov--full"><p class="city__ov-label">城市定位</p><p class="city__ov-value">${city.description}</p></div>
                <div class="city__ov"><p class="city__ov-label">人口</p><p class="city__ov-value">${city.population}</p></div>
                <div class="city__ov"><p class="city__ov-label">经济地位</p><p class="city__ov-value">${city.features[0]}${city.features.length > 1 ? '，' + city.features[1] : ''}</p></div>
                <div class="city__ov"><p class="city__ov-label">城市特色</p><p class="city__ov-value">${city.features.join(' · ')}</p></div>
                <div class="city__ov"><p class="city__ov-label">适合人群</p><p class="city__ov-value">${(city.suitable || []).join('、')}</p></div>
              </div>
            </section>

            <section class="city__section" data-reveal>
              <h2 class="city__section-title"><span>02</span>城市风景</h2>
              <div class="city__spots">
                ${(city.attractions || []).map((a) => `
                  <div class="city__spot">
                    <div class="city__spot-media"><img src="${a.image}" alt="${a.name}" loading="lazy" /><span class="city__spot-time">${a.time}</span></div>
                    <div class="city__spot-body">
                      <h3 class="city__spot-name">${a.name}</h3>
                      <p class="city__spot-intro">${a.intro}</p>
                    </div>
                  </div>`).join('')}
              </div>
            </section>

            <section class="city__section" data-reveal>
              <h2 class="city__section-title"><span>03</span>游玩攻略</h2>
              <div class="city__routes">
                ${(city.routes || []).map((r, i) => `
                  <div class="city__route">
                    <div class="city__route-head">
                      <span class="city__route-tag">Route ${String(i + 1).padStart(2, '0')}</span>
                      <h3 class="city__route-name">${r.name}</h3>
                    </div>
                    <ul class="city__route-items">
                      ${r.items.map((it) => `<li>${it}</li>`).join('')}
                    </ul>
                  </div>`).join('')}
              </div>
            </section>

            <section class="city__section" data-reveal>
              <h2 class="city__section-title"><span>04</span>旅行预算</h2>
              <div class="city__budget">
                ${(city.budget.levels || []).map((lv) => `
                  <div class="city__budget-level">
                    <div class="city__budget-head">
                      <h3 class="city__budget-name">${lv.name}</h3>
                      <span class="city__budget-daily">${lv.daily}</span>
                    </div>
                    <div class="city__budget-items">
                      ${Object.entries(lv.items).map(([k, v]) => `<div class="city__budget-row"><span>${k}</span><b>${v}</b></div>`).join('')}
                    </div>
                  </div>`).join('')}
              </div>
            </section>

            <section class="city__section" data-reveal>
              <h2 class="city__section-title"><span>05</span>适合旅行季节</h2>
              <div class="city__seasons">
                ${seasonOrder.map((s) => `
                  <div class="city__season">
                    <p class="city__season-label">${s.label}</p>
                    <p class="city__season-tip">${(city.seasonTips || {})[s.k] || '四季皆宜'}</p>
                  </div>`).join('')}
              </div>
              <p class="city__season-note">最佳旅行时间：${city.bestSeason} · 气候：${city.climate}</p>
            </section>

            <section class="city__section" data-reveal>
              <h2 class="city__section-title"><span>06</span>签证推荐</h2>
              <div class="city__visa">
                <div class="city__visa-grid">
                  <div class="city__visa-item"><p class="city__visa-label">签证类型</p><p class="city__visa-value">${city.visaRecommendation.type}</p></div>
                  <div class="city__visa-item"><p class="city__visa-label">适合</p><p class="city__visa-value">${city.visaRecommendation.suitable}</p></div>
                  <div class="city__visa-item"><p class="city__visa-label">申请周期</p><p class="city__visa-value">${city.visaRecommendation.period}</p></div>
                  <div class="city__visa-item"><p class="city__visa-label">停留时间</p><p class="city__visa-value">${city.visaRecommendation.stay}</p></div>
                </div>
                <div class="city__visa-conditions">
                  <p class="city__visa-conditions-title">申请条件</p>
                  <ul class="city__visa-list">
                    ${(city.visaRecommendation.conditions || []).map((x) => `<li>${x}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </section>

            <section class="city__section" data-reveal>
              <h2 class="city__section-title"><span>07</span>如果你喜欢这里</h2>
              <p class="city__related-hint">喜欢${city.city}？可以进一步了解${c.cn}的留学、工作与长期居留项目——作为自然关联入口，供您参考。</p>
              <div class="city__related">
                ${related.map((p) => `
                  <a class="city__related-item" href="project-detail.html?id=${p.id}">
                    <img src="assets/flags/${p.country.flag}" alt="" width="34" height="25" />
                    <div>
                      <p class="city__related-name">${p.name}</p>
                      <p class="city__related-type">${p.visaType} · ${p.category.name}</p>
                    </div>
                    <span class="city__related-cta">查看详情 →</span>
                  </a>`).join('')}
              </div>
            </section>

            <p class="city__note">* 城市与旅行信息为探索参考，人口、预算与政策数据以当地官方最新公布为准。</p>
          </div>
        </div>
      </div>
    `;
  }

  renderMissing() {
    this.innerHTML = `
      <div class="detail__missing">
        <h1>未找到该城市</h1>
        <p>请返回旅游探索选择国家与城市。</p>
        <a class="btn btn--primary" href="travel.html">返回旅游探索</a>
      </div>
    `;
  }
}

customElements.define('is-travel-city', SiteTravelCity);
