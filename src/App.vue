<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { fetchUsageData, loadConfig, saveConfig, formatTokens, formatNumber } from './services/glmApi';
import { fetchUsageData as fetchMinimaxUsageData } from './services/minimaxApi';
import { useTheme } from './composables/useTheme';
import UsageCard from './components/UsageCard.vue';
import TrendChart from './components/TrendChart.vue';
import SettingsModal from './components/SettingsModal.vue';
import ProviderTabs from './components/ProviderTabs.vue';
import PlanInfoCard from './components/PlanInfoCard.vue';

const { themes, currentTheme, colors, setTheme, cycleTheme, getThemeLabel } = useTheme();

const config = ref(loadConfig());
const usageData = ref(null);
const loading = ref(false);
const error = ref('');
const lastUpdate = ref(null);
const showSettings = ref(false);
let refreshTimer = null;

const activeProvider = ref(localStorage.getItem('glm-usage-active-tab') || 'glm');
const minimaxUsageData = ref(null);

const providers = [
  { id: 'glm', name: 'GLM' },
  { id: 'minimax', name: 'MiniMax' }
];

const currentConfig = computed(() => {
  const allConfigs = config.value.providers || {};
  return allConfigs[activeProvider.value] || { apiKey: '', autoRefresh: false, refreshInterval: 60000 };
});

const hasApiKey = computed(() => !!currentConfig.value.apiKey);

const tokenQuota = computed(() => {
  if (!usageData.value) return { used: 0, total: 0, pct: 0 };
  return usageData.value.quotas.token5h;
});

const mcpQuota = computed(() => {
  if (!usageData.value) return { used: 0, total: 0, pct: 0 };
  return usageData.value.quotas.mcp;
});

const totals = computed(() => {
  if (!usageData.value) return { calls: 0, tokens: 0 };
  return usageData.value.totals;
});

const historyData = computed(() => {
  if (!usageData.value) return [];
  return usageData.value.history;
});

const minimaxTokenQuota = computed(() => {
  if (!minimaxUsageData.value) return { used: 0, total: 0, pct: 0 };
  return minimaxUsageData.value.quotas?.token5h || { used: 0, total: 0, pct: 0 };
});

const minimaxPlanInfo = computed(() => {
  if (!minimaxUsageData.value) return { planName: '', resetTime: 0 };
  return {
    planName: minimaxUsageData.value.planName || 'Unknown',
    resetTime: minimaxUsageData.value.resetTime || 0
  };
});

const minimaxTotals = computed(() => {
  if (!minimaxUsageData.value) return { calls: 0, tokens: 0 };
  const q = minimaxUsageData.value.quotas?.token5h || { used: 0 };
  return { calls: q.used, tokens: q.used };
});

const lastUpdateTime = computed(() => {
  if (!lastUpdate.value) return '--:--:--';
  return new Date(lastUpdate.value).toLocaleTimeString('zh-CN', { hour12: false });
});

async function loadData() {
  const apiKey = currentConfig.value.apiKey;
  if (!apiKey) {
    error.value = '请先配置 API Key';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const data = activeProvider.value === 'glm'
      ? await fetchUsageData(apiKey)
      : await fetchMinimaxUsageData(apiKey);
    if (activeProvider.value === 'glm') {
      usageData.value = data;
    } else {
      minimaxUsageData.value = data;
    }
    lastUpdate.value = Date.now();
  } catch (e) {
    error.value = e.message || '获取数据失败';
    console.error('Failed to fetch usage data:', e);
  } finally {
    loading.value = false;
  }
}

function openSettings() {
  showSettings.value = true;
}

function handleSaveConfig(newConfig) {
  const providers = config.value.providers || {};
  providers[activeProvider.value] = {
    apiKey: newConfig.apiKey,
    autoRefresh: newConfig.autoRefresh,
    refreshInterval: newConfig.refreshInterval
  };
  config.value = { ...config.value, providers };
  saveConfig(config.value);
  
  if (newConfig.autoRefresh) {
    startAutoRefresh(newConfig.refreshInterval);
  } else {
    stopAutoRefresh();
  }
  
  if (newConfig.apiKey) {
    loadData();
  }
}

