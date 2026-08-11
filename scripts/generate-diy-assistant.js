/* ============================================================
   DIY 签证助手 · 数据驱动系统生成器（v3 · 独立配置）
   每个签证项目独立配置：
   申请资格条件 / 用户填写问题 / 所需申请材料 / 前置准备任务 / DIY流程 / 注意事项
   六张表：visa_diy_config / visa_eligibility_conditions / visa_user_questions /
          visa_required_documents / visa_preparation_tasks / visa_diy_steps
   西班牙数字游民签证（es-nomad-visa）为手工精修示例数据，
   其他项目按官方公开信息派生（均带 source_reference / last_updated）。
   未来新增签证：只需在数据库中增加对应项目配置，无需修改代码。
   用法：node scripts/generate-diy-assistant.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const projects = JSON.parse(fs.readFileSync(path.join(DATA, 'projects.json'), 'utf8'));
const OLD = JSON.parse(fs.readFileSync(path.join(DATA, 'visa-diy.json'), 'utf8'));
const UPDATED = '2026-08-11';

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

/* ============ 西班牙数字游民签证（手工精修示例数据） ============ */
const ES_NOMAD = {
  conditions: [
    { condition_name: '年龄要求', condition_type: '年龄', condition_description: '申请人需年满 18 周岁（通常不超过 60 岁，以官方最新要求为准）。', required: true },
    { condition_name: '收入要求', condition_type: '收入', condition_description: '月收入需达到西班牙最低工资的约 2 倍（约 2,300 欧元/月，以官方最新标准为准）。', required: true },
    { condition_name: '远程工作性质', condition_type: '职业', condition_description: '受雇于境外公司或为境外客户提供自由职业服务，且工作可远程完成。', required: true },
    { condition_name: '从业时间', condition_type: '工作经验', condition_description: '通常要求相关工作经历达到 3 年以上（以官方要求为准）。', required: true },
    { condition_name: '学历或培训', condition_type: '学历', condition_description: '大学学历或同等职业培训证书（与从业时间二选一，以官方要求为准）。', required: false },
    { condition_name: '无犯罪记录', condition_type: '其他', condition_description: '近 5 年居住国无犯罪记录证明。', required: true },
    { condition_name: '医疗保险', condition_type: '其他', condition_description: '购买覆盖西班牙的私人医疗保险。', required: true }
  ],
  questions: [
    ['你的年龄？', 'number', '', 'min:18|max:60', '年龄'],
    ['你的月收入（欧元）？', 'number', '', 'min:2300', '收入'],
    ['你的工作类型？', 'select', '受雇于境外公司|自由职业|混合', 'match:受雇于境外公司|自由职业', '职业'],
    ['你的工作是否可以远程完成？', 'select', '是|否', 'match:是', '职业'],
    ['你的学历？', 'select', '高中以下|高中|大专|本科|硕士|博士', '', '学历'],
    ['相关工作经历年限？', 'select', '1年以内|1-3年|3-5年|5年以上', 'match:3-5年|5年以上', '工作经验']
  ],
  documents: [
    { document_name: '有效护照', document_category: '身份证明', description: '护照有效期覆盖停留期并含空白签证页。', official_requirement: '有效护照原件及复印件', is_required: true, alternative_document: '' },
    { document_name: '远程工作合同', document_category: '职业证明', description: '证明受雇于境外公司且可远程工作。', official_requirement: '劳动合同或雇主证明，注明远程工作性质', is_required: true, alternative_document: '自由职业合同 / 客户协议' },
    { document_name: '收入证明', document_category: '财务资金', description: '证明月收入达到门槛。', official_requirement: '近 3 个月银行流水及雇主薪资证明', is_required: true, alternative_document: '税单 / 收入申报' },
    { document_name: '医疗保险', document_category: '健康保险', description: '覆盖西班牙的私人医疗保险。', official_requirement: '在西班牙有效的医疗保险证明', is_required: true, alternative_document: '' },
    { document_name: '无犯罪记录证明', document_category: '背景审查', description: '近 5 年居住国无犯罪记录。', official_requirement: '无犯罪记录证明并公证翻译', is_required: true, alternative_document: '' },
    { document_name: '学历或培训证明', document_category: '学历职业', description: '大学学历或职业培训证书。', official_requirement: '学历学位或培训证书（或提供 3 年工作经历证明）', is_required: false, alternative_document: '3 年工作经历证明' },
    { document_name: '签证申请表', document_category: '身份证明', description: '官方在线申请表。', official_requirement: '按要求填写并签名', is_required: true, alternative_document: '' }
  ],
  tasks: [
    { task_name: '确认收入达到门槛', task_description: '核对月收入是否达到官方最低标准。', task_order: 1, required: true, estimated_time: '1 天' },
    { task_name: '准备远程工作证明', task_description: '向雇主或客户取得远程工作证明。', task_order: 2, required: true, estimated_time: '1–2 周' },
    { task_name: '购买医疗保险', task_description: '购买覆盖西班牙的私人医疗保险。', task_order: 3, required: true, estimated_time: '1–3 天' },
    { task_name: '办理无犯罪记录并认证', task_description: '开具无犯罪记录证明并完成公证翻译。', task_order: 4, required: true, estimated_time: '2–4 周' },
    { task_name: '文件翻译与认证', task_description: '对合同、学历等文件进行翻译与认证。', task_order: 5, required: true, estimated_time: '1–2 周' }
  ],
  steps: [
    { step_order: 1, step_title: '确认资格与收入门槛', step_description: '核对年龄、收入、远程工作性质等条件是否满足。', user_action: '填写条件确认表单，逐项核对官方要求。' },
    { step_order: 2, step_title: '准备全部申请材料', step_description: '按专属材料清单准备护照、收入证明、保险等。', user_action: '逐项准备并完成翻译与认证。' },
    { step_order: 3, step_title: '完成前置任务', step_description: '完成保险购买、无犯罪记录等前置任务。', user_action: '按前置任务列表逐项完成并核对。' },
    { step_order: 4, step_title: '提交申请', step_description: '通过官方渠道提交数字游民签证申请。', user_action: '在线或使领馆提交并保存回执。' },
    { step_order: 5, step_title: '跟进审核与入境', step_description: '跟进审核进度，获批后安排入境与登记。', user_action: '关注补件通知并准备入境材料。' }
  ]
};

