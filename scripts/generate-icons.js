const fs = require('fs');
const path = require('path');

// 创建一个简单的SVG图标 - 使用新的设计风格
const createSVGIcon = (size) => {
  // 基于 192x192 的比例计算
  const scale = size / 192;

  // 人头大小
  const smallHeadRadius = 14 * scale;
  const largeHeadRadius = 16 * scale;

  // 微笑弧线粗细
  const strokeWidth = 8 * scale;

  // 圆角半径
  const borderRadius = 38.4 * scale;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="${size}" height="${size}" fill="url(#grad1)" rx="${borderRadius}" />

  <!-- 三个人头（均匀布局） -->
  <circle cx="${64 * scale}" cy="${76 * scale}" r="${smallHeadRadius}" fill="white" />
  <circle cx="${96 * scale}" cy="${64 * scale}" r="${largeHeadRadius}" fill="white" />
  <circle cx="${128 * scale}" cy="${76 * scale}" r="${smallHeadRadius}" fill="white" />

  <!-- 连接微笑弧线，加粗 -->
  <path d="M ${56 * scale} ${112 * scale} Q ${96 * scale} ${144 * scale} ${136 * scale} ${112 * scale}" 
        stroke="white" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" />
</svg>`;
};

// 图标尺寸列表
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 创建icons目录
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 生成SVG图标文件
iconSizes.forEach((size) => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated: ${filename}`);
});

// 创建maskable图标 (更大的内容区域) - 使用新设计风格
const createMaskableSVG = () => {
  const size = 512;
  const scale = size / 192;

  // 适当缩小元素以适应maskable要求
  const innerScale = scale * 0.8;
  const offset = size * 0.1; // 10% 边距

  const smallHeadRadius = 14 * innerScale;
  const largeHeadRadius = 16 * innerScale;
  const strokeWidth = 8 * innerScale;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad2)"/>
  
  <!-- 三个人头（均匀布局） -->
  <circle cx="${64 * innerScale + offset}" cy="${76 * innerScale + offset}" r="${smallHeadRadius}" fill="white" />
  <circle cx="${96 * innerScale + offset}" cy="${64 * innerScale + offset}" r="${largeHeadRadius}" fill="white" />
  <circle cx="${128 * innerScale + offset}" cy="${76 * innerScale + offset}" r="${smallHeadRadius}" fill="white" />
  
  <!-- 连接微笑弧线，加粗 -->
  <path d="M ${56 * innerScale + offset} ${112 * innerScale + offset} Q ${96 * innerScale + offset} ${144 * innerScale + offset} ${136 * innerScale + offset} ${
    112 * innerScale + offset
  }" 
        stroke="white" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" />
</svg>`;
};

const maskableSVG = createMaskableSVG();
fs.writeFileSync(path.join(iconsDir, 'maskable-icon-512x512.svg'), maskableSVG);
console.log('Generated: maskable-icon-512x512.svg');

// 创建快捷方式图标
const createShortcutSVG = () => {
  const size = 96;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#10b981" rx="${size * 0.2}"/>
  <path d="M ${size * 0.5} ${size * 0.25} L ${size * 0.5} ${size * 0.75} M ${size * 0.25} ${size * 0.5} L ${size * 0.75} ${size * 0.5}" 
        stroke="white" stroke-width="${size * 0.08}" stroke-linecap="round"/>
</svg>`;
};

const shortcutSVG = createShortcutSVG();
fs.writeFileSync(path.join(iconsDir, 'shortcut-new-post.svg'), shortcutSVG);
console.log('Generated: shortcut-new-post.svg');

console.log('\n✅ All PWA icons generated successfully!');
console.log('📝 Note: SVG icons are generated. For better compatibility, consider converting them to PNG using an online tool or imagemagick.');
console.log('💡 You can convert SVG to PNG using: https://svgtopng.com/ or install imagemagick and run:');
console.log('   convert icon.svg icon.png');
