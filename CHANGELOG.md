# Change Log

## [2.1.11](https://github.com/owlsdepartment/ovee/compare/v2.1.10...v2.1.11) (2022-03-28)


### Bug Fixes

* **ovee:** increase TemplateComponent safe usage ([b766b20](https://github.com/owlsdepartment/ovee/commit/b766b20ea66e5537c5b00ed8491efb6629363362))



## [2.1.10](https://github.com/owlsdepartment/ovee/compare/v2.1.9...v2.1.10) (2022-03-25)


### Bug Fixes

* **ovee:** [#31](https://github.com/owlsdepartment/ovee/issues/31) prevent from double call of decorators init function, when components extend from each other ([b614441](https://github.com/owlsdepartment/ovee/commit/b6144412fdd5f321c96a47d0f5023ebcd60f69a5))



## [2.1.9](https://github.com/owlsdepartment/ovee/compare/v2.1.8...v2.1.9) (2022-03-17)


### Bug Fixes

* **core:** move instance decorators destructors from class prototype to instance ([719ca72](https://github.com/owlsdepartment/ovee/commit/719ca7236a1b87ef78ae29dece74cf4e139be1a1))



## [2.1.8](https://github.com/owlsdepartment/ovee/compare/v2.1.7...v2.1.8) (2021-12-29)


### Bug Fixes

* **content-loader:** remove 'ovee.js' from dependencies ([853bb2a](https://github.com/owlsdepartment/ovee/commit/853bb2a1dd3a53fee88d79ea688b0ea74055bccc))
* **ovee:** preserve this context in computed decorator ([af3be98](https://github.com/owlsdepartment/ovee/commit/af3be98b23e8537bd06b83f14ed6f8579dcf2296))



## [2.1.6](https://github.com/owlsdepartment/ovee/compare/v2.1.5...v2.1.6) (2021-11-26)


### Bug Fixes

* **ovee:** accelerate template first render and allow for `updateTask` to be awaitable inside `init` hook ([9e00200](https://github.com/owlsdepartment/ovee/commit/9e0020035f89287444b9fa7b5c738d8c4c80aaf9))



## [2.1.4](https://github.com/owlsdepartment/ovee/compare/v2.2.0...v2.1.4) (2021-11-12)


### Bug Fixes

* lower all packages target ES version to ES6 ([cefdc86](https://github.com/owlsdepartment/ovee/commit/cefdc86b288dddf0bc42c772852aacb5e2381292))



# [2.2.0](https://github.com/owlsdepartment/ovee/compare/v2.1.2...v2.2.0) (2021-11-05)


### Features

* **@ovee/barba:** update how plugins are added to Barba in a more modular way ([1e35e58](https://github.com/owlsdepartment/ovee/commit/1e35e58a9a90c36c37a87520808162b18915a001))



## [2.1.2](https://github.com/owlsdepartment/ovee/compare/v2.1.1...v2.1.2) (2021-11-03)


### Features

* **@ovee/barba:** add `@barba/router` to available plugins and update emitted events names ([937c855](https://github.com/owlsdepartment/ovee/commit/937c855bcd6c8f23ddb179bf26e2b3c2578c1e85))



## [2.1.1](https://github.com/owlsdepartment/ovee/compare/v2.1.0...v2.1.1) (2021-10-27)


### Bug Fixes

* Component decorators would not work if Component was used more than one time ([5564173](https://github.com/owlsdepartment/ovee/commit/55641732e9e8604d5b85d0071bbf404d57e62117))



# [2.1.0](https://github.com/owlsdepartment/ovee/compare/v2.1.0-alpha.0...v2.1.0) (2021-10-05)


### Bug Fixes

* docs typos ([412fc9a](https://github.com/owlsdepartment/ovee/commit/412fc9ab1565d456e1adc09f2e21f67fe82a4c99))
* docs typos ([5811b46](https://github.com/owlsdepartment/ovee/commit/5811b464c25ff2a1ee4af2c57d47b944e38181c1))
* errors are now longer catched by mistake in lifecycle hooks ([8c9cda4](https://github.com/owlsdepartment/ovee/commit/8c9cda4a1b9fc0ed313717bfa7fd364d417e0858))
* typo in import ([a128315](https://github.com/owlsdepartment/ovee/commit/a12831528014f5c981013db31c871dba3932cb95))
* new logging system ([de9e980](https://github.com/owlsdepartment/ovee/commit/de9e9804b2f0e8691bb52c3362d74771c1b8cd93))
* added new external reactivity system with watchers ([80289f7](https://github.com/owlsdepartment/ovee/commit/80289f74abff68372858cd282e846a755346be1b))



# [2.1.0-alpha.0](https://github.com/owlsdepartment/ovee/compare/v2.0.8...v2.1.0-alpha.0) (2021-09-17)


### Bug Fixes

* instance decorators inheritance ([5d93eed](https://github.com/owlsdepartment/ovee/commit/5d93eed17de2601f91ec4dfc0fe0202777e14d1e))
* make Barba config optional ([92def1c](https://github.com/owlsdepartment/ovee/commit/92def1ceb9dcd088bbb84b6c966ee5432cad9f67))



## [2.0.8](https://github.com/owlsdepartment/ovee/compare/v2.0.6...v2.0.8) (2021-08-25)


### Bug Fixes

* typings in `@ovee/barba` and make Barba options optional ([822ec1e](https://github.com/owlsdepartment/ovee/commit/822ec1e8f11e5d9cd609b6c411c9cb556333bf69))
