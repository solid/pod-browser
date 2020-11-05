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
import { render, waitFor } from "@testing-library/react";
import { createContainerAt } from "@inrupt/solid-client";
import userEvent from "@testing-library/user-event";
import { PodLocationProvider } from "../../src/contexts/podLocationContext";
import mockSession from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import AlertContext from "../../src/contexts/alertContext";
import AddFolderFlyout, {
  determineFinalUrl,
  handleFolderSubmit,
  TESTCAFE_ID_ADD_FOLDER_BUTTON,
} from "./index";

jest.mock("@inrupt/solid-client");

const currentUri = "https://www.mypodbrowser.com/";
const folders = [
  { iri: "https://www.mypodbrowser.com/SomeFolder", name: "SomeFolder" },
];

describe("AddFolderFlyout", () => {
  const session = mockSession();
  const SessionProvider = mockSessionContextProvider(session);

  let result;

  beforeEach(() => {
    result = render(
      <AlertContext.Provider
        value={{
          setAlertOpen: jest.fn(),
          setMessage: jest.fn(),
          setSeverity: jest.fn(),
        }}
      >
        <PodLocationProvider currentUri={currentUri}>
          <SessionProvider>
            <AddFolderFlyout onSave={jest.fn()} folders={folders} />
          </SessionProvider>
        </PodLocationProvider>
      </AlertContext.Provider>
    );
  });

  test("Renders an Add Folder button", () => {
    expect(result.asFragment()).toMatchSnapshot();
  });

  test("Displays a flyout on click", async () => {
    const { container, queryByTestId } = result;
    await waitFor(() =>
      expect(queryByTestId(TESTCAFE_ID_ADD_FOLDER_BUTTON)).toBeDefined()
    );
    const createFolderButton = queryByTestId(TESTCAFE_ID_ADD_FOLDER_BUTTON);
    userEvent.click(createFolderButton);

    return expect(container.querySelector("#add-folder-flyout")).toBeDefined();
  });
});

describe("determineFinalUrl", () => {
  test("it returns a URL for a new folder with apended integer if folder already exists", () => {
    const name = "SomeFolder";
    const url = determineFinalUrl(folders, currentUri, name);
    expect(url).toMatch("https://www.mypodbrowser.com/SomeFolder(1)");

    const foldersWithDuplicates = [
      { iri: "https://www.mypodbrowser.com/SomeFolder", name: "SomeFolder" },
      {
        iri: "https://www.mypodbrowser.com/SomeFolder(1)",
        name: "SomeFolder(1)",
      },
    ];
    const secondUrl = determineFinalUrl(
      foldersWithDuplicates,
      currentUri,
      name
    );
    expect(secondUrl).toMatch("https://www.mypodbrowser.com/SomeFolder(2)");
  });
});

describe("handleFolderSubmit", () => {
  let fetch;
  let options;
  let onSave;
  let setSeverity;
  let setMessage;
  let setAlertOpen;
  let setFolderName;
  let event;
  let setDirtyForm;
  let setDirtyNameField;

  beforeEach(() => {
    fetch = jest.fn();
    options = { fetch };
    onSave = jest.fn();
    setSeverity = jest.fn();
    setMessage = jest.fn();
    setAlertOpen = jest.fn();
    setFolderName = jest.fn();
    event = { preventDefault: jest.fn() };
    setDirtyForm = jest.fn();
    setDirtyNameField = jest.fn();
  });

  it("returns a handler that creates a new folder at a given location", async () => {
    const handler = handleFolderSubmit({
      options,
      onSave,
      currentUri,
      folders,
      name: "SomeFolder",
      setSeverity,
      setMessage,
      setAlertOpen,
      setFolderName,
      setDirtyForm,
      setDirtyNameField,
    });

    await handler(event);

    expect(createContainerAt).toHaveBeenCalledWith(
      "https://www.mypodbrowser.com/SomeFolder(1)",
      options
    );

    expect(onSave).toHaveBeenCalled();
    expect(setSeverity).toHaveBeenCalledWith("success");
    expect(setMessage).toHaveBeenCalled();
    expect(setAlertOpen).toHaveBeenCalledWith(true);
    expect(setFolderName).toHaveBeenCalledWith("");
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(setDirtyForm).toHaveBeenCalledWith(false);
    expect(setDirtyNameField).toHaveBeenCalledWith(false);
  });

  it("returns a handler that creates a new folder within a folder which has spaces in its name", async () => {
    const handler = handleFolderSubmit({
      options,
      onSave,
      currentUri: "https://www.mypodbrowser.com/First%20Folder/",
      folders: [],
      name: "Second Folder",
      setSeverity,
      setMessage,
      setAlertOpen,
      setFolderName,
      setDirtyForm,
      setDirtyNameField,
    });

    await handler(event);

    expect(createContainerAt).toHaveBeenCalledWith(
      "https://www.mypodbrowser.com/First%20Folder/Second%20Folder",
      options
    );

    expect(onSave).toHaveBeenCalled();
    expect(setSeverity).toHaveBeenCalledWith("success");
    expect(setMessage).toHaveBeenCalled();
    expect(setAlertOpen).toHaveBeenCalledWith(true);
    expect(setFolderName).toHaveBeenCalledWith("");
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(setDirtyForm).toHaveBeenCalledWith(false);
    expect(setDirtyNameField).toHaveBeenCalledWith(false);
  });

  it("returns a handler that validates name before creating it", async () => {
    const handler = handleFolderSubmit({
      options,
      onSave,
      currentUri: "https://www.mypodbrowser.com/First%20Folder/",
      folders: [],
      name: "",
      setSeverity,
      setMessage,
      setAlertOpen,
      setFolderName,
      setDirtyForm,
      setDirtyNameField,
    });

    await handler(event);

    expect(createContainerAt).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    expect(setSeverity).not.toHaveBeenCalled();
    expect(setMessage).not.toHaveBeenCalled();
    expect(setAlertOpen).not.toHaveBeenCalled();
    expect(setFolderName).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(setDirtyForm).toHaveBeenCalledWith(true);
  });
});
