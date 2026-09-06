<template>
  <view class="stats-tab">
    <view class="page-header">
      <text class="title">📊 统计分析</text>
      <text class="subtitle">收支趋势 · 支出分类 · 习惯坚持（本地数据）</text>
    </view>

    <view class="kpi-grid">
      <view class="kpi-card">
        <text class="kpi-label">总支出</text>
        <text class="kpi-value expense">{{ money(ov.totalExpense) }}</text>
        <text class="kpi-note">{{ ov.recordCount }} 条记录</text>
      </view>
      <view class="kpi-card">
        <text class="kpi-label">总收入</text>
        <text class="kpi-value income">{{ money(ov.totalIncome) }}</text>
        <text class="kpi-note">{{ rangeShort }}</text>
      </view>
      <view class="kpi-card">
        <text class="kpi-label">结余</text>
        <text class="kpi-value">{{ money(ov.balance) }}</text>
        <text class="kpi-note">收入 − 支出</text>
      </view>
    </view>

    <view class="chart-card">
      <view class="chart-title">
        <text>📈 财务趋势</text>
        <text class="hint">按月汇总</text>
      </view>
      <canvas
        v-if="hasMonthlyData"
        canvas-id="trendCanvas"
        id="trendCanvas"
        class="trend-canvas"
        style="width:280px;height:120px;"
      ></canvas>
      <view v-else class="chart-empty">
        {{ hasSingleMonth ? '仅有一个月数据，暂无法展示趋势' : '暂无收支数据' }}
      </view>
    </view>

    <view class="chart-card">
      <view class="chart-title">
        <text>🍩 支出分类</text>
        <text class="hint">按住/悬停扇区看详情</text>
      </view>
      <view v-if="hasCategoryData" class="donut-wrapper">
        <canvas
          canvas-id="donutCanvas"
          id="donutCanvas"
          class="donut-canvas"
        ></canvas>
        <view
          class="donut-overlay"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
          @mousemove="onMouseMove"
          @mouseleave="onMouseLeave"
        ></view>
        <view
          v-if="bubble.visible"
          class="bubble-tip"
          :style="{ left: bubble.x + 'px', top: bubble.y + 'px' }"
        >
          <text class="bubble-label">{{ bubble.label }}</text>
          <text class="bubble-value">{{ bubble.value }}</text>
        </view>
      </view>
      <view v-else class="chart-empty">暂无支出数据</view>

      <view v-if="hasCategoryData" class="legend-row">
        <view v-for="(item, idx) in topCategories" :key="item.label" class="legend-item">
          <view class="legend-dot" :style="{ background: DONUT_COLORS[idx % DONUT_COLORS.length] }"></view>
          <text class="legend-label">{{ item.icon || '' }} {{ item.label }}</text>
        </view>
      </view>
    </view>

    <view class="chart-card last-card">
      <view class="chart-title">
        <text>✅ 习惯坚持</text>
        <text class="hint">过去 7 天</text>
      </view>
      <view v-if="habitStats.length" class="habit-mini">
        <view v-for="h in habitStats" :key="h.name" class="habit-mini-item">
          <text class="habit-mini-name">{{ h.icon || '⭐' }} {{ h.name }}</text>
          <text class="habit-mini-count">{{ h.weekCount }}/7</text>
        </view>
      </view>
      <view v-else class="chart-empty">暂无习惯数据</view>
    </view>
  </view>
</template>

<script>
import { ref, computed, nextTick, getCurrentInstance } from 'vue'
import { api } from '../common/api'
import { fmtMoney } from '../common/format'

const DONUT_COLORS = ['#4F9A94', '#E8847A', '#F5B041', '#6C8EBF', '#B39DDB', '#F06292', '#4DD0E1', '#FFB74D']
const DONUT_SIZE = 200
const DONUT_OUTER = 78
const DONUT_INNER = 44

const EMPTY_SUMMARY = {
  overview: { totalIncome: 0, totalExpense: 0, balance: 0, recordCount: 0 },
  monthly: [],
  categories: [],
  habit_stats: [],
  range: { start: '', end: '' }
}

