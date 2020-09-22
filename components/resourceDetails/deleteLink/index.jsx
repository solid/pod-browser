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
import { deleteFile } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import AlertContext from "../../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../../src/contexts/confirmationDialogContext";

const TESTCAFE_ID_DELETE_BUTTON = "delete-button";

export function handleConfirmation({
  setOpen,
  setConfirmed,
  deleteResource,
  setTitle,
  setContent,
  setConfirmationSetup,
}) {
  return (confirmationSetup, confirmed, name) => {
    if (confirmationSetup && !confirmed) return;

    setTitle("Confirm Delete");
    setContent(
      <p>{`Are you sure you wish to delete ${decodeURIComponent(name)}?`}</p>
    );
    setConfirmationSetup(true);

    if (confirmationSetup && confirmed) {
      setOpen(false);
      setConfirmed(false);
      deleteResource();
    }
  };
}

export function handleDeleteResource({
  fetch,
  name,
  onDelete,
  onDeleteError,
  resourceIri,
  setAlertOpen,
  setMessage,
  setSeverity,
}) {
  return async () => {
    try {
      await deleteFile(resourceIri, { fetch });
      onDelete();
      setSeverity("success");
      setMessage(`${decodeURIComponent(name)} was successfully deleted.`);
      setAlertOpen(true);
    } catch (err) {
      onDeleteError(err);
    }
  };
}
/* eslint react/jsx-props-no-spreading: 0 */
/* eslint react/prop-types: 0 */
export default React.forwardRef(
  ({ name, resourceIri, onDelete, onDeleteError, ...linkProps }, ref) => {
    const { session } = useSession();
    const { setAlertOpen, setMessage, setSeverity } = useContext(AlertContext);
    const { fetch } = session;
    const [confirmationSetup, setConfirmationSetup] = useState(false);

    const {
      confirmed,
      setConfirmed,
      setContent,
      setOpen,
      setTitle,
    } = useContext(ConfirmationDialogContext);

    const deleteResource = handleDeleteResource({
      name,
      resourceIri,
      fetch,
      onDelete,
      onDeleteError,
      setAlertOpen,
      setMessage,
      setSeverity,
    });

    const onConfirmation = handleConfirmation({
      setOpen,
      setConfirmed,
      deleteResource,
      setTitle,
      setContent,
      setConfirmationSetup,
    });

    useEffect(() => {
      onConfirmation(confirmationSetup, confirmed, name);
    }, [confirmationSetup, confirmed, onConfirmation, name]);

    /* eslint jsx-a11y/anchor-has-content: 0 */
    return (
      <a
        href="#delete"
        data-testid={TESTCAFE_ID_DELETE_BUTTON}
        {...linkProps}
        ref={ref}
        onClick={() => setOpen(true)}
      />
    );
  }
);
