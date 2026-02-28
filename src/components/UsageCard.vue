<template>
  <div class="usage-card" :class="{ warning: isWarning }">
    <div class="card-header">
      <span class="card-title">{{ title }}</span>
      <span class="card-percentage" :class="percentageClass">{{ percentage }}%</span>
    </div>
    <div class="progress-container">
      <div class="progress-bar" :style="{ width: percentage + '%' }"></div>
    </div>
    <div class="card-footer">
      <span class="used">{{ formatValue(used) }}</span>
      <span class="separator">/</span>
      <span class="total">{{ formatValue(total) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  used: {
    type: [Number, String],
    default: 0
  },
  total: {
    type: [Number, String],
    default: 0
  },
  percentage: {
    type: [Number, String],
    default: 0
  },
  type: {
    type: String,
    default: 'token'
  },
  colors: {
    type: Object,
    default: () => ({})
  }
});

const isWarning = computed(() => {
  return parseFloat(props.percentage) > 80;
});

const percentageClass = computed(() => {
  const pct = parseFloat(props.percentage);
  if (pct > 80) return 'danger';
  if (pct > 60) return 'warning';
  return 'normal';
});

function formatValue(value) {
  if (!value && value !== 0) return '0';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  if (props.type === 'token') {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}
</script>

<style scoped>
.usage-card {
  padding: 28px;
  border-radius: 16px;
  background: var(--bg-card, #111827);
  border: 1px solid var(--border, #1e3a5f);
  transition: all 0.3s ease;
}

.usage-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 102, 255, 0.15);
  border-color: var(--primary, #0066ff);
}

.usage-card.warning {
  border-color: var(--warning, #f59e0b);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-muted, #9ca3af);
}

.card-percentage {
  font-size: 42px;
  font-weight: 700;
}

.card-percentage.normal {
  color: var(--success, #10b981);
}

.card-percentage.warning {
  color: var(--warning, #f59e0b);
}

.card-percentage.danger {
  color: var(--danger, #ef4444);
}

.progress-container {
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-bar {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
  background: linear-gradient(90deg, var(--success, #10b981), #34d399);
}

.warning .progress-bar {
  background: linear-gradient(90deg, var(--warning, #f59e0b), #fbbf24);
}

.danger .progress-bar {
  background: linear-gradient(90deg, var(--danger, #ef4444), #f87171);
}

.card-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.used {
  font-weight: 600;
  font-size: 18px;
}

.separator {
  opacity: 0.5;
}

.total {
  opacity: 0.7;
}
</style>
