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
import useEscKey, { ESC_KEYCODE, handleEscKeydown } from "./index";

jest.mock("react");

describe("handleEscKeydown", () => {
  test("it returns a function that calls the callback when esc is pressed", () => {
    const callback = jest.fn();
    const handler = handleEscKeydown(callback);
    const evnt: KeyboardEvent = { keyCode: ESC_KEYCODE };

    handler(evnt);
    expect(callback).toHaveBeenCalledWith(evnt);
  });

  test("it causes no operation when other keys are pressed", () => {
    const callback = jest.fn();
    const handler = handleEscKeydown(callback);
    const evnt: KeyboardEvent = { keyCode: 13 };

    handler(evnt);
    expect(callback).not.toHaveBeenCalledWith(evnt);
  });

  test("it causes no operation when no keyCode is present", () => {
    const callback = jest.fn();
    const handler = handleEscKeydown(callback);
    const evnt = {};

    handler(evnt as KeyboardEvent);
    expect(callback).not.toHaveBeenCalledWith(evnt);
  });
});

describe("useEscKey", () => {
  test("it registers the event to trigger the esc handler", () => {
    jest
      .spyOn(ReactFns, "useEffect")
      .mockImplementationOnce((callback) => callback());
    jest.spyOn(document.body, "addEventListener");
    jest.spyOn(document.body, "removeEventListener");

    const cleanupFn = useEscKey(jest.fn());
    cleanupFn();

    expect(document.body.addEventListener).toHaveBeenCalled();
    expect(document.body.removeEventListener).toHaveBeenCalled();
  });
});
