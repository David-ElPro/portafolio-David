(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
  const decks = [];
  document.querySelectorAll('[data-deck]').forEach(stage => {
    if (stage.dataset.deck === 'fan') { setupFan(stage); return; }
    const shell = stage.parentElement;
    const cards = [...stage.children];
    const prev = shell.querySelector('button[id$="prev"]');
    const next = shell.querySelector('button[id$="next"]');
    if (!cards.length || !prev || !next) return;
    shell.classList.add('deck-shell');
    stage.classList.add('deck-stage');
    stage.tabIndex = 0;
    stage.setAttribute('role', 'region');
    stage.setAttribute('aria-roledescription', 'carousel');
    const heading = shell.parentElement.querySelector('h3');
    heading.id ||= stage.id + '-heading';
    stage.setAttribute('aria-labelledby', heading.id);
    const footer = document.createElement('div');
    footer.className = 'deck-footer';
    const status = document.createElement('span');
    status.className = 'deck-status';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    const hint = document.createElement('span');
    hint.className = 'deck-hint';
    footer.append(status, hint);
    shell.append(footer);
    let active = 0;
    let timer = null;
    let touchStart = null;
    let swiped = false;
    let focusTimer = null;
    const stop = () => { clearTimeout(timer); timer = null; };
    function updateLabels() {
      const en = document.documentElement.lang === 'en';
      status.textContent = `${String(active + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
      hint.textContent = hoverPointer.matches
        ? (en ? 'Hover to peek · Click to expand' : 'Pasa el cursor para asomar · Clic para ampliar')
        : (en ? 'Swipe to rotate · Tap to expand' : 'Desliza para girar · Toca para ampliar');
      stage.setAttribute('aria-roledescription', en ? '3D carousel' : 'carrusel 3D');
      cards.forEach((card, i) => card.setAttribute('aria-label', en ? `Design ${i + 1} of ${cards.length}` : `Diseño ${i + 1} de ${cards.length}`));
    }
    function render() {
      const compact = stage.clientWidth < 600;
      const radius = Math.min(stage.clientWidth * (compact ? .43 : .34), 365);
      cards.forEach((card, i) => {
        let offset = (i - active + cards.length) % cards.length;
        if (offset > cards.length / 2) offset -= cards.length;
        const angle = offset * Math.PI * 2 / cards.length;
        const depth = (1 - Math.cos(angle)) / 2;
        const x = Math.sin(angle) * radius;
        const z = -depth * (compact ? 250 : 360);
        const y = -depth * (compact ? 112 : 132);
        const rotation = Math.sin(angle) * -28;
        card.style.setProperty('--deck-x', `${x}px`);
        card.style.setProperty('--deck-y', `${y}px`);
        card.style.setProperty('--deck-z', `${z}px`);
        card.style.setProperty('--deck-angle', `${rotation}deg`);
        card.style.setProperty('--deck-blur', `${depth * 3.2}px`);
        card.style.setProperty('--deck-opacity', String(1 - depth * .68));
        card.style.zIndex = String(100 - Math.round(depth * 80));
        card.classList.toggle('is-active', i === active);
        card.dataset.offset = offset;
        card.querySelector('img').tabIndex = i === active ? 0 : -1;
      });
      stage.dataset.active = active;
      updateLabels();
    }
    function move(direction) {
      if (document.getElementById('image-modal').classList.contains('visible')) { stop(); return; }
      active = (active + direction + cards.length) % cards.length;
      render();
    }
    function arm(direction, delay = 450) {
      stop();
      if (!hoverPointer.matches || reducedMotion.matches) return;
      timer = setTimeout(() => {
        const rect = stage.getBoundingClientRect();
        if (document.hidden || rect.bottom < 0 || rect.top > innerHeight) { stop(); return; }
        move(direction);
        if (!document.getElementById('image-modal').classList.contains('visible')) arm(direction, 1050);
      }, delay);
    }
    [[prev, -1], [next, 1]].forEach(([button, direction]) => {
      button.classList.add('deck-arrow');
      button.disabled = false;
      button.setAttribute('aria-controls', stage.id);
      button.addEventListener('pointerenter', () => arm(direction));
      button.addEventListener('pointerleave', stop);
      button.addEventListener('pointercancel', stop);
      button.addEventListener('click', () => { stop(); move(direction); if (button.matches(':hover')) arm(direction, 1100); });
      button.addEventListener('blur', stop);
    });
    cards.forEach((card, i) => {
      card.classList.add('deck-card');
      card.setAttribute('role', 'group');
      const image = card.querySelector('img');
      image.draggable = false;
      // Prefetch these small galleries: transformed rear cards must never appear empty.
      image.loading = 'eager';
      image.addEventListener('focus', () => {
        if (active !== i) { active = i; render(); }
      });
    });
    stage.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      stop();
      if (e.key === 'Home') active = 0;
      else if (e.key === 'End') active = cards.length - 1;
      else active = (active + (e.key === 'ArrowRight' ? 1 : -1) + cards.length) % cards.length;
      render();
      if (e.target !== stage) {
        clearTimeout(focusTimer);
        focusTimer = setTimeout(() => cards[active].querySelector('img').focus({preventScroll: true}), reducedMotion.matches ? 0 : 650);
      }
    });
    stage.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'touch') return;
      touchStart = {x: e.clientX, y: e.clientY}; swiped = false;
    });
    stage.addEventListener('pointerup', e => {
      if (!touchStart) return;
      const dx = e.clientX - touchStart.x;
      const dy = e.clientY - touchStart.y;
      if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy)) { swiped = true; move(dx < 0 ? 1 : -1); }
      touchStart = null;
    });
    stage.addEventListener('pointercancel', () => { touchStart = null; });
    stage.addEventListener('click', e => {
      if (swiped) { e.stopImmediatePropagation(); e.preventDefault(); swiped = false; }
    }, true);
    const resize = new ResizeObserver(render);
    resize.observe(stage);
    document.addEventListener('visibilitychange', stop);
    document.getElementById('image-modal').addEventListener('click', stop);
    decks.push({updateLabels, stop});
    render();
  });
  // Google Ads uses a stationary hand of cards, not the cylindrical Facebook gallery.
  function setupFan(stage) {
    const shell = stage.parentElement;
    const cards = [...stage.children];
    const prev = shell.querySelector('button[id$="prev"]');
    const next = shell.querySelector('button[id$="next"]');
    if (!cards.length || !prev || !next) return;
    shell.classList.add('deck-shell', 'fan-shell');
    stage.classList.add('fan-stage');
    stage.setAttribute('role', 'group');
    const heading = shell.parentElement.querySelector('h3');
    heading.id ||= stage.id + '-heading';
    stage.setAttribute('aria-labelledby', heading.id);
    const footer = document.createElement('div');
    footer.className = 'deck-footer fan-footer';
    const status = document.createElement('span');
    status.className = 'deck-status';
    status.setAttribute('aria-live', 'polite');
    const hint = document.createElement('span');
    hint.className = 'deck-hint';
    const dots = document.createElement('div');
    dots.className = 'fan-dots';
    footer.append(status, hint);
    shell.append(footer, dots);
    let selected = -1;
    let touchSelected = -1;
    const buttons = [];
    function labels() {
      const en = document.documentElement.lang === 'en';
      status.textContent = selected < 0
        ? `${String(cards.length).padStart(2, '0')} ${en ? 'DESIGNS' : 'DISEÑOS'}`
        : `${String(selected + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
      hint.textContent = hoverPointer.matches
        ? (en ? 'Hover to peek · Click to expand' : 'Pasa el cursor para asomar · Clic para ampliar')
        : (en ? 'Tap to peek · Tap again to expand' : 'Toca para asomar · Otra vez para ampliar');
      stage.setAttribute('aria-roledescription', en ? 'Fanned card gallery' : 'Galería de cartas en abanico');
      buttons.forEach((button, i) => {
        button.setAttribute('aria-label', en ? `Preview design ${i + 1}` : `Asomar diseño ${i + 1}`);
        button.setAttribute('aria-pressed', String(selected === i));
      });
    }
    function select(index) {
      selected = index;
      cards.forEach((card, i) => card.classList.toggle('is-peeking', i === selected));
      stage.dataset.active = selected;
      labels();
    }
    cards.forEach((card, i) => {
      card.classList.add('fan-card');
      const face = document.createElement('div');
      face.className = 'fan-face';
      const image = card.querySelector('img');
      face.append(image);
      card.append(face);
      image.loading = 'eager';
      image.draggable = false;
      image.tabIndex = 0;
      card.style.setProperty('--fan-order', cards.length - i);
      card.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse' && hoverPointer.matches) select(i);
      });
      image.addEventListener('focus', () => select(i));
      // The first touch peeks; the second opens the existing full-image viewer.
      card.addEventListener('click', event => {
        if (!hoverPointer.matches && touchSelected !== i) {
          event.preventDefault();
          event.stopImmediatePropagation();
          touchSelected = i;
          select(i);
        }
      }, true);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fan-dot';
      button.addEventListener('click', () => { touchSelected = i; select(i); });
      buttons.push(button);
      dots.append(button);
    });
    function restore() {
      if (hoverPointer.matches && !stage.contains(document.activeElement)) select(-1);
    }
    stage.addEventListener('pointerleave', restore);
    stage.addEventListener('focusout', () => queueMicrotask(restore));
    stage.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let index = selected < 0 ? 0 : selected;
      if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = cards.length - 1;
      else index = (index + (event.key === 'ArrowRight' ? 1 : -1) + cards.length) % cards.length;
      select(index);
      cards[index].querySelector('img').focus({preventScroll: true});
    });
    [[prev, -1], [next, 1]].forEach(([button, direction]) => {
      button.classList.add('deck-arrow', 'fan-arrow');
      button.disabled = false;
      button.setAttribute('aria-controls', stage.id);
      button.addEventListener('click', () => {
        touchSelected = (Math.max(selected, 0) + direction + cards.length) % cards.length;
        select(touchSelected);
      });
    });
    function layout() {
      const compact = stage.clientWidth < 600;
      const cardWidth = compact ? 168 : 250;
      const spread = Math.min(stage.clientWidth - cardWidth - (compact ? 52 : 100), (cards.length - 1) * 110);
      cards.forEach((card, i) => {
        const t = cards.length === 1 ? 0 : i / (cards.length - 1) * 2 - 1;
        card.style.setProperty('--fan-x', `${t * spread / 2}px`);
        card.style.setProperty('--fan-y', `${Math.pow(Math.abs(t), 1.7) * (compact ? 24 : 36)}px`);
        card.style.setProperty('--fan-rotate', `${t * 15}deg`);
      });
      labels();
    }
    new ResizeObserver(layout).observe(stage);
    decks.push({updateLabels: labels, stop: () => {}});
    layout();
  }
  new MutationObserver(() => decks.forEach(d => d.updateLabels())).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
})();
