(function() {
    'use strict';

    const CONFIG = {
        GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxdYce6Fb2ZPnUxce-kzxi2XAmNLTB7YdZlCZkmhvgymIwNyGcT5O4xB3FRhxPGaL31/exec',
        WEB3FORMS_KEY: '2bbcdc46-5397-4fa1-b7ca-4947bceb267b'
    };

    function ensureModal() {
        let modal = document.getElementById('quoteModal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'quoteModal';
        modal.className = 'quote-modal';
        modal.innerHTML = `
            <div class="quote-modal-content" onclick="event.stopPropagation()">
                <span class="quote-close" onclick="closeQuoteModal()">&times;</span>
                <h3>Получить счёт или КП</h3>
                <p class="quote-desc">Работаем с юрлицами и ИП. Пришлём счёт и коммерческое предложение в течение рабочего дня.</p>
                <form id="quoteForm">
                    <input type="text" id="quoteCompany" placeholder="Название компании" required maxlength="100">
                    <input type="text" id="quoteINN" placeholder="ИНН (10 или 12 цифр)" required maxlength="12" pattern="[0-9]{10,12}">
                    <input type="text" id="quoteName" placeholder="Контактное лицо" required maxlength="100">
                    <input type="text" id="quotePhone" placeholder="Телефон или Email" required maxlength="100">
                    <textarea id="quoteMessage" placeholder="Что нужно: тип лестниц, длина, количество" rows="3" maxlength="500"></textarea>
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

    function sanitizeInput(text) {
        if (typeof text !== 'string') return '';
        return text.replace(/[<>&"'\/\\]/g, '');
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

    window.openQuoteModal = function() {
        ensureModal();
        document.getElementById('quoteModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    window.closeQuoteModal = function(e) {
        if (e && e.target !== e.currentTarget && e.type === 'click') return;
        const modal = document.getElementById('quoteModal');
        if (modal) modal.classList.remove('show');
        document.body.style.overflow = '';
    };

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') window.closeQuoteModal();
    });

    document.addEventListener('DOMContentLoaded', function() {
        const modal = ensureModal();

        modal.addEventListener('click', function(e) {
            if (e.target === modal) window.closeQuoteModal();
        });

        const form = document.getElementById('quoteForm');
        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const company = sanitizeInput(document.getElementById('quoteCompany').value);
            const inn = sanitizeInput(document.getElementById('quoteINN').value);
            const name = sanitizeInput(document.getElementById('quoteName').value);
            const phone = sanitizeInput(document.getElementById('quotePhone').value);
            const message = sanitizeInput(document.getElementById('quoteMessage').value);

            if (!company || !inn || !name || !phone) {
                showToast('Заполните все обязательные поля', 'error');
                return;
            }
            if (!/^\d{10,12}$/.test(inn)) {
                showToast('ИНН должен содержать 10 или 12 цифр', 'error');
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            // === Текст сообщения для Telegram ===
            const body = `📄 ЗАПРОС СЧЁТА/КП

🏢 Компания: ${company}
🆔 ИНН: ${inn}
👤 Контакт: ${name}
📞 Телефон/Email: ${phone}
💬 Комментарий: ${message || 'Нет'}`;

            // === 1. Telegram через Google Apps Script ===
            const telegramPromise = fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'quote',
                    company: company,
                    inn: inn,
                    name: name,
                    phone: phone,
                    message: message || '',
                    cartText: body,
                    source: 'Форма счёт/КП: ' + window.location.pathname
                })
            }).catch(err => console.warn('TG ошибка:', err));

            // === 2. Почта через Web3Forms ===
            const mailData = new FormData();
            mailData.append('access_key', CONFIG.WEB3FORMS_KEY);
            mailData.append('subject', 'Запрос счёта/КП — stremyanki-dlya-kolodcev.ru');
            mailData.append('from_name', 'Сайт лестниц для колодцев');
            mailData.append('company', company);
            mailData.append('inn', inn);
            mailData.append('name', name);
            mailData.append('contact', phone);
            mailData.append('message', message || '');
            mailData.append('source', 'Форма счёт/КП: ' + window.location.pathname);
            // ГЛАВНОЕ: дублируем всё сообщение целиком — ИНН точно придёт
            mailData.append('form_data', body);

            const mailPromise = fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: mailData
            }).catch(err => console.warn('Mail ошибка:', err));

            await Promise.allSettled([telegramPromise, mailPromise]);

            showToast('✅ Запрос отправлен! Пришлём счёт в течение рабочего дня.', 'success');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            window.closeQuoteModal();
        });
    });
})();