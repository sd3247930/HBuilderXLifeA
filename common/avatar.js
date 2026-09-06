/**
 * 头像状态 + 跨端处理（与 Web 端一致，dataURL 持久化）
 * - H5：Image + canvas 压缩为 128×128 JPEG；
 * - App：uni.compressImage 压缩到应用缓存后，用 plus.io 读取为 dataURL；
 * - 小程序：uni.compressImage + getFileSystemManager 读取。
 * 只接受 data: 开头的 base64；历史遗留临时路径视为无效并清理。
 */
import { reactive } from 'vue'

const AVATAR_KEY = 'lifestyleapp_avatar'
export const AVATAR_EVENT = 'avatarUpdated'

function readStoredAvatar() {
  const v = uni.getStorageSync(AVATAR_KEY) || ''
  if (v && /^data:image\//i.test(v)) return v
  if (v) {
    console.warn('[avatar] 存储值不是合法图片 dataURL，已清理', typeof v, String(v).slice(0, 40))
    uni.removeStorageSync(AVATAR_KEY)
  }
  return ''
}

/** 供组件在挂载/事件触发时主动读取持久化头像 */
export function readAvatarStorage() {
  return readStoredAvatar()
}

export const avatarState = reactive({
  dataUrl: readStoredAvatar()
})

const AVATAR_ERRORS = {
  FS_UNAVAILABLE: '当前设备不支持读取所选图片，请更换图片重试',
  COMPRESS_FAILED: '图片压缩失败，请更换较小的图片',
  READ_FAILED: '图片读取失败，请重试或更换图片',
  STORAGE_FAILED: '头像保存失败，请重试',
  PROCESS_FAILED: '头像处理失败，请重试'
}

function toAvatarError(code, cause) {
  const err = new Error(code)
  err.avatarCode = code
  err.cause = cause
  return err
}

export function avatarErrorMessage(e) {
  return AVATAR_ERRORS[(e && e.avatarCode) || 'PROCESS_FAILED'] || AVATAR_ERRORS.PROCESS_FAILED
}

function canvasToDataUrl(path) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const size = 128
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        const side = Math.min(img.width, img.height)
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      } catch (e) {
        reject(toAvatarError('PROCESS_FAILED', e))
      }
    }
    img.onerror = (e) => reject(toAvatarError('READ_FAILED', e))
    img.src = path
  })
}

// #ifdef H5
export function processAvatar(path) {
  return canvasToDataUrl(path)
}
// #endif

// #ifdef APP-PLUS
function compressOnce(path, withSize) {
  return new Promise((resolve) => {
    if (typeof uni.compressImage !== 'function') return resolve(path)
    const opts = { src: path, quality: 80 }
    if (withSize) {
      opts.compressedWidth = 128
      opts.compressedHeight = 128
    }
    uni.compressImage({
      ...opts,
      success: (r) => resolve(r.tempFilePath || path),
      fail: () => resolve(withSize ? compressOnce(path, false) : path)
    })
  })
}

function readAppDataUrl(filePath) {
  return new Promise((resolve, reject) => {
    if (!(typeof plus !== 'undefined' && plus.io)) {
      return reject(toAvatarError('FS_UNAVAILABLE', new Error('plus.io unavailable')))
    }
    plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
      entry.file((file) => {
        const reader = new plus.io.FileReader()
        reader.onloadend = (e) => resolve(e.target.result)
        reader.onerror = (err) => reject(toAvatarError('READ_FAILED', err))
        reader.readAsDataURL(file)
      }, (err) => reject(toAvatarError('READ_FAILED', err)))
    }, (err) => reject(toAvatarError('READ_FAILED', err)))
  })
}

export function processAvatar(path) {
  return compressOnce(path, true).then((tmp) => readAppDataUrl(tmp))
}
// #endif

// #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-KUAISHOU || MP-JD || MP-QQ
function readFsDataUrl(filePath) {
  return new Promise((resolve, reject) => {
    const fsm = uni.getFileSystemManager && uni.getFileSystemManager()
    if (!fsm || !fsm.readFile) {
      return reject(toAvatarError('FS_UNAVAILABLE', new Error('getFileSystemManager unavailable')))
    }
    fsm.readFile({
      filePath,
      encoding: 'base64',
      success: (r) => resolve('data:' + (/\.png$/i.test(filePath) ? 'image/png' : 'image/jpeg') + ';base64,' + r.data),
      fail: (err) => reject(toAvatarError('READ_FAILED', err))
    })
  })
}

function compressMp(path) {
  return new Promise((resolve) => {
    if (typeof uni.compressImage !== 'function') return resolve(path)
    uni.compressImage({
      src: path,
      quality: 80,
      success: (r) => resolve(r.tempFilePath || path),
      fail: () => resolve(path)
    })
  })
}

export function processAvatar(path) {
  return compressMp(path).then(readFsDataUrl)
}
// #endif

export function useAvatar() {
  return {
    state: avatarState,
    set(dataUrl) {
      if (dataUrl && !/^data:image\//i.test(dataUrl)) {
        const err = new Error('头像数据格式无效')
        err.avatarCode = 'PROCESS_FAILED'
        console.error('[avatar] 拒绝写入非法头像值', typeof dataUrl, String(dataUrl).slice(0, 60))
        throw err
      }
      avatarState.dataUrl = dataUrl || ''
      try {
        if (dataUrl) {
          uni.setStorageSync(AVATAR_KEY, dataUrl)
        } else {
          uni.removeStorageSync(AVATAR_KEY)
        }
      } catch (e) {
        console.error('[avatar] 写入存储失败', e)
        throw toAvatarError('STORAGE_FAILED', e)
      }
      if (typeof uni.$emit === 'function') uni.$emit(AVATAR_EVENT)
    },
    clear() {
      this.set('')
    }
  }
}
