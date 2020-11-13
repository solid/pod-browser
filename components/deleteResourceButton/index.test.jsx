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
import { mountToJson } from "enzyme-to-json";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import DeleteResourceButton, { createDeleteHandler } from "./index";
import usePoliciesContainer from "../../src/hooks/usePoliciesContainer";
import {
  getResource,
  deleteResource,
} from "../../src/solidClientHelpers/resource";
import { WithTheme } from "../../__testUtils/mountWithTheme";
import defaultTheme from "../../src/theme";
import useResourceInfo from "../../src/hooks/useResourceInfo";

jest.mock("@inrupt/solid-client");
jest.mock("../../src/hooks/useResourceInfo");
jest.mock("../../src/hooks/usePoliciesContainer");
jest.mock("../../src/solidClientHelpers/resource");

const name = "Resource";
const resourceIri = "iri";

describe("Delete resource button", () => {
  const policiesContainerUrl = "https://example.org/policies";
  const mockPoliciesContainer = mockSolidDatasetFrom(policiesContainerUrl);
  usePoliciesContainer.mockImplementation(() => ({
    policiesContainer: mockPoliciesContainer,
  }));
  useResourceInfo.mockReturnValue("resource info");
  describe("it hooks works successfully", () => {
    let tree;
    beforeEach(() => {
      tree = mount(
        <WithTheme theme={defaultTheme}>
          <DeleteResourceButton
            onDelete={jest.fn()}
            resourceIri={resourceIri}
            name={name}
          />
        </WithTheme>
      );
    });

    it("renders a delete resource button", () => {
      expect(mountToJson(tree)).toMatchSnapshot();
    });
  });

  describe("createDeleteHandler", () => {
    let onDelete;
    let handleDelete;
    const policyUrl = null;
    const fetch = jest.fn();
    const mockDataset = mockSolidDatasetFrom("https://example.org/example.txt");

    beforeEach(async () => {
      getResource.mockResolvedValue({
        dataset: mockDataset,
        iri: "https://example.org/example.txt",
      });
      onDelete = jest.fn();
      handleDelete = createDeleteHandler(
        resourceIri,
        policyUrl,
        onDelete,
        fetch
      );
      await handleDelete();
    });

    it("triggers deleteResource", async () => {
      expect(deleteResource).toHaveBeenCalled();
    });

    it("triggers onDelete", () => expect(onDelete).toHaveBeenCalledWith());
  });
});
