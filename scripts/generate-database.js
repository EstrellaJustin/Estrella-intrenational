/* ============================================================
   伊斯特拉国际 · 全球项目数据库生成器
   唯一数据源：国家 × 子分类矩阵 → 生成
   - src/data/projects.json（数据库）
   - src/data/projects.js（站点内嵌，支持 file:// 离线打开）
   - src/data/countries.js / categories.js
   用法：node scripts/generate-database.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');

/* ---------- 国家（54 国） ---------- */
const COUNTRIES = [
  { id: 'us', cn: '美国', en: 'United States', region: 'NORTH AMERICA', brief: '全球创新与高等教育中心' },
  { id: 'ca', cn: '加拿大', en: 'Canada', region: 'NORTH AMERICA', brief: '多元文化与高质量生活' },
  { id: 'mx', cn: '墨西哥', en: 'Mexico', region: 'NORTH AMERICA', brief: '北美新兴经济体与区域枢纽' },
  { id: 'gb', cn: '英国', en: 'United Kingdom', region: 'EUROPE', brief: '全球金融与教育中心' },
  { id: 'de', cn: '德国', en: 'Germany', region: 'EUROPE', brief: '欧洲经济与工业核心' },
  { id: 'fr', cn: '法国', en: 'France', region: 'EUROPE', brief: '欧洲文化与商业大国' },
  { id: 'nl', cn: '荷兰', en: 'Netherlands', region: 'EUROPE', brief: '欧洲创新与贸易门户' },
  { id: 'se', cn: '瑞典', en: 'Sweden', region: 'EUROPE', brief: '北欧创新与可持续发展典范' },
  { id: 'no', cn: '挪威', en: 'Norway', region: 'EUROPE', brief: '高福利与能源强国' },
  { id: 'dk', cn: '丹麦', en: 'Denmark', region: 'EUROPE', brief: '北欧设计与社会福利典范' },
  { id: 'fi', cn: '芬兰', en: 'Finland', region: 'EUROPE', brief: '教育与科技创新强国' },
  { id: 'ie', cn: '爱尔兰', en: 'Ireland', region: 'EUROPE', brief: '欧洲科技与金融中心' },
  { id: 'it', cn: '意大利', en: 'Italy', region: 'EUROPE', brief: '欧洲制造与文化大国' },
  { id: 'es', cn: '西班牙', en: 'Spain', region: 'EUROPE', brief: '南欧生活与投资热土' },
  { id: 'pt', cn: '葡萄牙', en: 'Portugal', region: 'EUROPE', brief: '欧洲宜居与黄金签证目的地' },
  { id: 'ch', cn: '瑞士', en: 'Switzerland', region: 'EUROPE', brief: '全球金融与精密制造中心' },
  { id: 'at', cn: '奥地利', en: 'Austria', region: 'EUROPE', brief: '中欧高品质生活国度' },
  { id: 'be', cn: '比利时', en: 'Belgium', region: 'EUROPE', brief: '欧盟之都与多语言中心' },
  { id: 'lu', cn: '卢森堡', en: 'Luxembourg', region: 'EUROPE', brief: '欧洲金融与财富管理中心' },
  { id: 'pl', cn: '波兰', en: 'Poland', region: 'EUROPE', brief: '中东欧增长经济体' },
  { id: 'cz', cn: '捷克', en: 'Czechia', region: 'EUROPE', brief: '中东欧工业与文化中心' },
  { id: 'hu', cn: '匈牙利', en: 'Hungary', region: 'EUROPE', brief: '中欧投资与宜居之地' },
  { id: 'gr', cn: '希腊', en: 'Greece', region: 'EUROPE', brief: '南欧海洋与旅游经济' },
  { id: 'cy', cn: '塞浦路斯', en: 'Cyprus', region: 'EUROPE', brief: '东地中海金融与宜居岛国' },
  { id: 'mt', cn: '马耳他', en: 'Malta', region: 'EUROPE', brief: '地中海金融与教育中心' },
  { id: 'hr', cn: '克罗地亚', en: 'Croatia', region: 'EUROPE', brief: '亚得里亚海旅游经济' },
  { id: 'si', cn: '斯洛文尼亚', en: 'Slovenia', region: 'EUROPE', brief: '中欧绿色宜居国度' },
  { id: 'sk', cn: '斯洛伐克', en: 'Slovakia', region: 'EUROPE', brief: '中欧制造与成长市场' },
  { id: 'ee', cn: '爱沙尼亚', en: 'Estonia', region: 'EUROPE', brief: '数字社会与电子公民先驱' },
  { id: 'lt', cn: '立陶宛', en: 'Lithuania', region: 'EUROPE', brief: '波罗的海数字创新中心' },
  { id: 'lv', cn: '拉脱维亚', en: 'Latvia', region: 'EUROPE', brief: '波罗的海门户' },
  { id: 'ro', cn: '罗马尼亚', en: 'Romania', region: 'EUROPE', brief: '东南欧成长经济体' },
  { id: 'bg', cn: '保加利亚', en: 'Bulgaria', region: 'EUROPE', brief: '巴尔干低成本生活国度' },
  { id: 'jp', cn: '日本', en: 'Japan', region: 'ASIA', brief: '亚洲科技与产业生态领先' },
  { id: 'kr', cn: '韩国', en: 'South Korea', region: 'ASIA', brief: '亚洲科技与文化产业中心' },
  { id: 'sg', cn: '新加坡', en: 'Singapore', region: 'ASIA', brief: '亚洲金融与商业枢纽' },
  { id: 'my', cn: '马来西亚', en: 'Malaysia', region: 'ASIA', brief: '东南亚宜居与教育中心' },
  { id: 'th', cn: '泰国', en: 'Thailand', region: 'ASIA', brief: '东南亚旅游与生活国度' },
  { id: 'vn', cn: '越南', en: 'Vietnam', region: 'ASIA', brief: '东南亚新兴制造中心' },
  { id: 'ph', cn: '菲律宾', en: 'Philippines', region: 'ASIA', brief: '东南亚英语与服务外包中心' },
  { id: 'id', cn: '印度尼西亚', en: 'Indonesia', region: 'ASIA', brief: '东南亚最大经济体' },
  { id: 'in', cn: '印度', en: 'India', region: 'ASIA', brief: '南亚科技与人才大国' },
  { id: 'au', cn: '澳大利亚', en: 'Australia', region: 'OCEANIA', brief: '自然宜居与教育并重' },
  { id: 'nz', cn: '新西兰', en: 'New Zealand', region: 'OCEANIA', brief: '纯净自然与高品质生活' },
  { id: 'ae', cn: '阿联酋', en: 'UAE', region: 'MIDDLE EAST', brief: '中东商业与金融中心' },
  { id: 'qa', cn: '卡塔尔', en: 'Qatar', region: 'MIDDLE EAST', brief: '海湾高收入经济体' },
  { id: 'sa', cn: '沙特阿拉伯', en: 'Saudi Arabia', region: 'MIDDLE EAST', brief: '中东能源与经济转型' },
  { id: 'il', cn: '以色列', en: 'Israel', region: 'MIDDLE EAST', brief: '中东创新与科技强国' },
  { id: 'tr', cn: '土耳其', en: 'Turkey', region: 'MIDDLE EAST', brief: '欧亚交汇的成长市场' },
  { id: 'br', cn: '巴西', en: 'Brazil', region: 'SOUTH AMERICA', brief: '南美最大经济体' },
  { id: 'ar', cn: '阿根廷', en: 'Argentina', region: 'SOUTH AMERICA', brief: '南美文化大国' },
  { id: 'cl', cn: '智利', en: 'Chile', region: 'SOUTH AMERICA', brief: '南美最稳定经济体' },
  { id: 'za', cn: '南非', en: 'South Africa', region: 'AFRICA', brief: '非洲经济与教育中心' }
];

