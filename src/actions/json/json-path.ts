import { createTemplateAction } from "@backstage/plugin-scaffolder-node";
import { JsonObject } from "@backstage/types";
import { JSONPath } from "jsonpath-plus";
import { z } from "zod";
import { JSON_PATH_ID } from "./ids";
import { examples } from "./json-path.examples";

export type FieldsType = {
  json: any;
  path: string;
  options: {
    flatten: boolean;
  };
} & JsonObject;

export const FieldsSchema = z.object({
  json: z.any().describe("Input JSON object data"),
  path: z.string().describe("JSON Path query"),
  options: z
    .object({
      flatten: z
        .boolean()
        .describe("(default: false) Flatten nested results arrays"),
    })
    .describe("List of queries"),
});

export const InputSchema = z.object({
  commonParams: FieldsSchema.optional(),
  queries: z.array(FieldsSchema),
});

export type InputType = {
  commonParams?: Partial<FieldsType>;
  queries: FieldsType[];
};

export type OutputFields = Array<any>;

export type OutputType = {
  results: OutputFields;
};

export const OutputSchema = z.object({
  results: z.array(z.object({})),
});

export function createJsonPathAction() {
  return createTemplateAction({
    id: JSON_PATH_ID,
    description: "Get value from json with jsonpath-plus",
    examples,
    supportsDryRun: true,
    schema: {
      input: {
        commonParams: (d) => d.object(FieldsSchema.shape).optional(),
        queries: (d) => d.array(d.object(FieldsSchema.shape)),
      },
      output: {
        results: (d) => d.array(d.object({})),
      },
    },
    async handler(ctx) {
      const {
        input: { queries, commonParams },
        logger,
        output,
      } = ctx;
      const results: any[] = [];

      for (const query of queries) {
        const { json, options, path } = {
          ...(commonParams ?? {}),
          ...query,
        };

        try {
          const result = JSONPath({
            ...(options ?? {}),
            autostart: true,
            json,
            path,
          });

          results.push(result);
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
