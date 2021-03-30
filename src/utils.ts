export type Environment = 'development' | 'production' | string;

export function getEnvironment(): Environment {
	const isDevelopmentEnv = process.env.NODE_ENV && process.env.NODE_ENV === 'development';
	return isDevelopmentEnv ? 'development' : process.env.NODE_ENV;
}

export function isNil(value: any): boolean {
	return value === undefined || value === null;
}
