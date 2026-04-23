/**
 * 简单密码保护编辑系统
 * 密码统一为：2025
 */

const EDIT_PASSWORD = '2025';
let isEditingMode = false;

// 密码验证
function checkEditPassword() {
    const password = document.getElementById('editPasswordInput')?.value.trim();
    if (password === EDIT_PASSWORD) {
        closePasswordModal();
        enableEditingMode();
        showToast('编辑模式已开启 💕', 'success');
    } else {
        showToast('密码错误，请再试一次', 'error');
        const input = document.getElementById('editPasswordInput');
        if (input) {
            input.value = '';
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        }
    }
}

// 打开密码输入框
function openPasswordModal() {
    let modal = document.getElementById('editPasswordModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editPasswordModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="edit-password-modal">
                <div class="modal-icon">🔐</div>
                <h3>输入编辑密码</h3>
                <p class="modal-desc">请输入编辑密码进入编辑模式</p>
                <input type="password" id="editPasswordInput" placeholder="请输入密码..." maxlength="20" autocomplete="off">
                <div class="error-msg hidden" id="editPasswordError">密码错误</div>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="closePasswordModal()">取消</button>
                    <button class="btn-confirm" onclick="checkEditPassword()">确认</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 回车确认
        document.getElementById('editPasswordInput')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') checkEditPassword();
        });
    }
    modal.classList.add('open');
    document.getElementById('editPasswordInput')?.focus();
}

// 关闭密码框
function closePasswordModal() {
    const modal = document.getElementById('editPasswordModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

// 开启编辑模式
function enableEditingMode() {
    isEditingMode = true;
    document.body.classList.add('editing-mode');
    
    // 显示编辑按钮
    document.querySelectorAll('.edit-toggle-btn').forEach(btn => {
        btn.classList.remove('hidden');
    });
    
    // 显示添加按钮
    document.querySelectorAll('.add-item-btn').forEach(btn => {
        btn.classList.remove('hidden');
    });
}

// 关闭编辑模式
function disableEditingMode() {
    isEditingMode = false;
    document.body.classList.remove('editing-mode');
    
    // 隐藏编辑按钮
    document.querySelectorAll('.edit-toggle-btn').forEach(btn => {
        btn.classList.add('hidden');
    });
    
    // 隐藏添加按钮
    document.querySelectorAll('.add-item-btn').forEach(btn => {
        btn.classList.add('hidden');
    });
}

// 编辑开关按钮
function toggleEditMode() {
    if (isEditingMode) {
        disableEditingMode();
        showToast('已退出编辑模式');
    } else {
        openPasswordModal();
    }
}

// Toast 提示
function showToast(message, type = '') {
    let toast = document.querySelector('.toast:not(.persistent)');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast ' + type;
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// 确认对话框
function showConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = `
        <div class="confirm-modal">
            <p class="confirm-message">${message}</p>
            <div class="confirm-buttons">
                <button class="btn-cancel" onclick="this.closest('.modal-overlay').remove()">取消</button>
                <button class="btn-danger" onclick="this.closest('.modal-overlay').remove(); (${onConfirm})()">确认删除</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

// 初始化编辑按钮
function initEditButtons() {
    const existingBtn = document.getElementById('editBtn');
    if (existingBtn) {
        existingBtn.addEventListener('click', () => {
            if (isEditingMode) {
                disableEditingMode();
            } else {
                openPasswordModal();
            }
        });
    }
}

// 页面加载完成后初始化
function doInit() {
    initEditButtons();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doInit);
} else {
    doInit();
}
