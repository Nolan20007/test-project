// js/analytics.js
function loadAnalytics() {
    // Яндекс.Метрика
    const yandexScript = document.createElement('script');
    yandexScript.innerHTML = `
        (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window, document,'script','https://mc.yandex.ru/metrika/tag.js','ym');

        ym(105333281, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
    `;
    document.head.appendChild(yandexScript);

    // Google Analytics
    const gtagScript1 = document.createElement('script');
    gtagScript1.async = true;
    gtagScript1.src = 'https://www.googletagmanager.com/gtag/js?id=G-33M762M7CX';
    document.head.appendChild(gtagScript1);

    const gtagScript2 = document.createElement('script');
    gtagScript2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-33M762M7CX');
    `;
    document.head.appendChild(gtagScript2);

    // Noscript для Яндекс.Метрики
    const noscript = document.createElement('noscript');
    noscript.innerHTML = '<div><img src="https://mc.yandex.ru/watch/105333281" style="position:absolute; left:-9999px;" alt="" /></div>';
    document.body.appendChild(noscript);

    // === ДОБАВЛЯЕМ ОТСЛЕЖИВАНИЕ ЦЕЛЕЙ ===
    document.addEventListener('DOMContentLoaded', function() {
        // Отслеживание отправки форм
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function() {
                ym(105333281, 'reachGoal', 'contact_form_submit');
                gtag('event', 'form_submit');
            });
        });
        
        // Клики по телефону
        const phones = document.querySelectorAll('a[href^="tel:"]');
        phones.forEach(phone => {
            phone.addEventListener('click', function() {
                ym(105333281, 'reachGoal', 'phone_click');
                gtag('event', 'phone_click');
            });
        });
        
        // Добавление в корзину
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('cart-button') || 
                e.target.closest('.cart-button')) {
                ym(105333281, 'reachGoal', 'add_to_cart');
                gtag('event', 'add_to_cart');
            }
        });
        
        // Просмотр товара
        document.addEventListener('click', function(e) {
            if (e.target.closest('.product-card') || 
                e.target.closest('.product-image-wrapper')) {
                ym(105333281, 'reachGoal', 'product_view');
                gtag('event', 'view_item');
            }
        });
    });
}

// Загружаем после полной загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAnalytics);
} else {
    loadAnalytics();
}