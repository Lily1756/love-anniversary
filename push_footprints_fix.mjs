/**
 * 推送足迹地图修复（OpenStreetMap → 高德地图瓦片）
 */
import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_PATH = __dirname
const config = JSON.parse(fs.readFileSync(path.join(REPO_PATH, 'config.json'), 'utf-8'))
const TOKEN = config.githubToken
const OWNER = 'Lily1756'
const REPO = 'love-anniversary'
const agent = new https.Agent({ rejectUnauthorized: false })

function apiRequest(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
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

async function pushFile(localPath, repoPath) {
  const content = fs.readFileSync(localPath)
  const shaResp = await apiRequest('GET', `/repos/${OWNER}/${REPO}/contents/${repoPath}`)
  const sha = shaResp.status === 200 ? shaResp.body.sha : null
  const body = {
    message: sha ? `fix: 足迹地图换用高德瓦片` : `feat: add ${repoPath}`,
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
  console.log('🚀 推送足迹地图修复...\n')
  let ok = 0, fail = 0

  console.log('📄 src/views/Footprints.vue')
  ;(await pushFile(path.join(REPO_PATH, 'src/views/Footprints.vue'), 'src/views/Footprints.vue')) ? ok++ : fail++

  console.log('\n📁 dist/assets ...')
  const [as, af] = await pushDir(path.join(REPO_PATH, 'dist/assets'), 'dist/assets')
  ok += as; fail += af

  console.log('\n📄 dist/index.html')
  ;(await pushFile(path.join(REPO_PATH, 'dist/index.html'), 'dist/index.html')) ? ok++ : fail++

  console.log(`\n✅ 完成: ${ok} 成功, ${fail} 失败`)
}

main().catch(console.error)
