// Общие утилиты для всего сайта

// Toast-уведомления
function showToast(message, type = 'success', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Очистка ввода
function sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[<>&"'\/\\]/g, '');
}

// Валидация телефона/контакта
function validatePhone(phone) {
    return /^[\d\s\-\+\(\)@\.a-zA-Z]{5,50}$/.test(phone);
}

// Валидация email
function validateEmail(email) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Работа с корзиной
function getCart() {
    try {
        const cartData = localStorage.getItem(window.CONFIG.CART_STORAGE_KEY);
        return JSON.parse(cartData) || {};
    } catch (e) { return {}; }
}

function updateCartCountDisplay() {
    const cart = getCart();
    let totalCount = 0;
    for (const itemId in cart) {
        if (cart.hasOwnProperty(itemId) && cart[itemId] && typeof cart[itemId].quantity === 'number') {
            totalCount += parseInt(cart[itemId].quantity) || 0;
        }
    }
    const countElement = document.getElementById('cart-count-page');
    if (countElement) countElement.textContent = totalCount;
}

// Автозапуск счётчика
document.addEventListener('DOMContentLoaded', updateCartCountDisplay);
window.addEventListener('storage', updateCartCountDisplay);