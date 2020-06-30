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
import Link from "next/link";

import { StyleRules, createStyles, makeStyles } from "@material-ui/styles";
import clsx from "clsx";
import { PrismTheme, useBem } from "@solid/lit-prism-patterns";
import ProviderLogin from "./provider";
import styles from "./styles";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

export default function Login(): ReactElement {
  const bem = useBem(useStyles());
  return (
    <div className={bem("login-form")}>
      <Link href="/register">
        <a className={bem("button", "primary", "filled")}>
          <span>Register for a Solid Identity</span>
        </a>
      </Link>

      <p className={clsx(bem("content-p"), bem("login-form__what-is-solid"))}>
        <a
          href="https://solid.inrupt.com/get-a-solid-pod"
          rel="nofollow noreferrer"
          target="_blank"
        >
          What is a Solid Identity?
        </a>
      </p>

      <h2 className={clsx(bem("content-h5"), bem("login-form__sub-title"))}>
        <span>Log In</span>
      </h2>

      <ProviderLogin />
    </div>
  );
}
