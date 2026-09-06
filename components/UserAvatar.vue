<template>
  <view
    class="ua-wrap"
    :class="{ clickable: !!navigate }"
    :style="{ width: size, height: size }"
    @click="go"
  >
    <image v-if="avatarUrl" class="ua-img" :src="avatarUrl" mode="aspectFill" />
    <text v-else class="ua-placeholder">👤</text>
  </view>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { readAvatarStorage, AVATAR_EVENT } from '../common/avatar'

/**
 * 通用圆形头像：有图显示图，无图显示占位；传入 navigate 时点击跳转。
 * 挂载与 avatarUpdated 事件时直接从存储读取，保证重启/跨页面后仍能恢复头像。
 */
export default {
  name: 'UserAvatar',
  props: {
    src: { type: String, default: '' },
    size: { type: String, default: '88rpx' },
    navigate: { type: String, default: '' }
  },
  setup(props) {
    const avatarUrl = ref(readAvatarStorage() || props.src || '')
    function load() {
      avatarUrl.value = readAvatarStorage() || props.src || ''
    }
    onMounted(() => {
      if (typeof uni.$on === 'function') uni.$on(AVATAR_EVENT, load)
    })
    onBeforeUnmount(() => {
      if (typeof uni.$off === 'function') uni.$off(AVATAR_EVENT, load)
    })
    watch(
      () => props.src,
      (v) => {
        avatarUrl.value = v || readAvatarStorage() || ''
      }
    )
    function go() {
      if (props.navigate) uni.navigateTo({ url: props.navigate })
    }
    return { avatarUrl, go }
  }
}
</script>

<style lang="scss">
.ua-wrap {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  flex-shrink: 0;
}
.ua-img {
  width: 100%;
  height: 100%;
}
.ua-placeholder {
  font-size: 44rpx;
  line-height: 1;
}
.ua-wrap.clickable:active {
  opacity: 0.8;
}
</style>
