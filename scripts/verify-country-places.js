/* ============================================================
   国家详情「城市与风景」数据验证脚本
   检查：53 国全覆盖、每国 3 城 + 3 景、字段完整、图片文件存在且为 JPEG
   用法：node scripts/verify-country-places.js
   ============================================================ */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function loadJs(rel) {
  const ctx = {};
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx, { filename: rel });
  return ctx.Istra;
}

function isJpeg(file) {
  try {
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(4);
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  } catch (e) { return false; }
}

const I = loadJs('src/data/countries.js');
const P = loadJs('src/data/country-places.js');
const avail = I.countries.filter((c) => c.is_available !== false);
const cities = P.countryCities || [];
const scenery = P.countryScenery || [];

let errors = 0;
const err = (msg) => { console.error('✗ ' + msg); errors++; };

/* 1. 国家全覆盖 + 每国 3 城 3 景 */
for (const c of avail) {
  const cs = cities.filter((r) => r.country_id === c.id);
  const ss = scenery.filter((r) => r.country_id === c.id);
  if (cs.length !== 3) err(`${c.id} 城市数量异常：${cs.length}`);
  if (ss.length !== 3) err(`${c.id} 风景数量异常：${ss.length}`);
}

/* 2. 字段完整性 */
for (const r of cities) {
  if (!r.id || !r.country_id || !r.city_name || !r.image || !r.description) err(`城市字段缺失：${JSON.stringify(r)}`);
}
for (const r of scenery) {
  if (!r.id || !r.country_id || !r.name || !r.image || !r.description) err(`风景字段缺失：${JSON.stringify(r)}`);
}

/* 3. ID 唯一 */
const allIds = [...cities, ...scenery].map((r) => r.id);
const dup = allIds.filter((id, i) => allIds.indexOf(id) !== i);
if (dup.length) err(`重复 ID：${[...new Set(dup)].join(',')}`);

/* 4. 图片存在 + JPEG */
let missingImg = 0;
for (const r of [...cities, ...scenery]) {
  const f = path.join(ROOT, r.image);
  if (!fs.existsSync(f)) { err(`图片不存在：${r.image}`); missingImg++; continue; }
  if (!isJpeg(f)) { err(`图片非 JPEG：${r.image}`); missingImg++; }
}

console.log(`\n国家 ${avail.length} 国 · 城市 ${cities.length} 条 · 风景 ${scenery.length} 条`);
if (errors) {
  console.error(`\n校验失败：${errors} 项`);
  process.exit(1);
}
console.log('✓ 全部通过：53 国全覆盖，每国 3 城市 + 3 风景，图片均为有效 JPEG');