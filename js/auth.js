/**
 * GitHub OAuth 认证模块
 * 处理 GitHub 登录、登出、状态检查
 */

const GitHubAuth = (function() {
    const GITHUB_CLIENT_ID = 'Ov23lij4nbbiTL51drs9';
    const AUTH_KEY = 'github_auth';
    const TOKEN_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24小时过期

    // 检查是否已登录
    function isLoggedIn() {
        const auth = getAuthData();
        if (!auth) return false;

        // 检查是否过期
        if (Date.now() - auth.loginTime > TOKEN_EXPIRE_TIME) {
            logout();
            return false;
        }

        return true;
    }

    // 获取认证数据
    function getAuthData() {
        try {
            const data = localStorage.getItem(AUTH_KEY);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    // 获取访问令牌
    function getAccessToken() {
        const auth = getAuthData();
        return auth ? auth.accessToken : null;
    }

    // 获取用户信息
    function getUser() {
        const auth = getAuthData();
        return auth ? auth.user : null;
    }

    // 登录 - 跳转到 GitHub 授权页面
    function login(redirectPage = window.location.pathname.split('/').pop() || 'index.html') {
        localStorage.setItem('oauth_source_page', redirectPage);

        const redirectUri = window.location.origin + '/auth.html';
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user&allow_signup=true`;

        window.location.href = githubAuthUrl;
    }

    // 登出
    function logout() {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem('isLoggedIn');
        localStorage.setItem('auth_status_changed', Date.now().toString());

        // 刷新页面更新UI
        window.location.reload();
    }

    // 渲染登录按钮
    function renderLoginButton(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (isLoggedIn()) {
            const user = getUser();
            container.innerHTML = `
                <div class="user-menu">
                    <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
                    <span class="user-name">${user.name}</span>
                    <button class="logout-btn" onclick="GitHubAuth.logout()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <button class="login-btn" onclick="GitHubAuth.login()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub 登录</span>
                </button>
            `;
        }
    }

    // 监听其他页面登录状态变化
    function listenAuthChange(callback) {
        let lastStatus = localStorage.getItem('auth_status_changed');

        // 轮询检查状态变化
        setInterval(() => {
            const currentStatus = localStorage.getItem('auth_status_changed');
            if (currentStatus !== lastStatus) {
                lastStatus = currentStatus;
                callback(isLoggedIn(), getUser());
            }
        }, 500);
    }

    return {
        isLoggedIn,
        getAuthData,
        getAccessToken,
        getUser,
        login,
        logout,
        renderLoginButton,
        listenAuthChange
    };
})();

// 导出到全局
window.GitHubAuth = GitHubAuth;
