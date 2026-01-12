# @athen/plugin-analytics

**English** | [简体中文](./README.zh-CN.md)

Privacy-friendly analytics plugin for Athen documentation framework with support for multiple analytics providers.

## 📦 Installation

```bash
npm install @athen/plugin-analytics
# or
pnpm add @athen/plugin-analytics
# or
yarn add @athen/plugin-analytics
```

> **Note**: This plugin is automatically included with the main `athen` package when analytics is configured.

## ✨ Features

- **Multiple Providers**: Support for Google Analytics, Baidu, Tencent, Plausible, Umami, and more
- **Privacy-Focused**: Configurable privacy settings and GDPR compliance
- **Zero Configuration**: Works out of the box with minimal setup
- **Custom Events**: Track custom events and user interactions
- **Performance Optimized**: Lazy loading and minimal impact on site performance
- **TypeScript Support**: Full TypeScript support with type definitions

## 🚀 Quick Start

### Enable Analytics in Athen Config

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

### Manual Plugin Usage

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

## 🔧 Supported Providers

### Google Analytics

```ts
export default defineConfig({
  analytics: {
    google: {
      id: 'G-XXXXXXXXXX'  // Your GA4 Measurement ID
    }
  }
});
```

### Baidu Tongji (百度统计)

```ts
export default defineConfig({
  analytics: {
    baidu: {
      id: 'your-baidu-site-id'  // Your Baidu Analytics ID
    }
  }
});
```

### Tencent MTA (腾讯移动分析)

```ts
export default defineConfig({
  analytics: {
    tencent: {
      sid: 'your-site-id',      // Required: Site ID
      cid: 'your-app-id'        // Optional: App ID
    }
  }
});
```

### Ali CNZZ (阿里友盟)

```ts
export default defineConfig({
  analytics: {
    ali: {
      id: 'your-cnzz-site-id'   // Your CNZZ Site ID
    }
  }
});
```

### Plausible Analytics

```ts
export default defineConfig({
  analytics: {
    plausible: {
      domain: 'example.com',              // Your domain
      apiHost: 'https://plausible.io'     // Optional: Custom API host
    }
  }
});
```

### Umami Analytics

```ts
export default defineConfig({
  analytics: {
    umami: {
      id: 'your-website-id',              // Your website ID
      src: 'https://analytics.example.com/umami.js'  // Your Umami script URL
    }
  }
});
```

### Ackee Analytics

```ts
export default defineConfig({
  analytics: {
    ackee: {
      server: 'https://analytics.example.com',  // Your Ackee server (no trailing slash)
      domainId: 'your-domain-id'                // Your domain ID
    }
  }
});
```

### Vercel Analytics

```ts
export default defineConfig({
  analytics: {
    vercel: {
      id: 'your-project-id'     // Your Vercel project ID
    }
  }
});
```

### Custom Analytics

```ts
export default defineConfig({
  analytics: {
    custom: {
      snippet: `
        <!-- Your custom analytics code -->
        <script>
          // Custom tracking code
        </script>
      `
    }
  }
});
```

## 🎯 Multiple Providers

You can use multiple analytics providers simultaneously:

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

## 🔒 Privacy & GDPR

### Privacy-First Configuration

```ts
export default defineConfig({
  analytics: {
    google: {
      id: 'G-XXXXXXXXXX'
    },
    
    // Privacy settings
    privacy: {
      cookieConsent: true,        // Require cookie consent
      anonymizeIp: true,          // Anonymize IP addresses
      respectDoNotTrack: true,    // Respect Do Not Track header
      consentMode: 'opt-in'       // 'opt-in' or 'opt-out'
    }
  }
});
```

### Cookie Consent Integration

```ts
// Custom consent handling
window.athenAnalytics = {
  consent: (granted) => {
    if (granted) {
      // Enable analytics
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  }
};
```

## 📊 Custom Event Tracking

### Track Custom Events

```ts
// In your components or pages
declare global {
  interface Window {
    __athenAnalytics?: {
      track: (event: string, data?: any) => void;
      pageview: (path: string) => void;
    };
  }
}

// Track custom events
window.__athenAnalytics?.track('button_click', {
  button_name: 'download',
  section: 'hero'
});

// Track page views (automatically handled by router)
window.__athenAnalytics?.pageview('/new-page');
```

### Event Tracking Examples

```tsx
// Button click tracking
function DownloadButton() {
  const handleClick = () => {
    window.__athenAnalytics?.track('download', {
      file: 'documentation.pdf',
      location: 'header'
    });
  };
  
  return (
    <button onClick={handleClick}>
      Download PDF
    </button>
  );
}

// Search tracking
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

## 🎨 UI Integration

### Consent Banner Component

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
      <p>We use analytics to improve your experience.</p>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleDecline}>Decline</button>
    </div>
  );
}
```

## 📚 API Reference

### AnalyticsOptions Interface

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

### Provider Interfaces

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

## 🔌 Plugin Hooks

### HTML Transformation

The plugin automatically injects analytics scripts into your HTML:

- **Google Analytics**: Adds gtag.js script and configuration
- **Plausible**: Adds plausible.js script with domain configuration
- **Umami**: Adds custom Umami script with website ID
- **Custom**: Injects custom HTML snippets

### Router Integration

Automatic page view tracking when routes change:

```ts
// Automatically handled by the plugin
router.afterEach((to) => {
  if (window.__athenAnalytics?.pageview) {
    window.__athenAnalytics.pageview(to.path);
  }
});
```

## 🌍 Multi-language Analytics

### Language-specific Tracking

```ts
export default defineConfig({
  locales: {
    '/': { lang: 'en-US' },
    '/zh/': { lang: 'zh-CN' }
  },
  
  analytics: {
    google: { id: 'G-XXXXXXXXXX' },
    
    // Track language in custom dimensions
    customDimensions: {
      language: (locale) => locale.lang
    }
  }
});
```

## 🎛️ Advanced Configuration

### Development vs Production

```ts
export default defineConfig({
  analytics: process.env.NODE_ENV === 'production' ? {
    google: { id: 'G-XXXXXXXXXX' }
  } : {
    // Disable analytics in development
  }
});
```

### Conditional Loading

```ts
export default defineConfig({
  analytics: {
    google: { id: 'G-XXXXXXXXXX' },
    
    // Only load analytics for certain domains
    domains: ['example.com', 'www.example.com'],
    
    // Exclude certain paths
    exclude: ['/admin', '/internal']
  }
});
```

## 🔗 Related

- [Google Analytics Documentation](https://developers.google.com/analytics)
- [Plausible Analytics](https://plausible.io/docs)
- [Umami Analytics](https://umami.is/docs)
- [Privacy and Analytics Best Practices](https://web.dev/privacy/)

## 📄 License

MIT © [estjs](https://github.com/estjs)
