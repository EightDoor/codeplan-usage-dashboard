> **Language / 语言**: [English](README.en.md) | [中文](README.md)

# AI Coding Plan 用量监控仪表盘

一个用于监控多个 AI Coding Plan 使用量的可视化仪表盘，支持暗黑/亮色主题切换。

**在线访问**: https://codeplan-usage-dashboard.vercel.app

![Dashboard Preview](dashboard.png)

## 支持的服务商

| 服务商 | 监控内容 |
|--------|---------|
| **智谱 AI (GLM)** | Token 用量（5小时窗口）、MCP 调用额度（月度）、今日统计、历史趋势 |
| **MiniMax** | M2.7 请求配额（5小时窗口）、套餐信息、非文本模型配额、剩余/已用请求数 |

## 功能特性

- **多服务商切换** - 通过顶部 Tab 在 GLM 和 MiniMax 之间切换
- **Token 用量监控** - 实时显示 5 小时滑动窗口的 Token/请求使用量及百分比
- **MCP 用量监控** - 显示月度 MCP 调用额度使用情况（GLM）
- **套餐信息** - 显示当前套餐名称和重置时间（MiniMax）
- **非文本模型配额** - 展示语音、视频等模型的配额使用情况（MiniMax）
- **今日统计** - 24 小时内调用次数、Token 消耗总量
- **历史趋势** - ECharts 折线图展示 24 小时调用趋势（GLM）
- **手动/自动刷新** - 点击按钮立即获取数据，或配置自动刷新（30秒/1分钟/5分钟/10分钟）
- **主题切换** - 支持系统/暗黑/亮色三种主题
- **配额预警** - 使用率超过 80% 时显示警告状态
- **配置独立** - 各服务商 API Key 和刷新设置独立存储

## 技术栈

- Vue 3 (Composition API)
- Vite
- ECharts / vue-echarts
- axios

## 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐)

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/codeplan-usage-dashboard.git
cd codeplan-usage-dashboard

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
pnpm build
```

构建产物在 `dist` 目录。

## 部署方式

### 方式一：Vercel 一键部署（推荐）

1. **Fork 仓库**
   - 点击右上角 **Fork** 按钮将项目复制到你的 GitHub 账户

2. **Vercel 部署**
   - 访问 [Vercel](https://vercel.com/) 并使用 GitHub 登录
   - 点击 **Add New...** → **Project**
   - 选择你 Fork 的 `codeplan-usage-dashboard` 仓库
   - 点击 **Deploy** 完成部署

### 方式二：Vercel CLI 部署

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 进入项目目录
cd codeplan-usage-dashboard

# 登录 Vercel
vercel login

# 部署
vercel
```

### 方式三：其他平台

构建后的静态文件在 `dist` 目录，可以部署到任何静态托管平台：

- Netlify
- Cloudflare Pages
- GitHub Pages
- 阿里云 OSS
- 腾讯云 COS

## 配置

### 获取 API Key

| 服务商 | 获取方式 |
|--------|---------|
| **智谱 AI (GLM)** | 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/) → 控制台 → 创建 API Key |
| **MiniMax** | 访问 [MiniMax 开放平台](https://www.minimaxi.com/) → 控制台 → 创建 API Key |

在仪表盘设置中切换到对应服务商的 Tab 页配置 API Key。

### 刷新频率设置

在设置面板中可以为每个服务商独立配置：

- **自动刷新**: 开启/关闭
- **刷新间隔**: 30秒 / 1分钟 / 5分钟 / 10分钟

配置会自动保存到浏览器本地存储（localStorage）。

## 项目结构

```
codeplan-usage-dashboard/
├── src/
│   ├── components/
│   │   ├── UsageCard.vue       # 用量卡片组件
│   │   ├── TrendChart.vue      # ECharts 趋势图
│   │   ├── SettingsModal.vue   # 设置弹窗（支持多服务商）
│   │   ├── ProviderTabs.vue    # 服务商 Tab 切换
│   │   ├── PlanInfoCard.vue    # 套餐信息卡片
│   │   └── ModelQuotaList.vue  # 非文本模型配额列表
│   ├── composables/
│   │   └── useTheme.js         # 主题管理
│   ├── services/
│   │   ├── apiUtils.js         # 共享 API 工具函数
│   │   ├── glmApi.js           # GLM API 调用
│   │   └── minimaxApi.js       # MiniMax API 调用
│   ├── App.vue
│   └── main.js
├── api/
│   ├── monitor.js              # GLM Vercel Serverless 代理
│   ├── proxy.js                # 通用代理
│   └── minimax.js              # MiniMax Vercel Serverless 代理
├── vercel.json                 # Vercel 配置
└── package.json
```

## 免责声明

⚠️ 使用本工具前请注意：

1. **API Key 存储**: API Key 仅存储在浏览器本地（localStorage），不会上传到任何服务器
2. **代理转发**: 接口调用通过 Vercel 代理服务器转发，请确保遵守相关服务商服务条款
3. **使用范围**: 仅供个人学习娱乐使用，请勿用于商业用途
4. **法律风险**: 请确保你的使用方式符合相关服务商及法律法规的要求

## 注意事项

1. **API Key 安全**: API Key 存储在浏览器 localStorage 中，请勿在公共场合泄露
2. **CORS**: 由于各服务商 API 不支持直接浏览器调用，生产环境通过 Vercel Serverless 代理
3. **刷新频率**: 建议根据实际需求设置刷新频率，避免请求过于频繁

## 许可证

MIT
