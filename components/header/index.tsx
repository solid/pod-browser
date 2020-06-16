import React, { ReactElement, useContext } from "react";
import { Link } from "@material-ui/core";
import clsx from "clsx";
import { createStyles, makeStyles, StyleRules } from "@material-ui/styles";
import LogOutButton from "../logout";
import UserContext from "../../src/contexts/userContext";
import {
  header,
  PrismTheme,
  useBem,
} from "../../lib/prism/packages/prism-patterns";

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
