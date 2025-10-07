FROM node:22.20.0-alpine AS base
WORKDIR /usr/src/wpp-server
ENV NODE_ENV=production PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY package.json ./
RUN apk update && \
    apk add --no-cache \
    vips \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc6-compat \
    && rm -rf /var/cache/apk/*
RUN yarn install --production --pure-lockfile && \
    yarn cache clean

FROM base AS build
WORKDIR /usr/src/wpp-server
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY package.json  ./
RUN yarn install --production=false --pure-lockfile
COPY . .
RUN yarn build
RUN yarn cache clean

FROM base
WORKDIR /usr/src/wpp-server/

RUN apk add --no-cache chromium && \
    rm -rf /var/cache/apk/*

COPY --from=build /usr/src/wpp-server/dist ./dist
COPY package.json ./

EXPOSE 21465
ENTRYPOINT ["node", "dist/server.js"]
