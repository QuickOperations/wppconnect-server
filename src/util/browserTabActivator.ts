/*
 * Keeps the WhatsApp Web tab of a session in the foreground while the client
 * is being created.
 *
 * @wppconnect-team/wppconnect waits for wa-js with page.waitForFunction, which
 * polls on requestAnimationFrame. Chrome does not fire animation frames in a
 * hidden tab, so when another tab of the same browser is in front the wait
 * never resolves and the start fails with InjectionTimeoutError even though
 * wa-js is ready. Bringing the tab to front through the DevTools HTTP endpoint
 * makes the wait resolve.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';

const WHATSAPP_URL = 'https://web.whatsapp.com';
const POLL_INTERVAL_MS = 2000;
const MAX_DURATION_MS = 150000;
const REQUEST_TIMEOUT_MS = 1500;

interface DevToolsTarget {
  id: string;
  type: string;
  url: string;
  title: string;
}

function devToolsGet(port: number, requestPath: string): Promise<string> {
  return new Promise((resolve) => {
    const request = http.get(
      {
        host: '127.0.0.1',
        port,
        path: requestPath,
        timeout: REQUEST_TIMEOUT_MS,
      },
      (response) => {
        let body = '';
        response.on('data', (chunk) => (body += chunk));
        response.on('end', () => resolve(body));
      }
    );
    request.on('error', () => resolve(''));
    request.on('timeout', () => {
      request.destroy();
      resolve('');
    });
  });
}

function readDevToolsPort(userDataDir: string): number | null {
  try {
    const content = fs.readFileSync(
      path.join(userDataDir, 'DevToolsActivePort'),
      'utf8'
    );
    const port = parseInt(content.split('\n')[0], 10);
    return Number.isInteger(port) && port > 0 ? port : null;
  } catch (error) {
    return null;
  }
}

async function activateWhatsAppTab(userDataDir: string): Promise<boolean> {
  const port = readDevToolsPort(userDataDir);
  if (!port) return false;
  let targets: DevToolsTarget[];
  try {
    targets = JSON.parse(await devToolsGet(port, '/json/list'));
  } catch (error) {
    return false;
  }
  if (!Array.isArray(targets)) return false;
  // Tabs that never loaded keep the host name (or nothing) as their title
  const loadedTab = targets.find(
    (target) =>
      target.type === 'page' &&
      (target.url || '').startsWith(WHATSAPP_URL) &&
      (target.title || '').includes('WhatsApp')
  );
  if (!loadedTab) return false;
  const result = await devToolsGet(port, '/json/activate/' + loadedTab.id);
  return result.includes('activated');
}

/**
 * Starts polling and returns a function that stops it.
 */
export function keepWhatsAppTabVisible(
  userDataDir: string,
  session: string,
  logger?: { info: (message: string) => void }
): () => void {
  const startedAt = Date.now();
  let stopped = false;
  let running = false;
  let announced = false;
  const stop = () => {
    stopped = true;
    clearInterval(timer);
  };
  const timer = setInterval(async () => {
    if (stopped || running) return;
    if (Date.now() - startedAt > MAX_DURATION_MS) return stop();
    running = true;
    try {
      const activated = await activateWhatsAppTab(userDataDir);
      if (activated && !announced && !stopped) {
        announced = true;
        logger?.info(`[${session}:browser] WhatsApp tab brought to front`);
      }
    } catch (error) {
      // Best effort: the start must never fail because of this helper
    } finally {
      running = false;
    }
  }, POLL_INTERVAL_MS);
  timer.unref?.();
  return stop;
}
