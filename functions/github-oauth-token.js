/**
 * Cloudflare Pages Function
 * GitHub OAuth code -> access token 代理
 * 敏感信息只存在服务端环境变量中
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: '请求格式错误' }, 400);
  }

  const { code, redirect_uri } = body || {};
  if (!code || !redirect_uri) {
    return jsonResponse({ error: '缺少 code 或 redirect_uri' }, 400);
  }

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return jsonResponse({ error: '服务器未配置 GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET' }, 500);
  }

  try {
    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri,
      }),
    });

    const tokenData = await tokenResp.json();
    if (!tokenResp.ok || tokenData.error) {
      return jsonResponse(
        {
          error: tokenData.error_description || tokenData.error || `OAuth token exchange failed: ${tokenResp.status}`,
        },
        500
      );
    }

    return jsonResponse({ access_token: tokenData.access_token });
  } catch (err) {
    return jsonResponse({ error: '网络错误', detail: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}
