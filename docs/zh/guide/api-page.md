# API 页面

Athen 默认主题内置了 API 页面。

假设你的项目有以下目录结构：

```bash
api
├── config-basic.md
├── config-extension.md
└── index.md
```

那么你只需要在 `api` 目录下的 `index.md` 中添加以下内容：

```md
---
pageType: api
---
```

这样，Athen 就会自动为你解析目录下其他子页面的文档结构，提取标题（h1, h2）信息，并生成 API 页面。不仅如此，Athen 还会根据你在配置文件中的 [`sidebar`](/zh/api/config-theme#sidebar) 配置对 API 文档进行分组。例如，以下 `sidebar` 配置：

```ts
{
  '/api/': [
    {
      text: '配置',
      items: [{ text: '1', link: '/api/1' }, { text: '2', link: '/api/2' }]
    },
    {
      text: '运行时',
      items: [{ text: '3', link: '/api/3' }, { text: '4', link: '/api/4' }]
    }
  ];
}
```

那么 API 页面将会显示 `配置` 和 `运行时` 两个分组。
