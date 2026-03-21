import { createDb, type Database } from "../db/client";

const rollbackError = "[ROLLBACK]";

export function testApi(callback: (db: Database) => Promise<unknown>) {
	const db = createDb();

	return async () => {
		return db
			.begin(async (tx) => {
				const transactionDb: Database = {
					seed: () => Promise.resolve(),
					wrap: db.wrap,
					query: tx,
					begin: (callback) => callback(tx),
				};

				await callback(transactionDb);

				throw new Error(rollbackError);
			})
			.catch((error) => {
				if (error instanceof Error && error.message === rollbackError) {
					return;
				}

				throw error;
			});
	};
}
