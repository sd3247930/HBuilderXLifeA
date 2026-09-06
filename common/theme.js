/**
 * 主题状态：四套风格 + 深色模式（storage 键与 Web 端一致）
 * 通过根节点 class（th-default/glass/neo/brutal + th-dark）切换全局样式。
 */
import { reactive, computed } from 'vue'

const STYLE_KEY = 'lifestyleapp_style'
const THEME_KEY = 'lifestyleapp_theme'

export const themeState = reactive({
  style: uni.getStorageSync(STYLE_KEY) || 'default',
  dark: (uni.getStorageSync(THEME_KEY) || 'light') === 'dark'
})

export const themeClass = computed(() => {
  return 'th-' + themeState.style + (themeState.dark ? ' th-dark' : '')
})

/** 从持久化存储重新同步主题状态（供页面 onShow 调用，避免跨页面状态不同步） */
export function syncThemeFromStorage() {
  const style = uni.getStorageSync(STYLE_KEY) || 'default'
  const dark = (uni.getStorageSync(THEME_KEY) || 'light') === 'dark'
  themeState.style = style
  themeState.dark = dark
}

export function useTheme() {
  return {
    state: themeState,
    classNames: themeClass,
    sync: syncThemeFromStorage,
    setStyle(style) {
      themeState.style = style
      uni.setStorageSync(STYLE_KEY, style)
    },
    setDark(dark) {
      themeState.dark = !!dark
      uni.setStorageSync(THEME_KEY, themeState.dark ? 'dark' : 'light')
    }
  }
}
