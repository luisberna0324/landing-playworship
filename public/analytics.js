(function () {
  'use strict';
  var id = 'G-T5ZSHD3VT0';
  var key = 'playworship.analytics-consent.v1';
  var allowed = ['playworship.app', 'www.playworship.app', 'play-worship.web.app', 'play-worship.firebaseapp.com'];
  if (allowed.indexOf(location.hostname) === -1) return;
  var blocked = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  var choice = null;
  try { choice = localStorage.getItem(key); } catch (_) {}
  if (choice !== 'granted' && choice !== 'denied') choice = null;
  var loaded = false;
  window['ga-disable-' + id] = true;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  function cleanUrl(value) {
    try { var url = new URL(value); return url.origin + url.pathname; } catch (_) { return ''; }
  }
  function eraseCookies() {
    document.cookie.split(';').forEach(function (item) {
      var name = item.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      ['', location.hostname, '.' + location.hostname, '.playworship.app'].forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax; Secure' + (domain ? '; Domain=' + domain : '');
      });
    });
  }
  function update(value) {
    choice = value;
    try { localStorage.setItem(key, value); } catch (_) {}
    var permitted = value === 'granted' && !blocked;
    window['ga-disable-' + id] = !permitted;
    gtag('consent', 'update', { analytics_storage: permitted ? 'granted' : 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    if (!permitted) { eraseCookies(); return; }
    if (loaded) return;
    loaded = true;
    gtag('js', new Date());
    gtag('config', id, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: cleanUrl(location.href), page_referrer: cleanUrl(document.referrer), page_title: 'PlayWorship' });
    gtag('event', 'page_view', { page_location: cleanUrl(location.href), page_referrer: cleanUrl(document.referrer), page_title: 'PlayWorship' });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(script);
  }
  function mount() {
    var style = document.createElement('style');
    style.textContent = '#pw-consent{position:fixed;z-index:10000;bottom:16px;left:16px;right:16px;max-width:620px;padding:20px;background:#202725;color:#fff;border:1px solid #60726a;border-radius:16px;box-shadow:0 8px 32px #0005;font:14px/1.5 system-ui,sans-serif;box-sizing:border-box}#pw-consent[hidden]{display:none}#pw-consent p{margin:0 0 14px}#pw-consent a{color:#a0efbd;text-decoration:underline}#pw-consent strong{font-size:16px}#pw-consent-actions{display:flex;gap:10px;flex-wrap:wrap}#pw-consent button,#pw-privacy-settings{font:inherit;cursor:pointer;border:1px solid #9cad9f;border-radius:9px;padding:10px 14px;background:#202725;color:#fff}#pw-consent button{flex:1;min-width:170px}#pw-consent button:focus-visible,#pw-privacy-settings:focus-visible{outline:3px solid #5aee92;outline-offset:3px}#pw-consent button:disabled{opacity:.6;cursor:default}#pw-privacy-settings{position:fixed;z-index:9999;bottom:12px;left:12px;font:12px system-ui,sans-serif;padding:7px 11px}';
    document.head.appendChild(style);
    var panel = document.createElement('section');
    panel.id = 'pw-consent';
    panel.setAttribute('aria-label', 'Preferencias de cookies');
    var heading = document.createElement('p');
    var title = document.createElement('strong');
    title.textContent = 'Usamos cookies';
    heading.appendChild(title);
    var text = document.createElement('p');
    text.textContent = 'Utilizamos cookies para analizar las visitas y mejorar tu experiencia en PlayWorship. Puedes aceptar o rechazar las cookies opcionales. Más información en nuestra ';
    var link = document.createElement('a');
    link.href = '/legal/privacidad.html';
    link.textContent = 'Política de privacidad';
    text.appendChild(link);
    var actions = document.createElement('div');
    actions.id = 'pw-consent-actions';
    var deny = document.createElement('button');
    deny.type = 'button';
    deny.textContent = 'Rechazar opcionales';
    var allow = document.createElement('button');
    allow.type = 'button';
    allow.textContent = 'Aceptar cookies';
    if (blocked) {
      allow.disabled = true;
      var notice = document.createElement('p');
      notice.textContent = 'Respetamos la señal de no rastrear de tu navegador: la analítica está desactivada.';
      panel.appendChild(notice);
    }
    var settings = document.createElement('button');
    settings.id = 'pw-privacy-settings';
    settings.type = 'button';
    settings.textContent = 'Configurar cookies';
    settings.setAttribute('aria-controls', panel.id);
    function close(value) { update(value); panel.hidden = true; settings.hidden = false; settings.setAttribute('aria-expanded', 'false'); settings.focus(); }
    deny.addEventListener('click', function () { close('denied'); });
    allow.addEventListener('click', function () { close('granted'); });
    settings.addEventListener('click', function () { panel.hidden = false; settings.hidden = true; settings.setAttribute('aria-expanded', 'true'); deny.focus(); });
    actions.appendChild(deny);
    actions.appendChild(allow);
    panel.appendChild(heading);
    panel.appendChild(text);
    panel.appendChild(actions);
    panel.hidden = choice !== null;
    settings.hidden = !panel.hidden;
    settings.setAttribute('aria-expanded', String(!panel.hidden));
    document.body.appendChild(panel);
    document.body.appendChild(settings);
  }
  if (choice) update(choice);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
}());
