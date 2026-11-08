(function () {
  'use strict';

  const IMAGE_SELECTOR = '.mp-main-img-wrapper img, .product-gallery img, .product-image-wrapper img, img.mp-main-img';
  const INVALID_SRC = /default-product\\.svg|placeholder/i;
  let modal, modalImage, counter, previousButton, nextButton, closeButton;
  let images = [];
  let activeIndex = 0;
  let lastFocused = null;

  function usableImage(img) {
    const src = img.currentSrc || img.src || '';
    return !!src && !INVALID_SRC.test(src) && !img.closest('.product-image-placeholder');
  }

  function ensureModal() {
    if (modal) return;
    const style = document.createElement('style');
    style.textContent = `
      .product-lightbox { position:fixed; inset:0; z-index:10050; display:none; align-items:center; justify-content:center; padding:56px 64px; background:rgba(0,0,0,.92); }
      .product-lightbox.is-open { display:flex; }
      .product-lightbox__image { display:block; max-width:min(100%,1200px); max-height:82vh; object-fit:contain; border-radius:6px; }
      .product-lightbox__close,.product-lightbox__prev,.product-lightbox__next { position:absolute; border:0; color:#fff; background:rgba(255,255,255,.14); cursor:pointer; border-radius:50%; width:44px; height:44px; font-size:28px; line-height:1; }
      .product-lightbox__close { top:16px; right:20px; font-size:32px; }
      .product-lightbox__prev { left:16px; top:50%; transform:translateY(-50%); }
      .product-lightbox__next { right:16px; top:50%; transform:translateY(-50%); }
      .product-lightbox__counter { position:absolute; bottom:18px; left:0; right:0; color:#fff; text-align:center; font:14px/1.4 sans-serif; }
      .product-lightbox__prev[hidden],.product-lightbox__next[hidden],.product-lightbox__counter[hidden] { display:none; }
      .mp-main-img-wrapper img,.product-gallery img { cursor:zoom-in; }
      @media(max-width:600px) { .product-lightbox { padding:56px 12px; } .product-lightbox__prev { left:6px; } .product-lightbox__next { right:6px; } }
    `;
    document.head.appendChild(style);

    modal = document.createElement('div');
    modal.className = 'product-lightbox';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Просмотр фотографий товара');
    modal.innerHTML = `
      <button type="button" class="product-lightbox__close" aria-label="Закрыть">&times;</button>
      <button type="button" class="product-lightbox__prev" aria-label="Предыдущее фото">&#8249;</button>
      <img class="product-lightbox__image" alt="">
      <button type="button" class="product-lightbox__next" aria-label="Следующее фото">&#8250;</button>
      <div class="product-lightbox__counter" aria-live="polite"></div>`;
    document.body.appendChild(modal);
    modalImage = modal.querySelector('.product-lightbox__image');
    counter = modal.querySelector('.product-lightbox__counter');
    previousButton = modal.querySelector('.product-lightbox__prev');
    nextButton = modal.querySelector('.product-lightbox__next');
    closeButton = modal.querySelector('.product-lightbox__close');

    closeButton.addEventListener('click', close);
    previousButton.addEventListener('click', () => show(activeIndex - 1));
    nextButton.addEventListener('click', () => show(activeIndex + 1));
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
  }

  function show(index) {
    if (!images.length) return;
    activeIndex = (index + images.length) % images.length;
    const source = images[activeIndex];
    modalImage.src = source.currentSrc || source.src;
    modalImage.alt = source.alt || 'Фотография товара';
    const multiple = images.length > 1;
    previousButton.hidden = !multiple;
    nextButton.hidden = !multiple;
    counter.hidden = !multiple;
    counter.textContent = multiple ? (activeIndex + 1) + ' / ' + images.length : '';
  }

  function open(image) {
    const gallery = image.closest('.mp-gallery, .product-gallery');
    const scope = gallery || image.closest('.mp-main-img-wrapper') || document;
    images = Array.from(scope.querySelectorAll('img')).filter(usableImage);
    if (!images.includes(image)) images.unshift(image);
    lastFocused = document.activeElement;
    ensureModal();
    show(images.indexOf(image));
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }

  function close() {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    modalImage.removeAttribute('src');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  document.addEventListener('click', event => {
    const image = event.target.closest(IMAGE_SELECTOR);
    if (!image || !usableImage(image)) return;
    event.preventDefault();
    open(image);
  });

  document.addEventListener('keydown', event => {
    if (!modal || !modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowLeft' && images.length > 1) show(activeIndex - 1);
    else if (event.key === 'ArrowRight' && images.length > 1) show(activeIndex + 1);
  });
})();