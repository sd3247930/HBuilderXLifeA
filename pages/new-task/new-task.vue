<template>
  <view :class="['page', themeClass]">
    <view class="card">
      <view class="field"><text class="fl">任务标题</text><input class="task-input" :class="{ 'task-focus': focusTitle }" v-model="title" placeholder="要做什么？" placeholder-style="color:#b0b8c4;font-size:28rpx;" @focus="focusTitle = true" @blur="focusTitle = false" /></view>
      <view class="field"><text class="fl">备注</text><input class="task-input" :class="{ 'task-focus': focusNote }" v-model="note" placeholder="可选" placeholder-style="color:#b0b8c4;font-size:28rpx;" @focus="focusNote = true" @blur="focusNote = false" /></view>
      <view class="row">
        <view class="field" style="flex:1;margin-right:16rpx">
          <text class="fl">截止日期</text>
          <picker mode="date" :value="dueDate" @change="onDate"><view class="picker-box task-picker">{{ dueDate || '未设置' }}</view></picker>
        </view>
        <view class="field" style="flex:1">
          <text class="fl">截止时间</text>
          <picker mode="time" :value="dueTime" @change="onTime"><view class="picker-box task-picker">{{ dueTime || '未设置' }}</view></picker>
        </view>
      </view>
      <view class="field"><text class="fl">优先级</text><picker :range="['低', '中', '高']" @change="onPri"><view class="picker-box task-picker">{{ ['低', '中', '高'][priority] }}</view></picker></view>
      <button class="btn btn-primary btn-block task-submit" @click="submit">创建任务</button>
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
    const title = ref('')
    const note = ref('')
    const dueDate = ref('')
    const dueTime = ref('')
    const priority = ref(0)
    const focusTitle = ref(false)
    const focusNote = ref(false)
    function onDate(e) { dueDate.value = e.detail.value }
    function onTime(e) { dueTime.value = e.detail.value }
    function onPri(e) { priority.value = Number(e.detail.value) }
    async function submit() {
      if (!title.value) {
        uni.showToast({ title: '请输入任务标题', icon: 'none' })
        return
      }
      const r = await api.addTask({
        title: title.value,
        note: note.value || null,
        due_date: dueDate.value || null,
        due_time: dueTime.value || null,
        priority: priority.value
      })
      if (r.ok) {
        uni.showToast({ title: '任务已创建' })
        setTimeout(() => uni.navigateBack(), 600)
      } else {
        uni.showToast({ title: r.error || '创建失败', icon: 'none' })
      }
    }
    return { theme, themeClass, title, note, dueDate, dueTime, priority, focusTitle, focusNote, onDate, onTime, onPri, submit }
  },
  onLoad() {
    if (!useAuth().isLogin) {
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
}
</script>

<style lang="scss">
.fl { font-size: 28rpx; color: #475569; }
.task-input, .task-picker {
  min-height: 88rpx; background: #f7f9fc; border: 1px solid #e2e8f0;
  border-radius: 16rpx; font-size: 32rpx; color: #1a1a1a;
}
.task-input { padding: 0 24rpx; box-sizing: border-box; }
uni-input.task-input .uni-input-input { height: 88rpx; font-size: 32rpx; color: #1a1a1a; }
.task-focus, uni-input.task-input.task-focus { border-color: #0f52ba; background: #ffffff; }
.task-picker { display: flex; align-items: center; padding: 0 24rpx; box-sizing: border-box; }
.task-submit { margin-top: 10rpx; }
.th-dark .task-input, .th-dark .task-picker { background: #121826; color: #e5e9f0; border-color: #2b3547; }
.th-dark uni-input.task-input .uni-input-input { color: #e5e9f0; }
</style>
