
import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';
import { InputType } from './json';
import { JSON_ID } from './ids';

export const examples: TemplateExample[] = [
  {
    description: 'Parse multiple Json contents from various sources types.',
    example: yaml.stringify({
      steps: [
        {
          action: JSON_ID,
          id: 'json-parse',
          name: 'Parse Json files',
          input: {
            commonParams: {
              encoding: 'raw',
            },
            sources: [
              { content: JSON.stringify({key: "value"}) },
            ]
          } as InputType ,
        },
      ],
    }),
  },
];
