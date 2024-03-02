

import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';
import { XML_ID } from './ids';
import { InputType } from './xml';

export const examples: TemplateExample[] = [
  {
    description: 'Parse multiple Xmls contents from various sources types.',
    example: yaml.stringify({
      steps: [
        {
          action: XML_ID,
          id: 'xml-parse',
          name: 'Parse xml files',
          input: {
            commonParams: {
              encoding: 'raw',
            },
            sources: [
              { content: '<books><book>nature calls</book></books>' },
            ]
          } as InputType,
        },
      ],
    }),
  },
];
