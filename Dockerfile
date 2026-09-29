FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.0.8 --activate
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_API_URL_POLLS
ARG NEXT_PUBLIC_GUILD_ID
ARG NEXT_PUBLIC_LOG_LEVEL=INFO
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_API_URL_POLLS=$NEXT_PUBLIC_API_URL_POLLS \
    NEXT_PUBLIC_GUILD_ID=$NEXT_PUBLIC_GUILD_ID \
    NEXT_PUBLIC_LOG_LEVEL=$NEXT_PUBLIC_LOG_LEVEL
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
ARG INVITE_URL=https://discord.gg/marvel
ENV INVITE_URL=$INVITE_URL
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
