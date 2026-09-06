<template>
  <view :class="['page', themeClass]">
    <view class="card">
      <view class="card-title">账户信息</view>
      <view class="list-row">
        <image v-if="avatar.dataUrl" class="account-avatar" :src="avatar.dataUrl" mode="aspectFill" />
        <view v-else class="account-avatar placeholder">👤</view>
        <view class="list-main">
          <input v-if="editingNick" v-model="nickDraft" class="inline-input" @confirm="saveNick" />
          <view v-else class="list-title">{{ displayName }}</view>
          <view class="list-meta">生活专属助手</view>
        </view>
        <text class="icon-btn" @click="editingNick = !editingNick">{{ editingNick ? '✔️' : '✏️' }}</text>
      </view>
      <view class="list-row">
        <view class="emoji-cell">👤</view>
        <view class="list-main">
          <view class="list-title">{{ user.username || '—' }}</view>
          <view class="list-meta">登录用户名</view>
        </view>
      </view>
      <view class="list-row">
        <view class="emoji-cell">📅</view>
        <view class="list-main">
          <view class="list-title">{{ fmt(user.created_at) }}</view>
          <view class="list-meta">注册时间</view>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">资金账户</view>
      <view v-for="a in accounts" :key="a.id" class="list-row">
        <view class="emoji-cell">{{ a.emoji || '💵' }}</view>
        <view class="list-main list-title">{{ a.name }}</view>
        <text v-if="a.is_builtin" class="badge badge-primary">预置</text>
        <text v-else class="icon-btn" @click="removeAcc(a)">🗑️</text>
      </view>
      <view class="gap"></view>
      <view class="field"><text class="fl">新增自定义账户</text><input v-model="accName" placeholder="账户名称（如：信用卡）" /></view>
      <view class="field"><text class="fl">选择表情</text><EmojiPicker v-model="accEmoji" /></view>
      <button class="btn btn-secondary btn-block" @click="addAcc">添加</button>
    </view>

    <view class="card">
      <view class="card-title">修改密码</view>
      <view class="field"><text class="fl">当前密码</text><input v-model="oldPw" password /></view>
      <view class="field"><text class="fl">新密码</text><input v-model="newPw" password /></view>
      <view class="field"><text class="fl">确认新密码</text><input v-model="confirmPw" password /></view>
      <button class="btn btn-primary btn-block" @click="changePw">更新密码</button>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { api } from '../../common/api'
import { useAuth } from '../../common/auth'
import { useTheme } from '../../common/theme'
import { fmtDateTime } from '../../common/format'
import EmojiPicker from '../../components/EmojiPicker.vue'
import { useAvatar } from '../../common/avatar'

export default {
  components: { EmojiPicker },
  setup() {
    const themeApi = useTheme()
    const theme = themeApi.state
    const themeClass = themeApi.classNames
    const avatar = useAvatar()
    const auth = useAuth()
    const user = ref(auth.state.user || {})
    const editingNick = ref(false)
    const nickDraft = ref('')
    const accounts = ref([])
    const accName = ref('')
    const accEmoji = ref('💵')
    const oldPw = ref('')
    const newPw = ref('')
    const confirmPw = ref('')
    const displayName = computed(() => (user.value && (user.value.nickname || user.value.username)) || '未登录')

    function fmt(v) {
      return fmtDateTime(v) || '—'
    }
    async function loadMe() {
      const r = await api.me()
      if (r.ok) {
        user.value = r.data.user
        auth.setUser(r.data.user)
        nickDraft.value = displayName.value
      }
    }
    async function loadAcc() {
      const r = await api.accounts()
      if (r.ok) accounts.value = r.data.accounts || []
    }
    async function saveNick() {
      const r = await api.updateNickname(nickDraft.value)
      if (r.ok) {
        auth.setUser(r.data.user)
        user.value = r.data.user
        editingNick.value = false
        uni.showToast({ title: '昵称已更新' })
      } else {
        uni.showToast({ title: r.error || '更新失败', icon: 'none' })
      }
    }
    async function addAcc() {
      if (!accName.value) {
        uni.showToast({ title: '请输入账户名称', icon: 'none' })
        return
      }
      const r = await api.addAccount(accName.value, accEmoji.value)
      if (r.ok) {
        uni.showToast({ title: '账户已添加' })
        accName.value = ''
        loadAcc()
      } else {
        uni.showToast({ title: r.error || '添加失败', icon: 'none' })
      }
    }
    async function removeAcc(a) {
      const ok = await new Promise((resolve) => {
        uni.showModal({ title: '删除账户', content: '确认删除「' + a.name + '」？', success: (res) => resolve(res.confirm) })
      })
      if (!ok) return
      const r = await api.deleteAccount(a.id)
      if (r.ok) {
        uni.showToast({ title: '已删除' })
        loadAcc()
      }
    }
    async function changePw() {
      if (newPw.value.length < 6) {
        uni.showToast({ title: '新密码至少 6 位', icon: 'none' })
        return
      }
      if (newPw.value !== confirmPw.value) {
        uni.showToast({ title: '两次输入不一致', icon: 'none' })
        return
      }
      const r = await api.changePassword(oldPw.value, newPw.value)
      if (r.ok) {
        uni.showToast({ title: '密码已更新，请重新登录' })
        auth.clear()
        setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 800)
      } else {
        uni.showToast({ title: r.error || '修改失败', icon: 'none' })
      }
    }
    return { theme, themeClass, avatar, user, editingNick, nickDraft, accounts, accName, accEmoji, oldPw, newPw, confirmPw, displayName, fmt, saveNick, addAcc, removeAcc, changePw, loadMe, loadAcc }
  },
  onLoad() {
    if (!useAuth().isLogin) {
      uni.reLaunch({ url: '/pages/login/login' })
      return
    }
    this.loadMe()
    this.loadAcc()
  }
}
</script>

<style lang="scss">
.account-avatar { width: 88rpx; height: 88rpx; border-radius: 50%; background: #eef2ff; margin-right: 16rpx; flex-shrink: 0; }
.account-avatar.placeholder { display: flex; align-items: center; justify-content: center; font-size: 44rpx; }
.inline-input { border: 1rpx solid #0f52ba; border-radius: 10rpx; padding: 8rpx 12rpx; font-size: 28rpx; }
.gap { height: 24rpx; }
</style>
