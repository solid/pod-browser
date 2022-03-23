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
import { createStyles, makeStyles } from "@material-ui/styles";
import { PropTypes } from "prop-types";
import { Card } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Skeleton from "@material-ui/lab/Skeleton";
import { Button } from "@inrupt/prism-react-components";
import PolicyHeader from "../policyHeader";
import ConfirmationDialog from "../../../confirmationDialog";
import useAllPermissions from "../../../../src/hooks/useAllPermissions";
import {
  AgentPermissionSearch,
  AgentPermissionsList,
} from "./AgentPermissionsList";
import styles from "./styles";

export const TESTCAFE_ID_VIEW_DETAILS_BUTTON = "view-details-button";
export const TESTCAFE_ID_REMOVE_BUTTON = "remove-button";
export const CONFIRMATION_DIALOG_ID = "remove-agent";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function renderCardBody(permissions, resourceIri) {
  if (!permissions.length) return <Skeleton />;

  return (
    <>
      <AgentPermissionSearch />
      <AgentPermissionsList
        permissions={permissions}
        resourceIri={resourceIri}
      />
    </>
  );
}

function AgentPermissionListSkeleton() {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </Card>
  );
}

export default function PermissionsPanel({
  permissionType,
  permissions,
  resourceIri,
}) {
  const classes = useStyles();
  const editButtonText = permissionType === "editors" ? "Editors" : "Viewers";
  const { loading } = useAllPermissions();

  if (loading) return <AgentPermissionListSkeleton />;
  return (
    <>
      <Card className={classes.card}>
        <PolicyHeader type={permissionType} pluralTitle>
          <Button variant="text" onClick={() => {}} iconBefore="edit">
            {editButtonText}
          </Button>
          <Button type="button" variant="in-menu">
            <MoreVertIcon />
          </Button>
        </PolicyHeader>
        {renderCardBody(permissions, resourceIri, classes)}
        {/* agentpicker is not REFACTOR yet and could cause rerenders */}
        {/* <AgentPickerModal /> */}
        <ConfirmationDialog />
      </Card>
    </>
  );
}

PermissionsPanel.propTypes = {
  permissionType: PropTypes.string.isRequired,
  resourceIri: PropTypes.string.isRequired,
  permissions: PropTypes.arrayOf(PropTypes.object),
};

PermissionsPanel.defaultProps = {
  permissions: [],
};
