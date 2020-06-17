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

import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import Details from "./index";

jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
  session: { webId: "webId" },
}));

describe("Details", () => {
  describe("when given a container", () => {
    test("it renders a ContainerDetails component", () => {
      const name = "container";
      const types = ["BasicContainer"];
      const iri = "iri";
      const acl = {
        webId: {
          read: true,
          write: true,
          append: true,
          control: true,
        },
      };

      const tree = shallow(
        <Details name={name} types={types} iri={iri} acl={acl} />
      );

      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });

  describe("when given a resource", () => {
    test("it renders a ResourceDetails component", () => {
      const name = "container";
      const types = ["NotAContainer"];
      const iri = "iri";
      const acl = {
        webId: {
          read: true,
          write: true,
          append: true,
          control: true,
        },
      };

      const tree = shallow(
        <Details name={name} types={types} iri={iri} acl={acl} />
      );

      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });

  describe("when given an unknown resource", () => {
    test("it renders an Unknown resource message", () => {
      const name = "container";
      const types = ["Unknown"];
      const iri = "iri";
      const acl = {
        webId: {
          read: true,
          write: true,
          append: true,
          control: true,
        },
      };

      const tree = shallow(
        <Details name={name} types={types} iri={iri} acl={acl} />
      );

      expect(shallowToJson(tree)).toMatchSnapshot();
    });
  });
});
