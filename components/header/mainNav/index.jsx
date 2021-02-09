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

import React, { useContext } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import clsx from "clsx";
import Link from "next/link";
import { useBem } from "@solid/lit-prism-patterns";
import styles from "./styles";
import FeatureContext from "../../../src/contexts/featureFlagsContext";
import getMainMenuItems from "../../../constants/mainMenu";

export const TESTID_MAIN_NAV_ITEM = "main-nav-item";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const menuItems = getMainMenuItems();

export default function MainNav() {
  const bem = useBem(useStyles());
  const { enabled } = useContext(FeatureContext);
  const menuItemsToShow = menuItems.filter(
    ({ featureFlag }) => !featureFlag || enabled(featureFlag)
  );
  return (
    <div className={bem("main-nav-container")}>
      <nav className={bem("header-banner__main-nav")}>
        <ul className={bem("main-nav__list")}>
          {menuItemsToShow.map(({ path, icon, label }) => (
            <li
              className={bem("main-nav__item")}
              key={path}
              data-testid={TESTID_MAIN_NAV_ITEM}
            >
              <Link href={path} replace>
                <a
                  className={bem("header-banner__aside-menu-trigger")}
                  type="button"
                >
                  <i
                    className={clsx(
                      bem(icon),
                      bem("header-banner__aside-menu-trigger-icon")
                    )}
                  />
                  {label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
