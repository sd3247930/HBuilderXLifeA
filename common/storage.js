/**
 * LifestyleApp 纯本地存储层（H5 / App / 微信小程序通用）
 * 所有数据以 JSON 数组形式写入 uni.setStorageSync，不发起任何网络请求。
 * 键名与历史版本一致，数据结构按“用户隔离 + 集合数组”组织。
 */
import { hashPassword, randomSalt, randomToken, genId } from './crypto'
import { todayLocal, weekDates } from './format'

const KEY_USERS = 'lifestyleapp_users'
const KEY_SESSION = 'lifestyleapp_session'
const KEY_CATS = 'lifestyleapp_categories'
const KEY_ACCOUNTS = 'lifestyleapp_accounts'
const KEY_RECORDS = 'lifestyleapp_records'
const KEY_HABITS = 'lifestyleapp_habits'
const KEY_CHECKINS = 'lifestyleapp_checkins'
const KEY_TASKS = 'lifestyleapp_tasks'
const KEY_META = 'lifestyleapp_meta'
const TOKEN_KEY = 'lifestyleapp_token'
const NICKNAME_KEY = 'lifestyleapp_nickname'

/* ========== 底层读写 ========== */
function readTable(key) {
  try {
    const v = uni.getStorageSync(key)
    return Array.isArray(v) ? v : []
  } catch (e) {
    return []
  }
}

function writeTable(key, rows) {
  uni.setStorageSync(key, rows || [])
}

/* ========== 会话与用户 ========== */
function getSession() {
  try {
    return uni.getStorageSync(KEY_SESSION) || null
  } catch (e) {
    return null
  }
}

function getUsers() {
  return readTable(KEY_USERS)
}

function publicUser(u) {
  if (!u) return null
  return { id: u.id, username: u.username, nickname: u.nickname || u.username, created_at: u.created_at }
}

function establishSession(user) {
  const token = randomToken()
  uni.setStorageSync(KEY_SESSION, { userId: user.id, token })
  uni.setStorageSync(TOKEN_KEY, token)
  uni.setStorageSync(NICKNAME_KEY, user.nickname || user.username)
  return token
}

export function getCurrentUserId() {
  const s = getSession()
  return s && s.userId ? s.userId : ''
}

export function getCurrentUserLocal() {
  const id = getCurrentUserId()
  if (!id) return null
  const users = getUsers()
  return publicUser(users.find((u) => u.id === id) || null)
}

export function registerLocal(username, password, nickname) {
  const users = getUsers()
  if (users.some((u) => u.username === username)) {
    return { ok: false, error: '用户名已存在' }
  }
  const salt = randomSalt()
  const user = {
    id: genId(),
    username,
    password_hash: hashPassword(password, salt),
    salt,
    nickname: nickname || username,
    created_at: new Date().toISOString()
  }
  users.push(user)
  writeTable(KEY_USERS, users)
  seedForUser(user.id)
  const token = establishSession(user)
  return { ok: true, data: { token, user: publicUser(user) } }
}

export function loginLocal(username, password) {
  const user = getUsers().find((u) => u.username === username)
  if (!user || user.password_hash !== hashPassword(password, user.salt)) {
    return { ok: false, error: '用户名或密码错误' }
  }
  const token = establishSession(user)
  return { ok: true, data: { token, user: publicUser(user) } }
}

export function logoutLocal() {
  uni.removeStorageSync(KEY_SESSION)
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(NICKNAME_KEY)
  return { ok: true, data: {} }
}

export function updateNicknameLocal(nickname) {
  const id = getCurrentUserId()
  if (!id) return { ok: false, error: '未登录' }
  const users = getUsers()
  const user = users.find((u) => u.id === id)
  if (!user) return { ok: false, error: '用户不存在' }
  user.nickname = nickname || user.username
  writeTable(KEY_USERS, users)
  uni.setStorageSync(NICKNAME_KEY, user.nickname)
  return { ok: true, data: { user: publicUser(user) } }
}

