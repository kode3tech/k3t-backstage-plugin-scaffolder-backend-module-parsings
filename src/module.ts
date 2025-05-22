import {
  coreServices,
  createBackendModule,
} from "@backstage/backend-plugin-api";

import { createJsonParseAction } from "./actions/json/json";
import { createJsonPathAction } from "./actions/json/json-path";
import { createXmlParseAction } from "./actions/xml/xml";
import { createYamlParseAction } from "./actions/yaml/yaml";

import { ScmIntegrations } from "@backstage/integration";
import { scaffolderActionsExtensionPoint } from "@backstage/plugin-scaffolder-node/alpha";

/**
 * A backend module that registers the action into the scaffolder
 */
export const scaffolderCatalogModule = createBackendModule({
  moduleId: "k3tech-scaffolder-actions-parsings",
  pluginId: "scaffolder",
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
        reader: coreServices.urlReader,
      },
      async init({ scaffolderActions, config, reader }) {
        const integrations = ScmIntegrations.fromConfig(config);

        scaffolderActions.addActions(
          createJsonParseAction({ integrations, reader }),
          createJsonPathAction(),
          createXmlParseAction({ integrations, reader }),
          createYamlParseAction({ integrations, reader })
        );
      },
    });
  },
});
