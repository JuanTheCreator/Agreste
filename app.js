// ==== Lazy loading con IntersectionObserver ====
(function(){
  const tiles = Array.from(document.querySelectorAll('.tile'));
  const images = Array.from(document.querySelectorAll('.js-lazy'));

  const onEnter = (entry) => {
    const img = entry.target;
    const tile = img.closest('.tile') || img.closest('.product-card');
    if (tile) {
      tile.classList.add('is-visible');
    } else {
      console.warn('No se encontró un contenedor válido para la imagen:', img);
    }
    img.src = img.dataset.src;
    img.addEventListener('load', () => {
      if (tile) {
        tile.classList.add('is-visible');
      }
    }, { once: true });
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onEnter(entry);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px 0px' });
    images.forEach(img => io.observe(img));
  } else {
    // Fallback
    images.forEach(img => { img.src = img.dataset.src; });
    tiles.forEach(t => t.classList.add('is-visible'));
  }
})();

// ==== Conectar menú principal y offcanvas a módulos (nueva pestaña) ====
(function(){
  try {
    const urls = [
      'categorias.html',
      'cotizar.html',
      'proyectos.html',
      'novedades.html',
      'compania.html',
      'contacto.html'
    ];
    console.log('URLs loaded:', urls);

    const top = Array.from(document.querySelectorAll('.nav .nav__item > .nav__link'));
    console.log('Top navigation links:', top);

    top.forEach((el, i) => {
      if (!urls[i]) return;
      if (el.classList.contains('nav__link--direct')) {
        el.setAttribute('href', urls[i]);
        el.setAttribute('role', 'link');
        console.log(`Direct link set for ${el.textContent}: ${urls[i]}`);
        return;
      }
      // No alteramos estilos/markup: interceptamos click y abrimos en pestaña nueva
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(urls[i], '_blank');
        console.log(`Opening ${urls[i]} in a new tab.`);
      });
      el.setAttribute('role', 'link');
      el.setAttribute('aria-label', (el.textContent || 'Sección') + ' (abre en nueva pestaña)');
    });
    // Subitems (dropdown) -> anclas internas en módulos
    const subSlugs = [
      ['mesas','estanterias','organizadores','decoracion'],
      ['tablas','porta-cuchillos','bandejas','accesorios'],
      ['escritorios','soportes','organizadores'],
      ['grabado-laser','a-medida','proyectos'],
      ['pino','roble','nogal','teka'],
      []
    ];
    const items = Array.from(document.querySelectorAll('.nav .nav__item'));
    items.forEach((item, i) => {
      const links = Array.from(item.querySelectorAll('.nav__dropdown a'));
      links.forEach((a, j) => {
        const slug = subSlugs[i] && subSlugs[i][j];
        const base = urls[i];
        if (!slug || !base) return;
        const href = `${base}#${slug}`;
        a.addEventListener('click', (e) => { e.preventDefault(); window.open(href, '_blank'); });
        a.setAttribute('href', href);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      });
    });
    const off = Array.from(document.querySelectorAll('.offcanvas__nav a'));
    // Etiquetas de submódulos para offcanvas
    const subLabels = [
      ['Mesas','Estanterías','Organizadores','Decoración'],
      ['Tablas','Porta cuchillos','Bandejas','Accesorios'],
      ['Escritorios','Soportes','Organizadores'],
      ['Grabado láser','A medida','Proyectos'],
      ['Pino','Roble','Nogal','Teka'],
      []
    ];
    function toggleOffSubmenu(anchor, i){
      const labels = subLabels[i] || [];
      const slugs = subSlugs[i] || [];
      if (!labels.length || !slugs.length) {
        window.open(urls[i], '_blank');
        return;
      }
      const next = anchor.nextElementSibling;
      const isSub = next && next.classList && next.classList.contains('offcanvas__subnav');
      if (isSub){
        // Animar cierre y luego eliminar
        next.classList.remove('is-open');
        next.addEventListener('transitionend', () => { if (next && next.parentNode) next.parentNode.removeChild(next); }, { once: true });
        anchor.setAttribute('aria-expanded', 'false');
        return;
      }
      // Cerrar otros submenús abiertos (modo acordeón)
      const container = anchor.closest('.offcanvas__panel') || document;
      const openSubs = Array.from(container.querySelectorAll('.offcanvas__subnav.is-open'));
      openSubs.forEach(subOpen => {
        const prevAnchor = subOpen.previousElementSibling;
        subOpen.classList.remove('is-open');
        subOpen.addEventListener('transitionend', () => { if (subOpen && subOpen.parentNode) subOpen.parentNode.removeChild(subOpen); }, { once: true });
        if (prevAnchor) prevAnchor.setAttribute('aria-expanded', 'false');
      });
      // Crea submenú
      const sub = document.createElement('div');
      sub.className = 'offcanvas__subnav';
      labels.forEach((label, j) => {
        const s = slugs[j];
        if (!s) return;
        const link = document.createElement('a');
        link.href = `${urls[i]}#${s}`;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = label;
        sub.appendChild(link);
      });
      anchor.insertAdjacentElement('afterend', sub);
      // Forzar reflow y abrir con animación
      void sub.offsetHeight; // reflow
      sub.classList.add('is-open');
      anchor.setAttribute('aria-expanded', 'true');
    }
    off.forEach((a, i) => {
      if (!urls[i]) return;
      a.href = urls[i];
      const hasSub = Array.isArray(subSlugs[i]) && subSlugs[i].length;
      if (!hasSub) {
        a.removeAttribute('aria-expanded');
        a.removeAttribute('target');
        a.removeAttribute('rel');
        return;
      }
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-expanded', 'false');
      a.addEventListener('click', (e) => {
        // Ctrl/Cmd/Shift: abrir en pestaña; Click normal: toggle submenú
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        toggleOffSubmenu(a, i);
      });
    });
  } catch (_) {}
})();

