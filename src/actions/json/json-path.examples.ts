
import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';
import { InputType } from './json-path';
import { JSON_PATH_ID } from './ids';

export const examples: TemplateExample[] = [
  {
    description: 'Evaluate multiple queries from same JSON.',
    example: yaml.stringify({
      steps: [
        {
          action: JSON_PATH_ID,
          id: 'json-path',
          name: 'Parse Json files',
          input: {
            commonParams: {
              json: { "key": "value", "array": [ { "key": 1 }, { "key": 2, "dictionary": { "a": "Apple", "b": "Butterfly", "c": "Cat", "d": "Dog" } }, { "key": 3 } ]}
            },
            queries: [
              { path: "$.array[?(@.key==2)].dictionary.a" },
              { path: "$.array[?(@.key==3)]" },
            ]
          } as InputType,
        },
      ],
    }),
  },
  {
    description: 'Evaluate queries from different JSON data.',
    example: yaml.stringify({
      steps: [
        {
          action: JSON_PATH_ID,
          id: 'json-path',
          name: 'Parse Json files',
          input: {
            queries: [
              { 
                json: { "key": "value", "array": [ { "key": 1 }, { "key": 2, "dictionary": { "a": "Apple", "b": "Butterfly", "c": "Cat", "d": "Dog" } }, { "key": 3 } ]},
                path: "$.array[?(@.key==2)].dictionary.a" 
              },
              { 
                json: { "key": "value", "array": [ { "key": 3 } ]},
                path: "$.array[?(@.key==3)]" 
              },
            ]
          } as InputType,
        },
      ],
    }),
  },
];
