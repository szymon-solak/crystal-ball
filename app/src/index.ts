import { createApp } from "./app";

createApp({
	port: process.env.PORT ? Number(process.env.PORT) : 3007,
}).then((app) => {
	console.log(
		`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
	);
});
