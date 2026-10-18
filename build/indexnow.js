const HOST = 'stremyanki-dlya-kolodcev.ru';
const KEY = 'yandex-autoindex-key';

const urls = [
  `https://${HOST}/`,
  `https://${HOST}/ss1.html`,
  `https://${HOST}/ss2.html`,
  `https://${HOST}/tmp-902.html`,
  `https://${HOST}/l-16-dlya-teplovyh-setej.html`,
  `https://${HOST}/kl-1-dlya-kanalizacionnyh-kolodcev.html`,
  `https://${HOST}/vl-2-l-19-vodoprovodnaya.html`,
  `https://${HOST}/skoba-mn.html`,
  `https://${HOST}/ssg1.html`,
  `https://${HOST}/price-list.html`,
  `https://${HOST}/dostavka-i-oplata.html`,
  `https://${HOST}/o-kompanii.html`,
  `https://${HOST}/kak-vybrat-stremyanku.html`,
  `https://${HOST}/montazh-stremyanok-v-kolodcy.html`,
  `https://${HOST}/gost-trebovaniya-k-lestnicam.html`,
  `https://${HOST}/tipovye-proekty.html`,
  `https://${HOST}/politika-konfidencialnosti.html`,
  `https://${HOST}/publichnaya-oferta.html`,
  `https://${HOST}/vozvrat.html`,
  `https://${HOST}/cart.html`,
  `https://${HOST}/sitemap.html`
];

async function submit() {
  console.log(`🚀 Отправка ${urls.length} URL в IndexNow (Яндекс)...`);
  
  try {
    const response = await fetch('https://yandex.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: urls
      })
    });

    if (response.ok) {
      console.log('✅ Успех! Яндекс принял URL.');
    } else {
      const text = await response.text();
      console.log(`❌ Ошибка: ${response.status} - ${text}`);
    }
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
  }
}

submit();
