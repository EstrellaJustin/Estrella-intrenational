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
/* 数据库目录：默认本地 data/userdb；生产可设 DATA_DIR 指向 Render 持久磁盘，避免重启丢数据 */
const dbDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, 'data', 'userdb');
const args = process.argv.slice(2);
const portArg = args.find((a) => a.startsWith('--port='));
const port = portArg ? Number(portArg.split('=')[1]) : (process.env.PORT || 4173);
const openBrowser = !args.includes('--no-open');

/* ---------- 数据库（JSON 文件表） ---------- */
const TABLES = ['users', 'user_profiles', 'assessments', 'recommendations', 'user_behavior', 'sessions', 'products', 'orders', 'payments', 'entitlements', 'visitor_assessments'];
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

/* ================= AI 评估防刷 / 风控（最小化数据采集，仅哈希） ================= */
const FREE_QUOTA = Math.max(0, Number(process.env.FREE_QUOTA) || 3);
const PAID_QUOTA_PER_PURCHASE = 10;
function riskSalt() { return process.env.RISK_SALT || 'istra-risk-salt'; }
function hashRisk(v) { return crypto.createHash('sha256').update(String(v || '') + riskSalt()).digest('hex'); }
function clientIp(req) {
  const xff = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xff || (req.socket && req.socket.remoteAddress) || '';
}
/* 存量用户迁移：补齐风控/额度字段，不减少任何人已有额度 */
function normalizeUsers() {
  const users = loadTable('users');
  let changed = false;
  users.forEach((u) => {
    if (u.assessment_used === undefined) { u.assessment_used = 0; changed = true; }
    if (u.free_quota === undefined) { u.free_quota = 3; u.free_claimed = true; changed = true; }
    if (u.paid_quota === undefined) { u.paid_quota = u.assessmentUnlock ? 10 : 0; changed = true; }
    if (u.risk === undefined) { u.risk = 'low'; changed = true; }
    if (u.last_assessment_at === undefined) { u.last_assessment_at = null; changed = true; }
  });
  if (changed) saveTable('users', users);
}
function computeQuota(user) {
  const free = Math.max(0, Number(user.free_quota) || 0);
  const paid = Math.max(0, Number(user.paid_quota) || 0);
  const used = Math.max(0, Number(user.assessment_used) || 0);
  const total = free + paid;
  return {
    tier: paid > 0 ? 'paid' : 'user',
    quota: total,
    free_quota: free,
    paid_quota: paid,
    used,
    remaining: Math.max(0, total - used),
    free_claimed: !!user.free_claimed,
    risk: user.risk || 'low'
  };
}
/* 注册风控：同一设备 / 同一 IP 近 24h 注册数量 → 风险评分（低/中/高） */
function registerRisk(users, deviceHash, ipHash) {
  const day = Date.now() - 24 * 3600 * 1000;
  let dev = 0, ip = 0;
  users.forEach((u) => {
    if (!u.registeredAt) return;
    const t = new Date(u.registeredAt).getTime();
    if (!t || t < day) return;
    if (deviceHash && u.device_hash === deviceHash) dev += 1;
    if (ipHash && u.register_ip_hash === ipHash) ip += 1;
  });
  let score = 0;
  if (dev >= 3) score += 4; else if (dev >= 1) score += 2;
  if (ip >= 12) score += 4; else if (ip >= 6) score += 2; else if (ip >= 3) score += 1;
  const risk = score >= 4 ? 'high' : (score >= 2 ? 'medium' : 'low');
  return { score, dev, ip, risk };
}
/* 内存请求频率限制（防突发；重启重置可接受） */
const rateBuckets = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  let b = rateBuckets.get(key);
  if (!b) { b = { times: [] }; rateBuckets.set(key, b); }
  b.times = b.times.filter((t) => now - t < windowMs);
  if (b.times.length >= max) return true;
  b.times.push(now);
  return false;
}


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
const PAYMENT_CHANNELS = ['test', 'wechat', 'alipay'];
function paymentProviderEnabled(channel) {
  if (channel === 'test') return true;
  if (channel === 'wechat') return true; /* 微信收款码：人工审核，无需商户配置 */
  if (channel === 'alipay') return true; /* 支付宝扫码：人工审核，无需商户配置 */
  return false;
}
function testPaySecret() { return process.env.TEST_PAY_SECRET || 'istra-test-secret'; }
function adminSecret() { return process.env.ADMIN_TOKEN || 'istra-admin-secret'; }
function createPaymentRequest(order, product) {
  if (order.channel === 'alipay') {
    return { channel: 'alipay', manual: true, review: true };
  }
  if (order.channel === 'wechat') {
    return { channel: 'wechat', manual: true, review: true };
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
    if (idx >= 0) { users[idx].assessmentUnlock = true;
      users[idx].paid_quota = (Number(users[idx].paid_quota) || 0) + PAID_QUOTA_PER_PURCHASE;
      saveTable('users', users); }
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
/* POST /api/auth/register */
  if (p === '/api/auth/register' && method === 'POST') {
    const b = await readBody(req);
    const name = cleanStr(b.name, 40);
    const phone = cleanStr(b.phone, 30);
    const email = cleanStr(b.email, 120).toLowerCase();
    const password = String(b.password || '');
    if (!name || !password || password.length < 4) return sendJson(res, 400, { error: '请填写姓名与至少 4 位密码' });
    if (!phone && !email) return sendJson(res, 400, { error: '手机号或邮箱至少填写一项' });
    const ip = clientIp(req);
    const ipHash = hashRisk(ip);
    const deviceHash = b.deviceFingerprint ? hashRisk(cleanStr(b.deviceFingerprint, 500)) : '';
    const users = loadTable('users');
    /* IP 短时限流：同一出口 IP 短时间内大量注册 → 429（不永久封禁） */
    const shortWin = Number(process.env.REG_IP_SHORT_MS) || 5 * 60 * 1000;
    const shortMax = Number(process.env.REG_IP_SHORT_MAX) || 3;
    const burst = users.filter((u) => u.register_ip_hash === ipHash && u.registeredAt && (Date.now() - new Date(u.registeredAt).getTime()) < shortWin).length;
    if (burst >= shortMax) return sendJson(res, 429, { error: '注册过于频繁，请稍后再试' });
    const dup = users.find((u) => (phone && u.phone === phone) || (email && u.email === email));
    if (dup) return sendJson(res, 409, { error: '该手机号或邮箱已注册' });
    /* 多因素风控：设备 + IP + 频率 → 低/中/高风险 */
    const rk = registerRisk(users, deviceHash, ipHash);
    const freeGranted = rk.risk === 'low';
    const salt = crypto.randomBytes(16).toString('hex');
    const now = new Date().toISOString();
    const user = {
      id: nextId(users), name, phone, email,
      salt, hash: hashPwd(password, salt),
      registeredAt: now,
      country: cleanStr(b.country, 60), city: cleanStr(b.city, 60),
      lastLoginAt: now,
      assessmentUnlock: false,
      assessment_used: 0,
      free_quota: freeGranted ? FREE_QUOTA : 0,
      free_claimed: freeGranted,
      paid_quota: 0,
      risk: rk.risk,
      device_hash: deviceHash || '',
      register_ip_hash: ipHash,
      last_ip_hash: ipHash,
      last_assessment_at: null
    };
    users.push(user);
    saveTable('users', users);
    saveTable('user_profiles', loadTable('user_profiles').concat([{ userId: user.id, updatedAt: now }]));
    const token = newToken();
    saveTable('sessions', loadTable('sessions').concat([{ token, userId: user.id }]));
    return sendJson(res, 200, { token, user: publicUser(user), quota: computeQuota(user), risk: rk.risk });
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
    user.last_ip_hash = hashRisk(clientIp(req));
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
/* POST /api/assessments/visitor（游客评估计数 · 成功生成报告后调用，失败不扣 · IP 频率限制） */
  if (p === '/api/assessments/visitor' && method === 'POST') {
    const b = await readBody(req);
    const visitorId = cleanStr(b.visitorId, 80);
    if (!visitorId) return sendJson(res, 400, { error: '缺少 visitorId' });
    const ipHash = hashRisk(clientIp(req));
    if (rateLimit('v:' + ipHash, Number(process.env.VISITOR_IP_MAX) || 3, 10 * 60 * 1000)) {
      return sendJson(res, 429, { error: '操作过于频繁，请稍后再试' });
    }
    const q = assessmentQuota(null, visitorId);
    if (q.remaining <= 0) return sendJson(res, 429, { error: '评估次数已用完，请注册后继续使用', quota: q });
    const rows = loadTable('visitor_assessments');
    const rec = rows.find((x) => x.visitorId === visitorId);
    if (rec) { rec.used += 1; rec.lastIpHash = ipHash; } else { rows.push({ id: nextId(rows), visitorId, used: 1, ipHash, createdAt: new Date().toISOString() }); }
    saveTable('visitor_assessments', rows);
    return sendJson(res, 200, assessmentQuota(null, visitorId));
  }
  
  /* POST /api/assessments（保存评估 + 推荐） */
/* POST /api/assessments（保存评估 + 推荐：后端原子扣减，前端无法伪造次数） */
  if (p === '/api/assessments' && method === 'POST') {
    const u = authUser(req);
    if (!u) return sendJson(res, 401, { error: '未登录' });
    if (rateLimit('assess:' + u.id, Number(process.env.ASSESS_RATE_MAX) || 4, Number(process.env.ASSESS_RATE_MS) || 60000)) {
      return sendJson(res, 429, { error: '评估请求过于频繁，请稍后再试' });
    }
    const b = await readBody(req);
    /* 授权检查 + 扣减：readBody 之后全部同步执行（单线程内无 await 间隙）→ 并发也无法超额 */
    const users = loadTable('users');
    const idx = users.findIndex((x) => x.id === u.id);
    if (idx < 0) return sendJson(res, 401, { error: '未登录' });
    const q = computeQuota(users[idx]);
    if (q.remaining <= 0) return sendJson(res, 429, { error: '免费评估次数已用完，请购买评估次数。', quota: q });
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
    recs.forEach((r, i) => {
      recTable.push({
        id: nextId(recTable), userId: u.id, assessmentId: id,
        rank: i + 1, country: r.country || '', project: r.project || '',
        score: Number(r.score) || 0, reason: r.reason || '', createdAt: now
      });
    });
    saveTable('recommendations', recTable);
    /* 评估保存成功后才扣减（失败不扣） */
    users[idx].assessment_used = q.used + 1;
    users[idx].last_assessment_at = now;
    users[idx].last_ip_hash = hashRisk(clientIp(req));
    saveTable('users', users);
    return sendJson(res, 200, { id, savedAt: now, quota: computeQuota(users[idx]) });
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

  /* AI 评估次数额度：付费额度 > 免费额度 > 游客（完全由后端计算） */
function assessmentQuota(user, visitorId) {
  if (user) return computeQuota(user);
  const rows = loadTable('visitor_assessments');
  const rec = rows.find((x) => x.visitorId === visitorId) || null;
  const used = rec ? rec.used : 0;
  return { tier: 'visitor', quota: 1, free_quota: 1, paid_quota: 0, used, remaining: Math.max(0, 1 - used), free_claimed: true, risk: 'low' };
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

    /* POST /api/pay/unlock（已停用：改为正式支付宝人工审核支付流程，禁止免支付直接解锁） */
  if (p === '/api/pay/unlock' && method === 'POST') {
    return sendJson(res, 400, { error: '请通过正式支付流程购买：进入支付页面选择支付宝扫码支付并等待审核通过。' });
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

  /* POST /api/payment/proof（支付宝人工审核：上传付款凭证 → 待审核） */
  if (p === '/api/payment/proof' && method === 'POST') {
    const u = authUser(req); if (!u) return sendJson(res, 401, { error: '未登录' });
    const b = await readBody(req);
    const orders = loadTable('orders');
    const o = orders.find((x) => x.id === Number(b.orderId) && x.userId === u.id);
    if (!o) return sendJson(res, 404, { error: '订单不存在' });
    if (o.channel !== 'alipay' && o.channel !== 'wechat') return sendJson(res, 400, { error: '该订单不支持上传付款凭证' });
    if (o.status !== 'pending') return sendJson(res, 400, { error: '订单状态不允许上传凭证' });
    const transactionNo = cleanStr(b.transactionNo, 80);
    if (!transactionNo) return sendJson(res, 400, { error: '请填写交易单号' });
    const proof = String(b.proof || '').replace(/^data:[^;]+;base64,/, '');
    if (!proof || proof.length < 100) return sendJson(res, 400, { error: '请上传有效的付款凭证图片' });
    const buf = Buffer.from(proof, 'base64');
    if (buf.length > 2 * 1024 * 1024) return sendJson(res, 413, { error: '凭证图片过大（≤2MB）' });
    const proofDir = path.join(dbDir, 'proofs');
    fs.mkdirSync(proofDir, { recursive: true });
    fs.writeFileSync(path.join(proofDir, o.orderId + '.jpg'), buf);
    o.proofAt = new Date().toISOString(); o.proofFile = o.orderId + '.jpg';
    o.transactionNo = transactionNo; o.paymentMethod = o.channel;
    saveTable('orders', orders);
    return sendJson(res, 200, { ok: true, order: o });
  }

  /* POST /api/payment/review（管理员审核支付宝订单：approve=true 通过并发权益） */
  if (p === '/api/payment/review' && method === 'POST') {
    const token = getToken(req);
    if (!token || token !== adminSecret()) return sendJson(res, 403, { error: '审核令牌无效' });
    const b = await readBody(req);
    const orders = loadTable('orders');
    const o = orders.find((x) => x.id === Number(b.orderId));
    if (!o) return sendJson(res, 404, { error: '订单不存在' });
    if (o.channel !== 'alipay' && o.channel !== 'wechat') return sendJson(res, 400, { error: '仅支付宝/微信订单可人工审核' });
    if (o.status === 'paid') return sendJson(res, 200, { ok: true, alreadyPaid: true, order: o });
    if (o.status !== 'pending') return sendJson(res, 400, { error: '订单状态不允许审核' });
    if (b.approve) {
      o.status = 'paid'; o.paidAt = new Date().toISOString(); o.transactionId = 'ALIPAY-REVIEW-' + Date.now();
      saveTable('orders', orders);
      const user = loadTable('users').find((x) => x.id === o.userId);
      const product = productById(o.productId);
      const ents = user && product ? grantEntitlement(user, product, o) : [];
      return sendJson(res, 200, { ok: true, order: o, entitlements: ents.map((e) => e.productId) });
    }
    o.status = 'cancelled'; o.cancelledAt = new Date().toISOString(); o.reviewNote = cleanStr(b.note, 200);
    saveTable('orders', orders);
    return sendJson(res, 200, { ok: true, order: o });
  }
  /* GET /api/admin/risk（管理员风控概览：脱敏展示，不泄露哈希/密钥/明文敏感信息） */
  if (p === '/api/admin/risk' && method === 'GET') {
    const token = getToken(req);
    if (!token || token !== adminSecret()) return sendJson(res, 403, { error: '审核令牌无效' });
    const users = loadTable('users');
    const orders = loadTable('orders');
    const mask = (x) => (x && x.length >= 7 ? x.slice(0, 3) + '****' + x.slice(-4) : (x || ''));
    const out = users.map((u) => {
      const uo = orders.filter((o) => o.userId === u.id);
      const free = Number(u.free_quota) || 0;
      const paid = Number(u.paid_quota) || 0;
      const used = Number(u.assessment_used) || 0;
      return {
        id: u.id, name: u.name, phone: mask(u.phone), email: mask(u.email),
        registeredAt: u.registeredAt, risk: u.risk || 'low',
        free_quota: free, paid_quota: paid, used, remaining: Math.max(0, free + paid - used),
        last_assessment_at: u.last_assessment_at || null,
        device_hash: u.device_hash ? u.device_hash.slice(0, 10) : '',
        ip_hash: u.register_ip_hash ? u.register_ip_hash.slice(0, 10) : '',
        pending_alipay: uo.filter((o) => o.channel === 'alipay' && o.status === 'pending').length,
        paid_orders: uo.filter((o) => o.status === 'paid').length
      };
    }).sort((a, b) => (a.registeredAt < b.registeredAt ? 1 : -1));
    return sendJson(res, 200, { users: out });
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
normalizeUsers();
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
