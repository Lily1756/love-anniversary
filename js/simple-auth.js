/**
 * =============================================
 * 简单内容管理认证模块
 * =============================================
 * 
 * 【功能说明】
 * - 网站密码验证（密码：2025）
 * - GitHub PAT (Personal Access Token) 存储
 * - 24小时管理模式过期
 * - 管理面板 UI 渲染
 * 
 * 【使用方式】
 * 1. 引入本模块：<script src="js/simple-auth.js"></script>
 * 2. 渲染登录按钮：SimpleAuth.renderAdminEntry('containerId')
 * 3. 检查登录状态：SimpleAuth.isAdminMode()
 * 4. 获取 PAT：SimpleAuth.getPat()
 * 
 * 【依赖】
 * - localStorage（存储 PAT 和登录状态）
 */

const SimpleAuth = (function() {
    // ========== 配置常量 ==========
    const SITE_PASSWORD = '2025';  // 网站编辑密码
    const PAT_KEY = 'github_pat';        // localStorage key: GitHub PAT
    const ADMIN_MODE_KEY = 'admin_mode'; // localStorage key: 管理员模式时间戳
    const ADMIN_EXPIRE_MS = 24 * 60 * 60 * 1000; // 管理模式 24 小时过期
    const SITE_PASSWORD = '2025';  // 网站密码
    const PAT_KEY = 'github_pat';
    const ADMIN_MODE_KEY = 'admin_mode';

    // 验证网站密码
    function verifyPassword(password) {
        return password === SITE_PASSWORD;
    }

    // 检查是否已设置 PAT
    function hasPat() {
        return !!localStorage.getItem(PAT_KEY);
    }

    // 获取 PAT
    function getPat() {
        return localStorage.getItem(PAT_KEY);
    }

    // 保存 PAT
    function savePat(pat) {
        localStorage.setItem(PAT_KEY, pat.trim());
        localStorage.setItem(ADMIN_MODE_KEY, Date.now().toString());
        return true;
    }

    // 检查管理权限（密码验证后）
    function isAdminMode() {
        const mode = localStorage.getItem(ADMIN_MODE_KEY);
        if (!mode) return false;
        // 管理模式 24 小时过期
        return Date.now() - parseInt(mode) < 24 * 60 * 60 * 1000;
    }

    // 进入管理模式
    function enterAdminMode(password, pat) {
        if (!verifyPassword(password)) {
            return { success: false, error: '密码错误' };
        }
        // PAT 可选：如果提供了就保存，不提供也能进入编辑模式（依赖 Cloudflare Function）
        if (pat && pat.trim().length >= 10) {
            savePat(pat);
        }
        localStorage.setItem(ADMIN_MODE_KEY, Date.now().toString());
        return { success: true };
    }

    // 退出管理模式
    function exitAdminMode() {
        localStorage.removeItem(ADMIN_MODE_KEY);
    }

    // 验证 PAT 是否有效（异步）
    async function validatePat(pat) {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${pat}`,
                    'Accept': 'application/vnd.github+json'
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    // 渲染管理入口按钮
    function renderAdminEntry(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (isAdminMode()) {
            // 已进入管理模式，显示小图标
            container.innerHTML = `
                <button class="admin-mini-btn" onclick="SimpleAuth.showAdminPanel()" title="内容管理">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                </button>
            `;
        } else {
            // 未登录，显示小锁图标
            container.innerHTML = `
                <button class="admin-mini-btn" onclick="SimpleAuth.showLoginModal()" title="内容管理">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </button>
            `;
        }
    }

    // 显示登录弹窗
    function showLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'adminLoginModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content admin-modal">
                <h3>🔐 内容管理</h3>
                <p class="modal-desc">输入密码和 GitHub PAT 开始管理</p>

                <div class="form-group">
                    <label>网站密码</label>
                    <input type="password" id="adminPassword" placeholder="输入密码" />
                </div>

                <div class="form-group">
                    <label>GitHub PAT <span style="color:#999;font-weight:normal">（可选）</span></label>
                    <input type="password" id="adminPat" placeholder="不填则使用云端代理保存" />
                    <small>留空时数据通过 Cloudflare Function 保存，无需配置 Token</small>
                </div>

                <div class="modal-actions">
                    <button class="btn-cancel" onclick="SimpleAuth.closeModal()">取消</button>
                    <button class="btn-confirm" onclick="SimpleAuth.handleLogin()">确认</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 添加样式
        if (!document.getElementById('adminModalStyle')) {
            const style = document.createElement('style');
            style.id = 'adminModalStyle';
            style.textContent = `
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex;
                    align-items: center; justify-content: center;
                    z-index: 9999;
                }
                .admin-modal {
                    background: white; border-radius: 16px; padding: 24px;
                    width: 90%; max-width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                .admin-modal h3 { margin: 0 0 8px; color: #333; text-align: center; }
                .modal-desc { color: #666; font-size: 14px; text-align: center; margin-bottom: 20px; }
                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; margin-bottom: 6px; color: #555; font-size: 14px; font-weight: 500; }
                .form-group input {
                    width: 100%; padding: 10px 12px; border: 1px solid #ddd;
                    border-radius: 8px; font-size: 14px; box-sizing: border-box;
                }
                .form-group input:focus { outline: none; border-color: #e8b4b8; }
                .form-group small { display: block; margin-top: 4px; color: #999; font-size: 12px; }
                .modal-actions { display: flex; gap: 12px; margin-top: 20px; }
                .btn-cancel, .btn-confirm {
                    flex: 1; padding: 10px; border-radius: 8px; border: none;
                    font-size: 14px; cursor: pointer; transition: all 0.2s;
                }
                .btn-cancel { background: #f0f0f0; color: #666; }
                .btn-cancel:hover { background: #e0e0e0; }
                .btn-confirm { background: linear-gradient(135deg, #e8b4b8, #d4a5a5); color: white; }
                .btn-confirm:hover { opacity: 0.9; transform: translateY(-1px); }
                .admin-mini-btn {
                    width: 36px; height: 36px; border-radius: 50%;
                    background: rgba(255,255,255,0.9); border: none;
                    cursor: pointer; display: flex; align-items: center;
                    justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transition: all 0.2s; color: #C4A8A2;
                }
                .admin-mini-btn:hover {
                    transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
            `;
            document.head.appendChild(style);
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // 处理登录
    async function handleLogin() {
        const password = document.getElementById('adminPassword').value;
        const pat = document.getElementById('adminPat').value;

        const result = enterAdminMode(password, pat);
        if (!result.success) {
            alert(result.error);
            return;
        }

        // 如果提供了 PAT，验证其有效性
        if (pat && pat.trim().length >= 10) {
            const isValid = await validatePat(pat);
            if (!isValid) {
                alert('GitHub PAT 无效，请检查后重新输入');
                return;
            }
        }

        closeModal();
        renderAdminEntry('adminEntry');
        showAdminPanel();
    }

    // 关闭弹窗
    function closeModal() {
        const modal = document.getElementById('adminLoginModal');
        if (modal) modal.remove();
    }

    // 显示管理面板（触发内容编辑功能）
    function showAdminPanel() {
        // 触发各个页面的编辑功能
        if (typeof window.showEditButtons === 'function') {
            window.showEditButtons();
        }
        // 发送全局事件
        window.dispatchEvent(new CustomEvent('adminModeChanged', { detail: { isAdmin: true } }));
        alert('已进入编辑模式，点击内容旁边的 ✏️ 按钮即可编辑');
    }

    // 监听其他页面状态变化
    function listenAdminModeChange(callback) {
        window.addEventListener('adminModeChanged', (e) => {
            callback(e.detail.isAdmin);
        });
    }

    return {
        hasPat,
        getPat,
        isAdminMode,
        enterAdminMode,
        exitAdminMode,
        renderAdminEntry,
        showLoginModal,
        closeModal,
        showAdminPanel,
        listenAdminModeChange
    };
})();

// 导出到全局
window.SimpleAuth = SimpleAuth;
