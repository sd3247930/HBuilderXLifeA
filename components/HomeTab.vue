<template>
  <view class="home-page">
    <!-- 极简顶部：日期 + 设置 -->
    <view class="top-bar">
      <text class="top-date">📅 {{ todayDate }}</text>
      <text class="top-setting" @click="go('/pages/settings/settings')">⚙️</text>
    </view>

    <!-- 用户信息 + 名言（一行，保留 UserAvatar 占位逻辑） -->
    <view class="user-row">
      <UserAvatar size="72rpx" navigate="/pages/settings/settings" />
      <view class="user-info">
        <text class="user-name">你好，{{ name }}</text>
        <text class="user-quote" @click="refreshQuote">💭 “{{ dailyQuote.text }}”——{{ dailyQuote.author }}</text>
      </view>
    </view>

    <!-- 财务双卡片 -->
    <view class="card-row">
      <view class="card-half balance-card" @click="go('/pages/finance/finance')">
        <text class="card-label">本月结余</text>
        <text class="card-value balance">{{ money(d.month.balance) }}</text>
        <text class="card-link">查看详情 →</text>
      </view>
      <view class="card-half income-card" @click="go('/pages/finance/finance')">
        <text class="card-label">今日收支</text>
        <view class="income-row">
          <text class="income-text">↑ {{ money(d.today.income) }}</text>
          <text class="expense-text">↓ {{ money(d.today.expense) }}</text>
        </view>
        <text class="card-link">查看明细 →</text>
      </view>
    </view>

    <!-- 习惯 + 任务双卡片 -->
    <view class="card-row">
      <view class="card-half habit-card" @click="$emit('tab', 'habits')">
        <view class="card-header">
          <text class="card-label">习惯打卡</text>
          <text class="card-badge habit-badge">{{ habitCount }}</text>
        </view>
        <view v-if="habits.length" class="mini-list">
          <view v-for="h in habits.slice(0, 2)" :key="h.id" class="mini-item">
            <text class="mini-icon">{{ h.icon || '⭐' }}</text>
            <text class="mini-name">{{ h.name }}</text>
            <text class="mini-count">{{ h.week_count || 0 }}/7</text>
          </view>
        </view>
        <text v-else class="card-empty" @click.stop="go('/pages/add-habit/add-habit')">暂无习惯，去添加 →</text>
      </view>
      <view class="card-half task-card" @click="go('/pages/tasks/tasks')">
        <view class="card-header">
          <text class="card-label">今日任务</text>
          <text class="card-badge task-badge">{{ taskCount }}</text>
        </view>
        <view v-if="tasks.length" class="mini-list">
          <view v-for="t in tasks.slice(0, 2)" :key="t.id" class="mini-item">
            <text class="mini-status">●</text>
            <text class="mini-name task-title">{{ t.title }}</text>
          </view>
        </view>
        <text v-else class="card-empty" @click.stop="go('/pages/new-task/new-task')">暂无任务，去添加 →</text>
      </view>
    </view>

    <!-- 快捷入口（4 个一行） -->
    <view class="quick-actions">
      <view class="quick-item" @click="$emit('tab', 'record')">
        <text class="quick-icon">✏️</text>
        <text class="quick-label">记一笔</text>
      </view>
      <view class="quick-item" @click="$emit('tab', 'habits')">
        <text class="quick-icon">✅</text>
        <text class="quick-label">习惯打卡</text>
      </view>
      <view class="quick-item" @click="$emit('tab', 'stats')">
        <text class="quick-icon">📊</text>
        <text class="quick-label">统计</text>
      </view>
      <view class="quick-item" @click="go('/pages/finance/finance')">
        <text class="quick-icon">💰</text>
        <text class="quick-label">财务记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { api } from '../common/api'
import { fmtMoney } from '../common/format'
import { useAuth } from '../common/auth'
import UserAvatar from './UserAvatar.vue'
import { getDailyQuote, getRandomQuote } from '../common/quotes'

function formatToday() {
  const now = new Date()
  const week = '日一二三四五六'[now.getDay()]
  return now.getFullYear() + '年' + String(now.getMonth() + 1).padStart(2, '0') + '月' + String(now.getDate()).padStart(2, '0') + '日 星期' + week
}

