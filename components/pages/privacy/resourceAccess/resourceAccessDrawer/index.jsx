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
import T from "prop-types";
import { Drawer, Icons } from "@inrupt/prism-react-components";
import {
  createStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { getAcpAccessDetails } from "../../../../../src/accessControl/acp";
import { getResourceName } from "../../../../../src/solidClientHelpers/resource";
import styles from "./styles";
import { isContainerIri } from "../../../../../src/solidClientHelpers/utils";

const getAllowModes = (accessList) => {
  if (!accessList) return null;
  const accessModes = [
    ...new Set(
      [
        ...accessList.map(({ allow }) => {
          return allow.map((mode) => mode);
        }),
      ].reduce((acc, modes) => [...acc, ...modes], [])
    ),
  ];
  return accessModes;
};

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ResourceAccessDrawer({
  open,
  onClose,
  accessList,
  resourceIri,
}) {
  const classes = useStyles();
  const bem = useBem(classes);

  const allowModes = getAllowModes(accessList);
  const modes = allowModes?.map((mode) => {
    return {
      read: !!mode.includes("Read"),
      write: !!mode.includes("Write"),
      append: !!mode.includes("Append"),
      control: !!mode.includes("Control"),
    };
  });
  const accessDetails = modes?.map((mode) => {
    return getAcpAccessDetails(mode);
  });
  const order = ["View", "Edit", "Add", "Share", "View Sharing"];
  const sortedAccessDetails = accessDetails?.sort((a, b) => {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });
  const resourceName = resourceIri && getResourceName(resourceIri);
  return (
    <Drawer open={open} close={onClose}>
      <div className={bem("access-details", "wrapper")}>
        <span className={bem("access-details", "title")}>
          <Icons
            name={
              resourceIri && isContainerIri(resourceIri) ? "folder" : "file"
            }
            className={bem("access-details", "icon")}
          />
          <h2>{resourceName}</h2>
        </span>
        <section className={bem("access-details", "section")}>
          <h3 className={bem("access-details", "section-header")}>Access</h3>
          <hr className={bem("access-details", "separator")} />
          <List>
            {sortedAccessDetails?.map(({ name, icon, description }) => {
              return (
                <ListItem key={name}>
                  <ListItemIcon classes={{ root: classes.listItemIcon }}>
                    <Icons
                      name={icon}
                      className={bem("access-details", "section-icon")}
                    />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      root: classes.listItemText,
                      primary: classes.listItemTitleText,
                      secondary: classes.listItemSecondaryText,
                    }}
                    key={name}
                    primary={name}
                    secondary={description}
                  />
                </ListItem>
              );
            })}
          </List>
        </section>
      </div>
    </Drawer>
  );
}

ResourceAccessDrawer.propTypes = {
  open: T.bool.isRequired,
  accessList: T.arrayOf(
    T.shape({
      agent: T.string,
      allow: T.arrayOf(T.string),
      deny: T.arrayOf(T.string),
      resource: T.string,
    })
  ),
  onClose: T.func.isRequired,
  resourceIri: T.string,
};

ResourceAccessDrawer.defaultProps = {
  accessList: [],
  resourceIri: null,
};
