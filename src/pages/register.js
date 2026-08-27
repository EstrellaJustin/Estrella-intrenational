/* 注册页脚本 */
document.title = '注册 · ' + Istra.brand.cn;
Istra.reveal.observe(document);

/* 轻量设备指纹：随机设备ID + 非侵入式浏览器特征，仅用于服务端风控哈希 */
function deviceFingerprint() {
  try {
    let id = localStorage.getItem('istra_device_id');
    if (!id) { id = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); localStorage.setItem('istra_device_id', id); }
    return [id, navigator.userAgent || '', screen.width + 'x' + screen.height, navigator.language || '', new Date().getTimezoneOffset()].join('|');
  } catch (e) { return ''; }
}

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
      const data = await Istra.api.register({ name, phone, email, password, deviceFingerprint: deviceFingerprint() });
      Istra.auth.setToken(data.token);
      location.href = next;
    } catch (ex) {
      err.textContent = ex.message;
      err.classList.add('is-show');
    }
  });
})();
