/**
 * 照片墙 - 业务逻辑
 * 包含：相册管理、照片上传（Cloudinary）、全屏浏览、编辑模式
 */
(function() {
    'use strict';

    // ══════════════════════════════════════════════
    //  Cloudinary 配置
    // ══════════════════════════════════════════════
    const CLOUDINARY_CLOUD_NAME = 'dcpzdsdxc';
    const CLOUDINARY_UPLOAD_PRESET = 'love_site_preset';
    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    // ══════════════════════════════════════════════
    //  全局状态
    // ══════════════════════════════════════════════
    let albums = [];
    let currentTag = 'all';
    let editMode = false;
    let currentAlbum = null;   // 当前浏览的相册
    let currentPhotoIndex = 0;
    let deleteTarget = null;   // 待删除目标 {type: 'album'|'photo', albumId, photoIndex}
    let albumCoverUrl = '';    // 存储上传的封面 URL
    let uploadedPhotosQueue = []; // 全局上传队列

    // ══════════════════════════════════════════════
    //  默认相册数据（首次加载时兜底）
    // ══════════════════════════════════════════════
    const DEFAULT_ALBUMS = [
        { id: 'album-1', title: '甜蜜日常', cover: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80', date: '2025', tag: 'daily', photos: [
            { src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80', caption: '在一起的每一天，都是最珍贵的礼物' },
            { src: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=600&q=80', caption: '日常的甜蜜，不需要特别的理由' },
            { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', caption: '温暖陪伴，是最长情的告白' },
            { src: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=600&q=80', caption: '平凡的日子，因为有你而不平凡' }
        ]},
        { id: 'album-2', title: '浪漫约会', cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80', date: '2025', tag: 'date', photos: [
            { src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80', caption: '第一次约会，心跳加速的感觉' },
            { src: 'https://images.unsplash.com/photo-1515023115689-589c33041b3c?w=600&q=80', caption: '生日惊喜，为你准备的浪漫' },
            { src: 'https://images.unsplash.com/photo-1511405946472-a37e3b5ccd47?w=600&q=80', caption: '烛光晚餐，浪漫满溢' },
            { src: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&q=80', caption: '约会时光，每一刻都值得珍藏' }
        ]},
        { id: 'album-3', title: '旅途风景', cover: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80', date: '2025', tag: 'travel', photos: [
            { src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80', caption: '一起看日落，余晖洒在你脸上' },
            { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', caption: '山顶的风景，只有和你一起才有意义' },
            { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80', caption: '湖边的宁静，岁月静好' },
            { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80', caption: '大自然的怀抱，有你更温暖' }
        ]},
        { id: 'album-4', title: '纪念时刻', cover: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&q=80', date: '2025', tag: 'anniversary', photos: [
            { src: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&q=80', caption: '周年纪念日，感谢一路有你' },
            { src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80', caption: '特殊的日子，特别的庆祝' },
            { src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80', caption: '每一个纪念日，都是爱情的里程碑' }
        ]},
        { id: 'album-5', title: '生活点滴', cover: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80', date: '2024', tag: 'daily', photos: [
            { src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80', caption: '一起做饭的温馨时光' },
            { src: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80', caption: '周末的午后，慵懒又惬意' },
            { src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', caption: '和朋友们在一起的欢乐时光' }
        ]}
    ];

    // ══════════════════════════════════════════════
    //  初始化入口
    // ══════════════════════════════════════════════
    async function init() {
        await loadAlbums();
        setupEventListeners();
        renderAlbums();
        updateStats();
        checkEditMode();
        initUrlParams();
    }

    // ══════════════════════════════════════════════
    //  数据加载
    // ══════════════════════════════════════════════
    async function loadAlbums() {
        try {
            const resp = await fetch('data/photos.json?t=' + Date.now());
            if (resp.ok) {
                const data = await resp.json();
                if (Array.isArray(data) && data.length > 0) {
                    if (data[0] && Array.isArray(data[0].photos)) {
                        albums = data;
                    } else {
                        albums = [{
                            id: 'migrated', title: '全部照片',
                            cover: data[0]?.src || '',
                            date: '2025', tag: 'daily',
                            photos: data.map(p => ({ src: p.src, caption: p.title || '' }))
                        }];
                    }
                } else {
                    albums = DEFAULT_ALBUMS;
                }
            } else {
                albums = DEFAULT_ALBUMS;
            }
        } catch {
            albums = DEFAULT_ALBUMS;
        }
    }

    // ══════════════════════════════════════════════
    //  事件绑定（一次性，初始化时执行）
    // ══════════════════════════════════════════════
    function setupEventListeners() {
        // 标签筛选
        document.querySelectorAll('.filter-tag').forEach(btn => {
            btn.addEventListener('click', () => {
                currentTag = btn.dataset.tag;
                document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderAlbums();
            });
        });

        // 编辑按钮
        document.getElementById('editModeBtn').addEventListener('click', () => {
            editMode = !editMode;
            document.getElementById('editModeBtn').textContent = editMode ? '完成编辑' : '编辑';
            document.querySelector('.album-grid').classList.toggle('edit-mode', editMode);
            document.getElementById('addAlbumBtn').style.display = editMode ? 'inline-flex' : 'none';
            document.getElementById('addPhotoBtn').style.display = editMode ? 'inline-flex' : 'none';
        });

        // 新建相册 / 添加照片按钮
        document.getElementById('addAlbumBtn').addEventListener('click', () => openAlbumModal());
        document.getElementById('addPhotoBtn').addEventListener('click', () => openPhotoModal());

        // 编辑入口
        document.getElementById('fabEdit').addEventListener('click', openAuthModal);

        // 密码验证
        document.getElementById('authConfirm').addEventListener('click', verifyPassword);
        document.getElementById('authCancel').addEventListener('click', () => closeModal('authModal'));
        document.getElementById('authPassword').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') verifyPassword();
        });
        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('authModal')) closeModal('authModal');
        });

        // 全屏浏览
        document.getElementById('viewerBack').addEventListener('click', closeViewer);
        document.getElementById('viewerPrev').addEventListener('click', () => navigatePhoto(-1));
        document.getElementById('viewerNext').addEventListener('click', () => navigatePhoto(1));
        document.getElementById('viewerMain').addEventListener('click', (e) => {
            if (e.target === e.currentTarget || e.target.id === 'viewerImg') toggleZoom();
        });

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('albumViewer').classList.contains('active')) return;
            if (e.key === 'ArrowLeft') navigatePhoto(-1);
            if (e.key === 'ArrowRight') navigatePhoto(1);
            if (e.key === 'Escape') closeViewer();
        });

        // 模态框基础绑定
        document.getElementById('modalCancel').addEventListener('click', () => closeModal('albumModal'));
        document.getElementById('modalConfirm').addEventListener('click', confirmAlbumModal);
        document.getElementById('photoCancel').addEventListener('click', () => closeModal('photoModal'));
        document.getElementById('photoConfirm').addEventListener('click', confirmPhotoModal);
        document.getElementById('deleteCancel').addEventListener('click', () => closeModal('deleteModal'));
        document.getElementById('deleteConfirm').addEventListener('click', confirmDelete);

        // 点击遮罩关闭
        ['albumModal', 'photoModal', 'deleteModal'].forEach(id => {
            document.getElementById(id).addEventListener('click', (e) => {
                if (e.target === document.getElementById(id)) closeModal(id);
            });
        });

        // 封面上传 URL 切换
        document.getElementById('coverUrlToggle').addEventListener('change', (e) => {
            const urlInput = document.getElementById('albumCoverInput');
            urlInput.style.display = e.target.checked ? 'block' : 'none';
            if (e.target.checked && albumCoverUrl) urlInput.value = albumCoverUrl;
        });

        // 照片 URL 切换
        document.getElementById('urlInputToggle').addEventListener('change', (e) => {
            document.getElementById('urlInputArea').style.display = e.target.checked ? 'block' : 'none';
        });

        // 批量输入实时预览
        document.getElementById('photoBatchInput').addEventListener('input', updateBatchPreview);

        // 触摸滑动
        let touchStartX = 0;
        const viewerMain = document.getElementById('viewerMain');
        viewerMain.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
        viewerMain.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) navigatePhoto(diff > 0 ? 1 : -1);
        }, { passive: true });
    }

    // ══════════════════════════════════════════════
    //  编辑模式检查
    // ══════════════════════════════════════════════
    function checkEditMode() {
        const isAuth = sessionStorage.getItem('auth') === 'true' || localStorage.getItem('auth') === 'true';
        const fabEdit = document.getElementById('fabEdit');
        const editModeBtn = document.getElementById('editModeBtn');
        if (isAuth) {
            editModeBtn.style.display = 'inline-flex';
            fabEdit.classList.add('hidden');
        } else {
            editModeBtn.style.display = 'none';
            fabEdit.classList.remove('hidden');
        }
    }

    // ══════════════════════════════════════════════
    //  认证
    // ══════════════════════════════════════════════
    function openAuthModal() {
        document.getElementById('authPassword').value = '';
        document.getElementById('authModal').classList.add('active');
        setTimeout(() => document.getElementById('authPassword').focus(), 100);
    }

    function verifyPassword() {
        const password = document.getElementById('authPassword').value.trim();
        if (password === '2025') {
            sessionStorage.setItem('auth', 'true');
            closeModal('authModal');
            checkEditMode();
            showToast('验证成功，已进入编辑模式');
        } else {
            showToast('密码错误');
            document.getElementById('authPassword').value = '';
            document.getElementById('authPassword').focus();
        }
    }

    // ══════════════════════════════════════════════
    //  统计
    // ══════════════════════════════════════════════
    function updateStats() {
        const filtered = currentTag === 'all' ? albums : albums.filter(a => a.tag === currentTag);
        const totalPhotos = filtered.reduce((sum, a) => sum + (a.photos?.length || 0), 0);
        document.getElementById('totalAlbums').textContent = filtered.length;
        document.getElementById('totalPhotos').textContent = totalPhotos;
    }

    // ══════════════════════════════════════════════
    //  相册渲染
    // ══════════════════════════════════════════════
    function renderAlbums() {
        const grid = document.getElementById('albumGrid');
        const empty = document.getElementById('emptyState');
        const filtered = currentTag === 'all' ? albums : albums.filter(a => a.tag === currentTag);

        if (filtered.length === 0) {
            grid.style.display = 'none';
            empty.style.display = 'block';
            updateStats();
            return;
        }

        empty.style.display = 'none';
        grid.style.display = 'grid';
        grid.innerHTML = '';

        const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(album => {
            const card = document.createElement('div');
            card.className = 'album-card';
            card.innerHTML = `
                <div class="album-cover-wrap">
                    <img class="album-cover" src="${album.cover}" alt="${album.title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><rect fill=%22%23F0E6E6%22 width=%22400%22 height=%22300%22/><text x=%22200%22 y=%22160%22 text-anchor=%22middle%22 fill=%22%23C4A8A2%22 font-size=%2240%22>📷</text></svg>'">
                    <span class="album-tag">${getTagLabel(album.tag)}</span>
                    <span class="album-count">${album.photos?.length || 0}张</span>
                    ${editMode ? `<button class="album-delete" data-id="${album.id}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>` : ''}
                </div>
                <div class="album-info">
                    <div class="album-title">${album.title}</div>
                    <div class="album-date">${album.date}</div>
                </div>
            `;

            card.querySelector('.album-cover-wrap').addEventListener('click', () => openAlbum(album));
            const delBtn = card.querySelector('.album-delete');
            if (delBtn) {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openDeleteModal('album', album.id, album.title);
                });
            }
            grid.appendChild(card);
        });

        updateStats();
    }

    // ══════════════════════════════════════════════
    //  全屏浏览
    // ══════════════════════════════════════════════
    function openAlbum(album) {
        currentAlbum = album;
        currentPhotoIndex = 0;
        document.getElementById('albumViewer').classList.add('active');
        document.body.style.overflow = 'hidden';
        renderViewer();
    }

    function closeViewer() {
        document.getElementById('albumViewer').classList.remove('active');
        document.body.style.overflow = '';
        currentAlbum = null;
        currentPhotoIndex = 0;
    }

    function renderViewer() {
        if (!currentAlbum || !currentAlbum.photos) return;
        const photos = currentAlbum.photos;
        const photo = photos[currentPhotoIndex];

        const img = document.getElementById('viewerImg');
        img.src = photo.src;
        img.alt = photo.caption || '';
        img.classList.remove('zoomed');

        document.getElementById('viewerCounter').textContent = `${currentPhotoIndex + 1} / ${photos.length}`;

        const caption = document.getElementById('viewerCaption');
        caption.textContent = photo.caption || '';
        caption.classList.toggle('show', !!photo.caption);

        const thumbs = document.getElementById('viewerThumbs');
        thumbs.innerHTML = '';
        photos.forEach((p, i) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumb-item' + (i === currentPhotoIndex ? ' active' : '');
            thumb.innerHTML = `<img src="${p.src}" alt="" loading="lazy">`;
            thumb.addEventListener('click', () => { currentPhotoIndex = i; renderViewer(); });
            thumbs.appendChild(thumb);
        });

        setTimeout(() => {
            const activeThumb = thumbs.querySelector('.thumb-item.active');
            if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 100);
    }

    function navigatePhoto(dir) {
        if (!currentAlbum || !currentAlbum.photos) return;
        const len = currentAlbum.photos.length;
        currentPhotoIndex = (currentPhotoIndex + dir + len) % len;
        renderViewer();
    }

    function toggleZoom() {
        document.getElementById('viewerImg').classList.toggle('zoomed');
    }

    // ══════════════════════════════════════════════
    //  新建/编辑相册弹窗
    // ══════════════════════════════════════════════
    function openAlbumModal(album) {
        document.getElementById('modalTitle').textContent = album ? '编辑相册' : '新建相册';
        document.getElementById('albumTitleInput').value = album?.title || '';
        document.getElementById('albumTagSelect').value = album?.tag || 'daily';
        document.getElementById('albumDateInput').value = album?.date || new Date().toISOString().split('T')[0];
        document.getElementById('modalConfirm').textContent = album ? '保存' : '创建';
        document.getElementById('albumModal').dataset.editId = album?.id || '';

        albumCoverUrl = album?.cover || '';
        resetCoverUploadUI();
        if (albumCoverUrl) showCoverPreview(albumCoverUrl);

        setupCoverUpload();
        document.getElementById('albumModal').classList.add('active');
        document.getElementById('albumTitleInput').focus();
    }

    function resetCoverUploadUI() {
        document.getElementById('coverPlaceholder').style.display = 'flex';
        document.getElementById('coverPreview').style.display = 'none';
        document.getElementById('coverUploadProgress').style.display = 'none';
        document.getElementById('coverUrlToggle').checked = false;
        document.getElementById('albumCoverInput').style.display = 'none';
        document.getElementById('albumCoverInput').value = '';
        document.getElementById('coverUploadArea').classList.remove('uploading');
    }

    function showCoverPreview(url) {
        document.getElementById('coverPlaceholder').style.display = 'none';
        document.getElementById('coverPreview').style.display = 'block';
        document.getElementById('coverPreviewImg').src = url;
    }

    // ══════════════════════════════════════════════
    //  封面上传
    // ══════════════════════════════════════════════
    function setupCoverUpload() {
        const uploadArea = document.getElementById('coverUploadArea');
        const fileInput = document.getElementById('coverFileInput');
        const removeBtn = document.getElementById('coverRemoveBtn');

        uploadArea.onclick = (e) => {
            if (e.target === removeBtn || e.target.closest('.cover-remove-btn')) return;
            fileInput.click();
        };

        fileInput.onchange = (e) => {
            if (e.target.files[0]) handleCoverFile(e.target.files[0]);
        };

        uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); };
        uploadArea.ondragleave = () => { uploadArea.classList.remove('dragover'); };
        uploadArea.ondrop = (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files[0] && files[0].type.startsWith('image/')) handleCoverFile(files[0]);
        };

        removeBtn.onclick = () => { albumCoverUrl = ''; resetCoverUploadUI(); };
    }

    async function handleCoverFile(file) {
        const uploadArea = document.getElementById('coverUploadArea');
        const progressArea = document.getElementById('coverUploadProgress');
        const progressFill = document.getElementById('coverProgressFill');
        const progressText = document.getElementById('coverProgressText');

        document.getElementById('coverPlaceholder').style.display = 'none';
        document.getElementById('coverPreview').style.display = 'none';
        uploadArea.classList.add('uploading');
        progressArea.style.display = 'flex';

        const updateProgress = (percent, text) => {
            progressFill.style.width = percent + '%';
            progressText.textContent = text;
        };

        try {
            // 1. 压缩并转成 base64
            updateProgress(20, '压缩图片...');
            const compressed = await compressImage(file, 1200, 0.85);
            const base64 = await readFileAsBase64(compressed);

            let uploadedUrl = null;
            let isLocal = false;

            // 2. 优先通过 Cloudflare Function 上传（国内网络友好）
            updateProgress(50, '上传到云端...');
            try {
                const resp = await fetch('/upload-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: '2025', file: base64 })
                });
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.success) {
                        uploadedUrl = data.url;
                    }
                }
            } catch (e) {
                console.log('[upload-image] Function 不可用:', e.message);
            }

            // 3. Fallback：直连 Cloudinary
            if (!uploadedUrl) {
                updateProgress(70, '直连上传...');
                try {
                    const formData = new FormData();
                    formData.append('file', compressed);
                    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
                        method: 'POST',
                        body: formData,
                        signal: AbortSignal.timeout(30000)
                    });
                    if (response.ok) {
                        const data = await response.json();
                        uploadedUrl = data.secure_url;
                    }
                } catch (e) {
                    console.log('[Cloudinary] 直连失败:', e.message);
                }
            }

            // 4. 最终 fallback：base64 本地存储
            if (!uploadedUrl) {
                updateProgress(80, '转为本地存储...');
                uploadedUrl = base64;
                isLocal = true;
            }

            albumCoverUrl = uploadedUrl;
            updateProgress(100, isLocal ? '完成（本地存储）' : '完成！');
            setTimeout(() => {
                showCoverPreview(albumCoverUrl);
                progressArea.style.display = 'none';
                uploadArea.classList.remove('uploading');
                if (isLocal) {
                    showToast('上传服务暂不可用，已转为本地存储（页面刷新后需重新上传）');
                }
            }, 500);

        } catch (err) {
            console.error('[Upload Error]', err);
            progressText.textContent = '上传失败: ' + err.message;
            progressFill.style.background = '#e74c3c';
            setTimeout(() => { resetCoverUploadUI(); }, 3000);
        }
    }

    function confirmAlbumModal() {
        const title = document.getElementById('albumTitleInput').value.trim();
        const tag = document.getElementById('albumTagSelect').value;
        const date = document.getElementById('albumDateInput').value;
        const editId = document.getElementById('albumModal').dataset.editId;
        const manualCover = document.getElementById('albumCoverInput').value.trim();
        const cover = albumCoverUrl || manualCover;

        if (!title) { showToast('请输入相册名称'); return; }
        if (!cover) { showToast('请上传相册封面'); return; }

        if (editId) {
            const album = albums.find(a => a.id === editId);
            if (album) { album.title = title; album.tag = tag; album.cover = cover; album.date = date; }
        } else {
            albums.push({ id: 'album-' + Date.now(), title, tag, cover, date, photos: [] });
        }

        saveAndRender();
        closeModal('albumModal');
        showToast(editId ? '相册已更新' : '相册创建成功');
    }

    // ══════════════════════════════════════════════
    //  添加照片弹窗
    // ══════════════════════════════════════════════
    function openPhotoModal() {
        const select = document.getElementById('photoAlbumSelect');
        select.innerHTML = albums.map(a => `<option value="${a.id}">${a.title}</option>`).join('');

        uploadedPhotosQueue = [];
        document.getElementById('photoBatchInput').value = '';
        document.getElementById('urlInputToggle').checked = false;
        document.getElementById('urlInputArea').style.display = 'none';
        document.getElementById('batchPreviewArea').style.display = 'none';
        document.getElementById('uploadProgressArea').style.display = 'none';
        document.getElementById('uploadedPhotosArea').style.display = 'none';
        document.getElementById('uploadDropzone').classList.remove('uploading');

        document.getElementById('photoModal').classList.add('active');
        setupDragUpload();
    }

    function setupDragUpload() {
        const dropzone = document.getElementById('uploadDropzone');
        const fileInput = document.getElementById('fileInput');

        dropzone.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            if (e.target.files.length > 0) handleFiles(e.target.files);
        };
        dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('dragover'); };
        dropzone.ondragleave = () => { dropzone.classList.remove('dragover'); };
        dropzone.ondrop = (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
        };
    }

    async function handleFiles(files) {
        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) { showToast('请选择图片文件'); return; }

        document.getElementById('uploadDropzone').classList.add('uploading');
        document.getElementById('uploadProgressArea').style.display = 'block';

        const progressList = document.getElementById('uploadProgressList');
        progressList.innerHTML = '';

        const uploadTasks = imageFiles.map((file, index) => {
            const itemId = `upload-${Date.now()}-${index}`;
            const div = document.createElement('div');
            div.className = 'upload-progress-item';
            div.id = itemId;
            div.innerHTML = `
                <div class="upload-progress-thumb" style="background: var(--bg-primary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">🖼️</div>
                <div class="upload-progress-info">
                    <div class="upload-progress-name">${file.name}</div>
                    <div class="upload-progress-bar"><div class="upload-progress-fill" style="width: 0%"></div></div>
                    <div class="upload-progress-status">准备上传...</div>
                </div>
                <div class="upload-progress-percent">0%</div>
            `;
            progressList.appendChild(div);
            return uploadFile(file, itemId);
        });

        const results = await Promise.all(uploadTasks);
        document.getElementById('uploadProgressArea').style.display = 'none';

        const successPhotos = results.filter(r => r.success);
        if (successPhotos.length > 0) {
            uploadedPhotosQueue.push(...successPhotos.map(r => ({ src: r.url, caption: '', name: r.name })));
            renderUploadedPhotos();
            showToast(`成功上传 ${successPhotos.length} 张照片`);
        }

        const failedCount = results.length - successPhotos.length;
        if (failedCount > 0) showToast(`${failedCount} 张照片上传失败`);
        document.getElementById('uploadDropzone').classList.remove('uploading');
    }

    // ══════════════════════════════════════════════
    //  图片上传（三层 fallback：Function → Cloudinary → base64）
    // ══════════════════════════════════════════════
    async function uploadFile(file, itemId) {
        const item = document.getElementById(itemId);
        if (!item) return { success: false, error: 'Item not found', name: file.name };

        const fill = item.querySelector('.upload-progress-fill');
        const status = item.querySelector('.upload-progress-status');
        const percent = item.querySelector('.upload-progress-percent');
        const thumb = item.querySelector('.upload-progress-thumb');

        const updateProgress = (p, msg) => {
            fill.style.width = p + '%';
            percent.textContent = p + '%';
            if (msg) status.textContent = msg;
        };

        try {
            updateProgress(20, '压缩图片...');
            const compressed = await compressImage(file, 1200, 0.85);
            const base64 = await readFileAsBase64(compressed);

            let uploadedUrl = null;
            let isLocal = false;

            // 1. 优先通过 Cloudflare Function 上传
            updateProgress(50, '上传到云端...');
            try {
                const resp = await fetch('/upload-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: '2025', file: base64 })
                });
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.success) {
                        uploadedUrl = data.url;
                    }
                }
            } catch (e) {
                console.log('[upload-image] Function 不可用:', e.message);
            }

            // 2. Fallback：直连 Cloudinary
            if (!uploadedUrl) {
                updateProgress(70, '直连上传...');
                try {
                    const formData = new FormData();
                    formData.append('file', compressed);
                    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
                        method: 'POST',
                        body: formData,
                        signal: AbortSignal.timeout(30000)
                    });
                    if (response.ok) {
                        const data = await response.json();
                        uploadedUrl = data.secure_url;
                    }
                } catch (e) {
                    console.log('[Cloudinary] 直连失败:', e.message);
                }
            }

            // 3. 最终 fallback：base64 本地存储
            if (!uploadedUrl) {
                updateProgress(80, '转为本地存储...');
                uploadedUrl = base64;
                isLocal = true;
            }

            updateProgress(100, isLocal ? '完成（本地）' : '完成');
            const objectUrl = URL.createObjectURL(file);
            thumb.innerHTML = `<img src="${objectUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`;
            return { success: true, url: uploadedUrl, name: file.name, local: isLocal };

        } catch (err) {
            updateProgress(0, '失败: ' + err.message);
            item.style.opacity = '0.5';
            return { success: false, error: err.message, name: file.name };
        }
    }

    // ══════════════════════════════════════════════
    //  图片处理工具
    // ══════════════════════════════════════════════
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => { resolve(reader.result); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function compressImage(file, maxWidth = 1920, quality = 0.85) {
        return new Promise((resolve) => {
            if (file.size < 500 * 1024) { resolve(file); return; }
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                let w = img.width, h = img.height;
                if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                canvas.toBlob((blob) => {
                    if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    else resolve(file);
                }, 'image/jpeg', quality);
            };
            img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
            img.src = url;
        });
    }

    // ══════════════════════════════════════════════
    //  已上传照片列表
    // ══════════════════════════════════════════════
    function renderUploadedPhotos() {
        const area = document.getElementById('uploadedPhotosArea');
        const list = document.getElementById('uploadedPhotosList');
        const count = document.getElementById('uploadedCount');

        if (uploadedPhotosQueue.length === 0) {
            area.style.display = 'none';
            return;
        }

        area.style.display = 'block';
        count.textContent = `(${uploadedPhotosQueue.length}张)`;
        list.innerHTML = uploadedPhotosQueue.map((photo, index) => `
            <div class="uploaded-photo-item" data-index="${index}">
                <img src="${photo.src}" alt="">
                <button class="remove-btn" onclick="window._removeUploadedPhoto && window._removeUploadedPhoto(${index})">×</button>
                <input type="text" class="caption-input" placeholder="添加描述..." value="${photo.caption}" onchange="window._updatePhotoCaption && window._updatePhotoCaption(${index}, this.value)">
            </div>
        `).join('');
    }

    window._removeUploadedPhoto = function(index) {
        uploadedPhotosQueue.splice(index, 1);
        renderUploadedPhotos();
    };

    window._updatePhotoCaption = function(index, caption) {
        uploadedPhotosQueue[index].caption = caption;
    };

    function updateBatchPreview() {
        const input = document.getElementById('photoBatchInput').value.trim();
        const previewArea = document.getElementById('batchPreviewArea');
        const previewList = document.getElementById('batchPreviewList');
        const countEl = document.getElementById('batchCount');

        if (!input) { previewArea.style.display = 'none'; return; }

        const lines = input.split('\n').filter(line => line.trim());
        const photos = lines.map(line => {
            const parts = line.split('|');
            return { url: parts[0].trim(), caption: parts[1] ? parts[1].trim() : '' };
        }).filter(p => p.url);

        if (photos.length === 0) { previewArea.style.display = 'none'; return; }

        previewArea.style.display = 'block';
        countEl.textContent = `(${photos.length}张)`;
        previewList.innerHTML = photos.map((p, i) => `
            <div style="position: relative; width: 60px; height: 60px; border-radius: 6px; overflow: hidden; background: var(--bg-primary);">
                <img src="${p.url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:10px;\\'>失效</div>'">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; font-size: 10px; padding: 2px 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${i + 1}</div>
            </div>
        `).join('');
    }

    // ══════════════════════════════════════════════
    //  添加照片确认
    // ══════════════════════════════════════════════
    function confirmPhotoModal() {
        const albumId = document.getElementById('photoAlbumSelect').value;
        const album = albums.find(a => a.id === albumId);
        if (!album) { showToast('相册不存在'); return; }
        if (!album.photos) album.photos = [];

        let addedCount = 0;

        if (uploadedPhotosQueue.length > 0) {
            uploadedPhotosQueue.forEach(photo => {
                album.photos.push({ src: photo.src, caption: photo.caption });
                addedCount++;
            });
        }

        const isUrlMode = document.getElementById('urlInputToggle').checked;
        if (isUrlMode) {
            const input = document.getElementById('photoBatchInput').value.trim();
            if (input) {
                input.split('\n').filter(line => line.trim()).forEach(line => {
                    const parts = line.split('|');
                    const url = parts[0].trim();
                    const caption = parts[1] ? parts[1].trim() : '';
                    if (url) { album.photos.push({ src: url, caption }); addedCount++; }
                });
            }
        }

        if (addedCount > 0) {
            if (!album.cover) album.cover = album.photos[0].src;
            saveAndRender();
            showToast(`成功添加 ${addedCount} 张照片`);
            closeModal('photoModal');
        } else {
            showToast('没有要添加的照片，请先上传或输入图片 URL');
        }
    }

    // ══════════════════════════════════════════════
    //  删除
    // ══════════════════════════════════════════════
    function openDeleteModal(type, id, title) {
        deleteTarget = { type, albumId: id };
        document.getElementById('deleteMsg').textContent = type === 'album'
            ? `确定要删除「${title}」吗？相册内的所有照片也会被删除。`
            : '确定要删除这张照片吗？';
        document.getElementById('deleteModal').classList.add('active');
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        if (deleteTarget.type === 'album') {
            albums = albums.filter(a => a.id !== deleteTarget.albumId);
            saveAndRender();
            showToast('相册已删除');
        } else if (deleteTarget.type === 'photo') {
            const album = albums.find(a => a.id === deleteTarget.albumId);
            if (album && album.photos) {
                album.photos.splice(deleteTarget.photoIndex, 1);
                if (album.photos.length === 0) album.cover = '';
                else if (!deleteTarget.photoIndex) album.cover = album.photos[0].src;
                saveAndRender();
                showToast('照片已删除');
            }
        }
        closeModal('deleteModal');
        deleteTarget = null;
    }

    // ══════════════════════════════════════════════
    //  弹窗基础
    // ══════════════════════════════════════════════
    function closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    // ══════════════════════════════════════════════
    //  数据持久化
    // ══════════════════════════════════════════════
    async function saveAndRender() {
        const data = albums;
        let saved = false;

        // 优先尝试 Cloudflare Pages Function（只传密码，token 在服务端）
        try {
            const functionUrl = '/save-photos';
            const resp = await fetch(functionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: '2025',
                    data: data,
                    path: 'data/photos.json'
                })
            });
            if (resp.ok) {
                const result = await resp.json();
                if (result.success) {
                    saved = true;
                    showToast('✅ 已保存到云端');
                }
            }
        } catch (e) {
            // Function 不可用（本地开发或部署未生效），继续 fallback
            console.log('[save-photos] Function 不可用，尝试 fallback:', e.message);
        }

        // Fallback：用 localStorage 里的 token 直接调 GitHub API
        if (!saved) {
            const token = localStorage.getItem('github_pat');
            if (token) {
                try {
                    const owner = 'Lily1756', repo = 'love-anniversary', path = 'data/photos.json';
                    const jsonStr = JSON.stringify(data, null, 2);
                    const blob = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                        headers: { Authorization: `token ${token}` }
                    }).then(r => r.json());
                    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                        method: 'PUT',
                        headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: '更新照片数据',
                            content: btoa(unescape(encodeURIComponent(jsonStr))),
                            sha: blob.sha
                        })
                    });
                    saved = true;
                    showToast('✅ 已保存到云端');
                } catch (e) {
                    console.error('GitHub API 保存失败', e);
                    showToast('❌ 保存失败，请检查网络或重新登录');
                }
            } else {
                showToast('⚠️ 未配置 Token，数据仅本地有效');
            }
        }

        renderAlbums();
    }

    // ══════════════════════════════════════════════
    //  工具函数
    // ══════════════════════════════════════════════
    function getTagLabel(tag) {
        const map = { daily: '日常', date: '约会', travel: '旅行', anniversary: '纪念日' };
        return map[tag] || tag || '';
    }

    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // URL 参数：?album=xxx 自动打开指定相册
    function initUrlParams() {
        const params = new URLSearchParams(location.search);
        const albumId = params.get('album');
        if (!albumId) return;
        const check = setInterval(() => {
            if (albums.length > 0) {
                clearInterval(check);
                const album = albums.find(a => a.id === albumId);
                if (album) openAlbum(album);
            }
        }, 100);
    }

    // ══════════════════════════════════════════════
    //  启动
    // ══════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
