/* =========================================================
   utils.js — общие утилиты для всех страниц сайта
   ========================================================= */

/* ---------- Toast ---------- */
function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    toast.style.cssText = 'padding:12px 20px;border-radius:8px;color:#fff;font-family:inherit;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);opacity:0;transition:opacity 0.3s;';
    if (type === 'success') toast.style.background = '#4CAF50';
    else if (type === 'error') toast.style.background = '#dc3545';
    else if (type === 'warning') toast.style.background = '#ff9900';
    else toast.style.background = '#0e5c80';
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/* ---------- Санитайз ---------- */
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>]/g, '').trim();
}

/* ---------- Валидация ---------- */
function validatePhone(phone) {
    if (!phone) return false;
    const cleaned = String(phone).replace(/[\s\-\(\)]/g, '');
    // минимум 5 символов, допускаем цифры, +, @, буквы (для Telegram)
    return /^[+0-9@a-zA-Z_\.]{5,}$/.test(cleaned);
}

function validateEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------- Корзина ---------- */
function getCart() {
    try {
        const key = (window.CONFIG && window.CONFIG.CART_STORAGE_KEY) || 'cart';
        const data = localStorage.getItem(key);
        return JSON.parse(data) || {};
    } catch (e) {
        return {};
    }
}

function updateCartCountDisplay() {
    const cart = getCart();
    let total = 0;
    for (const id in cart) {
        if (cart.hasOwnProperty(id) && cart[id] && typeof cart[id].quantity === 'number') {
            total += parseInt(cart[id].quantity) || 0;
        }
    }
    document.querySelectorAll('#cart-count-page, #cart-count-summary').forEach(el => {
        el.textContent = total;
    });
}

/* =========================================================
   A11Y: focus trap + возврат фокуса + aria-hidden на фон
   Шаг 3.3
   =========================================================

   Использование:
     const modalA11y = initModalA11y(document.getElementById('productModal'), {
         backgroundSelectors: ['header', 'nav', 'main', 'footer'],
         initialFocus: '.close-btn'
     });

     // В openModal():  modalA11y.open();
     // В closeModal(): modalA11y.close();
*/
function initModalA11y(modalEl, options = {}) {
    if (!modalEl) return { open() {}, close() {} };

    const opts = Object.assign({
        backgroundSelectors: ['header', 'nav', 'main', 'footer'],
        initialFocus: '.close-btn',
        trapFocus: true,
        restoreFocus: true
    }, options);

    let previouslyFocused = null;
    let isOpen = false;
    const hiddenEls = []; // { el, prevAriaHidden }

    const FOCUSABLE_SELECTOR = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    function getFocusable() {
        return Array.from(modalEl.querySelectorAll(FOCUSABLE_SELECTOR))
            .filter(el => {
                if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
                if (el.getAttribute('aria-hidden') === 'true') return false;
                return true;
            });
    }

    function hideBackground() {
        opts.backgroundSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (modalEl.contains(el)) return;
                hiddenEls.push({ el, prevAriaHidden: el.getAttribute('aria-hidden') });
                el.setAttribute('aria-hidden', 'true');
            });
        });
    }

    function restoreBackground() {
        hiddenEls.forEach(({ el, prevAriaHidden }) => {
            if (prevAriaHidden === null) el.removeAttribute('aria-hidden');
            else el.setAttribute('aria-hidden', prevAriaHidden);
        });
        hiddenEls.length = 0;
    }

    function onKeydown(e) {
        if (!isOpen) return;

        if (e.key === 'Escape') {
            // Обработка Esc — на усмотрение вызывающего кода (у нас уже есть свой listener).
            // Здесь ничего не делаем, чтобы не дублировать.
            return;
        }

        if (e.key !== 'Tab' || !opts.trapFocus) return;

        const focusables = getFocusable();
        if (focusables.length === 0) {
            e.preventDefault();
            return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
            // Shift+Tab
            if (active === first || !modalEl.contains(active)) {
                e.preventDefault();
                last.focus();
            }
        } else {
            // Tab
            if (active === last || !modalEl.contains(active)) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    function open() {
        if (isOpen) return;
        isOpen = true;
        previouslyFocused = document.activeElement;

        hideBackground();
        document.addEventListener('keydown', onKeydown, true);

        // Автофокус
        setTimeout(() => {
            let target = null;
            if (opts.initialFocus) {
                target = modalEl.querySelector(opts.initialFocus);
            }
            if (!target) {
                const focusables = getFocusable();
                target = focusables[0] || modalEl;
            }
            if (target && typeof target.focus === 'function') {
                target.focus();
            }
        }, 50);
    }

    function close() {
        if (!isOpen) return;
        isOpen = false;
        document.removeEventListener('keydown', onKeydown, true);
        restoreBackground();

        if (opts.restoreFocus && previouslyFocused && typeof previouslyFocused.focus === 'function') {
            try { previouslyFocused.focus(); } catch (e) {}
        }
        previouslyFocused = null;
    }

    return { open, close };
}

/* ---------- Автообновление счётчика корзины ---------- */
document.addEventListener('DOMContentLoaded', updateCartCountDisplay);
window.addEventListener('storage', updateCartCountDisplay);
