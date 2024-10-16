# Overview

Ovee.js mainly focuses to solve a problem of structuring and reusing JavaScript code on a website, which was rendered on a server, f.ex. with frameworks like [WordPress](https://wordpress.org/), [Laravel](https://laravel.com/) or [Rails](https://rubyonrails.org/).

It functionality focuses more on working with already existing HTML, rather then templating and rendering (which is already handled by most of the popular frontend frameworks), but there is built-in full support for JSX, so if you wish, you can have all of your rendered in client's browser.

Whole library can be simplified to three building blocks:
 - `App`
 - `Modules`
 - `Components`

::: info
Ovee.js has first class TypeScript support, as is built with it by defualt. This guide will have some tips and tricks how o utilize it to it's maximum potential
:::

## App

App instance is a base for everything. It tracks DOM, adds and removes components, allows you to register reusable components and modules, as well as extending it functionalities.

> [Read more about App](./usage/app.md)

## Modules

In Ovee.js, a module is a function, that executes one time, on app initialization or when dynamically registered. It can be used to add libraries, listen globally on events or as a singleton pattern, to inject same state and methods throughout the app.

> [Read more about Modules](./usage/modules.md)

## Components

Reusable stateful functions, that are bound 1:1 with element they're attached to, strictily bound with it's lifecycle. They are a main building block of this library and they are almost fully reusable between each other.

> [Read more about Components](./usage/components.md)

## Composables and Hooks

If you're coming from other popular frameworks like [Vue](https://vuejs.org/) or [React](https://react.dev/), you are familiar with this concept.

Composables are a reusable functions, that can only be run in specific context, like module setup or component setup.

Hooks are more specific. They also can be run in a specific context, but they let you run some code in a specific lifecycle moment of a module/component.

You will learn about both later on in this guide.
