FROM node:22.21.1-alpine AS base
WORKDIR /usr/src/wpp-server
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

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

FROM base AS dependencies
WORKDIR /usr/src/wpp-server
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile && \
    yarn cache clean

FROM base AS build
WORKDIR /usr/src/wpp-server
COPY package.json yarn.lock* ./
COPY --from=dependencies /usr/src/wpp-server/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:22.20.0-alpine
WORKDIR /usr/src/wpp-server/
ENV NODE_ENV=production

RUN apk add --no-cache \
    chromium \
    vips \
    fftw \
    libc6-compat \
    && rm -rf /var/cache/apk/*

COPY --from=dependencies /usr/src/wpp-server/node_modules ./node_modules
COPY --from=build /usr/src/wpp-server/dist ./dist
COPY package.json ./

EXPOSE 21465
ENTRYPOINT ["node", "dist/server.js"]
