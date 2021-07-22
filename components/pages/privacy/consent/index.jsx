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
import { useRouter } from "next/router";
import { Container, Icons, Button } from "@inrupt/prism-react-components";
import { makeStyles } from "@material-ui/styles";
import { createStyles, Typography, Switch } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import { useRedirectIfLoggedOut } from "../../../../src/effects/auth";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ContactShow() {
  useRedirectIfLoggedOut();
  const router = useRouter();
  const requestId = decodeURIComponent(router.query.rid);
  const bem = useBem(useStyles());

  return (
    <>
      <Container className={bem("request-container")}>
        <div className={bem("request-container__content", "main")}>
          <Typography
            component="h2"
            align="center"
            className={bem("header-text")}
          >
            Allow [agent name] access?
          </Typography>
          <p>{requestId}</p>
          <div className={bem("request-container__section")}>
            <div>
              <h3 className={bem("request-container__header-text", "small")}>
                <span>
                  <Icons name="edit" className={bem("icon-small")} />
                  [agent name] wants to create, edit or delete
                </span>
                <Button
                  variant="secondary"
                  className={bem("request-container__button", "small")}
                >
                  Select all
                </Button>
              </h3>
            </div>
            <div className={bem("request-container__section", "box")}>
              Your Pod
              <Switch
                color="default"
                inputProps={{ "aria-label": "checkbox for [some purpose]" }}
              />
            </div>
          </div>
        </div>
        <div className={bem("request-container__content")}>TODO</div>
      </Container>
    </>
  );
}
