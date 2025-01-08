jest.mock("@backstage/plugin-scaffolder-node", () => {
  const actual = jest.requireActual("@backstage/plugin-scaffolder-node");
  return { ...actual, fetchFile: jest.fn() };
});

import { JSON_ID } from "./ids";
import { createMockActionContext } from "@backstage/plugin-scaffolder-node-test-utils";
import { createJsonPathAction, InputType, OutputType } from "./json-path";

describe(`${JSON_ID}`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const action = createJsonPathAction();

  it("should read from plain object", async () => {
    const context = createMockActionContext<InputType, OutputType>({
      input: {
        queries: [
          {
            path: "user.name",
            json: {
              user: {
                id: 1,
                name: "test",
              },
            },
            options: {
              flatten: true,
            },
          },
          {
            path: "user.id",
            json: {
              user: {
                id: 1,
                name: "test",
              },
            },
            options: {
              flatten: false,
            },
          },
        ],
      },
    });
    await action.handler(context);

    await expect(context.output).toHaveBeenCalledWith(
      "results",
      expect.arrayContaining([["test"], [1]])
    );
  });
});
