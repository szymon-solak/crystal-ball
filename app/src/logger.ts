import { getCurrentSpan } from "@elysiajs/opentelemetry";
import Elysia from "elysia";
import pino from "pino";

interface LoggerOptions {
	serviceName: string;
	level: pino.Level;
	pretty: boolean;
}

function createLogger(options: LoggerOptions) {
	const streams = [
		options.pretty
			? [
					pino.transport({
						target: "pino-pretty",
						level: options.level,
						options: {
							colorize: true,
							levelFirst: true,
							translateTime: "HH:MM:ss",
						},
					}),
				]
			: [],

		[
			pino.transport({
				target: "pino-opentelemetry-transport",
				level: options.level,
				options: {
					resourceAttributes: {
						"service.name": options.serviceName,
					},
				},
			}),
		],
	].flat();

	const logger = pino(
		{
			level: "debug",
		},
		pino.multistream(streams),
	);

	return logger;
}

function serializeRequest(request: Request) {
	return {
		method: request.method,
		url: request.url,
	};
}

interface ReqError {
	code: number | string;
	message: string;
}

export function createLoggerMiddleware(options: LoggerOptions) {
	const logger = createLogger(options);

	return new Elysia()
		.resolve(() => {
			return {
				startTime: performance.now(),
				reqError: undefined as ReqError | undefined,
			};
		})
		.onAfterResponse((ctx) => {
			const span = getCurrentSpan()?.spanContext();

			logger.info({
				duration: performance.now() - (ctx.startTime ?? 0),
				error: "error" in ctx ? ctx.error?.toString() : undefined,
				route: ctx.route,
				req: serializeRequest(ctx.request),
				trace_id: span?.traceId,
				span_id: span?.spanId,
				trace_flags: span?.traceFlags,
			});
		})
		.as("global");
}
