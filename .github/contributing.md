# Contributing to Ovee.js

These are the rules and guidelines for contributors.

## Commits

Commits follow the rules of [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) with [Angular guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

So the structure for single commit is:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Scope is only optional if changes are made to whole repo, like f.ex.: documentation update, dependencies update or CI update.

When changes are made to specific packages, you should provide scope.

Example:

```
docs: update contribution documentation
```

```
refactor(ovee): added new `isString` helper
```

```
fix(ovee-content-loader): make config optional
```

### Commit types

 - __build__: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
 - __ci__: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
 - __docs__: Documentation only changes
 - __feat__: A new feature
 - __fix__: A bug fix
 - __perf__: A code change that improves performance
 - __refactor__: A code change that neither fixes a bug nor adds a feature
 - __style__: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
 - __test__: Adding missing tests or correcting existing tests

## Publishing new release

<!-- WIP -->
<!-- Proposed workflow: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli#recommended-workflow -->
<!-- Proposed workflow: https://github.com/conventional-changelog/conventional-changelog/issues/376 -->
<!-- Trigger build -->
