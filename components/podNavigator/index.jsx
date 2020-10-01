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
import Popover from "@material-ui/core/Popover";
import { createStyles, makeStyles } from "@material-ui/styles";
import { Form, Input } from "@inrupt/prism-react-components";
import { useRouter } from "next/router";
import { useSession } from "@inrupt/solid-ui-react";
import styles from "./styles";
import { urlRedirect } from "../../src/navigator";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const clickHandler = (setAnchorEl) => (event) =>
  setAnchorEl(event.currentTarget);

export const closeHandler = (setAnchorEl) => () => setAnchorEl(null);

export const submitHandler = (handleClose) => async (
  event,
  url,
  router,
  fetch
) => {
  event.preventDefault();
  if (await urlRedirect(url, router, { fetch })) {
    handleClose();
  }
};

export default function PodNavigator() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [url, setUrl] = useState("");
  const router = useRouter();
  const { fetch } = useSession();

  const open = Boolean(anchorEl);
  const id = open ? "pod-navigator" : undefined;
  const handleClick = clickHandler(setAnchorEl);
  const handleClose = closeHandler(setAnchorEl);
  const onSubmit = submitHandler(handleClose);

  return (
    <>
      <button type="button" aria-describedby={id} onClick={handleClick}>
        NAVIGATOR TRIGGER (PLACEHOLDER)
      </button>
      <Popover
        id={id}
        classes={{
          paper: classes.paper,
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
        <Form onSubmit={(event) => onSubmit(event, url, router, fetch)}>
          <Input
            id="PodNavigator"
            label="Go to Pod"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </Form>
      </Popover>
    </>
  );
}