/* ---------- 国家分组（用于分配项目） ---------- */
const G = {
  ALL: COUNTRIES.map(c => c.id),
  DEVELOPED: ['us','ca','gb','de','fr','nl','se','no','dk','fi','ie','it','es','pt','ch','at','be','lu','jp','kr','sg','au','nz','il'],
  EUROPE: ['gb','de','fr','nl','se','no','dk','fi','ie','it','es','pt','ch','at','be','lu','pl','cz','hu','gr','cy','mt','hr','si','sk','ee','lt','lv','ro','bg'],
  ASIA: ['jp','kr','sg','my','th','vn','ph','id','in'],
  OCEANIA: ['au','nz'],
  MIDDLE_EAST: ['ae','qa','sa','il','tr'],
  LATAM: ['br','ar','cl','mx'],
  AFRICA: ['za'],
  TECH_HUB: ['us','ca','gb','de','ie','nl','se','fi','ee','lt','lv','sg','jp','kr','il','in','au','nz','ch','dk'],
  ENGINEERING: ['de','jp','kr','sg','ch','se','fi','nl','au','ca','gb','il','in','pl','cz'],
  STUDY_HUBS: ['us','ca','gb','au','nz','ie','de','fr','nl','se','dk','fi','it','es','pt','ch','at','be','jp','kr','sg','my','th','vn','ph','id','in','ae','qa','sa','br','ar','cl','za','mx','pl','cz','hu','gr','cy','mt'],
  INVEST_HUBS: ['us','ca','gb','au','nz','sg','ae','qa','sa','es','pt','gr','cy','mt','it','fr','nl','ie','ch','jp','kr','tr','br','ar','cl','mx','za','th','my','id','in'],
  NOMAD: ['es','pt','gr','cy','mt','hr','ee','lt','lv','ro','bg','cz','hu','sk','si','it','fr','nl','se','no','dk','fi','ie','ch','at','be','pl','ae','qa','sa','il','tr','br','ar','cl','mx','za','th','my','vn','ph','id','kr','au','nz','ca'],
  HOLIDAY: ['au','nz','ca','gb','ie','fr','de','nl','se','no','dk','fi','jp','kr','it','es','pt','pl','cz','hu','gr','cy','mt','hr','si','ee','lt','lv','ro','bg','sk','th','vn','ph','id','ar','cl','mx','br','za','tr','il'],
  ART_SCENE: ['us','ca','gb','de','fr','it','es','pt','nl','ch','au','nz','jp','kr','sg','ae','qa','sa','il','tr','br','ar','cl','mx','za','in'],
  FAMILY: ['us','ca','gb','de','fr','nl','se','no','dk','fi','ie','it','es','pt','ch','at','be','au','nz','jp','kr','sg','my','th','vn','ph','id','in','ae','qa','sa','tr','br','ar','cl','mx','za','pl','cz','hu','gr','cy','mt']
};

