<template>
  <view :class="['page', themeClass]">
    <view class="card">
      <view class="field"><text class="fl">习惯名称</text><input v-model="name" placeholder="如：晨跑、阅读 20 页" /></view>
      <view class="field"><text class="fl">选择图标（H5 悬停 / 触屏长按看含义）</text><EmojiPicker v-model="icon" /></view>
      <button class="btn btn-primary btn-block" @click="submit">添加习惯</button>
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
    return { theme, themeClass, name, icon, submit }
  },
  onLoad() {
    if (!useAuth().isLogin) {
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
}
</script>
