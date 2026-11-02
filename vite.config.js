import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// 개발 중 `npm run dev` 만으로 /api/* 서버 함수도 동작하도록 하는 작은 플러그인.
// (배포 환경에서는 Vercel 이 api/ 폴더를 그대로 서버 함수로 실행합니다)
function localApi(env) {
  return {
    name: 'local-api',
    configureServer(server) {
      Object.assign(process.env, env) // .env.local 의 비밀 키를 서버 함수용 환경변수로
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const m = url.pathname.match(/^\/api\/([\w-]+)$/)
        if (!m) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.js`)
          let body
          if (req.method === 'POST') {
            let raw = ''
            for await (const chunk of req) raw += chunk
            body = raw ? JSON.parse(raw) : {}
          }
          const vres = {
            status(code) { res.statusCode = code; return vres },
            json(data) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) },
          }
          await mod.default({ method: req.method, query: Object.fromEntries(url.searchParams), body, headers: req.headers, socket: req.socket }, vres)
        } catch (e) {
          res.statusCode = e.code === 'ERR_LOAD_URL' ? 404 : 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(loadEnv(mode, process.cwd(), ''))],
  build: { chunkSizeWarningLimit: 1200 },
}))