/* ---------- 一级分类 × 子分类 ---------- */
const CATEGORIES = [
  {
    id: 'work', name: '工作就业', en: 'WORK & EMPLOYMENT',
    desc: '以就业为驱动的国际发展路径，覆盖高技能、雇主担保、技术人才、普通就业与蓝领就业等项目。',
    subs: [
      { id: 'work-highskill', name: '高技能工作签证', visaType: '工作签证', budget: 'mid', duration: '1–3 个月', role: '高技能专业人士', focus: '专业技能岗位' },
      { id: 'work-employer', name: '雇主担保', visaType: '雇主担保', budget: 'mid', duration: '3–6 个月', role: '获得雇主担保的申请人', focus: '雇主驱动的就业路径' },
      { id: 'work-skilled', name: '技术人才', visaType: '技术移民', budget: 'mid', duration: '3–6 个月', role: '技术型专业人才', focus: '技能评估与打分' },
      { id: 'work-regular', name: '普通就业', visaType: '工作签证', budget: 'low', duration: '1–3 个月', role: '普通职业申请人', focus: '常规就业岗位' },
      { id: 'work-bluecollar', name: '蓝领就业', visaType: '工作签证', budget: 'low', duration: '1–3 个月', role: '蓝领技能从业者', focus: '技能型就业岗位' }
    ]
  },
  {
    id: 'tech', name: '技术人才', en: 'TECH TALENT',
    desc: '面向 IT、工程师、科研、医疗与高学历人才的专项引进路径。',
    subs: [
      { id: 'tech-it', name: 'IT人才', visaType: '技术人才签证', budget: 'mid', duration: '1–3 个月', role: 'IT 与软件人才', focus: '科技与数字化岗位' },
      { id: 'tech-engineer', name: '工程师', visaType: '技术人才签证', budget: 'mid', duration: '1–3 个月', role: '工程领域人才', focus: '工程与制造岗位' },
      { id: 'tech-research', name: '科研人才', visaType: '研究签证', budget: 'mid', duration: '1–3 个月', role: '科研人员', focus: '科研与学术岗位' },
      { id: 'tech-medical', name: '医疗人才', visaType: '技术人才签证', budget: 'mid', duration: '1–3 个月', role: '医疗健康人才', focus: '医疗护理岗位' },
      { id: 'tech-degree', name: '高学历人才', visaType: '人才签证', budget: 'mid', duration: '1–3 个月', role: '高学历专业人才', focus: '高层次人才引进' }
    ]
  },
  {
    id: 'edu', name: '留学教育', en: 'STUDY & EDUCATION',
    desc: '覆盖本科、硕士、博士、职业教育与语言课程的留学发展路径。',
    subs: [
      { id: 'edu-bachelor', name: '本科', visaType: '学生签证', budget: 'mid', duration: '3–6 个月', role: '计划攻读本科的学生', focus: '本科学位教育' },
      { id: 'edu-master', name: '硕士', visaType: '学生签证', budget: 'mid', duration: '3–6 个月', role: '计划攻读硕士的学生', focus: '硕士学位教育' },
      { id: 'edu-phd', name: '博士', visaType: '学生签证', budget: 'high', duration: '6–12 个月', role: '计划攻读博士的研究者', focus: '博士学位与研究' },
      { id: 'edu-vocational', name: '职业教育', visaType: '学生签证', budget: 'low', duration: '1–3 个月', role: '职业技能学习者', focus: '职业资格培训' },
      { id: 'edu-language', name: '语言课程', visaType: '学生签证', budget: 'low', duration: '1–2 个月', role: '语言学习者', focus: '语言能力提升' }
    ]
  },
  {
    id: 'invest', name: '投资创业', en: 'INVEST & ENTREPRENEUR',
    desc: '以投资与创业为驱动的身份与居留路径，适合高净值人士与企业创始人。',
    subs: [
      { id: 'invest-immigration', name: '投资移民', visaType: '投资移民', budget: 'vip', duration: '12–24 个月', role: '高净值投资者', focus: '合规投资获取身份' },
      { id: 'invest-startup', name: '创业签证', visaType: '创业签证', budget: 'high', duration: '3–9 个月', role: '创业者与创始人', focus: '创新商业落地' },
      { id: 'invest-entrepreneur', name: '企业家项目', visaType: '企业家签证', budget: 'high', duration: '3–9 个月', role: '企业家', focus: '企业经营与居留' },
      { id: 'invest-business', name: '商业投资', visaType: '长期居留', budget: 'high', duration: '3–9 个月', role: '商业投资者', focus: '商业投资布局' }
    ]
  },
  {
    id: 'talent', name: '人才移民', en: 'TALENT MIGRATION',
    desc: '杰出人才、国家人才计划与高端人才项目等定向人才引进路径。',
    subs: [
      { id: 'talent-exceptional', name: '杰出人才', visaType: '杰出人才', budget: 'mid', duration: '3–9 个月', role: '各领域杰出人士', focus: '国际认可成就' },
      { id: 'talent-national', name: '国家人才计划', visaType: '人才签证', budget: 'mid', duration: '3–6 个月', role: '优秀人才', focus: '国家人才引进' },
      { id: 'talent-invitation', name: '高端人才项目', visaType: '人才签证', budget: 'mid', duration: '3–9 个月', role: '受邀人才', focus: '定向邀请引进' }
    ]
  },
  {
    id: 'family', name: '家庭团聚', en: 'FAMILY REUNION',
    desc: '面向配偶、子女与父母的家庭团聚居留路径。',
    subs: [
      { id: 'family-spouse', name: '配偶', visaType: '家庭团聚', budget: 'mid', duration: '3–12 个月', role: '配偶', focus: '配偶团聚' },
      { id: 'family-child', name: '子女', visaType: '家庭团聚', budget: 'mid', duration: '3–12 个月', role: '未成年子女', focus: '子女随行团聚' },
      { id: 'family-parent', name: '父母', visaType: '家庭团聚', budget: 'mid', duration: '6–18 个月', role: '父母', focus: '父母团聚' }
    ]
  },
  {
    id: 'pr', name: '永久居留', en: 'PERMANENT RESIDENCE',
    desc: '永居项目、长期居留与身份转换等长期身份规划路径。',
    subs: [
      { id: 'pr-apply', name: '永居项目', visaType: '永居申请', budget: 'mid', duration: '12–24 个月', role: '长期居留申请人', focus: '永久居留身份' },
      { id: 'pr-longterm', name: '长期居留', visaType: '长期居留', budget: 'mid', duration: '6–18 个月', role: '长期居留申请人', focus: '长期合法居留' },
      { id: 'pr-convert', name: '身份转换', visaType: '永居申请', budget: 'mid', duration: '6–18 个月', role: '已居留申请人', focus: '身份层级转换' }
    ]
  },
  {
    id: 'nomad', name: '数字游民', en: 'DIGITAL NOMAD',
    desc: '面向远程工作者与自由职业者的数字游民与远程工作签证。',
    subs: [
      { id: 'nomad-visa', name: '数字游民签证', visaType: '数字游民签证', budget: 'low', duration: '2–6 周', role: '远程工作者', focus: '远程工作与旅居' },
      { id: 'nomad-remote', name: '远程工作', visaType: '数字游民签证', budget: 'low', duration: '2–6 周', role: '远程雇员', focus: '远程就业居留' }
    ]
  },
  {
    id: 'youth', name: '青年交流', en: 'YOUTH & EXCHANGE',
    desc: '工作假期与国际交流等面向青年群体的发展路径。',
    subs: [
      { id: 'youth-working-holiday', name: '工作假期', visaType: '工作假期', budget: 'low', duration: '2–6 周', role: '青年申请人', focus: '边工作边旅行' },
      { id: 'youth-exchange', name: '国际交流', visaType: '交流签证', budget: 'low', duration: '1–3 个月', role: '交流参与者', focus: '文化与学术交流' }
    ]
  },
  {
    id: 'special', name: '特殊人才', en: 'SPECIAL TALENT',
    desc: '面向艺术人才、运动员与宗教人士的特殊身份路径。',
    subs: [
      { id: 'special-art', name: '艺术人才', visaType: '特殊签证', budget: 'mid', duration: '1–3 个月', role: '艺术创作者', focus: '艺术创作与展演' },
      { id: 'special-athlete', name: '运动员', visaType: '特殊签证', budget: 'mid', duration: '1–3 个月', role: '职业运动员', focus: '训练与参赛' },
      { id: 'special-religious', name: '宗教人士', visaType: '特殊签证', budget: 'mid', duration: '1–3 个月', role: '宗教从业人士', focus: '宗教服务与居留' }
    ]
  }
];