// ==== Panel de ayuda ====
(function(){
  const panel = document.getElementById('help-panel');
  if (!panel) return;
  const toggles = Array.from(document.querySelectorAll('.js-help-toggle'));
  if (!toggles.length) return;
  const closeEls = Array.from(panel.querySelectorAll('[data-help-close]'));
  let isOpen = false;
  let lastFocus = null;
  function getFocusTarget(){
    return panel.querySelector('[data-help-focus]') || panel.querySelector('.help-panel__close');
  }
  function focusElement(el){
    if (!(el instanceof HTMLElement)) return;
    setTimeout(() => {
      try { el.focus({ preventScroll: true }); }
      catch (err) { el.focus(); }
    }, 10);
  }
  function setOpen(open){
    if (isOpen === open) return;
    isOpen = open;
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('help-open', open);
    toggles.forEach(btn => btn.setAttribute('aria-expanded', String(open)));
    if (open){
      const menuToggle = document.querySelector('.header__menu-btn');
      if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true') {
        menuToggle.click();
      }
      lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      focusElement(getFocusTarget());
    } else {
      focusElement(lastFocus);
      lastFocus = null;
    }
  }
  toggles.forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      setOpen(!isOpen);
    });
  });
  closeEls.forEach(el => el.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      setOpen(false);
    }
  });
})();

// ==== Panel de autenticación ====
(function(){
  const panel = document.getElementById('auth-panel');
  if (!panel) return;
  const toggles = Array.from(document.querySelectorAll('.js-auth-toggle'));
  if (!toggles.length) return;
  const closeEls = Array.from(panel.querySelectorAll('[data-auth-close]'));
  const form = panel.querySelector('.auth-form');
  const emailInput = panel.querySelector('#auth-email');
  const submitBtn = form ? form.querySelector('.auth-form__submit') : null;
  let isOpen = false;
  let lastFocus = null;
  function focusElement(el){
    if (!(el instanceof HTMLElement)) return;
    setTimeout(() => {
      try { el.focus({ preventScroll: true }); }
      catch (err) { el.focus(); }
    }, 10);
  }
  function showToast(message){
    const prev = document.querySelector('.toast');
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
    const toast = document.createElement('div');
    toast.className = 'toast toast--success';
    toast.setAttribute('role','status');
    toast.setAttribute('aria-live','polite');
    toast.textContent = message;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast__close';
    close.setAttribute('aria-label','Cerrar');
    close.textContent = '\\u00D7';
    toast.appendChild(close);
    document.body.appendChild(toast);
    void toast.offsetHeight;
    toast.classList.add('is-visible');
    const remove = () => {
      toast.classList.remove('is-visible');
      toast.addEventListener('transitionend', () => { if (toast && toast.parentNode) toast.parentNode.removeChild(toast); }, { once: true });
    };
    close.addEventListener('click', remove);
    setTimeout(remove, 2400);
  }
  function closeHelpPanel(){
    const help = document.getElementById('help-panel');
    if (!help || !help.classList.contains('is-open')) return;
    const closer = help.querySelector('[data-help-close]');
    if (closer) closer.click();
  }
  function setOpen(open){
    if (isOpen === open) return;
    isOpen = open;
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('auth-open', open);
    toggles.forEach(btn => btn.setAttribute('aria-expanded', String(open)));
    if (open){
      closeHelpPanel();
      const menuToggle = document.querySelector('.header__menu-btn');
      if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true') {
        menuToggle.click();
      }
      lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      focusElement(emailInput || panel.querySelector('.auth-panel__close'));
    } else {
      if (form) form.reset();
      if (submitBtn){ submitBtn.disabled = false; submitBtn.textContent = 'Iniciar sesión'; }
      focusElement(lastFocus);
      lastFocus = null;
    }
  }
  toggles.forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      setOpen(!isOpen);
    });
  });
  closeEls.forEach(el => el.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      setOpen(false);
    }
  });
  if (form){
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (submitBtn){
        submitBtn.disabled = true;
        submitBtn.textContent = 'Ingresando...';
      }
      showToast('Bienvenido de nuevo a Agreste.');
      setTimeout(() => {
        setOpen(false);
      }, 1200);
    });
  }
})();

