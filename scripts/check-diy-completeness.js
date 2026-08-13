/* ============================================================
   DIY 项目数据完整度检查
   输出：项目 | 国家 | 条件 | 问题 | 材料 | 前置任务 | 流程 | 官方入口 | 完整度 | 状态
   完整度 = 各核心表实际数据是否齐全（complete 项目）或缺失（pending）
   用法：node scripts/check-diy-completeness.js
   ============================================================ */
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'src', 'data');
const db = JSON.parse(fs.readFileSync(path.join(DATA, 'diy-assistant.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(DATA, 'projects.json'), 'utf8'));
const get = (arr, id) => (arr || []).filter((x) => x.visa_id === id || x.visa_project_id === id);
const rows = db.configs.map((c) => {
  const conds = get(db.conditions, c.id).length;
  const qs = get(db.questions, c.id).length;
  const rls = get(db.rules, c.id).length;
  const docs = get(db.docs, c.id).length;
  const tks = get(db.tasks, c.id).length;
  const sts = get(db.steps, c.id).length;
  const srcs = get(db.officialSources, c.id).length;
  const official = c.official_authority && c.official_website && c.application_url ? 1 : 0;
  const complete = c.data_status === 'complete';
  const score = complete ? 100 : 0;
  const state = c.data_status === 'complete' ? '已完成' : 'DIY数据未完成';
  return { id: c.id, country: c.country, name: c.visa_name, conds, qs, rls, docs, tks, sts, srcs, official, score, state };
});
rows.sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));
console.log('项目 | 国家 | 条件 | 问题 | 规则 | 材料 | 前置任务 | 流程 | 官方来源 | 官方入口 | 完整度 | 状态');
rows.forEach((r) => console.log([r.name, r.country, r.conds, r.qs, r.rls, r.docs, r.tks, r.sts, r.srcs, r.official, r.score + '%', r.state].join(' | ')));
const done = rows.filter((r) => r.state === '已完成').length;
const pending = rows.length - done;
console.log('\n汇总：共 ' + rows.length + ' 个项目 · 已完成 ' + done + ' · DIY数据未完成 ' + pending);