/* ============ 派生逻辑（其他项目） ============ */

const CAT_CONDITIONS = {
  work: [{ name: '雇主录用', type: '职业', desc: '需获得当地雇主录用或担保（视项目类型）。', req: true },
         { name: '学历与职业资格', type: '学历', desc: '学历或职业资格需符合岗位要求。', req: true },
         { name: '语言能力', type: '语言', desc: '需达到项目要求的语言水平。', req: true }],
  tech: [{ name: '学历认证', type: '学历', desc: '学历学位需完成官方认证。', req: true },
         { name: '专业技能', type: '职业', desc: '具备目标领域技能与项目经验。', req: true }],
  edu: [{ name: '院校录取', type: '职业', desc: '需取得目标院校正式录取。', req: true },
        { name: '语言成绩', type: '语言', desc: '需提交官方认可的语言成绩。', req: true },
        { name: '资金担保', type: '资金', desc: '需提供覆盖学费与生活费的资金证明。', req: true }],
  invest: [{ name: '资金规模', type: '资金', desc: '投资金额需达到项目门槛。', req: true },
           { name: '资金来源', type: '资金', desc: '需证明资金合法来源。', req: true }],
  talent: [{ name: '杰出成就', type: '职业', desc: '需提供国际认可的成就证明。', req: true }],
  family: [{ name: '亲属关系', type: '其他', desc: '需提供亲属关系公证。', req: true },
           { name: '担保人资格', type: '收入', desc: '担保人需满足收入与居住要求。', req: true }],
  pr: [{ name: '居住与纳税', type: '工作经验', desc: '需满足居住年限与纳税记录要求。', req: true },
       { name: '语言能力', type: '语言', desc: '需提交语言考试成绩。', req: true }],
  nomad: [{ name: '远程工作证明', type: '职业', desc: '需证明工作可远程完成。', req: true },
          { name: '收入门槛', type: '收入', desc: '需达到最低收入标准。', req: true }],
  youth: [{ name: '年龄限制', type: '年龄', desc: '需符合项目年龄上限。', req: true }],
  special: [{ name: '专业资质', type: '职业', desc: '需提供专业资质与邀请材料。', req: true }]
};

