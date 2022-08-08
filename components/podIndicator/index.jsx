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
import { useRouter } from "next/router";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { Icons } from "@inrupt/prism-react-components";
import PodNavigatorPopover from "./podNavigatorPopover";
import Bookmark from "../bookmark";
import styles from "./styles";
import { locationIsConnectedToProfile } from "../../src/solidClientHelpers/profile";
import useAuthenticatedProfile from "../../src/hooks/useAuthenticatedProfile";

const TESTCAFE_ID_POD_INDICATOR = "pod-indicator";
export const TESTCAFE_ID_POD_NAVIGATE_TRIGGER = "pod-indicator-prompt";
export const TESTCAFE_ID_POD_INDICATOR_COPY = "pod-indicator-copy-link";
export const TESTCAFE_POD_INDICATOR_TOOLTIP = "pod-indicator-copy-tooltip";

export const clickHandler = (setAnchorEl) => (event) =>
  setAnchorEl(event.currentTarget);

export const closeHandler = (setAnchorEl) => () => setAnchorEl(null);

export default function PodIndicator() {
  const router = useRouter();
  const [indicatorWidth, setIndicatorWidth] = useState();
  const [displayNavigator, setDisplayNavigator] = useState(false);
  const [indicatorLabelWidth, setIndicatorLabelWidth] = useState();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const useStyles = makeStyles((theme) =>
    createStyles(styles(theme, indicatorWidth, indicatorLabelWidth))
  );
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [navigatorAnchor, setNavigatorAnchor] = useState(null);
  const bem = useBem(useStyles());
  const podIri = router.query.iri;
  const loading = !podIri;
  const open = Boolean(anchorEl);
  const id = open ? "pod-indicator-menu" : undefined;
  const handleClick = clickHandler(setAnchorEl);
  const handleClose = closeHandler(setAnchorEl);
  const handleOpenNavigator = () => {
    setNavigatorAnchor(anchorEl);
    setDisplayNavigator(true);
    handleClose();
  };
  const ref = createRef();
  const indicatorLabelRef = createRef();
  const authenticatedProfile = useAuthenticatedProfile();
  const isOwnPod = locationIsConnectedToProfile(authenticatedProfile, podIri);

  useEffect(() => {
    const width = ref.current.offsetWidth || 0;
    setIndicatorWidth(width);
  }, [ref]);

  useEffect(() => {
    if (!indicatorLabelRef.current) return;
    const width = indicatorLabelRef.current.offsetWidth || 0;
    setIndicatorLabelWidth(width);
  }, [indicatorLabelRef]);

  const handlePodCopyClick = () => {
    navigator.clipboard.writeText(podIri);
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
      handleClose();
    }, 800);
  };
  return (
    <div
      data-testid={TESTCAFE_ID_POD_INDICATOR}
      className={bem("indicator")}
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
          className={bem("indicatorPrompt")}
          title={podIri}
        >
          <span className={bem("indicatorLabel")}>
            <span className={bem("indicatorLabelYour")}>Current&nbsp;</span>
            Location
            <Icons
              name={open ? "caret-up" : "caret-down"}
              className={bem("indicatorChevron")}
            />
          </span>
          <span
            className={bem("indicatorName", { isOwnPod })}
            ref={indicatorLabelRef}
          >
            {podIri}
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
            paper: bem("popoverMenu"),
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
          <List classes={{ root: bem("list") }}>
            <Bookmark
              iri={podIri}
              menuItem
              addText="Bookmark Location"
              removeText="Remove Bookmark"
              profileName={podIri}
            />
            <ListItem
              button
              key="change-location"
              onClick={handleOpenNavigator}
              classes={{ root: bem("menuItem") }}
            >
              <ListItemIcon classes={{ root: bem("itemIcon") }}>
                <i
                  className={clsx(bem("icon-move"), bem("icon"))}
                  aria-label="Change location"
                />
              </ListItemIcon>
              <ListItemText disableTypography primary="Change Location" />
            </ListItem>
            <Tooltip
              PopperProps={{
                disablePortal: true,
              }}
              open={tooltipOpen}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              title="Copied"
              data-testid={TESTCAFE_POD_INDICATOR_TOOLTIP}
            >
              <ListItem
                button
                key="copy-text"
                onClick={handlePodCopyClick}
                classes={{ root: bem("menuItem") }}
                data-testid={TESTCAFE_ID_POD_INDICATOR_COPY}
              >
                <ListItemIcon classes={{ root: bem("itemIcon") }}>
                  <Icons name="copy" className={clsx(bem("icon"))} />
                </ListItemIcon>
                <ListItemText disableTypography primary="Copy Link" />
              </ListItem>
            </Tooltip>
          </List>
        </Popover>
      )}
    </div>
  );
}
