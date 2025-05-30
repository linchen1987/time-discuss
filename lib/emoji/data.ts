// 表情包数据结构定义
export interface Emoji {
  id: string;
  unicode: string;
  name: string;
  keywords: string[];
  category: string;
  fallbackEmoji?: string;
}

export interface Sticker {
  id: string;
  name: string;
  keywords: string[];
  imageUrl: string;
  animated: boolean;
  width: number;
  height: number;
  fallbackEmoji?: string;
}

export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: Emoji[];
}

export interface StickerPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  stickers: Sticker[];
}

// 标准 Emoji 数据 - 只包含最常用的表情
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
    ],
  },
];

// 微信经典表情包数据 - 基于搜索结果中的经典表情
export const WECHAT_STICKER_PACKS: StickerPack[] = [
  {
    id: 'wechat_classic',
    name: '微信经典',
    description: '微信最经典的表情包合集',
    icon: '/stickers/wechat/smile.png',
    stickers: [
      // 基础表情 - 最常用的
      {
        id: 'smile',
        name: '微笑',
        keywords: ['微笑', '开心', '高兴'],
        imageUrl: '/stickers/wechat/smile.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😊',
      },
      {
        id: 'grimace',
        name: '撇嘴',
        keywords: ['撇嘴', '不满', '郁闷'],
        imageUrl: '/stickers/wechat/grimace.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😒',
      },
      {
        id: 'drool',
        name: '色',
        keywords: ['色', '流口水', '垂涎'],
        imageUrl: '/stickers/wechat/drool.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🤤',
      },
      {
        id: 'scowl',
        name: '发呆',
        keywords: ['发呆', '愣神', '茫然'],
        imageUrl: '/stickers/wechat/scowl.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😶',
      },
      {
        id: 'cool_guy',
        name: '得意',
        keywords: ['得意', '酷', '墨镜'],
        imageUrl: '/stickers/wechat/cool_guy.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😎',
      },
      {
        id: 'sob',
        name: '流泪',
        keywords: ['流泪', '哭', '伤心'],
        imageUrl: '/stickers/wechat/sob.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😢',
      },
      {
        id: 'shy',
        name: '害羞',
        keywords: ['害羞', '脸红', '不好意思'],
        imageUrl: '/stickers/wechat/shy.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😳',
      },
      {
        id: 'silent',
        name: '闭嘴',
        keywords: ['闭嘴', '沉默', '不说话'],
        imageUrl: '/stickers/wechat/silent.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🤐',
      },
      {
        id: 'sleep',
        name: '睡',
        keywords: ['睡觉', '困', 'zzz'],
        imageUrl: '/stickers/wechat/sleep.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😴',
      },
      {
        id: 'cry',
        name: '大哭',
        keywords: ['大哭', '痛哭', '伤心'],
        imageUrl: '/stickers/wechat/cry.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😭',
      },
      {
        id: 'awkward',
        name: '尴尬',
        keywords: ['尴尬', '无语', '汗'],
        imageUrl: '/stickers/wechat/awkward.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😅',
      },
      {
        id: 'angry',
        name: '发怒',
        keywords: ['发怒', '生气', '愤怒'],
        imageUrl: '/stickers/wechat/angry.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😠',
      },
      {
        id: 'tongue',
        name: '调皮',
        keywords: ['调皮', '吐舌头', '淘气'],
        imageUrl: '/stickers/wechat/tongue.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😛',
      },
      {
        id: 'grin',
        name: '呲牙',
        keywords: ['呲牙', '笑', '开心'],
        imageUrl: '/stickers/wechat/grin.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😁',
      },
      {
        id: 'surprise',
        name: '惊讶',
        keywords: ['惊讶', '吃惊', '哇'],
        imageUrl: '/stickers/wechat/surprise.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😲',
      },
      {
        id: 'frown',
        name: '难过',
        keywords: ['难过', '沮丧', '失落'],
        imageUrl: '/stickers/wechat/frown.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '☹️',
      },

      // 动作表情
      {
        id: 'clap',
        name: '鼓掌',
        keywords: ['鼓掌', '赞', '支持'],
        imageUrl: '/stickers/wechat/clap.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '👏',
      },
      {
        id: 'strong',
        name: '强',
        keywords: ['强', '厉害', '赞'],
        imageUrl: '/stickers/wechat/strong.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '👍',
      },
      {
        id: 'weak',
        name: '弱',
        keywords: ['弱', '差', '不行'],
        imageUrl: '/stickers/wechat/weak.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '👎',
      },
      {
        id: 'shake',
        name: '握手',
        keywords: ['握手', '合作', '朋友'],
        imageUrl: '/stickers/wechat/shake.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🤝',
      },
      {
        id: 'victory',
        name: '胜利',
        keywords: ['胜利', 'V', '耶'],
        imageUrl: '/stickers/wechat/victory.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '✌️',
      },
      {
        id: 'hug',
        name: '拥抱',
        keywords: ['拥抱', '抱抱', '安慰'],
        imageUrl: '/stickers/wechat/hug.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🤗',
      },
      {
        id: 'fist',
        name: '拳头',
        keywords: ['拳头', '加油', '努力'],
        imageUrl: '/stickers/wechat/fist.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '✊',
      },

      // 物品表情
      {
        id: 'rose',
        name: '玫瑰',
        keywords: ['玫瑰', '花', '爱情'],
        imageUrl: '/stickers/wechat/rose.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🌹',
      },
      {
        id: 'heart',
        name: '爱心',
        keywords: ['爱心', '喜欢', '爱'],
        imageUrl: '/stickers/wechat/heart.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '❤️',
      },
      {
        id: 'broken_heart',
        name: '心碎',
        keywords: ['心碎', '伤心', '失恋'],
        imageUrl: '/stickers/wechat/broken_heart.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '💔',
      },
      {
        id: 'cake',
        name: '蛋糕',
        keywords: ['蛋糕', '生日', '庆祝'],
        imageUrl: '/stickers/wechat/cake.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🎂',
      },
      {
        id: 'beer',
        name: '啤酒',
        keywords: ['啤酒', '干杯', '庆祝'],
        imageUrl: '/stickers/wechat/beer.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🍺',
      },
      {
        id: 'coffee',
        name: '咖啡',
        keywords: ['咖啡', '提神', '工作'],
        imageUrl: '/stickers/wechat/coffee.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '☕',
      },
      {
        id: 'gift',
        name: '礼物',
        keywords: ['礼物', '惊喜', '祝福'],
        imageUrl: '/stickers/wechat/gift.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🎁',
      },

      // 最新的经典表情（2020年新增的6个）
      {
        id: 'eye_roll',
        name: '翻白眼',
        keywords: ['翻白眼', '无语', '鄙视'],
        imageUrl: '/stickers/wechat/eye_roll.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🙄',
      },
      {
        id: '666',
        name: '666',
        keywords: ['666', '厉害', '牛'],
        imageUrl: '/stickers/wechat/666.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🎯',
      },
      {
        id: 'let_me_see',
        name: '让我看看',
        keywords: ['让我看看', '瞧瞧', '观察'],
        imageUrl: '/stickers/wechat/let_me_see.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🧐',
      },
      {
        id: 'sigh',
        name: '叹气',
        keywords: ['叹气', '无奈', '哎'],
        imageUrl: '/stickers/wechat/sigh.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😮‍💨',
      },
      {
        id: 'bitter',
        name: '苦涩',
        keywords: ['苦涩', '无奈', '难受'],
        imageUrl: '/stickers/wechat/bitter.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '😖',
      },
      {
        id: 'crack',
        name: '裂开',
        keywords: ['裂开', '崩溃', '破防'],
        imageUrl: '/stickers/wechat/crack.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🤯',
      },
    ],
  },
  {
    id: 'internet_classic',
    name: '网络经典',
    description: '互联网时代的经典表情包',
    icon: '/stickers/internet/doge.png',
    stickers: [
      {
        id: 'doge',
        name: 'doge',
        keywords: ['doge', '狗头', '柴犬', '保命'],
        imageUrl: '/stickers/internet/doge.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🐕',
      },
      {
        id: 'thinking_black',
        name: '黑人问号',
        keywords: ['思考', '黑人问号', '疑问'],
        imageUrl: '/stickers/internet/thinking_black.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🤔',
      },
      {
        id: 'pepe',
        name: 'pepe',
        keywords: ['pepe', '佩佩蛙', '青蛙'],
        imageUrl: '/stickers/internet/pepe.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🐸',
      },
      {
        id: 'this_is_fine',
        name: '没事',
        keywords: ['没事', '淡定', '一切都好'],
        imageUrl: '/stickers/internet/this_is_fine.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🙂‍🔥',
      },
      {
        id: 'facepalm',
        name: '捂脸',
        keywords: ['捂脸', '无语', '尴尬'],
        imageUrl: '/stickers/internet/facepalm.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '🤦',
      },
      {
        id: 'surprised_pikachu',
        name: '皮卡丘',
        keywords: ['皮卡丘', '惊讶', '震惊'],
        imageUrl: '/stickers/internet/surprised_pikachu.png',
        animated: false,
        width: 64,
        height: 64,
        fallbackEmoji: '⚡',
      },
    ],
  },
];

// 获取所有表情包数据的函数
export function getAllEmojiData() {
  return {
    emojis: EMOJI_CATEGORIES,
    stickers: WECHAT_STICKER_PACKS,
    timestamp: Date.now(),
  };
}

// 搜索表情包的函数
export function searchEmojiData(query: string) {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return { emojis: [], stickers: [], hasResults: false };

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

  // 搜索 Stickers
  const matchedStickers: Sticker[] = [];
  WECHAT_STICKER_PACKS.forEach((pack) => {
    pack.stickers.forEach((sticker) => {
      const matchesName = sticker.name.toLowerCase().includes(normalizedQuery);
      const matchesKeywords = sticker.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));

      if (matchesName || matchesKeywords) {
        matchedStickers.push(sticker);
      }
    });
  });

  return {
    emojis: matchedEmojis,
    stickers: matchedStickers,
    hasResults: matchedEmojis.length > 0 || matchedStickers.length > 0,
  };
}
