<template>
  <view :class="['page', themeClass]">
    <view class="card">
      <view class="card-title">个人头像</view>
      <view class="row">
        <UserAvatar :src="avatar.dataUrl" size="120rpx" />
        <view style="margin-left:24rpx">
          <text class="btn btn-secondary btn-sm" @click="chooseAvatar">上传头像</text>
          <text v-if="avatar.dataUrl" class="btn btn-ghost btn-sm" @click="removeAvatar">移除</text>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">外观设置</view>
      <view class="list-row row-between">
        <text>深色模式</text>
        <switch :checked="theme.dark" color="#0f52ba" @change="onDark" />
      </view>
      <view class="muted" style="margin:10rpx 0 16rpx">主题风格</view>
      <view class="grid2">
        <view
          v-for="s in styles"
          :key="s.value"
          class="btn style-card"
          :class="theme.style === s.value ? 'btn-primary' : 'btn-ghost'"
          @click="setStyle(s.value)"
        >{{ s.label }}</view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">账户与分类</view>
      <view class="grid2">
        <view class="btn btn-ghost style-card" @click="go('/pages/account/account')">账户管理</view>
        <view class="btn btn-ghost style-card" @click="go('/pages/categories/categories')">分类管理</view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">隐私与合规</view>
      <view class="list-row row-between" @click="go('/pages/compliance/compliance')">
        <text>隐私政策与权限说明</text>
        <text class="muted">查看 →</text>
      </view>
      <view class="list-row row-between">
        <text>当前版本</text>
        <text class="muted">v1.0.2</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useAuth } from '../../common/auth'
import { useTheme } from '../../common/theme'
import { useAvatar, processAvatar, avatarErrorMessage } from '../../common/avatar'
import UserAvatar from '../../components/UserAvatar.vue'

export default {
  components: { UserAvatar },
  setup() {
    const themeApi = useTheme()
    const theme = themeApi.state
    const themeClass = themeApi.classNames
    const avatar = useAvatar()
    const styles = [
      { value: 'default', label: '经典' },
      { value: 'glass', label: '毛玻璃' },
      { value: 'neo', label: '新拟态' },
      { value: 'brutal', label: '新野兽派' }
    ]
    function onDark(e) {
      themeApi.setDark(e.detail.value)
    }
    function setStyle(v) {
      themeApi.setStyle(v)
    }
    function applyAvatar(url) {
      avatar.set(url)
      uni.showToast({ title: '头像已更新' })
    }
    function chooseAvatar() {
      uni.chooseImage({
        count: 1,
        success(res) {
          const path = res.tempFilePaths[0]
          processAvatar(path).then(applyAvatar).catch((err) => {
            console.error('[avatar] 上传处理失败', path, err)
            uni.showToast({ title: avatarErrorMessage(err), icon: 'none' })
          })
        }
      })
    }
    function removeAvatar() {
      avatar.clear()
      uni.showToast({ title: '头像已移除' })
    }
    function go(url) {
      uni.navigateTo({ url })
    }
    return { theme, themeClass, avatar, styles, onDark, setStyle, chooseAvatar, removeAvatar, go }
  },
  onLoad() {
    if (!useAuth().isLogin) {
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
}
</script>

<style lang="scss">
.style-card { margin-bottom: 16rpx; width: 100%; box-sizing: border-box; }
</style>
