import React, { ReactElement } from "react";
import Link from "next/link";

import { createStyles, makeStyles } from "@material-ui/styles";
import clsx from "clsx";
import ProviderLogin from "./provider";
import styles from "./styles";
import { PrismTheme, useBem } from "../../lib/prism/packages/prism-patterns";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme))
);

export default function Login(): ReactElement {
  const bem = useBem(useStyles());
  return (
    <div className={bem("login-form")}>
      <Link href="/register">
        <a className={bem("button", "primary", "filled")}>
          <span>Register for a Solid Identity</span>
        </a>
      </Link>

      <p className={clsx(bem("content-p"), bem("login-form__what-is-solid"))}>
        <a href="https://solid.inrupt.com/get-a-solid-pod" rel="nofollow">
          What is a Solid Identity?
        </a>
      </p>

      <h2 className={clsx(bem("content-h5"), bem("login-form__sub-title"))}>
        <span>Log In</span>
      </h2>

      <ProviderLogin />
    </div>
  );
}
