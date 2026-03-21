import { Elysia } from "elysia";
import type { Database } from "./db/client";

export function createHealthRouter(db: Database) {
	return new Elysia().get("/health", async () => {
		try {
			await db.query`SELECT 1 + 2;`;

			return {
				server: true,
				db: true,
			};
		} catch {
			return {
				server: true,
				db: false,
			};
		}
	});
}
