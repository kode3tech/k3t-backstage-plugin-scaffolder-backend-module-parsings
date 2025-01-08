import { ScmIntegrations } from "@backstage/integration";
import {
  ActionContext,
  createTemplateAction,
} from "@backstage/plugin-scaffolder-node";
import { JsonObject } from "@backstage/types";
import { Schema } from "jsonschema";
import { AvailableTypes, ContentType, resolvers } from "../utils/content";
import { JSON_ID } from "./ids";
import { examples } from "./json.examples";
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
      description: "JSON source content",
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
  results: OutputFields;
};

export const OutputSchema: Schema = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
      },
    },
  },
};

/**
 * Downloads content and places it in the workspace, or optionally
 * in a subdirectory specified by the 'targetPath' input option.
 * @public
 */
export function createJsonParseAction({
  reader,
  integrations,
}: {
  reader: UrlReaderService;
  integrations: ScmIntegrations;
}) {
  return createTemplateAction<InputType, OutputType>({
    id: JSON_ID,
    description: "Parse JSON contents from diferent sources types.",
    examples,
    schema: {
      input: InputSchema,
      output: OutputSchema,
    },
    supportsDryRun: true,
    async handler(ctx) {
      const {
        input: { sources, commonParams },
        logger,
        output,
      } = ctx;
      const results: any[] = [];

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

          const parsed = JSON.parse(finalContent);
          results.push(parsed);
        } catch (e: any) {
          results.push({});
          // logger.pipe(mainLogger)
          logger.error(e?.message);
        }
      }

      output("results", results);
    },
  });
}
