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

import PodList from "./index";

describe("Pod list", () => {
  test("Renders null if there are no pod iris", () => {
    const iris = undefined;
    const tree = shallow(<PodList podIris={iris} />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Renders a container if there is one pod iri", () => {
    const iris = ["https://mypod.myhost.com"];
    const tree = shallow(<PodList podIris={iris} />);

    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Renders a table if there are multiple pod iris", () => {
    const iris = [
      "https://mypod.myhost.com",
      "https://myotherpod.myotherhost.com",
    ];

    const tree = shallow(<PodList podIris={iris} />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});
