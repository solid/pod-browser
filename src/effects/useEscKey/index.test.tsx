import { ESC_KEYCODE, handleEscKeydown } from "./index";

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
});
