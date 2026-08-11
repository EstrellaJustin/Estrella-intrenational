/* ============================================================
   DIY 签证助手 · 数据库生成器
   生成：src/data/diy-assistant.json + diy-assistant.js
   - Istra.diyGuides（diy_visa_guides）：签证 DIY 指南（基础信息 + 5 步流程）
   - Istra.diyDocuments（diy_documents）：申请材料任务（用途/准备要求/注意事项/常见错误/状态）
   - Istra.diyTasks（diy_tasks）：5 步固定准备任务
   数据基于现有全球项目数据库派生，不修改项目大全。
   用法：node scripts/generate-diy-assistant.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const projects = JSON.parse(fs.readFileSync(path.join(DATA, 'projects.json'), 'utf8'));
const OLD = JSON.parse(fs.readFileSync(path.join(DATA, 'visa-diy.json'), 'utf8'));
const CREATED = '2026-08-11';

/* 类别 → 难度 / 准备周期 / 人群模板 / FAQ */
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

/* 5 步固定流程（说明 + 注意事项） */
function processSteps(cat) {
  const catTip = {
    work: '步骤 3 注意：确认雇主担保类项目需先获得录用；技能考试类需提前报名。',
    tech: '步骤 3 注意：技术类项目通常要求学历认证与技能评估，请预留办理时间。',
    edu: '步骤 3 注意：留学类需先获得院校录取，语言成绩须在有效期内。',
    invest: '步骤 3 注意：投资类项目对资金来源审核严格，需提前整理资金路径。',
    talent: '步骤 3 注意：杰出人才类需准备成就证明与推荐信等支撑材料。',
    family: '步骤 3 注意：家庭团聚类需担保人先行满足资格，再提交申请。',
    pr: '步骤 3 注意：永居类项目通常要求语言成绩与居住记录，请核对年限。',
    nomad: '步骤 3 注意：数字游民类需提供远程工作与收入证明。',
    youth: '步骤 3 注意：青年交流类有年龄与名额限制，请关注开放时间。',
    special: '步骤 3 注意：特殊类别需提供相应资质与邀请材料。'
  }[cat] || '步骤 3 注意：请按官方清单逐项核对材料要求。';
  return [
    { name: '确认自己是否符合条件', desc: '对照目标项目的年龄、学历、职业、语言与资金要求，先完成自我评估，避免准备方向错误。', tip: '以目标国家官方最新要求为准，年龄与资金门槛尤其容易变化。' },
    { name: '准备申请材料', desc: '按材料清单逐项准备护照、资金证明、学历职业证明等文件，并完成翻译与公证。', tip: '材料信息需与申请表完全一致，扫描件保持清晰完整。' },
    { name: '完成必要要求', desc: '完成语言考试、技能认证、体检、无犯罪记录等必要前置要求。', tip: catTip },
    { name: '寻找申请机会', desc: '根据项目类型寻找雇主录用、院校录取或投资机会，取得申请资格。', tip: '通过官方渠道与正规平台寻找机会，警惕收费代办承诺。' },
    { name: '最终申请准备', desc: '核对全部材料与申请表信息，按规定提交申请并保存回执，跟进审核进度。', tip: '提交前逐项检查签名、日期与文件格式，保留补件通知。' }
  ];
}

