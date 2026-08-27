/* 管理员后台脚本 · 仅用于人工审核支付宝/微信订单
   会话：ADMIN_TOKEN 只保存在 sessionStorage（关闭标签页即清除），不写入 localStorage；
   前端不写死任何令牌，所有管理员接口使用 Authorization: Bearer <管理员输入>。 */
document.title = '管理员后台 · ' + Istra.brand.cn;
Istra.reveal.observe(document);

const $ = (s) => document.querySelector(s);
const esc = (v) => String(v === undefined || v === null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const yuan = (fen) => ('¥' + (Number(fen) / 100).toFixed(2));
const fmt = (t) => (t ? String(t).replace('T', ' ').slice(0, 16) : '—');
const CH = { alipay: '支付宝', wechat: '微信支付' };
const ST = { pending: '待审核', paid: '已通过', cancelled: '已驳回' };

function getToken() { try { return sessionStorage.getItem('istra_admin_token') || ''; } catch (e) { return ''; } }
function setToken(t) { try { if (t) sessionStorage.setItem('istra_admin_token', t); else sessionStorage.removeItem('istra_admin_token'); } catch (e) {} }

const app = $('#admin-app');
let state = { stats: null, orders: [], filter: 'pending', channel: '', q: '', audit: [] };

async function apiGet(path) { return Istra.api.adminFetch(path, getToken()); }

/* 状态检查：未配置 ADMIN_TOKEN 时给出明确提示 */
async function boot() {
  let status = null;
  try { status = await Istra.api.adminStatus(); } catch (e) {}
  if (status && status.adminApi && !status.configured) {
    app.innerHTML = `
      <div class="admin__panel admin__notice">
        <h2 class="admin__notice-title">管理员后台尚未配置 ADMIN_TOKEN</h2>
        <p class="admin__notice-text">请在服务器（Render 环境变量）中设置 <code>ADMIN_TOKEN</code> 后重新部署，才能使用管理员后台。为安全起见，生产环境不再使用默认弱口令。</p>
        <p class="admin__notice-text">配置步骤：Render Dashboard → 该服务 → Environment → 新增 <code>ADMIN_TOKEN</code>（自定义强口令）→ Deploy。</p>
      </div>`;
    return;
  }
  if (getToken()) {
    try {
      await loadAll();
      return;
    } catch (e) { /* token 无效 → 回登录 */ }
  }
  renderLogin();
}

function renderLogin() {
  app.innerHTML = `
    <div class="admin__panel admin__login">
      <h2 class="admin__login-title">管理员登录</h2>
      <p class="admin__login-desc">请输入服务器配置的 ADMIN_TOKEN（Bearer Token）</p>
      <input id="adm-token" type="password" class="admin__input" placeholder="ADMIN_TOKEN" autocomplete="off" />
      <button class="btn btn--primary" type="button" id="adm-login">登录管理后台 <span class="btn-arrow">→</span></button>
      <p class="admin__login-err" id="adm-err" style="display:none"></p>
    </div>`;
  $('#adm-login').addEventListener('click', async () => {
    const t = $('#adm-token').value.trim();
    if (!t) { showErr('请输入 ADMIN_TOKEN'); return; }
    setToken(t);
    try { await loadAll(); } catch (e) { setToken(''); showErr(e.message || '登录失败，请检查 ADMIN_TOKEN'); }
  });
  function showErr(m) { const el = $('#adm-err'); el.textContent = m; el.style.display = ''; }
}

async function loadAll() {
  state.stats = await Istra.api.adminStats(getToken());
  await Promise.all([loadOrders(), loadAudit()]);
  render();
}

async function loadOrders() {
  const params = {};
  if (state.filter) params.status = state.filter;
  if (state.channel) params.channel = state.channel;
  if (state.q) params.q = state.q;
  const d = await Istra.api.adminOrders(getToken(), params);
  state.orders = d.orders || [];
}

async function loadAudit() {
  try { const d = await Istra.api.adminAudit(getToken()); state.audit = d.audit || []; } catch (e) { state.audit = []; }
}

function render() {
  const s = state.stats || {};
  const filters = [
    { k: 'pending', label: '待审核' }, { k: 'paid', label: '已通过' }, { k: 'cancelled', label: '已驳回' }, { k: '', label: '全部' }
  ];
  const channels = [{ k: '', label: '全部渠道' }, { k: 'alipay', label: '支付宝' }, { k: 'wechat', label: '微信支付' }];
  app.innerHTML = `
    <div class="admin__stats">
      <div class="admin__stat"><b>${s.pending || 0}</b><span>待审核</span></div>
      <div class="admin__stat"><b>${s.paid || 0}</b><span>已通过</span></div>
      <div class="admin__stat"><b>${s.cancelled || 0}</b><span>已驳回</span></div>
      <div class="admin__stat"><b>${s.total || 0}</b><span>总订单</span></div>
      <div class="admin__stat"><b>${s.paid_users || 0}</b><span>付费用户</span></div>
      <div class="admin__stat"><b>${s.total_quota || 0}</b><span>已发放额度(次)</span></div>
    </div>
    <div class="admin__toolbar">
      <div class="admin__tabs">
        ${filters.map((f) => `<button class="admin__tab ${state.filter === f.k ? 'is-active' : ''}" data-filter="${f.k}">${f.label}</button>`).join('')}
      </div>
      <div class="admin__tabs admin__tabs--sub">
        ${channels.map((c) => `<button class="admin__tab ${state.channel === c.k ? 'is-active' : ''}" data-channel="${c.k}">${c.label}</button>`).join('')}
      </div>
      <input id="adm-q" class="admin__input admin__search" placeholder="搜索：订单号 / 交易单号 / 手机号 / 邮箱" value="${esc(state.q)}" />
      <button class="btn btn--primary admin__logout" type="button" id="adm-logout">退出</button>
    </div>
    <div class="admin__panel">
      <div class="admin__list">
        ${state.orders.length ? state.orders.map((o) => `
          <div class="admin__order" data-open="${o.id}">
            <div class="admin__order-main">
              <p class="admin__order-id">${esc(o.orderId)} <span class="admin__tag ${o.status}">${ST[o.status] || o.status}</span> <span class="admin__tag channel">${CH[o.channel] || o.channel}</span></p>
              <p class="admin__order-sub">${esc(o.user || '用户#' + o.userId)} · ${esc(o.phone || o.email || '')} · ${yuan(o.amount)} · ${esc(o.transactionNo || '未填交易单号')}</p>
              <p class="admin__order-time">提交：${fmt(o.createdAt)}${o.reviewedAt ? ' · 审核：' + fmt(o.reviewedAt) : ''}</p>
            </div>
            <span class="admin__order-cta">查看 / 审核 →</span>
          </div>`).join('')
        : '<p class="admin__empty">暂无订单</p>'}
      </div>
    </div>
    ${state.audit.length ? `
    <div class="admin__panel">
      <h3 class="admin__panel-title">审核日志</h3>
      <div class="admin__audit">
        ${state.audit.slice(0, 15).map((a) => `<div class="admin__audit-row"><span class="admin__audit-act ${a.action}">${a.action === 'approve' ? '通过' : '驳回'}</span><span>${esc(a.orderId)}</span><span>${fmt(a.createdAt)}</span>${a.note ? '<span class="admin__audit-note">' + esc(a.note) + '</span>' : ''}</div>`).join('')}
      </div>
    </div>` : ''}`;
  app.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', async () => { state.filter = b.getAttribute('data-filter'); await loadOrders(); render(); }));
  app.querySelectorAll('[data-channel]').forEach((b) => b.addEventListener('click', async () => { state.channel = b.getAttribute('data-channel'); await loadOrders(); render(); }));
  $('#adm-q').addEventListener('keydown', async (e) => { if (e.key === 'Enter') { state.q = $('#adm-q').value.trim(); await loadOrders(); render(); } });
  $('#adm-logout').addEventListener('click', () => { setToken(''); renderLogin(); });
  app.querySelectorAll('[data-open]').forEach((el) => el.addEventListener('click', () => openDetail(Number(el.getAttribute('data-open')))));
}

async function openDetail(orderId) {
  const o = state.orders.find((x) => x.id === orderId);
  if (!o) return;
  const overlay = document.createElement('div');
  overlay.className = 'admin__overlay';
  let proofUrl = '';
  if (o.hasProof) {
    try { proofUrl = URL.createObjectURL(await Istra.api.adminProof(o.id, getToken())); } catch (e) {}
  }
  overlay.innerHTML = `
    <div class="admin__modal">
      <button class="admin__modal-close" type="button" aria-label="关闭">×</button>
      <h2 class="admin__modal-title">订单详情 · ${esc(o.orderId)}</h2>
      <div class="admin__detail">
        <div class="admin__row"><span>用户</span><b>${esc(o.user || '用户#' + o.userId)}（${esc(o.phone || o.email || '')}）</b></div>
        <div class="admin__row"><span>金额</span><b>${yuan(o.amount)}</b></div>
        <div class="admin__row"><span>支付方式</span><b>${CH[o.channel] || o.channel}</b></div>
        <div class="admin__row"><span>交易单号</span><b>${esc(o.transactionNo || '—')}</b></div>
        <div class="admin__row"><span>创建时间</span><b>${fmt(o.createdAt)}</b></div>
        <div class="admin__row"><span>状态</span><b>${ST[o.status] || o.status}</b></div>
        ${o.reviewNote ? '<div class="admin__row"><span>驳回原因</span><b>' + esc(o.reviewNote) + '</b></div>' : ''}
      </div>
      <div class="admin__proof">
        <p class="admin__proof-title">付款凭证</p>
        ${proofUrl ? '<img class="admin__proof-img" src="' + proofUrl + '" alt="付款凭证" />' : '<p class="admin__empty">该订单暂无付款凭证</p>'}
      </div>
      ${o.status === 'paid' ? '<p class="admin__done">订单已审核（幂等保护，不会重复发放额度）</p>' : (o.status === 'pending' ? `
      <div class="admin__actions">
        <button class="btn btn--primary" type="button" data-act="approve">审核通过 <span class="btn-arrow">→</span></button>
        <button class="btn btn--ghost-dark" type="button" data-act="reject">驳回</button>
      </div>` : `<p class="admin__done">该订单已驳回</p>`)}
    </div>`;
  document.body.appendChild(overlay);
  const close = () => { overlay.remove(); if (proofUrl) URL.revokeObjectURL(proofUrl); };
  overlay.querySelector('.admin__modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('[data-act="approve"]') && overlay.querySelector('[data-act="approve"]').addEventListener('click', () => doApprove(o, overlay));
  overlay.querySelector('[data-act="reject"]') && overlay.querySelector('[data-act="reject"]').addEventListener('click', () => doReject(o, overlay));
}

async function doApprove(o, overlay) {
  if (!confirm('确认审核通过订单 ' + o.orderId + ' ？\n通过后将自动发放 10 次 AI 评估额度并解锁完整 20 个国家/项目匹配结果。')) return;
  try {
    await Istra.api.adminReview(o.id, true, getToken());
    alert('审核成功，已发放10次额度并解锁20个国家/项目。');
    overlay.remove();
    await loadAll(); render();
  } catch (e) { alert(e.message || '审核失败'); }
}

async function doReject(o, overlay) {
  const reasons = ['付款凭证不清晰', '金额不符', '订单号错误', '未查询到付款', '其他'];
  const r = prompt('请填写驳回原因：\n' + reasons.join(' / '), reasons[0]);
  if (r === null) return;
  try {
    await Istra.api.adminReview(o.id, false, getToken(), r);
    alert('订单已驳回，未增加额度。');
    overlay.remove();
    await loadAll(); render();
  } catch (e) { alert(e.message || '驳回失败'); }
}

boot().catch((e) => { app.innerHTML = '<div class="admin__panel admin__notice">' + esc(e.message || '加载失败') + '</div>'; });
