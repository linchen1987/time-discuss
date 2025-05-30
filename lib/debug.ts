import debug from 'debug';

// 为不同组件创建专门的调试器
export const debugEditor = debug('time-discuss:editor');
export const debugAuth = debug('time-discuss:auth');
export const debugPosts = debug('time-discuss:posts');
export const debugAPI = debug('time-discuss:api');
export const debugUpload = debug('time-discuss:upload');

// 通用调试器
export const debugApp = debug('time-discuss:app');

// 只在开发环境下启用调试，可以通过环境变量控制
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 在浏览器中可以通过 localStorage 控制调试输出
  // localStorage.debug = 'time-discuss:*' 启用所有
  // localStorage.debug = 'time-discuss:editor' 只启用编辑器调试
  // localStorage.debug = '' 禁用所有调试输出
  const debugSetting = localStorage.getItem('debug');
  if (debugSetting === null) {
    // 默认不显示任何调试信息，除非用户明确设置
    localStorage.setItem('debug', '');
  }
}

// 错误日志处理器 - 这些仍然会在生产环境显示
export const logError = (component: string, error: unknown, context?: string) => {
  const message = context ? `${component} ${context}:` : `${component} error:`;
  console.error(message, error);
};

// 开发环境信息日志
export const logInfo = (component: string, message: string, data?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[${component}] ${message}`, data || '');
  }
};
