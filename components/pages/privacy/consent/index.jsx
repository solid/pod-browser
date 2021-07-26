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
import {
  createStyles,
  Typography,
  Switch,
  FormGroup,
  FormControl,
  FormControlLabel,
  Link,
} from "@material-ui/core";
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
        <form className={bem("request-container__content", "main")}>
          <Typography component="h2" align="center" variant="h2">
            Allow [agent name] access?
          </Typography>
          <p>{requestId}</p>
          <FormControl
            component="fieldset"
            className={bem("request-container__section")}
          >
            <legend className={bem("request-container__header-text", "small")}>
              <span>
                <Icons name="edit" className={bem("icon-small")} />
                [agent name] wants to create, edit or delete
              </span>
              <Button
                variant="secondary"
                className={bem("request-container__button", "small")}
              >
                <Typography component="span" variant="body2">
                  Select all
                </Typography>
              </Button>
            </legend>
            <FormGroup
              aria-label="position"
              row
              className={bem("request-container__section", "box")}
            >
              <FormControlLabel
                value="start"
                control={<Switch color="primary" />}
                label={
                  // eslint-disable-next-line react/jsx-wrap-multilines
                  <Typography variant="body2">
                    <Icons name="app" className={bem("icon-small")} />
                    Your Pod
                  </Typography>
                }
                labelPlacement="start"
                className={bem("box__content")}
              />
            </FormGroup>
          </FormControl>
          <FormControl
            component="fieldset"
            className={bem("request-container__section")}
          >
            <legend className={bem("request-container__header-text", "small")}>
              <span>
                <Icons name="view" className={bem("icon-small")} />
                [agent name] wants to view
              </span>
              <Button
                variant="secondary"
                className={bem("request-container__button", "small")}
              >
                <Typography component="span" variant="body2">
                  Select all
                </Typography>
              </Button>
            </legend>
            <FormGroup
              aria-label="position"
              row
              className={bem("request-container__section", "box")}
            >
              <FormControlLabel
                value="start"
                control={<Switch color="primary" />}
                label={
                  // eslint-disable-next-line react/jsx-wrap-multilines
                  <Typography variant="body2">
                    <Icons name="folder" className={bem("icon-small")} />
                    folder_name
                  </Typography>
                }
                labelPlacement="start"
                className={bem("box__content")}
              />
              <FormControlLabel
                value="start"
                control={<Switch color="primary" />}
                label={<Typography variant="body2">Item 2</Typography>}
                labelPlacement="start"
                className={bem("box__content")}
              />
            </FormGroup>
          </FormControl>
          <FormControl
            component="fieldset"
            className={bem("request-container__section")}
          >
            <legend className={bem("request-container__header-text", "small")}>
              <span>
                <Icons name="add" className={bem("icon-small")} />
                [agent name] wants to add to
              </span>
              <Button
                variant="secondary"
                className={bem("request-container__button", "small")}
              >
                <Typography component="span" variant="body2">
                  Select all
                </Typography>
              </Button>
            </legend>
            <FormGroup
              aria-label="position"
              row
              className={bem("request-container__section", "box")}
            >
              <FormControlLabel
                value="start"
                control={<Switch color="primary" />}
                label={<Typography variant="body2">folder_name</Typography>}
                labelPlacement="start"
                className={bem("box__content")}
              />
            </FormGroup>
          </FormControl>
          <FormControl
            component="fieldset"
            className={bem("request-container__section")}
          >
            <legend className={bem("request-container__header-text", "small")}>
              <span>
                <Icons name="user" className={bem("icon-small")} />
                [agent name] wants add or remove people from
              </span>
              <Button
                variant="secondary"
                className={bem("request-container__button", "small")}
              >
                <Typography component="span" variant="body2">
                  Select all
                </Typography>
              </Button>
            </legend>
            <FormGroup
              aria-label="position"
              row
              className={bem("request-container__section", "box")}
            >
              <FormControlLabel
                value="start"
                control={<Switch color="primary" />}
                label={<Typography variant="body2">file_name</Typography>}
                labelPlacement="start"
                className={bem("box__content")}
              />
              <FormControlLabel
                value="start"
                control={<Switch color="primary" />}
                label={<Typography variant="body2">file_name</Typography>}
                labelPlacement="start"
                className={bem("box__content")}
              />
            </FormGroup>
          </FormControl>
          <FormControl
            component="fieldset"
            className={bem("request-container__section")}
          >
            <legend className={bem("request-container__header-text", "small")}>
              <span>
                <Icons name="users" className={bem("icon-small")} />
                [agent name] wants see who else can view
              </span>
              <Button
                variant="secondary"
                className={bem("request-container__button", "small")}
              >
                <Typography component="span" variant="body2">
                  Select all
                </Typography>
              </Button>
            </legend>
            <FormGroup
              aria-label="position"
              row
              className={bem("request-container__section", "box")}
            >
              <FormControlLabel
                value="start"
                control={<Switch color="primary" />}
                label={<Typography variant="body2">Your Pod</Typography>}
                labelPlacement="start"
                className={bem("box__content")}
              />
            </FormGroup>
          </FormControl>
          <div className={bem("form__controls")}>
            <Button
              variant="secondary"
              className={bem("request-container__button")}
            >
              Deny all access
            </Button>
            <Button className={bem("request-container__button")}>
              Confirm Access
            </Button>
          </div>
        </form>
        <div className={bem("request-container__content")}>
          <Typography
            component="h3"
            align="center"
            variant="h3"
            className={bem("heading__uppercase")}
          >
            About this application
          </Typography>
          <Typography component="p" align="center" variant="body2">
            <Icons className={bem("avatar")} name="project-diagram" />
            agent_name
          </Typography>
          <Typography className={bem("footer__links")}>
            <Link href="/" variant="body2" className={bem("link")}>
              <Icons name="globe" className={bem("icon-small", "primary")} />
              Website
            </Link>
            <Link href="/" variant="body2">
              <Icons name="webid" className={bem("icon-small", "primary")} />
              Privacy
            </Link>
            <Link href="/" variant="body2">
              <Icons name="doc" className={bem("icon-small", "primary")} />
              Terms of Service
            </Link>
          </Typography>
        </div>
      </Container>
    </>
  );
}
