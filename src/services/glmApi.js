import axios from 'axios';
import { formatTokens, formatNumber, saveConfig } from './apiUtils.js';

export { formatTokens, formatNumber, saveConfig };

const API_BASE = '/api/monitor';

function formatDateTime(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getTimeRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(now);
  
  return {
    startTime: formatDateTime(start),
    endTime: formatDateTime(end)
  };
}

function buildQueryString(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    query.append(key, value);
  });
  return query.toString();
}

async function request(url, apiKey) {
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error(error.response?.data?.msg || error.message || 'API request failed');
  }
}

export async function fetchUsageData(apiKey) {
  const { startTime, endTime } = getTimeRange();
  const query = buildQueryString({ startTime, endTime });
  
  const [model, tool, quota] = await Promise.all([
    request(`${API_BASE}/usage/model-usage?${query}`, apiKey),
    request(`${API_BASE}/usage/tool-usage?${query}`, apiKey),
    request(`${API_BASE}/usage/quota/limit`, apiKey)
  ]);
  
  return processData({ model, tool, quota, timestamp: new Date() });
}

function processData({ model, tool, quota, timestamp }) {
  const mData = model.data || {};
  const tData = tool.data || {};
  const qData = quota.data || {};
  
  let history = [];
  if (Array.isArray(mData.x_time)) {
    history = mData.x_time.map((time, i) => ({
      time: time.split(' ')[1] || time,
      calls: mData.modelCallCount?.[i] || 0
    }));
  }
  
  // 解析 quota 数据
  // API返回格式: { limits: [{ type: 'TOKENS_LIMIT', usage: 总配额, currentValue: 已使用, percentage: 百分比 }, ...] }
  let quotas = {
    mcp: { used: 0, total: 0, pct: '0.00' },
    token5h: { used: 0, total: 0, pct: '0.00' }
  };
  
  // 获取当前使用的 tokens (从 model-usage 接口的 tokensUsage 数组中获取最后一个非 null 值)
  const tokensUsageArr = mData.tokensUsage || [];
  let currentUsedTokens = 0;
  for (let i = tokensUsageArr.length - 1; i >= 0; i--) {
    if (tokensUsageArr[i] !== null) {
      currentUsedTokens = tokensUsageArr[i];
      break;
    }
  }
  
  if (qData.limits && Array.isArray(qData.limits)) {
    qData.limits.forEach(l => {
      if (l.type === 'TIME_LIMIT') {
        // MCP 额度 (月度)
        const pct = l.percentage || 0;
        quotas.mcp = { 
          used: l.currentValue || 0, 
          total: l.usage || 0, 
          pct: pct.toFixed(2) 
        };
      }
      if (l.type === 'TOKENS_LIMIT') {
        // Token 5小时配额
        const pct = l.percentage || 0;
        // 如果有 currentValue 和 usage 则使用，否则用 percentage 反推
        let used = l.currentValue || currentUsedTokens || 0;
        let total = l.usage || 0;
        
        if (total === 0 && pct > 0 && used > 0) {
          // 用 percentage 反推 total
          total = Math.round(used / (pct / 100));
        }
        
        quotas.token5h = { 
          used: used, 
          total: total, 
          pct: pct.toFixed(2) 
        };
      }
    });
  }
  
  return {
    platform: '智谱AI',
    timestamp: timestamp.getTime(),
    totals: {
      calls: mData.totalUsage?.totalModelCallCount || 0,
      tokens: mData.totalUsage?.totalTokensUsage || 0
    },
    quotas,
    history
  };
}

export function getDefaultConfig() {
  return {
    apiKey: '',
    autoRefresh: false,
    refreshInterval: 60000
  };
}

export function loadConfig() {
  try {
    const saved = localStorage.getItem('glm-usage-config');
    if (saved) {
      return { ...getDefaultConfig(), ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load config:', e);
  }
  return getDefaultConfig();
}
