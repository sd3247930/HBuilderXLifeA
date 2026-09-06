<template>
  <view :class="['app-root', themeClass]">
    <scroll-view class="app-body" scroll-y>
      <view class="page">
        <HomeTab v-if="tab === 'home'" :key="refreshKey" @tab="switchTab" />
        <RecordTab v-else-if="tab === 'record'" :key="refreshKey" />
        <HabitsTab v-else-if="tab === 'habits'" :key="refreshKey" />
        <StatsTab v-else-if="tab === 'stats'" :key="refreshKey" />
      </view>
    </scroll-view>

    <!-- 更多抽屉 -->
    <view v-if="drawer" class="mask" @click="drawer = false"></view>
    <view v-if="drawer" class="drawer">
      <view class="drawer-head">
        <image v-if="avatar.dataUrl" class="drawer-avatar" :src="avatar.dataUrl" mode="aspectFill" />
        <view v-else class="drawer-avatar placeholder">👤</view>
        <view class="drawer-user">
          <view class="drawer-name">{{ displayName }}</view>
          <view class="drawer-sub">生活专属助手</view>
        </view>
      </view>
      <view class="drawer-title">更多功能</view>
      <view v-for="m in menus" :key="m.url" class="drawer-item" @click="go(m.url)">{{ m.icon }} {{ m.label }}</view>
      <view class="drawer-item logout" @click="logout">🚪 退出登录</view>
    </view>

    <!-- 底部导航：4 Tab + 更多 -->
    <view class="tab-bar safe-bottom">
      <view v-for="t in tabs" :key="t.key" class="tab-item" @click="switchTab(t.key)">
        <view class="tab-icon">{{ t.icon }}</view>
        <view class="tab-label" :class="{ active: tab === t.key }">{{ t.label }}</view>
      </view>
      <view class="tab-item" @click="drawer = true">
        <view class="tab-icon">☰</view>
        <view class="tab-label">更多</view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import HomeTab from '../../components/HomeTab.vue'
import RecordTab from '../../components/RecordTab.vue'
import HabitsTab from '../../components/HabitsTab.vue'
import StatsTab from '../../components/StatsTab.vue'
import { useAuth } from '../../common/auth'
import { useTheme } from '../../common/theme'
import { api } from '../../common/api'
import { useAvatar } from '../../common/avatar'

export default {
  components: { HomeTab, RecordTab, HabitsTab, StatsTab },
  setup() {
    const themeApi = useTheme()
    const theme = themeApi.state
    const themeClass = themeApi.classNames
    const avatar = useAvatar()
    const auth = useAuth()
    const displayName = computed(() => auth.displayName)
    const tab = ref('home')
    const drawer = ref(false)
    const refreshKey = ref(0)

    const tabs = [
      { key: 'home', icon: '🏠', label: '首页' },
      { key: 'record', icon: '✏️', label: '记账' },
      { key: 'habits', icon: '✅', label: '习惯' },
      { key: 'stats', icon: '📊', label: '统计' }
    ]
    const menus = [
      { icon: '👤', label: '账户管理', url: '/pages/account/account' },
      { icon: '🏷️', label: '分类管理', url: '/pages/categories/categories' },
      { icon: '📋', label: '待办任务', url: '/pages/tasks/tasks' },
      { icon: '➕', label: '新建任务', url: '/pages/new-task/new-task' },
      { icon: '💰', label: '财务记录', url: '/pages/finance/finance' },
      { icon: '⚙️', label: '设置', url: '/pages/settings/settings' }
    ]

    function switchTab(key) {
      tab.value = key
      drawer.value = false
      refreshKey.value++
    }
    function go(url) {
      drawer.value = false
      uni.navigateTo({ url })
    }
    async function logout() {
      drawer.value = false
      await api.logout()
      auth.clear()
      uni.reLaunch({ url: '/pages/login/login' })
    }

    return { theme, themeClass, avatar, displayName, tab, drawer, refreshKey, tabs, menus, switchTab, go, logout }
  },
  onLoad() {
    if (!useAuth().isLogin) {
      uni.reLaunch({ url: '/pages/login/login' })
      return
    }
    // 回填用户信息（昵称/注册时间等）
    api.me().then((r) => {
      if (r.ok) useAuth().setUser(r.data.user)
    })
  },
  onShow() {
    this.refreshKey++
  }
}
</script>

<style lang="scss">
.app-root { display: flex; flex-direction: column; height: 100vh; background: #f8fafc; }
.th-dark .app-root { background: #0f1420; }
.app-body { flex: 1; height: 0; }

.tab-bar {
  display: flex;
  border-top: 1rpx solid #e2e8f0;
  background: #ffffff;
  padding-top: 14rpx;
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
.th-dark .tab-bar { background: #1b2230; border-color: #2b3547; }
.tab-item { flex: 1; text-align: center; padding-bottom: 10rpx; }
.tab-icon { font-size: 38rpx; }
.tab-label { font-size: 22rpx; color: #64748b; margin-top: 4rpx; }
.tab-label.active { color: #0f52ba; font-weight: 600; }

.mask { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 90; }
.drawer {
  position: fixed; top: 0; right: 0; bottom: 0; width: 60%;
  background: #ffffff; z-index: 99; padding: 40rpx 32rpx; box-sizing: border-box;
  padding-right: calc(env(safe-area-inset-right) + 32rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 40rpx);
}
.th-dark .drawer { background: #1b2230; }
.drawer-title { font-size: 34rpx; font-weight: 700; margin-bottom: 24rpx; }
.drawer-head { display: flex; align-items: center; padding: 12rpx 8rpx 24rpx; border-bottom: 1rpx solid #f1f5f9; margin-bottom: 20rpx; }
.th-dark .drawer-head { border-color: #2b3547; }
.drawer-avatar { width: 96rpx; height: 96rpx; border-radius: 50%; background: #eef2ff; flex-shrink: 0; }
.drawer-avatar.placeholder { display: flex; align-items: center; justify-content: center; font-size: 48rpx; }
.drawer-user { margin-left: 20rpx; min-width: 0; }
.drawer-name { font-size: 30rpx; font-weight: 600; }
.drawer-sub { font-size: 22rpx; color: #64748b; margin-top: 4rpx; }
.drawer-item {
  padding: 26rpx 8rpx; font-size: 30rpx; border-bottom: 1rpx solid #f1f5f9;
}
.th-dark .drawer-item { border-color: #2b3547; }
.drawer-item.logout { color: #dc2626; margin-top: 40rpx; }
</style>