// ==== Envío formulario de contacto (WhatsApp) ====
(function(){
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name: form.querySelector('#cf-name'),
    email: form.querySelector('#cf-email'),
    phone: form.querySelector('#cf-phone'),
    subject: form.querySelector('#cf-subject'),
    message: form.querySelector('#cf-message')
  };

  function getGroup(el){ return el.closest('.form__group') || el.parentElement; }

  function getOrCreateErrorEl(el){
    const group = getGroup(el);
    let err = group.querySelector('.form__error');
    if (!err){
      err = document.createElement('small');
      err.className = 'form__error';
      err.id = 'err-' + (el.id || Math.random().toString(36).slice(2));
      group.appendChild(err);
    }
    return err;
  }

  function setError(el, msg){
    const group = getGroup(el);
    const err = getOrCreateErrorEl(el);
    err.textContent = msg || '';
    group.classList.toggle('invalid', !!msg);
    el.classList.toggle('is-invalid', !!msg);
    el.classList.toggle('is-valid', !msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    el.setAttribute('aria-describedby', err.id);
  }

  function validateField(el){
    const v = (el.value || '').trim();
    const name = el.name;
    if (name === 'name'){
      if (v.length < 2) { setError(el, 'Ingresa tu nombre.'); return false; }
    }
    if (name === 'email'){
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!ok) { setError(el, 'Ingresa un email válido.'); return false; }
    }
    if (name === 'phone'){
      const ok = /^[0-9+\-\s]{7,15}$/.test(v);
      if (!ok) { setError(el, 'Ingresa un teléfono válido.'); return false; }
    }
    if (name === 'message'){
      if (v.length < 20) { setError(el, 'Escribe al menos 20 caracteres.'); return false; }
    }
    setError(el, '');
    return true;
  }

  // Blur/input handlers
  ['name','email','phone','message','subject'].forEach(key => {
    const el = fields[key];
    if (!el) return;
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => { if (el.classList.contains('is-invalid')) validateField(el); });
  });

  function validateForm(){
    let firstInvalid = null;
    ['name','email','phone','message'].forEach(key => {
      const el = fields[key];
      if (!el) return;
      const ok = validateField(el);
      if (!ok && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid){ firstInvalid.focus(); }
    return !firstInvalid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const phone = fields.phone.value.trim();
    const subject = (fields.subject.value || 'Nueva solicitud de contacto').trim();
    const message = fields.message.value.trim();
    const dest = '56957500385';
    const plain = `Hola, soy ${name}.\nEmail: ${email}\nTeléfono: ${phone}\nAsunto: ${subject}\n\n${message}`;
    const url = `https://wa.me/${dest}?text=${encodeURIComponent(plain)}`;
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Abriendo WhatsApp…'; }
    // Copia el mensaje como respaldo
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(plain).catch(()=>{});
    }
    // Reset de formulario y feedback visual
    form.reset();
    Object.values(fields).forEach(el => { if (!el) return; el.classList.remove('is-invalid','is-valid'); const g = el.closest('.form__group'); if (g) g.classList.remove('invalid'); });
    // Toast de éxito
    const prevToast = document.querySelector('.toast'); if (prevToast && prevToast.parentNode) prevToast.parentNode.removeChild(prevToast);
    const toast = document.createElement('div');
    toast.className = 'toast toast--success';
    toast.setAttribute('role','status');
    toast.setAttribute('aria-live','polite');
    toast.textContent = 'Mensaje copiado. Abriendo WhatsApp…';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast__close';
    closeBtn.setAttribute('aria-label','Cerrar');
    closeBtn.textContent = '\\u00D7';
    toast.appendChild(closeBtn);
    document.body.appendChild(toast);
    // Forzar reflow y mostrar
    void toast.offsetHeight; toast.classList.add('is-visible');
    const dismiss = () => {
      toast.classList.remove('is-visible');
      toast.addEventListener('transitionend', () => { if (toast && toast.parentNode) toast.parentNode.removeChild(toast); }, { once: true });
      if (btn) { btn.disabled = false; btn.textContent = 'Enviar por WhatsApp'; }
    };
    closeBtn.addEventListener('click', dismiss);
    // Navega a WhatsApp rápidamente y cierra toast
    setTimeout(() => { window.location.href = url; }, 250);
    setTimeout(dismiss, 1800);
  });
})();

// ==== Reveal de secciones al entrar al viewport ====
(function(){
  const sections = Array.from(document.querySelectorAll('.section'));
  if (!sections.length) return;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    sections.forEach(s => io.observe(s));
  } else {
    sections.forEach(s => s.classList.add('is-in'));
  }
})();

// ==== Carrusel y filtros de productos (sección ofertas) ====
(function(){
  const section = document.querySelector('section.products');
  if (!section) return;

  const row = section.querySelector('.js-products-row');
  const prev = section.querySelector('.products__nav--prev');
  const next = section.querySelector('.products__nav--next');
  const pills = Array.from(section.querySelectorAll('.pill'));
  const cards = Array.from(section.querySelectorAll('.product-card'));

  function applyFilter(key){
    const toShow = [];
    const toHide = [];
    cards.forEach(card => {
      const tags = (card.dataset.tags || '').split(/\s+/);
      const show = key === 'todos' || tags.includes(key);
      (show ? toShow : toHide).push(card);
    });
    toHide.forEach(card => {
      card.classList.remove('is-shown');
      card.style.display = 'none';
      card.setAttribute('aria-hidden', 'true');
    });
    if (row) { row.classList.add('is-swapping'); setTimeout(() => row.classList.remove('is-swapping'), 260); }
    toShow.forEach((card, idx) => {
      card.style.display = 'flex';
      card.setAttribute('aria-hidden', 'false');
      card.style.setProperty('--delay', `${Math.min(idx * 50, 300)}ms`);
      requestAnimationFrame(() => card.classList.add('is-shown'));
    });
  }

  pills.forEach(btn => {
    btn.addEventListener('click', () => {
      pills.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.dataset.filter || 'todos');
    });
  });

  if (pills.length) applyFilter((section.querySelector('.pill.is-active') || pills[0]).dataset.filter || 'todos');

  function scrollByAmount(dir){
    if (!row) return;
    // Desplazamiento más pequeño: aproximadamente el ancho de una tarjeta
    const cardWidth = 280; // Ancho aproximado de una tarjeta de producto
    const amount = cardWidth + 20; // Añadimos un poco de margen
    row.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }
  // Navegación con efecto y paso proporcional a la vista
  function scrollByAmount2(dir){
    if (!row) return;
    const amount = Math.round(row.clientWidth * 0.9);
    row.scrollBy({ left: dir * amount, behavior: 'smooth' });
    row.classList.add(dir > 0 ? 'bump-right' : 'bump-left');
    setTimeout(() => row.classList.remove('bump-right', 'bump-left'), 240);
  }
  prev && prev.addEventListener('click', () => scrollByAmount2(-1));
  next && next.addEventListener('click', () => scrollByAmount2(1));
})();

