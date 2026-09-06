/**
 * 纯本地模式下的令牌读写（保留文件名与历史键名，兼容 auth.js）。
 * 不再发起任何 HTTP 请求，数据读写全部由 common/storage.js 完成。
 */
const TOKEN_KEY = 'lifestyleapp_token'

export function getToken() {
  try {
    return uni.getStorageSync(TOKEN_KEY) || ''
  } catch (e) {
    return ''
  }
}

export function setToken(token) {
  if (token) uni.setStorageSync(TOKEN_KEY, token)
  else uni.removeStorageSync(TOKEN_KEY)
}
