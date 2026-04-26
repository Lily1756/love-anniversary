/**
 * Cloudflare Pages Function - 代理 Cloudinary 图片上传
 * 前端把图片 base64 传过来，Function 在服务器端上传到 Cloudinary
 * 解决中国大陆直接访问 Cloudinary 超时的问题
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SITE_PASSWORD = '2025';
const CLOUDINARY_CLOUD_NAME = 'dcpzdsdxc';
const CLOUDINARY_UPLOAD_PRESET = 'love_site_preset';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request } = context;

  // 1. 解析请求体
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: '请求格式错误' }, 400);
  }

  const { password, file } = body;

  // 2. 验证密码
  if (password !== SITE_PASSWORD) {
    return jsonResponse({ error: '密码错误' }, 403);
  }

  if (!file || typeof file !== 'string') {
    return jsonResponse({ error: '缺少 file 参数' }, 400);
  }

  // 3. 上传到 Cloudinary（服务器端网络，稳定）
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const formBody = new URLSearchParams();
  formBody.append('file', file);
  formBody.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const resp = await fetch(cloudinaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return jsonResponse(
        { error: `Cloudinary 上传失败 (${resp.status})`, detail: errText },
        500
      );
    }

    const data = await resp.json();
    return jsonResponse({
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
    });
  } catch (err) {
    return jsonResponse({ error: '上传网络错误', detail: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}
