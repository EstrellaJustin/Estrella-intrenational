/* ============================================================
   组件：is-world-map · 全球地图
   数据源：Istra.countries（is_available=true 自动点亮）+ Istra.worldMap
   已点亮 → 国家详情页；未开放 → 建设中提示（数据驱动，支持扩展 195 国）
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

    const pathHtml = (map.paths || [])
      .map((p) => {
        const ok = availIso.has(p.iso);
        return `<path class="map__country${ok ? ' is-available' : ''}" data-iso="${p.iso}" d="${p.d}"${ok ? ' data-link="country.html?id=' + p.iso.toLowerCase() + '"' : ''}><title>${p.name}</title></path>`;
      })
      .join('');

    const withPath = new Set((map.paths || []).map((p) => p.iso));
    const dotHtml = avail
      .filter((c) => !withPath.has(c.id.toUpperCase()))
      .map((c) => {
        const pt = (map.centroids || {})[c.id.toUpperCase()];
        if (!pt) return '';
        const x = ((pt[0] + 180) / 360) * map.width;
        const y = ((90 - pt[1]) / 180) * map.height;
        return `<circle class="map__dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" data-iso="${c.id.toUpperCase()}" data-link="country.html?id=${c.id}"><title>${c.cn}</title></circle>`;
      })
      .join('');

    const total = (map.paths || []).length;

    this.innerHTML = `
      <div class="map">
        <header class="map__head">
          <div class="container">
            <p class="map__eyebrow" data-reveal>Global Map</p>
            <h1 class="map__title" data-reveal>全球地图</h1>
            <p class="map__sub" data-reveal>已建立数据的国家自动点亮，点击进入国家详情；未开放国家保持灰色。</p>
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
              </svg>
              <div class="map__legend">
                <span class="map__legend-item"><span class="map__legend-swatch map__legend-swatch--on"></span>已开放（${avail.length}）</span>
                <span class="map__legend-item"><span class="map__legend-swatch map__legend-swatch--off"></span>建设中</span>
              </div>
            </div>
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
