/**
 * 头像状态管理：dataURL 持久化（与 Web 端一致），供设置页 / 账户页 / 主界面共用。
 * 只接受 data: 开头的 base64 图片；历史遗留的临时路径（blob:/tmp）视为无效并清理。
 */
import { reactive } from 'vue'

const AVATAR_KEY = 'lifestyleapp_avatar'

function readStoredAvatar() {
  const v = uni.getStorageSync(AVATAR_KEY) || ''
  if (v && v.indexOf('data:') === 0) return v
  if (v) uni.removeStorageSync(AVATAR_KEY)
  return ''
}

export const avatarState = reactive({
  dataUrl: readStoredAvatar()
})

export function useAvatar() {
  return {
    state: avatarState,
    set(dataUrl) {
      avatarState.dataUrl = dataUrl || ''
      if (dataUrl) uni.setStorageSync(AVATAR_KEY, dataUrl)
      else uni.removeStorageSync(AVATAR_KEY)
    },
    clear() {
      this.set('')
    }
  }
}
