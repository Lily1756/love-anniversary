/**
 * 照片上传模块
 * 处理图片压缩、上传和元数据管理
 */

const PhotoUploader = (function() {
    // GitHub 配置
    const CONFIG = {
        owner: 'Lily1756',
        repo: 'love-anniversary',
        branch: 'main',
        apiBase: 'https://api.github.com',
        photosPath: 'data/photos.json',
        photosDir: 'photos'
    };

    // 获取认证信息
    function getAuth() {
        return SimpleAuth.getPat();
    }

    // 获取文件 SHA
    async function getFileSHA(path) {
        const token = getAuth();
        if (!token) throw new Error('请先登录');

        const response = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.sha;
        }
        return null;
    }

    // 读取文件内容
    async function readFile(path) {
        const token = getAuth();
        if (!token) throw new Error('请先登录');

        const response = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) throw new Error('读取文件失败');

        const data = await response.json();
        return JSON.parse(atob(data.content));
    }

    // 保存文件
    async function saveFile(path, content, message, sha = null) {
        const token = getAuth();
        if (!token) throw new Error('请先登录');

        const body = {
            message: message,
            content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
            branch: CONFIG.branch
        };

        if (sha) {
            body.sha = sha;
        }

        const response = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || '保存失败');
        }

        return await response.json();
    }

    // 图片压缩
    function compressImage(file, maxWidth = 1920, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // 按比例缩放
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // 输出为 base64
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 将 base64 转为 Blob
    function dataURLtoBlob(dataurl) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    // 上传图片到 GitHub
    async function uploadImage(file, filename) {
        const token = getAuth();
        if (!token) throw new Error('请先登录');

        // 压缩图片
        const compressed = await compressImage(file);
        const base64Data = compressed.split(',')[1];

        const path = `${CONFIG.photosDir}/${filename}`;
        const sha = await getFileSHA(path);

        const response = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `上传照片: ${filename}`,
                content: base64Data,
                branch: CONFIG.branch,
                ...(sha && { sha })
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || '上传图片失败');
        }

        const result = await response.json();
        // 返回 Raw URL
        return `https://raw.githubusercontent.com/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.branch}/${path}`;
    }

    // 添加照片记录
    async function addPhoto(photoData) {
        const photos = await readFile(CONFIG.photosPath);
        const photosSha = await getFileSHA(CONFIG.photosPath);

        const newPhoto = {
            id: Date.now().toString(),
            url: photoData.url,
            caption: photoData.caption || '',
            date: photoData.date || new Date().toISOString().split('T')[0],
            category: photoData.category || 'daily',
            location: photoData.location || '',
            uploadedAt: new Date().toISOString()
        };

        photos.photos = photos.photos || [];
        photos.photos.unshift(newPhoto); // 添加到开头
        photos.lastUpdated = new Date().toISOString();

        await saveFile(CONFIG.photosPath, photos, `添加照片: ${newPhoto.caption || newPhoto.id}`, photosSha);

        return newPhoto;
    }

    // 删除照片记录
    async function deletePhoto(id) {
        const photos = await readFile(CONFIG.photosPath);
        const photosSha = await getFileSHA(CONFIG.photosPath);

        const index = photos.photos.findIndex(p => p.id === id);
        if (index === -1) throw new Error('照片不存在');

        const deleted = photos.photos.splice(index, 1)[0];
        photos.lastUpdated = new Date().toISOString();

        await saveFile(CONFIG.photosPath, photos, `删除照片: ${deleted.caption || deleted.id}`, photosSha);

        return deleted;
    }

    // 加载所有照片（无需认证的公开读取）
    async function loadPhotos() {
        // 优先尝试公开读取（无需认证）
        try {
            const publicUrl = `https://raw.githubusercontent.com/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.branch}/${CONFIG.photosPath}`;
            const response = await fetch(publicUrl);
            if (response.ok) {
                const photos = await response.json();
                return photos.photos || [];
            }
        } catch (e) {
            console.warn('公开读取失败，尝试认证读取:', e);
        }
        
        // 如果公开读取失败，尝试认证读取
        if (getAuth()) {
            const photos = await readFile(CONFIG.photosPath);
            return photos.photos || [];
        }
        
        // 如果都没有，返回空数组
        return [];
    }

    return {
        compressImage,
        uploadImage,
        addPhoto,
        deletePhoto,
        loadPhotos
    };
})();

// 导出到全局
window.PhotoUploader = PhotoUploader;
