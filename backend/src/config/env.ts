import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),

  databaseUrl: requireEnv("DATABASE_URL"),

  jwtAccessSecret: requireEnv("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: requireEnv("JWT_REFRESH_SECRET"),

  accessTokenTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 900),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30),

  corsOrigin: requireEnv("CORS_ORIGIN"),
};