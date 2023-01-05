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
import { makeStyles } from "@mui/styles";
import { createStyles } from "@mui/core";
import styles from "./styles";
import DownloadLink from "../downloadLink";

export const TESTCAFE_ID_DOWNLOAD_RESOURCE_MESSAGE =
  "download-resource-message";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function DownloadResourceMessage({ iri }) {
  const classes = useStyles();

  return (
    <div
      className={classes.downloadLinkContainer}
      data-testid={TESTCAFE_ID_DOWNLOAD_RESOURCE_MESSAGE}
    >
      <h1>Downloading resource...</h1>
      <p>
        If you download does not start, click here:{" "}
        <DownloadLink className={classes.downloadLink} iri={iri}>
          {iri}
        </DownloadLink>
      </p>
    </div>
  );
}

DownloadResourceMessage.propTypes = {
  iri: T.string.isRequired,
};
