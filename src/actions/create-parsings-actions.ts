
import { UrlReader } from '@backstage/backend-common';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import {
  ScmIntegrations,
} from '@backstage/integration';
import { TemplateAction } from '@backstage/plugin-scaffolder-node';

import {createJsonParseAction} from './json';
import {createYamlParseAction} from './yaml';
import {createXmlParseAction} from './xml';

/**
 * The options passed to {@link createBuiltinActions}
 * @public
 */
export interface CreateParsingsActionsOptions {
  /**
   * The {@link @backstage/backend-common#UrlReader} interface that will be used in the default actions.
   */
  reader: UrlReader;
  /**
   * The {@link @backstage/integrations#ScmIntegrations} that will be used in the default actions.
   */
  integrations: ScmIntegrations;
  /**
   * The {@link @backstage/catalog-client#CatalogApi} that will be used in the default actions.
   */
  catalogClient: CatalogApi;
  /**
   * The {@link @backstage/config#Config} that will be used in the default actions.
   */
  config: Config;
}

/**
 * A function to generate create a list of default actions that the scaffolder provides.
 * Is called internally in the default setup, but can be used when adding your own actions or overriding the default ones
 *
 * @public
 * @returns A list of actions that can be used in the scaffolder
 */
export const createParsingsActions = (
  options: CreateParsingsActionsOptions,
): TemplateAction[] => {

  const actions = [
    createJsonParseAction(options),
    createYamlParseAction(options),
    createXmlParseAction(options),
  ];

  return actions as TemplateAction<any, any>[];
};
