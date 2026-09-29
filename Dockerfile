FROM node:22-alpine

RUN corepack enable \
    && corepack prepare pnpm@10.13.1 --activate

WORKDIR /usr/src/app

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