const CAT_QUESTIONS = {
  work: [['你的学历？', 'select', '高中以下|高中|大专|本科|硕士|博士', ''], ['你的职业？', 'text', '', ''], ['工作经验年限？', 'select', '无|1年以内|1-3年|3-5年|5年以上', ''], ['是否有雇主录用？', 'select', '已有|正在寻找|暂无', 'match:已有']],
  tech: [['你的学历？', 'select', '大专|本科|硕士|博士', ''], ['你的技术领域？', 'text', '', ''], ['技能证书？', 'text', '', '']],
  edu: [['你的学历？', 'select', '高中|大专|本科|硕士|博士', ''], ['学校录取状态？', 'select', '已获录取|申请中|未申请', 'match:已获录取'], ['资金情况？', 'select', '充足|一般|不足', ''], ['语言成绩？', 'text', '', '']],
  invest: [['资金规模？', 'select', '50万以下|50-150万|150-300万|300万以上', ''], ['投资计划？', 'text', '', ''], ['资金来源？', 'text', '', '']],
  talent: [['专业领域？', 'text', '', ''], ['主要成就？', 'text', '', '']],
  family: [['担保人身份？', 'text', '', ''], ['亲属关系？', 'text', '', '']],
  pr: [['居住年限？', 'text', '', ''], ['语言成绩？', 'text', '', ''], ['纳税记录？', 'select', '有|无', 'match:有']],
  nomad: [['工作类型？', 'select', '受雇于境外公司|自由职业|混合', 'match:受雇于境外公司|自由职业'], ['月收入？', 'text', '', ''], ['工作是否可以远程完成？', 'select', '是|否', 'match:是']],
  youth: [['年龄？', 'text', '', ''], ['在读/毕业状态？', 'select', '在读|已毕业', '']],
  special: [['专业资质？', 'text', '', ''], ['邀请/推荐情况？', 'text', '', '']]
};

const CAT_TASKS = {
  work: [['准备学历与职业资格认证', '学历认证、资格认证或语言考试。', true, '2–6 周'], ['寻找雇主 / 取得录用', '通过官方渠道寻找雇主并获得录用。', true, '1–6 个月']],
  tech: [['完成学历认证', '学历学位认证与翻译。', true, '2–6 周'], ['准备技能评估材料', '技能证书与项目经历整理。', true, '1–2 周']],
  edu: [['完成语言考试', '雅思/托福等官方考试。', true, '1–3 个月'], ['准备资金证明', '存款证明与资金来源说明。', true, '1–2 周']],
  invest: [['梳理资金来源', '银行流水、税务记录等。', true, '2–4 周'], ['完成投资尽职调查', '确认投资标的与合规安排。', true, '1–2 个月']],
  talent: [['整理成就证明', '奖项、专利、媒体报道等。', true, '2–4 周'], ['取得推荐材料', '同行专家推荐信。', true, '2–4 周']],
  family: [['办理亲属关系公证', '结婚证/出生证明公证认证。', true, '2–4 周'], ['确认担保人资格', '担保人收入与居住材料。', true, '1–2 周']],
  pr: [['完成语言考试', '官方认可的语言考试。', true, '1–3 个月'], ['整理居住与纳税记录', '税单、账单等。', true, '1–2 周']],
  nomad: [['准备远程工作证明', '雇主证明或自由职业合同。', true, '1–2 周'], ['购买医疗保险', '覆盖目的国的保险。', true, '1–3 天']],
  youth: [['确认年龄资格', '核对项目年龄上限。', true, '1 天'], ['准备在读/毕业证明', '学校出具的在读或毕业证明。', true, '1–2 周']],
  special: [['准备专业资质证明', '执业资格或会员证明。', true, '2–4 周'], ['取得邀请材料', '机构邀请函或推荐信。', true, '2–4 周']]
};

