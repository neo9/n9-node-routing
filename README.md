# n9-node-routing

[![npm version](https://img.shields.io/npm/v/n9-node-routing.svg)](https://www.npmjs.com/package/n9-node-routing)
[![Travis](https://img.shields.io/travis/neo9/n9-node-routing/master.svg)](https://travis-ci.org/neo9/n9-node-routing)
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

:warning: BREAKING CHANGES when upgrading to `n9-node-routing` V2

- Drop Node 12 support
- Startup hooks signature change (`beforeRoutingControllerLaunchHook` and `afterRoutingControllerLaunchHook`) now an object is passed
- Logger labels changes
- Swagger option `isEnable` is renamed `isEnabled` with same default value as before to `true`
- `n9-node-routing` now load the app configuration

## Features

### API Documentation

Documentation available as openapi 3.0 format : /documentation.json

Swagger UI for API available at : /documentation

### Starter

A starter app is available here : https://github.com/neo9/n9-node-microservice-skeleton

### Some utils

- Unified HttpClient using [got](https://github.com/sindresorhus/got#readme)
- Cargo to group multiple small task into a bigger one, for example, multiple http calls
- HttpCargoBuilder a simpler way to build a cargo to group HTTP calls

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
