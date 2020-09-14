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

import { mount } from "enzyme";
import { mountToJson } from "enzyme-to-json";
import { act } from "react-dom/test-utils";
import { createContainerAt } from "@inrupt/solid-client";
import { PodLocationProvider } from "../../src/contexts/podLocationContext";
import SessionContext from "../../src/contexts/sessionContext";
import AlertContext from "../../src/contexts/alertContext";
import AddFolderFlyout, {
  determineFinalUrl,
  handleFolderSubmit,
  handleCreateFolderClick,
} from "./index";

jest.mock("@inrupt/solid-client");

describe("AddFolderFlyout", () => {
  const currentUri = "https://www.mypodbrowser.com/";
  const folders = [
    { iri: "https://www.mypodbrowser.com/SomeFolder", name: "SomeFolder" },
  ];

  const session = {
    logout: jest.fn(),
  };

  const setAlertOpen = jest.fn();
  const setMessage = jest.fn();
  const setSeverity = jest.fn();
  const onSave = jest.fn();

  const tree = mount(
    <AlertContext.Provider
      value={{
        setAlertOpen,
        setMessage,
        setSeverity,
      }}
    >
      <PodLocationProvider currentUri={currentUri}>
        <SessionContext.Provider value={{ session }}>
          <AddFolderFlyout onSave={onSave} folders={folders} />
        </SessionContext.Provider>
      </PodLocationProvider>
    </AlertContext.Provider>
  );

  test("Renders an Add Folder button", () => {
    expect(mountToJson(tree)).toMatchSnapshot();
  });

  test("Displays a flyout on click", async () => {
    await act(async () => {
      tree.find("button[children='Create Folder']").simulate("click");
    });

    expect(tree.html()).toContain("add-folder-flyout");
  });
});

describe("determineFinalUrl", () => {
  test("it returns a URL for a new folder with apended integer if folder already exists", () => {
    const folders = [
      { iri: "https://www.mypodbrowser.com/SomeFolder", name: "SomeFolder" },
    ];
    const currentUri = "https://www.mypodbrowser.com/";
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
  test("it returns a handler that creates a new folder at a given location", async () => {
    const fetch = jest.fn();
    const options = { fetch };
    const onSave = jest.fn();
    const currentUri = "https://www.mypodbrowser.com/";
    const folders = [
      { iri: "https://www.mypodbrowser.com/SomeFolder", name: "SomeFolder" },
    ];
    const name = "SomeFolder";
    const setSeverity = jest.fn();
    const setMessage = jest.fn();
    const setAlertOpen = jest.fn();

    const handler = handleFolderSubmit({
      options,
      onSave,
      currentUri,
      folders,
      name,
      setSeverity,
      setMessage,
      setAlertOpen,
    });

    await handler();

    expect(createContainerAt).toHaveBeenCalledWith(
      "https://www.mypodbrowser.com/SomeFolder(1)",
      options
    );

    expect(onSave).toHaveBeenCalled();
    expect(setSeverity).toHaveBeenCalledWith("success");
    expect(setMessage).toHaveBeenCalled();
    expect(setAlertOpen).toHaveBeenCalledWith(true);
  });
  test("it returns a handler that creates a new folder within a folder which has spaces in its name", async () => {
    const fetch = jest.fn();
    const options = { fetch };
    const onSave = jest.fn();
    const currentUri = "https://www.mypodbrowser.com/First Folder/";
    const folders = [];
    const name = "Second Folder";
    const setSeverity = jest.fn();
    const setMessage = jest.fn();
    const setAlertOpen = jest.fn();

    const handler = handleFolderSubmit({
      options,
      onSave,
      currentUri,
      folders,
      name,
      setSeverity,
      setMessage,
      setAlertOpen,
    });

    await handler();

    expect(createContainerAt).toHaveBeenCalledWith(
      "https://www.mypodbrowser.com/First%20Folder/Second%20Folder",
      options
    );

    expect(onSave).toHaveBeenCalled();
    expect(setSeverity).toHaveBeenCalledWith("success");
    expect(setMessage).toHaveBeenCalled();
    expect(setAlertOpen).toHaveBeenCalledWith(true);
  });
});
describe("handleCreateFolderClick", () => {
  test("it returns a handler that submits the current folder and calls a function to clear the current folder name from state", () => {
    const setFolderName = jest.fn();
    const onSubmit = jest.fn();

    const handler = handleCreateFolderClick({
      setFolderName,
      onSubmit,
    });

    handler(setFolderName, onSubmit);

    expect(setFolderName).toHaveBeenCalledWith("");
    expect(onSubmit).toHaveBeenCalled();
  });
});
