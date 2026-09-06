<template>
  <text class="emoji-tip" :data-name="label">{{ emoji }}</text>
</template>

<script>
/**
 * emoji 悬停提示：H5 鼠标悬停时以 CSS 气泡显示中文含义；
 * 小程序/App 无悬停事件，不影响使用（触屏端配合 EmojiPicker 的长按提示）。
 */
import { emojiName } from '../common/emoji'

export default {
  name: 'EmojiTip',
  props: {
    emoji: { type: String, default: '' }
  },
  setup(props) {
    return {
      label: emojiName(props.emoji)
    }
  }
}
</script>

<style lang="scss">
.emoji-tip {
  position: relative;
  display: inline-block;
}
.emoji-tip::after {
  content: attr(data-name);
  position: absolute;
  bottom: calc(100% + 10rpx);
  left: 50%;
  transform: translateX(-50%) translateY(4rpx);
  background: #0f172a;
  color: #fff;
  font-size: 20rpx;
  line-height: 1.4;
  padding: 8rpx 14rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 60;
}
.th-dark .emoji-tip::after {
  background: #e5e9f0;
  color: #0f172a;
}
.emoji-tip:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
