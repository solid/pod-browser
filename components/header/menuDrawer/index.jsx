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

/* eslint react/jsx-props-no-spreading:off */

import React, { useContext, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { Icons } from "@inrupt/prism-react-components";
import styles from "./styles";
import FeatureContext from "../../../src/contexts/featureFlagsContext";
import getMainMenuItems from "../../../constants/mainMenu";
import useUserMenu from "../../../src/hooks/useUserMenu";
import MenuDrawerItem from "./menuDrawerItem";

export const TESTID_MENU_DRAWER_BUTTON = "menu-drawer-button";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const menuItems = getMainMenuItems();

export default function MenuDrawer() {
  const bem = useBem(useStyles());
  const classes = useStyles();
  const { enabled } = useContext(FeatureContext);
  const menuItemsToShow = menuItems.filter(
    ({ featureFlag }) => !featureFlag || enabled(featureFlag)
  );
  const [open, setOpen] = useState(false);
  const userMenu = useUserMenu();

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  return (
    <div className={classes.hamburgerMenu}>
      <Button
        onClick={handleDrawerOpen}
        data-testid={TESTID_MENU_DRAWER_BUTTON}
      >
        <Icons name="bars" aria-label="Menu" />
      </Button>
      <Drawer
        anchor="top"
        open={open}
        onClose={handleDrawerClose}
        classes={{ paper: classes.drawerContainer }}
      >
        <List>
          <ListItem button key="title">
            <ListItemText primary="Pod Browser" />
            <Button onClick={handleDrawerClose}>
              <Icons
                name="cancel"
                className={bem("icon-close")}
                aria-label="Pod Browser"
              />
            </Button>
          </ListItem>
          <Divider />
          {menuItemsToShow.map(({ path, ...action }) => (
            <MenuDrawerItem
              key={path}
              href={path}
              onClick={handleDrawerClose}
              {...action}
            />
          ))}
          <Divider />
          {userMenu.map(({ onClick, ...action }) => (
            <MenuDrawerItem
              key={action.label}
              onClick={() => {
                handleDrawerClose();
                onClick();
              }}
              {...action}
            />
          ))}
        </List>
      </Drawer>
    </div>
  );
}
