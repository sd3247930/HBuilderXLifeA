/** 格式化工具 */
export const pad = (n) => String(n).padStart(2, '0')

export function todayLocal() {
  const d = new Date()
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

export function fmtMoney(n) {
  return '¥' + Number(n || 0).toFixed(2)
}

export function fmtDateTime(value) {
  if (!value) return ''
  const d = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return String(value)
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

/** 以 anchor 所在周返回周一~周日 */
export function weekDates(anchor) {
  const base = new Date((anchor || todayLocal()) + 'T00:00:00')
  const day = (base.getDay() + 6) % 7
  const monday = new Date(base)
  monday.setDate(base.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday)
    x.setDate(monday.getDate() + i)
    return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate())
  })
}

export function shiftWeek(anchor, delta) {
  const d = new Date((anchor || todayLocal()) + 'T00:00:00')
  d.setDate(d.getDate() + delta * 7)
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}
