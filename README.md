# 伊斯特拉国际 · Istra International

> 高端全球身份规划与国际发展智能平台
> 通过全球国家数据库、全球项目数据库和 AI 智能分析，帮助用户探索适合自己的国际发展路径。

本仓库为 **第一阶段** 交付：品牌视觉系统、网站基础架构、首页、导航系统。
国家数据库 / 项目数据库 / AI 评估逻辑 / 用户系统 / 后台 / 支付均**不在本阶段范围内**，但架构已为其预留清晰接入点。

---

## 一、如何运行

### 方式 1：直接打开（无需安装）
双击 `index.html` 即可在浏览器中预览首页。

### 方式 2：本地服务器（推荐，体验更完整）
- Windows：双击 **`启动网站.bat`**，浏览器会自动打开 `http://localhost:4173`
- 命令行：`node scripts/serve.js`（可用 `--port=8080` 指定端口，`--no-open` 禁止自动打开）

> 项目为零依赖实现，无需 `npm install`。

---

## 二、页面

| 页面 | 说明 | 状态 |
| --- | --- | --- |
| `index.html` | 首页：Hero / 核心服务 / 品牌理念 / 热门国家 / AI 评估入口 / 页脚 | ✅ 已完成 |
| `coming-soon.html` | 各模块占位页（导航中“全球国家”等链接指向此处） | ✅ 已完成（占位） |

---

## 三、技术架构

**零依赖 Web Components（原生 Custom Elements）+ CSS Design Tokens + 数据驱动渲染。**

```
istra-international/
├── index.html                 # 首页入口
├── coming-soon.html           # 模块占位页
├── 启动网站.bat               # Windows 一键启动
├── package.json               # 脚本元信息（npm start）
├── assets/
│   ├── brand-mark.svg         # 品牌标识（描边版）
│   └── favicon.svg            # 站点图标
├── src/
│   ├── styles/                # 按组件划分的样式
│   │   ├── tokens.css         # ★ 设计系统唯一变量来源
│   │   ├── base.css           # 重置 / 排版 / 按钮 / 工具类
│   │   ├── navbar.css         # 导航
│   │   ├── hero.css           # 首屏
│   │   ├── services.css       # 核心服务
│   │   ├── philosophy.css     # 品牌理念
│   │   ├── countries.css      # 热门国家
│   │   ├── ai-cta.css         # AI 评估入口
│   │   ├── footer.css         # 页脚
│   │   └── coming-soon.css    # 占位页
│   ├── components/            # ★ 组件（每个文件一个自定义元素）
│   │   ├── site-navbar.js     # <is-navbar>
│   │   ├── site-hero.js       # <is-hero>（Canvas 星辰 + 连接线）
│   │   ├── site-services.js   # <is-services> / <is-service-card>
│   │   ├── site-philosophy.js # <is-philosophy>
│   │   ├── site-countries.js  # <is-countries> / <is-country-card>
│   │   ├── site-ai-cta.js     # <is-ai-cta>
│   │   ├── site-footer.js     # <is-footer>
│   │   └── site-coming-soon.js# <is-coming-soon>
│   ├── data/                  # ★ 模拟数据层（未来替换为 API）
│   │   ├── brand.js           # 品牌信息
│   │   ├── nav.js             # 导航配置
│   │   ├── services.js        # 核心服务
│   │   ├── countries.js       # 热门国家（模拟数据）
│   │   └── footer.js          # 页脚配置
│   ├── pages/                 # 页面级入口脚本
│   │   ├── home.js
│   │   └── coming-soon.js
│   └── utils/
│       ├── icons.js           # 抽象线稿图标库
│       └── reveal.js          # 滚动入场动画工具
└── scripts/
    └── serve.js               # 零依赖静态服务器
```

### 设计系统（tokens.css）
| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-ink` | `#071A2B` | 深海蓝 · 主色 |
| `--color-gold` | `#C8A96A` | 香槟金 · 辅助色 |
| `--color-cream` | `#F7F5F0` | 高级米白 · 背景 |
| `--font-sans` / `--font-serif` | 系统字体栈 | 中文无衬线 / 英文衬线点缀 |
| `--section-pad` | `clamp(...)` | 区块留白（响应式） |

所有颜色、字体、间距、圆角、动效均以变量形式定义，修改品牌色只需改动 `tokens.css`。

### 视觉规范
- 大量留白（区块纵向留白 5–8.5rem）
- 高级排版：眉题（`01 · Core Services`）+ 大标题 + 金色细线
- 深海蓝 / 香槟金 / 高级米白三色体系，点缀金色 1px 细线
- 首屏使用 Canvas 星辰呼吸 + 星点连接线 + 大圆弧，营造“全球连接”意象
- **禁用**飞机 / 护照 / 廉价地球等具象图标（图标库全部为抽象线稿）

---

## 四、未来扩展指引（Phase 2+）

| 模块 | 接入点 | 建议方案 |
| --- | --- | --- |
| 国家数据库 | `src/data/countries.js` 字段结构不变，替换数据来源为 API | REST / GraphQL |
| 项目数据库 | 仿照 `services.js` 新增 `src/data/programs.js` + `<is-programs>` 组件 | 同上 |
| AI 智能评估 | `index.html#ai` 入口已就位，新增评估表单组件与逻辑 | 独立服务 / 后端 API |
| 用户系统 / 后台 / 支付 | 本阶段不涉及；架构按前后端分离预留 | Next.js / NestJS 等 |

迁移到 React/Vue/Next.js 时：组件逻辑可直接搬运，`tokens.css` 作为全局设计令牌原样保留，`data/*.js` 改为接口调用即可。

---

## 五、本阶段验收

- [x] 首页正常打开（`index.html` / `http://localhost:4173`）
- [x] 导航正常显示（固定导航 / 透明渐变 / 滚动深色背景 / 移动端抽屉）
- [x] 整体视觉符合高端商务定位（深海蓝 × 香槟金 × 米白）
- [x] 代码结构组件化、数据驱动，方便后续扩展
