/**
 * 编辑 UI 模块
 * 生成内嵌编辑按钮和编辑面板
 */

const EditUI = (function() {
    // 显示编辑按钮（仅管理模式可见）
    function showEditButton(containerId, onClick) {
        if (!SimpleAuth.isAdminMode()) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        const btn = document.createElement('button');
        btn.className = 'edit-fab';
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
        `;
        btn.onclick = onClick;
        container.appendChild(btn);
    }

    // 显示添加按钮
    function showAddButton(containerId, onClick) {
        if (!SimpleAuth.isAdminMode()) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        const btn = document.createElement('button');
        btn.className = 'add-btn';
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>添加</span>
        `;
        btn.onclick = onClick;
        container.appendChild(btn);
    }

    // 显示删除按钮（悬停时）
    function attachDeleteButton(element, onDelete) {
        if (!SimpleAuth.isAdminMode()) return;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        `;
        deleteBtn.onclick = onDelete;

        element.style.position = 'relative';
        element.appendChild(deleteBtn);
    }

    // 打开编辑模态框
    function openEditModal(title, fields, onSave) {
        // 创建遮罩
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'edit-modal';

        let fieldsHtml = '';
        fields.forEach(field => {
            if (field.type === 'textarea') {
                fieldsHtml += `
                    <div class="form-group">
                        <label>${field.label}</label>
                        <textarea id="field-${field.name}" placeholder="${field.placeholder || ''}">${field.value || ''}</textarea>
                    </div>
                `;
            } else if (field.type === 'select') {
                const options = field.options.map(opt =>
                    `<option value="${opt.value}" ${opt.value === field.value ? 'selected' : ''}>${opt.label}</option>`
                ).join('');
                fieldsHtml += `
                    <div class="form-group">
                        <label>${field.label}</label>
                        <select id="field-${field.name}">${options}</select>
                    </div>
                `;
            } else {
                fieldsHtml += `
                    <div class="form-group">
                        <label>${field.label}</label>
                        <input type="${field.type || 'text'}" id="field-${field.name}" value="${field.value || ''}" placeholder="${field.placeholder || ''}">
                    </div>
                `;
            }
        });

        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="EditUI.closeModal(this)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                ${fieldsHtml}
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="EditUI.closeModal(this)">取消</button>
                <button class="btn-save">保存</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // 绑定保存事件
        modal.querySelector('.btn-save').onclick = () => {
            const data = {};
            fields.forEach(field => {
                const el = document.getElementById(`field-${field.name}`);
                data[field.name] = el.value;
            });
            onSave(data, overlay);
        };

        // 点击遮罩关闭
        overlay.onclick = (e) => {
            if (e.target === overlay) EditUI.closeModal(overlay);
        };

        // ESC 关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                EditUI.closeModal(overlay);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        return modal;
    }

    // 关闭模态框
    function closeModal(element) {
        const modal = element.closest('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    // 显示提示
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 确认对话框
    function confirm(message) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';

            overlay.innerHTML = `
                <div class="confirm-modal">
                    <p class="confirm-message">${message}</p>
                    <div class="confirm-buttons">
                        <button class="btn-cancel">取消</button>
                        <button class="btn-danger">确定</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            overlay.querySelector('.btn-cancel').onclick = () => {
                overlay.remove();
                resolve(false);
            };
            overlay.querySelector('.btn-danger').onclick = () => {
                overlay.remove();
                resolve(true);
            };
        });
    }

    return {
        showEditButton,
        showAddButton,
        attachDeleteButton,
        openEditModal,
        closeModal,
        showToast,
        confirm
    };
})();

// 导出到全局
window.EditUI = EditUI;
