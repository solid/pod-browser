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
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import Link from "next/link";
import clsx from "clsx";
import LogOutButton from "../../logout";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_USER_MENU_BUTTON = "user-menu-button";

export default function UserMenu() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const bem = useBem(useStyles());

  const toggleMenu = () => setUserMenuOpen(!userMenuOpen);
  const handleMenuOpen = () => setUserMenuOpen(true);
  const handleMenuClose = () => setUserMenuOpen(false);

  return (
    <>
      <div>
        <Link href="/bookmarks" replace>
          <button
            className={bem("header-banner__aside-menu-trigger")}
            type="button"
          >
            <i
              className={clsx(
                bem("icon-star"),
                bem("header-banner__aside-menu-trigger-icon")
              )}
              aria-label="Bookmarks"
            />
            Bookmarks
          </button>
        </Link>
      </div>

      <div
        className={bem("header-banner__aside-menu", "popup")}
        onMouseEnter={handleMenuOpen}
        onMouseLeave={handleMenuClose}
      >
        <button
          data-testid={TESTCAFE_ID_USER_MENU_BUTTON}
          className={bem("header-banner__aside-menu-trigger")}
          type="button"
          aria-haspopup="true"
          aria-controls="UserMenu"
          aria-expanded={!userMenuOpen}
          onClick={toggleMenu}
        >
          <i
            className={clsx(
              bem("icon-user"),
              bem("header-banner__aside-menu-trigger-icon")
            )}
            aria-label="User Menu"
          />
        </button>

        <div
          className={bem("header-banner__aside-menu-popup")}
          id="UserMenu"
          aria-hidden={!userMenuOpen}
        >
          <ul className={bem("header-banner__user-menu")}>
            <li
              className={bem("header-banner__user-menu-item")}
              style={{ zIndex: 100 }}
            >
              <LogOutButton
                className={bem("header-banner__user-menu-item-trigger")}
              >
                <>
                  <i
                    className={clsx(
                      bem("icon-log-out"),
                      bem("header-banner__user-menu-item-icon")
                    )}
                  />
                  <span className={bem("header-banner__user-menu-item-label")}>
                    Log out
                  </span>
                </>
              </LogOutButton>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
