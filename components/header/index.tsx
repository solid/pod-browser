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

import React, { ReactElement, useContext } from "react";
import { Link } from "@material-ui/core";
import clsx from "clsx";
import { createStyles, makeStyles, StyleRules } from "@material-ui/styles";
import { header, PrismTheme, useBem } from "@solid/lit-prism-patterns";
import LogOutButton from "../logout";
import UserContext from "../../src/contexts/userContext";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(header.styles(theme) as StyleRules)
);

export default function Header(): ReactElement {
  const { session } = useContext(UserContext);
  const bem = useBem(useStyles());

  return (
    <header className={bem("header-banner")}>
      <div className={bem("header-banner__main-nav-container")}>
        <nav className={clsx(bem("main-nav"), bem("header-banner__main-nav"))}>
          <Link href="/">Home</Link>

          <Link>
            <i className="prism-icon-add" />
          </Link>

          {session ? <LogOutButton /> : null}
        </nav>
      </div>
    </header>
  );
}
