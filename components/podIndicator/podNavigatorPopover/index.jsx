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
import T from "prop-types";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useRouter } from "next/router";
import { getResourceInfo, getSourceIri } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { Popover } from "@material-ui/core";
import {
  Button,
  Form,
  InputGroup,
  SimpleInput,
} from "@inrupt/prism-react-components";
import styles from "./styles";
import { resourceHref } from "../../../src/navigator";
import { normalizeContainerUrl } from "../../../src/stringHelpers";

export const TESTCAFE_ID_POD_NAVIGATE_INPUT = "pod-navigate-input";
const TESTCAFE_ID_POD_NAVIGATE_BUTTON = "pod-navigate-button";

export const clickHandler = (setAnchorEl) => (event) =>
  setAnchorEl(event.currentTarget);

export const closeHandler = (setAnchorEl, setDisplayNavigator) => () => {
  setAnchorEl(null);
  setDisplayNavigator(false);
};

export const submitHandler =
  (handleClose, setUrl, setDirtyForm, setDirtyUrlField, url, router, fetch) =>
  async (event) => {
    event.preventDefault();
    setDirtyForm(true);

    if (url === "") {
      return;
    }
    let resourceInfo;
    try {
      resourceInfo = await getResourceInfo(url, { fetch });
    } catch (error) {
      resourceInfo = null;
    }
    const sourceUrl =
      (resourceInfo && getSourceIri(resourceInfo)) ||
      normalizeContainerUrl(url);

    await router.push("/resource/[iri]", resourceHref(sourceUrl));
    handleClose();
    setDirtyForm(false);
    setDirtyUrlField(false);
    setUrl("");
  };

export default function PodNavigatorPopover({
  anchor,
  setDisplayNavigator,
  popoverWidth,
}) {
  const useStyles = makeStyles((theme) =>
    createStyles(styles(theme, popoverWidth))
  );
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [url, setUrl] = useState("");
  const router = useRouter();
  const [dirtyForm, setDirtyForm] = useState(false);
  const [dirtyUrlField, setDirtyUrlField] = useState(false);
  const invalidUrlField = !url && (dirtyForm || dirtyUrlField);
  const { fetch } = useSession();

  const open = Boolean(anchorEl);
  const id = open ? "pod-navigator" : undefined;
  const handleClose = closeHandler(setAnchorEl, setDisplayNavigator);
  const onSubmit = submitHandler(
    handleClose,
    setUrl,
    setDirtyForm,
    setDirtyUrlField,
    url,
    router,
    fetch
  );

  useEffect(() => {
    setAnchorEl(anchor);
  }, [anchor]);

  return (
    <Popover
      id={id}
      classes={{
        paper: classes.popoverNavigator,
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
      <Form onSubmit={onSubmit}>
        <InputGroup
          id="PodNavigator"
          label="Go to Pod"
          invalidMessage={invalidUrlField && "Please enter valid URL"}
          variant="with-button"
        >
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
          <Button
            variant="with-input"
            type="submit"
            data-testid={TESTCAFE_ID_POD_NAVIGATE_BUTTON}
            id={TESTCAFE_ID_POD_NAVIGATE_BUTTON}
          >
            Go
          </Button>
        </InputGroup>
      </Form>
    </Popover>
  );
}

PodNavigatorPopover.propTypes = {
  anchor: T.shape({ current: T.instanceOf(T.element) }).isRequired,
  setDisplayNavigator: T.func.isRequired,
  popoverWidth: T.number.isRequired,
};
