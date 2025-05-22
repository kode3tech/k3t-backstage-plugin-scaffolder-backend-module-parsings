jest.mock("@backstage/plugin-scaffolder-node", () => {
  const actual = jest.requireActual("@backstage/plugin-scaffolder-node");
  return { ...actual, fetchFile: jest.fn() };
});

import yaml from "yaml";
import { ConfigReader } from "@backstage/config";
import { ScmIntegrations } from "@backstage/integration";
import { createXmlParseAction } from "./xml";
import { examples } from "./xml.examples";
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

  const action = createXmlParseAction({ integrations, reader });

  it("should parse object", async () => {
    const parsedExemple = yaml.parse(examples[0].example);
    const context = createMockActionContext({
      input: parsedExemple.steps[0].input,
    });
    await action.handler(context);
    const result = [
      {
        elements: [
          {
            type: "element",
            name: "books",
            elements: [
              {
                type: "element",
                name: "book",
                elements: [{ type: "text", text: "nature calls" }],
              },
            ],
          },
        ],
      },
    ];

    expect(context.output).toHaveBeenCalledWith("results", result);
  });
});
