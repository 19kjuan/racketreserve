class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }

        // Setup login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Check auth on admin page load
        this.checkAuth();
    }

    // Credentials for the trainer
    getTrainerCredentials() {
        return {
            email: 'jesusdaza@racketreserve.com',
            password: 'Jesus123',
            name: 'Jesús Daza',
            role: 'trainer'
        };
    }

    handleLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Get trainer credentials
        const validCredentials = this.getTrainerCredentials();

        if (email === validCredentials.email && password === validCredentials.password) {
            // Successful login
            this.currentUser = {
                email: validCredentials.email,
                name: validCredentials.name,
                role: validCredentials.role,
                loginTime: new Date().toISOString()
            };

            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            // Show success message
            this.showNotification('¡Bienvenido ' + validCredentials.name + '!', 'success');

            // Redirect to admin panel
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        } else {
            // Failed login
            this.showNotification('Credenciales incorrectas. Por favor intenta nuevamente.', 'error');
            
            // Clear password field
            document.getElementById('password').value = '';
            
            // Shake animation for form
            const form = document.getElementById('loginForm');
            form.classList.add('shake');
            setTimeout(() => {
                form.classList.remove('shake');
            }, 500);
        }
    }

    checkAuth() {
        // If on admin page and not logged in, redirect to login
        if (window.location.pathname.includes('admin.html') && !this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    }

    isLoggedIn() {
        return this.currentUser !== null && this.currentUser.role === 'trainer';
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showNotification('Sesión cerrada correctamente', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Add shake animation to CSS
const shakeStyles = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
`;

// Inject shake styles
const styleSheet = document.createElement('style');
styleSheet.textContent = shakeStyles;
document.head.appendChild(styleSheet);

// Initialize auth system
const auth = new AuthSystem();

// Make logout function globally available
function logout() {
    auth.logout();
}

// Make auth available globally for other scripts
window.auth = auth;
