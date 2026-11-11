// Usage: node wpp-probe.js <session> [seconds]
// Samples every 10s the WhatsApp pages of a session through CDP and prints wa-js state and console errors.
const fs = require('fs');
const http = require('http');
let WS;
try { WS = require('ws'); } catch (e) { WS = globalThis.WebSocket; }
const session = process.argv[2];
const total = parseInt(process.argv[3] || '600', 10);
const portFile = '/usr/src/wpp-server/userDataDir/' + session + '/DevToolsActivePort';
const EXPR = '(() => { const w = window.WPP; const base = {rs: document.readyState, vis: document.visibilityState, focus: document.hasFocus(), wpp: typeof w, inj: !!(w && w.isInjected), ready: !!(w && w.isReady), full: !!(w && w.isFullReady), wapi: typeof window.WAPI, store: typeof window.Store, ver: (window.Debug && window.Debug.VERSION) || null, title: document.title}; return new Promise((resolve) => { const t0 = performance.now(); const timer = setTimeout(() => { base.raf = "NO DISPARA en 3s"; resolve(JSON.stringify(base)); }, 3000); requestAnimationFrame(() => { clearTimeout(timer); base.raf = Math.round(performance.now() - t0) + "ms"; resolve(JSON.stringify(base)); }); }); })()';
const conns = new Map();
const seen = new Set();
const ts = () => new Date().toISOString().slice(11, 19);
const log = (m) => console.log(ts() + ' ' + m);
function getJson(port, path) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port, path, timeout: 4000 }, (res) => {
      let b = '';
      res.on('data', (d) => (b += d));
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}
function note(id, kind, text) {
  const line = String(text || '').replace(/\s+/g, ' ').slice(0, 300);
  const key = id + kind + line;
  if (seen.has(key) || seen.size > 400) return;
  seen.add(key);
  log('  [' + id + '] ' + kind + ': ' + line);
}
function attach(t) {
  const id = t.id.slice(0, 6);
  const c = { ws: new WS(t.webSocketDebuggerUrl), n: 10, pending: new Map(), open: false };
  conns.set(t.id, c);
  c.ws.onopen = () => {
    c.open = true;
    c.ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    c.ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
  };
  c.ws.onmessage = (ev) => {
    let m;
    try { m = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString()); } catch (e) { return; }
    if (m.id && c.pending.has(m.id)) { c.pending.get(m.id)(m); c.pending.delete(m.id); return; }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) {
      note(id, 'console.' + m.params.type, m.params.args.map((a) => a.value || a.description || '').join(' '));
    } else if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      note(id, 'exception', (d.exception && d.exception.description) || d.text);
    } else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      note(id, 'log.error', m.params.entry.text + ' ' + (m.params.entry.url || ''));
    }
  };
  c.ws.onclose = () => { conns.delete(t.id); };
  c.ws.onerror = () => { conns.delete(t.id); };
}
function evalPage(c) {
  return new Promise((resolve) => {
    if (!c.open) return resolve('conectando');
    const id = ++c.n;
    const timer = setTimeout(() => { c.pending.delete(id); resolve('EVAL SIN RESPUESTA (renderer colgado)'); }, 8000);
    c.pending.set(id, (m) => {
      clearTimeout(timer);
      const r = m.result && m.result.result;
      resolve(r && r.value ? r.value : JSON.stringify(m.error || (m.result && m.result.exceptionDetails && m.result.exceptionDetails.text) || m).slice(0, 200));
    });
    try { c.ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: EXPR, returnByValue: true, awaitPromise: true } })); } catch (e) { clearTimeout(timer); resolve('ws cerrado'); }
  });
}
async function tick() {
  let port = null;
  try { port = parseInt(fs.readFileSync(portFile, 'utf8').split('\n')[0], 10); } catch (e) {}
  const list = port ? await getJson(port, '/json/list') : null;
  if (!list) { log('sin navegador (puerto ' + port + ')'); return; }
  const pages = list.filter((t) => t.type === 'page');
  const wa = pages.filter((t) => (t.url || '').startsWith('https://web.whatsapp.com'));
  log('puerto ' + port + ' paginas=' + pages.length + ' whatsapp=' + wa.length + ' otras=' + pages.filter((t) => !wa.includes(t)).map((t) => (t.url || '').slice(0, 40)).join(','));
  for (const t of wa) {
    if (!conns.has(t.id)) attach(t);
    const r = await evalPage(conns.get(t.id) || { open: false });
    log('  [' + t.id.slice(0, 6) + '] ' + r);
  }
}
(async () => {
  const end = Date.now() + total * 1000;
  while (Date.now() < end) {
    await tick();
    await new Promise((r) => setTimeout(r, 10000));
  }
  process.exit(0);
})();
