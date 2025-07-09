# 主题包系统

Athen 允许通过 **主题包** 来扩展或完全替换默认主题。
主题包本质上就是一个 npm 包（或本地文件夹），它导出一组 React 组件及可选的静态资源，Athen 在开发/构建时会自动加载它们。

## 1. 快速上手

### 1.1 使用本地主题文件夹

```ts title="athen.config.ts"
import { defineConfig } from 'athen';

export default defineConfig({
  theme: './my-theme', // 相对于项目根目录
});
```

目录结构示例：

```text
my-theme/
  ├─ components/      # 覆盖默认组件的 React 组件
  ├─ styles/          # CSS / SCSS / Uno 资源
  └─ index.ts         # 主题入口，导出 Vite/Rollup 模块
```

在 dev / build 期间，Athen 会把 `@theme` 别名指向该目录，因此可直接：

```tsx
import Button from '@theme/components/Button';
```

### 1.2 使用发布到 npm 的主题包

```bash
pnpm add -D athen-theme-carbon  # 或 npm / yarn
```

```ts title="athen.config.ts"
export default defineConfig({
  theme: 'athen-theme-carbon',
});
```

Athen 通过 Node 的 `require.resolve` 解析包名，请确保包根目录导出 `index.js`/`index.ts`（或在 `exports` 字段中显式暴露）。

## 2. 编写主题

主题包 **必须** 至少导出一个名为 `Layout` 的组件，作为每个页面的根组件。

```tsx title="my-theme/Layout.tsx"
import type { Theme } from 'athen';

const Layout: Theme.Layout = ({ children, pageData, siteData }) => {
  return (
    <div className="my-theme-layout">
      {/* 你的头部 / 侧边栏 */}
      {children}
    </div>
  );
};

export default Layout;
```

除 `Layout` 外，你可以在 `components/` 下提供与默认主题同名的组件文件来覆盖它们，例如自定义导航栏：

```
components/
  Nav/
    index.tsx
```

当文件存在时，Athen 会自动优先使用自定义实现。

### 2.1 可选钩子 `enhanceApp`

若主题需要注册全局副作用（如提供上下文、注册图标等），可以导出 `enhanceApp`：

```ts
export function enhanceApp() {
  // 在客户端和服务端各执行一次
}
```

### 2.2 类型支持

为获得更好的 DX，建议在 `package.json` 中声明 `types`：

```jsonc
{
  "name": "athen-theme-carbon",
  "types": "dist/index.d.ts"
}
```

## 3. CLI 助手（`athen theme add`）

> 即将在 v2.0 中推出。该命令可一步安装并注册主题包：
>
> ```bash
> npx athen theme add athen-theme-carbon
> ```
>
> 安装完成后会自动修改 `athen.config.ts`。

## 4. 回退策略

若未指定 `theme`，Athen 会使用内置默认主题，保证旧项目无需修改即可正常工作。

## 5. 迁移提示

v2.0 之前创建的项目无需任何改动即可沿用旧主题；如果想切换主题，只需按上述方法添加 `theme` 字段。

---

如有疑问，欢迎 [提交 Issue](https://github.com/estjs/athen) 或加入 Discord 😊
