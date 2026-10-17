/* ============================================================
   УТИЛИТЫ: общие функции для всего сайта
   ============================================================ */

/* === Санитайзер ввода === */
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/[<>]/g, '')          // убираем угловые скобки (XSS)
        .replace(/\s+/g, ' ')          // множественные пробелы → один
        .trim()
        .slice(0, 500);                // ограничиваем длину
}

/* === Валидация телефона / email / telegram === */
function validatePhone(value) {
    if (!value) return false;
    const v = String(value).trim();
    // Разрешаем:
    //  - телефон:  +7..., 8..., скобки, пробелы, дефисы
    //  - email:    name@domain.tld
    //  - telegram: @username
    const phoneRe = /^[\+]?[\d\s\-\(\)]{7,20}$/;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const tgRe    = /^@[A-Za-z0-9_]{3,32}$/;
    return phoneRe.test(v) || emailRe.test(v) || tgRe.test(v);
}

function validateEmail(value) {
    if (!value) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

/* === Подсветка невалидных полей === */
function setFieldInvalid(el, invalid) {
    if (!el) return;
    if (invalid) {
        el.setAttribute('aria-invalid', 'true');
    } else {
        el.removeAttribute('aria-invalid');
    }
}

function clearFormInvalid(form) {
    if (!form) return;
    form.querySelectorAll('[aria-invalid="true"]').forEach(el => {
        el.removeAttribute('aria-invalid');
    });
}

/* Авто-сброс aria-invalid при вводе */
function bindAutoClearInvalid(form) {
    if (!form) return;
    form.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => {
            if (el.getAttribute('aria-invalid') === 'true') {
                el.removeAttribute('aria-invalid');
            }
        });
    });
}

/* === Корзина: чтение / запись (единые для всех страниц) === */
function getCart() {
    try {
        const raw = localStorage.getItem(window.CONFIG && window.CONFIG.CART_STORAGE_KEY
            ? window.CONFIG.CART_STORAGE_KEY
            : 'cart');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.warn('Ошибка чтения корзины:', e);
        return {};
    }
}

function saveCart(cart) {
    try {
        const key = window.CONFIG && window.CONFIG.CART_STORAGE_KEY
            ? window.CONFIG.CART_STORAGE_KEY
            : 'cart';
        localStorage.setItem(key, JSON.stringify(cart));
        return true;
    } catch (e) {
        console.error('Ошибка сохранения корзины:', e);
        if (typeof showToast === 'function') {
            showToast('Ошибка сохранения корзины', 'error');
        }
        return false;
    }
}

/* === Счётчик корзины в шапке === */
function updateCartCountDisplay() {
    const cart = getCart();
    let totalCount = 0;
    for (const id in cart) {
        if (cart.hasOwnProperty(id) && cart[id] && typeof cart[id].quantity === 'number') {
            totalCount += parseInt(cart[id].quantity) || 0;
        }
    }
    const countEl = document.getElementById('cart-count-page');
    if (countEl) countEl.textContent = totalCount;
}

document.addEventListener('DOMContentLoaded', updateCartCountDisplay);
window.addEventListener('storage', updateCartCountDisplay);

/* === A11Y: focus-trap для модальных окон === */
function initModalA11y(modalEl, options) {
    options = options || {};
    const backgroundSelectors = options.backgroundSelectors || ['header', 'nav', 'main', 'footer'];
    const initialFocusSelector = options.initialFocus || null;

    let lastFocused = null;
    let isOpen = false;

    const focusableSelectors = [
        'a[href]', 'button:not([disabled])', 'input:not([disabled])',
        'select:not([disabled])', 'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    function getFocusable() {
        if (!modalEl) return [];
        return Array.from(modalEl.querySelectorAll(focusableSelectors))
            .filter(el => el.offsetParent !== null || el === document.activeElement);
    }

    function handleKeydown(e) {
        if (!isOpen) return;
        if (e.key === 'Escape') {
            // Закрываем — вызываем ту же функцию, что и клик по фону
            if (typeof window.closeModal === 'function') window.closeModal();
            return;
        }
        if (e.key === 'Tab') {
            const focusable = getFocusable();
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last  = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    return {
        open() {
            if (isOpen) return;
            isOpen = true;
            lastFocused = document.activeElement;
            document.addEventListener('keydown', handleKeydown, true);

            // Скрываем фон для скринридеров
            backgroundSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    el.setAttribute('aria-hidden', 'true');
                });
            });

            // Фокус на первый элемент
            setTimeout(() => {
                let target = null;
                if (initialFocusSelector) {
                    target = modalEl.querySelector(initialFocusSelector);
                }
                if (!target) {
                    const focusable = getFocusable();
                    target = focusable[0];
                }
                if (target && typeof target.focus === 'function') target.focus();
            }, 50);
        },
        close() {
            if (!isOpen) return;
            isOpen = false;
            document.removeEventListener('keydown', handleKeydown, true);

            backgroundSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    el.removeAttribute('aria-hidden');
                });
            });

            if (lastFocused && typeof lastFocused.focus === 'function') {
                lastFocused.focus();
            }
        }
    };
}

/* === ПЕРЕКЛЮЧАТЕЛЬ ДИАМЕТРА АРМАТУРЫ (Ø25 / Ø28) === */
/* Используется на страницах КЛ-1 (kl-1-... и price-list).
   Переключает видимость блоков #nomenclature-kl1-25 / #nomenclature-kl1-28
   и подсвечивает активную кнопку в .diameter-switch. */
function switchDiameter(containerId, btn) {
    // Скрываем все блоки с префиксом nomenclature-kl1-
    document.querySelectorAll('[id^="nomenclature-kl1-"]').forEach(el => {
        el.style.display = 'none';
    });
    // Показываем нужный
    const target = document.getElementById(containerId);
    if (target) target.style.display = '';
    // Переключаем активную кнопку
    document.querySelectorAll('.diameter-switch__btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

window.switchDiameter = switchDiameter;