# create-athen

**English** | [简体中文](./README.zh-CN.md)

Scaffolding tool for creating comprehensive Athen documentation projects with full-featured templates, bilingual support, and modern development setup.

## 📦 Installation

You don't need to install this package globally. Use it directly with npm/pnpm/yarn:

```bash
# Using npm
npm create athen@latest my-docs

# Using pnpm (recommended)
pnpm create athen my-docs

# Using yarn
yarn create athen my-docs
```

## 🚀 Quick Start

### Interactive Setup

```bash
pnpm create athen
```

This will prompt you for:
- **Project name**: Name of your documentation project
- **Package name**: npm package name (auto-generated from project name)
- **Install dependencies**: Whether to install dependencies automatically
- **Start dev server**: Whether to start the development server immediately

### Non-interactive Setup

```bash
# Create project with default settings
pnpm create athen my-docs --yes

# Create and install dependencies
pnpm create athen my-docs --install

# Skip all prompts and auto-install
pnpm create athen my-docs --yes --install
```

## ✨ What You Get

The generated project includes a **comprehensive, production-ready template** with:

### 🌍 **Full Bilingual Support**
- Complete English and Chinese (简体中文) documentation structure
- Localized navigation, sidebar, and UI text
- Language switcher in the header
- Separate content directories for each language

### 🔍 **Built-in Search**
- **FlexSearch** enabled by default for lightning-fast local search
- Configurable search options (limit, suggestions, enrichment)
- Multi-language search support
- No external dependencies required

### 📚 **Complete Documentation Structure**
- **Home pages** with hero sections and feature highlights
- **Getting Started guides** with installation and configuration
- **API documentation** with comprehensive examples
- **Examples and tutorials** for common use cases
- **Contributing guides** and changelog templates

### 🎨 **Modern UI Features**
- Dark/light theme toggle
- Responsive design for all devices
- Social media links (GitHub, Twitter, Discord)
- Edit links for collaborative editing
- Table of contents navigation
- Previous/next page navigation

### ⚙️ **Developer Experience**
- TypeScript configuration out of the box
- Hot module replacement (HMR) for instant updates
- Optimized build process with Vite
- ESLint and Prettier ready
- Git integration with proper .gitignore

## 🎯 CLI Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--yes` | `-y` | Skip all prompts and use defaults |
| `--install` | `-i` | Automatically install dependencies |
| `--template` | `-t` | Specify template (currently only default) |

### Examples

```bash
# Basic usage
pnpm create athen my-docs

# Skip prompts
pnpm create athen my-docs -y

# Auto-install dependencies
pnpm create athen my-docs -i

# Skip prompts and auto-install
pnpm create athen my-docs -y -i

# Specify template (future feature)
pnpm create athen my-docs -t typescript
```

## 📁 Generated Project Structure

The scaffolding tool creates a **complete bilingual documentation site** with the following structure:

```
my-docs/
├── docs/                           # Documentation content
│   ├── index.md                   # English home page
│   ├── guide/                     # English guides
│   │   ├── introduction.md        # Introduction
│   │   ├── getting-started.md     # Quick start guide
│   │   ├── installation.md        # Installation instructions
│   │   ├── configuration.md       # Configuration guide
│   │   ├── search.md             # Search functionality
│   │   └── i18n.md               # Internationalization
│   ├── api/                       # English API docs
│   │   ├── introduction.md        # API overview
│   │   ├── site-config.md         # Site configuration
│   │   └── theme-config.md        # Theme configuration
│   ├── examples/                  # English examples
│   │   ├── basic.md              # Basic usage examples
│   │   └── advanced.md           # Advanced examples
│   ├── contributing.md            # Contributing guide
│   ├── changelog.md              # Changelog
│   └── zh/                       # Chinese (简体中文) content
│       ├── index.md              # Chinese home page
│       ├── guide/                # Chinese guides
│       │   ├── introduction.md    # 介绍
│       │   ├── getting-started.md # 快速开始
│       │   ├── installation.md    # 安装说明
│       │   ├── configuration.md   # 配置指南
│       │   ├── search.md         # 搜索功能
│       │   └── i18n.md           # 国际化
│       ├── api/                  # Chinese API docs
│       │   ├── introduction.md    # API 概述
│       │   ├── site-config.md     # 站点配置
│       │   └── theme-config.md    # 主题配置
│       ├── examples/             # Chinese examples
│       │   ├── basic.md          # 基础用法示例
│       │   └── advanced.md       # 高级示例
│       ├── contributing.md        # 贡献指南
│       └── changelog.md          # 更新日志
├── public/                        # Static assets
│   ├── logo.svg                  # Site logo
│   └── favicon.ico               # Site favicon
├── .gitignore                    # Git ignore rules
├── .npmrc                        # npm configuration
├── athen.config.ts               # Comprehensive Athen configuration
├── package.json                  # Project dependencies and scripts
├── pnpm-lock.yaml               # Lock file (if using pnpm)
└── README.md                    # Project README
```

