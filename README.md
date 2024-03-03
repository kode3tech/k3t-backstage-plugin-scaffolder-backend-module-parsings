# @k3tech/backstage-plugin-scaffolder-backend-module-parsings

The parsings module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

This package make you able to parse and extract from `Yaml`, `Xml` and `Json` formats.

_This plugin was created through the Backstage CLI_


## Get Started

on `packages/backend/src/plugins/scaffolder.ts`

```ts
import { createParsingsActions } from "@k3tech/backstage-plugin-scaffolder-backend-module-parsings";
...

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const { 
    config,
    discovery,
    logger,
    database,
    reader,
    identity,
   } = env
  const catalogClient = new CatalogClient({
    discoveryApi: discovery,
  });
  const integrations = ScmIntegrations.fromConfig(config);

  const options = {
    config,
    discovery,
    logger,
    database,
    reader,
    identity,
    catalogClient,
    integrations
  }

  ...

  const parsingsActions = createParsingsActions(options);

  return await createRouter({
    ...options,
    actions: [
      ...
      ...parsingsActions,
    ]
  });

```