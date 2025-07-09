# Quick Start

## Why Choose Athen?

Athen is a static site generator based on Vite, Essor, and MDX. It is characterized by being **simple**, **powerful**, and **high-performance**, designed to help you focus on writing and deploying static sites with minimal configuration. Its main features include:

- **Great Development Experience**: Built on Vite, it offers extremely fast startup and hot updates.
- **Flexible Syntax**: With built-in MDX support, you can use Essor components within Markdown.

Next, we will set up a documentation site based on Athen from scratch.

## 1. Initialize Project

Athen can be installed in two ways; you only need to choose one. We recommend using the `create-athen` scaffold as it helps you quickly and easily install Athen and set up the website framework.

### Using the `create-athen` Scaffold

The `create-athen` scaffold tool helps you quickly and easily install Athen and set up the website framework. You can create a repository and run this command, which will create a new directory with template files.

```bash
# npm
npm create athen@latest athen-app
# yarn
yarn create athen@latest athen-app
# pnpm
pnpm create athen@latest athen-app
```

Answer the questions asked by the scaffold, then wait for the installation to complete. It will automatically install dependencies and start the development server.

Assuming you named your new site `athen-app`, a new directory named `athen-app` will be created in the current directory. You can enter this directory with the following command:

```bash
cd athen-app
```

### Manual Installation

Of course, you can also manually initialize the project. First, you can create a new directory with the following command:

```bash
mkdir athen-app && cd athen-app
```

Run `npm init -y` to initialize a project. You can use npm, yarn, or pnpm to install Athen:

```bash
# npm
npm install athen
# yarn
yarn add athen
# pnpm
pnpm add athen
```

Then create files with the following commands:

```bash
mkdir docs && echo '# Hello World' > docs/index.md
```

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "athen dev docs",
    "build": "athen build docs"
  }
}
```

## 2. Start Dev Server

Start the local development server with the following command:

```bash
pnpm run dev
```

Athen will start the development server at <http://localhost:8730>.

If you created the project using the `create-athen` scaffold, you will see a page with a navigation bar and content (like this documentation). If you manually created the project, you will see `Hello World` printed on the page, indicating that you have successfully started the Athen development server.

## 3. Build for Production

Build the production output with the following command:

```bash
pnpm run build
```

By default, Athen will package the production files into the `dist` directory.
