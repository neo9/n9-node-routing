import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { N9NodeRouting } from './models/routing.models';
import ConfValidationOptions = N9NodeRouting.ConfValidationOptions;

function formatWhitelistErrors(
	validationErrors: ValidationError[],
	prefix: string,
): [key: string, message: string][] {
	const formattedWhitelistErrors: [key: string, message: string][] = [];
	for (const validationError of validationErrors) {
		const computedPrefix = prefix
			? `${prefix}.${validationError.property}`
			: validationError.property;
		if (validationError?.constraints?.whitelistValidation) {
			formattedWhitelistErrors.push([
				computedPrefix,
				validationError?.constraints?.whitelistValidation,
			]);
		}
		if (validationError.children) {
			formattedWhitelistErrors.push(
				...formatWhitelistErrors(validationError.children, computedPrefix),
			);
		}
	}
	return formattedWhitelistErrors;
}

function assertClassTypeIsGiven(validationOptions: ConfValidationOptions): void {
	if (validationOptions.isEnabled && !validationOptions.classType) {
		throw new N9Error(
			'N9NodeRouting configuration validation options are not correct validation is enabled but' +
				' no classType is given',
			500,
			validationOptions,
		);
	}
}

function handleValidationErrors(validationErrors: ValidationError[]): void {
	if (validationErrors.length) {
		throw new N9Error('Configuration is not valid', 500, { validationErrors });
	}
}

function handleWhitelistErrors(
	whitelistErrors: ValidationError[],
	logger: N9Log,
	options: ConfValidationOptions,
): void {
	if (whitelistErrors.length) {
		logger.warn('Configuration contains unexpected attributes / Please remove those attributes', {
			warnings: options.formatWhitelistErrors
				? formatWhitelistErrors(whitelistErrors, undefined)
				: whitelistErrors,
		});
	}
}

export async function validateConf(
	conf: unknown,
	validationOptions: ConfValidationOptions,
	logger: N9Log,
): Promise<void> {
	const validationIsEnabled = validationOptions && validationOptions.isEnabled;
	if (!validationIsEnabled) {
		logger.info('Configuration validation is disabled');
		return;
	}

	assertClassTypeIsGiven(validationOptions);

	logger.info('Checking configuration...');
	const confInstance = plainToClass(validationOptions.classType, conf);

	const validationErrors = await validate(confInstance as object);
	handleValidationErrors(validationErrors);

	const whitelistErrors = await validate(confInstance as object, {
		whitelist: true,
		forbidNonWhitelisted: true,
	});
	handleWhitelistErrors(whitelistErrors, logger, validationOptions);

	logger.info('Configuration is valid');
}
