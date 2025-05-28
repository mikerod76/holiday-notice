(() => {
  const script = document.currentScript || (function() {
    // If we're executed via eval on admin page – grab by id instead
    return document.querySelector('script[id="holiday-popup-js"]');
  })();

  const cfgUrl       = script.dataset.config;
  const defaultAhead = parseInt(script.dataset.noticeDays || "3", 10);
  if (!cfgUrl) { console.error("holiday‑popup: data-config attribute missing"); return; }

  fetch(cfgUrl)
    .then(r => r.json())
    .then(cfg => {
      const now = new Date();
      (cfg.holidays||[]).forEach(h => {
        const start = new Date(h.start);
        const end   = new Date(h.end);
        const ahead = 'noticeDays' in h ? h.noticeDays : defaultAhead;
        const showFrom = new Date(start.getTime() - ahead*86400000);
        if (now >= showFrom && now < end) {
          injectPopup(h, end);
        }
      });
    })
    .catch(err => console.error("holiday‑popup: cannot load config", err));

  function injectPopup(holiday, end) {
    if (document.getElementById('holiday‑popup')) return; // already displayed

    const bar = Object.assign(document.createElement('div'), {
      id: 'holiday‑popup',
      style: 'position:fixed;top:0;left:0;right:0;padding:12px;' +
             'background:#011631;color:#fff;z-index:99999;' +
             'display:flex;justify-content:space-between;align-items:center;font-family:system-ui,Arial,sans-serif;'
    });

    bar.innerHTML = `<span>${holiday.message || holiday.name || 'Holiday closure'}</span>
                     <button style="background:#2196f3;border:none;color:#fff;padding:6px 12px;cursor:pointer;border-radius:4px;">Dismiss</button>`;
    bar.querySelector('button').addEventListener('click', () => bar.remove());
    document.body.appendChild(bar);

    // Auto-remove when the holiday period ends if the page stays open
    const msUntilEnd = new Date(end).getTime() - Date.now();
    if (msUntilEnd > 0) setTimeout(() => bar.remove(), msUntilEnd);
  }
})();
