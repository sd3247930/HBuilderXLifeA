<template>
  <view :class="['page', themeClass]">
    <view class="card">
      <view class="card-title">个人头像</view>
      <view class="row">
        <image v-if="avatar.dataUrl" class="avatar" :src="avatar.dataUrl" mode="aspectFill" />
        <view v-else class="avatar placeholder">👤</view>
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
import { useAvatar } from '../../common/avatar'

// #ifdef H5
function processAvatar(path) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const size = 128
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        const side = Math.min(img.width, img.height)
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = reject
    img.src = path
  })
}
// #endif
// #ifndef H5
function mimeOf(path) {
  return /\.png$/i.test(path) ? 'image/png' : 'image/jpeg'
}
function readBase64(filePath) {
  return new Promise((resolve, reject) => {
    const fsm = uni.getFileSystemManager && uni.getFileSystemManager()
    if (!fsm || !fsm.readFile) return reject(new Error('文件系统不可用'))
    fsm.readFile({
      filePath,
      encoding: 'base64',
      success: (r) => resolve('data:' + mimeOf(filePath) + ';base64,' + r.data),
      fail: reject
    })
  })
}
function processAvatar(path) {
  const compressed = typeof uni.compressImage === 'function'
    ? new Promise((resolve) => {
        uni.compressImage({
          src: path,
          quality: 80,
          success: (c) => resolve(c.tempFilePath || path),
          fail: () => resolve(path)
        })
      })
    : Promise.resolve(path)
  return compressed.then(readBase64)
}
// #endif

export default {
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
          processAvatar(path).then(applyAvatar).catch(() => {
            uni.showToast({ title: '头像处理失败，请重试', icon: 'none' })
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
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; background: #eef2ff; }
.avatar.placeholder { display: flex; align-items: center; justify-content: center; font-size: 60rpx; }
.style-card { margin-bottom: 16rpx; width: 100%; box-sizing: border-box; }
</style>
