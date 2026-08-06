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
const TABLES = ['users', 'user_profiles', 'assessments', 'recommendations', 'user_behavior', 'sessions'];
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

async function handleApi(req, res, url) {
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

  /* POST /api/assessments（保存评估 + 推荐） */
  if (p === '/api/assessments' && method === 'POST') {
    const u = authUser(req);
    if (!u) return sendJson(res, 401, { error: '未登录' });
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
