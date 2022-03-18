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
  openConfirmationDialog: false,
  customContentWrapper: false,
  setCustomContentWrapper: () => {},
  setConfirmed: () => {},
  setContent: () => {},
  setOpenConfirmationDialog: () => {},
  setTitle: () => {},
  title: "Confirmation",
  cancelText: "Cancel",
  confirmText: "Confirm",
  setCancelText: () => {},
  setConfirmText: () => {},
  closeDialog: () => {},
  omitCancelButton: false,
  setIsDangerousAction: () => {},
  isDangerousAction: false,
};
const ConfirmationDialogContext = createContext(
  defaultConfirmationDialogContext
);

export default ConfirmationDialogContext;

function ConfirmationDialogProvider({ children }) {
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [content, setContent] = useState(null);
  const [customContentWrapper, setCustomContentWrapper] = useState(false);
  const [title, setTitle] = useState("Confirmation");
  const [cancelText, setCancelText] = useState("Cancel");
  const [confirmText, setConfirmText] = useState("Confirm");
  const [confirmed, setConfirmed] = useState(null);
  const [omitCancelButton, setOmitCancelButton] = useState(false);
  const [isDangerousAction, setIsDangerousAction] = useState(false);

  const closeDialog = () => {
    setConfirmed(null);
    setOpenConfirmationDialog(false);
    setContent(null);
    setTitle(null);
    setConfirmText(null);
  };

  return (
    <ConfirmationDialogContext.Provider
      value={{
        content,
        confirmed,
        openConfirmationDialog,
        customContentWrapper,
        setContent,
        setConfirmed,
        setOpenConfirmationDialog,
        setTitle,
        setCustomContentWrapper,
        title,
        cancelText,
        setCancelText,
        confirmText,
        setConfirmText,
        closeDialog,
        omitCancelButton,
        setOmitCancelButton,
        isDangerousAction,
        setIsDangerousAction,
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
