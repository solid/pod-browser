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
import { createStyles, makeStyles, StyleRules } from "@material-ui/styles";
import clsx from "clsx";
import Link from "next/link";

import { PrismTheme, useBem } from "@solid/lit-prism-patterns";
import styles from "./styles";

interface Props {
  className?: string;
}

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

export default function MainNav({ className }: Props): ReactElement {
  const bem = useBem(useStyles());
  return (
    <nav className={clsx(bem("main-nav"), className)}>
      <ul className={bem("main-nav__list")}>
        <li className={bem("main-nav__item")}>
          <Link href="/">
            <a className={bem("main-nav__link")}>
              <i className={clsx(bem("icon-home"), bem("main-nav__icon"))} />
              <span className={bem("main-nav__label")}>Home</span>
            </a>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

MainNav.defaultProps = {
  className: "",
};
