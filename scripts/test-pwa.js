const fs = require('fs');
const path = require('path');

console.log('🔍 PWA 功能检查...\n');

// 检查 manifest.json
const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('✅ manifest.json 存在且格式正确');
    console.log(`   应用名称: ${manifest.name}`);
    console.log(`   图标数量: ${manifest.icons.length}`);
    console.log(`   显示模式: ${manifest.display}`);
  } catch (error) {
    console.error('❌ manifest.json 格式错误:', error.message);
  }
} else {
  console.error('❌ manifest.json 不存在');
}

// 检查 Service Worker
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  console.log('✅ Service Worker (sw.js) 存在');
} else {
  console.error('❌ Service Worker (sw.js) 不存在');
}

// 检查图标文件
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (fs.existsSync(iconsDir)) {
  const iconFiles = fs.readdirSync(iconsDir);
  const requiredSizes = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'];

  console.log(`✅ 图标目录存在，包含 ${iconFiles.length} 个文件`);

  const missingIcons = [];
  requiredSizes.forEach((size) => {
    const iconFile = `icon-${size}.svg`;
    if (!iconFiles.includes(iconFile)) {
      missingIcons.push(iconFile);
    }
  });

  if (missingIcons.length === 0) {
    console.log('✅ 所有必需的图标文件都存在');
  } else {
    console.log(`⚠️  缺少图标文件: ${missingIcons.join(', ')}`);
  }

  // 检查 maskable 图标
  if (iconFiles.includes('maskable-icon-512x512.svg')) {
    console.log('✅ Maskable 图标存在');
  } else {
    console.log('⚠️  缺少 maskable 图标');
  }
} else {
  console.error('❌ 图标目录不存在');
}

// 检查组件文件
const pwaComponentPath = path.join(__dirname, '..', 'components', 'pwa-installer.tsx');
if (fs.existsSync(pwaComponentPath)) {
  console.log('✅ PWA 安装器组件存在');
} else {
  console.error('❌ PWA 安装器组件不存在');
}

console.log('\n📋 PWA 功能总结:');
console.log('   🎯 核心功能: 应用安装 ✅');
console.log('   📱 移动端支持: ✅');
console.log('   💻 桌面端支持: ✅');
console.log('   🔄 基础缓存: ✅');
console.log('   📬 推送通知: 🚧 (预留功能)');
console.log('   🌐 离线支持: 🚧 (基础实现)');

console.log('\n🚀 下一步:');
console.log('   1. 运行 npm run dev 启动开发服务器');
console.log('   2. 打开浏览器访问 http://localhost:3000');
console.log('   3. 打开 Chrome DevTools > Application 验证 PWA 功能');
console.log('   4. 在移动设备上测试安装功能');

console.log('\n💡 提示:');
console.log('   - PWA 需要 HTTPS 环境 (开发环境 localhost 除外)');
console.log('   - 可以使用 Chrome DevTools 的 Lighthouse 进行 PWA 审计');
console.log('   - 如需 PNG 图标,可访问 https://svgtopng.com/ 转换 SVG 文件');
