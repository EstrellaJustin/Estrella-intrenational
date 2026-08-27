/* ============================================================
   伊斯特拉国际 · 本地服务器 + 用户系统 API（零依赖）
   静态文件服务 + REST API + JSON 文件数据库
   数据库目录：data/userdb/（users / user_profiles / assessments /
   recommendations / user_behavior / sessions）
   用法：node scripts/serve.js [--port 4173] [--no-open]
   ============================================================ */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

const root = path.resolve(__dirname, '..');
const dbDir = path.join(root, 'data', 'userdb');
const args = process.argv.slice(2);
const portArg = args.find((a) => a.startsWith('--port='));
const port = portArg ? Number(portArg.split('=')[1]) : (process.env.PORT || 4173);
const openBrowser = !args.includes('--no-open');

/* ---------- 数据库（JSON 文件表） ---------- */
const TABLES = ['users', 'user_profiles', 'assessments', 'recommendations', 'user_behavior', 'sessions', 'products', 'orders', 'payments', 'entitlements', 'visitor_assessments', 'vision_cache'];
fs.mkdirSync(dbDir, { recursive: true });
function loadTable(name) {
  const f = path.join(dbDir, name + '.json');
  if (!fs.existsSync(f)) fs.writeFileSync(f, '[]');
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return []; }
}
function saveTable(name, rows) {
  fs.writeFileSync(path.join(dbDir, name + '.json'), JSON.stringify(rows, null, 2));
}
function nextId(rows) {
  return rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;
}

/* ---------- 密码与令牌 ---------- */
function hashPwd(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}
function newToken() { return crypto.randomBytes(24).toString('hex'); }
function publicUser(u) {
  return { id: u.id, name: u.name, phone: u.phone || '', email: u.email || '', registeredAt: u.registeredAt, country: u.country || '', city: u.city || '', lastLoginAt: u.lastLoginAt || '', assessmentUnlock: !!u.assessmentUnlock };
}

/* ---------- 认证 ---------- */
function getToken(req) {
  const h = req.headers['authorization'] || '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
}
function authUser(req) {
  const token = getToken(req);
  if (!token) return null;
  const sessions = loadTable('sessions');
  const row = sessions.find((s) => s.token === token);
  if (!row) return null;
  const users = loadTable('users');
  return users.find((u) => u.id === row.userId) || null;
}

/* ---------- API 路由 ---------- */
function sendJson(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}
function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 2e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch (e) { resolve({}); } });
  });
}
function cleanStr(v, max = 200) { return String(v || '').trim().slice(0, max); }

