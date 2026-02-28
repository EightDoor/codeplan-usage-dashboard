import { ref, watch, onMounted } from 'vue';

const STORAGE_KEY = 'glm-usage-theme';

const themes = ['system', 'dark', 'light'];

const themeConfigs = {
  dark: {
    name: 'dark',
    bg: '#0f172a',
    cardBg: '#1e293b',
    cardBorder: '#334155',
    primary: '#38bdf8',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    progressBg: '#334155'
  },
  light: {
    name: 'light',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    primary: '#0ea5e9',
    text: '#1e293b',
    textMuted: '#64748b',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    progressBg: '#e2e8f0'
  }
};

function getSystemTheme() {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

function loadTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && themes.includes(saved)) {
      return saved;
    }
  } catch (e) {
    console.error('Failed to load theme:', e);
  }
  return 'system';
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme:', e);
  }
}

export function useTheme() {
  const currentTheme = ref(loadTheme());
  const effectiveTheme = ref(currentTheme.value === 'system' ? getSystemTheme() : currentTheme.value);
  const colors = ref(themeConfigs[effectiveTheme.value]);

  function setTheme(theme) {
    if (!themes.includes(theme)) return;
    currentTheme.value = theme;
    saveTheme(theme);
    effectiveTheme.value = theme === 'system' ? getSystemTheme() : theme;
    colors.value = themeConfigs[effectiveTheme.value];
  }

  function cycleTheme() {
    const currentIndex = themes.indexOf(currentTheme.value);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }

  function getThemeLabel(theme) {
    const labels = { system: '跟随系统', dark: '暗黑', light: '亮色' };
    return labels[theme] || theme;
  }

  function init() {
    const effective = currentTheme.value === 'system' ? getSystemTheme() : currentTheme.value;
    effectiveTheme.value = effective;
    colors.value = themeConfigs[effective];
    applyThemeToDocument(effective);
    
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (currentTheme.value === 'system') {
          effectiveTheme.value = e.matches ? 'dark' : 'light';
          colors.value = themeConfigs[effectiveTheme.value];
          applyThemeToDocument(effectiveTheme.value);
        }
      });
    }
  }

  function applyThemeToDocument(theme) {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  watch(currentTheme, (newVal) => {
    effectiveTheme.value = newVal === 'system' ? getSystemTheme() : newVal;
    colors.value = themeConfigs[effectiveTheme.value];
    applyThemeToDocument(effectiveTheme.value);
  });

  onMounted(() => {
    init();
  });

  return {
    themes,
    currentTheme,
    effectiveTheme,
    colors,
    setTheme,
    cycleTheme,
    getThemeLabel,
    init
  };
}

export { themeConfigs };
