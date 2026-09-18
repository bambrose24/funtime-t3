/**
 * Prisma 6 read `schema` from the connection URL. Prisma 7's pg adapter does
 * not, so production URLs with `?schema=funtime_db` queried `public` instead.
 */
export function prismaPgConfigFromUrl(connectionString: string): {
  connectionString: string;
  schema?: string;
} {
  const url = new URL(connectionString);
  const schema = url.searchParams.get("schema") || undefined;
  url.searchParams.delete("schema");
  return {
    connectionString: url.toString(),
    ...(schema ? { schema } : {}),
  };
}
