/* ============================================================
   用户系统前端工具：API 封装 + 登录态管理
   ============================================================ */
window.Istra = window.Istra || {};

Istra.api = {
  token: (function () { try { return localStorage.getItem('istra_token') || ''; } catch (e) { return ''; } })(),

  apiBase() {
    let base = '';
    try { base = window.ISTRA_API_BASE || localStorage.getItem('istra_api_base') || ''; } catch (e) {}
    /* 生产默认：Render 后端（window/localStorage 可覆盖，兼容未来切换） */
    if (!base) base = 'https://estrella-intrenational.onrender.com';
    return base.replace(/\/+$/, '');
  },
  async req(path, method, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    const url = this.apiBase() + path;
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      const err = new Error(data.error || '请求失败');
      err.status = res.status;
      throw err;
    }
    return data;
  },

  register(payload) { return this.req('/api/auth/register', 'POST', payload); },
  login(payload) { return this.req('/api/auth/login', 'POST', payload); },
  me() { return this.req('/api/auth/me', 'GET'); },
  updateProfile(payload) { return this.req('/api/profile', 'PUT', payload); },
  saveAssessment(payload) { return this.req('/api/assessments', 'POST', payload); },
  listAssessments() { return this.req('/api/assessments', 'GET'); },
  getAssessment(id) { return this.req('/api/assessments/' + id, 'GET'); },
  recordBehavior(payload) { return this.req('/api/behavior', 'POST', payload); },
  unlock() { return this.req('/api/pay/unlock', 'POST', {}); },
  removeFavorite(payload) { return this.req('/api/behavior', 'DELETE', payload); },
  getBehavior() { return this.req('/api/me/behavior', 'GET'); },
  /* 正式支付系统 */
  listProducts() { return this.req('/api/products', 'GET'); },
  createOrder(productId, channel) { return this.req('/api/orders', 'POST', { productId, channel: channel || 'test' }); },
  listOrders() { return this.req('/api/orders', 'GET'); },
  getOrder(id) { return this.req('/api/orders/' + id, 'GET'); },
  cancelOrder(id) { return this.req('/api/orders/' + id + '/cancel', 'POST', {}); },
  createPayment(orderId) { return this.req('/api/payment/create', 'POST', { orderId }); },
  notifyPayment(payload) { return this.req('/api/payment/notify', 'POST', payload); },
  refundOrder(orderId) { return this.req('/api/payment/refund', 'POST', { orderId }); },
  listEntitlements() { return this.req('/api/entitlements', 'GET'); },
  checkEntitlement(productId) { return this.req('/api/entitlements/check?product=' + encodeURIComponent(productId), 'GET'); },
  getAssessmentQuota(visitorId) { return this.req('/api/assessments/quota' + (visitorId ? '?visitorId=' + encodeURIComponent(visitorId) : ''), 'GET'); },
  saveVisitorAssessment(visitorId) { return this.req('/api/assessments/visitor', 'POST', { visitorId }); },
  /* 支付宝人工审核支付 */
  submitPaymentProof(orderId, proof, transactionNo) { return this.req('/api/payment/proof', 'POST', { orderId, proof, transactionNo }); },
  /* 管理员后台（仅 Bearer ADMIN_TOKEN，前端不写死） */
  adminStatus() { return this.req('/api/admin/status', 'GET'); },
  adminFetch(path, adminToken, opts) {
    return fetch(this.apiBase() + path, Object.assign({ headers: { 'Authorization': 'Bearer ' + (adminToken || '') } }, opts || {}))
      .then(async (res) => {
        let d = {}; try { d = await res.json(); } catch (e) {}
        if (!res.ok) { const err = new Error(d.error || '请求失败'); err.status = res.status; throw err; }
        return d;
      });
  },
  adminStats(adminToken) { return this.adminFetch('/api/admin/stats', adminToken); },
  adminOrders(adminToken, params) {
    const qs = params ? '?' + Object.keys(params).filter((k) => params[k]).map((k) => k + '=' + encodeURIComponent(params[k])).join('&') : '';
    return this.adminFetch('/api/admin/orders' + qs, adminToken);
  },
  adminAudit(adminToken) { return this.adminFetch('/api/admin/audit', adminToken); },
  adminProof(orderId, adminToken) {
    return fetch(this.apiBase() + '/api/admin/orders/' + orderId + '/proof', { headers: { 'Authorization': 'Bearer ' + (adminToken || '') } })
      .then(async (res) => { if (!res.ok) { let d = {}; try { d = await res.json(); } catch (e) {} throw new Error(d.error || '凭证加载失败'); } return res.blob(); });
  },
  adminReview(orderId, approve, adminToken, note) {
    return fetch(this.apiBase() + '/api/payment/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (adminToken || '') },
      body: JSON.stringify({ orderId, approve, note: note || '' })
    }).then(async (res) => {
      let d = {}; try { d = await res.json(); } catch (e) {}
      if (!res.ok) { const err = new Error(d.error || '审核失败'); err.status = res.status; throw err; }
      return d;
    });
  }
};

Istra.auth = {
  user: null,
  loggedIn() { return !!Istra.api.token; },
  async init() {
    if (!this.loggedIn()) { this.user = null; return null; }
    const load = async () => {
      const data = await Istra.api.me();
      this.user = data.user;
      return this.user;
    };
    try {
      return await load();
    } catch (e) {
      /* 401 = token 确实失效 → 真正退出；其它（网络/冷启动/5xx）→ 保留 token 并重试，避免瞬时故障导致永久“未登录” */
      if (e && e.status === 401) {
        this.user = null;
        this.setToken('');
        return null;
      }
      await new Promise((r) => setTimeout(r, 1200));
      try {
        return await load();
      } catch (e2) {
        this.user = null; /* 保留 token，下次页面加载自动恢复 */
        return null;
      }
    }
  },
  setToken(token) {
    Istra.api.token = token || '';
    try { if (token) localStorage.setItem('istra_token', token); else localStorage.removeItem('istra_token'); } catch (e) {}
  },
  logout() {
    this.user = null;
    this.setToken('');
  }
};

/* 全局账号入口更新（导航等） */
Istra.updateAccountEntry = function () {
  const links = document.querySelectorAll('[data-account-entry]');
  const logged = Istra.auth.loggedIn();
  links.forEach((el) => {
    if (logged) {
      el.setAttribute('href', 'profile.html');
      el.textContent = '个人中心';
      el.classList.add('is-logged');
    } else {
      el.setAttribute('href', 'login.html');
      el.textContent = '登录';
      el.classList.remove('is-logged');
    }
  });
};

