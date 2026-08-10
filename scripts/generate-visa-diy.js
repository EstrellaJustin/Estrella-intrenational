/* ============================================================
   DIY 签证模拟系统 · 数据库生成器
   生成：src/data/visa-diy.json + visa-diy.js
   - Istra.visaDiyProjects：支持 DIY 的签证项目（关联全球项目大全 project_id）
   - Istra.visaDocuments：每个项目的官方申请材料清单（基于官方公开通用要求）
   材料来源引用各国官方移民/签证机构（项目 official_authority 字段）。
   不修改全球项目大全数据，不改变项目 ID。
   用法：node scripts/generate-visa-diy.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const projects = JSON.parse(fs.readFileSync(path.join(DATA, 'projects.json'), 'utf8'));
const UPDATED = '2026-08-11';

/* 材料模板：按类别生成官方通用申请材料（分类/是否必须/官方要求/准备建议） */
function docsFor(p) {
  const cat = p.category.id;
  const authority = p.official_authority || '目标国家官方移民/签证机构';
  const core = [
    { name: '有效护照', cat: '身份证明', req: true, reqTxt: '护照有效期通常需覆盖停留期并留有 6 个月以上余量，含至少 2 页空白签证页。', tip: '检查护照有效期与空白页，有效期不足请提前换发。' },
    { name: '签证申请表', cat: '身份证明', req: true, reqTxt: '在官方签证系统在线填写并提交申请表，信息须与护照一致。', tip: '如实填写，避免信息不一致导致补件。' },
    { name: '证件照片', cat: '身份证明', req: true, reqTxt: '符合官方规格的近期白底/彩色证件照（通常 2 张）。', tip: '按官方尺寸要求拍摄，避免使用旧照片。' },
    { name: '资金证明', cat: '财务资金', req: true, reqTxt: '银行流水、存款证明或收入证明，金额须覆盖停留期间费用。', tip: '提供近 3–6 个月稳定流水，余额充足更有利。' },
    { name: '无犯罪记录证明', cat: '背景审查', req: true, reqTxt: '由居住地公安机关出具，部分国家需公证或海牙认证。', tip: '提前办理公证与翻译，注意证明时效。' },
    { name: '健康体检证明', cat: '健康检查', req: true, reqTxt: '按官方要求前往指定医疗机构完成体检。', tip: '确认官方指定体检机构名单后预约。' }
  ];
  const extra = {
    work: [
      { name: '雇主录用证明', cat: '学历职业', req: true, reqTxt: '雇主出具的录用通知或担保文件，载明职位与薪酬。', tip: '确认职位与签证类别匹配，工资符合要求。' },
      { name: '学历与职业资格认证', cat: '学历职业', req: true, reqTxt: '学历学位证明及职业资格证书，必要时做官方认证。', tip: '提前完成学历认证与翻译公证。' },
      { name: '工作经历证明', cat: '学历职业', req: false, reqTxt: '过往工作经历证明或推荐信，用于支持技能评估。', tip: '整理在职证明、社保或税单佐证。' },
      { name: '语言能力证明', cat: '语言能力', req: true, reqTxt: '官方认可的语言考试成绩或证书（视项目要求）。', tip: '核对项目要求的语言考试与分数。' }
    ],
    tech: [
      { name: '学历学位认证', cat: '学历职业', req: true, reqTxt: '学位证书与成绩单，部分项目要求学历认证报告。', tip: '提前做教育部或国际学历认证。' },
      { name: '专业技能证明', cat: '学历职业', req: true, reqTxt: '职业资格证书、项目经历或获奖证明。', tip: '突出与目标岗位相关的项目成果。' },
      { name: '语言能力证明', cat: '语言能力', req: true, reqTxt: '官方认可的语言考试成绩（视项目要求）。', tip: '核对目标语言与分数要求。' },
      { name: '雇主或机构邀请函', cat: '学历职业', req: false, reqTxt: '雇主录用或研究机构邀请函（视项目类型）。', tip: '邀请函应注明职位、期限与薪酬。' }
    ],
    edu: [
      { name: '院校录取通知书', cat: '学历职业', req: true, reqTxt: '目标院校正式录取通知书（Offer/COE）。', tip: '确认录取条件并在规定时间内确认。' },
      { name: '学历学位与成绩单', cat: '学历职业', req: true, reqTxt: '最高学历学位证明与完整成绩单（含翻译件）。', tip: '提前公证翻译，密封盖章。' },
      { name: '语言成绩单', cat: '语言能力', req: true, reqTxt: '雅思/托福等官方认可语言成绩。', tip: '确认院校与签证要求的分数线。' },
      { name: '资金担保与来源说明', cat: '财务资金', req: true, reqTxt: '覆盖学费与生活费的存款证明及资金来源说明。', tip: '资金存期与金额按官方要求准备。' },
      { name: '学习计划', cat: '学历职业', req: false, reqTxt: '个人学习计划或动机信（部分国家要求）。', tip: '说明选校理由与毕业规划。' }
    ],
    invest: [
      { name: '投资资金来源证明', cat: '财务资金', req: true, reqTxt: '证明投资资金合法来源的银行流水、税务或资产文件。', tip: '资金路径清晰，避免大额短期入账。' },
      { name: '资产证明', cat: '财务资金', req: true, reqTxt: '不动产、存款或证券等资产证明。', tip: '提供官方认可的资产评估文件。' },
      { name: '商业计划书', cat: '学历职业', req: true, reqTxt: '投资或创业商业计划书（视项目要求）。', tip: '内容应包含市场、财务与就业贡献。' },
      { name: '税务记录', cat: '财务资金', req: false, reqTxt: '个人或企业纳税记录。', tip: '整理近年税单以佐证收入。' }
    ],
    talent: [
      { name: '杰出成就证明', cat: '学历职业', req: true, reqTxt: '奖项、媒体报道、专利、著作等成就证明。', tip: '突出国际认可度与行业影响力。' },
      { name: '推荐信', cat: '学历职业', req: true, reqTxt: '同行专家或机构出具的推荐信。', tip: '推荐人应具权威性与相关性。' },
      { name: '学历与从业证明', cat: '学历职业', req: true, reqTxt: '学历学位与从业经历证明。', tip: '按官方清单逐项整理。' }
    ],
    family: [
      { name: '亲属关系证明', cat: '身份证明', req: true, reqTxt: '结婚证、出生证明或亲属关系公证。', tip: '提前办理公证与认证。' },
      { name: '担保人资格证明', cat: '身份证明', req: true, reqTxt: '境内担保人的身份、收入与居住证明。', tip: '担保人收入需达到官方要求。' },
      { name: '共同生活证明', cat: '身份证明', req: false, reqTxt: '通话记录、合照等关系真实性材料（视项目）。', tip: '准备日常沟通与探访记录。' }
    ],
    pr: [
      { name: '居住与纳税记录', cat: '身份证明', req: true, reqTxt: '在当地的居住记录、税单或社保记录。', tip: '核对居住天数与纳税年度要求。' },
      { name: '语言能力证明', cat: '语言能力', req: true, reqTxt: '官方认可的语言考试成绩（视项目要求）。', tip: '确认考试类型与分数线。' },
      { name: '融入与雇佣证明', cat: '学历职业', req: false, reqTxt: '雇佣关系、社区参与等融入证明。', tip: '提供在职证明或志愿活动记录。' }
    ],
    nomad: [
      { name: '远程工作证明', cat: '学历职业', req: true, reqTxt: '雇主证明或自由职业合同，证明可远程工作。', tip: '注明工作性质与收入来源。' },
      { name: '收入与保险证明', cat: '财务资金', req: true, reqTxt: '稳定收入流水与医疗保险证明。', tip: '收入需达到官方最低标准。' }
    ],
    youth: [
      { name: '年龄与在读/毕业证明', cat: '身份证明', req: true, reqTxt: '年龄证明及在读或毕业证明。', tip: '确认项目年龄上限。' },
      { name: '往返资金与安排', cat: '财务资金', req: false, reqTxt: '资金证明及往返安排说明。', tip: '按官方要求准备资金与行程。' }
    ],
    special: [
      { name: '专业资质证明', cat: '学历职业', req: true, reqTxt: '执业资格、艺术/体育/宗教等专业资质证明。', tip: '提供官方机构出具的资质文件。' },
      { name: '背景与邀请材料', cat: '学历职业', req: true, reqTxt: '背景说明、邀请函或推荐材料。', tip: '材料应能证明从事活动性质。' }
    ]
  };
  const list = core.concat(extra[cat] || []);
  return list.map((d, i) => ({
    id: p.id + '-d' + String(i + 1).padStart(2, '0'),
    visa_project_id: p.id,
    document_name: d.name,
    document_category: d.cat,
    is_required: d.req,
    official_requirement: d.reqTxt,
    preparation_tips: d.tip,
    source_reference: authority,
    last_updated: UPDATED
  }));
}

const diyProjects = projects.map((p) => ({
  id: p.id,
  project_id: p.id,
  country: p.country.id,
  visa_name: p.name,
  visa_type: p.visaType
}));
const documents = [];
projects.forEach((p) => documents.push(...docsFor(p)));

const db = { diyProjects, documents };
fs.writeFileSync(path.join(DATA, 'visa-diy.json'), JSON.stringify(db), 'utf8');
const js = `/* DIY 签证模拟系统数据库（生成自 scripts/generate-visa-diy.js，源文件 visa-diy.json） */\nwindow.Istra = window.Istra || {};\nIstra.visaDiyProjects = ${JSON.stringify(diyProjects)};\nIstra.visaDocuments = ${JSON.stringify(documents)};\n`;
fs.writeFileSync(path.join(DATA, 'visa-diy.js'), js, 'utf8');
console.log('已生成：DIY 项目 ' + diyProjects.length + ' 个 · 材料记录 ' + documents.length + ' 条');