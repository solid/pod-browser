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
import { useSession } from "@inrupt/solid-ui-react";
import { renderWithTheme } from "../../__testUtils/withTheme";
import mockSession from "../../__testUtils/mockSession";
import AgentSearchForm from "./index";

jest.mock("@inrupt/solid-ui-react");

describe("AgentSearchForm", () => {
  const session = mockSession();
  useSession.mockReturnValue({
    session,
  });
  test("it renders an AgentSearchForm", () => {
    const heading = "Heading";
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    const { asFragment } = renderWithTheme(
      <AgentSearchForm
        heading={heading}
        onChange={onChange}
        onSubmit={onSubmit}
        value=""
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test("it has a default heading", () => {
    const onSubmit = jest.fn();
    const { asFragment } = renderWithTheme(
      <AgentSearchForm onSubmit={onSubmit} />
    );
    expect(asFragment()).toMatchSnapshot();
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
      <AgentSearchForm
        onSubmit={onSubmit}
        value="https://www.example.com"
        permissions={[
          {
            acl: { read: true, append: true, write: true, control: true },
            alias: "Control",
            webId: "https://mypod.com/me/",
          },
        ]}
      />
    );
    const button = wrapper.getByRole("button");
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith("https://www.example.com");
  });
  test("when agentId is already in permissions, it renders error message and does not call onSubmit", () => {
    const onSubmit = jest.fn();
    const wrapper = render(
      <AgentSearchForm
        onSubmit={onSubmit}
        value="https://www.example.com"
        permissions={[
          {
            acl: { read: true, append: true, write: true, control: true },
            alias: "Control",
            webId: "https://www.example.com",
          },
        ]}
      />
    );
    const button = wrapper.getByRole("button");
    fireEvent.click(button);
    const errorMessage = wrapper.queryByText(
      "The WebID https://www.example.com is already in your permissions."
    );
    expect(errorMessage).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  test("when agentId is same as session webId, it renders error message and does not call onSubmit", () => {
    const onSubmit = jest.fn();
    const wrapper = render(
      <AgentSearchForm
        onSubmit={onSubmit}
        value="http://example.com/webId#me"
        permissions={[
          {
            acl: { read: true, append: true, write: true, control: true },
            alias: "Control",
            webId: "http://example.com/webId#me",
          },
        ]}
      />
    );
    const button = wrapper.getByRole("button");
    fireEvent.click(button);
    const errorMessage = wrapper.queryByText(
      "You cannot overwrite your own permissions."
    );
    expect(errorMessage).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
