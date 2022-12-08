import { NodeOptions as SentryNodeOptionsInterface } from '@sentry/node';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
	Breadcrumb,
	BreadcrumbHint,
	CaptureContext,
	Event,
	EventHint,
	Integration,
	LogLevel,
	Options as SentryNodeOptionsOptionsInterface,
	SamplingContext,
	SdkMetadata,
	Transport,
	TransportClass,
	TransportOptions,
} from '@sentry/types';
import { Allow, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

class Options implements SentryNodeOptionsOptionsInterface {
	@IsOptional()
	@IsBoolean()
	debug?: boolean;

	@IsOptional()
	@IsBoolean()
	enabled?: boolean;

	@IsOptional()
	@IsString()
	dsn?: string;

	@IsOptional()
	@Allow()
	defaultIntegrations?: false | Integration[];

	@IsOptional()
	@Allow()
	integrations?: Integration[] | ((integrations: Integration[]) => Integration[]);

	@IsOptional()
	@Allow()
	ignoreErrors?: (string | RegExp)[];

	@IsOptional()
	@Allow()
	transport?: TransportClass<Transport>;

	@IsOptional()
	@Allow()
	transportOptions?: TransportOptions;

	@IsOptional()
	@IsString()
	tunnel?: string;

	@IsOptional()
	@IsString()
	release?: string;

	@IsOptional()
	@IsString()
	environment?: string;

	@IsOptional()
	@IsString()
	dist?: string;

	@IsOptional()
	@IsNumber()
	maxBreadcrumbs?: number;

	@IsOptional()
	@IsEnum(LogLevel)
	logLevel?: LogLevel;

	@IsOptional()
	@IsNumber()
	sampleRate?: number;

	@IsOptional()
	@IsBoolean()
	attachStacktrace?: boolean;

	@IsOptional()
	@IsNumber()
	maxValueLength?: number;

	@IsOptional()
	@IsNumber()
	normalizeDepth?: number;

	@IsOptional()
	@IsNumber()
	shutdownTimeout?: number;

	@IsOptional()
	@IsNumber()
	tracesSampleRate?: number;

	@IsOptional()
	@IsBoolean()
	autoSessionTracking?: boolean;

	@IsOptional()
	@Allow()
	initialScope?: CaptureContext;

	@IsOptional()
	@Allow()
	_metadata?: SdkMetadata;

	@IsOptional()
	@Allow()
	_experiments?: {
		[key: string]: any;
	};

	// No validation because it shouldn't be in the conf but passed to the constructor as an option
	tracesSampler?(samplingContext: SamplingContext): number | boolean;

	// No validation because it shouldn't be in the conf but passed to the constructor as an option
	beforeSend?(event: Event, hint?: EventHint): PromiseLike<Event | null> | Event | null;

	// No validation because it shouldn't be in the conf but passed to the constructor as an option
	beforeBreadcrumb?(breadcrumb: Breadcrumb, hint?: BreadcrumbHint): Breadcrumb | null;
}

export class NodeOptions extends Options implements SentryNodeOptionsInterface {
	@IsOptional()
	@IsString()
	serverName?: string;

	@IsOptional()
	@IsNumber()
	shutdownTimeout?: number;

	@IsOptional()
	@IsString()
	httpProxy?: string;

	@IsOptional()
	@IsString()
	httpsProxy?: string;

	@IsOptional()
	@IsString()
	caCerts?: string;

	@IsOptional()
	@IsInt()
	frameContextLines?: number;

	// No validation because it shouldn't be in the conf but passed to the constructor as an option
	onFatalError?(error: Error): void;
}
