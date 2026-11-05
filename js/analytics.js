// js/analytics.js
// Инициализация аналитики и событий сайта. Защита от повторного запуска нужна,
// поскольку старые сборки могли подключать этот файл дважды.
function loadAnalytics() {
    if (window.__siteAnalyticsInitialized) return;
    window.__siteAnalyticsInitialized = true;

    // Яндекс.Метрика
    (function(m, e, t, r, i, k, a) {
        m[i] = m[i] || function() { (m[i].a = m[i].a || []).push(arguments); };
        m[i].l = 1 * new Date();
        for (var j = 0; j < document.scripts.length; j++) {
            if (document.scripts[j].src === r) return;
        }
        k = e.createElement(t);
        a = e.getElementsByTagName(t)[0];
        k.async = 1;
        k.src = r;
        a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

    if (typeof window.ym === 'function') {
        window.ym(105333281, 'init', {
            webvisor: true,
            clickmap: true,
            ecommerce: 'dataLayer',
            accurateTrackBounce: true,
            trackLinks: true
        });
    }

    // Google Analytics 4
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-33M762M7CX');

    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js?id=G-33M762M7CX"]')) {
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-33M762M7CX';
        document.head.appendChild(gtagScript);
    }

    // Вызывается обработчиком формы только после ответа сервиса отправки.
    window.trackLeadSuccess = function(form, method) {
        const formId = form && form.id ? form.id : 'unknown_form';
        window.gtag('event', 'generate_lead', {
            form_id: formId,
            method: method || 'website'
        });
        if (typeof window.ym === 'function') {
            window.ym(105333281, 'reachGoal', 'contact_form_submit');
        }
    };

    // Клики по телефону, email и добавление товара в корзину.
    document.addEventListener('click', function(event) {
        const target = event.target;
        if (!target || typeof target.closest !== 'function') return;

        const phone = target.closest('a[href^="tel:"]');
        if (phone) {
            window.gtag('event', 'phone_click', { link_url: phone.href });
            if (typeof window.ym === 'function') window.ym(105333281, 'reachGoal', 'phone_click');
        }

        const email = target.closest('a[href^="mailto:"]');
        if (email) {
            window.gtag('event', 'email_click', { link_url: email.href });
            if (typeof window.ym === 'function') window.ym(105333281, 'reachGoal', 'email_click');
        }

        const cartButton = target.closest('.cart-button');
        if (cartButton) {
            window.gtag('event', 'add_to_cart');
            if (typeof window.ym === 'function') window.ym(105333281, 'reachGoal', 'add_to_cart');
        }
    });
}

// Файл подключается через defer, поэтому DOM уже разобран.
// Не используем вложенный DOMContentLoaded: такой обработчик мог регистрироваться слишком поздно.
loadAnalytics();
