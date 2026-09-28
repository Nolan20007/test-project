(function() {
    'use strict';

    const CONFIG = {
        GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxdYce6Fb2ZPnUxce-kzxi2XAmNLTB7YdZlCZkmhvgymIwNyGcT5O4xB3FRhxPGaL31/exec',
        WEB3FORMS_KEY: '2bbcdc46-5397-4fa1-b7ca-4947bceb267b'
    };

    // ============ УТИЛИТЫ ============

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

    // ============ МОДАЛКА ============

    function ensureModal() {
        let modal = document.getElementById('customOrderModal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'customOrderModal';
        modal.className = 'quote-modal';
        modal.innerHTML = `
            <div class="quote-modal-content" onclick="event.stopPropagation()">
                <span class="quote-close" onclick="closeCustomOrderModal()">&times;</span>
                <h3>Заказать изготовление</h3>
                <p class="quote-desc">
                    Изготовим стремянку, лестницу или любую металлоконструкцию по вашему ТЗ.
                    Опишите задачу — ответим с расчётом в течение рабочего дня.
                </p>

                <form id="customOrderForm">
                    <input type="text" id="customOrderName" placeholder="Ваше имя" required maxlength="100">
                    <input type="text" id="customOrderContact" placeholder="Телефон, Email или Telegram (@username)" required maxlength="100">
                    <textarea id="customOrderDesc" placeholder="Опишите, что нужно изготовить: размеры, материал, назначение" rows="4" required maxlength="700"></textarea>
                    <p style="font-size: 0.85em; color: #888; margin: 0 0 15px; line-height: 1.4;">
                        📎 Чертёж, фото или ТЗ пришлите на почту
                        <a href="mailto:stremyanki-dlya-kolodcev@mail.ru" style="color: var(--primary-color); font-weight: 500;">stremyanki-dlya-kolodcev@mail.ru</a>
                    </p>
                    <button type="submit">Отправить запрос</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    // ============ ОТКРЫТИЕ / ЗАКРЫТИЕ ============

    window.openCustomOrderModal = function() {
        ensureModal();
        document.getElementById('customOrderModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    window.closeCustomOrderModal = function(e) {
        if (e && e.target !== e.currentTarget && e.type === 'click') return;
        const modal = document.getElementById('customOrderModal');
        if (modal) modal.classList.remove('show');
        document.body.style.overflow = '';
    };

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') window.closeCustomOrderModal();
    });

    // ============ ОТПРАВКА ФОРМЫ ============

    document.addEventListener('DOMContentLoaded', function() {
        const modal = ensureModal();

        modal.addEventListener('click', function(e) {
            if (e.target === modal) window.closeCustomOrderModal();
        });

        const form = document.getElementById('customOrderForm');
        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = sanitizeInput(document.getElementById('customOrderName').value);
            const contact = sanitizeInput(document.getElementById('customOrderContact').value);
            const desc = sanitizeInput(document.getElementById('customOrderDesc').value);

            if (!name || name.length < 2) {
                showToast('Пожалуйста, введите корректное имя', 'error');
                return;
            }
            if (!validateContact(contact)) {
                showToast('Пожалуйста, введите корректный контакт', 'error');
                return;
            }
            if (!desc || desc.length < 5) {
                showToast('Опишите задачу подробнее (минимум 5 символов)', 'error');
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            // === Сборка текста сообщения ===
            let body = `🛠 ЗАЯВКА НА НЕСТАНДАРТНОЕ ИЗДЕЛИЕ\n\n`;
            body += `👤 Имя: ${name}\n`;
            body += `📞 Контакт: ${contact}\n`;
            body += `📝 Описание задачи:\n${desc}`;

            // === 1. Telegram через Google Apps Script ===
            const telegramPromise = fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'custom_order',
                    name: name,
                    phone: contact,
                    message: desc,
                    source: 'Нестандартное изделие'
                })
            }).catch(err => console.warn('TG ошибка:', err));

            // === 2. Почта через Web3Forms ===
            const mailData = new FormData();
            mailData.append('access_key', CONFIG.WEB3FORMS_KEY);
            mailData.append('subject', 'Заявка на нестандартное изделие — stremyanki-dlya-kolodcev.ru');
            mailData.append('from_name', 'Сайт лестниц для колодцев');
            mailData.append('name', name);
            mailData.append('contact', contact);
            mailData.append('message', desc);
            mailData.append('source', 'Нестандартное изделие');

            const mailPromise = fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: mailData
            }).catch(err => console.warn('Mail ошибка:', err));

            await Promise.allSettled([telegramPromise, mailPromise]);

            showToast('✅ Заявка отправлена! Менеджер свяжется с вами.', 'success');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            window.closeCustomOrderModal();
        });
    });
})();