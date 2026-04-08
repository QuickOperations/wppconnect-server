# ─── Stage 1: deps ────────────────────────────────────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /usr/src/wpp-server

RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

COPY .yarnrc.yml package.json yarn.lock ./
RUN corepack enable && \
    corepack prepare yarn@4.12.0 --activate && \
    yarn install --immutable

# ─── Stage 2: build ───────────────────────────────────────────────
FROM deps AS build
WORKDIR /usr/src/wpp-server
COPY . .
RUN yarn build

# ─── Stage 3: runtime ─────────────────────────────────────────────
# ghcr.io/puppeteer/puppeteer provee las dependencias de sistema para Chrome
FROM ghcr.io/puppeteer/puppeteer:latest AS runtime
WORKDIR /usr/src/wpp-server

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=build /usr/src/wpp-server/dist ./dist
COPY --from=build /usr/src/wpp-server/node_modules ./node_modules
COPY --from=build /usr/src/wpp-server/package.json ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY scripts/install-chrome.js /tmp/install-chrome.js

RUN chown -R pptruser:pptruser /usr/src/wpp-server
USER pptruser

# Chrome se instala en runtime via docker-entrypoint.sh al primer arranque,
# guardándose en el named volume `puppeteer-cache` para persistir entre reinicios.
# No se instala en build time porque el named volume montado en
# /home/pptruser/.cache/puppeteer sobreescribiría el image layer de todas formas.

EXPOSE 21465
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]