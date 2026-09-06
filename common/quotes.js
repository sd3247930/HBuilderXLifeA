/**
 * 每日名言：按日期种子取同一天同一句，点击可随机刷新。
 */
export const QUOTES = [
  { text: '生活不能等待别人来安排，要自己去争取和奋斗', author: '路遥' },
  { text: '世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱生活', author: '罗曼·罗兰' },
  { text: '不要为成功而努力，要为做一个有价值的人而努力', author: '爱因斯坦' },
  { text: '人的一切痛苦，本质上都是对自己无能的愤怒', author: '王小波' },
  { text: '活着就是为了改变世界，难道还有其他原因吗？', author: '史蒂夫·乔布斯' },
  { text: '世上本没有路，走的人多了，也便成了路', author: '鲁迅' },
  { text: '黑夜给了我黑色的眼睛，我却用它寻找光明', author: '顾城' },
  { text: '所谓无底深渊，下去，也是前程万里', author: '木心' },
  { text: '万物皆有裂痕，那是光照进来的地方', author: '莱昂纳德·科恩' },
  { text: '人生如逆旅，我亦是行人', author: '苏轼' },
  { text: '博观而约取，厚积而薄发', author: '苏轼' },
  { text: '长风破浪会有时，直挂云帆济沧海', author: '李白' },
  { text: '知之者不如好之者，好之者不如乐之者', author: '孔子' },
  { text: '不积跬步，无以至千里；不积小流，无以成江海', author: '荀子' },
  { text: '天行健，君子以自强不息', author: '《周易》' },
  { text: '业精于勤，荒于嬉；行成于思，毁于随', author: '韩愈' },
  { text: '纸上得来终觉浅，绝知此事要躬行', author: '陆游' },
  { text: '世界以痛吻我，要我报之以歌', author: '泰戈尔' },
  { text: '所谓自由，不是随心所欲，而是自我主宰', author: '康德' },
  { text: '一个人知道自己为什么而活，就可以忍受任何一种生活', author: '尼采' },
  { text: '真正的快乐来自于做有意义的事', author: '佚名' },
  { text: '种一棵树最好的时间是十年前，其次是现在', author: '谚语' },
  { text: '把每一天都当成新的开始，好好生活', author: '佚名' },
  { text: '愿你的生命中有足够多的云翳，来造就一个美丽的黄昏', author: '冰心' }
]

function hashOf(dateStr) {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

function localDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}

export function getDailyQuote() {
  const idx = hashOf(localDateStr(new Date())) % QUOTES.length
  return QUOTES[idx]
}

export function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)]
}
