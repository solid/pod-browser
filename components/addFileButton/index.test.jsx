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
import * as SolidClientFns from "@inrupt/solid-client";
import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PodLocationProvider } from "../../src/contexts/podLocationContext";
import mockSession from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import AlertContext from "../../src/contexts/alertContext";
import AddFileButton, {
  DUPLICATE_DIALOG_ID,
  handleConfirmation,
  handleFileSelect,
  handleSaveResource,
  handleUploadedFile,
} from "./index";

const currentUri = "https://www.mypodbrowser.com/";
const file = new File(["file contents"], "myfile.txt", {
  type: "text/plain",
});

describe("AddFileButton", () => {
  const newFilePath = currentUri + file.name;

  const session = mockSession();
  const SessionProvider = mockSessionContextProvider(session);
  let onSave;
  let setAlertOpen;
  let renderResult;

  beforeEach(() => {
    setAlertOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    onSave = jest.fn();

    jest
      .spyOn(SolidClientFns, "overwriteFile")
      .mockResolvedValue(SolidClientFns.mockSolidDatasetFrom(newFilePath));

    renderResult = render(
      <AlertContext.Provider
        value={{
          setAlertOpen,
          setMessage,
          setSeverity,
        }}
      >
        <PodLocationProvider currentUri={currentUri}>
          <SessionProvider>
            <AddFileButton onSave={onSave} />
          </SessionProvider>
        </PodLocationProvider>
      </AlertContext.Provider>
    );
  });

  test("Renders an add file button", () => {
    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  test("Uploads a file", async () => {
    await act(async () => {
      userEvent.click(renderResult.container.querySelector("input"));
      userEvent.upload(renderResult.container.querySelector("input"), file);
    });

    expect(SolidClientFns.overwriteFile).toHaveBeenCalledWith(
      newFilePath,
      file,
      {
        type: file.type,
        fetch: session.fetch,
      }
    );

    expect(onSave).toHaveBeenCalled();
    expect(setAlertOpen).toHaveBeenCalled();
  });
});

describe("handleSaveResource", () => {
  let fetch;
  let onSave;
  let setIsUploading;
  let setAlertOpen;
  let setMessage;
  let setSeverity;
  let handler;

  beforeEach(() => {
    fetch = jest.fn();
    onSave = jest.fn();
    setIsUploading = jest.fn();
    setAlertOpen = jest.fn();
    setMessage = jest.fn();
    setSeverity = jest.fn();

    handler = handleSaveResource({
      fetch,
      currentUri,
      onSave,
      setIsUploading,
      setAlertOpen,
      setMessage,
      setSeverity,
    });
  });

  test("it returns a handler that saves the resource and gives feedback to user", async () => {
    const fileName = "myfile with space.txt";
    const fileWithSpace = new File(["test"], fileName, {
      type: "text/plain",
    });
    const newFilePath = currentUri + encodeURIComponent(fileName);

    jest
      .spyOn(SolidClientFns, "overwriteFile")
      .mockResolvedValue(SolidClientFns.mockSolidDatasetFrom(newFilePath));

    await handler(fileWithSpace);

    expect(SolidClientFns.overwriteFile).toHaveBeenCalledWith(
      newFilePath,
      fileWithSpace,
      {
        type: fileWithSpace.type,
        fetch,
      }
    );

    expect(setSeverity).toHaveBeenCalledWith("success");
    expect(setMessage).toHaveBeenCalledWith(
      `Your file has been uploaded as myfile with space.txt`
    );
    expect(setAlertOpen).toHaveBeenCalledWith(true);
  });

  it("handles resources that starts with a dash", async () => {
    const fileName = "-starting-with-a-dash-";
    const fileWithDash = new File(["test"], fileName, {
      type: "text/plain",
    });
    const newFilePathWithoutStartingDash =
      currentUri + encodeURIComponent(fileName.substr(1));

    jest
      .spyOn(SolidClientFns, "overwriteFile")
      .mockResolvedValue(
        SolidClientFns.mockSolidDatasetFrom(newFilePathWithoutStartingDash)
      );

    await handler(fileWithDash);

    expect(SolidClientFns.overwriteFile).toHaveBeenCalledWith(
      newFilePathWithoutStartingDash,
      fileWithDash,
      {
        type: fileWithDash.type,
        fetch,
      }
    );
  });
});

describe("handleFileSelect", () => {
  const setIsUploading = jest.fn();
  const setFile = jest.fn();
  const saveUploadedFile = jest.fn();
  const setSeverity = jest.fn();
  const setMessage = jest.fn();
  const setAlertOpen = jest.fn();
  const resourceList = [
    { iri: "https://www.mypodbrowser.com/", name: "somefile.pdf" },
  ];

  const handler = handleFileSelect({
    currentUri,
    setIsUploading,
    setFile,
    saveUploadedFile,
    setSeverity,
    setMessage,
    setAlertOpen,
    resourceList,
  });

  test("it returns a handler that uploads a file", async () => {
    await handler({ target: { files: [file] } });

    expect(setIsUploading).toHaveBeenCalled();
    expect(setFile).toHaveBeenCalled();
    expect(saveUploadedFile).toHaveBeenCalled();
  });

  test("it returns a handler that returns an error if not successful", async () => {
    await handler();

    expect(setSeverity).toHaveBeenCalledWith("error");
    expect(setMessage).toHaveBeenCalled();
    expect(setAlertOpen).toHaveBeenCalled();
  });
});

describe("handleUploadedFile", () => {
  test("it returns a handler that triggers the confirmation logic in case the file already exists", () => {
    const existingFile = true;

    const saveResource = jest.fn();
    const setIsUploading = jest.fn();
    const setOpen = jest.fn();
    const setTitle = jest.fn();
    const setContent = jest.fn();
    const setConfirmationSetup = jest.fn();

    const handler = handleUploadedFile({
      setOpen,
      setTitle,
      setContent,
      setConfirmationSetup,
      setIsUploading,
      saveResource,
    });

    handler(file, existingFile);

    expect(setIsUploading).toHaveBeenCalled();
    expect(setOpen).toHaveBeenCalled();
    expect(setContent).toHaveBeenCalled();
    expect(setTitle).toHaveBeenCalled();
    expect(setConfirmationSetup).toHaveBeenCalled();
  });
});

describe("handleConfirmation", () => {
  const setOpen = jest.fn();
  const saveResource = jest.fn();
  const setConfirmed = jest.fn();
  const setConfirmationSetup = jest.fn();

  const handler = handleConfirmation({
    setOpen,
    setConfirmed,
    saveResource,
    setConfirmationSetup,
  });

  test("it returns a handler that saves the file when user confirms dialog", () => {
    handler(true, true, file, DUPLICATE_DIALOG_ID);

    expect(setOpen).toHaveBeenCalled();
    expect(saveResource).toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalled();
    expect(setConfirmationSetup).toHaveBeenCalled();
  });
  test("it returns a handler that exits when user cancels the operation", () => {
    handler(true, false, file, DUPLICATE_DIALOG_ID);

    expect(saveResource).not.toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
  });
});
