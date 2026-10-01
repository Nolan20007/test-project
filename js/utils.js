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


/* === A11Y: aria-invalid helpers === */

/**
 * Помечает поле как невалидное или снимает метку.
 * @param {HTMLElement|string} fieldOrId — элемент или id
 * @param {boolean} isInvalid — true = ошибка, false = ок
 */
function setFieldInvalid(fieldOrId, isInvalid) {
    const el = typeof fieldOrId === 'string'
        ? document.getElementById(fieldOrId)
        : fieldOrId;
    if (!el) return;

    if (isInvalid) {
        el.setAttribute('aria-invalid', 'true');
    } else {
        el.removeAttribute('aria-invalid');
    }
}

/**
 * Снимает aria-invalid со всех полей формы.
 */
function clearFormInvalid(formEl) {
    if (!formEl) return;
    formEl.querySelectorAll('[aria-invalid]').forEach(el => {
        el.removeAttribute('aria-invalid');
    });
}

/**
 * Автоснятие aria-invalid при вводе — пользователь начал исправлять.
 */
function bindAutoClearInvalid(formEl) {
    if (!formEl) return;
    formEl.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => {
            if (el.getAttribute('aria-invalid') === 'true') {
                el.removeAttribute('aria-invalid');
            }
        });
    });
}


/* === A11Y: focus-trap для модальных окон === */

/**
 * Инициализирует доступность модального окна:
 * — фокус-трап внутри модалки
 * — возврат фокуса на элемент, который её открыл
 * — скрытие фонового контента от скринридеров (aria-hidden)
 * — блокировка скролла body
 * — закрытие по Esc
 *
 * @param {HTMLElement} modalEl — корневой элемент модалки
 * @param {Object} options
 * @param {string[]} [options.backgroundSelectors] — селекторы фоновых блоков
 * @param {string}   [options.initialFocus] — селектор элемента для автофокуса
 * @returns {{open: Function, close: Function}}
 */
function initModalA11y(modalEl, options = {}) {
    if (!modalEl) {
        return { open: () => {}, close: () => {} };
    }

    const backgroundSelectors = options.backgroundSelectors || [];
    const initialFocusSelector = options.initialFocus || null;

    const FOCUSABLE_SELECTOR = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    let lastFocusedEl = null;
    let isOpen = false;

    function getFocusable() {
        return Array.from(modalEl.querySelectorAll(FOCUSABLE_SELECTOR))
            .filter(el => el.offsetParent !== null || el === document.activeElement);
    }

    function handleKeydown(e) {
        if (!isOpen) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            api.close();
            return;
        }

        if (e.key === 'Tab') {
            const focusable = getFocusable();
            if (focusable.length === 0) {
                e.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    function hideBackground() {
        backgroundSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (!el.hasAttribute('data-a11y-prev-hidden')) {
                    el.setAttribute('data-a11y-prev-hidden',
                        el.getAttribute('aria-hidden') || '');
                }
                el.setAttribute('aria-hidden', 'true');
            });
        });
    }

    function restoreBackground() {
        document.querySelectorAll('[data-a11y-prev-hidden]').forEach(el => {
            const prev = el.getAttribute('data-a11y-prev-hidden');
            if (prev) {
                el.setAttribute('aria-hidden', prev);
            } else {
                el.removeAttribute('aria-hidden');
            }
            el.removeAttribute('data-a11y-prev-hidden');
        });
    }

    const api = {
        open() {
            if (isOpen) return;
            isOpen = true;

            lastFocusedEl = document.activeElement;

            hideBackground();
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeydown);

            // Автофокус
            setTimeout(() => {
                const target = initialFocusSelector
                    ? modalEl.querySelector(initialFocusSelector)
                    : null;
                if (target && typeof target.focus === 'function') {
                    target.focus();
                } else {
                    const focusable = getFocusable();
                    if (focusable.length > 0) focusable[0].focus();
                }
            }, 30);
        },

        close() {
            if (!isOpen) return;
            isOpen = false;

            restoreBackground();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeydown);

            // Возврат фокуса
            if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
                try { lastFocusedEl.focus(); } catch (e) {}
            }
            lastFocusedEl = null;
        }
    };

    return api;
}
