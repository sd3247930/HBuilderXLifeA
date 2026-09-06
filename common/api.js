/**
 * 本地数据适配层：保留原 api.xxx() 方法与返回结构，
 * 底层全部改为 uni.storage 读写，彻底脱离 HTTP 后端。
 */
import {
  registerLocal,
  loginLocal,
  logoutLocal,
  getCurrentUserLocal,
  updateNicknameLocal,
  changePasswordLocal,
  getCategoriesLocal,
  addCategoryLocal,
  renameCategoryLocal,
  deleteCategoryLocal,
  getAccountsLocal,
  addAccountLocal,
  deleteAccountLocal,
  getRecordsLocal,
  createRecordLocal,
  updateRecordLocal,
  deleteRecordLocal,
  getHabitsLocal,
  addHabitLocal,
  updateHabitLocal,
  deleteHabitLocal,
  toggleCheckinLocal,
  getTasksLocal,
  addTaskLocal,
  updateTaskLocal,
  deleteTaskLocal,
  completeTaskLocal,
  getDashboardLocal,
  getStatsSummaryLocal
} from './storage'

function ok(data) {
  return { ok: true, data }
}

function fail(error) {
  return { ok: false, error: error || '操作失败' }
}

export const api = {
  async register(username, password, nickname) {
    return registerLocal(username, password, nickname)
  },
  async login(username, password) {
    return loginLocal(username, password)
  },
  async me() {
    const user = getCurrentUserLocal()
    return user ? ok({ user }) : fail('未登录')
  },
  async logout() {
    return logoutLocal()
  },
  async updateNickname(nickname) {
    return updateNicknameLocal(nickname)
  },
  async changePassword(oldPassword, newPassword) {
    return changePasswordLocal(oldPassword, newPassword)
  },

  async categories() {
    return ok({ categories: getCategoriesLocal() })
  },
  async addCategory(type, name, icon) {
    const row = addCategoryLocal(type, name, icon)
    return row ? ok({ category: row }) : fail('未登录')
  },
  async renameCategory(id, name, icon) {
    const row = renameCategoryLocal(id, name, icon)
    return row ? ok({ category: row }) : fail('分类不存在')
  },
  async deleteCategory(id) {
    deleteCategoryLocal(id)
    return ok({})
  },

  async accounts() {
    return ok({ accounts: getAccountsLocal() })
  },
  async addAccount(name, emoji) {
    const row = addAccountLocal(name, emoji)
    return row ? ok({ account: row }) : fail('未登录')
  },
  async deleteAccount(id) {
    deleteAccountLocal(id)
    return ok({})
  },

  async records(params) {
    return ok(getRecordsLocal(params))
  },
  async createRecord(payload) {
    const row = createRecordLocal(payload)
    return row ? ok({ record: row }) : fail('未登录')
  },
  async updateRecord(id, payload) {
    const row = updateRecordLocal(id, payload)
    return row ? ok({ record: row }) : fail('记录不存在')
  },
  async deleteRecord(id) {
    deleteRecordLocal(id)
    return ok({})
  },

  async dashboard() {
    return ok(getDashboardLocal())
  },

  async habits(weekStart) {
    return ok({ habits: getHabitsLocal(weekStart) })
  },
  async addHabit(name, icon) {
    const row = addHabitLocal(name, icon)
    return row ? ok({ habit: row }) : fail('未登录')
  },
  async updateHabit(id, name, icon) {
    const row = updateHabitLocal(id, name, icon)
    return row ? ok({ habit: row }) : fail('习惯不存在')
  },
  async deleteHabit(id) {
    deleteHabitLocal(id)
    return ok({})
  },
  async checkin(habitId, date) {
    return toggleCheckinLocal(habitId, date)
  },

  async tasks(params) {
    return ok(getTasksLocal(params))
  },
  async addTask(payload) {
    const row = addTaskLocal(payload)
    return row ? ok({ task: row }) : fail('未登录')
  },
  async updateTask(id, payload) {
    const row = updateTaskLocal(id, payload)
    return row ? ok({ task: row }) : fail('任务不存在')
  },
  async deleteTask(id) {
    deleteTaskLocal(id)
    return ok({})
  },
  async completeTask(id) {
    return completeTaskLocal(id)
  },

  async statsSummary() {
    return ok(getStatsSummaryLocal())
  }
}
