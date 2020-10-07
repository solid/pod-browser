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
import T from "prop-types";
import {
  ActionMenu,
  ActionMenuItem,
  Drawer,
} from "@inrupt/prism-react-components";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import AlertContext from "../../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../../src/contexts/confirmationDialogContext";

function handleConfirmation({
  confirmationOpen,
  setConfirmationOpen,
  setConfirmed,
  deleteContact,
  setTitle,
  setContent,
  setConfirmationSetup,
}) {
  return (confirmationSetup, confirmed) => {
    if (!confirmationOpen) return;
    if (confirmationSetup && !confirmed) return;

    setTitle("Delete Contact?");
    setContent(<p>This action cannot be undone</p>);
    setConfirmationSetup(true);

    if (confirmationSetup && confirmed) {
      deleteContact();
    }

    if (confirmationSetup && confirmed) {
      setConfirmed(false);
      setConfirmationOpen(false);
    }
  };
}

function handleDeleteContact({
  onDelete,
  onDeleteError,
  setAlertOpen,
  setMessage,
  setSeverity,
}) {
  return async () => {
    try {
      await onDelete();
      setSeverity("success");
      setMessage(`Contact was successfully deleted.`);
      setAlertOpen(true);
    } catch (err) {
      onDeleteError(err);
    }
  };
}

export default function ContactsDrawer({ open, onClose, onDelete }) {
  const actionMenuBem = ActionMenu.useBem();

  const { setAlertOpen, setMessage, setSeverity } = useContext(AlertContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);

  const {
    confirmed,
    open: confirmationOpen,
    setConfirmed,
    setContent,
    setOpen: setConfirmationOpen,
    setTitle,
  } = useContext(ConfirmationDialogContext);

  function onDeleteError(e) {
    setSeverity("error");
    setMessage(e.toString());
    setAlertOpen(true);
  }

  const deleteContact = handleDeleteContact({
    fetch,
    onDelete,
    onDeleteError,
    setAlertOpen,
    setMessage,
    setSeverity,
  });

  const onConfirmation = handleConfirmation({
    confirmationOpen,
    setConfirmationOpen,
    setConfirmed,
    deleteContact,
    setTitle,
    setContent,
    setConfirmationSetup,
  });

  useEffect(() => {
    onConfirmation(confirmationSetup, confirmed);
  }, [confirmationSetup, confirmed, onConfirmation]);

  return (
    <Drawer open={open} close={onClose}>
      <Accordion defaultExpanded square>
        <AccordionSummary expandIcon={<ExpandMore />}>Actions</AccordionSummary>
        <AccordionDetails>
          <ActionMenu>
            <ActionMenuItem>
              <button
                className={actionMenuBem("action-menu__trigger")}
                type="button"
                onClick={() => setConfirmationOpen(true)}
              >
                Delete
              </button>
            </ActionMenuItem>
          </ActionMenu>
        </AccordionDetails>
      </Accordion>
    </Drawer>
  );
}

ContactsDrawer.propTypes = {
  open: T.bool,
  onClose: T.func,
  onDelete: T.func,
};

ContactsDrawer.defaultProps = {
  open: false,
  onClose: () => {},
  onDelete: () => {},
};
