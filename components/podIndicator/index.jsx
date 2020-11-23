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

import React, { createRef, useEffect, useState } from "react";
import clsx from "clsx";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import usePodOwnerProfile from "../../src/hooks/usePodOwnerProfile";
import PodNavigatorPopover from "./podNavigatorPopover";
import styles from "./styles";

const TESTCAFE_ID_POD_INDICATOR = "pod-indicator";
const TESTCAFE_ID_POD_NAVIGATE_TRIGGER = "pod-indicator-prompt";

export const clickHandler = (setAnchorEl) => (event) =>
  setAnchorEl(event.currentTarget);

export const closeHandler = (setAnchorEl) => () => setAnchorEl(null);

export default function PodIndicator() {
  const [indicatorWidth, setIndicatorWidth] = useState();
  const [displayNavigator, setDisplayNavigator] = useState(false);
  const [indicatorLabelWidth, setIndicatorLabelWidth] = useState();

  const useStyles = makeStyles((theme) =>
    createStyles(styles(theme, indicatorWidth, indicatorLabelWidth))
  );
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [navigatorAnchor, setNavigatorAnchor] = useState(null);
  const bem = useBem(useStyles());
  const { profile, error: profileError } = usePodOwnerProfile();
  const loading = !profile && !profileError;

  const open = Boolean(anchorEl);
  const id = open ? "pod-indicator-menu" : undefined;
  const handleClick = clickHandler(setAnchorEl);
  const handleClose = closeHandler(setAnchorEl);
  const handleOpenNavigator = () => {
    setNavigatorAnchor(anchorEl);
    setDisplayNavigator(true);
    handleClose();
  };
  const ref = createRef(null);
  const indicatorLabelRef = createRef(null);

  useEffect(() => {
    const width = ref.current.offsetWidth || 0;
    setIndicatorWidth(width);
  }, [ref]);

  useEffect(() => {
    if (!indicatorLabelRef.current) return;
    const width = indicatorLabelRef.current.offsetWidth || 0;
    setIndicatorLabelWidth(width);
  }, [indicatorLabelRef]);

  return (
    <div
      data-testid={TESTCAFE_ID_POD_INDICATOR}
      className={classes.indicator}
      ref={ref}
    >
      {loading ? (
        <Skeleton width={100} style={{ display: "inline-block" }} />
      ) : (
        <button
          data-testid={TESTCAFE_ID_POD_NAVIGATE_TRIGGER}
          id="pod-indicator-prompt"
          type="button"
          aria-describedby={id}
          onClick={handleClick}
          className={classes.indicatorPrompt}
          title={profile ? profile.name : "Unknown"}
        >
          <span className={classes.indicatorLabel}>
            Pod
            <i
              className={clsx(
                bem(open ? "icon-caret-up" : "icon-caret-down"),
                classes.indicatorChevron
              )}
            />
          </span>
          <span className={classes.indicatorName} ref={indicatorLabelRef}>
            {profile ? profile.name : "Unknown"}
          </span>
        </button>
      )}
      {displayNavigator ? (
        <PodNavigatorPopover
          anchor={navigatorAnchor}
          setDisplayNavigator={setDisplayNavigator}
          popoverWidth={indicatorWidth}
        />
      ) : (
        <Popover
          id={id}
          classes={{
            paper: classes.popoverMenu,
          }}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <List classes={{ root: classes.list }}>
            <ListItem
              button
              key="change-pod"
              onClick={handleOpenNavigator}
              classes={{ root: classes.menuItem }}
            >
              <ListItemIcon classes={{ root: classes.itemIcon }}>
                <i
                  className={clsx(bem("icon-move"), bem("icon"))}
                  aria-label="Change pod"
                />
              </ListItemIcon>
              <ListItemText
                disableTypography
                primary="Change pod"
                className={bem("menu-drawer-item__text")}
              />
            </ListItem>
          </List>
        </Popover>
      )}
    </div>
  );
}
