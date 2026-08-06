/* 注册页脚本 */
document.title = '注册 · ' + Istra.brand.cn;
Istra.reveal.observe(document);

(function () {
  const form = document.getElementById('register-form');
  const err = document.getElementById('register-error');
  const next = new URLSearchParams(location.search).get('next') || 'profile.html';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.classList.remove('is-show');
    const name = form.querySelector('#rg-name').value.trim();
    const phone = form.querySelector('#rg-phone').value.trim();
    const email = form.querySelector('#rg-email').value.trim();
    const password = form.querySelector('#rg-password').value;
    if (!phone && !email) { err.textContent = '请至少填写手机号或邮箱'; err.classList.add('is-show'); return; }
    try {
      const data = await Istra.api.register({ name, phone, email, password });
      Istra.auth.setToken(data.token);
      location.href = next;
    } catch (ex) {
      err.textContent = ex.message;
      err.classList.add('is-show');
    }
  });
})();
