/* 登录页脚本 */
document.title = '登录 · ' + Istra.brand.cn;
Istra.reveal.observe(document);

(function () {
  const form = document.getElementById('login-form');
  const err = document.getElementById('login-error');
  const next = new URLSearchParams(location.search).get('next') || 'profile.html';

  /* 已登录直接进入个人中心 */
  if (Istra.auth.loggedIn()) { location.href = 'profile.html'; return; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.classList.remove('is-show');
    const account = form.querySelector('#lg-account').value.trim();
    const password = form.querySelector('#lg-password').value;
    try {
      const data = await Istra.api.login({ account, password });
      Istra.auth.setToken(data.token);
      location.href = next;
    } catch (ex) {
      err.textContent = ex.message;
      err.classList.add('is-show');
    }
  });
})();
