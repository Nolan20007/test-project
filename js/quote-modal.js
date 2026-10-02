(function() {
    'use strict';

    const CONFIG = {
        GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxdYce6Fb2ZPnUxce-kzxi2XAmNLTB7YdZlCZkmhvgymIwNyGcT5O4xB3FRhxPGaL31/exec',
        WEB3FORMS_KEY: '2bbcdc46-5397-4fa1-b7ca-4947bceb267b',
        CART_STORAGE_KEY: 'kolodets_cart_v1'
    };

    let cartForQuote = {};

    function sanitizeInput(text) {
        if (typeof text !== 'string') return '';
        return text.replace(/[<>&"'\/\\]/g, '');
    }

    function getCartFromStorage() {
        try {
            const data = localStorage.getItem(CONFIG.CART_STORAGE_KEY);
            const cart = JSON.parse(data) || {};
            return (typeof cart === 'object' && cart !== null) ? cart : {};
        } catch (e) {
            return {};
        }
    }

    function formatLength(cm) {
        const n = parseFloat(cm);
        if (isNaN(n) || n <= 0) return '';
        return Math.round(n) + ' см';
    }

    function formatTotalLength(cm) {
        const n = parseFloat(cm);
        if (isNaN(n) || n <= 0) return '0 м';
        return (n / 100).toFixed(2).replace(/\.?0+$/, '') + ' м';
    }

    function calculateTotals(cart) {
        let total = 0;
        let totalLengthCm = 0;
        let totalWeightKg = 0;
        let totalQuantity = 0;

        for (const id in cart) {
            if (!cart.hasOwnProperty(id)) continue;
            const item = cart[id];
            if (!item) continue;
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            const length = parseFloat(item.length) || 0;
            const weight = parseFloat(item.weight) || 0;

            total += price * quantity;
            totalLengthCm += length * quantity;
            totalWeightKg += weight * quantity;
            totalQuantity += quantity;
        }

        return { total, totalLengthCm, totalWeightKg, totalQuantity };
    }

    function showToast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.setAttribute('role', 'status');
            container.setAttribute('aria-live', 'polite');
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
        let modal = document.getElementById('quoteModal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'quoteModal';
        modal.className = 'quote-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'quoteModalTitle');
        modal.innerHTML = `
            <style>
                .quote-cart-preview {
                    margin: 0 0 18px;
                    padding: 12px 14px;
                    background: #f7fafc;
                    border: 1px solid #dbe7f3;
                    border-radius: var(--inputs-buttons-border-radius, 8px);
                }
                .quote-cart-preview__header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    margin-bottom: 8px;
                }
                .quote-cart-preview__title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--primary-color, #0e5c80);
                    margin: 0;
                }
                .quote-cart-preview__clear {
                    background: transparent;
                    border: 1px solid #c8d9ea;
                    color: #6a7a8a;
                    font-size: 12px;
                    padding: 3px 9px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .quote-cart-preview__clear:hover {
                    background: #fff;
                    color: #cc0000;
                    border-color: #cc0000;
                }
                .quote-cart-preview__list {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                    font-size: 13px;
                    line-height: 1.5;
                    color: #444;
                }
                .quote-cart-preview__list li {
                    padding: 4px 0;
                    border-bottom: 1px dashed #eef2f6;
                }
                .quote-cart-preview__list li:last-child {
                    border-bottom: none;
                }
                .quote-cart-preview__total {
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid #dbe7f3;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--primary-color, #0e5c80);
                    text-align: right;
                }
                .quote-cart-preview__disclaimer {
                    margin-top: 6px;
                    font-size: 11px;
                    line-height: 1.4;
                    color: #9aa4ae;
                    text-align: right;
                    font-style: italic;
                }
                .quote-cart-preview__empty {
                    font-size: 13px;
                    line-height: 1.55;
                    color: #9aa4ae;
                    text-align: center;
                    padding: 10px 8px;
                }
                .quote-cart-preview__empty a {
                    color: var(--primary-color, #0e5c80);
                    text-decoration: none;
                    border-bottom: 1px dashed var(--primary-color, #0e5c80);
                }
                .quote-cart-preview__empty a:hover {
                    border-bottom-style: solid;
                }
                /* Переключатель Юрлицо / Физлицо */
                .quote-toggle {
                    display: flex;
                    gap: 0;
                    margin: 0 0 18px;
                    border-radius: var(--inputs-buttons-border-radius, 8px);
                    overflow: hidden;
                    border: 2px solid var(--primary-color, #0e5c80);
                }
                .quote-toggle__btn {
                    flex: 1;
                    padding: 10px 12px;
                    border: none;
                    background: transparent;
                    color: var(--primary-color, #0e5c80);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }
                .quote-toggle__btn:hover:not(.active) {
                    background: #f0f7fb;
                }
                .quote-toggle__btn.active {
                    background: var(--primary-color, #0e5c80);
                    color: #fff;
                }
                .quote-fields-legal,
                .quote-fields-physical {
                    display: none;
                }
                .quote-fields-legal.active,
                .quote-fields-physical.active {
                    display: block;
                }
            </style>
            <div class="quote-modal-content" onclick="event.stopPropagation()">
                <span class="quote-close" role="button" tabindex="0" aria-label="Закрыть окно" onclick="closeQuoteModal()">&times;</span>
                <h3 id="quoteModalTitle">Получить расчет/КП</h3>
                <p class="quote-desc">Работаем с юрлицами и ИП. Пришлём счёт и коммерческое предложение в течение рабочего дня.</p>

                <div class="quote-cart-preview" id="quoteCartPreview"></div>

                <div class="quote-toggle" role="tablist" aria-label="Тип лица">
                    <button type="button" class="quote-toggle__btn active" data-type="legal" onclick="setQuoteType('legal')" role="tab" aria-selected="true">Юридическое лицо</button>
                    <button type="button" class="quote-toggle__btn" data-type="physical" onclick="setQuoteType('physical')" role="tab" aria-selected="false">Физическое лицо</button>
                </div>

                <form id="quoteForm">
                    <!-- Юрлицо -->
                    <div class="quote-fields-legal active" data-fields="legal">
                        <label for="quoteCompany" class="visually-hidden">Название компании</label>
                        <input type="text" id="quoteCompany" placeholder="Название компании" maxlength="100" aria-required="true">

                        <label for="quoteINN" class="visually-hidden">ИНН</label>
                        <input type="text" id="quoteINN" placeholder="ИНН (10 или 12 цифр)" maxlength="12" pattern="[0-9]{10,12}" aria-required="true">

                        <label for="quoteName" class="visually-hidden">Контактное лицо</label>
                        <input type="text" id="quoteName" placeholder="Контактное лицо" maxlength="100" aria-required="true">

                        <label for="quotePhone" class="visually-hidden">Телефон или Email</label>
                        <input type="text" id="quotePhone" placeholder="Телефон или Email" maxlength="100" aria-required="true">
                    </div>

                    <!-- Физлицо -->
                    <div class="quote-fields-physical" data-fields="physical">
                        <label for="quotePhysName" class="visually-hidden">Ваше имя</label>
                        <input type="text" id="quotePhysName" placeholder="Ваше имя" maxlength="100" aria-required="true">

                        <label for="quotePhysContact" class="visually-hidden">Телефон или Email</label>
                        <input type="text" id="quotePhysContact" placeholder="Телефон или Email" maxlength="100" aria-required="true">
                    </div>

                    <label for="quoteMessage" class="visually-hidden">Комментарий к запросу</label>
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

    // ===== Переключатель типа лица =====
    let quoteType = 'legal';

    window.setQuoteType = function(type) {
        quoteType = type;
        const modal = document.getElementById('quoteModal');
        if (!modal) return;

        modal.querySelectorAll('.quote-toggle__btn').forEach(btn => {
            const isActive = btn.getAttribute('data-type') === type;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        modal.querySelectorAll('[data-fields]').forEach(block => {
            block.classList.toggle('active', block.getAttribute('data-fields') === type);
        });

        // Переключить required у невидимых полей (чтобы браузер не ругался)
        modal.querySelectorAll('.quote-fields-legal input, .quote-fields-physical input').forEach(inp => {
            if (inp.closest('.quote-fields-legal.active, .quote-fields-physical.active')) {
                inp.setAttribute('required', 'required');
            } else {
                inp.removeAttribute('required');
            }
        });
    };

    function renderCartPreview() {
        const preview = document.getElementById('quoteCartPreview');
        if (!preview) return;

        const items = Object.values(cartForQuote).filter(i => i && i.id && i.name);

        if (items.length === 0) {
            preview.innerHTML = `
                <div class="quote-cart-preview__header">
                    <h4 class="quote-cart-preview__title">Товары из корзины</h4>
                </div>
                <div class="quote-cart-preview__empty">
                    В корзине пока пусто.<br>
                    Добавьте товары в <a href="cart.html">корзину</a> — и они появятся здесь автоматически.<br>
                    Или опишите нужные позиции в комментарии ниже.
                </div>
            `;
            return;
        }

        const totals = calculateTotals(cartForQuote);

        let listHtml = '<ul class="quote-cart-preview__list">';
        for (const id in cartForQuote) {
            const item = cartForQuote[id];
            if (!item || !item.name) continue;
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            const itemTotal = price * quantity;
            const lengthStr = item.length ? ` (${formatLength(item.length)})` : '';
            listHtml += `<li>${sanitizeInput(item.name)}${lengthStr} — ${quantity} шт. × ${price.toLocaleString('ru-RU')} = ${itemTotal.toLocaleString('ru-RU')} ₽</li>`;
        }
        listHtml += '</ul>';

        preview.innerHTML = `
            <div class="quote-cart-preview__header">
                <h4 class="quote-cart-preview__title">Товары из корзины</h4>
                <button type="button" class="quote-cart-preview__clear" id="quoteCartClear">🧹 Очистить</button>
            </div>
            ${listHtml}
            <div class="quote-cart-preview__total">
                Итого (от): ${totals.total.toLocaleString('ru-RU')} ₽
            </div>
            <div class="quote-cart-preview__disclaimer">
                *Цены указаны от минимальной стоимости и не являются публичной офертой. Финальная цена зависит от объема заказа и условий поставки
            </div>
        `;

        const clearBtn = document.getElementById('quoteCartClear');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                if (confirm('Убрать товары из запроса? Сама корзина не очистится.')) {
                    cartForQuote = {};
                    renderCartPreview();
                }
            });
        }
    }

    window.openQuoteModal = function() {
        ensureModal();
        cartForQuote = getCartFromStorage();
        renderCartPreview();
        setQuoteType('legal'); // По умолчанию — юрлицо
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

        const closeBtn = modal.querySelector('.quote-close');
        if (closeBtn) {
            closeBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.closeQuoteModal();
                }
            });
        }

        const form = document.getElementById('quoteForm');
        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const message = sanitizeInput(document.getElementById('quoteMessage').value);

            let body = '';
            let contactInfo = {};
            let subject = '';

            if (quoteType === 'legal') {
                const companyEl = document.getElementById('quoteCompany');
                const innEl = document.getElementById('quoteINN');
                const nameEl = document.getElementById('quoteName');
                const phoneEl = document.getElementById('quotePhone');

                const company = sanitizeInput(companyEl.value);
                const inn = sanitizeInput(innEl.value);
                const name = sanitizeInput(nameEl.value);
                const phone = sanitizeInput(phoneEl.value);

                clearFormInvalid(form);

                if (!company) { setFieldInvalid(companyEl, true); showToast('Укажите название компании', 'error'); companyEl.focus(); return; }
                if (!/^\d{10,12}$/.test(inn)) { setFieldInvalid(innEl, true); showToast('ИНН должен содержать 10 или 12 цифр', 'error'); innEl.focus(); return; }
                if (!name) { setFieldInvalid(nameEl, true); showToast('Укажите контактное лицо', 'error'); nameEl.focus(); return; }
                if (!phone) { setFieldInvalid(phoneEl, true); showToast('Укажите телефон или email', 'error'); phoneEl.focus(); return; }

                contactInfo = { name: name, phone: phone, company: company, inn: inn };
                subject = 'Запрос счёта/КП (Юрлицо) — stremyanki-dlya-kolodcev.ru';

                body += `📄 ЗАПРОС СЧЁТА/КП — ЮРИДИЧЕСКОЕ ЛИЦО\n\n`;
                body += `🏢 Компания: ${company}\n`;
                body += `🆔 ИНН: ${inn}\n`;
                body += `👤 Контакт: ${name}\n`;
                body += `📞 Телефон/Email: ${phone}\n`;
                body += `💬 Комментарий: ${message || 'Нет'}\n`;
            } else {
                const physNameEl = document.getElementById('quotePhysName');
                const physContactEl = document.getElementById('quotePhysContact');

                const physName = sanitizeInput(physNameEl.value);
                const physContact = sanitizeInput(physContactEl.value);

                clearFormInvalid(form);

                if (!physName || physName.length < 2) { setFieldInvalid(physNameEl, true); showToast('Укажите ваше имя', 'error'); physNameEl.focus(); return; }
                if (!physContact) { setFieldInvalid(physContactEl, true); showToast('Укажите телефон или email', 'error'); physContactEl.focus(); return; }

                contactInfo = { name: physName, phone: physContact, company: '', inn: '' };
                subject = 'Запрос счёта/КП (Физлицо) — stremyanki-dlya-kolodcev.ru';

                body += `📄 ЗАПРОС СЧЁТА/КП — ФИЗИЧЕСКОЕ ЛИЦО\n\n`;
                body += `👤 Имя: ${physName}\n`;
                body += `📞 Телефон/Email: ${physContact}\n`;
                body += `💬 Комментарий: ${message || 'Нет'}\n`;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            const items = Object.values(cartForQuote).filter(i => i && i.id && i.name);

            if (items.length > 0) {
                const totals = calculateTotals(cartForQuote);
                body += `\n🛒 Товары из корзины:\n`;
                for (const id in cartForQuote) {
                    const item = cartForQuote[id];
                    if (!item || !item.name) continue;
                    const price = parseFloat(item.price) || 0;
                    const quantity = parseInt(item.quantity) || 0;
                    const itemTotal = price * quantity;
                    const lengthStr = item.length ? ` (${formatLength(item.length)})` : '';
                    body += `• ${sanitizeInput(item.name)}${lengthStr} - ${quantity} шт. × ${price.toLocaleString('ru-RU')} руб. = ${itemTotal.toLocaleString('ru-RU')} руб.\n`;
                }
                body += `\n📊 ИТОГИ ЗАКАЗА:\n`;
                body += `💰 Общая сумма (от): ${totals.total.toLocaleString('ru-RU')} руб.\n`;
                body += `📏 Общая длина: ${formatTotalLength(totals.totalLengthCm)}\n`;
                body += `⚖️ Общий вес: ${Math.round(totals.totalWeightKg)} кг`;
            } else {
                body += `\n🛒 Товары из корзины: не выбраны (запрос на общий расчёт)`;
            }

            const telegramPromise = fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: quoteType === 'legal' ? 'quote_legal' : 'quote_physical',
                    name: contactInfo.name,
                    phone: contactInfo.phone,
                    company: contactInfo.company,
                    inn: contactInfo.inn,
                    message: message || '',
                    cartText: body,
                    hasCartItems: items.length > 0,
                    source: 'Форма счёт/КП: ' + window.location.pathname
                })
            }).catch(err => console.warn('TG ошибка:', err));

            const mailData = new FormData();
            mailData.append('access_key', CONFIG.WEB3FORMS_KEY);
            mailData.append('subject', subject);
            mailData.append('from_name', 'Сайт лестниц для колодцев');
            mailData.append('form_data', body);

            const mailPromise = fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: mailData
            }).catch(err => console.warn('Mail ошибка:', err));

            await Promise.allSettled([telegramPromise, mailPromise]);

            showToast('✅ Запрос отправлен! Пришлём счёт в течение рабочего дня.', 'success');
            this.reset();
            cartForQuote = {};
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            window.closeQuoteModal();
        });

        bindAutoClearInvalid(form);
    });
})();