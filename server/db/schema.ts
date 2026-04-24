/**
 * @deprecated
 * This file previously contained a duplicate PostgreSQL product-domain schema.
 * It has been superseded by the unified schema at `drizzle/schema.ts`.
 *
 * All imports that previously pointed here should be updated to import from
 * `../../drizzle/schema` (or `@/drizzle/schema` via the path alias).
 *
 * This re-export shim is kept temporarily to avoid breaking existing imports
 * while the migration is in progress.
 */
export * from "../../drizzle/schema";
