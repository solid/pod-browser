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
import clsx from "clsx";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import Link from "next/link";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import styles from "./styles";
import LogOutButton from "../../logout";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function MenuDrawer() {
  const bem = useBem(useStyles());
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.hamburgerMenu}>
      <Button onClick={handleDrawerOpen}>
        <i className={clsx(bem("icon-bars"), bem("icon"))} aria-label="Menu" />
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
              <i
                className={clsx(bem("icon-cancel"), bem("icon-close"))}
                aria-label="Pod Browser"
              />
            </Button>
          </ListItem>
          <Divider />
          {[
            { text: "Files", icon: "icon-files", path: "/" },
            { text: "Contacts", icon: "icon-users", path: "/contacts" },
            { text: "Bookmarks", icon: "icon-star", path: "/bookmarks" },
          ].map(({ text, icon, path }) => {
            return (
              <Link href={path} replace key={path}>
                <ListItem button key={text} onClick={handleDrawerClose}>
                  <ListItemIcon>
                    <i
                      className={clsx(bem(icon), bem("icon"))}
                      aria-label={text}
                    />
                  </ListItemIcon>
                  <ListItemText
                    disableTypography
                    primary={text}
                    className={bem("menu-drawer-item__text")}
                  />
                </ListItem>
              </Link>
            );
          })}
          <Divider />
          <LogOutButton
            className={bem("header-banner__user-menu-item-trigger")}
          >
            <span
              className={clsx(
                bem("menu-drawer-item__text", "menu-drawer-item__link"),
                bem("menu-drawer-item__link")
              )}
            >
              Log out
            </span>
          </LogOutButton>
        </List>
      </Drawer>
    </div>
  );
}