## ⚙️ Generated Configuration

### package.json Scripts

```json
{
  "scripts": {
    "dev": "athen dev",
    "build": "athen build", 
    "preview": "athen preview"
  },
  "dependencies": {
    "athen": "latest",
    "@athen/plugin-search": "latest"
  }
}
```

### athen.config.ts - Complete Configuration

The generated configuration includes **all major features** configured and ready to use:

```ts
import { defineConfig } from 'athen';

export default defineConfig({
  lang: 'en-US',
  title: 'My Athen Site',
  description: 'A documentation site built with Athen',
  icon: '/logo.svg',
  base: '/',

  // 🔍 Local search enabled by default
  search: {
    provider: 'flex',
    include: ['**/*.md', '**/*.mdx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    searchOptions: {
      limit: 10,
      enrich: true,
      suggest: true,
    },
  },

  // 🎨 Theme switching enabled
  colorScheme: true,

  // 📊 Analytics ready (uncomment to use)
  // analytics: {
  //   google: 'G-XXXXXXXXXX',
  // },

  // 🌍 Full bilingual configuration
  themeConfig: {
    locales: {
      '/': {
        lang: 'en-US',
        label: 'English',
        title: 'My Athen Site',
        
        // Complete navigation structure
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'API', link: '/api/introduction' },
          {
            text: 'Examples',
            items: [
              { text: 'Basic Usage', link: '/examples/basic' },
              { text: 'Advanced Features', link: '/examples/advanced' },
            ]
          }
        ],

        // Comprehensive sidebar configuration
        sidebar: {
          '/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/guide/introduction' },
                { text: 'Quick Start', link: '/guide/getting-started' },
                { text: 'Installation', link: '/guide/installation' },
                { text: 'Configuration', link: '/guide/configuration' },
              ]
            },
            {
              text: 'Features',
              items: [
                { text: 'Search', link: '/guide/search' },
                { text: 'Internationalization', link: '/guide/i18n' },
              ]
            }
          ],
          // ... more sidebar configurations
        }
      },

      '/zh/': {
        lang: 'zh-CN',
        label: '简体中文',
        title: '我的 Athen 站点',
        
        // Chinese navigation and sidebar
        nav: [
          { text: '首页', link: '/zh/' },
          { text: '指南', link: '/zh/guide/getting-started' },
          // ... complete Chinese navigation
        ],
        // ... complete Chinese sidebar configuration
      }
    },

    // Social links
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/your-org/your-repo' },
      { icon: 'twitter', mode: 'link', content: 'https://twitter.com/your-handle' },
    ],

    // Edit links for collaboration
    editLink: {
      pattern: 'https://github.com/your-org/your-repo/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    // Footer configuration
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Your Name'
    }
  }
});
```

## 📝 Template Content Examples

### Bilingual Home Pages

**English Home Page (docs/index.md)**:
```markdown
---
layout: home
title: My Athen Site
hero:
  name: My Documentation
  text: Modern documentation made simple
  tagline: Built with Athen framework for fast, beautiful docs
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/your-org/your-repo
features:
  - title: ⚡ Fast & Lightweight
    details: Built on Vite for lightning-fast development and optimized builds
  - title: 🔍 Built-in Search
    details: FlexSearch integration provides instant, local search functionality
  - title: 🌍 Internationalization
    details: Complete bilingual support with localized navigation and content
  - title: 📝 Markdown-Powered
    details: Write content in Markdown with MDX support for interactive components
  - title: 🎨 Customizable
    details: Flexible theming system with dark/light mode and full TypeScript support
  - title: 📱 Responsive Design
    details: Mobile-first design that works perfectly on all devices
---
```

