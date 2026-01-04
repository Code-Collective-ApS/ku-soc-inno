import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";

import * as schema from "../db/schema";

const pgUri = process.env.DATABASE_URL as string;
const queryClient = postgres(pgUri, {});
// const queryClient = new pg.Client({
//   connectionString: process.env.DATABASE_URL as string,
// });
export const db = drizzle({ client: queryClient, schema });

/**
 * Filters out any relation definitions from your schema
 */
type SchemaTableNames = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [TableOrRelationName in keyof typeof schema]: (typeof schema)[TableOrRelationName] extends PgTableWithColumns<any>
    ? TableOrRelationName
    : never;
}[keyof typeof schema];

type DBSelectTypeMap = {
  [TableName in SchemaTableNames]: InferSelectModel<(typeof schema)[TableName]>;
};
/**
 * Get the SELECT type for a table given it's export name in the drizzle schema.
 */
export type Doc<TableName extends keyof DBSelectTypeMap> =
  DBSelectTypeMap[TableName];

type DBInsertTypeMap = {
  [TableName in SchemaTableNames]: InferInsertModel<(typeof schema)[TableName]>;
};
/**
 * Get the INSERT type for a table given it's export name in the drizzle schema.
 */
export type DocInsert<TableName extends keyof DBInsertTypeMap> =
  DBInsertTypeMap[TableName];
