jest.mock("@backstage/plugin-scaffolder-node", () => {
  const actual = jest.requireActual("@backstage/plugin-scaffolder-node");
  return { ...actual, fetchFile: jest.fn() };
});

import yaml from "yaml";
import { JSON_PATH_ID } from "./ids";
import { createJsonPathAction } from "./json-path";
import { examples } from "./json-path.examples";
import { createMockActionContext } from "@backstage/plugin-scaffolder-node-test-utils";
import { InputType, OutputType } from "./json-path";

describe(`${JSON_PATH_ID} examples`, () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const action = createJsonPathAction();

  it("should parse object", async () => {
    const context = createMockActionContext<InputType, OutputType>({
      input: yaml.parse(examples[0].example).steps[0].input,
    });

    await action.handler(context);
    expect(context.output).toHaveBeenCalledWith("results", [
      ["Apple"],
      [{ key: 3 }],
    ]);
  });
});
