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
import { UserMenu as PrismUserMenu } from "@inrupt/prism-react-components";
import { useBem } from "@solid/lit-prism-patterns";
import styles from "./styles";
import useAuthenticatedProfile from "../../../src/hooks/useAuthenticatedProfile";
import Spinner from "../../spinner";
import useUserMenu from "../../../src/hooks/useUserMenu";
import UserMenuAction from "./userMenuAction";

/* eslint react/jsx-props-no-spreading: off */

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_USER_MENU_BUTTON = "user-menu-button";
const TESTCAFE_ID_USER_MENU = "user-menu";

export default function UserMenu() {
  const bem = useBem(useStyles());
  const { data: authenticatedProfile } = useAuthenticatedProfile();
  const menu = useUserMenu();

  if (!authenticatedProfile) return <Spinner />;

  return (
    <div className={bem("userMenu")}>
      <PrismUserMenu
        className={bem("userMenu__trigger")}
        label={authenticatedProfile.name || "Account"}
        imgSrc={authenticatedProfile.avatar}
        menu={menu}
        menuId="UserMenu"
        data-testid={TESTCAFE_ID_USER_MENU_BUTTON}
        renderAction={(action) => <UserMenuAction {...action} />}
      />
    </div>
  );
}
