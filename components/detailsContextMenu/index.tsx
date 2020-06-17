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

import { ReactElement, useContext } from "react";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { Drawer, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import styles from "./styles";
import useEscKey from "../../src/effects/useEscKey";

const useStyles = makeStyles(styles);

export default function DetailsContextMenu(): ReactElement {
  const { setMenuOpen, contents, menuOpen } = useContext(DetailsMenuContext);
  const classes = useStyles();
  const closeDrawer = () => setMenuOpen(false);
  useEscKey(closeDrawer);

  return (
    <Drawer
      anchor="right"
      variant="persistent"
      open={menuOpen}
      classes={{ paper: classes.drawerPaper }}
    >
      <IconButton className={classes.drawerCloseButton} onClick={closeDrawer}>
        <ChevronRightIcon />
      </IconButton>
      <div className={classes.drawerContent}>{contents}</div>
    </Drawer>
  );
}