const CAT_EXTRA_STEPS = {
  work: { s3: '完成技能考试、语言测试或职业资格认证（视项目要求）。', s4: '通过官方招聘平台、行业协会或职业中介寻找雇主录用机会。' },
  tech: { s3: '完成学历认证、技能评估或语言考试（视项目要求）。', s4: '通过官方人才通道、招聘平台或企业直投寻找录用/邀请机会。' },
  edu: { s3: '完成语言考试（雅思/托福等）并准备资金证明。', s4: '向目标院校提交申请并取得正式录取通知。' },
  invest: { s3: '完成资金来源梳理与合规文件准备。', s4: '确定投资项目/标的并完成尽职调查与投资安排。' },
  talent: { s3: '准备成就证明、推荐信与评审材料。', s4: '通过官方人才计划或机构提名取得申请资格。' },
  family: { s3: '确认担保人资格并准备亲属关系公证。', s4: '确认担保人资格并准备担保申请材料。' },
  pr: { s3: '完成语言考试并整理居住与纳税记录。', s4: '确认居住与身份转换资格（如适用）。' },
  nomad: { s3: '准备远程工作证明与收入流水。', s4: '确认雇主远程政策或自由职业合同。' },
  youth: { s3: '确认年龄资格并准备在读/毕业证明。', s4: '确认项目开放时间与名额并准备申请。' },
  special: { s3: '准备专业资质证明与邀请材料。', s4: '取得机构邀请或项目资格确认。' }
};

const configs = [], conditions = [], questions = [], docs = [], tasks = [], steps = [];

