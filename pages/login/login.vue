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
        <input v-model="username" class="auth-input" :class="{ 'auth-input-focus': focusUser }" placeholder="3-20 位字母、数字或下划线" placeholder-style="color:#b0b8c4;font-size:28rpx;" @focus="focusUser = true" @blur="focusUser = false" />
      </view>
      <view class="field">
        <text class="fl">密码</text>
        <input v-model="password" password class="auth-input" :class="{ 'auth-input-focus': focusPass }" placeholder="至少 6 位" placeholder-style="color:#b0b8c4;font-size:28rpx;" @focus="focusPass = true" @blur="focusPass = false" />
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
    const focusUser = ref(false)
    const focusPass = ref(false)
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

    return { theme, themeClass, username, password, focusUser, focusPass, error, loading, submit, goRegister }
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
/* ---- 登录页输入框/表单字号与尺寸 ---- */
.field {
  margin-bottom: 24rpx;
}
.field .fl {
  font-size: 28rpx;
  color: #334155;
  margin-bottom: 12rpx;
}

/* #ifdef MP-WEIXIN */
/* 微信小程序端 input 编译为原生 <input>，直接命中原生元素；
   显式高度 + 水平内边距解决占位符裁切、触控区偏小问题 */
.field input.auth-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #f7f9fc;
  border: 1px solid #dce0e5;
  border-radius: 16rpx;
  box-sizing: border-box;
  font-size: 32rpx;
  color: #1a1a1a;
}
.field input.auth-input.auth-input-focus {
  border-color: #0f52ba !important;
  background: #ffffff;
}
/* #endif */

/* #ifndef MP-WEIXIN */
/* H5/App 端 uni 将 input 编译为 uni-input 组件，作用于外层与内层 */
.field uni-input {
  height: 44px;                 /* 与小程序端 88rpx 等价，触控舒适区 ≥44px */
  width: 100%;
  padding: 0;                   /* 清掉 uni 默认内边距，内层输入框才能铺满 */
  border: 1px solid #dce0e5;
  border-radius: 8px;
  background: #f7f9fc;
  box-sizing: border-box;
  font-size: 16px;              /* ≥16px，防 iOS 缩放、桌面清晰 */
  color: #1a1a1a;
  line-height: 1.5;
}
.field uni-input.auth-input-focus,
.field uni-input:focus-within {
  border-color: #0f52ba !important;
  background: #ffffff;
}
.field uni-input .uni-input-input {
  font-size: 16px;
  color: #1a1a1a;
}
/* #endif */

.auth-btn {
  height: 48px;
  font-size: 16px;
}
.uni-input-placeholder {
  font-size: 14px;
  color: #b0b8c4;
}
</style>
