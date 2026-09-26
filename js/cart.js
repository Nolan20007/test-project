// ============================================
// Общие функции корзины и toast-уведомлений
// Файл: js/cart.js
// ============================================

function getCartConfig() {
    if (typeof window.CONFIG === 'object' && window.CONFIG.CART_STORAGE_KEY) {
        return window.CONFIG;
    }
    return {
        CART_STORAGE_KEY: 'kolodets_cart_v1',
        GOOGLE_SCRIPT_URL: '',
        WEB3FORMS_KEY: ''
    };
}

// === TOAST-УВЕДОМЛЕНИЯ ===

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

// === УТИЛИТЫ БЕЗОПАСНОСТИ ===

function sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[<>&"'\/\\]/g, '');
}

// === КОРЗИНА ===

function loadCart() {
    try {
        const config = getCartConfig();
        const cartString = localStorage.getItem(config.CART_STORAGE_KEY) || '{}';
        const cart = JSON.parse(cartString);

        if (typeof cart !== 'object') return {};

        Object.keys(cart).forEach(key => {
            if (!cart[key] || typeof cart[key] !== 'object' ||
                !cart[key].id || !cart[key].name ||
                typeof cart[key].quantity !== 'number' ||
                typeof cart[key].price !== 'number') {
                delete cart[key];
            }
        });

        return cart;
    } catch (e) {
        console.error("Ошибка при загрузке корзины:", e);
        return {};
    }
}

function saveCart(cart) {
    try {
        const config = getCartConfig();

        const validCart = {};
        Object.keys(cart).forEach(key => {
            const item = cart[key];
            if (item && item.id && item.name &&
                typeof item.quantity === 'number' && item.quantity > 0 &&
                typeof item.price === 'number' && item.price >= 0) {
                validCart[key] = item;
            }
        });

        localStorage.setItem(config.CART_STORAGE_KEY, JSON.stringify(validCart));
        updateCartCounters(validCart);

        return true;
    } catch (e) {
        console.error("Ошибка сохранения корзины:", e);
        showToast('Ошибка сохранения корзины. Проверьте настройки браузера.', 'error');
        return false;
    }
}

// === ОТОБРАЖЕНИЕ СЧЁТЧИКОВ ===

function updateCartCounters(cart) {
    let totalQuantity = 0;
    for (const itemId in cart) {
        if (cart.hasOwnProperty(itemId)) {
            totalQuantity += parseInt(cart[itemId].quantity) || 0;
        }
    }

    const counterIds = ['cart-count', 'cart-count-page', 'cart-count-summary'];
    counterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = totalQuantity;
    });
}

// === ДОБАВЛЕНИЕ ТОВАРА В КОРЗИНУ ===

function addItemToCart(id, name, quantity, price, length, weight) {
    try {
        if (!id || !name || quantity <= 0 || price < 0) {
            throw new Error('Невалидные данные товара');
        }

        const cart = loadCart();
        const safeLength = length || '';
        const safeWeight = weight || '';

        if (cart[id]) {
            cart[id].quantity += quantity;
            if (cart[id].quantity > 999) cart[id].quantity = 999;
            if (safeLength && !cart[id].length) cart[id].length = safeLength;
            if (safeWeight && !cart[id].weight) cart[id].weight = safeWeight;
            if (saveCart(cart)) {
                showToast(`Товар уже в корзине. Теперь: ${cart[id].quantity} шт.`, 'success');
            }
        } else {
            cart[id] = {
                id: id,
                name: name,
                length: safeLength,
                weight: safeWeight,
                quantity: quantity,
                price: price
            };
            if (saveCart(cart)) {
                showToast(`Добавлено в корзину: ${quantity} шт. ${name}`, 'success');
            }
        }
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        showToast('Произошла ошибка при добавлении товара в корзину', 'error');
    }
}

// === ИЗМЕНЕНИЕ КОЛИЧЕСТВА ===

function changeQuantity(id, delta) {
    const quantityInput = document.getElementById(id + '-qty');
    if (!quantityInput) return;

    let currentQuantity = parseInt(quantityInput.value) || 1;
    let newQuantity = currentQuantity + delta;

    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 99) newQuantity = 99;

    quantityInput.value = newQuantity;

    const cart = loadCart();
    if (cart[id]) {
        cart[id].quantity = newQuantity;
        saveCart(cart);
    }
}

// === ИНИЦИАЛИЗАЦИЯ КНОПОК КОРЗИНЫ НА СТРАНИЦЕ ===

function initializeCartButtons() {
    document.querySelectorAll('.cart-button').forEach(button => {
        if (button.dataset.cartInit === 'true') return;
        button.dataset.cartInit = 'true';

        button.addEventListener('click', function () {
            const itemId = sanitizeInput(this.getAttribute('data-item-id'));
            const itemName = sanitizeInput(this.getAttribute('data-item-name'));
            const itemLength = sanitizeInput(this.getAttribute('data-item-length') || '');
            const itemWeight = sanitizeInput(this.getAttribute('data-item-weight') || '');
            const quantityInput = document.getElementById(itemId + '-qty');

            if (!quantityInput) {
                console.error('Не найден элемент количества для товара:', itemId);
                return;
            }

            const quantity = parseInt(quantityInput.value) || 1;
            const price = parseFloat(quantityInput.getAttribute('data-price')) || 0;

            addItemToCart(itemId, itemName, quantity, price, itemLength, itemWeight);
        });
    });

    document.querySelectorAll('.nomenclature-table input[type="number"]').forEach(input => {
        if (input.dataset.cartInit === 'true') return;
        input.dataset.cartInit = 'true';

        input.addEventListener('change', function () {
            let val = parseInt(this.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 99) val = 99;
            this.value = val;

            const itemId = this.id.replace('-qty', '');
            const cart = loadCart();
            if (cart[itemId]) {
                cart[itemId].quantity = val;
                saveCart(cart);
            }
        });
    });
}

// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===

document.addEventListener('DOMContentLoaded', function () {
    const initialCart = loadCart();
    updateCartCounters(initialCart);
});

window.addEventListener('storage', function () {
    const cart = loadCart();
    updateCartCounters(cart);
});

// === ГЛОБАЛЬНЫЙ ДОСТУП ===
window.showToast = showToast;
window.loadCart = loadCart;
window.saveCart = saveCart;
window.addItemToCart = addItemToCart;
window.changeQuantity = changeQuantity;
window.initializeCartButtons = initializeCartButtons;
window.updateCartCounters = updateCartCounters;
window.sanitizeInput = sanitizeInput;