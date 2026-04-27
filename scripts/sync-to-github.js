#!/usr/bin/env node
/**
 * GitHub API 同步脚本
 * 通过 GitHub REST API 直接更新文件，绕过 git push 网络问题
 * 用法: node sync-to-github.js [文件路径]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 配置
const CONFIG = {
    owner: 'Lily1756',
    repo: 'love-anniversary',
    branch: 'main',
    tokenPath: path.join(__dirname, '..', 'config.json')
};

// 读取 Token
function getToken() {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG.tokenPath, 'utf8'));
        return config.githubToken;
    } catch (e) {
        console.error('❌ 无法读取 config.json:', e.message);
        process.exit(1);
    }
}

// GitHub API 请求
function githubRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const token = getToken();
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${CONFIG.owner}/${CONFIG.repo}${path}`,
            method: method,
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': 'LoveSite-Sync/1.0',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            const body = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(responseData);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(json);
                    } else {
                        reject(new Error(`GitHub API ${res.statusCode}: ${json.message || responseData}`));
                    }
                } catch {
                    reject(new Error(`GitHub API ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (err) => reject(err));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// 获取文件 SHA
async function getFileSha(filePath) {
    try {
        const data = await githubRequest('GET', `/contents/${encodeURIComponent(filePath)}?ref=${CONFIG.branch}`);
        return data.sha;
    } catch (err) {
        if (err.message.includes('404')) {
            return null; // 文件不存在
        }
        throw err;
    }
}

// 更新单个文件
async function updateFile(localPath, repoPath) {
    const content = fs.readFileSync(localPath, 'utf8');
    const base64Content = Buffer.from(content).toString('base64');

    // GitHub API 限制：单个文件最大 100MB，但建议小于 1MB
    if (base64Content.length > 1024 * 1024) {
        console.warn(`⚠️ 文件 ${repoPath} 较大 (${(base64Content.length / 1024).toFixed(1)}KB)，可能上传较慢`);
    }

    const sha = await getFileSha(repoPath);

    const body = {
        message: `update: ${repoPath}`,
        content: base64Content,
        branch: CONFIG.branch
    };

    if (sha) {
        body.sha = sha;
    }

    await githubRequest('PUT', `/contents/${encodeURIComponent(repoPath)}`, body);
    console.log(`✅ ${repoPath} ${sha ? '更新' : '创建'}成功`);
}

// 批量更新文件
async function syncFiles(files) {
    console.log(`🚀 开始同步 ${files.length} 个文件到 GitHub...\n`);

    for (const { local, repo } of files) {
        try {
            await updateFile(local, repo);
        } catch (err) {
            console.error(`❌ ${repo} 失败:`, err.message);
        }
    }

    console.log('\n✨ 同步完成');
}

// 主函数
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
用法:
  node sync-to-github.js <本地文件路径> [仓库文件路径]

示例:
  node sync-to-github.js js/photos.js js/photos.js
  node sync-to-github.js index.html index.html
  node sync-to-github.js style.css style.css
        `);
        process.exit(0);
    }

    const localPath = args[0];
    const repoPath = args[1] || localPath;
    const fullLocalPath = path.resolve(localPath);

    if (!fs.existsSync(fullLocalPath)) {
        console.error(`❌ 本地文件不存在: ${fullLocalPath}`);
        process.exit(1);
    }

    await updateFile(fullLocalPath, repoPath);
}

main().catch(err => {
    console.error('❌ 同步失败:', err.message);
    process.exit(1);
});
