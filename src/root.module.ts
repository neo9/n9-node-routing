import { Module } from '@nestjs/common';
import { N9HttpClient } from './utils/http-client-base';


const globalLoggerProvider = {
	provide: 'logger',
	useFactory: () => {
		console.log(`-- app.module.ts  --`, global.log);
		return global.log
	},
};
const globalConfProvider = {
	provide: 'conf',
	useFactory: () => {
		console.log(`-- app.module.ts  --`, global.conf);
		return global.conf
	},
};
// TODO
const N9HttpClientInstance = new N9HttpClient();
export const globalN9HttpClientProvider = {
	provide: 'logger',
	useValue: N9HttpClientInstance,
};


@Module({
	providers: [
		globalLoggerProvider,
		globalConfProvider,
		globalN9HttpClientProvider,
	],
	imports: [global.appModule],
	exports: [global.appModule]
})
export class RootModule {
}