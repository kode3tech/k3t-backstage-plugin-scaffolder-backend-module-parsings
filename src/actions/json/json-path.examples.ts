
import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';
import { InputType } from './json-path';
import { JSON_PATH_ID } from './ids';

export const examples: TemplateExample[] = [
  {
    description: 'Parse multiple Json contents from various sources types.',
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
];
