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
import { useBem } from "@solid/lit-prism-patterns";
import {
  MainNav as PrismMainNav,
  MainNavLink,
} from "@inrupt/prism-react-components";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./styles";
import FeatureContext from "../../../src/contexts/featureFlagsContext";
import getMainMenuItems from "../../../constants/mainMenu";

/* eslint react/jsx-props-no-spreading: off */

export const TESTID_MAIN_NAV = "main-nav";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const menuItems = getMainMenuItems();

export default function MainNav() {
  const router = useRouter();
  const bem = useBem(useStyles());
  const { enabled } = useContext(FeatureContext);
  const links = menuItems
    .filter(({ featureFlag }) => !featureFlag || enabled(featureFlag))
    .map(({ path, label, pages, ...rest }) => {
      return {
        active: pages.includes(router.pathname),
        href: path,
        text: label,
        ...rest,
      };
    });
  return (
    <div className={bem("main-nav-container")}>
      <PrismMainNav
        links={links}
        data-testid={TESTID_MAIN_NAV}
        renderLink={(link) => (
          <Link href={link.href}>
            <MainNavLink {...link} />
          </Link>
        )}
      />
    </div>
  );
}
