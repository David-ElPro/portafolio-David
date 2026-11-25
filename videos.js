(() => {
  'use strict';
  const section = document.getElementById('video-motion');
  if (!section) return;
  const copy = {
    es: {
      intro: 'Producción audiovisual, edición de video y contenido creativo para plataformas digitales.',
      featured: 'Proyectos audiovisuales', featuredNote: 'Videos destacados · Formato horizontal',
      shortNote: 'Historias pensadas para la pantalla vertical', experimental: 'Otros proyectos audiovisuales',
      all: 'Todos', play: 'Reproducir', close: 'Cerrar video', original: 'Abrir original ↗',
      fallback: '¿No carga el reproductor? Puedes ver el video en su plataforma original.',
      error: 'Este video no está disponible en el reproductor integrado. Ábrelo en su plataforma original.',
      promotional: 'Video promocional', platform: 'Plataforma', loading: 'Cargando reproductor…'
    },
    en: {
      intro: 'Audiovisual production, video editing, and creative content for digital platforms.',
      featured: 'Audiovisual projects', featuredNote: 'Featured videos · Landscape format',
      shortNote: 'Stories designed for the vertical screen', experimental: 'Other audiovisual projects',
      all: 'All', play: 'Play', close: 'Close video', original: 'Open original ↗',
      fallback: 'Player not loading? Watch the video on its original platform.',
      error: 'This video is unavailable in the embedded player. Open it on its original platform.',
      promotional: 'Promotional video', platform: 'Platform', loading: 'Loading player…'
    }
  };
  const language = () => document.documentElement.lang === 'en' ? 'en' : 'es';
  const t = key => copy[language()][key];
  const icons = {
    youtube: '<rect x="1" y="4" width="22" height="16" rx="5" fill="currentColor"/><path d="m10 8 6 4-6 4Z" fill="#111726"/>',
    tiktok: '<path d="M14 3v12a5 5 0 1 1-4-5m4-7c0 4 3 6 6 6" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
    vimeo: '<path d="M3 8c5-6 6 0 7 6 1 5 3 3 6-2 2-3 2-5-1-4 2-6 9-4 6 3-4 9-10 14-13 6L5 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>'
  };
  function svg(platform) {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = icons[platform] || icons.youtube;
    return icon;
  }
  function platformName(video) {
    return {youtube: video.type === 'horizontal' ? 'YouTube' : 'YouTube Shorts', tiktok: 'TikTok', instagram: 'Instagram', vimeo: 'Vimeo'}[video.platform];
  }
  function badge(video) {
    const el = document.createElement('span'); el.className = 'motion-platform'; el.dataset.platform = video.platform;
    el.append(svg(video.platform), document.createTextNode(platformName(video)));
    return el;
  }
  // Strict adapters: never embed a pasted arbitrary URL directly into a player.
  function parseVideo(video) {
    try {
      const url = new URL(video.url);
      if (url.protocol !== 'https:' || url.username || url.password) return null;
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      let id;
      if (video.platform === 'youtube' && ['youtube.com', 'youtu.be', 'm.youtube.com'].includes(host)) {
        id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})/)?.[1];
        if (!/^[\w-]{11}$/.test(id || '')) return null;
      } else if (video.platform === 'tiktok' && host === 'tiktok.com') {
        id = url.pathname.match(/^\/@[\w.-]+\/video\/(\d+)\/?$/)?.[1];
        if (!id) return null;
      } else if (video.platform === 'instagram' && host === 'instagram.com') {
        id = url.pathname.match(/^\/(?:reel|p|tv)\/([\w-]+)\/?$/)?.[1];
        if (!id) return null;
      } else if (video.platform === 'vimeo' && ['vimeo.com', 'player.vimeo.com'].includes(host)) {
        id = url.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([\w]+))?\/?$/)?.[1];
        if (!id) return null;
      } else return null;
      return {...video, mediaId: id};
    } catch { return null; }
  }
  const seen = new Set();
  const videos = (window.PORTFOLIO_VIDEOS || []).map(parseVideo).filter(video => {
    if (!video || !['horizontal', 'short', 'vertical'].includes(video.type)) return false;
    const key = `${video.platform}:${video.mediaId}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  const horizontal = document.getElementById('motion-horizontal');
  const vertical = document.getElementById('motion-vertical');
  const experimental = document.getElementById('motion-experimental');
  const filters = document.getElementById('motion-short-filters');
  const dialog = document.getElementById('motion-player-dialog');
  const mount = document.getElementById('motion-player-mount');
  const playerTitle = document.getElementById('motion-player-title');
  const playerDescription = document.getElementById('motion-player-description');
  const playerPlatform = document.getElementById('motion-player-platform');
  const message = document.getElementById('motion-player-message');
  const original = document.getElementById('motion-player-original');
  const close = document.getElementById('motion-player-close');
  let selectedPlatform = 'all';
  let current = null;
  let returnFocus = null;
  let bodyOverflow = '';
  let iframe = null;
  let failed = false;
  let instagramScript = null;
  const cardRecords = [];
  const filterRecords = [];
  function titleFor(video) { return video.title || `${platformName(video)} · ${String(video.ordinal).padStart(2, '0')}`; }
  function safeImage(src) {
    try { const url = new URL(src, location.href); return ['https:', 'http:', 'file:'].includes(url.protocol) && (url.protocol === 'https:' || url.origin === location.origin) ? url.href : ''; } catch { return ''; }
  }
  function createCard(video) {
    const article = document.createElement('article');
    article.className = 'motion-card'; article.dataset.format = video.type === 'horizontal' ? 'horizontal' : 'vertical'; article.dataset.platform = video.platform;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'motion-card-button'; button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-controls', dialog.id);
    const thumbnail = document.createElement('span'); thumbnail.className = 'motion-thumbnail';
    const placeholder = document.createElement('span'); placeholder.className = 'motion-placeholder'; placeholder.setAttribute('aria-hidden', 'true');
    const placeholderLabel = document.createElement('span'); placeholderLabel.textContent = platformName(video);
    placeholder.append(svg(video.platform), placeholderLabel); thumbnail.append(placeholder);
    let thumbnailUrl = video.thumbnail || (video.platform === 'youtube' ? `https://i.ytimg.com/vi/${video.mediaId}/hqdefault.jpg` : '');
    function setThumbnail(src) {
      const safe = safeImage(src); if (!safe) return;
      const image = document.createElement('img'); image.loading = 'lazy'; image.decoding = 'async'; image.alt = ''; image.width = video.type === 'horizontal' ? 640 : 360; image.height = video.type === 'horizontal' ? 360 : 640;
      image.addEventListener('error', () => { image.remove(); thumbnail.classList.add('has-placeholder'); });
      image.addEventListener('load', () => thumbnail.classList.remove('has-placeholder'));
      image.src = safe; thumbnail.append(image);
    }
    thumbnail.classList.add('has-placeholder');
    if (thumbnailUrl) setThumbnail(thumbnailUrl);
    // Vimeo permits public thumbnail metadata through its official oEmbed endpoint.
    if (!thumbnailUrl && video.platform === 'vimeo') {
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(video.url)}`, {signal: AbortSignal.timeout(8000)}).then(r => r.ok ? r.json() : null).then(data => { if (data?.thumbnail_url) setThumbnail(data.thumbnail_url); }).catch(() => {});
      }); observer.observe(article);
    }
    const platform = badge(video); platform.classList.add('motion-badge'); thumbnail.append(platform);
    const play = document.createElement('span'); play.className = 'motion-play'; play.setAttribute('aria-hidden', 'true'); play.innerHTML = '<svg viewBox="0 0 24 24"><path d="m7 3 14 9L7 21Z" fill="currentColor"/></svg>'; thumbnail.append(play);
    if (video.duration) { const duration = document.createElement('span'); duration.className = 'motion-duration'; duration.textContent = video.duration; thumbnail.append(duration); }
    const details = document.createElement('div'); details.className = 'motion-card-details';
    const label = document.createElement('span'); label.className = 'motion-card-label';
    const title = document.createElement('h4'); title.className = 'motion-card-title'; title.textContent = titleFor(video);
    details.append(label, title);
    if (video.description) { const description = document.createElement('p'); description.className = 'motion-card-description'; description.textContent = video.description; details.append(description); }
    button.append(thumbnail, details); article.append(button);
    button.addEventListener('click', () => openVideo(video, button));
    cardRecords.push({video, article, button, label});
    return article;
  }
  const ordinals = {};
  videos.forEach(video => {
    ordinals[video.platform] = (ordinals[video.platform] || 0) + 1;
    video.ordinal = ordinals[video.platform];
    (video.category === 'experimental' ? experimental : video.type === 'horizontal' ? horizontal : vertical).append(createCard(video));
  });
  document.getElementById('motion-experimental-group').hidden = !experimental.children.length;
  const shortPlatforms = [...new Set(videos.filter(v => v.type !== 'horizontal' && v.category !== 'experimental').map(v => v.platform))];
  ['all', ...shortPlatforms].forEach(platform => {
    const button = document.createElement('button'); button.className = 'motion-filter'; button.type = 'button';
    if (platform !== 'all') button.append(badge(videos.find(v => v.platform === platform && v.type !== 'horizontal')));
    button.addEventListener('click', () => {
      selectedPlatform = platform;
      cardRecords.forEach(({video, article}) => { if (article.parentElement === vertical) article.hidden = platform !== 'all' && video.platform !== platform; });
      updateLanguage();
    });
    filterRecords.push({button, platform}); filters.append(button);
  });
  function showFailure() {
    if (!dialog.open) return;
    failed = true;
    iframe = null;
    mount.replaceChildren();
    const notice = document.createElement('p'); notice.className = 'motion-player-error'; notice.textContent = t('error'); mount.append(notice);
    message.textContent = t('error');
  }
  function addIframe(src) {
    iframe = document.createElement('iframe'); iframe.src = src; iframe.title = `${platformName(current)} — ${titleFor(current)}`; iframe.loading = 'lazy';
    iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write; web-share';
    iframe.allowFullscreen = true; iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.addEventListener('error', showFailure);
    mount.append(iframe);
  }
  function loadInstagram() {
    if (window.instgrm?.Embeds) return Promise.resolve();
    if (instagramScript) return instagramScript;
    instagramScript = new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = 'https://www.instagram.com/embed.js'; script.async = true;
      script.onload = resolve; script.onerror = () => { instagramScript = null; script.remove(); reject(new Error('Instagram unavailable')); };
      document.head.append(script);
    });
    return instagramScript;
  }
  function openVideo(video, trigger) {
    current = video; returnFocus = trigger; failed = false;
    bodyOverflow = document.body.style.overflow;
    dialog.classList.toggle('is-vertical', video.type !== 'horizontal'); dialog.classList.toggle('is-instagram', video.platform === 'instagram');
    mount.replaceChildren(); updatePlayerLabels();
    original.href = video.url; dialog.showModal(); document.body.style.overflow = 'hidden'; close.focus();
    // Official player URL formats; no external player is created before a card is selected.
    // https://developers.google.com/youtube/player_parameters
    // https://developers.tiktok.com/doc/embed-player
    if (video.platform === 'youtube') addIframe(`https://www.youtube-nocookie.com/embed/${video.mediaId}?autoplay=1&rel=0&playsinline=1`);
    else if (video.platform === 'tiktok') addIframe(`https://www.tiktok.com/player/v1/${video.mediaId}?autoplay=1&controls=1&description=0&music_info=0`);
    else if (video.platform === 'vimeo') {
      const source = new URL(video.url);
      const hash = source.searchParams.get('h') || source.pathname.match(/^\/\d+\/([\w]+)\/?$/)?.[1];
      addIframe(`https://player.vimeo.com/video/${video.mediaId}?autoplay=1&dnt=1${hash ? `&h=${encodeURIComponent(hash)}` : ''}`);
    } else if (video.platform === 'instagram') {
      // Official public-post markup; private/disabled embeds retain the original-link fallback.
      const blockquote = document.createElement('blockquote'); blockquote.className = 'instagram-media'; blockquote.dataset.instgrmPermalink = video.url; blockquote.dataset.instgrmVersion = '14';
      const link = document.createElement('a'); link.href = video.url; link.textContent = t('original'); link.target = '_blank'; link.rel = 'noopener noreferrer'; blockquote.append(link); mount.append(blockquote);
      loadInstagram().then(() => { if (dialog.open && current === video) window.instgrm?.Embeds.process(); }).catch(() => { if (dialog.open && current === video) showFailure(); });
    }
  }
  function updatePlayerLabels() {
    close.setAttribute('aria-label', t('close')); original.textContent = t('original');
    if (!current) return;
    playerTitle.textContent = titleFor(current); playerDescription.textContent = current.description || ''; playerDescription.hidden = !current.description;
    playerPlatform.replaceChildren(badge(current)); message.textContent = t(failed ? 'error' : 'fallback');
    const error = mount.querySelector('.motion-player-error'); if (error) error.textContent = t('error');
  }
  function updateLanguage() {
    section.querySelectorAll('[data-motion-copy]').forEach(el => el.textContent = t(el.dataset.motionCopy));
    filters.setAttribute('aria-label', t('platform'));
    filterRecords.forEach(({button, platform}) => { if (platform === 'all') button.textContent = t('all'); button.setAttribute('aria-pressed', String(platform === selectedPlatform)); });
    cardRecords.forEach(({video, button, label}) => { button.setAttribute('aria-label', `${t('play')}: ${titleFor(video)} — ${platformName(video)}`); label.textContent = video.type === 'horizontal' ? `${t('promotional')} · 16:9` : `${platformName(video)} · 9:16`; });
    updatePlayerLabels();
  }
  function cleanup() {
    // Removing the frame (rather than merely hiding it) stops playback and audio.
    mount.replaceChildren(); iframe = null; current = null;
    document.body.style.overflow = bodyOverflow; returnFocus?.focus({preventScroll: true});
  }
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', cleanup);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  window.addEventListener('message', event => {
    if (!dialog.open || !iframe || current?.platform !== 'tiktok' || event.source !== iframe.contentWindow || event.origin !== 'https://www.tiktok.com') return;
    if (event.data?.['x-tiktok-player'] && event.data.type === 'onPlayerError' && event.data.value?.errorCode !== 3002) showFailure();
  });
  new MutationObserver(updateLanguage).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  updateLanguage();
})();
