# Installation Guide

Learn how to install and configure Athen search plugin.

## Prerequisites

Before installing the search plugin, make sure you have:

- Node.js 18 or higher
- A working Athen project

## Installation Steps

1. Install the plugin:
   ```bash
   npm install @athen/plugin-search
   ```

2. Configure in your `athen.config.ts`:
   ```typescript
   import { defineConfig } from 'athen';
   
   export default defineConfig({
     search: {
       provider: 'flex',
       include: ['**/*.md'],
       exclude: ['**/node_modules/**']
     }
   });
   ```

3. Start your development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

If you encounter issues:

- Check that all dependencies are installed
- Verify your configuration syntax
- Look at the browser console for errors
