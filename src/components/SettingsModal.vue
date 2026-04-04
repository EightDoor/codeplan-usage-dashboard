<template>
  <div class="settings-modal" v-if="visible" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>设置</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label>API Key</label>
          <div class="input-wrapper">
            <input 
              :type="showApiKey ? 'text' : 'password'" 
              v-model="localConfig.apiKey" 
              :placeholder="provider === 'minimax' ? '请输入 MiniMax Token Plan API Key' : '请输入 GLM API Key'"
            />
            <button class="toggle-visibility" @click="showApiKey = !showApiKey">
              {{ showApiKey ? '隐藏' : '显示' }}
            </button>
          </div>
          <p class="help-text">{{ provider === 'minimax' ? '在 MiniMax 开放平台获取 Token Plan API Key' : '在智谱AI开放平台获取 API Key' }}</p>
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="localConfig.autoRefresh" />
            <span>自动刷新</span>
          </label>
        </div>
        
        <div class="form-group" v-if="localConfig.autoRefresh">
          <label>刷新间隔</label>
          <select v-model="localConfig.refreshInterval">
            <option :value="30000">30 秒</option>
            <option :value="60000">1 分钟</option>
            <option :value="300000">5 分钟</option>
            <option :value="600000">10 分钟</option>
          </select>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">取消</button>
        <button class="btn btn-primary" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  config: {
    type: Object,
    default: () => ({
      apiKey: '',
      autoRefresh: false,
      refreshInterval: 60000
    })
  },
  colors: {
    type: Object,
    default: () => ({})
  },
  provider: {
    type: String,
    default: 'glm'
  }
});

const emit = defineEmits(['update:visible', 'save']);

const localConfig = ref({ ...props.config });
const showApiKey = ref(false);

watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });

function close() {
  emit('update:visible', false);
}

function save() {
  emit('save', { ...localConfig.value, provider: props.provider });
  close();
}
</script>

<style scoped>
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-card, #111827);
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  border: 1px solid var(--border, #1e3a5f);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border, #1e3a5f);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: var(--text, #e5e7eb);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted, #9ca3af);
}

.input-wrapper {
  display: flex;
  gap: 10px;
}

.input-wrapper input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid var(--border, #1e3a5f);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-dark, #0a0e17);
  color: var(--text, #e5e7eb);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--primary, #0066ff);
}

.toggle-visibility {
  padding: 10px 14px;
  background: var(--bg-card, #1f2937);
  border: 1px solid var(--border, #1e3a5f);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-muted, #9ca3af);
}

.toggle-visibility:hover {
  background: var(--primary, #0066ff);
  color: #fff;
}

.help-text {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-muted, #9ca3af);
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary, #0066ff);
}

.checkbox-label span {
  font-weight: normal;
}

select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border, #1e3a5f);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-dark, #0a0e17);
  color: var(--text, #e5e7eb);
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: var(--primary, #0066ff);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border, #1e3a5f);
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border, #1e3a5f);
  color: var(--text-muted, #9ca3af);
}

.btn-secondary:hover {
  background: var(--bg-card, #1f2937);
}

.btn-primary {
  background: var(--primary, #0066ff);
  color: #fff;
}

.btn-primary:hover {
  background: var(--primary-light, #3385ff);
}
</style>
