<template>
  <div class="trend-chart">
    <div class="chart-header">
      <span class="chart-title">24小时调用趋势</span>
      <span class="peak-info" v-if="peakCalls > 0">
        峰值: <strong>{{ peakCalls }}</strong> ({{ peakTime }})
      </span>
    </div>
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent]);

const props = defineProps({
  historyData: {
    type: Array,
    default: () => []
  },
  colors: {
    type: Object,
    default: () => ({})
  }
});

const primaryColor = computed(() => '#0066ff');

const chartOption = computed(() => {
  const data = prepareData();
  
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#111827',
      borderColor: '#1e3a5f',
      textStyle: {
        color: '#e5e7eb'
      },
      formatter: function(params) {
        const data = params[0];
        return `${data.name}<br/>调用次数: ${data.value}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.times,
      axisLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      },
      axisLabel: {
        color: '#9ca3af',
        interval: 11,
        formatter: (value) => value.split(':')[0] + 'h'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#9ca3af'
      },
      splitLine: {
        lineStyle: {
          color: '#1e3a5f',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '调用次数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: data.values,
        lineStyle: {
          color: '#0066ff',
          width: 3
        },
        itemStyle: {
          color: '#0066ff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 102, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 102, 255, 0.02)' }
            ]
          }
        }
      }
    ]
  };
});

const peakCalls = ref(0);
const peakTime = ref('');

function prepareData() {
  const totalPoints = 24;
  let points = [...props.historyData];
  
  if (points.length > totalPoints) {
    points = points.slice(points.length - totalPoints);
  }
  
  while (points.length < totalPoints) {
    points.unshift({ calls: 0, time: '' });
  }
  
  const maxCalls = Math.max(...points.map(h => h.calls), 1);
  const peakIndex = points.findIndex(p => p.calls === maxCalls);
  
  if (peakIndex >= 0 && points[peakIndex].calls > 0) {
    peakCalls.value = points[peakIndex].calls;
    peakTime.value = points[peakIndex].time.split(':')[0] + ':00';
  } else {
    peakCalls.value = 0;
    peakTime.value = '';
  }
  
  return {
    times: points.map(p => p.time || '00:00'),
    values: points.map(p => p.calls)
  };
}
</script>

<style scoped>
.trend-chart {
  border-radius: 16px;
  padding: 24px;
  background: var(--bg-card, #111827);
  border: 1px solid var(--border, #1e3a5f);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
}

.peak-info {
  font-size: 14px;
  color: var(--text-muted, #9ca3af);
}

.peak-info strong {
  color: var(--primary, #0066ff);
}

.chart {
  height: 300px;
  width: 100%;
}
</style>
