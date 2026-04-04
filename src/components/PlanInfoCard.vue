<template>
  <div class="plan-info-card">
    <div class="card-header">
      <span class="card-title">{{ planName }}</span>
      <span class="reset-countdown">{{ countdownText }}</span>
    </div>
    <div class="progress-container">
      <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  planName: {
    type: String,
    required: true
  },
  resetTime: {
    type: Number,
    required: true
  },
  remainsTime: {
    type: Number,
    required: true
  }
});

const now = ref(Date.now());
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const countdownSeconds = computed(() => {
  if (props.remainsTime <= 0) return 0;
  // remainsTime is the remaining seconds until reset (from MiniMax API)
  // As time passes, remainsTime decreases. The countdown = remainsTime.
  const secs = props.remainsTime >= 100000 ? Math.floor(props.remainsTime / 1000) : props.remainsTime;
  return Math.max(0, secs);
});

const countdownText = computed(() => {
  if (props.remainsTime <= 0) return 'Resetting...';
  const totalSeconds = countdownSeconds.value;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const progressPercentage = computed(() => {
  if (props.remainsTime <= 0) return 100;
  const totalWindow = 5 * 60 * 60; // 5 hours in seconds
  const elapsed = totalWindow - countdownSeconds.value;
  return Math.min(100, Math.max(0, (elapsed / totalWindow) * 100));
});
</script>

<style scoped>
.plan-info-card {
  padding: 28px;
  border-radius: 16px;
  background: var(--bg-card, #111827);
  border: 1px solid var(--border, #1e3a5f);
  transition: all 0.3s ease;
}

.plan-info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 102, 255, 0.15);
  border-color: var(--primary, #0066ff);
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

.reset-countdown {
  font-size: 18px;
  font-weight: 600;
  font-family: monospace;
  color: var(--primary, #0066ff);
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
  background: linear-gradient(90deg, var(--primary, #0066ff), #3399ff);
}
</style>
