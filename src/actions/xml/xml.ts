import { ScmIntegrations } from '@backstage/integration';
import { ActionContext, createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { JsonObject } from '@backstage/types';
import { Schema } from 'jsonschema';
import xmljs from 'xml-js';
import { ContentType, resolvers } from '../utils/content';
import { XML_ID } from './ids';
import { examples } from "./xml.examples";
import { UrlReaderService } from '@backstage/backend-plugin-api';

interface PipesFnMap {
  upper(value?: string): string
  lower(value?: string): string
  stripNs(value?: string): string
  trim(value?: string): string
  trimStart(value?: string): string
  trimEnd(value?: string): string
}


const pipesFn = {
  upper: (value?: string) => (value ?? '').toUpperCase(),
  lower: (value?: string) => (value ?? '').toLowerCase(),
  stripNs: (value?: string) => (value ?? '').replace(/^[^:]+:/g,''),
  trim: (value?: string) => (value ?? '').trim(),
  trimStart: (value?: string) => (value ?? '').trimStart(),
  trimEnd: (value?: string) => (value ?? '').trimEnd(),
}

function pipesProcessor(pipes?: Array<keyof PipesFnMap>){
  if(!pipes || pipes.length === 0) return (v: string) => v

  return (value: string) => {
    let r = value;
    for (const pipeName of pipes) {
      r = pipesFn[pipeName](value)
    }
    return r
  }
}

const pipeFnField = {
  type: 'array',
  title: `Available pipes are '${Object.keys(pipesFn).join('\', \'')}'`,
  items: {
    type: 'string',
    enum: Object.keys(pipesFn)
  }
}


export type FieldsType = {
  content: string
  encoding: ContentType
  options?: {
    pipes?: {
      doctype?: Array<keyof PipesFnMap>,
      instruction?: Array<keyof PipesFnMap>,
      cdata?: Array<keyof PipesFnMap>,
      comment?: Array<keyof PipesFnMap>,
      text?: Array<keyof PipesFnMap>,
      instructionName?: Array<keyof PipesFnMap>,
      elementName?: Array<keyof PipesFnMap>,
      attributeName?: Array<keyof PipesFnMap>,
      attributeValue?: Array<keyof PipesFnMap>,
      attributes?: Array<keyof PipesFnMap>,
    },
    compact?: boolean,
    trim?: boolean,
    nativeType?: boolean,
    nativeTypeAttributes?: boolean,
    addParent?: boolean,
    alwaysArray?: boolean,
    alwaysChildren?: boolean,
    instructionHasAttributes?: boolean,
    ignoreDeclaration?: boolean,
    ignoreInstruction?: boolean,
    ignoreAttributes?: boolean,
    ignoreComment?: boolean,
    ignoreCdata?: boolean,
    ignoreDoctype?: boolean,
    ignoreText?: boolean,
  }
} & JsonObject;

export const FieldsSchema: Schema = {
  "type": "object",
  "properties": {
    "content": {title: 'XML source content', "type": "string"},
    "encoding": {description: 'Indicate if input "content" field has encoded in "base64", "file", "raw" or "url".',"type": "string"},
    "options": {
      title: 'Options for Converting XML → JS object / JSON',
      description: 'https://www.npmjs.com/package/xml-js#options-for-converting-xml-%E2%86%92-js-object--json ',
      "type": "object",
      "properties": {
        "pipes": {
          "type": "object",
          title: 'Ordered pipes to transform nodes values by type.',
          "properties": {
            "doctype": {... pipeFnField },
            "instruction": {... pipeFnField },
            "cdata": {... pipeFnField },
            "comment": {... pipeFnField },
            "text": {... pipeFnField },
            "instructionName": {... pipeFnField },
            "elementName": {... pipeFnField },
            "attributeName": {... pipeFnField },
            "attributeValue": {... pipeFnField },
            "attributes": {... pipeFnField }
          }
        },
        compact: {
          type: 'boolean',
          title: 'Whether to produce detailed object or compact object.',
        },
        trim: {
          type: 'boolean',
          title: 'Whether to trim whitespace characters that may exist before and after the text.',
        },
        nativeType: {
          type: 'boolean',
          title: 'Whether to attempt converting text of numerals or of boolean values to native type. For example, "123" will be 123 and "true" will be true',
        },
        nativeTypeAttributes: {
          type: 'boolean',
          title: 'Whether to attempt converting attributes of numerals or of boolean values to native type. See also nativeType above.',
        },
        addParent: {
          type: 'boolean',
          title: 'Whether to add parent property in each element object that points to parent object.',
        },
        alwaysArray: {
          type: 'boolean',
          title: 'Whether to always put sub element, even if it is one only, as an item inside an array.',
          description: 'Will be a:[{b:[{}]}] rather than a:{b:{}} (applicable for compact output only). If the passed value is an array, only elements with names in the passed array are always made arrays.'
        },
        alwaysChildren: {
          type: 'boolean',
          title: 'Whether to always generate elements property even when there are no actual sub elements.',
          description: 'Will be {"elements":[{"type":"element","name":"a","elements":[]}]} rather than {"elements":[{"type":"element","name":"a"}]} (applicable for non-compact output).',
        },
        instructionHasAttributes: {
          type: 'boolean',
          title: 'Whether to parse contents of Processing Instruction as attributes or not. <?go to="there"?> will be {"_instruction":{"go":{"_attributes":{"to":"there"}}}} rather than {"_instruction":{"go":"to=\"there\""}}. See discussion.',
        },
        ignoreDeclaration: {
          type: 'boolean',
          title: 'Whether to ignore parsing declaration property. That is, no declaration property will be generated.',
        },
        ignoreInstruction: {
          type: 'boolean',
          title: 'Whether to ignore parsing processing instruction property. That is, no instruction property will be generated.',
        },
        ignoreAttributes: {
          type: 'boolean',
          title: 'Whether to ignore parsing attributes of elements.That is, no attributes property will be generated.',
        },
        ignoreComment: {
          type: 'boolean',
          title: 'Whether to ignore parsing comments of the elements. That is, no comment will be generated.',
        },
        ignoreCdata: {
          type: 'boolean',
          title: 'Whether to ignore parsing CData of the elements. That is, no cdata will be generated.',
        },
        ignoreDoctype: {
          type: 'boolean',
          title: 'Whether to ignore parsing Doctype of the elements. That is, no doctype will be generated.',
        },
        ignoreText: {
          type: 'boolean',
          title: 'Whether to ignore parsing texts of the elements. That is, no text will be generated.',
        },
      }
    }
  }
}


export const InputSchema: Schema = {
  type: 'object',
  properties: {
    commonParams: FieldsSchema,
    sources: {
      type: 'array',
      items: FieldsSchema
    }
  }
}

export type InputType = {
  commonParams?: Partial<FieldsType>,
  sources: FieldsType[]
}

export type OutputFields = any

export type OutputType = {
  results: Array<OutputFields>
}

export const OutputSchema: Schema = {
  type: "object",
  properties: {
    results: {
      type: "array",
    }
  }
}

export function createXmlParseAction({reader, integrations}: {
  reader: UrlReaderService;
  integrations: ScmIntegrations;
}) {
  
  return createTemplateAction<InputType, OutputType>({
    id: XML_ID,
    description: 'Parse xml to json See https://www.npmjs.com/package/xml-js ',
    examples,
    schema: {
      input: InputSchema,
      output: OutputSchema,
    },
    async handler(ctx) {

      const { input: { sources, commonParams }, logger, output } = ctx;
      const results: Array<any> = []
      
      for (const source of sources) {
        const { content, encoding, options } =  {
          ...{encoding: 'base64'},
          ...(commonParams ?? {}), 
          ...source
        }
        
        try {
          const finalContent = await resolvers[encoding](
            content, ctx as ActionContext<any, any>, 
            {reader, integrations}
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
          })

          results.push(parsed);
        } catch (e: any) {
          results.push([]);
          // logger.pipe(mainLogger)
          logger.error(e?.message);
        }
      }
      
      output('results', results)

    }
  });
}

