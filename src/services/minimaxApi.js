import axios from 'axios';
import { formatTokens, formatNumber, saveConfig } from './apiUtils.js';
import { loadConfig } from './glmApi.js';

const API_BASE = '/api/minimax';

/**
 * MiniMax API response structure:
 * {
 *   base_resp: { status_code: number, status_msg?: string },
 *   plan_name?: string,
 *   model_remains: [{
 *     model_name: string,
 *     start_time: number,
 *     end_time: number,
 *     remains_time: number,
 *     current_interval_total_count: number,
 *     current_interval_usage_count: number  // REMAINING quota, NOT used!
 *   }]
 * }
 */

async function request(url, apiKey) {
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.error('MiniMax API request failed:', error);
    throw new Error(error.response?.data?.base_resp?.status_msg || error.message || 'MiniMax API request failed');
  }
}

export async function fetchUsageData(apiKey) {
  const data = await request(`${API_BASE}/coding_plan/remains`, apiKey);
  return processData(data);
}

function processData(data) {
  // Check for API error response
  if (data.base_resp && data.base_resp.status_code !== 0) {
    const msg = data.base_resp.status_msg || `status_code: ${data.base_resp.status_code}`;
    throw new Error(msg);
  }

  const modelRemains = data.model_remains || [];
  let planName = data.plan_name || 'Unknown';

  // CN 套餐映射表（用户使用 api.minimaxi.com CN 端点）
  const CN_PLAN_MAP = { 600: 'Starter', 1500: 'Plus', 4500: 'Max' };
  // Global 套餐映射表
  const GLOBAL_PLAN_MAP = { 100: 'Starter', 300: 'Plus', 1000: 'Max', 2000: 'Ultra' };

  // Find the primary model (MiniMax-M2.7 or similar)
  const primaryModel = modelRemains.find(m => 
    m.model_name && (m.model_name.includes('MiniMax-M2') || m.model_name.includes('M2'))
  ) || modelRemains[0];

  // 如果 plan_name 缺失，从 primaryModel 的 total_count 推断
  let inferredPlanName = null;
  if (primaryModel && primaryModel.current_interval_total_count) {
    const total = primaryModel.current_interval_total_count;
    // 优先尝试 CN 映射（用户使用 CN 端点）
    inferredPlanName = CN_PLAN_MAP[total] || GLOBAL_PLAN_MAP[total] || null;
  }
  // 如果没有显式 plan_name，使用推断结果
  if (!data.plan_name && inferredPlanName) {
    planName = inferredPlanName;
  }

  // Detect remains_time unit: < 100000 = seconds, otherwise milliseconds
  let resetTimeSeconds = 0;
  if (primaryModel && primaryModel.remains_time) {
    const rt = primaryModel.remains_time;
    resetTimeSeconds = rt < 100000 ? rt : Math.floor(rt / 1000);
  }

  const quotas = {};

  if (primaryModel) {
    const total = primaryModel.current_interval_total_count || 0;
    const remaining = primaryModel.current_interval_usage_count || 0;
    const used = total - remaining;
    const pct = total > 0 ? ((used / total) * 100).toFixed(2) : '0.00';

    quotas.token5h = { used, total, pct };
  }

  modelRemains.forEach((model, index) => {
    if (model.model_name) {
      const key = model.model_name.includes('MiniMax-M2') || model.model_name.includes('M2')
        ? 'token5h'
        : `model_${index + 1}`;

      if (key !== 'token5h') {
        const total = model.current_interval_total_count || 0;
        const remaining = model.current_interval_usage_count || 0;
        const used = total - remaining;
        const pct = total > 0 ? ((used / total) * 100).toFixed(2) : '0.00';

        quotas[key] = {
          used,
          total,
          pct,
          modelName: model.model_name
        };
      }
    }
  });

  const nonTextModels = [];

  modelRemains.forEach((model) => {
    if (!model.model_name) return;
    const total = model.current_interval_total_count || 0;
    // 跳过文本模型和无配额模型
    if (model.model_name.includes('MiniMax-M') || model.model_name.includes('M2')) return;
    if (total <= 0) return;

    const remaining = model.current_interval_usage_count || 0;
    let used = total - remaining;
    if (used < 0) used = 0;
    if (used > total) used = total;
    const pct = total > 0 ? (used / total * 100).toFixed(2) : '0.00';
    nonTextModels.push({ modelName: model.model_name, used, total, pct });
  });

  return {
    platform: 'MiniMax',
    planName,
    resetTime: resetTimeSeconds,
    quotas,
    nonTextModels,
    timestamp: Date.now()
  };
}

export { formatTokens, formatNumber, loadConfig, saveConfig };
