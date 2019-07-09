import { forwardRef, Module } from '@nestjs/common';
import { N9HttpClient } from './utils/http-client-base';

const globalLoggerProvider = {
	provide: 'logger',
	useFactory: () => {
		// console.log(`-- app.module.ts log --`, global.log);
		return global.log;
	},
};
const globalConfProvider = {
	provide: 'conf',
	useFactory: () => {
		// console.log(`-- app.module.ts conf  --`, global.conf);
		return global.conf;
	},
};

const N9HttpClientInstance = new N9HttpClient();
const globalN9HttpClientProvider = {
	provide: 'n9HttpClient',
	useValue: N9HttpClientInstance,
};

@Module({
	providers: [
		globalLoggerProvider,
		globalConfProvider,
		globalN9HttpClientProvider,
	],
	exports: [
			'logger',
			'conf',
			'n9HttpClient'
	]
})
export class RootModule {
}
