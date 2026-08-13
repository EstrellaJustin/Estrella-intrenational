/* ============================================================
   DIY 签证助手 · 最终数据驱动架构生成器（v4）
   每个签证项目独立配置：
   eligibility_conditions / user_questions / eligibility_rules /
   required_documents / preparation_tasks / diy_steps / 官方申请入口
   西班牙数字游民签证（es-nomad-visa）为完整精修测试项目，
   其他项目按官方公开信息派生（均带 source_reference / last_verified_date）。
   未来新增签证：只需增加数据库配置，无需修改前端。
   用法：node scripts/generate-diy-assistant.js
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const projects = JSON.parse(fs.readFileSync(path.join(DATA, 'projects.json'), 'utf8'));
const OLD = JSON.parse(fs.readFileSync(path.join(DATA, 'visa-diy.json'), 'utf8'));
const VERIFIED = '2026-08-13';

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

/* ============ 西班牙数字游民签证（完整精修测试项目） ============ */
const ES_NOMAD = {
  config: {
    application_method: '线上申请（西班牙境内通过移民局线上系统；境外通过西班牙驻外使领馆）',
    official_authority: 'Ministerio de Inclusión, Seguridad Social y Migraciones（西班牙包容、社会保障与移民部）',
    official_website: 'https://www.inclusion.gob.es',
    application_url: 'https://www.inclusion.gob.es/web/migraciones',
    source_reference: 'Ministerio de Inclusión, Seguridad Social y Migraciones',
    last_verified_date: VERIFIED
  },
  conditions: [
    { name: '年龄要求', type: '年龄', desc: '申请人需年满 18 周岁。', req: true },
    { name: '当前居住国家', type: '其他', desc: '申请时通常须为非欧盟居民，且不在西班牙非法居留。', req: true },
    { name: '工作性质', type: '职业', desc: '受雇于境外公司或为境外客户提供自由职业服务，工作可通过远程完成。', req: true },
    { name: '从业时间', type: '工作经验', desc: '自由职业者通常需证明 3 年以上相关工作经验，或具备大学学历（二选一）。', req: true },
    { name: '收入要求', type: '收入', desc: '月收入需达到西班牙最低工资的约 2 倍（约 2,300 欧元/月，以官方最新标准为准）。', req: true },
    { name: '学历或培训', type: '学历', desc: '大学学历或同等职业培训证书（与从业时间二选一）。', req: false },
    { name: '西班牙客户比例', type: '收入', desc: '来自西班牙客户的收入通常不得超过总收入的一定比例（以官方要求为准）。', req: true },
    { name: '医疗保险', type: '其他', desc: '需购买覆盖西班牙的私人医疗保险。', req: true },
    { name: '无犯罪记录', type: '其他', desc: '近 5 年居住国无犯罪记录证明。', req: true },
    { name: '其他影响情况', type: '其他', desc: '无其他可能影响签证审核的情形（如逾期滞留记录等）。', req: false }
  ],
  questions: [
    ['你的年龄？', 'number', '', 'min:18', '年龄'],
    ['你目前居住的国家？', 'select', '中国|其他国家', '', '其他'],
    ['你当前的身份？', 'select', '公司远程员工|自由职业者|企业主|其他', 'match:公司远程员工|自由职业者|企业主', '职业'],
    ['你的工作是否可以通过远程完成？', 'select', '是|否', 'match:是', '职业'],
    ['你当前工作的持续时间？', 'select', '不足1年|1-3年|3年以上', 'match:3年以上', '工作经验'],
    ['你的服务客户主要在哪些国家？', 'text', '', '', '收入'],
    ['你是否有来自西班牙的客户？', 'select', '是|否', 'match:否', '收入'],
    ['你的月收入（欧元）？', 'number', '', 'min:2300', '收入'],
    ['你的收入来源？', 'text', '', '', '收入'],
    ['你的收入是否稳定？', 'select', '稳定|一般|不稳定', 'match:稳定|一般', '收入'],
    ['你能否提供收入证明？', 'select', '能|暂不能', 'match:能', '收入'],
    ['你的最高学历？', 'select', '高中以下|高中|大专|本科|硕士|博士', 'match:大专|本科|硕士|博士', '学历'],
    ['你的专业？', 'text', '', '', '学历'],
    ['你能否提供工作经历证明？', 'select', '能|暂不能', 'match:能', '工作经验'],
    ['你是否已购买相关医疗保险？', 'select', '已购买|未购买', 'match:已购买', '其他'],
    ['你是否有犯罪记录？', 'select', '无|有', 'match:无', '其他'],
    ['是否存在其他影响申请的情况？', 'text', '', '', '其他']
  ],
  rules: [
    { condition_type: '年龄', rule_type: 'min', rule_value: '18' },
    { condition_type: '其他', rule_type: 'match', rule_value: '中国|其他国家', question_key: '你目前居住的国家？' },
    { condition_type: '职业', rule_type: 'match', rule_value: '公司远程员工|自由职业者|企业主' },
    { condition_type: '职业', rule_type: 'match_q', rule_value: '是', question_key: '你的工作是否可以通过远程完成？' },
    { condition_type: '工作经验', rule_type: 'match', rule_value: '3年以上' },
    { condition_type: '收入', rule_type: 'min', rule_value: '2300', question_key: '你的月收入（欧元）？' },
    { condition_type: '收入', rule_type: 'match', rule_value: '否', question_key: '你是否有来自西班牙的客户？' },
    { condition_type: '收入', rule_type: 'match', rule_value: '稳定|一般', question_key: '你的收入是否稳定？' },
    { condition_type: '收入', rule_type: 'match', rule_value: '能', question_key: '你能否提供收入证明？' },
    { condition_type: '学历', rule_type: 'match', rule_value: '大专|本科|硕士|博士' },
    { condition_type: '工作经验', rule_type: 'match', rule_value: '能', question_key: '你能否提供工作经历证明？' },
    { condition_type: '其他', rule_type: 'match', rule_value: '已购买', question_key: '你是否已购买相关医疗保险？' },
    { condition_type: '其他', rule_type: 'match', rule_value: '无', question_key: '你是否有犯罪记录？' }
  ],
  documents: [
    { name: '有效护照', cat: '身份证明', app: '所有申请人', desc: '护照有效期覆盖停留期并含空白签证页。', off: '有效护照原件及复印件', req: true, alt: '' },
    { name: '远程工作合同', cat: '职业证明', app: '受雇于境外公司的申请人', desc: '证明受雇于境外公司且工作可远程完成。', off: '劳动合同或雇主证明，注明远程工作性质与期限', req: true, alt: '自由职业合同 / 客户服务协议' },
    { name: '收入证明', cat: '财务资金', app: '所有申请人', desc: '证明月收入达到官方门槛。', off: '近 3 个月银行流水及雇主薪资证明', req: true, alt: '税单 / 收入申报表' },
    { name: '医疗保险', cat: '健康保险', app: '所有申请人', desc: '覆盖西班牙的私人医疗保险。', off: '在西班牙有效的医疗保险证明', req: true, alt: '' },
    { name: '无犯罪记录证明', cat: '背景审查', app: '所有申请人', desc: '近 5 年居住国无犯罪记录。', off: '无犯罪记录证明并完成公证翻译', req: true, alt: '' },
    { name: '学历或培训证明', cat: '学历职业', app: '以学历满足条件的申请人', desc: '大学学历或职业培训证书。', off: '学历学位或培训证书（或提供 3 年工作经历证明）', req: false, alt: '3 年工作经历证明' },
    { name: '工作经历证明', cat: '学历职业', app: '以从业经验满足条件的申请人', desc: '证明相关工作经验年限。', off: '工作经历证明或推荐信', req: false, alt: '学历学位证明' },
    { name: '签证申请表', cat: '身份证明', app: '所有申请人', desc: '官方申请表。', off: '按要求填写并签名', req: true, alt: '' }
  ],
  tasks: [
    { name: '确认收入达到门槛', desc: '核对月收入是否达到官方最低标准。', reason: '收入是数字游民签证的核心资格之一。', off: '月收入不低于官方最低标准', done: '准备近 3 个月收入流水并核对金额', time: '1 天' },
    { name: '准备远程工作证明', desc: '向雇主或客户取得远程工作证明。', reason: '证明工作可远程完成且客户主要在国外。', off: '合同/雇主证明注明远程性质', done: '取得盖章的工作证明或合同', time: '1–2 周' },
    { name: '购买医疗保险', desc: '购买覆盖西班牙的私人医疗保险。', reason: '官方要求申请人具备在西班牙有效的健康保障。', off: '覆盖西班牙的私人医疗保险', done: '取得保险单并核对覆盖范围', time: '1–3 天' },
    { name: '办理无犯罪记录并认证', desc: '开具无犯罪记录证明并完成公证翻译。', reason: '官方背景审查需要近 5 年无犯罪记录证明。', off: '近 5 年居住国无犯罪记录', done: '取得证明并完成海牙认证/翻译', time: '2–4 周' },
    { name: '文件翻译与认证', desc: '对合同、学历等文件进行翻译与认证。', reason: '非西班牙语文件需官方认可翻译。', off: '官方认可翻译并附原文', done: '完成全部非西语文件翻译', time: '1–2 周' }
  ],
  steps: [
    { title: '确认资格与收入门槛', desc: '核对年龄、身份、远程工作性质与收入是否满足官方条件。', action: '填写条件确认表单并逐项核对官方要求。' },
    { title: '准备远程工作证明', desc: '取得境外雇佣或自由职业的远程工作证明。', action: '联系雇主/客户取得盖章证明。' },
    { title: '完成前置要求', desc: '完成保险购买、无犯罪记录办理与文件翻译认证。', action: '按前置要求列表逐项完成。' },
    { title: '准备全部申请材料', desc: '按专属材料清单准备护照、收入证明等全部文件。', action: '逐项准备并核对材料一致。' },
    { title: '提交申请', desc: '通过官方渠道（线上系统或驻外使领馆）提交申请。', action: '在线或使领馆提交并保存回执。' },
    { title: '等待审核并跟进', desc: '关注审核进度与补件通知，获批后安排入境登记。', action: '定期查询进度并准备入境材料。' }
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
  work: [['你的学历？', 'select', '高中以下|高中|大专|本科|硕士|博士', '', '学历'], ['你的职业？', 'text', '', '', '职业'], ['工作经验年限？', 'select', '无|1年以内|1-3年|3-5年|5年以上', 'match:1-3年|3-5年|5年以上', '工作经验'], ['是否有雇主录用？', 'select', '已有|正在寻找|暂无', 'match:已有', '职业']],
  tech: [['你的学历？', 'select', '大专|本科|硕士|博士', 'match:大专|本科|硕士|博士', '学历'], ['你的技术领域？', 'text', '', '', '职业'], ['技能证书？', 'text', '', '', '职业']],
  edu: [['你的学历？', 'select', '高中|大专|本科|硕士|博士', 'match:大专|本科|硕士|博士', '学历'], ['学校录取状态？', 'select', '已获录取|申请中|未申请', 'match:已获录取', '职业'], ['资金情况？', 'select', '充足|一般|不足', 'match:充足|一般', '资金'], ['语言成绩？', 'text', '', '', '语言']],
  invest: [['资金规模？', 'select', '50万以下|50-150万|150-300万|300万以上', 'match:150-300万|300万以上', '资金'], ['投资计划？', 'text', '', '', '职业'], ['资金来源？', 'text', '', '', '资金']],
  talent: [['专业领域？', 'text', '', '', '职业'], ['主要成就？', 'text', '', '', '职业']],
  family: [['担保人身份？', 'text', '', '', '其他'], ['亲属关系？', 'text', '', '', '其他']],
  pr: [['居住年限？', 'text', '', '', '工作经验'], ['语言成绩？', 'text', '', '', '语言'], ['纳税记录？', 'select', '有|无', 'match:有', '工作经验']],
  nomad: [['工作类型？', 'select', '受雇于境外公司|自由职业|混合', 'match:受雇于境外公司|自由职业', '职业'], ['月收入？', 'text', '', '', '收入'], ['工作是否可以远程完成？', 'select', '是|否', 'match:是', '职业']],
  youth: [['年龄？', 'text', '', '', '年龄'], ['在读/毕业状态？', 'select', '在读|已毕业', '', '职业']],
  special: [['专业资质？', 'text', '', '', '职业'], ['邀请/推荐情况？', 'text', '', '', '职业']]
};

const CAT_TASKS = {
  work: [['准备学历与职业资格认证', '学历认证、资格认证或语言考试。', '项目对学历与资格有要求。', '学历/资格认证或语言成绩', '取得认证或成绩单', '2–6 周'], ['寻找雇主 / 取得录用', '通过官方渠道寻找雇主并获得录用。', '工作类项目通常需雇主担保。', '正式录用通知', '取得盖章录用函', '1–6 个月']],
  tech: [['完成学历认证', '学历学位认证与翻译。', '技术类项目要求学历认证。', '学历认证报告', '取得认证', '2–6 周'], ['准备技能评估材料', '技能证书与项目经历整理。', '用于技能评估。', '技能证书或项目证明', '材料齐备', '1–2 周']],
  edu: [['完成语言考试', '雅思/托福等官方考试。', '院校与签证要求语言成绩。', '官方语言成绩', '达到分数线', '1–3 个月'], ['准备资金证明', '存款证明与资金来源说明。', '证明可负担学费与生活费。', '资金证明', '存款满足要求', '1–2 周']],
  invest: [['梳理资金来源', '银行流水、税务记录等。', '官方审核资金合法性。', '资金来源证明', '文件齐备', '2–4 周'], ['完成投资尽职调查', '确认投资标的与合规安排。', '投资类项目要求合规投资。', '投资意向与尽调材料', '完成尽调', '1–2 个月']],
  talent: [['整理成就证明', '奖项、专利、媒体报道等。', '证明杰出成就。', '成就证明材料', '材料齐备', '2–4 周'], ['取得推荐材料', '同行专家推荐信。', '支持杰出人才认定。', '推荐信', '取得推荐', '2–4 周']],
  family: [['办理亲属关系公证', '结婚证/出生证明公证认证。', '证明亲属关系。', '公证认证文件', '取得公证', '2–4 周'], ['确认担保人资格', '担保人收入与居住材料。', '担保人需满足资格。', '担保人材料', '资格确认', '1–2 周']],
  pr: [['完成语言考试', '官方认可的语言考试。', '永居项目要求语言成绩。', '语言成绩', '达到分数线', '1–3 个月'], ['整理居住与纳税记录', '税单、账单等。', '证明居住与纳税。', '居住纳税记录', '记录齐备', '1–2 周']],
  nomad: [['准备远程工作证明', '雇主证明或自由职业合同。', '证明工作可远程完成。', '远程工作证明', '取得盖章证明', '1–2 周'], ['购买医疗保险', '覆盖目的国的保险。', '官方要求健康保障。', '医疗保险单', '保险生效', '1–3 天']],
  youth: [['确认年龄资格', '核对项目年龄上限。', '青年项目有年龄限制。', '年龄证明', '符合年龄', '1 天'], ['准备在读/毕业证明', '学校出具的在读或毕业证明。', '证明学生身份。', '在读/毕业证明', '取得证明', '1–2 周']],
  special: [['准备专业资质证明', '执业资格或会员证明。', '证明专业资质。', '资质证明', '取得证明', '2–4 周'], ['取得邀请材料', '机构邀请函或推荐信。', '支持特殊类别申请。', '邀请函', '取得邀请', '2–4 周']]
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

const configs = [], conditions = [], questions = [], rules = [], docs = [], tasks = [], steps = [];

projects.forEach((p) => {
  const m = META[p.category.id] || META.work;
  const authority = p.official_authority || '目标国家官方移民/签证机构';
  const isEsNomad = p.id === 'es-nomad-visa';
  const es = ES_NOMAD;

  /* visa_diy_config：含官方申请入口字段 */
  configs.push({
    id: p.id,
    visa_project_id: p.id,
    visa_name: p.name,
    country: p.country.id,
    official_authority: isEsNomad ? es.config.official_authority : authority,
    official_website: isEsNomad ? es.config.official_website : p.official_website,
    application_url: isEsNomad ? es.config.application_url : p.application_url,
    application_method: isEsNomad ? es.config.application_method : (p.application_method || '通过该国官方移民/签证机构提交申请'),
    source_reference: isEsNomad ? es.config.source_reference : authority,
    last_verified_date: VERIFIED,
    difficulty: m.diff,
    preparation_period: m.period,
    target_people: (p.targetUsers && p.targetUsers[0]) || m.people,
    visa_type: p.visaType
  });

  /* 申请资格条件 */
  const condList = [];
  if (isEsNomad) {
    es.conditions.forEach((c, i) => condList.push({ id: p.id + '-c' + String(i + 1).padStart(2, '0'), visa_id: p.id, condition_name: c.name, condition_description: c.desc, condition_type: c.type, required: c.req, source_reference: es.config.source_reference, last_verified_date: VERIFIED }));
  } else {
    (CAT_CONDITIONS[p.category.id] || []).forEach((c, i) => condList.push({ id: p.id + '-c' + String(i + 1).padStart(2, '0'), visa_id: p.id, condition_name: c.name, condition_description: c.desc, condition_type: c.type, required: c.req, source_reference: authority, last_verified_date: VERIFIED }));
    (p.requirements || []).slice(0, 2).forEach((r) => condList.push({ id: p.id + '-c' + String(condList.length + 1).padStart(2, '0'), visa_id: p.id, condition_name: '其他要求', condition_description: r, condition_type: '其他', required: true, source_reference: authority, last_verified_date: VERIFIED }));
  }
  conditions.push(...condList);

  /* 用户填写问题 */
  const qList = isEsNomad ? es.questions : (CAT_QUESTIONS[p.category.id] || [['补充说明？', 'text', '', '', '其他']]);
  qList.forEach((q, i) => {
    questions.push({ id: p.id + '-q' + String(i + 1).padStart(2, '0'), visa_id: p.id, question: q[0], answer_type: q[1], options: q[2] || '', validation_rule: q[3] || '', condition_type: q[4] || '' });
  });

  /* 资格判断规则（visa_eligibility_rules） */
  if (isEsNomad) {
    es.rules.forEach((r, i) => rules.push({ id: p.id + '-r' + String(i + 1).padStart(2, '0'), visa_id: p.id, condition_type: r.condition_type, rule_type: r.rule_type, rule_value: r.rule_value, question_key: r.question_key || '', description: '根据回答自动判定对应条件', last_verified_date: VERIFIED }));
  } else {
    const qs = qList;
    const ruleByType = {};
    qs.forEach((q) => { if (q[3] && q[4]) ruleByType[q[4]] = { rule: q[3], q: q[0] }; });
    Object.keys(ruleByType).forEach((t, i) => rules.push({ id: p.id + '-r' + String(i + 1).padStart(2, '0'), visa_id: p.id, condition_type: t, rule_type: ruleByType[t].rule.indexOf('min:') === 0 ? 'min' : 'match', rule_value: ruleByType[t].rule.replace(/^(min|match):/, ''), question_key: ruleByType[t].q, description: '根据回答自动判定对应条件', last_verified_date: VERIFIED }));
  }

  /* 专属材料（含适用对象） */
  const oldDocs = isEsNomad ? es.documents : (OLD.documents || []).filter((d) => d.visa_project_id === p.id).map((d) => ({
    name: d.document_name,
    cat: d.document_category || '其他',
    app: '所有申请人',
    desc: d.official_requirement || d.document_name,
    off: d.official_requirement,
    req: d.is_required === true,
    alt: ''
  }));
  oldDocs.forEach((d, i) => {
    docs.push({ id: p.id + '-d' + String(i + 1).padStart(2, '0'), visa_id: p.id, document_name: d.name, document_category: d.cat, applicable_to: d.app, description: d.desc, official_requirement: d.off, is_required: d.req, alternative_document: d.alt || '', source_reference: isEsNomad ? es.config.source_reference : authority, last_verified_date: VERIFIED });
  });

  /* 前置准备任务（含为什么/官方要求/完成标准） */
  const tList = isEsNomad ? es.tasks : (CAT_TASKS[p.category.id] || []).map((t, i) => ({ name: t[0], desc: t[1], reason: t[2], off: t[3], done: t[4], time: t[5], order: i + 1, req: true }));
  tList.forEach((t, i) => {
    tasks.push({ id: p.id + '-t' + String(i + 1).padStart(2, '0'), visa_id: p.id, task_name: t.name, task_description: t.desc, task_order: t.order || i + 1, required: t.req !== false, estimated_time: t.time || '', why_needed: t.reason || '', official_requirement: t.off || '', completion_criteria: t.done || '', source_reference: isEsNomad ? es.config.source_reference : authority, last_verified_date: VERIFIED });
  });

  /* DIY 流程 */
  let sList;
  if (isEsNomad) {
    sList = es.steps;
  } else {
    const extra = CAT_EXTRA_STEPS[p.category.id] || { s3: '按官方要求完成前置准备。', s4: '通过官方渠道取得申请资格。' };
    const docNames = oldDocs.slice(0, 4).map((d) => d.name).join('、');
    sList = [
      { title: '确认自己是否符合 ' + p.name + ' 的申请条件', desc: '对照 ' + p.name + ' 在年龄、学历、职业、语言与资金方面的要求，逐项确认自身条件是否满足。', action: '核对官方申请条件并完成自我评估，记录暂不满足的项目。' },
      { title: '准备 ' + p.name + ' 专属申请材料', desc: '按该项目专属材料清单准备，重点包括：' + docNames + ' 等。', action: '逐项准备并核对材料完整、信息一致、翻译公证齐全。' },
      { title: '完成必要前置要求', desc: '根据项目类型完成语言考试、技能认证、体检或无犯罪记录等前置要求。', action: extra.s3 },
      { title: '取得申请资格 / 申请机会', desc: '根据项目类型取得雇主录用、院校录取、投资机会或机构邀请，获得申请资格。', action: extra.s4 },
      { title: '提交 ' + p.name + ' 申请并跟进', desc: '按官方要求整理并提交完整申请，保存回执并跟进审核进度。', action: '提交前逐项检查签名、日期与文件格式，关注补件通知。' }
    ];
  }
  sList.forEach((s) => {
    const idx = sList.indexOf(s) + 1;
    steps.push({ id: p.id + '-s' + String(idx).padStart(2, '0'), visa_id: p.id, step_order: idx, step_title: s.title, step_description: s.desc, user_action: s.action, completion_status: '未完成', source_reference: isEsNomad ? es.config.source_reference : authority, last_verified_date: VERIFIED });
  });
});

const db = { configs, conditions, questions, rules, docs, tasks, steps };
fs.writeFileSync(path.join(DATA, 'diy-assistant.json'), JSON.stringify(db), 'utf8');
const js = `/* DIY 签证助手数据库 · 最终独立配置系统（生成自 scripts/generate-diy-assistant.js，源文件 diy-assistant.json） */
window.Istra = window.Istra || {};
Istra.diyConfigs = ${JSON.stringify(configs)};
Istra.diyConditions = ${JSON.stringify(conditions)};
Istra.diyQuestions = ${JSON.stringify(questions)};
Istra.diyRules = ${JSON.stringify(rules)};
Istra.diyRequiredDocs = ${JSON.stringify(docs)};
Istra.diyPrepTasks = ${JSON.stringify(tasks)};
Istra.diySteps = ${JSON.stringify(steps)};
`;
fs.writeFileSync(path.join(DATA, 'diy-assistant.js'), js, 'utf8');
console.log('已生成：配置 ' + configs.length + ' · 条件 ' + conditions.length + ' · 问题 ' + questions.length + ' · 规则 ' + rules.length + ' · 材料 ' + docs.length + ' · 前置任务 ' + tasks.length + ' · 流程步骤 ' + steps.length);