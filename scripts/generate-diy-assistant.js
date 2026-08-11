/* ============================================================
   DIY 签证助手 · 项目数据驱动架构生成器（v2）
   生成：src/data/diy-assistant.json + diy-assistant.js
   - Istra.diyGuides（diy_visa_guides）：项目基础信息 + 项目专属填写字段 form_fields
   - Istra.diySteps（visa_diy_steps）：每个项目独立配置的 DIY 流程
   - Istra.diyRequiredDocs（visa_required_documents）：按项目展示的官方材料清单
   流程与材料均以官方公开信息为基础（source_reference / last_updated）。
   禁止所有项目共用一套流程与固定材料列表。
   用法：node scripts/generate-diy-assistant.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const projects = JSON.parse(fs.readFileSync(path.join(DATA, 'projects.json'), 'utf8'));
const OLD = JSON.parse(fs.readFileSync(path.join(DATA, 'visa-diy.json'), 'utf8'));
const UPDATED = '2026-08-11';

/* 类别 → 难度 / 周期 / 人群 / FAQ */
const META = {
  work: { diff: '中低', period: '3–12 个月', people: '具备相关技能与工作经验的求职者' },
  tech: { diff: '中', period: '3–12 个月', people: 'IT、工程、科研等高技能人才' },
  edu: { diff: '中', period: '6–12 个月', people: '希望出国留学的学生与进修者' },
  invest: { diff: '高', period: '6–18 个月', people: '具备合规资金来源的投资与创业者' },
  talent: { diff: '中高', period: '6–18 个月', people: '拥有突出成就的杰出人才' },
  family: { diff: '中', period: '6–18 个月', people: '希望与家人团聚的申请人及担保人' },
  pr: { diff: '中高', period: '12–24 个月', people: '计划长期定居与身份规划的申请人' },
  nomad: { diff: '低', period: '1–3 个月', people: '可远程工作的自由职业者与数字游民' },
  youth: { diff: '低', period: '2–6 个月', people: '符合年龄要求的青年群体' },
  special: { diff: '中高', period: '3–12 个月', people: '艺术、体育、宗教等特殊领域人才' }
};

/* 项目专属填写字段（按项目类别定义，禁止完全相同的表单） */
function formFields(cat) {
  const sel = (key, label, options) => ({ key, label, type: 'select', options });
  const txt = (key, label, placeholder) => ({ key, label, type: 'text', placeholder });
  const map = {
    work: [sel('degree', '学历', ['高中以下', '高中', '大专', '本科', '硕士', '博士']), txt('occupation', '职业', '如：焊工 / 厨师 / 程序员'), sel('experience', '工作经验', ['无', '1 年以内', '1–3 年', '3–5 年', '5 年以上']), sel('employer', '雇主状态', ['已有雇主录用', '正在寻找雇主', '暂无雇主'])],
    tech: [sel('degree', '学历', ['大专', '本科', '硕士', '博士']), txt('techField', '技术领域', '如：IT / 机械 / 医疗'), sel('experience', '工作经验', ['无', '1–3 年', '3–5 年', '5 年以上']), txt('cert', '技能证书', '如：职业资格 / 认证')],
    edu: [sel('degree', '学历', ['高中', '大专', '本科', '硕士', '博士']), sel('admission', '学校录取状态', ['已获录取', '申请中', '未申请']), sel('funds', '资金情况', ['充足', '一般', '不足']), txt('langScore', '语言成绩', '如：雅思 6.0 / 托福 80')],
    invest: [sel('fundsScale', '资金规模', ['50 万以下', '50–150 万', '150–300 万', '300 万以上']), txt('investPlan', '投资计划', '如：房产 / 商业 / 基金'), txt('fundSource', '资金来源', '如：工资储蓄 / 经营收入')],
    talent: [txt('field', '专业领域', '如：科技 / 艺术 / 体育'), txt('achievement', '主要成就', '如：奖项 / 专利 / 代表作品'), txt('referral', '推荐材料', '如：推荐信 / 媒体报道')],
    family: [txt('sponsor', '担保人身份', '如：配偶 / 父母 / 子女'), txt('relation', '亲属关系', '如：夫妻 / 直系亲属'), txt('familyDesc', '家庭情况', '如：子女数量与年龄')],
    pr: [txt('residence', '居住年限', '如：3 年'), txt('langScore', '语言成绩', '如：雅思 5.0'), sel('tax', '纳税记录', ['有', '无'])],
    nomad: [sel('remoteProof', '远程工作证明', ['有', '无']), txt('income', '月收入', '如：2 万元'), txt('workType', '工作性质', '如：自由职业 / 远程雇员')],
    youth: [txt('age', '年龄', '如：22'), sel('status', '在读/毕业状态', ['在读', '已毕业']), sel('funds', '资金情况', ['充足', '一般', '不足'])],
    special: [txt('qualification', '专业资质', '如：执业资格 / 会员'), txt('invite', '邀请/推荐情况', '如：机构邀请函')]
  };
  return map[cat] || [txt('note', '补充说明', '如：你的基本情况')];
}

