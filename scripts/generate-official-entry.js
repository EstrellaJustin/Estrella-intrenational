/* ============================================================
   项目详情「官方申请入口」数据生成器
   为 src/data/projects.json 中全部项目附加官方申请字段：
   official_authority / official_website / application_url /
   application_method / application_notes / last_verified_date / source_type
   国家级数据使用各国官方移民/签证机构主页（不编造独立申请页 URL）。
   不删除已有数据、不改变项目 ID。
   用法：node scripts/generate-official-entry.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const PROJ = path.join(DATA, 'projects.json');

/* 53 国官方移民/签证机构（真实官方主页） */
const OFFICIAL = {
  us: { authority: 'United States Citizenship and Immigration Services (USCIS)', website: 'https://www.uscis.gov', url: 'https://www.uscis.gov/working-in-the-united-states' },
  ca: { authority: 'Immigration, Refugees and Citizenship Canada (IRCC)', website: 'https://www.canada.ca/en/immigration-refugees-citizenship.html', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html' },
  mx: { authority: 'Instituto Nacional de Migración (INM)', website: 'https://www.inm.gob.mx', url: 'https://www.inm.gob.mx/gobmx/word/index.php/' },
  gb: { authority: 'UK Visas and Immigration (UKVI)', website: 'https://www.gov.uk/government/organisations/uk-visas-and-immigration', url: 'https://www.gov.uk/browse/visas-immigration' },
  de: { authority: 'Federal Office for Migration and Refugees (BAMF)', website: 'https://www.bamf.de', url: 'https://www.bamf.de/EN/Themen/MigrationAufenthalt/migrationAufenthalt-node.html' },
  fr: { authority: 'France-Visas · Ministère de l’Intérieur', website: 'https://france-visas.gouv.fr', url: 'https://france-visas.gouv.fr/en' },
  nl: { authority: 'Immigration and Naturalisation Service (IND)', website: 'https://ind.nl', url: 'https://ind.nl/en' },
  se: { authority: 'Swedish Migration Agency (Migrationsverket)', website: 'https://www.migrationsverket.se', url: 'https://www.migrationsverket.se/English.html' },
  no: { authority: 'Norwegian Directorate of Immigration (UDI)', website: 'https://www.udi.no', url: 'https://www.udi.no/en/' },
  dk: { authority: 'Danish Immigration Service (Nyidanmark)', website: 'https://www.nyidanmark.dk', url: 'https://www.nyidanmark.dk/en-GB/' },
  fi: { authority: 'Finnish Immigration Service (Migri)', website: 'https://migri.fi', url: 'https://migri.fi/en/home' },
  ie: { authority: 'Irish Immigration Service Delivery (ISD)', website: 'https://www.irishimmigration.ie', url: 'https://www.irishimmigration.ie/' },
  it: { authority: 'Ministero dell’Interno · Visti per l’Italia', website: 'https://www.interno.gov.it', url: 'https://vistoperitalia.esteri.it' },
  es: { authority: 'Ministerio de Inclusión, Seguridad Social y Migraciones', website: 'https://www.inclusion.gob.es', url: 'https://www.inclusion.gob.es/web/migraciones' },
  pt: { authority: 'AIMA · Agência para a Integração, Migrações e Asilo', website: 'https://aima.gov.pt', url: 'https://aima.gov.pt' },
  ch: { authority: 'State Secretariat for Migration (SEM)', website: 'https://www.sem.admin.ch', url: 'https://www.sem.admin.ch/sem/en/home.html' },
  at: { authority: 'Austrian Federal Ministry of the Interior (BMI)', website: 'https://www.bmi.gv.at', url: 'https://www.oesterreich.gv.at' },
  be: { authority: 'Immigration Office · FPS Home Affairs', website: 'https://dofi.ibz.be', url: 'https://dofi.ibz.be/en' },
  lu: { authority: 'Direction de l’Immigration · Guichet.lu', website: 'https://guichet.public.lu', url: 'https://guichet.public.lu/en/citoyens/immigration/' },
  pl: { authority: 'Office for Foreigners (Urząd do Spraw Cudzoziemców)', website: 'https://www.gov.pl/web/udsc', url: 'https://www.gov.pl/web/udsc-en' },
  cz: { authority: 'Ministry of the Interior of the Czech Republic', website: 'https://www.mvcr.cz', url: 'https://frs.gov.cz/en' },
  hu: { authority: 'National Directorate-General for Aliens Policing', website: 'https://www.mm.gov.hu', url: 'https://www.mm.gov.hu/en' },
  gr: { authority: 'Ministry of Migration and Asylum of Greece', website: 'https://migration.gov.gr', url: 'https://migration.gov.gr/en/' },
  cy: { authority: 'Civil Registry and Migration Department (CRMD)', website: 'https://www.moi.gov.cy', url: 'https://crmd.moi.gov.cy' },
  mt: { authority: 'Identity Malta Agency', website: 'https://www.identitymalta.com', url: 'https://www.identitymalta.com' },
  hr: { authority: 'Ministry of the Interior of Croatia (MUP)', website: 'https://mup.gov.hr', url: 'https://mup.gov.hr/en' },
  si: { authority: 'Ministry of the Interior of Slovenia', website: 'https://www.gov.si', url: 'https://www.gov.si/en/topics/foreigners/' },
  sk: { authority: 'Bureau of Border and Alien Police of Slovakia', website: 'https://www.minv.sk', url: 'https://www.minv.sk/?foreigners' },
  ee: { authority: 'Police and Border Guard Board (PPA)', website: 'https://www.politsei.ee', url: 'https://www.politsei.ee/en/' },
  lt: { authority: 'Migration Department under the Ministry of the Interior', website: 'https://migracija.lt', url: 'https://migracija.lt/en' },
  lv: { authority: 'Office of Citizenship and Migration Affairs (PMLP)', website: 'https://www.pmlp.gov.lv', url: 'https://www.pmlp.gov.lv/en' },
  ro: { authority: 'General Inspectorate for Immigration (IGI)', website: 'https://igi.mai.gov.ro', url: 'https://igi.mai.gov.ro/en' },
  bg: { authority: 'Migration Directorate · Ministry of Interior of Bulgaria', website: 'https://www.mvr.bg', url: 'https://www.mvr.bg/en' },
  jp: { authority: 'Immigration Services Agency of Japan (ISA)', website: 'https://www.isa.go.jp', url: 'https://www.isa.go.jp/en/' },
  kr: { authority: 'Korea Immigration Service (KIS)', website: 'https://www.immigration.go.kr', url: 'https://www.immigration.go.kr/immigration/index.do' },
  sg: { authority: 'Immigration & Checkpoints Authority (ICA)', website: 'https://www.ica.gov.sg', url: 'https://www.ica.gov.sg/' },
  my: { authority: 'Immigration Department of Malaysia (JIM)', website: 'https://www.imi.gov.my', url: 'https://www.imi.gov.my/' },
  th: { authority: 'Immigration Bureau of Thailand', website: 'https://www.immigration.go.th', url: 'https://www.immigration.go.th/' },
  vn: { authority: 'Vietnam Immigration Department', website: 'https://www.xuatnhapcanh.gov.vn', url: 'https://www.xuatnhapcanh.gov.vn/' },
  ph: { authority: 'Bureau of Immigration of the Philippines', website: 'https://immigration.gov.ph', url: 'https://immigration.gov.ph/' },
  id: { authority: 'Directorate General of Immigration of Indonesia', website: 'https://www.imigrasi.go.id', url: 'https://www.imigrasi.go.id/' },
  in: { authority: 'Bureau of Immigration · Ministry of Home Affairs of India', website: 'https://www.mha.gov.in', url: 'https://indianvisaonline.gov.in' },
  au: { authority: 'Department of Home Affairs of Australia', website: 'https://immi.homeaffairs.gov.au', url: 'https://immi.homeaffairs.gov.au/' },
  nz: { authority: 'Immigration New Zealand (INZ)', website: 'https://www.immigration.govt.nz', url: 'https://www.immigration.govt.nz/' },
  ae: { authority: 'Federal Authority for Identity, Citizenship, Customs & Port Security (ICP)', website: 'https://icp.gov.ae', url: 'https://icp.gov.ae/en/' },
  qa: { authority: 'Ministry of Interior of Qatar', website: 'https://www.moi.gov.qa', url: 'https://www.moi.gov.qa/' },
  sa: { authority: 'Ministry of Interior of Saudi Arabia · Absher', website: 'https://www.moi.gov.sa', url: 'https://www.absher.sa' },
  il: { authority: 'Population and Immigration Authority of Israel', website: 'https://www.gov.il', url: 'https://www.gov.il/en/departments/units/population-and-immigration-authority' },
  tr: { authority: 'Presidency of Migration Management of Türkiye', website: 'https://en.goc.gov.tr', url: 'https://en.goc.gov.tr/' },
  br: { authority: 'Ministério das Relações Exteriores do Brasil', website: 'https://www.gov.br/mre', url: 'https://www.gov.br/mre/en' },
  ar: { authority: 'Dirección Nacional de Migraciones de Argentina', website: 'https://www.migraciones.gob.ar', url: 'https://www.migraciones.gob.ar/' },
  cl: { authority: 'Servicio Nacional de Migraciones de Chile', website: 'https://www.extranjeria.gob.cl', url: 'https://www.extranjeria.gob.cl/' },
  za: { authority: 'Department of Home Affairs of South Africa (DHA)', website: 'http://www.dha.gov.za', url: 'http://www.dha.gov.za/' }
};

/* 类别级申请方式与注意事项 */
const CATEGORY = {
  work: { method: '由雇主或申请人通过该国官方移民/签证机构在线系统提交申请。', notes: '工作类项目通常需先获得当地雇主录用或担保，申请材料以官方最新清单为准。' },
  tech: { method: '通过该国官方移民局或技术人才通道在线提交申请。', notes: '技术人才项目通常有学历、技能或语言要求，建议提前完成学历与职业资格认证。' },
  edu: { method: '先向院校提交录取申请，获得录取后通过官方签证门户申请学生签证。', notes: '学生签证需提供录取通知书、资金证明与健康材料，以官方要求为准。' },
  invest: { method: '通过该国官方移民局或授权投资机构提交申请。', notes: '投资类项目需准备合规资金来源证明，建议通过官方渠道或持牌顾问办理。' },
  talent: { method: '通过国家人才计划或官方杰出人才通道提交申请。', notes: '杰出人才类项目需提供成就证明、推荐材料与同行评审材料。' },
  family: { method: '由境内担保人向官方移民机构提交家庭团聚担保申请。', notes: '需提供亲属关系证明与担保人身份、收入等资格材料。' },
  pr: { method: '通过该国官方移民局提交永久居留申请。', notes: '永居项目通常要求满足居住年限、收入或语言等条件，以官方最新政策为准。' },
  nomad: { method: '通过该国官方签证门户在线提交数字游民/远程工作签证申请。', notes: '需提供远程工作证明、收入证明与有效护照等材料。' },
  youth: { method: '通过官方青年交流项目通道提交申请。', notes: '青年交流项目通常有年龄限制与年度名额，建议关注官方公告。' },
  special: { method: '通过该国官方对应特殊类别通道提交申请。', notes: '特殊类别项目需提供相应专业资质或背景证明。' }
};

const projects = JSON.parse(fs.readFileSync(PROJ, 'utf8'));
const verified = '2026-08-10';
let missing = [];

const enriched = projects.map((p) => {
  const o = OFFICIAL[p.country.id];
  if (!o) { missing.push(p.id); return p; }
  const c = CATEGORY[p.category.id] || CATEGORY.work;
  return Object.assign({}, p, {
    official_authority: o.authority,
    official_website: o.website,
    application_url: o.url,
    application_method: c.method,
    application_notes: c.notes,
    last_verified_date: verified,
    source_type: '政府官方网站'
  });
});

if (missing.length) {
  console.error('缺失官方机构映射的国家项目：', missing.join(','));
  process.exit(1);
}

fs.writeFileSync(PROJ, JSON.stringify(enriched), 'utf8');
/* 同步生成站点内嵌 projects.js（与 generate-database.js 格式一致） */
const js = `/* 全球项目数据库（生成自 scripts/generate-database.js，源文件 projects.json） */\nwindow.Istra = window.Istra || {};\nIstra.projects = ${JSON.stringify(enriched)};\n`;
fs.writeFileSync(path.join(DATA, 'projects.js'), js, 'utf8');

console.log('已为 ' + enriched.length + ' 个项目写入官方申请入口字段');