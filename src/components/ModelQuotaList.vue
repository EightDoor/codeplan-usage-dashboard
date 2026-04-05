<template>
  <div v-if="models.length > 0" class="model-quota-card">
    <div class="card-header">非文本模型每日配额</div>
    <div v-for="model in models" :key="model.modelName" class="model-row">
      <div class="model-info">
        <span class="model-name">{{ friendlyName(model.modelName) }}</span>
        <span class="model-stats">{{ model.used }}/{{ model.total }}</span>
      </div>
      <div class="progress-container">
        <div
          class="progress-bar"
          :style="{ width: model.pct + '%', background: progressColor(model.pct) }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  models: {
    type: Array,
    default: () => []
  }
});

function friendlyName(name) {
  const map = {
    'speech-hd': 'TTS HD 语音',
    'image-01': '图像生成',
    'MiniMax-Hailuo-2.3-Fast-6s-768p': '视频 2.3 Fast',
    'MiniMax-Hailuo-2.3-6s-768p': '视频 2.3',
    'music-2.5': '音乐 2.5'
  };
  return map[name] || name;
}

function progressColor(pct) {
  const p = parseFloat(pct);
  if (p < 60) return 'var(--primary, #0066ff)';
  if (p < 80) return 'var(--warning, #f59e0b)';
  return 'var(--danger, #ef4444)';
}
</script>

<style scoped>
.model-quota-card {
  padding: 28px;
  border-radius: 16px;
  background: var(--bg-card, #111827);
  border: 1px solid var(--border, #1e3a5f);
  transition: all 0.3s ease;
}

.model-quota-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 102, 255, 0.15);
  border-color: var(--primary, #0066ff);
}

.card-header {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-muted, #9ca3af);
  margin-bottom: 20px;
}

.model-row {
  margin-bottom: 16px;
}

.model-row:last-child {
  margin-bottom: 0;
}

.model-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.model-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #f3f4f6);
}

.model-stats {
  font-size: 13px;
  color: var(--text-muted, #9ca3af);
}

.progress-container {
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
}
</style>
