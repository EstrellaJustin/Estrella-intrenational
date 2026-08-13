/* ============================================================
   DIY 工作台 · 精修项目独立配置数据（REFINED）
   每个项目独立：conditions / questions / rules / documents / tasks / steps / config
   数据基于官方公开信息；未列入 REFINED 的项目标记 pending。
   ============================================================ */
module.exports = {
  REFINED: {
    'es-nomad-visa': {
      config: { official_authority: 'Ministerio de Inclusión, Seguridad Social y Migraciones（西班牙包容、社会保障与移民部）', official_website: 'https://www.inclusion.gob.es', application_url: 'https://www.inclusion.gob.es/web/migraciones', application_method: '线上申请（西班牙境内通过移民局线上系统；境外通过西班牙驻外使领馆）', source_reference: 'Ministerio de Inclusión, Seguridad Social y Migraciones', last_verified_date: '2026-08-13', guide_updated_date: '2026-08-13' },
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
        { name: '其他影响情况', type: '其他', desc: '无其他可能影响签证审核的情形。', req: false }
      ],
      questions: [
        ['你的年龄？', 'number', '', 'min:18', '年龄'],
        ['你目前有多少长期客户？', 'text', '', '', '收入', '你当前的身份？', '自由职业者'],
        ['你的客户主要来自哪些国家？', 'text', '', '', '收入', '你当前的身份？', '自由职业者'],
        ['你是否可以提供服务合同？', 'select', '能|暂不能', '', '收入', '你当前的身份？', '自由职业者'],
        ['你的雇主所在国家？', 'text', '', '', '职业', '你当前的身份？', '公司远程员工'],
        ['你的工作合同期限？', 'select', '1年以内|1-3年|3年以上', '', '工作经验', '你当前的身份？', '公司远程员工'],
        ['公司是否允许远程工作？', 'select', '是|否', '', '职业', '你当前的身份？', '公司远程员工'],
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
        { condition_type: '职业', rule_type: 'match', rule_value: '是', question_key: '你的工作是否可以通过远程完成？' },
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
        { name: '有效护照', cat: '身份证明', app: '所有申请人', desc: '护照有效期覆盖停留期并含空白签证页。', off: '有效护照原件及复印件', req: true, alt: '', tips: '确保护照有效期足够长并留有空白页。' },
        { name: '远程工作合同', cat: '职业证明', app: '受雇于境外公司的申请人', desc: '证明受雇于境外公司且工作可远程完成。', off: '劳动合同或雇主证明，注明远程工作性质与期限', req: true, alt: '自由职业合同 / 客户服务协议', tips: '合同需明确远程工作条款。' },
        { name: '收入证明', cat: '财务资金', app: '所有申请人', desc: '证明月收入达到官方门槛。', off: '近 3 个月银行流水及雇主薪资证明', req: true, alt: '税单 / 收入申报表', tips: '流水需连续稳定。' },
        { name: '医疗保险', cat: '健康保险', app: '所有申请人', desc: '覆盖西班牙的私人医疗保险。', off: '在西班牙有效的医疗保险证明', req: true, alt: '', tips: '确认保险覆盖西班牙全境。' },
        { name: '无犯罪记录证明', cat: '背景审查', app: '所有申请人', desc: '近 5 年居住国无犯罪记录。', off: '无犯罪记录证明并完成公证翻译', req: true, alt: '', tips: '证明开具后尽快使用。' },
        { name: '学历或培训证明', cat: '学历职业', app: '以学历满足条件的申请人', desc: '大学学历或职业培训证书。', off: '学历学位或培训证书（或提供 3 年工作经历证明）', req: false, alt: '3 年工作经历证明', tips: '非西班牙语文件需翻译认证。' },
        { name: '工作经历证明', cat: '学历职业', app: '以从业经验满足条件的申请人', desc: '证明相关工作经验年限。', off: '工作经历证明或推荐信', req: false, alt: '学历学位证明', tips: '注明起止时间、职位与职责。' },
        { name: '签证申请表', cat: '身份证明', app: '所有申请人', desc: '官方申请表。', off: '按要求填写并签名', req: true, alt: '', tips: '信息需与护照一致。' }
      ],
      tasks: [
        { name: '确认收入达到门槛', desc: '核对月收入是否达到官方最低标准。', reason: '收入是数字游民签证的核心资格之一。', off: '月收入不低于官方最低标准', done: '准备近 3 个月收入流水并核对金额', time: '1 天' },
        { name: '准备远程工作证明', desc: '向雇主或客户取得远程工作证明。', reason: '证明工作可远程完成且客户主要在国外。', off: '合同/雇主证明注明远程性质', done: '取得盖章的工作证明或合同', time: '1–2 周' },
        { name: '购买医疗保险', desc: '购买覆盖西班牙的私人医疗保险。', reason: '官方要求申请人具备在西班牙有效的健康保障。', off: '覆盖西班牙的私人医疗保险', done: '取得保险单并核对覆盖范围', time: '1–3 天' },
        { name: '办理无犯罪记录并认证', desc: '开具无犯罪记录证明并完成公证翻译。', reason: '官方背景审查需要近 5 年无犯罪记录证明。', off: '近 5 年居住国无犯罪记录', done: '取得证明并完成认证/翻译', time: '2–4 周' },
        { name: '文件翻译与认证', desc: '对合同、学历等文件进行翻译与认证。', reason: '非西班牙语文件需官方认可翻译。', off: '官方认可翻译并附原文', done: '完成全部非西语文件翻译', time: '1–2 周' }
      ],
      steps: [
        { title: '确认资格与收入门槛', desc: '核对年龄、身份、远程工作性质与收入是否满足官方条件。', action: '填写条件确认表单并逐项核对官方要求。', criteria: '资格条件检查整体判定为「符合」或已逐项确认。' },
        { title: '准备远程工作证明', desc: '取得境外雇佣或自由职业的远程工作证明。', action: '联系雇主/客户取得盖章证明。', criteria: '取得盖章的远程工作证明。' },
        { title: '完成前置要求', desc: '完成保险购买、无犯罪记录办理与文件翻译认证。', action: '按前置要求列表逐项完成。', criteria: '前置要求全部标记已完成。' },
        { title: '准备全部申请材料', desc: '按专属材料清单准备护照、收入证明等全部文件。', action: '逐项准备并核对材料一致。', criteria: '申请材料全部标记已完成。' },
        { title: '提交申请', desc: '通过官方渠道（线上系统或驻外使领馆）提交申请。', action: '在线或使领馆提交并保存回执。', criteria: '已提交并取得申请回执。' },
        { title: '等待审核并跟进', desc: '关注审核进度与补件通知，获批后安排入境登记。', action: '定期查询进度并准备入境材料。', criteria: '关注官方进度并完成补件。' }
      ]
    },    'us-work-highskill': {
      config: { official_authority: 'United States Citizenship and Immigration Services (USCIS)', official_website: 'https://www.uscis.gov', application_url: 'https://www.uscis.gov/working-in-the-united-states', application_method: '由美国雇主通过 I-129 表格向 USCIS 提交申请，个人不能直接申请', source_reference: 'USCIS', last_verified_date: '2026-08-13', guide_updated_date: '2026-08-13' },
      conditions: [
        { name: '雇主支持', type: '职业', desc: '需获得美国雇主的正式录用，并由雇主提交 I-129 申请。', req: true },
        { name: '专业职位', type: '职业', desc: '职位需属于需要专业知识的 specialty occupation（专业职位）。', req: true },
        { name: '学历要求', type: '学历', desc: '通常要求学士学位或同等学历/工作经验（3 年经验抵 1 年学历）。', req: true },
        { name: '专业匹配', type: '学历', desc: '申请人学历/经验需与职位专业相关。', req: true },
        { name: '抽签与配额', type: '其他', desc: '受年度配额限制，需参加抽签（H-1B Cap）。', req: true },
        { name: '劳工条件申请', type: '职业', desc: '雇主需完成 LCA（Labor Condition Application）备案。', req: true }
      ],
      questions: [
        ['你的最高学历？', 'select', '大专|本科|硕士|博士', 'match:本科|硕士|博士', '学历'],
        ['你的专业是否与职位相关？', 'select', '是|否', 'match:是', '学历'],
        ['你的相关工作经验年限？', 'select', '无|1-3年|3-5年|5年以上', 'match:3-5年|5年以上', '工作经验'],
        ['你是否已获得美国雇主录用？', 'select', '已有|正在寻找|暂无', 'match:已有', '职业'],
        ['你的职位是否属于专业职位？', 'select', '是|不确定|否', 'match:是', '职业'],
        ['雇主是否同意提交 I-129 并完成 LCA？', 'select', '是|否', 'match:是', '职业'],
        ['你是否持有有效护照？', 'select', '是|否', 'match:是', '其他']
      ],
      rules: [
        { condition_type: '学历', rule_type: 'match', rule_value: '本科|硕士|博士' },
        { condition_type: '学历', rule_type: 'match', rule_value: '是', question_key: '你的专业是否与职位相关？' },
        { condition_type: '工作经验', rule_type: 'match', rule_value: '3-5年|5年以上' },
        { condition_type: '职业', rule_type: 'match', rule_value: '已有', question_key: '你是否已获得美国雇主录用？' },
        { condition_type: '职业', rule_type: 'match', rule_value: '是', question_key: '你的职位是否属于专业职位？' },
        { condition_type: '职业', rule_type: 'match', rule_value: '是', question_key: '雇主是否同意提交 I-129 并完成 LCA？' },
        { condition_type: '其他', rule_type: 'match', rule_value: '是', question_key: '你是否持有有效护照？' }
      ],
      documents: [
        { name: '有效护照', cat: '身份证明', app: '所有申请人', desc: '护照有效期覆盖在美停留期。', off: '有效护照及照片页复印件', req: true, alt: '', tips: '确保护照有效期足够长。' },
        { name: 'I-129 表格', cat: '雇主文件', app: '由雇主提交', desc: '非移民工作签证申请表。', off: '由雇主填写并签名的 I-129', req: true, alt: '', tips: '由雇主/移民律师准备并核对信息。' },
        { name: '劳工条件申请（LCA）', cat: '雇主文件', app: '由雇主提交', desc: '证明工资与工作条件合规。', off: '经劳工部认证的 ETA-9035', req: true, alt: '', tips: '雇主需在提交 I-129 前完成 LCA。' },
        { name: '雇主支持函', cat: '雇主文件', app: '由雇主提交', desc: '说明职位、薪酬与雇佣关系。', off: '雇主出具的职位支持函', req: true, alt: '', tips: '注明职位职责与专业相关性。' },
        { name: '学历学位证明', cat: '学历职业', app: '所有申请人', desc: '证明学士学位或同等学历。', off: '学位证书、成绩单及翻译件', req: true, alt: '工作经验折算证明', tips: '非英文文件需翻译认证。' },
        { name: '工作经历证明', cat: '学历职业', app: '以经验折算学历的申请人', desc: '证明工作经验以折算学历。', off: '在职证明或推荐信', req: false, alt: '', tips: '注明起止时间、职位与职责。' },
        { name: '签证申请表 DS-160', cat: '身份证明', app: '抽签中签后申请签证时', desc: '美国签证在线申请表。', off: 'DS-160 确认页', req: false, alt: '', tips: '中签后预约面签前完成。' }
      ],
      tasks: [
        { name: '取得美国雇主录用', desc: '获得雇主 Offer 并确认愿意担保。', reason: 'H-1B 必须由雇主申请。', off: '正式录用通知', done: '取得盖章 Offer', time: '1–6 个月' },
        { name: '确认职位与专业匹配', desc: '确认职位属于专业职位且学历专业相关。', reason: '专业职位是 H-1B 核心要求。', off: '专业职位标准', done: '完成匹配评估', time: '1–2 周' },
        { name: '雇主完成 LCA 备案', desc: '雇主向劳工部提交并获批 LCA。', reason: '提交 I-129 的前置要求。', off: 'LCA 认证批件', done: '取得 ETA-9035', time: '1–2 周' },
        { name: '准备学历与经历证明', desc: '准备学位、成绩单及翻译认证。', reason: '证明专业资格。', off: '学历证明材料', done: '材料齐备', time: '2–4 周' }
      ],
      steps: [
        { title: '确认资格与配额', desc: '核对学历、专业职位与年度配额，评估中签概率。', action: '完成条件确认与雇主沟通。', criteria: '资格条件整体判定为「符合」。' },
        { title: '雇主完成 LCA 备案', desc: '雇主向劳工部提交 LCA 并获批。', action: '与雇主/律师协调完成 LCA。', criteria: '取得认证 LCA。' },
        { title: '提交 I-129 参加抽签', desc: '在抽签窗口由雇主提交 I-129 申请。', action: '雇主在 3 月窗口提交。', criteria: '提交成功并取得回执。' },
        { title: '中签后准备签证材料', desc: '中签后准备 DS-160、面签材料等。', action: '预约面签并准备材料。', criteria: '完成面签材料。' },
        { title: '面签与入境', desc: '完成面签，获批后以 H-1B 身份入境。', action: '按使领馆要求参加面签。', criteria: '获批并安排入境。' }
      ]
    },
    'de-work-highskill': {
      config: { official_authority: 'Federal Office for Migration and Refugees (BAMF) · Germany', official_website: 'https://www.bamf.de', application_url: 'https://www.bamf.de/EN/Themen/MigrationAufenthalt/migrationAufenthalt-node.html', application_method: '申请人/雇主向德国驻外使领馆或当地外国人管理局提交申请', source_reference: 'BAMF', last_verified_date: '2026-08-13', guide_updated_date: '2026-08-13' },
      conditions: [
        { name: '大学学位', type: '学历', desc: '需持有德国认可的大学学位或同等学历。', req: true },
        { name: '雇佣合同', type: '职业', desc: '需获得德国雇主的工作合同，且年薪达到蓝卡最低标准。', req: true },
        { name: '年薪门槛', type: '收入', desc: '年薪需达到蓝卡最低工资标准（以官方最新标准为准）。', req: true },
        { name: '专业匹配', type: '职业', desc: '职位与专业背景需匹配。', req: true }
      ],
      questions: [
        ['你的最高学历？', 'select', '大专|本科|硕士|博士', 'match:本科|硕士|博士', '学历'],
        ['你的学历是否已认证？', 'select', '已认证|未认证', 'match:已认证', '学历'],
        ['你是否已获得德国雇主合同？', 'select', '已有|正在寻找|暂无', 'match:已有', '职业'],
        ['你的职位是否与专业匹配？', 'select', '是|否', 'match:是', '职业'],
        ['你的年薪（欧元）是否达到门槛？', 'select', '是|否', 'match:是', '收入']
      ],
      rules: [
        { condition_type: '学历', rule_type: 'match', rule_value: '本科|硕士|博士' },
        { condition_type: '学历', rule_type: 'match', rule_value: '已认证', question_key: '你的学历是否已认证？' },
        { condition_type: '职业', rule_type: 'match', rule_value: '已有', question_key: '你是否已获得德国雇主合同？' },
        { condition_type: '职业', rule_type: 'match', rule_value: '是', question_key: '你的职位是否与专业匹配？' },
        { condition_type: '收入', rule_type: 'match', rule_value: '是', question_key: '你的年薪（欧元）是否达到门槛？' }
      ],
      documents: [
        { name: '有效护照', cat: '身份证明', app: '所有申请人', desc: '护照有效期覆盖停留期。', off: '有效护照及复印件', req: true, alt: '', tips: '注意有效期。' },
        { name: '学历学位认证', cat: '学历职业', app: '所有申请人', desc: '德国认可的学历认证（Anabin 或 ZAB）。', off: '学历认证报告', req: true, alt: '', tips: '提前完成认证。' },
        { name: '雇佣合同', cat: '雇主文件', app: '所有申请人', desc: '德国雇主合同，注明职位与年薪。', off: '劳动合同及雇主说明', req: true, alt: '', tips: '合同需达到蓝卡收入门槛。' },
        { name: '工资证明', cat: '财务资金', app: '所有申请人', desc: '证明年薪达到门槛。', off: '薪资证明或合同条款', req: true, alt: '', tips: '核对最低年薪。' },
        { name: '签证申请表', cat: '身份证明', app: '所有申请人', desc: '德国长期居留签证申请表。', off: '完整填写的申请表', req: true, alt: '', tips: '如实填写。' }
      ],
      tasks: [
        { name: '完成学历认证', desc: '通过 ZAB/Anabin 完成学历认证。', reason: '蓝卡要求德国认可学位。', off: '学历认证报告', done: '取得认证', time: '2–8 周' },
        { name: '取得德国雇主合同', desc: '获得达到年薪门槛的工作合同。', reason: '蓝卡必须由雇主雇佣。', off: '劳动合同', done: '取得合同', time: '1–6 个月' },
        { name: '准备翻译公证', desc: '对学历、合同等文件翻译公证。', reason: '提交材料要求。', off: '翻译公证文件', done: '文件齐备', time: '1–2 周' }
      ],
      steps: [
        { title: '确认资格与年薪', desc: '核对学历认证与年薪门槛。', action: '完成条件确认。', criteria: '整体判定符合。' },
        { title: '完成学历认证', desc: '通过 ZAB/Anabin 完成认证。', action: '提交认证申请。', criteria: '取得认证报告。' },
        { title: '取得雇主合同', desc: '获得达到门槛的雇佣合同。', action: '与雇主签订合同。', criteria: '合同年薪达标。' },
        { title: '提交签证申请', desc: '向德国驻外使领馆提交蓝卡签证申请。', action: '预约并提交材料。', criteria: '提交成功。' },
        { title: '入境与登记', desc: '获批后入境并办理居留登记。', action: '领取蓝卡居留许可。', criteria: '完成登记。' }
      ]
    },
    'jp-work-highskill': {
      config: { official_authority: 'Immigration Services Agency of Japan (ISA)', official_website: 'https://www.isa.go.jp', application_url: 'https://www.isa.go.jp/en/', application_method: '通过日本地方出入国在留管理局提交申请（积分制）', source_reference: 'Immigration Services Agency of Japan', last_verified_date: '2026-08-13', guide_updated_date: '2026-08-13' },
      conditions: [
        { name: '积分达到标准', type: '其他', desc: '高度人才积分表需达到 70 分以上（学历/经历/收入/年龄等）。', req: true },
        { name: '在留活动', type: '职业', desc: '从事高度专门职业（研究/技术/经营管理等）。', req: true },
        { name: '收入水平', type: '收入', desc: '年收入需达到相应积分档位要求。', req: true },
        { name: '学历或经历', type: '学历', desc: '学历、工作经验或研究成果可获积分。', req: true }
      ],
      questions: [
        ['你的最高学历？', 'select', '本科|硕士|博士', 'match:本科|硕士|博士', '学历'],
        ['你的相关工作经验年限？', 'select', '3年以下|3-5年|5-10年|10年以上', 'match:5-10年|10年以上', '工作经验'],
        ['你的预计年收入（日元）？', 'number', '', 'min:4000000', '收入'],
        ['你的在留活动类型？', 'select', '高级学术研究|高级专门技术|高级经营管理', 'match:高级学术研究|高级专门技术|高级经营管理', '职业'],
        ['你是否有日本雇主/机构接收？', 'select', '是|否', 'match:是', '职业'],
        ['你的年龄？', 'number', '', 'min:18', '其他']
      ],
      rules: [
        { condition_type: '学历', rule_type: 'match', rule_value: '本科|硕士|博士' },
        { condition_type: '工作经验', rule_type: 'match', rule_value: '5-10年|10年以上' },
        { condition_type: '收入', rule_type: 'min', rule_value: '4000000' },
        { condition_type: '职业', rule_type: 'match', rule_value: '高级学术研究|高级专门技术|高级经营管理' },
        { condition_type: '职业', rule_type: 'match', rule_value: '是', question_key: '你是否有日本雇主/机构接收？' },
        { condition_type: '其他', rule_type: 'min', rule_value: '18' }
      ],
      documents: [
        { name: '有效护照', cat: '身份证明', app: '所有申请人', desc: '护照有效期覆盖在留期。', off: '有效护照', req: true, alt: '', tips: '注意有效期。' },
        { name: '高度人才积分表', cat: '其他', app: '所有申请人', desc: '自评积分表。', off: '高度专门职积分表及佐证', req: true, alt: '', tips: '逐项对照积分标准。' },
        { name: '学历学位证明', cat: '学历职业', app: '以学历积分', desc: '学位证书。', off: '学位证及翻译件', req: true, alt: '', tips: '加分项需佐证。' },
        { name: '工作经历证明', cat: '学历职业', app: '以经历积分', desc: '证明工作经验年限。', off: '在职证明/推荐信', req: false, alt: '', tips: '注明起止时间。' },
        { name: '收入证明', cat: '财务资金', app: '所有申请人', desc: '证明年收入水平。', off: '录用通知书/薪资证明', req: true, alt: '', tips: '年薪需达到档位。' },
        { name: '在留资格认定申请书', cat: '身份证明', app: '所有申请人', desc: '官方申请表。', off: '在留资格认定申请书', req: true, alt: '', tips: '由接收机构协助提交。' }
      ],
      tasks: [
        { name: '完成积分自评', desc: '按积分表计算自己的积分。', reason: '积分决定是否符合高度人才标准。', off: '积分表', done: '积分达到 70 分', time: '1–3 天' },
        { name: '取得日本接收机构', desc: '获得日本雇主/研究机构接收。', reason: '在留活动需要接收单位。', off: '录用/接收证明', done: '取得接收证明', time: '1–6 个月' },
        { name: '准备积分佐证材料', desc: '学历、经历、收入等佐证。', reason: '积分需要证明材料支持。', off: '佐证材料', done: '材料齐备', time: '2–4 周' }
      ],
      steps: [
        { title: '积分自评', desc: '计算高度人才积分。', action: '完成自评并确认达到 70 分。', criteria: '积分达标。' },
        { title: '取得接收机构', desc: '获得日本雇主或研究机构接收。', action: '协商录用并取得证明。', criteria: '取得接收证明。' },
        { title: '准备积分佐证', desc: '准备学历、经历、收入等佐证。', action: '逐项整理。', criteria: '佐证齐备。' },
        { title: '提交在留资格认定申请', desc: '通过接收机构向出入国在留管理局提交。', action: '提交申请。', criteria: '提交成功。' },
        { title: '换发签证并入境', desc: '获批后换发签证并入境。', action: '完成入境与在留登记。', criteria: '完成登记。' }
      ]
    },
    'au-work-skilled': {
      config: { official_authority: 'Department of Home Affairs of Australia', official_website: 'https://immi.homeaffairs.gov.au', application_url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189', application_method: '通过 SkillSelect 系统提交 EOI，获邀请后在线申请', source_reference: 'Department of Home Affairs', last_verified_date: '2026-08-13', guide_updated_date: '2026-08-13' },
      conditions: [
        { name: '年龄要求', type: '年龄', desc: '申请时年龄需在 45 周岁以下。', req: true },
        { name: '职业评估', type: '职业', desc: '职业需在技术移民职业清单上并通过职业评估。', req: true },
        { name: '语言要求', type: '语言', desc: '英语需达到雅思 4 个 6 或同等水平（Competent）。', req: true },
        { name: 'EOI 分数', type: '其他', desc: 'SkillSelect EOI 打分需达到邀请分数（以官方邀请为准）。', req: true },
        { name: '工作经验', type: '工作经验', desc: '相关工作经验可加分（视清单要求）。', req: false }
      ],
      questions: [
        ['你的年龄？', 'number', '', 'min:18|max:44', '年龄'],
        ['你的职业是否在技术移民清单上？', 'select', '是|否|不确定', 'match:是', '职业'],
        ['你是否已完成职业评估？', 'select', '已完成|未完成', 'match:已完成', '职业'],
        ['你的英语水平（雅思）？', 'select', '低于6|6|7|8', 'match:6|7|8', '语言'],
        ['你的相关工作经验年限？', 'select', '无|1-3年|3-5年|5-8年|8年以上', 'match:3-5年|5-8年|8年以上', '工作经验'],
        ['你的最高学历？', 'select', '大专|本科|硕士|博士', 'match:本科|硕士|博士', '学历']
      ],
      rules: [
        { condition_type: '年龄', rule_type: 'min', rule_value: '18' },
        { condition_type: '年龄', rule_type: 'max', rule_value: '44' },
        { condition_type: '职业', rule_type: 'match', rule_value: '是' },
        { condition_type: '职业', rule_type: 'match', rule_value: '已完成', question_key: '你是否已完成职业评估？' },
        { condition_type: '语言', rule_type: 'match', rule_value: '6|7|8' },
        { condition_type: '工作经验', rule_type: 'match', rule_value: '3-5年|5-8年|8年以上' },
        { condition_type: '学历', rule_type: 'match', rule_value: '本科|硕士|博士' }
      ],
      documents: [
        { name: '有效护照', cat: '身份证明', app: '所有申请人', desc: '护照有效期覆盖申请期。', off: '有效护照', req: true, alt: '', tips: '注意有效期。' },
        { name: '职业评估函', cat: '学历职业', app: '所有申请人', desc: '指定评估机构出具的职业评估结果。', off: '职业评估函', req: true, alt: '', tips: '确认评估机构有效。' },
        { name: '英语成绩单', cat: '语言能力', app: '所有申请人', desc: '雅思/PTE 等认可语言成绩。', off: '语言成绩单', req: true, alt: '', tips: '成绩需在有效期内。' },
        { name: '学历学位证明', cat: '学历职业', app: '以学历加分', desc: '学位证书及认证。', off: '学位证及翻译', req: false, alt: '', tips: '加分项需佐证。' },
        { name: '工作经历证明', cat: '学历职业', app: '以经历加分', desc: '证明相关工作年限。', off: '在职证明/推荐信', req: false, alt: '', tips: '注明起止时间。' },
        { name: '无犯罪记录证明', cat: '背景审查', app: '所有申请人', desc: '近 10 年居住国无犯罪记录。', off: '无犯罪记录证明', req: true, alt: '', tips: '按官方要求公证翻译。' }
      ],
      tasks: [
        { name: '完成职业评估', desc: '通过指定机构完成职业评估。', reason: '技术移民前置要求。', off: '职业评估函', done: '评估通过', time: '2–8 周' },
        { name: '完成英语考试', desc: '取得认可语言成绩。', reason: '语言是评分与资格基础。', off: '语言成绩单', done: '达到 Competent', time: '1–3 个月' },
        { name: '完成 EOI 打分', desc: '在 SkillSelect 提交 EOI。', reason: '等待官方邀请。', off: 'EOI 提交', done: '提交并等待邀请', time: '1–2 周' }
      ],
      steps: [
        { title: '确认职业与评估', desc: '确认职业在清单并完成职业评估。', action: '完成评估。', criteria: '评估通过。' },
        { title: '完成语言考试', desc: '取得认可英语成绩。', action: '报名并考试。', criteria: '达到 Competent。' },
        { title: '提交 EOI', desc: '在 SkillSelect 提交意向。', action: '填写 EOI 并等待邀请。', criteria: '提交成功。' },
        { title: '获邀后提交签证申请', desc: '收到邀请后在线提交 189/190 申请。', action: '上传全部材料。', criteria: '提交成功。' },
        { title: '等待审核与获批', desc: '配合补件，获批后安排登陆。', action: '关注进度。', criteria: '获批。' }
      ]
    },
    'ca-pr-apply': {
      config: { official_authority: 'Immigration, Refugees and Citizenship Canada (IRCC)', official_website: 'https://www.canada.ca/en/immigration-refugees-citizenship.html', application_url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html', application_method: '通过 Express Entry 系统提交档案，获 ITA 后在线申请', source_reference: 'IRCC', last_verified_date: '2026-08-13', guide_updated_date: '2026-08-13' },
      conditions: [
        { name: '年龄要求', type: '年龄', desc: '通常要求 18 岁以上（20–29 岁评分最高）。', req: true },
        { name: '语言要求', type: '语言', desc: '需达到 CLB 7 或以上（雅思 G 类 4 个 6）。', req: true },
        { name: '工作经验', type: '工作经验', desc: '需至少 1 年符合 NOC TEER 类别的带薪工作经验。', req: true },
        { name: '学历要求', type: '学历', desc: '通常要求高中以上学历，学历越高 CRS 加分越多。', req: true },
        { name: '学历认证（ECA）', type: '学历', desc: '海外学历需通过指定机构完成 ECA 认证。', req: true },
        { name: '资金要求', type: '资金', desc: '需满足最低安家资金要求（视家庭人数）。', req: true }
      ],
      questions: [
        ['你的年龄？', 'number', '', 'min:18', '年龄'],
        ['你的英语水平（CLB）？', 'select', '低于7|CLB7|CLB8|CLB9及以上', 'match:CLB7|CLB8|CLB9及以上', '语言'],
        ['你的最高学历？', 'select', '高中|大专|本科|硕士|博士', 'match:大专|本科|硕士|博士', '学历'],
        ['你是否已完成 ECA 学历认证？', 'select', '已完成|未完成', 'match:已完成', '学历'],
        ['你的相关工作经验年限？', 'select', '无|1-2年|3年以上', 'match:1-2年|3年以上', '工作经验'],
        ['你是否有足够安家资金？', 'select', '是|否', 'match:是', '资金'],
        ['你是否符合至少一个 EE 项目？', 'select', '是|否', 'match:是', '其他']
      ],
      rules: [
        { condition_type: '年龄', rule_type: 'min', rule_value: '18' },
        { condition_type: '语言', rule_type: 'match', rule_value: 'CLB7|CLB8|CLB9及以上' },
        { condition_type: '学历', rule_type: 'match', rule_value: '大专|本科|硕士|博士' },
        { condition_type: '学历', rule_type: 'match', rule_value: '已完成', question_key: '你是否已完成 ECA 学历认证？' },
        { condition_type: '工作经验', rule_type: 'match', rule_value: '1-2年|3年以上' },
        { condition_type: '资金', rule_type: 'match', rule_value: '是' },
        { condition_type: '其他', rule_type: 'match', rule_value: '是', question_key: '你是否符合至少一个 EE 项目？' }
      ],
      documents: [
        { name: '有效护照', cat: '身份证明', app: '所有申请人', desc: '护照有效期覆盖申请期。', off: '有效护照', req: true, alt: '', tips: '注意有效期。' },
        { name: 'ECA 学历认证报告', cat: '学历职业', app: '海外学历申请人', desc: '指定机构（WES 等）出具的学历认证。', off: 'ECA 报告', req: true, alt: '', tips: '提前办理，耗时较长。' },
        { name: '语言成绩单', cat: '语言能力', app: '所有申请人', desc: '雅思/思培等认可成绩。', off: '语言成绩单', req: true, alt: '', tips: '成绩有效期内。' },
        { name: '工作经历证明', cat: '学历职业', app: '所有申请人', desc: '符合 NOC 类别的工作证明。', off: '在职证明/推荐信', req: true, alt: '', tips: '注明职责与 NOC 代码。' },
        { name: '安家资金证明', cat: '财务资金', app: '所有申请人', desc: '证明满足最低资金要求。', off: '银行存款证明', req: true, alt: '', tips: '核对家庭人数标准。' },
        { name: '无犯罪记录证明', cat: '背景审查', app: '所有申请人', desc: '18 岁后居住超 6 个月国家的无犯罪证明。', off: '无犯罪记录证明', req: true, alt: '', tips: '按官方要求办理。' },
        { name: '体检证明', cat: '健康检查', app: '所有申请人', desc: '指定医生完成体检。', off: '体检报告', req: true, alt: '', tips: '使用 IRCC 指定医生。' }
      ],
      tasks: [
        { name: '完成语言考试', desc: '取得 CLB 7 以上成绩。', reason: 'EE 入池基本要求。', off: '语言成绩单', done: '达到 CLB 7', time: '1–3 个月' },
        { name: '完成 ECA 学历认证', desc: '通过 WES 等完成海外学历认证。', reason: 'EE 入池基本要求。', off: 'ECA 报告', done: '取得认证', time: '4–8 周' },
        { name: '完成安家资金证明', desc: '准备存款证明。', reason: '证明安家能力。', off: '资金证明', done: '资金达标', time: '1–2 周' },
        { name: '提交 EE 档案', desc: '在 IRCC 系统创建档案。', reason: '进入候选人池等待邀请。', off: 'EE 档案', done: '档案生效', time: '1–2 周' }
      ],
      steps: [
        { title: '入池前准备', desc: '完成语言、ECA、资金等前置要求。', action: '逐项完成。', criteria: '前置要求完成。' },
        { title: '提交 EE 档案', desc: '创建 Express Entry 档案。', action: '填写并提交。', criteria: '档案生效。' },
        { title: '等待 ITA', desc: '等待官方邀请。', action: '更新 CRS 分数。', criteria: '收到 ITA。' },
        { title: '提交永居申请', desc: '收到 ITA 后 60 天内提交申请。', action: '上传全部材料。', criteria: '提交成功。' },
        { title: '审核与获批', desc: '配合补件与体检，获批后登陆。', action: '关注进度。', criteria: '获批。' }
      ]
    },
    'gb-edu-master': {
      config: { official_authority: 'UK Visas and Immigration (UKVI)', official_website: 'https://www.gov.uk/government/organisations/uk-visas-and-immigration', application_url: 'https://www.gov.uk/student-visa', application_method: '取得学校 CAS 后在线申请学生签证', source_reference: 'UKVI', last_verified_date: '2026-08-13', guide_updated_date: '2026-08-13' },
      conditions: [
        { name: '院校录取', type: '职业', desc: '需获得受担保院校的录取（CAS）。', req: true },
        { name: '资金证明', type: '资金', desc: '需证明可支付学费与生活费用（伦敦与非伦敦标准不同）。', req: true },
        { name: '语言要求', type: '语言', desc: '需满足院校与签证的英语要求（B2 以上）。', req: true },
        { name: '学历要求', type: '学历', desc: '硕士项目通常要求本科学位。', req: true }
      ],
      questions: [
        ['你的最高学历？', 'select', '大专|本科|硕士', 'match:本科|硕士', '学历'],
        ['你是否已获得院校录取（CAS）？', 'select', '已获得|申请中|未申请', 'match:已获得', '职业'],
        ['你的英语水平（雅思）？', 'select', '低于5.5|5.5-6.0|6.0-6.5|7.0及以上', 'match:6.0-6.5|7.0及以上', '语言'],
        ['你的资金是否足以覆盖学费与生活费？', 'select', '是|否', 'match:是', '资金'],
        ['你是否有足够资金证明？', 'select', '是|否', 'match:是', '资金']
      ],
      rules: [
        { condition_type: '学历', rule_type: 'match', rule_value: '本科|硕士' },
        { condition_type: '职业', rule_type: 'match', rule_value: '已获得', question_key: '你是否已获得院校录取（CAS）？' },
        { condition_type: '语言', rule_type: 'match', rule_value: '6.0-6.5|7.0及以上' },
        { condition_type: '资金', rule_type: 'match', rule_value: '是' }
      ],
      documents: [
        { name: '有效护照', cat: '身份证明', app: '所有申请人', desc: '护照有效期覆盖课程期。', off: '有效护照', req: true, alt: '', tips: '注意有效期。' },
        { name: 'CAS 确认函', cat: '学校文件', app: '所有申请人', desc: '学校签发的录取确认函。', off: 'CAS 号码及函件', req: true, alt: '', tips: 'CAS 需在有效期内。' },
        { name: '资金证明', cat: '财务资金', app: '所有申请人', desc: '覆盖学费与生活费的存款证明。', off: '银行存款证明（28 天）', req: true, alt: '', tips: '存款需存满 28 天。' },
        { name: '学历学位与成绩单', cat: '学历职业', app: '所有申请人', desc: '证明满足硕士录取要求。', off: '学位证、成绩单及翻译', req: true, alt: '', tips: '翻译认证。' },
        { name: '语言成绩单', cat: '语言能力', app: '所有申请人', desc: 'UKVI 认可的语言成绩。', off: '雅思/PTE 成绩单', req: true, alt: '', tips: '确认认可类型。' },
        { name: '肺结核检查证明', cat: '健康检查', app: '指定国家申请人', desc: '指定诊所出具的检查证明。', off: 'TB 检查证明', req: true, alt: '', tips: '预约指定诊所。' }
      ],
      tasks: [
        { name: '取得院校录取与 CAS', desc: '完成申请并获得 CAS。', reason: '学生签证必须由担保院校支持。', off: 'CAS', done: '取得 CAS', time: '1–6 个月' },
        { name: '完成语言考试', desc: '取得认可语言成绩。', reason: '满足院校与签证要求。', off: '语言成绩单', done: '达到 B2', time: '1–3 个月' },
        { name: '准备资金证明', desc: '存款满 28 天并开具证明。', reason: '证明可负担学费生活费。', off: '资金证明', done: '资金达标', time: '1 个月' },
        { name: '完成 TB 检查', desc: '预约指定诊所完成检查。', reason: '签证申请要求。', off: 'TB 证明', done: '取得证明', time: '1–2 周' }
      ],
      steps: [
        { title: '获得录取与 CAS', desc: '完成申请并取得 CAS。', action: '确认 CAS 信息。', criteria: '取得 CAS。' },
        { title: '完成前置要求', desc: '语言、资金、TB 检查。', action: '逐项完成。', criteria: '前置完成。' },
        { title: '在线提交学生签证申请', desc: '在 UKVI 系统提交并缴费。', action: '填写申请表。', criteria: '提交成功。' },
        { title: '预约并完成生物信息采集', desc: '前往签证中心采集指纹照片。', action: '预约面签。', criteria: '完成采集。' },
        { title: '等待审核与入境', desc: '获批后领取签证并入境。', action: '关注进度。', criteria: '获批。' }
      ]
    },
    'us-invest-immigration': {
      config: { official_authority: 'United States Citizenship and Immigration Services (USCIS)', official_website: 'https://www.uscis.gov', application_url: 'https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-fifth-preference-eb-5', application_method: '通过区域中心或直接投资向 USCIS 提交 I-526 申请', source_reference: 'USCIS', last_verified_date: '2026-08-13', guide_updated_date: '2026-08-13' },
      conditions: [
        { name: '投资金额', type: '资金', desc: '投资额需达到目标就业区（TEA）80 万美元或普通区 105 万美元（以官方最新标准为准）。', req: true },
        { name: '资金来源合法', type: '资金', desc: '需证明投资资金来源合法。', req: true },
        { name: '就业创造', type: '职业', desc: '投资需创造至少 10 个全职工作岗位（直接或间接）。', req: true },
        { name: '投资处于风险中', type: '其他', desc: '投资需处于风险状态（非保本安排）。', req: true }
      ],
      questions: [
        ['你的可投资金额（美元）？', 'select', '80万以下|80-105万|105万以上', 'match:80-105万|105万以上', '资金'],
        ['你的资金来源是否可完整证明？', 'select', '是|否', 'match:是', '资金'],
        ['你是否了解就业创造要求？', 'select', '是|否', 'match:是', '职业'],
        ['你是否有投资/商业计划？', 'select', '有|无', 'match:有', '职业']
      ],
      rules: [
        { condition_type: '资金', rule_type: 'match', rule_value: '80-105万|105万以上' },
        { condition_type: '资金', rule_type: 'match', rule_value: '是', question_key: '你的资金来源是否可完整证明？' },
        { condition_type: '职业', rule_type: 'match', rule_value: '是', question_key: '你是否了解就业创造要求？' },
        { condition_type: '职业', rule_type: 'match', rule_value: '有', question_key: '你是否有投资/商业计划？' }
      ],
      documents: [
        { name: '有效护照', cat: '身份证明', app: '所有申请人', desc: '护照有效期覆盖申请期。', off: '有效护照', req: true, alt: '', tips: '注意有效期。' },
        { name: '资金来源证明', cat: '财务资金', app: '所有申请人', desc: '证明投资资金合法来源。', off: '银行流水、税务、资产文件', req: true, alt: '', tips: '资金路径清晰。' },
        { name: '投资文件', cat: '商业文件', app: '所有申请人', desc: '认购协议或投资合同。', off: '认购协议/投资协议', req: true, alt: '', tips: '确认项目文件合规。' },
        { name: '商业计划书', cat: '商业文件', app: '直接投资申请人', desc: '说明投资与就业创造计划。', off: '商业计划书', req: true, alt: '', tips: '包含就业模型。' },
        { name: '无犯罪记录证明', cat: '背景审查', app: '所有申请人', desc: '近 5 年居住国无犯罪记录。', off: '无犯罪记录证明', req: true, alt: '', tips: '公证翻译。' },
        { name: '体检证明', cat: '健康检查', app: '所有申请人', desc: '移民体检。', off: '体检报告', req: true, alt: '', tips: '指定医生。' }
      ],
      tasks: [
        { name: '确认投资金额与区域', desc: '确认投资额与 TEA 资格。', reason: '金额与区域决定门槛。', off: '项目文件', done: '确认门槛', time: '1–2 周' },
        { name: '完成资金来源梳理', desc: '整理完整资金来源证明。', reason: 'USCIS 严格审查资金来源。', off: '资金来源文件', done: '文件齐备', time: '2–6 周' },
        { name: '选择项目并签署认购', desc: '选择区域中心项目并签署文件。', reason: '投资需处于风险中。', off: '认购协议', done: '完成认购', time: '2–4 周' }
      ],
      steps: [
        { title: '评估资金与资格', desc: '确认投资额、来源与风险安排。', action: '完成条件确认。', criteria: '整体符合。' },
        { title: '选择项目并投资', desc: '选择合规项目并完成投资。', action: '签署认购并转账。', criteria: '投资完成。' },
        { title: '提交 I-526', desc: '向 USCIS 提交投资移民申请。', action: '提交申请。', criteria: '提交成功。' },
        { title: '等待审批与排期', desc: '等待 I-526 审批与签证排期。', action: '关注进度。', criteria: '获批。' },
        { title: '申请签证并入境', desc: '获批后申请移民签证并入境。', action: '领事程序。', criteria: '取得签证。' }
      ]
    },
    'us-family-spouse': {
      config: { official_authority: 'United States Citizenship and Immigration Services (USCIS)', official_website: 'https://www.uscis.gov', application_url: 'https://www.uscis.gov/family/family-of-us-citizens', application_method: '由美国公民/绿卡持有人为配偶提交 I-130 申请', source_reference: 'USCIS', last_verified_date: '2026-08-13', guide_updated_date: '2026-08-13' },
      conditions: [
        { name: '担保人身份', type: '其他', desc: '担保人需为美国公民或合法永久居民。', req: true },
        { name: '婚姻真实', type: '其他', desc: '需证明婚姻关系真实。', req: true },
        { name: '担保人收入', type: '收入', desc: '担保人收入需达到联邦贫困线 125%（I-864）。', req: true },
        { name: '关系证明', type: '其他', desc: '需提供结婚证与共同生活证明。', req: true }
      ],
      questions: [
        ['你的担保人身份？', 'select', '美国公民|绿卡持有人|其他', 'match:美国公民|绿卡持有人', '其他'],
        ['你是否持有结婚证？', 'select', '是|否', 'match:是', '其他'],
        ['担保人收入是否达标？', 'select', '是|否|不确定', 'match:是', '收入'],
        ['你能否提供共同生活证明？', 'select', '能|暂不能', 'match:能', '其他']
      ],
      rules: [
        { condition_type: '其他', rule_type: 'match', rule_value: '美国公民|绿卡持有人', question_key: '你的担保人身份？' },
        { condition_type: '其他', rule_type: 'match', rule_value: '是', question_key: '你是否持有结婚证？' },
        { condition_type: '收入', rule_type: 'match', rule_value: '是', question_key: '担保人收入是否达标？' },
        { condition_type: '其他', rule_type: 'match', rule_value: '能', question_key: '你能否提供共同生活证明？' }
      ],
      documents: [
        { name: 'I-130 表格', cat: '身份证明', app: '担保人提交', desc: '亲属移民申请表格。', off: 'I-130 及缴费凭证', req: true, alt: '', tips: '由担保人提交。' },
        { name: '结婚证', cat: '身份证明', app: '所有申请人', desc: '证明婚姻关系。', off: '结婚证及翻译', req: true, alt: '', tips: '公证翻译。' },
        { name: '担保人身份证明', cat: '身份证明', app: '担保人', desc: '公民纸或绿卡。', off: '公民纸/绿卡复印件', req: true, alt: '', tips: '' },
        { name: 'I-864 经济担保书', cat: '财务资金', app: '担保人', desc: '证明收入达到贫困线 125%。', off: 'I-864 及税单', req: true, alt: '', tips: '附近三年税单。' },
        { name: '共同生活证明', cat: '其他', app: '所有申请人', desc: '证明婚姻真实。', off: '合照、通讯、联名账单', req: false, alt: '', tips: '越多越好。' },
        { name: '无犯罪记录证明', cat: '背景审查', app: '申请人', desc: '申请人近 5 年居住国无犯罪记录。', off: '无犯罪记录证明', req: true, alt: '', tips: '公证翻译。' }
      ],
      tasks: [
        { name: '确认担保人资格', desc: '确认担保人身份与收入达标。', reason: '担保资格是前提。', off: '身份与税单', done: '资格确认', time: '1–2 周' },
        { name: '准备婚姻关系证明', desc: '结婚证与共同生活证明。', reason: '证明婚姻真实。', off: '关系证明材料', done: '材料齐备', time: '2–4 周' },
        { name: '准备担保书 I-864', desc: '担保人填写并附税单。', reason: '证明经济能力。', off: 'I-864', done: '完成填写', time: '1–2 周' }
      ],
      steps: [
        { title: '确认担保资格', desc: '确认担保人身份与收入。', action: '完成条件确认。', criteria: '整体符合。' },
        { title: '提交 I-130', desc: '担保人提交亲属移民申请。', action: '提交 I-130。', criteria: '提交成功。' },
        { title: '准备担保与关系材料', desc: '准备 I-864 与关系证明。', action: '逐项准备。', criteria: '材料齐备。' },
        { title: '等待排期与领事程序', desc: '等待排期并完成面签。', action: '关注进度。', criteria: '面签完成。' },
        { title: '获批并入境', desc: '获批后入境并办理绿卡。', action: '完成入境。', criteria: '取得身份。' }
      ]
    },
    'pt-nomad-visa': {
      config: { official_authority: 'AIMA · Agência para a Integração, Migrações e Asilo (Portugal)', official_website: 'https://aima.gov.pt', application_url: 'https://aima.gov.pt', application_method: '通过葡萄牙驻外使领馆或 AIMA 提交申请', source_reference: 'AIMA', last_verified_date: '2026-08-13', guide_updated_date: '2026-08-13' },
      conditions: [
        { name: '收入要求', type: '收入', desc: '月收入需达到葡萄牙最低工资的 4 倍（约 3,300 欧元/月，以官方最新标准为准）。', req: true },
        { name: '远程工作', type: '职业', desc: '需证明可远程工作（受雇于境外公司或自由职业）。', req: true },
        { name: '无犯罪记录', type: '其他', desc: '近 5 年居住国无犯罪记录。', req: true },
        { name: '医疗保险', type: '其他', desc: '需有覆盖葡萄牙的医疗保险。', req: true }
      ],
      questions: [
        ['你的月收入（欧元）？', 'number', '', 'min:3300', '收入'],
        ['你的工作是否可以远程完成？', 'select', '是|否', 'match:是', '职业'],
        ['你的工作类型？', 'select', '受雇于境外公司|自由职业|混合', 'match:受雇于境外公司|自由职业', '职业'],
        ['你是否有犯罪记录？', 'select', '无|有', 'match:无', '其他'],
        ['你是否已购买医疗保险？', 'select', '已购买|未购买', 'match:已购买', '其他']
      ],
      rules: [
        { condition_type: '收入', rule_type: 'min', rule_value: '3300' },
        { condition_type: '职业', rule_type: 'match', rule_value: '是', question_key: '你的工作是否可以远程完成？' },
        { condition_type: '职业', rule_type: 'match', rule_value: '受雇于境外公司|自由职业', question_key: '你的工作类型？' },
        { condition_type: '其他', rule_type: 'match', rule_value: '无', question_key: '你是否有犯罪记录？' },
        { condition_type: '其他', rule_type: 'match', rule_value: '已购买', question_key: '你是否已购买医疗保险？' }
      ],
      documents: [
        { name: '有效护照', cat: '身份证明', app: '所有申请人', desc: '护照有效期覆盖停留期。', off: '有效护照', req: true, alt: '', tips: '注意有效期。' },
        { name: '远程工作证明', cat: '职业证明', app: '所有申请人', desc: '证明工作可远程完成。', off: '劳动合同/自由职业合同', req: true, alt: '', tips: '注明远程性质。' },
        { name: '收入证明', cat: '财务资金', app: '所有申请人', desc: '证明月收入达标。', off: '近 3 个月银行流水', req: true, alt: '税单', tips: '折算欧元核对。' },
        { name: '医疗保险', cat: '健康保险', app: '所有申请人', desc: '覆盖葡萄牙的保险。', off: '保险单', req: true, alt: '', tips: '确认覆盖范围。' },
        { name: '无犯罪记录证明', cat: '背景审查', app: '所有申请人', desc: '近 5 年无犯罪记录。', off: '无犯罪记录证明', req: true, alt: '', tips: '公证翻译。' },
        { name: '住宿证明', cat: '其他', app: '所有申请人', desc: '葡萄牙住宿安排。', off: '租房合同/住宿预订', req: false, alt: '', tips: '' }
      ],
      tasks: [
        { name: '确认收入达标', desc: '核对月收入达到 4 倍最低工资。', reason: '收入是核心资格。', off: '收入标准', done: '收入达标', time: '1 天' },
        { name: '准备远程工作证明', desc: '取得雇主或客户证明。', reason: '证明远程工作性质。', off: '远程工作证明', done: '取得证明', time: '1–2 周' },
        { name: '购买医疗保险', desc: '购买覆盖葡萄牙的保险。', reason: '官方要求健康保障。', off: '保险单', done: '保险生效', time: '1–3 天' },
        { name: '办理无犯罪记录', desc: '开具证明并公证翻译。', reason: '背景审查要求。', off: '无犯罪记录证明', done: '取得证明', time: '2–4 周' }
      ],
      steps: [
        { title: '确认资格与收入', desc: '核对收入与远程工作条件。', action: '完成条件确认。', criteria: '整体符合。' },
        { title: '完成前置要求', desc: '保险、无犯罪记录等。', action: '逐项完成。', criteria: '前置完成。' },
        { title: '准备申请材料', desc: '按材料清单准备。', action: '逐项准备。', criteria: '材料齐备。' },
        { title: '提交申请', desc: '通过使领馆或 AIMA 提交。', action: '提交并保存回执。', criteria: '提交成功。' },
        { title: '跟进审核与入境', desc: '关注进度并安排入境登记。', action: '关注补件通知。', criteria: '获批。' }
      ]
    }
  }
};
