/**
 * Cloudflare Pages Function
 * 代理 GitHub API 保存照片数据
 * 前端只需传密码，token 藏在 Cloudflare 环境变量里
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const GITHUB_API = 'https://api.github.com';
const REPO_OWNER = 'Lily1756';
const REPO_NAME = 'love-anniversary';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. 解析请求体
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: '请求格式错误' }, 400);
  }

  const { password, data, path } = body;

  // 2. 验证密码
  const sitePassword = env.SITE_PASSWORD;
  if (!sitePassword) {
    return jsonResponse({ error: '服务器未配置 SITE_PASSWORD' }, 500);
  }
  if (password !== sitePassword) {
    return jsonResponse({ error: '密码错误' }, 403);
  }

  // 3. 读取 GitHub Token（环境变量）
  const token = env.GITHUB_TOKEN;
  if (!token) {
    return jsonResponse({ error: '服务器未配置 GITHUB_TOKEN' }, 500);
  }

  const filePath = path || 'data/photos.json';
  const jsonStr = JSON.stringify(data, null, 2);

  // 4. 获取文件 SHA（用于更新）
  let sha = null;
  try {
    const shaResp = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'LoveSite-Save/1.0',
        },
      }
    );
    if (shaResp.ok) {
      const shaData = await shaResp.json();
      sha = shaData.sha;
    }
  } catch {
    // 文件不存在，sha 保持 null（会创建新文件）
  }

  // 5. 推送到 GitHub
  const payload = {
    message: `update: ${filePath} [via Cloudflare Function]`,
    content: btoa(unescape(encodeURIComponent(jsonStr))),
    branch: 'main',
  };
  if (sha) payload.sha = sha;

  try {
    const updateResp = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'LoveSite-Save/1.0',
        },
        body: JSON.stringify(payload),
      }
    );

    if (updateResp.ok) {
      return jsonResponse({ success: true, message: '保存成功' });
    } else {
      const errText = await updateResp.text();
      return jsonResponse(
        { error: `GitHub API 失败: ${updateResp.status}`, detail: errText },
        500
      );
    }
  } catch (err) {
    return jsonResponse({ error: '网络错误', detail: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}