export default {
  name: 'StatsTab',
  setup() {
    const instance = getCurrentInstance()
    const proxy = instance && instance.proxy
    const summary = ref(EMPTY_SUMMARY)
    const sectors = ref([])
    const canvasRect = ref(null)
    const bubble = ref({ visible: false, x: 0, y: 0, label: '', value: '' })
    const currentIndex = ref(-1)
    const highlightIndex = ref(-1)
    let pressTimer = null
    let touching = false

    const ov = computed(() => Object.assign({}, EMPTY_SUMMARY.overview, summary.value.overview || {}))
    const monthlyData = computed(() => summary.value.monthly || [])
    const categories = computed(() => summary.value.categories || [])
    const habitStats = computed(() => summary.value.habit_stats || [])
    const hasMonthlyData = computed(() => monthlyData.value.length >= 2)
    const hasSingleMonth = computed(() => monthlyData.value.length === 1)
    const hasCategoryData = computed(() => categories.value.length > 0)
    const topCategories = computed(() => categories.value.slice(0, 5))
    const rangeShort = computed(() => {
      const r = summary.value.range || {}
      return r.start ? String(r.start).slice(5) + '月' : ''
    })

    function money(v) {
      return fmtMoney(v)
    }

    function ctxOf(id) {
      return uni.createCanvasContext(id, proxy)
    }

    /* ===== 数据加载 ===== */
    async function load() {
      try {
        const res = await api.statsSummary()
        if (!res.ok) return
        summary.value = Object.assign({}, EMPTY_SUMMARY, res.data || {})
        await nextTick()
        renderCharts()
        getCanvasRect()
      } catch (e) {
        console.error('[Stats] 加载异常:', e)
      }
    }

    function renderCharts() {
      if (hasCategoryData.value) drawDonut()
      if (hasMonthlyData.value) drawTrend()
    }

    /* ===== 绘制 ===== */
    function drawDonut() {
      const ctx = ctxOf('donutCanvas')
      const c = DONUT_SIZE / 2
      const data = categories.value
      const total = data.reduce((s, x) => s + Number(x.value || 0), 0)
      if (!total) return
      ctx.clearRect(0, 0, DONUT_SIZE, DONUT_SIZE)
      sectors.value = []
      let start = -Math.PI / 2

      data.forEach((item, index) => {
        const value = Number(item.value || 0)
        const slice = (value / total) * Math.PI * 2
        const end = start + slice
        sectors.value.push({
          index,
          label: item.label || '未分类',
          icon: item.icon || '',
          value,
          startAngle: start,
          endAngle: end,
          color: DONUT_COLORS[index % DONUT_COLORS.length]
        })
        const color = DONUT_COLORS[index % DONUT_COLORS.length]
        ctx.beginPath()
        ctx.arc(c, c, DONUT_OUTER, start, end)
        ctx.arc(c, c, DONUT_INNER, end, start, true)
        ctx.closePath()
        ctx.setFillStyle(color)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(c, c, DONUT_OUTER, start, end)
        ctx.setStrokeStyle('#ffffff')
        ctx.setLineWidth(1.5)
        ctx.stroke()

        if (index === highlightIndex.value) {
          ctx.beginPath()
          ctx.arc(c, c, DONUT_OUTER, start, end)
          ctx.setStrokeStyle('#FFD700')
          ctx.setLineWidth(4)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(c, c, DONUT_INNER, end, start, true)
          ctx.setStrokeStyle('#FFD700')
          ctx.setLineWidth(4)
          ctx.stroke()
        }
        start = end
      })

      ctx.setFillStyle('#94a3b8')
      ctx.setFontSize(12)
      ctx.setTextAlign('center')
      ctx.setTextBaseline('middle')
      ctx.fillText('总支出', c, c - 8)
      ctx.setFillStyle('#191c1e')
      ctx.setFontSize(16)
      ctx.fillText(fmtMoney(total).replace(/\.00$/, ''), c, c + 16)
      ctx.draw()
    }

    function drawTrend() {
      const ctx = ctxOf('trendCanvas')
      const width = 280
      const height = 120
      const P = { top: 16, right: 10, bottom: 20, left: 32 }
      const iw = width - P.left - P.right
      const ih = height - P.top - P.bottom
      const data = monthlyData.value
      const labels = data.map((m) => String(m.month || '').slice(5) + '月')
      const income = data.map((m) => Number(m.income) || 0)
      const expense = data.map((m) => Number(m.expense) || 0)
      const maxV = Math.max.apply(null, income.concat(expense).concat([100])) * 1.2
      const getX = (i) => P.left + (iw / (labels.length - 1)) * i
      const getY = (v) => P.top + ih - (v / maxV) * ih

      ctx.clearRect(0, 0, width, height)
      ctx.setStrokeStyle('#e8e8e8')
      ctx.setLineWidth(0.5)
      ctx.setLineDash([2, 3])
      for (let i = 0; i <= 2; i++) {
        const y = P.top + (ih / 2) * i
        ctx.beginPath()
        ctx.moveTo(P.left, y)
        ctx.lineTo(P.left + iw, y)
        ctx.stroke()
        ctx.setFillStyle('#999999')
        ctx.setFontSize(8)
        ctx.setTextAlign('right')
        ctx.setTextBaseline('middle')
        ctx.fillText(String(Math.round(maxV - (maxV / 2) * i)), P.left - 4, y)
      }
      ctx.setLineDash([])

      function line(arr, color) {
        ctx.beginPath()
        arr.forEach((v, i) => (i === 0 ? ctx.moveTo(getX(i), getY(v)) : ctx.lineTo(getX(i), getY(v))))
        ctx.setStrokeStyle(color)
        ctx.setLineWidth(2)
        ctx.stroke()
        arr.forEach((v, i) => {
          ctx.beginPath()
          ctx.arc(getX(i), getY(v), 3, 0, Math.PI * 2)
          ctx.setFillStyle(color)
          ctx.fill()
        })
      }
      line(income, '#4F9A94')
      line(expense, '#E8847A')

      ctx.setFillStyle('#999999')
      ctx.setFontSize(8)
      ctx.setTextAlign('center')
      ctx.setTextBaseline('top')
      labels.forEach((lb, i) => ctx.fillText(lb, getX(i), P.top + ih + 4))
      ctx.draw()
    }

    /* ===== Canvas 矩形与命中 ===== */
    function getCanvasRect() {
      return new Promise((resolve) => {
        const query = uni.createSelectorQuery().in(proxy)
        query.select('#donutCanvas').boundingClientRect((rect) => {
          canvasRect.value = rect || null
          resolve(canvasRect.value)
        }).exec()
      })
    }

    function hitTest(clientX, clientY) {
      const rect = canvasRect.value
      if (!rect) return null
      const x = clientX - rect.left
      const y = clientY - rect.top
      const dx = x - DONUT_SIZE / 2
      const dy = y - DONUT_SIZE / 2
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < DONUT_INNER || dist > DONUT_OUTER) return null
      let angle = Math.atan2(dy, dx)
      if (angle < -Math.PI / 2) angle += Math.PI * 2
      for (const s of sectors.value) {
        let hit = false
        if (s.startAngle > s.endAngle) {
          if (angle >= s.startAngle || angle <= s.endAngle) hit = true
        } else if (angle >= s.startAngle && angle <= s.endAngle) {
          hit = true
        }
        if (hit) return s
      }
      return null
    }

    /* ===== 气泡 ===== */
    function updateBubble(sector, clientX, clientY) {
      const rect = canvasRect.value
      if (!sector || !rect) {
        bubble.value.visible = false
        return
      }
      const touchY = clientY - rect.top
      let offsetY = -40
      if (touchY < 80) {
        offsetY = Math.max(-touchY + 10, -60)
      } else if (rect.height - touchY < 80) {
        offsetY = -60
      }
      if (touchY + offsetY < 10) {
        offsetY = -touchY + 10
      }
      const halfBubbleWidth = 60
      const rawX = clientX - rect.left
      const maxX = Math.max(halfBubbleWidth, rect.width - halfBubbleWidth)
      const x = Math.min(Math.max(rawX, halfBubbleWidth), maxX)
      bubble.value = {
        visible: true,
        x,
        y: touchY + offsetY,
        label: (sector.icon || '') + (sector.label || '未分类'),
        value: fmtMoney(sector.value || 0)
      }
    }

    function clearPress() {
      if (pressTimer) {
        clearTimeout(pressTimer)
        pressTimer = null
      }
    }

    function fireLongPress(sector) {
      if (!sector) return
      console.log('[Donut] longpress fired:', sector.label, fmtMoney(sector.value))
      highlightIndex.value = sector.index
      try {
        renderCharts()
        uni.showToast({ title: sector.label + '：' + fmtMoney(sector.value), icon: 'none', duration: 2000 })
      } catch (e) {
        console.error('[Donut] longpress render 异常:', e)
      }
    }

    /* ===== 触摸交互 ===== */
    async function onTouchStart(e) {
      const touch = e.touches && e.touches[0]
      if (!touch) return
      touching = true
      if (!canvasRect.value) {
        await getCanvasRect()
      }
      clearPress()
      const sector = hitTest(touch.clientX, touch.clientY)
      if (!sector) {
        bubble.value.visible = false
        return
      }
      currentIndex.value = sector.index
      highlightIndex.value = -1
      updateBubble(sector, touch.clientX, touch.clientY)
      pressTimer = setTimeout(() => fireLongPress(sector), 500)
    }

    async function onTouchMove(e) {
      const touch = e.touches && e.touches[0]
      if (!touch || !canvasRect.value) return
      const sector = hitTest(touch.clientX, touch.clientY)
      if (sector) {
        if (currentIndex.value !== sector.index) {
          currentIndex.value = sector.index
          highlightIndex.value = -1
          clearPress()
          pressTimer = setTimeout(() => fireLongPress(sector), 500)
        }
        updateBubble(sector, touch.clientX, touch.clientY)
      } else {
        bubble.value.visible = false
        clearPress()
      }
    }

    function onTouchEnd() {
      touching = false
      bubble.value.visible = false
      clearPress()
      currentIndex.value = -1
      highlightIndex.value = -1
      renderCharts()
    }

    /* ===== H5 鼠标 ===== */
    async function onMouseMove(e) {
      // #ifdef H5
      if (touching) return
      if (!canvasRect.value) await getCanvasRect()
      const sector = hitTest(e.clientX, e.clientY)
      if (sector) updateBubble(sector, e.clientX, e.clientY)
      else bubble.value.visible = false
      // #endif
    }

    function onMouseLeave() {
      // #ifdef H5
      touching = false
      bubble.value.visible = false
      // #endif
    }

    return {
      DONUT_COLORS,
      ov, monthlyData, categories, habitStats, bubble,
      hasMonthlyData, hasSingleMonth, hasCategoryData, topCategories,
      rangeShort, money, load,
      onTouchStart, onTouchMove, onTouchEnd, onMouseMove, onMouseLeave
    }
  },
  mounted() {
    this.load()
    if (typeof uni.$on === 'function') {
      this._recordHandler = () => this.load()
      uni.$on('recordUpdated', this._recordHandler)
    }
  },
  beforeUnmount() {
    if (typeof uni.$off === 'function' && this._recordHandler) {
      uni.$off('recordUpdated', this._recordHandler)
    }
  }
}
</script>