export default {
  name: 'HomeTab',
  components: { UserAvatar },
  emits: ['tab'],
  setup() {
    const d = ref({ today: {}, month: {}, habits: [], tasks: [] })
    const auth = useAuth()
    const name = computed(() => (auth.state.user ? auth.state.user.nickname || auth.state.user.username : ''))
    const dailyQuote = ref(getDailyQuote())
    const todayDate = ref(formatToday())
    const habits = computed(() => d.value.habits || [])
    const tasks = computed(() => d.value.tasks || [])
    const habitCount = computed(() => habits.value.length)
    const taskCount = computed(() => tasks.value.length)

    function money(v) {
      return fmtMoney(v)
    }
    function go(url) {
      uni.navigateTo({ url })
    }
    function refreshQuote() {
      dailyQuote.value = getRandomQuote()
    }
    async function load() {
      const r = await api.dashboard()
      if (r.ok) d.value = r.data.dashboard || d.value
    }

    return {
      d, name, dailyQuote, todayDate, habits, tasks, habitCount, taskCount,
      money, go, refreshQuote, load
    }
  },
  mounted() {
    this.load()
  }
}
</script>

<style lang="scss">
.home-page { padding-bottom: 8rpx; }

.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 6rpx 0 16rpx; }
.top-date { font-size: 24rpx; color: #64748b; }
.top-setting { font-size: 32rpx; color: #64748b; padding: 4rpx; }

.user-row {
  display: flex; align-items: center;
  padding: 4rpx 0 18rpx; border-bottom: 1rpx solid #e2e8f0; margin-bottom: 18rpx;
}
.th-dark .user-row { border-color: #2b3547; }
.user-info { flex: 1; min-width: 0; margin-left: 16rpx; }
.user-name { display: block; font-size: 32rpx; font-weight: 700; }
.user-quote {
  display: block; margin-top: 6rpx; font-size: 22rpx; color: #94a3b8;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.card-row { display: flex; gap: 16rpx; margin-bottom: 16rpx; }
.card-half {
  flex: 1; min-width: 0; background: #ffffff; border: 1rpx solid #e2e8f0;
  border-radius: 16rpx; padding: 18rpx 20rpx; box-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.04);
  box-sizing: border-box;
}
.th-dark .card-half { background: #1b2230; border-color: #2b3547; }
.card-label { display: block; font-size: 22rpx; color: #64748b; }
.card-value { display: block; font-size: 34rpx; font-weight: 700; margin: 10rpx 0 6rpx; }
.card-value.balance { color: #059669; }
.card-link { display: inline-block; font-size: 20rpx; color: #0f52ba; margin-top: 8rpx; }
.card-empty { display: block; font-size: 22rpx; color: #94a3b8; margin-top: 16rpx; }

.income-row { display: flex; gap: 18rpx; margin: 12rpx 0 6rpx; }
.income-text { color: #059669; font-weight: 700; font-size: 26rpx; }
.expense-text { color: #dc2626; font-weight: 700; font-size: 26rpx; }

.card-header { display: flex; align-items: center; justify-content: space-between; }
.card-badge {
  color: #fff; font-size: 20rpx; line-height: 1.6;
  min-width: 36rpx; text-align: center; padding: 0 10rpx; border-radius: 20rpx;
}
.habit-badge { background: #059669; }
.task-badge { background: #f59e0b; }
.mini-list { margin-top: 8rpx; }
.mini-item { display: flex; align-items: center; padding: 8rpx 0; font-size: 24rpx; }
.mini-icon { margin-right: 8rpx; font-size: 26rpx; }
.mini-name { flex: 1; min-width: 0; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.th-dark .mini-name { color: #e5e9f0; }
.mini-count { color: #64748b; font-size: 22rpx; }
.mini-status { color: #059669; font-size: 18rpx; margin-right: 8rpx; }
.task-title { color: #1e293b; }

.quick-actions {
  display: flex; justify-content: space-around;
  background: #ffffff; border: 1rpx solid #e2e8f0;
  border-radius: 16rpx; padding: 16rpx 0; box-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.04);
}
.th-dark .quick-actions { background: #1b2230; border-color: #2b3547; }
.quick-item { display: flex; flex-direction: column; align-items: center; padding: 4rpx 20rpx; }
.quick-icon { font-size: 40rpx; line-height: 1.2; }
.quick-label { font-size: 20rpx; color: #64748b; margin-top: 6rpx; }
</style>
