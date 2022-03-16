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

/* eslint react/jsx-props-no-spreading: off */

import { ActionButton, Button } from "@inrupt/prism-react-components";
import React, { useState } from "react";
import { Divider } from "@material-ui/core";
import GroupDetailsModal from "../groupDetailsModal";
import GroupDeleteModal from "../groupDeleteModal";

export const TESTCAFE_ID_GROUP_DETAILS_ACTION_BUTTON_EDIT_ACTION =
  "group-details-action-button-edit-action";
export const TESTCAFE_ID_GROUP_DETAILS_ACTION_BUTTON_DELETE_ACTION =
  "group-details-action-button-delete-action";

const ACTION_EDIT = "edit";
const ACTION_DELETE = "delete";

export default function GroupDetailsActionButton(props) {
  const [action, setAction] = useState(null);
  const handleOpen = (act) => setAction(act);
  const handleClose = () => setAction(null);

  return (
    <div {...props}>
      <ActionButton>
        <Button
          onClick={() => handleOpen(ACTION_EDIT)}
          data-testid={TESTCAFE_ID_GROUP_DETAILS_ACTION_BUTTON_EDIT_ACTION}
          variant="in-menu"
        >
          Edit Group Details
        </Button>
        <Divider />
        <Button
          onClick={() => handleOpen(ACTION_DELETE)}
          data-testid={TESTCAFE_ID_GROUP_DETAILS_ACTION_BUTTON_DELETE_ACTION}
          variant="in-menu-danger"
          iconBefore="delete"
        >
          Delete Group
        </Button>
      </ActionButton>
      <GroupDetailsModal
        handleClose={handleClose}
        open={action === ACTION_EDIT}
      />
      <GroupDeleteModal
        handleClose={handleClose}
        openModal={action === ACTION_DELETE}
      />
    </div>
  );
}
