(function () {
  'use strict';

  const IMAGE_SELECTOR = '.mp-main-img-wrapper:not([onclick*="openLightbox"]) img:not(.product-image-placeholder), .main-image-wrapper img:not(.product-image-placeholder), .product-gallery img, .product-image-wrapper img:not(.product-image-placeholder)';
  const INVALID_SRC = /default-product\.svg|placeholder/i;
  let modal, title, track, nav, closeButton;
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
      .product-lightbox { display:none; position:fixed; z-index:10050; inset:0; overflow:auto; background:rgba(0,0,0,.9); padding:60px 16px 24px; }
      .product-lightbox.is-open { display:block; }
      .product-lightbox__content { position:relative; margin:0 auto; width:95%; max-width:1300px; background:#fff; border-radius:15px; overflow:hidden; }
      .product-lightbox__title { text-align:center; color:#333; padding:12px 64px; margin:0; font-size:1.1em; font-weight:600; }
      .product-lightbox__close { position:fixed; top:12px; right:24px; color:#f1f1f1; font-size:40px; font-weight:bold; cursor:pointer; z-index:10051; background:transparent; border:0; padding:0; line-height:1; }
      .product-lightbox__close:hover { color:#0E5C80; }
      .product-lightbox__track { display:flex; overflow-x:auto; scroll-snap-type:x mandatory; scrollbar-width:none; }
      .product-lightbox__track::-webkit-scrollbar { display:none; }
      .product-lightbox__slide { flex:0 0 100%; min-width:100%; height:85vh; max-height:900px; display:flex; justify-content:center; align-items:center; background:#f0f4f8; scroll-snap-align:start; }
      .product-lightbox__slide img { display:block; max-width:100%; max-height:100%; width:auto; height:auto; object-fit:contain; }
      .product-lightbox__nav { position:absolute; right:20px; bottom:20px; z-index:2; display:flex; flex-direction:column; gap:6px; max-height:calc(100% - 40px); overflow-y:auto; padding:8px; border-radius:24px; background:rgba(255,255,255,.92); box-shadow:0 2px 10px rgba(0,0,0,.15); }
      .product-lightbox__nav button { border:0; border-radius:999px; padding:8px 16px; background:transparent; color:#444; cursor:pointer; font-family:inherit; font-size:13px; font-weight:500; line-height:1.3; white-space:nowrap; }
      .product-lightbox__nav button.active { background:#0E5C80; color:#fff; }
      @media(max-width:600px) { .product-lightbox { padding:56px 8px 12px; } .product-lightbox__content { width:100%; } .product-lightbox__slide { height:76vh; } .product-lightbox__nav { right:8px; bottom:8px; } }
    `;
    document.head.appendChild(style);
    modal = document.createElement('div');
    modal.className = 'product-lightbox';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<button type="button" class="product-lightbox__close" aria-label="Закрыть">&times;</button><div class="product-lightbox__content"><h3 class="product-lightbox__title"></h3><div class="product-lightbox__track"></div><div class="product-lightbox__nav"></div></div>';
    document.body.appendChild(modal);
    title = modal.querySelector('.product-lightbox__title');
    track = modal.querySelector('.product-lightbox__track');
    nav = modal.querySelector('.product-lightbox__nav');
    closeButton = modal.querySelector('.product-lightbox__close');
    closeButton.addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    nav.addEventListener('click', event => {
      const button = event.target.closest('button[data-slide]');
      if (button) show(Number(button.dataset.slide));
    });
  }

  function show(index) {
    if (!images.length) return;
    activeIndex = Math.max(0, Math.min(index, images.length - 1));
    const slide = track.children[activeIndex];
    if (slide) track.scrollTo({ left: activeIndex * track.clientWidth, behavior: 'smooth' });
    nav.querySelectorAll('button').forEach((button, i) => button.classList.toggle('active', i === activeIndex));
  }

  function fullSizeSource(image) {
    if (image.dataset.fullSrc) return image.dataset.fullSrc;

    // Gallery thumbnails are links to the original, full-resolution files.
    const imageLink = image.closest('a[href]');
    if (imageLink && imageLink.href) return imageLink.href;

    const source = image.currentSrc || image.src || '';
    const wrapper = image.closest('.mp-main-img-wrapper');
    if (wrapper && source) {
      const sourcePath = new URL(source, document.baseURI).pathname;
      const directory = sourcePath.slice(0, sourcePath.lastIndexOf('/') + 1);
      const preferredPath = sourcePath.replace(/vid-(?:mini|card)(?=\.)/i, 'vid-1');
      const galleryLinks = Array.from(document.querySelectorAll('.product-gallery a[href]'));
      const preferred = galleryLinks.find(link =>
        new URL(link.href, document.baseURI).pathname === preferredPath
      );
      if (preferred) return preferred.href;

      const sameDirectory = galleryLinks.find(link =>
        new URL(link.href, document.baseURI).pathname.startsWith(directory)
      );
      if (sameDirectory) return sameDirectory.href;
    }

    return source;
  }

  function galleryEntries(image) {
    const card = image.closest('.product-image-wrapper[data-title]');
    if (card) {
      const keys = [
        ['vid-1', 'Основное фото'], ['vid-2', 'Фото 2'], ['vid-3', 'Фото 3'],
        ['foto-1', 'Фото 4'], ['foto-2', 'Фото 5'],
        ['album', 'Альбом'], ['chertezh', 'Чертёж']
      ];
      const entries = keys
        .map(([key, label]) => ({ src: card.dataset[key], alt: image.alt || 'Фотография товара', label }))
        .filter(entry => entry.src && !INVALID_SRC.test(entry.src));
      if (entries.length) return entries;
    }

    // Product detail pages keep their main image and gallery inside one page-level container.
    const page = image.closest('.product-page-wrap, .product-details, .product-details-page');
    const scopedImages = page
      ? Array.from(page.querySelectorAll(IMAGE_SELECTOR)).filter(usableImage)
      : [image];
    const uniqueImages = scopedImages.includes(image) ? scopedImages : [image, ...scopedImages];
    return uniqueImages.map((item, index) => ({
      src: fullSizeSource(item),
      alt: item.alt || 'Фотография товара',
      label: item.closest('.product-gallery') ? 'Фото ' + (index + 1) : (index === 0 ? 'Основное фото' : 'Фото ' + (index + 1))
    }));
  }

  function open(image) {
    const entries = galleryEntries(image);
    images = entries;
    if (!images.length) return;
    ensureModal();
    lastFocused = document.activeElement;
    const wrapper = image.closest('[data-title]');
    const pageTitle = image.closest('.product-page-wrap, .product-details, .product-details-page');
    const heading = pageTitle && pageTitle.querySelector('h1');
    title.textContent = (wrapper && wrapper.getAttribute('data-title')) || (heading && heading.textContent.trim()) || image.alt || 'Просмотр изображения';
    track.innerHTML = images.map(item => '<div class="product-lightbox__slide"><img src="' + item.src + '" alt="' + item.alt + '"></div>').join('');
    nav.innerHTML = images.length > 1 ? images.map((item, i) => '<button type="button" data-slide="' + i + '">' + item.label + '</button>').join('') : '';
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    show(Math.max(0, entries.findIndex(item => item.src === fullSizeSource(image))));
    closeButton.focus();
  }

  function close() {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    track.innerHTML = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  document.addEventListener('click', event => {
    const image = event.target.closest(IMAGE_SELECTOR);
    if (!image || !usableImage(image)) return;
    const legacyWrapper = image.closest('.main-image-wrapper');
    if (legacyWrapper && typeof legacyWrapper.onclick === 'function') return;
    event.preventDefault();
    open(image);
  });

  document.addEventListener('keydown', event => {
    if (!modal || !modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowLeft') show(activeIndex - 1);
    else if (event.key === 'ArrowRight') show(activeIndex + 1);
  });
})();