const SUB_MAP = {};
CATEGORIES.forEach(cat => cat.subs.forEach(s => { SUB_MAP[s.id] = { ...s, catId: cat.id, catName: cat.name }; }));

/* ---------- 项目分配（国家 × 子分类） ---------- */
/* ---------- 项目分配（精选矩阵：基准 3 项 + 定向扩展，约 280 项） ---------- */
const BASE = ['work-highskill', 'edu-master', 'pr-apply'];
const ADD = {
  'work-skilled': ['au', 'nz', 'ca', 'gb', 'ie', 'de', 'nl', 'se', 'dk', 'sg'],
  'work-employer': ['ca', 'au', 'nz', 'gb', 'ie', 'de', 'sg', 'us', 'fr', 'nl'],
  'work-regular': ['pl', 'cz', 'hu', 'ro', 'bg', 'mx'],
  'work-bluecollar': ['pl', 'cz', 'hu', 'ro', 'bg', 'si'],
  'tech-it': ['us', 'ca', 'gb', 'de', 'ie', 'nl', 'se', 'fi', 'sg', 'jp', 'kr', 'il'],
  'tech-engineer': ['de', 'jp', 'kr', 'sg', 'ch', 'se', 'fi', 'nl', 'au', 'ca'],
  'tech-degree': ['us', 'ca', 'gb', 'de', 'fr', 'nl', 'sg', 'jp', 'kr', 'il'],
  'tech-research': ['us', 'ca', 'gb', 'de', 'fr', 'nl'],
  'tech-medical': ['gb', 'ca', 'au', 'nz', 'us', 'ie'],
  'edu-bachelor': ['us', 'ca', 'gb', 'au', 'nz', 'ie', 'sg', 'my', 'th', 'ae'],
  'edu-phd': ['us', 'ca', 'gb', 'de', 'fr', 'nl'],
  'edu-language': ['es', 'it', 'fr', 'de', 'jp', 'kr'],
  'edu-vocational': ['de', 'ch', 'at', 'au', 'ca', 'jp'],
  'invest-immigration': ['us', 'ca', 'gb', 'au', 'nz', 'sg'],
  'invest-business': ['us', 'ca', 'gb', 'de', 'fr', 'nl', 'ch', 'sg', 'jp', 'kr', 'au', 'nz', 'ae', 'es', 'pt', 'gr', 'cy', 'mt'],
  'invest-startup': ['ca', 'gb', 'au', 'nz', 'sg', 'ae', 'es', 'pt', 'fr', 'nl', 'ie', 'ch'],
  'invest-entrepreneur': ['us', 'ca', 'gb', 'de', 'fr', 'nl'],
  'talent-national': ['us', 'ca', 'gb', 'de', 'jp', 'sg', 'ae', 'qa', 'sa', 'il'],
  'talent-exceptional': ['us', 'ca', 'gb', 'au', 'nz', 'jp', 'kr', 'sg', 'il', 'ae'],
  'talent-invitation': ['us', 'ca', 'au', 'nz', 'jp', 'sg'],
  'family-spouse': ['us', 'ca', 'gb', 'de', 'fr', 'nl', 'au', 'nz', 'jp', 'sg', 'it', 'es', 'pt', 'se', 'dk', 'fi', 'kr', 'my'],
  'family-child': ['us', 'ca', 'gb', 'de', 'fr', 'nl'],
  'family-parent': ['us', 'ca', 'gb', 'de', 'fr', 'nl'],
  'pr-longterm': ['us', 'ca', 'gb', 'de', 'fr', 'nl'],
  'pr-convert': ['us', 'ca', 'gb', 'de', 'fr', 'nl'],
  'nomad-visa': ['es', 'pt', 'gr', 'cy', 'mt', 'hr', 'ee', 'lt', 'lv', 'ro', 'bg', 'cz', 'hu', 'th', 'my'],
  'nomad-remote': ['es', 'pt', 'gr', 'cy', 'mt', 'hr'],
  'youth-working-holiday': ['au', 'nz', 'ca', 'gb', 'jp', 'kr', 'fr', 'de', 'nl', 'se'],
  'youth-exchange': ['us', 'ca', 'gb', 'de', 'fr', 'nl'],
  'special-art': ['us', 'ca', 'gb', 'fr', 'it', 'es', 'jp', 'kr'],
  'special-athlete': ['us', 'ca', 'gb', 'de', 'fr', 'it'],
  'special-religious': ['us', 'ca', 'gb', 'de', 'fr', 'it']
};

