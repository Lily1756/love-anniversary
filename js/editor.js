/**
 * =============================================
 * 内容编辑器模块
 * =============================================
 * 
 * 【功能说明】
 * 通过 GitHub API 实现内容的增删改查操作
 * 支持照片、情书、足迹、愿望四种数据类型
 * 
 * 【前置条件】
 * - 需要先引入 SimpleAuth 模块
 * - 用户需要已进入管理模式（通过 simple-auth.js）
 * - 需要有效的 GitHub PAT
 * 
 * 【使用示例】
 * 
 * // 加载数据
 * const photos = await ContentEditor.loadPhotos();
 * 
 * // 添加照片
 * await ContentEditor.addPhoto({
 *     url: 'https://...',
 *     caption: '描述',
 *     date: '2025-01-01',
 *     category: 'daily'
 * });
 * 
 * // 删除数据
 * await ContentEditor.deletePhoto('photo-id');
 * 
 * 【API 操作流程】
 * 1. GET /repos/{owner}/{repo}/contents/{path}?ref={branch}  → 获取文件 SHA
 * 2. PUT /repos/{owner}/{repo}/contents/{path} → 提交更新（带 SHA 更新，不带 SHA 创建）
 */

const ContentEditor = (function() {
    // ========== GitHub 仓库配置 ==========
    const CONFIG = {
        owner: 'Lily1756',           // GitHub 用户名
        repo: 'love-anniversary',    // 仓库名
        branch: 'main',              // 分支名
        apiBase: 'https://api.github.com' // GitHub API 基础URL
    };

    // ========== 内部函数 ==========

    /** 获取 GitHub PAT */
    function getAuth() {
        return SimpleAuth.getPat();
    }

    /** 获取文件 SHA（用于更新现有文件） */
    async function getFileSHA(path) {
        const token = getAuth();
        if (!token) throw new Error('请先输入密码进入管理模式');

        const response = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.sha; // SHA 用于更新文件
        }
        return null; // 文件不存在时返回 null
    }

    /** 读取文件内容 */
    async function readFile(path) {
        const token = getAuth();
        if (!token) throw new Error('请先输入密码进入管理模式');

        const response = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!response.ok) throw new Error('读取文件失败');

        const data = await response.json();
        // GitHub API 返回 base64 编码的内容
        return JSON.parse(atob(data.content));
    }

    /** 保存文件内容（创建或更新） */
    async function saveFile(path, content, message) {
        const token = getAuth();
        if (!token) throw new Error('请先输入密码进入管理模式');

        // 获取现有文件的 SHA（如果存在）
        const sha = await getFileSHA(path);
        
        const body = {
            message: message, // Git 提交信息
            content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))), // base64 编码
            branch: CONFIG.branch
        };

        // 如果文件已存在，需要提供 SHA
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

    // ========== 照片管理模块 ==========
    
    /**
     * 加载照片列表
     * @returns {Promise<Array>} 照片数组
     */
    async function loadPhotos() {
        return await readFile('data/photos.json');
    }

    /**
     * 添加照片
     * @param {Object} photo - 照片对象
     * @param {string} photo.url - 图片 URL
     * @param {string} photo.caption - 描述
     * @param {string} photo.date - 日期
     * @param {string} photo.category - 分类
     */
    async function addPhoto(photo) {
        const photos = await loadPhotos();
        const newPhoto = {
            id: Date.now().toString(),
            url: photo.url,
            caption: photo.caption || '',
            date: photo.date || new Date().toISOString().split('T')[0],
            category: photo.category || 'general'
        };
        photos.push(newPhoto);
        await saveFile('data/photos.json', photos, `添加照片: ${newPhoto.caption || newPhoto.id}`);
        return newPhoto;
    }

    /**
     * 删除照片
     * @param {string} id - 照片 ID
     */
    async function deletePhoto(id) {
        const photos = await loadPhotos();
        const index = photos.findIndex(p => p.id === id);
        if (index === -1) throw new Error('照片不存在');

        const deleted = photos.splice(index, 1)[0];
        await saveFile('data/photos.json', photos, `删除照片: ${deleted.caption || deleted.id}`);
        return deleted;
    }

    // ========== 情书管理模块 ==========
    
    async function loadDiaries() {
        return await readFile('data/diaries.json');
    }

    async function addDiary(diary) {
        const diaries = await loadDiaries();
        const newDiary = {
            id: Date.now().toString(),
            title: diary.title || '无标题',
            content: diary.content,
            date: diary.date || new Date().toISOString().split('T')[0],
            tags: diary.tags || []
        };
        diaries.push(newDiary);
        await saveFile('data/diaries.json', diaries, `添加情书: ${newDiary.title}`);
        return newDiary;
    }

    async function updateDiary(id, updates) {
        const diaries = await loadDiaries();
        const index = diaries.findIndex(d => d.id === id);
        if (index === -1) throw new Error('情书不存在');

        diaries[index] = { ...diaries[index], ...updates };
        await saveFile('data/diaries.json', diaries, `更新情书: ${diaries[index].title}`);
        return diaries[index];
    }

    async function deleteDiary(id) {
        const diaries = await loadDiaries();
        const index = diaries.findIndex(d => d.id === id);
        if (index === -1) throw new Error('情书不存在');

        const deleted = diaries.splice(index, 1)[0];
        await saveFile('data/diaries.json', diaries, `删除情书: ${deleted.title}`);
        return deleted;
    }

    // ========== 足迹管理模块 ==========
    
    async function loadTravels() {
        return await readFile('data/travels.json');
    }

    async function addTravel(travel) {
        const travels = await loadTravels();
        const newTravel = {
            id: Date.now().toString(),
            name: travel.name,
            location: travel.location,
            lat: travel.lat,
            lng: travel.lng,
            date: travel.date || new Date().toISOString().split('T')[0],
            description: travel.description || '',
            photos: travel.photos || []
        };
        travels.push(newTravel);
        await saveFile('data/travels.json', travels, `添加足迹: ${newTravel.name}`);
        return newTravel;
    }

    async function updateTravel(id, updates) {
        const travels = await loadTravels();
        const index = travels.findIndex(t => t.id === id);
        if (index === -1) throw new Error('足迹不存在');

        travels[index] = { ...travels[index], ...updates };
        await saveFile('data/travels.json', travels, `更新足迹: ${travels[index].name}`);
        return travels[index];
    }

    async function deleteTravel(id) {
        const travels = await loadTravels();
        const index = travels.findIndex(t => t.id === id);
        if (index === -1) throw new Error('足迹不存在');

        const deleted = travels.splice(index, 1)[0];
        await saveFile('data/travels.json', travels, `删除足迹: ${deleted.name}`);
        return deleted;
    }

    // ========== 愿望管理模块 ==========
    
    async function loadWishes() {
        return await readFile('data/wishes.json');
    }

    async function addWish(wish) {
        const wishes = await loadWishes();
        const newWish = {
            id: Date.now().toString(),
            content: wish.content,
            category: wish.category || 'general',
            priority: wish.priority || 'medium',
            completed: false,
            createdAt: new Date().toISOString()
        };
        wishes.push(newWish);
        await saveFile('data/wishes.json', wishes, `添加愿望: ${newWish.content}`);
        return newWish;
    }

    async function updateWish(id, updates) {
        const wishes = await loadWishes();
        const index = wishes.findIndex(w => w.id === id);
        if (index === -1) throw new Error('愿望不存在');

        wishes[index] = { ...wishes[index], ...updates };
        await saveFile('data/wishes.json', wishes, `更新愿望: ${wishes[index].content}`);
        return wishes[index];
    }

    async function deleteWish(id) {
        const wishes = await loadWishes();
        const index = wishes.findIndex(w => w.id === id);
        if (index === -1) throw new Error('愿望不存在');

        const deleted = wishes.splice(index, 1)[0];
        await saveFile('data/wishes.json', wishes, `删除愿望: ${deleted.content}`);
        return deleted;
    }

    async function toggleWishComplete(id) {
        const wishes = await loadWishes();
        const index = wishes.findIndex(w => w.id === id);
        if (index === -1) throw new Error('愿望不存在');

        wishes[index].completed = !wishes[index].completed;
        await saveFile('data/wishes.json', wishes, `${wishes[index].completed ? '完成' : '取消'}愿望: ${wishes[index].content}`);
        return wishes[index];
    }

    // ========== 导出公共 API ==========
    return {
        // 照片 CRUD
        loadPhotos,
        addPhoto,
        deletePhoto,
        // 情书 CRUD
        loadDiaries,
        addDiary,
        updateDiary,
        deleteDiary,
        // 足迹 CRUD
        loadTravels,
        addTravel,
        updateTravel,
        deleteTravel,
        // 愿望 CRUD
        loadWishes,
        addWish,
        updateWish,
        deleteWish,
        toggleWishComplete
    };
})();

// 导出到全局作用域
window.ContentEditor = ContentEditor;
