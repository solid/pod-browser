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

import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { useSession } from "@inrupt/solid-ui-react";
import { renderWithTheme } from "../../__testUtils/withTheme";
import mockSession from "../../__testUtils/mockSession";
import AgentSearchForm, {
  TESTCAFE_ID_ADD_AGENT_BUTTON,
  setupOnBlurHandler,
  setupOnChangeHandler,
  setupSubmitHandler,
} from "./index";

jest.mock("@inrupt/solid-ui-react");

describe("AgentSearchForm", () => {
  beforeEach(() => {
    const session = mockSession();
    useSession.mockReturnValue({
      session,
    });
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
  test("renders correct error message when agent type is 'contacts'", () => {
    const onSubmit = jest.fn();
    const wrapper = render(
      <AgentSearchForm
        type="contacts"
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
    const button = wrapper.getByTestId(TESTCAFE_ID_ADD_AGENT_BUTTON);
    fireEvent.click(button);
    const errorMessage = wrapper.queryByText(
      "You cannot add yourself as a contact."
    );
    expect(errorMessage).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("setupSubmitHandler", () => {
  const session = mockSession();
  let setIsPodOwner;
  let setExistingWebId;
  let onSubmit;
  let event;

  beforeEach(() => {
    setIsPodOwner = jest.fn();
    setExistingWebId = jest.fn();
    onSubmit = jest.fn();
    event = { preventDefault: jest.fn() };
  });

  it("sets up a submit handler", async () => {
    const webId = "value";
    await expect(
      setupSubmitHandler(
        webId,
        session,
        setIsPodOwner,
        [],
        setExistingWebId,
        onSubmit
      )(event)
    ).resolves.toBeUndefined();
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(onSubmit).toHaveBeenCalledWith(webId);
  });

  it("won't allow submitting your own WebId", async () => {
    const { webId } = session.info;
    await expect(
      setupSubmitHandler(
        webId,
        session,
        setIsPodOwner,
        null,
        setExistingWebId,
        onSubmit
      )(event)
    ).resolves.toBeUndefined();
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(setIsPodOwner).toHaveBeenCalledWith(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("won't allow submitting your WebId that already exists", async () => {
    const webId = "value";
    await expect(
      setupSubmitHandler(
        webId,
        session,
        setIsPodOwner,
        [{ webId }],
        setExistingWebId,
        onSubmit
      )(event)
    ).resolves.toBeUndefined();
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(setExistingWebId).toHaveBeenCalledWith(webId);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("setupOnChangeHandler", () => {
  it("sets up onChange handler", () => {
    const value = "value";
    const onChange = jest.fn();
    const setIsPodOwner = jest.fn();
    const setExistingWebId = jest.fn();
    const event = { target: { value } };
    expect(
      setupOnChangeHandler(onChange, setIsPodOwner, setExistingWebId)(event)
    ).toBeUndefined();
    expect(onChange).toHaveBeenCalledWith(value);
    expect(setIsPodOwner).toHaveBeenCalledWith(false);
    expect(setExistingWebId).toHaveBeenCalledWith(null);
  });
});

describe("setupOnBlurHandler", () => {
  it("sets up onBlur handler", () => {
    const setDirtyWebIdField = jest.fn();
    expect(setupOnBlurHandler(setDirtyWebIdField)()).toBeUndefined();
    expect(setDirtyWebIdField).toHaveBeenCalledWith(true);
  });
});
