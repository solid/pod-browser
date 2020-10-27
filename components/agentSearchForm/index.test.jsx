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

import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { mountToJson } from "../../__testUtils/mountWithTheme";
import AgentSearchForm from "./index";

describe("AgentSearchForm", () => {
  test("it renders an AgentSearchForm", () => {
    const heading = "Heading";
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    const tree = mountToJson(
      <AgentSearchForm
        heading={heading}
        onChange={onChange}
        onSubmit={onSubmit}
        value=""
      />
    );

    expect(tree).toMatchSnapshot();
  });

  test("it has a default heading", () => {
    const onSubmit = jest.fn();
    const tree = mountToJson(<AgentSearchForm onSubmit={onSubmit} />);

    expect(tree).toMatchSnapshot();
  });
  test("it calls onChange when updating the input", () => {
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    const wrapper = render(
      <AgentSearchForm onSubmit={onSubmit} onChange={onChange} value="" />
    );
    const input = wrapper.getByRole("textbox");
    fireEvent.change(input, { target: { value: "https://www.example.com" } });
    expect(onChange).toHaveBeenCalledWith("https://www.example.com");
  });
  test("it calls onSubmit when clicking the submit button", () => {
    const onSubmit = jest.fn();
    const wrapper = render(
      <AgentSearchForm onSubmit={onSubmit} value="https://www.example.com" />
    );
    const button = wrapper.getByRole("button");
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith("https://www.example.com");
  });
});