const SPECIAL = {
  'us|work-highskill': { name: '美国 H-1B 工作签证', visaType: '工作签证' },
  'de|work-highskill': { name: '德国欧盟蓝卡', visaType: '工作签证' },
  'jp|work-highskill': { name: '日本高度人才签证', visaType: '工作签证' },
  'ca|work-employer': { name: '加拿大雇主担保移民', visaType: '雇主担保' },
  'au|work-skilled': { name: '澳洲技术移民', visaType: '技术移民' },
  'nz|work-skilled': { name: '新西兰技术移民', visaType: '技术移民' },
  'sg|work-regular': { name: '新加坡就业准证', visaType: '工作签证' },
  'us|invest-immigration': { name: '美国 EB-5 投资移民', visaType: '投资移民' },
  'ca|invest-startup': { name: '加拿大创业签证', visaType: '创业签证' },
  'gb|invest-startup': { name: '英国创新创始人签证', visaType: '创业签证' },
  'ae|pr-longterm': { name: '阿联酋黄金签证', visaType: '长期居留' },
  'us|tech-it': { name: '美国科技人才工作签证', visaType: '工作签证' }
};

/* ---------- 内容模板（按一级分类） ---------- */
function fill(s, ctx) {
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in ctx ? ctx[k] : m));
}

