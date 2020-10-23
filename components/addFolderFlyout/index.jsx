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

import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { createContainerAt, getSourceUrl } from "@inrupt/solid-client";
import { makeStyles } from "@material-ui/core/styles";
import { useSession } from "@inrupt/solid-ui-react";
import { createStyles, Popover } from "@material-ui/core";
import { Button, Form, Input } from "@inrupt/prism-react-components";
import PodLocationContext from "../../src/contexts/podLocationContext";
import AlertContext from "../../src/contexts/alertContext";
import styles from "../addPermissionUsingWebIdButton/styles";
import { joinPath } from "../../src/stringHelpers";

const TESTCAFE_ID_ADD_FOLDER_BUTTON = "add-folder-button";
const TESTCAFE_ID_FOLDER_NAME_INPUT = "folder-name-input";
const TESTCAFE_ID_CREATE_FOLDER_FLYOUT_BUTTON = "create-folder-flyout-button";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export function determineFinalUrl(folders, currentUri, name) {
  let currentName = name;
  function determineFinalName(n = 1) {
    const found = Boolean(
      folders.find((folder) => folder.name === currentName)
    );
    if (found) {
      const baseName = currentName.substr(0, currentName.indexOf("("));
      if (baseName.length) {
        currentName = `${baseName}(${n})`;
      } else {
        currentName = `${currentName}(${n})`;
      }
      determineFinalName(n + 1);
    }
  }
  determineFinalName();
  return joinPath(currentUri, encodeURIComponent(currentName));
}

export function handleFolderSubmit({
  options,
  onSave,
  currentUri,
  folders,
  name,
  setSeverity,
  setMessage,
  setAlertOpen,
  handleClose,
  setFolderName,
}) {
  return async (event) => {
    event.preventDefault();
    if (!name) {
      return;
    }
    try {
      const url = determineFinalUrl(folders, currentUri, name);
      const response = await createContainerAt(url, options);

      onSave();
      setSeverity("success");
      setMessage(
        `Your folder has been created at ${decodeURIComponent(
          getSourceUrl(response)
        )}`
      );
      setAlertOpen(true);
      setFolderName("");
      handleClose();
    } catch (error) {
      setSeverity("error");
      setMessage(error.toString());
      setAlertOpen(true);
    }
  };
}

export function handleChange(setFolderName) {
  return ({ target: { value } }) => {
    setFolderName(value);
  };
}

export default function AddFolderFlyout({ onSave, className, resourceList }) {
  const classes = useStyles();
  const [folderName, setFolderName] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { currentUri } = useContext(PodLocationContext);
  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);

  const {
    session: { fetch },
  } = useSession();

  const folders =
    resourceList && resourceList.filter((el) => el.iri.endsWith("/"));
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "add-folder-flyout" : undefined;
  const options = { fetch };

  const onSubmit = handleFolderSubmit({
    options,
    folders,
    currentUri,
    name: folderName,
    onSave,
    setSeverity,
    setMessage,
    setAlertOpen,
    handleClose,
    setFolderName,
  });

  const onChange = handleChange(setFolderName);

  return (
    <>
      <button
        type="button"
        aria-describedby={id}
        data-testid={TESTCAFE_ID_ADD_FOLDER_BUTTON}
        className={className}
        onClick={handleClick}
      >
        Create Folder
      </button>
      <Popover
        data-testid={id}
        open={open}
        anchorEl={anchorEl}
        classes={classes}
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
        <Form onSubmit={(event) => onSubmit(event)}>
          <Input
            data-testid={TESTCAFE_ID_FOLDER_NAME_INPUT}
            id="folder-input"
            label="Folder name"
            onChange={onChange}
            value={folderName}
          />
          <Button
            data-testid={TESTCAFE_ID_CREATE_FOLDER_FLYOUT_BUTTON}
            type="submit"
          >
            Create Folder
          </Button>
        </Form>
      </Popover>
    </>
  );
}

AddFolderFlyout.propTypes = {
  onSave: PropTypes.func,
  resourceList: PropTypes.arrayOf(PropTypes.shape()),
  className: PropTypes.string,
};

AddFolderFlyout.defaultProps = {
  onSave: () => {},
  resourceList: [],
  className: null,
};
