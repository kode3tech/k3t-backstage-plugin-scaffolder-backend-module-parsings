import {
  ActionContext,
  createTemplateAction,
} from "@backstage/plugin-scaffolder-node";
import { loadAll } from "js-yaml";
import { AvailableTypes, ContentType, resolvers } from "../utils/content";
import { JsonObject } from "@backstage/types";
import { z } from "zod";
import { ScmIntegrations } from "@backstage/integration";
import { YAML_ID } from "./ids";
import { examples } from "./yaml.examples";
import { UrlReaderService } from "@backstage/backend-plugin-api";

export type FieldsType = {
  content: string;
  encoding: ContentType;
} & JsonObject;

export const FieldsSchema = z.object({
  content: z.string().describe("YAML source content"),
  encoding: z
    .enum(AvailableTypes)
    .describe(
      'Indicate if input "content" field has encoded in "base64", "file", "raw" or "url".'
    ),
});

export const InputSchema = z.object({
  commonParams: FieldsSchema.optional(),
  sources: z.array(FieldsSchema),
});

export type InputType = {
  commonParams?: Partial<FieldsType>;
  sources: FieldsType[];
};

export type OutputFields = Array<any>;

export type OutputType = {
  results: Array<OutputFields>;
};

export const OutputSchema = z.object({
  results: z.array(z.array(z.any())),
});

export function createYamlParseAction({
  reader,
  integrations,
}: {
  reader: UrlReaderService;
  integrations: ScmIntegrations;
}) {
  return createTemplateAction({
    id: YAML_ID,
    description: "Parse YAML contents from diferent sources types. ",
    examples,
    supportsDryRun: true,
    schema: {
      input: {
        commonParams: (d) => d.object(FieldsSchema.shape).optional(),
        sources: (d) => d.array(d.object(FieldsSchema.shape)),
      },
      output: {
        results: (d) => d.array(d.array(d.any())),
      },
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
          ...{ encoding: "base64" as ContentType },
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
