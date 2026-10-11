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
  // Only plain addresses and https links are ever written into the page
  const SAFE_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}$/;
  const SAFE_URL = /^https:\/\/[A-Za-z0-9.-]+(\/[A-Za-z0-9._~%@/-]*)?$/;
  if (SAFE_EMAIL.test(CONFIG.email)) {
    $$('[data-email]').forEach((a) => {
      a.href = `mailto:${CONFIG.email}`;
      a.textContent = CONFIG.email;
    });
  }
  $$('[data-social]').forEach((a) => {
    const url = CONFIG.socials[a.dataset.social];
    if (url && SAFE_URL.test(url)) a.href = url;
    else a.closest('li')?.remove();
  });
  $$('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

  const sections = $$('.section');
  const hasObserver = 'IntersectionObserver' in window;

  /* ---------- Lazy photos ---------- */
  // Section photos only download when their section is within ~3/4 of a screen of view
  if (hasObserver) {
    const nearObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-near');
        nearObserver.unobserve(entry.target);
      });
    }, { rootMargin: '75% 0px' });
    sections.forEach((s) => nearObserver.observe(s));
  } else {
    sections.forEach((s) => s.classList.add('is-near'));
  }

  /* ---------- Reveal on scroll ---------- */
  function startReveal() {
    const items = $$('[data-reveal]');

    if (reduceMotion || !hasObserver) {
      items.forEach((item) => item.classList.add('is-visible'));
      sections.forEach((s) => s.classList.add('is-inview'));
      return;
    }

    // The hero text is on screen from the start, so it fades in straight away
    const heroItems = $$('.hero__content [data-reveal]');
    heroItems.forEach((item, i) => {
      item.style.setProperty('--i', i);
      item.classList.add('is-visible');
    });

    const itemObserver = new IntersectionObserver((entries) => {
      let n = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--i', Math.min(n++, 6));
        entry.target.classList.add('is-visible');
        itemObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.filter((item) => !heroItems.includes(item)).forEach((item) => itemObserver.observe(item));

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

  /* ---------- Header ---------- */
  const header = $('.header');
  let scrolled = null;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    if ((y > 40) !== scrolled) {
      scrolled = y > 40;
      header.classList.toggle('is-scrolled', scrolled);
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
  const menuFocusables = [toggle, ...$$('a[href], button', menu)];
  let lastFocus = null;

  // Menu photos only download once the visitor reaches for the menu
  const primeMenu = () => menu.classList.add('is-primed');
  toggle.addEventListener('pointerenter', primeMenu, { once: true });
  toggle.addEventListener('focus', primeMenu, { once: true });

  const isMenuOpen = () => menu.classList.contains('is-open');

  function setMenuOrigin() {
    const r = toggle.getBoundingClientRect();
    menu.style.setProperty('--cx', `${r.left + r.width / 2}px`);
    menu.style.setProperty('--cy', `${r.top + r.height / 2}px`);
  }

  function openMenu() {
    lastFocus = document.activeElement;
    primeMenu();
    setMenuOrigin();
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggleLabel.textContent = toggleLabel.dataset.close;
    root.classList.add('menu-open');
    const current = $('.menu__list a.is-current') || menuLinks[0];
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

  document.addEventListener('keydown', (e) => {
    if (!isMenuOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key !== 'Tab') return;
    // Keep focus inside the menu (plus the close toggle)
    const first = menuFocusables[0];
    const last = menuFocusables[menuFocusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!menuFocusables.includes(document.activeElement)) { e.preventDefault(); first.focus(); }
  });

  window.addEventListener('resize', () => {
    if (isMenuOpen()) setMenuOrigin();
  }, { passive: true });

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

  if (hasObserver) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target); });
    }, { rootMargin: '-50% 0px -50% 0px' });
    sections.forEach((s) => activeObserver.observe(s));
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
  const LONG_DATE = new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const SHORT_DATE = new Intl.DateTimeFormat('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const MONTH_YEAR = new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric' });
  const formatLong = (d) => LONG_DATE.format(d);
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
    const clearBtn = el('button', { type: 'button', class: 'btn btn--dark' }, 'Clear');
    const doneBtn = el('button', { type: 'button', class: 'btn btn--dark' }, 'Close');
    foot.append(clearBtn, doneBtn);
    pop.append(head, table, foot);

    wrap.append(display, indicator, pop, hidden);
    native.replaceWith(wrap);
    if (label) label.htmlFor = display.id;

    function render() {
      title.textContent = MONTH_YEAR.format(view);
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

    const dayButton = (d) => $(`[data-date="${toISO(d)}"]`, tbody);
    const focusDay = () => dayButton(focusDate)?.focus();
    const onOutside = (e) => { if (!wrap.contains(e.target)) close(false); };

    function open() {
      focusDate = clamp(selected || today);
      view = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
      render();
      pop.hidden = false;
      wrap.classList.add('is-open');
      display.setAttribute('aria-expanded', 'true');
      placePopup(wrap, pop);
      document.addEventListener('pointerdown', onOutside);
      focusDay();
    }

    function close(returnFocus = true) {
      if (pop.hidden) return;
      pop.hidden = true;
      wrap.classList.remove('is-open', 'is-up');
      display.setAttribute('aria-expanded', 'false');
      document.removeEventListener('pointerdown', onOutside);
      if (returnFocus) display.focus();
    }

    function setValue(date) {
      selected = date;
      hidden.value = date ? toISO(date) : '';
      display.value = date ? SHORT_DATE.format(date) : '';
    }

    function moveTo(date) {
      const target = clamp(date);
      if (target.getMonth() === view.getMonth() && target.getFullYear() === view.getFullYear()) {
        dayButton(focusDate)?.setAttribute('tabindex', '-1');
        focusDate = target;
        dayButton(focusDate)?.setAttribute('tabindex', '0');
      } else {
        focusDate = target;
        view = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
        render();
      }
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

    function highlight(i) {
      active = Math.min(Math.max(i, 0), items.length - 1);
      const li = items[active];
      items.forEach((item) => item.classList.toggle('is-active', item === li));
      combo.setAttribute('aria-activedescendant', li.id);
      if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop;
      else if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight;
      }
    }

    const onOutside = (e) => { if (!wrap.contains(e.target)) close(); };

    function open() {
      if (!list.hidden) return;
      list.hidden = false;
      document.addEventListener('pointerdown', onOutside);
      wrap.classList.add('is-open');
      combo.setAttribute('aria-expanded', 'true');
      placePopup(wrap, list);
      highlight(Math.max(0, native.selectedIndex));
    }

    function close() {
      if (list.hidden) return;
      list.hidden = true;
      wrap.classList.remove('is-open', 'is-up');
      combo.setAttribute('aria-expanded', 'false');
      combo.removeAttribute('aria-activedescendant');
      document.removeEventListener('pointerdown', onOutside);
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
      if (list.hidden) choose(match); else highlight(match);
    }

    combo.addEventListener('keydown', (e) => {
      const isOpen = !list.hidden;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (isOpen) highlight(active + 1); else open();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) highlight(active - 1); else open();
          break;
        case 'Home':
        case 'End':
          if (isOpen) { e.preventDefault(); highlight(e.key === 'Home' ? 0 : items.length - 1); }
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
      const i = items.indexOf(e.target.closest('.select__option'));
      if (i >= 0 && i !== active) highlight(i);
    });

    sync();
    return sync;
  }

  /* ---------- Enquiry form ---------- */
  // Invisible / text-disguising characters: control codes (except tab and line breaks),
  // zero-width characters, bidirectional overrides ("Trojan Source" tricks), variation
  // selectors and filler glyphs.
  const INVISIBLE = /(?![\t\n\r])[\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/gu;
  const EMAIL_RE = /^(?=.{6,254}$)(?=[^@]{1,64}@)[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
  const NAME_STRIP = /[^\p{L}\p{M}' ’.-]/gu;
  const countLetters = (v) => (v.match(/\p{L}/gu) || []).length;

  // Whitelist per field: anything not listed is removed as it's typed, pasted or autofilled
  const FIELD_RULES = {
    name: {
      max: 80, single: true, strip: NAME_STRIP,
      hint: 'Letters, spaces, apostrophes and hyphens only.',
      check: (v) => countLetters(v) >= 2 || 'Please enter your name.',
    },
    partner: {
      max: 80, single: true, strip: NAME_STRIP,
      hint: 'Letters, spaces, apostrophes and hyphens only.',
      check: (v) => !v || countLetters(v) >= 2 || "Please check your partner's name.",
    },
    email: {
      max: 254, single: true, normalize: 'NFKC', strip: /[^A-Za-z0-9._%+@-]/g,
      fix: (v) => {
        const at = v.indexOf('@');
        return at < 0 ? v : v.slice(0, at + 1) + v.slice(at + 1).replace(/@/g, '');
      },
      hint: 'Letters, numbers and . _ % + - @ only.',
      check: (v) => EMAIL_RE.test(v) || 'Please enter a valid email address.',
    },
    phone: {
      max: 20, single: true, normalize: 'NFKC', strip: /[^0-9+() -]/g,
      fix: (v) => v.replace(/(?!^)\+/g, ''),
      hint: 'Numbers, spaces and + ( ) - only.',
      check: (v) => {
        if (!v) return true;
        const digits = v.replace(/\D/g, '').length;
        return (digits >= 8 && digits <= 15) || 'Please enter a valid phone number.';
      },
    },
    location: {
      max: 120, single: true, strip: /[^\p{L}\p{M}\p{N} ,.'’&/#()-]/gu,
      hint: "Letters, numbers and , . ' - & / # ( ) only.",
      check: (v) => !v || v.replace(/[^\p{L}\p{N}]/gu, '').length >= 2 || 'Please check the location.',
    },
    message: {
      max: 2000, single: false,
      strip: /[^\p{L}\p{M}\p{N} \n.,!?'’‘"“”():;&/@#$%+*…–—-]/gu,
      hint: 'Letters, numbers and everyday punctuation only (no emoji or code symbols).',
      check: () => true,
    },
  };

  function sanitize(value, rule) {
    let v = String(value ?? '').normalize(rule.normalize || 'NFC').replace(INVISIBLE, '');
    v = rule.single
      ? v.replace(/\s+/g, ' ')
      : v.replace(/\r\n?|[\u2028\u2029]/g, '\n').replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n');
    v = v.replace(rule.strip, '').replace(/ {2,}/g, ' ');
    if (rule.fix) v = rule.fix(v);
    return v.slice(0, rule.max);
  }

  // Final tidy before sending: trim, and remove leading = + - @ from free text so a value
  // can never run as a formula if enquiries are exported to a spreadsheet (CSV injection)
  function finalise(name, value) {
    const v = sanitize(value, FIELD_RULES[name]).trim();
    return name === 'phone' || name === 'email' ? v : v.replace(/^[=+\-@\s]+/, '').trim();
  }

  const isValidDate = (iso, min, max) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
    const d = fromISO(iso);
    return toISO(d) === iso && d >= min && d <= max;
  };

  const form = $('#enquiry-form');
  if (form) {
    const resetHooks = [
      ...$$('input[type="date"]', form).map(enhanceDate),
      ...$$('select', form).map(enhanceSelect),
    ];

    const status = $('.form__status', form);
    const submit = $('button[type="submit"]', form);
    const thanks = $('.form__thanks', form);
    const thanksMsg = $('.form__thanks-msg', form);
    const guestOptions = $$('select[name="guests"] option', form).map((o) => o.value);
    const textInputs = Object.keys(FIELD_RULES).map((name) => form.elements[name]).filter(Boolean);

    const MIN_FILL_MS = 3000;      // submitted faster than this = almost certainly a bot
    const COOLDOWN_MS = 30000;     // stop accidental double / repeated sends
    const MAX_PER_HOUR = 3;        // per browser
    const RATE_KEY = 'cbc-enquiry-times';
    const loadedAt = Date.now();
    let lastSent = 0;
    // Only ever post to an https endpoint
    const endpoint = /^https:\/\/[a-z0-9.-]+\/\S+$/i.test(CONFIG.formEndpoint) ? CONFIG.formEndpoint : '';

    const readTimes = () => {
      try {
        const times = JSON.parse(localStorage.getItem(RATE_KEY) || '[]');
        return times.filter((t) => Number.isFinite(t) && Date.now() - t < 3600000);
      } catch { return []; }
    };
    const recordSend = () => {
      lastSent = Date.now();
      try { localStorage.setItem(RATE_KEY, JSON.stringify([...readTimes(), lastSent])); } catch { /* storage unavailable */ }
    };
    const isRateLimited = () => Date.now() - lastSent < COOLDOWN_MS || readTimes().length >= MAX_PER_HOUR;

    const parts = new Map(); // input -> { field, msg }

    function validateField(input) {
      const { field, msg } = parts.get(input);
      const result = FIELD_RULES[input.name].check(finalise(input.name, input.value));
      const ok = result === true;
      field.classList.toggle('has-error', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      msg.textContent = ok ? '' : result;
      return ok;
    }

    function bindField(input) {
      const rule = FIELD_RULES[input.name];
      const field = input.closest('.field');
      const msg = el('p', { class: 'field__msg', id: `msg-${input.name}`, 'aria-live': 'polite' });
      field.append(msg);
      parts.set(input, { field, msg });
      input.setAttribute('aria-describedby', msg.id);
      let composing = false;
      let hintTimer;

      const showHint = () => {
        msg.textContent = rule.hint;
        field.classList.add('has-hint');
        clearTimeout(hintTimer);
        hintTimer = setTimeout(() => {
          field.classList.remove('has-hint');
          if (field.classList.contains('has-error')) validateField(input); else msg.textContent = '';
        }, 2600);
      };

      const apply = () => {
        const before = input.value;
        const after = sanitize(before, rule);
        if (after !== before) {
          const caret = input.selectionStart ?? before.length;
          const pos = Math.min(sanitize(before.slice(0, caret), rule).length, after.length);
          input.value = after;
          try { input.setSelectionRange(pos, pos); } catch { /* field type without a caret */ }
          // Only flag it when real characters were rejected, not just extra spaces
          if (before.replace(/\s/g, '').length > after.replace(/\s/g, '').length) showHint();
        }
        if (field.classList.contains('has-error')) validateField(input);
      };

      // Covers typing, paste, drag-and-drop, autofill and voice input; waits for IME composition
      input.addEventListener('compositionstart', () => { composing = true; });
      input.addEventListener('compositionend', () => { composing = false; apply(); });
      input.addEventListener('input', () => { if (!composing) apply(); });
      input.addEventListener('blur', () => { if (input.value.trim()) validateField(input); });
      apply(); // tidy anything the browser restored or autofilled before this ran
    }

    textInputs.forEach(bindField);

    form.addEventListener('reset', () => setTimeout(() => {
      resetHooks.forEach((fn) => fn());
      textInputs.forEach((input) => {
        const { field, msg } = parts.get(input);
        field.classList.remove('has-error', 'has-hint');
        input.removeAttribute('aria-invalid');
        msg.textContent = '';
      });
    }, 0));

    // Clickjacking guard: refuse to work if another site has embedded this page in a frame
    const framed = window.self !== window.top;
    if (framed) {
      $$('input, textarea, button, select', form).forEach((control) => { control.disabled = true; });
      status.textContent = 'For your security, please open this page directly to send an enquiry.';
    }

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
      if (framed) return;
      const raw = new FormData(form);

      // Bot traps: hidden honeypot field filled in, or form completed inhumanly fast
      if (raw.get('_gotcha') || Date.now() - loadedAt < MIN_FILL_MS) {
        showThanks("I'll be in touch within 24–48 hours.");
        form.reset();
        return;
      }
      if (isRateLimited()) {
        status.textContent = 'Thanks — your enquiry is on its way. Please wait a little before sending another.';
        return;
      }

      const invalid = textInputs.filter((input) => !validateField(input));
      if (invalid.length) {
        status.textContent = 'Please check the highlighted fields.';
        invalid[0].focus();
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const date = String(raw.get('date') || '');
      const guests = String(raw.get('guests') || '');
      const fields = Object.fromEntries(textInputs.map((input) => [input.name, finalise(input.name, input.value)]));
      fields.date = isValidDate(date, today, new Date(today.getFullYear() + 4, 11, 31)) ? date : '';
      fields.guests = guestOptions.includes(guests) ? guests : '';

      submit.disabled = true;
      status.textContent = 'Sending…';

      try {
        if (endpoint) {
          const body = new FormData();
          Object.keys(LABELS).forEach((key) => body.append(key, fields[key] || ''));
          body.append('_subject', `Wedding enquiry from ${fields.name}`);
          const res = await fetch(endpoint, {
            method: 'POST',
            body,
            headers: { Accept: 'application/json' },
            credentials: 'omit',
            redirect: 'error',
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
        recordSend();
        form.reset();
      } catch {
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
