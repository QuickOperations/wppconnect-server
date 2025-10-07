# --- Build stage ------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /usr/src/wpp-server

ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json yarn.lock ./

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
      vips vips-dev fftw-dev \
      gcc g++ make libc6-compat \
      libjpeg-turbo-dev libpng-dev libwebp-dev \
      python3 git \
    && yarn install --production=false --pure-lockfile \
    && yarn add sharp --ignore-engines --force \
    && yarn cache clean \
    && apk del gcc g++ make python3 git vips-dev fftw-dev \
    && rm -rf /var/cache/apk/* /root/.cache

COPY . .
RUN yarn build

FROM node:22-alpine AS runtime
WORKDIR /usr/src/wpp-server

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
      vips \
      chromium \
      nss \
      freetype \
      ttf-freefont \
      libjpeg-turbo \
      libpng \
      libwebp \
    && rm -rf /var/cache/apk/*

COPY --from=build /usr/src/wpp-server/dist ./dist
COPY --from=build /usr/src/wpp-server/node_modules ./node_modules
COPY package.json ./

RUN adduser -D appuser
USER appuser

EXPOSE 21465
ENTRYPOINT ["node", "dist/server.js"]
