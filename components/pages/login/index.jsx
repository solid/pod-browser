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

import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { createStyles, makeStyles } from "@material-ui/styles";
import { Button } from "@inrupt/prism-react-components";
import clsx from "clsx";
import { useBem } from "@solid/lit-prism-patterns";
import { useRedirectIfLoggedIn } from "../../../src/effects/auth";
import LoginForm from "../../login";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const TESTCAFE_ID_TOS_LINK = "tos-link";

// TODO: temporarily adding the links here until we implement the new footer design
const links = [
  {
    href: "https://inrupt.com/terms-of-service",
    text: "Terms of Use",
    rel: "noreferrer",
    target: "_blank",
    "data-testid": TESTCAFE_ID_TOS_LINK,
  },
  {
    href: "https://inrupt.com/privacy-policy/",
    text: "Privacy Policy",
    rel: "noreferrer",
    target: "_blank",
    "data-testid": TESTCAFE_ID_TOS_LINK,
  },
  {
    href: "https://inrupt.atlassian.net/servicedesk/customer/portal/7",
    text: "Help",
    rel: "noreferrer",
    target: "_blank",
    "data-testid": TESTCAFE_ID_TOS_LINK,
  },
];

export default function Login({ history }) {
  const filteredHistory = history.slice(0, history.indexOf("/login"));
  const previousPage = filteredHistory[filteredHistory.length - 1];
  const redirectUrl = previousPage;
  useRedirectIfLoggedIn(redirectUrl);
  const bem = useBem(useStyles());
  const buttonBem = Button.useBem();

  useEffect(() => {
    if (!localStorage) return;
    if (previousPage) {
      localStorage.setItem("previousPage", previousPage);
    }
  }, [previousPage]);

  return (
    <div className={bem("login-page")}>
      <h1 className={clsx(bem("content-h1"), bem("login-page__title"))}>
        PodBrowser
      </h1>
      <p className={bem("login-page__text")}>
        View and manage data in your Pod
      </p>
      <LoginForm />
      <div className={bem("links-container")}>
        <div className={bem("links-container__text")}>
          Need a Pod?
          <a
            href="https://signup.pod.inrupt.com/"
            variant="secondary"
            className={clsx(
              bem("links-container__button"),
              buttonBem("button", "secondary")
            )}
          >
            Sign up
          </a>
        </div>
        <div className={bem("links-container__list")}>
          {links.map(({ href, text, target, rel }) => (
            <a
              key={text}
              className={bem("links-container__link")}
              href={href}
              target={target}
              rel={rel}
            >
              {text}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  history: PropTypes.arrayOf(PropTypes.string),
};

Login.defaultProps = {
  history: [],
};
