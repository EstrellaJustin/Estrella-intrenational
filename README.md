# 伊斯特拉国际 · Istra International

> 高端国际身份规划平台 · 全球出国项目智能数据库

网站打开后直接进入「全球出国项目大全」搜索中心：全球国家 × 项目分类，快速定位适合自己的国际发展路径。

---

## 一、如何运行

| 方式 | 操作 |
| --- | --- |
| 最简单 | 双击 `index.html`（零依赖，直接打开） |
| 推荐 | 双击 **`启动网站.bat`**，自动打开 `http://localhost:4173` |
| 命令行 | `node scripts/serve.js`（`--port=8080` 可换端口） |

---

## 二、页面结构（全部独立页面，禁止首页锚点堆叠）

| 页面 | 说明 |
| --- | --- |
| `index.html` | **首页 = 全球出国项目大全**：搜索框（国家 / 职业 / 预算 / 目标方向）+ 十大分类大模块 + 热门国家 |
| `projects.html` | 项目大全：全库筛选（分类 / 子分类 / 国家 / 预算 / 关键词），支持 URL 参数 |
| `countries.html` | 全球国家：50+ 国家浏览 |
| `category.html?cat=xx` | 分类页：一级分类 → 覆盖国家 → 具体项目，支持子分类筛选 |
| `country.html?id=xx` | 国家页：该国全部项目按分类分组 |
| `project-detail.html?id=xx` | 项目详情：咨询报告（9 大模块，含常见问题） |
| `service.html` | 服务咨询：咨询流程 / 服务范围 / 预约表单 |
| `about.html` | 关于我们：品牌介绍 / 三大能力 / 原则 |
| `ai-assessment.html` | AI 评估：国际身份评估中心（Step 01–04） |

导航：首页 / 全球国家 / 项目大全 / AI评估 / 服务咨询 / 关于我们 —— 每个均为独立页面跳转。

---

## 三、全球项目数据库

- **322 个项目** / **53 个国家** / **10 大一级分类 / 38 个子分类**
- 数据源：`src/data/projects.json`（数据库）+ 生成的内嵌 `projects.js`（离线可用）
- 生成器：`scripts/generate-database.js`（`node scripts/generate-database.js` 重新生成）
- 每个项目包含完整字段：`id, country, category, subcategory, name, visaType, budget, duration, introduction, targetUsers, requirements, documents, process, cost, advantages, limitations, faq`（无“暂无资料 / 资料完善中”）

### 十大分类
工作就业类（73）· 技术人才类（32）· 留学教育类（63）· 投资创业类（30）· 人才移民类（20）·
家庭团聚类（18）· 永久居留类（53）· 数字游民类（15）· 青年交流类（10）· 特殊身份类（8）

---

## 四、技术架构

**零依赖 Web Components + CSS Design Tokens + 数据驱动渲染**（深蓝沉浸式主题 v3 延续）。

```
istra-international/
├── index.html / projects.html / countries.html / category.html / country.html
│   project-detail.html / service.html / about.html / ai-assessment.html / coming-soon.html
├── assets/
│   ├── fonts/  # Inter + 思源黑体（自托管）
│   ├── flags/  # 53 国旗帜 SVG
│   ├── brand-mark.svg / favicon.svg
├── scripts/
│   ├── generate-database.js  # 数据库生成器（唯一数据源）
│   └── serve.js              # 零依赖静态服务器
├── src/
│   ├── styles/   # 按组件划分（tokens / base / navbar / home / projects / category /
│   │             # country / countries / project-detail / service / about / ai-assessment / footer）
│   ├── components/  # is-navbar / is-home / is-projects / is-category / is-country /
│   │                # is-countries-browse / is-project-detail / is-service / is-about /
│   │                # is-ai-assessment / is-footer
│   ├── data/       # projects.json（数据库）+ projects.js / countries.js / categories.js
│   │               # brand.js / nav.js / footer.js
│   ├── pages/      # 各页面入口脚本
│   └── utils/      # icons / reveal
```

---

## 五、验收（50/50 通过）

- 9 个页面 HTTP 与 file:// 均可打开，无控制台错误、无横向溢出、全部链接可达
- 数据库：322 项目 / 53 国 / 10 分类，所有项目字段完整
- 首页：搜索（国家/职业/预算/目标）→ 项目大全带参数；分类大模块 → 分类页
- 项目大全：分类 / 子分类 / 国家 / 预算 / 关键词筛选 + URL 参数联动 + 重置
- 分类页：一级分类 → 覆盖国家 → 项目分组，子分类筛选
- 详情页：9 大模块（介绍/人群/条件/材料/流程/费用周期/优势/限制/常见问题），无禁用文案
- 深蓝主题（#041B3A）+ 白底主按钮，保持高级商务质感