export function changePasswordLocal(oldPassword, newPassword) {
  const id = getCurrentUserId()
  if (!id) return { ok: false, error: '未登录' }
  const users = getUsers()
  const user = users.find((u) => u.id === id)
  if (!user) return { ok: false, error: '用户不存在' }
  if (user.password_hash !== hashPassword(oldPassword, user.salt)) {
    return { ok: false, error: '当前密码不正确' }
  }
  user.salt = randomSalt()
  user.password_hash = hashPassword(newPassword, user.salt)
  writeTable(KEY_USERS, users)
  logoutLocal()
  return { ok: true, data: { user: publicUser(user) } }
}

/* ========== 通用集合（按当前用户过滤） ========== */
function rowsOf(key) {
  const id = getCurrentUserId()
  return id ? readTable(key).filter((r) => r.user_id === id) : []
}

function addRow(key, row) {
  const id = getCurrentUserId()
  if (!id) return null
  const all = readTable(key)
  const rec = Object.assign({ id: genId(), user_id: id, created_at: new Date().toISOString() }, row)
  all.push(rec)
  writeTable(key, all)
  return rec
}

function patchRow(key, id, updates) {
  const uid = getCurrentUserId()
  if (!uid) return null
  const all = readTable(key)
  const idx = all.findIndex((r) => r.id === id && r.user_id === uid)
  if (idx < 0) return null
  all[idx] = Object.assign({}, all[idx], updates)
  writeTable(key, all)
  return all[idx]
}

function removeRow(key, id) {
  const uid = getCurrentUserId()
  const all = readTable(key).filter((r) => !(r.id === id && r.user_id === uid))
  writeTable(key, all)
}

/* ========== 分类 ========== */
const CATEGORY_SEEDS = [
  { type: 'expense', icon: '🛒', name: '买菜购物' },
  { type: 'expense', icon: '💡', name: '水电煤气' },
  { type: 'expense', icon: '🎬', name: '娱乐消费' },
  { type: 'expense', icon: '🍽️', name: '外出就餐' },
  { type: 'expense', icon: '🚗', name: '交通出行' },
  { type: 'expense', icon: '🏠', name: '住房开支' },
  { type: 'expense', icon: '💊', name: '医疗健康' },
  { type: 'expense', icon: '🎓', name: '教育学习' },
  { type: 'expense', icon: '📦', name: '其他支出' },
  { type: 'income', icon: '💰', name: '工资收入' },
  { type: 'income', icon: '📈', name: '理财收益' },
  { type: 'income', icon: '🎁', name: '红包礼金' },
  { type: 'income', icon: '💼', name: '兼职外快' },
  { type: 'income', icon: '🧾', name: '报销返款' },
  { type: 'income', icon: '🪙', name: '其他收入' }
]

const ACCOUNT_SEEDS = [
  { emoji: '💵', name: '现金' },
  { emoji: '💳', name: '银行卡' },
  { emoji: '💬', name: '微信' },
  { emoji: '🧧', name: '支付宝' }
]

export function seedForUser(userId) {
  const cats = readTable(KEY_CATS)
  if (!cats.some((c) => c.user_id === userId)) {
    CATEGORY_SEEDS.forEach((c, i) => {
      cats.push({ id: genId(), user_id: userId, type: c.type, name: c.name, icon: c.icon, is_builtin: true, sort: i })
    })
    writeTable(KEY_CATS, cats)
  }
  const accounts = readTable(KEY_ACCOUNTS)
  if (!accounts.some((a) => a.user_id === userId)) {
    ACCOUNT_SEEDS.forEach((a, i) => {
      accounts.push({ id: genId(), user_id: userId, name: a.name, emoji: a.emoji, is_builtin: true, sort: i })
    })
    writeTable(KEY_ACCOUNTS, accounts)
  }
}

export function getCategoriesLocal() {
  return rowsOf(KEY_CATS).slice().sort((a, b) => a.sort - b.sort || String(a.name).localeCompare(String(b.name)))
}

export function addCategoryLocal(type, name, icon) {
  const list = rowsOf(KEY_CATS)
  const maxSort = list.reduce((m, x) => Math.max(m, x.sort || 0), 0)
  return addRow(KEY_CATS, { type, name, icon: icon || '🏷️', is_builtin: false, sort: maxSort + 1 })
}

