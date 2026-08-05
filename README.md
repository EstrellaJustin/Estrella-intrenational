# 伊斯特拉国际 · Istra International

> 高端国际身份规划平台 · 全球出国项目智能数据库

网站打开后直接进入「全球出国项目大全」：十大一级分类以 **三列矩阵** 展示（PC 3 列 / 平板 2 列 / 手机 1 列）。
每个分类卡片含：分类图标 + 一级分类名称 + 二级分类链接 + 项目数。
点击一级分类 → 分类页；点击二级分类 → 项目列表页；点击项目 → 详情页。
首页唯一任务：让用户找到全球出国项目（无营销模块 / 无热门推荐 / 无 AI 入口按钮）。

---

## 一、如何运行

| 方式 | 操作 |
| --- | --- |
| 最简单 | 双击 `index.html`（零依赖，直接打开） |
| 推荐 | 双击 **`启动网站.bat`**，自动打开 `http://localhost:4173` |
| 命令行 | `node scripts/serve.js`（`--port=8080` 可换端口） |

---

## 二、页面结构（全部独立页面）

| 页面 | 说明 |
| --- | --- |
| `index.html` | **首页 = 全球出国项目大全（三列分类矩阵）**：图标 + 一级分类 + 二级分类 + 项目数；点击卡片进分类页，点击二级分类进项目列表页 |
| `projects.html` | 项目大全：全库筛选（分类 / 子分类 / 国家 / 预算 / 关键词），支持 URL 参数 |
| `countries.html` | 国家浏览：50+ 国家 |
| `category.html?cat=xx` | 分类页：一级分类 → 覆盖国家 → 具体项目 |
| `country.html?id=xx` | 国家页：该国全部项目按分类分组 |
| `project-detail.html?id=xx` | 项目详情：咨询报告（9 大模块，含常见问题） |
| `service.html` | 咨询服务：咨询流程 / 服务范围 / 预约表单 |
| `about.html` | 关于我们 |
| `ai-assessment.html` | AI 评估：国际身份评估中心（Step 01–04） |

导航：首页 / 国家浏览 / 项目大全 / AI评估 / 咨询服务 / 关于我们 —— 全部独立页面跳转。

---

## 三、首页分类体系（一级 + 二级）

| 一级分类 | 二级分类 |
| --- | --- |
| 工作就业 | 高技能工作签证 · 雇主担保 · 技术人才 · 普通就业 · 蓝领就业 |
| 技术人才 | IT人才 · 工程师 · 科研人才 · 医疗人才 · 高学历人才 |
| 留学教育 | 本科 · 硕士 · 博士 · 职业教育 · 语言课程 |
| 投资创业 | 投资移民 · 创业签证 · 企业家项目 · 商业投资 |
| 人才移民 | 杰出人才 · 国家人才计划 · 高端人才项目 |
| 家庭团聚 | 配偶 · 子女 · 父母 |
| 永久居留 | 永居项目 · 长期居留 · 身份转换 |
| 数字游民 | 数字游民签证 · 远程工作 |
| 青年交流 | 工作假期 · 国际交流 |
| 特殊人才 | 艺术人才 · 运动员 · 宗教人士 |

交互：PC 三列 / 平板两列 / 手机单列；点击一级分类卡片 → 分类页；点击卡片内二级分类 → 项目列表页（如「高技能工作签证」→ 美国 H-1B / 德国 EU 蓝卡 / 日本高度人才签证 等 53 个项目）。

---

## 四、全球项目数据库

- **430 个项目 / 53 个国家 / 10 大分类 / 35 个子分类**（每个子分类均有项目）
- 数据源：`src/data/projects.json` + 生成器 `scripts/generate-database.js`
- 每个项目字段完整：`introduction / targetUsers / requirements / documents / process / cost / duration / advantages / limitations / faq`（无“暂无资料/资料完善中”）

---

## 五、技术架构

零依赖 Web Components + CSS Design Tokens + 数据驱动渲染（深蓝沉浸式主题）。

```
istra-international/
├── index.html / projects.html / countries.html / category.html / country.html
│   project-detail.html / service.html / about.html / ai-assessment.html
├── assets/            # fonts（Inter+思源黑体）/ flags（53国）/ brand-mark / favicon
├── scripts/           # generate-database.js（数据库生成器）/ serve.js
├── src/
│   ├── styles/        # tokens / base / navbar / home / projects / category / country /
│   │                  # countries / project-detail / service / about / ai-assessment / footer
│   ├── components/    # is-navbar / is-home / is-projects / is-category / is-country /
│   │                  # is-countries-browse / is-project-detail / is-service / is-about /
│   │                  # is-ai-assessment / is-footer
│   ├── data/          # projects.json + projects.js / countries.js / categories.js / brand / nav / footer
│   ├── pages/         # 页面入口脚本
│   └── utils/         # icons / reveal
```

---

## 六、验收（51/51 通过）

- 9 个页面 HTTP 与 file:// 均可打开，无控制台错误、无横向溢出、链接全可达
- 首页仅保留三列分类矩阵：无搜索/统计/热门国家/AI 入口按钮/营销 Banner
- 三列（PC）/ 两列（平板）/ 单列（手机）；一级分类 → 分类页；二级分类 → 项目列表页（H-1B / EU 蓝卡 / 高度人才等）
- 430 项目 / 53 国 / 10 类 / 35 子类全部完整且有项目
- 筛选（分类/子分类/国家/预算/关键词）+ URL 参数联动 + 重置正常
- 详情页 9 大模块 + FAQ；深蓝主题 #041B3A

