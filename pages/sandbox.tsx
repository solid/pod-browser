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

import React, {
  Dispatch,
  SetStateAction,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import ConfirmationDialogContext from "../src/contexts/confirmationDialogContext";

export default function Sandbox(): ReactElement {
  const { setTitle, setOpen, setContent, confirmed, setConfirmed } = useContext(
    ConfirmationDialogContext
  );

  const setContentWithType = setContent as Dispatch<SetStateAction<ReactNode>>;
  const setTitleWithType = setTitle as Dispatch<SetStateAction<string>>;

  useEffect(() => {
    setTitleWithType("my title");
    setContentWithType(<p>This is my content</p>);

    if (confirmed) {
      setOpen(false);
      setConfirmed(false);
      /* eslint-disable no-console */
      console.log("confirmed");
    }
  }, [setTitleWithType, setContentWithType, setOpen, confirmed, setConfirmed]);

  return (
    <button type="button" onClick={() => setOpen(true)}>
      Hello World
    </button>
  );
}
