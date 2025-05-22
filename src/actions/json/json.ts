import { ScmIntegrations } from "@backstage/integration";
import {
  ActionContext,
  createTemplateAction,
} from "@backstage/plugin-scaffolder-node";
import { JsonObject } from "@backstage/types";
import { AvailableTypes, ContentType, resolvers } from "../utils/content";
import { JSON_ID } from "./ids";
import { examples } from "./json.examples";
import { UrlReaderService } from "@backstage/backend-plugin-api";
import { z } from "zod";

export type FieldsType = {
  content: string;
  encoding: ContentType;
} & JsonObject;

// Using Zod schema approach
export const FieldsSchema = {
  content: z.string().describe("JSON source content"),
  encoding: z
    .enum(AvailableTypes)
    .describe(
      'Indicate if input "content" field has encoded in "base64", "file", "raw" or "url".'
    )
    .optional(),
};

export type InputType = {
  commonParams?: Partial<FieldsType>;
  sources: FieldsType[];
};

export type OutputFields = Array<any>;

export type OutputType = {
  results: OutputFields;
};

// Using Zod schema approach
export const OutputSchema = {};

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
  return createTemplateAction({
    id: JSON_ID,
    description: "Parse JSON contents from diferent sources types.",
    examples,
    schema: {
      input: {
        commonParams: (d) => d.object(FieldsSchema).optional(),
        sources: (d) => d.array(d.object(FieldsSchema)),
      },
      output: {
        results: (d) => d.array(d.object({})),
      },
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
          ...{ encoding: "base64" as ContentType },
          ...(commonParams ?? {}),
          ...source,
        };

        try {
          const finalContent = await resolvers[encoding as ContentType](
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
