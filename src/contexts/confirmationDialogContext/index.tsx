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

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  ReactElement,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

interface IConfirmationDialogContext {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | any;
  content: ReactNode;
  setContent: Dispatch<SetStateAction<ReactNode>>;
  confirmed: boolean;
  setConfirmed: Dispatch<SetStateAction<boolean>>;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
}

const ConfirmationDialogContext = createContext<IConfirmationDialogContext>({
  confirmed: false,
  content: null,
  open: false,
  setConfirmed: () => {},
  setContent: () => {},
  setOpen: () => {},
  setTitle: () => {},
  title: "Confirmation",
});

export default ConfirmationDialogContext;

interface IConfirmationDialogProvider {
  children: ReactNode;
}

export function ConfirmationDialogProvider({
  children,
}: IConfirmationDialogProvider): ReactElement {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [title, setTitle] = useState("Confirmation");
  const [confirmed, setConfirmed] = useState(false);

  const setContentWithType = setContent as Dispatch<SetStateAction<ReactNode>>;

  return (
    <ConfirmationDialogContext.Provider
      value={{
        content,
        confirmed,
        open,
        setContent: setContentWithType,
        setConfirmed,
        setOpen,
        setTitle,
        title,
      }}
    >
      {children}
    </ConfirmationDialogContext.Provider>
  );
}