**Chinese Home Page (docs/zh/index.md)**:
```markdown
---
layout: home
title: 我的 Athen 站点
hero:
  name: 我的文档
  text: 现代化文档，简单易用
  tagline: 基于 Athen 框架构建，快速、美观的文档站点
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/your-org/your-repo
features:
  - title: ⚡ 快速轻量
    details: 基于 Vite 构建，提供闪电般的开发体验和优化的构建结果
  - title: 🔍 内置搜索
    details: 集成 FlexSearch，提供即时的本地搜索功能
  - title: 🌍 国际化支持
    details: 完整的双语支持，包含本地化导航和内容
  # ... more features in Chinese
---
```

### Complete Guide Structure

The template includes comprehensive guides in both languages:

- **Getting Started**: Installation, configuration, first steps
- **Features**: Search, i18n, theming, deployment
- **API Documentation**: Configuration options, runtime APIs
- **Examples**: Basic usage, advanced patterns, custom themes
- **Contributing**: Development setup, contribution guidelines

## 🔧 Customization After Creation

### Quick Customization Checklist

After creating your project, update these key files:

1. **Update Site Information** (`athen.config.ts`):
   ```ts
   export default defineConfig({
     title: 'Your Site Title',
     description: 'Your site description',
     icon: '/your-logo.svg',
     
     themeConfig: {
       locales: {
         '/': {
           title: 'Your Site Title',
           description: 'Your site description',
         },
         '/zh/': {
           title: '您的站点标题',
           description: '您的站点描述',
         }
       }
     }
   });
   ```

2. **Update Package Information** (`package.json`):
   ```json
   {
     "name": "your-docs",
     "description": "Your documentation site",
     "repository": "https://github.com/your-org/your-repo"
   }
   ```

3. **Replace Content**:
   - Update home pages (`docs/index.md`, `docs/zh/index.md`)
   - Add your documentation in `docs/guide/` and `docs/zh/guide/`
   - Customize navigation and sidebar in `athen.config.ts`
   - Replace logo and favicon in `public/`

4. **Configure Social Links**:
   ```ts
   socialLinks: [
     { icon: 'github', mode: 'link', content: 'https://github.com/your-org/your-repo' },
     { icon: 'twitter', mode: 'link', content: 'https://twitter.com/your-handle' },
   ]
   ```

### Advanced Features Configuration

**Enable Analytics**:
```ts
// athen.config.ts
export default defineConfig({
  analytics: {
    google: { id: 'G-XXXXXXXXXX' }
  }
});
```

**Customize Search**:
```ts
search: {
  provider: 'flex',
  include: ['**/*.md', '**/*.mdx'],
  exclude: ['**/node_modules/**', '**/private/**'],
  searchOptions: {
    limit: 20,
    enrich: true,
    suggest: true,
  },
}
```

**Add More Languages**:
```ts
themeConfig: {
  locales: {
    '/': { lang: 'en-US', label: 'English' },
    '/zh/': { lang: 'zh-CN', label: '简体中文' },
    '/ja/': { lang: 'ja-JP', label: '日本語' },
    '/es/': { lang: 'es-ES', label: 'Español' },
  }
}
```

## 🎨 Template Features Overview

### 🔍 **Search Functionality**
- **FlexSearch** integration for instant local search
- Multi-language search support
- Configurable search options (limits, suggestions, enrichment)
- No external dependencies or API keys required
- Works offline and in private networks

### 🌍 **Internationalization (i18n)**
- Complete bilingual template (English + Chinese)
- Localized navigation, sidebar, and UI text
- Language switcher in header
- Separate content directories for each language
- Easy to add more languages

### 📚 **Content Structure**
- **Home pages** with hero sections and feature highlights
- **Getting Started guides** with step-by-step instructions
- **API documentation** with comprehensive examples
- **Examples and tutorials** for common use cases
- **Contributing guides** and changelog templates

### 🎨 **UI/UX Features**
- Dark/light theme toggle
- Responsive design for all devices
- Table of contents navigation
- Previous/next page navigation
- Edit links for collaborative editing
- Social media integration
- Custom logo and favicon support

### ⚙️ **Developer Experience**
- TypeScript configuration
- Hot module replacement (HMR)
- Optimized build process with Vite
- Git integration with proper .gitignore
- Package manager detection (npm/pnpm/yarn)
- Comprehensive configuration examples

## 🎯 Template Variants (Current & Future)

### Current: Default Template
- **Bilingual documentation site** (English + Chinese)
- **Search enabled** by default
- **Complete configuration** examples
- **Production-ready** setup

