#!/usr/bin/env node

import crypto from 'crypto';

// 生成一个安全的 NEXTAUTH_SECRET
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64url');
}

const secret = generateSecret(32); // 32字节，base64url后约43字符
console.log(secret);
