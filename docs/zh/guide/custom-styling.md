# 自定义样式与 UnoCSS

Athen 默认主题使用 CSS 变量来控制核心视觉元素，并内置了 [UnoCSS](https://unocss.dev/) 作为原子化 CSS 引擎。你可以通过覆盖 CSS 变量或配置 UnoCSS 来定制你的文档外观。

## 覆盖默认 CSS 变量

默认主题中的所有颜色、字体、阴影和断点都可以通过 CSS 变量覆盖。核心前缀为 `--at-c-`。

### 核心变量参考

一些最常用的变量如下（完整的列表可参考源码中的 `theme-default/styles/vars.css`）：

- **主题色**: `--at-c-brand` / `--at-c-brand-light` / `--at-c-brand-dark`
- **背景**: `--at-c-bg` / `--at-c-bg-soft` / `--at-c-bg-mute`
- **文本**: `--at-c-text-1` (主要) / `--at-c-text-2` (次要) / `--at-c-text-3` (说明)
- **代码块背景**: `--at-code-block-bg`

### 覆盖变量的正确姿势

假设你想要使用一套自定义的颜色，你可以新建一个 CSS 文件：

```css
/* my-custom-vars.css */
:root {
  /* 覆盖品牌主色调为紫色 */
  --at-c-brand: #646cff;
  --at-c-brand-light: #747bff;
  --at-c-brand-dark: #535bf2;
}

/* 覆盖暗黑模式 */
.dark {
  --at-c-brand: #9499ff;
}
```

目前要在文档中加载它，最稳妥的方式是创建一个简单的**包装主题包 (Wrapper Theme)**，或者在文档组件中显式 `import './my-custom-vars.css'`。

## 使用 UnoCSS

Athen 内部已经集成了 `unocss/vite`，并且默认启用了 `@unocss/preset-uno` 和 `@unocss/preset-icons`。

### 在 Markdown 中使用原子化 CSS

你可以直接在 `.mdx` 或者 `.md` 中书写 UnoCSS 的类名：

```html
<div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center shadow-md">
  这是一个包含 UnoCSS 类名的区块！
</div>
```

### 使用 `uno.config.ts`

如果你需要添加自定义的 Uno 规则、快捷方式或额外的预设，你可以在项目根目录（运行 `athen dev` 的地方）创建 `uno.config.ts`。由于 Vite 插件会自动搜寻该文件，它将自动与 Athen 的内置预设合并生效。

```ts
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: [
    ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700'],
  ],
})
```
