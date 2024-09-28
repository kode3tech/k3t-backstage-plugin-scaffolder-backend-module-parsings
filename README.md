# Plugin for scaffolder backend `parsings`

The parsings module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

This package make you able to parse and extract from `Yaml`, `Xml` and `Json` formats.

## Features

* Parse `Json` from `raw`, `base64`, `file` and `url` sources.
* Get `Json` results from multiple queries with `Json Path-plus`.
* Parse and transform `Yaml` and `Xml` files to `Json`.

> You can see all available examples [here](./exemples.md).

## Get Started

just 
```bash
yarn add @k3tech/backstage-plugin-scaffolder-backend-module-parsings
```
and import module on backend

`packages/backend/src/index.ts`
```ts
...
backend.add(import('@k3tech/backstage-plugin-scaffolder-backend-module-parsings'));

```

you can check if all actions and examples in is ready on http://localhost:3000/create/actions



_This plugin was created through the Backstage CLI_