// ==== Mejora de navegación: estados de flechas y teclado en carrusel de productos ====
(function(){
  const section = document.querySelector('section.products');
  if (!section) return;
  
  const row = section.querySelector('.js-products-row');
  const prevOriginal = section.querySelector('.products__nav--prev');
  const nextOriginal = section.querySelector('.products__nav--next');
  
  if (!row || !prevOriginal || !nextOriginal) return;

  // Reemplaza botones para limpiar posibles listeners previos
  const prevBtn = prevOriginal.cloneNode(true); 
  const nextBtn = nextOriginal.cloneNode(true);
  prevOriginal.replaceWith(prevBtn);
  nextOriginal.replaceWith(nextBtn);

  // Añadir contenido a los botones si están vacíos
  if (!prevBtn.textContent.trim()) {
    prevBtn.innerHTML = '‹';
  }
  if (!nextBtn.textContent.trim()) {
    nextBtn.innerHTML = '›';
  }

  function updateNav(){
    const maxScroll = Math.max(0, row.scrollWidth - row.clientWidth);
    const currentScroll = row.scrollLeft;
    
    prevBtn.toggleAttribute('disabled', currentScroll <= 5);
    nextBtn.toggleAttribute('disabled', currentScroll >= maxScroll - 5);
  }
  
  function scrollByView(dir){
    const containerWidth = row.clientWidth;
    const cardWidth = 280; // Ancho aproximado de una tarjeta de producto
    
    // En móviles, scrollear una tarjeta; en desktop, scrollear múltiples
    const isMobile = window.innerWidth <= 768;
    const scrollAmount = isMobile ? cardWidth : Math.round(containerWidth * 0.8);
    
    row.scrollBy({ 
      left: dir * scrollAmount, 
      behavior: 'smooth' 
    });
    
    // Actualizar navegación después del scroll
    setTimeout(updateNav, 300);
  }

  // Event listeners para los botones
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollByView(-1);
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollByView(1);
  });

  // Event listener para scroll manual
  row.addEventListener('scroll', () => {
    requestAnimationFrame(updateNav);
  }, { passive: true });

  // Soporte de teclado
  row.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { 
      e.preventDefault(); 
      scrollByView(1); 
    }
    if (e.key === 'ArrowLeft') { 
      e.preventDefault(); 
      scrollByView(-1); 
    }
  });

  // Inicializar navegación
  setTimeout(updateNav, 100);
  
  // Actualizar en resize
  window.addEventListener('resize', () => {
    setTimeout(updateNav, 100);
  });
})();

// ==== Carrusel de categorías (slider horizontal) ====
(function(){
  const section = document.querySelector('section.categories');
  if (!section) return;
  
  const row = section.querySelector('.js-cats-row');
  const prevOriginal = section.querySelector('.categories__nav--prev');
  const nextOriginal = section.querySelector('.categories__nav--next');
  
  if (!row || !prevOriginal || !nextOriginal) return;

  // Clonar botones para limpiar event listeners anteriores
  const prevBtn = prevOriginal.cloneNode(true); 
  const nextBtn = nextOriginal.cloneNode(true);
  prevOriginal.replaceWith(prevBtn);
  nextOriginal.replaceWith(nextBtn);

  // Añadir contenido a los botones si están vacíos
  if (!prevBtn.textContent.trim()) {
    prevBtn.innerHTML = '‹';
  }
  if (!nextBtn.textContent.trim()) {
    nextBtn.innerHTML = '›';
  }

  function updateNav(){
    const maxScroll = Math.max(0, row.scrollWidth - row.clientWidth);
    const currentScroll = row.scrollLeft;
    
    prevBtn.toggleAttribute('disabled', currentScroll <= 5);
    nextBtn.toggleAttribute('disabled', currentScroll >= maxScroll - 5);
  }
  
  function scrollByView(dir){
    const containerWidth = row.clientWidth;
    const cardWidth = 320; // Ancho aproximado de una tarjeta de categoría
    
    // En móviles, scrollear una tarjeta completa; en desktop, scrollear múltiples
    const isMobile = window.innerWidth <= 768;
    const scrollAmount = isMobile ? cardWidth : Math.round(containerWidth * 0.8);
    
    row.scrollBy({ 
      left: dir * scrollAmount, 
      behavior: 'smooth' 
    });
    
    // Efectos visuales
    row.classList.add(dir > 0 ? 'bump-right' : 'bump-left');
    setTimeout(() => row.classList.remove('bump-right', 'bump-left'), 240);
    
    // Actualizar navegación después del scroll
    setTimeout(updateNav, 300);
  }

  // Event listeners para los botones
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollByView(-1);
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollByView(1);
  });

  // Event listener para scroll manual
  row.addEventListener('scroll', () => {
    requestAnimationFrame(updateNav);
  }, { passive: true });

  // Soporte de teclado
  row.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { 
      e.preventDefault(); 
      scrollByView(1); 
    }
    if (e.key === 'ArrowLeft') { 
      e.preventDefault(); 
      scrollByView(-1); 
    }
  });

  // Touch/swipe soporte básico
  let startX = 0;
  let scrollLeft = 0;
  let isDown = false;

  row.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - row.offsetLeft;
    scrollLeft = row.scrollLeft;
  }, { passive: true });

  row.addEventListener('touchend', () => {
    isDown = false;
    updateNav();
  }, { passive: true });

  row.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.touches[0].pageX - row.offsetLeft;
    const walk = (x - startX) * 2;
    row.scrollLeft = scrollLeft - walk;
  });

  // Inicializar navegación
  setTimeout(updateNav, 100);
  
  // Actualizar en resize
  window.addEventListener('resize', () => {
    setTimeout(updateNav, 100);
  });
})();

