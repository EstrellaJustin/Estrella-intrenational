/* ============================================================
   全球地图 · 国家气候环境数据生成器
   生成：src/data/map-country-info.js
   - Istra.mapCountryInfo：53 国 { id, climate, bestSeason }
   数据来源：
   - 21 国：src/data/travel.js（climate / bestSeason）
   - 30 国：src/data/cities.js（首个城市 climate / bestSeason）
   - 23 国：下方 CLIMATE_EXTRA 手工补充
   只服务全球地图信息卡，不影响其他页面。
   用法：node scripts/generate-map-country-info.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');

/* 23 国气候补充（真实气候概括） */
const CLIMATE_EXTRA = {
  mx: { climate: '高原与热带气候并存，北部干旱，南部湿热', bestSeason: '11–4 月（旱季）' },
  lu: { climate: '温带海洋性气候，四季温和湿润', bestSeason: '5–9 月' },
  cy: { climate: '地中海气候，夏季炎热干燥，冬季温和多雨', bestSeason: '3–5 月、9–11 月' },
  mt: { climate: '地中海气候，全年温和，夏季干热', bestSeason: '4–6 月、9–10 月' },
  hr: { climate: '沿海地中海气候，内陆大陆性气候', bestSeason: '5–9 月' },
  si: { climate: '阿尔卑斯山气候与地中海气候过渡，四季分明', bestSeason: '5–9 月' },
  sk: { climate: '温带大陆性气候，四季分明', bestSeason: '5–9 月' },
  ee: { climate: '温带海洋性向大陆性过渡，夏季凉爽', bestSeason: '6–8 月' },
  lt: { climate: '温带大陆性气候，冬季寒冷，夏季温和', bestSeason: '5–9 月' },
  lv: { climate: '温带海洋性/大陆性过渡，湿润多雨', bestSeason: '5–9 月' },
  ro: { climate: '温带大陆性气候，四季分明', bestSeason: '5–9 月' },
  bg: { climate: '温带大陆性气候，黑海沿岸较为温和', bestSeason: '5–9 月' },
  cz: { climate: '温带大陆性气候，四季分明', bestSeason: '5–9 月' },
  hu: { climate: '温带大陆性气候，夏季温暖，冬季温和', bestSeason: '4–10 月' },
  gr: { climate: '地中海气候，夏季干热，冬季温和多雨', bestSeason: '4–6 月、9–10 月' },
  il: { climate: '地中海气候，南部为干旱沙漠气候', bestSeason: '3–5 月、9–11 月' },
  qa: { climate: '热带沙漠气候，夏季酷热，冬季温和', bestSeason: '11–3 月' },
  sa: { climate: '热带沙漠气候，全年炎热干旱', bestSeason: '11–3 月' },
  ph: { climate: '热带季风气候，全年温暖，雨季分明', bestSeason: '12–5 月' },
  id: { climate: '热带雨林气候，全年高温多雨', bestSeason: '4–10 月' },
  in: { climate: '热带与亚热带气候，雨季与旱季分明', bestSeason: '10–3 月' },
  ar: { climate: '气候多样，北部亚热带，中部温带，南部寒冷', bestSeason: '10–3 月' },
  cl: { climate: '气候多样，北部沙漠，中部地中海，南部温带', bestSeason: '10–4 月' }
};

function loadJs(rel) {
  const vm = require('vm');
  const ctx = {}; ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(DATA, rel), 'utf8'), ctx, { filename: rel });
  return ctx.Istra;
}

const countries = loadJs('countries.js').countries.filter((c) => c.is_available !== false);
const travel = loadJs('travel.js').travel || [];
const cities = loadJs('cities.js').cities || [];

const travelBy = {};
travel.forEach((t) => { travelBy[t.id] = t; });
const cityBy = {};
cities.forEach((c) => { if (!cityBy[c.country.id]) cityBy[c.country.id] = c; });

const rows = countries.map((c) => {
  const t = travelBy[c.id];
  const ct = cityBy[c.id];
  const ex = CLIMATE_EXTRA[c.id];
  const climate = (t && t.climate) || (ct && ct.climate) || (ex && ex.climate) || '';
  const bestSeason = (t && t.bestSeason) || (ct && ct.bestSeason) || (ex && ex.bestSeason) || '';
  return { id: c.id, climate, bestSeason };
});

const missing = rows.filter((r) => !r.climate || !r.bestSeason);
if (missing.length) {
  console.error('缺失气候数据：', missing.map((r) => r.id).join(','));
  process.exit(1);
}

const out = `/* 全球地图 · 国家气候环境数据库（生成自 scripts/generate-map-country-info.js）
   53 国 { id, climate, bestSeason }，仅供全球地图信息卡使用 */
window.Istra = window.Istra || {};
Istra.mapCountryInfo = ${JSON.stringify(rows)};
`;

fs.writeFileSync(path.join(DATA, 'map-country-info.js'), out, 'utf8');
console.log(`已生成 map-country-info.js：${rows.length} 国气候数据`);