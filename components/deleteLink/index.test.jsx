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
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { deleteFile } from "@inrupt/solid-client";

import DeleteLink, { handleDeleteResource, handleConfirmation } from "./index";

jest.mock("@inrupt/solid-client");

const name = "Resource";
const resourceIri = "iri";

describe("Delete link", () => {
  test("it renders a delete link", () => {
    const tree = shallow(
      <DeleteLink onDelete={jest.fn()} resourceIri={resourceIri} name={name} />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("handleDeleteResource", () => {
  test("it returns a handler that deletes the resource", async () => {
    const fetch = jest.fn();
    const onDelete = jest.fn();
    const onDeleteError = jest.fn();
    const setAlertOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const handler = handleDeleteResource({
      fetch,
      name,
      onDelete,
      onDeleteError,
      resourceIri,
      setAlertOpen,
      setMessage,
      setSeverity,
    });

    await handler();

    expect(deleteFile).toHaveBeenCalledWith(resourceIri, { fetch });
  });

  test("it returns a handler that calls onDelete if successful", async () => {
    const fetch = jest.fn();
    const onDelete = jest.fn();
    const onDeleteError = jest.fn();
    const setAlertOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const handler = handleDeleteResource({
      fetch,
      name,
      onDelete,
      onDeleteError,
      resourceIri,
      setAlertOpen,
      setMessage,
      setSeverity,
    });

    await handler();

    expect(onDelete).toHaveBeenCalled();
  });

  test("it returns a handler that shows an alert if successful", async () => {
    const fetch = jest.fn();
    const onDelete = jest.fn();
    const onDeleteError = jest.fn();
    const setAlertOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const handler = handleDeleteResource({
      fetch,
      name,
      onDelete,
      onDeleteError,
      resourceIri,
      setAlertOpen,
      setMessage,
      setSeverity,
    });

    await handler();

    expect(setSeverity).toHaveBeenCalledWith("success");
    expect(setMessage).toHaveBeenCalledWith(
      "Resource was successfully deleted."
    );
    expect(setAlertOpen).toHaveBeenCalledWith(true);
  });

  test("it returns a handler that calls onError if not successful", async () => {
    const fetch = jest.fn();
    const error = new Error("boom");
    const onDelete = jest.fn(() => {
      throw error;
    });
    const onDeleteError = jest.fn();
    const setAlertOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const handler = handleDeleteResource({
      fetch,
      name,
      onDelete,
      onDeleteError,
      resourceIri,
      setAlertOpen,
      setMessage,
      setSeverity,
    });

    await handler();

    expect(onDeleteError).toHaveBeenCalledWith(error);
  });
});
describe("handleConfirmation", () => {
  const setOpen = jest.fn();
  const deleteResource = jest.fn();
  const setConfirmed = jest.fn();
  const setTitle = jest.fn();
  const setContent = jest.fn();
  const setConfirmationSetup = jest.fn();
  const dialogId = "handleConfirmation-dialog";
  const open = dialogId;

  const handler = handleConfirmation({
    dialogId,
    open,
    setOpen,
    setConfirmed,
    deleteResource,
    setTitle,
    setContent,
    setConfirmationSetup,
  });

  test("it returns a handler that deletes the file when user confirms dialog", async () => {
    await handler(true, true, name);

    expect(setOpen).toHaveBeenCalledWith(null);
    expect(deleteResource).toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
    expect(setTitle).toHaveBeenCalled();
    expect(setContent).toHaveBeenCalled();
    expect(setConfirmationSetup).toHaveBeenCalledWith(true);
  });
  test("it returns a handler that exits when user cancels the operation", async () => {
    await handler(true, false, name);

    expect(deleteResource).not.toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
  });
});