export function renameCategoryLocal(id, name, icon) {
  const upd = { name }
  if (icon) upd.icon = icon
  return patchRow(KEY_CATS, id, upd)
}

export function deleteCategoryLocal(id) {
  removeRow(KEY_CATS, id)
}

export function getAccountsLocal() {
  return rowsOf(KEY_ACCOUNTS).slice().sort((a, b) => a.sort - b.sort || String(a.name).localeCompare(String(b.name)))
}

export function addAccountLocal(name, emoji) {
  const list = rowsOf(KEY_ACCOUNTS)
  const maxSort = list.reduce((m, x) => Math.max(m, x.sort || 0), 0)
  return addRow(KEY_ACCOUNTS, { name, emoji: emoji || '💵', is_builtin: false, sort: maxSort + 1 })
}

export function deleteAccountLocal(id) {
  removeRow(KEY_ACCOUNTS, id)
}

/* ========== 记账 ========== */
export function createRecordLocal(payload) {
  return addRow(KEY_RECORDS, {
    type: payload.type === 'income' ? 'income' : 'expense',
    amount: Number(payload.amount || 0),
    category_id: payload.category_id || null,
    account_id: payload.account_id || null,
    note: payload.note || null,
    record_date: payload.record_date || todayLocal()
  })
}

export function getRecordsLocal(params) {
  const cats = rowsOf(KEY_CATS)
  const accounts = rowsOf(KEY_ACCOUNTS)
  const rows = rowsOf(KEY_RECORDS).filter((r) => {
    if (params && params.type) return r.type === params.type
    return true
  }).sort((a, b) => {
    if (a.record_date !== b.record_date) return a.record_date < b.record_date ? 1 : -1
    return String(b.created_at || '').localeCompare(String(a.created_at || ''))
  })
  const total = rows.length
  const page = Math.max(1, Number((params && params.page) || 1))
  const pageSize = Math.max(1, Number((params && params.page_size) || 10))
  const start = (page - 1) * pageSize
  const records = rows.slice(start, start + pageSize).map((r) => {
    const cat = cats.find((c) => c.id === r.category_id)
    const acc = accounts.find((a) => a.id === r.account_id)
    return Object.assign({}, r, {
      category_id: r.category_id || null,
      category_name: cat ? cat.name : '未分类',
      category_icon: cat ? cat.icon || '' : '',
      account_id: r.account_id || null,
      account_name: acc ? acc.name : '',
      account_emoji: acc ? acc.emoji || '' : ''
    })
  })
  return { records, pagination: { total, page, page_size: pageSize } }
}

export function updateRecordLocal(id, payload) {
  const upd = {}
  if (payload.type) upd.type = payload.type === 'income' ? 'income' : 'expense'
  if (payload.amount != null) upd.amount = Number(payload.amount)
  if (payload.category_id !== undefined) upd.category_id = payload.category_id
  if (payload.account_id !== undefined) upd.account_id = payload.account_id
  if (payload.note !== undefined) upd.note = payload.note
  if (payload.record_date) upd.record_date = payload.record_date
  return patchRow(KEY_RECORDS, id, upd)
}

export function deleteRecordLocal(id) {
  removeRow(KEY_RECORDS, id)
}

/* ========== 习惯与打卡 ========== */
function checkinDatesOf(habitId) {
  return rowsOf(KEY_CHECKINS)
    .filter((c) => c.habit_id === habitId)
    .map((c) => c.checkin_date)
    .sort()
}

function longestStreak(dates) {
  const uniq = Array.from(new Set(dates)).sort()
  let best = 0
  let run = 0
  let prev = null
  for (const d of uniq) {
    if (prev === null) {
      run = 1
    } else {
      const diff = Math.round((new Date(d + 'T00:00:00') - new Date(prev + 'T00:00:00')) / 86400000)
      run = diff === 1 ? run + 1 : 1
    }
    if (run > best) best = run
    prev = d
  }
  return best
}

