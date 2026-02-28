> **Language / 语言**: [English](README.md) | [中文](README.zh-CN.md)

# GLM Usage Dashboard

A visual dashboard for monitoring Zhipu AI (GLM) Coding Plan usage with dark/light theme support.

![Dashboard Preview](/dashboard.png)

## Features

- **Token Usage Monitoring** - Real-time token usage and percentage within a 5-hour sliding window
- **MCP Usage Monitoring** - Monthly MCP call quota usage
- **Today's Stats** - Call count and total token consumption in the last 24 hours
- **Historical Trends** - ECharts line chart showing 24-hour usage trends
- **Manual Refresh** - Click to fetch latest data immediately
- **Auto Refresh** - Configurable auto-refresh interval (30s / 1min / 5min / 10min)
- **Theme Switching** - Support system / dark / light themes
- **Quota Warning** - Warning state when usage exceeds 80%

## Tech Stack

- Vue 3 (Composition API)
- Vite
- ECharts / vue-echarts
- axios

## Quick Start

### Requirements

- Node.js 18+
- pnpm (recommended)

### Local Development

```bash
# Clone the project
git clone https://github.com/your-username/codeplan-usage-dashboard.git
cd codeplan-usage-dashboard

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Visit http://localhost:5173

### Build Production

```bash
pnpm build
```

Build output is in `dist` directory.

## Deployment

### Option 1: Vercel One-Click Deploy (Recommended)

1. **Fork the repository**
   - Click **Fork** button to copy the project to your GitHub account

2. **Deploy with Vercel**
   - Visit [Vercel](https://vercel.com/) and login with GitHub
   - Click **Add New...** → **Project**
   - Select your forked `codeplan-usage-dashboard` repository
   - Click **Deploy** to complete deployment

### Option 2: Vercel CLI Deploy

```bash
# Install Vercel CLI
pnpm add -g vercel

# Enter project directory
cd codeplan-usage-dashboard

# Login to Vercel
vercel login

# Deploy
vercel
```

### Option 3: Other Platforms

Build output in `dist` can be deployed to any static hosting platform:

- Netlify
- Cloudflare Pages
- GitHub Pages
- Aliyun OSS
- Tencent Cloud COS

## Configuration

### Get API Key

1. Visit [Zhipu AI Open Platform](https://open.bigmodel.cn/)
2. Login and go to console
3. Create or view API Key
4. Configure API Key in dashboard settings

### Refresh Interval

In settings panel you can configure:

- **Auto Refresh**: Enable/disable
- **Refresh Interval**: 30s / 1min / 5min / 10min

Settings are automatically saved to browser localStorage.

## Project Structure

```
codeplan-usage-dashboard/
├── src/
│   ├── components/
│   │   ├── UsageCard.vue      # Usage card component
│   │   ├── TrendChart.vue    # ECharts trend chart
│   │   └── SettingsModal.vue # Settings modal
│   ├── composables/
│   │   └── useTheme.js       # Theme management
│   ├── services/
│   │   └── glmApi.js         # GLM API calls
│   ├── App.vue
│   └── main.js
├── api/
│   └── monitor.js            # Vercel Serverless proxy
├── vercel.json                # Vercel config
└── package.json
```

## Disclaimer

⚠️ Please note before using this tool:

1. **API Key Storage**: API Key is stored only in browser localStorage, never uploaded to any server
2. **Proxy Forwarding**: API calls are forwarded through Vercel proxy server, please ensure compliance with Zhipu AI Terms of Service
3. **Usage Scope**: For personal learning/entertainment only, do not use for commercial purposes
4. **Legal Risk**: Ensure your usage complies with Zhipu AI and relevant laws/regulations

## Notes

1. **API Key Security**: API Key is stored in browser localStorage, do not expose in public
2. **CORS**: Since Zhipu AI API doesn't support direct browser calls, production uses Vercel Serverless proxy
3. **Refresh Frequency**: Set refresh interval based on actual needs to avoid excessive requests

## License

MIT
