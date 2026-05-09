import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Set base path to relative, fixing asset loading when deployed to a sub-directory or network share
  server: {
    host: '0.0.0.0', // 允许通过局域网IP访问
    port: 8082,      // 指定端口为8082
    open: true       // (可选) 自动在浏览器中打开
  }
});
