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

import React, { createContext, useState } from "react";
import T from "prop-types";

export const defaultConfirmationDialogContext = {
  confirmed: false,
  content: null,
  open: false,
  setConfirmed: () => {},
  setContent: () => {},
  setOpen: () => {},
  setTitle: () => {},
  title: "Confirmation",
};
const ConfirmationDialogContext = createContext(
  defaultConfirmationDialogContext
);

export default ConfirmationDialogContext;

function ConfirmationDialogProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [title, setTitle] = useState("Confirmation");
  const [confirmed, setConfirmed] = useState(false);

  return (
    <ConfirmationDialogContext.Provider
      value={{
        content,
        confirmed,
        open,
        setContent,
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

ConfirmationDialogProvider.propTypes = {
  children: T.node,
};

ConfirmationDialogProvider.defaultProps = {
  children: null,
};

export { ConfirmationDialogProvider };
