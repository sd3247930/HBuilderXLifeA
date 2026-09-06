<template>
  <view :class="['record-tab', 'type-' + type]">
    <view class="page-head">
      <view class="head-h2">记一笔</view>
      <view class="muted">{{ type === 'expense' ? '记下每一笔花销，轻松掌握消费。' : '收入到账及时记录，账目一目了然。' }}</view>
    </view>

    <view class="card">
      <view class="seg">
        <view class="seg-btn" :class="{ active: type === 'expense' }" @click="switchType('expense')">
          <text class="seg-emoji">↓</text>支出
        </view>
        <view class="seg-btn" :class="{ active: type === 'income' }" @click="switchType('income')">
          <text class="seg-emoji">↑</text>收入
        </view>
      </view>

      <view class="amount-field">
        <text class="amount-label">{{ type === 'expense' ? '支出金额' : '收入金额' }}</text>
        <view class="amount-row">
          <text class="amount-symbol">¥</text>
          <input class="amount-input" v-model="amount" type="digit" placeholder="0.00" />
        </view>
      </view>

      <view class="field">
        <text class="fl">日期</text>
        <picker mode="date" :value="date" @change="onDate">
          <view class="picker-box row-between">
            <text>📅 {{ date }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="field">
        <text class="fl">分类</text>
        <view class="picker-box row-between" @click="catSheet = true">
          <text>{{ currentCat ? (currentCat.icon || '🏷️') + ' ' + currentCat.name : '请选择分类' }}</text>
          <text class="picker-arrow">›</text>
        </view>
      </view>

      <view class="field">
        <text class="fl">资金账户</text>
        <picker :range="accOptions" range-key="label" @change="onAcc">
          <view class="picker-box row-between">
            <text>{{ accLabel }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="field">
        <text class="fl">备注</text>
        <input v-model="note" placeholder="可选备注" />
      </view>

      <button class="btn btn-block save-btn" :class="type === 'expense' ? 'btn-expense' : 'btn-income'" :loading="saving" @click="submit">保存记录</button>
    </view>

    <!-- 分类底部弹层选择器 -->
    <view v-if="catSheet" class="mask" @click="catSheet = false"></view>
    <view v-if="catSheet" class="cat-sheet">
      <view class="sheet-head row-between">
        <view>
          <view class="sheet-title">选择{{ type === 'expense' ? '支出' : '收入' }}分类</view>
          <view class="muted sheet-sub">点击分类完成选择</view>
        </view>
        <text class="btn btn-ghost btn-sm" @click="catSheet = false">关闭</text>
      </view>
      <scroll-view scroll-y class="sheet-scroll">
        <view class="cat-grid">
          <view
            v-for="c in cats"
            :key="c.id"
            class="cat-cell"
            :class="{ active: categoryId === c.id }"
            @click="pickCategory(c)"
          >
            <EmojiTip :emoji="c.icon || '🏷️'" class="cat-cell-icon" />
            <text class="cat-cell-name">{{ c.name }}</text>
            <text v-if="categoryId === c.id" class="cat-check">✓</text>
          </view>
          <view v-if="!cats.length" class="empty">暂无{{ type === 'expense' ? '支出' : '收入' }}分类</view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { api } from '../common/api'
import { todayLocal } from '../common/format'
import EmojiTip from './EmojiTip.vue'

export default {
  name: 'RecordTab',
  components: { EmojiTip },
  setup() {
    const type = ref('expense')
    const amount = ref('')
    const date = ref(todayLocal())
    const note = ref('')
    const categoryId = ref(null)
    const accountId = ref(null)
    const allCats = ref([])
    const accounts = ref([])
    const saving = ref(false)
    const catSheet = ref(false)

    const cats = computed(() => allCats.value.filter((c) => c.type === type.value))
    const currentCat = computed(() => cats.value.find((c) => c.id === categoryId.value) || null)
    const accOptions = computed(() => [{ label: '不关联账户', id: null }].concat(accounts.value.map((a) => ({ label: (a.emoji || '') + ' ' + a.name, id: a.id }))))
    const accLabel = computed(() => {
      const cur = accOptions.value.find((x) => x.id === accountId.value)
      return cur ? cur.label : '不关联账户'
    })

    function pickDefaultCategory() {
      const first = cats.value[0]
      categoryId.value = first ? first.id : null
    }
    function switchType(t) {
      if (type.value === t) return
      type.value = t
      catSheet.value = false
      pickDefaultCategory()
    }
    function pickCategory(c) {
      categoryId.value = c.id
      catSheet.value = false
    }

    async function loadBase() {
      const [c, a] = await Promise.all([api.categories(), api.accounts()])
      if (c.ok) {
        allCats.value = c.data.categories || []
        pickDefaultCategory()
      }
      if (a.ok) accounts.value = a.data.accounts || []
    }

    function onDate(e) {
      date.value = e.detail.value
    }
    function onAcc(e) {
      accountId.value = accOptions.value[e.detail.value].id
    }

    async function submit() {
      const amt = Number(amount.value)
      if (!amount.value || !(amt > 0)) {
        uni.showToast({ title: '请输入大于 0 的金额', icon: 'none' })
        return
      }
      if (!categoryId.value) {
        uni.showToast({ title: '请选择分类', icon: 'none' })
        return
      }
      saving.value = true
      const res = await api.createRecord({
        type: type.value,
        amount: amt,
        category_id: categoryId.value,
        account_id: accountId.value || null,
        note: note.value || null,
        record_date: date.value
      })
      saving.value = false
      if (res.ok) {
        uni.showToast({ title: '记录已保存' })
        if (typeof uni.$emit === 'function') uni.$emit('recordUpdated')
        amount.value = ''
        note.value = ''
        pickDefaultCategory()
      } else {
        uni.showToast({ title: res.error || '保存失败', icon: 'none' })
      }
    }

    return { type, amount, date, note, categoryId, accountId, cats, currentCat, accOptions, accLabel, saving, catSheet, switchType, pickCategory, loadBase, onDate, onAcc, submit }
  },
  mounted() {
    this.loadBase()
  }
}
</script>

<style lang="scss">
.page-head { margin-bottom: 24rpx; }
.head-h2 { font-size: 40rpx; font-weight: 700; margin-bottom: 8rpx; }

/* 支出 / 收入 差异化主色 */
.type-expense .seg-btn.active,
.type-expense .btn-expense { background: #dc2626; border-color: #dc2626; }
.type-income .seg-btn.active,
.type-income .btn-income { background: #059669; border-color: #059669; }
.btn-expense, .btn-income { color: #fff; }

.seg .seg-btn { display: flex; align-items: center; justify-content: center; }
.seg-emoji { margin-right: 8rpx; font-size: 28rpx; }

.amount-field { background: #f8fafc; border-radius: 16rpx; padding: 20rpx 24rpx; margin-bottom: 26rpx; }
.th-dark .amount-field { background: #121826; }
.amount-label { display: block; font-size: 24rpx; color: #475569; margin-bottom: 8rpx; }
.th-dark .amount-label { color: #94a3b8; }
.amount-row { display: flex; align-items: baseline; }
.amount-symbol { font-size: 44rpx; font-weight: 700; margin-right: 12rpx; color: #334155; }
.th-dark .amount-symbol { color: #e5e9f0; }
.amount-input { flex: 1; font-size: 64rpx; font-weight: 700; height: 88rpx; background: transparent; border: none; padding: 0; }
.amount-input .uni-input-wrapper,
.amount-input .uni-input-input { height: 88rpx; font-size: 64rpx; font-weight: 700; color: inherit; }
.th-dark .amount-input { background: transparent; color: #fff; }
.amount-input::placeholder { color: #cbd5e1; }

.picker-box.row-between { display: flex; align-items: center; justify-content: space-between; min-height: 76rpx; }
.picker-arrow { color: #94a3b8; font-size: 36rpx; line-height: 1; }

.save-btn { margin-top: 10rpx; }

.mask { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 90; }
.cat-sheet {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 99;
  background: #fff; border-radius: 24rpx 24rpx 0 0;
  padding: 28rpx 28rpx calc(env(safe-area-inset-bottom) + 24rpx);
  max-height: 62vh; display: flex; flex-direction: column;
}
.th-dark .cat-sheet { background: #1b2230; }
.sheet-head { margin-bottom: 16rpx; }
.sheet-title { font-size: 32rpx; font-weight: 700; }
.sheet-sub { margin-top: 4rpx; }
.sheet-scroll { flex: 1; min-height: 0; }
.cat-grid { display: flex; flex-wrap: wrap; justify-content: space-between; padding-bottom: 12rpx; }
.cat-cell {
  position: relative; width: 31%; box-sizing: border-box;
  display: flex; flex-direction: column; align-items: center;
  background: #f1f5f9; border: 2rpx solid transparent;
  border-radius: 16rpx; padding: 22rpx 0 18rpx; margin-bottom: 18rpx;
}
.th-dark .cat-cell { background: #121826; }
.cat-cell.active { background: #eef2ff; border-color: #0f52ba; }
.type-income .cat-cell.active { background: #ecfdf5; border-color: #059669; }
.cat-cell-icon { font-size: 44rpx; line-height: 1.2; }
.cat-cell-name { margin-top: 8rpx; font-size: 24rpx; color: #334155; text-align: center; }
.th-dark .cat-cell-name { color: #e5e9f0; }
.cat-check {
  position: absolute; top: 8rpx; right: 10rpx; color: #0f52ba; font-size: 26rpx; font-weight: 700;
}
.type-income .cat-check { color: #059669; }
</style>
