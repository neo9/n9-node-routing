

# [2.0.0](https://github.com/neo9/n9-node-routing/compare/2.0.0-rc.6...2.0.0) (2022-12-29)

# [2.0.0-rc.6](https://github.com/neo9/n9-node-routing/compare/2.0.0-rc.5...2.0.0-rc.6) (2022-12-28)


### conf

* Allow to generate documentation json without param ([7b6f216](https://github.com/neo9/n9-node-routing/commit/7b6f216e057c4dcac748d57dfa3fca0c5e2358d4))
* Enable conf validation with only the type given ([cdaf399](https://github.com/neo9/n9-node-routing/commit/cdaf399f4071221fe05a60549c7d67ad2d9ec7dc))

# [2.0.0-rc.5](https://github.com/neo9/n9-node-routing/compare/2.0.0-rc.4...2.0.0-rc.5) (2022-12-28)


### prometheus

* Enable prometheus metrics by default and add option to disable them ([e86182e](https://github.com/neo9/n9-node-routing/commit/e86182e651ee0cc655f1db5a9e8251ecc6baf7ff))

### yarn

* Upgrade prometheus client dans promster to latest versions ([ac3d54e](https://github.com/neo9/n9-node-routing/commit/ac3d54ef54abe044c73a591a754462592f23cc9e))

# [2.0.0-rc.4](https://github.com/neo9/n9-node-routing/compare/2.0.0-rc.3...2.0.0-rc.4) (2022-12-28)


### conf

* Move body parser init to allow proxy init ([672f2db](https://github.com/neo9/n9-node-routing/commit/672f2db3ee71f204a3fce52355dca2814dbf2a33))

# [2.0.0-rc.3](https://github.com/neo9/n9-node-routing/compare/2.0.0-rc.2...2.0.0-rc.3) (2022-12-28)


### conf

* Add secret transformer with multiple secret types supported ([e0b7a26](https://github.com/neo9/n9-node-routing/commit/e0b7a26182e931ff2b275f9f472bf2ad834a3d5e))
* Export secret transformer ([9d55a8a](https://github.com/neo9/n9-node-routing/commit/9d55a8a935d2f2ea8a5a7eadd4e682c3334ad433))

### logs

* Add log modules for hooks ([a8acf18](https://github.com/neo9/n9-node-routing/commit/a8acf18a8e3c6b1d5ad783e343eff73d13a88be6))

# [2.0.0-rc.2](https://github.com/neo9/n9-node-routing/compare/2.0.0-rc.1...2.0.0-rc.2) (2022-12-28)


### conf

* Add options to configure body parser and change default limit to 1024 kB ([1617b8c](https://github.com/neo9/n9-node-routing/commit/1617b8cb901c2d1967b69ef3a83897662b2d339a))
* Fix generate documentation conf loading ([d99b63b](https://github.com/neo9/n9-node-routing/commit/d99b63b813a5e16a1aea57dcc41b90ee6cbb0171))

### lint

* Fix import order ([2a26b65](https://github.com/neo9/n9-node-routing/commit/2a26b6570c666a6d38b58b13004cf9637a694bd8))

### tests

* Fix tests on body parser limit ([f52c4ce](https://github.com/neo9/n9-node-routing/commit/f52c4ce5d90174da409894b6ff647721d0a58574))
* Separate body parser tests ([1e4b822](https://github.com/neo9/n9-node-routing/commit/1e4b822dd66e345365696df4905b19d6713774a7))

### yarn

* Remove body-parser dependency ([ea35555](https://github.com/neo9/n9-node-routing/commit/ea355555c55027d6f3ad5f56a537d72490879378))

# [2.0.0-rc.1](https://github.com/neo9/n9-node-routing/compare/2.0.0-rc.0...2.0.0-rc.1) (2022-12-27)


### conf

* Add endpoint to expose conf ([d14eefa](https://github.com/neo9/n9-node-routing/commit/d14eefa87e2e61901147dab930d3a33aaf0a7e99))
* Fix memory leak on exposed conf ([2bd2dde](https://github.com/neo9/n9-node-routing/commit/2bd2dde1a5daeac7b6a3363725b85d7b7e7fa3b4))

### logs

* Add init log at startup beginning ([548e573](https://github.com/neo9/n9-node-routing/commit/548e5738e32d9318e8d711c5a0bae93905b454a3))

### ping

* Add init log at startup beginning ([c592e17](https://github.com/neo9/n9-node-routing/commit/c592e174825d98a385974b9abb696c7a1de75b24))

### routes

* Change default route to return apiName and version in JSON format ([4cd1ef0](https://github.com/neo9/n9-node-routing/commit/4cd1ef0c44efdb815a82233a9ddcd2c22061964b))

# [2.0.0-rc.0](https://github.com/neo9/n9-node-routing/compare/1.34.3...2.0.0-rc.0) (2022-12-27)


### build

* Upgrade github-actions to v3 ([5b91e7c](https://github.com/neo9/n9-node-routing/commit/5b91e7c3fc2b3fde64818cbacb25c41080bf95c9))

### conf

* Add a test to disable validation from config extension ([9a3b2ab](https://github.com/neo9/n9-node-routing/commit/9a3b2aba81ecb62309e5274cabee1ee183f2e5a7))
* Add custom message to each assertion ([9883555](https://github.com/neo9/n9-node-routing/commit/98835554d9aa007c6fca7571f7faac9f379d12f6))
* Add impl and type-fest then upgrade dependencies ([721e221](https://github.com/neo9/n9-node-routing/commit/721e22128b3f5c5458b77bbaf353ce0d8d11993a))
* Add logger and refactor tests ([c1f0ae4](https://github.com/neo9/n9-node-routing/commit/c1f0ae46010e1337c6acb28da353d2a5702864f8))
* Add tests to check secrets do not leak ([6b624e3](https://github.com/neo9/n9-node-routing/commit/6b624e34e6ca842ecfa70fd3df905d5ae7c30295))
* Load n9NodeConf and can proceed validation ([143d876](https://github.com/neo9/n9-node-routing/commit/143d876f7b7e502c01e5a565f7fd1d6f30f3bf1c))
* PR changes ([a2ff205](https://github.com/neo9/n9-node-routing/commit/a2ff205f824924cd4b82520f6bebde0513b49c80))
* Refactor models and add validation ([84a2762](https://github.com/neo9/n9-node-routing/commit/84a27629775c6e9f9f717e15ccdcdcef340f742a))

### doc

* Upgrade readme with V2 breaking changes ([8e382a9](https://github.com/neo9/n9-node-routing/commit/8e382a9ede3f27dcd553a5b0f1b57ad3f9436094))

### yarn

* Upgrade dependencies to fix security vulnerabilities ([27675b0](https://github.com/neo9/n9-node-routing/commit/27675b03a2385ee09bd152ae9e7636877034b20c))
* Upgrade dependencies to fix security vulnerabilities ([2cecc5d](https://github.com/neo9/n9-node-routing/commit/2cecc5d4f0cf17a2e039ee1018452dcf061366fc))
* Upgrade dependencies to fix security vulnerabilities ([d354a60](https://github.com/neo9/n9-node-routing/commit/d354a60e6965d0cfa60059173ff48769b51ac691))
* Upgrade n9-coding-style then eslint to support Node 18 ([31f2acb](https://github.com/neo9/n9-node-routing/commit/31f2acbd0d5b31916e1580ec39e77fdc75237fdc))

## [1.34.3](https://github.com/neo9/n9-node-routing/compare/1.34.2...1.34.3) (2022-09-27)


### fix

* Path to types schema is now correct ([6975bc8](https://github.com/neo9/n9-node-routing/commit/6975bc801c0fc935900e29ab9e25189e19fe3d75))
* Stringify code to avoid type error ([ee90423](https://github.com/neo9/n9-node-routing/commit/ee90423a8ab6e8f9c55cb7bd16fd8ecd663b576e))

## [1.34.2](https://github.com/neo9/n9-node-routing/compare/1.34.1...1.34.2) (2022-07-26)


### yarn

* Upgrade n9-node-utils to v 2.2.1 to get json-stream metadata type ([be9c5a7](https://github.com/neo9/n9-node-routing/commit/be9c5a79e960d14cbc712c2ea1240b270cf510b9))

## [1.34.1](https://github.com/neo9/n9-node-routing/compare/1.34.0...1.34.1) (2022-05-02)


### yarn

* Upgrade n9-node-log to v 4.0.1 to avoid wasm out of memory ([7f5bd7e](https://github.com/neo9/n9-node-routing/commit/7f5bd7ee4712ef029a0b68e84fcbfab0ed9a0e22))

# [1.34.0](https://github.com/neo9/n9-node-routing/compare/1.33.0...1.34.0) (2022-04-27)


### lint

* Fix types in tests and upgrade n9-coding-style ([c15b221](https://github.com/neo9/n9-node-routing/commit/c15b221ea4fbfe084306f2440b0bfa0c1adcd550))

### yarn

* Upgrade dependencies ([26fcdd5](https://github.com/neo9/n9-node-routing/commit/26fcdd5fef7c65c4ccc323cac2697e76c5e2fbf7))
* Upgrade dependencies including newrelic ([d261d69](https://github.com/neo9/n9-node-routing/commit/d261d6933c486d778d17f7d5d6781e4f006ca9cd))
* Upgrade n9-node-log to V 4.0.0 ([227deee](https://github.com/neo9/n9-node-routing/commit/227deee132771dc6cd074d485012e9e332f454d6))

# [1.33.0](https://github.com/neo9/n9-node-routing/compare/1.32.0...1.33.0) (2022-01-14)


### yarn

* Export n9-node-log and n9-node-conf dependencies ([f6611cb](https://github.com/neo9/n9-node-routing/commit/f6611cbc72b796515109dcdb22b48db5a7ea3435))

# [1.32.0](https://github.com/neo9/n9-node-routing/compare/1.31.0...1.32.0) (2022-01-12)


### build

* Fix github-actions branch ([3b13410](https://github.com/neo9/n9-node-routing/commit/3b13410f6613132b5de548c302eeff57d7a08364))
* Use github-actions for build instead of travis ([b729431](https://github.com/neo9/n9-node-routing/commit/b729431387d81444c58f295945a18f2804f14280))

### yarn

* Upgrade n9-coding-style to v 3.0.0 ([7f21309](https://github.com/neo9/n9-node-routing/commit/7f21309ad301bd568d903b217e80409706b8ac4b))

# [1.31.0](https://github.com/neo9/n9-node-routing/compare/1.30.3...1.31.0) (2021-12-16)


### transformer

* Add plain to class default value support to class-transformer default options ([e8976b7](https://github.com/neo9/n9-node-routing/commit/e8976b7ee4f0fe233209ff5a1ad2dca1b091fda1))

### yarn

* Fix security issue and dependencies for dependencies urijs tar ([11e829f](https://github.com/neo9/n9-node-routing/commit/11e829ffb75ae15e4c1d11c17c91d95f493843e2))
* Fix security issue by upgrading dependency color-string ([22453d0](https://github.com/neo9/n9-node-routing/commit/22453d0a5942d232598417e2717143091c0b2d09))

## [1.30.3](https://github.com/neo9/n9-node-routing/compare/1.30.2...1.30.3) (2021-06-15)


### yarn

* Replace continuation-local-storage by cls-hooked to fix n9-node-conf fs-extra compatibility ([4e3ba43](https://github.com/neo9/n9-node-routing/commit/4e3ba43fbf11c76850944e6f1dd165f926d6cb8e))

## [1.30.2](https://github.com/neo9/n9-node-routing/compare/1.30.1...1.30.2) (2021-06-14)


### yarn

* Update dependencies ([4687a6c](https://github.com/neo9/n9-node-routing/commit/4687a6cf73c24b8f6351f9b8c81315875fecb6df))
* Update dependencies ([4e848bb](https://github.com/neo9/n9-node-routing/commit/4e848bbfa27769a9eb93a9eab5e01f95ecf842a8))
* Update dependencies ([6a950eb](https://github.com/neo9/n9-node-routing/commit/6a950eb5913dc6bd68e740db3620395765f6f82d))

## [1.30.1](https://github.com/neo9/n9-node-routing/compare/1.30.0...1.30.1) (2021-04-29)


### apm

* Add new relic env name and full error to error report ([4ff47c7](https://github.com/neo9/n9-node-routing/commit/4ff47c7ac178fe0922ad70265ba6123e5c42c25a))

# [1.30.0](https://github.com/neo9/n9-node-routing/compare/1.30.0-alpha.0...1.30.0) (2021-04-23)


### apm

* Add environment as app name prefix ([bbb47c5](https://github.com/neo9/n9-node-routing/commit/bbb47c5682424c35de953762e05b5a2c45ec39ed))

# [1.30.0-alpha.0](https://github.com/neo9/n9-node-routing/compare/1.29.1...1.30.0-alpha.0) (2021-04-23)


### apm

* Add basic newrelic support ([229de1c](https://github.com/neo9/n9-node-routing/commit/229de1cece770844b284d9e9ca800aaa56002004))

### yarn

* Upgrade dependencies ([6f5cb99](https://github.com/neo9/n9-node-routing/commit/6f5cb99500727d4501955c0cf0f503336f266d72))

## [1.29.1](https://github.com/neo9/n9-node-routing/compare/1.29.1-rc.0...1.29.1) (2021-04-09)

## [1.29.1-rc.0](https://github.com/neo9/n9-node-routing/compare/1.29.0...1.29.1-rc.0) (2021-04-09)


### doc

* Add warnings about class-validator ([9270356](https://github.com/neo9/n9-node-routing/commit/9270356ed73ffc870c030b3f0aa0a8d397b0d6b3))

### yarn

* Upgrade class-validator-json-schema to match class-validator version ([cece5c7](https://github.com/neo9/n9-node-routing/commit/cece5c75557d6336b6dab9cdd5bd60f7254929ef))

# [1.29.0](https://github.com/neo9/n9-node-routing/compare/1.29.0-rc.5...1.29.0) (2021-04-08)


### tests

* Add more tests on body validations ([277aace](https://github.com/neo9/n9-node-routing/commit/277aace669290835280d6742e5fc13ee0b0f7415))

# [1.29.0-rc.5](https://github.com/neo9/n9-node-routing/compare/1.29.0-rc.4...1.29.0-rc.5) (2021-03-31)


### export

* Add export of Container from typedi ([8e384d7](https://github.com/neo9/n9-node-routing/commit/8e384d7a6f0ad574b05026476a67e845fedb21ca))

# [1.29.0-rc.4](https://github.com/neo9/n9-node-routing/compare/1.29.0-rc.3...1.29.0-rc.4) (2021-03-31)


### sentry

* Fix api documentation generation ([9d3bf41](https://github.com/neo9/n9-node-routing/commit/9d3bf41e56933d885dcbee76e9b21101e8dbe883))

# [1.29.0-rc.3](https://github.com/neo9/n9-node-routing/compare/1.29.0-rc.2...1.29.0-rc.3) (2021-03-31)


### sentry

* Fix api documentation generation ([a1e815d](https://github.com/neo9/n9-node-routing/commit/a1e815d082406de465c38b7ed39fdb87c31d33fb))

# [1.29.0-rc.2](https://github.com/neo9/n9-node-routing/compare/1.29.0-rc.1...1.29.0-rc.2) (2021-03-30)


### queryParams

* Fix query params array support by using routing-controllers fork ([424918a](https://github.com/neo9/n9-node-routing/commit/424918ae752dc7162b96f088223ef00dc60f37ad))

### sentry

* Upgrade Sentry client to latest version ([7b1a995](https://github.com/neo9/n9-node-routing/commit/7b1a995a3fe3cf4bd0b22a832963eb331fcc7f98))

### tests

* Add tests on query params send with arrays ([b84a9cc](https://github.com/neo9/n9-node-routing/commit/b84a9cc1f68ac90d245258d96b859c22654aafb3))

# [1.29.0-rc.1](https://github.com/neo9/n9-node-routing/compare/1.29.0-rc.0...1.29.0-rc.1) (2021-03-26)


### sentry

* Rollback Sentry client to V 5.27.6 ([cc9ecc5](https://github.com/neo9/n9-node-routing/commit/cc9ecc5869e58da6f1912b01a4529f2466b7e374))

# [1.29.0-rc.0](https://github.com/neo9/n9-node-routing/compare/1.28.1...1.29.0-rc.0) (2021-03-26)


### sentry

* Add sentry support ([db48e0e](https://github.com/neo9/n9-node-routing/commit/db48e0e9d1f00842f0e65d91891e627fccabb144))

## [1.28.1](https://github.com/neo9/n9-node-routing/compare/1.28.0...1.28.1) (2021-03-09)


### node

* Specify explicitly that node 10 is no more supported ([739746d](https://github.com/neo9/n9-node-routing/commit/739746dbc73f20dc84ac28e4370e07c2d892dcaf))

# [1.28.0](https://github.com/neo9/n9-node-routing/compare/1.27.2...1.28.0) (2021-03-09)


### httpClient

* Save error message in logs ([ceb6630](https://github.com/neo9/n9-node-routing/commit/ceb6630b020ed0dfa1db58a2a88f741d0c1deb7e))

### ping

* Stop answering ping on shutdown start ([dca540a](https://github.com/neo9/n9-node-routing/commit/dca540a96cba5d031f9177d9572f3dae2cd89a31))

### prometheus

* Add metric to track number of request in flight ([69396b8](https://github.com/neo9/n9-node-routing/commit/69396b8cd4932ac40c4907fe84d66c2410663ad0))

### yarn

* Upgrade most of the dependencies ([bcc17fa](https://github.com/neo9/n9-node-routing/commit/bcc17fa5015bb624413476386b12bb06d2a6a1bd))

## [1.27.2](https://github.com/neo9/n9-node-routing/compare/1.27.1...1.27.2) (2021-03-02)


### shutdown

* Add callback on shutdown signal received and name to callbacks ([afd4934](https://github.com/neo9/n9-node-routing/commit/afd4934c07f5e39453d850a06e90b1334f457158))

## [1.27.1](https://github.com/neo9/n9-node-routing/compare/1.27.1-rc.1...1.27.1) (2021-01-22)

## [1.27.1-rc.1](https://github.com/neo9/n9-node-routing/compare/1.27.1-rc.0...1.27.1-rc.1) (2021-01-22)


### yarn

* Fix dependencies with new test ([37226a3](https://github.com/neo9/n9-node-routing/commit/37226a35eaf0eb663be6fc31a43176f39ea953b4))

## [1.27.1-rc.0](https://github.com/neo9/n9-node-routing/compare/1.27.0...1.27.1-rc.0) (2021-01-21)


### typedi

* Rollback typedi version due to incomp with class-validator ([c2953c5](https://github.com/neo9/n9-node-routing/commit/c2953c59c5b6d3687b8c8a6d39c6e4976d76466f))

# [1.27.0](https://github.com/neo9/n9-node-routing/compare/1.26.1...1.27.0) (2021-01-19)


### upgrade

* Upgrade all dep including all typestack ([a364fae](https://github.com/neo9/n9-node-routing/commit/a364fae913d88663c52885f157b13055f1dc0aad))

## [1.26.1](https://github.com/neo9/n9-node-routing/compare/1.26.0...1.26.1) (2020-11-19)


### http

* Set http retry log to level info or warn ([1303c61](https://github.com/neo9/n9-node-routing/commit/1303c610e507205f95db7b0b9fe747dcb44037b2))

# [1.26.0](https://github.com/neo9/n9-node-routing/compare/1.25.1...1.26.0) (2020-10-09)


### yarn

* Upgrade n9-node-utils to V 2.0.1 ([01f6ab3](https://github.com/neo9/n9-node-routing/commit/01f6ab3768bd72a6ab564c9c480e5be4e42d5c2f))

## [1.25.1](https://github.com/neo9/n9-node-routing/compare/1.25.0...1.25.1) (2020-10-06)


### logs

* Fix logs default options transmission ([a51c5c5](https://github.com/neo9/n9-node-routing/commit/a51c5c59e84412772992a8d9a6829717312c44be))
* Fix logs optional in options ([9870393](https://github.com/neo9/n9-node-routing/commit/987039324056487390e0ee020f212b434168b17b))

# [1.25.0](https://github.com/neo9/n9-node-routing/compare/1.24.0...1.25.0) (2020-09-23)


### format

* Fix code formatting ([afcd5af](https://github.com/neo9/n9-node-routing/commit/afcd5af88db720e5bad8ecfea95fd256b42b28ea))

### yarn

* Fix code coverage upgrade regression ([7fae326](https://github.com/neo9/n9-node-routing/commit/7fae326f47ab653e44e8ea3ba68bc16bb747fb24))
* Upgrade all dependencies except routing-controllers ([b38f147](https://github.com/neo9/n9-node-routing/commit/b38f147c7dddb3f0de90b193f7d5709941ae6649))
* Upgrade n9-node-log and n9-mongo-client ([50d8613](https://github.com/neo9/n9-node-routing/commit/50d86137e783d95af93e90a861ae9e2b91a43b3e))
* Upgrade node-fetch ([042d422](https://github.com/neo9/n9-node-routing/commit/042d422f7e1ebd729975027709b355c35a392928))

# [1.24.0](https://github.com/neo9/n9-node-routing/compare/1.23.0-rc.1...1.24.0) (2020-07-30)

# [1.23.0-rc.1](https://github.com/neo9/n9-node-routing/compare/1.23.0-rc.0...1.23.0-rc.1) (2020-07-30)


### yarn

* Upgrade swagger-ui-express to latest ([1142edb](https://github.com/neo9/n9-node-routing/commit/1142edb14ab962dfc17d61c786d32ee9d953cf94))

# [1.23.0-rc.0](https://github.com/neo9/n9-node-routing/compare/1.23.0-alpha.1...1.23.0-rc.0) (2020-07-30)


### doc

* Expose function to generate documentation on build ([b297b7d](https://github.com/neo9/n9-node-routing/commit/b297b7d85c563e0652f866073d17d82460f28b41))
* Expose function to generate documentation on build ([d62b060](https://github.com/neo9/n9-node-routing/commit/d62b060ed3914099e94470eb27be782585bc44e0))

### release

* V 1.23.0-alpha.2 ([aeba9c4](https://github.com/neo9/n9-node-routing/commit/aeba9c405ba121fe84950be3b1f74a4de867412c))

# [1.23.0-alpha.2](https://github.com/neo9/n9-node-routing/compare/1.23.0-alpha.1...1.23.0-alpha.2) (2020-07-29)


### doc

* Expose function to generate documentation on build ([d62b060](https://github.com/neo9/n9-node-routing/commit/d62b060ed3914099e94470eb27be782585bc44e0))

# [1.23.0-alpha.1](https://github.com/neo9/n9-node-routing/compare/1.22.0...1.23.0-alpha.1) (2020-07-29)


### doc

* Expose function to generate documentation on build ([6740261](https://github.com/neo9/n9-node-routing/commit/6740261cb144a0ec811b22c8944adda85e16a897))

### yarn

* Upgrade codecov to latest ([42d58c2](https://github.com/neo9/n9-node-routing/commit/42d58c284505a5c65f5be6daade1e7f5cfd46718))

# [1.22.0](https://github.com/neo9/n9-node-routing/compare/1.22.0-rc.1...1.22.0) (2020-07-16)


### ping

* Add tests on ping with db and message on failure ([9554062](https://github.com/neo9/n9-node-routing/commit/9554062445370748918ccffb5b81d10b22eb79a5))

# [1.22.0-rc.1](https://github.com/neo9/n9-node-routing/compare/1.22.0-rc.0...1.22.0-rc.1) (2020-07-16)


### license

* Fix license from MIT to GNU ([f7cabdc](https://github.com/neo9/n9-node-routing/commit/f7cabdc8acda66bf66b3afda2003e543c2c33913))

### release

* Fix tag name ([3616e4f](https://github.com/neo9/n9-node-routing/commit/3616e4f6e75b13fbdaa6035b591dcaefe5dbb692))

# [1.22.0-rc.0](https://github.com/neo9/n9-node-routing/compare/1.21.0...%s) (2020-07-16)


### cargo

* Add cargo and http cargo builder ([81dabd0](https://github.com/neo9/n9-node-routing/commit/81dabd04562e556de34573b8ba4bd64452a96245))

### doc

* Update readme links ([8c144b1](https://github.com/neo9/n9-node-routing/commit/8c144b1ed129416ca75039dff90ebb4a8dae66bf))

### test

* Ignore system signal call from code coverage ([8c16f9a](https://github.com/neo9/n9-node-routing/commit/8c16f9a73d098b306e5a70cfca53d00987d42719))

### tests

* Add debug info for node 10 test failure and remove pre-push hook ([69da2e0](https://github.com/neo9/n9-node-routing/commit/69da2e008af9ef9f6237ce1e562ad63bf9497029))
* Add node 14 version test ([572cfc2](https://github.com/neo9/n9-node-routing/commit/572cfc2129aff09a6a2fec2abf0885ccd107f9a5))
* Fix prometheus test to not depend on labels order ([717c38c](https://github.com/neo9/n9-node-routing/commit/717c38c5d4ed0c8a076da003bdab774367852bd2))
* Fix tests ([3dde328](https://github.com/neo9/n9-node-routing/commit/3dde3280ff95a758ea8f0351fa127ca6803fc8c9))
* Upgrade ava version ([90b20dc](https://github.com/neo9/n9-node-routing/commit/90b20dcb2cbee2ddeb71645da6634cfc38553302))

### yarn

* Update codecov ([0531b21](https://github.com/neo9/n9-node-routing/commit/0531b21ab3b78f1c6dac1bd68764e9cf36eb9547))
* Upgrade release-it and some dependencies with security issues ([23dcb87](https://github.com/neo9/n9-node-routing/commit/23dcb8763735c3ebd399bf2fe621aa7d44e08d73))
* Upgrade some dependencies with security issues ([c3dec01](https://github.com/neo9/n9-node-routing/commit/c3dec01743897273b04873ac4ad8455fc71dbe38))

# Version [1.21.0](https://github.com/neo9/n9-node-routing/compare/1.20.6...1.21.0) (2020-07-01)


### init

* Add options to set first ordered init files ([ebf93a7](https://github.com/neo9/n9-node-routing/commit/ebf93a7)) (Benjamin Daniel)



## Version [1.20.6](https://github.com/neo9/n9-node-routing/compare/1.20.5...1.20.6) (2020-04-30)


### prometheus

* Fix signal back to up after ping fail ([71af866](https://github.com/neo9/n9-node-routing/commit/71af866)) (Benjamin Daniel)

### release

* V 1.20.6 ([b66a791](https://github.com/neo9/n9-node-routing/commit/b66a791)) (Benjamin Daniel)



## Version [1.20.5](https://github.com/neo9/n9-node-routing/compare/1.20.4...1.20.5) (2020-03-11)


### release

* V 1.20.5 ([b7a54a4](https://github.com/neo9/n9-node-routing/commit/b7a54a4)) (Benjamin Daniel)

### yarn

* Upgrade dependencies and move some to devDependencies ([8e0450a](https://github.com/neo9/n9-node-routing/commit/8e0450a)) (Benjamin Daniel)



## Version [1.20.4](https://github.com/neo9/n9-node-routing/compare/1.20.3...1.20.4) (2020-03-04)


### http

* Fix 204 response handling on file upload ([d99c035](https://github.com/neo9/n9-node-routing/commit/d99c035)) (Benjamin Daniel)

### release

* V 1.20.4 ([e319680](https://github.com/neo9/n9-node-routing/commit/e319680)) (Benjamin Daniel)



## Version [1.20.3](https://github.com/neo9/n9-node-routing/compare/1.20.2...1.20.3) (2020-03-04)


### http

* Fix response 204 and add tests for files ([e285a1a](https://github.com/neo9/n9-node-routing/commit/e285a1a)) (Benjamin Daniel)

### release

* V 1.20.3 ([0787717](https://github.com/neo9/n9-node-routing/commit/0787717)) (Benjamin Daniel)



## Version [1.20.2](https://github.com/neo9/n9-node-routing/compare/1.20.1...1.20.2) (2020-03-04)


### http

* Fix query-params array support ([eaa75a6](https://github.com/neo9/n9-node-routing/commit/eaa75a6)) (Benjamin Daniel)

### release

* V 1.20.2 ([b20b575](https://github.com/neo9/n9-node-routing/commit/b20b575)) (Benjamin Daniel)



## Version [1.20.1](https://github.com/neo9/n9-node-routing/compare/1.20.0...1.20.1) (2020-03-04)


### doc

* Update README ([28432d9](https://github.com/neo9/n9-node-routing/commit/28432d9)) (Benjamin DANIEL)

### http

* Fix bas options merge ([175a7d6](https://github.com/neo9/n9-node-routing/commit/175a7d6)) (Benjamin Daniel)

### release

* V 1.20.1 ([3894c32](https://github.com/neo9/n9-node-routing/commit/3894c32)) (Benjamin Daniel)



# Version [1.20.0](https://github.com/neo9/n9-node-routing/compare/1.19.2...1.20.0) (2020-03-03)


### format

* Format all with prettier ([7c80f1f](https://github.com/neo9/n9-node-routing/commit/7c80f1f)) (Benjamin Daniel)
* Format before commit ([6f892f8](https://github.com/neo9/n9-node-routing/commit/6f892f8)) (Benjamin Daniel)

### http

* Add got to replace request and upgrade typescript ([ee632db](https://github.com/neo9/n9-node-routing/commit/ee632db)) (Benjamin Daniel)
* Add logs before retries on http client ([1886735](https://github.com/neo9/n9-node-routing/commit/1886735)) (Benjamin Daniel)

### lint

* Use neo9 coding style and use husky ([15b82e9](https://github.com/neo9/n9-node-routing/commit/15b82e9)) (Benjamin Daniel)

### release

* V 1.20.0 ([35e1e18](https://github.com/neo9/n9-node-routing/commit/35e1e18)) (Benjamin Daniel)

### typescript

* Use optional chaining ([290cab4](https://github.com/neo9/n9-node-routing/commit/290cab4)) (Benjamin Daniel)

### yarn

* Upgrade dependencies ([3d28742](https://github.com/neo9/n9-node-routing/commit/3d28742)) (Benjamin Daniel)



## Version [1.19.2](https://github.com/neo9/n9-node-routing/compare/1.19.1...1.19.2) (2019-11-14)


### release

* V 1.19.2 ([fa45cec](https://github.com/neo9/n9-node-routing/commit/fa45cec)) (Benjamin Daniel)

### yarn

* Upgrade dependencies especially n9-node-utils ([aa059c1](https://github.com/neo9/n9-node-routing/commit/aa059c1)) (Benjamin Daniel)



## Version [1.19.1](https://github.com/neo9/n9-node-routing/compare/1.19.0...1.19.1) (2019-10-10)


### errors

* Keep stack in error context du not through HTTP ([b97f94c](https://github.com/neo9/n9-node-routing/commit/b97f94c)) (Benjamin Daniel)

### release

* V 1.19.1 ([25583ea](https://github.com/neo9/n9-node-routing/commit/25583ea)) (Benjamin Daniel)



# Version [1.19.0](https://github.com/neo9/n9-node-routing/compare/1.18.2...1.19.0) (2019-10-09)


### errors

* Add stack trace to errors as JSON ([13cabc7](https://github.com/neo9/n9-node-routing/commit/13cabc7)) (Benjamin Daniel)

### release

* V 1.19.0 ([c6dcd43](https://github.com/neo9/n9-node-routing/commit/c6dcd43)) (Benjamin Daniel)



## Version [1.18.2](https://github.com/neo9/n9-node-routing/compare/1.18.1...1.18.2) (2019-10-03)


### prometheus

* Add version as metric ([def83a7](https://github.com/neo9/n9-node-routing/commit/def83a7)) (Benjamin Daniel)

### release

* V 1.18.2 ([7a425b8](https://github.com/neo9/n9-node-routing/commit/7a425b8)) (Benjamin Daniel)



## Version [1.18.1](https://github.com/neo9/n9-node-routing/compare/1.18.0...1.18.1) (2019-10-01)


### prometheus

* Fix path normalize for route not found ([da32476](https://github.com/neo9/n9-node-routing/commit/da32476)) (Benjamin Daniel)

### release

* V 1.18.1 ([8eb2fa6](https://github.com/neo9/n9-node-routing/commit/8eb2fa6)) (Benjamin Daniel)



# Version [1.18.0](https://github.com/neo9/n9-node-routing/compare/1.17.0...1.18.0) (2019-09-30)


### doc

* Update readme by adding starter link ([95babcc](https://github.com/neo9/n9-node-routing/commit/95babcc)) (Benjamin DANIEL)

### options

* Organise options interfaces ([e95879f](https://github.com/neo9/n9-node-routing/commit/e95879f)) (Benjamin Daniel)

### prometheus

* Add prometheus options ([76b892e](https://github.com/neo9/n9-node-routing/commit/76b892e)) (Benjamin Daniel)

### release

* V 1.18.0 ([24480d1](https://github.com/neo9/n9-node-routing/commit/24480d1)) (Benjamin Daniel)



# Version [1.17.0](https://github.com/neo9/n9-node-routing/compare/1.16.0...1.17.0) (2019-09-05)


### hooks

* Add start lifecycle hook ([fe6c773](https://github.com/neo9/n9-node-routing/commit/fe6c773)) (Clement Petit)

### release

* V 1.17.0 ([d410772](https://github.com/neo9/n9-node-routing/commit/d410772)) (Benjamin Daniel)



# Version [1.16.0](https://github.com/neo9/n9-node-routing/compare/1.15.1...1.16.0) (2019-08-29)


### logs

* Remove string duration logs and keep only float once ([c9f342c](https://github.com/neo9/n9-node-routing/commit/c9f342c)) (Benjamin Daniel)

### release

* V 1.16.0 ([9f0018d](https://github.com/neo9/n9-node-routing/commit/9f0018d)) (Benjamin Daniel)



## Version [1.15.1](https://github.com/neo9/n9-node-routing/compare/1.15.0...1.15.1) (2019-08-23)


### httpClient

* Do not stringify error before throwing error ([96dbc94](https://github.com/neo9/n9-node-routing/commit/96dbc94)) (Benjamin Daniel)

### release

* V 1.15.1 ([aaaaa90](https://github.com/neo9/n9-node-routing/commit/aaaaa90)) (Benjamin Daniel)



# Version [1.15.0](https://github.com/neo9/n9-node-routing/compare/1.14.0...1.15.0) (2019-08-21)


### errors

* Stringify default error in logs and use safe stringify ([d68ca5c](https://github.com/neo9/n9-node-routing/commit/d68ca5c)) (Benjamin Daniel)

### httpClient

* Add head http method ([6fb27c5](https://github.com/neo9/n9-node-routing/commit/6fb27c5)) (Benjamin Daniel)
* Add requestStream function ([9aa1447](https://github.com/neo9/n9-node-routing/commit/9aa1447)) (Benjamin Daniel)

### logs

* Add total response time ([101d192](https://github.com/neo9/n9-node-routing/commit/101d192)) (Clement Petit)
* Fix enableLogFormatJSON default behaviour and add tests ([2311958](https://github.com/neo9/n9-node-routing/commit/2311958)) (Clement Petit)

### release

* V 1.15.0 ([f5704a6](https://github.com/neo9/n9-node-routing/commit/f5704a6)) (Benjamin Daniel)

### tests

* Improve tests readability and add one for 403 errors ([4e2276b](https://github.com/neo9/n9-node-routing/commit/4e2276b)) (Benjamin Daniel)



# Version [1.14.0](https://github.com/neo9/n9-node-routing/compare/1.13.1...1.14.0) (2019-07-09)


### release

* V 1.14.0 ([a88704a](https://github.com/neo9/n9-node-routing/commit/a88704a)) (Benjamin Daniel)

### tests

* Add test to validation with schema in pseudo parallel ([c7b48de](https://github.com/neo9/n9-node-routing/commit/c7b48de)) (Benjamin Daniel)
* Improve tests and add one with services ([efcf88e](https://github.com/neo9/n9-node-routing/commit/efcf88e)) (Benjamin Daniel)

### yarn

* Upgrade dependencies and use fork of routing-controller ([78d0344](https://github.com/neo9/n9-node-routing/commit/78d0344)) (Benjamin Daniel)



## Version [1.13.1](https://github.com/neo9/n9-node-routing/compare/1.13.0...1.13.1) (2019-06-24)


### release

* V 1.13.1 ([8cb362f](https://github.com/neo9/n9-node-routing/commit/8cb362f)) (Benjamin Daniel)

### shhutdown

* Fix shutdown and increase default timeout ([c6de0cc](https://github.com/neo9/n9-node-routing/commit/c6de0cc)) (Benjamin Daniel)



# Version [1.13.0](https://github.com/neo9/n9-node-routing/compare/1.12.3...1.13.0) (2019-04-02)


### hooks

* Add shutdown and ping hooks ([7678d0d](https://github.com/neo9/n9-node-routing/commit/7678d0d)) (Benjamin Daniel)

### release

* V 1.13.0 ([e437765](https://github.com/neo9/n9-node-routing/commit/e437765)) (Benjamin Daniel)



## Version [1.12.3](https://github.com/neo9/n9-node-routing/compare/1.12.2...1.12.3) (2019-03-14)


### release

* V 1.12.3 ([c0bdb6d](https://github.com/neo9/n9-node-routing/commit/c0bdb6d)) (Benjamin Daniel)

### yarn

* Upgrade n9-node-utils to 1.8.1 ([73f2c0f](https://github.com/neo9/n9-node-routing/commit/73f2c0f)) (Benjamin Daniel)



## Version [1.12.2](https://github.com/neo9/n9-node-routing/compare/1.12.1...1.12.2) (2019-03-14)


### errors

* Fix errors toJSON function return type ([1193bf4](https://github.com/neo9/n9-node-routing/commit/1193bf4)) (Benjamin Daniel)

### release

* V 1.12.2 ([f901321](https://github.com/neo9/n9-node-routing/commit/f901321)) (Benjamin Daniel)



## Version [1.12.1](https://github.com/neo9/n9-node-routing/compare/1.12.0...1.12.1) (2019-03-14)


### errors

* Add errors toJSON function to keep message property ([20338d2](https://github.com/neo9/n9-node-routing/commit/20338d2)) (Benjamin Daniel)

### release

* V 1.12.1 ([c4f813e](https://github.com/neo9/n9-node-routing/commit/c4f813e)) (Benjamin Daniel)



# Version [1.12.0](https://github.com/neo9/n9-node-routing/compare/1.11.1...1.12.0) (2019-03-14)


### errors

* Upgrade @neo9/n9-node-utils ([268fe00](https://github.com/neo9/n9-node-routing/commit/268fe00)) (Benjamin Daniel)

### ping

* Add log is mongo-db is not reachable ([e025d27](https://github.com/neo9/n9-node-routing/commit/e025d27)) (Benjamin Daniel)

### release

* V 1.12.0 ([c60e24d](https://github.com/neo9/n9-node-routing/commit/c60e24d)) (Benjamin Daniel)

### routes

* Add version route and call next function ([ac0300f](https://github.com/neo9/n9-node-routing/commit/ac0300f)) (Benjamin Daniel)



## Version [1.11.1](https://github.com/neo9/n9-node-routing/compare/1.11.0...1.11.1) (2019-02-22)


### release

* V 1.11.1 ([9924869](https://github.com/neo9/n9-node-routing/commit/9924869)) (Benjamin Daniel)

### shutdown

* Add some time before exit, new option waitDurationBeforeStop ([3939c58](https://github.com/neo9/n9-node-routing/commit/3939c58)) (Benjamin Daniel)



# Version [1.11.0](https://github.com/neo9/n9-node-routing/compare/1.10.2...1.11.0) (2019-02-22)


### fix

* Update morgan version due to security concerns ([e970022](https://github.com/neo9/n9-node-routing/commit/e970022)) (Benjamin Daniel)

### release

* V 1.11.0 ([c86aca8](https://github.com/neo9/n9-node-routing/commit/c86aca8)) (Benjamin Daniel)



## Version [1.10.2](https://github.com/neo9/n9-node-routing/compare/1.10.1...1.10.2) (2018-11-26)


### morgan

* Remove end lines written by morgan ([69d24ae](https://github.com/neo9/n9-node-routing/commit/69d24ae)) (Benjamin Daniel)

### release

* V 1.10.2 ([a6fddc9](https://github.com/neo9/n9-node-routing/commit/a6fddc9)) (Benjamin Daniel)



## Version [1.10.1](https://github.com/neo9/n9-node-routing/compare/1.9.3...1.10.1) (2018-11-23)


### release

* V 1.10.0 ([f24bdad](https://github.com/neo9/n9-node-routing/commit/f24bdad)) (Benjamin Daniel)
* V 1.10.1 ([ee6dd1f](https://github.com/neo9/n9-node-routing/commit/ee6dd1f)) (Benjamin Daniel)



## Version [1.9.3](https://github.com/neo9/n9-node-routing/compare/1.9.2...1.9.3) (2018-11-15)


### release

* V 1.9.3 ([259b6c7](https://github.com/neo9/n9-node-routing/commit/259b6c7)) (Benjamin Daniel)

### shutdown

* Fix graceful shutdown ([853bff8](https://github.com/neo9/n9-node-routing/commit/853bff8)) (Benjamin Daniel)



## Version [1.9.2](https://github.com/neo9/n9-node-routing/compare/1.9.1...1.9.2) (2018-11-15)


### release

* V 1.9.2 ([45957be](https://github.com/neo9/n9-node-routing/commit/45957be)) (Benjamin Daniel)

### shutdown

* Fix graceful shutdown timeout ([3376343](https://github.com/neo9/n9-node-routing/commit/3376343)) (Benjamin Daniel)



## Version [1.9.1](https://github.com/neo9/n9-node-routing/compare/1.8.1...1.9.1) (2018-11-15)


### release

* V 1.9.0 ([442f25f](https://github.com/neo9/n9-node-routing/commit/442f25f)) (Benjamin Daniel)
* V 1.9.1 ([9c4f89c](https://github.com/neo9/n9-node-routing/commit/9c4f89c)) (Benjamin Daniel)

### shutdown

* Add graceful shutdown ([ec24bdf](https://github.com/neo9/n9-node-routing/commit/ec24bdf)) (Benjamin Daniel)
* Add graceful shutdown for nodemon ([f1816d8](https://github.com/neo9/n9-node-routing/commit/f1816d8)) (Benjamin Daniel)



## Version [1.8.1](https://github.com/neo9/n9-node-routing/compare/1.7.1...1.8.1) (2018-11-12)


### release

* V 1.8.0 ([a34696c](https://github.com/neo9/n9-node-routing/commit/a34696c)) (Benjamin Daniel)
* V 1.8.1 ([c69cbf5](https://github.com/neo9/n9-node-routing/commit/c69cbf5)) (Benjamin Daniel)

### yarn

* Fix dependencies class-validator and upgrade for node v10 ([95179fe](https://github.com/neo9/n9-node-routing/commit/95179fe)) (Benjamin Daniel)
* Upgrade class-validator ([b482f52](https://github.com/neo9/n9-node-routing/commit/b482f52)) (Benjamin Daniel)



## Version [1.7.1](https://github.com/neo9/n9-node-routing/compare/1.7.0...1.7.1) (2018-10-24)


### logs

* Fix logs with undefined obj ([59b0c89](https://github.com/neo9/n9-node-routing/commit/59b0c89)) (Benjamin Daniel)

### release

* V 1.7.1 ([9d2e720](https://github.com/neo9/n9-node-routing/commit/9d2e720)) (Benjamin Daniel)



# Version [1.7.0](https://github.com/neo9/n9-node-routing/compare/1.6.6...1.7.0) (2018-09-25)


### ping

* Add check mongodb status on ping ([155af33](https://github.com/neo9/n9-node-routing/commit/155af33)) (Benjamin Daniel)

### release

* V 1.7.0 ([1c8b183](https://github.com/neo9/n9-node-routing/commit/1c8b183)) (Benjamin Daniel)



## Version [1.6.6](https://github.com/neo9/n9-node-routing/compare/1.6.5...1.6.6) (2018-09-21)


### release

* V 1.6.6 ([9a96ebe](https://github.com/neo9/n9-node-routing/commit/9a96ebe)) (Benjamin Daniel)



## Version [1.6.5](https://github.com/neo9/n9-node-routing/compare/1.6.4...1.6.5) (2018-07-13)


### release

* V 1.6.5 ([e96b6d0](https://github.com/neo9/n9-node-routing/commit/e96b6d0)) (Benjamin Daniel)



## Version [1.6.4](https://github.com/neo9/n9-node-routing/compare/1.6.3...1.6.4) (2018-05-31)


### release

* Remove useless tmp file ([f7e1556](https://github.com/neo9/n9-node-routing/commit/f7e1556)) (Benjamin Daniel)
* V 1.6.4 ([aacfbb1](https://github.com/neo9/n9-node-routing/commit/aacfbb1)) (Benjamin Daniel)



## Version [1.6.3](https://github.com/neo9/n9-node-routing/compare/1.6.2...1.6.3) (2018-05-29)


### release

* V 1.6.3 ([33ceed6](https://github.com/neo9/n9-node-routing/commit/33ceed6)) (Benjamin Daniel)

### utils

* Upgrade n9-node-utils ([bf0131f](https://github.com/neo9/n9-node-routing/commit/bf0131f)) (Benjamin Daniel)



## Version [1.6.2](https://github.com/neo9/n9-node-routing/compare/1.6.1...1.6.2) (2018-05-28)


### release

* V 1.6.2 ([128da7f](https://github.com/neo9/n9-node-routing/commit/128da7f)) (Benjamin Daniel)



## Version [1.6.1](https://github.com/neo9/n9-node-routing/compare/1.6.0...1.6.1) (2018-05-24)


### release

* V 1.6.1 ([90cb8a2](https://github.com/neo9/n9-node-routing/commit/90cb8a2)) (Benjamin Daniel)



# Version [1.6.0](https://github.com/neo9/n9-node-routing/compare/1.5.1...1.6.0) (2018-05-24)


### release

* V 1.6.0 ([d125498](https://github.com/neo9/n9-node-routing/commit/d125498)) (Benjamin Daniel)



## Version [1.5.1](https://github.com/neo9/n9-node-routing/compare/1.5.0...1.5.1) (2018-05-23)


### logs

* Fix logs in JSON and update global.log ([22080e2](https://github.com/neo9/n9-node-routing/commit/22080e2)) (Benjamin Daniel)

### release

* V 1.5.1 ([d0c7f60](https://github.com/neo9/n9-node-routing/commit/d0c7f60)) (Benjamin Daniel)



# Version [1.5.0](https://github.com/neo9/n9-node-routing/compare/1.4.0...1.5.0) (2018-05-23)


### logs

* Add logs in JSON in no dev environment ([83544f0](https://github.com/neo9/n9-node-routing/commit/83544f0)) (Benjamin Daniel)

### release

* V 1.5.0 ([4feb5bc](https://github.com/neo9/n9-node-routing/commit/4feb5bc)) (Benjamin Daniel)



# Version [1.4.0](https://github.com/neo9/n9-node-routing/compare/1.3.0...1.4.0) (2018-05-22)


### documentation

* Add jsonUrl config in openapi ([9a262d8](https://github.com/neo9/n9-node-routing/commit/9a262d8)) (Benjamin Daniel)

### release

* V 1.4.0 ([4731604](https://github.com/neo9/n9-node-routing/commit/4731604)) (Benjamin Daniel)



# Version [1.3.0](https://github.com/neo9/n9-node-routing/compare/1.2.0...1.3.0) (2018-05-21)


### versions

* Update to v 1.3.0 ([55fdea2](https://github.com/neo9/n9-node-routing/commit/55fdea2)) (Benjamin Daniel)



# Version [1.2.0](https://github.com/neo9/n9-node-routing/compare/1.1.2...1.2.0) (2018-05-02)


### release

* V 1.2.0 ([a0728df](https://github.com/neo9/n9-node-routing/commit/a0728df)) (Benjamin Daniel)

### yarn

* Upgrade dependencies ([fd88f8b](https://github.com/neo9/n9-node-routing/commit/fd88f8b)) (Benjamin Daniel)



## Version [1.1.2](https://github.com/neo9/n9-node-routing/compare/1.1.1...1.1.2) (2018-04-27)


### documentation

* Add option to disable openapi ([0d98ac4](https://github.com/neo9/n9-node-routing/commit/0d98ac4)) (Benjamin Daniel)

### release

* V 1.1.2 ([2d3a605](https://github.com/neo9/n9-node-routing/commit/2d3a605)) (Benjamin Daniel)



## Version [1.1.1](https://github.com/neo9/n9-node-routing/compare/0.1.1...1.1.1) (2018-04-26)


### release

* V 1.1.1 ([33f8289](https://github.com/neo9/n9-node-routing/commit/33f8289)) (Benjamin Daniel)



## Version [0.1.1](https://github.com/neo9/n9-node-routing/compare/0.1.0...0.1.1) (2018-04-26)


### documentation

* Add openapi and swagger json generation ([55d07da](https://github.com/neo9/n9-node-routing/commit/55d07da)) (Benjamin Daniel)
* Add swagger ui for doc ([690dd7e](https://github.com/neo9/n9-node-routing/commit/690dd7e)) (Benjamin Daniel)

### model

* Add export wrapper model ([58fc0e1](https://github.com/neo9/n9-node-routing/commit/58fc0e1)) (Benjamin Daniel)

### models

* Add export route model ([3bf01d8](https://github.com/neo9/n9-node-routing/commit/3bf01d8)) (Benjamin Daniel)

### name

* Change name to n9-node-routing ([ff787b6](https://github.com/neo9/n9-node-routing/commit/ff787b6)) (Benjamin Daniel)

### release

* V 0.1.1 ([0d5c23f](https://github.com/neo9/n9-node-routing/commit/0d5c23f)) (Benjamin Daniel)



# Version [0.1.0](https://github.com/neo9/n9-node-routing/compare/0.0.8...0.1.0) (2018-04-19)


### conf

* Add log and conf injectors ([4efe481](https://github.com/neo9/n9-node-routing/commit/4efe481)) (Benjamin Daniel)

### doc

* Update README ([67581d9](https://github.com/neo9/n9-node-routing/commit/67581d9)) (Benjamin DANIEL)

### logs

* Add requestId in logs ([58d5df8](https://github.com/neo9/n9-node-routing/commit/58d5df8)) (Benjamin Daniel)

### release

* V 0.1.0 ([6f87753](https://github.com/neo9/n9-node-routing/commit/6f87753)) (Benjamin Daniel)



## Version [0.0.8](https://github.com/neo9/n9-node-routing/compare/0.0.7...0.0.8) (2018-04-13)


### install

* Fix install fail ([08279cd](https://github.com/neo9/n9-node-routing/commit/08279cd)) (Benjamin Daniel)

### release

* V 0.0.8 ([98b62dc](https://github.com/neo9/n9-node-routing/commit/98b62dc)) (Benjamin Daniel)

### versions

* Add push after release ([c2048f9](https://github.com/neo9/n9-node-routing/commit/c2048f9)) (Benjamin Daniel)



## Version [0.0.7](https://github.com/neo9/n9-node-routing/compare/1c1b621...0.0.7) (2018-04-13)


### acl

* Fix acl decorator for controller and add tests ([1c1b621](https://github.com/neo9/n9-node-routing/commit/1c1b621)) (Benjamin Daniel)
* Fix acl decorator for empty routes ([50a85cf](https://github.com/neo9/n9-node-routing/commit/50a85cf)) (Benjamin Daniel)

### options

* Fix options routing-controller merging ([aee7bdf](https://github.com/neo9/n9-node-routing/commit/aee7bdf)) (Benjamin Daniel)

### release

* V 0.0.7 ([30c534c](https://github.com/neo9/n9-node-routing/commit/30c534c)) (Benjamin Daniel)

### version

* Update to v 0.0.6 ([39774db](https://github.com/neo9/n9-node-routing/commit/39774db)) (Benjamin Daniel)

### versions

* Add release command ([f9a2b37](https://github.com/neo9/n9-node-routing/commit/f9a2b37)) (Benjamin Daniel)