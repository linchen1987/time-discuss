const fs = require('fs');
const path = require('path');

// 创建一个简单的SVG图标
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad1)" rx="${size * 0.2}"/>
  <circle cx="${size * 0.5}" cy="${size * 0.35}" r="${size * 0.12}" fill="white"/>
  <path d="M ${size * 0.25} ${size * 0.55} Q ${size * 0.5} ${size * 0.75} ${size * 0.75} ${size * 0.55}" 
        stroke="white" stroke-width="${size * 0.04}" fill="none" stroke-linecap="round"/>
  <text x="${size * 0.5}" y="${size * 0.9}" text-anchor="middle" fill="white" 
        font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold">朋友</text>
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

// 创建maskable图标 (更大的内容区域)
const createMaskableSVG = () => {
  const size = 512;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad2)"/>
  <circle cx="${size * 0.5}" cy="${size * 0.4}" r="${size * 0.08}" fill="white"/>
  <path d="M ${size * 0.35} ${size * 0.52} Q ${size * 0.5} ${size * 0.65} ${size * 0.65} ${size * 0.52}" 
        stroke="white" stroke-width="${size * 0.03}" fill="none" stroke-linecap="round"/>
  <text x="${size * 0.5}" y="${size * 0.8}" text-anchor="middle" fill="white" 
        font-family="Arial, sans-serif" font-size="${size * 0.06}" font-weight="bold">朋友之家</text>
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
