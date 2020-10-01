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

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useRouter } from "next/router";
import { foaf, vcard } from "rdf-namespaces";
import { getStringNoLocale } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useBem } from "@solid/lit-prism-patterns";
import Popover from "@material-ui/core/Popover";
import { Form, Input } from "@inrupt/prism-react-components";
import usePodOwnerProfile from "../../../src/hooks/usePodOwnerProfile";
import styles from "./styles";
import { urlRedirect } from "../../../src/navigator";

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

export default function PodIndicator() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [url, setUrl] = useState("");
  const router = useRouter();
  const { fetch } = useSession();
  const bem = useBem(useStyles());
  const decodedResourceUri = decodeURIComponent(router.query.iri);
  const [podUri, setPodUri] = useState();

  useEffect(() => {
    if (decodedResourceUri === "undefined") {
      return;
    }
    const originUri = decodedResourceUri && new URL(decodedResourceUri).origin;
    const decodedPodUri = decodeURIComponent(originUri);
    setPodUri(decodedPodUri);
  }, [decodedResourceUri]);

  const { profile } = usePodOwnerProfile(podUri);
  if (!profile) {
    return null;
  }

  const open = Boolean(anchorEl);
  const id = open ? "pod-navigator" : undefined;
  const handleClick = clickHandler(setAnchorEl);
  const handleClose = closeHandler(setAnchorEl);
  const onSubmit = submitHandler(handleClose);
  const podOwnerName =
    getStringNoLocale(profile.dataset, vcard.fn) ||
    getStringNoLocale(profile.dataset, foaf.name);

  return (
    <div className={classes.indicator}>
      <label htmlFor="pod-indicator-prompt" className={classes.indicatorLabel}>
        <span>Pod: </span>
        <button
          data-testid="pod-indicator-prompt"
          id="pod-indicator-prompt"
          type="button"
          aria-describedby={id}
          onClick={handleClick}
          className={clsx(bem("button", "prompt"), classes.indicatorPrompt)}
        >
          {podOwnerName}
        </button>
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
          <Form onSubmit={(event) => onSubmit(event, url, router, fetch)}>
            <Input
              id="PodNavigator"
              label="Go to Pod"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </Form>
        </Popover>
      </label>
    </div>
  );
}
