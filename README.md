# n9-node-routing

[![npm version](https://img.shields.io/npm/v/n9-node-routing.svg)](https://www.npmjs.com/package/n9-node-routing)
[![Travis](https://img.shields.io/travis/neo9/n9-node-routing/master.svg)](https://travis-ci.org/neo9/n9-node-routing)
[![Coverage](https://img.shields.io/codecov/c/github/neo9/n9-node-routing/master.svg)](https://codecov.io/gh/neo9/n9-node-routing)

## Easily create express app in TypeScript with Decorators

## Wrapper of project [routing-controllers](https://github.com/typestack/routing-controllers)

1. Install all dependencies and install git hooks with husky :

   `yarn`

2. Run the project tests:

   `yarn test`

## API Documentation

Documentation available as openapi 3.0 format : /documentation.json

Swagger UI for API available at : /documentation

## starter

A starter app is available here : https://github.com/neo9/n9-node-microservice-skeleton

## Some utils

- Unified HttpClient using [got](https://github.com/sindresorhus/got#readme)
- Cargo to group multiple small task into a bigger one, for example, multiple http calls
- HttpCargoBuilder a simpler way to build a cargo to group HTTP calls

## Tests

To run all test : `yarn test` \
To run a test containing foo : `yarn test **/*foo*` \
To debug a test containing foo : `yarn test:dev **/*foo*` it will watch your files a re-run this test each time
