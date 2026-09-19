import { PrismaClient } from '@prisma/client'

/**
 * Ensures the DATABASE_URL has `pgbouncer=true` and `connection_limit=1`
 * so Prisma disables prepared statements when connecting through Supabase's
 * PgBouncer pooler (port 6543, transaction mode).
 * Without this, Vercel serverless cold-starts throw:
 *   PostgresError { code: "42P05", message: "prepared statement already exists" }
 */
function buildDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return undefined

  try {
    const parsed = new URL(url)
    if (!parsed.searchParams.has('pgbouncer')) {
      parsed.searchParams.set('pgbouncer', 'true')
    }
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '1')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

const prismaClientSingleton = () => {
  const url = buildDatasourceUrl()
  return new PrismaClient({
    datasources: url ? { db: { url } } : undefined,
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
