// 表情包数据结构定义
export interface Emoji {
  id: string;
  unicode: string;
  name: string;
  keywords: string[];
  category: string;
  fallbackEmoji?: string;
}

export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: Emoji[];
}

// 标准 Emoji 数据 - 常用表情
export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: '笑脸',
    icon: '😊',
    emojis: [
      { id: 'smile', unicode: '😀', name: '嘿嘿', keywords: ['嘿嘿', '笑', '开心'], category: 'smileys' },
      { id: 'grinning', unicode: '😃', name: '哈哈', keywords: ['哈哈', '大笑', '开心'], category: 'smileys' },
      { id: 'joy', unicode: '😂', name: '笑哭了', keywords: ['笑哭', '太好笑', '哈哈哈'], category: 'smileys' },
      { id: 'slight_smile', unicode: '🙂', name: '呵呵', keywords: ['呵呵', '微笑', '淡然'], category: 'smileys' },
      { id: 'wink', unicode: '😉', name: '眨眼', keywords: ['眨眼', '调皮', '暗示'], category: 'smileys' },
      { id: 'blush', unicode: '😊', name: '羞涩微笑', keywords: ['害羞', '开心', '微笑'], category: 'smileys' },
      { id: 'heart_eyes', unicode: '😍', name: '花痴', keywords: ['花痴', '爱慕', '喜欢'], category: 'smileys' },
      { id: 'kiss', unicode: '😘', name: '飞吻', keywords: ['飞吻', '么么哒', '亲亲'], category: 'smileys' },
      { id: 'thinking', unicode: '🤔', name: '想一想', keywords: ['思考', '想', '考虑'], category: 'smileys' },
      { id: 'neutral', unicode: '😐', name: '冷漠', keywords: ['冷漠', '无语', '淡定'], category: 'smileys' },
      { id: 'unamused', unicode: '😒', name: '不高兴', keywords: ['不高兴', '无聊', '郁闷'], category: 'smileys' },
      { id: 'roll_eyes', unicode: '🙄', name: '翻白眼', keywords: ['翻白眼', '无语', '鄙视'], category: 'smileys' },
      { id: 'tired', unicode: '😩', name: '累死了', keywords: ['累死了', '疲惫', '无奈'], category: 'smileys' },
      { id: 'cry', unicode: '😢', name: '哭', keywords: ['哭', '难过', '伤心'], category: 'smileys' },
      { id: 'sob', unicode: '😭', name: '放声大哭', keywords: ['大哭', '痛哭', '伤心'], category: 'smileys' },
      { id: 'angry', unicode: '😠', name: '生气', keywords: ['生气', '愤怒', '火大'], category: 'smileys' },
      { id: 'rage', unicode: '😡', name: '怒火中烧', keywords: ['怒火', '愤怒', '暴怒'], category: 'smileys' },
      { id: 'sweat', unicode: '😅', name: '苦笑', keywords: ['苦笑', '尴尬', '冷汗'], category: 'smileys' },
      { id: 'fearful', unicode: '😨', name: '害怕', keywords: ['害怕', '惊恐', '吓到'], category: 'smileys' },
      { id: 'confused', unicode: '😕', name: '困扰', keywords: ['困扰', '疑惑', '不解'], category: 'smileys' },

      { id: 'laughing', unicode: '😆', name: '笑得合不拢嘴', keywords: ['大笑', '哈哈', '开心'], category: 'smileys' },
      { id: 'smiling_with_heart_eyes', unicode: '🥰', name: '爱心眼', keywords: ['爱心', '喜欢', '满足'], category: 'smileys' },
      { id: 'star_struck', unicode: '🤩', name: '星星眼', keywords: ['星星眼', '崇拜', '兴奋'], category: 'smileys' },
      { id: 'partying_face', unicode: '🥳', name: '庆祝', keywords: ['庆祝', '派对', '开心'], category: 'smileys' },
      { id: 'smirking', unicode: '😏', name: '坏笑', keywords: ['坏笑', '得意', '调皮'], category: 'smileys' },
      { id: 'sleepy', unicode: '😴', name: '睡觉', keywords: ['睡觉', '困', 'zzz'], category: 'smileys' },
      { id: 'drooling', unicode: '🤤', name: '流口水', keywords: ['流口水', '垂涎', '好吃'], category: 'smileys' },
      { id: 'yawning', unicode: '🥱', name: '打哈欠', keywords: ['打哈欠', '困', '无聊'], category: 'smileys' },
      { id: 'mask', unicode: '😷', name: '戴口罩', keywords: ['口罩', '生病', '防护'], category: 'smileys' },
      { id: 'sunglasses', unicode: '😎', name: '墨镜', keywords: ['墨镜', '酷', '帅气'], category: 'smileys' },
      { id: 'nerd', unicode: '🤓', name: '书呆子', keywords: ['书呆子', '眼镜', '学霸'], category: 'smileys' },
      { id: 'shocked', unicode: '😱', name: '震惊', keywords: ['震惊', '吃惊', '恐惧'], category: 'smileys' },
      { id: 'zipper_mouth', unicode: '🤐', name: '闭嘴', keywords: ['闭嘴', '拉链', '保密'], category: 'smileys' },
      { id: 'money_mouth', unicode: '🤑', name: '财迷', keywords: ['财迷', '钱', '贪婪'], category: 'smileys' },
    ],
  },
  {
    id: 'gestures',
    name: '手势',
    icon: '👍',
    emojis: [
      { id: 'thumbs_up', unicode: '👍', name: '赞', keywords: ['赞', '好', '厉害'], category: 'gestures' },
      { id: 'thumbs_down', unicode: '👎', name: '踩', keywords: ['踩', '不好', '差评'], category: 'gestures' },
      { id: 'clap', unicode: '👏', name: '鼓掌', keywords: ['鼓掌', '赞美', '支持'], category: 'gestures' },
      { id: 'wave', unicode: '👋', name: '挥手', keywords: ['挥手', '再见', '你好'], category: 'gestures' },
      { id: 'ok_hand', unicode: '👌', name: 'OK', keywords: ['OK', '好的', '没问题'], category: 'gestures' },
      { id: 'v', unicode: '✌️', name: '胜利', keywords: ['胜利', 'V', '耶'], category: 'gestures' },
      { id: 'fist', unicode: '✊', name: '拳头', keywords: ['拳头', '加油', '团结'], category: 'gestures' },
      { id: 'heart', unicode: '❤️', name: '爱心', keywords: ['爱心', '喜欢', '爱'], category: 'gestures' },

      { id: 'pray', unicode: '🙏', name: '祈祷', keywords: ['祈祷', '拜托', '谢谢'], category: 'gestures' },
      { id: 'muscle', unicode: '💪', name: '肌肉', keywords: ['肌肉', '强壮', '加油'], category: 'gestures' },
      { id: 'point_up', unicode: '☝️', name: '指向上', keywords: ['指向上', '注意', '重点'], category: 'gestures' },
      { id: 'point_right', unicode: '👉', name: '指向右', keywords: ['指向右', '看这里', '指出'], category: 'gestures' },
      { id: 'point_left', unicode: '👈', name: '指向左', keywords: ['指向左', '那边', '指向'], category: 'gestures' },
      { id: 'point_down', unicode: '👇', name: '指向下', keywords: ['指向下', '看下面', '往下'], category: 'gestures' },
      { id: 'crossed_fingers', unicode: '🤞', name: '交叉手指', keywords: ['交叉手指', '祈求', '好运'], category: 'gestures' },
      { id: 'shh', unicode: '🤫', name: '嘘', keywords: ['嘘', '安静', '保密'], category: 'gestures' },
      { id: 'handshake', unicode: '🤝', name: '握手', keywords: ['握手', '合作', '协议'], category: 'gestures' },
      { id: 'heart_hands', unicode: '🫶', name: '爱心手势', keywords: ['爱心手势', '爱', '关怀'], category: 'gestures' },
    ],
  },
  {
    id: 'animals',
    name: '动物',
    icon: '🐱',
    emojis: [
      { id: 'cat', unicode: '🐱', name: '猫咪', keywords: ['猫', '猫咪', '萌'], category: 'animals' },
      { id: 'dog', unicode: '🐶', name: '狗狗', keywords: ['狗', '狗狗', '萌'], category: 'animals' },
      { id: 'mouse', unicode: '🐭', name: '老鼠', keywords: ['老鼠', '鼠', '小'], category: 'animals' },
      { id: 'hamster', unicode: '🐹', name: '仓鼠', keywords: ['仓鼠', '萌', '小动物'], category: 'animals' },
      { id: 'rabbit', unicode: '🐰', name: '兔子', keywords: ['兔子', '萌', '可爱'], category: 'animals' },
      { id: 'fox', unicode: '🦊', name: '狐狸', keywords: ['狐狸', '聪明', '狡猾'], category: 'animals' },
      { id: 'bear', unicode: '🐻', name: '熊', keywords: ['熊', '可爱', '毛茸茸'], category: 'animals' },
      { id: 'panda', unicode: '🐼', name: '熊猫', keywords: ['熊猫', '可爱', '国宝'], category: 'animals' },
      { id: 'koala', unicode: '🐨', name: '考拉', keywords: ['考拉', '可爱', '澳洲'], category: 'animals' },
      { id: 'tiger', unicode: '🐯', name: '老虎', keywords: ['老虎', '威猛', '王者'], category: 'animals' },
      { id: 'lion', unicode: '🦁', name: '狮子', keywords: ['狮子', '威猛', '王者'], category: 'animals' },
      { id: 'pig', unicode: '🐷', name: '猪', keywords: ['猪', '可爱', '肥'], category: 'animals' },
      { id: 'monkey', unicode: '🐵', name: '猴子', keywords: ['猴子', '调皮', '聪明'], category: 'animals' },
      { id: 'chicken', unicode: '🐔', name: '鸡', keywords: ['鸡', '公鸡', '动物'], category: 'animals' },
      { id: 'penguin', unicode: '🐧', name: '企鹅', keywords: ['企鹅', '可爱', '南极'], category: 'animals' },
      { id: 'bird', unicode: '🐦', name: '鸟', keywords: ['鸟', '飞翔', '自由'], category: 'animals' },
    ],
  },
  {
    id: 'food',
    name: '食物',
    icon: '🍎',
    emojis: [
      { id: 'apple', unicode: '🍎', name: '苹果', keywords: ['苹果', '水果', '健康'], category: 'food' },
      { id: 'banana', unicode: '🍌', name: '香蕉', keywords: ['香蕉', '水果', '黄色'], category: 'food' },
      { id: 'grapes', unicode: '🍇', name: '葡萄', keywords: ['葡萄', '水果', '紫色'], category: 'food' },
      { id: 'strawberry', unicode: '🍓', name: '草莓', keywords: ['草莓', '水果', '甜'], category: 'food' },
      { id: 'watermelon', unicode: '🍉', name: '西瓜', keywords: ['西瓜', '水果', '夏天'], category: 'food' },
      { id: 'peach', unicode: '🍑', name: '桃子', keywords: ['桃子', '水果', '粉色'], category: 'food' },
      { id: 'pizza', unicode: '🍕', name: '披萨', keywords: ['披萨', '快餐', '美食'], category: 'food' },
      { id: 'hamburger', unicode: '🍔', name: '汉堡', keywords: ['汉堡', '快餐', '美食'], category: 'food' },
      { id: 'fries', unicode: '🍟', name: '薯条', keywords: ['薯条', '快餐', '炸'], category: 'food' },
      { id: 'hot_dog', unicode: '🌭', name: '热狗', keywords: ['热狗', '快餐', '香肠'], category: 'food' },
      { id: 'taco', unicode: '🌮', name: '墨西哥卷', keywords: ['墨西哥卷', '美食', '辣'], category: 'food' },
      { id: 'sushi', unicode: '🍣', name: '寿司', keywords: ['寿司', '日料', '鱼'], category: 'food' },
      { id: 'ramen', unicode: '🍜', name: '拉面', keywords: ['拉面', '面条', '热汤'], category: 'food' },
      { id: 'cake', unicode: '🍰', name: '蛋糕', keywords: ['蛋糕', '甜点', '庆祝'], category: 'food' },
      { id: 'ice_cream', unicode: '🍦', name: '冰淇淋', keywords: ['冰淇淋', '甜点', '凉爽'], category: 'food' },
      { id: 'coffee', unicode: '☕', name: '咖啡', keywords: ['咖啡', '提神', '苦'], category: 'food' },
    ],
  },
  {
    id: 'activities',
    name: '活动',
    icon: '⚽',
    emojis: [
      { id: 'soccer', unicode: '⚽', name: '足球', keywords: ['足球', '运动', '球'], category: 'activities' },
      { id: 'basketball', unicode: '🏀', name: '篮球', keywords: ['篮球', '运动', '球'], category: 'activities' },
      { id: 'tennis', unicode: '🎾', name: '网球', keywords: ['网球', '运动', '球'], category: 'activities' },
      { id: 'baseball', unicode: '⚾', name: '棒球', keywords: ['棒球', '运动', '球'], category: 'activities' },
      { id: 'ping_pong', unicode: '🏓', name: '乒乓球', keywords: ['乒乓球', '运动', '球'], category: 'activities' },
      { id: 'badminton', unicode: '🏸', name: '羽毛球', keywords: ['羽毛球', '运动', '球'], category: 'activities' },
      { id: 'swimming', unicode: '🏊', name: '游泳', keywords: ['游泳', '运动', '水'], category: 'activities' },
      { id: 'running', unicode: '🏃', name: '跑步', keywords: ['跑步', '运动', '健身'], category: 'activities' },
      { id: 'cycling', unicode: '🚴', name: '骑行', keywords: ['骑行', '自行车', '运动'], category: 'activities' },
      { id: 'guitar', unicode: '🎸', name: '吉他', keywords: ['吉他', '音乐', '乐器'], category: 'activities' },
      { id: 'piano', unicode: '🎹', name: '钢琴', keywords: ['钢琴', '音乐', '乐器'], category: 'activities' },
      { id: 'microphone', unicode: '🎤', name: '麦克风', keywords: ['麦克风', '唱歌', '音乐'], category: 'activities' },
      { id: 'headphones', unicode: '🎧', name: '耳机', keywords: ['耳机', '音乐', '听歌'], category: 'activities' },
      { id: 'art', unicode: '🎨', name: '调色板', keywords: ['画画', '艺术', '创作'], category: 'activities' },
      { id: 'camera', unicode: '📷', name: '相机', keywords: ['相机', '拍照', '摄影'], category: 'activities' },
      { id: 'video_camera', unicode: '📹', name: '摄像机', keywords: ['摄像机', '录像', '视频'], category: 'activities' },
    ],
  },
  {
    id: 'objects',
    name: '物品',
    icon: '💎',
    emojis: [
      { id: 'diamond', unicode: '💎', name: '钻石', keywords: ['钻石', '宝石', '昂贵'], category: 'objects' },
      { id: 'ring', unicode: '💍', name: '戒指', keywords: ['戒指', '结婚', '爱情'], category: 'objects' },
      { id: 'crown', unicode: '👑', name: '王冠', keywords: ['王冠', '皇室', '尊贵'], category: 'objects' },
      { id: 'watch', unicode: '⌚', name: '手表', keywords: ['手表', '时间', '配饰'], category: 'objects' },
      { id: 'glasses', unicode: '👓', name: '眼镜', keywords: ['眼镜', '视力', '配饰'], category: 'objects' },
      { id: 'necktie', unicode: '👔', name: '领带', keywords: ['领带', '正装', '商务'], category: 'objects' },
      { id: 'shirt', unicode: '👕', name: '衬衫', keywords: ['衬衫', '衣服', '穿着'], category: 'objects' },
      { id: 'jeans', unicode: '👖', name: '牛仔裤', keywords: ['牛仔裤', '裤子', '衣服'], category: 'objects' },
      { id: 'dress', unicode: '👗', name: '连衣裙', keywords: ['连衣裙', '裙子', '女装'], category: 'objects' },
      { id: 'high_heel', unicode: '👠', name: '高跟鞋', keywords: ['高跟鞋', '鞋子', '女鞋'], category: 'objects' },
      { id: 'sneaker', unicode: '👟', name: '运动鞋', keywords: ['运动鞋', '鞋子', '舒适'], category: 'objects' },
      { id: 'backpack', unicode: '🎒', name: '背包', keywords: ['背包', '包', '学生'], category: 'objects' },
      { id: 'handbag', unicode: '👜', name: '手提包', keywords: ['手提包', '包', '女包'], category: 'objects' },
      { id: 'briefcase', unicode: '💼', name: '公文包', keywords: ['公文包', '工作', '商务'], category: 'objects' },
      { id: 'umbrella', unicode: '☂️', name: '雨伞', keywords: ['雨伞', '下雨', '遮阳'], category: 'objects' },
      { id: 'gift', unicode: '🎁', name: '礼物', keywords: ['礼物', '惊喜', '庆祝'], category: 'objects' },
    ],
  },
];

// 获取所有表情数据的函数
export function getAllEmojiData() {
  return {
    emojis: EMOJI_CATEGORIES,
    timestamp: Date.now(),
  };
}

// 搜索表情的函数
export function searchEmojiData(query: string) {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return { emojis: [], hasResults: false };

  // 搜索 Emoji
  const matchedEmojis: Emoji[] = [];
  EMOJI_CATEGORIES.forEach((category) => {
    category.emojis.forEach((emoji) => {
      const matchesName = emoji.name.toLowerCase().includes(normalizedQuery);
      const matchesKeywords = emoji.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));

      if (matchesName || matchesKeywords) {
        matchedEmojis.push(emoji);
      }
    });
  });

  return {
    emojis: matchedEmojis,
    hasResults: matchedEmojis.length > 0,
  };
}
