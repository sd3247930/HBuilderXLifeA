<template>
  <view class="emoji-grid">
    <view
      v-for="e in EMOJIS"
      :key="e"
      class="emoji-item"
      :class="{ active: modelValue === e }"
      @click="$emit('update:modelValue', e)"
      @longpress="showName(e)"
    ><EmojiTip :emoji="e" /></view>
  </view>
</template>

<script>
import { EMOJIS, emojiName } from '../common/emoji'
import EmojiTip from './EmojiTip.vue'

export default {
  name: 'EmojiPicker',
  components: { EmojiTip },
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue'],
  setup() {
    function showName(e) {
      uni.showToast({ title: emojiName(e), icon: 'none' })
    }
    return { EMOJIS, showName }
  }
}
</script>

<style lang="scss">
.emoji-grid { display: flex; flex-wrap: wrap; }
.emoji-item {
  width: 80rpx; height: 80rpx; margin: 0 12rpx 12rpx 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 40rpx; border: 1rpx solid #e2e8f0; border-radius: 12rpx;
}
.emoji-item.active { border-color: #0f52ba; background: #eef2ff; }
</style>
