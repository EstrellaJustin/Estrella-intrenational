/* ============================================================
   全球地图 · 国家就业机会数据生成器
   生成：src/data/map-employment.js
   - Istra.mapEmployment：53 国 { id, hotIndustries, inDemandJobs, salary, features }
   按 country_id 与 countries 数据库关联，仅供信息卡就业模块使用。
   用法：node scripts/generate-map-employment.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');

/* 53 国就业数据（真实经济结构概要） */
const EMPLOYMENT = {
  us: { hotIndustries: ['科技', '金融服务', '医疗健康', '高等教育'], inDemandJobs: ['软件工程师', '注册护士', '数据分析师', '电工'], salary: '年薪约 5.9–12 万美元（行业差异大）', features: ['就业市场庞大、机会多元', '竞争激烈，依赖雇主担保', 'H-1B 等工签对专业岗位友好'] },
  ca: { hotIndustries: ['信息技术', '医疗护理', '工程制造', '自然资源'], inDemandJobs: ['注册护士', '软件工程师', '卡车司机', '焊工'], salary: '年薪约 5.5–9 万加元', features: ['技术移民通道成熟', '各省雇主担保项目多', '医疗与技工类持续紧缺'] },
  mx: { hotIndustries: ['汽车制造', '电子装配', '旅游服务', '农业出口'], inDemandJobs: ['生产线技术员', '机械师', '客户服务', '物流专员'], salary: '月薪约 8,000–25,000 墨西哥比索', features: ['制造业岗位集中', '近岸外包带来增长', '蓝领与技术岗需求稳定'] },
  gb: { hotIndustries: ['金融科技', '信息技术', '教育研究', '创意产业'], inDemandJobs: ['软件开发', '医疗护理', '金融分析师', '工程师'], salary: '年薪约 3.2–6 万英镑', features: ['全球金融与科创中心', '短缺职业清单加分', '工签政策逐年收紧'] },
  de: { hotIndustries: ['汽车制造', '机械工程', '信息技术', '医疗护理'], inDemandJobs: ['IT 专家', '护理人员', '工程师', '电工'], salary: '年薪约 4.5–7 万欧元', features: ['EU 蓝卡门槛相对友好', '双元制职业培训成熟', '技术工人缺口大'] },
  fr: { hotIndustries: ['航空航天', '奢侈品', '信息技术', '酒店餐饮'], inDemandJobs: ['工程师', 'IT 开发', '厨师', '护理人员'], salary: '年薪约 3.5–5.5 万欧元', features: ['大型企业总部聚集', '创业签证吸引创新人才', '语言要求较高'] },
  nl: { hotIndustries: ['信息技术', '物流贸易', '农业科技', '金融'], inDemandJobs: ['软件工程师', '数据科学家', '物流专员', '工程师'], salary: '年薪约 4.5–7 万欧元', features: ['英语普及度高', '30% 税收优惠吸引外籍', '科技岗位需求旺盛'] },
  se: { hotIndustries: ['信息技术', '清洁能源', '医疗健康', '工程制造'], inDemandJobs: ['软件工程师', '护士', '电力工程师', '研发人员'], salary: '年薪约 45–70 万瑞典克朗', features: ['创新与研发密集', '工作签证获批较快', '福利体系完善'] },
  no: { hotIndustries: ['油气能源', '海事航运', '信息技术', '水产'], inDemandJobs: ['石油工程师', '软件工程师', '护士', '焊工'], salary: '年薪约 55–85 万挪威克朗', features: ['高薪与高福利', '能源行业岗位集中', '生活成本较高'] },
  dk: { hotIndustries: ['信息技术', '生物医药', '清洁能源', '设计'], inDemandJobs: ['软件工程师', '医药研发', '工程师', '数据分析'], salary: '年薪约 45–70 万丹麦克朗', features: ['高薪与工作生活平衡', '灵活就业市场', '英语工作环境普遍'] },
  fi: { hotIndustries: ['信息技术', '教育科技', '清洁能源', '林业'], inDemandJobs: ['软件工程师', '研发人员', '护士', '工程师'], salary: '年薪约 4.5–6.5 万欧元', features: ['科技创新生态活跃', '工作签证审批透明', '冬季气候需适应'] },
  ie: { hotIndustries: ['信息技术', '制药', '金融服务', '国际商务'], inDemandJobs: ['软件工程师', '数据分析', '税务顾问', '质量工程师'], salary: '年薪约 5–8 万欧元', features: ['跨国企业欧洲总部聚集', '英语工作环境', '住房成本偏高'] },
  it: { hotIndustries: ['高端制造', '时尚设计', '旅游餐饮', '机械'], inDemandJobs: ['机械工程师', '厨师', '护理人员', 'IT 开发'], salary: '年薪约 3–5 万欧元', features: ['制造业与设计强', '南欧生活节奏', '行政流程较慢'] },
  es: { hotIndustries: ['旅游服务', '可再生能源', '信息技术', '农业'], inDemandJobs: ['酒店服务', '可再生能源技术员', 'IT 开发', '护理人员'], salary: '年薪约 2.8–4.5 万欧元', features: ['数字游民签证受青睐', '旅游与服务业岗位多', '英语岗位有限'] },
  pt: { hotIndustries: ['信息技术', '旅游服务', '可再生能源', '房地产'], inDemandJobs: ['IT 工程师', '客服', '酒店服务', '建筑技工'], salary: '年薪约 2.5–4 万欧元', features: ['生活成本较低', '数字游民友好', '英语岗位增长快'] },
  ch: { hotIndustries: ['金融服务', '精密制造', '制药', '信息技术'], inDemandJobs: ['金融分析师', '机械工程师', '软件开发', '研究人员'], salary: '年薪约 8–12 万瑞士法郎', features: ['全球最高薪资之一', '多语言环境', '工签配额有限'] },
  at: { hotIndustries: ['机械制造', '旅游服务', '信息技术', '环保能源'], inDemandJobs: ['工程师', 'IT 专家', '酒店管理', '护理人员'], salary: '年薪约 4–6 万欧元', features: ['生活质量高', '红白红卡积分制', '德语要求较高'] },
  be: { hotIndustries: ['制药', '物流', '信息技术', '化工'], inDemandJobs: ['物流专员', '软件工程师', '研究员', '质量控制'], salary: '年薪约 4–6 万欧元', features: ['欧盟机构聚集', '多语言环境', '物流网络发达'] },
  lu: { hotIndustries: ['金融服务', '信息技术', '物流', '法律服务'], inDemandJobs: ['金融分析师', '软件工程师', '合规专员', '基金运营'], salary: '年薪约 6–10 万欧元', features: ['欧洲财富管理中心', '高薪低税负', '岗位集中于金融业'] },
  pl: { hotIndustries: ['信息技术', '制造业', '业务流程外包', '物流'], inDemandJobs: ['软件工程师', '客服', '生产线技工', '数据分析'], salary: '年薪约 2–4 万欧元', features: ['IT 外包中心', '成本优势明显', '欧盟内自由流动'] },
  cz: { hotIndustries: ['汽车制造', '机械工程', '信息技术', '电子'], inDemandJobs: ['机械工程师', 'IT 开发', '生产线技工', '质量控制'], salary: '年薪约 2.5–4.5 万欧元', features: ['工业制造强劲', '员工卡政策成熟', '生活成本适中'] },
  hu: { hotIndustries: ['汽车制造', '信息技术', '制药', '物流'], inDemandJobs: ['IT 开发', '工程师', '生产线技工', '财务共享'], salary: '年薪约 2–4 万欧元', features: ['中东欧制造中心', '投资类项目选择多', '英语岗位增长'] },
  gr: { hotIndustries: ['旅游服务', '航运', '信息技术', '农业'], inDemandJobs: ['酒店服务', 'IT 开发', '海运专员', '厨师'], salary: '年薪约 2–3.5 万欧元', features: ['旅游与航运支柱', '数字游民签证受欢迎', '失业率偏高'] },
  cy: { hotIndustries: ['金融服务', '信息技术', '航运', '旅游'], inDemandJobs: ['会计', 'IT 开发', '航运操作', '酒店服务'], salary: '年薪约 2.5–4.5 万欧元', features: ['低税率吸引企业', '英语普及', '欧盟成员国身份'] },
  mt: { hotIndustries: ['金融科技', '游戏', '旅游服务', '信息技术'], inDemandJobs: ['游戏开发', '金融分析师', '客服', 'IT 工程师'], salary: '年薪约 2.5–4.5 万欧元', features: ['金融科技与博彩业聚集', '英语工作环境', '岛屿生活'] },
  hr: { hotIndustries: ['旅游服务', '信息技术', '航运', '食品加工'], inDemandJobs: ['酒店服务', 'IT 开发', '厨师', '船员'], salary: '年薪约 2–3.5 万欧元', features: ['旅游季节性强', '数字游民签证受欢迎', '欧盟自由流动'] },
  si: { hotIndustries: ['汽车零部件', '制药', '信息技术', '物流'], inDemandJobs: ['工程师', 'IT 开发', '研发人员', '生产线技工'], salary: '年薪约 2.8–4.5 万欧元', features: ['绿色宜居', '制造业精细', '英语岗位有限'] },
  sk: { hotIndustries: ['汽车制造', '电子', '工程机械', '信息技术'], inDemandJobs: ['机械工程师', 'IT 开发', '生产线技工', '质量控制'], salary: '年薪约 2–3.5 万欧元', features: ['欧洲汽车制造重镇', '员工卡政策', '生活成本低'] },
  ee: { hotIndustries: ['信息技术', '数字服务', '金融科技', '物流'], inDemandJobs: ['软件工程师', '产品经理', '网络安全', '数据分析'], salary: '年薪约 3–5 万欧元', features: ['数字化程度全球领先', 'e-Residency 生态', '英语创业氛围浓'] },
  lt: { hotIndustries: ['信息技术', '金融科技', '激光科技', '物流'], inDemandJobs: ['软件工程师', '金融科技运营', '工程师', '客服'], salary: '年薪约 2.5–4.5 万欧元', features: ['金融科技中心', '数字化人才集中', '生活成本低'] },
  lv: { hotIndustries: ['信息技术', '物流', '木材加工', '旅游'], inDemandJobs: ['IT 开发', '物流专员', '工程师', '酒店服务'], salary: '年薪约 2–3.5 万欧元', features: ['波罗的海枢纽', '英语岗位增长', '生活成本适中'] },
  ro: { hotIndustries: ['信息技术', '汽车制造', '业务流程外包', '农业'], inDemandJobs: ['软件工程师', '客服', '机械技工', '数据分析'], salary: '年薪约 1.8–3.5 万欧元', features: ['IT 外包增长快', '欧盟内自由流动', '薪资水平偏低'] },
  bg: { hotIndustries: ['信息技术', '旅游业', '农业', '业务流程外包'], inDemandJobs: ['IT 开发', '客服', '酒店服务', '农技人员'], salary: '年薪约 1.5–3 万欧元', features: ['生活成本低', '数字游民签证受欢迎', '欧盟成员国身份'] },
  jp: { hotIndustries: ['制造业', '信息技术', '护理介护', '旅游服务'], inDemandJobs: ['介护人员', 'IT 工程师', '制造技工', '酒店服务'], salary: '月薪约 25–45 万日元', features: ['高度人才积分制', '特定技能签证扩招', '人口老龄化带来护理缺口'] },
  kr: { hotIndustries: ['半导体', '信息技术', '汽车制造', '文化娱乐'], inDemandJobs: ['半导体工程师', '软件工程师', '研发人员', '韩语教师'], salary: '年薪约 4,000–8,000 万韩元', features: ['科技产业领先', 'E-7 工作签证', '语言门槛较高'] },
  sg: { hotIndustries: ['金融科技', '信息技术', '物流航运', '生物医药'], inDemandJobs: ['软件工程师', '金融分析师', '数据科学家', '物流管理'], salary: '年薪约 5–9 万新元', features: ['亚洲金融枢纽', 'EP 签证薪资门槛', '英语工作环境'] },
  my: { hotIndustries: ['电子制造', '信息技术', '旅游服务', '棕榈油产业'], inDemandJobs: ['IT 工程师', '电子技工', '酒店服务', '会计'], salary: '月薪约 4,000–10,000 林吉特', features: ['生活成本低', 'MM2H 等长期居留', '英语普及'] },
  th: { hotIndustries: ['旅游服务', '信息技术', '汽车制造', '农业食品'], inDemandJobs: ['IT 开发', '酒店服务', '英语教师', '工程师'], salary: '月薪约 30,000–80,000 泰铢', features: ['数字游民签证受欢迎', '旅游业岗位多', '生活成本低'] },
  vn: { hotIndustries: ['电子制造', '信息技术', '纺织服装', '物流'], inDemandJobs: ['IT 工程师', '生产线管理', '供应链专员', '英语教师'], salary: '月薪约 1,500–4,000 万越南盾', features: ['制造业高速增长', '外企岗位集中', '年轻劳动力充足'] },
  ph: { hotIndustries: ['业务流程外包', '信息技术', '旅游服务', '护理'], inDemandJobs: ['客服', 'IT 开发', '护理人员', '英语教师'], salary: '月薪约 25,000–60,000 菲律宾比索', features: ['英语优势明显', 'BPO 产业庞大', '海外就业传统'] },
  id: { hotIndustries: ['信息技术', '矿业能源', '旅游服务', '制造业'], inDemandJobs: ['IT 工程师', '矿业工程师', '英语教师', '酒店管理'], salary: '月薪约 800–2,500 万印尼盾', features: ['东南亚最大经济体', '数字经济快速成长', '本地化要求较高'] },
  in: { hotIndustries: ['信息技术', '制药', '金融服务', '制造'], inDemandJobs: ['软件工程师', '数据分析', '工程师', '医疗护理'], salary: '月薪约 5–20 万印度卢比（岗位差异大）', features: ['IT 外包全球中心', '人才规模庞大', '竞争激烈'] },
  au: { hotIndustries: ['矿业能源', '医疗健康', '信息技术', '建筑'], inDemandJobs: ['注册护士', '软件工程师', '电工', '厨师'], salary: '年薪约 7–11 万澳元', features: ['技术移民职业清单明确', '薪资水平高', '偏远地区加分'] },
  nz: { hotIndustries: ['农业食品', '信息技术', '旅游服务', '建筑'], inDemandJobs: ['护士', '软件工程师', '建筑技工', '农场工人'], salary: '年薪约 6–9 万新西兰元', features: ['绿名单职业快速通道', '生活节奏慢', '自然宜居'] },
  ae: { hotIndustries: ['金融服务', '房地产', '信息技术', '旅游航空'], inDemandJobs: ['金融分析师', 'IT 工程师', '销售', '酒店管理'], salary: '年薪约 8–20 万迪拉姆（免税）', features: ['免税高薪', '黄金签证政策', '英语工作环境'] },
  qa: { hotIndustries: ['能源', '建筑', '金融服务', '航空'], inDemandJobs: ['工程师', '项目管理', '财务', '酒店服务'], salary: '年薪约 10–22 万里亚尔（免税）', features: ['高薪免税', '大型基建项目', '雇主担保为主'] },
  sa: { hotIndustries: ['能源', '建筑', '信息技术', '医疗'], inDemandJobs: ['工程师', 'IT 专家', '医疗人员', '项目管理'], salary: '年薪约 8–20 万里亚尔（免税）', features: ['2030 愿景转型', '基建与科技投入大', '本地化政策'] },
  il: { hotIndustries: ['科技', '网络安全', '医疗设备', '农业科技'], inDemandJobs: ['软件工程师', '网络安全专家', '研究员', '工程师'], salary: '月薪约 2–5 万新谢克尔', features: ['创业国度', '高科技岗位密集', '高技能人才签证'] },
  tr: { hotIndustries: ['制造业', '旅游服务', '建筑', '信息技术'], inDemandJobs: ['IT 开发', '工程师', '酒店服务', '外贸专员'], salary: '月薪约 2–6 万里拉', features: ['欧亚交汇市场', '投资入籍项目', '汇率波动需关注'] },
  br: { hotIndustries: ['农业出口', '矿业', '信息技术', '旅游'], inDemandJobs: ['农技专家', 'IT 开发', '工程师', '英语教师'], salary: '月薪约 3,000–12,000 雷亚尔', features: ['南美最大经济体', '葡语门槛', '市场潜力大'] },
  ar: { hotIndustries: ['农业', '能源', '信息技术', '旅游'], inDemandJobs: ['IT 开发', '农业工程师', '旅游服务', '数据分析'], salary: '月薪约 80–300 万阿根廷比索', features: ['生活成本波动', 'IT 人才外流与回流', '自然景观丰富'] },
  cl: { hotIndustries: ['矿业', '信息技术', '农业出口', '可再生能源'], inDemandJobs: ['矿业工程师', 'IT 开发', '能源工程师', '农技人员'], salary: '月薪约 80–250 万智利比索', features: ['南美最稳定经济体', '矿业岗位高薪', '英语岗位有限'] },
  za: { hotIndustries: ['矿业', '金融服务', '信息技术', '旅游'], inDemandJobs: ['工程师', 'IT 开发', '金融分析师', '护士'], salary: '年薪约 30–80 万兰特', features: ['非洲金融中心', '关键技能签证', '薪资差距大'] }
};

