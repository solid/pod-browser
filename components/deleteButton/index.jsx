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

import React, { useContext, useEffect, useState } from "react";
import clsx from "clsx";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import T from "prop-types";
import AlertContext from "../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../src/contexts/confirmationDialogContext";
import styles from "./styles";

const TESTCAFE_ID_DELETE_BUTTON = "delete-button";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export function handleConfirmation({
  dialogId,
  open,
  setOpen,
  setConfirmed,
  deleteResource,
  setTitle,
  setContent,
  setConfirmationSetup,
}) {
  return (confirmationSetup, confirmed, title, content) => {
    if (open !== dialogId) return;
    if (confirmationSetup && confirmed === null) return;
    setTitle(title);
    setContent(<p>{content}</p>);
    setConfirmationSetup(true);

    if (confirmationSetup && confirmed) {
      deleteResource();
    }

    if (confirmationSetup && confirmed !== null) {
      setConfirmed(null);
      setOpen(null);
      setConfirmationSetup(false);
    }
  };
}

export function handleDeleteResource({
  onDelete,
  onDeleteError,
  setAlertOpen,
  setMessage,
  setSeverity,
  successMessage,
}) {
  return async () => {
    try {
      await onDelete();
      setSeverity("success");
      setMessage(successMessage);
      setAlertOpen(true);
    } catch (err) {
      onDeleteError(err);
    }
  };
}
/* eslint react/jsx-props-no-spreading: 0 */
export default function DeleteButton({
  confirmationTitle,
  confirmationContent,
  dialogId,
  onDelete,
  successMessage,
  ...buttonProps
}) {
  const bem = useBem(useStyles());
  const { setAlertOpen, setMessage, setSeverity } = useContext(AlertContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);
  const {
    confirmed,
    open,
    setConfirmed,
    setContent,
    setOpen,
    setTitle,
  } = useContext(ConfirmationDialogContext);

  function onDeleteError(e) {
    setSeverity("error");
    setMessage(e.toString());
    setAlertOpen(true);
  }

  const deleteResource = handleDeleteResource({
    onDelete,
    onDeleteError,
    setAlertOpen,
    setMessage,
    setSeverity,
    successMessage,
  });

  const onConfirmation = handleConfirmation({
    dialogId,
    open,
    setOpen,
    setConfirmed,
    deleteResource,
    setTitle,
    setContent,
    setConfirmationSetup,
  });

  useEffect(() => {
    onConfirmation(
      confirmationSetup,
      confirmed,
      confirmationTitle,
      confirmationContent
    );
  }, [
    confirmationSetup,
    confirmed,
    onConfirmation,
    confirmationTitle,
    confirmationContent,
  ]);

  return (
    <button
      type="button"
      className={clsx(bem("button", "action"))}
      data-testid={TESTCAFE_ID_DELETE_BUTTON}
      {...buttonProps}
      onClick={() => setOpen(dialogId)}
    />
  );
}

DeleteButton.propTypes = {
  confirmationTitle: T.string.isRequired,
  confirmationContent: T.string.isRequired,
  dialogId: T.string.isRequired,
  onDelete: T.func.isRequired,
  successMessage: T.string.isRequired,
};
