(function() {
    'use strict';

    const CONFIG = {
        GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxdYce6Fb2ZPnUxce-kzxi2XAmNLTB7YdZlCZkmhvgymIwNyGcT5O4xB3FRhxPGaL31/exec',
        WEB3FORMS_KEY: '2bbcdc46-5397-4fa1-b7ca-4947bceb267b'
    };

    function sanitizeInput(text) {
        if (typeof text !== 'string') return '';
        return text.replace(/[<>&"'\/\\]/g, '');
    }

    function validateContact(value) {
        return /^[\d\s\-\+\(\)@\.a-zA-Z_]{5,100}$/.test(value);
    }

    function showToast(message, type = 'success') {
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
        }, 3500);
    }

    function ensureModal() {
        let modal = document.getElementById('callbackModal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'callbackModal';
        modal.className = 'quote-modal'; // Используем стили от окна КП
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="quote-modal-content" onclick="event.stopPropagation()">
                <span class="quote-close" role="button" tabindex="0" aria-label="Закрыть окно" onclick="closeCallbackModal()">&times;</span>
                <h3>Заказать звонок</h3>
                <p class="quote-desc">Оставьте ваш номер, и мы перезвоним в ближайшее время.</p>

                <form id="callbackForm">
                    <label for="callbackName" class="visually-hidden">Ваше имя</label>
                    <input type="text" id="callbackName" placeholder="Ваше имя" required maxlength="100" aria-required="true">

                    <label for="callbackPhone" class="visually-hidden">Телефон, Email или Telegram</label>
                    <input type="text" id="callbackPhone" placeholder="Телефон, Email или Telegram (@username)" required maxlength="100" aria-required="true">

                    <label for="callbackMessage" class="visually-hidden">Комментарий (необязательно)</label>
                    <textarea id="callbackMessage" placeholder="Удобное время для звонка или ваш вопрос" rows="3" maxlength="500"></textarea>

                    <button type="submit">Жду звонка</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    window.openCallbackModal = function() {
        ensureModal();
        document.getElementById('callbackModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    window.closeCallbackModal = function() {
        const modal = document.getElementById('callbackModal');
        if (modal) modal.classList.remove('show');
        document.body.style.overflow = '';
    };

    document.addEventListener('DOMContentLoaded', function() {
        const modal = ensureModal();
        modal.addEventListener('click', function(e) {
            if (e.target === modal) window.closeCallbackModal();
        });

        const form = document.getElementById('callbackForm');
        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = sanitizeInput(document.getElementById('callbackName').value);
            const phone = sanitizeInput(document.getElementById('callbackPhone').value);
            const message = sanitizeInput(document.getElementById('callbackMessage').value);

            if (!name || name.length < 2) {
                showToast('Введите корректное имя', 'error');
                return;
            }
            if (!validateContact(phone)) {
                showToast('Введите корректный контакт', 'error');
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            // Отправка в Telegram
            const telegramPromise = fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'callback', name, phone, message,
                    source: 'Модальное окно звонка'
                })
            }).catch(err => console.warn('TG ошибка:', err));

            // Отправка на почту
            let prettyMessage = `📞 ЗАКАЗ ЗВОНКА\n\n👤 Имя: ${name}\n📞 Контакт: ${phone}\n💬 Сообщение: ${message || 'Нет'}`;
            const mailData = new FormData();
            mailData.append('access_key', CONFIG.WEB3FORMS_KEY);
            mailData.append('subject', 'Заказ звонка — stremyanki-dlya-kolodcev.ru');
            mailData.append('from_name', 'Сайт лестниц для колодцев');
            mailData.append('form_data', prettyMessage);

            const mailPromise = fetch('https://api.web3forms.com/submit', {
                method: 'POST', body: mailData
            }).catch(err => console.warn('Mail ошибка:', err));

            try {
                await Promise.allSettled([telegramPromise, mailPromise]);
                showToast('Спасибо! Мы скоро перезвоним.', 'success', 4000);
                this.reset();
                window.closeCallbackModal();
            } catch (error) {
                showToast('❌ Ошибка. Позвоните нам: +7 (965) 555-99-66', 'error', 5000);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    });
})();