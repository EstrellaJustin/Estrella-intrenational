/* ============================================================
   组件：is-world-map · 全球地图（v3 · 国旗区域填充 + 缩放平移 + 国家信息卡）
   数据源：Istra.countries（flag / is_available）+ Istra.worldMap
   + Istra.countryCities / Istra.countryScenery / Istra.mapCountryInfo / Istra.projects
   - 真实国家边界路径用对应国旗元素填充（不使用固定国旗图标代替）
   - 滚轮缩放 / 拖拽平移 / 触屏双指缩放
   - 点击国家弹出信息卡：城市与风景 / 气候环境 / 工作机会 / 签证项目 / 详情入口
   预留：highlight(isoList) 供未来 AI 匹配高亮
   ============================================================ */

class SiteWorldMap extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bind();
    Istra.reveal.observe(this);
  }

  render() {
    const db = Istra.countries || [];
    const map = Istra.worldMap || { paths: [], centroids: {}, width: 2000, height: 1000 };
    const W = map.width;
    const H = map.height;
    const avail = db.filter((c) => c.is_available !== false);
    const availIso = new Set(avail.map((c) => c.id.toUpperCase()));
    const posOf = (iso) => {
      const pt = (map.centroids || {})[iso];
      return pt ? { x: ((pt[0] + 180) / 360) * W, y: ((90 - pt[1]) / 180) * H } : null;
    };

    const withPath = new Set((map.paths || []).map((p) => p.iso));

    /* 国旗图案定义：有真实边界的国家，区域用对应国旗元素填充 */
    const patternDefs = avail
      .filter((c) => withPath.has(c.id.toUpperCase()))
      .map((c) => {
        const iso = c.id.toUpperCase();
        return `<pattern id="flag-${iso}" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" width="1" height="1"><image href="assets/flags/${c.flag}" width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>`;
      })
      .join('');

    const pathHtml = (map.paths || [])
      .map((p) => {
        const ok = availIso.has(p.iso);
        return `<path class="map__country${ok ? ' is-available' : ''}" data-iso="${p.iso}" d="${p.d}"${ok ? ` style="fill:url(#flag-${p.iso})" data-link="country.html?id=${p.iso.toLowerCase()}"` : ''}><title>${p.name}</title></path>`;
      })
      .join('');

    /* 无真实路径的小国：保留中心点 + 国旗标记（如新加坡/马耳他） */
    const dotFlag = avail.filter((c) => !withPath.has(c.id.toUpperCase()));
    const flagHtml = dotFlag
      .map((c) => {
        const iso = c.id.toUpperCase();
        const pos = posOf(iso);
        if (!pos) return '';
        return `<image class="map__flag" data-iso="${iso}" data-link="country.html?id=${c.id}" href="assets/flags/${c.flag}" x="${(pos.x - 9).toFixed(1)}" y="${(pos.y - 6).toFixed(1)}" width="18" height="12"><title>${c.cn}</title></image>`;
      })
      .join('');

    const dotHtml = dotFlag
      .map((c) => {
        const pos = posOf(c.id.toUpperCase());
        if (!pos) return '';
        return `<circle class="map__dot" cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="4" data-iso="${c.id.toUpperCase()}" data-link="country.html?id=${c.id}"><title>${c.cn}</title></circle>`;
      })
      .join('');

    /* 区域分组（移动端展开列表） */
    const regionOrder = ['ASIA', 'EUROPE', 'NORTH AMERICA', 'SOUTH AMERICA', 'OCEANIA', 'AFRICA', 'MIDDLE EAST'];
    const regionCn = { ASIA: '亚洲', EUROPE: '欧洲', 'NORTH AMERICA': '北美洲', 'SOUTH AMERICA': '南美洲', OCEANIA: '大洋洲', AFRICA: '非洲', 'MIDDLE EAST': '中东' };
    const regionHtml = regionOrder
      .map((r, ri) => {
        const list = avail.filter((c) => c.region === r);
        if (!list.length) return '';
        return `
          <div class="map__region" data-region="${r}">
            <button type="button" class="map__region-head" aria-expanded="${ri === 0 ? 'true' : 'false'}">
              <span>${regionCn[r] || r}</span>
              <small>${list.length} 国</small>
            </button>
            <div class="map__region-body" style="display:${ri === 0 ? 'block' : 'none'}">
              <div class="map__region-list">
                ${list.map((c) => `
                  <a class="map__region-item" href="country.html?id=${c.id}">
                    <img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" width="24" height="18" />
                    <span class="map__region-name">${c.cn}</span>
                    <small>${c.en}</small>
                  </a>`).join('')}
              </div>
            </div>
          </div>`;
      })
      .join('');

    const total = (map.paths || []).length;

    this.innerHTML = `
      <div class="map">
        <header class="map__head">
          <div class="container">
            <p class="map__eyebrow" data-reveal>Global Map</p>
            <h1 class="map__title" data-reveal>全球地图</h1>
            <p class="map__sub" data-reveal>已收录国家以真实边界 + 国旗元素点亮，点击国家查看城市、气候与项目信息；支持滚轮缩放与拖拽。</p>
          </div>
        </header>
        <div class="map__body">
          <div class="container">
            <div class="map__stats" data-reveal>
              <div class="map__stat"><p class="map__stat-num">${avail.length}</p><p class="map__stat-label">已点亮国家</p></div>
              <div class="map__stat"><p class="map__stat-num">${total}</p><p class="map__stat-label">地图收录国家</p></div>
              <div class="map__stat"><p class="map__stat-num">${total - avail.length + (avail.length - withPath.size)}</p><p class="map__stat-label">建设中</p></div>
            </div>
            <div class="map__panel" data-reveal>
              <svg class="map__canvas" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="全球地图">
                <defs>${patternDefs}</defs>
                ${pathHtml}
                ${dotHtml}
                ${flagHtml}
              </svg>
              <div class="map__zoom" aria-label="地图缩放">
                <button type="button" class="map__zoom-btn" data-zoom="in" aria-label="放大">＋</button>
                <button type="button" class="map__zoom-btn" data-zoom="out" aria-label="缩小">−</button>
                <button type="button" class="map__zoom-btn" data-zoom="reset" aria-label="复位">⌂</button>
              </div>
              <div class="map__legend">
                <span class="map__legend-item"><span class="map__legend-swatch map__legend-swatch--on"></span>已开放（${avail.length}）</span>
                <span class="map__legend-item"><span class="map__legend-swatch map__legend-swatch--off"></span>建设中</span>
                <span class="map__legend-item"><span class="map__legend-swatch map__legend-swatch--ai"></span>AI 匹配高亮</span>
              </div>
              <div class="map__tooltip" id="map-tooltip" aria-hidden="true"></div>
              <div class="map__card" id="map-card" aria-hidden="true"></div>
            </div>

            <section class="map__regions" aria-label="国家区域">
              ${regionHtml}
            </section>

            <p class="map__note">* 地图数据来自全球国家数据库与开放地图数据（Natural Earth）；未开放国家点击后将提示建设中，持续扩充中。</p>
          </div>
        </div>
        <div class="map__toast" id="map-toast" role="status"></div>
      </div>
    `;
  }

  bind() {
    const svg = this.querySelector('.map__canvas');
    const panel = this.querySelector('.map__panel');
    const tooltip = this.querySelector('#map-tooltip');
    const map = Istra.worldMap || { width: 2000, height: 1000 };

    /* ---------- 视图：viewBox 缩放 / 平移 ---------- */
    this._vb = { x: 0, y: 0, w: map.width, h: map.height };
    this._k = 1;
    this._dragged = false;
    const clampVb = () => {
      this._vb.x = Math.min(Math.max(0, this._vb.x), map.width - this._vb.w);
      this._vb.y = Math.min(Math.max(0, this._vb.y), map.height - this._vb.h);
    };
    const applyView = () => {
      svg.setAttribute('viewBox', `${this._vb.x.toFixed(2)} ${this._vb.y.toFixed(2)} ${this._vb.w.toFixed(2)} ${this._vb.h.toFixed(2)}`);
    };
    this._setZoom = (k, clientX, clientY) => {
      const rect = svg.getBoundingClientRect();
      const mx = rect.width ? (clientX - rect.left) / rect.width : 0.5;
      const my = rect.height ? (clientY - rect.top) / rect.height : 0.5;
      const k2 = Math.min(12, Math.max(1, k));
      const w2 = map.width / k2;
      const h2 = map.height / k2;
      const px = this._vb.x + mx * this._vb.w;
      const py = this._vb.y + my * this._vb.h;
      this._vb.w = w2;
      this._vb.h = h2;
      this._vb.x = px - mx * w2;
      this._vb.y = py - my * h2;
      clampVb();
      this._k = k2;
      applyView();
    };
    this._resetView = () => {
      this._vb = { x: 0, y: 0, w: map.width, h: map.height };
      this._k = 1;
      applyView();
    };

    /* 滚轮缩放 */
    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      this._setZoom(this._k * (e.deltaY < 0 ? 1.25 : 0.8), e.clientX, e.clientY);
    }, { passive: false });

    /* 指针：拖拽平移 + 双指缩放（桌面/移动通用） */
    const ptrs = new Map();
    let pinchStart = null;
    svg.addEventListener('pointerdown', (e) => {
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* pointer may be released */ }
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      svg.classList.add('is-dragging');
      if (ptrs.size === 2) {
        const arr = [...ptrs.values()];
        pinchStart = {
          dist: Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y),
          midX: (arr[0].x + arr[1].x) / 2,
          midY: (arr[0].y + arr[1].y) / 2,
          k: this._k
        };
      }
    });
    svg.addEventListener('pointermove', (e) => {
      const p = ptrs.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) this._dragged = true;
      p.x = e.clientX;
      p.y = e.clientY;
      if (ptrs.size === 1) {
        if (pinchStart) pinchStart = null;
        const rect = svg.getBoundingClientRect();
        if (rect.width) {
          this._vb.x -= (dx / rect.width) * this._vb.w;
          this._vb.y -= (dy / rect.height) * this._vb.h;
          clampVb();
          applyView();
        }
      } else if (ptrs.size === 2 && pinchStart) {
        const arr = [...ptrs.values()];
        const dist = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
        const midX = (arr[0].x + arr[1].x) / 2;
        const midY = (arr[0].y + arr[1].y) / 2;
        this._setZoom(Math.min(12, Math.max(1, pinchStart.k * (dist / Math.max(1, pinchStart.dist)))), midX, midY);
      }
    });
    const endPointer = (e) => {
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinchStart = null;
      if (!ptrs.size) svg.classList.remove('is-dragging');
    };
    svg.addEventListener('pointerup', endPointer);
    svg.addEventListener('pointercancel', endPointer);

    /* 缩放控件 */
    this.querySelectorAll('[data-zoom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rect = svg.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const z = btn.getAttribute('data-zoom');
        if (z === 'in') this._setZoom(this._k * 1.5, cx, cy);
        else if (z === 'out') this._setZoom(this._k / 1.5, cx, cy);
        else this._resetView();
      });
    });

        /* 国家点击：可用 → 信息卡；未开放 → 建设中
       （指针捕获会把 click 重定向到 svg，因此统一在 svg 上处理，
         并在 pointerdown 记录原始国家目标，确保拿到正确标识） */
    this._downIso = null;
    this.querySelectorAll('[data-iso]').forEach((el) => {
      el.addEventListener('pointerdown', () => {
        this._downIso = el.getAttribute('data-iso');
      });
    });
    svg.addEventListener('click', (e) => {
      if (this._dragged) { this._dragged = false; this._downIso = null; return; }
      const fallback = e.target && e.target.closest ? e.target.closest('[data-iso]') : null;
      const iso = this._downIso || (fallback ? fallback.getAttribute('data-iso') : null);
      this._downIso = null;
      if (!iso) return;
      const el = this.querySelector('[data-iso="' + iso + '"]');
      const link = el ? el.getAttribute('data-link') : '';
      if (link) { this.openCard(iso); return; }
      const name = (el && el.querySelector('title')) ? el.querySelector('title').textContent : '该国家';
      this.toast('「' + name + '」数据建设中，敬请期待');
    });

    /* 桌面：悬停信息卡 */
    if (svg && tooltip && panel) {
      let lastIso = '';
      svg.addEventListener('mousemove', (e) => {
        const t = e.target.closest ? e.target.closest('[data-iso]') : null;
        if (!t) { tooltip.classList.remove('is-show'); lastIso = ''; return; }
        const iso = t.getAttribute('data-iso');
        if (iso !== lastIso) {
          lastIso = iso;
          const c = (Istra.countries || []).find((x) => x.id.toUpperCase() === iso);
          tooltip.innerHTML = c
            ? `<div class="map__tip-flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" width="34" height="25" /></div>
               <div class="map__tip-info"><p class="map__tip-name">${c.cn} <small>${c.en}</small></p><p class="map__tip-meta">${c.region} · 已开放 · 点击查看详情</p></div>`
            : `<div class="map__tip-info"><p class="map__tip-name">${t.querySelector('title')?.textContent || iso}</p><p class="map__tip-meta">建设中</p></div>`;
        }
        const rect = panel.getBoundingClientRect();
        let x = e.clientX - rect.left + 16;
        let y = e.clientY - rect.top + 14;
        const tw = tooltip.offsetWidth || 200;
        const th = tooltip.offsetHeight || 70;
        if (x + tw > rect.width - 8) x = e.clientX - rect.left - tw - 12;
        if (y + th > rect.height - 8) y = e.clientY - rect.top - th - 10;
        tooltip.style.left = Math.max(4, x) + 'px';
        tooltip.style.top = Math.max(4, y) + 'px';
        tooltip.classList.add('is-show');
      });
      svg.addEventListener('mouseleave', () => { tooltip.classList.remove('is-show'); lastIso = ''; });
    }

    /* 移动端：区域展开 */
    this.querySelectorAll('.map__region-head').forEach((btn) => {
      btn.addEventListener('click', () => {
        const region = btn.closest('.map__region');
        const body = region.querySelector('.map__region-body');
        const open = body.style.display !== 'none';
        body.style.display = open ? 'none' : 'block';
        btn.setAttribute('aria-expanded', String(!open));
      });
    });

    /* Esc 关闭信息卡 */
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeCard(); });
  }

  /* 国家信息卡 */
  openCard(iso) {
    const c = (Istra.countries || []).find((x) => x.id.toUpperCase() === iso);
    const card = this.querySelector('#map-card');
    if (!c || !card) return;
    card.innerHTML = this.cardHtml(c);
    card.classList.add('is-show');
    card.setAttribute('aria-hidden', 'false');
    const close = card.querySelector('.map__card-close');
    if (close) close.addEventListener('click', () => this.closeCard());
  }

  closeCard() {
    const card = this.querySelector('#map-card');
    if (!card) return;
    card.classList.remove('is-show');
    card.setAttribute('aria-hidden', 'true');
  }

  cardHtml(c) {
    const cities = (Istra.countryCities || []).filter((x) => x.country_id === c.id);
    const scenery = (Istra.countryScenery || []).filter((x) => x.country_id === c.id);
    const info = (Istra.mapCountryInfo || []).find((x) => x.id === c.id);
    const projects = Istra.projects || [];
    const employment = (Istra.mapEmployment || []).find((x) => x.id === c.id);
    const visaCats = ['pr', 'invest', 'talent', 'family', 'nomad', 'youth', 'special'];
    const visa = projects.filter((p) => p.country.id === c.id && visaCats.includes(p.category.id)).slice(0, 3);

    const placeRow = (x, imgKey, nameKey, descKey, alt) => `
      <div class="map__card-item">
        <span class="map__card-thumb"><img src="${x[imgKey]}" alt="${x[nameKey]} ${alt}" loading="lazy" /></span>
        <div class="map__card-item-body">
          <p class="map__card-item-name">${x[nameKey]}</p>
          <p class="map__card-item-desc">${x[descKey]}</p>
        </div>
      </div>`;
        const projRow = (p) => `
      <a class="map__card-proj" href="project-detail.html?id=${p.id}">
        <span class="map__card-proj-top">
          <span class="map__card-proj-name">${p.name}</span>
          <span class="map__card-proj-type">${p.visaType}</span>
        </span>
        ${p.targetUsers && p.targetUsers.length ? '<span class="map__card-proj-meta">适合：' + p.targetUsers[0] + '</span>' : ''}
        <span class="map__card-proj-desc">${p.introduction || ''}</span>
      </a>`;

    return `
      <div class="map__card-head">
        <span class="map__card-flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" /></span>
        <div class="map__card-titlebox">
          <p class="map__card-title">${c.cn}</p>
          <p class="map__card-sub">${c.en} · ${c.region}</p>
        </div>
        <button type="button" class="map__card-close" aria-label="关闭">×</button>
      </div>
      <div class="map__card-body">
        <section class="map__card-sec">
          <h3 class="map__card-sec-title"><span>01</span>城市与风景</h3>
          ${cities.length ? `<div class="map__card-subhead">热门城市</div><div class="map__card-list">${cities.map((x) => placeRow(x, 'image', 'city_name', 'description', '城市实景')).join('')}</div>` : ''}
          ${scenery.length ? `<div class="map__card-subhead">代表风景</div><div class="map__card-list">${scenery.map((x) => placeRow(x, 'image', 'name', 'description', '实景')).join('')}</div>` : ''}
        </section>
        <section class="map__card-sec">
          <h3 class="map__card-sec-title"><span>02</span>气候环境</h3>
          <div class="map__card-facts">
            <div class="map__card-fact"><span>气候特点</span><p>${info ? info.climate : '—'}</p></div>
            <div class="map__card-fact"><span>最佳季节</span><p>${info ? info.bestSeason : '—'}</p></div>
          </div>
        </section>
                <section class="map__card-sec">
          <h3 class="map__card-sec-title"><span>03</span>工作就业机会</h3>
          <div class="map__card-facts">
            <div class="map__card-fact"><span>热门行业</span><p>${employment ? employment.hotIndustries.join('、') : '—'}</p></div>
            <div class="map__card-fact"><span>紧缺职业</span><p>${employment ? employment.inDemandJobs.join('、') : '—'}</p></div>
            <div class="map__card-fact"><span>平均薪资</span><p>${employment ? employment.salary : '—'}</p></div>
            <div class="map__card-fact"><span>就业特点</span><p>${employment ? employment.features.join('；') : '—'}</p></div>
          </div>
        </section>
        <section class="map__card-sec">
          <h3 class="map__card-sec-title"><span>04</span>签证与移民项目</h3>
          <div class="map__card-projs">${visa.length ? visa.map(projRow).join('') : '<p class="map__card-empty">暂无收录</p>'}</div>
        </section>
      </div>
      <div class="map__card-foot">
        <a class="btn btn--primary" href="country.html?id=${c.id}">进入国家详情页 <span class="btn-arrow">→</span></a>
      </div>
    `;
  }

  /* 未来 AI 匹配高亮：highlight(['US','JP',...]) */
  highlight(isoList) {
    const set = new Set((isoList || []).map((i) => String(i).toUpperCase()));
    this.querySelectorAll('[data-iso]').forEach((el) => {
      el.classList.toggle('is-ai-highlight', set.has(el.getAttribute('data-iso')));
    });
  }

  toast(msg) {
    const el = this.querySelector('#map-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('is-show'), 2600);
  }
}

customElements.define('is-world-map', SiteWorldMap);