/* 类别前置要求动作 */
const PRE = {
  work: '完成技能考试、语言测试或职业资格认证（视项目要求）。',
  tech: '完成学历认证、技能评估或语言考试（视项目要求）。',
  edu: '完成语言考试（雅思/托福等）并准备资金证明。',
  invest: '完成资金来源梳理与合规文件准备。',
  talent: '准备成就证明、推荐信与评审材料。',
  family: '确认担保人资格并准备亲属关系公证。',
  pr: '完成语言考试并整理居住与纳税记录。',
  nomad: '准备远程工作证明与收入流水。',
  youth: '确认年龄资格并准备在读/毕业证明。',
  special: '准备专业资质证明与邀请材料。'
};
const OPP = {
  work: '通过官方招聘平台、行业协会或职业中介寻找雇主录用机会。',
  tech: '通过官方人才通道、招聘平台或企业直投寻找录用/邀请机会。',
  edu: '向目标院校提交申请并取得正式录取通知。',
  invest: '确定投资项目/标的并完成尽职调查与投资安排。',
  talent: '通过官方人才计划或机构提名取得申请资格。',
  family: '确认担保人资格并准备担保申请材料。',
  pr: '确认居住与身份转换资格（如适用）。',
  nomad: '确认雇主远程政策或自由职业合同。',
  youth: '确认项目开放时间与名额并准备申请。',
  special: '取得机构邀请或项目资格确认。'
};

/* FAQ（通用 + 类别） */
function faqs(cat) {
  const base = [
    { q: '没有语言基础怎么办？', a: '可先参加语言课程或官方认可的语言考试；部分项目允许达到基础要求后再申请，也可选择对语言要求较低的路线。' },
    { q: '材料丢失怎么办？', a: '联系原发证机关补办并重新公证翻译；多数材料（护照、学历、工作证明）均可重新开具，保留好补办记录。' },
    { q: '自己申请是否困难？', a: '多数项目支持自行在线申请，关键在于材料齐全、信息一致并按要求提交。参照本助手逐项准备即可。' }
  ];
  const extra = {
    work: { q: '还没有雇主录用怎么办？', a: '可通过官方招聘平台、行业协会或职业中介寻找雇主；部分项目允许先找工作后申请。' },
    edu: { q: '资金不足如何规划？', a: '可考虑奖学金、勤工俭学政策或选择生活成本较低的城市，提前规划资金证明。' },
    invest: { q: '投资资金需要什么证明？', a: '需要证明资金来源合法，通常包括银行流水、税务记录与资产文件。' },
    pr: { q: '居住年限如何计算？', a: '以官方规定的有效居住天数为准，建议保留税单、账单等居住证明。' },
    nomad: { q: '收入要求是多少？', a: '数字游民项目通常设有最低月收入门槛，以目标国家官方最新标准为准。' }
  };
  const e = extra[cat];
  return e ? base.concat([e]) : base;
}

/* 材料 requirement_level */
function levelOf(isRequired, isCore) {
  if (isCore) return '必须';
  return isRequired ? '必须' : '建议';
}

const guides = [];
const steps = [];
const docs = [];

