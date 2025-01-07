jest.mock("@backstage/plugin-scaffolder-node", () => {
  const actual = jest.requireActual("@backstage/plugin-scaffolder-node");
  return { ...actual, fetchFile: jest.fn() };
});

import yaml from "yaml";
import { ConfigReader } from "@backstage/config";
import { ScmIntegrations } from "@backstage/integration";
import { createJsonParseAction, InputType, OutputType } from "./json";
import { examples } from "./json.examples";
import { UrlReaderService } from "@backstage/backend-plugin-api";
import { createMockActionContext } from "@backstage/plugin-scaffolder-node-test-utils";

describe("json:parse examples", () => {
  const integrations = ScmIntegrations.fromConfig(
    new ConfigReader({
      integrations: {
        github: [{ host: "github.com", token: "token" }],
      },
    })
  );
  const reader: UrlReaderService = {
    readUrl: jest.fn(),
    readTree: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const action = createJsonParseAction({ integrations, reader });

  it("should parse object", async () => {
    const context = createMockActionContext<InputType, OutputType>({
      input: yaml.parse(examples[0].example).steps[0].input,
    });
    await action.handler(context);
    expect(context.output).toHaveBeenCalledWith("results", [
      JSON.parse(
        yaml.parse(examples[0].example).steps[0].input.sources[0].content
      ),
    ]);
  });
});