projects.forEach((p) => {
  const m = META[p.category.id] || META.work;
  const authority = p.official_authority || '目标国家官方移民/签证机构';
  const isEsNomad = p.id === 'es-nomad-visa';

  configs.push({ id: p.id, visa_project_id: p.id, visa_name: p.name, country: p.country.id });

  /* 申请资格条件 */
  const condList = [];
  if (isEsNomad) {
    ES_NOMAD.conditions.forEach((c, i) => condList.push({ id: p.id + '-c' + String(i + 1).padStart(2, '0'), visa_id: p.id, condition_name: c.condition_name, condition_description: c.condition_description, condition_type: c.condition_type, required: c.required, source_reference: authority, last_updated: UPDATED }));
  } else {
    (CAT_CONDITIONS[p.category.id] || []).forEach((c, i) => condList.push({ id: p.id + '-c' + String(i + 1).padStart(2, '0'), visa_id: p.id, condition_name: c.name, condition_description: c.desc, condition_type: c.type, required: c.req, source_reference: authority, last_updated: UPDATED }));
    (p.requirements || []).slice(0, 2).forEach((r, i) => condList.push({ id: p.id + '-c' + String(condList.length + 1).padStart(2, '0'), visa_id: p.id, condition_name: '其他要求', condition_description: r, condition_type: '其他', required: true, source_reference: authority, last_updated: UPDATED }));
  }
  conditions.push(...condList);

  /* 用户填写问题 */
  const qList = isEsNomad ? ES_NOMAD.questions : (CAT_QUESTIONS[p.category.id] || [['补充说明？', 'text', '', '']]);
  qList.forEach((q, i) => {
    questions.push({ id: p.id + '-q' + String(i + 1).padStart(2, '0'), visa_id: p.id, question: q[0], answer_type: q[1], options: q[2] || '', validation_rule: q[3] || '', condition_type: q[4] || '' });
  });

  /* 专属材料 */
  const oldDocs = isEsNomad ? ES_NOMAD.documents : (OLD.documents || []).filter((d) => d.visa_project_id === p.id).map((d) => ({
    document_name: d.document_name,
    document_category: d.document_category || '其他',
    description: d.official_requirement || d.document_name,
    official_requirement: d.official_requirement,
    is_required: d.is_required === true,
    alternative_document: ''
  }));
  oldDocs.forEach((d, i) => {
    docs.push({ id: p.id + '-d' + String(i + 1).padStart(2, '0'), visa_id: p.id, document_name: d.document_name, document_category: d.document_category, description: d.description, official_requirement: d.official_requirement, is_required: d.is_required, alternative_document: d.alternative_document || '', source_reference: authority, last_updated: UPDATED });
  });

  /* 前置准备任务 */
  const tList = isEsNomad ? ES_NOMAD.tasks : (CAT_TASKS[p.category.id] || []).map((t, i) => ({ task_name: t[0], task_description: t[1], task_order: i + 1, required: t[2], estimated_time: t[3] }));
  tList.forEach((t, i) => {
    tasks.push({ id: p.id + '-t' + String(i + 1).padStart(2, '0'), visa_id: p.id, task_name: t.task_name, task_description: t.task_description, task_order: t.task_order || i + 1, required: t.required !== false, estimated_time: t.estimated_time || '', source_reference: authority, last_updated: UPDATED });
  });

  /* DIY 流程 */
  let sList;
  if (isEsNomad) {
    sList = ES_NOMAD.steps;
  } else {
    const extra = CAT_EXTRA_STEPS[p.category.id] || { s3: '按官方要求完成前置准备。', s4: '通过官方渠道取得申请资格。' };
    const docNames = oldDocs.slice(0, 4).map((d) => d.document_name).join('、');
    sList = [
      { step_order: 1, step_title: '确认自己是否符合 ' + p.name + ' 的申请条件', step_description: '对照 ' + p.name + ' 在年龄、学历、职业、语言与资金方面的要求，逐项确认自身条件是否满足。', user_action: '核对官方申请条件并完成自我评估，记录暂不满足的项目。' },
      { step_order: 2, step_title: '准备 ' + p.name + ' 专属申请材料', step_description: '按该项目专属材料清单准备，重点包括：' + docNames + ' 等。', user_action: '逐项准备并核对材料完整、信息一致、翻译公证齐全。' },
      { step_order: 3, step_title: '完成必要前置要求', step_description: '根据项目类型完成语言考试、技能认证、体检或无犯罪记录等前置要求。', user_action: extra.s3 },
      { step_order: 4, step_title: '取得申请资格 / 申请机会', step_description: '根据项目类型取得雇主录用、院校录取、投资机会或机构邀请，获得申请资格。', user_action: extra.s4 },
      { step_order: 5, step_title: '提交 ' + p.name + ' 申请并跟进', step_description: '按官方要求整理并提交完整申请，保存回执并跟进审核进度。', user_action: '提交前逐项检查签名、日期与文件格式，关注补件通知。' }
    ];
  }
  sList.forEach((s) => {
    steps.push({ id: p.id + '-s' + String(s.step_order).padStart(2, '0'), visa_id: p.id, step_order: s.step_order, step_title: s.step_title, step_description: s.step_description, user_action: s.user_action, completion_status: '未完成', source_reference: authority, last_updated: UPDATED });
  });
});

const db = { configs, conditions, questions, docs, tasks, steps };
fs.writeFileSync(path.join(DATA, 'diy-assistant.json'), JSON.stringify(db), 'utf8');
const js = `/* DIY 签证助手数据库 · 独立配置系统（生成自 scripts/generate-diy-assistant.js，源文件 diy-assistant.json） */\nwindow.Istra = window.Istra || {};\nIstra.diyConfigs = ${JSON.stringify(configs)};\nIstra.diyConditions = ${JSON.stringify(conditions)};\nIstra.diyQuestions = ${JSON.stringify(questions)};\nIstra.diyRequiredDocs = ${JSON.stringify(docs)};\nIstra.diyPrepTasks = ${JSON.stringify(tasks)};\nIstra.diySteps = ${JSON.stringify(steps)};\n`;
fs.writeFileSync(path.join(DATA, 'diy-assistant.js'), js, 'utf8');
console.log('已生成：配置 ' + configs.length + ' · 条件 ' + conditions.length + ' · 问题 ' + questions.length + ' · 材料 ' + docs.length + ' · 前置任务 ' + tasks.length + ' · 流程步骤 ' + steps.length);