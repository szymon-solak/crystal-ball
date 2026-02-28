import { join } from "node:path";
import { context, propagation } from "@opentelemetry/api";
import { SQL } from "bun";

interface Carrier {
	traceparent?: string;
}

export interface Database {
	seed: () => Promise<void>;

	wrap: <TValues>(values: TValues) => SQL.Helper<TValues>;

	query: <TResult>(
		strings: TemplateStringsArray,
		...values: unknown[]
	) => Promise<TResult>;

	begin: <TResult>(
		callback: (tx: Bun.TransactionSQL) => Promise<TResult>,
	) => Promise<TResult>;
}

export function createDb(connectionString?: string): Database {
	const db = connectionString ? new SQL(connectionString) : new SQL();

	return {
		async seed() {
			return db.file(join(import.meta.dir, "seed.sql"));
		},

		wrap(values) {
			return db(values);
		},

		async query(strings, ...values) {
			const output: Carrier = {};
			propagation.inject(context.active(), output);

			return db`${db.unsafe(`/*traceparent='${output.traceparent}'*/`)}${db(strings, ...values)}`;
		},

		async begin(callback) {
			const output: Carrier = {};
			propagation.inject(context.active(), output);

			return db.transaction(async (tx) => {
				if (output.traceparent) {
					await tx`SET LOCAL pg_tracing.trace_context='traceparent=''${tx.unsafe(`${output.traceparent}`)}''';`;
				}

				return callback(tx);
			});
		},
	};
}
