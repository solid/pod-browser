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
import { createStyles, makeStyles } from "@material-ui/styles";
import { header, useBem } from "@solid/lit-prism-patterns";
import { useSession } from "@inrupt/solid-ui-react";
import Link from "next/link";
import clsx from "clsx";
import UserMenu from "./userMenu";
import PodIndicator from "./podIndicator";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_HEADER_LOGO = "header-banner-logo";

export default function Header() {
  const { session } = useSession();
  const bem = useBem(useStyles());
  const classes = useStyles();

  return (
    <header className={bem("header-banner")}>
      <div className={classes.logoIndicatorContainer}>
        <Link href="/">
          <a data-testid={TESTCAFE_ID_HEADER_LOGO}>
            <img
              height={40}
              src="/inrupt_logo-2020.svg"
              className={bem("header-banner__logo-image")}
              alt="Inrupt PodBrowser"
            />
          </a>
        </Link>
        {session.info.isLoggedIn ? <PodIndicator /> : null}
      </div>
      {session.info.isLoggedIn ? (
        <>
          <nav className={bem("header-banner__main-nav")}>
            <ul className={bem("main-nav__list")}>
              <li className={bem("main-nav__item")}>
                <Link href="/" replace>
                  <button
                    className={bem("header-banner__aside-menu-trigger")}
                    type="button"
                  >
                    <i
                      className={clsx(
                        bem("icon-files"),
                        bem("header-banner__aside-menu-trigger-icon")
                      )}
                      aria-label="Files"
                    />
                    Files
                  </button>
                </Link>
              </li>
              <li className={bem("main-nav__item")}>
                <Link href="/contacts" replace>
                  <button
                    className={bem("header-banner__aside-menu-trigger")}
                    type="button"
                  >
                    <i
                      className={clsx(
                        bem("icon-users"),
                        bem("header-banner__aside-menu-trigger-icon")
                      )}
                      aria-label="Contacts"
                    />
                    Contacts
                  </button>
                </Link>
              </li>
            </ul>
          </nav>
          <UserMenu />
        </>
      ) : null}
    </header>
  );
}
