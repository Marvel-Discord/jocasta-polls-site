const config = {
  publicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  inviteUrl: process.env.INVITE_URL,
  apiUrlPolls: process.env.NEXT_PUBLIC_API_URL_POLLS,
  guildId: process.env.NEXT_PUBLIC_GUILD_ID ?? "0",
  logLevel: process.env.LOG_LEVEL || process.env.NEXT_PUBLIC_LOG_LEVEL,
} as const;

export default config;
