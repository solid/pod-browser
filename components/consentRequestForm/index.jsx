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

import React, { useContext } from "react";
import { Icons, Button } from "@inrupt/prism-react-components";
import { useRouter } from "next/router";
import { makeStyles } from "@material-ui/styles";
import {
  createStyles,
  Typography,
  Switch,
  FormGroup,
  FormControl,
  FormControlLabel,
} from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import ConsentRequestContext from "../../src/contexts/consentRequestContext";
import RequestSection from "./requestSection";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ConsentRequestFrom() {
  const bem = useBem(useStyles());
  const router = useRouter();
  const requestId = decodeURIComponent(router.query.id);
  const { consentRequest } = useContext(ConsentRequestContext);
  // FIXME: When we hook up the API, request the profile and get the agent name
  const agentName = consentRequest?.credentialSubject?.id;

  return (
    <>
      <form className={bem("request-container__content", "main")}>
        <Typography component="h2" align="center" variant="h2">
          {`Allow ${agentName} access?`}
        </Typography>
        <p>{requestId}</p>
        {/* FIXME: place this in a loop when we know the data structure */}
        <RequestSection
          agentName={agentName}
          sectionDetails={consentRequest?.credentialSubject?.hasConsent}
        />
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
          <Button type="submit" className={bem("request-container__button")}>
            Confirm Access
          </Button>
        </div>
      </form>
    </>
  );
}
