import { context, propagation } from "@opentelemetry/api";
import { SQL } from "bun";

interface Carrier {
	traceparent?: string;
}

export function createDb() {
	const db = new SQL();

	return {
		async query(strings: TemplateStringsArray, ...values: unknown[]) {
			const output: Carrier = {};
			propagation.inject(context.active(), output);

			return db`${db.unsafe(`/*traceparent='${output.traceparent}'*/`)}${db(strings, ...values)}`;
		},

		async begin<TOutput>(callback: (tx: Bun.TransactionSQL) => TOutput) {
			const output: Carrier = {};
			propagation.inject(context.active(), output);

			return db.transaction(async (tx) => {
				await tx`SET LOCAL pg_tracing.trace_context='traceparent=''${tx.unsafe(`${output.traceparent}`)}''';`;

				return callback(tx);
			});
		},
	};
}
