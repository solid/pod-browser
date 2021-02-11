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

import Link from "next/link";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { Icons } from "@inrupt/prism-react-components";
import ListItemText from "@material-ui/core/ListItemText";
import clsx from "clsx";
import React from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import T from "prop-types";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function MenuDrawerItem({
  href,
  icon,
  label,
  onClick,
  ...props
}) {
  const bem = useBem(useStyles());
  return href ? (
    <Link href={href}>
      <ListItem
        key={label}
        onClick={onClick}
        className={bem("menu-drawer-item")}
        {...props}
      >
        <ListItemIcon className={bem("menu-drawer-item__icon-holder")}>
          <Icons name={icon} className={bem("menu-drawer-item__icon")} />
        </ListItemIcon>
        <ListItemText
          disableTypography
          primary={label}
          className={clsx(
            bem("user-menu__trigger"),
            bem("menu-drawer-item__text"),
            bem("menu-drawer-item__link")
          )}
        />
      </ListItem>
    </Link>
  ) : (
    <ListItem
      button
      key={label}
      onClick={onClick}
      className={bem("menu-drawer-item")}
      {...props}
    >
      <ListItemIcon className={bem("menu-drawer-item__icon-holder")}>
        <Icons name={icon} className={bem("menu-drawer-item__icon")} />
      </ListItemIcon>
      <ListItemText
        disableTypography
        primary={label}
        className={clsx(
          bem("user-menu__trigger"),
          bem("menu-drawer-item__text")
        )}
      />
    </ListItem>
  );
}

MenuDrawerItem.defaultProps = {
  href: null,
};

MenuDrawerItem.propTypes = {
  href: T.string,
  icon: T.string.isRequired,
  label: T.string.isRequired,
  onClick: T.func.isRequired,
};
