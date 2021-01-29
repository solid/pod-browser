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

import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  createStyles,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Popover,
} from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { getResourceName } from "../../../../../src/solidClientHelpers/resource";
import styles from "./styles";
import CanShareInfoTooltip from "../../canShareInfoTooltip";
import CanShareToggleSwitch from "../../canShareToggleSwitch";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_MENU_BUTTON = "menu-button";
const TESTCAFE_ID_REMOVE_BUTTON = "remove-button";

export default function AgentAccessOptionsMenu({
  toggleShare,
  removePermissions,
  canShare,
  resourceIri,
  webId,
}) {
  const resourceName = getResourceName(resourceIri);
  const classes = useStyles();
  const bem = useBem(useStyles());
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchorEl(null);
  };

  const open = Boolean(menuAnchorEl);

  const id = open ? "agent-access-options-menu" : undefined;

  return (
    <>
      <button
        data-testid={TESTCAFE_ID_MENU_BUTTON}
        type="button"
        className={classes.button}
        onClick={handleClick}
      >
        <i
          className={clsx(bem("icon-more"), bem("icon"))}
          alt="More Options Menu"
        />
      </button>
      <Popover
        id={id}
        open={open}
        anchorEl={menuAnchorEl}
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
        <List classes={{ root: classes.listRoot }}>
          <ListItem
            classes={{
              root: classes.webIdContainerRoot,
              gutters: classes.webIdContainerGutters,
            }}
          >
            <ListItemText
              disableTypography
              classes={{ root: classes.webIdContainer }}
            >
              <b>WebId: </b>
              <p>{webId}</p>
            </ListItemText>
          </ListItem>
          {/* hiding the can share menu option until we have the new canShare policy */}
          {/* <ListItem>
            <ListItemText
              disableTypography
              classes={{ primary: classes.listItemText }}
            >
              <CanShareInfoTooltip resourceName={resourceName} />
            </ListItemText>
            <ListItemSecondaryAction>
              <CanShareToggleSwitch
                toggleShare={toggleShare}
                canShare={canShare}
              />
            </ListItemSecondaryAction>
          </ListItem> */}
          <ListItem
            data-testid={TESTCAFE_ID_REMOVE_BUTTON}
            button
            onClick={removePermissions}
          >
            <ListItemText
              disableTypography
              classes={{ primary: classes.listItemText }}
            >
              Remove
            </ListItemText>
          </ListItem>
        </List>
      </Popover>
    </>
  );
}

AgentAccessOptionsMenu.propTypes = {
  toggleShare: PropTypes.func.isRequired,
  removePermissions: PropTypes.func.isRequired,
  canShare: PropTypes.bool,
  resourceIri: PropTypes.string.isRequired,
  webId: PropTypes.string.isRequired,
};

AgentAccessOptionsMenu.defaultProps = {
  canShare: false,
};
