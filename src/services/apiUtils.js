export function formatTokens(num) {
  if (!num || num === 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
}

export function formatNumber(num) {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function saveConfig(config) {
  try {
    localStorage.setItem('glm-usage-config', JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config:', e);
  }
}