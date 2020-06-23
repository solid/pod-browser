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

import React, { ReactElement } from "react";
import { Box } from "@material-ui/core";
import { createStyles, makeStyles, StyleRules } from "@material-ui/styles";

import auth from "solid-auth-client";

import { PrismTheme, useBem } from "@solid/lit-prism-patterns";
import styles from "./styles";

export const loginWithProvider = (): void => {
  auth.popupLogin({ popupUri: `/login-popup.html` }).catch((e) => {
    throw e;
  });
};

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

export default function Provider(): ReactElement {
  const handleLoginClick = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    // TODO: provider is currently unused, because of the SAC popup flow.
    return loginWithProvider();
  };

  const bem = useBem(useStyles());

  // any is used on the select onchange due to ongoing debates about how to handle the event
  /* eslint @typescript-eslint/no-explicit-any: 0 */

  return (
    <form>
      <Box my={2}>
        <Box mt={2}>
          <button
            type="submit"
            className={bem("button")}
            onClick={handleLoginClick}
          >
            Log In
          </button>
        </Box>
      </Box>
    </form>
  );
}
