<template>
  <view :class="['page', themeClass]">
    <view class="row-between" style="margin-bottom:20rpx">
      <view class="seg" style="flex:1;margin-bottom:0;margin-right:16rpx">
        <view class="seg-btn" :class="{ active: !status }" @click="setStatus('')">全部</view>
        <view class="seg-btn" :class="{ active: status === 'todo' }" @click="setStatus('todo')">未完成</view>
        <view class="seg-btn" :class="{ active: status === 'done' }" @click="setStatus('done')">已完成</view>
      </view>
      <text class="btn btn-secondary btn-sm" @click="goNew">新建</text>
    </view>

    <view class="card">
      <view v-for="t in tasks" :key="t.id" class="list-row">
        <text class="icon-btn" @click="toggle(t)">{{ t.status === 'done' ? '✅' : '⭕' }}</text>
        <view class="list-main">
          <view class="list-title" :style="t.status === 'done' ? 'text-decoration:line-through;color:#94a3b8' : ''">{{ t.title }}</view>
          <view class="list-meta">截止: {{ t.due_date || '未设置' }}{{ t.due_time ? ' ' + t.due_time : '' }} · {{ ['低', '中', '高'][t.priority] }}</view>
        </view>
        <text class="icon-btn" @click="startEdit(t)">✏️</text>
        <text class="icon-btn" @click="remove(t)">🗑️</text>
      </view>
      <view v-if="!tasks.length" class="empty">暂无任务</view>
      <view class="muted" style="text-align:center;margin-top:12rpx">共 {{ total }} 个</view>
    </view>

    <view v-if="editing" class="mask" @click="editing = null"></view>
    <view v-if="editing" class="sheet">
      <view class="drawer-title">编辑任务</view>
      <view class="field"><text class="fl">标题</text><input v-model="edit.title" /></view>
      <view class="field"><text class="fl">备注</text><input v-model="edit.note" /></view>
      <view class="field"><text class="fl">截止日期</text><picker mode="date" :value="edit.due_date" @change="onDate"><view class="picker-box">{{ edit.due_date || '未设置' }}</view></picker></view>
      <view class="field"><text class="fl">优先级</text><picker :range="['低', '中', '高']" @change="onPri"><view class="picker-box">{{ ['低', '中', '高'][edit.priority] }}</view></picker></view>
      <view class="row">
        <button class="btn btn-primary btn-block" @click="saveEdit">保存</button>
        <button class="btn btn-ghost btn-block" @click="editing = null">取消</button>
      </view>
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
    const status = ref('')
    const tasks = ref([])
    const total = ref(0)
    const editing = ref(null)
    const edit = ref({})

    async function load() {
      const params = { page: 1, page_size: 100 }
      if (status.value) params.status = status.value
      const r = await api.tasks(params)
      if (r.ok) {
        tasks.value = r.data.tasks || []
        total.value = r.data.pagination ? r.data.pagination.total : tasks.value.length
      }
    }
    function setStatus(s) {
      status.value = s
      load()
    }
    function goNew() {
      uni.navigateTo({ url: '/pages/new-task/new-task' })
    }
    async function toggle(t) {
      const r = await api.completeTask(t.id)
      if (r.ok) {
        uni.showToast({ title: r.data.task.status === 'done' ? '已完成' : '已恢复' })
        load()
      }
    }
    function startEdit(t) {
      editing.value = t.id
      edit.value = { title: t.title, note: t.note || '', due_date: t.due_date || '', priority: t.priority || 0 }
    }
    function onDate(e) {
      edit.value.due_date = e.detail.value
    }
    function onPri(e) {
      edit.value.priority = Number(e.detail.value)
    }
    async function saveEdit() {
      const r = await api.updateTask(editing.value, {
        title: edit.value.title,
        note: edit.value.note || null,
        due_date: edit.value.due_date || null,
        priority: edit.value.priority
      })
      editing.value = null
      if (r.ok) {
        uni.showToast({ title: '已更新' })
        load()
      } else {
        uni.showToast({ title: r.error || '更新失败', icon: 'none' })
      }
    }
    async function remove(t) {
      const ok = await new Promise((resolve) => {
        uni.showModal({ title: '删除任务', content: '确认删除「' + t.title + '」？', success: (res) => resolve(res.confirm) })
      })
      if (!ok) return
      const r = await api.deleteTask(t.id)
      if (r.ok) {
        uni.showToast({ title: '已删除' })
        load()
      }
    }
    return { theme, themeClass, status, tasks, total, editing, edit, setStatus, goNew, toggle, startEdit, onDate, onPri, saveEdit, remove, load }
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
.btn-block + .btn-block { margin-left: 16rpx; }
.mask { position: fixed; inset: 0; background: rgba(15,23,42,0.4); z-index: 90; }
.sheet {
  position: fixed; left: 0; right: 0; bottom: 0; background: #fff; z-index: 99;
  padding: 36rpx 32rpx calc(env(safe-area-inset-bottom) + 30rpx);
  border-radius: 24rpx 24rpx 0 0;
}
.th-dark .sheet { background: #1b2230; }
.drawer-title { font-size: 32rpx; font-weight: 700; margin-bottom: 20rpx; }
</style>
