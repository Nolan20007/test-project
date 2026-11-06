/* ============================================================
   ДОСТУПНОСТЬ МОДАЛЬНЫХ ОКОН
   Управление фокусом и клавиатурой для галереи товаров.
   ============================================================ */

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
            if (typeof window.closeModal === 'function') window.closeModal();
            return;
        }

        if (e.key === 'Tab') {
            const focusable = getFocusable();
            if (focusable.length === 0) return;

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

    return {
        open() {
            if (isOpen || !modalEl) return;

            isOpen = true;
            lastFocused = document.activeElement;
            document.addEventListener('keydown', handleKeydown, true);

            backgroundSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(element => {
                    element.setAttribute('aria-hidden', 'true');
                });
            });

            setTimeout(() => {
                let target = null;

                if (initialFocusSelector) {
                    target = modalEl.querySelector(initialFocusSelector);
                }

                if (!target) {
                    target = getFocusable()[0];
                }

                if (target && typeof target.focus === 'function') {
                    target.focus();
                }
            }, 50);
        },

        close() {
            if (!isOpen) return;

            isOpen = false;
            document.removeEventListener('keydown', handleKeydown, true);

            backgroundSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(element => {
                    element.removeAttribute('aria-hidden');
                });
            });

            if (lastFocused && typeof lastFocused.focus === 'function') {
                lastFocused.focus();
            }

            lastFocused = null;
        }
    };
}
