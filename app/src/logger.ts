import Elysia from "elysia";
import pino from "pino";

interface LoggerOptions {
	level: pino.Level;
	pretty: boolean;
}

function createLogger(options: LoggerOptions) {
	const logger = pino({
		level: options.level,
		transport: options.pretty
			? {
					target: "pino-pretty",
				}
			: undefined,
	});

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
			logger.info({
				duration: performance.now() - (ctx.startTime ?? 0),
				error: "error" in ctx ? ctx.error?.toString() : undefined,
				route: ctx.route,
				req: serializeRequest(ctx.request),
			});
		})
		.as("global");
}