function handleTabSwitch(providerId) {
  activeProvider.value = providerId;
  localStorage.setItem('glm-usage-active-tab', providerId);
  stopAutoRefresh();
  error.value = '';
  usageData.value = null;
  minimaxUsageData.value = null;
  if (currentConfig.value.apiKey) {
    loadData();
    if (currentConfig.value.autoRefresh) {
      startAutoRefresh(currentConfig.value.refreshInterval);
    }
  }
}

function startAutoRefresh(interval) {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    loadData();
  }, interval);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

watch(() => currentConfig.value.autoRefresh, (enabled) => {
  if (enabled) {
    startAutoRefresh(currentConfig.value.refreshInterval);
  } else {
    stopAutoRefresh();
  }
});

onMounted(() => {
  const savedTab = localStorage.getItem('glm-usage-active-tab');
  if (savedTab && ['glm', 'minimax'].includes(savedTab)) {
    activeProvider.value = savedTab;
  }
  if (currentConfig.value.apiKey) {
    loadData();
    if (currentConfig.value.autoRefresh) {
      startAutoRefresh(currentConfig.value.refreshInterval);
    }
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<template>
  <div class="app" :data-theme="currentTheme">
    <!-- Disclaimer Banner -->
    <div class="disclaimer-banner">
      <div class="disclaimer-content">
        <span class="disclaimer-icon">⚠️</span>
        <span>API Key 仅存储在浏览器本地，接口通过 Vercel 代理转发，请确保遵守相关服务商条款，仅供个人学习娱乐使用</span>
      </div>
    </div>

    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <h1 class="title">GLM 用量监控</h1>
      </div>
      <ProviderTabs
        :providers="providers"
        :activeProvider="activeProvider"
        @switch="handleTabSwitch"
      />
      <div class="header-right">
        <button class="icon-btn theme-btn" @click="cycleTheme" :title="getThemeLabel(currentTheme)">
          <span class="btn-icon">🌙</span>
          <span class="btn-text" v-if="currentTheme === 'dark'">暗黑</span>
          <span class="btn-text" v-else-if="currentTheme === 'light'">亮色</span>
          <span class="btn-text" v-else>系统</span>
        </button>
        <button class="icon-btn settings-btn" @click="openSettings">
          <span class="btn-icon">⚙️</span>
          <span class="btn-text">设置</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Empty State -->
      <div v-if="!hasApiKey" class="empty-state">
        <div class="empty-icon">🔑</div>
        <h2>欢迎使用 {{ activeProvider === 'minimax' ? 'MiniMax' : 'GLM' }} 用量监控</h2>
        <p>请先配置您的 API Key 开始监控用量</p>
        <button class="primary-btn" @click="openSettings">配置 API Key</button>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>获取数据失败</h2>
        <p>{{ error }}</p>
        <button class="primary-btn" @click="loadData">重试</button>
      </div>

      <!-- Dashboard -->
      <div v-else class="dashboard">
        <!-- GLM Dashboard -->
        <template v-if="activeProvider === 'glm'">
          <div class="quota-section">
            <UsageCard 
              title="Token (5小时)" 
              :used="tokenQuota.used" 
              :total="tokenQuota.total" 
              :percentage="tokenQuota.pct"
              type="token"
              :colors="colors"
            />
            <UsageCard 
              title="MCP (月度)" 
              :used="mcpQuota.used" 
              :total="mcpQuota.total" 
              :percentage="mcpQuota.pct"
              type="mcp"
              :colors="colors"
            />
          </div>
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-label">今日调用次数</div>
              <div class="stat-value">{{ formatNumber(totals.calls) }}</div>
              <div class="stat-unit">次</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-card">
              <div class="stat-label">Token 消耗总量</div>
              <div class="stat-value">{{ formatTokens(totals.tokens) }}</div>
              <div class="stat-unit">tokens</div>
            </div>
          </div>
          <div class="chart-section">
            <TrendChart :historyData="historyData" :colors="colors" />
          </div>
        </template>
        
        <!-- MiniMax Dashboard -->
        <template v-else>
          <div class="quota-section">
            <UsageCard 
              title="M2.7 请求 (5小时)" 
              :used="minimaxTokenQuota.used" 
              :total="minimaxTokenQuota.total" 
              :percentage="minimaxTokenQuota.pct"
              type="token"
              :colors="colors"
            />
            <PlanInfoCard 
              :planName="minimaxPlanInfo.planName"
              :resetTime="minimaxPlanInfo.resetTime"
              :remainsTime="minimaxPlanInfo.resetTime"
            />
          </div>
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-label">已用请求数</div>
              <div class="stat-value">{{ formatNumber(minimaxTotals.calls) }}</div>
              <div class="stat-unit">次</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-card">
              <div class="stat-label">剩余请求</div>
              <div class="stat-value">{{ formatNumber(Math.max(0, minimaxTokenQuota.total - minimaxTokenQuota.used)) }}</div>
              <div class="stat-unit">次</div>
            </div>
          </div>
        </template>
        
        <div class="footer-section">
          <button class="refresh-btn" @click="loadData" :disabled="loading">
            <span class="refresh-icon" :class="{ spinning: loading }">🔄</span>
            {{ loading ? '刷新中...' : '刷新数据' }}
          </button>
          <span class="last-update">最后更新: {{ lastUpdateTime }}</span>
        </div>
      </div>
    </main>

    <SettingsModal 
      :visible="showSettings" 
      :config="currentConfig"
      :colors="colors"
      :provider="activeProvider"
      @update:visible="showSettings = $event"
      @save="handleSaveConfig"
    />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #0066ff;
  --primary-light: #3385ff;
  --primary-dark: #0052cc;
  --bg-dark: #0a0e17;
  --bg-card: #111827;
  --bg-card-hover: #1f2937;
  --border: #1e3a5f;
  --text: #e5e7eb;
  --text-muted: #9ca3af;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}

[data-theme="light"] {
  --primary: #0066ff;
  --bg-dark: #f0f4f8;
  --bg-card: #ffffff;
  --bg-card-hover: #f8fafc;
  --border: #e2e8f0;
  --text: #1e293b;
  --text-muted: #64748b;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg-dark);
  color: var(--text);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  background: var(--bg-dark);
  position: relative;
  overflow-x: hidden;
}

.app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(0, 102, 255, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(0, 102, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* Disclaimer Banner */
.disclaimer-banner {
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
  border-bottom: 1px solid rgba(245, 158, 11, 0.3);
  padding: 10px 24px;
}

.disclaimer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #fbbf24;
}

.disclaimer-icon {
  font-size: 16px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #0066ff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  gap: 12px;
}

.icon-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-weight: 500;
}

/* Main Content */
.main-content {
  width: 100%;
  min-height: calc(100vh - 140px);
  padding: 40px 60px;
  position: relative;
  z-index: 1;
}

/* Empty & Error State */
.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.empty-icon,
.error-icon {
  font-size: 72px;
  margin-bottom: 24px;
}

.empty-state h2,
.error-state h2 {
  font-size: 28px;
  margin-bottom: 12px;
}

.empty-state p,
.error-state p {
  color: var(--text-muted);
  margin-bottom: 32px;
  font-size: 16px;
}

.primary-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 102, 255, 0.3);
}

/* Dashboard */
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Quota Section */
.quota-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

/* Stats Section */
.stats-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  padding: 48px;
  background: var(--bg-card);
  border-radius: 20px;
  border: 1px solid var(--border);
}

.stat-card {
  text-align: center;
}

.stat-label {
  font-size: 16px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.stat-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--primary);
}

.stat-unit {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 80px;
  background: var(--border);
}

/* Chart Section */
.chart-section {
  border-radius: 16px;
  overflow: hidden;
}

/* Footer Section */
.footer-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 20px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 18px;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.last-update {
  color: var(--text-muted);
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .quota-section {
    grid-template-columns: 1fr;
  }
  
  .stats-section {
    flex-direction: column;
    gap: 24px;
  }
  
  .stat-divider {
    width: 80px;
    height: 1px;
  }
  
  .header {
    padding: 16px 20px;
  }
  
  .main-content {
    padding: 24px 20px;
  }
  
  .btn-text {
    display: none;
  }
}
</style>
