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
import * as RouterFns from "next/router";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { mountToJson } from "../../../__testUtils/mountWithTheme";
import DetailsMenuContext, { DetailsMenuProvider } from "./index";

const { useContext } = ReactFns;

function ChildComponent(): ReactFns.ReactElement {
  const { menuOpen, setMenuOpen } = useContext(DetailsMenuContext);

  setMenuOpen(true);

  return (
    <div>
      <div className="menuOpen">{menuOpen ? "true" : "false"}</div>
    </div>
  );
}

describe("DetailsMenuContext", () => {
  test("it has context data", () => {
    const component = shallow(
      <DetailsMenuProvider>
        <ChildComponent />
      </DetailsMenuProvider>
    );

    expect(shallowToJson(component)).toMatchSnapshot();
  });

  test("it sets the parameters from the router", () => {
    const action = "details";
    const iri = "iri";
    const setMenuOpen = jest.fn();

    jest
      .spyOn(RouterFns, "useRouter")
      .mockReturnValueOnce({ query: { action, iri } });

    jest.spyOn(ReactFns, "useState").mockReturnValueOnce([false, setMenuOpen]);

    mountToJson(
      <DetailsMenuProvider>
        <ChildComponent />
      </DetailsMenuProvider>
    );

    expect(setMenuOpen).toHaveBeenCalledWith(true);
  });
});
