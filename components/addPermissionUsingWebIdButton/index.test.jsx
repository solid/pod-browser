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
import { DatasetProvider } from "@inrupt/solid-ui-react";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { renderWithTheme } from "../../__testUtils/withTheme";
import AddPermissionUsingWebIdButton, {
  changeHandler,
  clickHandler,
  closeHandler,
  submitHandler,
} from "./index";
import { createAccessMap } from "../../src/solidClientHelpers/permissions";

const datasetUrl = "http://example.com/dataset";
const dataset = mockSolidDatasetFrom(datasetUrl);

describe("AddPermissionUsingWebIdButton", () => {
  it("renders", () => {
    const { asFragment } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <AddPermissionUsingWebIdButton />
      </DatasetProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("changeHandler", () => {
  it("triggers setAgentId", () => {
    const setAgentId = jest.fn();
    changeHandler(setAgentId)("https://example.com");
    expect(setAgentId).toHaveBeenCalledWith("https://example.com");
  });
});

describe("clickHandler", () => {
  it("triggers setAnchor", () => {
    const setAnchorEl = jest.fn();
    clickHandler(setAnchorEl)({ currentTarget: 42 });
    expect(setAnchorEl).toHaveBeenCalledWith(42);
  });
});

describe("closeHandler", () => {
  it("closes popover", () => {
    const setAnchorEl = jest.fn();
    const setAccess = jest.fn();
    const setDisabled = jest.fn();
    const onLoading = jest.fn();
    const setDirtyForm = jest.fn();
    closeHandler(
      setAnchorEl,
      setAccess,
      setDisabled,
      onLoading,
      setDirtyForm
    )();
    expect(setAnchorEl).toHaveBeenCalledWith(null);
    expect(setAccess).toHaveBeenCalledWith(createAccessMap(true));
    expect(setDisabled).toHaveBeenCalledWith(false);
    expect(onLoading).toHaveBeenCalledWith(false);
    expect(setDirtyForm).toHaveBeenCalledWith(false);
  });
});

describe("submitHandler", () => {
  let accessControl;
  let onLoading;
  let setDisabled;
  let handleClose;
  const agentId = "agentId";
  let setDirtyForm;

  beforeEach(() => {
    accessControl = {
      savePermissionsForAgent: jest.fn().mockResolvedValue({}),
    };
    onLoading = jest.fn();
    setDisabled = jest.fn();
    handleClose = jest.fn();
    setDirtyForm = jest.fn();
  });

  it("requires a valid agentId", async () => {
    const access = createAccessMap();
    const submit = submitHandler(
      accessControl,
      onLoading,
      access,
      setDisabled,
      handleClose,
      setDirtyForm
    );
    await expect(submit("")).resolves.toBeUndefined();
    expect(setDirtyForm).toHaveBeenCalledWith(true);
    expect(onLoading).not.toHaveBeenCalled();
  });

  it("validates whether access is set", async () => {
    const invalidSubmit = submitHandler(
      accessControl,
      onLoading,
      createAccessMap(),
      setDisabled,
      handleClose,
      setDirtyForm
    );
    await expect(invalidSubmit(agentId)).resolves.toBeUndefined();
    expect(onLoading).not.toHaveBeenCalled();

    const validSubmit = submitHandler(
      accessControl,
      onLoading,
      createAccessMap(true),
      setDisabled,
      handleClose,
      setDirtyForm
    );
    await expect(validSubmit(agentId)).resolves.toBeUndefined();
    expect(onLoading).toHaveBeenCalledWith(true);
  });

  it("saves successfully", async () => {
    const access = createAccessMap(true);
    const submit = submitHandler(
      accessControl,
      onLoading,
      access,
      setDisabled,
      handleClose,
      setDirtyForm
    );
    await expect(submit(agentId)).resolves.toBeUndefined();
    expect(onLoading).toHaveBeenCalledWith(true);
    expect(setDisabled).toHaveBeenCalledWith(true);
    expect(accessControl.savePermissionsForAgent).toHaveBeenCalledWith(
      agentId,
      access
    );
    expect(handleClose).toHaveBeenCalledWith();
    expect(setDirtyForm).toHaveBeenCalledWith(false);
  });

  it("handles failing save request", async () => {
    const error = "error";
    const access = createAccessMap(true);
    accessControl.savePermissionsForAgent.mockResolvedValue({ error });
    const submit = submitHandler(
      accessControl,
      onLoading,
      access,
      setDisabled,
      handleClose,
      setDirtyForm
    );
    await expect(submit(agentId)).rejects.toEqual(error);
    expect(onLoading).toHaveBeenCalledWith(true);
    expect(setDisabled).toHaveBeenCalledWith(true);
    expect(accessControl.savePermissionsForAgent).toHaveBeenCalledWith(
      agentId,
      access
    );
  });
});
