import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { JsonObject } from '@backstage/types';
import { JSONPath } from "jsonpath-plus";
import { Schema } from 'jsonschema';
import { JSON_PATH_ID } from './ids';
import { examples } from "./json-path.examples";

export type FieldsType = {
  json: any;
  path: string;
  options: {
    flatten: boolean
  }
} & JsonObject;

export const FieldsSchema: Schema = {
  type: 'object',
  required: ['content'],
  properties: {
    json: {
      title: 'Input JSON object data',
      type: 'object',
    },
    path: {
      type: 'string',
      title: 'JSON Path query',
    },
    options: {
      type: 'object',
      title: 'List of queries',
      properties: {
        flatten: {
          type: 'boolean',
          title: '(default: false) Flatten nestes results arrays',
        }
      }
    }
  }
}

export const InputSchema: Schema = {
  type: 'object',
  properties: {
    commonParams: FieldsSchema,
    queries: {
      type: 'array',
      items: FieldsSchema
    }
  }
}

export type InputType = {
  commonParams?: Partial<FieldsType>,
  queries: FieldsType[]
}

export type OutputFields = Array<any>


export type OutputType = {
  results: OutputFields
}

export const OutputSchema: Schema = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: { 
        type: "object"
       },
    }
  }
}

export function createJsonPathAction() {
  return createTemplateAction<InputType, OutputType>({
    id: JSON_PATH_ID,
    description: 'Get value from json with jsonpath-plus',
    examples,
    schema: {
      input: InputSchema,
      output: OutputSchema,
    },
    async handler(ctx) {
      const { input: { queries, commonParams }, logger, output } = ctx;
      const results: any[] = []
      
      for (const query of queries) {
        const { json, options, path } =  {
          ...(commonParams ?? {}), 
          ...query
        }
        
        try {
          const result = JSONPath({ ...(options ?? {}), autostart: true, json, path })

          results.push(result);
        } catch (e: any) {
          results.push({});
          // logger.pipe(mainLogger)
          logger.error(e?.message);
        }
      }
      
      output('results', results)
    }
  });
}
