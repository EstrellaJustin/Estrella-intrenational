/* ============================================================
   组件：is-footer · 页脚（v2）
   ============================================================ */

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const cols = (Istra.footer && Istra.footer.columns || [])
      .map((col) => `
        <div class="footer__col">
          <h3 class="footer__col-title">${col.title}</h3>
          <ul class="footer__col-list">
            ${col.links.map((l) => `<li><a class="footer__col-link" href="${l.href}">${l.label}</a></li>`).join('')}
          </ul>
        </div>
      `)
      .join('');

    const contact = Istra.footer ? Istra.footer.contact : null;
    const contactCol = contact ? `
      <div class="footer__col">
        <h3 class="footer__col-title">联系</h3>
        <ul class="footer__col-list">
          <li><a class="footer__col-link" href="mailto:${contact.email}">${contact.email}</a></li>
          <li><span class="footer__col-link">${contact.label}</span></li>
        </ul>
      </div>
    ` : '';

    this.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer__main">
            <div class="footer__brand">
              <p class="footer__brand-name">
                <img class="footer__brand-mark" src="assets/brand-mark.svg" alt="" width="36" height="36" />
                伊斯特拉国际
              </p>
              <p class="footer__brand-tagline">${Istra.brand.tagline}<br>${Istra.brand.desc}</p>
            </div>
            ${cols}
            ${contactCol}
          </div>
          <div class="legal-note footer__legal-note">
            <p>伊斯特拉国际（Estrella International）为全球信息探索与 AI 辅助分析平台。网站内容来源于公开资料与人工智能辅助整理，仅供信息参考，不构成移民、法律、财务或职业建议；最终申请结果以相关国家政府、官方机构审核为准。</p>
            <a href="disclaimer.html">查看完整免责声明 →</a>
          </div>
          <div class="footer__bottom">
            <span>© 2026 伊斯特拉国际</span>
            <span>高端国际身份规划平台 · 数据与内容仅供展示</span>
          </div>
        </div>
      </footer>
    `;
  }
}
customElements.define('is-footer', SiteFooter);
