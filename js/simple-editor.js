/**
 * 简单密码保护编辑模块
 * 输入网站密码即可编辑内容
 */

const SimpleEditor = (function() {
    const SITE_PASSWORD = '2025';
    const EDIT_MODE_KEY = 'edit_mode';

    // 检查是否已进入编辑模式
    function isEditMode() {
        const mode = localStorage.getItem(EDIT_MODE_KEY);
        if (!mode) return false;
        // 编辑模式 2 小时过期
        return Date.now() - parseInt(mode) < 2 * 60 * 60 * 1000;
    }

    // 验证密码并进入编辑模式
    function enterEditMode(password) {
        if (password !== SITE_PASSWORD) {
            return { success: false, error: '密码错误' };
        }
        localStorage.setItem(EDIT_MODE_KEY, Date.now().toString());
        return { success: true };
    }

    // 退出编辑模式
    function exitEditMode() {
        localStorage.removeItem(EDIT_MODE_KEY);
    }

    // 显示密码验证弹窗
    function showPasswordModal(onSuccess) {
        const modal = document.createElement('div');
        modal.id = 'editPasswordModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content edit-password-modal">
                <div class="modal-icon">🔐</div>
                <h3>输入密码解锁编辑</h3>
                <p class="modal-desc">请输入网站密码</p>
                <input type="password" id="editPasswordInput" placeholder="输入密码" autofocus />
                <p class="error-msg" id="passwordError" style="display: none;">密码错误，请重试</p>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="SimpleEditor.closeModal()">取消</button>
                    <button class="btn-confirm" onclick="SimpleEditor.handlePassword()">确认</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 保存回调
        modal.dataset.callback = 'onSuccess';

        // 绑定 Enter 键
        const input = document.getElementById('editPasswordInput');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                SimpleEditor.handlePassword();
            }
        });

        // 点击遮罩关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) SimpleEditor.closeModal();
        });

        // 自动聚焦
        setTimeout(() => input.focus(), 100);
    }

    // 处理密码验证
    function handlePassword() {
        const input = document.getElementById('editPasswordInput');
        const error = document.getElementById('passwordError');
        const password = input.value;

        if (password === SITE_PASSWORD) {
            localStorage.setItem(EDIT_MODE_KEY, Date.now().toString());
            SimpleEditor.closeModal();
            // 刷新页面以显示编辑按钮
            location.reload();
        } else {
            error.style.display = 'block';
            input.value = '';
            input.focus();
        }
    }

    // 关闭弹窗
    function closeModal() {
        const modal = document.getElementById('editPasswordModal');
        if (modal) modal.remove();
    }

    // 渲染管理入口（可选）
    function renderEntry(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (isEditMode()) {
            container.innerHTML = `
                <button class="admin-mini-btn active" onclick="SimpleEditor.exitAndReload()" title="退出编辑">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                </button>
            `;
        }
    }

    // 退出并刷新
    function exitAndReload() {
        exitEditMode();
        location.reload();
    }

    // 显示编辑按钮（检查权限）
    function showEditButton(element, onClick) {
        if (!isEditMode()) {
            // 未授权时，点击触发密码验证
            element.style.cursor = 'pointer';
            element.addEventListener('click', function handler(e) {
                e.stopPropagation();
                showPasswordModal(() => {
                    location.reload();
                });
            }, { once: true });
            return;
        }
        // 已授权，显示编辑按钮
        const btn = document.createElement('button');
        btn.className = 'edit-btn';
        btn.innerHTML = '✏️';
        btn.onclick = (e) => {
            e.stopPropagation();
            onClick();
        };
        element.style.position = 'relative';
        element.appendChild(btn);
    }

    // 显示添加按钮
    function showAddButton(containerId, onClick) {
        if (!isEditMode()) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        const btn = document.createElement('button');
        btn.className = 'add-btn';
        btn.innerHTML = '+';
        btn.onclick = onClick;
        container.appendChild(btn);
    }

    // 添加删除按钮
    function attachDeleteButton(element, onDelete) {
        if (!isEditMode()) return;

        const btn = document.createElement('button');
        btn.className = 'delete-btn';
        btn.innerHTML = '×';
        btn.onclick = (e) => {
            e.stopPropagation();
            onDelete();
        };
        element.style.position = 'relative';
        element.appendChild(btn);
    }

    // 显示提示
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    return {
        isEditMode,
        enterEditMode,
        exitEditMode,
        showPasswordModal,
        handlePassword,
        closeModal,
        renderEntry,
        exitAndReload,
        showEditButton,
        showAddButton,
        attachDeleteButton,
        showToast
    };
})();

// 导出到全局
window.SimpleEditor = SimpleEditor;