/**
 * 登录态管理：令牌 + 用户信息（storage 键与 Web 端一致）
 */
import { reactive } from 'vue'
import { getToken, setToken } from './request'

const NICKNAME_KEY = 'lifestyleapp_nickname'

export const authState = reactive({
  token: getToken(),
  user: null
})

export function useAuth() {
  return {
    state: authState,
    get isLogin() {
      return !!authState.token
    },
    get displayName() {
      const u = authState.user
      return (u && (u.nickname || u.username)) || uni.getStorageSync(NICKNAME_KEY) || ''
    },
    setSession(token, user) {
      authState.token = token
      authState.user = user
      setToken(token)
      if (user) {
        uni.setStorageSync(NICKNAME_KEY, user.nickname || user.username || '')
      }
    },
    setUser(user) {
      authState.user = user
    },
    clear() {
      authState.token = ''
      authState.user = null
      setToken(null)
      uni.removeStorageSync(NICKNAME_KEY)
    }
  }
}
