# @athen/plugin-analytics

[English](./README.md) | **简体中文**

Athen 文档框架的隐私友好分析插件，支持多种分析提供商。

## 📦 安装

```bash
npm install @athen/plugin-analytics
# 或
pnpm add @athen/plugin-analytics
# 或
yarn add @athen/plugin-analytics
```

> **注意**: 配置分析时，此插件会自动包含在主 `athen` 包中。

## ✨ 特性

- **多种提供商**: 支持 Google Analytics、百度统计、腾讯统计、Plausible、Umami 等
- **隐私优先**: 可配置的隐私设置和 GDPR 合规性
- **零配置**: 最少设置即可开箱即用
- **自定义事件**: 跟踪自定义事件和用户交互
- **性能优化**: 懒加载，对网站性能影响最小
- **TypeScript 支持**: 完整的 TypeScript 支持和类型定义

## 🚀 快速开始

### 在 Athen 配置中启用分析

```ts
// athen.config.ts
import { defineConfig } from 'athen';

export default defineConfig({
  analytics: {
    // Google Analytics 4
    google: {
      id: 'G-XXXXXXXXXX'
    }
  }
});
```

### 手动插件使用

```ts
import analyticsPlugin from '@athen/plugin-analytics';

export default {
  plugins: [
    analyticsPlugin({
      google: { id: 'G-XXXXXXXXXX' },
      plausible: { domain: 'example.com' }
    })
  ]
};
```

## 🔧 支持的提供商

### Google Analytics

```ts
export default defineConfig({
  analytics: {
    google: {
      id: 'G-XXXXXXXXXX'  // 您的 GA4 测量 ID
    }
  }
});
```

### 百度统计

```ts
export default defineConfig({
  analytics: {
    baidu: {
      id: 'your-baidu-site-id'  // 您的百度统计 ID
    }
  }
});
```

### 腾讯移动分析 (MTA)

```ts
export default defineConfig({
  analytics: {
    tencent: {
      sid: 'your-site-id',      // 必需：站点 ID
      cid: 'your-app-id'        // 可选：应用 ID
    }
  }
});
```

### 阿里友盟 (CNZZ)

```ts
export default defineConfig({
  analytics: {
    ali: {
      id: 'your-cnzz-site-id'   // 您的 CNZZ 站点 ID
    }
  }
});
```

### Plausible Analytics

```ts
export default defineConfig({
  analytics: {
    plausible: {
      domain: 'example.com',              // 您的域名
      apiHost: 'https://plausible.io'     // 可选：自定义 API 主机
    }
  }
});
```

### Umami Analytics

```ts
export default defineConfig({
  analytics: {
    umami: {
      id: 'your-website-id',              // 您的网站 ID
      src: 'https://analytics.example.com/umami.js'  // 您的 Umami 脚本 URL
    }
  }
});
```

### Ackee Analytics

```ts
export default defineConfig({
  analytics: {
    ackee: {
      server: 'https://analytics.example.com',  // 您的 Ackee 服务器（无尾随斜杠）
      domainId: 'your-domain-id'                // 您的域 ID
    }
  }
});
```

### Vercel Analytics

```ts
export default defineConfig({
  analytics: {
    vercel: {
      id: 'your-project-id'     // 您的 Vercel 项目 ID
    }
  }
});
```

### 自定义分析

```ts
export default defineConfig({
  analytics: {
    custom: {
      snippet: `
        <!-- 您的自定义分析代码 -->
        <script>
          // 自定义跟踪代码
        </script>
      `
    }
  }
});
```

## 🎯 多个提供商

您可以同时使用多个分析提供商：

```ts
export default defineConfig({
  analytics: {
    google: { id: 'G-XXXXXXXXXX' },
    plausible: { domain: 'example.com' },
    umami: {
      id: 'website-id',
      src: 'https://analytics.example.com/umami.js'
    }
  }
});
```

## 🔒 隐私和 GDPR

### 隐私优先配置

```ts
export default defineConfig({
  analytics: {
    google: {
      id: 'G-XXXXXXXXXX'
    },
    
    // 隐私设置
    privacy: {
      cookieConsent: true,        // 需要 Cookie 同意
      anonymizeIp: true,          // 匿名化 IP 地址
      respectDoNotTrack: true,    // 尊重 Do Not Track 标头
      consentMode: 'opt-in'       // 'opt-in' 或 'opt-out'
    }
  }
});
```

### Cookie 同意集成

```ts
// 自定义同意处理
window.athenAnalytics = {
  consent: (granted) => {
    if (granted) {
      // 启用分析
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  }
};
```

## 📊 自定义事件跟踪

### 跟踪自定义事件

