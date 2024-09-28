
jest.mock('@backstage/plugin-scaffolder-node', () => {
  const actual = jest.requireActual('@backstage/plugin-scaffolder-node');
  return { ...actual, fetchFile: jest.fn() };
});

import yaml from 'yaml';
import os from 'os';
import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';
import { createXmlParseAction } from './xml';
import { PassThrough } from 'stream';
import { examples } from './xml.examples';
import { UrlReaderService } from '@backstage/backend-plugin-api';
import { ActionContext } from '@backstage/plugin-scaffolder-node';

describe('json:parse examples', () => {
  const integrations = ScmIntegrations.fromConfig(
    new ConfigReader({
      integrations: {
        github: [{ host: 'github.com', token: 'token' }],
      },
    }),
  );
  const reader: UrlReaderService = {
    readUrl: jest.fn(),
    readTree: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const action = createXmlParseAction({ integrations, reader });
  const mockContext: ActionContext<any, any> = {
    input: {},
    checkpoint: jest.fn(),
    getInitiatorCredentials: jest.fn(),
    workspacePath: os.tmpdir(),
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };

  it('should parse object', async () => {
    const parsedExemple = yaml.parse(examples[0].example)
    await action.handler({
      ...mockContext,
      input: parsedExemple.steps[0].input,
    });
    const result = [
      {"elements":[{"type":"element","name":"books","elements":[{"type":"element","name":"book","elements":[{"type":"text","text":"nature calls"}]}]}]},
    ];

    expect(mockContext.output).toHaveBeenCalledWith(
      'results',
      result
    );
  });
});
