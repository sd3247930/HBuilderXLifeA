<template>
  <view>
    <view class="page-head row-between">
      <view>
        <view class="head-h2">习惯打卡</view>
        <view class="muted">点击圆点打卡 / 取消</view>
      </view>
      <view class="row week-nav">
        <view class="nav-btn" @click="shift(-1)">‹</view>
        <view class="nav-btn" @click="shift(1)">›</view>
      </view>
    </view>

    <view v-if="habits.length" class="card">
      <view v-for="h in habits" :key="h.id" class="habit-row">
        <view class="habit-head row-between">
          <view class="row">
            <EmojiTip :emoji="h.icon || '⭐'" class="emoji-cell" />
            <text class="habit-name">{{ h.name }}</text>
          </view>
          <view class="row">
            <text class="badge badge-primary">{{ h.week_count }}/7</text>
            <text class="badge" style="margin-left:10rpx">最长 {{ h.longest_streak }} 天</text>
            <text class="icon-btn" @click="remove(h)">🗑️</text>
          </view>
        </view>
        <view class="week-row" style="margin-top:16rpx">
          <view v-for="day in week" :key="day" class="week-day">
            <view class="wd-label">{{ dayLabel(day) }}</view>
            <view class="dot-wrap" @click="toggle(h, day)">
              <view class="dot" :class="{ checked: isChecked(h, day) }"></view>
            </view>
          </view>
        </view>
      </view>
      <view class="muted link-like" @click="goAdd">添加习惯 →</view>
    </view>
    <view v-else class="card empty" @click="goAdd">还没有习惯，点这里添加</view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { api } from '../common/api'
import { weekDates, shiftWeek, todayLocal } from '../common/format'
import EmojiTip from './EmojiTip.vue'

export default {
  name: 'HabitsTab',
  components: { EmojiTip },
  setup() {
    const anchor = ref(todayLocal())
    const habits = ref([])
    const week = computed(() => weekDates(anchor.value))

    function dayLabel(d) {
      const date = new Date(d + 'T00:00:00')
      return '一二三四五六日'[date.getDay() === 0 ? 6 : date.getDay() - 1]
    }
    function isChecked(h, d) {
      return (h.checkin_dates || []).indexOf(d) >= 0
    }
    async function load() {
      const r = await api.habits(anchor.value)
      if (r.ok) habits.value = r.data.habits || []
    }
    function shift(delta) {
      anchor.value = shiftWeek(anchor.value, delta)
      load()
    }
    async function toggle(h, day) {
      const r = await api.checkin(h.id, day)
      if (r.ok) {
        load()
      } else {
        uni.showToast({ title: r.error || '操作失败', icon: 'none' })
      }
    }
    async function remove(h) {
      const ok = await new Promise((resolve) => {
        uni.showModal({ title: '删除习惯', content: '删除「' + h.name + '」及其打卡记录？', success: (res) => resolve(res.confirm) })
      })
      if (!ok) return
      const r = await api.deleteHabit(h.id)
      if (r.ok) {
        uni.showToast({ title: '已删除' })
        load()
      }
    }
    function goAdd() {
      uni.navigateTo({ url: '/pages/add-habit/add-habit' })
    }
    return { anchor, habits, week, dayLabel, isChecked, load, shift, toggle, remove, goAdd }
  },
  mounted() {
    this.load()
  }
}
</script>

<style lang="scss">
.page-head { margin-bottom: 24rpx; }
.head-h2 { font-size: 40rpx; font-weight: 700; margin-bottom: 8rpx; }
.week-nav .nav-btn {
  width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center;
  background: #f1f5f9; border-radius: 50%; color: #334155; font-size: 40rpx; line-height: 1;
  margin-left: 16rpx;
}
.th-dark .week-nav .nav-btn { background: #121826; color: #e5e9f0; }
.habit-row { padding: 20rpx 0; border-bottom: 1rpx solid #f1f5f9; }
.th-dark .habit-row { border-color: #2b3547; }
.habit-row:last-child { border-bottom: 0; }
.habit-name { font-size: 30rpx; font-weight: 600; }
.wd-label { margin-bottom: 10rpx; }
.dot-wrap { display: inline-flex; padding: 14rpx 4rpx; }
.dot { width: 44rpx; height: 44rpx; }
.link-like { margin-top: 18rpx; color: #0f52ba; }
</style>
