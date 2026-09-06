<template>
  <view>
    <view class="page-head">
      <view class="head-h2">统计分析</view>
      <view class="muted">收支趋势、支出分类与习惯坚持（数据库实时）</view>
    </view>

    <view class="card" v-if="infoText">
      <view class="row-between">
        <view class="row"><text class="badge badge-success">已关联（本地数据库）</text></view>
        <text class="muted" style="font-size:20rpx">{{ infoText }}</text>
      </view>
    </view>

    <view class="grid2">
      <view class="card stat-cell">
        <view class="stat-label">总支出</view>
        <view class="stat-value expense">{{ money(ov.expense) }}</view>
        <view class="stat-note">记录 {{ ov.record_count }} 条</view>
      </view>
      <view class="card stat-cell">
        <view class="stat-label">总收入</view>
        <view class="stat-value income">{{ money(ov.income) }}</view>
        <view class="stat-note">范围 {{ rangeText }}</view>
      </view>
    </view>
    <view class="card stat-cell balance-cell">
      <view class="stat-label">结余</view>
      <view class="stat-value">{{ money(ov.balance) }}</view>
      <view class="stat-note">结余 = 收入 − 支出</view>
    </view>

    <view class="card">
      <view class="card-title">财务趋势</view>
      <canvas v-if="trendReady" canvas-id="trendCanvas" id="trendCanvas" class="chart" :style="trendStyle"></canvas>
      <view v-else class="empty">{{ trendEmpty }}</view>
    </view>

    <view class="card">
      <view class="card-title">支出分类</view>
      <view v-if="donutReady" class="donut-box">
        <canvas canvas-id="donutCanvas" id="donutCanvas" class="donut-canvas" :style="donutStyle"></canvas>
      </view>
      <view v-else class="empty">暂无支出数据</view>
      <view v-for="l in legend" :key="l.label" class="legend-row">
        <view class="legend-dot" :style="{ background: l.color }"></view>
        <view class="legend-label">{{ l.label }}</view>
        <view class="legend-pct">{{ l.pct }}%</view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">习惯坚持情况（过去 7 天）</view>
      <canvas v-if="barReady" canvas-id="barCanvas" id="barCanvas" class="chart" :style="barStyle"></canvas>
      <view v-else class="empty">暂无习惯数据</view>
    </view>
  </view>
</template>

<script>
import { ref, computed, nextTick, getCurrentInstance } from 'vue'
import { api } from '../common/api'
import { fmtMoney } from '../common/format'