export function getHabitsLocal(weekStart) {
  const habits = rowsOf(KEY_HABITS)
  const week = weekDates(weekStart || todayLocal())
  return habits.map((h) => {
    const dates = checkinDatesOf(h.id)
    const weekCount = dates.filter((d) => week.indexOf(d) >= 0).length
    return {
      id: h.id,
      name: h.name,
      icon: h.icon || '⭐',
      checkin_dates: dates,
      week_count: weekCount,
      longest_streak: longestStreak(dates)
    }
  })
}

export function addHabitLocal(name, icon) {
  return addRow(KEY_HABITS, { name, icon: icon || '⭐', is_builtin: false, sort: 0 })
}

export function updateHabitLocal(id, name, icon) {
  const upd = {}
  if (name) upd.name = name
  if (icon) upd.icon = icon
  return patchRow(KEY_HABITS, id, upd)
}

export function deleteHabitLocal(id) {
  removeRow(KEY_HABITS, id)
  const all = readTable(KEY_CHECKINS).filter((c) => !(c.habit_id === id))
  writeTable(KEY_CHECKINS, all)
}

export function toggleCheckinLocal(habitId, date) {
  const uid = getCurrentUserId()
  if (!uid) return { ok: false, error: '未登录' }
  const all = readTable(KEY_CHECKINS)
  const exist = all.find((c) => c.habit_id === habitId && c.checkin_date === date && c.user_id === uid)
  if (exist) {
    writeTable(KEY_CHECKINS, all.filter((c) => c.id !== exist.id))
  } else {
    all.push({ id: genId(), user_id: uid, habit_id: habitId, checkin_date: date, created_at: new Date().toISOString() })
    writeTable(KEY_CHECKINS, all)
  }
  return { ok: true, data: {} }
}

/* ========== 任务 ========== */
export function getTasksLocal(params) {
  let rows = rowsOf(KEY_TASKS)
  if (params && params.status) rows = rows.filter((t) => t.status === params.status)
  rows = rows.sort((a, b) => {
    if ((a.status === 'done') !== (b.status === 'done')) return a.status === 'done' ? 1 : -1
    const da = a.due_date || '9999-99-99'
    const db = b.due_date || '9999-99-99'
    if (da !== db) return da < db ? -1 : 1
    return String(b.created_at || '').localeCompare(String(a.created_at || ''))
  })
  const total = rows.length
  const page = Math.max(1, Number((params && params.page) || 1))
  const pageSize = Math.max(1, Number((params && params.page_size) || 10))
  const start = (page - 1) * pageSize
  return { tasks: rows.slice(start, start + pageSize), pagination: { total, page, page_size: pageSize } }
}

export function addTaskLocal(payload) {
  return addRow(KEY_TASKS, {
    title: payload.title,
    note: payload.note || null,
    due_date: payload.due_date || null,
    due_time: payload.due_time || null,
    priority: Number(payload.priority || 0),
    status: 'todo'
  })
}

export function updateTaskLocal(id, payload) {
  const upd = {}
  if (payload.title !== undefined) upd.title = payload.title
  if (payload.note !== undefined) upd.note = payload.note
  if (payload.due_date !== undefined) upd.due_date = payload.due_date
  if (payload.due_time !== undefined) upd.due_time = payload.due_time
  if (payload.priority !== undefined) upd.priority = Number(payload.priority)
  return patchRow(KEY_TASKS, id, upd)
}

export function completeTaskLocal(id) {
  const task = patchRow(KEY_TASKS, id, {})
  if (!task) return { ok: false, error: '任务不存在' }
  const next = task.status === 'done' ? 'todo' : 'done'
  const updated = patchRow(KEY_TASKS, id, { status: next })
  return { ok: true, data: { task: updated } }
}

export function deleteTaskLocal(id) {
  removeRow(KEY_TASKS, id)
}

/* ========== 统计与首页聚合 ========== */
function sumByType(rows, type) {
  return rows.filter((r) => r.type === type).reduce((s, r) => s + Number(r.amount || 0), 0)
}

