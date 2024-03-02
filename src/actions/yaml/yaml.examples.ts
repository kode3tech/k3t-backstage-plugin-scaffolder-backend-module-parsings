

import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';
import { InputType } from './yaml';
import { YAML_ID } from './ids';

export const examples: TemplateExample[] = [
  {
    description: 'Parse multiple Yamls contents from various sources types.',
    example: yaml.stringify({
      steps: [
        {
          action: YAML_ID,
          id: 'yaml-parse',
          name: 'Parse yaml files',
          input: {
            commonParams: {
              encoding: 'raw',
            },
            sources: [
              { content: yaml.stringify({key: "value"}) },
              { content: yaml.stringify({anotherkey: "another value"}) },
            ]
          } as InputType,
        },
      ],
    }),
  },
];
