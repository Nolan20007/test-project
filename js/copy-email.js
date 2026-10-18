function copyEmailToClipboard(btn) {
    const email = 'stremyanki-dlya-kolodcev@mail.ru';
    const img = btn.querySelector('img');
    
    // Копируем в буфер обмена
    navigator.clipboard.writeText(email).then(() => {
        // Делаем иконку зеленой (через фильтр для белых SVG)
        img.style.filter = 'brightness(0) saturate(100%) invert(52%) sepia(88%) saturate(425%) hue-rotate(83deg) brightness(96%) contrast(91%)';
        
        // Если у вас подключен файл toast.js, показываем уведомление
        if (typeof showToast === 'function') {
            showToast('Email скопирован!', 'success', 2000);
        }
        
        // Возвращаем белый цвет через 2 секунды
        setTimeout(() => {
            img.style.filter = '';
        }, 2000);
    }).catch(err => {
        console.error('Ошибка копирования: ', err);
        alert('Не удалось скопировать. Пожалуйста, выделите адрес вручную.');
    });
}
