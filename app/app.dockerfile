FROM oven/bun:1.3.9 AS build

WORKDIR /app

COPY package.json package.json
COPY bun.lock bun.lock

RUN bun install --frozen-lockfile

FROM oven/bun:1.3.9-alpine

WORKDIR /app

COPY --from=build /app/node_modules node_modules
COPY ./src src
COPY package.json package.json

ENV NODE_ENV=production

CMD ["src/index.ts"]

EXPOSE 3007
