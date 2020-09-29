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

import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import React from "react";
import * as stringHelpers from "../../src/stringHelpers";
import DownloadLink, { downloadResource, forceDownload } from "./index";

describe("forceDownload", () => {
  test("it creates an anchor with an object url and clicks it", () => {
    const setAttributeMock = jest.fn();
    const clickMock = jest.fn();
    const revokeObjectURLMock = jest.fn();
    const appendChildMock = jest.fn();
    const removeChildMock = jest.fn();
    const mockAnchor = {
      style: { display: "block" },
      setAttribute: setAttributeMock,
      click: clickMock,
    };
    const file = new Blob(["file"]);

    window.URL = {
      createObjectURL: () => "object-url",
      revokeObjectURL: revokeObjectURLMock,
    };

    jest.spyOn(document, "createElement").mockReturnValue(mockAnchor);
    jest
      .spyOn(document.body, "appendChild")
      .mockImplementationOnce(appendChildMock);
    jest
      .spyOn(document.body, "removeChild")
      .mockImplementationOnce(removeChildMock);

    forceDownload("filename", file);

    expect(mockAnchor.style.display).toEqual("none");
    expect(mockAnchor.href).toEqual("object-url");
    expect(setAttributeMock).toHaveBeenCalledWith("download", "filename");
    expect(appendChildMock).toHaveBeenCalledWith(mockAnchor);
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith("object-url");
    expect(removeChildMock).toHaveBeenCalledWith(mockAnchor);
  });
});

describe("downloadResource", () => {
  test("it returns a handler to download the resource", () => {
    const iri = "http://example.com/resource";
    const blobMock = jest.fn();
    const responseMock = { blob: blobMock };
    const fetchMock = jest.fn().mockResolvedValue(responseMock);
    const handler = downloadResource(iri, fetchMock);

    blobMock.mockResolvedValue("file");

    jest
      .spyOn(stringHelpers, "parseUrl")
      .mockReturnValue({ pathname: "/resource" });

    handler();

    expect(fetchMock).toHaveBeenCalledWith(iri);
  });
});

describe("DownloadLink", () => {
  test("returns null if resource is a container", () => {
    const type = "container";
    const iri = "http://example.com/resource";
    const tree = shallow(<DownloadLink type={type} iri={iri} />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("returns a download button if resource is not a container", () => {
    const type = "foo";
    const iri = "http://example.com/resource";
    const tree = shallow(<DownloadLink type={type} iri={iri} />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});