```ts
// 在您的组件或页面中
declare global {
  interface Window {
    __athenAnalytics?: {
      track: (event: string, data?: any) => void;
      pageview: (path: string) => void;
    };
  }
}

// 跟踪自定义事件
window.__athenAnalytics?.track('button_click', {
  button_name: 'download',
  section: 'hero'
});

// 跟踪页面浏览（由路由器自动处理）
window.__athenAnalytics?.pageview('/new-page');
```

### 事件跟踪示例

```tsx
// 按钮点击跟踪
function DownloadButton() {
  const handleClick = () => {
    window.__athenAnalytics?.track('download', {
      file: 'documentation.pdf',
      location: 'header'
    });
  };
  
  return (
    <button onClick={handleClick}>
      下载 PDF
    </button>
  );
}

// 搜索跟踪
function SearchBox() {
  const handleSearch = (query: string) => {
    window.__athenAnalytics?.track('search', {
      query,
      results_count: results.length
    });
  };
  
  return (
    <input
      type="text"
      onInput={(e) => handleSearch(e.target.value)}
    />
  );
}
```

## 🎨 UI 集成

### 同意横幅组件

```tsx
import { useState, useEffect } from 'essor';

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    const consent = localStorage.getItem('analytics-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem('analytics-consent', 'granted');
    window.__athenAnalytics?.consent?.(true);
    setShowBanner(false);
  };
  
  const handleDecline = () => {
    localStorage.setItem('analytics-consent', 'denied');
    window.__athenAnalytics?.consent?.(false);
    setShowBanner(false);
  };
  
  if (!showBanner) return null;
  
  return (
    <div class="consent-banner">
      <p>我们使用分析来改善您的体验。</p>
      <button onClick={handleAccept}>接受</button>
      <button onClick={handleDecline}>拒绝</button>
    </div>
  );
}
```

## 📚 API 参考

### AnalyticsOptions 接口

```ts
interface AnalyticsOptions {
  google?: GoogleAnalytics;
  baidu?: BaiduTongji;
  tencent?: TencentMTA;
  ali?: AliCNZZ;
  plausible?: Plausible;
  umami?: Umami;
  ackee?: Ackee;
  vercel?: VercelAnalytics;
  custom?: CustomAnalytics;
}
```

### 提供商接口

```ts
interface GoogleAnalytics {
  id: string;
}

interface BaiduTongji {
  id: string;
}

interface TencentMTA {
  sid: string;
  cid?: string;
}

interface AliCNZZ {
  id: string;
}

interface Plausible {
  domain: string;
  apiHost?: string;
}

interface Umami {
  id: string;
  src: string;
}

interface Ackee {
  server: string;
  domainId: string;
}

interface VercelAnalytics {
  id: string;
}

interface CustomAnalytics {
  snippet: string;
}
```

## 🔌 插件钩子

### HTML 转换

插件自动将分析脚本注入到您的 HTML 中：

- **Google Analytics**: 添加 gtag.js 脚本和配置
- **Plausible**: 添加带域配置的 plausible.js 脚本
- **Umami**: 添加带网站 ID 的自定义 Umami 脚本
- **自定义**: 注入自定义 HTML 片段

### 路由器集成

路由更改时自动页面浏览跟踪：

```ts
// 由插件自动处理
router.afterEach((to) => {
  if (window.__athenAnalytics?.pageview) {
    window.__athenAnalytics.pageview(to.path);
  }
});
```

## 🌍 多语言分析

### 特定语言跟踪

```ts
export default defineConfig({
  locales: {
    '/': { lang: 'zh-CN' },
    '/en/': { lang: 'en-US' }
  },
  
  analytics: {
    google: { id: 'G-XXXXXXXXXX' },
    
    // 在自定义维度中跟踪语言
    customDimensions: {
      language: (locale) => locale.lang
    }
  }
});
```

## 🎛️ 高级配置

### 开发与生产

```ts
export default defineConfig({
  analytics: process.env.NODE_ENV === 'production' ? {
    google: { id: 'G-XXXXXXXXXX' }
  } : {
    // 在开发中禁用分析
  }
});
```

### 条件加载

```ts
export default defineConfig({
  analytics: {
    google: { id: 'G-XXXXXXXXXX' },
    
    // 仅为特定域加载分析
    domains: ['example.com', 'www.example.com'],
    
    // 排除特定路径
    exclude: ['/admin', '/internal']
  }
});
```

## 🔗 相关链接

- [Google Analytics 文档](https://developers.google.com/analytics)
- [Plausible Analytics](https://plausible.io/docs)
- [Umami Analytics](https://umami.is/docs)
- [隐私和分析最佳实践](https://web.dev/privacy/)

## 📄 许可证

MIT © [estjs](https://github.com/estjs)
