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
import { createStyles, List, ListItem, ListItemText, Popover } from "@mui/core";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import RemoveButton from "./removeButton";
import AccessDetailsButton from "./accessDetailsButton";
import styles from "./styles";
import { profile as profilePropType } from "../../../../../constants/propTypes";
import AccessDetailsModal from "./accessDetailsButton/accessDetailsModal";

export const TESTCAFE_ID_MENU_BUTTON = "menu-button";
const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function AgentAccessOptionsMenu({
  resourceIri,
  permission,
  profile,
  setLoading,
  setLocalAccess,
  mutateAccessGrantBasedPermissions,
  setLoadingTable,
}) {
  const classes = useStyles();
  const bem = useBem(useStyles());
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const { webId, vc } = permission;

  const handleClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  /* istanbul ignore next */
  const handleClose = () => {
    setMenuAnchorEl(null);
    setOpenModal(false);
  };

  const menuOpen = Boolean(menuAnchorEl);
  const id = menuOpen ? "agent-access-options-menu" : undefined;

  return (
    <>
      <button
        data-testid={TESTCAFE_ID_MENU_BUTTON}
        type="button"
        className={classes.button}
        onClick={handleClick}
      >
        <i className={clsx(bem("icon-more"), bem("icon"))} />
      </button>
      <Popover
        id={id}
        open={menuOpen}
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
              <b>WebID: </b>
              <p className={classes.webId}>{webId}</p>
            </ListItemText>
          </ListItem>
          {vc ? (
            <>
              <AccessDetailsButton
                resourceIri={resourceIri}
                permission={permission}
                setOpenModal={setOpenModal}
              />
              <AccessDetailsModal
                openModal={openModal}
                resourceIri={resourceIri}
                permission={permission}
                handleCloseModal={handleClose}
                mutateAccessGrantBasedPermissions={
                  mutateAccessGrantBasedPermissions
                }
                setLoadingTable={setLoadingTable}
              />
            </>
          ) : (
            <RemoveButton
              resourceIri={resourceIri}
              profile={profile}
              permission={permission}
              setLoading={setLoading}
              setLocalAccess={setLocalAccess}
            />
          )}
        </List>
      </Popover>
    </>
  );
}

AgentAccessOptionsMenu.propTypes = {
  resourceIri: PropTypes.string,
  permission: PropTypes.shape().isRequired,
  setLoading: PropTypes.func,
  profile: profilePropType,
  setLocalAccess: PropTypes.func,
  mutateAccessGrantBasedPermissions: PropTypes.func,
  setLoadingTable: PropTypes.func,
};

/* istanbul ignore next */
AgentAccessOptionsMenu.defaultProps = {
  resourceIri: null,
  setLoading: () => {},
  profile: null,
  setLocalAccess: () => {},
  mutateAccessGrantBasedPermissions: () => {},
  setLoadingTable: () => {},
};
