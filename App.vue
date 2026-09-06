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

/* ===== 风格变体：毛玻璃 ===== */
.th-glass.page,
.th-glass.app-root {
  background:
    radial-gradient(circle at 12% 8%, rgba(116, 191, 255, 0.32), transparent 36%),
    radial-gradient(circle at 90% 16%, rgba(205, 157, 255, 0.24), transparent 34%),
    linear-gradient(145deg, #e8f3ff 0%, #f3edff 50%, #e8fbf8 100%);
}
.th-glass.th-dark.page,
.th-glass.th-dark.app-root {
  background:
    radial-gradient(circle at 12% 8%, rgba(45, 90, 160, 0.35), transparent 36%),
    radial-gradient(circle at 90% 16%, rgba(105, 70, 160, 0.25), transparent 34%),
    linear-gradient(145deg, #101827 0%, #1b1f35 50%, #10242a 100%);
}
.th-glass .card {
  background: rgba(255, 255, 255, 0.55);
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 28rpx;
  box-shadow: 0 12rpx 32rpx rgba(81, 106, 156, 0.16);
  backdrop-filter: blur(18rpx) saturate(140%);
  -webkit-backdrop-filter: blur(18rpx) saturate(140%);
}
.th-glass.th-dark .card {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(255, 255, 255, 0.08);
}
.th-glass .btn-primary {
  background: linear-gradient(135deg, #4f7cff, #3b68ef);
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 8rpx 20rpx rgba(79, 124, 255, 0.28);
}
.th-glass .field input,
.th-glass .field textarea,
.th-glass .picker-box,
.th-glass .seg {
  background: rgba(255, 255, 255, 0.55);
  border-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
}
.th-glass.th-dark .field input,
.th-glass.th-dark .field textarea,
.th-glass.th-dark .picker-box,
.th-glass.th-dark .seg {
  background: rgba(18, 24, 38, 0.6);
  border-color: rgba(255, 255, 255, 0.08);
}

/* ===== 风格变体：新拟态 ===== */
.th-neo.page,
.th-neo.app-root {
  background: #e8ebf2;
}
.th-neo.th-dark.page,
.th-neo.th-dark.app-root {
  background: #131a24;
}
.th-neo .card {
  background: #e8ebf2;
  border: 0;
  border-radius: 26rpx;
  box-shadow: 10rpx 10rpx 22rpx #cdd3de, -10rpx -10rpx 22rpx #ffffff;
}
.th-neo.th-dark .card {
  background: #131a24;
  box-shadow: 10rpx 10rpx 22rpx #0a0f17, -10rpx -10rpx 22rpx #232c3a;
}
.th-neo .btn-primary {
  background: #5e7ce2;
  border: 0;
  box-shadow: 5rpx 5rpx 12rpx #9aa7c8, -5rpx -5rpx 12rpx #ffffff;
}
.th-neo .btn-primary:active {
  box-shadow: inset 4rpx 4rpx 8rpx #445ba8, inset -4rpx -4rpx 8rpx #7898ff;
}
.th-neo .field input,
.th-neo .field textarea,
.th-neo .picker-box,
.th-neo .seg,
.th-neo .chip {
  background: #e8ebf2;
  border: 0;
  box-shadow: inset 4rpx 4rpx 9rpx #cdd3de, inset -4rpx -4rpx 9rpx #ffffff;
}
.th-neo.th-dark .field input,
.th-neo.th-dark .field textarea,
.th-neo.th-dark .picker-box,
.th-neo.th-dark .seg,
.th-neo.th-dark .chip {
  background: #131a24;
  box-shadow: inset 4rpx 4rpx 9rpx #0a0f17, inset -4rpx -4rpx 9rpx #232c3a;
}
.th-neo.th-dark .field input,
.th-neo.th-dark .field textarea,
.th-neo.th-dark .picker-box {
  color: #e5e9f0;
}

/* ===== 风格变体：新野兽派 ===== */
.th-brutal.page,
.th-brutal.app-root {
  background: #fff8e7;
}
.th-brutal.th-dark.page,
.th-brutal.th-dark.app-root {
  background: #17140f;
}
.th-brutal .card {
  background: #ffffff;
  border: 4rpx solid #111111;
  border-radius: 6rpx;
  box-shadow: 8rpx 8rpx 0 #111111;
}
.th-brutal.th-dark .card {
  background: #241f16;
  border-color: #ffffff;
  box-shadow: 8rpx 8rpx 0 #ffffff;
}
.th-brutal .btn-primary {
  border: 4rpx solid #111111;
  border-radius: 4rpx;
  box-shadow: 6rpx 6rpx 0 #111111;
  background: #ff5c35;
  color: #ffffff;
}
.th-brutal .btn-primary:active {
  transform: translate(4rpx, 4rpx);
  box-shadow: none;
}
.th-brutal .btn-secondary {
  background: #ffd84d;
  border: 3rpx solid #111111;
  border-radius: 4rpx;
  color: #111111;
}
.th-brutal .field input,
.th-brutal .field textarea,
.th-brutal .picker-box {
  background: #ffffff;
  border: 3rpx solid #111111;
  border-radius: 6rpx;
  box-shadow: 4rpx 4rpx 0 #111111;
}
.th-brutal .seg {
  background: #ffffff;
  border: 3rpx solid #111111;
  border-radius: 4rpx;
}
.th-brutal .seg .seg-btn.active {
  background: #ffd84d;
  color: #111111;
  border-radius: 0;
}
.th-brutal .chip {
  background: #ffffff;
  border: 2rpx solid #111111;
  border-radius: 4rpx;
  box-shadow: 2rpx 2rpx 0 #111111;
}
.th-brutal.th-dark .field input,
.th-brutal.th-dark .field textarea,
.th-brutal.th-dark .picker-box {
  background: #ffffff;
  border-color: #ffffff;
  box-shadow: 4rpx 4rpx 0 #ffffff;
  color: #111111;
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

/* ===== 主题覆盖：各 Tab/页面自定义表面（卡片/面板/选择器） ===== */
.th-glass .finance-card,
.th-glass .card-half,
.th-glass .quick-actions,
.th-glass .kpi-card,
.th-glass .chart-card,
.th-glass .cat-cell,
.th-glass .cat-sheet,
.th-glass .amount-field {
  background: rgba(255, 255, 255, 0.55) !important;
  border: 1rpx solid rgba(255, 255, 255, 0.75) !important;
  border-radius: 28rpx !important;
  box-shadow: 0 12rpx 30rpx rgba(81, 106, 156, 0.16) !important;
  backdrop-filter: blur(16rpx) saturate(140%);
  -webkit-backdrop-filter: blur(16rpx) saturate(140%);
}
.th-glass.th-dark .finance-card,
.th-glass.th-dark .card-half,
.th-glass.th-dark .quick-actions,
.th-glass.th-dark .kpi-card,
.th-glass.th-dark .chart-card,
.th-glass.th-dark .cat-cell,
.th-glass.th-dark .cat-sheet,
.th-glass.th-dark .amount-field {
  background: rgba(30, 41, 59, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.th-neo .finance-card,
.th-neo .card-half,
.th-neo .quick-actions,
.th-neo .kpi-card,
.th-neo .chart-card,
.th-neo .cat-sheet {
  background: #e8ebf2 !important;
  border: 0 !important;
  border-radius: 26rpx !important;
  box-shadow: 10rpx 10rpx 22rpx #cdd3de, -10rpx -10rpx 22rpx #ffffff !important;
}
.th-neo .cat-cell,
.th-neo .amount-field {
  background: #e8ebf2 !important;
  border: 0 !important;
  box-shadow: inset 4rpx 4rpx 9rpx #cdd3de, inset -4rpx -4rpx 9rpx #ffffff !important;
}
.th-neo.th-dark .finance-card,
.th-neo.th-dark .card-half,
.th-neo.th-dark .quick-actions,
.th-neo.th-dark .kpi-card,
.th-neo.th-dark .chart-card,
.th-neo.th-dark .cat-sheet,
.th-neo.th-dark .cat-cell,
.th-neo.th-dark .amount-field {
  background: #131a24 !important;
  color: #e5e9f0;
  box-shadow: 10rpx 10rpx 22rpx #0a0f17, -10rpx -10rpx 22rpx #232c3a !important;
}
.th-neo.th-dark .cat-cell,
.th-neo.th-dark .amount-field {
  box-shadow: inset 4rpx 4rpx 9rpx #0a0f17, inset -4rpx -4rpx 9rpx #232c3a !important;
}

.th-brutal .finance-card,
.th-brutal .card-half,
.th-brutal .quick-actions,
.th-brutal .kpi-card,
.th-brutal .chart-card,
.th-brutal .cat-sheet {
  background: #ffffff !important;
  border: 3rpx solid #111111 !important;
  border-radius: 6rpx !important;
  box-shadow: 6rpx 6rpx 0 #111111 !important;
}
.th-brutal .cat-cell,
.th-brutal .amount-field {
  background: #ffffff !important;
  border: 2rpx solid #111111 !important;
  border-radius: 4rpx !important;
  box-shadow: 3rpx 3rpx 0 #111111 !important;
}
.th-brutal.th-dark .finance-card,
.th-brutal.th-dark .card-half,
.th-brutal.th-dark .quick-actions,
.th-brutal.th-dark .kpi-card,
.th-brutal.th-dark .chart-card,
.th-brutal.th-dark .cat-sheet,
.th-brutal.th-dark .cat-cell,
.th-brutal.th-dark .amount-field {
  background: #241f16 !important;
  border-color: #ffffff !important;
  box-shadow: 6rpx 6rpx 0 #ffffff !important;
  color: #e5e9f0;
}
</style>
