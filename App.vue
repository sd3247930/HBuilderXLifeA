<script>
import { initLocalStore } from './common/storage'

export default {
  onLaunch() {
    initLocalStore()
  }
}
</script>

<style lang="scss">
@import './uni.scss';

/* ========== 全局基础（浅色默认） ========== */
page {
  background: $c-bg;
  color: $c-text;
  font-size: 14px;
  line-height: 1.5;
}

/* 页面根节点携带 th-* 主题类，下方按主题覆盖语义色 */
.page {
  min-height: 100vh;
  padding: $sp-3 $sp-4;
  box-sizing: border-box;
  background: $c-bg;
}

/* 深色模式 */
.th-dark.page,
.th-dark .page-inner {
  background: $c-dark-bg;
  color: $c-dark-text;
}
.th-dark .card {
  background: $c-dark-surface;
  border-color: $c-dark-border;
}
.th-dark .muted,
.th-dark .stat-label,
.th-dark .task-meta {
  color: $c-text-weak;
}
.th-dark input,
.th-dark textarea {
  background: $c-dark-surface-2;
  color: $c-dark-text;
}

/* 风格变体：毛玻璃 / 新拟态 / 新野兽派（近似） */
.th-glass.page {
  background: linear-gradient(135deg, #eef2ff, #f5f3ff 50%, #ecfeff);
}
.th-glass .card {
  background: rgba(255, 255, 255, 0.78);
}
.th-glass.app-root {
  background: linear-gradient(135deg, #eef2ff, #f5f3ff 50%, #ecfeff);
}
.th-glass.th-dark.page {
  background: linear-gradient(135deg, #111827, #1e293b);
}
.th-glass.th-dark .card {
  background: rgba(30, 41, 59, 0.82);
}
.th-neo.page {
  background: #e8ebf2;
}
.th-neo.app-root {
  background: #e8ebf2;
}
.th-neo .card {
  background: #e8ebf2;
  box-shadow: -6rpx -6rpx 14rpx #ffffff, 6rpx 6rpx 14rpx #cdd3de;
}
.th-neo .btn-primary {
  box-shadow: -4rpx -4rpx 8rpx #f4f6fa, 4rpx 4rpx 8rpx #cdd3de;
}
.th-brutal .card {
  border: 4rpx solid #111827;
  border-radius: 0;
  box-shadow: 8rpx 8rpx 0 #111827;
}
.th-brutal.app-root {
  background: #fdfdfc;
}
.th-brutal .btn-primary {
  border: 4rpx solid #111827;
  border-radius: 0;
  box-shadow: 6rpx 6rpx 0 #111827;
  background: #f59e0b;
  color: #111827;
}

/* ========== 通用组件 ========== */
.card {
  background: $c-surface;
  border: 1rpx solid $c-border;
  border-radius: $radius-card;
  padding: 28rpx;
  margin-bottom: $sp-3;
  box-shadow: $shadow-card;
}
.card-title {
  font-size: 32rpx;
  font-weight: 600;
  margin: 0 0 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #e2e8f0;
}
.th-dark .card-title { border-color: #2b3547; }
.muted { color: $c-text-muted; font-size: $fs-small; }
.mono { font-family: monospace; }
.empty { color: $c-text-weak; text-align: center; padding: $sp-5 0; font-size: 26rpx; }

.row { display: flex; align-items: center; }
.row-between { display: flex; align-items: center; justify-content: space-between; }
.grid2 { display: flex; flex-wrap: wrap; justify-content: space-between; }
.grid2 > view, .grid2 > .cell { width: 48.5%; }
.gap { height: 20rpx; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 18rpx 34rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  line-height: 1.2;
  background: $c-surface-2;
  color: #334155;
  border: 1rpx solid #e2e8f0;
}
.btn-primary { background: #0f52ba; color: #fff; border-color: #0f52ba; }
.btn-secondary { background: #eef2ff; color: #0f52ba; border-color: #dbe4ff; }
.btn-ghost { background: transparent; color: #0f52ba; }
.btn-danger { background: #dc2626; color: #fff; }
.btn-income { background: $c-income; color: #fff; }
.btn-expense { background: $c-expense; color: #fff; }
.btn-sm { padding: 12rpx 22rpx; font-size: 24rpx; }
.btn-block { width: 100%; }
.btn:active { opacity: 0.85; }

.field { margin-bottom: 22rpx; }
.field > .fl { display: block; font-size: 24rpx; color: #475569; margin-bottom: 10rpx; }
.field input, .field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 18rpx 20rpx;
  border: 1rpx solid #cbd5e1;
  border-radius: 12rpx;
  background: #fff;
  color: #191c1e;
  font-size: 28rpx;
}
/* uni H5 将 input 编译为 uni-input：让内层输入框铺满外层高度，文字垂直居中 */
uni-input {
  box-sizing: border-box;
}
uni-input .uni-input-wrapper,
uni-input .uni-input-input {
  height: 100%;
  width: 100%;
}
/* 登录/注册输入文字与占位文字的水平内边距（避免贴边） */
.field uni-input .uni-input-input,
.field uni-input .uni-input-placeholder {
  box-sizing: border-box;
  padding: 0 14px;
}
.picker-box {
  padding: 18rpx 20rpx;
  border: 1rpx solid #cbd5e1;
  border-radius: 12rpx;
  background: #fff;
  font-size: 28rpx;
  color: $c-text;
}
.th-dark .picker-box { background: #121826; color: #e5e9f0; }

.seg { display: flex; background: #eef2ff; border-radius: 12rpx; padding: 6rpx; margin-bottom: 24rpx; }
.seg .seg-btn {
  flex: 1; text-align: center; padding: 16rpx 0; border-radius: 10rpx;
  color: #64748b; font-size: 28rpx;
}
.seg .seg-btn.active { background: #0f52ba; color: #fff; font-weight: 600; }

.chips { display: flex; flex-wrap: wrap; gap: 16rpx; }
.chip {
  padding: 12rpx 24rpx; border-radius: 40rpx; background: #f1f5f9;
  color: #334155; font-size: 26rpx; border: 1rpx solid #e2e8f0;
}
.chip.active { background: #eef2ff; border-color: #0f52ba; color: #0f52ba; }

.badge { display: inline-block; padding: 6rpx 16rpx; border-radius: 40rpx; font-size: 22rpx; }
.badge-primary { background: #eef2ff; color: #0f52ba; }
.badge-success { background: #ecfdf5; color: #059669; }

.list-row {
  display: flex; align-items: center; padding: 20rpx 4rpx;
  border-bottom: 1rpx solid #f1f5f9;
}
.th-dark .list-row { border-color: #2b3547; }
.list-row:last-child { border-bottom: 0; }
.list-main { flex: 1; min-width: 0; }
.list-title { font-size: 28rpx; }
.list-meta { font-size: 22rpx; color: #64748b; margin-top: 4rpx; }
.icon-btn {
  width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center;
  color: #64748b; font-size: 30rpx;
}

.stat-card { padding: 24rpx 0 0; }
.stat-label { font-size: 24rpx; color: #64748b; }
.stat-value { display: block; font-size: 44rpx; font-weight: 700; margin-top: 8rpx; }
.stat-value.income { color: #059669; }
.stat-value.expense { color: #dc2626; }
.stat-note { font-size: 22rpx; color: #059669; margin-top: 8rpx; }

.emoji-cell { font-size: 34rpx; margin-right: 6rpx; }
.dot {
  width: 40rpx; height: 40rpx; border-radius: 50%;
  border: 4rpx solid #cbd5e1; background: transparent;
}
.dot.checked { background: #0f52ba; border-color: #0f52ba; }
.week-row { display: flex; align-items: center; }
.week-day { flex: 1; text-align: center; font-size: 22rpx; color: #64748b; }

.safe-bottom { padding-bottom: calc(env(safe-area-inset-bottom) + 30rpx); }
.app-body .page {
  padding-left: calc(env(safe-area-inset-left) + 32rpx);
  padding-right: calc(env(safe-area-inset-right) + 32rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 150rpx);
}
</style>
