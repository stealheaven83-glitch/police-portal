import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  // https://vite.dev/config/
  return defineConfig({
    plugins: [
      vue({
        template: {
          transformAssetUrls: {
            // 퍼블리싱 자산은 public/portal 아래에 원본 그대로 두고 절대경로로 참조한다.
            // 기본값(true)이면 Vue SFC 의 <img src="/portal/...">까지 import 로 변환되어
            // dev 에서 data URI 로 인라인되는 등 dev/build 동작이 갈린다. 그대로 내보낸다.
            includeAbsolute: false,
          },
        },
      }),
      tailwindcss(),
      // 2026-09-11 removeViewBox 끔 — SVGO preset-default 는 width/height 가 있는 svg 에서
      // viewBox 를 지운다. 그러면 <Icon :size> 가 박스만 키우고 그림은 원본 크기 그대로라
      // 아이콘이 안 커진다(18개 중 15개가 이 상태였다).
      svgLoader({
        svgoConfig: {
          plugins: [
            { name: 'preset-default', params: { overrides: { removeViewBox: false } } },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // API 프록시 설정
        '/api': {
          target: process.env.VITE_REST_COMMON_API,
          changeOrigin: true,
          secure: false,
        },
      },
      watch: {
        usePolling: true,
      },
      host: process.env.VITE_APP_HOST,
      port: Number(process.env.VITE_APP_PORT),
    },
    define: {
      'process.env': {}
    },
  })
}