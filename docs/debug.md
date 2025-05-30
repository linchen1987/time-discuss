# 调试输出控制

这个项目使用 `debug` 库来管理日志输出，避免在浏览器控制台中看到过多的 Lexical 调试信息。

## 控制调试输出

### 完全禁用所有调试输出（默认设置）
在浏览器开发者工具的 Console 中运行：
```javascript
localStorage.debug = ''
```

### 启用所有调试输出
```javascript
localStorage.debug = 'time-discuss:*'
```

### 只启用特定组件的调试输出

#### 只显示编辑器相关日志
```javascript
localStorage.debug = 'time-discuss:editor'
```

#### 只显示 API 相关日志
```javascript
localStorage.debug = 'time-discuss:api'
```

#### 只显示认证相关日志
```javascript
localStorage.debug = 'time-discuss:auth'
```

#### 只显示帖子相关日志
```javascript
localStorage.debug = 'time-discuss:posts'
```

#### 只显示上传相关日志
```javascript
localStorage.debug = 'time-discuss:upload'
```

### 启用多个组件的调试输出
```javascript
localStorage.debug = 'time-discuss:editor,time-discuss:api'
```

## 设置后需要刷新页面才能生效

设置 localStorage.debug 后，需要刷新页面使设置生效。

## 错误日志

重要的错误信息仍会显示在控制台中，不会被调试设置影响。这些包括：
- 网络错误
- 认证错误
- 数据库操作错误
- 关键的 Lexical 编辑器错误

## 生产环境

在生产环境中，调试输出会被自动禁用，只有错误日志会显示。 