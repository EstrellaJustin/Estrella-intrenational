/* ============================================================
   组件：is-navbar · 顶部导航
   固定导航 / 首屏透明 / 滚动后深色毛玻璃 / 移动端抽屉
   ============================================================ */

class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.page = this.getAttribute('page') || 'home';
    this.render();
    this.bind();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.onScroll);
  }

  render() {
    const links = (Istra.nav || [])
      .map((item) => {
        const active = item.page === this.page ? ' aria-current="page"' : '';
        return `<li><a class="nav__link" href="${item.href}"${active}>${item.label}</a></li>`;
      })
      .join('');

    const menuLinks = (Istra.nav || [])
      .map((item) => {
        const active = item.page === this.page ? ' aria-current="page"' : '';
        return `
          <li>
            <a class="menu__link" href="${item.href}"${active}>
              <span>${item.label}</span>
              <small>${item.en}</small>
            </a>
          </li>`;
      })
      .join('');

    this.innerHTML = `
      <div class="container nav">
        <a class="brand" href="index.html" aria-label="伊斯特拉国际 · 返回首页">
          <img class="brand__mark" src="assets/logo.jpg" alt="" width="40" height="40" />
          <span class="brand__name">
            <span class="brand__cn">伊斯特拉国际</span>
            <span class="brand__en">Estrella International</span>
          </span>
        </a>

        <nav aria-label="主导航">
          <ul class="nav__links">${links}<li class="nav__qq">售后客服 QQ：3279331550<br>伊斯特拉国际交流群：978638092</li></ul>
        </nav>

        <a class="nav__account" href="login.html" data-account-entry>登录</a>


        <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="打开菜单">
          ${Istra.icon('menu')}
        </button>
      </div>

      <div class="menu" id="site-menu" aria-hidden="true">
        <ul class="menu__list">${menuLinks}<li class="menu__qq">售后客服 QQ：3279331550<br>伊斯特拉国际交流群：978638092</li></ul>
        <a class="menu__account" href="login.html" data-account-entry>登录</a>
        <p class="menu__foot">ESTRELLA INTERNATIONAL · GLOBAL DEVELOPMENT</p>
      </div>
    `;

    const acc = this.querySelector('[data-account-entry]');
    if (acc) {
      let token = '';
      try { token = localStorage.getItem('istra_token') || ''; } catch (e) {}
      acc.href = token ? 'profile.html' : 'login.html';
      acc.textContent = token ? '个人中心' : '登录';
    }

    this.toggle = this.querySelector('.nav__toggle');
    this.menu = this.querySelector('.menu');
  }

  bind() {
    this.onScroll = () => this.classList.toggle('is-scrolled', window.scrollY > 24);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();

    this.toggle.addEventListener('click', () => this.toggleMenu());
    this.menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) this.closeMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMenu();
    });
  }

  toggleMenu() {
    const open = this.menu.classList.toggle('is-open');
    this.toggle.setAttribute('aria-expanded', String(open));
    this.toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    this.menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    this.toggle.innerHTML = open ? Istra.icon('close') : Istra.icon('menu');
  }

  closeMenu() {
    if (!this.menu.classList.contains('is-open')) return;
    this.menu.classList.remove('is-open');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.setAttribute('aria-label', '打开菜单');
    this.menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.toggle.innerHTML = Istra.icon('menu');
  }
}

customElements.define('is-navbar', SiteNavbar);



