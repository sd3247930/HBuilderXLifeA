<template>
  <view>
    <view class="page-head row-between">
      <view class="row head-left">
        <UserAvatar :src="avatar.dataUrl" size="88rpx" navigate="/pages/settings/settings" />
        <view class="head-text">
          <view class="head-h2">今日概览</view>
          <view class="muted">你好，{{ name }}，今天也要元气满满。</view>
        </view>
      </view>
      <text class="btn btn-ghost btn-sm head-btn" @click="go('/pages/settings/settings')">⚙️ 设置</text>
    </view>

    <view class="card hero-card">
      <view class="row-between card-head">
        <text class="card-title-inline">今日财务</text>
        <text class="badge badge-success">本月结余 {{ money(d.month.balance) }}</text>
      </view>
      <view class="grid2">
        <view class="stat-card">
          <view class="stat-label">今日收入</view>
          <view class="stat-value income">{{ money(d.today.income) }}</view>
        </view>
        <view class="stat-card">
          <view class="stat-label">今日支出</view>
          <view class="stat-value expense">{{ money(d.today.expense) }}</view>
        </view>
      </view>
      <view class="muted month-line">本月收入 {{ money(d.month.income) }} · 支出 {{ money(d.month.expense) }}</view>
      <view class="muted link-like" @click="go('/pages/finance/finance')">查看财务记录 →</view>
    </view>

    <view class="card">
      <view class="row-between card-head">
        <text class="card-title-inline">进行中习惯</text>
        <text class="btn btn-ghost btn-sm" @click="$emit('tab', 'habits')">管理</text>
      </view>
      <view v-if="d.habits && d.habits.length">
        <view v-for="h in d.habits" :key="h.id" class="list-row">
          <view class="emoji-cell">{{ h.icon || '⭐' }}</view>
          <view class="list-main list-title">{{ h.name }}</view>
          <view class="badge" :class="{ 'badge-success': h.week_count >= 7 }">{{ h.week_count }}/7</view>
        </view>
      </view>
      <view v-else class="empty empty-link" @click="go('/pages/add-habit/add-habit')">还没有习惯，去添加一个 →</view>
    </view>

    <view class="card">
      <view class="row-between card-head">
        <text class="card-title-inline">今日任务</text>
        <text class="btn btn-secondary btn-sm" @click="go('/pages/new-task/new-task')">新建任务</text>
      </view>
      <view v-if="d.tasks && d.tasks.length">
        <view v-for="t in d.tasks" :key="t.id" class="list-row">
          <view class="list-main">
            <view class="list-title">{{ t.title }}</view>
            <view class="list-meta">截止日期: {{ t.due_date || '未设置' }}{{ t.due_time ? ' ' + t.due_time : '' }}</view>
          </view>
        </view>
      </view>
      <view v-else class="empty empty-link" @click="go('/pages/tasks/tasks')">暂无待办任务，去添加 →</view>
    </view>

    <view class="card">
      <view class="row-between card-head">
        <text class="card-title-inline">快捷入口</text>
        <text class="muted">常用功能</text>
      </view>
      <view class="quick-grid">
        <view class="quick-item" @click="$emit('tab', 'record')">
          <text class="quick-icon">✏️</text>
          <text class="quick-name">记一笔</text>
        </view>
        <view class="quick-item" @click="$emit('tab', 'habits')">
          <text class="quick-icon">✅</text>
          <text class="quick-name">习惯打卡</text>
        </view>
        <view class="quick-item" @click="$emit('tab', 'stats')">
          <text class="quick-icon">📊</text>
          <text class="quick-name">统计</text>
        </view>
        <view class="quick-item" @click="go('/pages/finance/finance')">
          <text class="quick-icon">💰</text>
          <text class="quick-name">财务记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { api } from '../common/api'
import { fmtMoney } from '../common/format'
import { useAuth } from '../common/auth'
import { useAvatar } from '../common/avatar'
import UserAvatar from './UserAvatar.vue'

export default {
  name: 'HomeTab',
  components: { UserAvatar },
  emits: ['tab'],
  setup() {
    const d = ref({ today: {}, month: {}, habits: [], tasks: [] })
    const auth = useAuth()
    const avatar = useAvatar()
    const name = computed(() => (auth.state.user ? auth.state.user.nickname || auth.state.user.username : ''))

    function money(v) {
      return fmtMoney(v)
    }
    function go(url) {
      uni.navigateTo({ url })
    }
    async function load() {
      const r = await api.dashboard()
      if (r.ok) d.value = r.data.dashboard || d.value
    }
    return { d, avatar, name, money, go, load }
  },
  mounted() {
    this.load()
  }
}
</script>

<style lang="scss">
.page-head { margin-bottom: 24rpx; }
.head-left { min-width: 0; flex: 1; }
.head-text { margin-left: 16rpx; min-width: 0; }
.head-h2 { font-size: 40rpx; font-weight: 700; margin-bottom: 8rpx; }
.head-btn { flex-shrink: 0; }
.card-head { margin-bottom: 14rpx; }
.month-line { margin-top: 16rpx; }
.link-like { margin-top: 14rpx; color: #0f52ba; }
.card-title-inline { font-size: 32rpx; font-weight: 600; }
.empty-link { color: #0f52ba; }
.hero-card .grid2 { margin-top: 6rpx; }
.quick-grid { display: flex; }
.quick-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 16rpx 0 6rpx; border-radius: 16rpx;
}
.quick-item:active { background: #f1f5f9; }
.quick-icon { font-size: 44rpx; line-height: 1.2; }
.quick-name { font-size: 24rpx; color: #475569; margin-top: 10rpx; }
</style>
