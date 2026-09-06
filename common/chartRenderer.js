/**
 * 统计图表渲染器（uni.createCanvasContext 旧版 canvas，兼容 App/H5/小程序）
 * - drawDonutChart：甜甜圈支出分类图（扇区外显示分类名 + 金额，中心显示总支出）
 * - drawTrendChart：收支趋势折线图（>=2 个月数据；数据点上方带数值标签）
 * - drawHabitBars：习惯坚持柱状图
 */

const DONUT_COLORS = ['#4F9A94', '#E8847A', '#F5B041', '#6C8EBF', '#B39DDB', '#F06292', '#4DD0E1', '#FFB74D']
const INCOME_COLOR = '#2d7d95'
const EXPENSE_COLOR = '#ef6c7a'

function ctxOf(canvasId, instance) {
  return uni.createCanvasContext(canvasId, instance && instance.proxy)
}

function fmtAmount(v) {
  const n = Math.round(Number(v || 0))
  return '¥' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function drawDonutChart(canvasId, data, total, width = 300, height = 300, instance = null) {
  if (!data || !data.length) return
  const ctx = ctxOf(canvasId, instance)
  const size = Math.min(width, height)
  const centerX = width / 2
  const centerY = height / 2
  const outerRadius = size * 0.32
  const innerRadius = outerRadius * 0.58
  const totalValue = Number(total || data.reduce((s, d) => s + Number(d.value || 0), 0))
  if (!totalValue) return

  ctx.clearRect(0, 0, width, height)
  let startAngle = -Math.PI / 2

  data.forEach((item, index) => {
    const value = Number(item.value || 0)
    const sliceAngle = (value / totalValue) * 2 * Math.PI
    const endAngle = startAngle + sliceAngle
    const color = DONUT_COLORS[index % DONUT_COLORS.length]

    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
    ctx.closePath()
    ctx.setFillStyle(color)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
    ctx.setStrokeStyle('#ffffff')
    ctx.setLineWidth(1.5)
    ctx.stroke()

    const midAngle = startAngle + sliceAngle / 2
    const labelRadius = outerRadius + 12
    const labelX = centerX + Math.cos(midAngle) * labelRadius
    const labelY = centerY + Math.sin(midAngle) * labelRadius
    const name = (item.icon || '') + (item.label || '未分类')
    ctx.setFillStyle('#333333')
    ctx.setFontSize(11)
    ctx.setTextAlign('center')
    ctx.setTextBaseline('middle')
    ctx.fillText(name, labelX, labelY - 8)
    ctx.setFillStyle('#666666')
    ctx.setFontSize(10)
    ctx.fillText(fmtAmount(value), labelX, labelY + 12)

    startAngle = endAngle
  })

  ctx.setFillStyle('#94a3b8')
  ctx.setFontSize(13)
  ctx.setTextAlign('center')
  ctx.setTextBaseline('middle')
  ctx.fillText('总支出', centerX, centerY - 8)
  ctx.setFillStyle('#191c1e')
  ctx.setFontSize(16)
  ctx.fillText(fmtAmount(totalValue), centerX, centerY + 16)
  ctx.draw()
}

export function drawTrendChart(canvasId, monthlyData, width = 340, height = 200, instance = null) {
  if (!monthlyData || monthlyData.length < 2) return
  const ctx = ctxOf(canvasId, instance)
  const padding = { top: 30, right: 20, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const labels = monthlyData.map((m) => String(m.month || '').slice(5) + '月')
  const incomeData = monthlyData.map((m) => Number(m.income) || 0)
  const expenseData = monthlyData.map((m) => Number(m.expense) || 0)
  const maxVal = Math.max.apply(null, incomeData.concat(expenseData).concat([100])) * 1.2
  const getX = (i) => padding.left + (chartWidth / (labels.length - 1)) * i
  const getY = (v) => padding.top + chartHeight - (v / maxVal) * chartHeight

  ctx.clearRect(0, 0, width, height)
  ctx.setStrokeStyle('#e8e8e8')
  ctx.setLineWidth(0.5)
  ctx.setLineDash([3, 4])
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(padding.left + chartWidth, y)
    ctx.stroke()
    ctx.setFillStyle('#999999')
    ctx.setFontSize(9)
    ctx.setTextAlign('right')
    ctx.setTextBaseline('middle')
    ctx.fillText(String(Math.round(maxVal - (maxVal / 4) * i)), padding.left - 6, y)
  }
  ctx.setLineDash([])

  function drawSeries(data, color) {
    ctx.beginPath()
    ctx.moveTo(getX(0), padding.top + chartHeight)
    ctx.lineTo(getX(0), getY(data[0]))
    for (let i = 1; i < data.length; i++) ctx.lineTo(getX(i), getY(data[i]))
    ctx.lineTo(getX(data.length - 1), padding.top + chartHeight)
    ctx.closePath()
    ctx.setFillStyle(color === INCOME_COLOR ? 'rgba(45,125,149,0.16)' : 'rgba(239,108,122,0.14)')
    ctx.fill()

    ctx.beginPath()
    data.forEach((v, i) => (i === 0 ? ctx.moveTo(getX(i), getY(v)) : ctx.lineTo(getX(i), getY(v))))
    ctx.setStrokeStyle(color)
    ctx.setLineWidth(2.5)
    ctx.stroke()

    data.forEach((v, i) => {
      const x = getX(i)
      const y = getY(v)
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.setFillStyle('#ffffff')
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y, 3.5, 0, Math.PI * 2)
      ctx.setFillStyle(color)
      ctx.fill()
      ctx.setFillStyle(color)
      ctx.setFontSize(9)
      ctx.setTextAlign('center')
      ctx.setTextBaseline('bottom')
      ctx.fillText(String(Math.round(v)), x, y - 7)
    })
  }

  drawSeries(incomeData, INCOME_COLOR)
  drawSeries(expenseData, EXPENSE_COLOR)

  ctx.setFillStyle('#999999')
  ctx.setFontSize(10)
  ctx.setTextAlign('center')
  ctx.setTextBaseline('top')
  labels.forEach((lb, i) => ctx.fillText(lb, getX(i), padding.top + chartHeight + 6))

  const legY = 6
  ctx.setFillStyle(INCOME_COLOR)
  ctx.fillRect(padding.left + chartWidth - 100, legY, 16, 3)
  ctx.setFillStyle('#333333')
  ctx.setFontSize(10)
  ctx.setTextAlign('left')
  ctx.setTextBaseline('middle')
  ctx.fillText('收入', padding.left + chartWidth - 80, legY + 2)
  ctx.setFillStyle(EXPENSE_COLOR)
  ctx.fillRect(padding.left + chartWidth - 44, legY, 16, 3)
  ctx.fillText('支出', padding.left + chartWidth - 24, legY + 2)
  ctx.draw()
}

export function drawHabitBars(canvasId, items, width = 300, height = 180, instance = null) {
  if (!items || !items.length) return
  const ctx = ctxOf(canvasId, instance)
  const P = { top: 18, right: 10, bottom: 24, left: 12 }
  const iw = width - P.left - P.right
  const ih = height - P.top - P.bottom
  const max = Math.max.apply(null, items.map((b) => Number(b.val || 0)).concat([1])) * 1.15
  const bw = (iw / items.length) * 0.55

  ctx.clearRect(0, 0, width, height)
  ctx.setFillStyle('#0f52ba')
  items.forEach((b, i) => {
    const bx = P.left + (iw / items.length) * i + (iw / items.length - bw) / 2
    const bh = (Number(b.val || 0) / max) * ih
    ctx.fillRect(bx, P.top + ih - bh, bw, bh)
    ctx.setFillStyle('#191c1e')
    ctx.setFontSize(10)
    ctx.fillText(String(b.val || 0), bx + bw / 2 - 4, P.top + ih - bh - 4)
    ctx.setFillStyle('#64748b')
    ctx.fillText(String(b.label || ''), bx + bw / 2 - 8, height - 6)
    ctx.setFillStyle('#0f52ba')
  })
  ctx.draw()
}
