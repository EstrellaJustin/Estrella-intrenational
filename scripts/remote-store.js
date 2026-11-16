/* ============================================================
   远程持久化存储（Supabase REST · 免费 Postgres）
   目的：Render 免费实例没有持久磁盘，重启会清空 data/userdb。
   方案：配置 SUPABASE_URL / SUPABASE_SERVICE_KEY 后，
        所有表读写改为 Supabase（启动时加载到内存，写入异步同步到云端）。
   未配置时：完全回退到原有 JSON 文件存储（本地开发不变）。
   ============================================================ */
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';
const TABLE = process.env.SUPABASE_TABLE || 'app_tables';
const enabled = !!(SUPABASE_URL && SUPABASE_KEY);

const cache = {};
const pending = new Map();
let flushTimer = null;
let flushing = false;

function headers() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal'
  };
}

async function request(path, opts) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + path, Object.assign({ headers: headers() }, opts || {}));
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('Supabase ' + res.status + ': ' + text.slice(0, 200));
  }
  return res;
}

/* 启动时把云端所有表加载进内存 */
async function init() {
  if (!enabled) return { enabled: false, loaded: 0 };
  const res = await request(TABLE + '?select=name,data', { method: 'GET' });
  const rows = await res.json().catch(() => []);
  let loaded = 0;
  if (Array.isArray(rows)) {
    rows.forEach((r) => {
      if (r && r.name) { cache[r.name] = r.data || []; loaded++; }
    });
  }
  return { enabled: true, loaded };
}

/* 与文件存储一致的语义：返回副本，避免调用方直接修改缓存 */
function load(name) {
  return JSON.parse(JSON.stringify(cache[name] || []));
}

/* 写入内存缓存，并异步同步到云端（300ms 合并写入） */
function save(name, rows) {
  cache[name] = JSON.parse(JSON.stringify(rows || []));
  pending.set(name, cache[name]);
  scheduleFlush();
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush().catch((e) => console.warn('[remote-store] 同步失败（将重试）:', e.message));
  }, 300);
}

async function flush() {
  if (flushing || !pending.size) return;
  flushing = true;
  const snapshot = [...pending.entries()];
  pending.clear();
  try {
    for (const [name, data] of snapshot) {
      await request(TABLE + '?on_conflict=name', {
        method: 'POST',
        body: JSON.stringify([{ name, data, updated_at: new Date().toISOString() }])
      });
    }
  } catch (e) {
    /* 失败回填，等待下次写入时重试 */
    snapshot.forEach(([name, data]) => { if (!pending.has(name)) pending.set(name, data); });
    throw e;
  } finally {
    flushing = false;
    if (pending.size) scheduleFlush();
  }
}

module.exports = { enabled, init, load, save, flush };
