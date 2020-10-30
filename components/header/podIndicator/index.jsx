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
import { useRouter } from "next/router";
import { useBem } from "@solid/lit-prism-patterns";
import { Button, Box, Popover } from "@material-ui/core";
import {
  Form,
  Label,
  Message,
  SimpleInput,
} from "@inrupt/prism-react-components";
import Skeleton from "@material-ui/lab/Skeleton";
import usePodOwnerProfile from "../../../src/hooks/usePodOwnerProfile";
import styles from "./styles";
import { resourceHref } from "../../../src/navigator";
import { normalizeContainerUrl } from "../../../src/stringHelpers";

const TESTCAFE_ID_POD_NAVIGATE_INPUT = "pod-navigate-input";
const TESTCAFE_ID_POD_NAVIGATE_TRIGGER = "pod-indicator-prompt";
const TESTCAFE_ID_POD_NAVIGATE_BUTTON = "pod-navigate-button";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const clickHandler = (setAnchorEl) => (event) =>
  setAnchorEl(event.currentTarget);

export const closeHandler = (setAnchorEl) => () => setAnchorEl(null);

export const submitHandler = (
  handleClose,
  setUrl,
  setDirtyForm,
  setDirtyUrlField
) => async (event, url, router) => {
  event.preventDefault();
  setDirtyForm(true);
  if (url === "") {
    return;
  }
  const containerUrl = normalizeContainerUrl(url);
  await router.push("/resource/[iri]", resourceHref(containerUrl));
  handleClose();
  setDirtyForm(false);
  setDirtyUrlField(false);
  setUrl("");
};

export default function PodIndicator() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [url, setUrl] = useState("");
  const router = useRouter();
  const bem = useBem(useStyles());
  const { profile, error: profileError } = usePodOwnerProfile();
  const [dirtyForm, setDirtyForm] = useState(false);
  const [dirtyUrlField, setDirtyUrlField] = useState(false);
  const loading = !profile && !profileError;
  const invalidUrlField = !url && (dirtyForm || dirtyUrlField);

  const open = Boolean(anchorEl);
  const id = open ? "pod-navigator" : undefined;
  const handleClick = clickHandler(setAnchorEl);
  const handleClose = closeHandler(setAnchorEl);
  const onSubmit = submitHandler(
    handleClose,
    setUrl,
    setDirtyForm,
    setDirtyUrlField
  );

  return (
    <div className={classes.indicator}>
      <label htmlFor="pod-indicator-prompt" className={classes.indicatorLabel}>
        <span>Pod: </span>
        {loading ? (
          <Skeleton width={100} style={{ display: "inline-block" }} />
        ) : (
          <button
            data-testid={TESTCAFE_ID_POD_NAVIGATE_TRIGGER}
            id="pod-indicator-prompt"
            type="button"
            aria-describedby={id}
            onClick={handleClick}
            className={clsx(bem("button", "prompt"), classes.indicatorPrompt)}
            title={profile ? profile.name : "Unknown"}
          >
            <span className={classes.indicatorName}>
              {profile ? profile.name : "Unknown"}
            </span>
          </button>
        )}
        <Popover
          id={id}
          classes={{
            paper: classes.popover,
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
          <Form onSubmit={(event) => onSubmit(event, url, router)}>
            <Label id="PodNavigator">Go to Pod</Label>
            {invalidUrlField ? (
              <Message variant="invalid">Please enter valid URL</Message>
            ) : null}
            <Box display="flex" alignItems="center">
              <Box width="100%">
                <SimpleInput
                  id="PodNavigator"
                  data-testid={TESTCAFE_ID_POD_NAVIGATE_INPUT}
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="Enter Pod URI"
                  type="url"
                  pattern="https://.*"
                  title="Must start with https://"
                  required={invalidUrlField}
                />
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  size="large"
                  id={TESTCAFE_ID_POD_NAVIGATE_BUTTON}
                >
                  Go
                </Button>
              </Box>
            </Box>
          </Form>
        </Popover>
      </label>
    </div>
  );
}
