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

import DeleteResourceLink, { createDeleteHandler } from "./index";
import mockAccessControl from "../../__testUtils/mockAccessControl";
import useAccessControl from "../../src/hooks/useAccessControl";
import useResourceInfo from "../../src/hooks/useResourceInfo";

jest.mock("@inrupt/solid-client");
jest.mock("../../src/hooks/useAccessControl");
jest.mock("../../src/hooks/useResourceInfo");

const name = "Resource";
const resourceIri = "iri";

describe("Delete resource link", () => {
  const resourceInfo = "data";

  beforeEach(() => {
    useResourceInfo.mockImplementation(() => ({ data: resourceInfo }));
    useAccessControl.mockImplementation(() => ({
      accessControl: mockAccessControl(),
    }));
  });

  describe("it hooks works successfully", () => {
    let tree;
    beforeEach(() => {
      tree = shallow(
        <DeleteResourceLink
          onDelete={jest.fn()}
          resourceIri={resourceIri}
          name={name}
        />
      );
    });

    it("renders a delete resource link", () =>
      expect(shallowToJson(tree)).toMatchSnapshot());
    it("calls useResourceInfo", () =>
      expect(useResourceInfo).toHaveBeenCalledWith(resourceIri));
    it("calls useAccessControl", () =>
      expect(useAccessControl).toHaveBeenCalledWith(resourceInfo));
  });

  it("handles if useResourceInfo fails", () => {
    useResourceInfo.mockImplementation(() => ({ error: "error" }));

    const tree = shallow(
      <DeleteResourceLink
        onDelete={jest.fn()}
        resourceIri={resourceIri}
        name={name}
      />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  it("handles if useAccessControl fails", () => {
    useAccessControl.mockImplementation(() => ({ error: "error" }));

    const tree = shallow(
      <DeleteResourceLink
        onDelete={jest.fn()}
        resourceIri={resourceIri}
        name={name}
      />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("createDeleteHandler", () => {
  let accessControl;
  let onDelete;
  let handleDelete;

  beforeEach(async () => {
    accessControl = mockAccessControl();
    onDelete = jest.fn();
    handleDelete = createDeleteHandler(accessControl, onDelete);
    await handleDelete();
  });
  it("triggers accessControl.deleteFile", () =>
    expect(accessControl.deleteFile).toHaveBeenCalledWith());
  it("triggers onDelete", () => expect(onDelete).toHaveBeenCalledWith());
});