/* ================= 正式支付系统（第一阶段） =================
   商品 / 订单 / 支付 / 权益。密钥仅从环境变量读取，绝不进入前端。
   当前默认测试 Provider；接入微信支付只需配置环境变量。
   安全：金额以服务端商品为准；订单状态仅后端修改；回调验签；权益幂等发放。
*/
const PRODUCTS_SEED = [
  { id: 'ai-assessment', name: 'AI深度评估', price: 990, currency: 'CNY', unit: '次', scope: 'ai-report', desc: '解锁完整 AI 深度评估报告：20 个个性化匹配方案、优势/不足分析、未来路线规划。', note: '购买后立即解锁本人账号的 AI 深度评估报告。', refund: '虚拟内容一经解锁原则上不支持退款；如因系统错误重复扣款可申请人工退款。' },
  { id: 'diy-full-access', name: 'DIY签证深度方案', price: 1990, currency: 'CNY', unit: '账号', scope: 'diy-full', desc: '解锁全球签证 DIY 深度方案：专属条件检查、材料清单、前置任务与完整申请流程。', note: '购买后解锁本人账号的 DIY 深度方案（含后续新增项目）。', refund: '虚拟内容一经解锁原则上不支持退款；如因系统错误重复扣款可申请人工退款。' }
];
function ensureProducts() {
  const rows = loadTable('products');
  PRODUCTS_SEED.forEach((p) => { if (!rows.some((x) => x.id === p.id)) rows.push(Object.assign({}, p, { createdAt: new Date().toISOString() })); });
  saveTable('products', rows);
}
function productById(id) { return loadTable('products').find((p) => p.id === id) || null; }
const PAYMENT_CHANNELS = ['test', 'wechat'];
function paymentProviderEnabled(channel) {
  if (channel === 'test') return true;
  if (channel === 'wechat') return !!(process.env.WECHAT_MCH_ID && process.env.WECHAT_APP_ID && process.env.WECHAT_API_KEY);
  return false;
}
function testPaySecret() { return process.env.TEST_PAY_SECRET || 'istra-test-secret'; }
function createPaymentRequest(order, product) {
  if (order.channel === 'wechat') {
    if (!paymentProviderEnabled('wechat')) throw new Error('微信支付未配置：请设置 WECHAT_MCH_ID / WECHAT_APP_ID / WECHAT_API_KEY 环境变量');
    /* 正式接入时在此调用微信支付 APIv3 统一下单（Native/JSAPI） */
    return { channel: 'wechat', payParams: { appId: process.env.WECHAT_APP_ID, mchId: process.env.WECHAT_MCH_ID, orderId: order.orderId, amount: order.amount, currency: order.currency } };
  }
  const token = crypto.createHmac('sha256', testPaySecret()).update(order.orderId).digest('hex');
  return { channel: 'test', mock: true, payToken: token, expiresIn: 1800 };
}
function verifyPaymentNotify(body) {
  if (!body || !body.orderId || !body.transactionId) return { ok: false, error: '回调参数不完整' };
  const order = loadTable('orders').find((o) => o.orderId === cleanStr(body.orderId, 40));
  if (!order) return { ok: false, error: '订单不存在' };
  if (order.status === 'paid') return { ok: true, order, alreadyPaid: true };
  if (order.status !== 'pending') return { ok: false, error: '订单状态不允许支付', order };
  const expect = crypto.createHmac('sha256', testPaySecret()).update(order.orderId).digest('hex');
  if (cleanStr(body.payToken, 128) !== expect) return { ok: false, error: '回调签名无效', order };
  if (Number(body.amount) !== order.amount) return { ok: false, error: '金额不匹配', order };
  return { ok: true, order };
}
function grantEntitlement(user, product, order) {
  const ents = loadTable('entitlements');
  if (ents.some((e) => e.userId === user.id && e.productId === product.id && e.orderId === order.orderId)) {
    return ents.filter((e) => e.userId === user.id && e.productId === product.id && e.status === 'active');
  }
  ents.push({ id: nextId(ents), userId: user.id, productId: product.id, scope: product.scope || product.id, status: 'active', orderId: order.orderId, grantedAt: new Date().toISOString() });
  saveTable('entitlements', ents);
  if (product.id === 'ai-assessment') {
    const users = loadTable('users');
    const idx = users.findIndex((x) => x.id === user.id);
    if (idx >= 0) { users[idx].assessmentUnlock = true; saveTable('users', users); }
  }
  return ents.filter((e) => e.userId === user.id && e.productId === product.id && e.status === 'active');
}
function revokeEntitlement(userId, productId, orderId) {
  let ents = loadTable('entitlements');
  ents = ents.map((e) => (e.userId === userId && e.productId === productId && e.orderId === orderId ? Object.assign({}, e, { status: 'revoked', revokedAt: new Date().toISOString() }) : e));
  saveTable('entitlements', ents);
  return ents;
}
function genOrderId() { return 'ORD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase(); }
/* ---------- 图片识别 / 视觉分析（密钥仅在后端环境变量） ---------- */
function sha256Hex(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }
function loadVisionCache() {
  const f = path.join(dbDir, 'vision_cache.json');
  if (!fs.existsSync(f)) return {};
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return {}; }
}
function saveVisionCache(map) { fs.writeFileSync(path.join(dbDir, 'vision_cache.json'), JSON.stringify(map, null, 2)); }
function visionConfigured() { return !!process.env.VISION_API_KEY; }
/* 调用 OpenAI 兼容视觉模型（GPT-4o-mini / Qwen-VL / GLM-4V 等均可通过环境变量切换） */
async function analyzeImageWithVision(imageB64, mime, focus) {
  const baseUrl = (process.env.VISION_BASE_URL || 'https://api.openai.com/v1/chat/completions').replace(/\/+$/, '');
  const model = process.env.VISION_MODEL || 'gpt-4o-mini';
  const dataUrl = 'data:' + (mime || 'image/jpeg') + ';base64,' + imageB64;
  const sys = '你是图片分析助手。识别图中的文字、界面、错误信息、表格与主要内容。只输出简洁中文JSON，字段：{"type":"图片类型","summary":"一句话概括","text":"提取的关键文字","items":["关键信息"],"conclusion":"结论或建议"}。不要输出JSON以外的内容。';
  const body = {
    model,
    temperature: 0.2,
    max_tokens: 600,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: [
        { type: 'text', text: '分析这张图片。' + (focus ? '重点：' + focus : '') },
        { type: 'image_url', image_url: { url: dataUrl } }
      ] }
    ]
  };
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.VISION_API_KEY },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    return { ok: false, error: '视觉模型请求失败 ' + res.status + (t ? ' ' + String(t).slice(0, 200) : '') };
  }
  const data = await res.json();
  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  if (!content) return { ok: false, error: '视觉模型未返回内容' };
  let result;
  try { result = JSON.parse(content); }
  catch (e) {
    const m = String(content).match(/\{[\s\S]*\}/);
    if (m) { try { result = JSON.parse(m[0]); } catch (e2) { result = null; } }
  }
  if (!result || typeof result !== 'object') {
    result = { type: '图片', summary: String(content).slice(0, 200), text: '', items: [], conclusion: '' };
  }
  return { ok: true, result };
}

