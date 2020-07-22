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
import DetailsMenuContext, {
  DETAILS_CONTEXT_ACTIONS,
} from "../../src/contexts/detailsMenuContext";
import styles from "./styles";
import useEscKey from "../../src/effects/useEscKey";
import DetailsLoading from "../detailsLoading";
import ResourceDetails from "../resourceDetails";
import ResourceSharing from "../resourceSharing";
import { useFetchResourceDetails } from "../../src/hooks/litPod";
import { parseUrl } from "../../src/stringHelpers";

const useStyles = makeStyles(styles);

interface IContentsProps {
  action: string;
  iri: string;
}

export function Contents({ action, iri }: IContentsProps): ReactElement | null {
  const { pathname } = parseUrl(iri);
  const { data, error } = useFetchResourceDetails(iri);

  if (!data) return <DetailsLoading name={pathname} />;
  if (error) return null;

  const { permissions } = data;

  switch (action) {
    case DETAILS_CONTEXT_ACTIONS.SHARING:
      return (
        <ResourceSharing iri={iri} name={pathname} permissions={permissions} />
      );

    default:
      return <ResourceDetails resource={data} />;
  }
}

export default function DetailsContextMenu(): ReactElement | null {
  const { menuOpen, setMenuOpen, action, iri } = useContext(DetailsMenuContext);
  const classes = useStyles();
  const closeDrawer = () => setMenuOpen(false);

  useEscKey(closeDrawer);

  if (!iri) return null;

  return (
    // prettier-ignore
    <Drawer
      anchor="right"
      variant="persistent"
      open={menuOpen}
      classes={{ paper: classes.drawerPaper }}
    >
      <IconButton className={classes.drawerCloseButton} onClick={closeDrawer}>
        <ChevronRightIcon />
      </IconButton>
      <div className={classes.drawerContent}>
        {!iri
          ? <DetailsLoading />
          : <Contents action={action as string} iri={iri as string} />}
      </div>
    </Drawer>
  );
}
