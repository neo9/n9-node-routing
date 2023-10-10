import * as net from 'net';

export type Environment = 'development' | 'production' | string;

export function getEnvironment(): Environment {
	const isDevelopmentEnv = process.env.NODE_ENV && process.env.NODE_ENV === 'development';
	return isDevelopmentEnv ? 'development' : process.env.NODE_ENV;
}

export function isNil(value: any): boolean {
	return value === undefined || value === null;
}

export async function isPortAvailable(port: number): Promise<boolean> {
	// src: https://github.com/sindresorhus/get-port/blob/main/index.js#L56
	return await new Promise<boolean>((resolve) => {
		const server = net.createServer();
		server.unref();
		server.on('error', () => resolve(false));

		server.listen({ port }, () => {
			server.close(() => {
				resolve(true);
			});
		});
	});
}