export default {
  name: 'StatsTab',
  setup() {
    const instance = getCurrentInstance()
    const summary = ref({})
    const trendReady = ref(false)
    const donutReady = ref(false)
    const barReady = ref(false)
    const trendEmpty = ref('暂无收支数据')
    const chartW = ref(300)
    const trendStyle = computed(() => ({ width: chartW.value + 'px', height: '180px' }))
    const barStyle = computed(() => ({ width: chartW.value + 'px', height: '180px' }))
    const donutStyle = computed(() => ({ width: chartW.value + 'px', height: chartW.value + 'px' }))

    const ov = computed(() => {
      const s = summary.value
      const o = s.overview || {}
      return {
        record_count: o.record_count != null ? o.record_count : s.recordCount || 0,
        income: o.income != null ? o.income : s.incomeTotal || 0,
        expense: o.expense != null ? o.expense : s.expenseTotal || 0,
        balance: o.balance != null ? o.balance : Number(s.incomeTotal || 0) - Number(s.expenseTotal || 0)
      }
    })
    const rangeText = computed(() => {
      const r = summary.value.range
      return r ? r.start + ' ~ ' + r.end : ''
    })
    const infoText = computed(() => {
      const s = summary.value
      if (!s.overview && !s.recordCount) return ''
      return '本地数据库（' + (ov.value.record_count) + ' 条）'
    })
    const legend = ref([])
    const trend = ref(null)
    const donut = ref(null)
    const bars = ref(null)

    function money(v) {
      return fmtMoney(v)
    }

    function measureChart() {
      try {
        const info = uni.getSystemInfoSync()
        const winW = info.windowWidth || 375
        let pad = 64
        if (typeof uni.upx2px === 'function') pad = uni.upx2px(2 * 32 + 2 * 28 + 4)
        chartW.value = Math.max(220, Math.min(340, Math.floor(winW - pad)))
      } catch (e) {
        chartW.value = 300
      }
    }

    async function load() {
      measureChart()
      const r = await api.statsSummary()
      if (!r.ok) return
      const s = r.data
      summary.value = s
      buildData(s)
      await nextTick()
      draw()
    }

    function buildData(s) {
      const monthly = s.monthly || []
      const ms = [...new Set(monthly.map((m) => m.ym))].sort()
      if (ms.length) {
        const series = (type) => ms.map((ym) => {
          const row = monthly.find((m) => m.ym === ym && m.type === type)
          return row ? Number(row.total) : 0
        })
        trend.value = {
          labels: ms.map((m) => m.replace(/^\d{4}-0?/, '') + '月'),
          income: series('income'),
          expense: series('expense')
        }
        trendReady.value = true
      } else {
        trendReady.value = false
        trendEmpty.value = '暂无收支数据'
      }

      const cats = s.expense_by_category || s.categories || []
      const total = cats.reduce((sum, c) => sum + Number(c.total), 0)
      if (cats.length && total > 0) {
        const colors = ['#0f52ba', '#2d7d95', '#f59e0b', '#7c6ff0', '#ef6c7a']
        donut.value = { arcs: [], total }
        let acc = 0
        donut.value.arcs = cats.map((c, i) => {
          const frac = Number(c.total) / total
          const arc = { frac, color: colors[i % colors.length] }
          acc += frac
          return arc
        })
        legend.value = cats.map((c, i) => ({
          label: c.category || '未分类',
          pct: Math.round((Number(c.total) / total) * 100),
          color: colors[i % colors.length]
        }))
        donutReady.value = true
      } else {
        donutReady.value = false
        legend.value = []
      }

      const habits = s.habit_stats || s.habits || []
      if (habits.length) {
        bars.value = habits.map((h) => ({
          label: String(h.name || '习惯').slice(0, 4),
          val: Number(h.weekCount || 0)
        }))
        barReady.value = true
      } else {
        barReady.value = false
      }
    }

    function draw() {
      if (trendReady.value && trend.value) drawLine()
      if (donutReady.value && donut.value) drawDonut()
      if (barReady.value && bars.value) drawBars()
    }

    function ctx(id) {
      return uni.createCanvasContext(id, instance && instance.proxy)
    }

    function drawLine() {
      const c = ctx('trendCanvas')
      const W = chartW.value, H = 180, P = { top: 14, right: 10, bottom: 22, left: 40 }
      const iw = W - P.left - P.right, ih = H - P.top - P.bottom
      const t = trend.value
      const max = Math.max(1, ...t.income, ...t.expense) * 1.15
      const top = Math.max(100, Math.ceil(max / 100) * 100)
      const x = (i) => P.left + (iw / Math.max(1, t.labels.length - 1)) * i
      const y = (v) => P.top + ih - (v / top) * ih
      c.setStrokeStyle('#e2e8f0')
      c.setLineWidth(1)
      for (let g = 0; g <= 4; g++) {
        const gy = P.top + (ih / 4) * g
        c.beginPath()
        c.moveTo(P.left, gy)
        c.lineTo(W - P.right, gy)
        c.stroke()
        c.setFillStyle('#94a3b8')
        c.setFontSize(9)
        c.fillText(String(Math.round((top - (top / 4) * g))), 2, gy + 3)
      }
      const line = (arr, color) => {
        c.setStrokeStyle(color)
        c.setLineWidth(2)
        c.beginPath()
        arr.forEach((v, i) => {
          if (i === 0) c.moveTo(x(i), y(v))
          else c.lineTo(x(i), y(v))
        })
        c.stroke()
        arr.forEach((v, i) => {
          c.beginPath()
          c.arc(x(i), y(v), 2.5, 0, Math.PI * 2)
          c.setFillStyle(color)
          c.fill()
        })
      }
      line(t.income, '#2d7d95')
      line(t.expense, '#ef6c7a')
      c.setFillStyle('#64748b')
      c.setFontSize(9)
      t.labels.forEach((lb, i) => c.fillText(lb, x(i) - 8, H - 6))
      c.draw()
    }

    function drawDonut() {
      const c = ctx('donutCanvas')
      const S = chartW.value
      const cx = S / 2, cy = S / 2, R = Math.max(48, S / 2 - 34)
      let acc = 0
      c.setLineWidth(22)
      donut.value.arcs.forEach((a) => {
        c.beginPath()
        c.arc(cx, cy, R, -Math.PI / 2 + acc * 2 * Math.PI, -Math.PI / 2 + (acc + a.frac) * 2 * Math.PI)
        c.setStrokeStyle(a.color)
        c.stroke()
        acc += a.frac
      })
      c.setFillStyle('#64748b')
      c.setFontSize(10)
      c.fillText('总支出', cx - 18, cy - 4)
      c.setFillStyle('#191c1e')
      c.setFontSize(13)
      c.fillText(String(Math.round(donut.value.total)), cx - 20, cy + 14)
      c.draw()
    }

    function drawBars() {
      const c = ctx('barCanvas')
      const W = chartW.value, H = 180, P = { top: 18, right: 10, bottom: 24, left: 12 }
      const iw = W - P.left - P.right, ih = H - P.top - P.bottom
      const items = bars.value
      const max = Math.max(1, ...items.map((b) => b.val)) * 1.15
      const bw = iw / items.length * 0.55
      c.setFillStyle('#0f52ba')
      items.forEach((b, i) => {
        const bx = P.left + (iw / items.length) * i + (iw / items.length - bw) / 2
        const bh = (b.val / max) * ih
        c.fillRect(bx, P.top + ih - bh, bw, bh)
        c.setFillStyle('#191c1e')
        c.setFontSize(10)
        c.fillText(String(b.val), bx + bw / 2 - 4, P.top + ih - bh - 4)
        c.setFillStyle('#64748b')
        c.fillText(b.label, bx + bw / 2 - 8, H - 6)
        c.setFillStyle('#0f52ba')
      })
      c.draw()
    }

    return {
      summary, ov, rangeText, infoText, trendReady, donutReady, barReady, trendEmpty, legend, money, load, chartW, trendStyle, donutStyle, barStyle
    }
  },
  mounted() {
    this.measureChart()
    this.load()
    if (typeof uni.onWindowResize === 'function') {
      this._resizeHandler = () => {
        this.measureChart()
        this.load()
      }
      uni.onWindowResize(this._resizeHandler)
    }
  },
  beforeUnmount() {
    if (typeof uni.offWindowResize === 'function' && this._resizeHandler) {
      uni.offWindowResize(this._resizeHandler)
    }
  }
}
</script>

<style lang="scss">
.page-head { margin-bottom: 24rpx; }
.head-h2 { font-size: 40rpx; font-weight: 700; margin-bottom: 8rpx; }
.stat-cell { margin-bottom: 24rpx; }
.balance-cell { margin-top: -8rpx; }
.donut-box { display: flex; justify-content: center; margin-bottom: 12rpx; }
.legend-row { display: flex; align-items: center; padding: 10rpx 0; font-size: 26rpx; }
.legend-dot { width: 20rpx; height: 20rpx; border-radius: 4rpx; margin-right: 16rpx; }
.legend-label { flex: 1; }
.legend-pct { font-weight: 600; }
.chart { width: 300px; height: 180px; }
.donut-canvas { width: 180px; height: 180px; }
</style>