function buildProject(c, sub) {
  const cat = CATEGORIES.find(x => x.id === sub.catId);
  const sp = SPECIAL[`${c.id}|${sub.id}`] || {};
  const name = sp.name || `${c.cn} · ${sub.name}`;
  const visaType = sp.visaType || sub.visaType;
  const ctx = { cn: c.cn, en: c.en, brief: c.brief, role: sub.role, focus: sub.focus, name, visa: visaType, dur: sub.duration };

  const T = {
    work: {
      intro: `${c.cn}（${c.en}）作为${c.brief}，为${sub.role}提供「${name}」就业发展路径。该项目聚焦${sub.focus}，申请人需满足当地官方要求，获批后可依法在${c.cn}工作与居留，为长期身份规划奠定基础。`,
      audience: [`在${sub.focus}领域具备能力的${sub.role}`, '希望拓展国际职业发展的个人', '计划携带家属共同前往的申请人'],
      reqs: [`获得${c.cn}雇主录用或符合职业清单要求`, '语言能力达到${c.cn}官方标准', '学历与专业资质符合岗位要求', '通过健康与品行审查'],
      docs: ['有效护照', '学历与资质证明', '语言成绩单', '工作经历证明', '无犯罪记录证明', '体检报告'],
      process: ['资质与岗位匹配评估', '准备申请材料', '递交签证或许可申请', '等待审批', '获批后登陆并办理居留登记'],
      cost: [{ label: '官方规费', value: `以${c.cn}官方最新标准为准` }, { label: '办理周期', value: sub.duration }, { label: '第三方费用', value: '翻译、认证、体检等按实际产生' }],
      adv: ['政策框架成熟，路径清晰', '获批后可依法工作与居留', '为后续长期身份提供基础'],
      cons: ['对雇主或职业背景有要求', '审批周期受个案影响', '需持续满足续签条件'],
      faq: [
        { q: `${c.cn}${name}对语言有要求吗？`, a: `通常需要提供语言能力证明，具体标准以${c.cn}官方最新规定为准。` },
        { q: '获批后可以携带家属吗？', a: '多数情况下，符合条件的配偶与子女可随行，具体以官方政策为准。' },
        { q: `办理周期大约多久？`, a: `通常为${sub.duration}，实际受材料完整度与审批进度影响。` }
      ]
    },
    tech: {
      intro: `${c.cn}（${c.en}）作为${c.brief}，为${sub.role}提供「${name}」技术人才发展路径。该项目聚焦${sub.focus}，对专业能力与资历进行综合评估，获批后可在${c.cn}从事对口专业工作，并衔接长期身份规划。`,
      audience: [`在${sub.focus}领域具有专业经验的${sub.role}`, '拥有相关学历与技术认证的申请人', '希望进入国际科技与产业生态的人才'],
      reqs: ['专业领域与当地人才清单匹配', '学历、资质或从业经历达到标准', '语言能力满足岗位与官方要求', '通过背景与健康审查'],
      docs: ['有效护照', '学历与专业认证', '语言成绩单', '项目与工作成果证明', '无犯罪记录证明', '体检报告'],
      process: ['专业资质评估', '匹配雇主或引进机构', '准备材料并递交申请', '等待审批', '获批后登陆', '办理居留登记'],
      cost: [{ label: '官方规费', value: `以${c.cn}官方最新标准为准` }, { label: '办理周期', value: sub.duration }, { label: '认证费用', value: '学历与资质认证按实际产生' }],
      adv: ['对高技能人才政策友好', '专业对口，发展空间明确', '有利于长期身份积累'],
      cons: ['专业与语言门槛较高', '依赖雇主或引进机构', '需持续满足资格要求'],
      faq: [
        { q: `${c.cn}${name}对学历有硬性要求吗？`, a: `通常需要与岗位匹配的学历或同等专业资质，具体以${c.cn}官方标准为准。` },
        { q: '是否可以携带配偶与子女？', a: '符合条件的高技能人才通常可为配偶与子女申请随行，具体以官方政策为准。' },
        { q: `审理周期要多久？`, a: `一般约${sub.duration}，个案进度受材料与审批影响。` }
      ]
    },
    edu: {
      intro: `${c.cn}（${c.en}）作为${c.brief}，为${sub.role}提供「${name}」教育发展路径。该项目聚焦${sub.focus}，申请院校与签证获批后，可合法在${c.cn}学习，并在学业期间体验当地教育与生活。`,
      audience: [`计划在${c.cn}就读的${sub.role}`, '希望提升学历与国际视野的学生', '有意通过留学衔接就业或长期居留的申请人'],
      reqs: ['获得${c.cn}认可院校的录取或预录取', '满足院校的语言与学术要求', '具备足够的学费与生活资金证明', '通过健康与品行审查'],
      docs: ['有效护照', '院校录取通知书', '学历与成绩单', '语言成绩证明', '资金证明', '无犯罪记录证明', '体检报告'],
      process: ['院校与专业匹配', '准备申请材料并递交院校申请', '获得录取后申请学生签证', '等待签证审批', '抵达并完成入学注册'],
      cost: [{ label: '学费', value: '因院校与专业而异（以官方公布为准）' }, { label: '生活成本', value: '因城市与个人消费而异' }, { label: '办理周期', value: sub.duration }],
      adv: ['教育资源优质，学历认可度高', '学习期间可积累当地经验', '留学后衔接工作或居留路径清晰'],
      cons: ['学费与生活成本需提前规划', '语言与学术门槛较高', '学生签证工作时间有限制'],
      faq: [
        { q: `${c.cn}${name}需要准备多少资金？`, a: '需覆盖学费与生活费用，具体金额以院校与官方要求为准，并需提供资金证明。' },
        { q: '留学期间可以打工吗？', a: '多数国家允许持学生签证者有限度兼职，具体以当地法规为准。' },
        { q: `申请周期多长？`, a: `院校申请加签证审批通常约${sub.duration}，建议提前规划。` }
      ]
    },
    invest: {
      intro: `${c.cn}（${c.en}）作为${c.brief}，为${sub.role}提供「${name}」投资创业发展路径。该项目聚焦${sub.focus}，申请人通过合规投资或商业落地满足要求后，可获得在${c.cn}居留与发展的身份资格。`,
      audience: [`具备合规资金来源的${sub.role}`, '希望拓展海外业务与资产布局的企业家', '寻求长期身份与商业协同发展的家庭'],
      reqs: ['投资或创业方案符合${c.cn}官方要求', '资金来源合法且可完整证明', '满足最低投资或经营门槛', '通过背景与健康审查'],
      docs: ['有效护照', '资金来源证明', '投资或商业计划文件', '企业及个人资质文件', '无犯罪记录证明', '体检报告'],
      process: ['方案与资质评估', '资金梳理与商业规划', '递交申请', '等待审批', '完成投资或业务落地', '获批居留身份'],
      cost: [{ label: '投资金额', value: '因项目类别与地区而异（以官方为准）' }, { label: '官方规费', value: `以${c.cn}官方最新标准为准` }, { label: '办理周期', value: sub.duration }],
      adv: ['一人申请，全家受益（视政策）', '投资与身份规划协同', '无硬性语言要求（视项目）'],
      cons: ['投资金额门槛较高', '存在市场与政策风险', '资金来源审查严格'],
      faq: [
        { q: `${c.cn}${name}的投资金额是多少？`, a: `投资门槛因项目与地区而异，请以${c.cn}官方最新标准为准。` },
        { q: '资金来源如何审查？', a: '官方会对资金来源进行合规审查，建议提前准备完整的收入与资产证明。' },
        { q: `获批后多久能取得身份？`, a: `通常约${sub.duration}，具体以审批进度为准。` }
      ]
    },
    talent: {
      intro: `${c.cn}（${c.en}）作为${c.brief}，为${sub.role}提供「${name}」人才引进路径。该项目聚焦${sub.focus}，以申请人的成就与潜力为核心评估标准，获批后可快速获得在${c.cn}工作、居住与长期发展的资格。`,
      audience: [`在专业领域取得成就的${sub.role}`, '获得同行或权威机构认可的人士', '希望快速衔接长期身份规划的优秀人才'],
      reqs: ['在专业领域具备国际认可的成就', '符合人才计划的目标领域清单', '具备在${c.cn}发展的能力与资源', '通过背景与健康审查'],
      docs: ['有效护照', '成就与奖项证明', '专业成果与推荐信', '收入或资助证明', '无犯罪记录证明', '体检报告'],
      process: ['成就与资质评估', '准备证明材料', '递交人才申请', '等待审批', '获批后登陆', '办理居留登记'],
      cost: [{ label: '官方规费', value: `以${c.cn}官方最新标准为准` }, { label: '办理周期', value: sub.duration }, { label: '第三方费用', value: '认证与翻译按实际产生' }],
      adv: ['审批路径相对高效', '对专业成就给予高认可', '身份规划衔接顺畅'],
      cons: ['成就门槛较高', '目标领域有限', '需持续证明贡献'],
      faq: [
        { q: `${c.cn}${name}如何评估成就？`, a: '通常通过奖项、成果、同行评价与推荐信等综合评估，具体以官方标准为准。' },
        { q: '可以携带家庭成员吗？', a: '多数人才项目允许符合条件的家庭成员随行，具体以官方政策为准。' },
        { q: `审理需要多久？`, a: `通常约${sub.duration}，个案差异较大。` }
      ]
    },
    family: {
      intro: `${c.cn}（${c.en}）作为${c.brief}，为申请人提供「${name}」家庭团聚路径。该项目聚焦${sub.focus}，申请人需与在${c.cn}的亲属存在合法关系，获批后可在${c.cn}居留并享受家庭团聚生活。`,
      audience: [`与${c.cn}合法居留或公民存在亲属关系的${sub.role}`, '希望实现家庭团聚的申请人', '计划在${c.cn}长期生活的家庭成员'],
      reqs: ['亲属关系真实且可证明', '担保人具备合法身份与经济能力', '满足关系与年龄等政策要求', '通过健康与品行审查'],
      docs: ['有效护照', '亲属关系证明（婚姻/出生/收养等）', '担保人身份与经济证明', '无犯罪记录证明', '体检报告'],
      process: ['关系与资格评估', '准备担保材料', '递交团聚申请', '等待审批', '获批后登陆团聚'],
      cost: [{ label: '官方规费', value: `以${c.cn}官方最新标准为准` }, { label: '办理周期', value: sub.duration }, { label: '第三方费用', value: '公证、认证、翻译等按实际产生' }],
      adv: ['实现家庭完整团聚', '流程相对成熟', '获批后可长期居留'],
      cons: ['对亲属关系证明要求严格', '配额与周期因国家而异', '担保人需满足经济要求'],
      faq: [
        { q: `${c.cn}${name}对亲属关系有什么要求？`, a: '需提供婚姻、出生或收养等官方证明，并经过真实关系审查，具体以官方要求为准。' },
        { q: '担保人需要满足什么条件？', a: '担保人通常需具有合法身份、稳定收入与住所，具体以官方政策为准。' },
        { q: `办理周期多久？`, a: `通常约${sub.duration}，配额与个案进度会影响周期。` }
      ]
    },
    pr: {
      intro: `${c.cn}（${c.en}）作为${c.brief}，为${sub.role}提供「${name}」长期身份规划路径。该项目聚焦${sub.focus}，申请人需满足居留年限、收入或身份资格等要求，获批后可获得更稳定与长期的居留身份。`,
      audience: [`已合法居留或符合条件的${sub.role}`, '计划长期定居与发展的个人与家庭', '希望获得更稳定身份保障的申请人'],
      reqs: ['满足居留年限与居住要求', '收入或财务能力符合标准', '语言与社会融入达到要求（视政策）', '通过背景与健康审查'],
      docs: ['有效护照与居留文件', '收入与纳税证明', '语言成绩单（如适用）', '居住与融入证明', '无犯罪记录证明', '体检报告'],
      process: ['资格评估', '准备身份与财务材料', '递交申请', '等待审批', '获批并完成身份登记'],
      cost: [{ label: '官方规费', value: `以${c.cn}官方最新标准为准` }, { label: '办理周期', value: sub.duration }, { label: '第三方费用', value: '认证、翻译、体检等按实际产生' }],
      adv: ['身份更稳定，长期规划清晰', '可享受更多本地权益', '家庭可同步受益（视政策）'],
      cons: ['居留年限与居住要求严格', '审批周期较长', '需持续满足维持条件'],
      faq: [
        { q: `${c.cn}${name}对居住时间有要求吗？`, a: '通常有居留年限与居住天数要求，具体以官方最新规定为准。' },
        { q: '语言是必要条件吗？', a: '部分项目要求语言达到一定水平，具体视类别而定。' },
        { q: `申请周期多长？`, a: `一般约${sub.duration}，受材料与审批进度影响。` }
      ]
    },
    nomad: {
      intro: `${c.cn}（${c.en}）作为${c.brief}，为${sub.role}提供「${name}」远程旅居路径。该项目聚焦${sub.focus}，申请人需证明稳定的远程收入，获批后可在${c.cn}合法居留并远程工作，享受当地生活与网络便利。`,
      audience: [`收入来源为远程工作的${sub.role}`, '自由职业者、远程雇员与创业者', '希望边工作边体验国际生活的数字游民'],
      reqs: ['收入来源为境外或远程工作', '月收入达到官方最低标准', '拥有有效医疗保险', '无犯罪记录'],
      docs: ['有效护照', '远程收入与雇佣证明', '银行存款证明', '医疗保险证明', '无犯罪记录证明'],
      process: ['资格与收入评估', '准备证明材料', '递交申请', '等待审批', '获批后登陆'],
      cost: [{ label: '官方规费', value: `以${c.cn}官方最新标准为准` }, { label: '办理周期', value: sub.duration }, { label: '保险费用', value: '按当地医疗保险要求' }],
      adv: ['申请门槛相对友好', '可远程工作并旅居', '网络与生活成本优势明显'],
      cons: ['收入门槛有硬性要求', '一般不能在当地受雇', '续签需持续满足条件'],
      faq: [
        { q: `${c.cn}${name}对收入有什么要求？`, a: `通常要求月收入达到${c.cn}官方规定的最低标准，并需提供证明。` },
        { q: '可以在当地为本地公司工作吗？', a: '数字游民签证通常仅允许远程为境外雇主或客户工作，具体以当地法规为准。' },
        { q: `申请周期多久？`, a: `通常约${sub.duration}，材料齐全时审批较快。` }
      ]
    },
    youth: {
      intro: `${c.cn}（${c.en}）作为${c.brief}，为${sub.role}提供「${name}」青年交流路径。该项目聚焦${sub.focus}，面向符合年龄条件的青年开放，获批后可在${c.cn}参与工作、学习或文化交流，丰富国际经验。`,
      audience: [`符合年龄条件的${sub.role}`, '希望积累国际经验的学生与青年', '计划短期工作或交流后回国发展的年轻人'],
      reqs: ['年龄符合项目规定', '持有有效护照', '具备基本语言能力', '拥有足够资金支持初期生活', '无犯罪记录'],
      docs: ['有效护照', '年龄与身份证明', '资金证明', '健康与品行证明', '往返机票或行程计划（如适用）'],
      process: ['资格与配额评估', '准备材料', '递交申请', '等待审批', '获批后出发'],
      cost: [{ label: '官方规费', value: `以${c.cn}官方最新标准为准` }, { label: '办理周期', value: sub.duration }, { label: '生活费用', value: '按停留时间自行规划' }],
      adv: ['门槛较低，适合青年体验', '可工作与文化体验并行', '为未来国际发展积累经验'],
      cons: ['有年龄与配额限制', '停留时间有限', '部分项目不可续签'],
      faq: [
        { q: `${c.cn}${name}的年龄限制是多少？`, a: `通常面向 18–30 岁左右的青年，具体以${c.cn}官方规定为准。` },
        { q: '可以在当地工作吗？', a: '多数项目允许有限度工作以支持旅行费用，具体以当地法规为准。' },
        { q: `申请周期多久？`, a: `通常约${sub.duration}，配额有限建议尽早申请。` }
      ]
    },
    special: {
      intro: `${c.cn}（${c.en}）作为${c.brief}，为${sub.role}提供「${name}」特殊身份路径。该项目聚焦${sub.focus}，以申请人的身份资质或投资能力为核心评估标准，获批后可在${c.cn}合法居留并开展相应活动。`,
      audience: [`符合特定身份条件的${sub.role}`, '具备专业资质或资金实力的申请人', '需要稳定居留身份的特殊群体'],
      reqs: ['身份或资质符合${c.cn}官方认定', '提供相应专业或资金证明', '满足健康与品行要求'],
      docs: ['有效护照', '身份或资质证明', '专业或资金证明', '无犯罪记录证明', '体检报告'],
      process: ['身份与资质评估', '准备证明材料', '递交申请', '等待审批', '获批后登陆'],
      cost: [{ label: '官方规费', value: `以${c.cn}官方最新标准为准` }, { label: '办理周期', value: sub.duration }, { label: '第三方费用', value: '认证、翻译等按实际产生' }],
      adv: ['面向特定身份的定制路径', '居留稳定性较高', '家庭可同步受益（视政策）'],
      cons: ['身份资质门槛明确', '名额或政策有限', '需持续满足维持条件'],
      faq: [
        { q: `${c.cn}${name}需要什么资质？`, a: '需提供官方认可的身份、专业或投资资质证明，具体以官方标准为准。' },
        { q: '是否可以携带家属？', a: '多数项目允许符合条件的家属随行，具体以官方政策为准。' },
        { q: `申请周期多久？`, a: `通常约${sub.duration}，个案进度有所不同。` }
      ]
    }
  };

  const t = T[cat.id];
  return {
    id: `${c.id}-${sub.id}`,
    country: { id: c.id, cn: c.cn, en: c.en, flag: `${c.id}.svg`, region: c.region },
    category: { id: cat.id, name: cat.name },
    subcategory: { id: sub.id, name: sub.name },
    name,
    visaType,
    budget: sub.budget,
    duration: sub.duration,
    introduction: fill(t.intro, ctx),
    targetUsers: t.audience.map(s => fill(s, ctx)),
    requirements: t.reqs.map(s => fill(s, ctx)),
    documents: t.docs.map(s => fill(s, ctx)),
    process: t.process.map(s => fill(s, ctx)),
    cost: t.cost.map(s => ({ ...s, value: fill(s.value, ctx) })),
    advantages: t.adv.map(s => fill(s, ctx)),
    limitations: t.cons.map(s => fill(s, ctx)),
    faq: t.faq.map(f => ({ q: fill(f.q, ctx), a: fill(f.a, ctx) }))
  };
}