async function handleApi(req, res, url) {
  /* CORS：允许 GitHub Pages 前端与本地开发（密钥仍在后端，不涉及前端） */
  const allowedOrigins = ['https://estrellajustin.github.io', 'http://localhost:4173', 'http://127.0.0.1:4173'];
  const origin = req.headers.origin || '';
  if (allowedOrigins.indexOf(origin) >= 0) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const p = url.pathname;
  const method = req.method;

  /* POST /api/auth/register */
  if (p === '/api/auth/register' && method === 'POST') {
    const b = await readBody(req);
    const name = cleanStr(b.name, 40);
    const phone = cleanStr(b.phone, 30);
    const email = cleanStr(b.email, 120).toLowerCase();
    const password = String(b.password || '');
    if (!name || !password || password.length < 4) return sendJson(res, 400, { error: '请填写姓名与至少 4 位密码' });
    if (!phone && !email) return sendJson(res, 400, { error: '手机号或邮箱至少填写一项' });
    const users = loadTable('users');
    const dup = users.find((u) => (phone && u.phone === phone) || (email && u.email === email));
    if (dup) return sendJson(res, 409, { error: '该手机号或邮箱已注册' });
    const salt = crypto.randomBytes(16).toString('hex');
    const user = {
      id: nextId(users), name, phone, email,
      salt, hash: hashPwd(password, salt),
      registeredAt: new Date().toISOString(),
      country: cleanStr(b.country, 60), city: cleanStr(b.city, 60),
      lastLoginAt: new Date().toISOString(),
      assessmentUnlock: false
    };
    users.push(user);
    saveTable('users', users);
    saveTable('user_profiles', loadTable('user_profiles').concat([{ userId: user.id, updatedAt: user.registeredAt }]));
    const token = newToken();
    saveTable('sessions', loadTable('sessions').concat([{ token, userId: user.id }]));
    return sendJson(res, 200, { token, user: publicUser(user) });
  }

  /* POST /api/auth/login */
  if (p === '/api/auth/login' && method === 'POST') {
    const b = await readBody(req);
    const account = cleanStr(b.account, 150).toLowerCase();
    const password = String(b.password || '');
    const users = loadTable('users');
    const user = users.find((u) => u.phone === account || u.email === account);
    if (!user || hashPwd(password, user.salt) !== user.hash) return sendJson(res, 401, { error: '账号或密码错误' });
    user.lastLoginAt = new Date().toISOString();
    saveTable('users', users);
    const token = newToken();
    saveTable('sessions', loadTable('sessions').concat([{ token, userId: user.id }]));
    return sendJson(res, 200, { token, user: publicUser(user) });
  }

  /* GET /api/auth/me */
  if (p === '/api/auth/me' && method === 'GET') {
    const u = authUser(req);
    if (!u) return sendJson(res, 401, { error: '未登录' });
    const profiles = loadTable('user_profiles');
    const profile = profiles.find((x) => x.userId === u.id) || {};
    return sendJson(res, 200, { user: publicUser(u), profile });
  }

  /* PUT /api/profile */
  if (p === '/api/profile' && method === 'PUT') {
    const u = authUser(req);
    if (!u) return sendJson(res, 401, { error: '未登录' });
    const b = await readBody(req);
    const users = loadTable('users');
    const idx = users.findIndex((x) => x.id === u.id);
    if (b.name) users[idx].name = cleanStr(b.name, 40);
    if (b.country) users[idx].country = cleanStr(b.country, 60);
    if (b.city) users[idx].city = cleanStr(b.city, 60);
    saveTable('users', users);
    const profiles = loadTable('user_profiles');
    let row = profiles.find((x) => x.userId === u.id);
    const allowed = ['age', 'gender', 'marital', 'hasKids', 'occupation', 'degree', 'major', 'languages', 'skills'];
    const patch = { userId: u.id, updatedAt: new Date().toISOString() };
    allowed.forEach((k) => { if (b[k] !== undefined) patch[k] = cleanStr(b[k], 500); });
    if (row) Object.assign(row, patch); else { row = patch; profiles.push(row); }
    saveTable('user_profiles', profiles);
    return sendJson(res, 200, { profile: row });
  }

  /* GET /api/assessments/quota（评估次数额度） */
  if (p === '/api/assessments/quota' && method === 'GET') {
    const u = authUser(req);
    const visitorId = cleanStr(url.searchParams.get('visitorId'), 80);
    return sendJson(res, 200, assessmentQuota(u, visitorId));
  }
  /* POST /api/assessments/visitor（游客评估计数 · 成功生成报告后调用，失败不扣） */
  if (p === '/api/assessments/visitor' && method === 'POST') {
    const b = await readBody(req);
    const visitorId = cleanStr(b.visitorId, 80);
    if (!visitorId) return sendJson(res, 400, { error: '缺少 visitorId' });
    const q = assessmentQuota(null, visitorId);
    if (q.remaining <= 0) return sendJson(res, 429, { error: '评估次数已用完，请注册后继续使用', quota: q });
    const rows = loadTable('visitor_assessments');
    const rec = rows.find((x) => x.visitorId === visitorId);
    if (rec) { rec.used += 1; } else { rows.push({ id: nextId(rows), visitorId, used: 1, createdAt: new Date().toISOString() }); }
    saveTable('visitor_assessments', rows);
    return sendJson(res, 200, assessmentQuota(null, visitorId));
  }

  /* POST /api/assessments（保存评估 + 推荐） */
  if (p === '/api/assessments' && method === 'POST') {
    const u = authUser(req);
    if (!u) return sendJson(res, 401, { error: '未登录' });
    const qBefore = assessmentQuota(u, '');
    if (qBefore.remaining <= 0) return sendJson(res, 429, { error: '评估次数已用完，请付费解锁更多次数', quota: qBefore });
    const b = await readBody(req);
    const inputs = b.inputs || {};
    const recs = Array.isArray(b.recommendations) ? b.recommendations.slice(0, 20) : [];
    const assessments = loadTable('assessments');
    const recTable = loadTable('recommendations');
    const id = nextId(assessments);
    const now = new Date().toISOString();
    const record = {
      id, userId: u.id, savedAt: now,
      inputs,
      health: b.health || {},
      top: recs[0] ? { country: recs[0].country, project: recs[0].project, score: recs[0].score } : null,
      recCount: recs.length
    };
    assessments.push(record);
    saveTable('assessments', assessments);
    /* 评估保存成功后才扣次数 */
    const users = loadTable('users');
    const ui = users.findIndex((x) => x.id === u.id);
    if (ui >= 0) { users[ui].assessment_used = Number(users[ui].assessment_used || 0) + 1; saveTable('users', users); }
    recs.forEach((r, i) => {
      recTable.push({
        id: nextId(recTable), userId: u.id, assessmentId: id,
        rank: i + 1, country: r.country || '', project: r.project || '',
        score: Number(r.score) || 0, reason: r.reason || '', createdAt: now
      });
    });
    saveTable('recommendations', recTable);
    return sendJson(res, 200, { id, savedAt: now });
  }

  /* GET /api/assessments（本人列表，不含健康敏感字段） */
  if (p === '/api/assessments' && method === 'GET') {
    const u = authUser(req);
    if (!u) return sendJson(res, 401, { error: '未登录' });
    const rows = loadTable('assessments').filter((x) => x.userId === u.id).sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
    return sendJson(res, 200, { assessments: rows.map((r) => ({ id: r.id, savedAt: r.savedAt, top: r.top, recCount: r.recCount })) });
  }

  /* GET /api/assessments/:id（本人详情，含健康，仅本人可见） */
  const detailMatch = p.match(/^\/api\/assessments\/(\d+)$/);
  if (detailMatch && method === 'GET') {
    const u = authUser(req);
    if (!u) return sendJson(res, 401, { error: '未登录' });
    const recTable = loadTable('recommendations');
    const rows = loadTable('assessments');
    const rec = rows.find((x) => x.id === Number(detailMatch[1]) && x.userId === u.id);
    if (!rec) return sendJson(res, 404, { error: '记录不存在' });
    const recs = recTable.filter((x) => x.assessmentId === rec.id).sort((a, b) => a.rank - b.rank);
    return sendJson(res, 200, { assessment: rec, recommendations: recs });
  }

  /* AI 评估次数额度：付费 > 注册 > 游客 */
function assessmentQuota(user, visitorId) {
  if (user) {
    const paid = !!user.assessmentUnlock;
    const quota = paid ? 10 : 3;
    const used = Number(user.assessment_used || 0);
    return { tier: paid ? 'paid' : 'user', quota, used, remaining: Math.max(0, quota - used) };
  }
  const rows = loadTable('visitor_assessments');
  const rec = rows.find((x) => x.visitorId === visitorId) || null;
  const used = rec ? rec.used : 0;
  return { tier: 'visitor', quota: 1, used, remaining: Math.max(0, 1 - used) };
}

/* ============ 正式支付系统 API ============ */
  /* GET /api/products（公开） */
  if (p === '/api/products' && method === 'GET') {
    return sendJson(res, 200, { products: loadTable('products') });
  }
  /* POST /api/orders（创建订单：金额以服务端商品为准） */
  if (p === '/api/orders' && method === 'POST') {
    const u = authUser(req); if (!u) return sendJson(res, 401, { error: '未登录' });
    const b = await readBody(req);
    const product = productById(cleanStr(b.productId, 60));
    if (!product) return sendJson(res, 404, { error: '商品不存在' });
    const channel = cleanStr(b.channel, 20) || 'test';
    if (!PAYMENT_CHANNELS.includes(channel)) return sendJson(res, 400, { error: '不支持的支付渠道' });
    const orders = loadTable('orders');
    const order = { id: nextId(orders), orderId: genOrderId(), userId: u.id, productId: product.id, productName: product.name, amount: product.price, currency: product.currency, status: 'pending', channel, createdAt: new Date().toISOString(), paidAt: null, transactionId: null, refundStatus: 'none', refundedAt: null, cancelledAt: null };
    orders.push(order); saveTable('orders', orders);
    return sendJson(res, 200, { order });
  }
  /* GET /api/orders（本人订单列表） */
  if (p === '/api/orders' && method === 'GET') {
    const u = authUser(req); if (!u) return sendJson(res, 401, { error: '未登录' });
    const rows = loadTable('orders').filter((o) => o.userId === u.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return sendJson(res, 200, { orders: rows });
  }
  /* GET /api/orders/:id */
  const orderDetail = p.match(/^\/api\/orders\/(\d+)$/);
  if (orderDetail && method === 'GET') {
    const u = authUser(req); if (!u) return sendJson(res, 401, { error: '未登录' });
    const o = loadTable('orders').find((x) => x.id === Number(orderDetail[1]) && x.userId === u.id);
    if (!o) return sendJson(res, 404, { error: '订单不存在' });
    return sendJson(res, 200, { order: o });
  }
  /* POST /api/orders/:id/cancel（仅 pending 可取消） */
  const orderCancel = p.match(/^\/api\/orders\/(\d+)\/cancel$/);
  if (orderCancel && method === 'POST') {
    const u = authUser(req); if (!u) return sendJson(res, 401, { error: '未登录' });
    const orders = loadTable('orders');
    const o = orders.find((x) => x.id === Number(orderCancel[1]) && x.userId === u.id);
    if (!o) return sendJson(res, 404, { error: '订单不存在' });
    if (o.status !== 'pending') return sendJson(res, 400, { error: '仅待支付订单可取消' });
    o.status = 'cancelled'; o.cancelledAt = new Date().toISOString();
    saveTable('orders', orders);
    return sendJson(res, 200, { order: o });
  }
  /* POST /api/payment/create（创建支付请求） */
  if (p === '/api/payment/create' && method === 'POST') {
    const u = authUser(req); if (!u) return sendJson(res, 401, { error: '未登录' });
    const b = await readBody(req);
    const o = loadTable('orders').find((x) => x.id === Number(b.orderId) && x.userId === u.id);
    if (!o) return sendJson(res, 404, { error: '订单不存在' });
    if (o.status !== 'pending') return sendJson(res, 400, { error: '订单状态不允许支付' });
    const product = productById(o.productId);
    try {
      const pay = createPaymentRequest(o, product);
      return sendJson(res, 200, { order: o, pay });
    } catch (e) { return sendJson(res, 500, { error: e.message }); }
  }
  /* POST /api/payment/notify（支付平台回调：服务端验签 + 幂等发权益） */
  if (p === '/api/payment/notify' && method === 'POST') {
    const b = await readBody(req);
    const r = verifyPaymentNotify(b);
    if (!r.ok) return sendJson(res, 400, { error: r.error });
    if (r.alreadyPaid) return sendJson(res, 200, { ok: true, alreadyPaid: true });
    const orders = loadTable('orders');
    const o = orders.find((x) => x.id === r.order.id);
    if (!o) return sendJson(res, 404, { error: '订单不存在' });
    if (o.status === 'paid') return sendJson(res, 200, { ok: true, alreadyPaid: true });
    o.status = 'paid'; o.paidAt = new Date().toISOString(); o.transactionId = cleanStr(b.transactionId, 80);
    saveTable('orders', orders);
    const user = loadTable('users').find((x) => x.id === o.userId);
    const product = productById(o.productId);
    const ents = user && product ? grantEntitlement(user, product, o) : [];
    return sendJson(res, 200, { ok: true, entitlements: ents.map((e) => e.productId) });
  }
  /* POST /api/payment/refund（退款：已支付订单 → refunded + 收回权益） */
  if (p === '/api/payment/refund' && method === 'POST') {
    const b = await readBody(req);
    const orders = loadTable('orders');
    const o = orders.find((x) => x.orderId === cleanStr(b.orderId, 40));
    if (!o) return sendJson(res, 404, { error: '订单不存在' });
    if (o.status !== 'paid') return sendJson(res, 400, { error: '仅已支付订单可退款' });
    o.status = 'refunded'; o.refundStatus = 'refunded'; o.refundedAt = new Date().toISOString();
    saveTable('orders', orders);
    revokeEntitlement(o.userId, o.productId, o.orderId);
    return sendJson(res, 200, { order: o });
  }
  /* GET /api/entitlements（本人有效权益） */
  if (p === '/api/entitlements' && method === 'GET') {
    const u = authUser(req); if (!u) return sendJson(res, 401, { error: '未登录' });
    const rows = loadTable('entitlements').filter((e) => e.userId === u.id && e.status === 'active');
    return sendJson(res, 200, { entitlements: rows });
  }
  /* GET /api/entitlements/check（服务端校验是否已解锁） */
  if (p === '/api/entitlements/check' && method === 'GET') {
    const u = authUser(req); if (!u) return sendJson(res, 401, { error: '未登录' });
    const productId = cleanStr(url.searchParams.get('product'), 60);
    const product = productById(productId);
    if (!product) return sendJson(res, 404, { error: '商品不存在' });
    const active = loadTable('entitlements').some((e) => e.userId === u.id && e.productId === productId && e.status === 'active');
    let extra = {};
    if (productId === 'ai-assessment') {
      const user = loadTable('users').find((x) => x.id === u.id);
      extra = { assessmentUnlock: !!(user && user.assessmentUnlock) };
    }
    return sendJson(res, 200, { productId, unlocked: active, ...extra });
  }

  /* POST /api/pay/unlock（演示支付：将用户标记为已解锁，不重新生成评估） */
  if (p === '/api/pay/unlock' && method === 'POST') {
    const u = authUser(req);
    if (!u) return sendJson(res, 401, { error: '未登录' });
    const users = loadTable('users');
    const idx = users.findIndex((x) => x.id === u.id);
    if (idx >= 0) {
      users[idx].assessmentUnlock = true;
      saveTable('users', users);
      return sendJson(res, 200, { ok: true, assessmentUnlock: true });
    }
    return sendJson(res, 404, { error: '用户不存在' });
  }

  /* POST /api/behavior */
  if (p === '/api/behavior' && method === 'POST') {
    const u = authUser(req);
    if (!u) return sendJson(res, 401, { error: '未登录' });
    const b = await readBody(req);
    const rows = loadTable('user_behavior');
    const type = cleanStr(b.type, 30);
    const refType = cleanStr(b.refType, 30);
    const refId = cleanStr(b.refId, 60);
    const title = cleanStr(b.title, 160);
    if (type === 'favorite_project' || type === 'favorite_city') {
      const dup = rows.find((x) => x.userId === u.id && x.type === type && x.refId === refId);
      if (!dup) rows.push({ id: nextId(rows), userId: u.id, type, refType, refId, title, createdAt: new Date().toISOString() });
    } else {
      rows.push({ id: nextId(rows), userId: u.id, type, refType, refId, title, createdAt: new Date().toISOString() });
    }
    saveTable('user_behavior', rows);
    return sendJson(res, 200, { ok: true });
  }

  /* DELETE /api/behavior（取消收藏） */
  if (p === '/api/behavior' && method === 'DELETE') {
    const u = authUser(req);
    if (!u) return sendJson(res, 401, { error: '未登录' });
    const b = await readBody(req);
    let rows = loadTable('user_behavior');
    rows = rows.filter((x) => !(x.userId === u.id && x.type === cleanStr(b.type, 30) && x.refId === cleanStr(b.refId, 60)));
    saveTable('user_behavior', rows);
    return sendJson(res, 200, { ok: true });
  }

  /* GET /api/me/behavior */
  if (p === '/api/me/behavior' && method === 'GET') {
    const u = authUser(req);
    if (!u) return sendJson(res, 401, { error: '未登录' });
    const rows = loadTable('user_behavior').filter((x) => x.userId === u.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const favorites = rows.filter((x) => x.type.startsWith('favorite_'));
    const history = rows.filter((x) => x.type.startsWith('view_')).slice(0, 50);
    const consults = rows.filter((x) => x.type === 'consult');
    return sendJson(res, 200, { favorites, history, consults });
  }

  /* POST /api/vision/analyze（图片识别/视觉分析 · 密钥仅在后端，图片先由前端压缩） */
  if (p === '/api/vision/analyze' && method === 'POST') {
    const b = await readBody(req);
    const imageB64 = String(b.image || '').replace(/^data:[^;]+;base64,/, '');
    const mime = cleanStr(b.mime, 60) || 'image/jpeg';
    const focus = cleanStr(b.focus, 200);
    if (!imageB64 || imageB64.length < 32) return sendJson(res, 400, { error: '请上传有效的图片' });
    const buf = Buffer.from(imageB64, 'base64');
    if (buf.length < 100) return sendJson(res, 400, { error: '图片内容无效' });
    if (buf.length > 2 * 1024 * 1024) return sendJson(res, 413, { error: '图片过大，请使用压缩后的图片（≤2MB）' });
    const hash = sha256Hex(buf);
    const cache = loadVisionCache();
    if (cache[hash]) return sendJson(res, 200, Object.assign({ cached: true }, cache[hash]));
    if (!visionConfigured()) return sendJson(res, 501, { error: '视觉分析服务未配置：请在服务器设置 VISION_API_KEY（可选 VISION_BASE_URL / VISION_MODEL）' });
    const r = await analyzeImageWithVision(imageB64, mime, focus);
    if (!r.ok) return sendJson(res, 502, { error: r.error });
    cache[hash] = { analyzedAt: new Date().toISOString(), focus, result: r.result };
    saveVisionCache(cache);
    return sendJson(res, 200, { cached: false, result: r.result });
  }
  return sendJson(res, 404, { error: '接口不存在' });
}

/* ---------- 静态文件服务 ---------- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.woff2': 'font/woff2', '.woff': 'font/woff'
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) return handleApi(req, res, url).catch(() => sendJson(res, 500, { error: '服务器错误' }));
    let urlPath = decodeURIComponent(url.pathname);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.normalize(path.join(root, urlPath));
    if (!filePath.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end('<h1 style="font-family:sans-serif">404 · 页面不存在</h1><p><a href="/">返回首页</a></p>'); }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  } catch (e) { res.writeHead(500); res.end('Server error'); }
});

ensureProducts();
server.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log('');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │  伊斯特拉国际 · 本地服务器（含用户系统 API）    │');
  console.log(`  │  地址: ${url.padEnd(44)}│`);
  console.log('  │  数据库: data/userdb/*.json                  │');
  console.log('  └──────────────────────────────────────────────┘');
  console.log('');
  if (openBrowser) {
    const cmd = process.platform === 'win32' ? `start "" ${url}` : `open ${url}`;
    setTimeout(() => exec(cmd), 400);
  }
});
