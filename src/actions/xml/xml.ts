import { ScmIntegrations } from "@backstage/integration";
import {
  ActionContext,
  createTemplateAction,
} from "@backstage/plugin-scaffolder-node";
import { JsonObject } from "@backstage/types";
import { z } from "zod";
import xmljs from "xml-js";
import { AvailableTypes, ContentType, resolvers } from "../utils/content";
import { XML_ID } from "./ids";
import { examples } from "./xml.examples";
import { UrlReaderService } from "@backstage/backend-plugin-api";

interface PipesFnMap {
  upper(value?: string): string;
  lower(value?: string): string;
  stripNs(value?: string): string;
  trim(value?: string): string;
  trimStart(value?: string): string;
  trimEnd(value?: string): string;
}

const pipesFn = {
  upper: (value?: string) => (value ?? "").toUpperCase(),
  lower: (value?: string) => (value ?? "").toLowerCase(),
  stripNs: (value?: string) => (value ?? "").replace(/^[^:]+:/g, ""),
  trim: (value?: string) => (value ?? "").trim(),
  trimStart: (value?: string) => (value ?? "").trimStart(),
  trimEnd: (value?: string) => (value ?? "").trimEnd(),
};

function pipesProcessor(pipes?: Array<keyof PipesFnMap>) {
  if (!pipes || pipes.length === 0) return (v: string) => v;

  return (value: string) => {
    let r = value;
    for (const pipeName of pipes) {
      r = pipesFn[pipeName](value);
    }
    return r;
  };
}

const pipeFnField = z
  .array(
    z.enum(
      Object.keys(pipesFn) as [keyof PipesFnMap, ...Array<keyof PipesFnMap>]
    )
  )
  .describe(`Available pipes are '${Object.keys(pipesFn).join("', '")}'`);

export type FieldsType = {
  content: string;
  encoding: ContentType;
  options?: {
    pipes?: {
      doctype?: Array<keyof PipesFnMap>;
      instruction?: Array<keyof PipesFnMap>;
      cdata?: Array<keyof PipesFnMap>;
      comment?: Array<keyof PipesFnMap>;
      text?: Array<keyof PipesFnMap>;
      instructionName?: Array<keyof PipesFnMap>;
      elementName?: Array<keyof PipesFnMap>;
      attributeName?: Array<keyof PipesFnMap>;
      attributeValue?: Array<keyof PipesFnMap>;
      attributes?: Array<keyof PipesFnMap>;
    };
    compact?: boolean;
    trim?: boolean;
    nativeType?: boolean;
    nativeTypeAttributes?: boolean;
    addParent?: boolean;
    alwaysArray?: boolean;
    alwaysChildren?: boolean;
    instructionHasAttributes?: boolean;
    ignoreDeclaration?: boolean;
    ignoreInstruction?: boolean;
    ignoreAttributes?: boolean;
    ignoreComment?: boolean;
    ignoreCdata?: boolean;
    ignoreDoctype?: boolean;
    ignoreText?: boolean;
  };
} & JsonObject;