### Future Templates (Planned)
- **TypeScript Template**: Enhanced TypeScript configuration
- **Multi-language Template**: 5+ language support
- **Blog Template**: Documentation + blog hybrid
- **API Template**: API documentation focused
- **Component Library Template**: For component documentation

## 🔄 Development Workflow

After creating your project, follow this workflow:

### 1. **Initial Setup**
```bash
cd my-docs
pnpm install  # Install dependencies (if not done automatically)
```

### 2. **Start Development**
```bash
pnpm dev
```
- Opens development server at `http://localhost:3000`
- Hot module replacement (HMR) for instant updates
- Search functionality works immediately
- Language switcher functional

### 3. **Content Development**
- **Edit content**: Modify files in `docs/` and `docs/zh/` directories
- **Add pages**: Create new `.md` files in appropriate directories
- **Update navigation**: Modify `athen.config.ts` sidebar and nav configuration
- **Customize styling**: Update theme configuration or add custom CSS

### 4. **Test Your Site**
```bash
# Test search functionality
# Try switching languages
# Test responsive design
# Verify all links work
```

### 5. **Build for Production**
```bash
pnpm build
```
- Generates optimized static files in `dist/`
- Search index is built automatically
- All assets are optimized and minified

### 6. **Preview Production Build**
```bash
pnpm preview
```
- Serves the production build locally
- Test the final result before deployment

### 7. **Deploy**
The generated site is a static site that can be deployed to:
- **Netlify**: Drag and drop `dist/` folder
- **Vercel**: Connect GitHub repository
- **GitHub Pages**: Use GitHub Actions
- **Any static hosting**: Upload `dist/` folder

## 📊 Performance & Features

### What's Included Out of the Box

✅ **Lightning-fast search** (FlexSearch)  
✅ **Complete bilingual support** (EN/ZH)  
✅ **Dark/light theme toggle**  
✅ **Mobile-responsive design**  
✅ **SEO optimization**  
✅ **Social media integration**  
✅ **Edit links for collaboration**  
✅ **Table of contents navigation**  
✅ **Previous/next page navigation**  
✅ **TypeScript support**  
✅ **Hot module replacement**  
✅ **Optimized build process**  
✅ **Git integration**  

### Performance Metrics
- **Build time**: ~2-5 seconds for typical documentation
- **Search**: Instant results with FlexSearch
- **Page load**: <100ms for static pages
- **Bundle size**: Optimized with tree-shaking and code splitting

## 🛠️ Troubleshooting

### Common Issues & Solutions

**❌ Permission Errors**:
```bash
# If you get permission errors, try:
npx create-athen@latest my-docs
# or
sudo pnpm create athen my-docs
```

**❌ Package Manager Detection Issues**:
The tool automatically detects your package manager from:
- `npm_execpath` environment variable
- `npm_config_user_agent` environment variable
- Falls back to npm if detection fails

**❌ Template Files Missing**:
```bash
# If template files are missing, try:
pnpm create athen@latest my-docs --yes
```

**❌ Search Not Working**:
- Ensure FlexSearch is configured in `athen.config.ts`
- Check that search plugin is installed: `@athen/plugin-search`
- Verify content files are in the correct directories
- Run `pnpm build` to regenerate search index

**❌ Language Switching Issues**:
- Verify both `/` and `/zh/` locales are configured
- Check that content exists in both `docs/` and `docs/zh/` directories
- Ensure navigation links use correct paths

**❌ Build Errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

**❌ Development Server Issues**:
```bash
# Try different port
pnpm dev --port 3001

# Clear Vite cache
rm -rf node_modules/.vite
pnpm dev
```

### Getting Help

If you encounter issues:

