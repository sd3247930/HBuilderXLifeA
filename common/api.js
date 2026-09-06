/**
 * 后端接口封装（与 Web 端契约一致）
 */
import { request } from './request'

function post(path, data) {
  return request(path, { method: 'POST', data: data || {} })
}

export const api = {
  register(username, password, nickname) {
    return post('/api/register', { username, password, nickname })
  },
  login(username, password) {
    return post('/api/login', { username, password })
  },
  me() {
    return request('/api/me')
  },
  logout() {
    return post('/api/logout')
  },
  updateNickname(nickname) {
    return post('/api/update-nickname', { nickname })
  },
  changePassword(oldPassword, newPassword) {
    return post('/api/change-password', { oldPassword, newPassword })
  },
  categories() {
    return request('/api/categories')
  },
  addCategory(type, name, icon) {
    return post('/api/categories', { type, name, icon })
  },
  renameCategory(id, name, icon) {
    return post('/api/categories/rename', { id, name, icon })
  },
  deleteCategory(id) {
    return post('/api/categories/delete', { id })
  },
  accounts() {
    return request('/api/accounts')
  },
  addAccount(name, emoji) {
    return post('/api/accounts', { name, emoji })
  },
  deleteAccount(id) {
    return post('/api/accounts/delete', { id })
  },
  records(params) {
    const q = []
    Object.keys(params || {}).forEach((k) => {
      if (params[k] !== '' && params[k] != null) q.push(k + '=' + encodeURIComponent(params[k]))
    })
    return request('/api/records' + (q.length ? '?' + q.join('&') : ''))
  },
  createRecord(payload) {
    return post('/api/records', payload)
  },
  updateRecord(id, payload) {
    return post('/api/records/update', Object.assign({ id }, payload))
  },
  deleteRecord(id) {
    return post('/api/records/delete', { id })
  },
  dashboard() {
    return request('/api/dashboard')
  },
  habits(weekStart) {
    return request('/api/habits' + (weekStart ? '?week_start=' + weekStart : ''))
  },
  addHabit(name, icon) {
    return post('/api/habits', { name, icon })
  },
  updateHabit(id, name, icon) {
    return post('/api/habits/update', { id, name, icon })
  },
  deleteHabit(id) {
    return post('/api/habits/delete', { id })
  },
  checkin(habitId, date) {
    return post('/api/habits/' + habitId + '/checkin', date ? { date } : {})
  },
  tasks(params) {
    const q = []
    Object.keys(params || {}).forEach((k) => {
      if (params[k] !== '' && params[k] != null) q.push(k + '=' + encodeURIComponent(params[k]))
    })
    return request('/api/tasks' + (q.length ? '?' + q.join('&') : ''))
  },
  addTask(payload) {
    return post('/api/tasks', payload)
  },
  updateTask(id, payload) {
    return post('/api/tasks/update', Object.assign({ id }, payload))
  },
  deleteTask(id) {
    return post('/api/tasks/delete', { id })
  },
  completeTask(id) {
    return post('/api/tasks/' + id + '/complete')
  },
  statsSummary() {
    return request('/api/stats/summary')
  }
}