// ==== Mobile Navigation Menu ====
(function(){
  const mobileNav = document.getElementById('mobile-menu');
  const hamburgerBtn = document.querySelector('.hamburger');
  const toggles = Array.from(document.querySelectorAll('.js-menu-toggle'));
  const expandableItems = Array.from(document.querySelectorAll('.mobile-nav__item--expandable'));
  const body = document.body;
  let isOpen = false;
  let focusedElementBeforeOpen = null;

  // Función para abrir/cerrar el menú principal
  function setOpen(open) {
    if (isOpen === open) return;
    
    isOpen = open;
    
    // Actualizar clases y atributos
    mobileNav.classList.toggle('is-open', open);
    mobileNav.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('mobile-menu-open', open);
    
    // Animar el botón hamburguesa
    if (hamburgerBtn) {
      hamburgerBtn.classList.toggle('is-active', open);
      hamburgerBtn.setAttribute('aria-expanded', String(open));
    }
    
    // Gestión del foco para accesibilidad
    if (open) {
      focusedElementBeforeOpen = document.activeElement;
      // Enfocar el botón de cerrar después de que se abra
      setTimeout(() => {
        const closeBtn = mobileNav.querySelector('.mobile-nav__close');
        if (closeBtn) closeBtn.focus();
      }, 100);
    } else {
      // Restaurar foco al elemento anterior
      if (focusedElementBeforeOpen && focusedElementBeforeOpen.focus) {
        focusedElementBeforeOpen.focus();
      }
      focusedElementBeforeOpen = null;
      
      // Cerrar todos los submenús al cerrar el menú principal
      closeAllSubmenus();
    }
  }

  // Función para manejar submenús expandibles
  function toggleSubmenu(button) {
    const submenu = button.nextElementSibling;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const arrow = button.querySelector('.mobile-nav__arrow');
    
    if (!submenu) return;
    
    // Cerrar otros submenús abiertos (comportamiento acordeón)
    expandableItems.forEach(item => {
      if (item !== button.parentElement) {
        const otherButton = item.querySelector('.mobile-nav__toggle');
        const otherSubmenu = item.querySelector('.mobile-nav__submenu');
        if (otherButton && otherSubmenu) {
          otherButton.setAttribute('aria-expanded', 'false');
          otherSubmenu.setAttribute('aria-hidden', 'true');
          otherSubmenu.classList.remove('is-open');
          const otherArrow = otherButton.querySelector('.mobile-nav__arrow');
          if (otherArrow) otherArrow.classList.remove('is-rotated');
        }
      }
    });
    
    // Toggle del submenú actual
    const newExpandedState = !isExpanded;
    button.setAttribute('aria-expanded', String(newExpandedState));
    submenu.setAttribute('aria-hidden', String(!newExpandedState));
    submenu.classList.toggle('is-open', newExpandedState);
    
    if (arrow) {
      arrow.classList.toggle('is-rotated', newExpandedState);
    }
  }

  // Función para cerrar todos los submenús
  function closeAllSubmenus() {
    expandableItems.forEach(item => {
      const button = item.querySelector('.mobile-nav__toggle');
      const submenu = item.querySelector('.mobile-nav__submenu');
      const arrow = button?.querySelector('.mobile-nav__arrow');
      
      if (button && submenu) {
        button.setAttribute('aria-expanded', 'false');
        submenu.setAttribute('aria-hidden', 'true');
        submenu.classList.remove('is-open');
        if (arrow) arrow.classList.remove('is-rotated');
      }
    });
  }

  // Event listeners para toggle del menú principal
  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setOpen(!isOpen);
    });
  });

  // Event listeners para submenús expandibles
  expandableItems.forEach(item => {
    const button = item.querySelector('.mobile-nav__toggle');
    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSubmenu(button);
      });
    }
  });

  // Cerrar menú con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      setOpen(false);
    }
  });

  // Trap focus dentro del menú cuando está abierto
  document.addEventListener('keydown', (e) => {
    if (!isOpen || e.key !== 'Tab') return;
    
    const focusableElements = mobileNav.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });

  // Cerrar menú al hacer clic en enlaces (excepto toggles de submenú)
  mobileNav.addEventListener('click', (e) => {
    const target = e.target;
    const isLink = target.tagName === 'A' || target.closest('a');
    const isToggle = target.classList.contains('mobile-nav__toggle') || 
                    target.closest('.mobile-nav__toggle');
    
    if (isLink && !isToggle) {
      // Pequeño delay para permitir navegación suave
      setTimeout(() => setOpen(false), 100);
    }
  });

  // Prevenir scroll del body cuando el menú está abierto
  mobileNav.addEventListener('touchmove', (e) => {
    if (isOpen && !e.target.closest('.mobile-nav__content')) {
      e.preventDefault();
    }
  }, { passive: false });

  // Inicialización: asegurar estado correcto
  if (mobileNav) {
    mobileNav.setAttribute('aria-hidden', 'true');
    if (hamburgerBtn) {
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  }
})();

