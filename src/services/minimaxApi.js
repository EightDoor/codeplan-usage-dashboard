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
  const planName = data.plan_name || 'Unknown';

  // Find the primary model (MiniMax-M2.7 or similar)
  const primaryModel = modelRemains.find(m => 
    m.model_name && (m.model_name.includes('MiniMax-M2') || m.model_name.includes('M2'))
  ) || modelRemains[0];

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

  return {
    platform: 'MiniMax',
    planName,
    resetTime: resetTimeSeconds,
    quotas,
    timestamp: Date.now()
  };
}

export { formatTokens, formatNumber, loadConfig, saveConfig };
