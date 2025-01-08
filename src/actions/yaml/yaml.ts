import {
  ActionContext,
  createTemplateAction,
} from "@backstage/plugin-scaffolder-node";
import { loadAll } from "js-yaml";
import { AvailableTypes, ContentType, resolvers } from "../utils/content";
import { JsonObject } from "@backstage/types";
import { Schema } from "jsonschema";
import { ScmIntegrations } from "@backstage/integration";
import { YAML_ID } from "./ids";
import { examples } from "./yaml.examples";
import { UrlReaderService } from "@backstage/backend-plugin-api";

export type FieldsType = {
  content: string;
  encoding: ContentType;
} & JsonObject;

export const FieldsSchema: Schema = {
  type: "object",
  required: ["content"],
  properties: {
    content: {
      description: "YAML source content",
      type: "string",
    },
    encoding: {
      description:
        'Indicate if input "content" field has encoded in "base64", "file", "raw" or "url".',
      type: "string",
      enum: AvailableTypes,
    },
  },
};

export const InputSchema: Schema = {
  type: "object",
  properties: {
    commonParams: FieldsSchema,
    sources: {
      type: "array",
      items: FieldsSchema,
    },
  },
};

export type InputType = {
  commonParams?: Partial<FieldsType>;
  sources: FieldsType[];
};

export type OutputFields = Array<any>;

export type OutputType = {
  results: Array<OutputFields>;
};

export const OutputSchema: Schema = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "array",
      },
    },
  },
};

export function createYamlParseAction({
  reader,
  integrations,
}: {
  reader: UrlReaderService;
  integrations: ScmIntegrations;
}) {
  return createTemplateAction<InputType, OutputType>({
    id: YAML_ID,
    description: "Parse YAML contents from diferent sources types. ",
    examples,
    supportsDryRun: true,
    schema: {
      input: InputSchema,
      output: OutputSchema,
    },
    async handler(ctx) {
      const {
        input: { sources, commonParams },
        logger,
        output,
      } = ctx;
      const results: Array<Array<any>> = [];

      for (const source of sources) {
        const { content, encoding } = {
          ...{ encoding: "base64" },
          ...(commonParams ?? {}),
          ...source,
        };

        try {
          const finalContent = await resolvers[encoding](
            content,
            ctx as ActionContext<any, any>,
            { reader, integrations }
          );

          const parsed = loadAll(finalContent, undefined, { json: true });
          results.push(parsed);
        } catch (e: any) {
          results.push([]);
          // logger.pipe(mainLogger)
          logger.error(e?.message);
        }
      }

      output("results", results);
    },
  });
}
