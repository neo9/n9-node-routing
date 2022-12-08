import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { classToPlain, plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import * as N9NodeRouting from './models/routing';
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
		if (validationError.constraints?.whitelistValidation) {
			formattedWhitelistErrors.push([
				computedPrefix,
				validationError.constraints.whitelistValidation,
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

function formatValidationErrors(
	validationErrors: ValidationError[],
	prefix: string,
): [key: string, message: string[]][] {
	const formattedErrors: [key: string, message: string[]][] = [];
	for (const validationError of validationErrors) {
		const computedPrefix = prefix
			? `${prefix}.${validationError.property}`
			: validationError.property;
		if (validationError.constraints) {
			const formattedError: [key: string, message: string[]] = [computedPrefix, []];
			for (const key of Object.keys(validationError.constraints)) {
				formattedError[1].push(`${key}: ${validationError.constraints[key]}`);
			}
			formattedErrors.push(formattedError);
		}
		if (validationError.children) {
			formattedErrors.push(...formatValidationErrors(validationError.children, computedPrefix));
		}
	}
	return formattedErrors;
}

function assertClassTypeIsGiven(validationOptions: ConfValidationOptions): void {
	if (!validationOptions.classType) {
		throw new N9Error(
			'N9NodeRouting configuration validation options are not correct validation is enabled but' +
				' no classType is given',
			500,
			validationOptions,
		);
	}
}

function handleValidationErrors(
	validationErrors: ValidationError[],
	logger: N9Log,
	options: ConfValidationOptions,
): void {
	const noError = validationErrors.length === 0;
	if (noError) return;

	const validationErrorsWithoutExcludeProperties = classToPlain(validationErrors);
	if (!options.formatValidationErrors) {
		logger.error('Configuration is not valid', {
			validationErrors: JSON.stringify(validationErrorsWithoutExcludeProperties),
		});
		throw new N9Error('Configuration is not valid', 500, {
			validationErrors: validationErrorsWithoutExcludeProperties,
		});
	}

	logger.error('Configuration is not valid: ');
	const validationErrorsFormatted = formatValidationErrors(validationErrors, undefined);
	for (const validationError of validationErrorsFormatted) {
		const attributePath = validationError[0];
		const errorList = validationError[1];
		for (const error of errorList) {
			logger.error(`Attribute ${attributePath} is not valid - ${error}`);
		}
	}
	throw new N9Error('Configuration is not valid', 500, {
		validationErrors: validationErrorsWithoutExcludeProperties,
	});
}

function handleWhitelistErrors(
	whitelistErrors: ValidationError[],
	logger: N9Log,
	options: ConfValidationOptions,
): void {
	const noError = whitelistErrors.length === 0;
	if (noError) return;

	const whitelistErrorsWithoutExcludeProperties = classToPlain(whitelistErrors);
	if (!options.formatWhitelistErrors) {
		logger.warn('Configuration contains unexpected attributes / Please remove those attributes', {
			warnings: JSON.stringify(whitelistErrorsWithoutExcludeProperties),
		});
		return;
	}

	logger.warn('Configuration contains unexpected attributes:');
	const whitelistErrorsFormatted = formatWhitelistErrors(whitelistErrors, undefined);
	for (const whitelistError of whitelistErrorsFormatted) {
		const attributePath = whitelistError[0];
		logger.warn(`Please remove attribute '${attributePath}' from the configuration`);
	}
}

export async function validateConf<ConfType extends N9NodeRouting.N9NodeRoutingBaseConf>(
	conf: unknown,
	validationOptions: ConfValidationOptions<ConfType>,
	logger: N9Log,
): Promise<ConfType> {
	const validationIsEnabled = validationOptions && validationOptions.isEnabled;
	if (!validationIsEnabled) {
		logger.info('Configuration validation is disabled');
		return;
	}

	assertClassTypeIsGiven(validationOptions);

	logger.info('Checking configuration...');
	const confInstance = plainToClass(validationOptions.classType, conf);

	const validationErrors = await validate(confInstance as object);
	handleValidationErrors(validationErrors, logger, validationOptions);

	const whitelistErrors = await validate(confInstance as object, {
		whitelist: true,
		forbidNonWhitelisted: true,
	});
	handleWhitelistErrors(whitelistErrors, logger, validationOptions);

	logger.info('Configuration is valid');

	return confInstance;
}
