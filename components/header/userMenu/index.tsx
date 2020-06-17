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

import React, { ReactElement, useContext, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import { PrismTheme, useBem } from "@solid/lit-prism-patterns";
import LogOutButton from "../../logout";
import styles from "./styles";
import UserContext from "../../../src/contexts/userContext";
import useAuthenticatedProfile from "../../../src/hooks/useAuthenticatedProfile/useAuthenticatedProfile";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme))
);

export default function UserMenu(): ReactElement {
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const bem = useBem(useStyles());
  const { session } = useContext(UserContext);
  const profile = useAuthenticatedProfile(session);
  const avatar = profile?.avatar || "./emptyProfile.svg";

  const toggleMenu = () => setUserMenuOpen(!userMenuOpen);

  return (
    <div
      className={bem("header-banner__aside-menu", "popup")}
      onMouseEnter={toggleMenu}
      onMouseLeave={toggleMenu}
    >
      <button
        className={bem("header-banner__aside-menu-trigger")}
        type="button"
        aria-haspopup="true"
        aria-controls="UserMenu"
        aria-expanded={!userMenuOpen}
        onClick={toggleMenu}
      >
        <i
          className={bem("header-banner__aside-menu-trigger-profile")}
          style={{ backgroundImage: `url(${avatar})` }}
          aria-label="User Menu"
        />
      </button>
      <div
        className={bem("header-banner__aside-menu-popup")}
        id="UserMenu"
        aria-hidden={!userMenuOpen}
      >
        <ul className={bem("header-banner__user-menu")}>
          <li className={bem("header-banner__user-menu-item")}>
            <LogOutButton
              className={bem("header-banner__user-menu-item-trigger")}
            >
              <span className="prism-header-banner__user-menu-item-label">
                Log out
              </span>
            </LogOutButton>
          </li>
        </ul>
      </div>
    </div>
  );
}