<style lang="scss">
.stats-tab { padding: 4rpx 0 8rpx; }
.page-header { margin-bottom: 16rpx; }
.page-header .title { display: block; font-size: 38rpx; font-weight: 700; }
.page-header .subtitle { display: block; font-size: 22rpx; color: #64748b; margin-top: 4rpx; }

.kpi-grid { display: flex; justify-content: space-between; margin-bottom: 16rpx; }
.kpi-card {
  width: 32%; box-sizing: border-box; background: #ffffff; border: 1rpx solid #e2e8f0;
  border-radius: 14rpx; padding: 16rpx 8rpx; text-align: center;
}
.th-dark .kpi-card { background: #1b2230; border-color: #2b3547; }
.kpi-label { display: block; font-size: 20rpx; color: #64748b; }
.kpi-value { display: block; font-size: 30rpx; font-weight: 700; margin: 6rpx 0 2rpx; }
.kpi-value.expense { color: #dc2626; }
.kpi-value.income { color: #059669; }
.kpi-note { font-size: 18rpx; color: #94a3b8; }

.chart-card {
  background: #ffffff; border: 1rpx solid #e2e8f0; border-radius: 16rpx;
  padding: 20rpx 24rpx 22rpx; margin-bottom: 16rpx;
}
.th-dark .chart-card { background: #1b2230; border-color: #2b3547; }
.chart-title {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 28rpx; font-weight: 600; margin-bottom: 8rpx;
}
.chart-title .hint { font-size: 20rpx; color: #94a3b8; font-weight: 400; }
.trend-canvas { display: block; margin: 0 auto; }
.chart-empty { text-align: center; color: #94a3b8; font-size: 24rpx; padding: 36rpx 0; }

.donut-wrapper {
  position: relative;
  width: 200px;
  margin: 0 auto;
}
.donut-canvas {
  width: 200px;
  height: 200px;
}
.donut-overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 200px;
  height: 200px;
  touch-action: none;
  z-index: 2;
}
.bubble-tip {
  position: absolute;
  transform: translate(-50%, -100%);
  background: rgba(15, 23, 42, 0.9);
  color: #ffffff;
  font-size: 20rpx;
  line-height: 1.5;
  padding: 8rpx 16rpx;
  border-radius: 10rpx;
  pointer-events: none;
  white-space: nowrap;
  z-index: 20;
}
.th-dark .bubble-tip { background: rgba(226, 232, 240, 0.95); color: #0f172a; }
.bubble-label { font-weight: 600; margin-right: 8rpx; }
.bubble-value { color: #fbbf24; font-weight: 600; }
.th-dark .bubble-value { color: #b45309; }

.legend-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8rpx 24rpx; margin-top: 10rpx; }
.legend-item { display: flex; align-items: center; font-size: 22rpx; color: #475569; }
.legend-dot { width: 14rpx; height: 14rpx; border-radius: 50%; margin-right: 8rpx; flex-shrink: 0; }

.habit-mini { display: flex; flex-wrap: wrap; gap: 12rpx 24rpx; }
.habit-mini-item { display: flex; align-items: center; font-size: 24rpx; color: #334155; }
.habit-mini-name { margin-right: 10rpx; }
.habit-mini-count { color: #059669; font-weight: 600; }
</style>
