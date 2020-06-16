import React, { ReactElement } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import clsx from "clsx";
import { useRedirectIfLoggedIn } from "../../../src/effects/auth";
import LoginForm from "../../login";
import styles from "./styles";
import { PrismTheme, useBem } from "../../../lib/prism/packages/prism-patterns";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme))
);

export default function Login(): ReactElement {
  useRedirectIfLoggedIn();
  const bem = useBem(useStyles());

  return (
    <div className={bem("login-page")}>
      <div className={bem("login-page__container")}>
        <h1 className={clsx(bem("content-h1"), bem("login-page__title"))}>
          Hi! Welcome to Solid.
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