// ==== Overlay en móvil: primer tap muestra overlay, segundo navega ====
(function(){
  const tiles = Array.from(document.querySelectorAll('.tile'));
  let activeTile = null;

  function clearActive(){
    if (activeTile){
      activeTile.classList.remove('tile--active');
      activeTile = null;
    }
  }

  // Cerrar con tap/click fuera
  document.addEventListener('click', (e) => {
    if (activeTile && !activeTile.contains(e.target)) {
      clearActive();
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') clearActive();
  });

  // Gestión por pointer (detecta táctil)
  tiles.forEach(tile => {
    tile.addEventListener('pointerdown', (e) => {
      const isTouch = e.pointerType === 'touch';
      if (!isTouch) return; // Desktop/mouse: sin bloquear navegación

      if (activeTile !== tile){
        // Primer tap: mostramos overlay y prevenimos navegación
        e.preventDefault();
        clearActive();
        activeTile = tile;
        tile.classList.add('tile--active');
      } else {
        // Segundo tap: permitir navegación (no preventDefault)
        clearActive();
      }
    }, { passive: false });
  });
})();
// ==== Aviso de cookies ====/
(function(){
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  const storageKey = 'agreste-cookie-consent';
  let hasConsent = false;
  try {
    hasConsent = localStorage.getItem(storageKey) === 'accepted';
  } catch (err) {
    console.warn('No se pudo acceder a localStorage para cookies:', err);
  }
  if (hasConsent) return;
  banner.removeAttribute('hidden');
  const acceptBtn = banner.querySelector('[data-cookie-accept]');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      banner.setAttribute('hidden', '');
      try {
        localStorage.setItem(storageKey, 'accepted');
      } catch (err) {
        console.warn('No se pudo guardar el consentimiento de cookies:', err);
      }
    });
  }
})();

