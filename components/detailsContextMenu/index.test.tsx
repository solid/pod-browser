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

import { shallow, mount } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import * as ReactFns from "react";
import DetailsContextMenu from "./index";

describe("Container view", () => {
  test("Renders a the drawer", () => {
    const tree = shallow(<DetailsContextMenu />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Renders closes the drawer when the close button is clicked", () => {
    const setMenuOpen = jest.fn();

    jest.spyOn(ReactFns, "useContext").mockImplementationOnce(() => {
      return { setMenuOpen, menuOpen: true };
    });

    const tree = mount(<DetailsContextMenu />);
    tree.find("WithStyles(ForwardRef(IconButton))").simulate("click");

    expect(setMenuOpen).toHaveBeenCalledWith(null);
  });
});
