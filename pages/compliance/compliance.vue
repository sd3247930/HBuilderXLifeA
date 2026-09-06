<template>
  <view :class="['page', themeClass]">
    <!-- 概览 -->
    <view class="card">
      <view class="card-title">LifestyleApp 隐私与合规说明</view>
      <view class="muted">更新日期：2026-09-06</view>
      <view class="gap"></view>
      <text class="body-text">LifestyleApp 是一款生活方式管理工具（记账、习惯打卡、任务）。本页面向您说明应用收集哪些数据、申请哪些设备权限，以及我们如何保护这些数据。</text>
    </view>

    <!-- 信息收集与使用 -->
    <view class="card">
      <view class="card-title">我们收集和使用的信息</view>
      <view v-for="item in collects" :key="item.title" class="list-row">
        <view class="list-main">
          <view class="list-title">{{ item.title }}</view>
          <view class="list-meta">{{ item.desc }}</view>
        </view>
      </view>
      <text class="body-text">我们遵循“最小必要”原则，不收集位置、通讯录、短信、通话记录等与功能无关的信息，也未接入广告、推送、统计类第三方 SDK。</text>
    </view>

    <!-- 权限说明 -->
    <view class="card">
      <view class="card-title">设备权限说明</view>
      <view v-for="p in permissions" :key="p.name" class="list-row">
        <view class="list-main">
          <view class="list-title">{{ p.name }}（{{ p.required ? '必需' : '可选' }}）</view>
          <view class="list-meta">{{ p.usage }}。触发时机：{{ p.when }}</view>
        </view>
      </view>
      <text class="body-text">您可以随时在系统「设置 - 应用管理 - LifestyleApp - 权限管理」中关闭已授权的权限。关闭某项权限后，仅对应的功能不可用，不影响其他功能。</text>
    </view>

    <!-- 数据存储与安全 -->
    <view class="card">
      <view class="card-title">数据存储与安全</view>
      <view v-for="row in storage" :key="row.title" class="list-row">
        <view class="list-main">
          <view class="list-title">{{ row.title }}</view>
          <view class="list-meta">{{ row.desc }}</view>
        </view>
      </view>
    </view>

    <!-- 第三方与框架 -->
    <view class="card">
      <view class="card-title">第三方框架与组件</view>
      <view v-for="sdk in sdks" :key="sdk.name" class="list-row">
        <view class="list-main">
          <view class="list-title">{{ sdk.name }}（{{ sdk.vendor }}）</view>
          <view class="list-meta">{{ sdk.desc }}</view>
        </view>
      </view>
      <text class="body-text">除上述运行时框架外，本应用不主动向任何第三方传输您的个人数据。若后续接入联网云服务或新增 SDK，我们会先更新本说明。</text>
    </view>

    <!-- 用户权利 -->
    <view class="card">
      <view class="card-title">您的权利</view>
      <view v-for="row in rights" :key="row.title" class="list-row">
        <view class="list-main">
          <view class="list-title">{{ row.title }}</view>
          <view class="list-meta">{{ row.desc }}</view>
        </view>
      </view>
    </view>

    <!-- 版本与联系 -->
    <view class="card">
      <view class="card-title">版本与联系</view>
      <view class="list-row"><view class="list-main"><view class="list-title">当前版本</view><view class="list-meta">v1.0.2（uni-app 跨端版）</view></view></view>
      <view class="list-row"><view class="list-main"><view class="list-title">隐私问题联系</view><view class="list-meta">[开发者邮箱/地址待正式发布前填写]</view></view></view>
      <text class="body-text">本页面内容将随功能更新同步修订，修订后会在应用内显著位置提示您查看。</text>
    </view>
  </view>
</template>

<script>
import { useAuth } from '../../common/auth'
import { useTheme } from '../../common/theme'

export default {
  setup() {
    const themeApi = useTheme()
    const theme = themeApi.state
    const themeClass = themeApi.classNames

    const collects = [
      { title: '注册与登录', desc: '用户名、昵称、登录密码。密码不以明文保存，服务端以加盐哈希方式存储。' },
      { title: '记账、习惯与任务数据', desc: '收支金额、分类、日期、备注、习惯打卡记录、任务内容，用于提供核心功能与统计。' },
      { title: '头像图片', desc: '由您主动选择上传；当前版本压缩为 128×128 小图保存在本机，不上传云端。' }
    ]
    const permissions = [
      { name: '网络（INTERNET）', required: true, usage: '连接本应用服务接口以读写数据', when: '登录及每次数据读写时' },
      { name: '网络状态（ACCESS_NETWORK_STATE）', required: true, usage: '检测网络是否可用并给出友好提示', when: '应用启动与请求数据时' },
      { name: '相机（CAMERA，可选）', required: false, usage: '拍摄照片用作头像', when: '您在头像上传中选择“拍照”时' },
      { name: '振动（VIBRATE）', required: false, usage: '习惯打卡成功时的触感反馈', when: '打卡成功时' }
    ]
    const storage = [
      { title: '存储方式', desc: '记账、习惯、任务、分类与账户数据均保存在设备本地（App 使用系统存储、H5 使用浏览器存储、小程序使用平台存储），不依赖网络服务。' },
      { title: '数据归属', desc: '您可以随时在应用内查看、编辑或删除已录入的记账、习惯与任务数据。' },
      { title: '离线可用', desc: '应用可完全离线使用；若未来接入云端同步服务，将提前更新本说明并重新征得您的同意。' }
    ]
    const sdks = [
      { name: 'uni-app 运行时', vendor: 'DCloud', desc: '提供跨平台运行环境；其框架级信息收集行为以 DCloud 官方隐私说明为准，本应用未初始化广告/统计模块。' },
      { name: '应用内自研组件', vendor: 'LifestyleApp', desc: '图表、表情提示等均为自研代码，不收集信息。' }
    ]
    const rights = [
      { title: '查看与更正', desc: '您可以在应用内查看、编辑已录入的数据。' },
      { title: '删除', desc: '您可以删除单条记账/习惯/任务记录，管理分类与账户。' },
      { title: '撤回同意', desc: '您可以在系统权限管理中随时关闭已授权的权限。' }
    ]

    return { theme, themeClass, collects, permissions, storage, sdks, rights }
  },
  onLoad() {
    if (!useAuth().isLogin) {
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
}
</script>

<style lang="scss">
.body-text { display: block; font-size: 26rpx; color: #475569; line-height: 1.7; margin-top: 12rpx; }
.th-dark .body-text { color: #cbd5e1; }
.gap { height: 16rpx; }
</style>
