# n9-node-routing

[![npm version](https://img.shields.io/npm/v/@neo9/n9-node-routing.svg)](https://www.npmjs.com/package/@neo9/n9-node-routing)
[![Coverage](https://img.shields.io/codecov/c/github/neo9/n9-node-routing/master.svg)](https://codecov.io/gh/neo9/n9-node-routing)

> Wrapper of project [routing-controllers](https://github.com/typestack/routing-controllers)

## Easily create express app in TypeScript with Decorators

Example :

```typescript
import { Acl, Body, Get, JsonController, Service, Post } from 'n9-node-routing';

@Service()
@JsonController('/foo')
export class ValidateController {
	@Acl([{ action: 'readFoo', user: '@' }])
	@Get('/details')
	public async getFoo(): Promise<object> {
		return {
			foo: 'bar',
		};
	}

	@Post('/')
	public async createFoo(@Body() body: ElementRequestCreate): Promise<any> {
		return body;
	}
}
```

:warning: Some [class-validator](https://github.com/typestack/class-validator) features changes between v 1.26 and 1.29 :

- The "Custom validation decorators" require a new class instance and not only the class reference/name. Here [an example](./test/fixtures/micro-body-class-validation/models/array-validator.models.ts#L39).
- The validation with schema, [here is the issue opened](https://github.com/typestack/class-validator/issues/595)

:warning: BREAKING CHANGES when upgrading to `n9-node-routing` V3

- Drop Node 14 support
- Rename from `n9-node-routing` to `@neo9/n9-node-routing`
- Services injected names change :
  - `@Inject('N9HttpClient') httpClient: N9HttpClient` → `@Inject() httpClient: N9HttpClient`
  - `@Inject('conf') conf: Configuration` → `@Inject() conf: Configuration`
  - `@Inject('logger') logger: N9Log` → `@Inject() logger: N9Log` or in constructor parameters `logger: N9Log`
  - Remove `global` properties :
    - `global.conf` and `global.log` are not set or used anymore
    - `global.db` and `global.dbClient` are not used too
- Log level is by default debug in development environment
- New lifecycle hook : `callbacksBeforeShutdownAfterExpressEnded` to stop databases
- Exported functions has been renamed : Some of the exported functions has been renamed to better reflect what they are doing. This come from `class-transformer` update.
  `classToPlain` → `instanceToPlain`
  `plainToClass` → `plainToInstance`
- `class-validator` and `class-transformer` update to version `0.14.0` and `0.5.1`

:warning: BREAKING CHANGES when upgrading to `n9-node-routing` V2

- Drop Node 12 support
- Startup hooks signature change (`beforeRoutingControllerLaunchHook` and `afterRoutingControllerLaunchHook`) now an object is passed
- Logger labels changes
- Swagger option `isEnable` is renamed `isEnabled` with same default value as before to `true`
- `n9-node-routing` now load the app configuration
- `/ping` response is now an object : `{ response: 'pong' }`
- `/` response is now an object: `{ name: 'myApi' }`
- `/version' response is now an object : `{ version: '1.2.3' }`
- Prometheus metrics are enabled by default. To disable them use `n9NodeRoutingOptions.prometheus.isEnabled: false`

## Features

### API Documentation

Documentation available as openapi 3.0 format : /documentation.json

Swagger UI for API available at : /documentation

### Starter

A starter app is available here : https://github.com/neo9/n9-node-microservice-skeleton

### Init and started files

At startup `n9NodeRouting` does in order :

1.  Find current environment (dev/.../pre-prod/prod)
2.  [Load the conf](https://github.com/neo9/n9-node-conf) for current environment
3.  [Create a logger](https://github.com/neo9/n9-node-log)
4.  Print the current environment, app name and Node.js version (`process.version`)
5.  \* Validate configuration is enabled
6.  \* Start APM if any
7.  Run `*.init.ts` (actually `*.init.js`). Call default exported function with params : `logger`, `conf`
8.  Startup express then start listening on the port 5000 by default
9.  \* Register shutdown callback if any
10. Run `*.started.ts` (actually `*.started.js`). Call default exported function with params : `logger`, `conf`

### Some utils

- Unified HttpClient using [got](https://github.com/sindresorhus/got#readme)
- Cargo to group multiple small task into a bigger one, for example, multiple http calls
- HttpCargoBuilder a simpler way to build a cargo to group HTTP calls
- Validate configuration at startup and expose it on endpoint `/conf`
  :warning: To hide passord, use the transformer like one of this usage

  ```ts
  	@Allow()
  	@Transform(SecretTransformer.GET_TRANSFORMER())
  	secret?: string;

  	@Allow()
  	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.OPAQUE))
  	secretOpaque?: string;

  	@Allow()
  	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.OPAQUE))
  	secretOpaqueNil?: string;

  	@Allow()
  	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.INVISIBLE)) // default
  	secretInvisible?: string;

  	@Allow()
  	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.URI))
  	secretUri?: string;
  ```

### Sentry

To use [Sentry](https://sentry.io/) you only have to ask it to n9-node-routing :

- Basic usage : define the env variable `SENTRY_DSN` and it will activate it with default options.
- Fill the sentry options with at least the `dsn`.

Default enabled options are :

- setting the app version in sentry release
- set the NODE_ENV as sentry environment
- enable tracing for ALL requests

# Tests

To run all test : `yarn test` \
To run a test containing foo : `yarn test **/*foo*` \
To debug a test containing foo : `yarn test:dev **/*foo*` it will watch your files a re-run this test each time

# Dev

1. Install all dependencies and install git hooks with husky :

   `yarn`

2. Run the project tests:

   `yarn test`