// ==== Chatbot Modal ====
(function(){
  const bubble = document.getElementById('chatbot-bubble');
  const modal = document.getElementById('chatbot-modal');
  
  if (!bubble || !modal) return;
  
  const trigger = bubble.querySelector('.chatbot-bubble__trigger');
  const closeBtn = modal.querySelector('.chatbot-modal__close');
  const overlay = modal.querySelector('.chatbot-modal__overlay');
  const messagesContainer = modal.querySelector('.chatbot-modal__messages');
  
  let isOpen = false;
  
  // Variables para almacenar datos del chat
  let chatData = {
    category: '',
    userMessages: [],
    fullSpecs: ''
  };
  
  // Mensajes iniciales del chatbot
  const initialMessages = `
    <div class="chatbot-message chatbot-message--bot">
      <div class="chatbot-message__avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div class="chatbot-message__content">
        <p>¡Hola! 👋 Soy tu asistente para cotizaciones en Agreste.</p>
        <p>¿Qué tipo de mueble en madera te gustaría cotizar hoy?</p>
      </div>
    </div>
    
    <div class="chatbot-message chatbot-message--bot">
      <div class="chatbot-message__avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div class="chatbot-message__content">
        <p>Selecciona una opción para empezar tu cotización:</p>
        <div class="chatbot-options">
          <button class="chatbot-option" data-option="arrimos">🏠 Arrimos</button>
          <button class="chatbot-option" data-option="buffet">🍽️ Buffet</button>
          <button class="chatbot-option" data-option="comedor">🪑 Comedor</button>
          <button class="chatbot-option" data-option="mesas-centro">☕ Mesas de centro</button>
          <button class="chatbot-option" data-option="puertas">🚪 Puertas</button>
          <button class="chatbot-option" data-option="sillas">🪑 Sillas</button>
          <button class="chatbot-option" data-option="personalizado">✨ Personalizados</button>
        </div>
      </div>
    </div>
  `;
  
  // Función para limpiar y resetear el chat
  function resetChat() {
    messagesContainer.innerHTML = initialMessages;
    
    // Resetear datos del chat
    chatData = {
      category: '',
      userMessages: [],
      fullSpecs: ''
    };
    
    // Re-agregar event listeners a las nuevas opciones
    const newOptions = messagesContainer.querySelectorAll('.chatbot-option');
    newOptions.forEach(option => {
      option.addEventListener('click', handleOptionClick);
    });
  }
  
  // Función para manejar clics en opciones
  function handleOptionClick(e) {
    const selectedOption = e.target.dataset.option;
    
    // Guardar categoría seleccionada
    chatData.category = selectedOption;
    chatData.userMessages.push(`Categoría: ${e.target.textContent}`);
    
    // Crear mensaje del usuario
    const userMessage = document.createElement('div');
    userMessage.className = 'chatbot-message chatbot-message--user';
    userMessage.innerHTML = `
      <div class="chatbot-message__content" style="background: var(--accent); color: white; border-radius: 18px 18px 4px 18px; margin-left: auto;">
        <p style="color: white !important; margin: 0;">Quiero cotizar: ${e.target.textContent}</p>
      </div>
    `;
    
    // Crear respuesta del bot
    const botResponse = document.createElement('div');
    botResponse.className = 'chatbot-message chatbot-message--bot';
    
    let responseText = '';
    let categoryName = '';
    
    switch(selectedOption) {
      case 'arrimos':
        responseText = '¡Perfecto! Vamos a cotizar tus arrimos.';
        categoryName = 'arrimos';
        break;
      case 'buffet':
        responseText = '¡Excelente! Vamos a cotizar tu buffet.';
        categoryName = 'buffet';
        break;
      case 'comedor':
        responseText = '¡Genial! Vamos a cotizar tu comedor.';
        categoryName = 'comedor';
        break;
      case 'mesas-centro':
        responseText = '¡Increíble! Vamos a cotizar tus mesas de centro.';
        categoryName = 'mesas de centro';
        break;
      case 'puertas':
        responseText = '¡Fantástico! Vamos a cotizar tus puertas.';
        categoryName = 'puertas';
        break;
      case 'sillas':
        responseText = '¡Perfecto! Vamos a cotizar tus sillas.';
        categoryName = 'sillas';
        break;
      case 'personalizado':
        responseText = '¡Increíble! Vamos a cotizar tu proyecto personalizado.';
        categoryName = 'proyecto personalizado';
        break;
    }
    
    botResponse.innerHTML = `
      <div class="chatbot-message__avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div class="chatbot-message__content">
        <p><strong>${responseText}</strong></p>
        <p style="margin-top: 8px;">Por favor, cuéntame más detalles sobre tu ${categoryName}:</p>
      </div>
    `;
    
    // Agregar mensajes al contenedor
    messagesContainer.appendChild(userMessage);
    messagesContainer.appendChild(botResponse);
    
    // Crear input de texto interactivo
    const inputContainer = document.createElement('div');
    inputContainer.className = 'chatbot-input-container';
    inputContainer.innerHTML = `
      <div class="chatbot-input-wrapper">
        <textarea 
          class="chatbot-input" 
          placeholder="Ej: Mesa de 120x80cm en roble natural, con cajones..." 
          rows="3"
          maxlength="500"
        ></textarea>
        <button class="chatbot-send-btn" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9"></polygon>
          </svg>
        </button>
      </div>
      <div class="chatbot-final-actions" style="display: none;">
        <button class="chatbot-final-btn" type="button">Crear cotización completa</button>
      </div>
    `;
    
    messagesContainer.appendChild(inputContainer);
    
    // Agregar event listeners al input y botón
    const textarea = inputContainer.querySelector('.chatbot-input');
    const sendBtn = inputContainer.querySelector('.chatbot-send-btn');
    const finalActions = inputContainer.querySelector('.chatbot-final-actions');
    const finalBtn = inputContainer.querySelector('.chatbot-final-btn');
    
    // Función para enviar mensaje
    function sendUserMessage() {
      const message = textarea.value.trim();
      if (!message) return;
      
      // Guardar mensaje del usuario
      chatData.userMessages.push(message);
      
      // Crear mensaje del usuario
      const userMsg = document.createElement('div');
      userMsg.className = 'chatbot-message chatbot-message--user';
      userMsg.innerHTML = `
        <div class="chatbot-message__content" style="background: var(--accent); color: white; border-radius: 18px 18px 4px 18px; margin-left: auto;">
          <p style="color: white !important; margin: 0;">${message}</p>
        </div>
      `;
      
      // Respuesta del bot
      const botMsg = document.createElement('div');
      botMsg.className = 'chatbot-message chatbot-message--bot';
      botMsg.innerHTML = `
        <div class="chatbot-message__avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="chatbot-message__content">
          <p>¡Excelente información! ¿Algo más que quieras agregar sobre tu ${categoryName}?</p>
        </div>
      `;
      
      // Insertar antes del input container
      messagesContainer.insertBefore(userMsg, inputContainer);
      messagesContainer.insertBefore(botMsg, inputContainer);
      
      // Limpiar textarea y mostrar botón final
      textarea.value = '';
      finalActions.style.display = 'block';
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Event listeners
    sendBtn.addEventListener('click', sendUserMessage);
    textarea.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    });
    
    finalBtn.addEventListener('click', () => {
      // Compilar toda la información
      chatData.fullSpecs = `Categoría: ${e.target.textContent}\n\nDetalles:\n${chatData.userMessages.slice(1).join('\n\n')}`;
      
      // Guardar en localStorage para transferir
      localStorage.setItem('agresteChatData', JSON.stringify(chatData));
      
      // Redireccionar a cotizar.html
      window.location.href = 'cotizar.html#formulario';
    });
    
    // Ocultar todas las opciones iniciales
    const allOptions = messagesContainer.querySelectorAll('.chatbot-option');
    allOptions.forEach(opt => opt.style.display = 'none');
    
    // Scroll to bottom y focus en textarea
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    setTimeout(() => textarea.focus(), 300);
  }
  
  // Función para abrir modal
  function openModal() {
    isOpen = true;
    modal.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    
    // Limpiar y resetear chat cada vez que se abre
    resetChat();
    
    // Focus management
    setTimeout(() => {
      const firstFocusable = modal.querySelector('.chatbot-modal__close, .chatbot-option');
      if (firstFocusable) firstFocusable.focus();
    }, 300);
  }
  
  // Función para cerrar modal
  function closeModal() {
    isOpen = false;
    modal.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    
    // Return focus to trigger
    setTimeout(() => {
      trigger.focus();
    }, 100);
  }
  
  // Event listeners
  trigger.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeModal();
    }
  });
  
  // Inicializar el chat por primera vez
  resetChat();
  
  // Auto-mostrar bubble después de unos segundos
  setTimeout(() => {
    if (bubble && !isOpen) {
      bubble.style.animation = 'chatbot-bounce 0.6s ease-in-out 3';
    }
  }, 3000);
})();

