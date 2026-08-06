/* ============================================================
   国家详情「城市与风景」数据生成器
   生成：src/data/country-places.js
   - Istra.countryCities：53 国 × 3 热门城市（id/country_id/city_name/image/description）
   - Istra.countryScenery：53 国 × 3 代表风景（id/country_id/name/image/description）
   数据来源：
   - 30 国：src/data/cities.js（城市实景图 + 景点实景图，已有）
   - 23 国：scripts/country-places-extra.js（新下载真实地点图片）
   结构支持未来扩展到 195 国：只需为新增国家补充对应记录。
   用法：node scripts/generate-country-places.js
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { EXTRA } = require('./country-places-extra.js');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');

function loadCitiesJs() {
  const src = fs.readFileSync(path.join(DATA, 'cities.js'), 'utf8');
  const m = src.match(/Istra\.cities\s*=\s*(\[[\s\S]*\]);/);
  if (!m) throw new Error('cities.js 解析失败');
  return JSON.parse(m[1]);
}

const citiesDb = loadCitiesJs();
const byCountry = {};
citiesDb.forEach((c) => { (byCountry[c.country.id] = byCountry[c.country.id] || []).push(c); });

const countryCities = [];
const countryScenery = [];

/* 30 国：取前 3 城市；风景取各城市第 1 个景点 */
for (const cid of Object.keys(byCountry)) {
  const list = byCountry[cid].slice(0, 3);
  list.forEach((c, i) => {
    countryCities.push({
      id: c.id,
      country_id: cid,
      city_name: c.city,
      image: c.image,
      description: (c.description || '').replace(/。$/, '')
    });
    const a = (c.attractions || [])[0];
    if (a) {
      countryScenery.push({
        id: `${cid}-s${i + 1}`,
        country_id: cid,
        name: a.name,
        image: a.image,
        description: (a.intro || '').replace(/。$/, '')
      });
    }
  });
}

/* 23 国：EXTRA 补充数据 */
for (const c of EXTRA) {
  c.cities.forEach((city, i) => {
    countryCities.push({
      id: `${c.id}-c${i + 1}`,
      country_id: c.id,
      city_name: city.n,
      image: `assets/images/travel/city/${c.id}-c${i + 1}.jpg`,
      description: city.note
    });
  });
  c.scenery.forEach((s, i) => {
    countryScenery.push({
      id: `${c.id}-s${i + 1}`,
      country_id: c.id,
      name: s.n,
      image: `assets/images/travel/scenery/${c.id}-s${i + 1}.jpg`,
      description: s.note
    });
  });
}

/* 校验：53 国全覆盖，每国 3 城 + 3 景 */
const avail = JSON.parse(
  fs.readFileSync(path.join(DATA, 'countries.js'), 'utf8')
    .match(/Istra\.countries\s*=\s*(\[[\s\S]*\]);/)[1]
).filter((c) => c.is_available !== false);

const coveredCities = new Set(countryCities.map((r) => r.country_id));
const coveredScenery = new Set(countryScenery.map((r) => r.country_id));
const missing = avail.filter((c) => !coveredCities.has(c.id) || !coveredScenery.has(c.id));
if (missing.length) {
  console.error('缺失国家：', missing.map((c) => c.id).join(','));
  process.exit(1);
}
const badCount = avail.filter((c) =>
  countryCities.filter((r) => r.country_id === c.id).length !== 3 ||
  countryScenery.filter((r) => r.country_id === c.id).length !== 3
);
if (badCount.length) {
  console.error('数量异常国家：', badCount.map((c) => c.id).join(','));
  process.exit(1);
}

/* 校验图片文件存在 */
const missingImg = [...countryCities, ...countryScenery].filter((r) => !fs.existsSync(path.join(ROOT, r.image)));
if (missingImg.length) {
  console.error('缺失图片：');
  missingImg.forEach((r) => console.error(' ', r.image));
  process.exit(1);
}

const out = `/* 国家详情「城市与风景」数据库（生成自 scripts/generate-country-places.js）
   53 国 × 3 热门城市 + 3 代表风景，结构支持扩展至 195 国 */
window.Istra = window.Istra || {};
Istra.countryCities = ${JSON.stringify(countryCities)};
Istra.countryScenery = ${JSON.stringify(countryScenery)};
`;

fs.writeFileSync(path.join(DATA, 'country-places.js'), out, 'utf8');
console.log(`已生成 country-places.js：城市 ${countryCities.length} 条 · 风景 ${countryScenery.length} 条 · 国家 ${avail.length} 国全覆盖`);