# 伊斯特拉国际 · Istra International

> 高端国际身份规划平台
> 通过全球出国项目数据库与 AI 智能匹配系统，为个人与家庭提供国际发展方案。

**v3 视觉升级**：深蓝主导沉浸式 UI（90% 深蓝空间 + 10% 白色元素），金色仅少量用于高级标签与重要数字。
功能逻辑与页面结构保持不变。

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
| `projects.html` | 全球项目大全：深蓝透明模块列表（旗帜 + 国家 / 项目 + 签证类型 / 查看详情） | ✅ |
| `project-detail.html?id=xxx` | 项目详情：深蓝咨询报告（Banner + 七大模块 + 关键信息侧栏） | ✅ |
| `ai-assessment.html` | 国际身份评估中心：Step 01–04 + 蓝色进度线 + 深色透明输入框 | ✅ |
| `coming-soon.html` | 各模块占位页（国家浏览 / 联系我们等） | ✅（占位） |

---

## 三、设计系统（v3 · 深蓝主导）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-ink` | `#041B3A` | 深海蓝 · 页面背景 |
| `--color-ink-2` | `#062B55` | 辅助深蓝 · 模块表面 |
| `--color-ink-3` | `#0A3D73` | 高级蓝 · 层级提升 |
| `--color-ink-deep` | `#021326` | 最深蓝 · 页脚 |
| `--color-text-muted` | `#94A3B8` | 辅助灰（正文/次要文字） |
| `--color-accent` | `#C9A227` | 金色（仅高级标签/重要数字/VIP） |
| `--color-blue` | `#3B82F6` | 功能蓝（进度线/焦点/光效） |
| `--color-heading` | `#FFFFFF` | 标题白色 |

规范：
- 主要页面背景全部深蓝；白色仅用于标题、按钮文字、重要信息突出与局部内容区
- 项目模块：透明深蓝 + 边框 `rgba(255,255,255,0.12)`，hover 轻微上移 + 蓝色光效
- 详情模块：背景 `#041B3A` / 模块 `#062B55` 层级 + 细线分割，无白色卡片
- 输入框：深色透明背景 + 白色边框；进度线蓝色；步骤数字白色
- 动效：页面淡入 / hover 浮动 / 背景微光，`0.3–0.5s ease`，无旋转/弹跳

---

## 品牌标识（Logo）

- 图标：极简飞机沿弧线航线飞向金色四角星，寓意「飞向全球，探索新的可能」
- 星星＝全球机遇 / 目标 / 未来；飞机＝国际连接 / 跨境移动 / 全球旅程
- 构成：深蓝底 #041B3A（约 90%）+ 白色主体（约 8%）+ 金色点缀 #C9A227（约 2%）
- 来源：ssets/brand-mark.svg（网站导航 / 页脚 / 浏览器标签 avicon.svg 共用）
- 应用：导航 38px · 页脚 36px · favicon · 移动端图标 · 社交头像（512px 预览见 outputs）

## 四、技术架构

**零依赖 Web Components（原生 Custom Elements）+ CSS Design Tokens + 数据驱动渲染。**（与 v2 一致）

```
istra-international/
├── index.html / projects.html / project-detail.html / ai-assessment.html / coming-soon.html
├── 启动网站.bat / package.json / README.md
├── assets/
│   ├── fonts/            # Inter + 思源黑体（自托管 + fonts.css）
│   ├── flags/            # 国家旗帜 SVG（9 国）
│   ├── brand-mark.svg / favicon.svg
├── src/
│   ├── styles/           # 各组件样式（tokens / base / navbar / hero / services /
│   │                     # philosophy / countries / ai-cta / projects / project-detail /
│   │                     # ai-assessment / footer / coming-soon）
│   ├── components/       # 11 个自定义元素组件
│   ├── data/             # brand / nav / services / countries / projects / footer
│   ├── pages/            # 页面级入口脚本
│   └── utils/            # icons / reveal
└── scripts/serve.js      # 零依赖静态服务器
```

---

## 五、验收（43/43 通过）

- 5 个页面 HTTP 与 file:// 均可打开，无控制台错误、无横向溢出、全部链接可达
- 导航：深蓝透明 → 滚动后深蓝半透明毛玻璃，浅灰白文字
- Hero：全屏深蓝、白色大标题、白底主按钮 + 白边次按钮，无普通图片
- 项目大全：深蓝透明模块、白色细边框、hover 上移 + 蓝色光效
- 项目详情：深蓝 Banner + 深蓝层级模块 + 细线分割，无白色卡片
- AI 评估：蓝色进度线、白色数字、深色透明输入框 + 白色边框
- 全站深蓝白体系：背景 #041B3A / 金色眉题 #C9A227 / 主按钮白底深蓝字

