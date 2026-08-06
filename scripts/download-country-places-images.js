/* ============================================================
   鍥藉璇︽儏銆屽煄甯備笌椋庢櫙銆嶅浘鐗囦笅杞藉櫒锛堜竴娆℃€у伐鍏?路 v2锛?   涓?23 涓棤鍩庡競鎺㈢储鏁版嵁鐨勫浗瀹朵笅杞界湡瀹炲湴鐐瑰浘鐗囷細
   - 鐑棬鍩庡競锛歛ssets/images/travel/city/{id}-c{n}.jpg
   - 浠ｈ〃椋庢櫙锛歛ssets/images/travel/scenery/{id}-s{n}.jpg
   鏉ユ簮锛歐ikimedia Commons锛堣嚜鐢辫鍙湡瀹炲疄鎷嶏級
   椤哄簭涓嬭浇 + 闄愰€燂紝閬垮厤 429锛涜繃婊ゅ窘绔?鏃楀笢/鍦板浘绫诲浘鐗囷紱
   鏍￠獙 JPEG锛涘け璐ヨ嚜鍔ㄦ崲鍊欓€夊苟閲嶈瘯銆?   鐢ㄦ硶锛歯ode scripts/download-country-places-images.js
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { EXTRA } = require('./country-places-extra.js');

const ROOT = path.resolve(__dirname, '..');
const FORCE_JSON = path.join(__dirname, 'country-places-force.json');
const FORCE = fs.existsSync(FORCE_JSON) ? JSON.parse(fs.readFileSync(FORCE_JSON, 'utf8')) : {};
const forceAll = process.argv.includes('--force-all');
const onlyForce = process.argv.includes('--force');
const API_UA = 'IstraInternational/1.0 (global opportunity database; contact: dev@example.com)';
const DL_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const BAD_TITLE = /coat of arms|flag|seal|emblem|logo|locator|diagram|icon|map of|orthographic|blank map|miniature/i;

const TARGETS = [];
for (const c of EXTRA) {
  c.cities.forEach((city, i) => {
    TARGETS.push({
      key: `${c.id}-c${i + 1}`,
      file: path.join(ROOT, 'assets', 'images', 'travel', 'city', `${c.id}-c${i + 1}.jpg`),
      rel: `assets/images/travel/city/${c.id}-c${i + 1}.jpg`,
      query: city.en,
      label: `${c.cn} 路 ${city.n}`,
      kind: 'city'
    });
  });
  c.scenery.forEach((s, i) => {
    TARGETS.push({
      key: `${c.id}-s${i + 1}`,
      file: path.join(ROOT, 'assets', 'images', 'travel', 'scenery', `${c.id}-s${i + 1}.jpg`),
      rel: `assets/images/travel/scenery/${c.id}-s${i + 1}.jpg`,
      query: s.en,
      label: `${c.cn} 路 ${s.n}`,
      kind: 'scenery'
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchCommons(query) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json' +
    '&generator=search&gsrsearch=' + encodeURIComponent(query) +
    '&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1280';
  const r = await fetch(url, { headers: { 'User-Agent': API_UA } });
  if (r.status === 429) { await sleep(4000); return null; }
  if (!r.ok) throw new Error('search HTTP ' + r.status);
  const j = await r.json();
  const pages = (j.query && j.query.pages) ? Object.values(j.query.pages) : [];
  return pages
    .map((p) => {
      const ii = p.imageinfo && p.imageinfo[0];
      if (!ii || ii.mime !== 'image/jpeg') return null;
      if (BAD_TITLE.test(p.title)) return null;
      return { title: p.title, url: ii.thumburl || ii.url, width: ii.width || 0, height: ii.height || 0 };
    })
    .filter(Boolean);
}

function score(title, query) {
  const t = title.toLowerCase();
  const q = query.toLowerCase();
  let s = 0;
  if (t.includes(q)) s += 100;
  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
  words.forEach((w) => { if (t.includes(w)) s += 20; });
  return s;
}

async function download(url, file) {
  const r = await fetch(url, { headers: { 'User-Agent': DL_UA } });
  if (r.status === 429) { await sleep(6000); return { retry: true }; }
  if (!r.ok) throw new Error('download HTTP ' + r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) {
    throw new Error('not a JPEG (' + buf.length + ' bytes)');
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
  return { retry: false, size: buf.length };
}

async function fetchOne(t) {
  let lastErr = null;
  const isForce = forceAll || Object.prototype.hasOwnProperty.call(FORCE, t.key);
  if (onlyForce && !isForce) return { key: t.key, status: 'skip' };
  if (fs.existsSync(t.file)) {
    if (!isForce) return { key: t.key, status: 'exists' };
    fs.unlinkSync(t.file);
  }
  const baseQ = FORCE[t.key] || t.query;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      let cands = await searchCommons(baseQ);
      if (cands === null) { await sleep(8000); continue; }
      if (!cands.length) return { key: t.key, status: 'no-result', label: t.label };
      cands.sort((a, b) => score(b.title, baseQ) - score(a.title, baseQ) || b.width - a.width);
      for (const cand of cands.slice(0, 5)) {
        const res = await download(cand.url, t.file);
        if (res.retry) { await sleep(4000); continue; }
        return { key: t.key, status: 'ok', label: t.label, title: cand.title, size: res.size };
      }
      return { key: t.key, status: 'fail', label: t.label, err: lastErr && lastErr.message };
    } catch (e) {
      lastErr = e;
      await sleep(4000);
    }
  }
  return { key: t.key, status: 'error', label: t.label, err: lastErr && lastErr.message };
}

async function main() {
  const todo = onlyForce || forceAll ? TARGETS.filter((t) => forceAll || Object.prototype.hasOwnProperty.call(FORCE, t.key)) : TARGETS.filter((t) => !fs.existsSync(t.file));
  console.log(`鐩爣 ${TARGETS.length} 路 宸插瓨鍦?${TARGETS.length - todo.length} 路 寰呬笅杞?${todo.length}`);
  const results = [];
  for (let i = 0; i < todo.length; i++) {
    const res = await fetchOne(todo[i]);
    results.push(res);
    console.log(`[${i + 1}/${todo.length}] ${res.status.padEnd(9)} ${todo[i].rel}  ${res.title || res.err || ''}`);
    await sleep(900);
  }
  const ok = results.filter((r) => r.status === 'ok').length;
  const fail = results.filter((r) => r.status !== 'ok');
  console.log(`\n瀹屾垚锛氭垚鍔?${ok} 路 澶辫触 ${fail.length}`);
  if (fail.length) {
    fs.writeFileSync(path.join(ROOT, 'work-download-report.json'), JSON.stringify(fail, null, 2), 'utf8');
    console.log('澶辫触鏄庣粏宸插啓鍏?work-download-report.json');
    process.exitCode = 1;
  }
}

main();