/* 常见问题（通用 + 类别） */
function faqs(cat, visaName) {
  const base = [
    { q: '没有语言基础怎么办？', a: '可先参加语言课程或官方认可的语言考试；部分项目允许达到基础要求后再申请，也可选择对语言要求较低的路线。' },
    { q: '材料丢失怎么办？', a: '联系原发证机关补办并重新公证翻译；多数材料（护照、学历、工作证明）均可重新开具，保留好补办记录。' },
    { q: '自己申请是否困难？', a: '多数项目支持自行在线申请，关键在于材料齐全、信息一致并按要求提交。参照本指南逐步准备即可。' },
    { q: '申请需要多久？', a: '准备周期视项目而定（详见模块1），提交后审核周期以官方公布为准，请预留充足时间。' }
  ];
  const extra = {
    work: { q: '还没有雇主录用怎么办？', a: '可通过官方招聘平台、行业协会或职业中介寻找雇主；部分项目允许先找工作后申请。' },
    edu: { q: '资金不足如何规划？', a: '可考虑奖学金、勤工俭学政策或选择生活成本较低的国家与城市，提前规划资金证明。' },
    invest: { q: '投资资金需要什么证明？', a: '需要证明资金来源合法，通常包括银行流水、税务记录与资产文件，请提前整理。' },
    family: { q: '担保人需要满足什么条件？', a: '担保人通常需具备稳定收入与合法身份，具体要求以官方政策为准。' },
    pr: { q: '居住年限如何计算？', a: '以官方规定的有效居住天数为准，建议保留税单、账单等居住证明。' },
    nomad: { q: '收入要求是多少？', a: '数字游民项目通常设有最低月收入门槛，以目标国家官方最新标准为准。' }
  };
  const e = extra[cat];
  return e ? base.concat([e]) : base;
}

/* 材料用途 / 常见错误（按材料分类） */
const DOC_META = {
  '身份证明': { desc: '证明你的身份与国籍，是签证申请的基础文件。', err: '护照有效期不足或照片规格不符；复印件未按要求公证。' },
  '财务资金': { desc: '证明你有能力负担停留期间的费用，避免滞留风险。', err: '流水断档或余额不足；资金短期大额入账缺少来源说明。' },
  '背景审查': { desc: '证明无犯罪记录，用于官方背景核查。', err: '证明开具后放置过久超过有效期；未按要求公证认证。' },
  '健康检查': { desc: '证明健康状况符合入境要求。', err: '未到官方指定机构体检；体检报告过期。' },
  '学历职业': { desc: '证明学历、职业与技能背景，用于资格审核。', err: '信息缺失（单位、职位、时间不全）；翻译件未盖章。' },
  '语言能力': { desc: '证明语言水平达到项目要求。', err: '成绩单过期；使用非官方认可考试。' }
};

const guides = [];
const documents = [];
const tasks = [];

projects.forEach((p) => {
  const m = META[p.category.id] || META.work;
  const steps = processSteps(p.category.id);
  guides.push({
    id: p.id,
    visa_project_id: p.id,
    country: p.country.id,
    visa_name: p.name,
    visa_type: p.visaType,
    target_people: (p.targetUsers && p.targetUsers[0]) || m.people,
    difficulty: m.diff,
    preparation_period: m.period,
    process_steps: steps,
    faq: faqs(p.category.id, p.name),
    created_time: CREATED
  });
  const oldDocs = OLD.documents.filter((d) => d.visa_project_id === p.id);
  oldDocs.forEach((d, i) => {
    const meta = DOC_META[d.document_category] || DOC_META['身份证明'];
    documents.push({
      id: p.id + '-d' + String(i + 1).padStart(2, '0'),
      visa_id: p.id,
      document_name: d.document_name,
      description: meta.desc,
      requirement: d.official_requirement,
      tips: d.preparation_tips,
      common_errors: meta.err,
      status: '未开始'
    });
  });
  steps.forEach((s, k) => {
    tasks.push({
      id: p.id + '-t' + String(k + 1).padStart(2, '0'),
      visa_id: p.id,
      task_name: s.name,
      task_description: s.desc,
      task_tips: s.tip,
      task_order: k + 1
    });
  });
});

const db = { guides, documents, tasks };
fs.writeFileSync(path.join(DATA, 'diy-assistant.json'), JSON.stringify(db), 'utf8');
const js = `/* DIY 签证助手数据库（生成自 scripts/generate-diy-assistant.js，源文件 diy-assistant.json） */\nwindow.Istra = window.Istra || {};\nIstra.diyGuides = ${JSON.stringify(guides)};\nIstra.diyDocuments = ${JSON.stringify(documents)};\nIstra.diyTasks = ${JSON.stringify(tasks)};\n`;
fs.writeFileSync(path.join(DATA, 'diy-assistant.js'), js, 'utf8');
console.log('已生成：指南 ' + guides.length + ' · 材料 ' + documents.length + ' · 任务 ' + tasks.length);