projects.forEach((p) => {
  const m = META[p.category.id] || META.work;
  const full = projects.find((x) => x.id === p.id);
  const oldDocs = OLD.documents.filter((d) => d.visa_project_id === p.id);
  const coreNames = ['有效护照', '签证申请表', '证件照片', '资金证明', '无犯罪记录证明', '健康体检证明'];

  /* visa_required_documents：按项目展示 */
  const projectDocs = oldDocs.map((d, i) => {
    const isCore = coreNames.includes(d.document_name);
    return {
      id: p.id + '-d' + String(i + 1).padStart(2, '0'),
      visa_project_id: p.id,
      document_name: d.document_name,
      document_description: d.official_requirement,
      requirement_level: levelOf(d.is_required, isCore),
      official_requirement: d.official_requirement,
      source_reference: full.official_authority || '目标国家官方移民/签证机构',
      last_updated: UPDATED
    };
  });
  docs.push(...projectDocs);

  /* visa_diy_steps：每项目独立流程（内容引用项目专属材料与要求） */
  const docNames = projectDocs.slice(0, 4).map((d) => d.document_name).join('、');
  const stepDefs = [
    { name: '确认自己是否符合 ' + p.name + ' 的申请条件', desc: '对照 ' + p.name + ' 在年龄、学历、职业、语言与资金方面的要求，逐项确认自身条件是否满足。', action: '核对官方申请条件并完成自我评估，记录暂不满足的项目。' },
    { name: '准备 ' + p.name + ' 专属申请材料', desc: '按该项目专属材料清单准备，重点包括：' + docNames + ' 等。', action: '逐项准备并核对材料完整、信息一致、翻译公证齐全。' },
    { name: '完成必要前置要求', desc: '根据项目类型完成语言考试、技能认证、体检或无犯罪记录等前置要求。', action: PRE[p.category.id] || '按官方要求完成前置准备。' },
    { name: '取得申请资格 / 申请机会', desc: '根据项目类型取得雇主录用、院校录取、投资机会或机构邀请，获得申请资格。', action: OPP[p.category.id] || '通过官方渠道取得申请资格。' },
    { name: '提交 ' + p.name + ' 申请并跟进', desc: '按官方要求整理并提交完整申请，保存回执并跟进审核进度。', action: '提交前逐项检查签名、日期与文件格式，关注补件通知。' }
  ];
  stepDefs.forEach((s, k) => {
    steps.push({
      id: p.id + '-t' + String(k + 1).padStart(2, '0'),
      visa_project_id: p.id,
      step_order: k + 1,
      step_name: s.name,
      step_description: s.desc,
      required_action: s.action,
      source_reference: full.official_authority || '目标国家官方移民/签证机构',
      last_updated: UPDATED
    });
  });

  /* diy_visa_guides */
  guides.push({
    id: p.id,
    visa_project_id: p.id,
    country: p.country.id,
    visa_name: p.name,
    visa_type: p.visaType,
    target_people: (p.targetUsers && p.targetUsers[0]) || m.people,
    difficulty: m.diff,
    preparation_period: m.period,
    form_fields: formFields(p.category.id),
    requirements: (p.requirements || []).slice(0, 6),
    faq: faqs(p.category.id),
    created_time: UPDATED
  });
});

const db = { guides, steps, docs };
fs.writeFileSync(path.join(DATA, 'diy-assistant.json'), JSON.stringify(db), 'utf8');
const js = `/* DIY 签证助手数据库 · 项目数据驱动（生成自 scripts/generate-diy-assistant.js，源文件 diy-assistant.json） */\nwindow.Istra = window.Istra || {};\nIstra.diyGuides = ${JSON.stringify(guides)};\nIstra.diySteps = ${JSON.stringify(steps)};\nIstra.diyRequiredDocs = ${JSON.stringify(docs)};\n`;
fs.writeFileSync(path.join(DATA, 'diy-assistant.js'), js, 'utf8');
console.log('已生成：指南 ' + guides.length + ' · 项目专属流程 ' + steps.length + ' · 项目专属材料 ' + docs.length);