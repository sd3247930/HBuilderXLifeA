<template>
  <view :class="['page', themeClass]">
    <view class="card">
      <view class="seg">
        <view class="seg-btn" :class="{ active: !filterType }" @click="setType('')">全部</view>
        <view class="seg-btn" :class="{ active: filterType === 'expense' }" @click="setType('expense')">支出</view>
        <view class="seg-btn" :class="{ active: filterType === 'income' }" @click="setType('income')">收入</view>
      </view>
      <view class="row-between">
        <text class="muted">共 {{ total }} 条 · 第 {{ page }} / {{ pages }} 页</text>
        <view class="row">
          <text class="btn btn-ghost btn-sm" :class="{ disabled: page <= 1 }" @click="prev">上一页</text>
          <text class="btn btn-ghost btn-sm" :class="{ disabled: page >= pages }" @click="next">下一页</text>
        </view>
      </view>
    </view>

    <view class="card">
      <view v-for="r in records" :key="r.id" class="list-row">
        <view class="list-main">
          <view class="row">
            <text :class="r.type === 'income' ? 'amt income' : 'amt expense'">{{ r.type === 'income' ? '+' : '-' }}{{ money(r.amount) }}</text>
          </view>
          <view class="list-meta">{{ r.record_date }} · {{ r.category_icon || '' }} {{ r.category_name || '未分类' }} {{ r.account_emoji || '' }} {{ r.account_name || '' }}{{ r.note ? ' · ' + r.note : '' }}</view>
        </view>
        <text class="icon-btn" @click="startEdit(r)">✏️</text>
        <text class="icon-btn" @click="remove(r)">🗑️</text>
      </view>
      <view v-if="!records.length" class="empty">暂无记录</view>
    </view>

    <!-- 编辑弹窗 -->
    <view v-if="editing" class="mask" @click="editing = null"></view>
    <view v-if="editing" class="sheet">
      <view class="drawer-title">编辑记录</view>
      <view class="seg" :class="edit.type === 'expense' ? 'seg-expense' : edit.type === 'income' ? 'seg-income' : ''">
        <view class="seg-btn" :class="{ active: edit.type === 'expense' }" @click="edit.type = 'expense'">支出</view>
        <view class="seg-btn" :class="{ active: edit.type === 'income' }" @click="edit.type = 'income'">收入</view>
      </view>
      <view class="field"><text class="fl">金额</text><input v-model="edit.amount" type="digit" /></view>
      <view class="field">
        <text class="fl">日期</text>
        <picker mode="date" :value="edit.record_date" @change="onDate">
          <view class="picker-box">{{ edit.record_date }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="fl">分类</text>
        <view class="chips">
          <view
            v-for="c in editCats"
            :key="c.id"
            class="chip"
            :class="{ active: edit.category_id === c.id }"
            @click="edit.category_id = c.id"
          >{{ c.icon || '🏷️' }} {{ c.name }}</view>
        </view>
      </view>
      <view class="field"><text class="fl">备注</text><input v-model="edit.note" /></view>
      <view class="row">
        <button class="btn btn-primary btn-block" @click="saveEdit">保存</button>
        <button class="btn btn-ghost btn-block" @click="editing = null">取消</button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { api } from '../../common/api'
import { useAuth } from '../../common/auth'
import { useTheme } from '../../common/theme'
import { fmtMoney } from '../../common/format'

export default {
  setup() {
    const themeApi = useTheme()
    const theme = themeApi.state
    const themeClass = themeApi.classNames
    const filterType = ref('')
    const records = ref([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = 10
    const categories = ref([])
    const editing = ref(null)
    const edit = ref({})

    const pages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
    const editCats = computed(() => categories.value.filter((c) => c.type === edit.value.type))

    function money(v) {
      return fmtMoney(v)
    }

    async function load() {
      const params = { page: page.value, page_size: pageSize }
      if (filterType.value) params.type = filterType.value
      const r = await api.records(params)
      if (r.ok) {
        records.value = r.data.records || []
        total.value = (r.data.pagination && r.data.pagination.total) || 0
      }
    }

    async function loadCats() {
      const r = await api.categories()
      if (r.ok) categories.value = r.data.categories || []
    }

    function setType(t) {
      filterType.value = t
      page.value = 1
      load()
    }
    function prev() {
      if (page.value > 1) {
        page.value--
        load()
      }
    }
    function next() {
      if (page.value < pages.value) {
        page.value++
        load()
      }
    }

    function startEdit(r) {
      editing.value = r.id
      edit.value = {
        type: r.type,
        amount: String(r.amount),
        record_date: r.record_date,
        category_id: r.category_id || null,
        note: r.note || ''
      }
    }
    function onDate(e) {
      edit.value.record_date = e.detail.value
    }
    async function saveEdit() {
      const amt = Number(edit.value.amount)
      if (!(amt > 0)) {
        uni.showToast({ title: '金额必须大于 0', icon: 'none' })
        return
      }
      const r = await api.updateRecord(editing.value, {
        type: edit.value.type,
        amount: amt,
        category_id: edit.value.category_id || null,
        note: edit.value.note || null,
        record_date: edit.value.record_date
      })
      if (r.ok) {
        uni.showToast({ title: '记录已更新' })
        editing.value = null
        load()
      } else {
        uni.showToast({ title: r.error || '更新失败', icon: 'none' })
      }
    }
    async function remove(r) {
      const ok = await new Promise((resolve) => {
        uni.showModal({ title: '删除记录', content: '确认删除该笔记录？', success: (res) => resolve(res.confirm) })
      })
      if (!ok) return
      const res = await api.deleteRecord(r.id)
      if (res.ok) {
        uni.showToast({ title: '已删除' })
        if (records.value.length === 1 && page.value > 1) page.value--
        load()
      }
    }

    return { theme, themeClass, filterType, records, total, page, pages, editCats, editing, edit, money, setType, prev, next, startEdit, onDate, saveEdit, remove, load, loadCats }
  },
  onLoad() {
    if (!useAuth().isLogin) {
      uni.reLaunch({ url: '/pages/login/login' })
      return
    }
    this.load()
    this.loadCats()
  }
}
</script>

<style lang="scss">
.amt { font-size: 30rpx; font-weight: 700; }
.amt.income { color: #059669; }
.amt.expense { color: #dc2626; }
.btn-block + .btn-block { margin-left: 16rpx; }
.disabled { opacity: 0.4; }
.mask { position: fixed; inset: 0; background: rgba(15,23,42,0.4); z-index: 90; }
.sheet {
  position: fixed; left: 0; right: 0; bottom: 0; background: #fff; z-index: 99;
  padding: 36rpx 32rpx calc(env(safe-area-inset-bottom) + 30rpx);
  border-radius: 24rpx 24rpx 0 0; max-height: 80vh; overflow-y: auto;
}
.th-dark .sheet { background: #1b2230; }
.drawer-title { font-size: 32rpx; font-weight: 700; margin-bottom: 20rpx; }
.seg.seg-expense .seg-btn.active { background: #dc2626; }
.seg.seg-income .seg-btn.active { background: #059669; }
</style>
