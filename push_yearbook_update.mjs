/**
 * 推送电子书功能相关文件到 GitHub
 * - src/composables/useYearbookGenerator.ts  (新文件)
 * - src/views/Letters.vue                    (修改)
 * - dist/assets/ 全部                        (rebuild产物)
 * - dist/index.html                          (rebuild产物)
 */
import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_PATH = __dirname

// 读 Token
const config = JSON.parse(fs.readFileSync(path.join(REPO_PATH, 'config.json'), 'utf-8'))
const TOKEN = config.githubToken
const OWNER = 'Lily1756'
const REPO = 'love-anniversary'
const API = 'api.github.com'

const agent = new https.Agent({ rejectUnauthorized: false })

function apiRequest(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: API,
      path: urlPath,
      method,
      agent,
      headers: {
        Authorization: `token ${TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'love-site-push',
      },
    }
    const req = https.request(opts, (res) => {
      let data = ''
      res.on('data', d => data += d)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function getSHA(repoPath) {
  const r = await apiRequest('GET', `/repos/${OWNER}/${REPO}/contents/${repoPath}`)
  if (r.status === 200) return r.body.sha
  return null
}

async function pushFile(localPath, repoPath) {
  const content = fs.readFileSync(localPath)
  if (content.length > 5 * 1024 * 1024) {
    console.log(`  ⚠️  跳过大文件: ${repoPath}`)
    return false
  }
  const sha = await getSHA(repoPath)
  const body = {
    message: sha ? `chore: update ${repoPath}` : `feat: add ${repoPath}`,
    content: content.toString('base64'),
  }
  if (sha) body.sha = sha

  const r = await apiRequest('PUT', `/repos/${OWNER}/${REPO}/contents/${repoPath}`, body)
  if (r.status === 200 || r.status === 201) {
    console.log(`  ${sha ? '🔄' : '🆕'} ${repoPath}`)
    return true
  }
  console.log(`  ✗ ${repoPath} — ${r.status}: ${JSON.stringify(r.body).slice(0, 150)}`)
  return false
}

async function pushDir(localDir, repoDir) {
  let ok = 0, fail = 0
  const entries = fs.readdirSync(localDir, { withFileTypes: true })
  for (const e of entries) {
    const local = path.join(localDir, e.name)
    const repo = repoDir + '/' + e.name
    if (e.isDirectory()) {
      const [s, f] = await pushDir(local, repo)
      ok += s; fail += f
    } else {
      const success = await pushFile(local, repo)
      success ? ok++ : fail++
    }
  }
  return [ok, fail]
}

async function main() {
  console.log('🚀 开始推送电子书功能更新...\n')
  let ok = 0, fail = 0

  // 1. 新 composable
  console.log('📄 推送 useYearbookGenerator.ts ...')
  const r1 = await pushFile(
    path.join(REPO_PATH, 'src/composables/useYearbookGenerator.ts'),
    'src/composables/useYearbookGenerator.ts'
  )
  r1 ? ok++ : fail++

  // 2. 修改后的 Letters.vue
  console.log('📄 推送 Letters.vue ...')
  const r2 = await pushFile(
    path.join(REPO_PATH, 'src/views/Letters.vue'),
    'src/views/Letters.vue'
  )
  r2 ? ok++ : fail++

  // 3. dist/assets 全部
  console.log('\n📁 推送 dist/assets ...')
  const [as, af] = await pushDir(path.join(REPO_PATH, 'dist/assets'), 'dist/assets')
  ok += as; fail += af

  // 4. dist/index.html
  console.log('\n📄 推送 dist/index.html ...')
  const r4 = await pushFile(
    path.join(REPO_PATH, 'dist/index.html'),
    'dist/index.html'
  )
  r4 ? ok++ : fail++

  console.log(`\n✅ 完成: ${ok} 成功, ${fail} 失败`)
}

main().catch(console.error)
