jest.mock("@backstage/plugin-scaffolder-node", () => {
  const actual = jest.requireActual("@backstage/plugin-scaffolder-node");
  return { ...actual, fetchFile: jest.fn() };
});

import { resolve as resolvePath } from "path";
import { ConfigReader } from "@backstage/config";
import { ScmIntegrations } from "@backstage/integration";
import { fetchFile } from "@backstage/plugin-scaffolder-node";
import { createXmlParseAction } from "./xml";
import { XML_ID } from "./ids";
import { UrlReaderService } from "@backstage/backend-plugin-api";
import { createMockActionContext } from "@backstage/plugin-scaffolder-node-test-utils";

describe(`${XML_ID}`, () => {
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

  it("should fetch plain", async () => {
    const context = createMockActionContext({
      input: {
        sources: [
          {
            content:
              "https://github.com/backstage/community/tree/main/backstage-community-sessions/assets/Backstage%20Community%20Sessions.png",
            encoding: "url" as const,
          },
        ],
      },
    });

    await action.handler(context);

    expect(fetchFile).toHaveBeenCalledWith(
      expect.objectContaining({
        outputPath: resolvePath(context.workspacePath, "tmp.fetchFile"),
        fetchUrl:
          "https://github.com/backstage/community/tree/main/backstage-community-sessions/assets/Backstage%20Community%20Sessions.png",
      })
    );
  });
});
