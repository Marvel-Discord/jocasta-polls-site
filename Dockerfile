FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.0.8 --activate
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV NEXT_PUBLIC_BASE_URL=https://polls-dev.marvelcord.com \
    NEXT_PUBLIC_API_URL_POLLS=https://polls-dev-api.marvelcord.com/api/v1 \
    NEXT_PUBLIC_GUILD_ID=1010550869391065169 \
    NEXT_PUBLIC_LOG_LEVEL=INFO
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 INVITE_URL=https://discord.gg/marvel
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
