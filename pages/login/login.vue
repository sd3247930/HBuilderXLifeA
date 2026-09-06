<template>
  <view :class="['auth-page', themeClass]">
    <view class="auth-card card">
      <view class="auth-title">
        <view class="auth-logo">🔐</view>
        <view class="auth-h1">登录 LifestyleApp</view>
        <view class="muted">生活专属助手，数据只属于你</view>
      </view>
      <view class="field">
        <text class="fl">用户名</text>
        <input v-model="username" placeholder="3-20 位字母、数字或下划线" />
      </view>
      <view class="field">
        <text class="fl">密码</text>
        <input v-model="password" password placeholder="至少 6 位" />
      </view>
      <view v-if="error" class="form-error">{{ error }}</view>
      <button class="btn btn-primary btn-block auth-btn" :loading="loading" @click="submit">登录</button>
      <view class="auth-switch">还没有账号？<text class="link" @click="goRegister">立即注册</text></view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'
import { api } from '../../common/api'
import { useAuth } from '../../common/auth'
import { useTheme } from '../../common/theme'

export default {
  setup() {
    const themeApi = useTheme()
    const theme = themeApi.state
    const themeClass = themeApi.classNames
    const auth = useAuth()
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    function goRegister() {
      uni.navigateTo({ url: '/pages/register/register' })
    }

    async function submit() {
      if (!username.value || !password.value) {
        error.value = '请输入用户名和密码'
        return
      }
      loading.value = true
      error.value = ''
      const res = await api.login(username.value, password.value)
      loading.value = false
      if (res.ok) {
        auth.setSession(res.data.token, res.data.user)
        uni.reLaunch({ url: '/pages/main/main' })
      } else {
        error.value = res.error || '登录失败'
      }
    }

    return { theme, themeClass, username, password, error, loading, submit, goRegister }
  },
  onLoad() {
    if (useAuth().isLogin) {
      uni.reLaunch({ url: '/pages/main/main' })
    }
  }
}
</script>

<style lang="scss">
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  background: linear-gradient(135deg, #eef2ff, #f5f3ff 50%, #ecfeff);
  box-sizing: border-box;
}
.auth-card { width: 100%; padding: 60rpx 48rpx; }
.auth-title { text-align: center; margin-bottom: 44rpx; }
.auth-logo { font-size: 72rpx; }
.auth-h1 { font-size: 40rpx; font-weight: 600; margin: 16rpx 0 8rpx; }
.form-error { color: #dc2626; font-size: 24rpx; margin-bottom: 20rpx; background: #fef2f2; padding: 16rpx; border-radius: 12rpx; }
.auth-btn { margin-top: 8rpx; }
.auth-switch { margin-top: 28rpx; text-align: center; font-size: 26rpx; color: #64748b; }
.link { color: #0f52ba; }
/* ---- 登录页输入框/表单字号与尺寸（固定 px，兼容 H5/Edge） ---- */
.field {
  margin-bottom: 18px;
}
.field .fl {
  font-size: 15px;
  margin-bottom: 8px;
}
/* uni 将 input 编译为 uni-input 元素，作用在外层使其稳定生效 */
.field uni-input {
  height: 48px;                 /* 触控舒适区 ≥44px */
  width: 100%;
  padding: 0;                   /* 清掉 uni 默认内边距，内层输入框才能铺满 */
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  box-sizing: border-box;
  font-size: 18px;              /* ≥16px，防 iOS 缩放、桌面清晰 */
  line-height: 1.5;
}
.field uni-input:focus-within {
  border-color: #0f52ba !important;
}
.auth-btn {
  height: 48px;
  font-size: 16px;
}
.uni-input-placeholder {
  font-size: 15px;
}
</style>
