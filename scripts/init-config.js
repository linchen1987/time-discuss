#!/usr/bin/env node

/**
 * 配置初始化脚本
 * 用于从模板文件创建配置文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_TEMPLATE = path.join(__dirname, '..', 'config', 'app.template.ts');
const CONFIG_FILE = path.join(__dirname, '..', 'config', 'app.ts');

function initConfig() {
  console.log('🚀 初始化应用配置...\n');

  // 检查模板文件是否存在
  if (!fs.existsSync(CONFIG_TEMPLATE)) {
    console.error('❌ 模板文件不存在: config/app.template.ts');
    process.exit(1);
  }

  // 检查配置文件是否已存在
  if (fs.existsSync(CONFIG_FILE)) {
    console.log('⚠️  配置文件已存在: config/app.ts');
    console.log('   如需重新初始化，请先删除现有配置文件\n');

    console.log('🎯 配置说明:');
    console.log('   1. 编辑 config/app.ts 文件');
    console.log('   2. 修改应用名称、描述等配置项');
    console.log('   3. 重启开发服务器查看效果\n');

    console.log('📖 详细说明: 查看 CONFIG.md 文件');
    return;
  }

  try {
    // 复制模板文件
    fs.copyFileSync(CONFIG_TEMPLATE, CONFIG_FILE);
    console.log('✅ 成功创建配置文件: config/app.ts\n');

    console.log('🎯 下一步:');
    console.log('   1. 编辑 config/app.ts 文件');
    console.log('   2. 根据需要修改应用名称、描述等');
    console.log('   3. 重启开发服务器查看效果\n');

    console.log('📖 详细配置说明: 查看 CONFIG.md 文件');
  } catch (error) {
    console.error('❌ 创建配置文件失败:', error.message);
    process.exit(1);
  }
}

// 运行初始化
initConfig();
