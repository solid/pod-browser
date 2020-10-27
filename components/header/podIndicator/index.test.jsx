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
import { mount } from "enzyme";
import { useRouter } from "next/router";
import { mountToJson as enzymeMountToJson } from "enzyme-to-json";
import { WithTheme } from "../../../__testUtils/mountWithTheme";
import PodIndicator, {
  clickHandler,
  closeHandler,
  submitHandler,
} from "./index";
import {
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
  aliceWebIdUrl,
  bobWebIdUrl,
} from "../../../__testUtils/mockPersonResource";
import usePodOwnerProfile from "../../../src/hooks/usePodOwnerProfile";
import defaultTheme from "../../../src/theme";

import { packageProfile } from "../../../src/solidClientHelpers/profile";
import { resourceHref } from "../../../src/navigator";
import { normalizeContainerUrl } from "../../../src/stringHelpers";

jest.mock("next/router");
jest.mock("../../../src/hooks/usePodOwnerProfile");

describe("PodIndicator", () => {
  beforeEach(() => {
    useRouter.mockImplementation(() => ({
      query: {
        iri: encodeURIComponent("https://mypod.myhost.com"),
      },
    }));
  });

  test("it renders the pod indicator with the correct name with a formatted name", async () => {
    const userProfile = mockPersonDatasetAlice();
    usePodOwnerProfile.mockReturnValue({
      profile: packageProfile(aliceWebIdUrl, userProfile),
      error: null,
    });
    const tree = mount(
      <WithTheme theme={defaultTheme}>
        <PodIndicator />
      </WithTheme>
    );
    expect(tree.html()).toContain("Alice");
    expect(enzymeMountToJson(tree)).toMatchSnapshot();
  });

  test("it renders the pod indicator with the correct name with a name", async () => {
    const userProfile = mockPersonDatasetBob();
    usePodOwnerProfile.mockReturnValue({
      profile: packageProfile(bobWebIdUrl, userProfile),
      error: null,
    });
    const tree = mount(
      <WithTheme theme={defaultTheme}>
        <PodIndicator />
      </WithTheme>
    );
    expect(tree.html()).toContain("Bob");
    expect(enzymeMountToJson(tree)).toMatchSnapshot();
  });

  test("it returns null if there is no profile", async () => {
    usePodOwnerProfile.mockReturnValue({
      profile: null,
      error: null,
    });
    const tree = mount(
      <WithTheme theme={defaultTheme}>
        <PodIndicator />
      </WithTheme>
    );
    expect(enzymeMountToJson(tree)).toMatchSnapshot();
  });
});

describe("clickHandler", () => {
  test("it sets up a click handler", () => {
    const setAnchorEl = jest.fn();
    const currentTarget = "test";
    clickHandler(setAnchorEl)({ currentTarget });
    expect(setAnchorEl).toHaveBeenCalledWith(currentTarget);
  });
});

describe("closeHandler", () => {
  test("it sets up a close handler", () => {
    const setAnchorEl = jest.fn();
    closeHandler(setAnchorEl)();
    expect(setAnchorEl).toHaveBeenCalledWith(null);
  });
});

describe("submitHandler", () => {
  const url = "http://url.com";
  let event;
  let handleClose;
  let setUrl;
  const router = {};
  let setDirtyForm;
  let setDirtyUrlField;

  beforeEach(() => {
    event = { preventDefault: jest.fn() };
    handleClose = jest.fn();
    setUrl = jest.fn();
    router.push = jest.fn();
    setDirtyForm = jest.fn();
    setDirtyUrlField = jest.fn();
  });

  test("it sets up a submit handler", async () => {
    await submitHandler(
      handleClose,
      setUrl,
      setDirtyForm,
      setDirtyUrlField
    )(event, url, router);
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(router.push).toHaveBeenCalledWith(
      "/resource/[iri]",
      resourceHref(normalizeContainerUrl(url))
    );
    expect(handleClose).toHaveBeenCalledWith();
    expect(setUrl).toHaveBeenCalledWith("");
    expect(setDirtyForm).toHaveBeenCalledWith(false);
    expect(setDirtyUrlField).toHaveBeenCalledWith(false);
  });

  it("should do nothing if no url is given", async () => {
    await submitHandler(
      handleClose,
      setUrl,
      setDirtyForm,
      setDirtyUrlField
    )(event, "", router);
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(router.push).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
    expect(setUrl).not.toHaveBeenCalled();
    expect(setDirtyForm).toHaveBeenCalledWith(true);
    expect(setDirtyUrlField).not.toHaveBeenCalled();
  });
});
