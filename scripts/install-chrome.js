'use strict';
/**
 * Installs the exact Chrome version that our puppeteer-core expects.
 *
 * Uses @puppeteer/browsers from our own node_modules instead of relying on
 * the globally installed `puppeteer` CLI, which may be a different version
 * (e.g., the one bundled in the ghcr.io/puppeteer/puppeteer base image).
 */
const path = require('path');
const os = require('os');

const ROOT = '/usr/src/wpp-server';

/** Read the Chrome buildId that our puppeteer-core was built for */
function getChromeBuildId() {
  const attempts = [
    // puppeteer-core >=21 — stored in revisions.js
    () => {
      const { PUPPETEER_REVISIONS } = require(path.join(
        ROOT,
        'node_modules/puppeteer-core/lib/cjs/puppeteer/revisions.js'
      ));
      return PUPPETEER_REVISIONS.chrome;
    },
    // puppeteer-core — stored in package.json under `puppeteer.chrome`
    () => {
      const pkg = require(path.join(
        ROOT,
        'node_modules/puppeteer-core/package.json'
      ));
      return pkg.puppeteer?.chrome;
    },
    // puppeteer-core — stored in package.json under `puppeteer.browsers.chrome`
    () => {
      const pkg = require(path.join(
        ROOT,
        'node_modules/puppeteer-core/package.json'
      ));
      return pkg.puppeteer?.browsers?.chrome;
    },
  ];

  for (const fn of attempts) {
    try {
      const buildId = fn();
      if (buildId) return buildId;
    } catch {
      // try next
    }
  }

  throw new Error(
    'Could not determine Chrome buildId from puppeteer-core. ' +
      'Check node_modules/puppeteer-core/lib/cjs/puppeteer/revisions.js'
  );
}

async function main() {
  const { install, detectBrowserPlatform, Browser } = require(path.join(
    ROOT,
    'node_modules/@puppeteer/browsers'
  ));

  const buildId = getChromeBuildId();
  const cacheDir = path.join(os.homedir(), '.cache/puppeteer');
  const platform = detectBrowserPlatform();

  console.log(`Installing Chrome ${buildId} [${platform}] → ${cacheDir}`);

  const result = await install({
    browser: Browser.CHROME,
    buildId,
    cacheDir,
    platform,
  });

  console.log(`Chrome ready: ${result.executablePath}`);
}

main().catch((err) => {
  console.error(`Chrome install failed: ${err.message}`);
  process.exit(1);
});
