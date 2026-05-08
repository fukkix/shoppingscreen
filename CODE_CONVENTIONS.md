# 代码规范 (Code Conventions)

为了保证项目的可维护性、可读性和统一性，所有开发者在此项目中需遵循以下规范。

## 1. 总体原则 (General Principles)
- **代码整洁**：代码需保持整洁、易读，去除无用的注释和 `console.log`。
- **职责单一**：每个文件、函数应尽量保持单一职责（SRP），分离结构（HTML）、表现（CSS）、行为（JS）。
- **组件化**：将复杂的 UI 或逻辑拆分为可复用的模块。

## 2. HTML 规范 (HTML Conventions)
- **语义化**：优先使用语义化的 HTML5 标签 (如 `<header>`, `<main>`, `<section>`, `<footer>`)。
- **缩进**：使用 2 个空格进行缩进。
- **属性引号**：HTML 属性值统一使用双引号 `""`。
- **ID & Class**：
  - `id` 应在全局唯一，多用于标识页面核心容器或为 JS 提供挂载点。
  - `class` 用于样式定义，采用小写字母连字符命名法（kebab-case），如 `.panel-container`。
  - 避免过度嵌套结构。

## 3. CSS 规范 (CSS Conventions)
- **预处理/后处理**：本项目使用 Vanilla CSS。
- **命名规范**：遵循 BEM（Block Element Modifier）风格的变体，确保类名具有描述性，如 `.chart-card`, `.chart-card__title`, `.chart-card--active`。
- **主题和变量**：
  - 将所有颜色、字体大小、间距等设计系统 Token 提取为 CSS 变量（CSS Custom Properties），置于 `:root` 或特定的主题类下，如 `--color-primary`, `--bg-dark-navy`。
  - 严禁在代码中直接写死颜色值，必须使用定义好的 CSS 变量，以保证“深藏青与琥珀金”主题的一致性。
- **特效**：对于玻璃拟态（Glassmorphism）、发光（Bloom）等效果，应抽象为可复用的公共类，例如 `.glass-panel`。

## 4. JavaScript 规范 (JavaScript Conventions)
- **模块化**：全面使用 ES Modules (`import`/`export`)。
- **变量声明**：优先使用 `const`，需要修改的变量使用 `let`，禁止使用 `var`。
- **命名规范**：
  - 变量和函数使用小驼峰命名法（camelCase），如 `initChart`, `userData`。
  - 类名和构造函数使用大驼峰命名法（PascalCase），如 `DataManager`。
  - 常量使用全大写下划线命名法（UPPER_SNAKE_CASE），如 `MAX_RETRY_COUNT`。
- **箭头函数**：回调函数和匿名函数优先使用箭头函数 `() => {}`。
- **图表逻辑**：
  - ECharts 的实例化和配置逻辑应按照图表类型抽离到独立的文件中（如 `line-chart.js`, `radar-chart.js`）。
  - 图表数据应与配置项解耦，方便后续对接真实 API。
- **格式化**：建议配置并使用 Prettier/ESLint。

## 5. Git 规范 (Git Conventions)
- **提交信息 (Commit Messages)**：采用 Conventional Commits 规范：
  - `feat`: 新功能 (feature)
  - `fix`: 修复 bug
  - `docs`: 文档修改
  - `style`: 代码格式修改 (不影响代码运行的变动)
  - `refactor`: 重构 (即不是新增功能，也不是修改 bug 的代码变动)
  - `perf`: 优化相关 (如提升性能、体验)
  - `test`: 增加测试
  - `build`: 影响构建系统或外部依赖的更改
  - `chore`: 其他修改 (如构建过程或辅助工具的变动)
  - 示例：`feat: 增加 3D 地图组件` 或 `style: 优化深色面板的背景透明度`

## 6. 设计一致性 (Design Consistency)
- 必须严格遵循既定的 **Deep Navy and Amber (深藏青与琥珀金)** 设计语言。
- UI 必须具有高级感，运用微动画（Micro-animations）和悬浮交互效果提升界面的动态感。
