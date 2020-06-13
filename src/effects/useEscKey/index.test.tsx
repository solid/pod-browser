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
