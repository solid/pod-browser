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

/* eslint-disable react/jsx-props-no-spreading */

import React, { useContext, useEffect, useState } from "react";
import T from "prop-types";
import { createStyles, makeStyles, Popover } from "@material-ui/core";
import { InputGroup, Label, Message } from "@inrupt/prism-react-components";
import AgentSearchForm from "../agentSearchForm";
import PermissionsForm from "../permissionsForm";
import {
  createAccessMap,
  isEmptyAccess,
} from "../../src/solidClientHelpers/permissions";
import styles from "./styles";
import AccessControlContext from "../../src/contexts/accessControlContext";

const POPOVER_ID = "AddPermissionWithWebId";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export function changeHandler(setAgentId) {
  return (newAgentId) => {
    setAgentId(newAgentId);
  };
}

export function clickHandler(setAnchorEl) {
  return (event) => {
    setAnchorEl(event.currentTarget);
  };
}

export function closeHandler(
  setAnchorEl,
  setAccess,
  setDisabled,
  setSubmitted,
  onLoading
) {
  return () => {
    setAnchorEl(null);
    setAccess(createAccessMap(true));
    setDisabled(false);
    setSubmitted(false);
    onLoading(false);
  };
}

export function submitHandler(
  accessControl,
  onLoading,
  setSubmitted,
  access,
  setPermissionFormError,
  setDisabled,
  handleClose
) {
  return async (agentId) => {
    onLoading(true);
    setSubmitted(true);
    if (isEmptyAccess(access)) {
      setPermissionFormError(true);
      return;
    }
    setDisabled(true);
    const { error } = await accessControl.savePermissionsForAgent(
      agentId,
      access
    );
    if (error) throw error;
    handleClose();
  };
}

export default function AddPermissionUsingWebIdButton({
  onLoading,
  ...buttonProps
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [access, setAccess] = useState(createAccessMap(true));
  const classes = useStyles();
  const [disabled, setDisabled] = useState(false);
  const { accessControl } = useContext(AccessControlContext);
  const [submitted, setSubmitted] = useState(false);
  const [permissionFormError, setPermissionFormError] = useState(false);
  const [agentId, setAgentId] = useState("");

  const handleChange = changeHandler(setAgentId);

  const handleClick = clickHandler(setAnchorEl);

  const handleClose = closeHandler(
    setAnchorEl,
    setAccess,
    setDisabled,
    setSubmitted,
    onLoading
  );

  const onSubmit = submitHandler(
    accessControl,
    onLoading,
    setSubmitted,
    access,
    setPermissionFormError,
    setDisabled,
    handleClose
  );

  useEffect(() => {
    if (!submitted) return;
    setPermissionFormError(isEmptyAccess(access));
  }, [submitted, access]);

  const open = Boolean(anchorEl);
  const id = open ? POPOVER_ID : undefined;

  return (
    <>
      <button
        aria-describedby={id}
        type="button"
        {...buttonProps}
        onClick={handleClick}
      >
        Add with WebId
      </button>
      <Popover
        id={id}
        classes={classes}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <AgentSearchForm
          onChange={handleChange}
          onSubmit={onSubmit}
          value={agentId}
        >
          <InputGroup>
            <Label>Assign permissions</Label>
            <PermissionsForm
              acl={access}
              onChange={setAccess}
              disabled={disabled}
            />
            {permissionFormError ? (
              <Message variant="error">
                Please assign at least one permission
              </Message>
            ) : null}
          </InputGroup>
        </AgentSearchForm>
      </Popover>
    </>
  );
}

AddPermissionUsingWebIdButton.propTypes = {
  onLoading: T.func,
};

AddPermissionUsingWebIdButton.defaultProps = {
  onLoading: () => {},
};
