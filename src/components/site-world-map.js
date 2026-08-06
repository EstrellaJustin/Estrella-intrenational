/* ============================================================
   组件：is-world-map · 全球地图（v2 · 国旗 + 信息卡 + 区域展开）
   数据源：Istra.countries（flag / is_available）+ Istra.worldMap
   桌面：悬停信息卡 + 国旗；移动：区域展开列表（避免国旗重叠）
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
    const avail = db.filter((c) => c.is_available !== false);
    const availIso = new Set(avail.map((c) => c.id.toUpperCase()));
    const posOf = (iso) => {
      const pt = (map.centroids || {})[iso];
      return pt ? { x: ((pt[0] + 180) / 360) * map.width, y: ((90 - pt[1]) / 180) * map.height } : null;
    };

    const pathHtml = (map.paths || [])
      .map((p) => {
        const ok = availIso.has(p.iso);
        return `<path class="map__country${ok ? ' is-available' : ''}" data-iso="${p.iso}" d="${p.d}"${ok ? ' data-link="country.html?id=' + p.iso.toLowerCase() + '"' : ''}><title>${p.name}</title></path>`;
      })
      .join('');

    const withPath = new Set((map.paths || []).map((p) => p.iso));
    const flagHtml = avail
      .map((c) => {
        const iso = c.id.toUpperCase();
        const pos = posOf(iso);
        if (!pos) return '';
        const kind = withPath.has(iso) ? 'path' : 'dot';
        return `<image class="map__flag" data-iso="${iso}" data-link="country.html?id=${c.id}" href="assets/flags/${c.flag}" x="${(pos.x - 9).toFixed(1)}" y="${(pos.y - 6).toFixed(1)}" width="18" height="12"><title>${c.cn}</title></image>`;
      })
      .join('');

    const dotHtml = avail
      .filter((c) => !withPath.has(c.id.toUpperCase()))
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
            <p class="map__sub" data-reveal>已建立数据的国家自动点亮并显示国旗；未开放国家保持灰色。桌面悬停查看信息，移动端按区域展开。</p>
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
              <svg class="map__canvas" viewBox="0 0 ${map.width} ${map.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="全球地图">
                ${pathHtml}
                ${dotHtml}
                ${flagHtml}
              </svg>
              <div class="map__legend">
                <span class="map__legend-item"><span class="map__legend-swatch map__legend-swatch--on"></span>已开放（${avail.length}）</span>
                <span class="map__legend-item"><span class="map__legend-swatch map__legend-swatch--off"></span>建设中</span>
                <span class="map__legend-item"><span class="map__legend-swatch map__legend-swatch--ai"></span>AI 匹配高亮</span>
              </div>
              <div class="map__tooltip" id="map-tooltip" aria-hidden="true"></div>
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
    this.querySelectorAll('[data-iso]').forEach((el) => {
      el.addEventListener('click', () => {
        const link = el.getAttribute('data-link');
        if (link) { location.href = link; return; }
        const name = el.querySelector('title')?.textContent || '该国家';
        this.toast(`「${name}」数据建设中，敬请期待`);
      });
    });

    /* 桌面：悬停信息卡 */
    const svg = this.querySelector('.map__canvas');
    const panel = this.querySelector('.map__panel');
    const tooltip = this.querySelector('#map-tooltip');
    if (svg && tooltip && panel) {
      let lastIso = '';
      svg.addEventListener('mousemove', (e) => {
        const t = e.target.closest ? e.target.closest('[data-iso]') : null;
        if (!t) { tooltip.classList.remove('is-show'); lastIso = ''; return; }
        const iso = t.getAttribute('data-iso');
        if (iso !== lastIso) {
          lastIso = iso;
          const link = t.getAttribute('data-link');
          const c = (Istra.countries || []).find((x) => x.id.toUpperCase() === iso);
          tooltip.innerHTML = c
            ? `<div class="map__tip-flag"><img src="assets/flags/${c.flag}" alt="${c.cn} 国旗" width="34" height="25" /></div>
               <div class="map__tip-info"><p class="map__tip-name">${c.cn} <small>${c.en}</small></p><p class="map__tip-meta">${c.region} · 已开放</p></div>`
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
