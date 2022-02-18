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
import T from "prop-types";
import DeleteButton from "../deleteButton";

export const TESTCAFE_CONTACT_DELETE_BUTTON = "delete-contact-button";
export const confirmationTitle = "Delete Contact";
export const deleteContactSuccessMessage = "Contact was successfully deleted.";
/* eslint react/jsx-props-no-spreading: 0 */
export default function DeleteContactButton({
  onDelete,
  name,
  webId,
  ...buttonProps
}) {
  return (
    <DeleteButton
      confirmationTitle={confirmationTitle}
      confirmationContent={`Are you sure you wish to delete ${
        name || webId
      } from your contacts?`}
      dialogId="delete-contact"
      onDelete={onDelete}
      successMessage={deleteContactSuccessMessage}
      {...buttonProps}
    >
      Delete
    </DeleteButton>
  );
}

DeleteContactButton.propTypes = {
  onDelete: T.func.isRequired,
  name: T.string,
  webId: T.string.isRequired,
};

DeleteContactButton.defaultProps = {
  name: null,
};
