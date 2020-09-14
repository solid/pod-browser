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
import { createContainerAt } from "@inrupt/solid-client";
import { makeStyles } from "@material-ui/core/styles";
import {
  Popover,
  Button,
  Typography,
  FormControl,
  Input,
  InputLabel,
} from "@material-ui/core";
import SessionContext from "../../src/contexts/sessionContext";
import PodLocationContext from "../../src/contexts/podLocationContext";
import AlertContext from "../../src/contexts/alertContext";

const useStyles = makeStyles((theme) => {
  return {
    typography: {
      padding: theme.spacing(2),
      display: "flex",
      flexDirection: "column",
    },
    folderInput: {
      padding: theme.spacing(2, 0),
    },
  };
});

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
  return encodeURI(currentUri) + encodeURIComponent(currentName);
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
}) {
  return async () => {
    try {
      const url = determineFinalUrl(folders, currentUri, name);
      const response = await createContainerAt(url, options);

      onSave();
      setSeverity("success");
      setMessage(
        `Your folder has been created at ${decodeURIComponent(
          response.internal_resourceInfo.sourceIri
        )}`
      );
      setAlertOpen(true);
      handleClose();
    } catch (error) {
      setSeverity("error");
      setMessage(error.toString());
      setAlertOpen(true);
    }
  };
}

export function handleCreateFolderClick({ setFolderName, onSubmit }) {
  return () => {
    setFolderName("");
    onSubmit();
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
  const { session } = useContext(SessionContext);
  const { fetch } = session;
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
  });

  const onClick = handleCreateFolderClick({ setFolderName, onSubmit });
  const onChange = handleChange(setFolderName);

  return (
    <>
      <button
        type="button"
        aria-describedby={id}
        id="add-folder-button"
        className={className}
        onClick={handleClick}
      >
        Create Folder
      </button>
      <Popover
        id={id}
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
        <Typography className={classes.typography}>
          <FormControl className={classes.folderInput}>
            <InputLabel htmlFor="folder-input">Folder name</InputLabel>
            <Input id="folder-input" onChange={onChange} value={folderName} />
          </FormControl>
          <Button
            variant="contained"
            onClick={onClick}
            disabled={folderName === ""}
          >
            Create Folder
          </Button>
        </Typography>
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
