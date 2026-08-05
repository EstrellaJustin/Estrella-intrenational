# 伊斯特拉国际 · Istra International

> 高端国际身份规划平台
> 通过全球出国项目数据库与 AI 智能匹配系统，为个人与家庭提供国际发展方案。

**v2 已完成整体 UI 重设计**：深蓝 + 白视觉体系（Inter + 思源黑体），新增「全球项目大全」「项目详情（咨询报告）」「国际身份评估中心」三个页面。功能逻辑与组件架构保持不变。

---

## 一、如何运行

| 方式 | 操作 |
| --- | --- |
| 最简单 | 双击 `index.html`（零依赖，直接打开） |
| 推荐 | 双击 **`启动网站.bat`**，自动打开 `http://localhost:4173` |
| 命令行 | `node scripts/serve.js`（`--port=8080` 可换端口） |

> 字体（Inter / 思源黑体）与国旗均为本地资源，离线可用。

---

## 二、页面

| 页面 | 说明 | 状态 |
| --- | --- | --- |
| `index.html` | 首页：Hero / 核心服务 / 品牌理念 / 热门国家 / AI 评估入口 / 页脚 | ✅ |
| `projects.html` | 全球项目大全：高级列表布局（旗帜 + 国家 / 项目 + 签证类型 / 查看详情） | ✅ |
| `project-detail.html?id=xxx` | 项目详情：咨询报告风格（深蓝报告头 + 七大模块 + 关键信息侧栏） | ✅ |
| `ai-assessment.html` | 国际身份评估中心：Step 01–04 步骤式流程 + 进度条（仅界面） | ✅ |
| `coming-soon.html` | 各模块占位页（国家浏览 / 联系我们等） | ✅（占位） |

---

## 三、设计系统（v2 · 深蓝 + 白）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-ink` | `#061A33` | 深海蓝 · 主色 |
| `--color-ink-2` | `#0B2E59` | 辅助蓝 |
| `--color-bg` | `#F8FAFC` | 页面背景 |
| `--color-heading` | `#0A1628` | 主标题 |
| `--color-text` | `#475569` | 正文 |
| `--color-accent` | `#2563EB` | 强调蓝 |
| `--font-sans` | Inter + 思源黑体 | 标题粗体 / 正文常规 |

规范：圆角 ≤ 8px（按钮 6px）、阴影克制、动效统一 `0.3s ease`、
页面进入淡入、按钮 hover、列表行轻微上浮；**无旋转 / 夸张动画**。
所有变量集中于 `src/styles/tokens.css`。

### 字体
- **Inter**（400/500/600/700）与 **思源黑体 Noto Sans SC**（400/500/700）已自托管于 `assets/fonts/`。
- 思源黑体为按站点当前用字生成的子集（约 384 字）；后续新增文案若含未收录字，将自动回退到系统中文黑体。

---

## 四、技术架构

**零依赖 Web Components（原生 Custom Elements）+ CSS Design Tokens + 数据驱动渲染。**

```
istra-international/
├── index.html / projects.html / project-detail.html / ai-assessment.html / coming-soon.html
├── 启动网站.bat / package.json / README.md
├── assets/
│   ├── fonts/            # Inter + 思源黑体（自托管 + fonts.css）
│   ├── flags/            # 国家旗帜 SVG（9 国）
│   ├── brand-mark.svg / favicon.svg
├── src/
│   ├── styles/           # tokens / base / navbar / hero / services / philosophy /
│   │                     # countries / ai-cta / projects / project-detail /
│   │                     # ai-assessment / footer / coming-soon
│   ├── components/       # is-navbar / is-hero / is-services / is-philosophy /
│   │                     # is-countries / is-ai-cta / is-projects /
│   │                     # is-project-detail / is-ai-assessment / is-footer / is-coming-soon
│   ├── data/             # brand / nav / services / countries / projects / footer（模拟数据）
│   ├── pages/            # 页面级入口脚本
│   └── utils/            # icons / reveal
└── scripts/serve.js      # 零依赖静态服务器
```

- 项目数据：`src/data/projects.js`（10 个项目，含详情模块），列表页与详情页共用。
- 未来接入：将 `data/*.js` 替换为 API 调用即可，组件与字段结构不变。

---

## 五、验收（42/42 通过）

- 5 个页面 HTTP 与 file:// 双击均可打开，无控制台错误、无横向溢出、全部链接可达
- 导航 5 项（首页 / 国家浏览 / 全球项目 / AI评估 / 联系我们），滚动后白色半透明毛玻璃 + 深色文字
- Hero：深蓝背景、中央大标题、立即评估 / 浏览项目、无营销图片
- 项目大全：10 行高级列表（旗帜 / 国家 / 项目 / 签证类型 / 简介 / 查看详情），hover 平滑上浮
- 项目详情：咨询报告七大模块 + 关键信息侧栏，细线分割、无大圆角卡片
- AI 评估中心：四步向导 + 进度条 + 必填校验 + 摘要生成
- 统一深蓝白体系：背景 #F8FAFC / 强调 #2563EB / 圆角 ≤ 8px / 动效 0.3s
