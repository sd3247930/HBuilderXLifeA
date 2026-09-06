<template>
  <view :class="['auth-page', themeClass]">
    <view class="auth-card card">
      <view class="auth-title">
        <view class="auth-logo">✨</view>
        <view class="auth-h1">注册 LifestyleApp</view>
        <view class="muted">注册成功后将自动登录</view>
      </view>
      <view class="field">
        <text class="fl">用户名</text>
        <input v-model="username" class="auth-input" :class="{ 'auth-input-focus': focusUser }" placeholder="3-20 位字母、数字或下划线" placeholder-style="color:#b0b8c4;font-size:28rpx;" @focus="focusUser = true" @blur="focusUser = false" />
      </view>
      <view class="field">
        <text class="fl">昵称（可选）</text>
        <input v-model="nickname" class="auth-input" :class="{ 'auth-input-focus': focusNick }" placeholder="给自己起个好听的名字" placeholder-style="color:#b0b8c4;font-size:28rpx;" @focus="focusNick = true" @blur="focusNick = false" />
      </view>
      <view class="field">
        <text class="fl">密码</text>
        <input v-model="password" password class="auth-input" :class="{ 'auth-input-focus': focusPass }" placeholder="至少 6 位" placeholder-style="color:#b0b8c4;font-size:28rpx;" @focus="focusPass = true" @blur="focusPass = false" />
      </view>
      <view class="field">
        <text class="fl">确认密码</text>
        <input v-model="confirm" password class="auth-input" :class="{ 'auth-input-focus': focusConfirm }" placeholder="再次输入密码" placeholder-style="color:#b0b8c4;font-size:28rpx;" @focus="focusConfirm = true" @blur="focusConfirm = false" />
      </view>
      <view v-if="error" class="form-error">{{ error }}</view>
      <button class="btn btn-primary btn-block auth-btn" :loading="loading" @click="submit">注册</button>
      <view class="auth-switch">已有账号？<text class="link" @click="back">返回登录</text></view>
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
    const nickname = ref('')
    const password = ref('')
    const confirm = ref('')
    const focusUser = ref(false)
    const focusNick = ref(false)
    const focusPass = ref(false)
    const focusConfirm = ref(false)
    const error = ref('')
    const loading = ref(false)

    function back() {
      uni.navigateBack({ delta: 1 })
    }

    async function submit() {
      error.value = ''
      if (!/^[A-Za-z0-9_]{3,20}$/.test(username.value)) {
        error.value = '用户名需为 3-20 位字母、数字或下划线'
        return
      }
      if (password.value.length < 6) {
        error.value = '密码长度至少 6 位'
        return
      }
      if (password.value !== confirm.value) {
        error.value = '两次输入的密码不一致'
        return
      }
      loading.value = true
      const res = await api.register(username.value, password.value, nickname.value || undefined)
      loading.value = false
      if (res.ok) {
        auth.setSession(res.data.token, res.data.user)
        uni.reLaunch({ url: '/pages/main/main' })
      } else {
        error.value = res.error || '注册失败'
      }
    }

    return { theme, themeClass, username, nickname, password, confirm, focusUser, focusNick, focusPass, focusConfirm, error, loading, submit, back }
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
/* ---- 注册页输入框/表单字号与尺寸 ---- */
.field {
  margin-bottom: 24rpx;
}
.field .fl {
  font-size: 28rpx;
  color: #334155;
  margin-bottom: 12rpx;
}
/* #ifdef MP-WEIXIN */
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
.field uni-input {
  height: 44px;
  width: 100%;
  padding: 0;
  border: 1px solid #dce0e5;
  border-radius: 8px;
  background: #f7f9fc;
  box-sizing: border-box;
  font-size: 16px;
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
