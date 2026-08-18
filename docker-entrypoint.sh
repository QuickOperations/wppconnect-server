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

# ─── Limpieza de locks huérfanos de Chrome ────────────────────────
# El SingletonLock/Socket/Cookie guarda el hostname+PID del contenedor
# que los creó. Al recrear el contenedor (rebuild, down/up) el hostname
# cambia y Chrome se niega a abrir el perfil ajeno (Error Code 21).
# En este punto del arranque ningún Chrome corre todavía, así que
# borrarlos es seguro: NO toca credenciales ni el vínculo de WhatsApp,
# solo libera el candado de proceso. El lock se recrea limpio cuando
# Chrome arranca con el hostname+PID nuevos.
echo "info: [entrypoint] Limpiando locks huérfanos de Chrome..."
find /usr/src/wpp-server/userDataDir -name "SingletonLock" -delete 2>/dev/null || true
find /usr/src/wpp-server/userDataDir -name "SingletonSocket" -delete 2>/dev/null || true
find /usr/src/wpp-server/userDataDir -name "SingletonCookie" -delete 2>/dev/null || true

exec "$@"