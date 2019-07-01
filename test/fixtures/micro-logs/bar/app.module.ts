import { Module } from '@nestjs/common';
import { RootModule } from '../../../../src/root.module';
import { BarController } from './bar.controller';


@Module({
	controllers: [
		BarController,
	],
	imports: [
			RootModule
	]
})
export class ApplicationModule {
}