/* ---------- 生成 ---------- */
function build() {
  const projects = [];
  const byCountry = {};
  const byCategory = {};

  COUNTRIES.forEach(c => {
    const subs = new Set(BASE);
    Object.keys(ADD).forEach(slug => {
      if (ADD[slug].includes(c.id)) subs.add(slug);
    });
    byCountry[c.id] = [];
    subs.forEach(slug => {
      const sub = SUB_MAP[slug];
      if (!sub) { console.error('missing sub', slug); return; }
      const p = buildProject(c, sub);
      projects.push(p);
      byCountry[c.id].push(p);
      (byCategory[sub.catId] = byCategory[sub.catId] || []).push(p);
    });
  });

  fs.mkdirSync(DATA, { recursive: true });

  /* countries.js */
  const countriesJs = '/* 国家数据库（生成于 scripts/generate-database.js） */\nwindow.Istra = window.Istra || {};\nIstra.countries = ' +
    JSON.stringify(COUNTRIES.map(c => ({ id: c.id, cn: c.cn, en: c.en, flag: `${c.id}.svg`, region: c.region, brief: c.brief })), null, 2) + ';\n';
  fs.writeFileSync(path.join(DATA, 'countries.js'), countriesJs);

  /* categories.js */
  const categoriesJs = '/* 分类体系（生成于 scripts/generate-database.js） */\nwindow.Istra = window.Istra || {};\nIstra.categories = ' +
    JSON.stringify(CATEGORIES.map(cat => ({ id: cat.id, name: cat.name, en: cat.en, desc: cat.desc, subs: cat.subs.map(s => ({ id: s.id, name: s.name })) })), null, 2) + ';\n';
  fs.writeFileSync(path.join(DATA, 'categories.js'), categoriesJs);

  /* projects.json（数据库） */
  fs.writeFileSync(path.join(DATA, 'projects.json'), JSON.stringify(projects, null, 2));

  /* projects.js（站点内嵌，离线可用） */
  fs.writeFileSync(path.join(DATA, 'projects.js'),
    '/* 全球项目数据库（生成于 scripts/generate-database.js，源文件 projects.json） */\nwindow.Istra = window.Istra || {};\nIstra.projects = ' +
    JSON.stringify(projects) + ';\n');

  /* 统计 */
  const catCount = {};
  projects.forEach(p => { catCount[p.category.name] = (catCount[p.category.name] || 0) + 1; });
  console.log(`项目总数：${projects.length}`);
  console.log(`覆盖国家：${Object.keys(byCountry).length}`);
  console.log('分类分布：');
  CATEGORIES.forEach(cat => console.log(`  ${cat.name}: ${catCount[cat.name] || 0}`));
  const min = Math.min(...Object.values(byCountry).map(v => v.length));
  const max = Math.max(...Object.values(byCountry).map(v => v.length));
  console.log(`国家项目数：最少 ${min} / 最多 ${max}`);
}

build();



