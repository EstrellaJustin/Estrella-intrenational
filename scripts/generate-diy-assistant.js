/* ============================================================
   DIY 签证工作台 · 项目级独立配置生成器（v6）
   精修项目数据位于 scripts/diy-refined-data.js（REFINED）。
   未精修项目标记 data_status=pending，禁止默认模板冒充完整数据。
   用法：node scripts/generate-diy-assistant.js
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { REFINED } = require('./diy-refined-data.js');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const projects = JSON.parse(fs.readFileSync(path.join(DATA, 'projects.json'), 'utf8'));
const VERIFIED = '2026-08-13';
const configs = [], conditions = [], questions = [], rules = [], docs = [], tasks = [], steps = [], officialSources = [];
projects.forEach((p) => {
  const authority = p.official_authority || '目标国家官方移民/签证机构';
  const refined = REFINED[p.id] || null;
  const isComplete = !!refined;
  configs.push({
    id: p.id, visa_project_id: p.id, visa_name: p.name, country: p.country.id,
    official_authority: refined ? refined.config.official_authority : authority,
    official_website: refined ? refined.config.official_website : p.official_website,
    application_url: refined ? refined.config.application_url : p.application_url,
    application_method: refined ? refined.config.application_method : (p.application_method || '通过该国官方移民/签证机构提交申请'),
    source_reference: refined ? refined.config.source_reference : authority,
    last_verified_date: refined ? refined.config.last_verified_date : VERIFIED,
    guide_updated_date: refined ? refined.config.guide_updated_date : VERIFIED,
    data_status: isComplete ? 'complete' : 'pending',
    difficulty: { invest: '高', pr: '中高', talent: '中高', work: '中低' }[p.category.id] || '中',
    preparation_period: { work: '3–12 个月', tech: '3–12 个月', edu: '6–12 个月', invest: '6–18 个月', talent: '6–18 个月', family: '6–18 个月', pr: '12–24 个月', nomad: '1–3 个月', youth: '2–6 个月', special: '3–12 个月' }[p.category.id] || '3–12 个月',
    target_people: (p.targetUsers && p.targetUsers[0]) || '—', visa_type: p.visaType
  });
  officialSources.push({ id: p.id + '-o1', visa_project_id: p.id, source_name: refined ? refined.config.official_authority : authority, source_url: refined ? refined.config.official_website : p.official_website, source_type: '政府官方网站', last_verified_date: VERIFIED });
  if (!isComplete) return;
  const srcRef = refined.config.source_reference;
  refined.conditions.forEach((c, i) => conditions.push({ id: p.id + '-c' + String(i + 1).padStart(2, '0'), visa_id: p.id, condition_name: c.name, condition_description: c.desc, condition_type: c.type, required: c.req, source_reference: srcRef, last_verified_date: VERIFIED }));
  refined.questions.forEach((q, i) => questions.push({ id: p.id + '-q' + String(i + 1).padStart(2, '0'), visa_id: p.id, question: q[0], answer_type: q[1], options: q[2] || '', validation_rule: q[3] || '', condition_type: q[4] || '', depends_on: q[5] || '', depends_value: q[6] || '' }));
  refined.rules.forEach((r, i) => rules.push({ id: p.id + '-r' + String(i + 1).padStart(2, '0'), visa_id: p.id, condition_type: r.condition_type, rule_type: r.rule_type, rule_value: r.rule_value, question_key: r.question_key || '', description: '根据回答自动判定对应条件', last_verified_date: VERIFIED }));
  refined.documents.forEach((d, i) => docs.push({ id: p.id + '-d' + String(i + 1).padStart(2, '0'), visa_id: p.id, document_name: d.name, document_category: d.cat, applicable_to: d.app, description: d.desc, official_requirement: d.off, is_required: d.req, alternative_document: d.alt || '', tips: d.tips || '', source_reference: srcRef, last_verified_date: VERIFIED }));
  refined.tasks.forEach((t, i) => tasks.push({ id: p.id + '-t' + String(i + 1).padStart(2, '0'), visa_id: p.id, task_name: t.name, task_description: t.desc, task_order: i + 1, required: true, estimated_time: t.time || '', why_needed: t.reason || '', official_requirement: t.off || '', completion_criteria: t.done || '', source_reference: srcRef, last_verified_date: VERIFIED }));
  refined.steps.forEach((s, i) => steps.push({ id: p.id + '-s' + String(i + 1).padStart(2, '0'), visa_id: p.id, step_order: i + 1, step_title: s.title, step_description: s.desc, user_action: s.action, completion_criteria: s.criteria || '完成本步骤并核对官方依据。', completion_status: '未完成', source_reference: srcRef, last_verified_date: VERIFIED }));
  officialSources.push({ id: p.id + '-o2', visa_project_id: p.id, source_name: '官方申请页面', source_url: refined.config.application_url, source_type: '官方申请页面', last_verified_date: VERIFIED });
});
const db = { configs, conditions, questions, rules, docs, tasks, steps, officialSources };
fs.writeFileSync(path.join(DATA, 'diy-assistant.json'), JSON.stringify(db), 'utf8');
const js = '/* DIY 签证工作台数据库 · 项目级独立配置（生成自 scripts/generate-diy-assistant.js，源文件 diy-assistant.json） */\nwindow.Istra = window.Istra || {};\nIstra.diyConfigs = ' + JSON.stringify(configs) + ';\nIstra.diyConditions = ' + JSON.stringify(conditions) + ';\nIstra.diyQuestions = ' + JSON.stringify(questions) + ';\nIstra.diyRules = ' + JSON.stringify(rules) + ';\nIstra.diyRequiredDocs = ' + JSON.stringify(docs) + ';\nIstra.diyPrepTasks = ' + JSON.stringify(tasks) + ';\nIstra.diySteps = ' + JSON.stringify(steps) + ';\nIstra.diyOfficialSources = ' + JSON.stringify(officialSources) + ';\n';
fs.writeFileSync(path.join(DATA, 'diy-assistant.js'), js, 'utf8');
console.log('已生成：配置 ' + configs.length + ' · complete ' + configs.filter((c) => c.data_status === 'complete').length + ' · pending ' + configs.filter((c) => c.data_status === 'pending').length + ' · 条件 ' + conditions.length + ' · 问题 ' + questions.length + ' · 规则 ' + rules.length + ' · 材料 ' + docs.length + ' · 前置 ' + tasks.length + ' · 流程 ' + steps.length + ' · 官方来源 ' + officialSources.length);