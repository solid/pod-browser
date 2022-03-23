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

import React from "react";
import { makeStyles } from "@material-ui/styles";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  createStyles,
  DialogContentText,
} from "@material-ui/core";
import { Button } from "@inrupt/prism-react-components";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_CONFIRM_BUTTON = "confirm-button";
export const TESTCAFE_ID_CONFIRMATION_CANCEL_BUTTON =
  "confirmation-cancel-button";
export const TESTCAFE_ID_CONFIRMATION_DIALOG = "confirmation-dialog";
export const TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE =
  "confirmation-dialog-title";
export const TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT =
  "confirmation-dialog-content";

export default function ConfirmationDialogNew(
  openConfirmationDialog,
  title,
  content,
  customContentWrapper,
  cancelText,
  confirmText,
  omitCancelButton,
  isDangerousAction,
  onConfirm,
  onCancel
) {
  const classes = useStyles();

  return (
    <Dialog
      classes={{ paperWidthFalse: classes.dialog }}
      data-testid={TESTCAFE_ID_CONFIRMATION_DIALOG}
      maxWidth={false}
      aria-labelledby="confirmation-dialog"
      open={!!openConfirmationDialog}
    >
      {title && (
        <DialogTitle
          data-testid={TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE}
          disableTypography
          classes={{ root: classes.dialogTitle }}
        >
          {title}
        </DialogTitle>
      )}
      <DialogContent>
        {!customContentWrapper && (
          <DialogContentText
            data-testid={TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT}
            classes={{ root: classes.dialogText }}
            id="alert-confirmation-dialog"
          >
            {content}
          </DialogContentText>
        )}
        {customContentWrapper && <div>{content}</div>}
      </DialogContent>
      <DialogActions classes={{ root: classes.dialogActions }}>
        {!omitCancelButton && (
          <Button
            variant="secondary"
            data-testid={TESTCAFE_ID_CONFIRMATION_CANCEL_BUTTON}
            className={classes.cancelButton}
            autoFocus
            onClick={onCancel}
          >
            {cancelText || "Cancel"}
          </Button>
        )}
        <Button
          data-testid={TESTCAFE_ID_CONFIRM_BUTTON}
          className={
            isDangerousAction
              ? classes.dangerButton
              : classes.submitAgentsButton
          }
          type="submit"
          onClick={onConfirm}
        >
          {confirmText || "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
