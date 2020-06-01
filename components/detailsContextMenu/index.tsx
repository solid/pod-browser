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
