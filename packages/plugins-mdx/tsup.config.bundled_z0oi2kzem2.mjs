// tsup.config.ts
import { defineConfig } from "tsup";
var tsup_config_default = defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["cjs", "esm"],
  target: "es2016",
  dts: true,
  shims: true,
  clean: true,
  treeshake: true,
  tsconfig: "./tsconfig.json",
  cjsInterop: true,
  minify: true,
  external: [
    "@mdx-js/mdx",
    "@mdx-js/rollup",
    "acorn",
    "fs-extra",
    "github-slugger",
    "hast-util-from-html",
    "mdast-util-mdxjs-esm",
    "rehype-autolink-headings",
    "rehype-external-links",
    "rehype-parse",
    "rehype-slug",
    "rehype-stringify",
    "remark-directive",
    "remark-frontmatter",
    "remark-gemoji",
    "remark-gfm",
    "remark-mdx-frontmatter",
    "simple-git",
    "unified",
    "shiki",
    "unist-util-visit",
    "unist-util-visit-children"
  ]
});
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiRTpcXFxcd3d3XFxcXGF0aGVuXFxcXHBhY2thZ2VzXFxcXHBsdWdpbnMtbWR4XFxcXHRzdXAuY29uZmlnLnRzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIkU6XFxcXHd3d1xcXFxhdGhlblxcXFxwYWNrYWdlc1xcXFxwbHVnaW5zLW1keFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vRTovd3d3L2F0aGVuL3BhY2thZ2VzL3BsdWdpbnMtbWR4L3RzdXAuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndHN1cCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGVudHJ5OiBbJ3NyYy9pbmRleC50cyddLFxyXG4gIG91dERpcjogJ2Rpc3QnLFxyXG4gIGZvcm1hdDogWydjanMnLCAnZXNtJ10sXHJcbiAgdGFyZ2V0OiAnZXMyMDE2JyxcclxuICBkdHM6IHRydWUsXHJcbiAgc2hpbXM6IHRydWUsXHJcbiAgY2xlYW46IHRydWUsXHJcbiAgdHJlZXNoYWtlOiB0cnVlLFxyXG4gIHRzY29uZmlnOiAnLi90c2NvbmZpZy5qc29uJyxcclxuICBjanNJbnRlcm9wOiB0cnVlLFxyXG4gIG1pbmlmeTogdHJ1ZSxcclxuICBleHRlcm5hbDogW1xyXG4gICAgJ0BtZHgtanMvbWR4JyxcclxuICAgICdAbWR4LWpzL3JvbGx1cCcsXHJcbiAgICAnYWNvcm4nLFxyXG4gICAgJ2ZzLWV4dHJhJyxcclxuICAgICdnaXRodWItc2x1Z2dlcicsXHJcbiAgICAnaGFzdC11dGlsLWZyb20taHRtbCcsXHJcbiAgICAnbWRhc3QtdXRpbC1tZHhqcy1lc20nLFxyXG4gICAgJ3JlaHlwZS1hdXRvbGluay1oZWFkaW5ncycsXHJcbiAgICAncmVoeXBlLWV4dGVybmFsLWxpbmtzJyxcclxuICAgICdyZWh5cGUtcGFyc2UnLFxyXG4gICAgJ3JlaHlwZS1zbHVnJyxcclxuICAgICdyZWh5cGUtc3RyaW5naWZ5JyxcclxuICAgICdyZW1hcmstZGlyZWN0aXZlJyxcclxuICAgICdyZW1hcmstZnJvbnRtYXR0ZXInLFxyXG4gICAgJ3JlbWFyay1nZW1vamknLFxyXG4gICAgJ3JlbWFyay1nZm0nLFxyXG4gICAgJ3JlbWFyay1tZHgtZnJvbnRtYXR0ZXInLFxyXG4gICAgJ3NpbXBsZS1naXQnLFxyXG4gICAgJ3VuaWZpZWQnLFxyXG4gICAgJ3NoaWtpJyxcclxuICAgICd1bmlzdC11dGlsLXZpc2l0JyxcclxuICAgICd1bmlzdC11dGlsLXZpc2l0LWNoaWxkcmVuJyxcclxuICBdLFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyUCxTQUFTLG9CQUFvQjtBQUV4UixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPLENBQUMsY0FBYztBQUFBLEVBQ3RCLFFBQVE7QUFBQSxFQUNSLFFBQVEsQ0FBQyxPQUFPLEtBQUs7QUFBQSxFQUNyQixRQUFRO0FBQUEsRUFDUixLQUFLO0FBQUEsRUFDTCxPQUFPO0FBQUEsRUFDUCxPQUFPO0FBQUEsRUFDUCxXQUFXO0FBQUEsRUFDWCxVQUFVO0FBQUEsRUFDVixZQUFZO0FBQUEsRUFDWixRQUFRO0FBQUEsRUFDUixVQUFVO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
