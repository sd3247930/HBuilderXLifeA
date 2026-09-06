<template>
  <view :class="['page', themeClass]">
    <view class="seg">
      <view class="seg-btn" :class="{ active: type === 'expense' }" @click="type = 'expense'">支出</view>
      <view class="seg-btn" :class="{ active: type === 'income' }" @click="type = 'income'">收入</view>
    </view>

    <view class="card">
      <view v-for="c in filtered" :key="c.id" class="list-row">
        <view class="emoji-cell">{{ c.icon || '🏷️' }}</view>
        <view v-if="editingId !== c.id" class="list-main list-title">{{ c.name }}</view>
        <input v-else v-model="editName" class="inline-input list-main" @confirm="saveEdit(c.id)" />
        <text v-if="c.is_builtin" class="badge badge-primary">预置</text>
        <view v-if="!c.is_builtin" class="row">
          <text class="icon-btn" @click="startEdit(c)">✏️</text>
          <text class="icon-btn" @click="remove(c)">🗑️</text>
        </view>
      </view>
      <view v-if="!filtered.length" class="empty">暂无分类</view>

      <view class="gap"></view>
      <view class="field">
        <text class="fl">新增{{ type === 'expense' ? '支出' : '收入' }}分类</text>
        <input v-model="newName" placeholder="分类名称" />
      </view>
      <view class="field"><text class="fl">选择表情（H5 悬停 / 触屏长按看含义）</text><EmojiPicker v-model="newIcon" /></view>
      <button class="btn btn-primary btn-block" @click="add">添加</button>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
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
    const type = ref('expense')
    const list = ref([])
    const newName = ref('')
    const newIcon = ref('🛒')
    const editingId = ref(null)
    const editName = ref('')
    const filtered = computed(() => list.value.filter((c) => c.type === type.value))

    async function load() {
      const r = await api.categories()
      if (r.ok) list.value = r.data.categories || []
    }
    async function add() {
      if (!newName.value) {
        uni.showToast({ title: '请输入分类名称', icon: 'none' })
        return
      }
      const r = await api.addCategory(type.value, newName.value, newIcon.value)
      if (r.ok) {
        uni.showToast({ title: '已添加' })
        newName.value = ''
        load()
      } else {
        uni.showToast({ title: r.error || '添加失败', icon: 'none' })
      }
    }
    function startEdit(c) {
      editingId.value = c.id
      editName.value = c.name
    }
    async function saveEdit(id) {
      const r = await api.renameCategory(id, editName.value, null)
      editingId.value = null
      if (r.ok) {
        uni.showToast({ title: '已更新' })
        load()
      } else {
        uni.showToast({ title: r.error || '更新失败', icon: 'none' })
      }
    }
    async function remove(c) {
      const ok = await new Promise((resolve) => {
        uni.showModal({ title: '删除分类', content: '确认删除「' + c.name + '」？', success: (res) => resolve(res.confirm) })
      })
      if (!ok) return
      const r = await api.deleteCategory(c.id)
      if (r.ok) {
        uni.showToast({ title: '已删除' })
        load()
      }
    }
    return { theme, themeClass, type, filtered, newName, newIcon, editingId, editName, load, add, startEdit, saveEdit, remove }
  },
  onLoad() {
    if (!useAuth().isLogin) {
      uni.reLaunch({ url: '/pages/login/login' })
      return
    }
    this.load()
  }
}
</script>

<style lang="scss">
.inline-input { border: 1rpx solid #0f52ba; border-radius: 10rpx; padding: 8rpx 12rpx; font-size: 28rpx; }
.gap { height: 24rpx; }
</style>