// ============================================
// FUNCIONALIDAD PARA COTIZAR.HTML
// ============================================

// Cargar datos del chatbot en cotizar.html
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si estamos en cotizar.html
  if (window.location.pathname.includes('cotizar.html') || document.getElementById('productDetails')) {
    const productDetailsTextarea = document.getElementById('productDetails');
    
    if (productDetailsTextarea) {
      // Obtener datos del localStorage
      const chatDataString = localStorage.getItem('agresteChatData');
      
      if (chatDataString) {
        try {
          const chatData = JSON.parse(chatDataString);
          
          // Compilar información del chatbot
          let compiledInfo = '';
          
          if (chatData.category && chatData.userMessages && chatData.userMessages.length > 0) {
            // Agregar categoría
            compiledInfo += `${chatData.userMessages[0]}\n\n`;
            
            // Agregar detalles del usuario
            if (chatData.userMessages.length > 1) {
              compiledInfo += 'Detalles especificados:\n';
              for (let i = 1; i < chatData.userMessages.length; i++) {
                compiledInfo += `- ${chatData.userMessages[i]}\n`;
              }
            }
            
            // Agregar timestamp
            compiledInfo += `\n[Información recopilada desde el chatbot - ${new Date().toLocaleDateString()}]`;
            
            // Insertar en el textarea
            productDetailsTextarea.value = compiledInfo;
            
            // Limpiar localStorage después de usar
            localStorage.removeItem('agresteChatData');
            
            // Scroll hacia el formulario si viene del chatbot
            if (window.location.hash === '#formulario') {
              setTimeout(() => {
                const formulario = document.getElementById('formulario');
                if (formulario) {
                  formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 500);
            }
          }
        } catch (error) {
          console.error('Error al procesar datos del chatbot:', error);
          // Limpiar localStorage si hay error
          localStorage.removeItem('agresteChatData');
        }
      }
    }
  }
});

// === Envío de formulario de cotización a backend ===
document.addEventListener('DOMContentLoaded', () => {
  const cotizarForm = document.querySelector('#formulario form');
  if (cotizarForm) {
    cotizarForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        fullName: cotizarForm.querySelector('#fullName').value,
        phone: cotizarForm.querySelector('#phone').value,
        email: cotizarForm.querySelector('#email').value,
        deliveryDate: cotizarForm.querySelector('#deliveryDate').value,
        productDetails: cotizarForm.querySelector('#productDetails').value
      };
      try {
        const res = await fetch('http://localhost:3001/api/cotizaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          cotizarForm.reset();
          alert('¡Solicitud enviada correctamente!');
        } else {
          alert('Error al enviar la solicitud.');
        }
      } catch (err) {
        alert('Error de conexión.');
      }
    });
  }

  // === Envío de formulario de contacto a backend ===
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name: contactForm.querySelector('#cf-name').value,
        email: contactForm.querySelector('#cf-email').value,
        phone: contactForm.querySelector('#cf-phone').value,
        subject: contactForm.querySelector('#cf-subject').value,
        message: contactForm.querySelector('#cf-message').value
      };
      try {
        const res = await fetch('http://localhost:3001/api/contactos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          contactForm.reset();
          alert('¡Mensaje enviado correctamente!');
        } else {
          alert('Error al enviar el mensaje.');
        }
      } catch (err) {
        alert('Error de conexión.');
      }
    });
  }

  // === Envío de registro/login a backend ===
  const authForm = document.querySelector('.auth-form');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        email: authForm.querySelector('#auth-email').value,
        password: authForm.querySelector('#auth-password') ? authForm.querySelector('#auth-password').value : '',
        name: authForm.querySelector('#auth-name') ? authForm.querySelector('#auth-name').value : ''
      };
      try {
        const res = await fetch('http://localhost:3001/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          authForm.reset();
          alert('¡Usuario registrado/iniciado correctamente!');
        } else {
          alert('Error al procesar usuario.');
        }
      } catch (err) {
        alert('Error de conexión.');
      }
    });
  }

  // === Envío de suscripción newsletter a backend ===
  const newsletterForm = document.querySelector('.newsletter__form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        email: newsletterForm.querySelector('#newsletter-email').value
      };
      try {
        const res = await fetch('http://localhost:3001/api/suscripciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          newsletterForm.reset();
          alert('¡Suscripción exitosa!');
        } else {
          alert('Error al suscribirse.');
        }
      } catch (err) {
        alert('Error de conexión.');
      }
    });
  }
});
