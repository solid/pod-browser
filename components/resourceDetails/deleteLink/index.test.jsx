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
import { deleteFile } from "@inrupt/solid-client";
import { wait } from "@testing-library/react";

import DeleteLink from "./index";

jest.mock("@inrupt/solid-client");

describe("Delete link", () => {
  test("it renders a delete link", () => {
    const resourceIri = "https://mypod.com/some-resource";

    const tree = shallow(
      <DeleteLink
        onDelete={jest.fn()}
        onDeleteError={jest.fn()}
        resourceIri={resourceIri}
      />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  it("calls deleteFile on click", () => {
    const resourceIri = "https://mypod.com/some-resource";

    const tree = shallow(
      <DeleteLink
        onDelete={jest.fn()}
        onDeleteError={jest.fn()}
        resourceIri={resourceIri}
      />
    );

    tree.find("a").simulate("click", { preventDefault: () => {} });
    expect(deleteFile).toHaveBeenCalled();
  });

  it("calls onDelete after successful delete", async () => {
    deleteFile.mockResolvedValue();

    const resourceIri = "https://mypod.com/some-resource";
    const onDelete = jest.fn();

    const tree = shallow(
      <DeleteLink
        onDelete={onDelete}
        onDeleteError={jest.fn()}
        resourceIri={resourceIri}
      />
    );

    tree.find("a").simulate("click", { preventDefault: () => {} });

    await wait(() => expect(onDelete).toHaveBeenCalled());
  });

  it("calls onDeleteError after failed delete", async () => {
    const error = new Error("Bad");
    deleteFile.mockRejectedValue(error);

    const resourceIri = "https://mypod.com/some-resource";
    const onDeleteError = jest.fn();

    const tree = shallow(
      <DeleteLink
        onDelete={jest.fn()}
        onDeleteError={onDeleteError}
        resourceIri={resourceIri}
      />
    );

    tree.find("a").simulate("click", { preventDefault: () => {} });

    await wait(() => expect(onDeleteError).toHaveBeenCalledWith(error));
  });
});
