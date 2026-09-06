<template>
  <view :class="['page', themeClass]">
    <view class="card">
      <view class="field"><text class="fl">任务标题</text><input v-model="title" placeholder="要做什么？" /></view>
      <view class="field"><text class="fl">备注</text><input v-model="note" placeholder="可选" /></view>
      <view class="row">
        <view class="field" style="flex:1;margin-right:16rpx">
          <text class="fl">截止日期</text>
          <picker mode="date" :value="dueDate" @change="onDate"><view class="picker-box">{{ dueDate || '未设置' }}</view></picker>
        </view>
        <view class="field" style="flex:1">
          <text class="fl">截止时间</text>
          <picker mode="time" :value="dueTime" @change="onTime"><view class="picker-box">{{ dueTime || '未设置' }}</view></picker>
        </view>
      </view>
      <view class="field"><text class="fl">优先级</text><picker :range="['低', '中', '高']" @change="onPri"><view class="picker-box">{{ ['低', '中', '高'][priority] }}</view></picker></view>
      <button class="btn btn-primary btn-block" @click="submit">创建任务</button>
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
    return { theme, themeClass, title, note, dueDate, dueTime, priority, onDate, onTime, onPri, submit }
  },
  onLoad() {
    if (!useAuth().isLogin) {
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
}
</script>
