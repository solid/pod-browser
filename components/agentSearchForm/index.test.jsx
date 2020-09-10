/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import { mountToJson } from "../../__testUtils/mountWithTheme";
import AgentSearchForm, { handleClick, handleChange } from "./index";

describe("AgentSearchForm", () => {
  test("it renders an AgentSearchForm", () => {
    const heading = "Heading";
    const onSubmit = jest.fn();
    const tree = mountToJson(
      <AgentSearchForm heading={heading} onSubmit={onSubmit} />
    );

    expect(tree).toMatchSnapshot();
  });

  test("it has a default heading", () => {
    const onSubmit = jest.fn();
    const tree = mountToJson(<AgentSearchForm onSubmit={onSubmit} />);

    expect(tree).toMatchSnapshot();
  });
});

describe("handleClick", () => {
  test("it returns a handler that clears the agentId input and calls onSubmit", () => {
    const setAgentId = jest.fn();
    const onSubmit = jest.fn();
    const onClick = handleClick({ setAgentId, onSubmit });

    onClick("agentId");

    expect(setAgentId).toHaveBeenCalledWith("");
    expect(onSubmit).toHaveBeenCalledWith("agentId");
  });
});

describe("handleChange", () => {
  test("it returns a handler that sets the agentId", () => {
    const setAgentId = jest.fn();
    const onChange = handleChange(setAgentId);

    onChange({ target: { value: "test" } });

    expect(setAgentId).toHaveBeenCalledWith("test");
  });
});
