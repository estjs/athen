# 分析统计（Analytics）

Athen 可以在 **构建阶段**（以及开发阶段便于调试时）自动注入统计脚本。只有当你在根配置文件中显式设置 `analytics` 字段时，相关脚本才会被包含。

## 1. 启用某个提供商

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  analytics: {
    google: { id: 'G-XXXXXXX' }, // Google Analytics 4
  }
});
```

内置支持的统计提供商如下表：

| 键名 | 注入内容 | 必填字段 |
|------|-----------|----------|
| `google`   | GA4 gtag 片段 | `id` |
| `baidu`    | 百度统计 | `id` |
| `tencent`  | 腾讯 Beacon | `sid`, `cid` |
| `ali`      | CNZZ / 阿里统计 | `id` |
| `plausible`| Plausible 脚本（自托管或云端） | `domain` |
| `umami`    | Umami 脚本 | `id`, `src` |
| `ackee`    | Ackee 追踪器 | `server`, `domainId` |
| `vercel`   | Vercel Analytics（内联脚本） | `id` |
| `custom`   | 自定义脚本字符串 | `snippet` |

你可以同时启用多个提供商，Athen 会为所有配置项注入脚本：

```ts
analytics: {
  google: { id: 'G-123456' },
  umami:  { id: 'abc', src: 'https://analytics.example.com/script.js' }
}
```

## 2. 关闭统计功能

将字段设为 `false` 即完全禁用：

```ts
export default defineConfig({
  analytics: false
});
```

这样可选的 `plugin-analytics` 将不会被加载，产物中也不会包含任何统计脚本。

## 3. 覆盖或扩展

统计功能通过一个 **可选内置插件** 实现，你可以在 `plugins` 中提供同名插件来完全覆盖它：

```ts
export default defineConfig({
  plugins: [
    {
      name: 'athen-plugin-analytics',
      transformIndexHtml(html) {
        // 插入自定义片段
        return html.replace('</head>', '<script>/* … */</script></head>');
      }
    }
  ]
});
```

或者简单调整内置脚本：保留原插件，另写一个 `enforce: 'post'` 的插件对生成的 HTML 再加工。

## 4. 本地调试

默认情况下统计脚本只会在 `build` 时注入。如需本地调试，可设置环境变量 `ANALYTICS_DEBUG=1`：

```bash
ANALYTICS_DEBUG=1 pnpm run dev
```

插件会在终端输出注入的标签，方便核对。

---

如果你需要其他统计服务，欢迎提 PR，或按照 “覆盖” 指南自定义实现！
