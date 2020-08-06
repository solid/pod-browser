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
import { saveFileInContainer } from "@inrupt/solid-client";

import { PodLocationProvider } from "../../src/contexts/podLocationContext";
import SessionContext from "../../src/contexts/sessionContext";
import AlertContext from "../../src/contexts/alertContext";

import AddFileButton from "./index";

jest.mock("@inrupt/solid-client");

describe("AddFileButton", () => {
  test("Renders an add file button", () => {
    const session = {
      logout: jest.fn(),
    };

    const tree = mount(
      <PodLocationProvider currentUri="https://www.mypodbrowser.com">
        <SessionContext.Provider value={{ session }}>
          <AddFileButton />
        </SessionContext.Provider>
      </PodLocationProvider>
    );

    expect(mountToJson(tree)).toMatchSnapshot();
  });

  test("Uploads a file", async () => {
    const fileContents = "file contents";

    const file = new Blob([fileContents], {
      type: "text/plain",
      name: "myfile.txt",
    });

    const currentUri = "https://www.mypodbrowser.com";

    const session = {
      logout: jest.fn(),
    };

    const setAlertOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();

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
            <AddFileButton />
          </SessionContext.Provider>
        </PodLocationProvider>
      </AlertContext.Provider>
    );

    await act(async () => {
      tree.find("input").simulate("change", { target: { files: [file] } });
    });

    // await for promises to resolve
    await Promise.resolve();

    expect(saveFileInContainer).toHaveBeenCalledWith(currentUri, file, {
      fetch: session.fetch,
      slug: file.name,
    });
  });
});
