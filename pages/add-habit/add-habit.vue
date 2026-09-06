<template>
  <view :class="['page', themeClass]">
    <view class="card">
      <view class="field"><text class="fl">习惯名称</text><input class="habit-input" :class="{ 'task-focus': focusName }" v-model="name" placeholder="如：晨跑、阅读 20 页" placeholder-style="color:#b0b8c4;font-size:28rpx;" @focus="focusName = true" @blur="focusName = false" /></view>
      <view class="field">
        <text class="fl">选择图标（悬停或长按可查看含义）</text>
        <view class="emoji-panel"><EmojiPicker v-model="icon" /></view>
      </view>
      <button class="btn btn-primary btn-block habit-submit" @click="submit">添加习惯</button>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'
import { api } from '../../common/api'
import { useAuth } from '../../common/auth'
import { useTheme } from '../../common/theme'
import EmojiPicker from '../../components/EmojiPicker.vue'

export default {
  components: { EmojiPicker },
  setup() {
    const themeApi = useTheme()
    const theme = themeApi.state
    const themeClass = themeApi.classNames
    const name = ref('')
    const icon = ref('⭐')
    const focusName = ref(false)
    async function submit() {
      if (!name.value) {
        uni.showToast({ title: '请输入习惯名称', icon: 'none' })
        return
      }
      const r = await api.addHabit(name.value, icon.value)
      if (r.ok) {
        uni.showToast({ title: '习惯已添加' })
        setTimeout(() => uni.navigateBack(), 600)
      } else {
        uni.showToast({ title: r.error || '添加失败', icon: 'none' })
      }
    }
    return { theme, themeClass, name, icon, focusName, submit }
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
.habit-input {
  min-height: 88rpx; background: #f7f9fc; border: 1px solid #e2e8f0;
  border-radius: 16rpx; padding: 0 24rpx; font-size: 32rpx; color: #1a1a1a; box-sizing: border-box;
}
uni-input.habit-input .uni-input-input { height: 88rpx; font-size: 32rpx; color: #1a1a1a; }
.task-focus, uni-input.habit-input.task-focus { border-color: #0f52ba; background: #ffffff; }
.emoji-panel {
  background: #f7f9fc; border: 1px solid #e2e8f0; border-radius: 16rpx; padding: 16rpx;
}
.emoji-panel .emoji-grid { display: flex; flex-wrap: wrap; }
.emoji-panel .emoji-item {
  width: 84rpx; height: 84rpx; margin: 8rpx; font-size: 44rpx;
  border-radius: 14rpx; border: 1px solid #e2e8f0; background: #ffffff;
}
.emoji-panel .emoji-item.active {
  border-color: #0f52ba; border-width: 2rpx; background: #eef2ff;
  box-shadow: 0 0 0 2rpx rgba(15, 82, 186, 0.18);
}
.habit-submit { margin-top: 10rpx; }
.th-dark .habit-input, .th-dark .emoji-panel { background: #121826; border-color: #2b3547; }
.th-dark uni-input.habit-input .uni-input-input { color: #e5e9f0; }
.th-dark .emoji-panel .emoji-item { background: #1b2230; border-color: #2b3547; }
.th-dark .emoji-panel .emoji-item.active { background: #1e2a41; }
</style>
