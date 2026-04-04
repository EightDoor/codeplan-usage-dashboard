<template>
  <div class="provider-tabs">
    <button
      v-for="provider in providers"
      :key="provider.id"
      class="icon-btn tab-btn"
      :class="{ active: activeProvider === provider.id }"
      @click="handleSwitch(provider.id)"
    >
      <span class="btn-text">{{ provider.name }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  providers: {
    type: Array,
    required: true
  },
  activeProvider: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['switch']);

function handleSwitch(id) {
  emit('switch', id);
}
</script>

<style scoped>
.provider-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  position: relative;
}

.tab-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
</style>
