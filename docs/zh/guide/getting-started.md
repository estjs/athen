# 快速开始


## 为什么选择 Athen?

 Athen 是一个基于 Vite、Essor 和 MDX 的静态站点生成器。它的特点是**简单**、**强大**且**高性能**，旨在帮助你以最少的配置专注于编写和部署静态站点。它主要具有以下功能：

- **开发体验好**: 基于 Vite 进行构建，启动和热更新速度极快。
- **语法灵活**: 内置 MDX 支持，也就是说你可以在 Markdown 中使用 Essor 组件。

接下来，我们将从零开始搭建一个基于 Athen 的文档站点。


## 1. 初始化项目

Athen 有如下两种安装方式，你只需要选择一种即可。我们推荐使用 `create-athen` 脚手架，因为它可以帮助你快速简单地安装 Athen 并搭建网站框架。

### 使用 `create-athen` 脚手架

使用 `create-athen` 脚手架工具可以帮助你快速简单地安装 athen 并搭建网站框架。你可以创建一个仓库并运行这个命令，它会创建一个包含模板文件的新目录。

```bash
# npm
npm create athen@latest athen-app
# yarn
yarn create athen@latest athen-app
# pnpm
pnpm create athen@latest athen-app
```

回答脚手架询问的问题，然后等待安装完成。它会自动安装依赖并启动开发服务。

假设你将新网站命名为 `athen-app`，那么你将会在当前目录下创建一个名为 `athen-app` 的新目录。你可以通过如下命令进入该目录:

```bash
cd athen-app
```

### 手动安装

当然，你也可以手动初始化项目。首先，你可以通过以下命令创建一个新目录：

```bash
mkdir athen-app && cd athen-app
```

执行 `npm init -y` 来初始化一个项目。你可以使用 npm、yarn 或 pnpm 安装 Athen:

```bash
# npm
npm install athen
# yarn
yarn add athen
# pnpm
pnpm add athen
```

然后通过如下命令创建文件:

```bash
mkdir docs && echo '# Hello World' > docs/index.md
```

在 `package.json` 中加上如下的脚本:

```json
{
  "scripts": {
    "dev": "athen dev docs",
    "build": "athen build docs"
  }
}
```

## 2. 启动 Dev Server

通过如下命令启动本地开发服务:

```bash
pnpm run dev
```

这样 Athen 将在 <http://localhost:8730> 启动开发服务。

如果你使用了 `create-athen` 脚手架创建项目，那么你就能看到一个带有导航栏以及内容的页面（像这个文档一样）。如果你选择了手动创建项目，那么你将会看到页面上打印的 `Hello World`。这表示你已经成功地启动了 Athen 的开发服务。

## 3. 生产环境构建

通过如下命令构建生产环境的产物:

```bash
pnpm run build
```

默认情况下，Athen 将会把产物打包到 `dist` 目录。

