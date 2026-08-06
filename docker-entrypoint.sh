#!/bin/sh
set -e

echo "info: [entrypoint] user=$(id -un) home=$HOME pwd=$PWD"

# Crea userDataDir si no existe. mkdir -p es idempotente: si ya existe
# no la toca ni borra su contenido (la sesión de WhatsApp persiste).
mkdir -p /usr/src/wpp-server/userDataDir

CACHE_DIR="$HOME/.cache/puppeteer"

# Find existing Chrome binary in the puppeteer cache
find_chrome() {
  find "$CACHE_DIR/chrome" -path '*/chrome-linux64/chrome' -type f 2>/dev/null \
    | sort -V | tail -1
}

CHROME_BIN=$(find_chrome)

# If Chrome is not found, install it using our node_modules install script
if [ -z "$CHROME_BIN" ] || [ ! -x "$CHROME_BIN" ]; then
  echo "info: [entrypoint] Chrome not found in $CACHE_DIR — installing..."
  node /tmp/install-chrome.js
  CHROME_BIN=$(find_chrome)
fi

# Final check
if [ -z "$CHROME_BIN" ] || [ ! -x "$CHROME_BIN" ]; then
  echo "FATAL: [entrypoint] Chrome not found after installation" >&2
  echo "  Cache contents:" >&2
  ls -laR "$CACHE_DIR" 2>/dev/null || echo "  (cache dir does not exist)" >&2
  exit 1
fi

echo "info: [entrypoint] Chrome -> $CHROME_BIN"
export PUPPETEER_EXECUTABLE_PATH="$CHROME_BIN"

exec "$@"
