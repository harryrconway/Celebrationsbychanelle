/* =========================================================
   Celebrations by Chanelle — interactions
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Site settings: edit these in one place ---------- */
  const CONFIG = {
    email: 'hello@celebrationsbychanelle.com.au',
    // Paste a Formspree (or similar) endpoint to send enquiries straight to your inbox,
    // e.g. 'https://formspree.io/f/abcdwxyz'. Left empty, the form opens a pre-filled email.
    formEndpoint: '',
    socials: {
      instagram: 'https://www.instagram.com/celebrationsbychanelle',
      facebook: 'https://www.facebook.com/celebrationsbychanelle',
      tiktok: 'https://www.tiktok.com/@celebrationsbychanelle',
      pinterest: 'https://www.pinterest.com.au/celebrationsbychanelle',
    },
  };

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Apply settings ---------- */
  $$('[data-email]').forEach((a) => {
    a.href = `mailto:${CONFIG.email}`;
    a.textContent = CONFIG.email;
  });
  $$('[data-social]').forEach((a) => {
    const url = CONFIG.socials[a.dataset.social];
    if (url) a.href = url;
    else a.closest('li')?.remove();
  });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Reveal on scroll ---------- */
  function startReveal() {
    const items = $$('[data-reveal]');
    const sections = $$('.section');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      sections.forEach((s) => s.classList.add('is-inview'));
      return;
    }

    const itemObserver = new IntersectionObserver((entries) => {
      let n = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--i', Math.min(n++, 6));
        entry.target.classList.add('is-visible');
        itemObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => itemObserver.observe(el));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-inview');
        sectionObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    sections.forEach((s) => sectionObserver.observe(s));
  }

  /* ---------- Intro loader ---------- */
  let loaded = false;
  function finishLoading() {
    if (loaded) return;
    loaded = true;
    root.classList.add('is-loaded');
    startReveal();
  }
  if (reduceMotion) {
    finishLoading();
  } else {
    window.addEventListener('load', () => setTimeout(finishLoading, 700));
    setTimeout(finishLoading, 2600); // never hold the page hostage to slow assets
  }

  /* ---------- Header + hero parallax ---------- */
  const header = $('.header');
  const heroBg = $('.hero__bg');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    if (heroBg && !reduceMotion && y < window.innerHeight * 1.2) {
      heroBg.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Fullscreen menu ---------- */
  const menu = $('#menu');
  const toggle = $('.menu-toggle');
  const toggleLabel = $('.menu-toggle__label');
  const menuLinks = $$('.menu__list a');
  const menuImages = $$('.menu__img');
  let lastFocus = null;

  const isMenuOpen = () => menu.classList.contains('is-open');

  function setMenuOrigin() {
    const r = toggle.getBoundingClientRect();
    menu.style.setProperty('--cx', `${r.left + r.width / 2}px`);
    menu.style.setProperty('--cy', `${r.top + r.height / 2}px`);
  }

  function showMenuImage(index) {
    menuImages.forEach((img) => img.classList.toggle('is-active', img.dataset.index === String(index)));
  }

  function openMenu() {
    lastFocus = document.activeElement;
    setMenuOrigin();
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggleLabel.textContent = toggleLabel.dataset.close;
    root.classList.add('menu-open');
    const current = $('.menu__list a.is-current') || menuLinks[0];
    showMenuImage(current.dataset.media);
    setTimeout(() => current.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  }

  function closeMenu({ restoreFocus = true } = {}) {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggleLabel.textContent = toggleLabel.dataset.open;
    root.classList.remove('menu-open');
    if (restoreFocus) (lastFocus && document.contains(lastFocus) ? lastFocus : toggle).focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => (isMenuOpen() ? closeMenu() : openMenu()));

  menuLinks.forEach((link) => {
    const show = () => showMenuImage(link.dataset.media);
    link.addEventListener('mouseenter', show);
    link.addEventListener('focus', show);
  });

  document.addEventListener('keydown', (e) => {
    if (!isMenuOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key !== 'Tab') return;
    // Keep focus inside the menu (plus the close toggle)
    const focusables = [toggle, ...$$('a[href], button:not([disabled])', menu)];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!focusables.includes(document.activeElement)) { e.preventDefault(); first.focus(); }
  });

  window.addEventListener('resize', () => { if (isMenuOpen()) setMenuOrigin(); });

  /* ---------- Smooth anchor scrolling ---------- */
  function scrollToTarget(target) {
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', target.id === 'home' ? location.pathname : `#${target.id}`);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    const dialog = link.closest('dialog[open]');
    if (dialog) dialog.close();

    if (isMenuOpen()) {
      closeMenu({ restoreFocus: false });
      setTimeout(() => scrollToTarget(target), reduceMotion ? 0 : 380);
    } else {
      scrollToTarget(target);
    }
  });

  /* ---------- Active section tracking (menu + dots) ---------- */
  const dots = $('.dots');
  const dotLinks = $$('a', dots);
  const tracked = $$('main .section, .footer');

  function setActive(section) {
    const id = section.id;
    menuLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${id}`));
    dotLinks.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    dots.dataset.tone = section.dataset.tone || 'light';
    dots.classList.toggle('is-hidden', id === 'footer');
  }

  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target); });
    }, { rootMargin: '-50% 0px -50% 0px' });
    tracked.forEach((s) => activeObserver.observe(s));
  }

  /* ---------- Resource drawers ---------- */
  const supportsDialog = typeof HTMLDialogElement === 'function';

  function closeDrawer(dialog) {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    if (reduceMotion) { dialog.close(); return; }
    dialog.classList.add('is-closing');
    dialog.addEventListener('animationend', () => {
      dialog.classList.remove('is-closing');
      dialog.close();
    }, { once: true });
  }

  $$('[data-drawer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = document.getElementById(btn.dataset.drawer);
      if (!dialog || !supportsDialog) return;
      dialog.showModal();
      root.classList.add('drawer-open');
    });
  });

  $$('dialog.drawer').forEach((dialog) => {
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeDrawer(dialog); });
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDrawer(dialog); });
    dialog.addEventListener('close', () => root.classList.remove('drawer-open'));
    $$('[data-close]', dialog).forEach((b) => b.addEventListener('click', () => closeDrawer(dialog)));
  });

  /* ---------- Themed form controls (calendar + dropdown) ---------- */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  let uid = 0;

  // Elements are built with textContent only, so nothing is ever parsed as HTML
  function el(tag, attrs = {}, text) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(id) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', `#${id}`);
    svg.append(use);
    return svg;
  }

  // Open a popup upwards when there isn't room for it below the field
  function placePopup(wrap, pop) {
    wrap.classList.remove('is-up');
    const rect = wrap.getBoundingClientRect();
    const height = pop.offsetHeight;
    if (rect.bottom + height + 16 > window.innerHeight && rect.top > height + 16) wrap.classList.add('is-up');
  }

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const sameDay = (a, b) => Boolean(a && b) && a.getTime() === b.getTime();
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const addMonths = (d, n) => {
    const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
    const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), lastDay));
  };
  const formatLong = (d) => d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatShort = (d) => d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const WEEKDAYS = [['Mo', 'Monday'], ['Tu', 'Tuesday'], ['We', 'Wednesday'], ['Th', 'Thursday'], ['Fr', 'Friday'], ['Sa', 'Saturday'], ['Su', 'Sunday']];

  function enhanceDate(native) {
    const id = ++uid;
    const label = $(`label[for="${native.id}"]`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const min = today;
    const max = new Date(today.getFullYear() + 4, 11, 31);
    const clamp = (d) => (d < min ? min : d > max ? max : d);
    let selected = null;
    let focusDate = today;
    let view = new Date(today.getFullYear(), today.getMonth(), 1);

    const wrap = el('div', { class: 'picker' });
    const display = el('input', {
      type: 'text', id: `dp-${id}`, class: 'picker__input', readonly: '',
      placeholder: 'Select a date', autocomplete: 'off',
      'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': `dp-pop-${id}`,
    });
    const hidden = el('input', { type: 'hidden', name: native.name });
    const indicator = el('span', { class: 'picker__btn', 'aria-hidden': 'true' });
    indicator.append(icon('i-calendar'));

    const pop = el('div', { class: 'picker__pop datepicker', id: `dp-pop-${id}`, role: 'dialog', 'aria-label': 'Choose your wedding date' });
    pop.hidden = true;
    const head = el('div', { class: 'datepicker__head' });
    const prev = el('button', { type: 'button', class: 'datepicker__nav', 'aria-label': 'Previous month' });
    prev.append(icon('i-chevron-left'));
    const next = el('button', { type: 'button', class: 'datepicker__nav', 'aria-label': 'Next month' });
    next.append(icon('i-chevron-right'));
    const title = el('p', { class: 'datepicker__title', id: `dp-title-${id}`, 'aria-live': 'polite' });
    head.append(prev, title, next);

    const table = el('table', { class: 'datepicker__grid', role: 'grid', 'aria-labelledby': title.id });
    const headRow = el('tr');
    WEEKDAYS.forEach(([short, full]) => headRow.append(el('th', { scope: 'col', abbr: full }, short)));
    const thead = el('thead');
    thead.append(headRow);
    const tbody = el('tbody');
    table.append(thead, tbody);

    const foot = el('div', { class: 'datepicker__foot' });
    const clearBtn = el('button', { type: 'button', class: 'text-link' }, 'Clear');
    const doneBtn = el('button', { type: 'button', class: 'text-link' }, 'Close');
    foot.append(clearBtn, doneBtn);
    pop.append(head, table, foot);

    wrap.append(display, indicator, pop, hidden);
    native.replaceWith(wrap);
    if (label) label.htmlFor = display.id;

    function render() {
      title.textContent = view.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
      prev.disabled = view <= new Date(min.getFullYear(), min.getMonth(), 1);
      next.disabled = view >= new Date(max.getFullYear(), max.getMonth(), 1);
      const offset = (view.getDay() + 6) % 7; // weeks start on Monday
      const rows = [];
      for (let week = 0; week < 6; week++) {
        const row = el('tr');
        for (let day = 0; day < 7; day++) {
          const date = new Date(view.getFullYear(), view.getMonth(), 1 - offset + week * 7 + day);
          const cell = el('td', { role: 'gridcell' });
          if (date.getMonth() === view.getMonth()) {
            const btn = el('button', {
              type: 'button', class: 'datepicker__day', 'data-date': toISO(date),
              tabindex: sameDay(date, focusDate) ? '0' : '-1', 'aria-label': formatLong(date),
            }, String(date.getDate()));
            btn.disabled = date < min || date > max;
            if (sameDay(date, today)) btn.classList.add('is-today');
            if (sameDay(date, selected)) {
              btn.classList.add('is-selected');
              cell.setAttribute('aria-selected', 'true');
            }
            cell.append(btn);
          }
          row.append(cell);
        }
        rows.push(row);
      }
      tbody.replaceChildren(...rows);
    }

    const focusDay = () => $(`[data-date="${toISO(focusDate)}"]`, tbody)?.focus();

    function open() {
      focusDate = clamp(selected || today);
      view = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
      render();
      pop.hidden = false;
      wrap.classList.add('is-open');
      display.setAttribute('aria-expanded', 'true');
      placePopup(wrap, pop);
      focusDay();
    }

    function close(returnFocus = true) {
      if (pop.hidden) return;
      pop.hidden = true;
      wrap.classList.remove('is-open', 'is-up');
      display.setAttribute('aria-expanded', 'false');
      if (returnFocus) display.focus();
    }

    function setValue(date) {
      selected = date;
      hidden.value = date ? toISO(date) : '';
      display.value = date ? formatShort(date) : '';
    }

    function moveTo(date) {
      focusDate = clamp(date);
      if (focusDate.getMonth() !== view.getMonth() || focusDate.getFullYear() !== view.getFullYear()) {
        view = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
      }
      render();
      focusDay();
    }

    function shiftMonth(n) {
      view = new Date(view.getFullYear(), view.getMonth() + n, 1);
      focusDate = clamp(addMonths(focusDate, n));
      render();
    }

    display.addEventListener('click', () => (pop.hidden ? open() : close()));
    display.addEventListener('keydown', (e) => {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); open(); }
      else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); setValue(null); }
    });
    prev.addEventListener('click', () => shiftMonth(-1));
    next.addEventListener('click', () => shiftMonth(1));
    clearBtn.addEventListener('click', () => { setValue(null); close(); });
    doneBtn.addEventListener('click', () => close());

    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('.datepicker__day');
      if (!btn || btn.disabled) return;
      setValue(fromISO(btn.dataset.date));
      close();
    });

    tbody.addEventListener('keydown', (e) => {
      const weekday = (focusDate.getDay() + 6) % 7;
      const moves = {
        ArrowLeft: () => addDays(focusDate, -1),
        ArrowRight: () => addDays(focusDate, 1),
        ArrowUp: () => addDays(focusDate, -7),
        ArrowDown: () => addDays(focusDate, 7),
        Home: () => addDays(focusDate, -weekday),
        End: () => addDays(focusDate, 6 - weekday),
        PageUp: () => addMonths(focusDate, e.shiftKey ? -12 : -1),
        PageDown: () => addMonths(focusDate, e.shiftKey ? 12 : 1),
      };
      if (!moves[e.key]) return;
      e.preventDefault();
      moveTo(moves[e.key]());
    });

    pop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    });
    wrap.addEventListener('focusout', (e) => {
      if (e.relatedTarget && !wrap.contains(e.relatedTarget)) close(false);
    });
    document.addEventListener('pointerdown', (e) => { if (!wrap.contains(e.target)) close(false); });

    return () => setValue(null);
  }

  function enhanceSelect(native) {
    const id = ++uid;
    const label = $(`label[for="${native.id}"]`);
    if (label && !label.id) label.id = `sel-label-${id}`;
    const opts = [...native.options];
    let active = 0;
    let typed = '';
    let typedTimer;

    const wrap = el('div', { class: 'picker select' });
    const combo = el('div', {
      class: 'picker__input', role: 'combobox', tabindex: '0',
      'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-controls': `sel-list-${id}`,
    });
    if (label) combo.setAttribute('aria-labelledby', label.id);
    const value = el('span', { class: 'select__value' });
    combo.append(value);
    const indicator = el('span', { class: 'picker__btn', 'aria-hidden': 'true' });
    indicator.append(icon('i-chevron-down'));

    const list = el('ul', { class: 'picker__pop', role: 'listbox', id: `sel-list-${id}`, tabindex: '-1' });
    if (label) list.setAttribute('aria-labelledby', label.id);
    list.hidden = true;
    const items = opts.map((opt, i) => {
      const li = el('li', { class: 'select__option', role: 'option', id: `sel-${id}-opt-${i}`, 'aria-selected': 'false' }, opt.textContent);
      if (!opt.value) li.classList.add('is-placeholder');
      li.append(icon('i-check'));
      return li;
    });
    list.append(...items);

    // The real <select> stays in the form (hidden) so its value is still submitted
    native.hidden = true;
    native.tabIndex = -1;
    native.setAttribute('aria-hidden', 'true');
    native.before(wrap);
    wrap.append(combo, indicator, list, native);
    label?.addEventListener('click', (e) => { e.preventDefault(); combo.focus(); });

    function sync() {
      const i = Math.max(0, native.selectedIndex);
      value.textContent = opts[i].textContent;
      combo.classList.toggle('is-placeholder', !opts[i].value);
      items.forEach((li, n) => li.setAttribute('aria-selected', String(n === i && Boolean(opts[i].value))));
    }

    function setActive(i) {
      active = Math.min(Math.max(i, 0), items.length - 1);
      const li = items[active];
      items.forEach((item) => item.classList.toggle('is-active', item === li));
      combo.setAttribute('aria-activedescendant', li.id);
      if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop;
      else if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight;
      }
    }

    function open() {
      if (!list.hidden) return;
      list.hidden = false;
      wrap.classList.add('is-open');
      combo.setAttribute('aria-expanded', 'true');
      placePopup(wrap, list);
      setActive(Math.max(0, native.selectedIndex));
    }

    function close() {
      if (list.hidden) return;
      list.hidden = true;
      wrap.classList.remove('is-open', 'is-up');
      combo.setAttribute('aria-expanded', 'false');
      combo.removeAttribute('aria-activedescendant');
    }

    function choose(i) {
      native.selectedIndex = i;
      native.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
      close();
    }

    function typeAhead(char) {
      clearTimeout(typedTimer);
      typed += char.toLowerCase();
      typedTimer = setTimeout(() => { typed = ''; }, 600);
      const start = list.hidden ? native.selectedIndex : active;
      const order = items.map((_, n) => (start + (typed.length > 1 ? 0 : 1) + n) % items.length);
      const match = order.find((n) => opts[n].value && opts[n].textContent.toLowerCase().startsWith(typed));
      if (match === undefined) return;
      if (list.hidden) choose(match); else setActive(match);
    }

    combo.addEventListener('keydown', (e) => {
      const isOpen = !list.hidden;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (isOpen) setActive(active + 1); else open();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) setActive(active - 1); else open();
          break;
        case 'Home':
        case 'End':
          if (isOpen) { e.preventDefault(); setActive(e.key === 'Home' ? 0 : items.length - 1); }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen) choose(active); else open();
          break;
        case 'Escape':
          if (isOpen) { e.preventDefault(); e.stopPropagation(); close(); }
          break;
        case 'Tab':
          if (isOpen) choose(active);
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeAhead(e.key);
      }
    });
    combo.addEventListener('click', () => (list.hidden ? open() : close()));
    combo.addEventListener('blur', close);
    list.addEventListener('pointerdown', (e) => e.preventDefault()); // keep focus on the combobox
    list.addEventListener('click', (e) => {
      const li = e.target.closest('.select__option');
      if (li) { choose(items.indexOf(li)); combo.focus(); }
    });
    list.addEventListener('pointermove', (e) => {
      const li = e.target.closest('.select__option');
      if (li && items.indexOf(li) !== active) setActive(items.indexOf(li));
    });
    document.addEventListener('pointerdown', (e) => { if (!wrap.contains(e.target)) close(); });

    sync();
    return sync;
  }

  /* ---------- Enquiry form ---------- */
  const form = $('#enquiry-form');
  if (form) {
    const resetHooks = [
      ...$$('input[type="date"]', form).map(enhanceDate),
      ...$$('select', form).map(enhanceSelect),
    ];
    form.addEventListener('reset', () => setTimeout(() => resetHooks.forEach((fn) => fn()), 0));

    const status = $('.form__status', form);
    const submit = $('button[type="submit"]', form);
    const thanks = $('.form__thanks', form);
    const thanksMsg = $('.form__thanks-msg', form);
    const guestOptions = $$('select[name="guests"] option', form).map((o) => o.value);

    const MIN_FILL_MS = 3000;   // submitted faster than this = almost certainly a bot
    const COOLDOWN_MS = 30000;  // stop accidental double / repeated sends
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const loadedAt = Date.now();
    let lastSent = 0;
    // Only ever post to an https endpoint
    const endpoint = /^https:\/\/[a-z0-9.-]+\/\S+$/i.test(CONFIG.formEndpoint) ? CONFIG.formEndpoint : '';

    // Strip control characters, trim and cap length (a second line of defence behind maxlength)
    const clean = (value, max) => String(value || '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
      .slice(0, max);
    const cleanLine = (value, max) => clean(value, max).replace(/\s*[\r\n]+\s*/g, ' ');

    const LABELS = {
      name: 'Name', partner: "Partner's name", email: 'Email', phone: 'Phone',
      date: 'Wedding date', location: 'Location / venue', guests: 'Estimated guests', message: 'Message',
    };

    const showThanks = (msg) => {
      thanksMsg.textContent = msg;
      form.classList.add('is-sent');
      thanks.setAttribute('aria-hidden', 'false');
      status.textContent = '';
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const raw = new FormData(form);

      // Bot traps: hidden honeypot field filled in, or form completed inhumanly fast
      if (raw.get('_gotcha') || Date.now() - loadedAt < MIN_FILL_MS) {
        showThanks("I'll be in touch within 24–48 hours.");
        form.reset();
        return;
      }
      if (Date.now() - lastSent < COOLDOWN_MS) {
        status.textContent = 'Your enquiry is already on its way. Please wait a moment before sending another.';
        return;
      }

      const date = String(raw.get('date') || '');
      const guests = String(raw.get('guests') || '');
      const fields = {
        name: cleanLine(raw.get('name'), 80),
        partner: cleanLine(raw.get('partner'), 80),
        email: cleanLine(raw.get('email'), 120),
        phone: cleanLine(raw.get('phone'), 20).replace(/[^0-9+()\s-]/g, ''),
        date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '',
        location: cleanLine(raw.get('location'), 120),
        guests: guestOptions.includes(guests) ? guests : '',
        message: clean(raw.get('message'), 2000),
      };

      if (!fields.name || !EMAIL_RE.test(fields.email)) {
        status.textContent = 'Please add your name and a valid email address.';
        return;
      }

      submit.disabled = true;
      status.textContent = 'Sending…';

      try {
        if (endpoint) {
          const body = new FormData();
          Object.entries(fields).forEach(([key, value]) => body.append(key, value));
          body.append('_subject', `Wedding enquiry from ${fields.name}`);
          const res = await fetch(endpoint, {
            method: 'POST',
            body,
            headers: { Accept: 'application/json' },
            credentials: 'omit',
          });
          if (!res.ok) throw new Error(`Request failed: ${res.status}`);
          showThanks("I'll be in touch within 24–48 hours.");
        } else {
          const lines = Object.entries(LABELS)
            .filter(([key]) => fields[key])
            .map(([key, label]) => `${label}: ${key === 'date' ? formatLong(fromISO(fields.date)) : fields[key]}`);
          const subject = `Wedding enquiry from ${fields.name}`;
          window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
          showThanks(`Your email app should open with your enquiry ready to send. If it doesn't, email me at ${CONFIG.email}.`);
        }
        lastSent = Date.now();
        form.reset();
      } catch (err) {
        status.textContent = `Something went wrong — please email ${CONFIG.email} directly.`;
      } finally {
        submit.disabled = false;
      }
    });

    $('[data-form-reset]', form)?.addEventListener('click', () => {
      form.classList.remove('is-sent');
      thanks.setAttribute('aria-hidden', 'true');
      $('input', form).focus();
    });
  }
})();