export function getDashboardLocal() {
  const records = rowsOf(KEY_RECORDS)
  const today = todayLocal()
  const month = today.slice(0, 7)
  const todayRows = records.filter((r) => r.record_date === today)
  const monthRows = records.filter((r) => String(r.record_date).indexOf(month) === 0)
  const habits = getHabitsLocal(today)
  const tasks = rowsOf(KEY_TASKS)
    .filter((t) => t.status !== 'done')
    .sort((a, b) => String(a.due_date || '9999').localeCompare(String(b.due_date || '9999')))
    .slice(0, 20)
  return {
    dashboard: {
      today: { income: sumByType(todayRows, 'income'), expense: sumByType(todayRows, 'expense') },
      month: {
        income: sumByType(monthRows, 'income'),
        expense: sumByType(monthRows, 'expense'),
        balance: sumByType(monthRows, 'income') - sumByType(monthRows, 'expense')
      },
      habits: habits.map((h) => ({ id: h.id, icon: h.icon, name: h.name, week_count: h.week_count })),
      tasks: tasks.map((t) => ({ id: t.id, title: t.title, due_date: t.due_date, due_time: t.due_time }))
    }
  }
}

export function getStatsSummaryLocal() {
  try {
    const records = rowsOf(KEY_RECORDS)
    const cats = rowsOf(KEY_CATS)
    const income = sumByType(records, 'income')
    const expense = sumByType(records, 'expense')

    const monthlyMap = {}
    records.forEach((r) => {
      const month = String(r.record_date || '').slice(0, 7)
      if (!month) return
      if (!monthlyMap[month]) monthlyMap[month] = { month, income: 0, expense: 0 }
      const amount = Number(r.amount || 0)
      if (r.type === 'income') monthlyMap[month].income += amount
      else monthlyMap[month].expense += amount
    })
    const sortedMonths = Object.keys(monthlyMap).sort()
    const monthly = sortedMonths.map((m) => ({
      month: m,
      income: Math.round(monthlyMap[m].income * 100) / 100,
      expense: Math.round(monthlyMap[m].expense * 100) / 100
    }))

    const catMap = {}
    records.filter((r) => r.type === 'expense').forEach((r) => {
      const cat = cats.find((c) => c.id === r.category_id)
      const key = cat ? cat.id + '|' + cat.name : 'unknown|未分类'
      if (!catMap[key]) {
        catMap[key] = { label: cat ? cat.name : '未分类', icon: cat ? cat.icon || '' : '', value: 0 }
      }
      catMap[key].value += Number(r.amount || 0)
    })
    const categories = Object.keys(catMap).map((k) => catMap[k])
      .map((c) => Object.assign({}, c, { value: Math.round(c.value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)

    const week = weekDates(todayLocal())
    const habitStats = rowsOf(KEY_HABITS).map((h) => ({
      name: h.name,
      icon: h.icon || '',
      weekCount: checkinDatesOf(h.id).filter((d) => week.indexOf(d) >= 0).length
    }))

    return {
      overview: {
        totalIncome: Math.round(income * 100) / 100,
        totalExpense: Math.round(expense * 100) / 100,
        balance: Math.round((income - expense) * 100) / 100,
        recordCount: records.length
      },
      monthly,
      categories,
      habit_stats: habitStats,
      range: {
        start: sortedMonths.length ? sortedMonths[0] : '',
        end: sortedMonths.length ? sortedMonths[sortedMonths.length - 1] : ''
      }
    }
  } catch (e) {
    console.error('[storage] getStatsSummaryLocal 异常:', e)
    return {
      overview: { totalIncome: 0, totalExpense: 0, balance: 0, recordCount: 0 },
      monthly: [],
      categories: [],
      habit_stats: [],
      range: { start: '', end: '' }
    }
  }
}

/* ========== 启动初始化 ========== */
export function initLocalStore() {
  // 旧版（远程后端）遗留的 token 没有本地会话对应，直接清理，引导重新注册本地账户。
  if (!getSession() && uni.getStorageSync(TOKEN_KEY)) {
    uni.removeStorageSync(TOKEN_KEY)
    uni.removeStorageSync(NICKNAME_KEY)
  }
  const meta = uni.getStorageSync(KEY_META) || {}
  if (!meta.schema_version) {
    uni.setStorageSync(KEY_META, { schema_version: '1.0.2' })
  }
}
