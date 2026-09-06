/**
 * 统一请求封装：Bearer 令牌、JSON 解析、401 处理
 */
import { BASE_URL } from './config'

const TOKEN_KEY = 'lifestyleapp_token'

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}
export function setToken(token) {
  if (token) uni.setStorageSync(TOKEN_KEY, token)
  else uni.removeStorageSync(TOKEN_KEY)
}

function handle401() {
  setToken(null)
  uni.removeStorageSync('lifestyleapp_nickname')
}

export function request(path, options = {}) {
  const method = options.method || 'GET'
  const data = options.data || {}
  const token = getToken()
  return new Promise((resolve) => {
    uni.request({
      url: BASE_URL + path,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      },
      success(res) {
        const body = res.data || {}
        if (res.statusCode === 401 && token && path.indexOf('/login') !== 0 && path.indexOf('/register') !== 0) {
          handle401()
        }
        if (res.statusCode >= 200 && res.statusCode < 300 && body.ok !== false) {
          resolve({ ok: true, status: res.statusCode, data: body })
        } else {
          resolve({ ok: false, status: res.statusCode, error: body.error || '请求失败', data: body })
        }
      },
      fail() {
        resolve({ ok: false, status: 0, error: '网络不可用，请确认后端已启动', data: {} })
      }
    })
  })
}