function loadCountries() {
  const vm = require('vm');
  const ctx = {}; ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(DATA, 'countries.js'), 'utf8'), ctx, { filename: 'countries.js' });
  return ctx.Istra.countries.filter((c) => c.is_available !== false);
}

const countries = loadCountries();
const missing = countries.filter((c) => !EMPLOYMENT[c.id]);
if (missing.length) {
  console.error('缺失就业数据：', missing.map((c) => c.id).join(','));
  process.exit(1);
}

const rows = countries.map((c) => ({
  id: c.id,
  hotIndustries: EMPLOYMENT[c.id].hotIndustries,
  inDemandJobs: EMPLOYMENT[c.id].inDemandJobs,
  salary: EMPLOYMENT[c.id].salary,
  features: EMPLOYMENT[c.id].features
}));

const out = `/* 全球地图 · 国家就业机会数据库（生成自 scripts/generate-map-employment.js）
   53 国 { id, hotIndustries, inDemandJobs, salary, features }，仅供全球地图信息卡使用 */
window.Istra = window.Istra || {};
Istra.mapEmployment = ${JSON.stringify(rows)};
`;

fs.writeFileSync(path.join(DATA, 'map-employment.js'), out, 'utf8');
console.log(`已生成 map-employment.js：${rows.length} 国就业数据`);