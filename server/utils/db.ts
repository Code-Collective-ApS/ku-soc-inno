import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";

const pgUri = process.env.DATABASE_URL as string;
const queryClient = postgres(pgUri, {});
// const queryClient = new pg.Client({
//   connectionString: process.env.DATABASE_URL as string,
// });
export const db = drizzle({ client: queryClient, schema });
