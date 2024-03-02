
jest.mock('@backstage/plugin-scaffolder-node', () => {
  const actual = jest.requireActual('@backstage/plugin-scaffolder-node');
  return { ...actual, fetchFile: jest.fn() };
});

import { getVoidLogger } from '@backstage/backend-common';
import os from 'os';
import { PassThrough } from 'stream';
import yaml from 'yaml';
import { JSON_PATH_ID } from './ids';
import { createJsonPathAction } from './json-path';
import { examples } from './json-path.examples';

describe(`${JSON_PATH_ID} examples`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const action = createJsonPathAction();
  const mockContext = {
    workspacePath: os.tmpdir(),
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };

  it('should parse object', async () => {
    await action.handler({
      ...mockContext,
      input: yaml.parse(examples[0].example).steps[0].input,
    });
    expect(mockContext.output).toHaveBeenCalledWith(
      'results',
      [[ "Apple" ], [{"key": 3}]],
    );
  });
});
