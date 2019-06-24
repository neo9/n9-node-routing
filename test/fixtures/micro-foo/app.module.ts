import { Module } from '@nestjs/common';
import { BarController } from './bar/bar.controller';
import { FooController } from './foo/foo.controller';

@Module({
	controllers: [
		BarController,
		FooController,
	],
})
export class ApplicationModule {
}