1. **Check Documentation**: [Athen Documentation](https://github.com/estjs/athen)
2. **Search Issues**: [GitHub Issues](https://github.com/estjs/athen/issues)
3. **Ask Questions**: [GitHub Discussions](https://github.com/estjs/athen/discussions)
4. **Community Support**: Join our Discord server

### Debugging Tips

**Enable Debug Mode**:
```bash
DEBUG=athen:* pnpm dev
```

**Check Configuration**:
```bash
# Validate your athen.config.ts
pnpm athen config
```

**Verify Template Integrity**:
```bash
# List all generated files
find . -type f -name "*.md" | head -20
```

## 📚 API Reference

### CLI Interface

```bash
pnpm create athen [project-name] [options]
```

**Options:**
| Option | Alias | Type | Description |
|--------|-------|------|-------------|
| `--yes` | `-y` | boolean | Skip all prompts and use defaults |
| `--install` | `-i` | boolean | Automatically install dependencies |
| `--template` | `-t` | string | Specify template (currently: `default`) |
| `--package-manager` | `-pm` | string | Force package manager (`npm`, `pnpm`, `yarn`) |
| `--help` | `-h` | boolean | Show help information |
| `--version` | `-v` | boolean | Show version number |

**Examples:**
```bash
# Interactive setup
pnpm create athen

# Quick setup with defaults
pnpm create athen my-docs -y

# Auto-install dependencies
pnpm create athen my-docs -i

# Skip prompts and auto-install
pnpm create athen my-docs -y -i

# Force specific package manager
pnpm create athen my-docs --package-manager npm

# Specify template (future feature)
pnpm create athen my-docs -t typescript
```

### Programmatic Usage

```ts
import { createAthenProject } from 'create-athen';

// Basic usage
await createAthenProject({
  projectName: 'my-docs',
  template: 'default',
  autoInstall: true,
  packageManager: 'pnpm'
});

// Advanced usage
await createAthenProject({
  projectName: 'my-docs',
  template: 'default',
  autoInstall: false,
  packageManager: 'pnpm',
  customConfig: {
    title: 'My Custom Site',
    description: 'Custom description',
    languages: ['en', 'zh', 'ja']
  }
});
```

### Configuration Interface

```ts
interface CreateAthenOptions {
  projectName?: string;           // Target directory name
  template?: 'default';           // Template variant
  yes?: boolean;                  // Skip prompts
  install?: boolean;              // Auto-install dependencies
  packageManager?: 'npm' | 'pnpm' | 'yarn'; // Package manager
  customConfig?: {                // Custom configuration
    title?: string;
    description?: string;
    languages?: string[];
    features?: string[];
  };
}
```

### Template Structure Interface

```ts
interface TemplateStructure {
  files: {
    [path: string]: string;       // File path -> content
  };
  directories: string[];          // Directory paths to create
  dependencies: {
    [name: string]: string;       // Package name -> version
  };
  devDependencies: {
    [name: string]: string;       // Dev package name -> version
  };
  scripts: {
    [name: string]: string;       // Script name -> command
  };
}
```

## 🔗 Related Resources

### Official Documentation
- **[Athen Framework](../athen)** - Core framework documentation
- **[Athen Examples](https://github.com/estjs/athen/tree/main/examples)** - Example projects and demos
- **[Plugin Search](../plugin-search)** - Search plugin documentation
- **[Plugin Analytics](../plugin-analytics)** - Analytics plugin documentation

### External Resources
- **[Vite Documentation](https://vitejs.dev/)** - Build tool used by Athen
- **[MDX Documentation](https://mdxjs.com/)** - Markdown with JSX support
- **[FlexSearch](https://github.com/nextapps-de/flexsearch)** - Search library used

### Community
- **[GitHub Repository](https://github.com/estjs/athen)** - Source code and issues
- **[GitHub Discussions](https://github.com/estjs/athen/discussions)** - Community discussions
- **[Discord Server](https://discord.gg/athen)** - Real-time community chat

### Deployment Guides
- **[Netlify Deployment](https://docs.netlify.com/site-deploys/create-deploys/)** - Deploy to Netlify
- **[Vercel Deployment](https://vercel.com/docs/concepts/deployments/overview)** - Deploy to Vercel
- **[GitHub Pages](https://pages.github.com/)** - Deploy to GitHub Pages

## 🚀 What's Next?

After creating your Athen project:

1. **📝 Add Your Content**: Replace template content with your documentation
2. **🎨 Customize Design**: Update colors, fonts, and layout in theme config
3. **🔍 Test Search**: Add content and test the search functionality
4. **🌍 Expand Languages**: Add more languages if needed
5. **📊 Add Analytics**: Configure Google Analytics or other tracking
6. **🚀 Deploy**: Choose a hosting platform and deploy your site

## 📄 License

MIT © [estjs](https://github.com/estjs)

---

**Happy documenting! 📚✨**

> Built with ❤️ by the Athen team. Star us on [GitHub](https://github.com/estjs/athen) if you find this useful!