export const FieldsSchema = z.object({
  content: z.string().describe("XML source content"),
  encoding: z
    .enum(AvailableTypes)
    .describe(
      'Indicate if input "content" field has encoded in "base64", "file", "raw" or "url".'
    ),
  options: z
    .object({
      pipes: z
        .object({
          doctype: pipeFnField.optional(),
          instruction: pipeFnField.optional(),
          cdata: pipeFnField.optional(),
          comment: pipeFnField.optional(),
          text: pipeFnField.optional(),
          instructionName: pipeFnField.optional(),
          elementName: pipeFnField.optional(),
          attributeName: pipeFnField.optional(),
          attributeValue: pipeFnField.optional(),
          attributes: pipeFnField.optional(),
        })
        .describe("Ordered pipes to transform nodes values by type.")
        .optional(),
      compact: z
        .boolean()
        .describe("Whether to produce detailed object or compact object.")
        .optional(),
      trim: z
        .boolean()
        .describe(
          "Whether to trim whitespace characters that may exist before and after the text."
        )
        .optional(),
      nativeType: z
        .boolean()
        .describe(
          'Whether to attempt converting text of numerals or of boolean values to native type. For example, "123" will be 123 and "true" will be true'
        )
        .optional(),
      nativeTypeAttributes: z
        .boolean()
        .describe(
          "Whether to attempt converting attributes of numerals or of boolean values to native type. See also nativeType above."
        )
        .optional(),
      addParent: z
        .boolean()
        .describe(
          "Whether to add parent property in each element object that points to parent object."
        )
        .optional(),
      alwaysArray: z
        .boolean()
        .describe(
          "Whether to always put sub element, even if it is one only, as an item inside an array. Will be a:[{b:[{}]}] rather than a:{b:{}} (applicable for compact output only). If the passed value is an array, only elements with names in the passed array are always made arrays."
        )
        .optional(),
      alwaysChildren: z
        .boolean()
        .describe(
          'Whether to always generate elements property even when there are no actual sub elements. Will be {"elements":[{"type":"element","name":"a","elements":[]}]} rather than {"elements":[{"type":"element","name":"a"}]} (applicable for non-compact output).'
        )
        .optional(),
      instructionHasAttributes: z
        .boolean()
        .describe(
          'Whether to parse contents of Processing Instruction as attributes or not. <?go to="there"?> will be {"_instruction":{"go":{"_attributes":{"to":"there"}}}} rather than {"_instruction":{"go":"to="there""}}. See discussion.'
        )
        .optional(),
      ignoreDeclaration: z
        .boolean()
        .describe(
          "Whether to ignore parsing declaration property. That is, no declaration property will be generated."
        )
        .optional(),
      ignoreInstruction: z
        .boolean()
        .describe(
          "Whether to ignore parsing processing instruction property. That is, no instruction property will be generated."
        )
        .optional(),
      ignoreAttributes: z
        .boolean()
        .describe(
          "Whether to ignore parsing attributes of elements.That is, no attributes property will be generated."
        )
        .optional(),
      ignoreComment: z
        .boolean()
        .describe(
          "Whether to ignore parsing comments of the elements. That is, no comment will be generated."
        )
        .optional(),
      ignoreCdata: z
        .boolean()
        .describe(
          "Whether to ignore parsing CData of the elements. That is, no cdata will be generated."
        )
        .optional(),
      ignoreDoctype: z
        .boolean()
        .describe(
          "Whether to ignore parsing Doctype of the elements. That is, no doctype will be generated."
        )
        .optional(),
      ignoreText: z
        .boolean()
        .describe(
          "Whether to ignore parsing texts of the elements. That is, no text will be generated."
        )
        .optional(),
    })
    .describe(
      "Options for Converting XML → JS object / JSON - https://www.npmjs.com/package/xml-js#options-for-converting-xml-%E2%86%92-js-object--json"
    )
    .optional(),
});

export const InputSchema = z.object({
  commonParams: FieldsSchema.optional(),
  sources: z.array(FieldsSchema),
});

export type InputType = {
  commonParams?: Partial<FieldsType>;
  sources: FieldsType[];
};

export type OutputFields = any;

export type OutputType = {
  results: Array<OutputFields>;
};

export const OutputSchema = z.object({
  results: z.array(z.any()),
});

export function createXmlParseAction({
  reader,
  integrations,
}: {
  reader: UrlReaderService;
  integrations: ScmIntegrations;
}) {
  return createTemplateAction({
    id: XML_ID,
    description: "Parse xml to json See https://www.npmjs.com/package/xml-js ",
    examples,
    supportsDryRun: true,
    schema: {
      input: {
        commonParams: (d) => d.object(FieldsSchema.shape).optional(),
        sources: (d) => d.array(d.object(FieldsSchema.shape)),
      },
      output: {
        results: (d) => d.array(d.any()),
      },
    },
    async handler(ctx) {
      const {
        input: { sources, commonParams },
        logger,
        output,
      } = ctx;
      const results: Array<any> = [];

      for (const source of sources) {
        const { content, encoding, options } = {
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

          const parsed = xmljs.xml2js(finalContent, {
            ...options,
            doctypeFn: pipesProcessor(options?.pipes?.doctype),
            instructionFn: pipesProcessor(options?.pipes?.instruction),
            cdataFn: pipesProcessor(options?.pipes?.cdata),
            commentFn: pipesProcessor(options?.pipes?.comment),
            textFn: pipesProcessor(options?.pipes?.text),
            instructionNameFn: pipesProcessor(options?.pipes?.instructionName),
            elementNameFn: pipesProcessor(options?.pipes?.elementName),
            attributeNameFn: pipesProcessor(options?.pipes?.attributeName),
            attributeValueFn: pipesProcessor(options?.pipes?.attributeValue),
            attributesFn: pipesProcessor(options?.pipes?.attributes),
          });

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
